"use client";

import { guildMembers } from "@/lib/data/guild-hall";
import {
  ChevronRight,
  Search,
  Users,
  Activity,
  Globe,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GuildHallPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Breadcrumb */}
        <div className="px-8 py-4 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 border-b border-white/10 z-10 bg-background/50 backdrop-blur-sm">
          <span>Cluster 3</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Identity</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Guild Hall</span>
        </div>

        {/* Header Stats */}
        <div className="px-8 py-8 md:py-12 border-b border-white/10 z-10">
          <h1 className="text-3xl font-bold mb-6 tracking-tight">Guild Hall</h1>
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">1,242</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Members
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">42</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Online Now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directory */}
        <div className="flex-1 overflow-y-auto px-8 py-8 z-10">
          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative group w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="flex gap-2">
              {["All Roles", "Architects", "Engineers", "Designers"].map(
                (role, i) => (
                  <button
                    key={role}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-medium transition-colors border",
                      i === 0
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
                    )}
                  >
                    {role}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {guildMembers.map((member) => (
              <div
                key={member.id}
                className="group border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl p-6 transition-all relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:border-primary/50 transition-colors object-cover"
                    />
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                        member.status === "Online"
                          ? "bg-emerald-500"
                          : member.status === "Away"
                            ? "bg-amber-500"
                            : "bg-muted-foreground",
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{member.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Code className="w-3.5 h-3.5" />
                    <span>{member.contributions} contributions</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-foreground">
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
