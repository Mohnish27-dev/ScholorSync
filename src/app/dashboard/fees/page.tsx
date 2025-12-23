'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Receipt, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  Upload, 
  Loader2, 
  ArrowRight,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface FeeAnalysis {
  id: string;
  filename: string;
  analyzedAt: string;
  totalAmount: number;
  discrepancies: number;
  status: 'clean' | 'issues-found';
}

export default function FeesPage() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [analyses, setAnalyses] = useState<FeeAnalysis[]>([]);

  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, isConfigured]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/profile?uid=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setProfileComplete(data.profile?.isComplete || false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleAnalyze = async (file: File) => {
    if (!user) return;
    
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', user.uid);

      const response = await fetch('/api/fees/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(prev => [data.analysis, ...prev]);
        toast.success('Fee receipt analyzed successfully!');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      toast.error('Failed to analyze fee receipt. Please try again.');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const totalAnalyzed = analyses.reduce((sum, a) => sum + a.totalAmount, 0);
  const totalDiscrepancies = analyses.reduce((sum, a) => sum + a.discrepancies, 0);
  const issuesCount = analyses.filter(a => a.status === 'issues-found').length;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Configuration Required</CardTitle>
            <CardDescription>
              Firebase is not configured. Please set up environment variables.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const feeStats = [
    {
      title: 'Total Fees Analyzed',
      value: totalAnalyzed > 0 ? `₹${totalAnalyzed.toLocaleString()}` : '₹0',
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Discrepancies Found',
      value: totalDiscrepancies > 0 ? `₹${totalDiscrepancies.toLocaleString()}` : '₹0',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
    {
      title: 'Receipts Analyzed',
      value: analyses.length.toString(),
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Issues Detected',
      value: issuesCount.toString(),
      icon: TrendingDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Fee Anomaly Detector
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Compare your fee receipts against official fee structures to detect discrepancies
        </p>
      </div>

      {/* Profile Incomplete Alert */}
      {!profileComplete && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
              <Receipt className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Complete Your Profile</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Add your institution details to get accurate fee comparisons.
              </p>
            </div>
            <Link href="/dashboard/profile">
              <Button className="gap-2">
                Complete Profile <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {feeStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fee Analyzer */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Fee Receipt</CardTitle>
          <CardDescription>
            Upload your fee receipt to compare against official fee structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center justify-center text-center">
              {analyzing ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    Analyzing your receipt...
                  </h4>
                  <p className="text-sm text-slate-500 mt-2">
                    Our AI is extracting and comparing fee components
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-slate-400 mb-4" />
                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    Upload Fee Receipt
                  </h4>
                  <p className="text-sm text-slate-500 mt-2">
                    Drag and drop or click to select your fee receipt
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, JPG, PNG (max 10MB)
                  </p>
                  <Label htmlFor="fee-upload" className="mt-4">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Select File
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="fee-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAnalyze(file);
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>
            Your previously analyzed fee receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                No analyses yet
              </h4>
              <p className="text-sm text-slate-500 mt-2">
                Upload a fee receipt above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    analysis.status === 'issues-found'
                      ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30'
                      : 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2 ${
                      analysis.status === 'issues-found'
                        ? 'bg-orange-100 dark:bg-orange-900'
                        : 'bg-green-100 dark:bg-green-900'
                    }`}>
                      {analysis.status === 'issues-found' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {analysis.filename}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ₹{analysis.totalAmount.toLocaleString()}
                    </p>
                    {analysis.discrepancies > 0 && (
                      <p className="text-sm text-orange-600">
                        ₹{analysis.discrepancies.toLocaleString()} discrepancy
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
