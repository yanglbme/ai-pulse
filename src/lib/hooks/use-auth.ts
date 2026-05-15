'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types/database';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single() as any;
    if (data) setProfile(data);
  }, []);

  const hydrateProfileFromUser = (u: User) => {
    const meta = u.user_metadata || {};
    return {
      id: u.id,
      username: meta.user_name || meta.preferred_username || u.email?.split('@')[0] || '',
      display_name: meta.full_name || meta.name || '',
      avatar_url: meta.avatar_url || meta.picture_url || '',
      bio: null,
      created_at: u.created_at || new Date().toISOString(),
      updated_at: u.updated_at || new Date().toISOString(),
    } as Profile;
  };

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // 立即用 Session 中的 metadata 显示头像，避免闪烁
        setProfile(hydrateProfileFromUser(session.user));
        // 后台异步拉取数据库中的完整资料
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setProfile(hydrateProfileFromUser(session.user));
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return { user, profile, loading, signOut };
}
