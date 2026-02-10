"use client";

export function SystemFooter() {
  return (
    <footer className="h-8 border-t border-white/10 px-6 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground/30 bg-background/50 backdrop-blur-sm z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
          <span>CPU: 12%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
          <span>MEM: 4.2GB / 16GB</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--primary)]"></span>
          <span>NET: 420MB/s</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span>ARCHIVE_NODE_01</span>
        <span>UTC 14:22:11</span>
      </div>
    </footer>
  );
}
