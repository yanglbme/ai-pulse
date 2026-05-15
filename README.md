# AI Pulse

> AI 技术人员内容社区

基于 Next.js 16 (App Router)、TypeScript、Tailwind CSS 和 Supabase 构建的 AI 技术内容分享平台。

## 核心特性

- **星球内容流**：用户发布与系统早报/周刊统一展示，支持按话题/标签过滤
- **话题系统**：预设 AI、LLM、Agent、RAG 等话题，用户可关注/取关
- **评论与互动**：嵌套评论、回复、点赞、收藏，支持 Supabase Realtime 实时更新
- **OAuth 登录**：支持 GitHub / Google 账号一键登录
- **深色/浅色模式**：自动检测系统偏好，支持手动切换并持久化
- **响应式设计**：完美适配桌面、平板、手机三端
- **Markdown 渲染**：正文支持 Markdown 语法及代码高亮
- **通知中心**：评论/回复实时推送，未读计数提醒

## 技术栈

- **前端**：Next.js 16 (App Router) + React 19 + TypeScript 6
- **样式**：Tailwind CSS 4 + next-themes + lucide-react
- **后端/数据库**：Supabase (Auth + PostgreSQL + Realtime)
- **构建**：Turbopack

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yanglbme/ai-pulse.git
cd ai-pulse
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 初始化数据库

在 Supabase 控制台执行 `supabase/migrations/001_initial_schema.sql`，该脚本会创建：
- 用户表、话题表、标签表、帖子表、评论表
- 点赞表、收藏表、通知表及其关联中间表
- RLS 安全策略
- 自动创建 Profile、通知触发器
- 开启 Realtime 监听

### 5. 配置 OAuth

在 Supabase Dashboard > Authentication > Providers 中：
1. 启用 GitHub 和/或 Google Provider
2. 填写对应的 Client ID 和 Client Secret
3. 在 URL Configuration 中设置 Site URL 和 Redirect URLs：
   - `http://localhost:3000` (开发)
   - `https://你的域名.com` (生产)

### 6. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                  # 根布局 + ThemeProvider
│   ├── globals.css                 # Tailwind + 主题变量
│   ├── proxy.ts                    # Supabase Session Proxy (Next.js 16)
│   ├── (auth)/                     # 认证路由
│   │   └── login/page.tsx
│   ├── auth/callback/route.ts      # OAuth 回调
│   └── (main)/                     # 主应用路由
│       ├── page.tsx                # 星球首页
│       ├── planet/[id]/page.tsx    # 内容详情
│       ├── planet/new/page.tsx     # 发布内容
│       ├── topics/page.tsx         # 话题列表
│       ├── topics/[slug]/page.tsx  # 话题内容流
│       ├── notifications/page.tsx  # 通知中心
│       ├── bookmarks/page.tsx      # 我的收藏
│       └── profile/[username]/page.tsx # 用户主页
├── api/                            # Route Handlers
├── components/
│   ├── ui/                         # Button, Input, Avatar, Badge 等
│   ├── layout/                     # Navbar, Sidebar, MobileNav
│   ├── planet/                     # PostCard, PostEditor, PostActionBar
│   ├── comments/                   # CommentList, CommentInput
│   ├── notifications/              # NotificationBell
│   └── common/                     # ThemeToggle, MarkdownRenderer
├── lib/
│   ├── supabase/                   # Client, Server, Proxy helpers
│   ├── hooks/                      # useAuth
│   ├── types/                      # 数据库类型定义
│   └── utils/                      # 时间格式化, cn 工具
└── types/                          # Next.js 路由类型助手
```

## 部署

### Vercel

1. 连接 GitHub 仓库
2. 设置环境变量
3. Deploy — 每次 push 自动重新部署

### Docker

```bash
docker compose up -d --build
```

## License

MIT
