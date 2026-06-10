import { NextRequest, NextResponse } from 'next/server'
import { createPreTrade } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id = await createPreTrade(body)
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
