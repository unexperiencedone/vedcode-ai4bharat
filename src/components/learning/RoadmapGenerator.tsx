"use client";

import React, { useState, useEffect } from "react";
import { Target, Sparkles, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapGeneratorProps {
  onRoadmapGenerated: (data: {
    title: string;
    steps: any[];
    techSlug: string;
  }) => void;
}

export function RoadmapGenerator({
  onRoadmapGenerated,
}: RoadmapGeneratorProps) {
  const [goal, setGoal] = useState("");
  const [techSlug, setTechSlug] = useState("");
  const [availableTechs, setAvailableTechs] = useState<
    { slug: string; name: string }[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTechs, setIsLoadingTechs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTechs() {
      try {
        const res = await fetch("/api/technologies");
        const data = await res.json();
        if (data.technologies?.length > 0) {
          setAvailableTechs(data.technologies);
          setTechSlug(data.technologies[0].slug); // Default to first available
        }
      } catch (err) {
        console.error("Failed to load technologies", err);
      } finally {
        setIsLoadingTechs(false);
      }
    }
    fetchTechs();
  }, []);

  const handleGenerate = async () => {
    if (!goal.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, techSlug }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate roadmap");

      // Pass the roadmap AND the techSlug the user selected back up to RoadmapPlayer
      onRoadmapGenerated({
        title: data.title || data.roadmapTitle || data.roadmap?.title,
        steps: data.steps || data.roadmap?.steps || [],
        techSlug,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl p-8 mb-8 relative overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">
                Personalized AI Roadmap
              </h3>
            </div>
            <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">
              Don't know where to start? Tell Veda exactly what you want to
              build or understand, and it will curate a specific sequence of
              concepts just for you.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 border border-slate-700/50 p-2 rounded-xl bg-slate-900/50 w-fit">
            <span className="text-sm text-slate-400 pl-3">Learning Topic:</span>
            {isLoadingTechs ? (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : (
              <select
                value={techSlug}
                onChange={(e) => setTechSlug(e.target.value)}
                disabled={isGenerating || availableTechs.length === 0}
                className="bg-slate-800 text-white border-0 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none pr-8 cursor-pointer"
              >
                {availableTechs.map((t: any) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-stretch gap-3">
            <div className="relative flex-1">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder={`e.g., "I want to implement authentication"`}
                className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                disabled={isGenerating}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={!goal.trim() || isGenerating}
              className={cn(
                "h-14 px-8 rounded-xl font-bold tracking-wide flex items-center gap-2 transition-all shrink-0",
                goal.trim() && !isGenerating
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  : "bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5",
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Curating Path...
                </>
              ) : (
                <>
                  Generate Roadmap
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
