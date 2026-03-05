import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CreditCard, FileText, ShieldCheck, Upload } from "lucide-react"

const readinessItems = [
  {
    icon: Upload,
    title: "Bring the files you already export",
    description: "Upload operational CSV, Excel, or JSON files without waiting on data engineering.",
  },
  {
    icon: FileText,
    title: "Produce a summary your team can use",
    description: "Move from ad hoc questions to structured charts, findings, and saved reports.",
  },
  {
    icon: CreditCard,
    title: "Run it like a real product",
    description: "Plan limits, billing flows, and workspace management are already part of the experience.",
  },
  {
    icon: ShieldCheck,
    title: "Operate with guardrails",
    description: "Authentication flows, rate limiting, and account controls help the product feel deployable.",
  },
]

export function CTA() {
  return (
    <section className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-900/10 bg-[linear-gradient(135deg,#0f172a,#14213d_55%,#1d3557)] text-white shadow-[0_30px_100px_-45px_rgba(15,23,42,0.9)]">
          <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.95fr] lg:px-12 lg:py-14">
            <div>
              <div className="eyebrow border-white/15 bg-white/5 text-white/75">
                Production-ready workspace
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Give every operator a faster path from spreadsheet to decision.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                DataLens AI already combines dataset ingestion, AI analysis, reports, plan controls,
                and billing. What it needs is your data and your operating rhythm.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full bg-white px-6 text-base text-slate-950 hover:bg-white/90"
                >
                  <Link href="/signup">
                    Start free workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10"
                >
                  <Link href="/pricing">Compare plans</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {readinessItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.8)] backdrop-blur"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <item.icon className="h-5 w-5 text-sky-200" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
