"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main className={cn(
      "flex-1 flex flex-col",
      !isHome && "pt-16"
    )}>
      {children}
    </main>
  );
}
