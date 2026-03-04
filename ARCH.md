# AI-SDLC：智能软件生命周期辅助系统

## Architecture Design & Requirement Specification (v2.0 - 已实现)

---

# 1. 项目概述

## 1.1 项目背景

在实际软件开发过程中：

* 需求往往是自然语言描述
* 结构图（架构图 / ER 图 / 流程图）需要人工绘制
* 需求变更后图难以维护
* 设计文档与实际系统脱节

本系统目标是：

> 将自然语言需求自动结构化，并生成可持续演化的 Mermaid 设计图。

---

## 1.2 项目目标

构建一个基于 AI 的需求拆解与设计生成平台，实现：

* 需求 → 模块拆解
* 模块 → 架构图生成
* 数据实体 → ER 图生成
* 需求变更 → 自动更新图结构
* 版本对比与演化追踪

---

# 2. 系统总体架构（ARCH）

## 2.1 总体架构图

```
┌──────────────────────────────────┐
│          Frontend (Next.js 16)   │
│  Tailwind CSS + Mermaid.js       │
│  Zustand 状态管理                │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│     Auth Layer (Auth.js v5)      │
│  邮箱密码 + GitHub OAuth + JWT   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│     Backend API (Route Handlers) │
│  - Sessions CRUD                 │
│  - Documents 版本管理            │
│  - Messages 聊天记录             │
│  - User 资料 (user.md)           │
│  - Generate 生成入口             │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   AI Multi-Agent Layer (DeepSeek)│
│  Orchestrator → 编排决策         │
│  ├→ RequirementAgent (需求解析)  │
│  ├→ DesignAgent (架构图生成)     │
│  ├→ ERAgent (ER 图生成)          │
│  ├→ APIAgent (接口规范)          │
│  └→ PlanAgent (发展计划)         │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│      Database (Neon PostgreSQL)  │
│  Drizzle ORM                     │
│  - users (含 user_md)            │
│  - sessions                      │
│  - documents (版本追踪)          │
│  - messages                      │
└──────────────────────────────────┘
```

---

## 2.2 架构分层说明

### 1️⃣ 表现层（Presentation Layer）

技术：

* Next.js 16 (App Router, TypeScript)
* Tailwind CSS v4 + shadcn/ui 组件
* Mermaid.js 客户端渲染 (dynamic import, ssr: false)
* Zustand 状态管理
* react-resizable-panels 分栏布局

职责：

* 落地页、登录/注册
* Dashboard (项目列表)
* Session 工作区 (聊天 + Mermaid 预览 + Markdown 编辑)
* 用户资料 (user.md 编辑器)

---

### 2️⃣ 业务层（Application Layer）

职责：

* 管理 Session
* 管理版本
* 控制生成流程
* 调用 AI 接口

核心接口（已实现）：

* GET/POST /api/sessions — 会话列表 / 创建
* GET/PATCH/DELETE /api/sessions/[id] — 会话详情
* GET/POST /api/sessions/[id]/documents — 文档版本管理
* GET/POST /api/sessions/[id]/messages — 聊天记录
* POST /api/generate — AI 多 Agent 生成入口
* GET/PATCH /api/user — 用户资料 / user.md
* POST /api/register — 邮箱密码注册
* GET/POST /api/auth/[...nextauth] — Auth.js 认证

---

### 3️⃣ AI 处理层（Multi-Agent Layer）

模型：DeepSeek API（兼容 OpenAI SDK，价格极低）

多 Sub-Agent 架构（已实现）：

```
用户输入需求
    ↓
Orchestrator（编排器）— 分析意图，决定调用哪些 Agent
    ├→ RequirementAgent: 需求结构化解析 → Markdown
    ├→ DesignAgent: 系统架构图 (graph TD) → Mermaid
    ├→ ERAgent: ER 图 (erDiagram) → Mermaid
    ├→ APIAgent: 接口规范文档 → Markdown
    └→ PlanAgent: 发展计划 → Markdown
    ↓
并行执行 → 结果聚合 → 存入 documents 表（版本追踪）
```

每个 Agent 拥有专用 system prompt，Orchestrator 根据用户意图智能决策调用组合。

---

### 4️⃣ 数据层（Persistence Layer）

数据库：Neon PostgreSQL + Drizzle ORM

**users**

