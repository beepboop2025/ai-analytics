"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "./theme-toggle"
import { BarChart3, Menu } from "lucide-react"

const navLinks = [
  { href: "/#platform", label: "Platform" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
]

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl shadow-[0_1px_3px_0_rgba(30,58,138,0.03)]">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.52_0.12_280)] shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-[0.01em]">DataLens AI</div>
            <div className="hidden text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
              Operational analytics workspace
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border/50 bg-background/60 p-1.5 backdrop-blur-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent/60 hover:text-foreground hover:shadow-[0_2px_8px_-4px_rgba(30,58,138,0.06)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {session ? (
            <Button asChild className="rounded-full transition-all duration-200">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="transition-all duration-200">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="btn-gradient px-5">
                <Link href="/signup">Start workspace</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-border/40 bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col gap-6 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-medium transition-all duration-200 hover:bg-accent/60"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border/40 pt-4">
                  <div className="mb-4 rounded-2xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                    Upload data, ask better questions, and turn answers into reports from one workspace.
                  </div>
                  <div className="flex flex-col gap-3">
                    {session ? (
                      <Button asChild className="rounded-full">
                        <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" asChild className="rounded-full">
                          <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
                        </Button>
                        <Button asChild className="btn-gradient">
                          <Link href="/signup" onClick={() => setOpen(false)}>Start workspace</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
