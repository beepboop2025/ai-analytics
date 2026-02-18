"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Database, FileText, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

interface AdminStats {
  totalUsers: number
  totalDatasets: number
  totalReports: number
  mrr: number
  planCounts: { FREE: number; PRO: number; ENTERPRISE: number }
  recentSignups: { id: string; name: string | null; email: string; createdAt: string }[]
}

const COLORS = ["#94a3b8", "#6366f1", "#8b5cf6"]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.ok) setStats(await res.json())
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const planData = stats
    ? [
        { name: "Free", value: stats.planCounts.FREE },
        { name: "Pro", value: stats.planCounts.PRO },
        { name: "Enterprise", value: stats.planCounts.ENTERPRISE },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: stats?.totalUsers, icon: Users },
          { label: "MRR", value: stats ? `$${stats.mrr.toLocaleString()}` : null, icon: DollarSign },
          { label: "Total Datasets", value: stats?.totalDatasets, icon: Database },
          { label: "Total Reports", value: stats?.totalReports, icon: FileText },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{metric.value ?? 0}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Users by plan tier</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {planData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>Newest users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recentSignups.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{user.name || "Unnamed"}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
