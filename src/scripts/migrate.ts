import * as dotenv from 'dotenv';
dotenv.config();
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../lib/db';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const migrationClient = postgres(connectionString, { max: 1 });

async function main() {
  console.log("Running migrations...");
  try {
    // This will run migrations on the database, skipping the ones already applied
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("Migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await migrationClient.end();
    process.exit(0);
  }
}

main();
