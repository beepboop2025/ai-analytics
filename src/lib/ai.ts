import Anthropic from "@anthropic-ai/sdk"
import type { AIAnalysisResult, DatasetColumn } from "@/types"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `You are an expert data analyst. You analyze datasets and provide insights in structured JSON format.

Your responses MUST be valid JSON with this exact structure:
{
  "insights": [
    { "title": "string", "description": "string", "importance": "high" | "medium" | "low" }
  ],
  "charts": [
    {
      "type": "bar" | "line" | "area" | "pie" | "scatter",
      "title": "string",
      "data": [{ "key": "value", ... }],
      "xKey": "string (field name for x-axis)",
      "yKey": "string (field name for y-axis)"
    }
  ],
  "summary": "string (1-2 paragraph overview)"
}

Guidelines:
- Provide 2-5 actionable insights based on the data
- Suggest 1-3 charts that best visualize key findings
- Chart data should be aggregated/summarized, not raw rows
- Keep chart data arrays to 20 items max for readability
- Use clear, non-technical language in the summary
- Always respond with valid JSON only, no markdown or extra text`

export async function analyzeDataset(
  columns: DatasetColumn[],
  sampleRows: Record<string, unknown>[],
  prompt: string,
  rowCount: number,
): Promise<AIAnalysisResult> {
  const dataContext = `Dataset Schema:
${columns.map((c) => `- ${c.name} (${c.type})`).join("\n")}

Total rows: ${rowCount}
Sample data (first ${sampleRows.length} rows):
${JSON.stringify(sampleRows.slice(0, 50), null, 2)}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${dataContext}\n\nAnalysis request: ${prompt}`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return JSON.parse(text) as AIAnalysisResult
}

export async function queryData(
  columns: DatasetColumn[],
  sampleRows: Record<string, unknown>[],
  query: string,
  rowCount: number,
): Promise<AIAnalysisResult> {
  const dataContext = `Dataset Schema:
${columns.map((c) => `- ${c.name} (${c.type})`).join("\n")}

Total rows: ${rowCount}
Sample data (first ${sampleRows.length} rows):
${JSON.stringify(sampleRows.slice(0, 50), null, 2)}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${dataContext}\n\nQuestion: ${query}\n\nAnswer this question using the data provided. Include relevant visualizations.`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return JSON.parse(text) as AIAnalysisResult
}

export async function generateReport(
  columns: DatasetColumn[],
  sampleRows: Record<string, unknown>[],
  analyses: AIAnalysisResult[],
  rowCount: number,
): Promise<AIAnalysisResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Compile these previous analyses into a comprehensive report:

Dataset: ${columns.map((c) => c.name).join(", ")} (${rowCount} rows)

Previous analyses:
${JSON.stringify(analyses, null, 2)}

Create a unified report that synthesizes all findings, removes duplicates, and presents a coherent narrative with the best visualizations.`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return JSON.parse(text) as AIAnalysisResult
}
