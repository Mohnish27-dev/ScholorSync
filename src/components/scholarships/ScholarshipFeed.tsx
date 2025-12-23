'use client';

import { useState } from 'react';
import { ScholarshipCard } from './ScholarshipCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import type { ScholarshipMatch, EligibilityExplanation } from '@/types';

interface ScholarshipFeedProps {
  scholarships: ScholarshipMatch[];
  savedScholarshipIds: string[];
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
  onExplain: (scholarship: ScholarshipMatch) => Promise<EligibilityExplanation>;
}

export function ScholarshipFeed({
  scholarships,
  savedScholarshipIds,
  onSave,
  onUnsave,
  onExplain,
}: ScholarshipFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'amount'>('match');

  const filteredScholarships = scholarships
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || s.type === typeFilter;
      const matchesMinMatch = s.matchPercentage >= minMatchFilter;
      return matchesSearch && matchesType && matchesMinMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchPercentage - a.matchPercentage;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'amount':
          return b.amount.max - a.amount.max;
        default:
          return 0;
      }
    });

  const [now] = useState(() => Date.now());
  
  const highMatchCount = scholarships.filter((s) => s.matchPercentage >= 80).length;
  const urgentCount = scholarships.filter((s) => {
    const daysLeft = Math.ceil(
      (new Date(s.deadline).getTime() - now) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 7 && daysLeft > 0;
  }).length;

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setMinMatchFilter(0);
    setSortBy('match');
  };

  const hasActiveFilters =
    searchQuery || typeFilter !== 'all' || minMatchFilter > 0 || sortBy !== 'match';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-3xl font-bold">{scholarships.length}</p>
          <p className="text-sm opacity-90">Total Matches</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-3xl font-bold">{highMatchCount}</p>
          <p className="text-sm opacity-90">High Match (80%+)</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-3xl font-bold">{urgentCount}</p>
          <p className="text-sm opacity-90">Urgent Deadlines</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-3xl font-bold">{savedScholarshipIds.length}</p>
          <p className="text-sm opacity-90">Saved</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="college">College</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Match Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setMinMatchFilter(v === 'all' ? 0 : parseInt(v))}>
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {scholarships.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="80">
            80%+ Match
            <Badge variant="secondary" className="ml-2">
              {scholarships.filter((s) => s.matchPercentage >= 80).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="60">
            60%+ Match
            <Badge variant="secondary" className="ml-2">
              {scholarships.filter((s) => s.matchPercentage >= 60).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredScholarships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No scholarships found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredScholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  isSaved={savedScholarshipIds.includes(scholarship.id)}
                  onSave={onSave}
                  onUnsave={onUnsave}
                  onExplain={onExplain}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="80" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScholarships
              .filter((s) => s.matchPercentage >= 80)
              .map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  isSaved={savedScholarshipIds.includes(scholarship.id)}
                  onSave={onSave}
                  onUnsave={onUnsave}
                  onExplain={onExplain}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="60" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScholarships
              .filter((s) => s.matchPercentage >= 60)
              .map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  isSaved={savedScholarshipIds.includes(scholarship.id)}
                  onSave={onSave}
                  onUnsave={onUnsave}
                  onExplain={onExplain}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
