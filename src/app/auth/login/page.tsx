'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthUI } from '@/components/ui/auth-fuse';
import { useState, useEffect, Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, user, loading: authLoading, error: authError, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirect = searchParams.get('redirect') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirect);
    }
  }, [user, authLoading, router, redirect]);

  // Sync auth context error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    clearError();

    try {
      await signIn(email, password);
      router.push(redirect);
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    // Redirect to register page with pre-filled data
    router.push(`/auth/register?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    clearError();

    try {
      await signInWithGoogle();
      router.push(redirect);
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <AuthUI
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
      loading={loading}
      error={error}
      defaultMode="signin"
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
