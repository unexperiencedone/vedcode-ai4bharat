"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Grid, 
  Lock, 
  PenTool, 
  FlaskConical, 
  Wrench, 
  Settings 
} from "lucide-react";

export function ClusterRail() {
  const pathname = usePathname();

  const clusters = [
    { name: "Projects", icon: Grid, href: "/", active: pathname === "/" },
    { name: "Vault", icon: Lock, href: "/vault", active: pathname.startsWith("/vault") },
    { name: "Atelier", icon: PenTool, href: "/atelier", active: pathname.startsWith("/atelier") },
    { name: "Lab", icon: FlaskConical, href: "/skill-tree", active: pathname.startsWith("/skill-tree") },
    { name: "Tools", icon: Wrench, href: "/ui-library", active: pathname.startsWith("/ui-library") },
  ];

  return (
    <aside className="w-16 flex flex-col items-center py-6 border-r border-white/10 bg-background/50 backdrop-blur-sm z-20">
      <nav className="flex flex-col gap-6">
        {clusters.map((cluster) => (
          <Link
            key={cluster.name}
            href={cluster.href}
            title={cluster.name}
            className={cn(
              "p-2.5 rounded-lg transition-all duration-300 group relative",
              cluster.active 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"
            )}
          >
            <cluster.icon className="w-5 h-5" />
            <span className="absolute left-14 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border/10">
                {cluster.name}
            </span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto flex flex-col gap-6">
        <button className="p-2.5 rounded-lg text-muted-foreground/40 hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
