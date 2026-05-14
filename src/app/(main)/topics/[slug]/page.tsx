import { createClient } from '@/lib/supabase/server';
import { PostList } from '@/components/planet/post-list';
import { Hash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PageProps } from '@/types/page-props';

export default async function TopicPage(props: PageProps<'/topics/[slug]'>) {
  const { slug } = await props.params;

  const supa = await createClient() as any;

  // Get topic
  const { data: topic } = await supa
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!topic) notFound();

  // Get posts for this topic
  const { data: posts } = await supa
    .from('posts')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url),
      topics:post_topics(topics:topics(id, name, slug)),
      tags:post_tags(tags:tags(id, name, slug))
    `)
    .eq('post_topics.topic_id', topic.id)
    .order('published_at', { ascending: false })
    .limit(20);

  const formatted = ((posts || []) as any[]).map((post: any) => ({
    ...post,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
    topics: (post.topics || []).map((pt: any) => pt.topics).filter(Boolean),
    tags: (post.tags || []).map((pt: any) => pt.tags).filter(Boolean),
    is_liked: false,
    is_bookmarked: false,
  }));

  return (
    <div>
      <Link
        href="/topics"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-4 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        返回话题列表
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Hash className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {topic.name}
            </h1>
            {topic.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {topic.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <PostList
        initialPosts={formatted}
        nextCursor={undefined}
        hasMore={false}
        fetchUrl={`/api/posts?topic=${slug}`}
      />
    </div>
  );
}
