"use client"

import { useEffect, useRef, useState } from "react"
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
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="px-4 pb-24 pt-8 sm:px-6 lg:px-8" ref={sectionRef}>
      <div className="mx-auto max-w-7xl">
        <div className={`relative overflow-hidden rounded-3xl border border-slate-800/30 bg-[linear-gradient(135deg,#0f172a,#1a2744_55%,#1d3557)] text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.6)] transition-all duration-700 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          {/* Subtle animated gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-indigo-500/[0.08] animate-gradient" />
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,_rgba(100,149,237,0.15),transparent_70%)] blur-3xl animate-float" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,_rgba(120,130,240,0.12),transparent_70%)] blur-3xl animate-float [animation-delay:2s]" />

          <div className="relative grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.95fr] lg:px-12 lg:py-14">
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
                  className="group h-12 rounded-full bg-white px-7 text-base text-slate-950 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.25)] transition-all duration-300 hover:bg-white/95 hover:shadow-[0_8px_30px_-4px_rgba(255,255,255,0.35)] hover:scale-[1.03]"
                >
                  <Link href="/signup">
                    Start free workspace
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-base text-white transition-all duration-300 hover:bg-white/10 hover:border-white/30"
                >
                  <Link href="/pricing">Compare plans</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {readinessItems.map((item, i) => (
                <div
                  key={item.title}
                  className={`group rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/15 hover:-translate-y-0.5 ${visible ? `animate-fade-in-up animate-delay-${(i + 2) * 100}` : "opacity-0"}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 transition-all duration-300 group-hover:bg-white/15 group-hover:scale-110">
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
