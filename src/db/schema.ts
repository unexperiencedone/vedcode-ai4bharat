import { pgTable, text, timestamp, integer, uuid, serial, jsonb, boolean, real, customType } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

// Create custom vector type in case standard vector import has version issues
const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)';
  },
});


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
  lastIndexedAt: timestamp("last_indexed_at"),
});

export const codeChangeLog = pgTable("code_change_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("file_id").references(() => fileNodes.id).notNull(),
  changeCount: integer("change_count").default(0),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const architectureMetrics = pgTable("architecture_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  nodeId: uuid("node_id").notNull(),
  nodeType: text("node_type").notNull(), // 'file' or 'symbol'
  couplingScore: real("coupling_score").notNull().default(0),
  conceptDensity: real("concept_density").notNull().default(0),
  changeFrequency: real("change_frequency").notNull().default(0),
  stressScore: real("stress_score").notNull().default(0),
  lastCalculated: timestamp("last_calculated").notNull().defaultNow(),
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

// --- KNOWLEDGE BASE LAYER ---

export const technologies = pgTable("technologies", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(), // react, nextjs, postgresql
  name: text("name").notNull(),
  category: text("category").notNull(),  // frontend, backend, database
  officialDocsUrl: text("official_docs_url"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conceptCards = pgTable("concept_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  technologyId: uuid("technology_id").references(() => technologies.id).notNull(),
  slug: text("slug").notNull(), // useeffect
  name: text("name").notNull(), // useEffect
  aliases: jsonb("aliases").default([]),

  oneLiner: text("one_liner").notNull(),
  mentalModel: text("mental_model"),

  beginnerExplanation: text("beginner_explanation").notNull(),
  intermediateExplanation: text("intermediate_explanation").notNull(),
  advancedExplanation: text("advanced_explanation").notNull(),

  embedding: vector("embedding"), // pgvector

  isVerified: boolean("is_verified").default(false),
  lastVerified: timestamp("last_verified"),
  sourceUrl: text("source_url"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conceptExamples = pgTable("concept_examples", {
  id: uuid("id").primaryKey().defaultRandom(),
  conceptId: uuid("concept_id").references(() => conceptCards.id).notNull(),
  exampleType: text("example_type").notNull(), // minimal, real_world, anti_pattern
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  language: text("language").notNull(),
  isRunnable: boolean("is_runnable").default(true),
});

export const conceptRelationships = pgTable("concept_relationships", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceConceptId: uuid("source_concept_id").references(() => conceptCards.id).notNull(),
  targetConceptId: uuid("target_concept_id").references(() => conceptCards.id).notNull(),
  relationType: text("relation_type").notNull(), // depends_on, related_to, alternative_to, part_of, commonly_confused_with
});

export const conceptQuizzes = pgTable("concept_quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  conceptId: uuid("concept_id").references(() => conceptCards.id).notNull(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctOption: text("correct_option").notNull(), // 'A', 'B', 'C', or 'D'
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
});

export const learningRoadmaps = pgTable("learning_roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  technologyId: uuid("technology_id").references(() => technologies.id).notNull(),
  topic: text("topic").notNull(),
  orderIndex: integer("order_index").notNull(),
  conceptId: uuid("concept_id").references(() => conceptCards.id).notNull(),
});

// --- LEARNER PROFILE LAYER ---

export const learnerProfile = pgTable("learner_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id).unique().notNull(),
  skillLevel: text("skill_level").default('beginner').notNull(), // beginner, intermediate, advanced
  skillScore: real("skill_score").default(0.0), // 0 to 1
  learningStyle: text("learning_style").default('visual').notNull(), // visual, textual, mixed
  preferredDepth: text("preferred_depth").default('balanced').notNull(), // walkthrough, balanced, key_points

  preferredLanguages: jsonb("preferred_languages").default([]),
  interestDomains: jsonb("interest_domains").default([]),

  totalKeywordsLearned: integer("total_keywords_learned").default(0),
  avgTimeOnExplanation: integer("avg_time_on_explanation").default(0), // in seconds
  challengeAccuracy: real("challenge_accuracy").default(0.0), // 0 to 1
  confidenceScore: real("confidence_score").default(0.0), // 0 to 1
  conceptMasteryScore: real("concept_mastery_score").default(0.0), // 0 to 1

  recentActivityScore: real("recent_activity_score").default(0.0), // 0 to 1, recency weighting
  lastSignalAt: timestamp("last_signal_at"),

  inferredFromOnboarding: boolean("inferred_from_onboarding").default(false),

  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const skillSignals = pgTable("skill_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
  conceptId: uuid("concept_id").references(() => conceptCards.id), // and here optional
  signalType: text("signal_type").notNull(), // keyword_search, challenge_result, explanation_time, roadmap_step_complete
  payload: jsonb("payload").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const userConceptProgress = pgTable("user_concept_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
  conceptId: uuid("concept_id").references(() => conceptCards.id).notNull(),
  understandingScore: real("understanding_score").default(0.0), // 0 to 1
  recallScore: real("recall_score").default(0.0),               // 0 to 1
  masteryLevel: text("mastery_level").default('learning'), // learning, familiar, mastered
  lastReviewed: timestamp("last_reviewed").defaultNow(),
  lastRecallAt: timestamp("last_recall_at"),
});

// --- CODEBASE GRAPH LAYER (Phase 5) ---

export const fileNodes = pgTable("file_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: text("path").unique().notNull(),
  language: text("language"),
  size: integer("size"),
  hash: text("hash"), // For incremental indexing
  lastIndexed: timestamp("last_indexed").defaultNow(),
});

export const fileEdges = pgTable("file_edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceFileId: uuid("source_file_id").references(() => fileNodes.id).notNull(),
  targetFileId: uuid("target_file_id").references(() => fileNodes.id).notNull(),
  type: text("type").notNull(), // 'import', 'export'
});

export const symbolNodes = pgTable("symbol_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("file_id").references(() => fileNodes.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'function', 'class', 'interface', 'component', 'variable'
  startLine: integer("start_line"),
  endLine: integer("end_line"),
  signature: text("signature"),
});

export const symbolEdges = pgTable("symbol_edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceSymbolId: uuid("source_symbol_id").references(() => symbolNodes.id).notNull(),
  targetSymbolId: uuid("target_symbol_id").references(() => symbolNodes.id).notNull(),
  type: text("type").notNull(), // 'calls', 'references', 'inherits', 'implements'
});

