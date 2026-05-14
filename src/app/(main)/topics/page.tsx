import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Hash, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const metadata = {
  title: '话题',
};

export default async function TopicsPage() {
  const supa = await createClient() as any;

  const { data: topics } = await supa
    .from('topics')
    .select('*')
    .order('follower_count', { ascending: false });

  const { data: { user } } = await supa.auth.getUser();

  // Get user's followed topics
  let followedIds = new Set<string>();
  if (user) {
    const { data: userTopics } = await supa
      .from('user_topics')
      .select('topic_id')
      .eq('user_id', user.id);
    followedIds = new Set((userTopics || []).map((ut: any) => ut.topic_id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        话题
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        关注感兴趣的话题，获取相关内容推送
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(topics as any[])?.map((topic: any) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md',
              followedIds.has(topic.id)
                ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              followedIds.has(topic.id)
                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            )}>
              <Hash className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {topic.name}
              </h3>
              {topic.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {topic.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              {topic.follower_count || 0}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
