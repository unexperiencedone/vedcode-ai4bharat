import { pgTable, text, timestamp, integer, uuid, serial, jsonb } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

export const logs = pgTable('logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: text('action').notNull(), // 'COMMIT', 'SYNC', 'DEPLOY', 'VAULT_UPDATE', 'MEMBER_JOIN', 'ALERT'
  cluster: integer('cluster').notNull(), // 1-5
  author: text('author').notNull(), // Ideally linked to user ID, using text for now
  target: text('target'), // "ledger-core", "v4.0.3-beta"
  message: text('message'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique(), // Legacy, nullable now
  authId: text("auth_id").unique(), // Google 'sub'
  email: text("email").unique(),
  image: text("image"),
  name: text("name").notNull(),
  handle: text("handle").unique().notNull(),
  role: text("role"),
  bio: text("bio"),
  hobbies: jsonb("hobbies").default([]),
  currentLearning: text("current_learning"),
  socials: jsonb("socials").default({ github: "", twitter: "", site: "" }),
});

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(), // typescript, rust, etc.
  authorId: uuid("author_id").references(() => profiles.id),
  difficulty: text("difficulty"), // Core, Expert, Mastery
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectSnippets = pgTable("project_snippets", {
  projectId: integer("project_id"),
  snippetId: integer("snippet_id"),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type"), // 'SVG', '3D', 'IMG'
  url: text("url").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const snippetRelations = relations(snippets, ({ one }) => ({
  author: one(profiles, {
    fields: [snippets.authorId],
    references: [profiles.id],
  }),
}));
