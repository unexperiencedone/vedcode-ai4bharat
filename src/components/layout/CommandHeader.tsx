"use client";

import { Search, FolderOpen, X, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useTabs } from "@/components/providers/TabProvider";
import { cn } from "@/lib/utils";

export function CommandHeader() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { tabs, activeTabId, removeTab, setActiveTab } = useTabs();

  return (
    <header className="h-12 flex items-center border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-4 px-4 border-r border-white/5 h-full shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.4)]">
            <FolderOpen className="text-white w-3 h-3" />
          </div>
          <h1 className="font-bold text-xs tracking-tight text-foreground uppercase hidden lg:block">
            The Archive
          </h1>
        </div>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center h-full flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center h-full px-4 gap-2.5 border-r border-white/5 cursor-pointer min-w-[120px] max-w-[180px] transition-all relative",
              tab.active
                ? "bg-white/[0.04] text-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.02]"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.active && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
            )}

            <span className="text-[11px] font-semibold tracking-wide truncate">
              {tab.title}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className={cn(
                "p-0.5 rounded-sm hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0",
                tab.active && "opacity-60"
              )}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button className="px-3 h-full flex items-center text-muted-foreground/20 hover:text-primary transition-colors hover:bg-white/[0.02] shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Status + Profile */}
      <div className="flex items-center gap-4 px-4 border-l border-white/5 h-full shrink-0">
        <div className="flex items-center gap-2 hidden md:flex">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.1em] text-primary uppercase">
            Online
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-muted-foreground/50 font-medium hidden sm:inline-block">
            {user?.handle ? `@${user.handle}` : ""}
          </span>
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
