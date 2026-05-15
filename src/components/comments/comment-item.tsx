'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { CommentInput } from './comment-input';
import { formatRelativeTime } from '@/lib/utils/time';
import type { Comment, Profile } from '@/lib/types/database';
import { useAuth } from '@/lib/hooks/use-auth';
import { Heart, MessageSquare, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';

interface CommentItemProps {
  comment: Comment & { author?: Profile };
  replies?: (Comment & { author?: Profile })[];
  postId: string;
  onRefresh: () => void;
}

export function CommentItem({ comment, replies = [], postId, onRefresh }: CommentItemProps) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count);

  const handleLike = async () => {
    if (!user) return;
    try {
      const supa = createClient() as any;
      const { data: { user: u } } = await supa.auth.getUser();
      if (!u) return;

      if (liked) {
        await supa.from('likes').delete().match({ user_id: u.id, comment_id: comment.id });
      } else {
        await supa.from('likes').insert({ user_id: u.id, comment_id: comment.id });
      }
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar
          src={comment.author?.avatar_url}
          name={comment.author?.display_name}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {comment.author?.display_name || '未知用户'}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            {user ? (
              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-1 hover:text-red-500 transition-colors min-h-[44px]',
                  liked && 'text-red-500'
                )}
              >
                <Heart className={cn('w-3.5 h-3.5', liked && 'fill-current')} />
                <span>{likeCount}</span>
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-1 hover:text-red-500 transition-colors min-h-[44px]">
                <Heart className="w-3.5 h-3.5" />
                <span>{likeCount}</span>
              </Link>
            )}

            {user ? (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 hover:text-primary-600 transition-colors min-h-[44px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>回复</span>
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-1 hover:text-primary-600 transition-colors min-h-[44px]">
                <LogIn className="w-3.5 h-3.5" />
                <span>回复</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Reply input */}
      {showReply && user && (
        <div className="ml-11 mt-3">
          <CommentInput
            postId={postId}
            parentId={comment.id}
            placeholder={`回复 ${comment.author?.display_name}...`}
            onSubmitted={() => {
              setShowReply(false);
              onRefresh();
            }}
            onCancel={() => setShowReply(false)}
          />
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 mt-3">
          {!showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="text-sm text-primary-600 dark:text-primary-400 mb-2 min-h-[44px]"
            >
              展开 {replies.length} 条回复
            </button>
          )}
          {showReplies && (
            <div className="space-y-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
