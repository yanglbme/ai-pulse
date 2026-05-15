'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Heart, Bookmark, Share2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface PostActionBarProps {
  postId: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
}

export function PostActionBar({ postId, initialLiked, initialBookmarked, likeCount, bookmarkCount }: PostActionBarProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCnt, setLikeCnt] = useState(likeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleLike = async () => {
    if (!user) return;
    const originalLiked = liked;
    const originalCnt = likeCnt;

    setLiked(!liked);
    setLikeCnt(prev => liked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const json = await res.json();
      if (json.error) {
        setLiked(originalLiked);
        setLikeCnt(originalCnt);
      }
    } catch (err) {
      setLiked(originalLiked);
      setLikeCnt(originalCnt);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    const originalBookmarked = bookmarked;

    setBookmarked(!bookmarked);

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' });
      const json = await res.json();
      if (json.error) {
        setBookmarked(originalBookmarked);
      }
    } catch (err) {
      setBookmarked(originalBookmarked);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center gap-4 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline min-h-[44px]"
        >
          <LogIn className="w-4 h-4" />
          登录后即可点赞、收藏和评论
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
      <button
        onClick={handleLike}
        className={cn(
          'flex items-center gap-2 text-sm transition-colors min-h-[44px]',
          liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
        )}
      >
        <Heart className={cn('w-5 h-5', liked && 'fill-current')} />
        <span>{likeCnt}</span>
      </button>

      <button
        onClick={handleBookmark}
        className={cn(
          'flex items-center gap-2 text-sm transition-colors min-h-[44px]',
          bookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
        )}
      >
        <Bookmark className={cn('w-5 h-5', bookmarked && 'fill-current')} />
        <span>{bookmarkCount}</span>
      </button>
      
      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors ml-auto min-h-[44px]">
        <Share2 className="w-5 h-5" />
        <span>分享</span>
      </button>
    </div>
  );
}
