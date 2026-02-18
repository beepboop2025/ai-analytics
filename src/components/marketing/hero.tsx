import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Sparkles, Upload } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="mx-auto max-w-7xl text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Powered by Claude AI</span>
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Turn Your Data Into
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {" "}Actionable Insights
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Upload any dataset. Ask questions in plain English. Get AI-powered analysis,
          visualizations, and reports in seconds — no coding required.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="text-base">
            <Link href="/signup">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="text-base">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV, Excel, JSON
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Auto Charts
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Analysis
          </div>
        </div>

        {/* Product mockup placeholder */}
        <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted shadow-2xl">
          <div className="flex items-center gap-2 border-b bg-muted/80 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-muted-foreground">DataLens AI Dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-4 p-6">
            <div className="rounded-lg bg-background p-4 shadow-sm">
              <div className="mb-2 text-xs text-muted-foreground">Revenue Trend</div>
              <div className="flex items-end gap-1">
                {[40, 55, 45, 60, 75, 70, 85, 90, 80, 95, 100, 110].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-primary/60" style={{ height: `${h * 0.6}px` }} />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-background p-4 shadow-sm">
              <div className="mb-2 text-xs text-muted-foreground">Top Categories</div>
              <div className="space-y-2">
                {["Electronics", "Clothing", "Home", "Sports"].map((cat, i) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${90 - i * 15}%` }} />
                    <span className="text-xs">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-background p-4 shadow-sm">
              <div className="mb-2 text-xs text-muted-foreground">AI Insight</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Revenue shows a strong upward trend with 23% QoQ growth.
                Electronics category leads with 35% of total sales...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
