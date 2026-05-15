'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostEditor } from '@/components/planet/post-editor';
import { useAuth } from '@/lib/hooks/use-auth';

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="p-8 text-center text-gray-400">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        发布内容
      </h1>
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <PostEditor />
      </div>
    </div>
  );
}
