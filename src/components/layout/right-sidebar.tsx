'use client';

import { TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

const trendingPosts = [
  { id: '1', title: 'GPT-5 技术预览版发布', views: '12.3k' },
  { id: '2', title: 'Agent 框架对比：LangGraph vs CrewAI', views: '8.7k' },
  { id: '3', title: 'RAG 最佳实践 2024', views: '6.2k' },
];

export function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* Trending */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <h3 className="font-semibold text-sm">热门内容</h3>
        </div>
        <div className="space-y-3">
          {trendingPosts.map((post) => (
            <Link
              key={post.id}
              href={`/planet/${post.id}`}
              className="block group"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-1">
                {post.title}
              </p>
              <span className="text-xs text-gray-400">{post.views} 浏览</span>
            </Link>
          ))}
        </div>
      </div>

      {/* System posts */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold text-sm">系统内容</h3>
        </div>
        <div className="space-y-2">
          <Link href="/?source=system" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
            今日早报
          </Link>
          <Link href="/?source=system" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
            本周周刊
          </Link>
        </div>
      </div>
    </div>
  );
}
