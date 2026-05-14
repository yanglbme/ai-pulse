import { PostFilter } from '@/components/planet/post-filter';
import { PostList } from '@/components/planet/post-list';
import { createClient } from '@/lib/supabase/server';
import type { PostWithMeta } from '@/lib/types/database';

interface PageProps {
  searchParams: Promise<{ source?: string; topic?: string; tag?: string; q?: string }>;
}

async function fetchPosts(filters: { source?: string; topic?: string }) {
  const supa = await createClient() as any;

  let query = supa
    .from('posts')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url),
      topics:post_topics(topics:topics(id, name, slug)),
      tags:post_tags(tags:tags(id, name, slug))
    `)
    .order('published_at', { ascending: false })
    .limit(20);

  if (filters.source && filters.source !== 'all') {
    query = query.eq('source', filters.source);
  }

  const { data: posts, error } = await query as any;
  if (error) {
    console.error('Failed to fetch posts:', error);
    return { posts: [], nextCursor: undefined, hasMore: false };
  }

  // Flatten nested data
  const formatted: PostWithMeta[] = (posts || []).map((post: any) => ({
    ...post,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
    topics: (post.topics || []).map((pt: any) => pt.topics).filter(Boolean),
    tags: (post.tags || []).map((pt: any) => pt.tags).filter(Boolean),
    is_liked: false,
    is_bookmarked: false,
  }));

  // Get current user's likes/bookmarks
  const { data: { user } } = await supa.auth.getUser();
  if (user && formatted.length > 0) {
    const postIds = formatted.map((p: any) => p.id);

    const likesResult = await supa
      .from('likes')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', user.id) as any;

    const bookmarksResult = await supa
      .from('bookmarks')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', user.id) as any;

    const likes = likesResult?.data;
    const bookmarks = bookmarksResult?.data;

    const likedIds = new Set((likes || []).map((l: any) => l.post_id));
    const bookmarkedIds = new Set((bookmarks || []).map((b: any) => b.post_id));

    formatted.forEach((post: any) => {
      post.is_liked = likedIds.has(post.id);
      post.is_bookmarked = bookmarkedIds.has(post.id);
    });
  }

  const nextCursor = posts?.length === 20
    ? posts[posts.length - 1].published_at
    : undefined;

  return {
    posts: formatted,
    nextCursor,
    hasMore: posts?.length === 20,
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { posts, nextCursor, hasMore } = await fetchPosts({
    source: params.source,
    topic: params.topic,
  });

  // Build fetch URL for client-side pagination
  const fetchParams = new URLSearchParams();
  if (params.source) fetchParams.set('source', params.source);
  if (params.topic) fetchParams.set('topic', params.topic);
  const fetchUrl = `/api/posts?${fetchParams.toString()}`;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          星球
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          发现 AI 技术前沿，分享你的见解
        </p>
      </div>

      <PostFilter />
      <PostList
        initialPosts={posts}
        nextCursor={nextCursor}
        hasMore={hasMore}
        fetchUrl={fetchUrl}
      />
    </div>
  );
}
