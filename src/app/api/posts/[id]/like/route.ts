import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { RouteContext } from '@/types/route-context';

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supa = supabase as any;

    const { data: existing } = await supa
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .single();

    if (existing) {
      await supa.from('likes').delete().eq('id', existing.id);
      return NextResponse.json({ liked: false });
    } else {
      await supa.from('likes').insert({
        user_id: user.id,
        post_id: id,
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
