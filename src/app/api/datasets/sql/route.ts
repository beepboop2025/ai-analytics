import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const ENGINE_URL = process.env.DATA_ENGINE_URL ?? 'http://localhost:8080'

// SECURITY: This route proxies SQL to an internal engine. The engine must enforce
// its own authorization and query sandboxing. The checks below are a defense-in-depth
// layer to reject obviously dangerous queries before they leave this process.
const DANGEROUS_KEYWORDS = /\b(DROP|DELETE|ALTER|TRUNCATE|INSERT|UPDATE|CREATE|EXEC|EXECUTE|GRANT|REVOKE)\b/i

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate expected shape
    if (!body || typeof body.query !== 'string' || body.query.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or invalid "query" field' }, { status: 400 })
    }

    // Reject queries with dangerous SQL keywords
    if (DANGEROUS_KEYWORDS.test(body.query)) {
      return NextResponse.json(
        { error: 'Query contains disallowed SQL keywords. Only SELECT queries are permitted.' },
        { status: 400 },
      )
    }

    // Only forward the query field to the engine — strip any extra fields
    const res = await fetch(`${ENGINE_URL}/sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: body.query }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    return NextResponse.json(await res.json())
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to data engine' },
      { status: 502 },
    )
  }
}
