# AI-SDLC：智能软件生命周期辅助系统

## Architecture Design & Requirement Specification (v1.0)

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
┌─────────────────────────────┐
│           Frontend          │
│  Next.js + Mermaid Renderer │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Backend API Layer    │
│   - Session 管理            │
│   - Diagram 生成接口        │
│   - 版本管理                │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      AI Processing Layer    │
│  - 需求结构化解析           │
│  - Mermaid 生成             │
│  - 版本 Diff 分析           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Database (Neon)      │
│  - Sessions                 │
│  - Diagrams                 │
│  - Messages                 │
│  - Versions                 │
└─────────────────────────────┘
```

---

## 2.2 架构分层说明

### 1️⃣ 表现层（Presentation Layer）

技术：

* Next.js
* Mermaid 渲染
* 状态管理（Zustand / Redux）

职责：

* 需求输入界面
* 实时图展示
* 版本对比视图
* 会话管理

---

### 2️⃣ 业务层（Application Layer）

职责：

* 管理 Session
* 管理版本
* 控制生成流程
* 调用 AI 接口

核心接口：

* POST /session
* POST /generate-diagram
* GET /session/{id}
* GET /session/{id}/versions

---

### 3️⃣ AI 处理层（LLM Layer）

职责：

* 需求结构化
* Mermaid 代码生成
* 图结构优化
* 版本差异分析

工作流程：

```
用户需求
   ↓
结构化 JSON 输出
   ↓
Mermaid 代码生成
   ↓
存储数据库
```

---

### 4️⃣ 数据层（Persistence Layer）

数据库：Neon PostgreSQL

核心设计：

## sessions


| 字段        | 类型      | 说明     |
| ----------- | --------- | -------- |
| id          | uuid      | 主键     |
| title       | text      | 项目标题 |
| description | text      | 初始需求 |
| created\_at | timestamp | 创建时间 |

---

## diagrams


| 字段          | 类型      | 说明                     |
| ------------- | --------- | ------------------------ |
| id            | uuid      | 主键                     |
| session\_id   | uuid      | 外键                     |
| mermaid\_code | text      | Mermaid 文本             |
| diagram\_type | text      | architecture / er / flow |
| version       | int       | 版本号                   |
| created\_at   | timestamp | 创建时间                 |

---

## messages（可选）


| 字段        | 类型      | 说明          |
| ----------- | --------- | ------------- |
| id          | uuid      | 主键          |
| session\_id | uuid      | 会话          |
| role        | text      | user / system |
| content     | text      | 对话内容      |
| created\_at | timestamp | 时间          |

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

## 5.3 是否需要多 Agent？

初期版本：

* 单模型即可

升级版本：

* RequirementAgent
* DesignAgent
* ERAgent

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
