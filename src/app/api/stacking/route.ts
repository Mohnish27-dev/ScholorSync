'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

type ScholarshipType = 'central' | 'state' | 'private' | 'corporate' | 'college';

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type: ScholarshipType;
  amount: { min: number; max: number };
  eligibility: {
    incomeLimit?: number;
    minPercentage?: number;
    categories?: string[];
    states?: string[];
  };
  stackable?: boolean;
  stackingRules?: string[];
}

interface UserProfile {
  annualIncome: number;
  category: string;
  state: string;
  academicPercentage: number;
  course: string;
  institution: string;
}

interface StackingResult {
  primaryCentral?: Scholarship;
  stateScholarship?: Scholarship;
  privateOptions: Scholarship[];
  totalPotential: { min: number; max: number };
  stackingRules: string[];
  recommendations: string[];
  warnings: string[];
}

// Stacking rules based on Indian scholarship regulations
const STACKING_RULES: Record<ScholarshipType, {
  canStackWith: ScholarshipType[];
  cannotStackWith: ScholarshipType[];
  rules: string[];
}> = {
  central: {
    canStackWith: ['private', 'corporate', 'college'],
    cannotStackWith: ['central', 'state'],
    rules: [
      'Central government scholarships generally cannot be combined with other central scholarships',
      'Most central scholarships prohibit receiving state government scholarships simultaneously',
      'Private and institutional scholarships may be allowed alongside central scholarships',
    ],
  },
  state: {
    canStackWith: ['private', 'corporate', 'college'],
    cannotStackWith: ['central', 'state'],
    rules: [
      'State scholarships typically cannot be combined with central government scholarships',
      'Multiple state scholarships from the same state are usually not allowed',
      'Private scholarships are generally allowed alongside state scholarships',
    ],
  },
  private: {
    canStackWith: ['central', 'state', 'private', 'corporate', 'college'],
    cannotStackWith: [],
    rules: [
      'Private scholarships generally have more flexible stacking rules',
      'Check individual scholarship terms for specific restrictions',
      'Some may require disclosure of other scholarships received',
    ],
  },
  corporate: {
    canStackWith: ['central', 'state', 'private', 'college'],
    cannotStackWith: [],
    rules: [
      'Corporate scholarships usually allow stacking with government scholarships',
      'May have their own restrictions on combining with competing company scholarships',
    ],
  },
  college: {
    canStackWith: ['central', 'state', 'private', 'corporate'],
    cannotStackWith: [],
    rules: [
      'Institutional scholarships can often be combined with external scholarships',
      'Some colleges may reduce institutional aid if external scholarships are received',
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const db = getFirestore(app);

    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const profile: UserProfile = {
      annualIncome: userData.profile?.annualIncome || 0,
      category: userData.profile?.category || 'General',
      state: userData.profile?.state || '',
      academicPercentage: userData.profile?.academicPercentage || 0,
      course: userData.profile?.course || '',
      institution: userData.profile?.institution || '',
    };

    // Get all scholarships user is eligible for
    const scholarshipsRef = collection(db, 'scholarships');
    const scholarshipsSnap = await getDocs(scholarshipsRef);
    
    const eligibleScholarships: Scholarship[] = [];
    
    scholarshipsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Check basic eligibility
      const incomeLimit = data.eligibility?.incomeLimit || Infinity;
      const minPercentage = data.eligibility?.minPercentage || 0;
      const categories = data.eligibility?.categories || [];
      const states = data.eligibility?.states || [];
      
      let isEligible = true;
      
      if (profile.annualIncome > incomeLimit) isEligible = false;
      if (profile.academicPercentage < minPercentage) isEligible = false;
      if (categories.length > 0 && !categories.includes(profile.category)) isEligible = false;
      if (states.length > 0 && !states.includes(profile.state) && !states.includes('All India')) isEligible = false;
      
      if (isEligible) {
        eligibleScholarships.push({
          id: docSnap.id,
          name: data.name,
          provider: data.provider,
          type: data.type || 'private',
          amount: data.amount || { min: 0, max: 0 },
          eligibility: data.eligibility || {},
          stackable: data.stackable !== false,
          stackingRules: data.stackingRules || [],
        });
      }
    });

    // Optimize stacking
    const stackingResult = await optimizeStacking(eligibleScholarships, profile);

    return NextResponse.json({
      success: true,
      stacking: stackingResult,
      totalEligible: eligibleScholarships.length,
    });

  } catch (error) {
    console.error('Error in stacking optimizer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to optimize stacking' },
      { status: 500 }
    );
  }
}

