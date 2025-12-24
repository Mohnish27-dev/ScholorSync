'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

interface ScholarshipData {
  name: string;
  provider: string;
  type: string;
  amount: { min: number; max: number };
  deadline?: string;
  eligibility?: {
    incomeLimit?: number;
    minPercentage?: number;
    categories?: string[];
    states?: string[];
    courses?: string[];
    levels?: string[];
  };
  competitionLevel?: string;
}

interface MarketIntelligence {
  overview: {
    totalScholarships: number;
    totalValue: number;
    averageAmount: number;
    medianAmount: number;
    governmentCount: number;
    privateCount: number;
  };
  categoryDistribution: Record<string, { count: number; totalValue: number; avgAmount: number }>;
  stateDistribution: Record<string, { count: number; totalValue: number }>;
  incomeDistribution: {
    below2L: number;
    between2L5L: number;
    between5L8L: number;
    above8L: number;
  };
  levelDistribution: Record<string, number>;
  competitionAnalysis: {
    low: number;
    medium: number;
    high: number;
  };
  deadlineAnalysis: {
    thisMonth: number;
    nextMonth: number;
    next3Months: number;
    later: number;
  };
  topProviders: Array<{ name: string; count: number; totalValue: number }>;
  trends: string[];
  insights: string[];
  recommendations: string[];
}

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const state = searchParams.get('state');
    const level = searchParams.get('level');

    const app = getFirebaseApp();
    const db = getFirestore(app);

    // Fetch all scholarships
    const scholarshipsRef = collection(db, 'scholarships');
    const scholarshipsSnap = await getDocs(scholarshipsRef);
    
    const scholarships: ScholarshipData[] = [];
    
    scholarshipsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Apply filters if provided
      if (category && data.eligibility?.categories) {
        if (!data.eligibility.categories.includes(category) && 
            !data.eligibility.categories.includes('All')) return;
      }
      if (state && data.eligibility?.states) {
        if (!data.eligibility.states.includes(state) && 
            !data.eligibility.states.includes('All India')) return;
      }
      if (level && data.eligibility?.levels) {
        if (!data.eligibility.levels.includes(level)) return;
      }

      scholarships.push({
        name: data.name,
        provider: data.provider,
        type: data.type || 'private',
        amount: data.amount || { min: 0, max: 0 },
        deadline: data.deadline,
        eligibility: data.eligibility,
        competitionLevel: data.competitionLevel,
      });
    });

    // Generate market intelligence
    const intelligence = await generateMarketIntelligence(scholarships);

    return NextResponse.json({
      success: true,
      intelligence,
      totalAnalyzed: scholarships.length,
    });

  } catch (error) {
    console.error('Error generating market intelligence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate market intelligence' },
      { status: 500 }
    );
  }
}

