import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================

export const documentTypeEnum = pgEnum("document_type", [
  "mermaid",
  "api_spec",
  "arch_design",
  "dev_plan",
  "markdown",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "archived",
  "completed",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const diagramTypeEnum = pgEnum("diagram_type", [
  "architecture",
  "er",
  "flow",
  "sequence",
  "class",
  "other",
]);

// ==================== AUTH TABLES ====================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  userMd: text("user_md").default(""),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ==================== APP TABLES ====================

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: sessionStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  diagramType: diagramTypeEnum("diagram_type"),
  title: text("title"),
  content: text("content").notNull().default(""),
  version: integer("version").notNull().default(1),
  parentVersionId: uuid("parent_version_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  documents: many(documents),
  messages: many(messages),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  session: one(sessions, {
    fields: [documents.sessionId],
    references: [sessions.id],
  }),
  parentVersion: one(documents, {
    fields: [documents.parentVersionId],
    references: [documents.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
