'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Layers, CalendarDays, TrendingUp } from 'lucide-react';
import { StackingOptimizer } from '@/components/scholarships/StackingOptimizer';
import { CalendarSync } from '@/components/calendar/CalendarSync';
import { MarketIntelligence } from '@/components/analytics/MarketIntelligence';

export default function InsightsPage() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, isConfigured]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Smart Insights
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Optimize your scholarship applications with AI-powered insights
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="stacking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stacking" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Stacking</span>
            <span className="sm:hidden">Stack</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
            <span className="sm:hidden">Cal</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Market Intel</span>
            <span className="sm:hidden">Intel</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stacking">
          <StackingOptimizer userId={user.uid} />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarSync userId={user.uid} />
        </TabsContent>

        <TabsContent value="intelligence">
          <MarketIntelligence />
        </TabsContent>
      </Tabs>
    </div>
  );
}
