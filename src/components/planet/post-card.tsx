'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TopicBadge } from '@/components/common/topic-badge';
import { TagBadge } from '@/components/common/tag-badge';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatRelativeTime } from '@/lib/utils/time';
import type { PostWithMeta } from '@/lib/types/database';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

interface PostCardProps {
  post: PostWithMeta;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked);

  const handleLike = async () => {
    if (!user) return;
    const originalLiked = liked;
    const originalCount = likeCount;

    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const json = await res.json();
      if (json.error) {
        setLiked(originalLiked);
        setLikeCount(originalCount);
      }
    } catch (err) {
      setLiked(originalLiked);
      setLikeCount(originalCount);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    const originalBookmarked = bookmarked;

    setBookmarked(!bookmarked);

    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, { method: 'POST' });
      const json = await res.json();
      if (json.error) {
        setBookmarked(originalBookmarked);
      }
    } catch (err) {
      setBookmarked(originalBookmarked);
    }
  };

  return (
    <article className="group rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 p-4 sm:p-5 hover:shadow-md transition-all">
      {/* Author info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={post.author?.avatar_url} name={post.author?.display_name} size="sm" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {post.author?.display_name || post.author?.username || '未知用户'}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {formatRelativeTime(post.published_at)}
          </span>
        </div>
        {post.source === 'system' && (
          <Badge variant="primary">官方</Badge>
        )}
      </div>

      {/* Content */}
      <Link href={`/planet/${post.id}`}>
        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {post.summary}
        </p>
      </Link>

      {/* Topics & Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {post.topics?.slice(0, 3).map((t) => (
          <TopicBadge key={t.id} topic={t} />
        ))}
        {post.tags?.slice(0, 3).map((t) => (
          <TagBadge key={t.id} tag={t} />
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4 sm:gap-6 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
        {user ? (
          <>
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors min-h-[44px] min-w-[44px]',
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              )}
            >
              <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
              <span>{likeCount}</span>
            </button>

            <Link
              href={`/planet/${post.id}#comments`}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors min-h-[44px] min-w-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count}</span>
            </Link>

            <button
              onClick={handleBookmark}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors min-h-[44px] min-w-[44px]',
                bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
              )}
            >
              <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
            </button>

            <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ml-auto min-h-[44px] min-w-[44px]">
              <Share2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline min-h-[44px]"
          >
            <Heart className="w-4 h-4" />
            <span>登录后即可点赞 · 评论 · 收藏</span>
          </Link>
        )}
      </div>
    </article>
  );
}
