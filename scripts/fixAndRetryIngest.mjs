/**
 * Seeds missing technology rows and re-runs failed ingestion entries.
 * Run: node scripts/fixAndRetryIngest.mjs
 */

const BASE_URL = "http://localhost:3000";

// First, seed missing technologies directly via DB helper API
const TECHNOLOGIES_TO_SEED = [
  { slug: "nextjs", name: "Next.js", category: "fullstack" },
  { slug: "drizzle", name: "Drizzle ORM", category: "database" },
  { slug: "postgresql", name: "PostgreSQL", category: "database" },
];

// Pages that failed (nextjs + drizzle + postgresql)
const RETRY_MANIFEST = [
  { slug: "nextjs", url: "https://nextjs.org/docs/app/getting-started/installation", seq: true },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/routing", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/routing/pages", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/rendering/client-components", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/api-reference/directives/use-client", seq: false },
  { slug: "nextjs", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers", seq: false },

  { slug: "drizzle", url: "https://orm.drizzle.team/docs/overview", seq: true },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/sql-schema-declaration", seq: false },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/crud", seq: false },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/select", seq: false },
  { slug: "drizzle", url: "https://orm.drizzle.team/docs/relations", seq: false },

  { slug: "postgresql", url: "https://www.postgresql.org/docs/current/sql-select.html", seq: true },
  { slug: "postgresql", url: "https://www.postgresql.org/docs/current/indexes.html", seq: false },
  { slug: "postgresql", url: "https://www.postgresql.org/docs/current/sql-createtable.html", seq: false },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function seedTechnologies() {
  console.log("🌱 Seeding missing technologies...");
  for (const tech of TECHNOLOGIES_TO_SEED) {
    const res = await fetch(`${BASE_URL}/api/admin/technologies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tech),
    });
    if (res.ok) {
      console.log(`  ✅ Seeded: ${tech.name}`);
    } else {
      const json = await res.json().catch(() => ({}));
      // might already exist — that's fine
      console.log(`  ℹ️  ${tech.name}: ${json.error || res.status} (may already exist)`);
    }
  }
}

async function ingest(entry, index, total) {
  const { slug, url, seq } = entry;
  const label = `[${index + 1}/${total}] [${slug}]`;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, technologySlug: slug, isSequential: seq }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error(`${label} ❌ ${res.status}: ${json.error}`);
      console.error(`         ${url.replace(/https?:\/\/[^/]+/, "")}`);
      return false;
    }
    console.log(`${label} ✅ +${json.conceptsAdded ?? "?"} concepts  ← ${url.replace(/https?:\/\/[^/]+/, "")}`);
    return true;
  } catch (err) {
    console.error(`${label} ❌ Network: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║  Seeding Technologies + Retry Failed Ingest   ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // Step 1: Seed technologies via API
  await seedTechnologies();
  console.log("");

  // Step 2: Retry all failed ingestion
  let ok = 0, fail = 0;
  let prevSlug = null;

  for (let i = 0; i < RETRY_MANIFEST.length; i++) {
    const entry = RETRY_MANIFEST[i];
    if (entry.slug !== prevSlug) {
      console.log(`\n── ${entry.slug.toUpperCase()} ─────────────────────────`);
      prevSlug = entry.slug;
    }
    const success = await ingest(entry, i, RETRY_MANIFEST.length);
    success ? ok++ : fail++;
    if (i < RETRY_MANIFEST.length - 1) await sleep(5000);
  }

  console.log(`\n✓ Done: ${ok} succeeded, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
