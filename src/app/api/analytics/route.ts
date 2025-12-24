import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  limit
} from 'firebase/firestore';

interface ScholarshipData {
  id: string;
  name: string;
  amount: { min: number; max: number };
  deadline: string;
  type: string;
  competitionLevel: string;
  eligibility: {
    categories: string[];
    incomeLimit: number;
    states: string[];
  };
  applicationStats?: {
    totalApplications: number;
    approvalRate: number;
  };
}

interface UserProfile {
  category?: string;
  income?: number;
  percentage?: number;
  state?: string;
  gender?: string;
  level?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'overview';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Fetch user profile
    const profileQuery = query(
      collection(db, 'profiles'),
      where('userId', '==', userId),
      limit(1)
    );
    const profileSnap = await getDocs(profileQuery);
    const profile = profileSnap.docs[0]?.data() as UserProfile | undefined;

    // Fetch all scholarships
    const scholarshipsSnap = await getDocs(collection(db, 'scholarships'));
    const scholarships = scholarshipsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ScholarshipData[];

    // Fetch user's saved scholarships
    const savedQuery = query(
      collection(db, 'savedScholarships'),
      where('userId', '==', userId)
    );
    const savedSnap = await getDocs(savedQuery);
    const savedScholarshipIds = savedSnap.docs.map(doc => doc.data().scholarshipId);

