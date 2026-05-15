# AI Pulse — Developer Guide

This project is a content community platform for AI engineers, built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## Architecture

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 6
- **Database/Auth**: Supabase (PostgreSQL + RLS + Realtime)
- **Styling**: Tailwind CSS 4 with next-themes for dark/light mode
- **State**: Client components use `useState` + hooks; server components use RSC
- **Real-time**: Supabase Realtime subscriptions for comments and notifications

## Key Conventions

### File Structure
- `src/app/` — Routes using Next.js App Router conventions
- `src/app/(auth)/` — Auth-related routes (login, callback)
- `src/app/(main)/` — Main application routes (grouped by layout)
- `src/components/` — Shared React components
- `src/lib/` — Utilities, hooks, type definitions, Supabase clients
- `src/types/` — Next.js type helpers (PageProps, RouteContext)

### Naming
- Components: PascalCase (`PostCard`, `CommentInput`)
- Files: kebab-case (`post-card.tsx`, `use-auth.ts`)
- Routes: match URL paths (`/planet/[id]/page.tsx`)

### Supabase Integration
- **Browser client**: `src/lib/supabase/client.ts` — use in `'use client'` components
- **Server client**: `src/lib/supabase/server.ts` — use in Server Components and Route Handlers
- **Proxy**: `src/proxy.ts` — handles Supabase session cookies for every request (Next.js 16 convention, replaces middleware.ts)
- All Supabase queries that involve relational joins should use `as any` type casting due to limitations in auto-generated types

### Authentication
- OAuth flow: GitHub / Google via Supabase Auth
- `useAuth()` hook manages user state and profile loading
- Profile auto-created via database trigger on first login

### Time Handling
- All dates displayed in **Beijing Time (UTC+8)**
- Relative times (`formatRelativeTime`) use raw UTC timestamps (timezone-agnostic)
- Absolute times (`formatFullDate`, `formatDate`) use `Intl.DateTimeFormat` with `timeZone: 'Asia/Shanghai'`

### TypeScript
- Strict mode enabled
- `skipLibCheck: true` to suppress node_modules type errors
- Route handlers use `RouteContext` for params typing
- Server components use `PageProps<'route'>` for type-safe async params

## Common Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
```

## Deployment

- Push to `main` branch triggers Vercel auto-deploy
- Docker: `docker compose up -d --build`
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`

## Database

Migration file: `supabase/migrations/001_initial_schema.sql`

Core tables: `profiles`, `topics`, `user_topics`, `tags`, `posts`, `post_topics`, `post_tags`, `comments`, `likes`, `bookmarks`, `notifications`

RLS policies are enabled on all tables. Database triggers handle:
- Auto profile creation on signup
- Auto notification on comment/reply
- Auto count updates for likes and comments
