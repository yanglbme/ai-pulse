// Generated types matching the Supabase schema

export type PostSource = 'user' | 'system';
export type NotificationType = 'comment' | 'reply' | 'like_post' | 'like_comment' | 'follow_topic' | 'system';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  follower_count: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string | null;
  source: PostSource;
  title: string;
  summary: string;
  content: string;
  cover_image: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export interface PostWithMeta extends Post {
  author: Profile;
  topics: Topic[];
  tags: Tag[];
  is_liked: boolean;
  is_bookmarked: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string | null;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  post_id: string | null;
  comment_id: string | null;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
  post?: Post;
}

export interface UserTopic {
  id: string;
  user_id: string;
  topic_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  next_cursor?: string;
  has_more?: boolean;
}

export interface PostFilter {
  cursor?: string;
  limit?: number;
  topic?: string;
  tag?: string;
  author?: string;
  source?: PostSource;
  q?: string;
}
