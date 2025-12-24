'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  Calendar,
  IndianRupee,
  Award,
  Clock,
  BarChart3,
  PieChart,
  Layers,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  totalScholarships: number;
  matchedScholarships: number;
  savedScholarships: number;
  appliedScholarships: number;
  successfulApplications: number;
  totalPotentialValue: number;
  profileCompleteness: number;
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    deadline: string;
    amount: { min: number; max: number };
    daysLeft: number;
  }>;
  categoryBreakdown: {
    government: number;
    private: number;
    corporate: number;
    college: number;
  };
  competitionBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  applicationStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface StackingData {
  primaryCentral?: {
    id: string;
    name: string;
    amount: { min: number; max: number };
    provider: string;
  };
  stateScholarship?: {
    id: string;
    name: string;
    amount: { min: number; max: number };
    provider: string;
  };
  privateOptions: Array<{
    id: string;
    name: string;
    amount: { min: number; max: number };
    provider: string;
  }>;
  totalPotential: number;
  stackingRules: string[];
}

interface DashboardAnalyticsProps {
  userId: string;
}

export function DashboardAnalytics({ userId }: DashboardAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stacking, setStacking] = useState<StackingData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const [overviewRes, stackingRes] = await Promise.all([
        fetch(`/api/analytics?userId=${userId}&type=overview`),
        fetch(`/api/analytics?userId=${userId}&type=stacking`),
      ]);

      const overviewData = await overviewRes.json();
      const stackingData = await stackingRes.json();

      if (overviewData.success) {
        setAnalytics(overviewData.analytics);
      }
      if (stackingData.success) {
        setStacking(stackingData.stacking);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <p className="text-slate-600">Unable to load analytics. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stacking" className="gap-2">
            <Layers className="h-4 w-4" />
            Stacking
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Target className="h-4 w-4" />
            Applications
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Matched</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {analytics.matchedScholarships}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        of {analytics.totalScholarships} total
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Potential Value</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(analytics.totalPotentialValue)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Combined maximum
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Profile Score</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {analytics.profileCompleteness}%
                      </p>
                      <Progress value={analytics.profileCompleteness} className="mt-2 h-1" />
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Applications</p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                        {analytics.appliedScholarships}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        {analytics.successfulApplications} approved
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Category & Competition Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Scholarship Types
                </CardTitle>
                <CardDescription>Breakdown by provider type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.categoryBreakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          key === 'government' ? 'bg-blue-500' :
                          key === 'private' ? 'bg-green-500' :
                          key === 'corporate' ? 'bg-purple-500' : 'bg-orange-500'
                        }`} />
                        <span className="capitalize font-medium">{key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{value}</span>
                        <span className="text-sm text-slate-500">
                          ({Math.round((value / analytics.matchedScholarships) * 100) || 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Competition Levels
                </CardTitle>
                <CardDescription>How competitive are your matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        Low
                      </Badge>
                      <span className="text-sm text-slate-600">Easier to get</span>
                    </div>
                    <span className="font-bold">{analytics.competitionBreakdown.low}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        Medium
                      </Badge>
                      <span className="text-sm text-slate-600">Moderate competition</span>
                    </div>
                    <span className="font-bold">{analytics.competitionBreakdown.medium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                        High
                      </Badge>
                      <span className="text-sm text-slate-600">Very competitive</span>
                    </div>
                    <span className="font-bold">{analytics.competitionBreakdown.high}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Don&apos;t miss these opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.upcomingDeadlines.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No upcoming deadlines in the next 30 days</p>
              ) : (
                <div className="space-y-3">
                  {analytics.upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{deadline.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={deadline.daysLeft <= 7 ? 'destructive' : 'secondary'}>
                            <Clock className="h-3 w-3 mr-1" />
                            {deadline.daysLeft} days left
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {formatCurrency(deadline.amount.min)} - {formatCurrency(deadline.amount.max)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/dashboard/scholarships?id=${deadline.id}`}>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stacking Tab */}
        <TabsContent value="stacking" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                Scholarship Stacking Optimizer
              </CardTitle>
              <CardDescription>
                Maximize your funding by combining compatible scholarships
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stacking ? (
                <div className="space-y-6">
                  {/* Total Potential */}
                  <div className="text-center py-4 bg-white dark:bg-slate-900 rounded-lg">
                    <p className="text-sm text-slate-600">Maximum Stackable Amount</p>
                    <p className="text-4xl font-bold text-indigo-600">
                      {formatCurrency(stacking.totalPotential)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">per year</p>
                  </div>

                  {/* Stacking Layers */}
                  <div className="space-y-4">
                    {/* Central Government */}
                    {stacking.primaryCentral && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2 bg-blue-100 text-blue-700">Central Government</Badge>
                            <h4 className="font-semibold">{stacking.primaryCentral.name}</h4>
                            <p className="text-sm text-slate-600">{stacking.primaryCentral.provider}</p>
                          </div>
                          <span className="font-bold text-blue-700">
                            {formatCurrency(stacking.primaryCentral.amount.max)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* State Government */}
                    {stacking.stateScholarship && (
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2 bg-green-100 text-green-700">State Government</Badge>
                            <h4 className="font-semibold">{stacking.stateScholarship.name}</h4>
                            <p className="text-sm text-slate-600">{stacking.stateScholarship.provider}</p>
                          </div>
                          <span className="font-bold text-green-700">
                            {formatCurrency(stacking.stateScholarship.amount.max)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Private/Corporate */}
                    {stacking.privateOptions.length > 0 && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-l-4 border-purple-500">
                        <Badge className="mb-2 bg-purple-100 text-purple-700">Private/Corporate</Badge>
                        <div className="space-y-2">
                          {stacking.privateOptions.map((scholarship) => (
                            <div key={scholarship.id} className="flex items-center justify-between">
                              <span className="font-medium">{scholarship.name}</span>
                              <span className="text-purple-700">
                                +{formatCurrency(scholarship.amount.max)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stacking Rules */}
                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      ⚠️ Important Rules
                    </h4>
                    <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                      {stacking.stackingRules.map((rule, index) => (
                        <li key={index}>• {rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">
                  Complete your profile to see stacking recommendations
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pending</p>
                    <p className="text-2xl font-bold">{analytics.applicationStats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Approved</p>
                    <p className="text-2xl font-bold">{analytics.applicationStats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Rejected</p>
                    <p className="text-2xl font-bold">{analytics.applicationStats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Complete Your Profile</h4>
                    <p className="text-sm text-slate-600">
                      A complete profile increases your match accuracy by up to 40%
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Upload Required Documents</h4>
                    <p className="text-sm text-slate-600">
                      Keep documents ready to apply quickly when deadlines approach
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Apply Early</h4>
                    <p className="text-sm text-slate-600">
                      Early applications have a 25% higher success rate
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DashboardAnalytics;
