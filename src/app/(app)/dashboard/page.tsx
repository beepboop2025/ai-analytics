"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Database, FileText, MessageSquare, Upload, ArrowRight } from "lucide-react"

interface DashboardData {
  stats: {
    datasets: number
    datasetsLimit: number
    queriesUsed: number
    queriesLimit: number
    reports: number
    plan: string
  }
  recentDatasets: {
    id: string
    name: string
    format: string
    rowCount: number
    createdAt: string
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/datasets")
        if (res.ok) {
          const datasets = await res.json()
          // Build dashboard data from available info
          setData({
            stats: {
              datasets: datasets.length,
              datasetsLimit: 3,
              queriesUsed: 0,
              queriesLimit: 10,
              reports: 0,
              plan: "FREE",
            },
            recentDatasets: datasets.slice(0, 5),
          })
        }
      } catch {
        // Use empty defaults
        setData({
          stats: { datasets: 0, datasetsLimit: 3, queriesUsed: 0, queriesLimit: 10, reports: 0, plan: "FREE" },
          recentDatasets: [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your workspace.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.stats
  const pct = (used: number, limit: number) => limit === -1 ? 0 : Math.round((used / limit) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.datasets ?? 0}</div>
            <Progress value={pct(stats?.datasets ?? 0, stats?.datasetsLimit ?? 3)} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {stats?.datasetsLimit === -1 ? "Unlimited" : `${stats?.datasets} / ${stats?.datasetsLimit}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queriesUsed ?? 0}</div>
            <Progress value={pct(stats?.queriesUsed ?? 0, stats?.queriesLimit ?? 10)} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {stats?.queriesLimit === -1 ? "Unlimited" : `${stats?.queriesUsed} / ${stats?.queriesLimit} this month`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reports ?? 0}</div>
            <p className="mt-3 text-xs text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={stats?.plan === "FREE" ? "secondary" : "default"}>
              {stats?.plan}
            </Badge>
            {stats?.plan === "FREE" && (
              <p className="mt-3">
                <Link href="/pricing" className="text-xs text-primary hover:underline">
                  Upgrade for more
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Upload Dataset</CardTitle>
            <CardDescription>Upload CSV, Excel, or JSON files</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/datasets">
                Upload <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Start Analysis</CardTitle>
            <CardDescription>Ask AI questions about your data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/analyze">
                Analyze <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">View Reports</CardTitle>
            <CardDescription>Browse generated analysis reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/reports">
                View <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Datasets */}
      {data?.recentDatasets && data.recentDatasets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Datasets</CardTitle>
            <CardDescription>Your most recently uploaded datasets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentDatasets.map((ds) => (
                <div key={ds.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{ds.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ds.format.toUpperCase()} &middot; {ds.rowCount.toLocaleString()} rows
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/analyze?dataset=${ds.id}`}>Analyze</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
