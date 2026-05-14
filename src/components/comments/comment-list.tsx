'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { createClient } from '@/lib/supabase/client';
import type { Comment, Profile } from '@/lib/types/database';

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<(Comment & { author?: Profile; replies?: Comment[] })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const supa = createClient() as any;
      const { data, error } = await supa
        .from('comments')
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url)
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch replies for each top-level comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment: Comment) => {
          const { data: replies } = await supa
            .from('comments')
            .select(`
              *,
              author:profiles(id, username, display_name, avatar_url)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );

      setComments(commentsWithReplies);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Real-time subscription
  useEffect(() => {
    const supa = createClient() as any;
    const channel = supa
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supa.removeChannel(channel);
    };
  }, [postId, fetchComments]);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
        评论 ({comments.length})
      </h3>
      <CommentInput postId={postId} onSubmitted={fetchComments} />

      {loading ? (
        <div className="text-sm text-gray-400">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-8">暂无评论，来说两句吧</div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comment.replies || []}
              postId={postId}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
