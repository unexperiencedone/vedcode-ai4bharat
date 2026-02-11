"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Loader2, Code2, Clock, Github, Linkedin, Mail,
  Monitor, Cpu, Palette, ArrowUpRight
} from "lucide-react";

interface ProfileData {
  profile: {
    name: string;
    handle: string;
    role: string | null;
    bio: string | null;
    image: string | null;
    email: string | null;
    linkedin: string | null;
    github: string | null;
    codingPhilosophy: string | null;
    interests: string[];
    hobbies: string[];
    primaryOs: string | null;
    preferredIde: string | null;
    hardwareSetup: string | null;
    themePreference: string | null;
  };
  stats: {
    snippets: number;
  };
  snippets: {
    id: number;
    title: string;
    language: string;
    difficulty: string | null;
    createdAt: string | null;
    code: string;
  }[];
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

export default function AtelierProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "snippets" | "contact">("profile");

  useEffect(() => {
    fetch(`/api/atelier/${handle}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => router.push("/atelier"))
      .finally(() => setLoading(false));
  }, [handle, router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { profile, stats, snippets } = data;
  const interests = Array.isArray(profile.interests) ? profile.interests : [];
  const hobbies = Array.isArray(profile.hobbies) ? profile.hobbies : [];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar: The Manifest */}
      <aside className="w-full md:w-80 border-r border-white/[0.08] flex flex-col h-full overflow-y-auto bg-background shrink-0 no-scrollbar">
        {/* Header Profile */}
        <div className="p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-2 ring-white/[0.08] group-hover:ring-primary/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-white/[0.08]">
                  {profile.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">{profile.name}</h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {profile.role || "Member"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Handle</span>
              <span className="text-slate-200 font-mono text-xs">@{profile.handle}</span>
            </div>
            {profile.codingPhilosophy && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Philosophy</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {profile.codingPhilosophy}
                </span>
              </div>
            )}
            {profile.primaryOs && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">OS</span>
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Monitor className="w-3 h-3" /> {profile.primaryOs}
                </span>
              </div>
            )}
            {profile.preferredIde && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">IDE</span>
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" /> {profile.preferredIde}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex border-b border-white/[0.08]">
          {(["profile", "snippets", "contact"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 text-xs font-medium uppercase tracking-wider text-center border-b-2 transition-colors",
                activeTab === tab
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Stats Module */}
        <div className="p-6 border-b border-white/[0.08] space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#161e2c] rounded p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-500 mb-1">Snippets</div>
              <div className="text-xl font-bold font-mono">{stats.snippets}</div>
            </div>
            <div className="bg-[#161e2c] rounded p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-500 mb-1">Interests</div>
              <div className="text-xl font-bold font-mono">{interests.length}</div>
            </div>
          </div>
        </div>

        {/* Interests / Arsenal */}
        {interests.length > 0 && (
          <div className="p-6 border-b border-white/[0.08]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs border border-white/[0.08] rounded bg-[#161e2c] text-slate-300 hover:border-primary/50 transition-colors cursor-default"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <div className="p-6 border-b border-white/[0.08]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Hobbies</h3>
            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs border border-white/[0.08] rounded bg-[#161e2c] text-slate-300"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Socials */}
        <div className="p-6 mt-auto">
          <div className="flex items-center gap-3">
            {profile.github && (
              <a
                href={profile.github.startsWith("http") ? profile.github : `https://github.com/${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-background relative no-scrollbar">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-white">{profile.name}'s Work</span>
          </div>
          <span className="text-xs text-slate-500 uppercase tracking-widest">
            {stats.snippets} {stats.snippets === 1 ? "snippet" : "snippets"}
          </span>
        </div>

        {/* Bio Card */}
        {profile.bio && (
          <div className="px-6 py-6 border-b border-white/[0.08]">
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{profile.bio}</p>
          </div>
        )}

        {/* Hardware Setup */}
        {profile.hardwareSetup && (
          <div className="px-6 py-5 border-b border-white/[0.08] flex items-center gap-4">
            <div className="p-2 rounded bg-[#161e2c] border border-white/[0.08]">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Setup</div>
              <div className="text-sm text-slate-200">{profile.hardwareSetup}</div>
            </div>
          </div>
        )}

        {/* Snippets Grid */}
        <div className="p-6">
          {snippets.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-xl p-12 text-center">
              <Code2 className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No snippets yet.</p>
              <p className="text-slate-600 text-xs mt-1">
                @{profile.handle} hasn't contributed any code snippets to the Vault.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.08] rounded-xl overflow-hidden">
              {snippets.map((snippet) => (
                <article
                  key={snippet.id}
                  className="bg-background p-6 flex flex-col hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", LANG_COLORS[snippet.language] || "bg-white/30")} />
                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                        {snippet.language}
                      </span>
                    </div>
                    {snippet.difficulty && (
                      <span className={cn(
                        "text-[10px] font-mono border px-1.5 py-0.5 rounded uppercase",
                        snippet.difficulty === "Core" && "text-emerald-400 border-emerald-400/20",
                        snippet.difficulty === "Expert" && "text-amber-400 border-amber-400/20",
                        snippet.difficulty === "Mastery" && "text-rose-400 border-rose-400/20",
                      )}>
                        {snippet.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {snippet.title}
                  </h3>

                  {/* Code preview */}
                  <pre className="text-[11px] text-slate-500 font-mono bg-[#161e2c] rounded p-3 overflow-hidden max-h-24 mb-4 border border-white/[0.05]">
                    <code>{snippet.code?.slice(0, 200)}{snippet.code?.length > 200 ? "..." : ""}</code>
                  </pre>

                  <div className="mt-auto pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(snippet.createdAt)}
                    </span>
                    <a className="text-xs font-medium text-white/60 hover:text-primary flex items-center gap-1 transition-colors" href={`/vault/${snippet.id}`}>
                      View <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="h-20" />
      </main>
    </div>
  );
}
