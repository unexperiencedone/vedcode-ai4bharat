import { ChevronRight } from "lucide-react";
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
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col overflow-hidden relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Breadcrumb */}
          <div className="px-8 py-4 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 border-b border-white/10 z-10 bg-background/50 backdrop-blur-sm flex-shrink-0">
            <span>Cluster 2</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Intelligence</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Vault Explorer</span>
          </div>

          <VaultExplorer initialSnippets={initialSnippets} />
      </main>
    </div>
  );
}
