import { NextRequest, NextResponse } from 'next/server';
import { getAllScholarships, getUser } from '@/lib/firebase/firestore';
import { analyzeWhyNotMe } from '@/lib/langchain/chains';
import type { WhyNotMeResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, minMatchPercentage = 40, maxMatchPercentage = 79 } = await request.json() as {
      userId: string;
      minMatchPercentage?: number;
      maxMatchPercentage?: number;
    };

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const user = await getUser(userId);
    if (!user || !user.profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get all scholarships
    const scholarships = await getAllScholarships();

    // Find scholarships where user almost qualifies
    const nearMissScholarships = scholarships.filter((scholarship) => {
      let criteriaMatched = 0;
      let totalCriteria = 0;

      // Check each criterion
      totalCriteria++;
      if (
        scholarship.eligibility.categories.includes('all') ||
        scholarship.eligibility.categories.includes(user.profile.category)
      ) {
        criteriaMatched++;
      }

      totalCriteria++;
      if (user.profile.income <= scholarship.eligibility.incomeLimit) {
        criteriaMatched++;
      }

      totalCriteria++;
      if (user.profile.percentage >= scholarship.eligibility.minPercentage) {
        criteriaMatched++;
      }

      totalCriteria++;
      if (
        scholarship.eligibility.states.includes('all') ||
        scholarship.eligibility.states.includes(user.profile.state)
      ) {
        criteriaMatched++;
      }

      const matchPercentage = (criteriaMatched / totalCriteria) * 100;
      return matchPercentage >= minMatchPercentage && matchPercentage <= maxMatchPercentage;
    });

    // Analyze each near-miss scholarship
    const results: WhyNotMeResult[] = await Promise.all(
      nearMissScholarships.slice(0, 5).map(async (scholarship) => {
        const analysis = await analyzeWhyNotMe(user.profile, scholarship);
        return {
          scholarship,
          ...analysis,
        };
      })
    );

    // Sort by gap percentage (closest to qualifying first)
    results.sort((a, b) => b.gapPercentage - a.gapPercentage);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error analyzing why not me:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze scholarships' },
      { status: 500 }
    );
  }
}
