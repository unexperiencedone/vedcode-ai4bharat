"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "@/components/atelier/EditProfileModal";
import {
  Loader2,
  Code2,
  Clock,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  Monitor,
  Cpu,
  Palette,
  ArrowUpRight,
  Terminal,
  Settings,
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
    twitter: string | null;
    instagram: string | null;
    codingPhilosophy: string | null;
    interests: string[];
    hobbies: string[];
    primaryOs: string | null;
    preferredIde: string | null;
    hardwareSetup: string | null;
    themePreference: string | null;
    location: string | null;
    yearsActive: number | null;
    commitCount: number | null;
    prCount: number | null;
    journalEnabled: boolean;
  };
  stats: {
    snippets: number;
    yearsActive: number;
    commitCount: number;
    prCount: number;
  };
  snippets: {
    id: number;
    title: string;
    language: string;
    difficulty: string | null;
    createdAt: string | null;
    code: string;
  }[];
  works: {
    id: number;
    type: string;
    title: string;
    description: string | null;
    category: string | null;
    imageUrl: string | null;
    link: string | null;
    featured: boolean;
    metadata: any;
  }[];
  journals: {
    id: number;
    title: string;
    preview: string | null;
    readTime: string | null;
    publishedAt: string | null;
    featured: boolean;
  }[];
  contributions: {
    date: string;
    count: number;
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

export default function AtelierProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "journal" | "contact">(
    "profile",
  );
  const [activeFilter, setActiveFilter] = useState("All Work");
  const [localTime, setLocalTime] = useState("");
  const { data: session } = useSession();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwner = session?.user && (session.user as any).handle === handle;

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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) + " JST",
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { profile, stats, snippets, works, journals } = data;
  const interests = Array.isArray(profile.interests) ? profile.interests : [];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Sidebar: The Manifest */}
      <aside className="w-full md:w-80 border-r border-white/10 flex flex-col h-full overflow-y-auto bg-background shrink-0 no-scrollbar">
        {/* Header Profile */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-2 ring-white/10 group-hover:ring-primary/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-white/10" />
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  {profile.name}
                </h1>
                {isOwner && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-primary active:scale-95"
                    title="Edit Profile"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {profile.role || "Developer"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Open to Work
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Location</span>
              <span className="text-slate-300">
                {profile.location || "Tokyo, JP"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Local Time</span>
              <span className="font-mono text-slate-300">{localTime}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex border-b border-white/10">
          {(["profile", "journal", "contact"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 text-xs font-medium uppercase tracking-wider text-center border-b-2 transition-colors",
                activeTab === tab
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-white hover:bg-white/5",
              )}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Stats Module */}
        <div className="p-6 border-b border-white/10 space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            The Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161e2c] rounded p-3 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">Yrs Active</div>
              <div className="text-xl font-bold font-mono">
                {String(stats.yearsActive).padStart(2, "0")}
              </div>
            </div>
            <div className="bg-[#161e2c] rounded p-3 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">Snippets</div>
              <div className="text-xl font-bold font-mono">
                {stats.snippets}
              </div>
            </div>
            <div className="bg-[#161e2c] rounded p-3 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">Commits</div>
              <div className="text-xl font-bold font-mono">
                {stats.commitCount > 1000
                  ? (stats.commitCount / 1000).toFixed(1) + "k"
                  : stats.commitCount}
              </div>
            </div>
            <div className="bg-[#161e2c] rounded p-3 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">PRs Merged</div>
              <div className="text-xl font-bold font-mono">{stats.prCount}</div>
            </div>
          </div>
        </div>

        {/* Arsenal (Interests) */}
        <div className="p-6 border-b border-white/10 flex-grow">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Arsenal
          </h3>
          <div className="flex flex-wrap gap-2">
            {(interests.length > 0
              ? interests
              : [
                  "React",
                  "TypeScript",
                  "Next.js",
                  "Rust",
                  "Docker",
                  "PostgreSQL",
                ]
            ).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs border border-white/10 rounded bg-[#161e2c] text-slate-300 hover:border-primary/50 transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Socials */}
        <div className="p-6">
          <div className="flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
            <a
              href={`https://github.com/${profile.github || profile.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-primary grayscale hover:grayscale-0"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            {profile.twitter && (
              <a
                href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-[#1DA1F2] grayscale hover:grayscale-0"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-[#0A66C2] grayscale hover:grayscale-0"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.instagram && (
              <a
                href={profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-[#E4405F] grayscale hover:grayscale-0"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-background relative no-scrollbar">
        {activeTab === "profile" && (
          <>
            {/* Top Bar Filters */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {["All Work", "Engineering", "Atelier", "Writing"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      activeFilter === f
                        ? "text-white"
                        : "text-slate-500 hover:text-white",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 uppercase tracking-widest hidden md:block">
                  Filter by Year
                </span>
                <select className="bg-transparent border border-white/10 rounded text-xs text-slate-300 px-2 py-1 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer">
                  <option className="bg-background">2023 - Present</option>
                  <option className="bg-background">2022</option>
                  <option className="bg-background">Archive</option>
                </select>
              </div>
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(280px,auto)] gap-[1px] bg-white/10 p-[1px]">
              {/* Dynamic Works Mapping */}
              {works
                .filter((w) => {
                  if (activeFilter === "All Work") return true;
                  if (activeFilter === "Engineering")
                    return w.type === "ENGINEERING";
                  if (activeFilter === "Atelier")
                    return ["ATELIER", "3D", "PHOTOGRAPHY", "WEBGL"].includes(
                      w.type,
                    );
                  if (activeFilter === "Writing") return w.type === "WRITING";
                  return false;
                })
                .map((work) => (
                  <article
                    key={work.id}
                    className={cn(
                      "bg-[#101722] group relative overflow-hidden p-8 flex flex-col justify-between hover:bg-white/[0.02] transition-colors",
                      work.featured ? "md:col-span-2" : "",
                    )}
                  >
                    {work.imageUrl && (
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                      />
                    )}
                    {work.imageUrl && (
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          {work.featured && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                          <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                            {work.category || work.type}
                          </span>
                        </div>
                        <ArrowUpRight className="text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                      <h2
                        className={cn(
                          "font-bold text-white mb-2 group-hover:text-primary transition-colors",
                          work.featured ? "text-2xl" : "text-lg",
                        )}
                      >
                        {work.title}
                      </h2>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                        {work.description}
                      </p>
                    </div>

                    <div className="relative z-10 mt-auto pt-6 border-t border-dashed border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-xs font-mono text-slate-500">
                          {work.metadata?.lang && (
                            <span className="flex items-center gap-1">
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  LANG_COLORS[
                                    work.metadata.lang.toLowerCase()
                                  ] || "bg-slate-400",
                                )}
                              />
                              {work.metadata.lang}
                            </span>
                          )}
                          {work.metadata?.stars && (
                            <span>★ {work.metadata.stars}</span>
                          )}
                        </div>
                        {work.metadata?.status && (
                          <div className="text-xs text-slate-600">
                            {work.metadata.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}

              {/* Contribution Density (Only in Engineering/All) */}
              {(activeFilter === "All Work" ||
                activeFilter === "Engineering") && (
                <div className="bg-[#101722] md:col-span-2 p-6 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        Contribution Density
                      </h3>
                      <p className="text-xs text-slate-500">
                        {(data.contributions ?? []).reduce(
                          (acc, curr) => acc + curr.count,
                          0,
                        )}{" "}
                        contributions in the last 50 days
                      </p>
                    </div>
                    <Link
                      href={`/atelier/${handle}/pulse`}
                      className="text-xs font-mono text-primary cursor-pointer hover:underline"
                    >
                      View Pulse →
                    </Link>
                  </div>
                  <div className="flex gap-1 overflow-hidden h-24 items-end opacity-80">
                    {(data.contributions ?? []).map((c, i) => {
                      const maxCount = Math.max(
                        ...(data.contributions ?? []).map((l) => l.count),
                        1,
                      );
                      const heightPercent = Math.max(
                        (c.count / maxCount) * 100,
                        10,
                      );
                      return (
                        <div
                          key={i}
                          style={{ height: `${heightPercent}%` }}
                          className={cn(
                            "w-1.5 rounded-sm transition-colors cursor-pointer relative group/bar",
                            c.count === 0
                              ? "bg-white/5"
                              : "bg-primary/60 hover:bg-primary",
                          )}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-[10px] text-black rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity font-bold">
                            {new Date(c.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                            : {c.count} units
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Snippets Mapping (Engineering) */}
              {(activeFilter === "All Work" ||
                activeFilter === "Engineering") &&
                snippets.map((s) => (
                  <article
                    key={s.id}
                    className="bg-[#101722] p-6 flex flex-col hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-auto">
                      <span className="p-2 rounded bg-[#161e2c] border border-white/10 group-hover:border-primary/30 transition-colors">
                        <Terminal className="w-4 h-4 text-primary" />
                      </span>
                      <span className="text-[10px] font-mono border border-white/10 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-widest">
                        {s.language}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-4 mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-3">
                      A technical implementation from the Vault. Mastered with{" "}
                      {s.difficulty} difficulty.
                    </p>
                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-3">
                      <a
                        className="text-xs font-medium text-white hover:text-primary flex items-center gap-1 transition-colors"
                        href={`/vault/${s.id}`}
                      >
                        View Source <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </article>
                ))}

              {/* Journal Mapping (Writing) */}
              {(activeFilter === "All Work" || activeFilter === "Writing") &&
                journals.map((j) => (
                  <article
                    key={j.id}
                    className={cn(
                      "bg-[#101722] p-8 flex flex-col group relative overflow-hidden hover:bg-white/[0.02] transition-colors",
                      j.featured ? "md:col-span-2" : "bg-white/[0.01]"
                    )}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold flex items-center gap-2">
                        {j.featured && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                        Journal Article
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    
                    <h3 className={cn(
                      "font-serif italic text-slate-200 mb-4 group-hover:text-primary transition-colors",
                      j.featured ? "text-3xl" : "text-xl"
                    )}>
                      "{j.title}"
                    </h3>
                    
                    {j.preview && (
                      <p className={cn(
                        "text-slate-400 line-clamp-3 mb-6 leading-relaxed",
                        j.featured ? "text-base" : "text-sm"
                      )}>
                        {j.preview}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{j.publishedAt ? new Date(j.publishedAt).toLocaleDateString() : "Recent"}</span>
                      <span>{j.readTime || "5 min read"}</span>
                    </div>
                  </article>
                ))}

              {/* Collaborative Card (Always present) */}
              <div className="bg-[#101722] p-6 flex flex-col justify-center items-center text-center border border-dashed border-white/5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Collaborate?
                </h3>
                <p className="text-xs text-slate-500 mb-4 px-2">
                  Currently accepting new contracts for Q4 2026.
                </p>
                <a
                  href={`mailto:${profile.email || "hello@archive.dev"}`}
                  className="px-4 py-2 text-xs font-medium bg-primary hover:bg-blue-600 text-white rounded transition-colors w-full text-center block"
                >
                  Get in touch
                </a>
              </div>
            </div>
          </>
        )}

        {activeTab === "journal" && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-serif italic text-white mb-4">
              Selected Writings
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
              Detailed documentation of technical journeys and creative
              philosophies.
            </p>
            <div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
              {journals.length > 0 ? (
                journals.map((j) => (
                  <div
                    key={j.id}
                    className="p-6 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group cursor-pointer"
                  >
                    <div className="text-[10px] font-mono text-primary mb-2 uppercase tracking-widest font-bold">
                      {profile.name}&apos;s Journal
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {j.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                      <span>
                        {j.publishedAt
                          ? new Date(j.publishedAt).toLocaleDateString()
                          : "Recent"}
                      </span>
                      <span>•</span>
                      <span>{j.readTime || "12 min read"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 border border-dashed border-white/10 rounded-xl">
                  <p className="text-slate-500">No journals published yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="p-12 h-full flex items-center justify-center">
            <div className="max-w-md w-full p-8 border border-white/10 rounded-2xl bg-white/[0.02]">
              <h2 className="text-2xl font-bold text-white mb-2">
                Initiate Contact
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                Reach out for collaborations, architecture audits, or creative
                projects.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                      Email
                    </div>
                    <div className="text-sm text-slate-200">
                      {profile.email || "hello@archive.dev"}
                    </div>
                  </div>
                </div>
                {profile.github && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      GH
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">
                        GitHub
                      </div>
                      <div className="text-sm text-slate-200">
                        github.com/{profile.handle}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <a 
                href={`mailto:${profile.email || "hello@archive.dev"}`}
                className="mt-8 w-full py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-center block"
              >
                Send Direct Message
              </a>
            </div>
          </div>
        )}

        <div className="h-20" />
      </main>
      {/* Modal */}
      {isOwner && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          data={data}
        />
      )}
    </div>
  );
}
