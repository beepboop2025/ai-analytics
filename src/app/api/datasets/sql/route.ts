import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const ENGINE_URL = process.env.DATA_ENGINE_URL ?? 'http://localhost:8080'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const res = await fetch(`${ENGINE_URL}/sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
