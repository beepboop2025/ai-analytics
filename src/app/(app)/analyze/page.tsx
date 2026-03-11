"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { BarChart3, Send, Save, User, Bot, Sparkles } from "lucide-react"
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { AIAnalysisResult, AIChartConfig, ChatMessage } from "@/types"

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4"]

function ChartRenderer({ config }: { config: AIChartConfig }) {
  const { type, title, data, xKey, yKey } = config
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/15 animate-slide-up-fade">
      <h4 className="mb-3 text-sm font-medium">{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        {type === "bar" ? (
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey={yKey} fill={COLORS[0]} radius={[6, 6, 0, 0]} /></BarChart>
        ) : type === "line" ? (
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} /></LineChart>
        ) : type === "area" ? (
          <AreaChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Area type="monotone" dataKey={yKey} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} /></AreaChart>
        ) : type === "pie" ? (
          <PieChart><Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
        ) : (
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey={xKey} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey={yKey} fill={COLORS[0]} /></BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-slide-in-left">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 px-4 py-3 backdrop-blur-sm">
        <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
        <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
        <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
      </div>
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">AI Analysis</h1>
          <p className="text-muted-foreground">Ask questions about your data in plain English</p>
        </div>
        <Select value={selectedDataset} onValueChange={setSelectedDataset}>
          <SelectTrigger className="w-64 rounded-xl border-border/50 bg-background/60 backdrop-blur-sm transition-all duration-300 focus:ring-primary/30 hover:border-primary/25 hover:bg-background/70">
            <SelectValue placeholder="Select dataset" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(30,58,138,0.12)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]">
            {loading ? (
              <div className="p-2"><Skeleton className="h-5 w-full" /></div>
            ) : datasets.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No datasets uploaded</div>
            ) : (
              datasets.map((ds) => (
                <SelectItem key={ds.id} value={ds.id} className="rounded-lg">
                  {ds.name} ({ds.format.toUpperCase()})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(30,58,138,0.06)] dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.3)] animate-fade-in-up animate-delay-100">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in-up">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/[0.06] transition-all duration-300">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-primary/60 animate-subtle-pulse" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Start analyzing your data</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Select a dataset and ask a question to get AI-powered insights, charts, and narrative summaries.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["What are the main trends?", "Show me a summary", "What patterns do you see?"].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(q)}
                    className="rounded-full border-border/50 bg-background/60 backdrop-blur-sm transition-all duration-200 hover:bg-primary/5 hover:border-primary/30"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end animate-slide-in-right" : "animate-slide-in-left"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-3 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-[oklch(0.48_0.12_260)] text-primary-foreground shadow-[0_4px_16px_-4px_rgba(30,58,138,0.25)]"
                        : "bg-muted/60 backdrop-blur-sm border border-border/30"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.analysis?.insights && (
                      <div className="space-y-2">
                        {msg.analysis.insights.map((insight, i) => (
                          <div key={i} className="rounded-xl border border-border/50 bg-card/80 p-3 text-left backdrop-blur-sm transition-all duration-200 hover:shadow-sm">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={insight.importance === "high" ? "default" : "secondary"}
                                className={insight.importance === "high" ? "animate-subtle-pulse" : ""}
                              >
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
                      <Button variant="ghost" size="sm" onClick={() => saveToReport(msg)} className="rounded-full text-left transition-all duration-200 hover:bg-primary/5">
                        <Save className="mr-1 h-3 w-3" /> Save to Reports
                      </Button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ring-2 ring-border/30">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {analyzing && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-background/50 p-4 backdrop-blur-xl">
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
              className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-border/50 bg-background/60 backdrop-blur-sm transition-all duration-300 focus:bg-background/80 focus:shadow-[0_0_12px_-2px_rgba(30,58,138,0.1)] focus:border-primary/30"
              rows={1}
            />
            <Button
              onClick={handleAnalyze}
              disabled={!input.trim() || !selectedDataset || analyzing}
              size="icon"
              className="rounded-xl bg-gradient-to-br from-primary to-[oklch(0.52_0.12_280)] shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-105 disabled:opacity-40 disabled:shadow-none"
            >
              <Send className={`h-4 w-4 ${analyzing ? "animate-pulse" : ""}`} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
