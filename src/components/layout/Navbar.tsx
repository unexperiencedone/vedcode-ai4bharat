"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

import { UserMenu } from "@/components/auth/UserMenu"
import { SignInButton } from "@/components/auth/SignInButton"

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: "Joint Works", href: "/dashboard" },
    { name: "The Vault", href: "/vault" },
    { name: "The Atelier", href: "/atelier" },
    { name: "Guild Hall", href: "/guild-hall" },
    { name: "Skill Tree", href: "/skill-tree" },
  ]

  const publicRoutes = ["/", "/login", "/register"];
  if (publicRoutes.includes(pathname)) return null;

  return (
    <nav className="fixed top-0 w-full z-50 h-16 border-b border-border/10 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Logo Area */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
              A
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              The Archive
            </span>
          </Link>

          {/* Main Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors pb-5 mt-5 border-b-2",
                  pathname === item.href
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-accent/50 border border-border px-3 py-1.5 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM OPERATIONAL
          </div>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
             <Search className="w-5 h-5" />
          </Button>

          {user ? (
            <UserMenu user={user} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </nav>
  )
}
