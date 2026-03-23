import { NextResponse } from 'next/server'
import { initSchema } from '@/lib/db'

// Route one-shot pour initialiser le schéma Neon
// Appelle GET /api/init UNE SEULE FOIS après avoir configuré DATABASE_URL
// Puis supprime ou désactive cette route
export async function GET() {
  try {
    await initSchema()
    return NextResponse.json({ ok: true, message: 'Schéma initialisé avec succès ✓' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
