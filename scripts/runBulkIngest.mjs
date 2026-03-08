/**
 * Bulk Handbook Ingestion Runner
 * Calls /api/admin/ingest (the live Next.js route) for each doc URL.
 * Prerequisite: app must be running at localhost:3000 (npm run dev)
 *
 * Run: node scripts/runBulkIngest.mjs
 */

const BASE_URL = "http://localhost:3000";

// Ordered by dependency: language → framework → tooling
const MANIFEST = [
  // ── JavaScript ──────────────────────────────────────────────
  { slug: "javascript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction", seq: true },
  { slug: "javascript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions", seq: false },
  { slug: "javascript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function", seq: false },
  { slug: "javascript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules", seq: false },

  // ── TypeScript ──────────────────────────────────────────────
  { slug: "typescript", url: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html", seq: true },
  { slug: "typescript", url: "https://www.typescriptlang.org/docs/handbook/2/functions.html", seq: false },
  { slug: "typescript", url: "https://www.typescriptlang.org/docs/handbook/2/objects.html", seq: false },
  { slug: "typescript", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html", seq: false },

  // ── React ───────────────────────────────────────────────────
  { slug: "react", url: "https://react.dev/learn", seq: true },
  { slug: "react", url: "https://react.dev/learn/describing-the-ui", seq: false },
  { slug: "react", url: "https://react.dev/learn/adding-interactivity", seq: false },
  { slug: "react", url: "https://react.dev/learn/managing-state", seq: false },
  { slug: "react", url: "https://react.dev/reference/react/useState", seq: false },
  { slug: "react", url: "https://react.dev/reference/react/useEffect", seq: false },
  { slug: "react", url: "https://react.dev/reference/react/useContext", seq: false },
  { slug: "react", url: "https://react.dev/reference/react/useMemo", seq: false },

  // ── Next.js ─────────────────────────────────────────────────
  { slug: "nextjs", url: "https://nextjs.org/docs/app/getting-started/installation", seq: true },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/routing", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/routing/pages", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/rendering/client-components", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/api-reference/directives/use-client", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers", seq: false },

  // ── Drizzle ORM ─────────────────────────────────────────────
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/overview", seq: true },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/sql-schema-declaration", seq: false },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/crud", seq: false },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/select", seq: false },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/relations", seq: false },

  // ── PostgreSQL ──────────────────────────────────────────────
  { slug: "postgresql", url: "https://www.postgresql.org/docs/current/sql-select.html", seq: true },
  { slug: "postgresql", url: "https://www.postgresql.org/docs/current/indexes.html", seq: false },
  { slug: "postgresql", url: "https://www.postgresql.org/docs/current/sql-createtable.html", seq: false },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ingest(entry, index) {
  const { slug, url, seq } = entry;
  const label = `[${index + 1}/${MANIFEST.length}] [${slug}]`;

  try {
    const res = await fetch(`${BASE_URL}/api/admin/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, technologySlug: slug, isSequential: seq }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(`${label} ❌ ${res.status}: ${json.error || "unknown error"}`);
      console.error(`         URL: ${url}`);
      return false;
    }

    console.log(`${label} ✅ +${json.conceptsAdded ?? "?"} concepts  ← ${url.replace(/https?:\/\/[^/]+/, "")}`);
    return true;
  } catch (err) {
    console.error(`${label} ❌ Network error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("╔═════════════════════════════════════════════════════╗");
  console.log("║   VedaCode Bulk Handbook Ingestion                  ║");
  console.log(`║   ${MANIFEST.length} pages across 6 technologies                    ║`);
  console.log("╚═════════════════════════════════════════════════════╝\n");

  // Verify server is up
  try {
    const ping = await fetch(`${BASE_URL}/api/auth/session`);
    console.log(`✓ Server is running at ${BASE_URL}\n`);
  } catch {
    console.error(`❌ Cannot reach ${BASE_URL} — make sure "npm run dev" is running.\n`);
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  let prevSlug = null;

  for (let i = 0; i < MANIFEST.length; i++) {
    const entry = MANIFEST[i];

    // Print separator between technologies
    if (entry.slug !== prevSlug) {
      console.log(`\n── ${entry.slug.toUpperCase()} ─────────────────────────`);
      prevSlug = entry.slug;
    }

    const success = await ingest(entry, i);
    success ? ok++ : fail++;

    // Rate limit: wait 5s between requests to avoid LLM throttling
    if (i < MANIFEST.length - 1) {
      await sleep(5000);
    }
  }

  console.log("\n╔═════════════════════════════════════════════════════╗");
  console.log(`║  COMPLETE: ${ok} succeeded, ${fail} failed out of ${MANIFEST.length} total   ║`);
  console.log("╚═════════════════════════════════════════════════════╝");

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
