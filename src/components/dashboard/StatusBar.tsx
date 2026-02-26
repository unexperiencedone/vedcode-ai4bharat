import React from "react";

export function StatusBar({ projects, stats }: { projects: any[]; stats?: any }) {
  const statusItems = projects.slice(0, 3).map(p => ({
    label: p.archiveId.split('-').slice(1).join('_'),
    status: p.status === 'LIVE' ? 'ONLINE' : p.status === 'IN_DESIGN' ? 'DESIGN' : 'PAUSED',
    color: p.status === 'LIVE' ? 'bg-emerald-500' : p.status === 'IN_DESIGN' ? 'bg-primary' : 'bg-amber-500',
    pulse: p.status === 'LIVE'
  }));

  return (
    <footer className="h-8 glass-panel border-b-0 border-x-0 flex items-center justify-between px-6 text-[10px] mono-text text-bone/30">
      <div className="flex items-center gap-6">
        {statusItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
            {item.label}: {item.status}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 uppercase tracking-widest">
        <span>Latency: {stats?.latency || '0ms'}</span>
        <span>Load: {stats?.load || '0%'}</span>
        <span>{stats?.version || 'v.0.1.0'}</span>
      </div>
    </footer>
  );
}

