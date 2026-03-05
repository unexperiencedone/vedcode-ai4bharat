import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function initMentorTables() {
    try {
        console.log("🛠️ Creating mentor_evidence_patterns table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "mentor_evidence_patterns" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "profile_id" uuid NOT NULL,
                "pattern_type" text NOT NULL,
                "confidence_score" real DEFAULT 0 NOT NULL,
                "occurrence_count" integer DEFAULT 1 NOT NULL,
                "first_detected_at" timestamp DEFAULT now() NOT NULL,
                "last_detected_at" timestamp DEFAULT now() NOT NULL,
                "related_concepts" jsonb DEFAULT '[]'::jsonb
            );
        `);

        console.log("🛠️ Creating mentor_insight_log table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "mentor_insight_log" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "profile_id" uuid NOT NULL,
                "insight_type" text NOT NULL,
                "context_file_id" uuid,
                "confidence_score" real DEFAULT 0 NOT NULL,
                "shown_at" timestamp DEFAULT now() NOT NULL,
                "cooldown_until" timestamp NOT NULL
            );
        `);

        console.log("✅ Mentor tables initialized successfully.");
    } catch (err) {
        console.error("❌ Error creating mentor tables:", err);
    } finally {
        process.exit(0);
    }
}

initMentorTables();
