import { NextResponse } from 'next/server'
import { getDraftCount } from '@/lib/db'

export async function GET() {
  try {
    const count = await getDraftCount()
    return NextResponse.json({ count })
  } catch (err) {
    console.error('[GET /api/drafts/count]', err)
    return NextResponse.json({ count: 0 })
  }
}
