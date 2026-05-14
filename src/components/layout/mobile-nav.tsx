'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Bookmark, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const items = [
  { href: '/', icon: Home, label: '星球' },
  { href: '/topics', icon: Compass, label: '话题' },
  { href: '/planet/new', icon: Plus, label: '发布', center: true },
  { href: '/bookmarks', icon: Bookmark, label: '收藏' },
  { href: '/notifications', icon: Bell, label: '通知' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {items.map(({ href, icon: Icon, label, center }) => {
            const isActive = pathname === href;
            if (center) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white -mt-4 shadow-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-500">{label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-0.5">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
