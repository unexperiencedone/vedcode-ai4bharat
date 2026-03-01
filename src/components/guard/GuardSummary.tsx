import { ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";

export function GuardSummary({ changes = 1, impacts = 3 }: { changes?: number; impacts?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* Overview Card */}
      <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Action Required</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-1">{changes} File Modified</h3>
          <p className="text-sm text-muted-foreground">This local change creates a ripple effect down the AST chain.</p>
        </div>
      </div>

      {/* Ripple Effect Stats */}
      <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col justify-between shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-red-500 bg-red-500/10 px-2 py-1 rounded">{impacts} Impacts</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-1">Breaking Ripple</h3>
          <p className="text-sm text-muted-foreground">Modifications identified that could break downstream components.</p>
        </div>
      </div>

      {/* Protection Status */}
      <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col justify-between shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Safeguard Active</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-1">Context Guard</h3>
          <p className="text-sm text-muted-foreground">No automatic fixes applied. Review the impact analysis below to proceed.</p>
        </div>
      </div>

    </div>
  );
}
