-- ============================================================
-- AI Community Platform — Initial Database Schema
-- Supabase / PostgreSQL
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type post_source as enum ('user', 'system');
create type notification_type as enum (
  'comment',
  'reply',
  'like_post',
  'like_comment',
  'follow_topic',
  'system'
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text,
  avatar_url      text,
  bio             text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_profiles_username on profiles(username);

alter table profiles enable row level security;
create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_owner_update" on profiles for update using (auth.uid() = id);
create policy "profiles_owner_insert" on profiles for insert with check (auth.uid() = id);

-- ============================================================
-- TOPICS
-- ============================================================
create table topics (
  id              uuid primary key default gen_random_uuid(),
  name            text unique not null,
  slug            text unique not null,
  description     text,
  icon            text,
  follower_count  int default 0,
  created_at      timestamptz default now()
);

create index idx_topics_slug on topics(slug);

alter table topics enable row level security;
create policy "topics_public_read" on topics for select using (true);

-- Seed data
insert into topics (name, slug, description) values
  ('AI',             'ai',               '人工智能前沿技术与应用'),
  ('机器学习',        'machine-learning',  '机器学习算法与模型'),
  ('LLM',            'llm',               '大语言模型相关'),
  ('Agent',          'agent',             '智能体与自动化'),
  ('RAG',            'rag',               '检索增强生成'),
  ('MLOps',          'mlops',             '机器学习运维'),
  ('开源',            'open-source',       '开源项目与社区'),
  ('深度学习',        'deep-learning',     '神经网络与深度学习'),
  ('计算机视觉',      'computer-vision',   'CV 技术与应用'),
  ('自然语言处理',    'nlp',               'NLP 技术与应用')
on conflict (slug) do nothing;

-- ============================================================
-- USER_TOPICS (follow relationships)
-- ============================================================
create table user_topics (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  topic_id        uuid references topics(id) on delete cascade,
  created_at      timestamptz default now(),
  unique(user_id, topic_id)
);

create index idx_user_topics_user on user_topics(user_id);
create index idx_user_topics_topic on user_topics(topic_id);

alter table user_topics enable row level security;
create policy "user_topics_owner_all" on user_topics for all
  using (auth.uid() = user_id);

-- ============================================================
-- TAGS
-- ============================================================
create table tags (
  id              uuid primary key default gen_random_uuid(),
  name            text unique not null,
  slug            text unique not null,
  usage_count     int default 0,
  created_at      timestamptz default now()
);

create index idx_tags_slug on tags(slug);

alter table tags enable row level security;
create policy "tags_public_read" on tags for select using (true);

-- ============================================================
-- POSTS (星球内容)
-- ============================================================
create table posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references profiles(id) on delete set null,
  source          post_source not null default 'user',
  title           text not null,
  summary         text not null,
  content         text not null,
  cover_image     text,
  view_count      int default 0,
  like_count      int default 0,
  comment_count   int default 0,
  bookmark_count  int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  published_at    timestamptz default now()
);

create index idx_posts_author    on posts(author_id);
create index idx_posts_source    on posts(source);
create index idx_posts_published on posts(published_at desc);
create index idx_posts_created   on posts(created_at desc);

alter table posts enable row level security;
create policy "posts_public_read" on posts for select using (true);
create policy "posts_owner_insert" on posts for insert
  with check (auth.uid() = author_id);
create policy "posts_owner_update" on posts for update
  using (auth.uid() = author_id);
create policy "posts_owner_delete" on posts for delete
  using (auth.uid() = author_id);

-- ============================================================
-- POST_TOPICS (many-to-many)
-- ============================================================
create table post_topics (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid references posts(id) on delete cascade,
  topic_id        uuid references topics(id) on delete cascade,
  unique(post_id, topic_id)
);

create index idx_post_topics_post   on post_topics(post_id);
create index idx_post_topics_topic  on post_topics(topic_id);

alter table post_topics enable row level security;
create policy "post_topics_public_read" on post_topics for select using (true);

-- ============================================================
-- POST_TAGS (many-to-many)
-- ============================================================
create table post_tags (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid references posts(id) on delete cascade,
  tag_id          uuid references tags(id) on delete cascade,
  unique(post_id, tag_id)
);

