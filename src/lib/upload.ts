import Papa from "papaparse"
import * as XLSX from "xlsx"
import type { DatasetColumn, ParsedDataset } from "@/types"

function inferType(values: unknown[]): DatasetColumn["type"] {
  const nonNull = values.filter((v) => v != null && v !== "")
  if (nonNull.length === 0) return "string"

  let numCount = 0
  let dateCount = 0
  let boolCount = 0

  for (const v of nonNull.slice(0, 100)) {
    const str = String(v).trim()
    if (str === "true" || str === "false") {
      boolCount++
    } else if (!isNaN(Number(str)) && str !== "") {
      numCount++
    } else if (!isNaN(Date.parse(str)) && str.length > 4) {
      dateCount++
    }
  }

  const total = nonNull.slice(0, 100).length
  if (boolCount / total > 0.8) return "boolean"
  if (numCount / total > 0.8) return "number"
  if (dateCount / total > 0.8) return "date"
  return "string"
}

function detectColumns(rows: Record<string, unknown>[]): DatasetColumn[] {
  if (rows.length === 0) return []

  const keys = Object.keys(rows[0])
  return keys.map((name) => {
    const values = rows.map((r) => r[name])
    const type = inferType(values)
    const sampleValues = values
      .filter((v) => v != null && v !== "")
      .slice(0, 5)
      .map(String)
    const nullCount = values.filter((v) => v == null || v === "").length

    return { name, type, sampleValues, nullCount }
  })
}

export function parseCSV(content: string): ParsedDataset {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })

  const rows = result.data as Record<string, unknown>[]
  const columns = detectColumns(rows)

  return { rows, columns, rowCount: rows.length }
}

export function parseExcel(buffer: ArrayBuffer): ParsedDataset {
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]
  const columns = detectColumns(rows)

  return { rows, columns, rowCount: rows.length }
}

export function parseJSON(content: string): ParsedDataset {
  const parsed = JSON.parse(content)
  const rows = Array.isArray(parsed) ? parsed : [parsed]
  const columns = detectColumns(rows)

  return { rows, columns, rowCount: rows.length }
}

export function parseFile(content: string | ArrayBuffer, format: string): ParsedDataset {
  switch (format) {
    case "csv":
      return parseCSV(content as string)
    case "xlsx":
    case "xls":
      return parseExcel(content as ArrayBuffer)
    case "json":
      return parseJSON(content as string)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

export function getFileFormat(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  if (!ext) throw new Error("File has no extension")
  if (!["csv", "xlsx", "xls", "json"].includes(ext)) {
    throw new Error(`Unsupported file format: .${ext}. Use CSV, Excel, or JSON.`)
  }
  return ext
}
