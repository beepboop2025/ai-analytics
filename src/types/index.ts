import { Plan, Role } from "@/generated/prisma/enums"

export type { Plan, Role }

export interface UserSession {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: Role
}

export interface SubscriptionInfo {
  plan: Plan
  status: string
  queriesUsed: number
  queriesLimit: number
  datasetsUsed: number
  datasetsLimit: number
  maxFileSize: number
  currentPeriodEnd?: Date | null
}

export interface DatasetColumn {
  name: string
  type: "string" | "number" | "date" | "boolean"
  sampleValues: string[]
  nullCount: number
}

export interface ParsedDataset {
  rows: Record<string, unknown>[]
  columns: DatasetColumn[]
  rowCount: number
}

export interface AIInsight {
  title: string
  description: string
  importance: "high" | "medium" | "low"
}

export interface AIChartConfig {
  type: "bar" | "line" | "area" | "pie" | "scatter"
  title: string
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  color?: string
}

export interface AIAnalysisResult {
  insights: AIInsight[]
  charts: AIChartConfig[]
  summary: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  analysis?: AIAnalysisResult
  timestamp: Date
}

export const PLAN_LIMITS: Record<Plan, {
  queriesLimit: number
  datasetsLimit: number
  maxFileSize: number
  reportsLimit: number
}> = {
  FREE: { queriesLimit: 10, datasetsLimit: 3, maxFileSize: 5, reportsLimit: 5 },
  PRO: { queriesLimit: 500, datasetsLimit: 50, maxFileSize: 50, reportsLimit: -1 },
  ENTERPRISE: { queriesLimit: -1, datasetsLimit: -1, maxFileSize: 500, reportsLimit: -1 },
}
