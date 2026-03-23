import { NextResponse } from 'next/server'
import { getAvailableMonths } from '@/lib/db'

export async function GET() {
  try {
    const months = await getAvailableMonths()
    return NextResponse.json(months)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
