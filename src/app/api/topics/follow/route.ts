import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supa = await createClient() as any;
    const { data: { user } } = await supa.auth.getUser();

    if (!user) {
      return NextResponse.json({ data: [] });
    }

    const { data, error } = await supa
      .from('user_topics')
      .select(`
        topic_id,
        topics(id, name, slug, description, follower_count)
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      data: data?.map((d: any) => d.topics) || []
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followed topics' },
      { status: 500 }
    );
  }
}
