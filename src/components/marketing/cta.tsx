import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to unlock your data&apos;s potential?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Start with 10 free AI queries. No credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="text-base">
            <Link href="/signup">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="text-base">
            <Link href="/pricing">Compare Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
