"use client";

import { Search, FolderOpen } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/UserMenu";

export function CommandHeader() {
  const { data: session } = useSession();
  const user = session?.user as any; // Cast to any to access custom fields like handle

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <FolderOpen className="text-white w-[14px] h-[14px]" />
          </div>
          <h1 className="font-bold text-sm tracking-tight text-foreground uppercase">
            The Archive
          </h1>
        </div>

        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <input
            type="text"
            className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-10 pr-12 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/30 text-foreground"
            placeholder="Search components..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground/50 border border-white/10">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.1em] text-primary uppercase">
            System Operational
          </span>
        </div>

        <div className="h-4 w-px bg-white/10"></div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/60 font-medium hidden sm:inline-block tracking-widest">
            {user?.handle ? `@${user.handle}` : "Core v4.0.2"}
          </span>
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
