import { pgTable, text, timestamp, integer, uuid, serial, jsonb, boolean } from 'drizzle-orm/pg-core';
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
  authId: text("auth_id").unique(), // OAuth provider ID
  email: text("email").unique(),
  password: text("password"), // Hashed, nullable for OAuth-only users
  image: text("image"),
  name: text("name").notNull(),
  handle: text("handle").unique().notNull(),
  role: text("role"),
  bio: text("bio"),
  hobbies: jsonb("hobbies").default([]),
  currentLearning: text("current_learning"),
  socials: jsonb("socials").default({ github: "", twitter: "", site: "" }),
  // Onboarding fields
  onboardingComplete: boolean("onboarding_complete").default(false),
  linkedin: text("linkedin"),
  github: text("github"),
  codingPhilosophy: text("coding_philosophy"), // Functional, Object-Oriented, Minimalist
  interests: jsonb("interests").default([]), // Array of interest tags
  primaryOs: text("primary_os"), // Linux, macOS, Windows
  preferredIde: text("preferred_ide"), // VS Code, JetBrains, Neovim
  hardwareSetup: text("hardware_setup"), // Free-text
  themePreference: text("theme_preference"), // Midnight, Bone, Contrast
  // New Atelier UI fields
  location: text("location"),
  yearsActive: integer("years_active").default(0),
  commitCount: integer("commit_count").default(0),
  prCount: integer("pr_count").default(0),
  twitter: text("twitter"),
  instagram: text("instagram"),
  journalEnabled: boolean("journal_enabled").default(false),
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

export const portfolioWorks = pgTable("portfolio_works", {
  id: serial("id").primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
  type: text("type").notNull(), // 'ENGINEERING', 'ATELIER', 'WRITING', '3D', 'PHOTOGRAPHY', 'WEBGL'
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // e.g., '3D / Blender', 'Photography', 'Experiment'
  imageUrl: text("imageUrl"),
  link: text("link"),
  featured: boolean("featured").default(false),
  metadata: jsonb("metadata").default({}), // stars, difficulty, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  preview: text("preview"),
  readTime: text("read_time"), // e.g. '5 min read'
  featured: boolean("featured").default(false),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolioWorksRelations = relations(portfolioWorks, ({ one }) => ({
  profile: one(profiles, {
    fields: [portfolioWorks.profileId],
    references: [profiles.id],
  }),
}));

export const journalRelations = relations(journals, ({ one }) => ({
  profile: one(profiles, {
    fields: [journals.profileId],
    references: [profiles.id],
  }),
}));
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  archiveId: text("archive_id").unique().notNull(), // e.g., ARCHIVE-772-X
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("IN_DESIGN"), // LIVE, IN_DESIGN, PAUSED
  category: text("category"), // AI & ML, Infrastructure, etc.
  tags: jsonb("tags").default([]), // ["REACT", "PYTHON"]
  imageUrl: text("image_url"),
  githubRepo: text("github_repo"),
  
  // Metrics
  activeModules: integer("active_modules").default(0),
  liveDeployments: integer("live_deployments").default(0),
  pendingReview: integer("pending_review").default(0),
  storageCapacity: integer("storage_capacity").default(0),
  
  // System Info
  uptime: text("uptime"),
  latency: text("latency"),
  load: text("load"),
  version: text("version").default("v0.1.0"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectMembers = pgTable("project_members", {
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  members: many(projectMembers),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  profile: one(profiles, {
    fields: [projectMembers.profileId],
    references: [profiles.id],
  }),
}));

// VedaCode MVP Tables

export const memoryLogs = pgTable("memory_log", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  keyword: text("keyword").notNull(),
  context: jsonb("context"), // e.g. snippet of where it was used
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  strengthScore: integer("strength_score").default(100), // VedaCode's forgetting decay
});

export const projectFiles = pgTable("project_files", {
  id: serial("file_id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  filePath: text("file_path").notNull(),
  fileContent: text("file_content").notNull(),
});
