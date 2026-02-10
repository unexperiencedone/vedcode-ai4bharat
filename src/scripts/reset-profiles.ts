import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import { exit } from "process";

async function main() {
    console.log("Dropping profiles table...");
    await db.execute(sql`DROP TABLE IF EXISTS profiles CASCADE;`);
    console.log("Dropped.");
    exit(0);
}

main().catch((err) => {
    console.error(err);
    exit(1);
});