create index idx_post_tags_post   on post_tags(post_id);
create index idx_post_tags_tag    on post_tags(tag_id);

alter table post_tags enable row level security;
create policy "post_tags_public_read" on post_tags for select using (true);

-- ============================================================
-- COMMENTS
-- ============================================================
create table comments (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid references posts(id) on delete cascade,
  author_id       uuid references profiles(id) on delete set null,
  parent_id       uuid references comments(id) on delete cascade,
  content         text not null,
  like_count      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_comments_post     on comments(post_id);
create index idx_comments_author   on comments(author_id);
create index idx_comments_parent   on comments(parent_id);
create index idx_comments_created  on comments(created_at desc);

alter table comments enable row level security;
create policy "comments_public_read" on comments for select using (true);
create policy "comments_owner_insert" on comments for insert
  with check (auth.uid() = author_id);
create policy "comments_owner_update" on comments for update
  using (auth.uid() = author_id);
create policy "comments_owner_delete" on comments for delete
  using (auth.uid() = author_id);

-- ============================================================
-- LIKES (for posts and comments)
-- ============================================================
create table likes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  post_id         uuid references posts(id) on delete cascade,
  comment_id      uuid references comments(id) on delete cascade,
  created_at      timestamptz default now(),
  unique(user_id, post_id, comment_id),
  check (
    (post_id is not null and comment_id is null)
    or
    (post_id is null and comment_id is not null)
  )
);

create index idx_likes_user     on likes(user_id);
create index idx_likes_post     on likes(post_id);
create index idx_likes_comment  on likes(comment_id);

alter table likes enable row level security;
create policy "likes_owner_all" on likes for all
  using (auth.uid() = user_id);

-- ============================================================
-- BOOKMARKS
-- ============================================================
create table bookmarks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  post_id         uuid references posts(id) on delete cascade,
  created_at      timestamptz default now(),
  unique(user_id, post_id)
);

create index idx_bookmarks_user   on bookmarks(user_id);
create index idx_bookmarks_post   on bookmarks(post_id);

alter table bookmarks enable row level security;
create policy "bookmarks_owner_all" on bookmarks for all
  using (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  type            notification_type not null,
  title           text not null,
  body            text,
  post_id         uuid references posts(id) on delete set null,
  comment_id      uuid references comments(id) on delete set null,
  actor_id        uuid references profiles(id) on delete set null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

create index idx_notifications_user     on notifications(user_id);
create index idx_notifications_unread   on notifications(user_id, is_read)
  where is_read = false;
create index idx_notifications_created  on notifications(created_at desc);

alter table notifications enable row level security;
create policy "notifications_owner_all" on notifications for all
  using (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username'
    ),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update comment_count on posts
create or replace function public.update_post_comment_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on comments
  for each row execute procedure public.update_post_comment_count();

-- Update like_count on posts
create or replace function public.update_post_like_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_post_like_change
  after insert or delete on likes
  for each row execute procedure public.update_post_like_count();

-- Auto-create notification on comment
create or replace function public.notify_on_comment()
returns trigger as $$
declare
  post_author uuid;
begin
  select author_id into post_author from posts where id = new.post_id;

  -- Don't notify self
  if post_author != new.author_id then
    insert into notifications (user_id, type, title, body, post_id, comment_id, actor_id)
    values (
      post_author,
      'comment'::notification_type,
      '有人评论了你的内容',
      left(new.content, 200),
      new.post_id,
      new.id,
      new.author_id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_comment_inserted
  after insert on comments
  for each row execute procedure notify_on_comment();

-- Auto-create notification on reply
create or replace function public.notify_on_reply()
returns trigger as $$
declare
  parent_author uuid;
begin
  if new.parent_id is not null then
    select author_id into parent_author from comments where id = new.parent_id;

    if parent_author != new.author_id then
      insert into notifications (user_id, type, title, body, post_id, comment_id, actor_id)
      values (
        parent_author,
        'reply'::notification_type,
        '有人回复了你的评论',
        left(new.content, 200),
        new.post_id,
        new.id,
        new.author_id
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_reply_inserted
  after insert on comments
  for each row execute procedure notify_on_reply();

-- Enable realtime for key tables
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table likes;
alter publication supabase_realtime add table bookmarks;
