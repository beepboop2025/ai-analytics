import { Hero } from "@/components/marketing/hero"
import { Features } from "@/components/marketing/features"
import { Testimonials } from "@/components/marketing/testimonials"
import { CTA } from "@/components/marketing/cta"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DataLens AI — AI-Powered Data Analytics",
  description:
    "Upload datasets, analyze with AI, and generate insights in seconds. Natural language data analysis powered by Claude AI.",
  openGraph: {
    title: "DataLens AI — AI-Powered Data Analytics",
    description: "Upload datasets, analyze with AI, and generate insights in seconds.",
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
