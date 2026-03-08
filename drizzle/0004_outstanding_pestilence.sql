CREATE TABLE "architecture_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"node_type" text NOT NULL,
	"coupling_score" real DEFAULT 0 NOT NULL,
	"concept_density" real DEFAULT 0 NOT NULL,
	"change_frequency" real DEFAULT 0 NOT NULL,
	"stress_score" real DEFAULT 0 NOT NULL,
	"last_calculated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"profile_id" uuid,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(512),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_change_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"change_count" integer DEFAULT 0,
	"last_modified" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "concept_change_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"commit_hash" text,
	"file_id" uuid NOT NULL,
	"symbol_id" uuid,
	"concept_id" uuid NOT NULL,
	"change_type" text NOT NULL,
	"confidence" real DEFAULT 1 NOT NULL,
	"before_context" text,
	"after_context" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concept_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"symbol_id" uuid,
	"concept_id" uuid NOT NULL,
	"confidence" real DEFAULT 1,
	"context_snippet" text,
	"line_start" integer,
	"line_end" integer
);
--> statement-breakpoint
CREATE TABLE "file_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_file_id" uuid NOT NULL,
	"target_file_id" uuid NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"language" text,
	"size" integer,
	"hash" text,
	"last_indexed" timestamp DEFAULT now(),
	CONSTRAINT "file_nodes_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "mentor_evidence_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"pattern_type" text NOT NULL,
	"confidence_score" real DEFAULT 0 NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"first_detected_at" timestamp DEFAULT now() NOT NULL,
	"last_detected_at" timestamp DEFAULT now() NOT NULL,
	"related_concepts" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "mentor_insight_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"insight_type" text NOT NULL,
	"context_file_id" uuid,
	"confidence_score" real DEFAULT 0 NOT NULL,
	"shown_at" timestamp DEFAULT now() NOT NULL,
	"cooldown_until" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "symbol_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_symbol_id" uuid NOT NULL,
	"target_symbol_id" uuid NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "symbol_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"start_line" integer,
	"end_line" integer,
	"signature" text
);
--> statement-breakpoint
ALTER TABLE "concept_cards" ALTER COLUMN "embedding" SET DATA TYPE vector(512);--> statement-breakpoint
ALTER TABLE "concept_cards" ADD COLUMN "section" text;--> statement-breakpoint
ALTER TABLE "concept_cards" ADD COLUMN "order_index" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD COLUMN "skill_score" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD COLUMN "preferred_depth" text DEFAULT 'balanced' NOT NULL;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD COLUMN "preferred_languages" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD COLUMN "interest_domains" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD COLUMN "recent_activity_score" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD COLUMN "last_signal_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_indexed_at" timestamp;--> statement-breakpoint
ALTER TABLE "skill_signals" ADD COLUMN "concept_id" uuid;--> statement-breakpoint
ALTER TABLE "user_concept_progress" ADD COLUMN "understanding_score" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_concept_progress" ADD COLUMN "recall_score" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_concept_progress" ADD COLUMN "last_recall_at" timestamp;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_change_log" ADD CONSTRAINT "code_change_log_file_id_file_nodes_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_change_log" ADD CONSTRAINT "concept_change_log_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_change_log" ADD CONSTRAINT "concept_change_log_file_id_file_nodes_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_change_log" ADD CONSTRAINT "concept_change_log_symbol_id_symbol_nodes_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbol_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_change_log" ADD CONSTRAINT "concept_change_log_concept_id_concept_cards_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_usage" ADD CONSTRAINT "concept_usage_file_id_file_nodes_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_usage" ADD CONSTRAINT "concept_usage_symbol_id_symbol_nodes_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbol_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_usage" ADD CONSTRAINT "concept_usage_concept_id_concept_cards_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_edges" ADD CONSTRAINT "file_edges_source_file_id_file_nodes_id_fk" FOREIGN KEY ("source_file_id") REFERENCES "public"."file_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_edges" ADD CONSTRAINT "file_edges_target_file_id_file_nodes_id_fk" FOREIGN KEY ("target_file_id") REFERENCES "public"."file_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_evidence_patterns" ADD CONSTRAINT "mentor_evidence_patterns_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_insight_log" ADD CONSTRAINT "mentor_insight_log_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symbol_edges" ADD CONSTRAINT "symbol_edges_source_symbol_id_symbol_nodes_id_fk" FOREIGN KEY ("source_symbol_id") REFERENCES "public"."symbol_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symbol_edges" ADD CONSTRAINT "symbol_edges_target_symbol_id_symbol_nodes_id_fk" FOREIGN KEY ("target_symbol_id") REFERENCES "public"."symbol_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symbol_nodes" ADD CONSTRAINT "symbol_nodes_file_id_file_nodes_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_signals" ADD CONSTRAINT "skill_signals_concept_id_concept_cards_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_profile" DROP COLUMN "preferred_topics";--> statement-breakpoint
ALTER TABLE "user_concept_progress" DROP COLUMN "familiarity_score";