"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Code2, Users, Image, Clock, Loader2 } from "lucide-react";

interface Snippet {
  id: number;
  title: string;
  language: string;
  difficulty: string | null;
  createdAt: string | null;
  authorName: string | null;
  authorHandle: string | null;
  authorImage: string | null;
}

interface Member {
  id: string;
  name: string;
  handle: string;
  image: string | null;
  role: string | null;
}

interface DashboardData {
  recentSnippets: Snippet[];
  stats: { snippets: number; members: number; assets: number };
  recentMembers: Member[];
}

const LANG_COLORS: Record<string, string> = {
  typescript: "bg-blue-500",
  javascript: "bg-yellow-500",
  python: "bg-green-500",
  rust: "bg-orange-500",
  go: "bg-cyan-500",
  html: "bg-red-500",
  css: "bg-purple-500",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function FeaturedWorks() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-[1.5] flex items-center justify-center p-8 border-r border-white/10">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-[1.5] flex items-center justify-center p-8 border-r border-white/10 text-muted-foreground/50 text-sm">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="flex-[1.5] overflow-y-auto p-8 border-r border-white/10 no-scrollbar space-y-10">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Snippets", value: data.stats.snippets, icon: Code2, color: "text-primary" },
          { label: "Members", value: data.stats.members, icon: Users, color: "text-emerald-400" },
          { label: "Assets", value: data.stats.assets, icon: Image, color: "text-indigo-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-white/10 bg-white/[0.02] rounded-xl p-5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {stat.label}
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Snippets */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent Snippets</h2>
            <p className="text-xs text-muted-foreground mt-1">Latest code contributions to the Vault.</p>
          </div>
          <Link
            href="/vault"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground"
          >
            View All
          </Link>
        </div>

        {data.recentSnippets.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-8 text-center text-muted-foreground/40 text-sm">
            No snippets yet. Be the first to contribute to the Vault.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {data.recentSnippets.map((snippet) => (
              <Link
                key={snippet.id}
                href={`/vault/${snippet.id}`}
                className="group border border-white/10 bg-white/[0.02] rounded-xl p-5 hover:border-primary/40 transition-all block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", LANG_COLORS[snippet.language] || "bg-white/30")} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {snippet.language}
                    </span>
                  </div>
                  {snippet.difficulty && (
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border",
                      snippet.difficulty === "Core" && "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
                      snippet.difficulty === "Expert" && "text-amber-400 border-amber-400/20 bg-amber-400/5",
                      snippet.difficulty === "Mastery" && "text-rose-400 border-rose-400/20 bg-rose-400/5",
                    )}>
                      {snippet.difficulty}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {snippet.title}
                </h3>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {snippet.authorImage ? (
                      <img
                        src={snippet.authorImage}
                        alt={snippet.authorName || "Author"}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/10" />
                    )}
                    <span className="text-[11px] text-muted-foreground/50">
                      {snippet.authorHandle ? `@${snippet.authorHandle}` : snippet.authorName || "Unknown"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(snippet.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Members */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">New Members</h2>
        {data.recentMembers.length === 0 ? (
          <div className="text-muted-foreground/40 text-sm">No members yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.recentMembers.map((member) => (
              <Link
                key={member.id}
                href={`/atelier/${member.handle}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-all group"
              >
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs text-muted-foreground/50">
                    {member.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {member.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground/40">
                    @{member.handle} {member.role && `· ${member.role}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
