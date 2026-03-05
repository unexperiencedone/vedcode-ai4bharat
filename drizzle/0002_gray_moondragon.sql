CREATE TABLE "concept_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technology_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb,
	"one_liner" text NOT NULL,
	"mental_model" text,
	"beginner_explanation" text NOT NULL,
	"intermediate_explanation" text NOT NULL,
	"advanced_explanation" text NOT NULL,
	"embedding" vector(1536),
	"is_verified" boolean DEFAULT false,
	"last_verified" timestamp,
	"source_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "concept_examples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_id" uuid NOT NULL,
	"example_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"is_runnable" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "concept_quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_id" uuid NOT NULL,
	"question" text NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"option_c" text NOT NULL,
	"option_d" text NOT NULL,
	"correct_option" text NOT NULL,
	"difficulty" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concept_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_concept_id" uuid NOT NULL,
	"target_concept_id" uuid NOT NULL,
	"relation_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"skill_level" text DEFAULT 'beginner' NOT NULL,
	"learning_style" text DEFAULT 'visual' NOT NULL,
	"total_keywords_learned" integer DEFAULT 0,
	"avg_time_on_explanation" integer DEFAULT 0,
	"challenge_accuracy" real DEFAULT 0,
	"preferred_topics" jsonb DEFAULT '[]'::jsonb,
	"inferred_from_onboarding" boolean DEFAULT false,
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "learner_profile_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "learning_roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technology_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"order_index" integer NOT NULL,
	"concept_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"signal_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"official_docs_url" text,
	"website" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "technologies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_concept_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"concept_id" uuid NOT NULL,
	"familiarity_score" real DEFAULT 0,
	"mastery_level" text DEFAULT 'learning',
	"last_reviewed" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "concept_cards" ADD CONSTRAINT "concept_cards_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_examples" ADD CONSTRAINT "concept_examples_concept_id_concept_cards_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_quizzes" ADD CONSTRAINT "concept_quizzes_concept_id_concept_cards_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_relationships" ADD CONSTRAINT "concept_relationships_source_concept_id_concept_cards_id_fk" FOREIGN KEY ("source_concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_relationships" ADD CONSTRAINT "concept_relationships_target_concept_id_concept_cards_id_fk" FOREIGN KEY ("target_concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD CONSTRAINT "learner_profile_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_roadmaps" ADD CONSTRAINT "learning_roadmaps_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_roadmaps" ADD CONSTRAINT "learning_roadmaps_concept_id_concept_cards_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_signals" ADD CONSTRAINT "skill_signals_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_concept_progress" ADD CONSTRAINT "user_concept_progress_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_concept_progress" ADD CONSTRAINT "user_concept_progress_concept_id_concept_cards_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concept_cards"("id") ON DELETE no action ON UPDATE no action;