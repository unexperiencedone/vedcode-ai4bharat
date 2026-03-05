import React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  subtext?: string;
  subtextColor?: string;
  borderColor: string;
  progress?: number;
}

export function QuickMetrics({ stats }: { stats: any }) {
  const metrics: MetricCardProps[] = [
    {
      label: "Active Projects",
      value: stats.activeModules || 0,
      borderColor: "border-l-primary",
    },
    {
      label: "Live Deployments",
      value: stats.liveDeployments || 0,
      subtext: stats.uptime ? `Uptime ${stats.uptime}` : undefined,
      subtextColor: "text-emerald-500",
      borderColor: "border-l-emerald-500",
    },
    {
      label: "Pending Review",
      value: stats.pendingReview || 0,
      subtext: stats.pendingReview > 0 ? "Needs attention" : "All clear",
      subtextColor: stats.pendingReview > 0 ? "text-amber-500" : "text-emerald-500",
      borderColor: "border-l-amber-500",
    },
    {
      label: "Storage Used",
      value: `${stats.storageCapacity || 0}%`,
      progress: stats.storageCapacity || 0,
      borderColor: "border-l-slate-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className={cn(
            "bg-card p-5 rounded-lg border border-border border-l-4 shadow-sm",
            metric.borderColor
          )}
        >
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {metric.label}
          </p>
          <h3 className="text-3xl font-bold text-foreground">{metric.value}</h3>

          {metric.trend && (
            <div className="flex items-center gap-1 text-emerald-500 text-xs mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{metric.trend}</span>
            </div>
          )}

          {metric.subtext && (
            <p className={cn("text-xs mt-2 font-medium", metric.subtextColor)}>
              {metric.subtext}
            </p>
          )}

          {metric.progress !== undefined && (
            <div className="w-full bg-muted h-1 mt-3 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
