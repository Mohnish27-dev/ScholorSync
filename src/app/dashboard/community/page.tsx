'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Search,
  TrendingUp,
  Award,
  BookOpen,
  Loader2,
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface SuccessStory {
  id: string;
  name: string;
  avatar: string;
  scholarship: string;
  amount: string;
  tips: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  avatar: string;
  replies: number;
  views: number;
  tags: string[];
  createdAt: string;
}

export default function CommunityPage() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileComplete, setProfileComplete] = useState(false);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Community Intelligence
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Learn from successful applicants and share your experiences
          </p>
        </div>
      </div>

      {/* Profile Incomplete Alert */}
      {!profileComplete && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Complete Your Profile</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Complete your profile to participate in community discussions.
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Community Members</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-950">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Stories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{successStories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-950">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Discussions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{discussions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search discussions, success stories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stories" className="gap-2">
            <Award className="h-4 w-4" />
            Success Stories
          </TabsTrigger>
          <TabsTrigger value="discussions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Success Stories</CardTitle>
                  <CardDescription>
                    Learn from students who successfully received scholarships
                  </CardDescription>
                </div>
                {profileComplete && (
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Share Your Story
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {successStories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    No success stories yet
                  </h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-md">
                    Be the first to share your scholarship success story and help others!
                  </p>
                  {profileComplete && (
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Share Your Story
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {successStories.map((story) => (
                    <div
                      key={story.id}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{story.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {story.name}
                            </h4>
                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                              {story.scholarship}
                            </Badge>
                          </div>
                          <p className="text-sm text-green-600 font-medium mt-1">
                            Received {story.amount}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 mt-2">
                            {story.tips}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">
                              <ThumbsUp className="h-4 w-4" />
                              {story.likes}
                            </button>
                            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">
                              <MessageSquare className="h-4 w-4" />
                              {story.comments}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discussions</CardTitle>
                  <CardDescription>
                    Ask questions and get help from the community
                  </CardDescription>
                </div>
                {profileComplete && (
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Start Discussion
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {discussions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    No discussions yet
                  </h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-md">
                    Start a discussion to get help from the community or share your knowledge.
                  </p>
                  {profileComplete && (
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Start Discussion
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="rounded-lg border border-slate-200 p-4 hover:border-blue-200 cursor-pointer dark:border-slate-700 dark:hover:border-blue-900"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{discussion.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white hover:text-blue-600">
                            {discussion.title}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            by {discussion.author}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-slate-500">
                              {discussion.replies} replies
                            </span>
                            <span className="text-sm text-slate-500">
                              {discussion.views} views
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {discussion.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
