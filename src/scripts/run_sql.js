require("dotenv").config();
const fs = require("fs");
const path = require("path");
const postgres = require("postgres");

const sqlFilePath = path.join(
  __dirname,
  "../../drizzle/0003_strange_cassandra_nova.sql",
);

async function run() {
  console.log("Reading " + sqlFilePath);
  const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  console.log("Executing SQL migration...");

  try {
    console.log("Enabling pgvector extension...");
    await client.unsafe("CREATE EXTENSION IF NOT EXISTS vector;");
    await client.unsafe(sqlContent);
    console.log("Migration executed successfully!");
  } catch (e) {
    console.error("Migration failed:", e.message);
  } finally {
    await client.end();
  }
}

run();
