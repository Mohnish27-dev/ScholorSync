import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Types
interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isPinned: boolean;
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  upvotes: number;
  createdAt: Timestamp | Date;
  parentCommentId: string | null;
}

// GET - Fetch posts or comments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'posts';
    const postId = searchParams.get('postId');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const limitCount = parseInt(searchParams.get('limit') || '20');

    if (type === 'posts') {
      let q = query(
        collection(db, 'communityPosts'),
        orderBy(sortBy === 'upvotes' ? 'upvotes' : 'createdAt', 'desc'),
        limit(limitCount)
      );

      if (category && category !== 'all') {
        q = query(
          collection(db, 'communityPosts'),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const posts: Post[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      // Sort pinned posts to top
      posts.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });

      return NextResponse.json({ success: true, posts });

    } else if (type === 'comments' && postId) {
      const q = query(
        collection(db, 'communityComments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const comments: Comment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      return NextResponse.json({ success: true, comments });

    } else if (type === 'post' && postId) {
      const docRef = doc(db, 'communityPosts', postId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        post: { id: docSnap.id, ...docSnap.data() },
      });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Community GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST - Create post or comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, userName, userAvatar } = body;

    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    if (type === 'post') {
      const { title, content, category, tags } = body;

      if (!title || !content) {
        return NextResponse.json(
          { error: 'Title and content are required' },
          { status: 400 }
        );
      }

      const newPost = {
        title,
        content,
        authorId: userId,
        authorName: userName,
        authorAvatar: userAvatar || userName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        category: category || 'general',
        tags: tags || [],
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPinned: false,
      };

      const docRef = await addDoc(collection(db, 'communityPosts'), newPost);

      return NextResponse.json({
        success: true,
        postId: docRef.id,
        message: 'Post created successfully',
      });

    } else if (type === 'comment') {
      const { postId, content, parentCommentId } = body;

      if (!postId || !content) {
        return NextResponse.json(
          { error: 'Post ID and content are required' },
          { status: 400 }
        );
      }

      const newComment = {
        postId,
        content,
        authorId: userId,
        authorName: userName,
        authorAvatar: userAvatar || userName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        upvotes: 0,
        createdAt: serverTimestamp(),
        parentCommentId: parentCommentId || null,
      };

      const docRef = await addDoc(collection(db, 'communityComments'), newComment);

      // Update comment count on post
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        commentId: docRef.id,
        message: 'Comment added successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid type. Use: post or comment' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Community POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create' },
      { status: 500 }
    );
  }
}

// PATCH - Update post/comment or vote
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, id, userId } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'ID and user ID required' },
        { status: 400 }
      );
    }

    const collectionName = type === 'post' ? 'communityPosts' : 'communityComments';
    const docRef = doc(db, collectionName, id);

    if (action === 'upvote') {
      await updateDoc(docRef, {
        upvotes: increment(1),
      });
      return NextResponse.json({ success: true, message: 'Upvoted' });

    } else if (action === 'downvote') {
      await updateDoc(docRef, {
        downvotes: increment(1),
      });
      return NextResponse.json({ success: true, message: 'Downvoted' });

    } else if (action === 'edit') {
      const { title, content } = body;
      
      const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      
      if (content) updates.content = content;
      if (title && type === 'post') updates.title = title;

      await updateDoc(docRef, updates);
      return NextResponse.json({ success: true, message: 'Updated' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Community PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}

// DELETE - Delete post or comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!type || !id || !userId) {
      return NextResponse.json(
        { error: 'Type, ID, and user ID required' },
        { status: 400 }
      );
    }

    const collectionName = type === 'post' ? 'communityPosts' : 'communityComments';
    const docRef = doc(db, collectionName, id);
    
    // Verify ownership
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    if (data.authorId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await deleteDoc(docRef);

    // If deleting a comment, decrement post comment count
    if (type === 'comment' && data.postId) {
      const postRef = doc(db, 'communityPosts', data.postId);
      await updateDoc(postRef, {
        commentCount: increment(-1),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Deleted successfully',
    });

  } catch (error) {
    console.error('Community DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
