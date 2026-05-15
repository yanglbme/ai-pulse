import { createClient } from '@/lib/supabase/server';
import { PostEditor } from '@/components/planet/post-editor';

export const metadata = {
  title: '发布内容',
};

export default async function NewPostPage() {
  const supa = await createClient() as any;

  // Fetch topics to pass to the editor (so it can use real UUIDs)
  const { data: topics } = await supa
    .from('topics')
    .select('id, slug, name')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        发布内容
      </h1>
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <PostEditor topics={topics || []} />
      </div>
    </div>
  );
}
