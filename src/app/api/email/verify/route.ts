import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');

        if (!token || !userId) {
            return NextResponse.redirect(
                new URL('/auth/verify-email?error=missing_params', request.url)
            );
        }

        if (!isFirebaseConfigured || !db) {
            return NextResponse.redirect(
                new URL('/auth/verify-email?error=server_error', request.url)
            );
        }

        // Get user document
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.redirect(
                new URL('/auth/verify-email?error=user_not_found', request.url)
            );
        }

        const userData = userSnap.data();
        const storedToken = userData.verificationToken;
        const tokenExpiry = userData.verificationTokenExpiry;
        const pendingRole = userData.pendingVerificationRole;

        // Validate token
        if (!storedToken || storedToken !== token) {
            return NextResponse.redirect(
                new URL('/auth/verify-email?error=invalid_token', request.url)
            );
        }

        // Check expiry
        if (tokenExpiry) {
            const expiryDate = tokenExpiry instanceof Timestamp
                ? tokenExpiry.toDate()
                : new Date(tokenExpiry);

            if (new Date() > expiryDate) {
                return NextResponse.redirect(
                    new URL('/auth/verify-email?error=token_expired', request.url)
                );
            }
        }

        // Update user as verified and clear token
        await updateDoc(userRef, {
            isVerified: true,
            verifiedAt: Timestamp.now(),
            role: pendingRole || userData.role,
            verificationToken: null,
            verificationTokenExpiry: null,
            pendingVerificationRole: null,
        });

        // Redirect to success page
        return NextResponse.redirect(
            new URL('/auth/verify-email?success=true', request.url)
        );
    } catch (error) {
        console.error('Error in verify API:', error);
        return NextResponse.redirect(
            new URL('/auth/verify-email?error=server_error', request.url)
        );
    }
}
