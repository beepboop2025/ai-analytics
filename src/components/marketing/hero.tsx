import Link from "next/link"
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

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
      <div className="data-grid pointer-events-none absolute inset-0 -z-20 opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-0 -z-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_oklch(0.82_0.05_210_/_0.65),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 -z-10 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,_oklch(0.88_0.05_80_/_0.55),transparent_70%)] blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <div className="eyebrow">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Decision intelligence for finance, RevOps, and product teams
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Turn raw exports into executive-ready answers in one workspace.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Upload operational data, ask questions in plain English, and move from rows to
              charts, summaries, and reports without waiting on a BI sprint.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
              <Button size="lg" asChild className="h-12 rounded-full px-6 text-base shadow-lg shadow-primary/20">
                <Link href="/signup">
                  Start free workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 rounded-full border-border/80 bg-background/75 px-6 text-base backdrop-blur"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.title} className="metric-chip">
                  <point.icon className="h-5 w-5 text-primary" />
                  <div className="mt-4 text-base font-semibold">{point.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">CSV</span>
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">Excel</span>
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">JSON</span>
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">Natural-language analysis</span>
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">Shareable reports</span>
            </div>
          </div>

          <div className="surface-panel relative overflow-hidden p-5 sm:p-6 lg:p-7">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(90deg,rgba(74,144,226,0.10),rgba(120,208,176,0.08),transparent)]" />
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

                <div className="inline-flex items-center gap-2 self-start rounded-full border border-border/70 bg-background/85 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                  <CircleGauge className="h-3.5 w-3.5 text-primary" />
                  Live sample workspace
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {scorecards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-border/70 bg-background/75 p-4 backdrop-blur">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {card.label}
                    </div>
                    <div className="mt-4 text-3xl font-semibold tracking-tight">{card.value}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{card.detail}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.46))] p-5 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
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
                  <div className="rounded-[1.75rem] border border-border/70 bg-background/82 p-5 backdrop-blur">
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
                          className="flex-1 rounded-t-2xl bg-[linear-gradient(180deg,rgba(74,144,226,0.92),rgba(74,144,226,0.32))]"
                          style={{ height: `${height}%`, opacity: 0.7 + index * 0.04 }}
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

                  <div className="rounded-[1.75rem] border border-border/70 bg-primary/[0.08] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Ask DataLens
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      &quot;Which segment is slowing conversion the fastest?&quot;
                    </p>
                    <p className="mt-4 rounded-2xl bg-background/85 p-4 text-sm leading-6 text-muted-foreground backdrop-blur">
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
