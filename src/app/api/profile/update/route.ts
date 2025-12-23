import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/firebase/firestore';
import type { UserProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, profile } = await request.json() as {
      userId: string;
      profile: Partial<UserProfile>;
    };

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    await updateUserProfile(userId, profile);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
