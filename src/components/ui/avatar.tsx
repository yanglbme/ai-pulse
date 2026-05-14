import { cn } from '@/lib/utils/cn';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-2xl',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 overflow-hidden flex-shrink-0',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || ''} className="w-full h-full object-cover" />
      ) : (
        <>
          {initials && initials !== '??' ? (
            <span className="font-medium">{initials}</span>
          ) : (
            <User className="w-1/2 h-1/2" />
          )}
        </>
      )}
    </div>
  );
}
