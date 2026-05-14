import { createClient } from '@/lib/supabase/server';
import { PostList } from '@/components/planet/post-list';
import { Bookmark } from 'lucide-react';

export const metadata = {
  title: '我的收藏',
};

export default async function BookmarksPage() {
  const supa = await createClient() as any;
  const { data: { user } } = await supa.auth.getUser();

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          我的收藏
        </h1>
        <div className="text-center text-gray-400 py-16">
          请先登录后查看收藏内容
        </div>
      </div>
    );
  }

  const { data: bookmarks } = await supa
    .from('bookmarks')
    .select(`
      post:posts(
        *,
        author:profiles(id, username, display_name, avatar_url),
        topics:post_topics(topics:topics(id, name, slug)),
        tags:post_tags(tags:tags(id, name, slug))
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const posts = ((bookmarks || []) as Array<{ post: any }>)
    .map(b => b.post)
    .filter(Boolean)
    .map((post: any) => ({
      ...post,
      author: Array.isArray(post.author) ? post.author[0] : post.author,
      topics: (post.topics || []).map((pt: any) => pt.topics).filter(Boolean),
      tags: (post.tags || []).map((pt: any) => pt.tags).filter(Boolean),
      is_liked: false,
      is_bookmarked: true,
    }));

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="w-6 h-6 text-gray-900 dark:text-white" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          我的收藏
        </h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          还没有收藏任何内容
        </div>
      ) : (
        <PostList
          initialPosts={posts}
          nextCursor={undefined}
          hasMore={false}
          fetchUrl="/api/bookmarks"
        />
      )}
    </div>
  );
}
