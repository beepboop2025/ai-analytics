"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { SubscriptionInfo } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Database,
  FileText,
  HardDrive,
  Layers3,
  MessageSquare,
  Sparkles,
  Upload,
} from "lucide-react"

interface DatasetSummary {
  id: string
  name: string
  fileName: string
  format: string
  rowCount: number
  fileSize: number
  columns: unknown
  createdAt: string
}

interface DashboardState {
  datasets: DatasetSummary[]
  subscription: SubscriptionInfo
}

const fallbackSubscription: SubscriptionInfo = {
  plan: "FREE",
  status: "active",
  queriesUsed: 0,
  queriesLimit: 10,
  datasetsLimit: 3,
  maxFileSize: 5,
  currentPeriodEnd: null,
}

function getColumnCount(columns: unknown) {
  if (Array.isArray(columns)) {
    return columns.length
  }

  if (columns && typeof columns === "object") {
    return Object.keys(columns as Record<string, unknown>).length
  }

  return 0
}

function formatFileSize(bytes: number) {
  if (bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / (1024 ** index)
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function toPercent(used: number, limit: number) {
  if (limit === -1 || limit === 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

/** Animates a number from 0 to target over ~800ms */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 800
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(eased * value))
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick)
      }
    }

    ref.current = requestAnimationFrame(tick)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [value])

  return <>{display.toLocaleString()}{suffix}</>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function fetchDashboard() {
      try {
        const [datasetsRes, subscriptionRes] = await Promise.all([
          fetch("/api/datasets"),
          fetch("/api/subscription"),
        ])

        if (!active) return

        const datasets = datasetsRes.ok ? ((await datasetsRes.json()) as DatasetSummary[]) : []
        const subscription = subscriptionRes.ok
          ? ((await subscriptionRes.json()) as SubscriptionInfo)
          : fallbackSubscription

        setData({ datasets, subscription })
      } catch {
        if (!active) return
        setData({ datasets: [], subscription: fallbackSubscription })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="surface-panel border-border/50 py-0">
            <CardContent className="p-6 sm:p-8">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="mt-4 h-12 w-full max-w-2xl rounded-xl" />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-2xl" style={{ animationDelay: `${index * 150}ms` }} />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="surface-panel border-border/50 py-0">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
              <Skeleton className="mt-4 h-28 w-full rounded-2xl" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="surface-panel border-border/50 py-0">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
              </CardHeader>
              <CardContent className="pb-6">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="mt-4 h-4 w-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const datasets = data?.datasets ?? []
  const subscription = data?.subscription ?? fallbackSubscription
  const totalRows = datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0)
  const totalStorage = datasets.reduce((sum, dataset) => sum + dataset.fileSize, 0)
  const totalColumns = datasets.reduce((sum, dataset) => sum + getColumnCount(dataset.columns), 0)
  const formats = Array.from(new Set(datasets.map((dataset) => dataset.format.toUpperCase())))
  const averageColumns = datasets.length ? Math.round(totalColumns / datasets.length) : 0
  const latestDataset = datasets[0]
  const queryProgress = toPercent(subscription.queriesUsed, subscription.queriesLimit)
  const datasetProgress = toPercent(datasets.length, subscription.datasetsLimit)
  const queriesRemaining = subscription.queriesLimit === -1
    ? "Unlimited"
    : Math.max(subscription.queriesLimit - subscription.queriesUsed, 0).toLocaleString()
  const queriesLabel = queriesRemaining === "1" ? "query" : "queries"

  const summary =
    datasets.length > 0
      ? `You have ${datasets.length} dataset${datasets.length === 1 ? "" : "s"} ready for analysis, with ${queriesRemaining.toString().toLowerCase()} AI ${queriesLabel} remaining this cycle.`
      : "Upload your first dataset to unlock AI analysis, reports, and a clearer operating rhythm."

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="surface-panel animate-fade-in-up overflow-hidden border-border/50 py-0">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full px-3 py-1 shadow-[0_2px_8px_-2px_rgba(30,58,138,0.2)]">Workspace overview</Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 animate-subtle-pulse">
                {subscription.plan} plan
              </Badge>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {datasets.length > 0
                ? "Your analytics workspace is ready for deeper analysis."
                : "Your workspace is ready for its first dataset."}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{summary}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Datasets ready",
                  value: datasets.length,
                  detail: subscription.datasetsLimit === -1
                    ? "Unlimited capacity on your plan"
                    : `${datasets.length} of ${subscription.datasetsLimit} dataset slots in use`,
                },
                {
                  label: "Queries remaining",
                  value: subscription.queriesLimit === -1 ? -1 : Math.max(subscription.queriesLimit - subscription.queriesUsed, 0),
                  displayOverride: queriesRemaining,
                  detail: subscription.queriesLimit === -1
                    ? "No monthly cap on AI analysis"
                    : `${subscription.queriesUsed} used of ${subscription.queriesLimit} this cycle`,
                },
                {
                  label: "Latest import",
                  displayOverride: latestDataset ? formatDate(latestDataset.createdAt) : "No uploads yet",
                  detail: latestDataset ? latestDataset.name : "Upload a dataset to activate the workspace",
                  isDate: true,
                },
              ].map((item, i) => (
                <div key={item.label} className={`metric-chip animate-fade-in-up animate-delay-${(i + 1) * 100}`}>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </div>
                  <div className={`mt-4 font-semibold tracking-tight ${item.isDate ? "text-2xl" : "text-3xl"}`}>
                    {item.displayOverride ?? <AnimatedNumber value={item.value ?? 0} />}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="btn-gradient h-11 px-6">
                <Link href="/datasets">
                  Upload dataset
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-border/60 bg-background/60 px-5 backdrop-blur-sm transition-all duration-300 hover:bg-background/80"
              >
                <Link href="/analyze">Open analysis workspace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel animate-fade-in-up animate-delay-200 border-border/50 py-0">
          <CardHeader className="p-6 pb-3">
            <CardDescription>Plan health</CardDescription>
            <CardTitle className="text-2xl">{subscription.plan} workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Dataset capacity</span>
                <span className="text-muted-foreground">
                  {subscription.datasetsLimit === -1
                    ? "Unlimited"
                    : `${datasets.length}/${subscription.datasetsLimit}`}
                </span>
              </div>
              <Progress value={datasetProgress} className="mt-4" />
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">AI usage</span>
                <span className="text-muted-foreground">
                  {subscription.queriesLimit === -1
                    ? "Unlimited"
                    : `${subscription.queriesUsed}/${subscription.queriesLimit}`}
                </span>
              </div>
              <Progress value={queryProgress} className="mt-4" />
            </div>

            <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
              {subscription.plan === "FREE"
                ? "The free workspace is enough to validate the workflow. Upgrade when recurring analysis becomes part of the operating cadence."
                : "Your plan supports a recurring analysis workflow. Keep an eye on dataset volume and upload size as usage grows."}
            </div>

            {subscription.plan === "FREE" && (
              <Button asChild variant="outline" className="h-11 w-full rounded-full transition-all duration-300 hover:bg-primary/5">
                <Link href="/pricing">Compare paid plans</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Rows tracked", value: totalRows, detail: "Total rows available across your uploaded datasets.", icon: Database },
          { title: "Data footprint", value: totalStorage, displayOverride: formatFileSize(totalStorage), detail: "Current stored file size across uploaded datasets.", icon: HardDrive },
          { title: "Formats in play", value: formats.length, detail: formats.length > 0 ? formats.join(", ") : "Upload a file to start tracking formats.", icon: Layers3 },
          { title: "Average columns", value: averageColumns, detail: "Average column count per dataset based on recorded schema details.", icon: BarChart3 },
        ].map((stat, i) => (
          <Card key={stat.title} className={`surface-panel group border-border/50 py-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-12px_rgba(30,58,138,0.12)] hover:border-primary/15 dark:hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)] dark:hover:border-primary/10 animate-fade-in-up animate-delay-${(i + 1) * 100}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.06] transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
                <stat.icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-3xl font-semibold tracking-tight">
                {stat.displayOverride ?? <AnimatedNumber value={stat.value} />}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {stat.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { icon: Upload, title: "Add fresh operational data", desc: "Upload CSV, Excel, or JSON exports and keep your workspace current.", link: "/datasets", linkText: "Open datasets" },
          { icon: MessageSquare, title: "Run AI analysis", desc: "Move from exported rows to a narrative answer with plain-English prompts.", link: "/analyze", linkText: "Analyze data" },
          { icon: FileText, title: "Package the output", desc: "Use reports to turn findings into an artifact the rest of the team can consume.", link: "/reports", linkText: "View reports" },
        ].map((action, i) => (
          <Card key={action.title} className={`surface-panel group border-border/50 py-0 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_-16px_rgba(30,58,138,0.14)] hover:border-primary/20 dark:hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.5)] dark:hover:border-primary/15 animate-fade-in-up animate-delay-${(i + 3) * 100}`}>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">{action.title}</CardTitle>
              <CardDescription>{action.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="rounded-full transition-all duration-300 group-hover:bg-primary/5">
                <Link href={action.link}>
                  {action.linkText}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="surface-panel animate-fade-in-up animate-delay-500 border-border/50 py-0">
          <CardHeader>
            <CardTitle>Recent datasets</CardTitle>
            <CardDescription>Your latest uploads, with the context needed to start analysis quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            {datasets.length > 0 ? (
              datasets.slice(0, 5).map((dataset, i) => (
                <div
                  key={dataset.id}
                  className={`flex flex-col gap-4 rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up animate-delay-${(i + 1) * 100}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold">{dataset.name}</div>
                        <Badge variant="outline" className="rounded-full px-2.5 py-1">
                          {dataset.format.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>{dataset.rowCount.toLocaleString()} rows</span>
                        <span>{getColumnCount(dataset.columns)} columns</span>
                        <span>{formatFileSize(dataset.fileSize)}</span>
                        <span>{formatDate(dataset.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="ghost" size="sm" className="rounded-full transition-all duration-200 hover:bg-primary/5">
                    <Link href={`/analyze?dataset=${dataset.id}`}>Analyze dataset</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No datasets yet</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Upload a real file to activate analysis, reporting, and the rest of the workspace.
                </p>
                <Button asChild className="mt-5 rounded-full">
                  <Link href="/datasets">Upload first dataset</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface-panel animate-fade-in-up animate-delay-600 border-border/50 py-0">
          <CardHeader>
            <CardTitle>Recommended workflow</CardTitle>
            <CardDescription>The product is strongest when used as a repeatable operating routine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            {[
              { icon: Upload, step: "1", title: "Load the latest export", desc: "Keep the workspace current before each review cycle." },
              { icon: Sparkles, step: "2", title: "Ask for the business story", desc: "Use natural language to isolate trends, anomalies, and segments." },
              { icon: CalendarClock, step: "3", title: "Turn it into a recurring artifact", desc: "Save reports and make the workspace part of the team cadence." },
            ].map((item, i) => (
              <div key={item.step} className={`rounded-2xl border border-border/50 bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/45 animate-fade-in-up animate-delay-${(i + 6) * 100}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{item.step}. {item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
