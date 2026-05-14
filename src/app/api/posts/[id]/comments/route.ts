import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { RouteContext } from '@/types/route-context';

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const supa = await createClient() as any;

    const { data, error } = await supa
      .from('comments')
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url)
      `)
      .eq('post_id', id)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const supa = await createClient() as any;
    const { data: { user } } = await supa.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, parent_id } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supa
      .from('comments')
      .insert({
        post_id: id,
        author_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}
