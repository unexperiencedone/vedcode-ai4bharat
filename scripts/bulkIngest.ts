/**
 * Bulk Knowledge Ingestion Script
 * Ingests documentation for all core technologies into the Handbook (Postgres concept_cards)
 * 
 * Run with: npx tsx scripts/bulkIngest.ts
 */
import { DocIngestor } from "../src/lib/intelligence/docIngestor";
import { db } from "../src/lib/db";
import { technologies } from "../src/db/schema";
import { eq } from "drizzle-orm";

// ─── Ingestion manifest — ordered by prerequisite dependency ──────────────────
// Each entry: { slug, name, category, urls (most important pages first) }
const INGESTION_MANIFEST = [
  {
    slug: "javascript",
    name: "JavaScript",
    category: "language" as const,
    urls: [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Promises",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
    ],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    category: "language" as const,
    urls: [
      "https://www.typescriptlang.org/docs/handbook/2/basic-types.html",
      "https://www.typescriptlang.org/docs/handbook/2/functions.html",
      "https://www.typescriptlang.org/docs/handbook/2/objects.html",
      "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html",
    ],
  },
  {
    slug: "react",
    name: "React",
    category: "frontend" as const,
    urls: [
      "https://react.dev/learn",
      "https://react.dev/learn/describing-the-ui",
      "https://react.dev/learn/adding-interactivity",
      "https://react.dev/learn/managing-state",
      "https://react.dev/reference/react/hooks",
    ],
  },
  {
    slug: "nextjs",
    name: "Next.js",
    category: "fullstack" as const,
    urls: [
      "https://nextjs.org/docs/app/getting-started/installation",
      "https://nextjs.org/docs/app/building-your-application/routing",
      "https://nextjs.org/docs/app/building-your-application/data-fetching",
      "https://nextjs.org/docs/app/building-your-application/rendering",
      "https://nextjs.org/docs/app/api-reference/directives/use-client",
    ],
  },
  {
    slug: "drizzle",
    name: "Drizzle ORM",
    category: "database" as const,
    urls: [
      "https://orm.drizzle.team/docs/overview",
      "https://orm.drizzle.team/docs/sql-schema-declaration",
      "https://orm.drizzle.team/docs/crud",
      "https://orm.drizzle.team/docs/select",
      "https://orm.drizzle.team/docs/relations",
    ],
  },
  {
    slug: "postgresql",
    name: "PostgreSQL",
    category: "database" as const,
    urls: [
      "https://www.postgresql.org/docs/current/sql-select.html",
      "https://www.postgresql.org/docs/current/sql-createtable.html",
      "https://www.postgresql.org/docs/current/indexes.html",
      "https://www.postgresql.org/docs/current/sql-createindex.html",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ensureTechnology(slug: string, name: string, category: string) {
  const existing = await db.query.technologies.findFirst({
    where: eq(technologies.slug, slug),
  });
  if (!existing) {
    console.log(`  ↳ Creating technology: ${name}`);
    await db.insert(technologies).values({ slug, name, category });
  } else {
    console.log(`  ↳ Technology exists: ${name}`);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   VedCode Bulk Knowledge Ingestion Script   ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  let totalConcepts = 0;
  let totalErrors = 0;

  for (const tech of INGESTION_MANIFEST) {
    console.log(`\n▶ [${tech.slug.toUpperCase()}] ${tech.name}`);
    await ensureTechnology(tech.slug, tech.name, tech.category);

    for (let i = 0; i < tech.urls.length; i++) {
      const url = tech.urls[i];
      console.log(`  [${i + 1}/${tech.urls.length}] Ingesting: ${url}`);

      try {
        const result = await DocIngestor.ingestFromUrl(url, tech.slug, i === 0);
        if (result.success) {
          console.log(`    ✅ Added ${result.conceptsAdded} concepts`);
          totalConcepts += result.conceptsAdded;
        } else {
          console.error(`    ❌ Failed: ${result.error}`);
          totalErrors++;
        }
      } catch (err: any) {
        console.error(`    ❌ Exception: ${err.message}`);
        totalErrors++;
      }

      // Polite rate limiting: 3s between pages, 8s between techs
      if (i < tech.urls.length - 1) {
        console.log("    ⏳ Waiting 3s...");
        await sleep(3000);
      }
    }

    console.log(`  ✓ ${tech.name} complete`);
    if (tech !== INGESTION_MANIFEST[INGESTION_MANIFEST.length - 1]) {
      console.log("  ⏳ Waiting 8s before next technology...");
      await sleep(8000);
    }
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log(`║  DONE — ${totalConcepts} concepts added, ${totalErrors} errors  `);
  console.log("╚══════════════════════════════════════════════╝");
  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
