"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, CircleGauge, DatabaseZap, ShieldCheck, Sparkles } from "lucide-react"

const proofPoints = [
  {
    title: "Bring exports as-is",
    description: "Upload CSV, Excel, and JSON files without modeling them first.",
    icon: DatabaseZap,
  },
  {
    title: "Ask better questions",
    description: "Move from raw rows to narrative answers with plain-English prompts.",
    icon: Sparkles,
  },
  {
    title: "Share decision-ready output",
    description: "Package charts, findings, and reports in the same workspace.",
    icon: ShieldCheck,
  },
]

const scorecards = [
  { label: "Pipeline coverage", value: "92%", detail: "Tracked across regions" },
  { label: "Conversion shift", value: "-3.1 pts", detail: "SMB segment week over week" },
  { label: "Forecast confidence", value: "High", detail: "Strong historical consistency" },
]

function useScrollVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

export function Hero() {
  const contentObs = useScrollVisible(0.1)
  const panelObs = useScrollVisible(0.1)

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-primary/[0.04] via-transparent to-[oklch(0.72_0.08_200_/_0.04)] animate-gradient" />
      <div className="data-grid pointer-events-none absolute inset-0 -z-20 opacity-30" />
      <div className="pointer-events-none absolute -left-24 top-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_oklch(0.78_0.06_240_/_0.45),transparent_70%)] blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-0 top-20 -z-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_oklch(0.82_0.05_200_/_0.35),transparent_70%)] blur-3xl animate-float [animation-delay:2s]" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div
            ref={contentObs.ref}
            className={contentObs.visible ? "animate-fade-in-up" : "opacity-0"}
          >
            <div className="eyebrow">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Decision intelligence for finance, RevOps, and product teams
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl leading-[1.08]">
              Turn raw exports into{" "}
              <span className="bg-gradient-to-r from-primary via-[oklch(0.58_0.12_280)] to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                executive-ready answers
              </span>{" "}
              in one workspace.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Upload operational data, ask questions in plain English, and move from rows to
              charts, summaries, and reports without waiting on a BI sprint.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
              <Button size="lg" asChild className="btn-gradient group h-12 px-7 text-base">
                <Link href="/signup">
                  Start free workspace
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 rounded-full border-border/60 bg-background/60 px-6 text-base backdrop-blur-sm transition-all duration-300 hover:bg-background/80 hover:shadow-[0_4px_20px_-8px_rgba(30,58,138,0.15)] hover:border-primary/30"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {proofPoints.map((point, i) => (
                <div
                  key={point.title}
                  className={`metric-chip ${contentObs.visible ? `animate-fade-in-up animate-delay-${(i + 2) * 100}` : "opacity-0"}`}
                >
                  <point.icon className="h-5 w-5 text-primary" />
                  <div className="mt-4 text-base font-semibold">{point.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {["CSV", "Excel", "JSON", "Natural-language analysis", "Shareable reports"].map((tag) => (
                <span key={tag} className="rounded-full border border-border/50 bg-background/60 px-3 py-1.5 backdrop-blur-sm transition-all duration-300 hover:bg-background/80 hover:border-primary/25 hover:shadow-[0_2px_8px_-2px_rgba(30,58,138,0.08)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div
            ref={panelObs.ref}
            className={`surface-panel relative overflow-hidden p-5 sm:p-6 lg:p-7 ${panelObs.visible ? "animate-fade-in-up animate-delay-200" : "opacity-0"}`}
          >
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(90deg,rgba(74,144,226,0.08),rgba(120,208,176,0.06),transparent)]" />
            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Executive workspace
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Weekly revenue review
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                    DataLens AI combines uploaded datasets, AI analysis, and reports so operators can
                    move faster from spreadsheet to decision.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-full border border-border/50 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  <CircleGauge className="h-3.5 w-3.5 text-primary" />
                  Live sample workspace
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {scorecards.map((card, i) => (
                  <div
                    key={card.label}
                    className={`rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${panelObs.visible ? `animate-fade-in-up animate-delay-${(i + 3) * 100}` : "opacity-0"}`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {card.label}
                    </div>
                    <div className="mt-4 text-3xl font-semibold tracking-tight">{card.value}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{card.detail}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-2xl border border-border/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.46))] p-5 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Narrative summary</div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      Board brief
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    Pipeline value remains healthy, but new logo velocity is softening in the SMB
                    segment. Expansion revenue is offsetting the dip, with the strongest performance
                    coming from enterprise renewals in the West.
                  </p>
                  <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      Expansion revenue contributed the majority of this week&apos;s lift.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      Conversion softness is isolated to lower ACV inbound opportunities.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      The recommended next action is a segment-level funnel review with marketing and sales.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/50 bg-background/70 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Funnel health</div>
                        <div className="text-xs text-muted-foreground">Week over week trend</div>
                      </div>
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-6 flex h-32 items-end gap-2">
                      {[58, 66, 72, 68, 75, 82, 88].map((height, index) => (
                        <div
                          key={height}
                          className={`flex-1 rounded-t-xl bg-[linear-gradient(180deg,oklch(0.58_0.12_248),oklch(0.58_0.12_248_/_0.3))] transition-all duration-500 hover:brightness-110 ${panelObs.visible ? "animate-bar-grow" : "opacity-0"}`}
                          style={{
                            height: `${height}%`,
                            opacity: 0.7 + index * 0.04,
                            animationDelay: `${400 + index * 80}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-5 transition-all duration-300 hover:bg-primary/[0.09]">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Ask DataLens
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      &quot;Which segment is slowing conversion the fastest?&quot;
                    </p>
                    <p className="mt-4 rounded-xl bg-background/80 p-4 text-sm leading-6 text-muted-foreground backdrop-blur-sm">
                      SMB inbound is down 3.1 points week over week, driven by lower demo attendance
                      in North America. Enterprise conversion remains stable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
