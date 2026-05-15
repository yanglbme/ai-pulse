import { createClient } from '@/lib/supabase/server';
import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { CommentList } from '@/components/comments/comment-list';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TopicBadge } from '@/components/common/topic-badge';
import { TagBadge } from '@/components/common/tag-badge';
import { PostActionBar } from '@/components/planet/post-action-bar';
import { formatFullDate } from '@/lib/utils/time';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { PageProps } from '@/types/page-props';

export default async function PostDetailPage(props: PageProps<'/planet/[id]'>) {
  const { id } = await props.params;

  const supa = await createClient() as any;

  // Fetch user
  const { data: { user } } = await supa.auth.getUser();

  // Fetch post
  const { data: post, error } = await supa
    .from('posts')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url, bio),
      topics:post_topics(topics:topics(id, name, slug)),
      tags:post_tags(tags:tags(id, name, slug))
    `)
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Check like/bookmark status
  let isLiked = false;
  let isBookmarked = false;

  if (user) {
    const { data: like } = await supa.from('likes').select('id').eq('user_id', user.id).eq('post_id', id).single();
    isLiked = !!like;
    
    const { data: bookmark } = await supa.from('bookmarks').select('id').eq('user_id', user.id).eq('post_id', id).single();
    isBookmarked = !!bookmark;
  }

  // Flatten nested data
  const author = Array.isArray(post.author) ? post.author[0] : post.author;
  const topics = (post.topics || []).map((pt: any) => pt.topics).filter(Boolean);
  const tags = (post.tags || []).map((pt: any) => pt.tags).filter(Boolean);

  return (
    <div>
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        返回星球
      </Link>

      {/* Article header */}
      <article className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Author */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar src={author?.avatar_url} name={author?.display_name} size="md" />
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {author?.display_name || author?.username || '未知用户'}
              </span>
              <p className="text-xs text-gray-400">
                {formatFullDate(post.published_at)}
              </p>
            </div>
            {post.source === 'system' && (
              <Badge variant="primary">官方</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          {/* Topics & Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {topics.map((t: any) => (
              <TopicBadge key={t.id} topic={t} size="md" />
            ))}
            {tags.map((t: any) => (
              <TagBadge key={t.id} tag={t} />
            ))}
          </div>

          {/* Content */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <MarkdownRenderer content={post.content} />
          </div>
        </div>

        {/* Action bar */}
        <PostActionBar
          postId={post.id}
          initialLiked={isLiked}
          initialBookmarked={isBookmarked}
          likeCount={post.like_count}
          bookmarkCount={post.bookmark_count}
        />
      </article>

      {/* Comments */}
      <div className="mt-8 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-6">
        <CommentList postId={post.id} />
      </div>
    </div>
  );
}
