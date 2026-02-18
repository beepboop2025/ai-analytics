"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { BarChart3, Loader2, Send, Save, User, Bot } from "lucide-react"
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { AIAnalysisResult, AIChartConfig, ChatMessage } from "@/types"

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4"]

function ChartRenderer({ config }: { config: AIChartConfig }) {
  const { type, title, data, xKey, yKey } = config
  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="mb-3 text-sm font-medium">{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        {type === "bar" ? (
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey={yKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} /></BarChart>
        ) : type === "line" ? (
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} /></LineChart>
        ) : type === "area" ? (
          <AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Area type="monotone" dataKey={yKey} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} /></AreaChart>
        ) : type === "pie" ? (
          <PieChart><Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
        ) : (
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey={yKey} fill={COLORS[0]} /></BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default function AnalyzePage() {
  const searchParams = useSearchParams()
  const [datasets, setDatasets] = useState<{ id: string; name: string; format: string }[]>([])
  const [selectedDataset, setSelectedDataset] = useState(searchParams.get("dataset") || "")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const res = await fetch("/api/datasets")
        if (res.ok) {
          const data = await res.json()
          setDatasets(data)
          if (!selectedDataset && data.length > 0) {
            setSelectedDataset(data[0].id)
          }
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchDatasets()
  }, [selectedDataset])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAnalyze = useCallback(async () => {
    if (!input.trim() || !selectedDataset || analyzing) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAnalyzing(true)

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: selectedDataset, prompt: userMessage.content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Analysis failed")
      }

      const analysis: AIAnalysisResult = await res.json()
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: analysis.summary,
        analysis,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed")
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error analyzing your data. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setAnalyzing(false)
    }
  }, [input, selectedDataset, analyzing])

  async function saveToReport(message: ChatMessage) {
    if (!message.analysis) return
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: selectedDataset,
          title: message.analysis.insights[0]?.title || "Analysis Report",
          content: message.analysis,
        }),
      })
      if (res.ok) {
        toast.success("Saved to reports!")
      } else {
        toast.error("Failed to save report")
      }
    } catch {
      toast.error("Failed to save report")
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Analysis</h1>
          <p className="text-muted-foreground">Ask questions about your data in plain English</p>
        </div>
        <Select value={selectedDataset} onValueChange={setSelectedDataset}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select dataset" />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <div className="p-2"><Skeleton className="h-5 w-full" /></div>
            ) : datasets.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No datasets uploaded</div>
            ) : (
              datasets.map((ds) => (
                <SelectItem key={ds.id} value={ds.id}>
                  {ds.name} ({ds.format.toUpperCase()})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">Start analyzing your data</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a dataset and ask a question to get AI-powered insights
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["What are the main trends?", "Show me a summary", "What patterns do you see?"].map((q) => (
                  <Button key={q} variant="outline" size="sm" onClick={() => setInput(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-3 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.analysis?.insights && (
                      <div className="space-y-2">
                        {msg.analysis.insights.map((insight, i) => (
                          <div key={i} className="rounded-lg border bg-card p-3 text-left">
                            <div className="flex items-center gap-2">
                              <Badge variant={insight.importance === "high" ? "default" : "secondary"}>
                                {insight.importance}
                              </Badge>
                              <span className="text-sm font-medium">{insight.title}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.analysis?.charts?.map((chart, i) => (
                      <ChartRenderer key={i} config={chart} />
                    ))}
                    {msg.analysis && (
                      <Button variant="ghost" size="sm" onClick={() => saveToReport(msg)} className="text-left">
                        <Save className="mr-1 h-3 w-3" /> Save to Reports
                      </Button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {analyzing && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your data...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder={selectedDataset ? "Ask a question about your data..." : "Select a dataset first"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAnalyze()
                }
              }}
              disabled={!selectedDataset || analyzing}
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button onClick={handleAnalyze} disabled={!input.trim() || !selectedDataset || analyzing} size="icon">
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
