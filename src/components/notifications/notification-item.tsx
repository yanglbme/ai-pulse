'use client';

import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/time';
import type { Notification, Profile } from '@/lib/types/database';
import { Avatar } from '@/components/ui/avatar';
import { MessageCircle, Heart, Star, Bell as BellIcon } from 'lucide-react';
import Link from 'next/link';

const typeIcons = {
  comment: MessageCircle,
  reply: MessageCircle,
  like_post: Heart,
  like_comment: Heart,
  follow_topic: Star,
  system: BellIcon,
};

const typeColors = {
  comment: 'text-blue-500',
  reply: 'text-green-500',
  like_post: 'text-red-500',
  like_comment: 'text-red-500',
  follow_topic: 'text-yellow-500',
  system: 'text-gray-500',
};

interface NotificationItemProps {
  notification: Notification & { actor?: Profile };
  onRead: () => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || BellIcon;
  const color = typeColors[notification.type] || 'text-gray-500';

  return (
    <Link
      href={notification.post_id ? `/planet/${notification.post_id}` : '#'}
      onClick={onRead}
      className={cn(
        'flex gap-3 p-4 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 min-h-[44px]',
        !notification.is_read && 'bg-blue-50/50 dark:bg-blue-900/10'
      )}
    >
      <div className="flex-shrink-0 mt-1">
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <Avatar src={notification.actor?.avatar_url} name={notification.actor?.display_name} size="xs" />
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-medium">{notification.actor?.display_name || '系统'}</span>
              {' '}{notification.title}
            </p>
            {notification.body && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {notification.body}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {formatRelativeTime(notification.created_at)}
            </p>
          </div>
        </div>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
      )}
    </Link>
  );
}
