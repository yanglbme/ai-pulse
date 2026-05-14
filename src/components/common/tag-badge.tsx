import { cn } from '@/lib/utils/cn';
import type { Tag } from '@/lib/types/database';

export function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2.5 py-0.5 text-xs">
      #{tag.name}
    </span>
  );
}
