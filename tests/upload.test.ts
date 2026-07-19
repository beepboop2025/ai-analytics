import { describe, it, expect } from "vitest"
import { parseCSV, parseJSON, parseFile, getFileFormat } from "@/lib/upload"

describe("getFileFormat", () => {
  it("lower-cases and returns supported extensions", () => {
    expect(getFileFormat("report.CSV")).toBe("csv")
    expect(getFileFormat("data.Xlsx")).toBe("xlsx")
    expect(getFileFormat("blob.JSON")).toBe("json")
  })

  it("uses the final extension for multi-dotted names", () => {
    expect(getFileFormat("2026.q1.sales.csv")).toBe("csv")
  })

  it("throws on unsupported extensions", () => {
    expect(() => getFileFormat("notes.txt")).toThrow(/Unsupported file format/)
  })

  it("throws when there is no extension", () => {
    // split(".").pop() returns the whole string ("README"), which is not a
    // supported format -> the unsupported-format branch fires
    expect(() => getFileFormat("README")).toThrow()
  })
})

describe("parseCSV", () => {
  it("parses headers into rows and reports an accurate rowCount", () => {
    const csv = "name,age,active\nAlice,30,true\nBob,25,false"
    const ds = parseCSV(csv)
    expect(ds.rowCount).toBe(2)
    expect(ds.rows[0]).toMatchObject({ name: "Alice" })
    expect(ds.columns.map((c) => c.name).sort()).toEqual(
      ["active", "age", "name"].sort(),
    )
  })

  it("infers a numeric column type when the values dominate", () => {
    const csv = "amount\n10\n20\n30\n40\n50"
    const ds = parseCSV(csv)
    const amount = ds.columns.find((c) => c.name === "amount")!
    expect(amount.type).toBe("number")
  })

  it("infers a boolean column type", () => {
    const csv = "flag\ntrue\nfalse\ntrue\ntrue\nfalse"
    const ds = parseCSV(csv)
    const flag = ds.columns.find((c) => c.name === "flag")!
    expect(flag.type).toBe("boolean")
  })

  it("infers a date column type from ISO-ish strings", () => {
    const csv =
      "when\n2026-01-01\n2026-02-15\n2026-03-20\n2026-04-10\n2026-05-05"
    const ds = parseCSV(csv)
    const when = ds.columns.find((c) => c.name === "when")!
    expect(when.type).toBe("date")
  })

  it("falls back to string when no type dominates 80% of values", () => {
    const csv = "mixed\n1\nhello\n2026-01-01\ntrue\nworld"
    const ds = parseCSV(csv)
    const mixed = ds.columns.find((c) => c.name === "mixed")!
    expect(mixed.type).toBe("string")
  })

  it("counts empty cells (not skipped blank lines) as nulls and caps sampleValues at five", () => {
    // Each row has a city value but a sometimes-empty 'note' cell. Papa.parse
    // skips fully-empty LINES, so nulls must come from empty cells within rows.
    const csv =
      "city,note\nDelhi,x\nMumbai,\nPune,y\nGoa,\nAgra,z\nKochi,w\nJaipur,q"
    const ds = parseCSV(csv)
    const city = ds.columns.find((c) => c.name === "city")!
    const note = ds.columns.find((c) => c.name === "note")!
    // city is fully populated
    expect(city.nullCount).toBe(0)
    // note has two empty cells -> nullCount 2
    expect(note.nullCount).toBe(2)
    // seven cities, sampleValues capped at five and never blank
    expect(city.sampleValues.length).toBe(5)
    expect(city.sampleValues).not.toContain("")
  })
})

describe("parseJSON", () => {
  it("parses an array of objects into rows with detected columns", () => {
    const json = JSON.stringify([
      { id: 1, score: 9.5 },
      { id: 2, score: 8.1 },
    ])
    const ds = parseJSON(json)
    expect(ds.rowCount).toBe(2)
    expect(ds.columns.map((c) => c.name).sort()).toEqual(["id", "score"])
  })

  it("wraps a single object into a one-row dataset", () => {
    const ds = parseJSON(JSON.stringify({ k: "v" }))
    expect(ds.rowCount).toBe(1)
    expect(ds.rows[0]).toEqual({ k: "v" })
  })

  it("throws on malformed JSON", () => {
    expect(() => parseJSON("{not json")).toThrow()
  })
})

describe("parseFile dispatch", () => {
  it("routes csv to the CSV parser", () => {
    const ds = parseFile("a,b\n1,2", "csv")
    expect(ds.rowCount).toBe(1)
  })

  it("routes json to the JSON parser", () => {
    const ds = parseFile(JSON.stringify([{ a: 1 }]), "json")
    expect(ds.rowCount).toBe(1)
  })

  it("throws on an unknown format", () => {
    expect(() => parseFile("x", "parquet")).toThrow(/Unsupported format/)
  })
})
