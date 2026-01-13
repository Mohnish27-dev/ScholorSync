'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    // Error messages mapping
    const errorMessages: Record<string, string> = {
        missing_params: 'Invalid verification link. Please check your email for the correct link.',
        user_not_found: 'User account not found. Please register again.',
        invalid_token: 'Invalid or already used verification token.',
        token_expired: 'Verification link has expired. Please request a new one.',
        server_error: 'Server error occurred. Please try again later.',
    };

    // Success state
    if (success === 'true') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <CardTitle className="mt-4 text-2xl text-emerald-700 dark:text-emerald-400">
                            Email Verified!
                        </CardTitle>
                        <CardDescription className="text-base">
                            Your email has been successfully verified. You can now access all features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/fellowships" className="block">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Continue to Fellowships
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="block">
                            <Button variant="outline" className="w-full">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (error) {
        const errorMessage = errorMessages[error] || 'An unknown error occurred.';
        const isExpired = error === 'token_expired';

        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="mt-4 text-2xl text-red-700 dark:text-red-400">
                            Verification Failed
                        </CardTitle>
                        <CardDescription className="text-base">
                            {errorMessage}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isExpired && (
                            <Link href="/fellowships" className="block">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    Request New Verification
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        <Link href="/" className="block">
                            <Button variant="outline" className="w-full">
                                Go to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Pending/Loading state (no params yet)
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                        <AlertCircle className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">
                        Check Your Email
                    </CardTitle>
                    <CardDescription className="text-base">
                        We've sent a verification link to your email address. Click the link to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-4 text-center text-sm text-blue-700 dark:text-blue-300">
                        <p>The verification link will expire in 24 hours.</p>
                    </div>
                    <Link href="/" className="block">
                        <Button variant="outline" className="w-full">
                            Go to Home
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
