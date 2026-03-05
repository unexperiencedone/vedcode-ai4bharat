import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function initTables() {
    try {
        console.log("🛠️ Creating code_change_log table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "code_change_log" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "file_id" uuid NOT NULL,
                "change_count" integer DEFAULT 0 NOT NULL,
                "last_modified" timestamp DEFAULT now() NOT NULL
            );
        `);

        console.log("🛠️ Creating architecture_metrics table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "architecture_metrics" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "node_id" uuid NOT NULL,
                "node_type" text NOT NULL,
                "coupling_score" real DEFAULT 0 NOT NULL,
                "concept_density" real DEFAULT 0 NOT NULL,
                "change_frequency" real DEFAULT 0 NOT NULL,
                "stress_score" real DEFAULT 0 NOT NULL,
                "last_calculated" timestamp DEFAULT now() NOT NULL
            );
        `);

        console.log("✅ Tables initialized successfully.");
    } catch (err) {
        console.error("❌ Error creating tables:", err);
    } finally {
        process.exit(0);
    }
}

initTables();
