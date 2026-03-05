"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  ShieldAlert,
  Code2,
  Brain,
  FileSearch,
  Settings,
} from "lucide-react";

const clusters = [
  // Core hub
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  // Divider group: learning tools
  { name: "Learn", icon: BookOpen, href: "/learn" },
  { name: "Explore", icon: Compass, href: "/explore" },
  { name: "Guard", icon: ShieldAlert, href: "/guard" },
  // Tools
  { name: "Compiler", icon: Code2, href: "/compiler" },
  { name: "Knowledge Studio", icon: Brain, href: "/vedacode" },
  { name: "Doc Explainer", icon: FileSearch, href: "/documentExplainer" },
];

export function ClusterRail() {
  const pathname = usePathname();

  return (
    <aside className="w-14 flex flex-col items-center py-5 border-r border-border bg-card/50 backdrop-blur-sm z-20 shrink-0">
      <nav className="flex flex-col gap-1 w-full px-2">
        {clusters.map((cluster, i) => {
          const isActive =
            cluster.href === "/dashboard"
              ? pathname.startsWith("/dashboard")
              : pathname.startsWith(cluster.href);

          return (
            <div key={cluster.name}>
              {/* Visual divider between core and tools */}
              {i === 4 && (
                <div className="mx-2 my-2 border-t border-border/60" />
              )}
              <Link
                href={cluster.href}
                title={cluster.name}
                className={cn(
                  "group relative flex items-center justify-center w-full h-9 rounded-md transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <cluster.icon className="w-4 h-4 shrink-0" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-2.5 z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {cluster.name}
                </span>
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[1px] w-0.5 h-5 rounded-r-full bg-primary" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto px-2 w-full">
        <button
          title="Settings"
          className="group relative flex items-center justify-center w-full h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
        >
          <Settings className="w-4 h-4" />
          <span className="pointer-events-none absolute left-full ml-2.5 z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
}