export const conceptUsage = pgTable("concept_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("file_id").references(() => fileNodes.id).notNull(),
  symbolId: uuid("symbol_id").references(() => symbolNodes.id), // Can be null if file-level
  conceptId: uuid("concept_id").references(() => conceptCards.id).notNull(),
  confidence: real("confidence").default(1.0),
  contextSnippet: text("context_snippet"), // Small snippet of the code using the concept
  lineStart: integer("line_start"),
  lineEnd: integer("line_end"),
});

// KNOWLEDGE BASE RELATIONS
export const conceptCardsRelations = relations(conceptCards, ({ one, many }) => ({
  technology: one(technologies, {
    fields: [conceptCards.technologyId],
    references: [technologies.id],
  }),
  examples: many(conceptExamples),
  quizzes: many(conceptQuizzes),
}));

export const conceptExamplesRelations = relations(conceptExamples, ({ one }) => ({
  concept: one(conceptCards, {
    fields: [conceptExamples.conceptId],
    references: [conceptCards.id],
  }),
}));

export const conceptRelationshipsRelations = relations(conceptRelationships, ({ one }) => ({
  sourceConcept: one(conceptCards, {
    fields: [conceptRelationships.sourceConceptId],
    references: [conceptCards.id],
  }),
  targetConcept: one(conceptCards, {
    fields: [conceptRelationships.targetConceptId],
    references: [conceptCards.id],
  }),
}));

export const technologiesRelations = relations(technologies, ({ many }) => ({
  concepts: many(conceptCards),
  roadmaps: many(learningRoadmaps),
}));

// --- CODEBASE GRAPH RELATIONS (Phase 5) ---

export const fileNodesRelations = relations(fileNodes, ({ many }) => ({
  symbols: many(symbolNodes),
  outEdges: many(fileEdges, { relationName: "sourceFile" }),
  inEdges: many(fileEdges, { relationName: "targetFile" }),
  conceptUsages: many(conceptUsage),
}));

export const fileEdgesRelations = relations(fileEdges, ({ one }) => ({
  sourceFile: one(fileNodes, {
    fields: [fileEdges.sourceFileId],
    references: [fileNodes.id],
    relationName: "sourceFile",
  }),
  targetFile: one(fileNodes, {
    fields: [fileEdges.targetFileId],
    references: [fileNodes.id],
    relationName: "targetFile",
  }),
}));

