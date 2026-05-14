import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { Topic } from '@/lib/types/database';

export function TopicBadge({ topic, size = 'sm' }: { topic: Topic; size?: 'sm' | 'md' }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={cn(
        'inline-flex items-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {topic.name}
    </Link>
  );
}
