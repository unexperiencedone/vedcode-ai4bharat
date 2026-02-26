CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"url" text NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journals" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"preview" text,
	"read_time" text,
	"published_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"cluster" integer NOT NULL,
	"author" text NOT NULL,
	"target" text,
	"message" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_works" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"imageUrl" text,
	"link" text,
	"featured" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text,
	"auth_id" text,
	"email" text,
	"password" text,
	"image" text,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"role" text,
	"bio" text,
	"hobbies" jsonb DEFAULT '[]'::jsonb,
	"current_learning" text,
	"socials" jsonb DEFAULT '{"github":"","twitter":"","site":""}'::jsonb,
	"onboarding_complete" boolean DEFAULT false,
	"linkedin" text,
	"github" text,
	"coding_philosophy" text,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"primary_os" text,
	"preferred_ide" text,
	"hardware_setup" text,
	"theme_preference" text,
	"location" text,
	"years_active" integer DEFAULT 0,
	"commit_count" integer DEFAULT 0,
	"pr_count" integer DEFAULT 0,
	"twitter" text,
	"instagram" text,
	"journal_enabled" boolean DEFAULT false,
	CONSTRAINT "profiles_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "profiles_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "profiles_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "project_snippets" (
	"project_id" integer,
	"snippet_id" integer
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"author_id" uuid,
	"difficulty" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journals" ADD CONSTRAINT "journals_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_works" ADD CONSTRAINT "portfolio_works_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;