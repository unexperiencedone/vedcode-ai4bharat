import { FileSymlink, AlertCircle, FileCode2 } from "lucide-react";

export function ImpactList({ impacts }: { impacts: any[] }) {
  if (!impacts || impacts.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
        <FileSymlink className="w-5 h-5 text-primary" />
        Detected Impact Chain
      </h3>

      <div className="flex flex-col gap-4">
        {impacts.map((impact) => (
          <div
            key={impact.id}
            className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:border-border transition-colors"
          >
            {/* Header */}
            <div className="border-b border-border/50 bg-muted/20 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground/90">
                  {impact.targetFile}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {impact.severity === "high" && (
                  <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                    High Risk
                  </span>
                )}
                {impact.severity === "medium" && (
                  <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                    Medium Risk
                  </span>
                )}
                {impact.severity === "low" && (
                  <span className="bg-blue-500/10 text-blue-500 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                    Low Risk
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex items-start gap-4">
              <div className="mt-0.5">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium mr-2">
                    Why it broke:
                  </span>
                  {impact.reason}
                </p>
                <div className="mt-3 text-xs font-mono text-muted-foreground/70 bg-background/50 p-2 rounded border border-border/30 inline-block w-fit">
                  Triggered by changes in {impact.sourceFile}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
