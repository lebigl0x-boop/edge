// Direction 3 — Spatial Workspace
// Sidebar permanente, table éditable inline, heatmap pour repérer patterns d'erreur.
// Plus dense que V2, plus structuré que V1. Pour reviewer vite.

const spStyles = {
  shell: {
    width: '100%', height: '100%',
    background: '#0E1014',
    color: '#E4E6EA',
    fontFamily: "'Inter Tight', system-ui, sans-serif",
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    overflow: 'hidden',
  },
  sidebar: {
    background: '#090A0D',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    padding: '20px 16px',
    display: 'flex', flexDirection: 'column', gap: 4,
    overflow: 'auto',
  },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 10px', borderRadius: 6,
    fontSize: 13,
    color: active ? '#E4E6EA' : 'rgba(228,230,234,0.55)',
    background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
    cursor: 'pointer', transition: 'all 0.12s',
    fontWeight: active ? 500 : 400,
  }),
};

const SP_GREEN = '#4ADE80';
const SP_RED = '#F87171';
const SP_AMBER = '#FBBF24';
const SP_VIO = '#A78BFA';
const SP_BLUE = '#60A5FA';

function spPnlColor(n) {
  if (n == null || n === 0) return 'rgba(228,230,234,0.4)';
  return n > 0 ? SP_GREEN : SP_RED;
}

