'use client';'use client';



import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';import { useAuth } from '@/contexts/AuthContext';

import { useRouter } from 'next/navigation';import { useRouter } from 'next/navigation';

import { motion, AnimatePresence } from 'framer-motion';import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Button } from '@/components/ui/button';

import { Button } from '@/components/ui/button';import { Input } from '@/components/ui/input';

import { Input } from '@/components/ui/input';import { Textarea } from '@/components/ui/textarea';

import { Textarea } from '@/components/ui/textarea';import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';import { Badge } from '@/components/ui/badge';

import { Badge } from '@/components/ui/badge';import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { 

import {  Users, 

  Dialog,  MessageSquare, 

  DialogContent,  ThumbsUp, 

  DialogHeader,  Search,

  DialogTitle,  TrendingUp,

  DialogTrigger,  Award,

} from '@/components/ui/dialog';  BookOpen,

import {  Loader2,

  Select,  Plus,

  SelectContent,  ArrowRight

  SelectItem,} from 'lucide-react';

  SelectTrigger,import Link from 'next/link';

  SelectValue,

} from '@/components/ui/select';interface SuccessStory {

import {   id: string;

  Users,   name: string;

  MessageSquare,   avatar: string;

  Search,  scholarship: string;

  TrendingUp,  amount: string;

  Award,  tips: string;

  Loader2,  likes: number;

  Plus,  comments: number;

  ArrowBigUp,  createdAt: string;

  ArrowBigDown,}

  MessageCircle,

  Clock,interface Discussion {

  Pin,  id: string;

  ChevronDown,  title: string;

  ChevronUp,  author: string;

  Send,  avatar: string;

  Filter,  replies: number;

  Flame,  views: number;

  Sparkles  tags: string[];

} from 'lucide-react';  createdAt: string;

import { formatDistanceToNow } from 'date-fns';}



interface Post {export default function CommunityPage() {

  id: string;  const { user, loading: authLoading, isConfigured } = useAuth();

  title: string;  const router = useRouter();

  content: string;  const [loading, setLoading] = useState(true);

  authorId: string;  const [searchQuery, setSearchQuery] = useState('');

  authorName: string;  const [profileComplete, setProfileComplete] = useState(false);

  authorAvatar: string;  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);

  category: string;  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  tags: string[];