    // Fetch user's applications
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', userId)
    );
    const applicationsSnap = await getDocs(applicationsQuery);
    const applications = applicationsSnap.docs.map(doc => doc.data());

    switch (type) {
      case 'overview': {
        // Calculate matched scholarships
        const matchedScholarships = scholarships.filter(s => 
          isEligible(s, profile)
        );

        // Calculate total potential value
        const totalPotentialValue = matchedScholarships.reduce(
          (sum, s) => sum + s.amount.max,
          0
        );

        // Upcoming deadlines (next 30 days)
        const today = new Date();
        const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const upcomingDeadlines = matchedScholarships
          .filter(s => {
            const deadline = new Date(s.deadline);
            return deadline >= today && deadline <= thirtyDaysLater;
          })
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .slice(0, 5)
          .map(s => ({
            id: s.id,
            name: s.name,
            deadline: s.deadline,
            amount: s.amount,
            daysLeft: Math.ceil((new Date(s.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          }));

        // Profile completeness
        const profileFields = ['category', 'income', 'percentage', 'state', 'gender', 'level'];
        const completedFields = profileFields.filter(f => profile?.[f as keyof UserProfile]);
        const profileCompleteness = Math.round((completedFields.length / profileFields.length) * 100);

        // Category breakdown
        const categoryBreakdown = {
          government: matchedScholarships.filter(s => s.type === 'government').length,
          private: matchedScholarships.filter(s => s.type === 'private').length,
          corporate: matchedScholarships.filter(s => s.type === 'corporate').length,
          college: matchedScholarships.filter(s => s.type === 'college').length,
        };

        // Competition level breakdown
        const competitionBreakdown = {
          low: matchedScholarships.filter(s => s.competitionLevel === 'low').length,
          medium: matchedScholarships.filter(s => s.competitionLevel === 'medium').length,
          high: matchedScholarships.filter(s => s.competitionLevel === 'high').length,
        };

        return NextResponse.json({
          success: true,
          analytics: {
            totalScholarships: scholarships.length,
            matchedScholarships: matchedScholarships.length,
            savedScholarships: savedScholarshipIds.length,
            appliedScholarships: applications.length,
            successfulApplications: applications.filter(a => a.status === 'approved').length,
            totalPotentialValue,
            profileCompleteness,
            upcomingDeadlines,
            categoryBreakdown,
            competitionBreakdown,
            applicationStats: {
              pending: applications.filter(a => a.status === 'pending').length,
              approved: applications.filter(a => a.status === 'approved').length,
              rejected: applications.filter(a => a.status === 'rejected').length,
            },
          },
        });
      }

      case 'recommendations': {
        // Get personalized recommendations
        const recommendations = scholarships
          .filter(s => isEligible(s, profile))
          .map(s => ({
            ...s,
            matchScore: calculateMatchScore(s, profile),
            successProbability: calculateSuccessProbability(s, profile),
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 10);

        return NextResponse.json({
          success: true,
          recommendations,
        });
      }

      case 'stacking': {
        // Scholarship stacking optimizer
        const eligible = scholarships.filter(s => isEligible(s, profile));
        
        // Group by stackability
        const centralGovt = eligible.filter(s => s.type === 'government');
        const stateGovt = eligible.filter(s => 
          s.eligibility.states.length === 1 && s.eligibility.states[0] !== 'all'
        );
        const privateScholarships = eligible.filter(s => 
          s.type === 'private' || s.type === 'corporate'
        );

        // Calculate optimal stacking
        const stackingPlan = {
          primaryCentral: centralGovt.sort((a, b) => b.amount.max - a.amount.max)[0],
          stateScholarship: stateGovt.sort((a, b) => b.amount.max - a.amount.max)[0],
          privateOptions: privateScholarships.sort((a, b) => b.amount.max - a.amount.max).slice(0, 3),
          totalPotential: 0,
          stackingRules: [
            'Central government scholarships cannot be stacked with each other',
            'State scholarships can usually be combined with central scholarships',
            'Private/corporate scholarships can typically be stacked with government scholarships',
            'Always check individual scholarship terms for stacking restrictions',
          ],
        };

        stackingPlan.totalPotential = 
          (stackingPlan.primaryCentral?.amount.max || 0) +
          (stackingPlan.stateScholarship?.amount.max || 0) +
          stackingPlan.privateOptions.reduce((sum, s) => sum + s.amount.max, 0);

        return NextResponse.json({
          success: true,
          stacking: stackingPlan,
        });
      }

      case 'market': {
        // Market intelligence
        const marketData = {
          totalAvailable: scholarships.length,
          totalValue: scholarships.reduce((sum, s) => sum + s.amount.max, 0),
          averageAmount: Math.round(
            scholarships.reduce((sum, s) => sum + (s.amount.min + s.amount.max) / 2, 0) / scholarships.length
          ),
          byCategory: {
            SC: scholarships.filter(s => s.eligibility.categories.includes('SC')).length,
            ST: scholarships.filter(s => s.eligibility.categories.includes('ST')).length,
            OBC: scholarships.filter(s => s.eligibility.categories.includes('OBC')).length,
            Minority: scholarships.filter(s => s.eligibility.categories.includes('Minority')).length,
            General: scholarships.filter(s => s.eligibility.categories.includes('all')).length,
          },
          competitionInsights: {
            lowCompetition: {
              count: scholarships.filter(s => s.competitionLevel === 'low').length,
              avgAmount: calculateAvgAmount(scholarships.filter(s => s.competitionLevel === 'low')),
            },
            mediumCompetition: {
              count: scholarships.filter(s => s.competitionLevel === 'medium').length,
              avgAmount: calculateAvgAmount(scholarships.filter(s => s.competitionLevel === 'medium')),
            },
            highCompetition: {
              count: scholarships.filter(s => s.competitionLevel === 'high').length,
              avgAmount: calculateAvgAmount(scholarships.filter(s => s.competitionLevel === 'high')),
            },
          },
          deadlineDistribution: getDeadlineDistribution(scholarships),
        };

        return NextResponse.json({
          success: true,
          market: marketData,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function isEligible(scholarship: ScholarshipData, profile?: UserProfile): boolean {
  if (!profile) return true; // Return all if no profile

  // Check category
  if (scholarship.eligibility.categories.length > 0 && 
      !scholarship.eligibility.categories.includes('all')) {
    if (profile.category && !scholarship.eligibility.categories.includes(profile.category.toUpperCase())) {
      return false;
    }
  }

  // Check income
  if (scholarship.eligibility.incomeLimit > 0 && profile.income) {
    if (profile.income > scholarship.eligibility.incomeLimit) {
      return false;
    }
  }

  // Check state
  if (scholarship.eligibility.states.length > 0 && 
      !scholarship.eligibility.states.includes('all')) {
    if (profile.state && !scholarship.eligibility.states.includes(profile.state)) {
      return false;
    }
  }

  return true;
}

function calculateMatchScore(scholarship: ScholarshipData, profile?: UserProfile): number {
  if (!profile) return 50;
  
  let score = 50;

  // Category match
  if (scholarship.eligibility.categories.includes('all') ||
      (profile.category && scholarship.eligibility.categories.includes(profile.category.toUpperCase()))) {
    score += 15;
  }

  // Income within limit
  if (scholarship.eligibility.incomeLimit === 0 ||
      (profile.income && profile.income <= scholarship.eligibility.incomeLimit)) {
    score += 15;
  }

  // State match
  if (scholarship.eligibility.states.includes('all') ||
      (profile.state && scholarship.eligibility.states.includes(profile.state))) {
    score += 10;
  }

  // Competition level bonus (easier = higher score)
  if (scholarship.competitionLevel === 'low') score += 10;
  else if (scholarship.competitionLevel === 'medium') score += 5;

  return Math.min(score, 100);
}

function calculateSuccessProbability(scholarship: ScholarshipData, profile?: UserProfile): number {
  const baseRate = scholarship.applicationStats?.approvalRate || 40;
  let probability = baseRate;

  // Adjust based on competition level
  if (scholarship.competitionLevel === 'low') probability += 15;
  else if (scholarship.competitionLevel === 'high') probability -= 15;

  // Adjust based on profile completeness
  if (profile) {
    const fields = Object.values(profile).filter(Boolean).length;
    probability += fields * 3;
  }

  return Math.min(Math.max(probability, 10), 90);
}

function calculateAvgAmount(scholarships: ScholarshipData[]): number {
  if (scholarships.length === 0) return 0;
  return Math.round(
    scholarships.reduce((sum, s) => sum + (s.amount.min + s.amount.max) / 2, 0) / scholarships.length
  );
}

function getDeadlineDistribution(scholarships: ScholarshipData[]): Record<string, number> {
  const months: Record<string, number> = {};
  
  scholarships.forEach(s => {
    const date = new Date(s.deadline);
    const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    months[monthKey] = (months[monthKey] || 0) + 1;
  });

  return months;
}
