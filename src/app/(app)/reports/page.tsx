"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { BarChart3, FileText, Trash2, Eye } from "lucide-react"
import type { AIAnalysisResult } from "@/types"

interface Report {
  id: string
  title: string
  content: AIAnalysisResult
  dataset: { name: string }
  createdAt: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Report | null>(null)

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports")
        if (res.ok) setReports(await res.json())
      } catch {
        toast.error("Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  async function deleteReport(id: string) {
    try {
      const res = await fetch(`/api/reports?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Report deleted")
        setReports((prev) => prev.filter((r) => r.id !== id))
      }
    } catch {
      toast.error("Failed to delete report")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Your generated analysis reports</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></CardHeader></Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-medium">No reports yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Analyze a dataset and save the results to create a report
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{report.dataset?.name}</Badge>
                </div>
                <CardTitle className="mt-2 text-base">{report.title}</CardTitle>
                <CardDescription>
                  {report.content.insights?.length || 0} insights &middot;{" "}
                  {report.content.charts?.length || 0} charts
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="line-clamp-2 text-sm text-muted-foreground">{report.content.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelected(report)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteReport(report.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Summary</h3>
                <p className="mt-1 text-sm">{selected.content.summary}</p>
              </div>
              {selected.content.insights?.map((insight, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={insight.importance === "high" ? "default" : "secondary"}>
                      {insight.importance}
                    </Badge>
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
