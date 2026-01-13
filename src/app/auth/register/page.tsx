'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthUI } from '@/components/ui/auth-fuse';
import { useState, useEffect, Suspense } from 'react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, user, loading: authLoading, error: authError, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Sync auth context error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSignIn = async (email: string, password: string) => {
    // Redirect to login page
    router.push(`/auth/login?email=${encodeURIComponent(email)}`);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    clearError();

    try {
      await signUp(email, password, { name });
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    clearError();

    try {
      await signInWithGoogle();
      router.push('/dashboard');
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
      defaultMode="signup"
    />
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
