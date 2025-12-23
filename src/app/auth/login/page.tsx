import { LoginForm } from '@/components/auth/LoginForm';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <GraduationCap className="h-10 w-10 text-blue-600" />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">ScholarSync</span>
        </Link>
        
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Sign in to access your scholarships
              </p>
            </div>
            
            <LoginForm />
            
            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
