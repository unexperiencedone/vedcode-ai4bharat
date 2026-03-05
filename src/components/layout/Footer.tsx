"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export function Footer() {
  const pathname = usePathname()

  const landingRoutes = ["/", "/login", "/register", "/onboarding", "/manifesto", "/changelog"];
  if (!landingRoutes.includes(pathname)) return null;

  return (
    <footer className="border-t border-border bg-background py-8 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <span className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Ved Code
          </span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/manifesto" className="hover:text-foreground transition-colors">Manifesto</Link>
          <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
          <Link href="/tools/components" className="hover:text-foreground transition-colors">Components</Link>
        </div>
      </div>
    </footer>
  )
}
