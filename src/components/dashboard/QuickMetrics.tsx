import React from "react";
import { TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  subtext?: string;
  borderColor: string;
  progress?: number;
}

export function QuickMetrics({ stats }: { stats: any }) {
  const metrics: MetricCardProps[] = [
    {
      label: "Active Modules",
      value: stats.activeModules || 0,
      borderColor: "border-l-primary",
    },
    {
      label: "Live Deployments",
      value: stats.liveDeployments || 0,
      subtext: stats.uptime ? `UPTIME: ${stats.uptime}` : undefined,
      borderColor: "border-l-emerald-500",
    },
    {
      label: "Pending Review",
      value: stats.pendingReview || 0,
      subtext: stats.pendingReview > 0 ? "Requires Attention" : "All Clear",
      borderColor: "border-l-amber-500",
    },
    {
      label: "Storage Capacity",
      value: `${stats.storageCapacity || 0}%`,
      progress: stats.storageCapacity || 0,
      borderColor: "border-l-slate-500",
    },
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <div key={i} className={`glass-panel p-5 rounded-xl border-l-4 ${metric.borderColor}`}>
          <p className="text-xs mono-text text-bone/40 mb-1 uppercase tracking-wider">
            {metric.label}
          </p>
          <h3 className="text-3xl font-bold">{metric.value}</h3>
          
          {metric.trend && (
            <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{metric.trend}</span>
            </div>
          )}
          
          {metric.subtext && (
            <div className={`flex items-center gap-1 text-xs mt-2 ${metric.label.includes('Pending') ? 'text-amber-400' : 'text-emerald-400'}`}>
              <span>{metric.subtext}</span>
            </div>
          )}
          
          {metric.progress !== undefined && (
            <div className="w-full bg-bone/10 h-1 mt-3 rounded-full overflow-hidden">
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
