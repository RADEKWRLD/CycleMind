import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { templates } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const builtinTemplates = [
  {
    name: "Web 应用",
    description: "全栈 Web 应用，包含前后端架构设计",
    icon: "Globe",
    prompt: `请帮我设计一个全栈 Web 应用系统。需要包括：
1. 用户认证与权限管理
2. 核心业务功能模块
3. 数据库 ER 设计
4. RESTful API 接口设计
5. 前端页面架构
6. 部署方案

请先分析需求，然后生成架构图、ER 图、API 文档和开发计划。`,
    isBuiltin: true,
  },
  {
    name: "移动端 App",
    description: "iOS/Android 移动应用架构设计",
    icon: "Smartphone",
    prompt: `请帮我设计一个移动端应用系统。需要包括：
1. 用户注册登录流程
2. 核心功能模块划分
3. 数据模型设计
4. 后端 API 接口
5. 客户端架构（网络层、数据层、UI 层）
6. 推送通知方案

请先分析需求，然后生成架构图、ER 图、API 文档和开发计划。`,
    isBuiltin: true,
  },
  {
    name: "微服务架构",
    description: "微服务拆分、通信与部署设计",
    icon: "Boxes",
    prompt: `请帮我设计一个微服务架构系统。需要包括：
1. 服务拆分策略与边界划分
2. 服务间通信方式（同步/异步）
3. API 网关设计
4. 数据库拆分策略
5. 服务注册与发现
6. 容器化部署方案（Docker + K8s）
7. 监控与日志方案

请先分析需求，然后生成架构图、ER 图、API 文档和开发计划。`,
    isBuiltin: true,
  },
  {
    name: "REST API",
    description: "后端 API 服务接口设计",
    icon: "Server",
    prompt: `请帮我设计一个 RESTful API 后端服务。需要包括：
1. 资源建模与 URL 设计
2. 认证鉴权方案（JWT/OAuth）
3. 数据库 Schema 设计
4. 核心接口 CRUD 设计
5. 分页、过滤、排序策略
6. 错误处理规范
7. 速率限制与安全策略

请先分析需求，然后生成架构图、ER 图、API 文档和开发计划。`,
    isBuiltin: true,
  },
  {
    name: "数据平台",
    description: "数据管道、存储与分析平台设计",
    icon: "Database",
    prompt: `请帮我设计一个数据平台系统。需要包括：
1. 数据采集与 ETL 管道
2. 数据存储方案（数据湖/数据仓库）
3. 数据模型与 Schema 设计
4. 查询与分析引擎
5. 数据可视化 Dashboard
6. 数据质量与治理
7. 权限与安全策略

请先分析需求，然后生成架构图、ER 图、API 文档和开发计划。`,
    isBuiltin: true,
  },
];

async function seed() {
  console.log("Seeding templates...");
  for (const t of builtinTemplates) {
    await db.insert(templates).values(t);
  }
  console.log(`Seeded ${builtinTemplates.length} templates.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
