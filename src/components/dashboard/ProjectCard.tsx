import React from "react";
import { Edit2, BarChart2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectMember {
  id: string;
  name: string;
  handle: string;
  image: string | null;
}

interface ProjectCardProps {
  project: {
    id: string;
    archiveId: string;
    title: string;
    description: string | null;
    status: string;
    category: string | null;
    tags: any;
    members: ProjectMember[];
  };
}

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  LIVE: {
    label: "Live",
    className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  IN_DESIGN: {
    label: "In Design",
    className: "text-primary bg-primary/10 border-primary/30",
    dot: "bg-primary",
  },
  PAUSED: {
    label: "Paused",
    className: "text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const config = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.IN_DESIGN;
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const isLive = project.status === "LIVE";

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-5 group hover:border-primary/40 hover:shadow-md transition-all cursor-pointer relative overflow-hidden",
        project.status === "PAUSED" && "opacity-60 hover:opacity-100"
      )}
    >
      {/* Status badge */}
      <div className="absolute top-4 right-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
            config.className
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full inline-block", config.dot, isLive && "animate-pulse")} />
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className="mb-3 pr-16">
        <p className="text-[10px] font-medium text-muted-foreground/60 mb-1 uppercase tracking-wide">
          {project.category ?? "Project"}
        </p>
        <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
          {project.title}
        </h4>
        {project.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: members + actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member) => (
            <img
              key={member.id}
              src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=28&background=1e293b&color=fff`}
              className="w-7 h-7 rounded-full border-2 border-card object-cover"
              alt={member.name}
            />
          ))}
          {project.members.length > 3 && (
            <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              +{project.members.length - 3}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <button className="p-1.5 text-muted-foreground/50 hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-muted-foreground/50 hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
            {project.status === "PAUSED" ? (
              <Archive className="w-4 h-4" />
            ) : (
              <BarChart2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
