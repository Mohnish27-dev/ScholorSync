'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  IndianRupee,
  Users,
  MapPin,
  GraduationCap,
  Lightbulb,
  Target,
  Clock,
  Building2,
  Briefcase,
  RefreshCw,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface MarketIntelligence {
  overview: {
    totalScholarships: number;
    totalValue: number;
    averageAmount: number;
    medianAmount: number;
    governmentCount: number;
    privateCount: number;
  };
  categoryDistribution: Record<string, { count: number; totalValue: number; avgAmount: number }>;
  stateDistribution: Record<string, { count: number; totalValue: number }>;
  incomeDistribution: {
    below2L: number;
    between2L5L: number;
    between5L8L: number;
    above8L: number;
  };
  levelDistribution: Record<string, number>;
  competitionAnalysis: {
    low: number;
    medium: number;
    high: number;
  };
  deadlineAnalysis: {
    thisMonth: number;
    nextMonth: number;
    next3Months: number;
    later: number;
  };
  topProviders: Array<{ name: string; count: number; totalValue: number }>;
  trends: string[];
  insights: string[];
  recommendations: string[];
}

const INDIAN_STATES = [
  'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const CATEGORIES = ['All', 'General', 'SC', 'ST', 'OBC', 'EWS', 'Minority', 'Women', 'Disabled'];
const LEVELS = ['All Levels', 'Class 9-10', 'Class 11-12', 'Undergraduate', 'Postgraduate', 'PhD', 'Diploma'];

export function MarketIntelligence() {
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState<MarketIntelligence | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All India');
  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');

  const fetchIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedState !== 'All India') params.append('state', selectedState);
      if (selectedLevel !== 'All Levels') params.append('level', selectedLevel);

      const response = await fetch(`/api/intelligence?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setIntelligence(data.intelligence);
      }
    } catch (error) {
      console.error('Error fetching market intelligence:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedState, selectedLevel]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
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

  if (!intelligence) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-slate-500">Failed to load market intelligence</p>
          <Button onClick={fetchIntelligence} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalCompetition = 
    intelligence.competitionAnalysis.low + 
    intelligence.competitionAnalysis.medium + 
    intelligence.competitionAnalysis.high;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Market Intelligence
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of the Indian scholarship landscape
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchIntelligence} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                <GraduationCap className="h-4 w-4" />
                Total Scholarships
              </div>
              <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
                {intelligence.overview.totalScholarships}
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/30 dark:to-emerald-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                <IndianRupee className="h-4 w-4" />
                Total Value
              </div>
              <p className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
                {formatAmount(intelligence.overview.totalValue)}
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-4 dark:from-purple-950/30 dark:to-violet-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                <BarChart3 className="h-4 w-4" />
                Average Amount
              </div>
              <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
                {formatAmount(intelligence.overview.averageAmount)}
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:from-orange-950/30 dark:to-amber-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                <Building2 className="h-4 w-4" />
                Government
              </div>
              <p className="mt-2 text-3xl font-bold text-orange-900 dark:text-orange-100">
                {intelligence.overview.governmentCount}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                vs {intelligence.overview.privateCount} private
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(intelligence.categoryDistribution)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 8)
                    .map(([category, stats]) => {
                      const percentage = (stats.count / intelligence.overview.totalScholarships) * 100;
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category}</span>
                            <span className="text-slate-500">
                              {stats.count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-slate-400">
                            Avg: {formatAmount(stats.avgAmount)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* State Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  By State
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(intelligence.stateDistribution)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 8)
                    .map(([state, stats]) => {
                      const percentage = (stats.count / intelligence.overview.totalScholarships) * 100;
                      return (
                        <div key={state} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{state}</span>
                            <span className="text-slate-500">
                              {stats.count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Income Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-purple-500" />
                  By Income Limit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Below ₹2 Lakh', value: intelligence.incomeDistribution.below2L },
                    { label: '₹2-5 Lakh', value: intelligence.incomeDistribution.between2L5L },
                    { label: '₹5-8 Lakh', value: intelligence.incomeDistribution.between5L8L },
                    { label: 'Above ₹8 Lakh', value: intelligence.incomeDistribution.above8L },
                  ].map((item) => {
                    const percentage = (item.value / intelligence.overview.totalScholarships) * 100;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-slate-500">
                            {item.value} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-orange-500" />
                  By Education Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(intelligence.levelDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([level, count]) => {
                      const percentage = (count / intelligence.overview.totalScholarships) * 100;
                      return (
                        <div key={level} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{level}</span>
                            <span className="text-slate-500">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competition" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Competition Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Competition Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">Low</Badge>
                        <span className="text-sm">Easier to get</span>
                      </div>
                      <span className="font-semibold">
                        {intelligence.competitionAnalysis.low}
                      </span>
                    </div>
                    <Progress 
                      value={(intelligence.competitionAnalysis.low / totalCompetition) * 100} 
                      className="h-3 bg-green-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
                        <span className="text-sm">Moderate competition</span>
                      </div>
                      <span className="font-semibold">
                        {intelligence.competitionAnalysis.medium}
                      </span>
                    </div>
                    <Progress 
                      value={(intelligence.competitionAnalysis.medium / totalCompetition) * 100} 
                      className="h-3 bg-yellow-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-700">High</Badge>
                        <span className="text-sm">Very competitive</span>
                      </div>
                      <span className="font-semibold">
                        {intelligence.competitionAnalysis.high}
                      </span>
                    </div>
                    <Progress 
                      value={(intelligence.competitionAnalysis.high / totalCompetition) * 100} 
                      className="h-3 bg-red-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deadline Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Deadline Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/30">
                    <p className="text-3xl font-bold text-red-600">
                      {intelligence.deadlineAnalysis.thisMonth}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">This Month</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950/30">
                    <p className="text-3xl font-bold text-orange-600">
                      {intelligence.deadlineAnalysis.nextMonth}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Next Month</p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-4 text-center dark:bg-yellow-950/30">
                    <p className="text-3xl font-bold text-yellow-600">
                      {intelligence.deadlineAnalysis.next3Months}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Next 3 Months</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/30">
                    <p className="text-3xl font-bold text-green-600">
                      {intelligence.deadlineAnalysis.later}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">Later</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Top Scholarship Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intelligence.topProviders.map((provider, index) => (
                  <motion.div
                    key={provider.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold dark:bg-indigo-900 dark:text-indigo-300">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-sm text-slate-500">
                          {provider.count} scholarship{provider.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatAmount(provider.totalValue)}
                      </p>
                      <p className="text-xs text-slate-500">Total value</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {intelligence.trends.map((trend, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30"
                    >
                      <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">{trend}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {intelligence.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/30"
                    >
                      <ChevronRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-purple-800 dark:text-purple-200">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {intelligence.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30"
                    >
                      <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