async function generateMarketIntelligence(scholarships: ScholarshipData[]): Promise<MarketIntelligence> {
  // Calculate basic statistics
  const totalValue = scholarships.reduce((sum, s) => sum + (s.amount.max + s.amount.min) / 2, 0);
  const amounts = scholarships.map(s => (s.amount.max + s.amount.min) / 2).sort((a, b) => a - b);
  const medianAmount = amounts.length > 0 ? amounts[Math.floor(amounts.length / 2)] : 0;
  
  // Category distribution
  const categoryDistribution: Record<string, { count: number; totalValue: number; avgAmount: number }> = {};
  scholarships.forEach((s) => {
    const categories = s.eligibility?.categories || ['All'];
    categories.forEach((cat) => {
      if (!categoryDistribution[cat]) {
        categoryDistribution[cat] = { count: 0, totalValue: 0, avgAmount: 0 };
      }
      categoryDistribution[cat].count++;
      categoryDistribution[cat].totalValue += (s.amount.max + s.amount.min) / 2;
    });
  });
  // Calculate averages
  Object.keys(categoryDistribution).forEach((cat) => {
    categoryDistribution[cat].avgAmount = 
      categoryDistribution[cat].totalValue / categoryDistribution[cat].count;
  });

  // State distribution
  const stateDistribution: Record<string, { count: number; totalValue: number }> = {};
  scholarships.forEach((s) => {
    const states = s.eligibility?.states || ['All India'];
    states.forEach((state) => {
      if (!stateDistribution[state]) {
        stateDistribution[state] = { count: 0, totalValue: 0 };
      }
      stateDistribution[state].count++;
      stateDistribution[state].totalValue += (s.amount.max + s.amount.min) / 2;
    });
  });

  // Income distribution
  const incomeDistribution = { below2L: 0, between2L5L: 0, between5L8L: 0, above8L: 0 };
  scholarships.forEach((s) => {
    const limit = s.eligibility?.incomeLimit || Infinity;
    if (limit <= 200000) incomeDistribution.below2L++;
    else if (limit <= 500000) incomeDistribution.between2L5L++;
    else if (limit <= 800000) incomeDistribution.between5L8L++;
    else incomeDistribution.above8L++;
  });

  // Level distribution
  const levelDistribution: Record<string, number> = {};
  scholarships.forEach((s) => {
    const levels = s.eligibility?.levels || ['All Levels'];
    levels.forEach((level) => {
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    });
  });

  // Competition analysis
  const competitionAnalysis = { low: 0, medium: 0, high: 0 };
  scholarships.forEach((s) => {
    const level = s.competitionLevel?.toLowerCase() || 'medium';
    if (level === 'low') competitionAnalysis.low++;
    else if (level === 'high') competitionAnalysis.high++;
    else competitionAnalysis.medium++;
  });

  // Deadline analysis
  const now = new Date();
  const deadlineAnalysis = { thisMonth: 0, nextMonth: 0, next3Months: 0, later: 0 };
  scholarships.forEach((s) => {
    if (!s.deadline) return;
    try {
      const deadline = new Date(s.deadline);
      const monthsDiff = (deadline.getFullYear() - now.getFullYear()) * 12 + 
                         (deadline.getMonth() - now.getMonth());
      
      if (monthsDiff <= 0 && deadline >= now) deadlineAnalysis.thisMonth++;
      else if (monthsDiff === 1) deadlineAnalysis.nextMonth++;
      else if (monthsDiff <= 3) deadlineAnalysis.next3Months++;
      else if (monthsDiff > 3) deadlineAnalysis.later++;
    } catch {
      // Invalid date, skip
    }
  });

  // Top providers
  const providerStats: Record<string, { count: number; totalValue: number }> = {};
  scholarships.forEach((s) => {
    const provider = s.provider || 'Unknown';
    if (!providerStats[provider]) {
      providerStats[provider] = { count: 0, totalValue: 0 };
    }
    providerStats[provider].count++;
    providerStats[provider].totalValue += (s.amount.max + s.amount.min) / 2;
  });
  const topProviders = Object.entries(providerStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  // Count government vs private
  const governmentCount = scholarships.filter(
    (s) => ['central', 'state'].includes(s.type)
  ).length;
  const privateCount = scholarships.filter(
    (s) => ['private', 'corporate', 'college'].includes(s.type)
  ).length;

  // Generate AI insights
  let trends: string[] = [];
  let insights: string[] = [];
  let recommendations: string[] = [];

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
    
    const prompt = `Analyze this Indian scholarship market data and provide insights:

    Total Scholarships: ${scholarships.length}
    Total Value: ₹${totalValue.toLocaleString()}
    Government: ${governmentCount}, Private: ${privateCount}
    
    Category Distribution (top 5):
    ${Object.entries(categoryDistribution)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([cat, stats]) => `${cat}: ${stats.count} scholarships, avg ₹${Math.round(stats.avgAmount).toLocaleString()}`)
      .join('\n')}
    
    State Distribution (top 5):
    ${Object.entries(stateDistribution)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([state, stats]) => `${state}: ${stats.count} scholarships`)
      .join('\n')}
    
    Deadline Analysis:
    This month: ${deadlineAnalysis.thisMonth}
    Next month: ${deadlineAnalysis.nextMonth}
    Next 3 months: ${deadlineAnalysis.next3Months}
    
    Provide response as JSON with these arrays:
    {
      "trends": ["trend1", "trend2", "trend3"],
      "insights": ["insight1", "insight2", "insight3"],
      "recommendations": ["rec1", "rec2", "rec3"]
    }
    
    Focus on actionable insights for Indian students seeking scholarships.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      trends = parsed.trends || [];
      insights = parsed.insights || [];
      recommendations = parsed.recommendations || [];
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
    // Fallback insights
    trends = [
      'Government scholarships constitute the majority of high-value awards',
      'More scholarships available for SC/ST/OBC categories',
      'Engineering and medical students have the most options',
    ];
    insights = [
      'Students from lower income families have more scholarship opportunities',
      'State-specific scholarships often have less competition than national ones',
      'Many students miss deadlines due to lack of awareness',
    ];
    recommendations = [
      'Apply for both government and private scholarships to maximize chances',
      'Complete applications early to avoid last-minute technical issues',
      'Maintain required documents like income certificate and caste certificate ready',
    ];
  }

  return {
    overview: {
      totalScholarships: scholarships.length,
      totalValue,
      averageAmount: scholarships.length > 0 ? totalValue / scholarships.length : 0,
      medianAmount,
      governmentCount,
      privateCount,
    },
    categoryDistribution,
    stateDistribution,
    incomeDistribution,
    levelDistribution,
    competitionAnalysis,
    deadlineAnalysis,
    topProviders,
    trends,
    insights,
    recommendations,
  };
}
