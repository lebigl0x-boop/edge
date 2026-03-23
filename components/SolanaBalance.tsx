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
          placeholder="Adresse Solana publique..."
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: '5px 12px',
            color: 'white',
            fontSize: '0.8rem',
            width: 280,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button onClick={handleSave} style={{ color: '#0a84ff', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
          OK
        </button>
        {address && (
          <button onClick={handleClear} style={{ color: '#ff453a', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Supprimer
          </button>
        )}
        <button onClick={() => setEditing(false)} style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          ✕
        </button>
      </div>
    )
  }

  if (!address) {
    return (
      <button
        onClick={() => { setEditing(true); setInputVal('') }}
        style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
      >
        + Wallet Solana
      </button>
    )
  }

  return (
    <button
      onClick={() => { setEditing(true); setInputVal(address) }}
      title={`${address.slice(0, 6)}...${address.slice(-6)}\nClic pour modifier`}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: error ? 'rgba(255,69,58,0.1)' : 'rgba(255,255,255,0.06)',
        border: 'none', cursor: 'pointer',
        padding: '5px 12px', borderRadius: 10,
        transition: 'background 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = error ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = error ? 'rgba(255,69,58,0.1)' : 'rgba(255,255,255,0.06)')}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: error ? '#ff453a' : 'linear-gradient(135deg, #9945FF, #14F195)',
        flexShrink: 0,
        boxShadow: error ? 'none' : '0 0 6px rgba(153,69,255,0.5)',
      }} />
      <span style={{ color: error ? '#ff453a' : loading ? 'rgba(255,255,255,0.4)' : 'white', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.2s' }}>
        {error ? 'Adresse invalide' : balance !== null ? `${balance.toFixed(3)} SOL` : '···'}
      </span>
    </button>
  )
}
