import postgres from "postgres";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env" });

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Adding missing columns to profiles table...");
  try {
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_active INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commit_count INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pr_count INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter TEXT;`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram TEXT;`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS journal_enabled BOOLEAN DEFAULT false;`;
    
    // Also ensure unique constraint on auth_id if missing (optional but good for consistency)
    // await sql`ALTER TABLE profiles ADD CONSTRAINT profiles_auth_id_unique UNIQUE (auth_id);`;
    
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();
