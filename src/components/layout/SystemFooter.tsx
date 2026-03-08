"use client";

import { usePathname } from "next/navigation";

export function SystemFooter() {
  const pathname = usePathname();

  // Don't show on auth/landing routes
  const isAuthRoute = [
    "/",
    "/login",
    "/register",
    "/onboarding",
    "/manifesto",
    "/changelog",
  ].includes(pathname);
  if (isAuthRoute) return null;

  return (
    <footer className="h-7 border-t border-border px-5 flex items-center justify-between bg-card/50 backdrop-blur-sm z-50 shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        <span className="text-[10px] text-muted-foreground/50 font-medium">
          Connected
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground/30 font-medium">
        VedCode · {new Date().getFullYear()}
      </span>
    </footer>
  );
}
