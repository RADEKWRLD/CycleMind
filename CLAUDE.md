# AI-SDLC 项目约定

## 技术栈
- **框架**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **数据库**: Neon PostgreSQL + Drizzle ORM
- **认证**: Auth.js v5 (NextAuth beta) — 邮箱密码 + GitHub OAuth
- **AI**: DeepSeek API (兼容 OpenAI SDK, baseURL: https://api.deepseek.com)
- **状态管理**: Zustand
- **Mermaid 渲染**: mermaid.js 客户端渲染 (需 dynamic import, ssr: false)
- **部署**: Vercel

## 项目结构 (无 src 目录)
```
app/          → Next.js 页面和 API 路由
lib/          → 核心逻辑 (db/, auth/, ai/, utils, validations)
lib/ai/agents/ → 多 Sub-Agent (orchestrator, requirement, design, er, api, plan)
components/   → React 组件 (ui/, layout/, workspace/, session/, auth/, profile/)
stores/       → Zustand stores
types/        → TypeScript 类型
drizzle/      → 数据库迁移文件
```

## 关键约定
- Server Components 优先; 仅交互组件用 "use client"
- API 路由统一: auth() 认证 → Zod 校验 → 鉴权 → 业务逻辑
- 数据库查询封装在 `lib/db/queries/` 下
- 文档版本 append-only (不覆盖, 只新增版本)
- Mermaid 组件必须客户端渲染 (useEffect + dynamic import)

## 常用命令
```bash
pnpm dev          # 启动开发服务器 (turbopack)
pnpm build        # 构建
pnpm db:generate  # 生成数据库迁移
pnpm db:push      # 推送 schema 到数据库
pnpm db:studio    # Drizzle Studio GUI
```

## 环境变量
复制 `.env.example` 为 `.env.local`, 填入:
- `DATABASE_URL` — Neon 连接串
- `NEXTAUTH_SECRET` — Auth 密钥
- `DEEPSEEK_API_KEY` — DeepSeek API Key
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth (可选)
