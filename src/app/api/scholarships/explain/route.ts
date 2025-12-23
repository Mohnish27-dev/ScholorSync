import { NextRequest, NextResponse } from 'next/server';
import { getScholarship, getUser } from '@/lib/firebase/firestore';
import { explainEligibility } from '@/lib/langchain/chains';

export async function POST(request: NextRequest) {
  try {
    const { userId, scholarshipId } = await request.json() as {
      userId: string;
      scholarshipId: string;
    };

    if (!userId || !scholarshipId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Scholarship ID are required' },
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

    // Get scholarship details
    const scholarship = await getScholarship(scholarshipId);
    if (!scholarship) {
      return NextResponse.json(
        { success: false, error: 'Scholarship not found' },
        { status: 404 }
      );
    }

    // Get AI explanation
    const explanation = await explainEligibility(user.profile, scholarship);

    return NextResponse.json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    console.error('Error explaining eligibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to explain eligibility' },
      { status: 500 }
    );
  }
}
