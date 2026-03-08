const postgres = require("postgres");
require("dotenv").config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL.replace(/^["']|["']$/g, "");
const sql = postgres(dbUrl);

async function cleanDatabase() {
  try {
    console.log("Analyzing orphan records...");

    // Delete orphan snippets
    const snippetResult =
      await sql`DELETE FROM snippets WHERE author_id NOT IN (SELECT id FROM profiles)`;
    console.log(`Deleted ${snippetResult.count} orphan snippets.`);


    // Delete orphan concept logs
    const conceptLogResult = await sql`DELETE FROM concept_change_log WHERE file_id NOT IN (SELECT id FROM file_nodes)`;
    console.log(`Deleted ${conceptLogResult.count} orphan concept change logs.`);
    
    console.log("Database cleanup complete. Ready for Drizzle push.");
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

cleanDatabase();
