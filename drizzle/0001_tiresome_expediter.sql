CREATE TABLE "memory_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"keyword" text NOT NULL,
	"context" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"strength_score" integer DEFAULT 100
);
--> statement-breakpoint
CREATE TABLE "project_files" (
	"file_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"file_content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"project_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archive_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'IN_DESIGN' NOT NULL,
	"category" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"image_url" text,
	"github_repo" text,
	"active_modules" integer DEFAULT 0,
	"live_deployments" integer DEFAULT 0,
	"pending_review" integer DEFAULT 0,
	"storage_capacity" integer DEFAULT 0,
	"uptime" text,
	"latency" text,
	"load" text,
	"version" text DEFAULT 'v0.1.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_archive_id_unique" UNIQUE("archive_id")
);
--> statement-breakpoint
ALTER TABLE "journals" ADD COLUMN "featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "memory_log" ADD CONSTRAINT "memory_log_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;