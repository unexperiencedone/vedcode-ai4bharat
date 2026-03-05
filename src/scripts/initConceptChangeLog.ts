import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function initConceptChangeLog() {
    try {
        console.log("🛠️ Creating concept_change_log table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "concept_change_log" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "profile_id" uuid NOT NULL,
                "commit_hash" text,
                "file_id" uuid NOT NULL,
                "symbol_id" uuid,
                "concept_id" uuid NOT NULL,
                "change_type" text NOT NULL,
                "confidence" real DEFAULT 1.0 NOT NULL,
                "before_context" text,
                "after_context" text,
                "timestamp" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log("✅ Concept Time-Travel tables initialized successfully.");
    } catch (err) {
        console.error("❌ Error creating Concept Time-Travel tables:", err);
    } finally {
        process.exit(0);
    }
}

initConceptChangeLog();
