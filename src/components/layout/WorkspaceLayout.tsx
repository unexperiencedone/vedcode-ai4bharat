"use client";

import { usePathname } from "next/navigation";
import { CommandHeader } from "./CommandHeader";
import { ClusterRail } from "./ClusterRail";
import { SystemFooter } from "./SystemFooter";
import { cn } from "@/lib/utils";

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = ["/", "/login", "/register", "/onboarding", "/manifesto", "/changelog"].includes(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      <CommandHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <ClusterRail />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#3c83f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

          {/* Breadcrumb / Path */}
          <div className="px-8 py-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/20 border-b border-white/5 z-10 bg-background/50 backdrop-blur-sm">
            <span className="text-primary/40">Terminal</span>
            <span className="text-white/10">/</span>
            <span className="text-foreground/60">{pathname.replace("/", "").replace(/\//g, " / ")}</span>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto z-10 relative custom-scrollbar">
            {children}
          </div>
        </main>
      </div>

      <SystemFooter />
    </div>
  );
}