function SpSidebar({ active }) {
  const items = [
    { g: 'Workspace', items: [
      { ic: '◐', l: 'Dashboard' },
      { ic: '☰', l: 'Tous les trades', count: 12 },
      { ic: '✛', l: 'Saisie rapide', kbd: 'N' },
      { ic: '◷', l: 'Cette semaine' },
      { ic: '◇', l: 'Analyses' },
    ]},
    { g: 'Filtres rapides', items: [
      { ic: '★', l: 'Trades A+', count: 4, color: SP_AMBER },
      { ic: '↑', l: 'Wins', count: 7, color: SP_GREEN },
      { ic: '↓', l: 'Losses', count: 5, color: SP_RED },
      { ic: '⚠', l: 'Erreurs', count: 4, color: SP_RED },
    ]},
    { g: 'Tags', items: [
      { ic: '#', l: 'breakout', count: 3, color: SP_BLUE },
      { ic: '#', l: 'patience', count: 2, color: SP_BLUE },
      { ic: '#', l: 'fomo', count: 2, color: SP_BLUE },
      { ic: '#', l: 'discipline', count: 4, color: SP_BLUE },
      { ic: '@', l: 'WIF', count: 1, color: SP_VIO },
      { ic: '@', l: 'Animaux', count: 5, color: SP_VIO },
    ]},
  ];
  return (
    <div style={spStyles.sidebar}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 16px' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #4ADE80, #60A5FA)', boxShadow: '0 0 14px rgba(74,222,128,0.3)' }} />
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Edge</span>
        <span className="mono" style={{ fontSize: 9, color: 'rgba(228,230,234,0.4)', marginLeft: 'auto' }}>v2</span>
      </div>

      {/* Wallet pill */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8, padding: '10px 12px', marginBottom: 16,
      }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Wallet</div>
        <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: '#E4E6EA' }}>24.18<span style={{ fontSize: 11, color: 'rgba(228,230,234,0.5)', marginLeft: 4 }}>SOL</span></div>
        <div className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.4)', marginTop: 2 }}>BqK…7Hf</div>
      </div>

      {items.map(g => (
        <div key={g.g} style={{ marginBottom: 12 }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px 6px' }}>{g.g}</div>
          {g.items.map(it => (
            <div key={it.l} style={spStyles.navItem(active === it.l)}>
              <span style={{ width: 14, color: it.color || 'rgba(228,230,234,0.5)', fontSize: 12 }}>{it.ic}</span>
              <span style={{ flex: 1 }}>{it.l}</span>
              {it.count != null && <span className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.4)' }}>{it.count}</span>}
              {it.kbd && <span className="mono" style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(255,255,255,0.06)', borderRadius: 3, color: 'rgba(228,230,234,0.5)' }}>{it.kbd}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────
function SpatialDashboard() {
  return (
    <div style={spStyles.shell}>
      <SpSidebar active="Dashboard" />
      <div style={{ overflow: 'auto' }}>
        {/* Workspace top */}
        <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Dashboard</h1>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.45)', marginTop: 2 }}>Sem 17 · 21 → 27 avril · 12 trades</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              padding: '6px 12px', borderRadius: 6, fontSize: 12, color: 'rgba(228,230,234,0.7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>⌕ Search <span className="mono" style={{ fontSize: 9, color: 'rgba(228,230,234,0.4)' }}>⌘K</span></button>
            <button style={{
              background: SP_GREEN, color: '#0E1014', border: 'none',
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>+ Quick log <span className="mono" style={{ fontSize: 9, opacity: 0.6 }}>N</span></button>
          </div>
        </div>

        <div style={{ padding: '16px 28px 28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          {/* Left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Top KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: 10 }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.10), rgba(74,222,128,0.02))', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 10, padding: '14px 16px' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Total PnL · 7j</div>
                <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: SP_GREEN, marginTop: 6, letterSpacing: '-0.02em' }}>+8.90<span style={{ fontSize: 13, color: 'rgba(228,230,234,0.5)', marginLeft: 4, fontWeight: 500 }}>SOL</span></div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(228,230,234,0.45)', marginTop: 4 }}>≈ $1,512</div>
              </div>
              {[
                { l: 'Win rate',   v: '58%',  c: SP_GREEN },
                { l: 'RR réel',    v: '2.4×', c: SP_GREEN },
                { l: 'Discipline', v: '83%',  c: SP_GREEN },
                { l: 'A+ rate',    v: '33%',  c: SP_AMBER },
              ].map(s => (
                <div key={s.l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
                  <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.l}</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: s.c, marginTop: 6, letterSpacing: '-0.02em' }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Equity */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Equity curve</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.45)' }}>peak +9.10 · DD −0.43</span>
              </div>
              <SpEquity />
            </div>

            {/* Inline-editable trades table */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Trades</span>
                  <span className="mono" style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: 3, color: 'rgba(228,230,234,0.6)' }}>inline edit</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['Tous','Wins','Losses','A+','Erreurs'].map((f, i) => (
                    <button key={f} style={{
                      background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: i === 0 ? '#E4E6EA' : 'rgba(228,230,234,0.5)',
                      border: 'none', borderRadius: 4, padding: '3px 9px', fontSize: 11, cursor: 'pointer',
                    }}>{f}</button>
                  ))}
                </div>
              </div>

              <SpTable />
            </div>
          </div>

          {/* Right col — error heatmap + insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Error heatmap */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Heatmap erreurs × marché</span>
              </div>
              <SpHeatmap />
              <p style={{ fontSize: 11.5, color: 'rgba(228,230,234,0.55)', marginTop: 12, lineHeight: 1.5 }}>
                <span style={{ color: SP_RED }}>●</span> Tes erreurs FOMO se concentrent en marché <strong>mort</strong>. Pattern net.
              </p>
            </div>

            {/* Patterns */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Insights auto</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { ic: '↑', c: SP_GREEN, t: <span><strong>Animaux</strong> = ton edge. 5 trades, +6.66 SOL, WR 60%.</span> },
                  { ic: '⚠', c: SP_RED,   t: <span>2× <strong>FOMO</strong> en marché mort. −0.40 SOL. Pattern récurrent.</span> },
                  { ic: '◇', c: SP_AMBER, t: <span><strong>Conviction A</strong> = 100% wins. Filtrer plus dur.</span> },
                  { ic: '○', c: SP_BLUE,  t: <span><strong>Mardi</strong> ton meilleur jour. +5.07 SOL.</span> },
                ].map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 12, lineHeight: 1.4, alignItems: 'flex-start' }}>
                    <span style={{ color: i.c, marginTop: 1 }}>{i.ic}</span>
                    <span style={{ color: 'rgba(228,230,234,0.8)' }}>{i.t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top tags */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Tags actifs</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[['#breakout',3,SP_BLUE],['#patience',2,SP_BLUE],['#fomo',2,SP_RED],['#discipline',4,SP_BLUE],['#regret',1,SP_AMBER],['@Animaux',5,SP_VIO],['@AI',2,SP_VIO]].map(([t,n,c]) => (
                  <span key={t} className="mono" style={{
                    fontSize: 10.5, padding: '4px 8px', borderRadius: 99,
                    background: `color-mix(in oklch, ${c} 14%, transparent)`,
                    color: c, fontWeight: 500,
                  }}>{t} <span style={{ opacity: 0.6, marginLeft: 2 }}>{n}</span></span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function SpTable() {
  return (
    <div>
      <div className="mono" style={{ display: 'grid', gridTemplateColumns: '70px 90px 80px 80px 80px 90px 60px 1fr', gap: 8, padding: '8px 16px', fontSize: 9.5, color: 'rgba(228,230,234,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span>Date</span><span>Token</span><span>Type</span><span>MC E.</span><span>MC S.</span><span style={{ textAlign: 'right' }}>PnL</span><span>Conv</span><span>Note</span>
      </div>
      {window.TRADES.slice(0, 8).map(t => <SpRow key={t.id} t={t} />)}
    </div>
  );
}

function SpRow({ t }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="mono"
      style={{
        display: 'grid', gridTemplateColumns: '70px 90px 80px 80px 80px 90px 60px 1fr', gap: 8,
        padding: '8px 16px', fontSize: 11.5,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: hover ? 'rgba(255,255,255,0.02)' : 'transparent',
        alignItems: 'center', cursor: 'pointer',
      }}
    >
      <span style={{ color: 'rgba(228,230,234,0.5)' }}>{t.date}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontWeight: 600, color: '#E4E6EA' }}>{t.token}</span>
        {t.aplus && <span style={{ fontSize: 8, color: SP_AMBER }}>★</span>}
      </span>
      <span style={{ color: 'rgba(228,230,234,0.6)', fontSize: 10.5 }}>{t.type}</span>
      <span style={{ color: 'rgba(228,230,234,0.5)' }}>{t.mcE}K</span>
      <span style={{ color: 'rgba(228,230,234,0.5)' }}>{t.mcS}K</span>
      <span style={{ color: spPnlColor(t.pnlSol), textAlign: 'right', fontWeight: 600 }}>{window.fmtPnl(t.pnlSol)}</span>
      <span style={{ color: t.conv === 'A' ? SP_GREEN : t.conv === 'B' ? SP_AMBER : SP_RED }}>{t.conv}</span>
      <span style={{ color: 'rgba(228,230,234,0.5)', fontFamily: "'Inter Tight', sans-serif", fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {t.note}
      </span>
    </div>
  );
}

function SpEquity() {
  const W = 800, H = 130, P = 8;
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
        <linearGradient id="spEq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SP_GREEN} stopOpacity="0.30" />
          <stop offset="100%" stopColor={SP_GREEN} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 3" />
      <path d={area} fill="url(#spEq)" />
      <path d={path} fill="none" stroke={SP_GREEN} strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.y)} r="2" fill={SP_GREEN} />)}
    </svg>
  );
}

function SpHeatmap() {
  // rows = error type, cols = market
  const rows = ['Aucune', 'FOMO', 'Exit tôt', 'Pas de SL', 'Sizing'];
  const cols = ['Bull', 'Neutre', 'Mort'];
  const data = [
    [3, 2, 1],   // Aucune
    [0, 0, 2],   // FOMO
    [0, 1, 1],   // Exit tôt
    [0, 1, 0],   // Pas de SL
    [0, 1, 0],   // Sizing
  ];
  const max = 3;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(3, 1fr)', gap: 4, marginBottom: 4 }}>
        <span></span>
        {cols.map(c => <span key={c} className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.5)', textAlign: 'center' }}>{c}</span>)}
      </div>
      {rows.map((r, i) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: '70px repeat(3, 1fr)', gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'rgba(228,230,234,0.7)', display: 'flex', alignItems: 'center' }}>{r}</span>
          {data[i].map((v, j) => {
            const intensity = v / max;
            const bgColor = i === 0
              ? `oklch(0.74 0.16 152 / ${0.10 + intensity * 0.45})`
              : `oklch(0.68 0.21 22 / ${0.06 + intensity * 0.50})`;
            const txtCol = v === 0 ? 'rgba(228,230,234,0.25)' : '#E4E6EA';
            return (
              <div key={j} className="mono" style={{
                background: v === 0 ? 'rgba(255,255,255,0.02)' : bgColor,
                border: '1px solid ' + (v === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'),
                height: 30, borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: txtCol, fontWeight: v > 0 ? 600 : 400,
              }}>{v}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// New (inline saisie within table context)
// ─────────────────────────────────────────────────────────────────
function SpatialNew() {
  return (
    <div style={spStyles.shell}>
      <SpSidebar active="Saisie rapide" />
      <div style={{ overflow: 'auto' }}>
        <div style={{ padding: '20px 28px 0' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Saisie inline</h1>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.45)', marginTop: 2 }}>Tab pour avancer · ⏎ pour valider la ligne · auto-save</div>
        </div>

        <div style={{ padding: '16px 28px 28px' }}>
          {/* Active inline row */}
          <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.30)', borderRadius: 10, padding: 0, marginBottom: 20, boxShadow: '0 0 0 4px rgba(96,165,250,0.06)' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(96,165,250,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: SP_BLUE, boxShadow: '0 0 8px ' + SP_BLUE }} />
                <span className="mono" style={{ fontSize: 10.5, color: SP_BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Nouvelle ligne · 04-25 13:47</span>
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.5)' }}>⏎ valider · esc annuler</span>
            </div>

            <div className="mono" style={{ display: 'grid', gridTemplateColumns: '90px 70px 80px 80px 80px 90px 60px 60px 1fr', gap: 8, padding: '14px 16px', fontSize: 12, alignItems: 'center' }}>
              <SpInline value="04-25 13:47" muted />
              <SpInline value="WIF" bold focused />
              <SpInline value="Momentum" muted />
              <SpInline value="29.9K" />
              <SpInline value="89.7K" />
              <SpInline value="+3.01" color={SP_GREEN} bold />
              <SpInline value="A" color={SP_GREEN} center />
              <SpInline value="Bull" color={SP_GREEN} center />
              <SpInline value="Entry parfaite #breakout @WIF" rich />
            </div>

            {/* Discipline mini-row */}
            <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px dashed rgba(96,165,250,0.15)', paddingTop: 12, marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Discipline</span>
              {['R1 Narrative','R2 ATH','R3 Capital','R4 SL'].map(r => (
                <button key={r} style={{
                  background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.30)',
                  color: SP_GREEN, padding: '3px 9px', borderRadius: 99,
                  fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'inherit',
                }}><span style={{ fontSize: 10 }}>✓</span> {r}</button>
              ))}
              <span style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.4)' }}>SL · Cut · Slow</span>
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 99, padding: '3px 8px', color: 'rgba(228,230,234,0.5)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>—</button>
              <button style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.30)', borderRadius: 99, padding: '3px 8px', color: SP_GREEN, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Cut</button>
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 99, padding: '3px 8px', color: 'rgba(228,230,234,0.5)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>—</button>
            </div>
          </div>

          {/* Existing rows below to show context */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
            <div className="mono" style={{ display: 'grid', gridTemplateColumns: '90px 70px 80px 80px 80px 90px 60px 60px 1fr', gap: 8, padding: '8px 16px', fontSize: 9.5, color: 'rgba(228,230,234,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>Date</span><span>Token</span><span>Type</span><span>MC E.</span><span>MC S.</span><span style={{ textAlign: 'right' }}>PnL</span><span>Conv</span><span>Marché</span><span>Note</span>
            </div>
            {window.TRADES.slice(0, 7).map(t => (
              <div key={t.id} className="mono" style={{
                display: 'grid', gridTemplateColumns: '90px 70px 80px 80px 80px 90px 60px 60px 1fr', gap: 8,
                padding: '9px 16px', fontSize: 11.5, alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <span style={{ color: 'rgba(228,230,234,0.5)' }}>{t.date} {t.heure}</span>
                <span style={{ fontWeight: 600 }}>{t.token}</span>
                <span style={{ color: 'rgba(228,230,234,0.6)', fontSize: 10.5 }}>{t.type}</span>
                <span style={{ color: 'rgba(228,230,234,0.5)' }}>{t.mcE}K</span>
                <span style={{ color: 'rgba(228,230,234,0.5)' }}>{t.mcS}K</span>
                <span style={{ color: spPnlColor(t.pnlSol), textAlign: 'right', fontWeight: 600 }}>{window.fmtPnl(t.pnlSol)}</span>
                <span style={{ color: t.conv === 'A' ? SP_GREEN : t.conv === 'B' ? SP_AMBER : SP_RED }}>{t.conv}</span>
                <span style={{ color: t.marche === 'Bull' ? SP_GREEN : t.marche === 'Neutre' ? SP_AMBER : SP_RED, fontSize: 10.5 }}>{t.marche}</span>
                <span style={{ color: 'rgba(228,230,234,0.45)', fontFamily: "'Inter Tight', sans-serif", fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpInline({ value, muted, bold, color, center, focused, rich }) {
  return (
    <div style={{
      background: focused ? 'rgba(96,165,250,0.10)' : 'transparent',
      border: focused ? '1px solid rgba(96,165,250,0.40)' : '1px solid transparent',
      borderRadius: 5, padding: '5px 8px',
      color: color || (muted ? 'rgba(228,230,234,0.55)' : '#E4E6EA'),
      fontWeight: bold ? 700 : 500,
      fontSize: 12,
      textAlign: center ? 'center' : 'left',
    }}>
      {rich ? <span style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        Entry parfaite <span style={{ color: SP_BLUE, background: 'rgba(96,165,250,0.10)', padding: '1px 4px', borderRadius: 3 }}>#breakout</span> <span style={{ color: SP_VIO, background: 'rgba(167,139,250,0.10)', padding: '1px 4px', borderRadius: 3 }}>@WIF</span>
      </span> : value}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Trade detail
// ─────────────────────────────────────────────────────────────────
function SpatialDetail() {
  const t = window.tradeById(1);
  return (
    <div style={spStyles.shell}>
      <SpSidebar active="Tous les trades" />
      <div style={{ overflow: 'auto' }}>
        <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(228,230,234,0.7)', padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>←</button>
            <span className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.5)' }}>trades / WIF / 04-22 14:32</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(228,230,234,0.7)', padding: '5px 12px', borderRadius: 5, fontSize: 12, cursor: 'pointer' }}>Edit</button>
            <button style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.20)', color: SP_RED, padding: '5px 12px', borderRadius: 5, fontSize: 12, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>

        <div style={{ padding: '16px 28px 28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.06), rgba(74,222,128,0.01))', border: '1px solid rgba(74,222,128,0.18)', borderRadius: 10, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.token}</h1>
                <span style={{ fontSize: 9.5, padding: '3px 8px', background: 'rgba(251,191,36,0.15)', color: SP_AMBER, borderRadius: 4, fontWeight: 700, letterSpacing: '0.06em' }}>A+</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.45)' }}>{t.type} · {t.narrative}</span>
              </div>
              <div style={{ display: 'flex', gap: 32, alignItems: 'baseline' }}>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>PnL</div>
                  <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: SP_GREEN, letterSpacing: '-0.02em' }}>+{t.pnlSol.toFixed(2)}<span style={{ fontSize: 14, color: 'rgba(228,230,234,0.5)', marginLeft: 4, fontWeight: 500 }}>SOL</span></div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Perf</div>
                  <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: SP_GREEN, letterSpacing: '-0.02em' }}>+{t.pnlPct}%</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Multiple</div>
                  <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: SP_GREEN, letterSpacing: '-0.02em' }}>×3.0</div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 18px' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Note</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(228,230,234,0.85)' }}>
                Entry parfaite sur le retest, j'ai laissé courir <SpTag t="#breakout" /> <SpTag t="#patience" /> <SpTag t="@WIF" /> — volume × 4 sur la deuxième jambe, j'ai scale-out en 3 fois entre 60K et 89K.
              </div>
            </div>

            {/* Discipline */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 18px' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Discipline · 4/4</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  ['R1 Narrative',    'Comprise'],
                  ['R2 ATH cible',    'RR 4×'],
                  ['R3 Capital libre','Scale-out'],
                  ['R4 SL −20%',      'Pas touché'],
                ].map(([l, d]) => (
                  <div key={l} style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: 7, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600 }}>{l}</span>
                      <span style={{ color: SP_GREEN }}>✓</span>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.5)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SpMeta rows={[
              ['Date', '04-22-2026'],
              ['Heure', '14:32'],
              ['Type', 'Momentum'],
              ['Narrative', 'Animaux'],
              ['Conviction', 'A · Forte', SP_GREEN],
              ['Marché', '🔥 Bull'],
            ]} />
            <SpMeta title="Numbers" rows={[
              ['MC entrée', '29.9K'],
              ['MC sortie', '89.7K'],
              ['Multiple', '×3.0', SP_GREEN],
              ['Taille', '1.5 SOL'],
              ['Frais', '0.004 SOL'],
              ['PnL net', '+3.01 SOL', SP_GREEN],
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SpTag({ t }) {
  const isMention = t.startsWith('@');
  const c = isMention ? SP_VIO : SP_BLUE;
  return <span style={{
    color: c, background: `color-mix(in oklch, ${c} 14%, transparent)`,
    padding: '1px 6px', borderRadius: 4, fontSize: 12,
  }}>{t}</span>;
}

function SpMeta({ title, rows }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
      {title && <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 14px 8px' }}>{title}</div>}
      {rows.map(([k, v, c], i) => (
        <div key={k} className="mono" style={{
          display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: 11.5,
          borderTop: i === 0 && !title ? 'none' : '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ color: 'rgba(228,230,234,0.5)' }}>{k}</span>
          <span style={{ color: c || '#E4E6EA', fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Week
// ─────────────────────────────────────────────────────────────────
function SpatialWeek() {
  return (
    <div style={spStyles.shell}>
      <SpSidebar active="Cette semaine" />
      <div style={{ overflow: 'auto' }}>
        <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Semaine 17</h1>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.45)', marginTop: 2 }}>21 → 27 avril · <span style={{ color: SP_GREEN }}>+8.90 SOL</span> · 12 trades</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(228,230,234,0.7)', padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>← S16</button>
            <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(228,230,234,0.7)', padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>S18 →</button>
          </div>
        </div>

        <div style={{ padding: '16px 28px 28px', display: 'grid', gridTemplateRows: 'auto 1fr', gap: 14 }}>
          {/* 7-day strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {window.WEEK_DAYS.map(d => {
              const intensity = Math.min(Math.abs(d.pnl) / 6, 1);
              const bg = d.trades.length === 0
                ? 'rgba(255,255,255,0.025)'
                : d.pnl > 0
                  ? `oklch(0.74 0.16 152 / ${0.06 + intensity * 0.20})`
                  : `oklch(0.68 0.21 22 / ${0.06 + intensity * 0.20})`;
              return (
                <div key={d.date} style={{
                  background: bg,
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8, padding: '12px 14px', minHeight: 100,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#E4E6EA' }}>{d.label}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.4)' }}>{d.date}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: spPnlColor(d.pnl), letterSpacing: '-0.01em', marginTop: 4 }}>
                    {d.trades.length === 0 ? '—' : window.fmtPnl(d.pnl)}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'rgba(228,230,234,0.45)', marginTop: 'auto' }}>
                    {d.trades.length === 0 ? 'no trade' : `${d.trades.length} trades`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two cols: full table + insights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
              <SpTable />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Bilan S17</div>
                {[
                  ['Best',         'WIF +3.01', SP_GREEN],
                  ['Worst',        'PNUT −0.24', SP_RED],
                  ['Best day',     'Mar +5.07', SP_GREEN],
                  ['Discipline',   '83%', SP_GREEN],
                  ['Top err',      'FOMO ×2', SP_RED],
                ].map(([k, v, c]) => (
                  <div key={k} className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'rgba(228,230,234,0.55)' }}>{k}</span>
                    <span style={{ color: c, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>À retenir</div>
                <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'rgba(228,230,234,0.75)' }}>
                  Pas de trade en marché <strong>mort</strong> sauf conviction <strong>A</strong>. Continuer scale-out en 3× sur breakouts.
                </p>
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
function SpatialAnalytics() {
  return (
    <div style={spStyles.shell}>
      <SpSidebar active="Analyses" />
      <div style={{ overflow: 'auto' }}>
        <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Analyses</h1>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.45)', marginTop: 2 }}>30 derniers jours · 32 trades</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['7j','30j','90j','Tout'].map((p, i) => (
              <button key={p} className="mono" style={{
                background: i === 1 ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: i === 1 ? '#E4E6EA' : 'rgba(228,230,234,0.5)',
                border: '1px solid ' + (i === 1 ? 'rgba(255,255,255,0.12)' : 'transparent'),
                borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 28px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Equity</span>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.45)' }}>+8.90 SOL · DD −0.43</span>
            </div>
            <SpEquityBig />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Heatmap erreurs × marché</div>
            <SpHeatmap />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Performance par narrative</div>
            <SpBarRows rows={[
              { l: 'Animaux', n: 5, pnl: +6.66 },
              { l: 'AI', n: 2, pnl: +2.69 },
              { l: 'Crypto culture', n: 1, pnl: +1.55 },
              { l: 'Political', n: 1, pnl: +0.79 },
              { l: 'Internet meme', n: 3, pnl: -0.57 },
            ]} />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Performance par type</div>
            <SpBarRows rows={[
              { l: 'Momentum', n: 4, pnl: +6.01 },
              { l: 'Breakout', n: 3, pnl: +1.94 },
              { l: 'Early', n: 2, pnl: +0.55 },
              { l: 'Rotation', n: 3, pnl: +0.40 },
            ]} />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(228,230,234,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Distribution erreurs</div>
            <SpBarRows rows={[
              { l: 'Aucune', n: 6, pnl: +9.88 },
              { l: 'FOMO', n: 2, pnl: -0.40 },
              { l: 'Exit trop tôt', n: 2, pnl: -0.13 },
              { l: 'Pas de SL', n: 1, pnl: -0.24 },
              { l: 'Mauvais sizing', n: 1, pnl: -0.21 },
            ]} />
          </div>

        </div>
      </div>
    </div>
  );
}

function SpBarRows({ rows }) {
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.pnl)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {rows.map(r => {
        const w = (Math.abs(r.pnl) / maxAbs) * 100;
        return (
          <div key={r.l}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, color: 'rgba(228,230,234,0.85)' }}>{r.l}</span>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(228,230,234,0.5)' }}>{r.n}t · <span style={{ color: spPnlColor(r.pnl), fontWeight: 600 }}>{window.fmtPnl(r.pnl)}</span></span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${w}%`, background: r.pnl >= 0 ? SP_GREEN : SP_RED, borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpEquityBig() {
  const W = 1100, H = 220, P = 12;
  const pts = window.EQUITY;
  const max = Math.max(...pts.map(p => p.y));
  const min = Math.min(0, ...pts.map(p => p.y));
  const x = i => P + (i / (pts.length - 1)) * (W - P*2);
  const y = v => H - P - ((v - min) / (max - min)) * (H - P*2);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const area = path + ` L${x(pts.length-1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 220 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spEqBig" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SP_GREEN} stopOpacity="0.30" />
          <stop offset="100%" stopColor={SP_GREEN} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1="0" y1={H * t} x2={W} y2={H * t} stroke="rgba(255,255,255,0.04)" />
      ))}
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
      <path d={area} fill="url(#spEqBig)" />
      <path d={path} fill="none" stroke={SP_GREEN} strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.y)} r="2.5" fill="#0E1014" stroke={SP_GREEN} strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}

Object.assign(window, { SpatialDashboard, SpatialNew, SpatialDetail, SpatialWeek, SpatialAnalytics });
