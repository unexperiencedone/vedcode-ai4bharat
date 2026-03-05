import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        await db.execute(sql`
            ALTER TABLE learner_profile 
            ADD COLUMN IF NOT EXISTS skill_score real DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS preferred_depth text DEFAULT 'balanced' NOT NULL,
            ADD COLUMN IF NOT EXISTS preferred_languages jsonb DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS interest_domains jsonb DEFAULT '[]'::jsonb;
        `);
        console.log("Database updated successfully");
        process.exit(0);
    } catch (e: any) {
        console.error(e.message);
        process.exit(1);
    }
}
main();
