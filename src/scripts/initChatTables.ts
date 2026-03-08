import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function initChatTables() {
    try {
        console.log("🛠️ Dropping existing chat tables (if any)...");
        await db.execute(sql`DROP TABLE IF EXISTS "chat_messages";`);
        await db.execute(sql`DROP TABLE IF EXISTS "chat_sessions";`);

        console.log("🛠️ Creating chat_sessions table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "chat_sessions" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "profile_id" uuid NOT NULL REFERENCES "profiles"("id"),
                "title" text,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `);

        console.log("🛠️ Creating chat_messages table...");
        // Note: vector(512) matches Amazon Titan Embed Text v2 used in this project
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "chat_messages" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "session_id" uuid REFERENCES "chat_sessions"("id"),
                "profile_id" uuid REFERENCES "profiles"("id"),
                "role" text NOT NULL,
                "content" text NOT NULL,
                "embedding" vector(512),
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);

        console.log("✅ Chat tables initialized successfully.");
    } catch (err) {
        console.error("❌ Error creating chat tables:", err);
    } finally {
        process.exit(0);
    }
}

initChatTables();