async function optimizeStacking(
  scholarships: Scholarship[],
  profile: UserProfile
): Promise<StackingResult> {
  const result: StackingResult = {
    privateOptions: [],
    totalPotential: { min: 0, max: 0 },
    stackingRules: [],
    recommendations: [],
    warnings: [],
  };

  // Group scholarships by type
  const centralScholarships = scholarships.filter(s => s.type === 'central');
  const stateScholarships = scholarships.filter(s => s.type === 'state');
  const privateScholarships = scholarships.filter(s => s.type === 'private');
  const corporateScholarships = scholarships.filter(s => s.type === 'corporate');
  const collegeScholarships = scholarships.filter(s => s.type === 'college');

  // Select best central scholarship (highest amount)
  if (centralScholarships.length > 0) {
    const sortedCentral = [...centralScholarships].sort(
      (a, b) => (b.amount.max + b.amount.min) / 2 - (a.amount.max + a.amount.min) / 2
    );
    result.primaryCentral = sortedCentral[0];
    result.totalPotential.min += result.primaryCentral.amount.min;
    result.totalPotential.max += result.primaryCentral.amount.max;
    result.stackingRules.push(...STACKING_RULES.central.rules);
  }

  // Select best state scholarship if no central, or if from different source
  if (stateScholarships.length > 0) {
    const userStateScholarships = stateScholarships.filter(
      s => s.eligibility.states?.includes(profile.state) || s.eligibility.states?.includes('All India')
    );
    
    if (userStateScholarships.length > 0) {
      const sortedState = [...userStateScholarships].sort(
        (a, b) => (b.amount.max + b.amount.min) / 2 - (a.amount.max + a.amount.min) / 2
      );
      
      // Only add state scholarship if no central scholarship selected
      if (!result.primaryCentral) {
        result.stateScholarship = sortedState[0];
        result.totalPotential.min += result.stateScholarship.amount.min;
        result.totalPotential.max += result.stateScholarship.amount.max;
        result.stackingRules.push(...STACKING_RULES.state.rules);
      } else {
        result.warnings.push(
          `State scholarship "${sortedState[0].name}" cannot be combined with central scholarship "${result.primaryCentral.name}"`
        );
      }
    }
  }

  // Add private scholarships (usually stackable)
  const stackablePrivate = privateScholarships.filter(s => s.stackable !== false);
  // Sort by amount and take top 3
  const topPrivate = [...stackablePrivate].sort(
    (a, b) => (b.amount.max + b.amount.min) / 2 - (a.amount.max + a.amount.min) / 2
  ).slice(0, 3);
  
  result.privateOptions = topPrivate;
  topPrivate.forEach(s => {
    result.totalPotential.min += s.amount.min;
    result.totalPotential.max += s.amount.max;
  });

  // Add corporate scholarships
  const stackableCorporate = corporateScholarships.filter(s => s.stackable !== false);
  const topCorporate = [...stackableCorporate].sort(
    (a, b) => (b.amount.max + b.amount.min) / 2 - (a.amount.max + a.amount.min) / 2
  ).slice(0, 2);
  
  result.privateOptions.push(...topCorporate);
  topCorporate.forEach(s => {
    result.totalPotential.min += s.amount.min;
    result.totalPotential.max += s.amount.max;
  });

  // Add college scholarships
  const stackableCollege = collegeScholarships.filter(s => s.stackable !== false);
  if (stackableCollege.length > 0) {
    const bestCollege = [...stackableCollege].sort(
      (a, b) => (b.amount.max + b.amount.min) / 2 - (a.amount.max + a.amount.min) / 2
    )[0];
    result.privateOptions.push(bestCollege);
    result.totalPotential.min += bestCollege.amount.min;
    result.totalPotential.max += bestCollege.amount.max;
  }

  // Generate AI recommendations
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
    
    const prompt = `As a scholarship expert, provide 3 brief recommendations for optimizing scholarship stacking for an Indian student with:
    - Annual Income: ₹${profile.annualIncome.toLocaleString()}
    - Category: ${profile.category}
    - State: ${profile.state}
    - Academic Score: ${profile.academicPercentage}%
    
    Selected scholarships:
    - Central: ${result.primaryCentral?.name || 'None'}
    - State: ${result.stateScholarship?.name || 'None'}
    - Private/Corporate: ${result.privateOptions.map(s => s.name).join(', ') || 'None'}
    
    Total potential: ₹${result.totalPotential.min.toLocaleString()} - ₹${result.totalPotential.max.toLocaleString()}
    
    Provide 3 actionable tips in a JSON array format like: ["tip1", "tip2", "tip3"]`;

    const aiResult = await model.generateContent(prompt);
    const responseText = aiResult.response.text();
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      result.recommendations = JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    result.recommendations = [
      'Apply for central government scholarships first as they typically offer higher amounts',
      'Check if your institution offers merit-cum-means scholarships that can be combined',
      'Keep documentation ready for income proof to speed up application processing',
    ];
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { scholarshipIds, userId } = body;

    if (!scholarshipIds || !Array.isArray(scholarshipIds) || !userId) {
      return NextResponse.json(
        { success: false, error: 'Scholarship IDs and user ID required' },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const db = getFirestore(app);

    // Fetch selected scholarships
    const scholarships: Scholarship[] = [];
    for (const id of scholarshipIds) {
      const docSnap = await getDoc(doc(db, 'scholarships', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        scholarships.push({
          id: docSnap.id,
          name: data.name,
          provider: data.provider,
          type: data.type || 'private',
          amount: data.amount || { min: 0, max: 0 },
          eligibility: data.eligibility || {},
          stackable: data.stackable !== false,
          stackingRules: data.stackingRules || [],
        });
      }
    }

    // Analyze compatibility
    const compatibility = analyzeCompatibility(scholarships);

    return NextResponse.json({
      success: true,
      compatibility,
    });

  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze compatibility' },
      { status: 500 }
    );
  }
}

function analyzeCompatibility(scholarships: Scholarship[]): {
  compatible: boolean;
  conflicts: Array<{ scholarship1: string; scholarship2: string; reason: string }>;
  suggestions: string[];
} {
  const conflicts: Array<{ scholarship1: string; scholarship2: string; reason: string }> = [];
  const suggestions: string[] = [];

  for (let i = 0; i < scholarships.length; i++) {
    for (let j = i + 1; j < scholarships.length; j++) {
      const s1 = scholarships[i];
      const s2 = scholarships[j];

      const rules1 = STACKING_RULES[s1.type];
      const rules2 = STACKING_RULES[s2.type];

      // Check if they can stack
      if (rules1.cannotStackWith.includes(s2.type) || rules2.cannotStackWith.includes(s1.type)) {
        conflicts.push({
          scholarship1: s1.name,
          scholarship2: s2.name,
          reason: `${s1.type} and ${s2.type} scholarships typically cannot be combined`,
        });
      }
    }
  }

  // Generate suggestions based on conflicts
  if (conflicts.length > 0) {
    suggestions.push('Consider applying for only one government scholarship (central or state)');
    suggestions.push('Focus on private and corporate scholarships to supplement government aid');
  } else {
    suggestions.push('Your selected scholarships appear to be compatible');
    suggestions.push('Ensure you disclose all scholarships when applying as required');
  }

  return {
    compatible: conflicts.length === 0,
    conflicts,
    suggestions,
  };
}
