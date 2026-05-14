'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { PostCard } from './post-card';
import { PostCardSkeleton } from '@/components/ui/skeleton';
import type { PostWithMeta } from '@/lib/types/database';

interface PostListProps {
  initialPosts: PostWithMeta[];
  nextCursor?: string;
  hasMore?: boolean;
  fetchUrl: string;
}

export function PostList({ initialPosts, nextCursor, hasMore, fetchUrl }: PostListProps) {
  const [posts, setPosts] = useState<PostWithMeta[]>(initialPosts);
  const [cursor, setCursor] = useState<string | undefined>(nextCursor);
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMore] = useState(hasMore);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor || !hasMorePosts) return;
    setLoading(true);

    try {
      const url = new URL(fetchUrl, window.location.origin);
      url.searchParams.set('cursor', cursor);
      const res = await fetch(url.toString());
      const json = await res.json();

      if (json.data?.length) {
        setPosts(prev => [...prev, ...json.data]);
        setCursor(json.next_cursor);
        setHasMore(json.has_more ?? false);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Failed to load more posts:', e);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMorePosts, fetchUrl]);

  const lastRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    });

    if (node) observer.current.observe(node);
  }, [loading, loadMore]);

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMorePosts && <div ref={lastRef} className="h-8" />}
      {loading && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}
      {!hasMorePosts && posts.length > 0 && (
        <div className="text-center text-sm text-gray-400 py-8">
          已经到底了
        </div>
      )}
    </div>
  );
}
