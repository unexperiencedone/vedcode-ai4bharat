import React from "react";
import { Edit2, BarChart2, Archive } from "lucide-react";

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

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig: Record<string, { label: string; color: string; bgColor: string; pulse?: boolean }> = {
    LIVE: { 
      label: "LIVE", 
      color: "text-emerald-400", 
      bgColor: "bg-emerald-500/10",
      pulse: true 
    },
    IN_DESIGN: { 
      label: "IN DESIGN", 
      color: "text-primary", 
      bgColor: "bg-primary/10" 
    },
    PAUSED: { 
      label: "PAUSED", 
      color: "text-amber-500", 
      bgColor: "bg-amber-500/10" 
    },
  };

  const config = statusConfig[project.status] || statusConfig.IN_DESIGN;
  const tags = Array.isArray(project.tags) ? project.tags : [];

  return (
    <div className={`glass-panel p-6 rounded-xl group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden ${project.status === 'PAUSED' ? 'opacity-60 hover:opacity-100' : ''}`}>
      <div className="absolute top-0 right-0 p-4">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] mono-text ${config.bgColor} ${config.color} border border-white/5`}>
          {config.pulse && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {!config.pulse && <span className={`size-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`} />}
          {config.label}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] mono-text text-bone/40 mb-1 uppercase">ID: {project.archiveId}</p>
        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{project.title}</h4>
        <p className="text-sm text-bone/50 mt-1 line-clamp-2">{project.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag: string) => (
          <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 border border-bone/10 text-[10px] mono-text text-bone/60 uppercase">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member) => (
            <img 
              key={member.id}
              src={member.image || `https://ui-avatars.com/api/?name=${member.name}`}
              className="size-7 rounded-full border-2 border-slate-900 object-cover"
              alt={member.name}
            />
          ))}
          {project.members.length > 3 && (
            <div className="size-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-bone/60">
              +{project.members.length - 3}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button className="p-2 text-bone/40 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
            <Edit2 className="w-4.5 h-4.5" />
          </button>
          <button className="p-2 text-bone/40 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
            {project.status === 'PAUSED' ? <Archive className="w-4.5 h-4.5" /> : <BarChart2 className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
