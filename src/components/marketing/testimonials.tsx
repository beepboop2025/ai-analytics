"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BriefcaseBusiness, LineChart, Wallet } from "lucide-react"

const useCases = [
  {
    icon: Wallet,
    team: "Finance",
    title: "Shorten the monthly review cycle",
    description:
      "Work from exported ledgers, pipeline snapshots, and variance files without waiting for a custom dashboard.",
    questions: [
      "Which segments created the biggest margin change this month?",
      "Where are renewals masking weakness in new logo performance?",
    ],
    outputs: ["Narrative summary", "Variance charts", "Leadership report"],
  },
  {
    icon: LineChart,
    team: "Revenue operations",
    title: "Find the story behind funnel shifts",
    description:
      "Investigate conversion swings, pipeline mix, and regional changes from the same workspace where the data lands.",
    questions: [
      "Which segment is slowing conversion week over week?",
      "Where is pipeline quality improving, but deal velocity is falling?",
    ],
    outputs: ["Segment analysis", "Trend visuals", "Exec-ready recap"],
  },
  {
    icon: BriefcaseBusiness,
    team: "Product and strategy",
    title: "Translate usage data into action",
    description:
      "Move from exported product metrics to faster decisions on activation, retention, and roadmap conversations.",
    questions: [
      "What changed in activation after the last release?",
      "Which cohorts are dragging retention despite healthy top-line usage?",
    ],
    outputs: ["Cohort insights", "Report drafts", "Stakeholder brief"],
  },
]

export function Testimonials() {
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
    <section id="use-cases" className="px-4 py-24 sm:px-6 lg:px-8" ref={sectionRef}>
      <div className="mx-auto max-w-7xl">
        <div className={`grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div>
            <div className="eyebrow">Use cases</div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Built for the teams that still run critical decisions through spreadsheets.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Instead of inventing fake customer logos, the product should clearly show where it is
            useful: recurring reviews, exported metrics, and fast executive readouts.
          </p>
        </div>

        <div className="mt-14 grid gap-6 xl:grid-cols-3">
          {useCases.map((useCase, i) => (
            <Card
              key={useCase.team}
              className={`surface-panel group border-border/50 py-0 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_-16px_rgba(30,58,138,0.14)] hover:border-primary/20 dark:hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.5)] dark:hover:border-primary/15 ${visible ? `animate-fade-in-up animate-delay-${(i + 2) * 100}` : "opacity-0"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
                    <useCase.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full border border-border/50 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
                    {useCase.team}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-semibold tracking-tight">{useCase.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{useCase.description}</p>

                <div className="mt-6 rounded-2xl border border-border/50 bg-muted/35 p-4 transition-colors duration-300 group-hover:bg-muted/50">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Questions teams ask
                  </div>
                  <ul className="mt-3 space-y-3">
                    {useCase.questions.map((question) => (
                      <li key={question} className="flex items-start gap-3 text-sm text-foreground">
                        <ArrowRight className="mt-0.5 h-4 w-4 text-primary transition-transform duration-200 group-hover:translate-x-0.5" />
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {useCase.outputs.map((output) => (
                    <span
                      key={output}
                      className="rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors duration-200 group-hover:bg-background/80"
                    >
                      {output}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
