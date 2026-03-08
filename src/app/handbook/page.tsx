import React from "react";
import { db } from "@/lib/db";
import { technologies } from "@/db/schema";
import Link from "next/link";
import {
  BookOpen,
  Database,
  Layout,
  Server,
  ArrowRight,
  Lock,
} from "lucide-react";
import { desc } from "drizzle-orm";

export const metadata = {
  title: "Universal Handbook - VedCode",
  description: "Your personalized, AI-curated documentation reference.",
};

export default async function HandbookLandingPage() {
  // Try to fetch all seeded technologies
  const allTechs = await db.query.technologies.findMany({
    orderBy: [desc(technologies.createdAt)],
  });

  return (
    <div className="flex-1 h-full bg-background flex flex-col items-center justify-start py-20 px-6 relative overflow-y-auto custom-scrollbar">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8">
          <BookOpen size={16} />
          <span>Universal Handbook</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-center tracking-tight mb-6">
          The ultimate reference library,
          <br className="hidden md:block" /> curated for you.
        </h1>

        <p className="text-xl text-slate-400 text-center max-w-2xl mb-12 leading-relaxed">
          Select a technology stack below to view its personalized, adaptive,
          and interactive documentation structure.
        </p>

        {/* Global Map Banner */}
        <div className="flex w-full max-w-4xl mb-10">
          <Link
            href="/handbook/map"
            className="w-full relative group bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 overflow-hidden hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Global Knowledge Graph
                  </h3>
                  <p className="text-indigo-200/60 text-sm">
                    Interactive Skill Tree mapping prerequisites and relationships across all technologies.
                  </p>
                </div>
              </div>
              <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:gap-2 transition-all">
                Open Map <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {allTechs.length > 0 ? (
            allTechs.map((tech) => (
              <Link
                key={tech.id}
                href={`/handbook/${tech.slug}`}
                className="group relative bg-[#1c2333]/40 border border-[#2a3441] rounded-2xl p-6 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                    {tech.category === "frontend" ? (
                      <Layout size={24} />
                    ) : tech.category === "backend" ? (
                      <Server size={24} />
                    ) : tech.category === "database" ? (
                      <Database size={24} />
                    ) : (
                      <BookOpen size={24} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {tech.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 capitalize">
                    {tech.category}
                  </p>
                  <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    Explore Docs <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Placeholder states if DB is empty
            <>
              <Link
                href="/handbook/nextjs"
                className="group relative bg-[#1c2333]/40 border border-[#2a3441] rounded-2xl p-6 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                    <Layout size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Next.js</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    The React Framework for the Web
                  </p>
                  <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    Explore Docs <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>

              <div className="group relative bg-[#1c2333]/20 border border-[#2a3441]/50 rounded-2xl p-6 overflow-hidden">
                <div className="relative z-10 opacity-50 grayscale select-none">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                    <Server size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Python</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Coming Soon (Needs Ingestion)
                  </p>
                  <div className="flex items-center text-slate-500 text-sm font-semibold">
                    Locked <Lock size={14} className="ml-2" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
