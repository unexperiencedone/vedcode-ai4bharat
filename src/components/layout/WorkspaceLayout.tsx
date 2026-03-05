"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/learn": "Learn",
  "/explore": "Explore",
  "/guard": "Guard",
  "/compiler": "Compiler",
  "/vedacode": "Knowledge Studio",
  "/documentExplainer": "Document Explainer",
  "/vault": "Vault",
  "/atelier": "Atelier",
  "/skill-tree": "Skills",
  "/ui-library": "UI Library",
};

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = [
    "/",
    "/login",
    "/register",
    "/onboarding",
    "/manifesto",
    "/changelog",
  ].includes(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Resolve a clean page label
  const matchedKey = Object.keys(PAGE_LABELS).find((k) =>
    pathname.startsWith(k)
  );
  const pageLabel = matchedKey
    ? PAGE_LABELS[matchedKey]
    : pathname.split("/").filter(Boolean).map((s) =>
        s.charAt(0).toUpperCase() + s.slice(1)
      ).join(" › ");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Global top bar */}
      <CommandHeaderShell />

      <div className="flex flex-1 overflow-hidden">
        <ClusterRailShell />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Subtle page header / breadcrumb */}
          <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-card/30 shrink-0 z-10">
            <span className="text-xs font-medium text-muted-foreground/50">
              Ved Code
            </span>
            <span className="text-muted-foreground/25 text-xs">›</span>
            <span className="text-xs font-semibold text-foreground/70">
              {pageLabel}
            </span>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto z-10 relative custom-scrollbar">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// These are re-imported in the actual file — we keep it as barrel imports
import { CommandHeader as CommandHeaderShell } from "./CommandHeader";
import { ClusterRail as ClusterRailShell } from "./ClusterRail";
import { SystemFooter } from "./SystemFooter";
