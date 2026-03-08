const fetch = require("node-fetch"); // May need to use native Node fetch if >= v18

require("dotenv").config({ path: ".env" });

async function deleteOrphan() {
  const dbUrl = process.env.DATABASE_URL.replace(/^["']|["']$/g, "");

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    console.log("Executing SQL over HTTP...");
    const snippets =
      await sql`DELETE FROM snippets WHERE author_id NOT IN (SELECT id FROM profiles)`;
    console.log("Deleted orphan snippets:", snippets);

    const projects =
      await sql`DELETE FROM projects WHERE profile_id NOT IN (SELECT id FROM profiles)`;
    console.log("Deleted orphan projects:", projects);

    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error executing via Neon HTTP API:", err);
    process.exit(1);
  }
}

deleteOrphan();
