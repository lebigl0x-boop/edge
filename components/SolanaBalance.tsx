'use client'

import { useState, useEffect, useCallback } from 'react'

const LS_KEY = 'sol_wallet_address'
const REFRESH_MS = 30_000

export default function SolanaBalance() {
  const [address, setAddress] = useState<string>('')
  const [balance, setBalance] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) setAddress(saved)
  }, [])

  const fetchBalance = useCallback(async (addr: string) => {
    if (!addr) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/solana?address=${encodeURIComponent(addr)}`)
      const data = await res.json() as { sol?: number; error?: string }
      if (data.sol !== undefined) {
        setBalance(data.sol)
      } else {
        setError(data.error ?? 'Erreur')
      }
    } catch {
      setError('Réseau indisponible')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!address) return
    fetchBalance(address)
    const interval = setInterval(() => fetchBalance(address), REFRESH_MS)
    return () => clearInterval(interval)
  }, [address, fetchBalance])

  function handleSave() {
    const trimmed = inputVal.trim()
    if (trimmed) {
      localStorage.setItem(LS_KEY, trimmed)
      setAddress(trimmed)
      setBalance(null)
      setError(null)
    }
    setEditing(false)
  }

  function handleClear() {
    localStorage.removeItem(LS_KEY)
    setAddress('')
    setBalance(null)
    setError(null)
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          autoFocus
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          placeholder="Adresse Solana publique…"
          className="mono"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-strong)',
            borderRadius: 6,
            padding: '4px 10px',
            color: 'var(--text)',
            fontSize: 11,
            width: 260,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button onClick={handleSave} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontSize: 11, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
          OK
        </button>
        {address && (
          <button onClick={handleClear} style={{ color: 'var(--red)', background: 'none', border: 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✕
          </button>
        )}
        <button onClick={() => setEditing(false)} style={{ color: 'var(--text-4)', background: 'none', border: 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
          Annuler
        </button>
      </div>
    )
  }

  if (!address) {
    return (
      <button
        onClick={() => { setEditing(true); setInputVal('') }}
        className="mono"
        style={{ color: 'var(--text-4)', background: 'none', border: 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
      >
        + Wallet
      </button>
    )
  }

  const short = `${address.slice(0, 3)}…${address.slice(-3)}`

  return (
    <button
      onClick={() => { setEditing(true); setInputVal(address) }}
      title={address}
      className="mono"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '4px 8px',
        transition: 'opacity 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: error ? 'var(--red)' : 'var(--green)',
      }} />
      <span style={{ color: error ? 'var(--red)' : 'var(--text-2)', fontSize: 11 }}>
        {error ? 'Erreur' : balance !== null ? `${balance.toFixed(2)} SOL` : loading ? '···' : '···'}
      </span>
      {!error && (
        <span style={{ color: 'var(--text-4)', fontSize: 11 }}>· {short}</span>
      )}
    </button>
  )
}
