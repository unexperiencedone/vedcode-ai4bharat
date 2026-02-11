"use client"

import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  
  const landingRoutes = ["/", "/login", "/register", "/onboarding", "/manifesto", "/changelog"];
  if (!landingRoutes.includes(pathname)) return null;

  return (
    <footer className="border-t border-border bg-background py-8 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center text-muted-foreground font-bold text-xs">
            A
          </div>
          <span className="text-muted-foreground text-sm">
            © 2026 The Archive. All systems nominal.
          </span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground font-mono">
            <a href="/manifesto" className="hover:text-primary transition-colors">MANIFESTO</a>
            <a href="/changelog" className="hover:text-primary transition-colors">CHANGELOG</a>
            <a href="/tools/components" className="hover:text-primary transition-colors">SYSTEM</a>
        </div>
      </div>
    </footer>
  )
}
