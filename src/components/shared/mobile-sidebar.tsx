"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, CreditCard, Database, FileText, Home, Menu, MessageSquare, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/analyze", label: "Analyze", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-border/40 bg-background/95 p-0 backdrop-blur-xl">
        <div className="border-b border-border/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.52_0.12_280)] shadow-lg shadow-primary/20">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base font-semibold">DataLens AI</div>
              <div className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                Workspace
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border/50 bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
            Review datasets, start analysis, and manage billing without leaving the workspace.
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                pathname === item.href
                  ? "bg-foreground text-background shadow-[0_8px_24px_-8px_rgba(15,23,42,0.35)]"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
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
        </nav>
      </SheetContent>
    </Sheet>
  )
}
