"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Database,
  FileText,
  Home,
  MessageSquare,
  Settings,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/analyze", label: "Analyze", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: FileText },
]

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 flex-col border-r border-border/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,250,252,0.88))] backdrop-blur-2xl md:flex dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,23,42,0.25))]">
      <div className="border-b border-border/40 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.52_0.12_280)] shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/30">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base font-semibold">DataLens AI</div>
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Workspace
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Operating layer
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Upload data, analyze it quickly, and keep reports and billing in one product.
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
              pathname === item.href
                ? "bg-foreground text-background shadow-[0_8px_24px_-8px_rgba(15,23,42,0.35)]"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground hover:translate-x-0.5",
            )}
          >
            <span className={cn(
              "absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300",
              pathname === item.href ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
            )} />
            <item.icon className={cn("h-4 w-4 transition-all duration-300", pathname === item.href ? "scale-110" : "group-hover:scale-105")} />
            {item.label}
          </Link>
        ))}

        <div className="mt-auto space-y-4 pt-6">
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/40 hover:border-primary/15 hover:shadow-[0_4px_16px_-8px_rgba(30,58,138,0.06)]">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Need more headroom?
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Manage plan limits, file size capacity, and upgrades from billing.
            </p>
            <Link
              href="/billing"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-200 hover:text-primary/80 hover:gap-3"
            >
              Open billing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-1">
            {bottomItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  pathname === item.href
                    ? "bg-foreground text-background shadow-[0_8px_24px_-8px_rgba(15,23,42,0.35)]"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground hover:translate-x-0.5",
                )}
              >
                <span className={cn(
                  "absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300",
                  pathname === item.href ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                )} />
                <item.icon className={cn("h-4 w-4 transition-all duration-300", pathname === item.href && "scale-110")} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
