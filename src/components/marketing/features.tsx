"use client"

import { useEffect, useRef, useState } from "react"
import {
  BarChart3,
  CreditCard,
  FileUp,
  MessageSquare,
  ScanSearch,
  Settings2,
  Sparkles,
} from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: FileUp,
    title: "Upload operational data as-is",
    description:
      "Bring CSV, Excel, and JSON exports directly into the workspace and keep file names, row counts, and structure visible.",
    bullets: ["Multi-format ingestion", "Recent dataset history", "File size and row visibility"],
  },
  {
    icon: MessageSquare,
    title: "Ask questions in plain English",
    description:
      "Move from spreadsheets to answers quickly with natural-language prompts that surface trends, anomalies, and segment shifts.",
    bullets: ["No SQL required", "Narrative summaries", "Faster first-pass analysis"],
  },
  {
    icon: BarChart3,
    title: "Turn findings into charts and reports",
    description:
      "Translate analysis into visual outputs and saved reports your team can review without another tool handoff.",
    bullets: ["Executive-ready visuals", "Stored reports", "Reusable dataset context"],
  },
  {
    icon: ScanSearch,
    title: "Keep every dataset legible",
    description:
      "Track rows, columns, formats, and upload history so every analysis starts with context, not guesswork.",
    bullets: ["Column visibility", "Format awareness", "Recent activity tracking"],
  },
  {
    icon: CreditCard,
    title: "Commercial controls are built in",
    description:
      "Stripe checkout, billing management, and plan-based workspace limits are already wired into the product.",
    bullets: ["Self-serve upgrades", "Usage boundaries", "Billing portal support"],
  },
  {
    icon: Settings2,
    title: "Run a real SaaS workflow",
    description:
      "Authentication, email verification flows, rate limits, and workspace navigation are already part of the operating layer.",
    bullets: ["Session-based access", "Email verification", "Rate-limited APIs"],
  },
]

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="platform" className="px-4 py-24 sm:px-6 lg:px-8" ref={sectionRef}>
      <div className="mx-auto max-w-7xl">
        <div className={`max-w-3xl ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Platform
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A sharper operating system for teams that live in exports and weekly reviews.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            DataLens AI is strongest when your team needs answers fast, but still needs enough
            context and structure to trust what it sees.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className={`surface-panel group border-border/50 py-0 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_-16px_rgba(30,58,138,0.14)] hover:border-primary/20 dark:hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.5)] dark:hover:border-primary/15 ${visible ? `animate-fade-in-up animate-delay-${(i + 1) * 100}` : "opacity-0"}`}
            >
              <CardHeader className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-7">{feature.description}</CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  {feature.bullets.map((bullet) => (
                    <span
                      key={bullet}
                      className="rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors duration-200 group-hover:bg-background/80"
                    >
                      {bullet}
                    </span>
                  ))}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
