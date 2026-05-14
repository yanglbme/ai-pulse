'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bookmark, TrendingUp, Hash } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: '星球' },
  { href: '/topics', icon: Compass, label: '话题' },
  { href: '/bookmarks', icon: Bookmark, label: '收藏' },
];

const suggestedTopics = [
  { slug: 'ai', name: 'AI' },
  { slug: 'llm', name: 'LLM' },
  { slug: 'agent', name: 'Agent' },
  { slug: 'rag', name: 'RAG' },
  { slug: 'machine-learning', name: '机器学习' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Main nav */}
      <nav className="space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Suggested topics */}
      <div>
        <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          推荐话题
        </h3>
        <div className="space-y-0.5">
          {suggestedTopics.map(({ slug, name }) => (
            <Link
              key={slug}
              href={`/topics/${slug}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Hash className="w-3.5 h-3.5" />
              {name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
