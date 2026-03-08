"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CommandHeader as CommandHeaderShell } from "./CommandHeader";
import { ClusterRail as ClusterRailShell } from "./ClusterRail";
import { AITutorSidebar } from "@/components/ui/AITutorSidebar";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/learn": "Learn",
  "/explore": "Explore",
  "/guard": "Guard",
  "/compiler": "Compiler",
  "/vedcode": "Knowledge Studio",
  "/documentExplainer": "Document Explainer",
  "/workspace": "IDE Workspace",
  "/roadmap": "Learning Roadmap",
  "/vault": "Vault",
  "/atelier": "Atelier",
  "/skill-tree": "Skills",
  "/ui-library": "UI Library",
};

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Debug log to terminal
  console.log("[WorkspaceLayout] rendering for path:", pathname);

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
    pathname.startsWith(k),
  );
  const pageLabel = matchedKey
    ? PAGE_LABELS[matchedKey]
    : pathname
        .split("/")
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" › ");

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      <ClusterRailShell />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        <CommandHeaderShell />

        <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {/* Subtle page header / breadcrumb */}
          <div className="flex items-center gap-3 px-6 py-2 border-b border-border bg-card/30 shrink-0 z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40">
                System Active
              </span>
            </div>
            <span className="text-muted-foreground/20 text-xs">/</span>
            <span className="text-xs font-bold text-foreground/70 tracking-tight">
              {pageLabel}
            </span>
            <div className="flex-1" />
            
            {/* Toggle Button for the Chat Panel */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800/50 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
              title={isChatOpen ? "Hide Mentor Chat" : "Show Mentor Chat"}
            >
              {isChatOpen ? (
                 <>
                   <PanelRightClose size={14} />
                   <span>Hide Chat</span>
                 </>
              ) : (
                <>
                  <PanelRightOpen size={14} />
                   <span className="text-indigo-400">Mentor</span>
                </>
              )}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 flex flex-col relative bg-background overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      {isChatOpen && <AITutorSidebar />}
    </div>
  );

}
