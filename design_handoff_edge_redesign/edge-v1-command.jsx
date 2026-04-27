// Direction 1 — Command Bar / Terminal Trader
// Dense, monospace-leaning, keyboard-first. Quick capture omnipresent.

const cmdStyles = {
  shell: {
    width: '100%', height: '100%',
    background: 'var(--bg)',
    color: 'var(--text)',
    display: 'grid',
    gridTemplateRows: '44px 1fr',
    fontFamily: "'Inter Tight', system-ui, sans-serif",
    overflow: 'hidden',
  },
  topbar: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr 280px',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid var(--border)',
    gap: 16,
    background: 'var(--bg)',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700, fontSize: 13, letterSpacing: '0.02em',
  },
  brandDot: {
    width: 8, height: 8, borderRadius: 2, background: 'var(--green)',
    boxShadow: '0 0 12px oklch(0.74 0.16 152 / 0.6)',
  },
  cmdSearch: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '6px 12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: 'var(--text-3)',
    cursor: 'text',
  },
  kbd: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, fontWeight: 600,
    padding: '2px 6px', borderRadius: 4,
    background: 'var(--surface-2)', color: 'var(--text-2)',
    border: '1px solid var(--border)',
  },
};

function CmdTopBar({ onNew }) {
  return (
    <div style={cmdStyles.topbar}>
      <div style={cmdStyles.brand}>
        <div style={cmdStyles.brandDot} />
        EDGE<span style={{ color: 'var(--text-3)' }}>/journal</span>
      </div>
      <div style={cmdStyles.cmdSearch}>
        <span style={{ color: 'var(--text-4)' }}>›</span>
        <span style={{ flex: 1 }}>Search trades, narratives, notes…  <span style={{ color: 'var(--text-4)' }}>type "/" for commands</span></span>
        <span style={cmdStyles.kbd}>⌘ K</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          24.18 SOL
          <span style={{ color: 'var(--text-4)' }}>·</span>
          <span style={{ color: 'var(--text-3)' }}>BqK…7Hf</span>
        </div>
        <button onClick={onNew} style={{
          background: 'var(--text)', color: 'var(--bg)',
          border: 'none', borderRadius: 6,
          padding: '5px 12px', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>+ New</span>
          <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>N</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────
function CommandDashboard() {
  const [filter, setFilter] = React.useState('week');
  return (
    <div style={cmdStyles.shell}>
      <CmdTopBar />
      <div style={{ overflow: 'auto' }}>
        <div style={{ padding: '20px 24px 28px', display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>

          {/* Hero strip: PnL + Equity + key stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 16,
          }}>
            {/* PnL hero */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 22px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase' }}>PnL · 7 days</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {['7D','30D','ALL'].map(p => (
                    <button key={p} className="mono" style={{
                      background: p === '7D' ? 'var(--surface-3)' : 'transparent',
                      color: p === '7D' ? 'var(--text)' : 'var(--text-3)',
                      border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600,
                    }}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 38, fontWeight: 700, color: 'var(--green)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  +8.90<span style={{ fontSize: 18, color: 'var(--text-3)', marginLeft: 6, fontWeight: 500 }}>SOL</span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6 }}>
                  ≈ $1,512  ·  <span style={{ color: 'var(--green)' }}>+58% WR</span>  ·  12 trades
                </div>
              </div>
            </div>

            {/* Equity curve */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 22px',
              position: 'relative',
              minHeight: 160,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Equity Curve</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>cumulative · SOL</span>
              </div>
              <EquitySvg />
            </div>
          </div>

          {/* Stat row — 6 KPIs in mono */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 0,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {[
              { l: 'Win Rate',   v: '58%',  hint: '> 50%',  good: true },
              { l: 'RR Réel',    v: '2.4×', hint: '> 2×',   good: true },
              { l: 'Discipline', v: '83%',  hint: '> 80%',  good: true },
              { l: 'SL Respect', v: '92%',  hint: '> 90%',  good: true },
              { l: 'SL Hit',     v: '25%',  hint: '< 30%',  good: true },
              { l: 'A+ Rate',    v: '33%',  hint: '> 30%',  good: true },
            ].map((s, i) => (
              <div key={s.l} style={{
                padding: '16px 18px',
                borderRight: i < 5 ? '1px solid var(--border)' : 'none',
              }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.l}</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: s.good ? 'var(--text)' : 'var(--amber)', marginTop: 6, letterSpacing: '-0.02em' }}>
                  {s.v}
                </div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', marginTop: 3 }}>{s.hint}</div>
              </div>
            ))}
          </div>

          {/* Two-col: Trades table + side widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

            {/* Trades table */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Trades</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['All','Wins','Losses','A+'].map(f => (
                      <button key={f} style={{
                        background: f === 'All' ? 'var(--surface-3)' : 'transparent',
                        color: f === 'All' ? 'var(--text)' : 'var(--text-3)',
                        border: '1px solid ' + (f === 'All' ? 'var(--border-strong)' : 'transparent'),
                        borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer',
                      }}>{f}</button>
                    ))}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>12 trades · 04-21 → 04-25</span>
              </div>

              <div className="mono" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px 90px 60px 80px 24px', gap: 10, padding: '8px 18px', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--border)' }}>
                <span>Date</span><span>Token</span><span>Type</span><span style={{ textAlign: 'right' }}>PnL SOL</span><span>Conv</span><span>Err</span><span></span>
              </div>

              {window.TRADES.slice(0, 9).map(t => (
                <CmdTradeRow key={t.id} t={t} />
              ))}
            </div>

            {/* Side widgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Top error pattern */}
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Top errors</span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>4 errs / 12</span>
                </div>
                {window.ERRORS.filter(e => e.name !== 'Aucune').map(e => {
                  const max = 2;
                  return (
                    <div key={e.name} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-2)' }}>{e.name}</span>
                        <span className="mono" style={{ color: 'var(--red)' }}>{e.pnl.toFixed(2)}</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(e.count/max)*100}%`, background: 'var(--red)', opacity: 0.6, borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* By narrative */}
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>By narrative</div>
                {window.NARRATIVES.map(n => (
                  <div key={n.name} style={{ display: 'grid', gridTemplateColumns: '1fr 30px 60px', gap: 8, padding: '6px 0', fontSize: 12, alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-2)' }}>{n.name}</span>
                    <span className="mono" style={{ color: 'var(--text-3)', fontSize: 10, textAlign: 'right' }}>{n.trades}t</span>
                    <span className="mono" style={{ color: window.pnlColor(n.pnl), textAlign: 'right' }}>{window.fmtPnl(n.pnl)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function CmdTradeRow({ t }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="mono"
      style={{
        display: 'grid', gridTemplateColumns: '60px 1fr 70px 90px 60px 80px 24px', gap: 10,
        padding: '10px 18px', fontSize: 12,
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        background: hover ? 'rgba(255,255,255,0.02)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
    >
      <span style={{ color: 'var(--text-3)' }}>{t.date}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600 }}>{t.token}</span>
        {t.aplus && <span style={{ fontSize: 9, color: 'var(--amber)', border: '1px solid var(--amber)', padding: '1px 4px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.05em' }}>A+</span>}
      </span>
      <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{t.type}</span>
      <span style={{ color: window.pnlColor(t.pnlSol), textAlign: 'right', fontWeight: 600 }}>{window.fmtPnl(t.pnlSol)}</span>
      <span style={{ color: t.conv === 'A' ? 'var(--green)' : t.conv === 'B' ? 'var(--amber)' : 'var(--red)', fontSize: 11 }}>{t.conv}</span>
      <span style={{ color: t.err === 'Aucune' ? 'var(--text-4)' : 'var(--red)', fontSize: 11 }}>
        {t.err === 'Aucune' ? '—' : t.err.split(' ')[0]}
      </span>
      <span style={{ color: 'var(--text-4)', fontSize: 11, textAlign: 'right', opacity: hover ? 1 : 0, transition: 'opacity 0.15s' }}>›</span>
    </div>
  );
}

// Equity SVG curve
function EquitySvg() {
  const W = 720, H = 110, P = 6;
  const pts = window.EQUITY;
  const max = Math.max(...pts.map(p => p.y));
  const min = Math.min(0, ...pts.map(p => p.y));
  const x = i => P + (i / (pts.length - 1)) * (W - P*2);
  const y = v => H - P - ((v - min) / (max - min)) * (H - P*2);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const area = path + ` L${x(pts.length-1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 130 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cmdEq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.74 0.16 152)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.74 0.16 152)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* zero line */}
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 3" />
      <path d={area} fill="url(#cmdEq)" />
      <path d={path} fill="none" stroke="oklch(0.74 0.16 152)" strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.y)} r="2" fill="oklch(0.74 0.16 152)" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Quick Capture (modal-style, but full screen here)
// ─────────────────────────────────────────────────────────────────
function CommandQuickCapture() {
  const [token, setToken] = React.useState('WIF');
  const [mcE, setMcE] = React.useState('29.9');
  const [mcS, setMcS] = React.useState('89.7');
  const [size, setSize] = React.useState('1.5');
  const [conv, setConv] = React.useState('A');
  const [err, setErr] = React.useState('Aucune');
  const [note, setNote] = React.useState("Entry parfaite sur le retest, j'ai laissé courir #breakout @WIF");
  const [rules, setRules] = React.useState({ r1: true, r2: true, r3: true, r4: true });

  const pnl = (() => {
    const e = parseFloat(mcE), s = parseFloat(mcS), sz = parseFloat(size);
    if (!e || !s || !sz) return null;
    return sz * (s - e) / e - 0.004;
  })();
  const pct = mcE && mcS ? ((parseFloat(mcS) - parseFloat(mcE)) / parseFloat(mcE) * 100) : null;

  return (
    <div style={cmdStyles.shell}>
      <CmdTopBar />
      <div style={{ overflow: 'auto', padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
        {/* Background dim — simulate modal */}
        <div style={{
          width: 760,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-strong)',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
          overflow: 'hidden',
        }}>
          {/* Title bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>›</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Quick Capture</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>04-25 · 13:47</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>tab to advance · ⏎ to save · esc</span>
            </div>
          </div>

          {/* Numbers row — single line */}
          <div style={{ padding: '20px 20px 12px', display: 'grid', gridTemplateColumns: '120px 1fr 1fr 100px', gap: 10, alignItems: 'end' }}>
            <FieldCmd label="Token">
              <input value={token} onChange={e => setToken(e.target.value.toUpperCase())} className="mono" style={inputCmd} />
            </FieldCmd>
            <FieldCmd label="MC Entrée · k$">
              <input value={mcE} onChange={e => setMcE(e.target.value)} className="mono" style={inputCmd} />
            </FieldCmd>
            <FieldCmd label="MC Sortie · k$">
              <input value={mcS} onChange={e => setMcS(e.target.value)} className="mono" style={inputCmd} />
            </FieldCmd>
            <FieldCmd label="Size · SOL">
              <input value={size} onChange={e => setSize(e.target.value)} className="mono" style={inputCmd} />
            </FieldCmd>
          </div>

          {/* Live PnL preview */}
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{
              display: 'flex', gap: 12, padding: '14px 18px', borderRadius: 10,
              background: pnl != null && pnl > 0 ? 'oklch(0.74 0.16 152 / 0.08)' : pnl != null && pnl < 0 ? 'oklch(0.68 0.21 22 / 0.08)' : 'var(--surface-2)',
              border: '1px solid ' + (pnl != null && pnl > 0 ? 'oklch(0.74 0.16 152 / 0.25)' : pnl != null && pnl < 0 ? 'oklch(0.68 0.21 22 / 0.25)' : 'var(--border)'),
              alignItems: 'baseline', justifyContent: 'space-between',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>PnL</div>
                  <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: pnl != null ? (pnl > 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-3)', letterSpacing: '-0.02em' }}>
                    {pnl != null ? `${pnl >= 0 ? '+' : ''}${pnl.toFixed(3)}` : '—'}
                    <span style={{ fontSize: 14, color: 'var(--text-3)', marginLeft: 4, fontWeight: 500 }}>SOL</span>
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Perf</div>
                  <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: pct != null ? (pct > 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-3)', letterSpacing: '-0.02em' }}>
                    {pct != null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%` : '—'}
                  </div>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>fees · 0.004 SOL</div>
            </div>
          </div>

          {/* Conviction · Type · Marché · Erreur — all pills, one row each */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <PillRow label="Conviction" options={['A · Forte','B · Moyenne','C · Faible']} value={conv === 'A' ? 'A · Forte' : conv === 'B' ? 'B · Moyenne' : 'C · Faible'} onChange={v => setConv(v[0])} colors={['green','amber','red']} />
            <PillRow label="Type"        options={['Early','Breakout','Momentum','Rotation']} value="Momentum" />
            <PillRow label="Marché"      options={['Bull','Neutre','Mort']} value="Bull" colors={['green','amber','red']} />
          </div>

          {/* Discipline — 4 toggles in a row */}
          <div style={{ padding: '20px 20px 12px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Discipline · 4 règles</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { k: 'r1', l: 'R1 Narrative' },
                { k: 'r2', l: 'R2 ATH cible' },
                { k: 'r3', l: 'R3 Capital libéré' },
                { k: 'r4', l: 'R4 SL −20%' },
              ].map(r => (
                <button key={r.k} onClick={() => setRules(s => ({ ...s, [r.k]: !s[r.k] }))} style={{
                  background: rules[r.k] ? 'oklch(0.74 0.16 152 / 0.10)' : 'var(--surface-2)',
                  border: '1px solid ' + (rules[r.k] ? 'oklch(0.74 0.16 152 / 0.30)' : 'var(--border)'),
                  borderRadius: 8, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 12, color: rules[r.k] ? 'var(--text)' : 'var(--text-2)' }}>{r.l}</span>
                  <span style={{
                    width: 14, height: 14, borderRadius: 4,
                    border: '1.5px solid ' + (rules[r.k] ? 'var(--green)' : 'var(--text-4)'),
                    background: rules[r.k] ? 'var(--green)' : 'transparent',
                    color: 'var(--bg)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{rules[r.k] ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Erreur */}
          <div style={{ padding: '0 20px 12px' }}>
            <PillRow
              label="Erreur"
              options={['Aucune','FOMO','Overtrade','Mauvais sizing','Pas de SL','Exit trop tôt']}
              value={err}
              onChange={setErr}
              colors={['green','red','red','red','red','amber']}
            />
          </div>

          {/* Note with tag/mention support */}
          <div style={{ padding: '0 20px 20px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Note · #tags @tokens supportés</div>
            <div style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 14px',
              minHeight: 80,
              fontSize: 13, lineHeight: 1.5,
              color: 'var(--text)',
            }}>
              <NoteRich value={note} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {['#breakout','#patience','#discipline','#fomo','#regret'].map(t => (
                <button key={t} className="mono" style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-3)',
                  borderRadius: 99, padding: '3px 9px', fontSize: 10, cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button style={{
                background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)',
                padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              }}>Mark A+</button>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>auto-saved · 2s ago</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)',
                padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              }}>Cancel</button>
              <button style={{
                background: 'var(--text)', color: 'var(--bg)', border: 'none',
                padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Save trade <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>⏎</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCmd = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 12px',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
};

function FieldCmd({ label, children }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function PillRow({ label, options, value, onChange, colors }) {
  const colorMap = { green: 'var(--green)', red: 'var(--red)', amber: 'var(--amber)' };
  return (
    <div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((o, i) => {
          const active = o === value;
          const c = colors ? colorMap[colors[i]] : 'var(--accent)';
          return (
            <button key={o} onClick={() => onChange && onChange(o)} style={{
              background: active ? `color-mix(in oklch, ${c} 14%, transparent)` : 'transparent',
              border: '1px solid ' + (active ? `color-mix(in oklch, ${c} 30%, transparent)` : 'var(--border)'),
              color: active ? c : 'var(--text-2)',
              padding: '6px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer', fontWeight: active ? 600 : 500,
              transition: 'all 0.15s',
            }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function NoteRich({ value }) {
  const parts = value.split(/(\s+)/);
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith('#')) return <span key={i} style={{ color: 'var(--accent)', background: 'oklch(0.74 0.14 240 / 0.10)', padding: '1px 5px', borderRadius: 4 }}>{p}</span>;
        if (p.startsWith('@')) return <span key={i} style={{ color: 'var(--violet)', background: 'oklch(0.72 0.16 290 / 0.10)', padding: '1px 5px', borderRadius: 4 }}>{p}</span>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Trade Detail
// ─────────────────────────────────────────────────────────────────
function CommandTradeDetail() {
  const t = window.tradeById(1); // WIF, the win
  return (
    <div style={cmdStyles.shell}>
      <CmdTopBar />
      <div style={{ overflow: 'auto' }}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)',
            padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
          }}>← All trades</button>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>trades / WIF / 04-22 14:32</span>
        </div>

        <div style={{ padding: '0 24px 28px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>

          {/* Left col — main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hero */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.token}</h1>
                <span style={{ fontSize: 10, color: 'var(--amber)', border: '1px solid var(--amber)', padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.06em' }}>A+</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.type} · {t.narrative}</span>
              </div>

              <div style={{ display: 'flex', gap: 36, alignItems: 'baseline' }}>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>PnL</div>
                  <div className="mono" style={{ fontSize: 44, fontWeight: 700, color: 'var(--green)', letterSpacing: '-0.02em' }}>
                    +{t.pnlSol.toFixed(2)}<span style={{ fontSize: 18, color: 'var(--text-3)', marginLeft: 6, fontWeight: 500 }}>SOL</span>
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Perf</div>
                  <div className="mono" style={{ fontSize: 44, fontWeight: 700, color: 'var(--green)', letterSpacing: '-0.02em' }}>+{t.pnlPct}%</div>
                </div>
                <div style={{ flex: 1 }} />
                <MCViz mcE={t.mcE} mcS={t.mcS} />
              </div>
            </div>

            {/* Note + tags */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Note</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                <NoteRich value="Entry parfaite sur le retest, j'ai laissé courir #breakout #patience @WIF — volume × 4 sur la deuxième jambe, j'ai scale-out en 3 fois entre 60K et 89K." />
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['#breakout','#patience','@WIF'].map(t => (
                  <span key={t} className="mono" style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 99,
                    background: t.startsWith('#') ? 'oklch(0.74 0.14 240 / 0.12)' : 'oklch(0.72 0.16 290 / 0.12)',
                    color: t.startsWith('#') ? 'var(--accent)' : 'var(--violet)',
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Discipline checklist */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Discipline · 4/4 ✓</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { l: 'R1 Narrative', d: 'Comprise', ok: true },
                  { l: 'R2 ATH cible', d: 'RR 4×',    ok: true },
                  { l: 'R3 Capital libéré', d: 'Scale-out', ok: true },
                  { l: 'R4 SL −20%', d: 'Pas touché',  ok: true },
                ].map(r => (
                  <div key={r.l} style={{
                    background: 'oklch(0.74 0.16 152 / 0.06)',
                    border: '1px solid oklch(0.74 0.16 152 / 0.18)',
                    borderRadius: 8, padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{r.l}</span>
                      <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{r.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col — meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MetaCard rows={[
              ['Date',         '04-22-2026'],
              ['Heure',        '14:32'],
              ['Type',         'Momentum'],
              ['Narrative',    'Animaux'],
              ['Conviction',   'A · Forte', 'green'],
              ['Marché',       '🔥 Bull actif'],
            ]} />
            <MetaCard title="Numbers" rows={[
              ['MC entrée',  '29.9K'],
              ['MC sortie',  '89.7K'],
              ['Multiple',   '×3.0', 'green'],
              ['Taille',     '1.5 SOL'],
              ['Frais',      '0.004 SOL'],
              ['PnL net',    '+3.01 SOL', 'green'],
            ]} />
            <MetaCard title="Exécution" rows={[
              ['Entry qualité', 'A'],
              ['Exit qualité',  'A'],
              ['Slippage',      'Faible'],
              ['Erreur',        'Aucune', 'green'],
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ title, rows }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {title && <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 16px 8px' }}>{title}</div>}
      {rows.map(([k, v, color], i) => (
        <div key={k} className="mono" style={{
          display: 'flex', justifyContent: 'space-between', padding: '8px 16px', fontSize: 12,
          borderTop: i === 0 && !title ? 'none' : '1px solid var(--border)',
        }}>
          <span style={{ color: 'var(--text-3)' }}>{k}</span>
          <span style={{ color: color === 'green' ? 'var(--green)' : 'var(--text)', fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function MCViz({ mcE, mcS }) {
  const pct = ((mcS - mcE) / mcE) * 100;
  return (
    <div style={{ width: 220 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>MC {mcE}K</span>
        <span style={{ color: 'var(--green)' }}>→ {mcS}K</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, marginTop: 6, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', background: 'linear-gradient(90deg, var(--text-4), var(--green))' }} />
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, textAlign: 'right' }}>+{pct.toFixed(0)}%</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Week View
// ─────────────────────────────────────────────────────────────────
function CommandWeek() {
  return (
    <div style={cmdStyles.shell}>
      <CmdTopBar />
      <div style={{ overflow: 'auto', padding: '20px 24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Semaine 17 · 21 → 27 avril</h1>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>12 trades · <span style={{ color: 'var(--green)' }}>+8.90 SOL</span> · 7 W / 5 L · A+ rate 33%</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>← S16</button>
            <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>S18 →</button>
          </div>
        </div>

        {/* 7-day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 18 }}>
          {window.WEEK_DAYS.map(d => (
            <div key={d.date} style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 12px 10px',
              minHeight: 130,
              display: 'flex', flexDirection: 'column', gap: 8,
              opacity: d.trades.length === 0 ? 0.5 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{d.label}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{d.date}</span>
              </div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: window.pnlColor(d.pnl), letterSpacing: '-0.01em' }}>
                {d.trades.length === 0 ? '—' : window.fmtPnl(d.pnl)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 'auto' }}>
                {d.trades.slice(0, 4).map(id => {
                  const tr = window.tradeById(id);
                  return (
                    <div key={id} className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                      <span style={{ color: 'var(--text-2)' }}>{tr.token}</span>
                      <span style={{ color: window.pnlColor(tr.pnlSol) }}>{window.fmtPnl(tr.pnlSol, 1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Recap row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Bilan de la semaine</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                ['Best trade',   'WIF +3.01 SOL', 'green'],
                ['Worst trade',  'PNUT −0.24 SOL', 'red'],
                ['Best day',     'Mar +5.07', 'green'],
                ['Best narrative', 'Animaux', null],
                ['Erreur top',   'FOMO ×2', 'red'],
                ['Discipline',   '83%',  'green'],
              ].map(([k, v, c]) => (
                <div key={k}>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: c === 'green' ? 'var(--green)' : c === 'red' ? 'var(--red)' : 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Notes & tags de la semaine</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <NoteRich value="3 trades A+ sur #breakout, tous sur narrative @Animaux. 2 erreurs #fomo en marché mort — pattern clair." />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {[['#breakout',3],['#patience',2],['#fomo',2],['#discipline',4],['@Animaux',5],['@AI',2]].map(([t, n]) => (
                  <span key={t} className="mono" style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 99,
                    background: t.startsWith('#') ? 'oklch(0.74 0.14 240 / 0.10)' : 'oklch(0.72 0.16 290 / 0.10)',
                    color: t.startsWith('#') ? 'var(--accent)' : 'var(--violet)',
                  }}>{t} <span style={{ opacity: 0.5, marginLeft: 2 }}>{n}</span></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────
function CommandAnalytics() {
  return (
    <div style={cmdStyles.shell}>
      <CmdTopBar />
      <div style={{ overflow: 'auto', padding: '20px 24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Analytics</h1>
          <div style={{ display: 'flex', gap: 4 }}>
            {['7D','30D','90D','ALL'].map(p => (
              <button key={p} className="mono" style={{
                background: p === '30D' ? 'var(--surface-3)' : 'transparent',
                color: p === '30D' ? 'var(--text)' : 'var(--text-3)',
                border: '1px solid ' + (p === '30D' ? 'var(--border-strong)' : 'transparent'),
                borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Equity curve big */}
          <div style={{ gridColumn: '1 / -1', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Equity Curve</span>
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>peak <span style={{ color: 'var(--green)' }}>+9.10</span> · drawdown <span style={{ color: 'var(--red)' }}>−0.43</span></div>
            </div>
            <EquitySvgBig />
          </div>

          {/* By type */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Performance par type</div>
            <BarRows rows={[
              { l: 'Momentum', n: 4, pnl: +6.01 },
              { l: 'Breakout', n: 3, pnl: +1.94 },
              { l: 'Early',    n: 2, pnl: +0.55 },
              { l: 'Rotation', n: 3, pnl: +0.40 },
            ]} />
          </div>

          {/* By narrative */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Performance par narrative</div>
            <BarRows rows={[
              { l: 'Animaux',         n: 5, pnl: +6.66 },
              { l: 'AI',              n: 2, pnl: +2.69 },
              { l: 'Crypto culture',  n: 1, pnl: +1.55 },
              { l: 'Political',       n: 1, pnl: +0.79 },
              { l: 'Internet meme',   n: 3, pnl: -0.57 },
            ]} />
          </div>

          {/* Error distribution */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Distribution des erreurs</div>
            <BarRows rows={[
              { l: 'Aucune',          n: 6, pnl: +9.88 },
              { l: 'FOMO',            n: 2, pnl: -0.40 },
              { l: 'Exit trop tôt',   n: 2, pnl: -0.13 },
              { l: 'Pas de SL',       n: 1, pnl: -0.24 },
              { l: 'Mauvais sizing',  n: 1, pnl: -0.21 },
            ]} />
          </div>

          {/* Top tokens */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Top tokens</div>
            <BarRows rows={[
              { l: 'WIF',     n: 1, pnl: +3.01 },
              { l: 'GOAT',    n: 1, pnl: +2.30 },
              { l: 'MOODENG', n: 1, pnl: +1.66 },
              { l: 'SPX6900', n: 1, pnl: +1.55 },
              { l: 'POPCAT',  n: 1, pnl: -0.06 },
              { l: 'PNUT',    n: 1, pnl: -0.24 },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BarRows({ rows }) {
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.pnl)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(r => {
        const w = (Math.abs(r.pnl) / maxAbs) * 100;
        const pos = r.pnl >= 0;
        return (
          <div key={r.l}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.l}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.n}t · <span style={{ color: window.pnlColor(r.pnl), fontWeight: 600 }}>{window.fmtPnl(r.pnl)} SOL</span></span>
            </div>
            <div style={{ display: 'flex', height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${w}%`, background: pos ? 'var(--green)' : 'var(--red)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EquitySvgBig() {
  const W = 1200, H = 240, P = 12;
  const pts = window.EQUITY;
  const max = Math.max(...pts.map(p => p.y));
  const min = Math.min(0, ...pts.map(p => p.y));
  const x = i => P + (i / (pts.length - 1)) * (W - P*2);
  const y = v => H - P - ((v - min) / (max - min)) * (H - P*2);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const area = path + ` L${x(pts.length-1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cmdEqBig" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.74 0.16 152)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="oklch(0.74 0.16 152)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1="0" y1={H * t} x2={W} y2={H * t} stroke="rgba(255,255,255,0.04)" />
      ))}
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 4" />
      <path d={area} fill="url(#cmdEqBig)" />
      <path d={path} fill="none" stroke="oklch(0.74 0.16 152)" strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.y)} r="3" fill="var(--bg)" stroke="oklch(0.74 0.16 152)" strokeWidth="1.5" />
          {(i === 0 || i === pts.length-1 || i === 4) && (
            <text x={x(i)} y={y(p.y) - 10} className="mono" textAnchor="middle" fontSize="10" fill="var(--text-2)" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {p.token}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

Object.assign(window, { CommandDashboard, CommandQuickCapture, CommandTradeDetail, CommandWeek, CommandAnalytics });
