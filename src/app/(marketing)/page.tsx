import type { Metadata } from "next"
import { CTA } from "@/components/marketing/cta"
import { Features } from "@/components/marketing/features"
import { Hero } from "@/components/marketing/hero"
import { Testimonials } from "@/components/marketing/testimonials"

export const metadata: Metadata = {
  title: "Operational Analytics Workspace",
  description:
    "Upload operational datasets, ask questions in plain English, and turn raw exports into board-ready summaries, charts, and reports.",
  openGraph: {
    title: "DataLens AI | Decision Intelligence for Ops Teams",
    description: "Executive-ready analytics for finance, revenue operations, and product teams.",
  },
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
    </>
  )
}
