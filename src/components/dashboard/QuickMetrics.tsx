import React from "react";
import { TrendingUp, Brain, BookOpen, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  subtext?: string;
  subtextColor?: string;
  borderColor: string;
  glowColor: string;
  progress?: number;
  icon?: React.ReactNode;
}

export function QuickMetrics({ stats, learnerMetrics }: { stats: any; learnerMetrics?: any }) {
  const metrics: MetricCardProps[] = [
    {
      label: "Active Projects",
      value: stats.activeModules || 0,
      icon: <Target className="w-4 h-4 text-indigo-400" />,
      borderColor: "border-l-indigo-500",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]",
    },
    {
      label: "Live Deployments",
      value: stats.liveDeployments || 0,
      subtext: stats.uptime ? `Uptime ${stats.uptime}` : undefined,
      subtextColor: "text-emerald-400",
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      borderColor: "border-l-emerald-500",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    },
    {
      label: "Concepts Learned",
      value: learnerMetrics?.conceptsLearned ?? 0,
      subtext: learnerMetrics?.skillLevel ? `Level: ${learnerMetrics.skillLevel}` : "Start learning",
      subtextColor: "text-violet-400",
      icon: <BookOpen className="w-4 h-4 text-violet-400" />,
      borderColor: "border-l-violet-500",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
    },
    {
      label: "Mastery Score",
      value: `${learnerMetrics?.masteryScore ?? 0}%`,
      progress: learnerMetrics?.masteryScore ?? 0,
      subtext: learnerMetrics?.recallAccuracy != null ? `Recall: ${learnerMetrics.recallAccuracy}%` : "No recalls yet",
      subtextColor: "text-cyan-400",
      icon: <Brain className="w-4 h-4 text-cyan-400" />,
      borderColor: "border-l-cyan-500",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className={cn(
            "group relative bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800 border-l-4 transition-all duration-300",
            metric.borderColor,
            metric.glowColor
          )}
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />

          <p className="text-sm font-semibold text-slate-400 mb-2 tracking-wide uppercase">
            {metric.label}
          </p>
          <h3 className="text-4xl font-extrabold text-white tracking-tight">{metric.value}</h3>

          {metric.trend && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm mt-3 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>{metric.trend}</span>
            </div>
          )}

          {metric.subtext && (
            <p className={cn("text-sm mt-3 font-medium", metric.subtextColor)}>
              {metric.subtext}
            </p>
          )}

          {metric.progress !== undefined && (
            <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
              <div
                className="bg-slate-400 h-full transition-all duration-1000 ease-out"
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
