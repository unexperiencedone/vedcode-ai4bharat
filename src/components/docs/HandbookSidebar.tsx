"use client";

import React from "react";
import { ChevronRight, BookOpen, Layers, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

interface HandbookSidebarProps {
  techSlug: string;
  sections: {
    name: string;
    concepts: {
      name: string;
      slug: string;
    }[];
  }[];
  activeConceptSlug?: string;
}

export function HandbookSidebar({ techSlug, sections, activeConceptSlug }: HandbookSidebarProps) {
  return (
    <div className="w-72 h-full bg-[#080808] border-r border-white/5 flex flex-col pt-6 overflow-hidden">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            Documentation
          </span>
        </div>
        <h2 className="text-xl font-bold text-white capitalize">{techSlug} Handbook</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={section.name} className="mb-8">
            <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 flex items-center gap-2">
              <Layers size={10} />
              {section.name}
            </h3>
            <div className="space-y-0.5">
              {section.concepts.map((concept) => (
                <Link
                  key={concept.slug}
                  href={`/handbook/${techSlug}/${concept.slug}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group",
                    activeConceptSlug === concept.slug
                      ? "bg-indigo-500/10 text-white font-medium"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Hash size={12} className={cn(
                      "transition-colors",
                      activeConceptSlug === concept.slug ? "text-indigo-400" : "text-neutral-700 group-hover:text-neutral-500"
                    )} />
                    {concept.name}
                  </div>
                  {activeConceptSlug === concept.slug && (
                    <div className="w-1 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
