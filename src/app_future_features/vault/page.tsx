import VaultExplorer from "@/components/vault/VaultExplorer";
import { db } from "@/lib/db";
import { snippets, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Force dynamic rendering to ensure fresh data on load
export const dynamic = 'force-dynamic';

async function getInitialSnippets() {
  try {
    const results = await db.select({
      id: snippets.id,
      title: snippets.title,
      code: snippets.code,
      language: snippets.language,
      difficulty: snippets.difficulty,
      authorName: profiles.name,
      createdAt: snippets.createdAt,
    })
    .from(snippets)
    .leftJoin(profiles, eq(snippets.authorId, profiles.id))
    .orderBy(desc(snippets.createdAt))
    .limit(20);
    
    // Convert dates to strings for serialization
    return results.map(s => ({
        ...s,
        createdAt: s.createdAt ? s.createdAt.toISOString() : null
    }));
  } catch (error) {
    console.error("Failed to fetch initial snippets:", error);
    return [];
  }
}

export default async function VaultPage() {
  const initialSnippets = await getInitialSnippets();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <VaultExplorer initialSnippets={initialSnippets} />
    </div>
  );
}
