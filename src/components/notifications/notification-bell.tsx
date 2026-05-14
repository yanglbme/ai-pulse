'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const supa = createClient() as any;
      const { data: { user } } = await supa.auth.getUser();
      if (!user) return;

      const { count } = await supa
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    };

    fetchCount();

    // Real-time updates
    const supa = createClient() as any;
    const { data: { user } } = supa.auth.getUser();
    user.then(({ user }: { user: any }) => {
      if (user) {
        const channel = supa
          .channel(`notif-count-${user.id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            () => setUnreadCount(prev => prev + 1)
          )
          .subscribe();

        return () => { supa.removeChannel(channel); };
      }
    });
  }, []);

  return (
    <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px]">
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      {unreadCount > 0 && (
        <span className={cn(
          'absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-xs font-bold text-white',
          unreadCount > 9 ? 'bg-red-600 px-1' : 'bg-red-500'
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
