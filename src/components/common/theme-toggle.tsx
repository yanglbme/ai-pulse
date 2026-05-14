'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: 'light', icon: Sun, label: '浅色' },
    { key: 'dark', icon: Moon, label: '深色' },
    { key: 'system', icon: Monitor, label: '跟随系统' },
  ] as const;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            theme === key
              ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title={label}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