  upvotes: number;  useEffect(() => {

  downvotes: number;    if (!authLoading && !user && isConfigured) {

  commentCount: number;      router.push('/auth/login');

  createdAt: { seconds: number } | Date;    }

  isPinned: boolean;  }, [user, authLoading, router, isConfigured]);

}

  useEffect(() => {

interface Comment {    async function loadData() {

  id: string;      if (!user) return;

  postId: string;      

  content: string;      try {

  authorId: string;        const response = await fetch(`/api/profile?uid=${user.uid}`);

  authorName: string;        if (response.ok) {

  authorAvatar: string;          const data = await response.json();

  upvotes: number;          setProfileComplete(data.profile?.isComplete || false);

  createdAt: { seconds: number } | Date;        }

  parentCommentId: string | null;      } catch (error) {

}        console.error('Error loading data:', error);

      } finally {

const CATEGORIES = [        setLoading(false);

  { value: 'all', label: 'All Posts', icon: Sparkles },      }

  { value: 'success-story', label: 'Success Stories', icon: Award },    }

  { value: 'question', label: 'Questions', icon: MessageCircle },

  { value: 'help', label: 'Help Needed', icon: Users },    if (user) {

  { value: 'resource', label: 'Resources', icon: TrendingUp },      loadData();

  { value: 'announcement', label: 'Announcements', icon: Pin },    } else if (!authLoading) {

];      setLoading(false);

    }

export default function CommunityPage() {  }, [user, authLoading]);

  const { user, loading: authLoading, isConfigured } = useAuth();

  const router = useRouter();  if (authLoading || loading) {

  const [loading, setLoading] = useState(true);    return (

  const [posts, setPosts] = useState<Post[]>([]);      <div className="flex items-center justify-center min-h-[60vh]">

  const [selectedCategory, setSelectedCategory] = useState('all');        <Loader2 className="h-8 w-8 animate-spin text-primary" />

  const [sortBy, setSortBy] = useState('createdAt');      </div>

  const [searchQuery, setSearchQuery] = useState('');    );

  const [expandedPost, setExpandedPost] = useState<string | null>(null);  }

  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);  if (!isConfigured) {

  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'question', tags: '' });    return (

  const [newComment, setNewComment] = useState<Record<string, string>>({});      <div className="flex items-center justify-center min-h-[60vh]">

  const [submitting, setSubmitting] = useState(false);        <Card className="max-w-md">

          <CardHeader>

  useEffect(() => {            <CardTitle>Configuration Required</CardTitle>

    if (!authLoading && !user && isConfigured) {            <CardDescription>

      router.push('/auth/login');              Firebase is not configured. Please set up environment variables.

    }            </CardDescription>

  }, [user, authLoading, router, isConfigured]);          </CardHeader>

        </Card>

  useEffect(() => {      </div>

    fetchPosts();    );

  }, [selectedCategory, sortBy]);  }



  const fetchPosts = async () => {  return (

    try {    <div className="space-y-6">

      setLoading(true);      {/* Header */}

      const params = new URLSearchParams({      <div className="flex items-center justify-between">

        type: 'posts',        <div>

        category: selectedCategory,          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">

        sortBy,            Community Intelligence

        limit: '50',          </h1>

      });          <p className="mt-2 text-slate-600 dark:text-slate-400">

                  Learn from successful applicants and share your experiences

      const response = await fetch(`/api/community?${params}`);          </p>

      const data = await response.json();        </div>

            </div>

      if (data.success) {

        setPosts(data.posts);      {/* Profile Incomplete Alert */}

      }      {!profileComplete && (

    } catch (error) {        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">

      console.error('Error fetching posts:', error);          <CardContent className="flex items-center gap-4 py-4">

    } finally {            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">

      setLoading(false);              <Users className="h-6 w-6 text-amber-600" />

    }            </div>

  };            <div className="flex-1">

              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Complete Your Profile</h3>

  const fetchComments = async (postId: string) => {              <p className="text-sm text-amber-700 dark:text-amber-300">

    try {                Complete your profile to participate in community discussions.

      const response = await fetch(`/api/community?type=comments&postId=${postId}`);              </p>

      const data = await response.json();            </div>

                  <Link href="/dashboard/profile">

      if (data.success) {              <Button className="gap-2">

        setComments(prev => ({ ...prev, [postId]: data.comments }));                Complete Profile <ArrowRight className="h-4 w-4" />

      }              </Button>

    } catch (error) {            </Link>

      console.error('Error fetching comments:', error);          </CardContent>

    }        </Card>

  };      )}



  const handleVote = async (type: 'post' | 'comment', id: string, action: 'upvote' | 'downvote') => {      {/* Stats */}

    if (!user) return;      <div className="grid gap-4 sm:grid-cols-3">

            <Card>

    try {          <CardContent className="pt-6">

      await fetch('/api/community', {            <div className="flex items-center gap-4">

        method: 'PATCH',              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950">

        headers: { 'Content-Type': 'application/json' },                <Users className="h-5 w-5 text-blue-600" />

        body: JSON.stringify({              </div>

          action,              <div>

          type,                <p className="text-sm text-slate-600 dark:text-slate-400">Community Members</p>

          id,                <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>

          userId: user.uid,              </div>

        }),            </div>

      });          </CardContent>

              </Card>

      // Optimistic update        <Card>

      if (type === 'post') {          <CardContent className="pt-6">

        setPosts(prev => prev.map(p =>             <div className="flex items-center gap-4">

          p.id === id               <div className="rounded-lg bg-green-100 p-3 dark:bg-green-950">

            ? { ...p, [action === 'upvote' ? 'upvotes' : 'downvotes']: p[action === 'upvote' ? 'upvotes' : 'downvotes'] + 1 }                <Award className="h-5 w-5 text-green-600" />

            : p              </div>

        ));              <div>

      }                <p className="text-sm text-slate-600 dark:text-slate-400">Success Stories</p>

    } catch (error) {                <p className="text-2xl font-bold text-slate-900 dark:text-white">{successStories.length}</p>

      console.error('Vote error:', error);              </div>

    }            </div>

  };          </CardContent>

        </Card>

  const handleCreatePost = async () => {        <Card>

    if (!user || !newPost.title || !newPost.content) return;          <CardContent className="pt-6">

                <div className="flex items-center gap-4">

    setSubmitting(true);              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-950">

    try {                <MessageSquare className="h-5 w-5 text-purple-600" />

      const response = await fetch('/api/community', {              </div>

        method: 'POST',              <div>

        headers: { 'Content-Type': 'application/json' },                <p className="text-sm text-slate-600 dark:text-slate-400">Active Discussions</p>

        body: JSON.stringify({                <p className="text-2xl font-bold text-slate-900 dark:text-white">{discussions.length}</p>

          type: 'post',              </div>

          userId: user.uid,            </div>

          userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',          </CardContent>

          userAvatar: user.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',        </Card>

          title: newPost.title,      </div>

          content: newPost.content,

          category: newPost.category,      {/* Search */}

          tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),      <Card>

        }),        <CardContent className="pt-6">

      });          <div className="relative">

                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      const data = await response.json();            <Input

                    placeholder="Search discussions, success stories..."

      if (data.success) {              className="pl-10"

        setNewPostDialogOpen(false);              value={searchQuery}

        setNewPost({ title: '', content: '', category: 'question', tags: '' });              onChange={(e) => setSearchQuery(e.target.value)}

        fetchPosts();            />

      }          </div>

    } catch (error) {        </CardContent>

      console.error('Create post error:', error);      </Card>

    } finally {

      setSubmitting(false);      {/* Tabs */}

    }      <Tabs defaultValue="stories" className="w-full">

  };        <TabsList className="grid w-full grid-cols-2">

          <TabsTrigger value="stories" className="gap-2">

  const handleCreateComment = async (postId: string, parentCommentId?: string) => {            <Award className="h-4 w-4" />

    if (!user || !newComment[postId]) return;            Success Stories

              </TabsTrigger>

    try {          <TabsTrigger value="discussions" className="gap-2">

      const response = await fetch('/api/community', {            <MessageSquare className="h-4 w-4" />

        method: 'POST',            Discussions

        headers: { 'Content-Type': 'application/json' },          </TabsTrigger>

        body: JSON.stringify({        </TabsList>

          type: 'comment',

          postId,        <TabsContent value="stories" className="mt-6">

          userId: user.uid,          <Card>

          userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',            <CardHeader>

          userAvatar: user.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',              <div className="flex items-center justify-between">

          content: newComment[postId],                <div>

          parentCommentId,                  <CardTitle>Success Stories</CardTitle>

        }),                  <CardDescription>

      });                    Learn from students who successfully received scholarships

                        </CardDescription>

      const data = await response.json();                </div>

                      {profileComplete && (

      if (data.success) {                  <Button className="gap-2">

        setNewComment(prev => ({ ...prev, [postId]: '' }));                    <Plus className="h-4 w-4" />

        fetchComments(postId);                    Share Your Story

        // Update comment count                  </Button>

        setPosts(prev => prev.map(p =>                 )}

          p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p              </div>

        ));            </CardHeader>

      }            <CardContent>

    } catch (error) {              {successStories.length === 0 ? (

      console.error('Create comment error:', error);                <div className="flex flex-col items-center justify-center py-12 text-center">

    }                  <Award className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />

  };                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">

                    No success stories yet

  const togglePostExpand = (postId: string) => {                  </h4>

    if (expandedPost === postId) {                  <p className="text-sm text-slate-500 mt-2 max-w-md">

      setExpandedPost(null);                    Be the first to share your scholarship success story and help others!

    } else {                  </p>

      setExpandedPost(postId);                  {profileComplete && (

      if (!comments[postId]) {                    <Button className="mt-4 gap-2">

        fetchComments(postId);                      <Plus className="h-4 w-4" />

      }                      Share Your Story

    }                    </Button>

  };                  )}

                </div>

  const getTimeAgo = (timestamp: { seconds: number } | Date) => {              ) : (

    const date = 'seconds' in timestamp                 <div className="space-y-6">

      ? new Date(timestamp.seconds * 1000)                   {successStories.map((story) => (

      : new Date(timestamp);                    <div

    return formatDistanceToNow(date, { addSuffix: true });                      key={story.id}

  };                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"

                    >

  const getCategoryIcon = (category: string) => {                      <div className="flex items-start gap-4">

    const cat = CATEGORIES.find(c => c.value === category);                        <Avatar>

    return cat?.icon || MessageCircle;                          <AvatarFallback>{story.avatar}</AvatarFallback>

  };                        </Avatar>

                        <div className="flex-1">

  const getCategoryColor = (category: string) => {                          <div className="flex items-center gap-2">

    const colors: Record<string, string> = {                            <h4 className="font-medium text-slate-900 dark:text-white">

      'success-story': 'bg-green-100 text-green-700 border-green-200',                              {story.name}

      'question': 'bg-blue-100 text-blue-700 border-blue-200',                            </h4>

      'help': 'bg-orange-100 text-orange-700 border-orange-200',                            <Badge variant="secondary" className="text-green-700 bg-green-100">

      'resource': 'bg-purple-100 text-purple-700 border-purple-200',                              {story.scholarship}

      'announcement': 'bg-red-100 text-red-700 border-red-200',                            </Badge>

    };                          </div>

    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';                          <p className="text-sm text-green-600 font-medium mt-1">

  };                            Received {story.amount}

                          </p>

  const filteredPosts = posts.filter(post => {                          <p className="text-slate-600 dark:text-slate-400 mt-2">

    if (!searchQuery) return true;                            {story.tips}

    const query = searchQuery.toLowerCase();                          </p>

    return (                          <div className="flex items-center gap-4 mt-3">

      post.title.toLowerCase().includes(query) ||                            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">

      post.content.toLowerCase().includes(query) ||                              <ThumbsUp className="h-4 w-4" />

      post.authorName.toLowerCase().includes(query) ||                              {story.likes}

      post.tags.some(t => t.toLowerCase().includes(query))                            </button>

    );                            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">

  });                              <MessageSquare className="h-4 w-4" />

                              {story.comments}

  if (authLoading || loading) {                            </button>

    return (                          </div>

      <div className="flex items-center justify-center min-h-[60vh]">                        </div>

        <Loader2 className="h-8 w-8 animate-spin text-primary" />                      </div>

      </div>                    </div>

    );                  ))}

  }                </div>

              )}

  if (!isConfigured) {            </CardContent>

    return (          </Card>

      <div className="flex items-center justify-center min-h-[60vh]">        </TabsContent>

        <Card className="max-w-md">

          <CardHeader>        <TabsContent value="discussions" className="mt-6">

            <CardTitle>Configuration Required</CardTitle>          <Card>

          </CardHeader>            <CardHeader>

        </Card>              <div className="flex items-center justify-between">

      </div>                <div>

    );                  <CardTitle>Discussions</CardTitle>

  }                  <CardDescription>

                    Ask questions and get help from the community

  return (                  </CardDescription>

    <div className="space-y-6">                </div>

      {/* Header */}                {profileComplete && (

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">                  <Button className="gap-2">

        <div>                    <Plus className="h-4 w-4" />

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">                    Start Discussion

            <Users className="h-8 w-8 text-primary" />                  </Button>

            Community                )}

          </h1>              </div>

          <p className="mt-1 text-slate-600 dark:text-slate-400">            </CardHeader>

            Connect with fellow scholarship seekers, share tips, and learn from success stories            <CardContent>

          </p>              {discussions.length === 0 ? (

        </div>                <div className="flex flex-col items-center justify-center py-12 text-center">

                          <MessageSquare className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />

        <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">

          <DialogTrigger asChild>                    No discussions yet

            <Button className="gap-2">                  </h4>

              <Plus className="h-4 w-4" />                  <p className="text-sm text-slate-500 mt-2 max-w-md">

              Create Post                    Start a discussion to get help from the community or share your knowledge.

            </Button>                  </p>

          </DialogTrigger>                  {profileComplete && (

          <DialogContent className="max-w-2xl">                    <Button className="mt-4 gap-2">

            <DialogHeader>                      <Plus className="h-4 w-4" />

              <DialogTitle>Create a New Post</DialogTitle>                      Start Discussion

            </DialogHeader>                    </Button>

            <div className="space-y-4 mt-4">                  )}

              <Input                </div>

                placeholder="Title - Be specific and descriptive"              ) : (

                value={newPost.title}                <div className="space-y-4">

                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}                  {discussions.map((discussion) => (

              />                    <div

              <Select                      key={discussion.id}

                value={newPost.category}                      className="rounded-lg border border-slate-200 p-4 hover:border-blue-200 cursor-pointer dark:border-slate-700 dark:hover:border-blue-900"

                onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}                    >

              >                      <div className="flex items-start gap-4">

                <SelectTrigger>                        <Avatar>

                  <SelectValue placeholder="Select category" />                          <AvatarFallback>{discussion.avatar}</AvatarFallback>

                </SelectTrigger>                        </Avatar>

                <SelectContent>                        <div className="flex-1">

                  {CATEGORIES.filter(c => c.value !== 'all').map(cat => (                          <h4 className="font-medium text-slate-900 dark:text-white hover:text-blue-600">

                    <SelectItem key={cat.value} value={cat.value}>                            {discussion.title}

                      {cat.label}                          </h4>

                    </SelectItem>                          <p className="text-sm text-slate-500 mt-1">

                  ))}                            by {discussion.author}

                </SelectContent>                          </p>

              </Select>                          <div className="flex items-center gap-4 mt-2">

              <Textarea                            <span className="text-sm text-slate-500">

                placeholder="Share your thoughts, experience, or question..."                              {discussion.replies} replies

                rows={8}                            </span>

                value={newPost.content}                            <span className="text-sm text-slate-500">

                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}                              {discussion.views} views

              />                            </span>

              <Input                          </div>

                placeholder="Tags (comma separated): nsp, sc-scholarship, engineering"                          <div className="flex gap-2 mt-2">

                value={newPost.tags}                            {discussion.tags.map((tag) => (

                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}                              <Badge key={tag} variant="outline" className="text-xs">

              />                                {tag}

              <div className="flex justify-end gap-2">                              </Badge>

                <Button variant="outline" onClick={() => setNewPostDialogOpen(false)}>                            ))}

                  Cancel                          </div>

                </Button>                        </div>

                <Button                       </div>

                  onClick={handleCreatePost}                     </div>

                  disabled={!newPost.title || !newPost.content || submitting}                  ))}

                >                </div>

                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}              )}

                  Post            </CardContent>

                </Button>          </Card>

              </div>        </TabsContent>

            </div>      </Tabs>

          </DialogContent>    </div>

        </Dialog>  );

      </div>}


      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Members</p>
                <p className="text-2xl font-bold">2,847</p>
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
                <p className="text-2xl font-bold">{posts.filter(p => p.category === 'success-story').length}</p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Discussions</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-950">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Today</p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search posts, tags, authors..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="upvotes">Top Voted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPosts.map((post, index) => {
            const CategoryIcon = getCategoryIcon(post.category);
            const isExpanded = expandedPost === post.id;
            const postComments = comments[post.id] || [];
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`overflow-hidden ${post.isPinned ? 'border-l-4 border-l-yellow-500' : ''}`}>
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Voting */}
                      <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-green-100 hover:text-green-600"
                          onClick={() => handleVote('post', post.id, 'upvote')}
                        >
                          <ArrowBigUp className="h-5 w-5" />
                        </Button>
                        <span className="font-bold text-lg">
                          {post.upvotes - post.downvotes}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleVote('post', post.id, 'downvote')}
                        >
                          <ArrowBigDown className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Meta */}
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                              {post.isPinned && (
                                <Badge variant="secondary" className="gap-1">
                                  <Pin className="h-3 w-3" /> Pinned
                                </Badge>
                              )}
                              <Badge variant="outline" className={getCategoryColor(post.category)}>
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {CATEGORIES.find(c => c.value === post.category)?.label}
                              </Badge>
                              <span>Posted by</span>
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">{post.authorAvatar}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {post.authorName}
                                </span>
                              </div>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{getTimeAgo(post.createdAt)}</span>
                            </div>

                            {/* Title */}
                            <h3 
                              className="text-lg font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-primary"
                              onClick={() => togglePostExpand(post.id)}
                            >
                              {post.title}
                            </h3>

                            {/* Content Preview */}
                            <p className="mt-2 text-slate-600 dark:text-slate-400 line-clamp-2">
                              {post.content}
                            </p>

                            {/* Tags */}
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {post.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-slate-600"
                                onClick={() => togglePostExpand(post.id)}
                              >
                                <MessageCircle className="h-4 w-4" />
                                {post.commentCount} Comments
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content & Comments */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t">
                                {/* Full Content */}
                                <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
                                  <p className="whitespace-pre-wrap">{post.content}</p>
                                </div>

                                {/* Add Comment */}
                                <div className="flex gap-3 mb-6">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 flex gap-2">
                                    <Input
                                      placeholder="Add a comment..."
                                      value={newComment[post.id] || ''}
                                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleCreateComment(post.id);
                                        }
                                      }}
                                    />
                                    <Button 
                                      size="icon"
                                      onClick={() => handleCreateComment(post.id)}
                                      disabled={!newComment[post.id]}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-4">
                                  {postComments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                          {comment.authorAvatar}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium">{comment.authorName}</span>
                                          <span className="text-slate-400">•</span>
                                          <span className="text-slate-400 text-xs">
                                            {getTimeAgo(comment.createdAt)}
                                          </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 mt-1">
                                          {comment.content}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 gap-1 text-slate-500"
                                            onClick={() => handleVote('comment', comment.id, 'upvote')}
                                          >
                                            <ArrowBigUp className="h-4 w-4" />
                                            {comment.upvotes}
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-slate-500"
                                          >
                                            Reply
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {postComments.length === 0 && (
                                    <p className="text-center text-slate-400 py-4">
                                      No comments yet. Be the first to comment!
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredPosts.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No posts found</h3>
              <p className="text-slate-500 mt-1">Be the first to start a discussion!</p>
              <Button className="mt-4" onClick={() => setNewPostDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
