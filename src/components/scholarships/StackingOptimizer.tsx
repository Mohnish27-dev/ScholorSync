'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Layers,
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Info,
  Building2,
  GraduationCap,
  Briefcase,
  School,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface ScholarshipItem {
  id: string;
  name: string;
  provider: string;
  type: 'central' | 'state' | 'private' | 'corporate' | 'college';
  amount: { min: number; max: number };
}

interface StackingData {
  primaryCentral?: ScholarshipItem;
  stateScholarship?: ScholarshipItem;
  privateOptions: ScholarshipItem[];
  totalPotential: { min: number; max: number };
  stackingRules: string[];
  recommendations: string[];
  warnings: string[];
}

interface StackingOptimizerProps {
  userId: string;
}

const typeIcons = {
  central: Building2,
  state: GraduationCap,
  private: Briefcase,
  corporate: Briefcase,
  college: School,
};

const typeColors = {
  central: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  state: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  private: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  corporate: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  college: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
};

export function StackingOptimizer({ userId }: StackingOptimizerProps) {
  const [loading, setLoading] = useState(true);
  const [stacking, setStacking] = useState<StackingData | null>(null);
  const [totalEligible, setTotalEligible] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchStacking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/stacking?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setStacking(data.stacking);
        setTotalEligible(data.totalEligible);
      } else {
        setError(data.error || 'Failed to fetch stacking data');
      }
    } catch (err) {
      console.error('Error fetching stacking:', err);
      setError('Failed to load stacking optimizer');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStacking();
  }, [fetchStacking]);

  const formatAmount = (min: number, max: number) => {
    if (min === max) {
      return `₹${min.toLocaleString()}`;
    }
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={fetchStacking} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stacking) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
            No Scholarships Found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Complete your profile to find eligible scholarships
          </p>
          <Link href="/dashboard/profile">
            <Button className="mt-4">Complete Profile</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const allScholarships = [
    ...(stacking.primaryCentral ? [stacking.primaryCentral] : []),
    ...(stacking.stateScholarship ? [stacking.stateScholarship] : []),
    ...stacking.privateOptions,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Scholarship Stacking Optimizer
              </CardTitle>
              <CardDescription>
                Maximize your scholarship benefits by combining compatible awards
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStacking} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/30 dark:to-emerald-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                <IndianRupee className="h-4 w-4" />
                Maximum Potential
              </div>
              <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-100">
                {formatAmount(stacking.totalPotential.min, stacking.totalPotential.max)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Combined annual value
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                <CheckCircle className="h-4 w-4" />
                Stackable Awards
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
                {allScholarships.length}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                of {totalEligible} eligible
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-4 dark:from-purple-950/30 dark:to-violet-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                <Layers className="h-4 w-4" />
                Stack Efficiency
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-100">
                {totalEligible > 0 ? Math.round((allScholarships.length / totalEligible) * 100) : 0}%
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Compatibility rate
              </p>
            </div>
          </div>

          {/* Warnings */}
          {stacking.warnings.length > 0 && (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Compatibility Alerts</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <ul className="mt-2 space-y-1">
                  {stacking.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Optimal Stack */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Your Optimal Scholarship Stack
            </h3>

            <div className="space-y-3">
              {/* Primary Central Scholarship */}
              {stacking.primaryCentral && (
                <ScholarshipCard
                  scholarship={stacking.primaryCentral}
                  label="Primary Government Scholarship"
                  isPrimary
                />
              )}

              {/* State Scholarship */}
              {stacking.stateScholarship && (
                <ScholarshipCard
                  scholarship={stacking.stateScholarship}
                  label="State Scholarship"
                />
              )}

              {/* Private/Corporate/College Options */}
              {stacking.privateOptions.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  label={`${scholarship.type.charAt(0).toUpperCase() + scholarship.type.slice(1)} Scholarship`}
                />
              ))}
            </div>
          </div>

          {/* Stacking Rules */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Stacking Rules & Guidelines
            </h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {stacking.stackingRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Recommendations */}
          {stacking.recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                AI Recommendations
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {stacking.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
                  >
                    <p className="text-sm text-amber-800 dark:text-amber-200">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Tracker */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Stacking Progress
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Government Scholarship</span>
                  <span className="font-medium">
                    {stacking.primaryCentral || stacking.stateScholarship ? 'Selected' : 'Not Selected'}
                  </span>
                </div>
                <Progress 
                  value={stacking.primaryCentral || stacking.stateScholarship ? 100 : 0} 
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Private Scholarships</span>
                  <span className="font-medium">
                    {stacking.privateOptions.filter(s => s.type === 'private').length} / 3 max
                  </span>
                </div>
                <Progress 
                  value={(stacking.privateOptions.filter(s => s.type === 'private').length / 3) * 100} 
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Corporate/Institutional</span>
                  <span className="font-medium">
                    {stacking.privateOptions.filter(s => ['corporate', 'college'].includes(s.type)).length} selected
                  </span>
                </div>
                <Progress 
                  value={Math.min((stacking.privateOptions.filter(s => ['corporate', 'college'].includes(s.type)).length / 3) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Link href="/dashboard/scholarships">
              <Button size="lg" className="gap-2">
                Apply for Scholarships
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ScholarshipCardProps {
  scholarship: ScholarshipItem;
  label: string;
  isPrimary?: boolean;
}

function ScholarshipCard({ scholarship, label, isPrimary }: ScholarshipCardProps) {
  const Icon = typeIcons[scholarship.type];
  const colorClass = typeColors[scholarship.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`rounded-lg border p-4 ${
          isPrimary
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {scholarship.name}
                </h4>
                {isPrimary && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Primary
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500">{scholarship.provider}</p>
              <p className="mt-1 text-xs text-slate-400">{label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-600 dark:text-green-400">
              ₹{scholarship.amount.min.toLocaleString()} - ₹{scholarship.amount.max.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">per year</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
