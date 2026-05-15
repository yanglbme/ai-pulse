import { createClient } from '@/lib/supabase/server';
import { Avatar } from '@/components/ui/avatar';
import { PostCard } from '@/components/planet/post-card';
import { formatFullDate } from '@/lib/utils/time';
import { notFound } from 'next/navigation';
import type { PageProps } from '@/types/page-props';
import type { PostWithMeta, Profile } from '@/lib/types/database';

export default async function ProfilePage(props: PageProps<'/profile/[username]'>) {
  const { username } = await props.params;
  const supabase = await createClient() as any;

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url),
      topics:post_topics(topics:topics(id, name, slug)),
      tags:post_tags(tags:tags(id, name, slug))
    `)
    .eq('author_id', profile.id)
    .order('published_at', { ascending: false });

  const formatted: PostWithMeta[] = (posts || []).map((post: any) => ({
    ...post,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
    topics: (post.topics || []).map((pt: any) => pt.topics).filter(Boolean),
    tags: (post.tags || []).map((pt: any) => pt.tags).filter(Boolean),
    is_liked: false,
    is_bookmarked: false,
  }));

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar src={profile.avatar_url} name={profile.display_name} size="lg" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              加入于 {formatFullDate(profile.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        发布的内容
      </h2>

      {formatted.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
          还没有发布任何内容
        </div>
      ) : (
        <div className="space-y-4">
          {formatted.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