export const symbolNodesRelations = relations(symbolNodes, ({ one, many }) => ({
  file: one(fileNodes, {
    fields: [symbolNodes.fileId],
    references: [fileNodes.id],
  }),
  calls: many(symbolEdges, { relationName: "sourceSymbol" }),
  calledBy: many(symbolEdges, { relationName: "targetSymbol" }),
  conceptUsages: many(conceptUsage),
}));

export const symbolEdgesRelations = relations(symbolEdges, ({ one }) => ({
  sourceSymbol: one(symbolNodes, {
    fields: [symbolEdges.sourceSymbolId],
    references: [symbolNodes.id],
    relationName: "sourceSymbol",
  }),
  targetSymbol: one(symbolNodes, {
    fields: [symbolEdges.targetSymbolId],
    references: [symbolNodes.id],
    relationName: "targetSymbol",
  }),
}));

export const conceptUsageRelations = relations(conceptUsage, ({ one }) => ({
  file: one(fileNodes, {
    fields: [conceptUsage.fileId],
    references: [fileNodes.id],
  }),
  symbol: one(symbolNodes, {
    fields: [conceptUsage.symbolId],
    references: [symbolNodes.id],
  }),
  concept: one(conceptCards, {
    fields: [conceptUsage.conceptId],
    references: [conceptCards.id],
  }),
}));

export const architectureMetricsRelations = relations(architectureMetrics, ({ one }) => ({
  fileOrSymbol: one(fileNodes, {
    fields: [architectureMetrics.nodeId],
    references: [fileNodes.id],
  }),
}));

export const codeChangeLogRelations = relations(codeChangeLog, ({ one }) => ({
  file: one(fileNodes, {
    fields: [codeChangeLog.fileId],
    references: [fileNodes.id],
  }),
}));

// ==========================================
// PHASE 6: MENTOR ENGINE MEMORY
// ==========================================

export const mentorEvidencePatterns = pgTable("mentor_evidence_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
  patternType: text("pattern_type").notNull(), // e.g., 'async_error_handling_gap'
  confidenceScore: real("confidence_score").notNull().default(0),
  occurrenceCount: integer("occurrence_count").notNull().default(1),
  firstDetectedAt: timestamp("first_detected_at").notNull().defaultNow(),
  lastDetectedAt: timestamp("last_detected_at").notNull().defaultNow(),
  relatedConcepts: jsonb("related_concepts").default([]), // array of concept IDs or slugs
});

export const mentorInsightLog = pgTable("mentor_insight_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
  insightType: text("insight_type").notNull(), // 'architecture' | 'learning' | 'refactor'
  contextFileId: uuid("context_file_id"), // Optional: if tied to a specific file
  confidenceScore: real("confidence_score").notNull().default(0),
  shownAt: timestamp("shown_at").notNull().defaultNow(),
  cooldownUntil: timestamp("cooldown_until").notNull(),
});

export const mentorEvidencePatternsRelations = relations(mentorEvidencePatterns, ({ one }) => ({
  profile: one(profiles, {
    fields: [mentorEvidencePatterns.profileId],
    references: [profiles.id],
  }),
}));

export const mentorInsightLogRelations = relations(mentorInsightLog, ({ one }) => ({
  profile: one(profiles, {
    fields: [mentorInsightLog.profileId],
    references: [profiles.id],
  }),
}));

// ==========================================
// PHASE 7: CONCEPT TIME-TRAVEL (CAPSTONE)
// ==========================================

export const conceptChangeLog = pgTable("concept_change_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull(),
  commitHash: text("commit_hash"), // Can be null if changes are tracked locally before commit
  fileId: uuid("file_id").references(() => fileNodes.id).notNull(),
  symbolId: uuid("symbol_id").references(() => symbolNodes.id), // Can be null if file-level change
  conceptId: uuid("concept_id").references(() => conceptCards.id).notNull(),
  changeType: text("change_type").notNull(), // 'introduced' | 'modified' | 'removed'
  confidence: real("confidence").notNull().default(1.0),
  beforeContext: text("before_context"), // The snippet of code before
  afterContext: text("after_context"), // The snippet of code after
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const conceptChangeLogRelations = relations(conceptChangeLog, ({ one }) => ({
  profile: one(profiles, {
    fields: [conceptChangeLog.profileId],
    references: [profiles.id],
  }),
  file: one(fileNodes, {
    fields: [conceptChangeLog.fileId],
    references: [fileNodes.id],
  }),
  symbol: one(symbolNodes, {
    fields: [conceptChangeLog.symbolId],
    references: [symbolNodes.id],
  }),
  concept: one(conceptCards, {
    fields: [conceptChangeLog.conceptId],
    references: [conceptCards.id],
  }),
}));
