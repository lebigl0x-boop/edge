import type { Metadata } from 'next'
import './globals.css'
import SolanaBalance from '@/components/SolanaBalance'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Journal de Trading',
  description: 'Suivi et analyse de tes trades',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
            Journal de Trading
          </Link>
          <SolanaBalance />
        </header>
        <main style={{ minHeight: 'calc(100vh - 52px)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
