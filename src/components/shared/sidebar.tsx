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
    <aside className="hidden w-72 flex-col border-r border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,250,252,0.92))] md:flex dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,23,42,0.28))]">
      <div className="border-b border-border/70 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(74,144,226,1),rgba(53,91,184,1))] shadow-lg shadow-primary/20">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base font-semibold">DataLens AI</div>
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Workspace
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-background/75 p-4 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Operating layer
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Upload data, analyze it quickly, and keep reports and billing in one product.
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
              pathname === item.href
                ? "bg-foreground text-background shadow-[0_20px_35px_-28px_rgba(15,23,42,0.85)]"
                : "text-muted-foreground hover:bg-background/85 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        <div className="mt-auto space-y-4 pt-6">
          <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Need more headroom?
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Manage plan limits, file size capacity, and upgrades from billing.
            </p>
            <Link
              href="/billing"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
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
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-foreground text-background shadow-[0_20px_35px_-28px_rgba(15,23,42,0.85)]"
                    : "text-muted-foreground hover:bg-background/85 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
