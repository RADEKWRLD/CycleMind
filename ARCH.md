# CycleMind — AI 驱动的软件设计自动化平台

## 1. 项目概述

CycleMind（AI-SDLC）是一个基于 AI 的软件生命周期辅助系统，用户输入自然语言需求后，系统通过多 Agent 并行协作，自动生成五类设计产物：

| 产物 | Agent | 存储类型 | 格式 |
|------|-------|----------|------|
| 架构图 | design | `mermaid` / `architecture` | Mermaid graph TD |
| ER 图 | er | `mermaid` / `er` | Mermaid erDiagram |
| 需求分析 | requirement | `arch_design` | Markdown |
| API 规范 | api | `api_spec` | Markdown |
| 发展计划 | plan | `dev_plan` | Markdown |

---

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 语言 | TypeScript, React 19 |
| 样式 | Tailwind CSS v4, GSAP 动画 |
| 数据库 | Neon PostgreSQL + Drizzle ORM |
| 认证 | Auth.js v5 (Credentials + GitHub OAuth), JWT |
| AI | DeepSeek API (OpenAI SDK 兼容) |
| 状态管理 | Zustand |
| 图表渲染 | Mermaid.js (客户端 dynamic import) |
| Markdown | react-markdown + Shiki 语法高亮 |
| 部署 | Vercel |

---

## 3. 系统架构

```
┌────────────────────────────────────────────────────┐
│                   Frontend (Next.js)               │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ ChatPanel │  │ PreviewPanel │  │   Sidebar    │ │
│  │  (对话)   │  │ (5 Tab 预览)  │  │ (导航/模板)  │ │
│  └─────┬────┘  └──────┬───────┘  └──────────────┘ │
│        │ SSE           │ fetch                      │
└────────┼───────────────┼───────────────────────────┘
         │               │
         ▼               ▼
┌────────────────────────────────────────────────────┐
│                API Routes (Next.js)                │
│  POST /api/generate          ← SSE 流式响应        │
│  CRUD /api/sessions          ← 会话管理            │
│  CRUD /api/sessions/[id]/documents ← 文档 CRUD     │
│  CRUD /api/sessions/[id]/messages  ← 消息 CRUD     │
│  POST /api/register          ← 用户注册            │
│  GET  /api/user              ← 用户配置            │
│  GET  /api/templates         ← 模板列表            │
└─────────────────────┬──────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│              AI Agent Layer (DeepSeek)             │
│  ┌────────────┐                                    │
│  │Orchestrator│ ── 分析 prompt → 选择 Agent 组合   │
│  └─────┬──────┘                                    │
│        ├── RequirementAgent (需求结构化)            │
│        ├── DesignAgent      (架构图生成)            │
│        ├── ERAgent          (ER 图生成)             │
│        ├── APIAgent         (API 规范生成)          │
│        └── PlanAgent        (发展计划生成)          │
│        ↑ 并行执行, SSE 逐个回传                     │
└─────────────────────┬──────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│             Neon PostgreSQL (Drizzle ORM)          │
│  users · accounts · sessions · documents           │
│  messages · templates · auth_sessions              │
└────────────────────────────────────────────────────┘
```

---

## 4. 目录结构

```
app/
├── (auth)/login/           # 登录页
├── (auth)/register/        # 注册页
├── (dashboard)/dashboard/  # 项目列表
├── (dashboard)/session/[id]/ # 工作台主页面
├── (dashboard)/profile/    # 用户配置 (user.md)
├── api/generate/           # AI 生成 (SSE)
├── api/sessions/           # 会话 CRUD
├── api/sessions/[id]/documents/ # 文档 CRUD
├── api/sessions/[id]/messages/  # 消息 CRUD
├── api/register/           # 注册
├── api/user/               # 用户配置
├── api/templates/          # 模板
└── api/auth/[...nextauth]/ # Auth.js

lib/
├── ai/
│   ├── index.ts            # DeepSeek 客户端配置
│   ├── prompts.ts          # 所有 Agent 的 System Prompt
│   └── agents/
│       ├── orchestrator.ts # 编排器：分析 prompt → 选择 Agent
│       ├── requirement-agent.ts
│       ├── design-agent.ts
│       ├── er-agent.ts
│       ├── api-agent.ts
│       └── plan-agent.ts
├── auth/index.ts           # Auth.js 配置 (Credentials + GitHub)
├── db/
│   ├── index.ts            # Neon + Drizzle 连接
│   ├── schema.ts           # 表定义 + 枚举 + 关系
│   └── queries/            # 按实体封装的查询函数
│       ├── users.ts
│       ├── sessions.ts
│       ├── documents.ts
│       ├── messages.ts
│       └── templates.ts
└── validations.ts          # Zod 校验 schema

components/
├── ui/                     # 基础 UI (Button, Dialog, Avatar, etc.)
│   ├── markdown-renderer.tsx  # Markdown + Shiki 渲染
│   ├── message.tsx         # 消息气泡
│   ├── prompt-input.tsx    # 输入框
│   └── tool.tsx            # Agent 工具状态展示
├── layout/
│   ├── header.tsx          # 顶部栏
│   ├── sidebar.tsx         # 侧边导航
│   ├── sidebar-recent.tsx  # 最近项目列表
│   └── sidebar-templates.tsx # 模板选择弹窗
├── workspace/
│   ├── chat-panel.tsx      # 对话面板 (消息 + 思维链)
│   ├── preview-panel.tsx   # 预览面板 (5 Tab 切换)
│   ├── mermaid-renderer.tsx # Mermaid 渲染 (缩放/平移)
│   └── persisted-thinking-chain.tsx # Agent 执行元数据
└── dashboard/
    └── project-card.tsx    # 项目卡片

stores/
└── workspace-store.ts      # Zustand (activeTab, viewMode, sending/generating)

types/
└── index.ts                # TS 类型 + 枚举 (Document, Session, StreamStep, etc.)

middleware.ts               # Auth 路由保护
```

