"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Zap, Clock, Activity, Target, BookOpen, Cpu, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearnerIntelligencePanelProps {
  learnerMetrics: any;
}

function StatBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden mt-1.5">
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  sub,
  bar,
  barColor = "bg-indigo-500",
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  bar?: number;
  barColor?: string;
  accent: string;
}) {
  return (
    <div className={cn(
      "group relative bg-slate-900/40 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all duration-300",
      "hover:bg-slate-900/70"
    )}>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none", accent)} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        {bar !== undefined && <StatBar value={bar} color={barColor} />}
      </div>
    </div>
  );
}

const STYLE_LABELS: Record<string, string> = {
  visual: "Visual Learner",
  textual: "Text-Driven",
  mixed: "Balanced / Mixed",
};

const DEPTH_LABELS: Record<string, string> = {
  walkthrough: "Step-by-Step Walkthrough",
  balanced: "Balanced Explanations",
  key_points: "Key Points Only",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500",
  intermediate: "bg-amber-500",
  advanced: "bg-violet-500",
};

export function LearnerIntelligencePanel({ learnerMetrics }: LearnerIntelligencePanelProps) {
  if (!learnerMetrics) {
    return (
      <div className="mt-10 p-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/20 text-center">
        <Brain className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">
          Your learner intelligence profile will appear here after your first learning session.
        </p>
      </div>
    );
  }

  const lastSeen = learnerMetrics.lastSignalAt
    ? new Date(learnerMetrics.lastSignalAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "No signals yet";

  const avgSecs = learnerMetrics.avgTimeOnExplanation || 0;
  const avgTimeLabel = avgSecs >= 60
    ? `${Math.round(avgSecs / 60)}m ${avgSecs % 60}s avg`
    : `${avgSecs}s avg`;

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="mt-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Learner Intelligence Profile</h2>
            <p className="text-xs text-slate-500">VedCode's live model of how you think, learn, and retain code</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {learnerMetrics.inferredFromOnboarding && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              INFERRED FROM ONBOARDING
            </span>
          )}
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border
            bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            {learnerMetrics.skillLevel}
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">

        <MetricTile
          icon={<Target className="w-3.5 h-3.5 text-indigo-400" />}
          label="Skill Score"
          value={`${learnerMetrics.skillScore ?? 0}%`}
          sub={`Calibrated ${learnerMetrics.skillLevel} tier`}
          bar={learnerMetrics.skillScore ?? 0}
          barColor={LEVEL_COLORS[learnerMetrics.skillLevel] || "bg-indigo-500"}
          accent="bg-gradient-to-br from-indigo-500/5 to-transparent"
        />

        <MetricTile
          icon={<Brain className="w-3.5 h-3.5 text-violet-400" />}
          label="Concept Mastery"
          value={`${learnerMetrics.masteryScore ?? 0}%`}
          sub={`${learnerMetrics.conceptsLearned ?? 0} concepts encountered`}
          bar={learnerMetrics.masteryScore ?? 0}
          barColor="bg-violet-500"
          accent="bg-gradient-to-br from-violet-500/5 to-transparent"
        />

        <MetricTile
          icon={<Shield className="w-3.5 h-3.5 text-cyan-400" />}
          label="Confidence Score"
          value={`${learnerMetrics.confidenceScore ?? 0}%`}
          sub="Self-signal calibration"
          bar={learnerMetrics.confidenceScore ?? 0}
          barColor="bg-cyan-500"
          accent="bg-gradient-to-br from-cyan-500/5 to-transparent"
        />

        <MetricTile
          icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
          label="Recall Accuracy"
          value={`${learnerMetrics.recallAccuracy ?? 0}%`}
          sub="Ebbinghaus challenge results"
          bar={learnerMetrics.recallAccuracy ?? 0}
          barColor="bg-amber-500"
          accent="bg-gradient-to-br from-amber-500/5 to-transparent"
        />

        <MetricTile
          icon={<Activity className="w-3.5 h-3.5 text-emerald-400" />}
          label="Recent Activity"
          value={`${learnerMetrics.recentActivityScore ?? 0}%`}
          sub="Recency-weighted signal"
          bar={learnerMetrics.recentActivityScore ?? 0}
          barColor="bg-emerald-500"
          accent="bg-gradient-to-br from-emerald-500/5 to-transparent"
        />

        <MetricTile
          icon={<Clock className="w-3.5 h-3.5 text-rose-400" />}
          label="Avg Learn Time"
          value={avgTimeLabel}
          sub="Per explanation session"
          accent="bg-gradient-to-br from-rose-500/5 to-transparent"
        />

        <MetricTile
          icon={<BookOpen className="w-3.5 h-3.5 text-sky-400" />}
          label="Learning Style"
          value={STYLE_LABELS[learnerMetrics.learningStyle] || learnerMetrics.learningStyle || "—"}
          sub="Inferred from behavior"
          accent="bg-gradient-to-br from-sky-500/5 to-transparent"
        />

        <MetricTile
          icon={<Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />}
          label="Depth Preference"
          value={DEPTH_LABELS[learnerMetrics.preferredDepth] || learnerMetrics.preferredDepth || "—"}
          sub={`Last signal: ${lastSeen}`}
          accent="bg-gradient-to-br from-fuchsia-500/5 to-transparent"
        />

      </div>
    </motion.div>
  );
}