| 字段           | 类型      | 说明                     |
| -------------- | --------- | ------------------------ |
| id             | uuid      | 主键                     |
| name           | text      | 用户名                   |
| email          | text      | 邮箱 (唯一)              |
| password\_hash | text      | 密码哈希                 |
| user\_md       | text      | 用户个人文档 (user.md)   |
| preferences    | jsonb     | 偏好设置                 |
| created\_at    | timestamp | 创建时间                 |

**sessions**

| 字段        | 类型      | 说明                           |
| ----------- | --------- | ------------------------------ |
| id          | uuid      | 主键                           |
| user\_id    | uuid      | 外键 → users                   |
| title       | text      | 项目标题                       |
| description | text      | 初始需求                       |
| status      | enum      | active / archived / completed  |
| created\_at | timestamp | 创建时间                       |

**documents** (统一文档表，版本 append-only)

| 字段               | 类型      | 说明                                        |
| ------------------ | --------- | ------------------------------------------- |
| id                 | uuid      | 主键                                        |
| session\_id        | uuid      | 外键 → sessions                             |
| type               | enum      | mermaid / api\_spec / arch\_design / dev\_plan |
| diagram\_type      | enum      | architecture / er / flow / sequence (仅 mermaid) |
| content            | text      | Mermaid 代码或 Markdown 内容                |
| version            | int       | 版本号（只增不减）                          |
| parent\_version\_id| uuid      | 上一版本 ID                                 |
| created\_at        | timestamp | 创建时间                                    |

**messages**

| 字段        | 类型      | 说明                   |
| ----------- | --------- | ---------------------- |
| id          | uuid      | 主键                   |
| session\_id | uuid      | 外键 → sessions        |
| role        | enum      | user / assistant / system |
| content     | text      | 对话内容               |
| metadata    | jsonb     | 元数据（生成的 agent 等）|
| created\_at | timestamp | 时间                   |

---

# 3. 功能需求说明（FR）

## FR1 需求输入

系统应支持用户输入自然语言需求。

---

## FR2 自动生成架构图

系统应根据需求生成：

* 系统架构图（graph TD）
* 模块依赖关系

---

## FR3 自动生成 ER 图

系统应从需求中识别实体并生成：

```
erDiagram
```

---

## FR4 版本管理

系统应：

* 为每次生成保存版本
* 支持查看历史版本
* 支持版本对比

---

## FR5 图自动更新

当用户补充需求时：

* 基于旧图生成新图
* 保持结构一致性

---

# 4. 非功能需求（NFR）

## NFR1 可维护性

系统采用分层架构设计，支持模块扩展。

---

## NFR2 可扩展性

应支持：

* 多种图类型
* 多模型接入
* 本地与云模型切换

---

## NFR3 性能要求

* 单次图生成时间 ≤ 5 秒
* 页面渲染时间 ≤ 1 秒

---

## NFR4 数据一致性

* 每个 Session 独立
* 图版本不可覆盖，只追加

---

# 5. 关键设计决策

## 5.1 为什么只存 Mermaid 文本？

* 可读性强
* 易做 diff
* 渲染交给前端
* 存储成本低

---

## 5.2 为什么一个 Session 对应一个需求？

* 逻辑清晰
* 便于版本演化
* 简化状态管理

---

## 5.3 多 Agent 架构（已实现）

已实现 5 个专用 Agent + 1 个编排器：

* **Orchestrator**: 分析用户意图，决定调用哪些 Agent
* **RequirementAgent**: 需求结构化解析
* **DesignAgent**: 系统架构图 (Mermaid graph TD) 生成
* **ERAgent**: ER 图 (Mermaid erDiagram) 生成
* **APIAgent**: RESTful API 接口规范文档生成
* **PlanAgent**: 发展计划文档生成

使用 DeepSeek API（兼容 OpenAI SDK），支持并行调用多个 Agent。

---

# 6. 核心生成 Prompt 示例

```
根据以下需求生成系统架构图
使用 mermaid graph TD
必须包含模块节点与数据库节点
输出纯 mermaid 代码
不得添加解释文字
```

---

# 7. 迭代规划

## v1（基础版）

* 需求输入
* 架构图生成
* 版本保存

---

## v2（增强版）

* ER 图生成
* 版本对比
* JSON 结构化输出

---

## v3（进阶版）

* 风险预测
* 模块复杂度分析
* API 设计自动生成

---

# 8. 总结

本系统核心价值：

* 将非结构化需求转化为结构化设计
* 自动维护软件设计文档
* 支持设计演化与版本追踪

本质不是 AI 聊天工具，而是：

> AI 驱动的软件设计自动化平台

---

END
