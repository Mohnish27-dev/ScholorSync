import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Missing userId parameter', isVerified: false },
                { status: 400 }
            );
        }

        if (!isFirebaseConfigured || !db) {
            return NextResponse.json(
                { success: false, message: 'Firebase is not configured', isVerified: false },
                { status: 500 }
            );
        }

        // Get user document
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json(
                { success: false, message: 'User not found', isVerified: false },
                { status: 404 }
            );
        }

        const userData = userSnap.data();
        const isVerified = userData.isVerified === true;
        const verifiedAt = userData.verifiedAt;
        const role = userData.role;
        const pendingRole = userData.pendingVerificationRole;

        // Convert verifiedAt to ISO string if it exists
        let verifiedAtString = null;
        if (verifiedAt) {
            verifiedAtString = verifiedAt instanceof Timestamp
                ? verifiedAt.toDate().toISOString()
                : new Date(verifiedAt).toISOString();
        }

        return NextResponse.json({
            success: true,
            isVerified,
            verifiedAt: verifiedAtString,
            role,
            pendingRole: pendingRole || null,
            message: isVerified
                ? 'Email has been verified'
                : 'Email verification pending',
        });
    } catch (error) {
        console.error('Error checking verification status:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                isVerified: false,
            },
            { status: 500 }
        );
    }
}
