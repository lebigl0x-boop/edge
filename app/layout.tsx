import type { Metadata } from 'next'
import './globals.css'
import SolanaBalance from '@/components/SolanaBalance'
import FeesMenu from '@/components/FeesMenu'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'EDGE — Journal de Trading',
  description: 'Suivi et analyse de tes trades memecoin Solana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 44,
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          alignItems: 'center',
          padding: '0 16px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          gap: 16,
        }}>
          {/* Brand */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 2,
              background: 'var(--green)',
              boxShadow: '0 0 12px oklch(0.74 0.16 152 / 0.6)',
              flexShrink: 0,
            }} />
            <span className="mono" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.02em', color: 'var(--text)' }}>
              EDGE<span style={{ color: 'var(--text-3)' }}>/journal</span>
            </span>
          </Link>

          {/* Right actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
            <SolanaBalance />
            <FeesMenu />
            <Link href="/settings" style={{
              background: 'transparent',
              color: 'var(--text-3)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}>
              ⚙
            </Link>
            <Link href="/nouveau" style={{
              background: 'var(--text)', color: 'var(--bg)',
              border: 'none', borderRadius: 6,
              padding: '5px 12px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              textDecoration: 'none',
            }}>
              <span>+ New</span>
              <span className="mono" style={{ fontSize: 10, opacity: 0.5 }}>N</span>
            </Link>
          </div>
        </header>
        <main style={{ minHeight: 'calc(100vh - 44px)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
