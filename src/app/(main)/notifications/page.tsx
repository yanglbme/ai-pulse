'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NotificationItem } from '@/components/notifications/notification-item';
import type { Notification, Profile } from '@/lib/types/database';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<(Notification & { actor?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const supa = createClient() as any;
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return;

    const { data } = await supa
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const supa = supabase as any;
    await supa
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    const supabase = createClient();
    const supa = supabase as any;
    await supa
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-gray-900 dark:text-white" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            通知
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          <CheckCheck className="w-4 h-4 mr-1" />
          全部已读
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">加载中...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">暂无通知</div>
        ) : (
          notifications.map(n => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={() => markRead(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
