import { NextRequest, NextResponse } from 'next/server'
import { getAllTrades, createTrade } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get('filter') ?? undefined
    const trades = await getAllTrades(filter)
    return NextResponse.json(trades)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id = await createTrade(body)
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
