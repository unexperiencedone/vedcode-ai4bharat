import { ChevronRight } from "lucide-react";
import SkillTree from "@/components/lab/SkillTree";
import { getSkillStats } from "@/lib/mastery";

// Force dynamic execution for latest stats
export const dynamic = "force-dynamic";

export default async function SkillTreePage() {
  const { stats, groupIQ } = await getSkillStats();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Breadcrumb */}
        <div className="px-8 py-4 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 border-b border-white/10 z-10 bg-background/50 backdrop-blur-sm">
          <span>Cluster 4</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Learning</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Skill Tree</span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-12 z-10 flex flex-col items-center">
          <div className="w-full max-w-5xl mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Dynamic Mastery Map
            </h1>
            <p className="text-muted-foreground">
              Visualization of collective knowledge derived from the Vault's
              snippet repository.
            </p>
          </div>

          <div className="w-full max-w-5xl relative">
            <SkillTree stats={stats} groupIQ={groupIQ} />
          </div>

          <div className="mt-12 w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02]">
              <div className="text-xs font-mono text-muted-foreground uppercase mb-2">
                Total Nodes
              </div>
              <div className="text-2xl font-bold">{stats.length}</div>
            </div>
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02]">
              <div className="text-xs font-mono text-muted-foreground uppercase mb-2">
                Verified Snippets
              </div>
              <div className="text-2xl font-bold">
                {stats.reduce((a, b) => a + b.count, 0)}
              </div>
            </div>
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02]">
              <div className="text-xs font-mono text-muted-foreground uppercase mb-2">
                System Status
              </div>
              <div className="text-emerald-500 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Computing
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
