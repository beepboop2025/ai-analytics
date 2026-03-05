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
  return (
    <section id="use-cases" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
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
          {useCases.map((useCase) => (
            <Card key={useCase.team} className="surface-panel border-border/70 py-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                    <useCase.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {useCase.team}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-semibold tracking-tight">{useCase.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{useCase.description}</p>

                <div className="mt-6 rounded-3xl border border-border/70 bg-muted/45 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Questions teams ask
                  </div>
                  <ul className="mt-3 space-y-3">
                    {useCase.questions.map((question) => (
                      <li key={question} className="flex items-start gap-3 text-sm text-foreground">
                        <ArrowRight className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {useCase.outputs.map((output) => (
                    <span
                      key={output}
                      className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground"
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
