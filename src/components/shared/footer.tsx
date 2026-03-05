import Link from "next/link"
import { BarChart3 } from "lucide-react"

const footerLinks = {
  Product: [
    { href: "/#platform", label: "Platform" },
    { href: "/#use-cases", label: "Use cases" },
    { href: "/pricing", label: "Pricing" },
  ],
  Workflow: [
    { href: "/signup", label: "Start workspace" },
    { href: "/login", label: "Sign in" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  "Product scope": [
    { href: "/#platform", label: "Dataset uploads" },
    { href: "/#platform", label: "AI analysis" },
    { href: "/#platform", label: "Reports and billing" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.75))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,23,42,0.2))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(74,144,226,1),rgba(53,91,184,1))] shadow-lg shadow-primary/20">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-lg font-semibold">DataLens AI</div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Decision intelligence
                </div>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              Built for operators who still live in exported files, recurring reviews, and high-stakes decision memos.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1.5">CSV</span>
              <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1.5">Excel</span>
              <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1.5">JSON</span>
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border/70 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DataLens AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
