'use client';

import { cn } from '@/lib/utils/cn';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const sourceFilters = [
  { key: 'all', label: '全部' },
  { key: 'user', label: '用户' },
  { key: 'system', label: '官方' },
];

export function PostFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSource = searchParams.get('source') || 'all';
  const currentTopic = searchParams.get('topic');

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
      {sourceFilters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setFilter('source', key)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[44px]',
            currentSource === key
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
          )}
        >
          {label}
        </button>
      ))}
      {currentTopic && (
        <span className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm">
          话题: {currentTopic}
          <button
            onClick={() => setFilter('topic', '')}
            className="ml-1 hover:text-red-500"
          >
            ×
          </button>
        </span>
      )}
    </div>
  );
}
