"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Lightbulb,
  Activity,
  GitCommit,
  BookOpen,
} from "lucide-react";

interface InsightPayload {
  type: "architecture" | "learning" | "refactor";
  patternType: string;
  severityScore: number;
  title: string;
  actionableAdvice: string;
  relatedConcepts: string[];
}

// Map the insight type to a visual theme
const THEME_MAP = {
  architecture: {
    icon: Activity,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  learning: {
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  refactor: {
    icon: GitCommit,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
};

export function MentorInsightWidget({
  initialInsight,
}: {
  initialInsight?: InsightPayload;
}) {
  const [insight, setInsight] = useState<InsightPayload | null>(
    initialInsight || null,
  );
  const [isVisible, setIsVisible] = useState(true);

  // If implementing polling or SSE for live updates:
  // useEffect(() => {
  //    fetch('/api/mentor/insight').then(res => res.json()).then(data => {
  //        if (data.insight) setInsight(data.insight);
  //    });
  // }, []);

  if (!insight || !isVisible) return null;

  const Theme = THEME_MAP[insight.type] || THEME_MAP.learning;
  const Icon = Theme.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={`fixed bottom-6 right-6 w-96 backdrop-blur-xl border ${Theme.border} ${Theme.bg} rounded-2xl p-5 shadow-2xl z-[9999]`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-white/5 \${Theme.color}`}>
              <Icon size={18} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold inline-flex items-center gap-1">
                <Sparkles size={12} className={Theme.color} />
                Mentor Insight
              </span>
              <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
                {insight.title}
              </h4>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 text-sm text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-3">
          {insight.actionableAdvice}
        </div>

        {insight.relatedConcepts && insight.relatedConcepts.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {insight.relatedConcepts.map((concept) => (
              <span
                key={concept}
                className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/10"
              >
                {concept.replace("_", " ")}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
