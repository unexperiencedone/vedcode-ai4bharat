import "dotenv/config";
import { ContextGuardEngine } from "../lib/contextGuard/contextGuardEngine";
import { db } from "../lib/db";
import { fileNodes } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🕵️ Verifying Context Guard...");

  const guard = new ContextGuardEngine();

  // 1. Target a known file
  const file = await db.query.fileNodes.findFirst({
    where: eq(fileNodes.path, "src/db/schema.ts")
  });

  if (!file) {
    console.log("⚠️ src/db/schema.ts not found. Picking first available.");
    const fallback = await db.query.fileNodes.findFirst();
    if (!fallback) return;
    return; // Stop here for now or adapt
  }

  console.log(`📂 Testing Guard on: ${file.path}`);

  // 2. Simulate a change to a symbol in that file
  // We need to provide the OLD and NEW content of the WHOLE file (or at least the part ASTDiff sees)
  // For simplicity, we'll just mock the diff result by providing snippets that look like the file
  const oldContent = `export const logs = pgTable('logs', { id: uuid('id').primaryKey() });`;
  const newContent = `export const logs = pgTable('logs', { id: uuid('id').primaryKey(), meta: text('meta') });`;

  try {
    const result = await guard.run(file.path, oldContent, newContent);
    console.log("✅ Guard Result:", JSON.stringify(result, null, 2));

    if (result.advice.length > 0) {
      console.log("💡 Advice Generated!");
    } else {
      console.log("ℹ️ No impact found for this change.");
    }

  } catch (error) {
    console.error("❌ Guard failed:", error);
  }
}

main();
