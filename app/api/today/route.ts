import { NextResponse } from 'next/server'
import { getTodayStats } from '@/lib/db'

export async function GET() {
  try {
    const stats = await getTodayStats()
    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
