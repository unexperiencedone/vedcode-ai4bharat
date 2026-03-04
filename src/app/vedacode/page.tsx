"use client";

import { useState } from "react";
import IngestionPanel from "@/components/vedacode/IngestionPanel";
import RippleGuard from "@/components/vedacode/RippleGuard";
import DocumentReader from "@/components/vedacode/DocumentReader";
import ConceptGalaxy from "@/components/vedacode/ConceptGalaxy";
import { Database, Zap, BookOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "ingest", label: "Knowledge Ingestion", icon: <Database size={15} /> },
  { id: "ripple", label: "Ripple Guard", icon: <Zap size={15} /> },
  { id: "reader", label: "Encyclopedia Reader", icon: <BookOpen size={15} /> },
  { id: "galaxy", label: "Galaxy Map", icon: <Star size={15} /> },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function VedaCodePage() {
  const [tab, setTab] = useState<Tab>("ingest");

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/20">
      <div className="border-b border-slate-800/60 px-8 pt-8 pb-0">
        <div className="max-w-5xl mx-auto flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl border border-transparent transition-all",
                tab === t.id
                  ? "bg-slate-900/60 border-slate-700/60 border-b-transparent text-white -mb-px"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {tab === "ingest" && <IngestionPanel embedded />}
        {tab === "ripple" && <RippleGuard />}
        {tab === "reader" && <DocumentReader />}
        {tab === "galaxy" && <ConceptGalaxy />}
      </div>
    </div>
  );
}
