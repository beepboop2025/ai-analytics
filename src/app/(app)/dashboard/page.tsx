"use client"

import { useEffect, useState } from "react"
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
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="surface-panel border-border/70 py-0">
            <CardContent className="p-6 sm:p-8">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-4 h-12 w-full max-w-2xl" />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-2xl" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="surface-panel border-border/70 py-0">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
              <Skeleton className="mt-4 h-28 w-full rounded-2xl" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="surface-panel border-border/70 py-0">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="pb-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="mt-4 h-4 w-32" />
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
        <Card className="surface-panel overflow-hidden border-border/70 py-0">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full px-3 py-1">Workspace overview</Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
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
              <div className="metric-chip">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Datasets ready
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight">{datasets.length}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {subscription.datasetsLimit === -1
                    ? "Unlimited capacity on your plan"
                    : `${datasets.length} of ${subscription.datasetsLimit} dataset slots in use`}
                </div>
              </div>

              <div className="metric-chip">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Queries remaining
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight">{queriesRemaining}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {subscription.queriesLimit === -1
                    ? "No monthly cap on AI analysis"
                    : `${subscription.queriesUsed} used of ${subscription.queriesLimit} this cycle`}
                </div>
              </div>

              <div className="metric-chip">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Latest import
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-tight">
                  {latestDataset ? formatDate(latestDataset.createdAt) : "No uploads yet"}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {latestDataset ? latestDataset.name : "Upload a dataset to activate the workspace"}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-full px-5 shadow-lg shadow-primary/20">
                <Link href="/datasets">
                  Upload dataset
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-border/80 bg-background/70 px-5 backdrop-blur"
              >
                <Link href="/analyze">Open analysis workspace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 py-0">
          <CardHeader className="p-6 pb-3">
            <CardDescription>Plan health</CardDescription>
            <CardTitle className="text-2xl">{subscription.plan} workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
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

            <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
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

            <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
              {subscription.plan === "FREE"
                ? "The free workspace is enough to validate the workflow. Upgrade when recurring analysis becomes part of the operating cadence."
                : "Your plan supports a recurring analysis workflow. Keep an eye on dataset volume and upload size as usage grows."}
            </div>

            {subscription.plan === "FREE" && (
              <Button asChild variant="outline" className="h-11 w-full rounded-full">
                <Link href="/pricing">Compare paid plans</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-panel border-border/70 py-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rows tracked</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-3xl font-semibold tracking-tight">{totalRows.toLocaleString()}</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Total rows available across your uploaded datasets.
            </p>
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 py-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data footprint</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-3xl font-semibold tracking-tight">{formatFileSize(totalStorage)}</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Current stored file size across uploaded datasets.
            </p>
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 py-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Formats in play</CardTitle>
            <Layers3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-3xl font-semibold tracking-tight">{formats.length}</div>
            <p className="mt-3 text-sm text-muted-foreground">
              {formats.length > 0 ? formats.join(", ") : "Upload a file to start tracking formats."}
            </p>
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 py-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average columns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-3xl font-semibold tracking-tight">{averageColumns}</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Average column count per dataset based on recorded schema details.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="surface-panel border-border/70 py-0 transition-transform hover:-translate-y-1">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Add fresh operational data</CardTitle>
            <CardDescription>Upload CSV, Excel, or JSON exports and keep your workspace current.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/datasets">
                Open datasets
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 py-0 transition-transform hover:-translate-y-1">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Run AI analysis</CardTitle>
            <CardDescription>Move from exported rows to a narrative answer with plain-English prompts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/analyze">
                Analyze data
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 py-0 transition-transform hover:-translate-y-1">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Package the output</CardTitle>
            <CardDescription>Use reports to turn findings into an artifact the rest of the team can consume.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/reports">
                View reports
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="surface-panel border-border/70 py-0">
          <CardHeader>
            <CardTitle>Recent datasets</CardTitle>
            <CardDescription>Your latest uploads, with the context needed to start analysis quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            {datasets.length > 0 ? (
              datasets.slice(0, 5).map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-background/75 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
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

                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <Link href={`/analyze?dataset=${dataset.id}`}>Analyze dataset</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-muted/30 p-8 text-center">
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

        <Card className="surface-panel border-border/70 py-0">
          <CardHeader>
            <CardTitle>Recommended workflow</CardTitle>
            <CardDescription>The product is strongest when used as a repeatable operating routine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">1. Load the latest export</div>
                  <div className="text-sm text-muted-foreground">Keep the workspace current before each review cycle.</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">2. Ask for the business story</div>
                  <div className="text-sm text-muted-foreground">Use natural language to isolate trends, anomalies, and segments.</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <CalendarClock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">3. Turn it into a recurring artifact</div>
                  <div className="text-sm text-muted-foreground">Save reports and make the workspace part of the team cadence.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
