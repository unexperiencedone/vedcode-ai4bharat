"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noPadding = ["/", "/login", "/register", "/onboarding", "/manifesto", "/changelog"];
  const skipPadding = noPadding.includes(pathname);

  return (
    <main className={cn(
      "flex-1 flex flex-col",
      !skipPadding ? "pt-0" : "pt-0" // WorkspaceLayout handles padding/scrolling for app routes
    )}>
      {children}
    </main>
  );
}