---

## 5. 数据模型

### 核心表

**sessions** — 项目会话

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| userId | uuid | FK → users |
| title | text | 项目标题 |
| description | text | 描述 |
| status | enum | active / archived / completed |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**documents** — 设计产物 (append-only 版本管理)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| sessionId | uuid | FK → sessions |
| type | enum | mermaid / api_spec / arch_design / dev_plan / markdown |
| diagramType | enum | architecture / er / flow / sequence / class / other |
| title | text | |
| content | text | Mermaid 代码或 Markdown |
| version | int | 递增版本号 |
| parentVersionId | uuid | FK → documents (上一版本) |
| createdAt | timestamp | |

**messages** — 对话消息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| sessionId | uuid | FK → sessions |
| role | enum | user / assistant / system |
| content | text | |
| metadata | jsonb | Agent 执行元数据 (steps, tools, generatedTypes) |
| createdAt | timestamp | |

**templates** — 提示词模板

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| name | text | 模板名 |
| description | text | |
| icon | text | Lucide 图标名 |
| prompt | text | 模板提示词 |
| isBuiltin | boolean | |

---

## 6. 核心流程

### 6.1 AI 生成流程 (`POST /api/generate`)

```
用户发送 prompt
      │
      ▼
Orchestrator 分析 → 返回 Agent 列表 (如 ["design", "er", "api"])
      │
      ▼
获取该 Session 下各类型的最新文档 (作为上下文)
      │
      ▼
并行启动所有 Agent ──────────────────────────────┐
      │                                           │
      │  每个 Agent 完成时:                        │
      │  1. SSE 推送 agent_output                  │
      │  2. createDocument() 存储                  │
      │  3. SSE 推送 doc_saved                     │
      │                                           │
      ▼                                           │
全部完成 → 保存 assistant 消息 (含 metadata) ◄────┘
      │
      ▼
SSE 推送 done → 前端刷新数据
```

### 6.2 文档版本管理

- **写入**: `createDocument()` 自动查询同类型最新版本，`version += 1`，设置 `parentVersionId`
- **读取**: 前端按 `type` + `diagramType` 分组，取最高版本展示
- **原则**: 只追加不覆盖，支持版本历史追溯

### 6.3 前端文档分组逻辑

```typescript
// page.tsx — 将 documents 按 Tab 分组
for (const doc of documents) {
  const key = doc.type === "mermaid"
    ? (doc.diagramType === "er" ? "er" : "mermaid")  // 按 diagramType 拆分
    : doc.type;
  grouped[key] = highestVersion(doc);
}
```

5 个 Tab: `mermaid`(架构图) | `er`(ER图) | `arch_design`(需求分析) | `api_spec`(API规范) | `dev_plan`(发展计划)

---

## 7. 认证与鉴权

- **认证**: Auth.js v5, JWT 策略
  - Credentials: 邮箱 + 密码 (bcryptjs 哈希)
  - GitHub OAuth (可选)
- **路由保护**: `middleware.ts` 拦截 `/dashboard`, `/session`, `/profile`
- **API 鉴权**: 每个 API 路由调用 `auth()` 获取 session，校验资源归属

---

## 8. 关键设计决策

| 决策 | 原因 |
|------|------|
| 只存 Mermaid 文本，不存图片 | 可 diff、可编辑、存储成本低、渲染交前端 |
| 文档 append-only | 完整审计追踪、支持回滚、避免覆盖 |
| Agent 并行执行 | 减少用户等待时间 |
| SSE 而非 WebSocket | 单向推送足够、实现简单、无状态 |
| Mermaid 客户端渲染 | 减轻服务端压力、支持交互 (缩放/平移) |
| DeepSeek + OpenAI SDK | 兼容性好、成本低、易切换模型 |
| metadata 存 JSONB | Agent 执行细节与消息绑定、灵活扩展 |
| user.md 个人配置 | AI Agent 可读取用户偏好作为上下文 |

---

## 9. 常用命令

```bash
pnpm dev            # 开发服务器 (Turbopack)
pnpm build          # 生产构建
pnpm db:generate    # 生成 Drizzle 迁移
pnpm db:push        # 推送 schema 到数据库
pnpm db:studio      # Drizzle Studio GUI
```

---

## 10. 环境变量

```
DATABASE_URL        — Neon PostgreSQL 连接串
NEXTAUTH_SECRET     — Auth.js 签名密钥
DEEPSEEK_API_KEY    — DeepSeek API Key
GITHUB_CLIENT_ID    — GitHub OAuth (可选)
GITHUB_CLIENT_SECRET — GitHub OAuth (可选)
```
