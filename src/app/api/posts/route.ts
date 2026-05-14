import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');
    const topic = searchParams.get('topic');
    const source = searchParams.get('source');
    const q = searchParams.get('q');

    let query: any = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url),
        topics:post_topics(topics:topics(id, name, slug)),
        tags:post_tags(tags:tags(id, name, slug))
      `)
      .order('published_at', { ascending: false })
      .limit(20);

    if (cursor) {
      query = query.lt('published_at', cursor);
    }
    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    // Filter by topic if specified
    let filteredPosts = posts;
    if (topic) {
      filteredPosts = posts?.filter((post: any) =>
        post.topics?.some((pt: any) => pt.topics?.slug === topic)
      );
    }

    // Flatten data
    const formatted = (filteredPosts || []).map((post: any) => ({
      ...post,
      author: Array.isArray(post.author) ? post.author[0] : post.author,
      topics: (post.topics || []).map((pt: any) => pt.topics).filter(Boolean),
      tags: (post.tags || []).map((pt: any) => pt.tags).filter(Boolean),
      is_liked: false,
      is_bookmarked: false,
    }));

    // Get user likes/bookmarks
    const { data: { user } } = await supabase.auth.getUser();
    if (user && formatted.length > 0) {
      const postIds = formatted.map((p: any) => p.id);

      const [likesResult, bookmarksResult] = await Promise.all([
        supabase.from('likes').select('post_id').in('post_id', postIds).eq('user_id', user.id) as unknown as Promise<any>,
        supabase.from('bookmarks').select('post_id').in('post_id', postIds).eq('user_id', user.id) as unknown as Promise<any>,
      ]);

      const likes = likesResult?.data;
      const bookmarks = bookmarksResult?.data;

      const likedIds = new Set((likes || []).map((l: any) => l.post_id));
      const bookmarkedIds = new Set((bookmarks || []).map((b: any) => b.post_id));

      formatted.forEach((post: any) => {
        post.is_liked = likedIds.has(post.id);
        post.is_bookmarked = bookmarkedIds.has(post.id);
      });
    }

    const nextCursor = filteredPosts?.length === limit
      ? filteredPosts[filteredPosts.length - 1].published_at
      : undefined;

    return NextResponse.json({
      data: formatted,
      next_cursor: nextCursor,
      has_more: filteredPosts?.length === limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supa = await createClient() as any;
    const { data: { user } } = await supa.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, summary, content, topics, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create post
    const { data: post, error: postError } = await supa
      .from('posts')
      .insert({
        author_id: user.id,
        title: title.trim(),
        summary: summary?.trim() || title.trim().slice(0, 100),
        content,
        source: 'user',
      })
      .select()
      .single();

    if (postError) throw postError;

    // Link topics
    if (topics?.length > 0) {
      const topicRecords = topics.map((slug: string) => ({
        post_id: post.id,
        topic_id: slug,
      }));
      await supa.from('post_topics').insert(topicRecords);
    }

    // Create/link tags
    for (const tagName of (tags || [])) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      await supa.from('tags').upsert(
        { name: tagName, slug },
        { onConflict: 'slug' }
      );

      const { data: tagData } = await supa
        .from('tags')
        .select('id')
        .eq('slug', slug)
        .single();

      if (tagData) {
        await supa.from('post_tags').insert({
          post_id: post.id,
          tag_id: tagData.id,
        });
      }
    }

    return NextResponse.json({ data: post });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}
