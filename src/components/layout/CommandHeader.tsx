"use client";

import { Search, FolderOpen, X, Plus, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useTabs } from "@/components/providers/TabProvider";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CommandHeader() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { tabs, activeTabId, removeTab, setActiveTab } = useTabs();

  return (
    <header className="h-12 flex items-center border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
      {/* Left: Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-4 border-r border-border h-full min-w-[140px] hover:bg-accent transition-colors"
      >
        <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center shadow-sm">
          <FolderOpen className="text-white w-3 h-3" />
        </div>
        <span className="font-semibold text-sm text-foreground hidden lg:block tracking-tight">
          VedCode
        </span>
      </Link>

      {/* Center: Open tabs */}
      <div className="flex items-center h-full flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center h-full px-4 gap-2 border-r border-border cursor-pointer min-w-[110px] max-w-[180px] transition-all relative select-none",
              tab.active
                ? "bg-background text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/50",
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.active && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
            <span className="text-[12px] font-medium truncate">
              {tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className={cn(
                "ml-auto p-0.5 rounded hover:bg-accent transition-colors opacity-0 group-hover:opacity-100 shrink-0",
                tab.active && "opacity-40 hover:opacity-100",
              )}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button className="px-3 h-full flex items-center text-muted-foreground/30 hover:text-muted-foreground transition-colors hover:bg-accent/50 shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: User */}
      <div className="flex items-center gap-3 px-4 border-l border-border h-full shrink-0">
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded border border-border/50 text-[10px] text-muted-foreground/50 font-mono select-none">
          <span className="text-[12px]">⌘</span> K
        </div>
        {user?.handle && (
          <span className="text-xs text-muted-foreground/50 font-medium hidden sm:block">
            {user.handle}
          </span>
        )}
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <div className="w-7 h-7 rounded-full bg-muted border border-border animate-pulse" />
        )}
      </div>
    </header>
  );
}
