# CycleMind

**智能软件生命周期辅助系统** — 基于 AI 多 Agent 架构，将自然语言需求自动转化为结构化设计文档（架构图、ER 图、API 规范、开发计划），并支持版本追踪与持续演化。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **数据库**: Neon PostgreSQL + Drizzle ORM
- **认证**: Auth.js v5 (邮箱密码 + GitHub OAuth)
- **AI**: DeepSeek API (兼容 OpenAI SDK)
- **状态管理**: Zustand
- **图表渲染**: Mermaid.js (客户端渲染)
- **部署**: Vercel

## 项目结构

```
app/              → Next.js 页面和 API 路由
lib/              → 核心逻辑
  ├── db/         → 数据库 schema、queries
  ├── auth/       → 认证配置
  ├── ai/agents/  → 多 Sub-Agent (orchestrator, requirement, design, er, api, plan)
  ├── validations.ts → Zod 校验 schema
  └── utils.ts    → 工具函数
components/       → React 组件
  ├── ui/         → shadcn/ui 基础组件
  ├── layout/     → 布局组件
  ├── workspace/  → 工作区组件 (聊天、Mermaid 预览、编辑器)
  ├── session/    → 会话相关组件
  └── auth/       → 认证组件
stores/           → Zustand stores
types/            → TypeScript 类型定义
drizzle/          → 数据库迁移文件
```

## 快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入以下变量：
#   DATABASE_URL       — Neon PostgreSQL 连接串
#   NEXTAUTH_SECRET    — Auth 密钥
#   DEEPSEEK_API_KEY   — DeepSeek API Key
#   GITHUB_CLIENT_ID   — GitHub OAuth (可选)
#   GITHUB_CLIENT_SECRET

# 3. 推送数据库 schema
pnpm db:push

# 4. 启动开发服务器
pnpm dev
```

## 常用命令


| 命令               | 说明                       |
| ------------------ | -------------------------- |
| `pnpm dev`         | 启动开发服务器 (Turbopack) |
| `pnpm build`       | 生产构建                   |
| `pnpm db:generate` | 生成数据库迁移             |
| `pnpm db:push`     | 推送 schema 到数据库       |
| `pnpm db:studio`   | Drizzle Studio GUI         |

## API 接口概览

所有接口（除注册外）均需认证。详细请求/响应格式见 [ARCH.md](ARCH.md#api-接口详细规范)。


| 方法     | 路径                           | 说明                      |
| -------- | ------------------------------ | ------------------------- |
| POST     | `/api/register`                | 用户注册                  |
| GET/POST | `/api/auth/[...nextauth]`      | Auth.js 认证              |
| GET      | `/api/user`                    | 获取用户信息              |
| PATCH    | `/api/user`                    | 更新用户信息              |
| GET      | `/api/sessions`                | 会话列表                  |
| POST     | `/api/sessions`                | 创建会话                  |
| GET      | `/api/sessions/[id]`           | 会话详情                  |
| PATCH    | `/api/sessions/[id]`           | 更新会话                  |
| DELETE   | `/api/sessions/[id]`           | 删除会话                  |
| GET      | `/api/sessions/[id]/messages`  | 获取消息列表              |
| POST     | `/api/sessions/[id]/messages`  | 发送消息                  |
| GET      | `/api/sessions/[id]/documents` | 获取文档列表              |
| POST     | `/api/sessions/[id]/documents` | 创建文档                  |
| GET      | `/api/templates`               | 获取模板列表              |
| POST     | `/api/generate`                | AI 多 Agent 生成 (SSE 流) |
