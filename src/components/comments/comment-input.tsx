'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';

interface CommentInputProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onSubmitted: () => void;
  onCancel?: () => void;
}

export function CommentInput({ postId, parentId, placeholder = '写下你的想法...', onSubmitted, onCancel }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      const supa = createClient() as any;
      const { data: { user } } = await supa.auth.getUser();
      if (!user) return;

      const { error } = await supa.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        parent_id: parentId || null,
        content: content.trim(),
      });

      if (error) throw error;
      setContent('');
      onSubmitted();
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar size="sm" name="我" className="flex-shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm resize-none focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            发布
          </Button>
        </div>
      </div>
    </div>
  );
}
