import React from "react";
import { Edit2, BarChart2, Archive, ArrowUpRight } from "lucide-react";
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
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  IN_DESIGN: {
    label: "In Design",
    className: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    dot: "bg-indigo-400",
  },
  PAUSED: {
    label: "Paused",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-400",
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const config = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.IN_DESIGN;
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const isLive = project.status === "LIVE";

  return (
    <div
      className={cn(
        "group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-lg",
        project.status === "PAUSED" && "opacity-60 hover:opacity-100"
      )}
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Corner Action */}
      <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300">
        <ArrowUpRight className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="mb-4 pr-12 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
              config.className
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full inline-block", config.dot, isLive && "animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]")} />
            {config.label}
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            {project.category ?? "Project"}
          </span>
        </div>
        
        <h4 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors leading-tight mb-2">
          {project.title}
        </h4>
        {project.description && (
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">
            {project.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px] font-semibold text-slate-400 group-hover:border-slate-700 group-hover:text-slate-300 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: members + actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 relative z-10">
        <div className="flex -space-x-3">
          {project.members.slice(0, 3).map((member, i) => (
            <img
              key={member.id}
              src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=32&background=1e293b&color=fff`}
              className="w-8 h-8 rounded-full border-2 border-[#020617] object-cover ring-2 ring-transparent group-hover:ring-slate-800 transition-all duration-300"
              style={{ zIndex: 10 - i }}
              alt={member.name}
            />
          ))}
          {project.members.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 z-0">
              +{project.members.length - 3}
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          <button className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all">
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
