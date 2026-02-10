"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noPadding = ["/", "/login", "/register"];
  const skipPadding = noPadding.includes(pathname);

  return (
    <main className={cn(
      "flex-1 flex flex-col",
      !skipPadding && "pt-16"
    )}>
      {children}
    </main>
  );
}
