// Direction 2 — Editorial Journal
// Calme, typographie large (Fraunces sur les chiffres clés), beaucoup d'air.
// Wizard 3 étapes pour la saisie. Pour reviewer comme on lit un journal.

const edStyles = {
  shell: {
    width: '100%', height: '100%',
    background: '#FAFAF7',
    color: '#15151A',
    fontFamily: "'Inter Tight', system-ui, sans-serif",
    display: 'grid',
    gridTemplateRows: '60px 1fr',
    overflow: 'hidden',
  },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: '#FAFAF7',
  },
  navLink: (active) => ({
    fontSize: 13, fontWeight: 500,
    color: active ? '#15151A' : 'rgba(21,21,26,0.45)',
    cursor: 'pointer', padding: '4px 0',
    borderBottom: active ? '1.5px solid #15151A' : '1.5px solid transparent',
  }),
};

const POS = '#1B6B3A';   // editorial green, deep
const NEG = '#9C2A1A';   // editorial red, deep
const ACC = '#3A4FB3';   // muted indigo accent

function edPnl(n) {
  if (n == null || n === 0) return 'rgba(21,21,26,0.45)';
  return n > 0 ? POS : NEG;
}

function EdTopBar({ active = 'Journal' }) {
  return (
    <div style={edStyles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <span className="serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', fontStyle: 'italic' }}>Edge</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Journal','Semaine','Analyses','Notes'].map(l => (
            <span key={l} style={edStyles.navLink(l === active)}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.5)' }}>24.18 SOL · BqK…7Hf</span>
        <button style={{
          background: '#15151A', color: '#FAFAF7',
          border: 'none', padding: '8px 18px', borderRadius: 999,
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>Nouveau trade</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dashboard / Journal
// ─────────────────────────────────────────────────────────────────
function EditorialDashboard() {
  return (
    <div style={edStyles.shell}>
      <EdTopBar active="Journal" />
      <div style={{ overflow: 'auto', padding: '40px 56px 60px' }}>

        {/* Editorial header */}
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Semaine 17 · 21 → 27 avril 2026</div>
            <h1 className="serif" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, fontStyle: 'italic' }}>
              Cette semaine, <span style={{ color: POS, fontStyle: 'normal' }}>+8.90 SOL</span>.
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(21,21,26,0.6)', marginTop: 14, maxWidth: 620, lineHeight: 1.5 }}>
              12 trades, 7 victoires, un win rate de 58%. Tu as bien suivi tes règles — discipline à 83%.
              Mais 2 trades #FOMO en marché mort coûtent 0.40 SOL : c'est ton pattern à casser cette semaine.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Wallet</span>
            <span className="serif" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>24.18</span>
            <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.5)' }}>≈ $4,107</span>
          </div>
        </div>

        {/* 4 stat cards — calm, typographic */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 40 }}>
          {[
            { l: 'Win rate',   v: '58',  u: '%',   sub: 'cible 50' },
            { l: 'RR réel',    v: '2.4', u: '×',   sub: 'cible 2' },
            { l: 'Discipline', v: '83',  u: '%',   sub: 'cible 80' },
            { l: 'A+ rate',    v: '33',  u: '%',   sub: 'cible 30' },
          ].map((s, i) => (
            <div key={s.l} style={{
              padding: '24px 28px',
              borderRight: i < 3 ? '1px solid rgba(0,0,0,0.08)' : 'none',
            }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'rgba(21,21,26,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{s.l}</div>
              <div className="serif" style={{ fontSize: 56, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 10 }}>
                {s.v}<span style={{ fontSize: 22, color: 'rgba(21,21,26,0.5)', marginLeft: 4, fontStyle: 'italic' }}>{s.u}</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'rgba(21,21,26,0.4)', marginTop: 8 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Two columns: Equity (60%) + Pattern à surveiller (40%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.01em' }}>Courbe de capital</h2>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)' }}>cumul · SOL</span>
            </div>
            <EdEquity />
          </div>
          <div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.01em', marginBottom: 16 }}>Pattern à surveiller</h2>
            <div style={{ background: 'rgba(156,42,26,0.05)', border: '1px solid rgba(156,42,26,0.15)', borderRadius: 10, padding: '20px 22px' }}>
              <div className="mono" style={{ fontSize: 10, color: NEG, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>FOMO · 2 trades · −0.40 SOL</div>
              <p style={{ fontSize: 14, color: '#15151A', lineHeight: 1.5, marginBottom: 14 }}>
                Tes deux #FOMO de la semaine sont arrivés tous les deux en <strong>marché mort</strong>, sur des coins à conviction <strong>C</strong>. Pattern net.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12, borderTop: '1px solid rgba(156,42,26,0.15)' }}>
                {[{ tok: 'POPCAT', date: '04-23 09:14', pnl: -0.06 }, { tok: 'GIGA', date: '04-25 10:11', pnl: -0.16 }].map(x => (
                  <div key={x.tok} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span><strong>{x.tok}</strong> <span className="mono" style={{ color: 'rgba(21,21,26,0.5)', marginLeft: 6 }}>{x.date}</span></span>
                    <span className="mono" style={{ color: NEG, fontWeight: 600 }}>{x.pnl.toFixed(2)} SOL</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trades feed — list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.01em' }}>Trades récents</h2>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Tous','Wins','Losses','A+'].map((f, i) => (
                <span key={f} style={{
                  fontSize: 13, color: i === 0 ? '#15151A' : 'rgba(21,21,26,0.4)',
                  fontWeight: i === 0 ? 600 : 400, cursor: 'pointer',
                  borderBottom: i === 0 ? '1px solid #15151A' : 'none',
                  paddingBottom: 2,
                }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            {window.TRADES.slice(0, 6).map(t => <EdTradeRow key={t.id} t={t} />)}
          </div>
        </div>

      </div>
    </div>
  );
}

function EdTradeRow({ t }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 220px 1fr 140px 110px',
        alignItems: 'center', gap: 20,
        padding: '20px 4px', borderBottom: '1px solid rgba(0,0,0,0.08)',
        cursor: 'pointer',
        background: hover ? 'rgba(0,0,0,0.015)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)' }}>{t.date} · {t.heure}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{t.token}</span>
          {t.aplus && <span className="mono" style={{ fontSize: 9, padding: '2px 6px', background: '#15151A', color: '#FAFAF7', borderRadius: 3, letterSpacing: '0.06em', fontWeight: 700 }}>A+</span>}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)', marginTop: 2 }}>{t.type} · {t.narrative}</div>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(21,21,26,0.65)', lineHeight: 1.45, maxWidth: 480 }}>
        {t.note}
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)' }}>
        {t.mcE.toFixed(0)}K → {t.mcS.toFixed(0)}K
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="serif" style={{ fontSize: 26, fontWeight: 500, color: edPnl(t.pnlSol), letterSpacing: '-0.01em', lineHeight: 1 }}>
          {window.fmtPnl(t.pnlSol)}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'rgba(21,21,26,0.4)', marginTop: 4 }}>SOL · {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct}%</div>
      </div>
    </div>
  );
}

function EdEquity() {
  const W = 720, H = 220, P = 12;
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
        <linearGradient id="edEq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={POS} stopOpacity="0.18" />
          <stop offset="100%" stopColor={POS} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="rgba(0,0,0,0.10)" strokeDasharray="2 4" />
      <path d={area} fill="url(#edEq)" />
      <path d={path} fill="none" stroke={POS} strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.y)} r="2.5" fill="#FAFAF7" stroke={POS} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// New trade — wizard 3 steps
// ─────────────────────────────────────────────────────────────────
function EditorialNew() {
  const [step, setStep] = React.useState(2); // show step 2 to demonstrate the rich middle
  const [conv, setConv] = React.useState('A');
  const [type, setType] = React.useState('Momentum');

  return (
    <div style={edStyles.shell}>
      <EdTopBar active="Journal" />
      <div style={{ overflow: 'auto', padding: '40px 56px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 720 }}>

          {/* Stepper */}
          <div style={{ marginBottom: 36 }}>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>Nouveau trade · étape {step} / 3</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3].map(n => (
                <div key={n} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: n <= step ? '#15151A' : 'rgba(0,0,0,0.10)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              {['Les chiffres','Le contexte','La review'].map((l, i) => (
                <span key={l} className="mono" style={{
                  fontSize: 11, letterSpacing: '0.06em',
                  color: i+1 === step ? '#15151A' : 'rgba(21,21,26,0.4)',
                  fontWeight: i+1 === step ? 600 : 400,
                }}>{l}</span>
              ))}
            </div>
          </div>

          <h1 className="serif" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8, fontStyle: 'italic' }}>
            Pourquoi as-tu pris ce trade ?
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(21,21,26,0.55)', marginBottom: 32, lineHeight: 1.5 }}>
            Le contexte fait la différence entre un trade A+ et de la chance. Réponds vite, pendant que c'est frais.
          </p>

          {/* Token + numbers preview (carry-over from step 1) */}
          <div style={{ background: '#FFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="serif" style={{ fontSize: 28, fontWeight: 500 }}>WIF</span>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.5)' }}>29.9K → 89.7K · 1.5 SOL</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="serif" style={{ fontSize: 28, fontWeight: 500, color: POS, letterSpacing: '-0.01em', lineHeight: 1 }}>+3.01 SOL</div>
              <div className="mono" style={{ fontSize: 11, color: POS, marginTop: 2 }}>+200%</div>
            </div>
          </div>

          {/* Conviction */}
          <EdField label="Conviction" hint="à quel point y croyais-tu vraiment ?">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { v: 'A', l: 'Forte',   d: 'Setup parfait, clair' },
                { v: 'B', l: 'Moyenne', d: 'Ok mais pas évident' },
                { v: 'C', l: 'Faible',  d: 'Tentative, pas sûr' },
              ].map(o => (
                <button key={o.v} onClick={() => setConv(o.v)} style={{
                  background: conv === o.v ? '#15151A' : '#FFF',
                  border: '1px solid ' + (conv === o.v ? '#15151A' : 'rgba(0,0,0,0.10)'),
                  color: conv === o.v ? '#FAFAF7' : '#15151A',
                  borderRadius: 10, padding: '14px 16px', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="serif" style={{ fontSize: 22, fontStyle: 'italic' }}>{o.v}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{o.l}</span>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{o.d}</div>
                </button>
              ))}
            </div>
          </EdField>

          {/* Narrative + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <EdField label="Narrative">
              <select style={edInput}>
                <option>Animaux</option>
                <option>AI</option>
                <option>Internet meme</option>
                <option>Political</option>
              </select>
            </EdField>
            <EdField label="Type de trade">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Early','Breakout','Momentum','Rotation'].map(o => (
                  <button key={o} onClick={() => setType(o)} style={{
                    background: type === o ? '#15151A' : 'transparent',
                    border: '1px solid ' + (type === o ? '#15151A' : 'rgba(0,0,0,0.15)'),
                    color: type === o ? '#FAFAF7' : '#15151A',
                    padding: '8px 14px', borderRadius: 99, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{o}</button>
                ))}
              </div>
            </EdField>
          </div>

          {/* Marché */}
          <EdField label="Marché global">
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { v: 'Bull',   d: 'Volume + sentiment haut' },
                { v: 'Neutre', d: 'Pas de tendance claire' },
                { v: 'Mort',   d: 'Volume bas, peu de plays' },
              ].map(o => (
                <button key={o.v} style={{
                  flex: 1,
                  background: '#FFF', border: '1px solid rgba(0,0,0,0.10)',
                  borderRadius: 10, padding: '12px 14px', textAlign: 'left',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{o.v}</div>
                  <div style={{ fontSize: 11, color: 'rgba(21,21,26,0.5)', marginTop: 2 }}>{o.d}</div>
                </button>
              ))}
            </div>
          </EdField>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <button style={{
              background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#15151A',
              padding: '10px 20px', borderRadius: 99, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>← Les chiffres</button>
            <button style={{
              background: '#15151A', color: '#FAFAF7', border: 'none',
              padding: '10px 24px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>La review →</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const edInput = {
  width: '100%',
  background: '#FFF',
  border: '1px solid rgba(0,0,0,0.10)',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#15151A',
  outline: 'none',
};

function EdField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#15151A' }}>{label}</span>
        {hint && <span className="serif" style={{ fontSize: 13, color: 'rgba(21,21,26,0.45)', fontStyle: 'italic' }}>· {hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Trade Detail — editorial
// ─────────────────────────────────────────────────────────────────
function EditorialDetail() {
  const t = window.tradeById(1);
  return (
    <div style={edStyles.shell}>
      <EdTopBar active="Journal" />
      <div style={{ overflow: 'auto', padding: '40px 56px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 56, maxWidth: 1100, margin: '0 auto' }}>

          <article>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
              22 avril 2026 · 14:32 · momentum sur animaux
            </div>
            <h1 className="serif" style={{ fontSize: 72, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.95, fontStyle: 'italic', marginBottom: 16 }}>
              WIF
            </h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 32 }}>
              <span className="serif" style={{ fontSize: 44, fontWeight: 500, color: POS, letterSpacing: '-0.02em' }}>+3.01 SOL</span>
              <span className="serif" style={{ fontSize: 24, color: POS, fontStyle: 'italic' }}>+200%</span>
              <span className="mono" style={{ fontSize: 10, padding: '3px 8px', background: '#15151A', color: '#FAFAF7', borderRadius: 3, letterSpacing: '0.08em', fontWeight: 700, alignSelf: 'center' }}>A+</span>
            </div>

            <p className="serif" style={{ fontSize: 22, lineHeight: 1.5, color: '#15151A', fontWeight: 400, marginBottom: 28, maxWidth: 620 }}>
              "Entry parfaite sur le retest, j'ai laissé courir <span style={{ color: ACC }}>#breakout</span> <span style={{ color: ACC }}>#patience</span> <span style={{ color: ACC }}>@WIF</span> — volume × 4 sur la deuxième jambe, j'ai scale-out en 3 fois entre 60K et 89K."
            </p>

            {/* Discipline */}
            <div style={{ marginTop: 40 }}>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.01em', marginBottom: 16 }}>Discipline · 4/4</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                {[
                  ['R1 · Narrative comprise',  'Animal meme classique, dog culture'],
                  ['R2 · ATH potentiel estimé', 'MC cible 100K+, RR 4×'],
                  ['R3 · Capital libéré',       'Scale-out en 3 fois'],
                  ['R4 · SL −20% respecté',     'Pas atteint'],
                ].map(([l, d], i) => (
                  <div key={l} style={{
                    padding: '18px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    paddingRight: i % 2 === 0 ? 28 : 0,
                    paddingLeft: i % 2 === 1 ? 28 : 0,
                    borderRight: i % 2 === 0 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{l}</span>
                      <span style={{ color: POS, fontSize: 14 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(21,21,26,0.55)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Side meta */}
          <aside style={{ paddingTop: 6 }}>
            {[
              ['Type',         'Momentum'],
              ['Narrative',    'Animaux'],
              ['Conviction',   'Forte (A)'],
              ['Marché',       'Bull actif'],
              [null, null],
              ['MC entrée',    '29.9K'],
              ['MC sortie',    '89.7K'],
              ['Multiple',     '×3.0'],
              ['Taille',       '1.5 SOL'],
              ['Frais',        '0.004 SOL'],
              [null, null],
              ['Erreur',       'Aucune'],
              ['Slippage',     'Faible'],
            ].map(([k, v], i) => (
              k === null
                ? <div key={i} style={{ height: 16 }} />
                : (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.5)', letterSpacing: '0.04em' }}>{k}</span>
                    <span style={{ fontSize: 13, color: '#15151A', fontWeight: 500 }}>{v}</span>
                  </div>
                )
            ))}
          </aside>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Week
// ─────────────────────────────────────────────────────────────────
function EditorialWeek() {
  return (
    <div style={edStyles.shell}>
      <EdTopBar active="Semaine" />
      <div style={{ overflow: 'auto', padding: '40px 56px 60px' }}>

        <div style={{ marginBottom: 36 }}>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Semaine 17</div>
          <h1 className="serif" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, fontStyle: 'italic' }}>
            Du <span style={{ fontStyle: 'normal' }}>21</span> au <span style={{ fontStyle: 'normal' }}>27</span> avril.
          </h1>
        </div>

        {/* Days as a horizontal timeline */}
        <div style={{ position: 'relative', paddingLeft: 0, marginBottom: 48 }}>
          {/* spine */}
          <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.10)' }} />

          {window.WEEK_DAYS.map(d => (
            <div key={d.date} style={{ position: 'relative', paddingLeft: 36, marginBottom: 28 }}>
              {/* dot */}
              <div style={{
                position: 'absolute', left: 6, top: 2,
                width: 11, height: 11, borderRadius: '50%',
                background: d.trades.length === 0 ? '#FAFAF7' : (d.pnl > 0 ? POS : NEG),
                border: '1.5px solid ' + (d.trades.length === 0 ? 'rgba(0,0,0,0.20)' : (d.pnl > 0 ? POS : NEG)),
              }} />

              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 140px', gap: 24, alignItems: 'flex-start' }}>
                <div>
                  <div className="serif" style={{ fontSize: 24, fontWeight: 500, fontStyle: 'italic' }}>{d.label}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)', marginTop: 2 }}>{d.date}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.trades.length === 0
                    ? <span style={{ fontSize: 13, color: 'rgba(21,21,26,0.35)', fontStyle: 'italic' }}>Pas de trade.</span>
                    : d.trades.map(id => {
                        const tr = window.tradeById(id);
                        return (
                          <div key={id} style={{ display: 'grid', gridTemplateColumns: '70px 90px 1fr 80px', gap: 12, alignItems: 'baseline', fontSize: 13 }}>
                            <span className="mono" style={{ color: 'rgba(21,21,26,0.45)', fontSize: 11 }}>{tr.heure}</span>
                            <span style={{ fontWeight: 600 }}>{tr.token}{tr.aplus && <span style={{ marginLeft: 5, color: POS, fontSize: 10 }}>★</span>}</span>
                            <span style={{ color: 'rgba(21,21,26,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.note}</span>
                            <span className="mono" style={{ color: edPnl(tr.pnlSol), textAlign: 'right', fontWeight: 600 }}>{window.fmtPnl(tr.pnlSol)}</span>
                          </div>
                        );
                      })
                  }
                </div>
                <div className="serif" style={{ fontSize: 26, fontWeight: 500, color: edPnl(d.pnl), letterSpacing: '-0.01em', textAlign: 'right' }}>
                  {d.trades.length === 0 ? <span style={{ color: 'rgba(21,21,26,0.25)' }}>—</span> : window.fmtPnl(d.pnl)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing reflection */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.10)', paddingTop: 28 }}>
          <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', marginBottom: 16 }}>À retenir</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: POS, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Ce qui marche</div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: '#15151A' }}>
                <strong>Animaux + breakout + conviction A</strong> = 3/3 trades A+. Continuer à filtrer fort sur ces critères. Le scale-out en 3 fois sur WIF a payé.
              </p>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: NEG, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Ce qui doit changer</div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: '#15151A' }}>
                Deux entrées <span style={{ color: ACC }}>#FOMO</span> sur conviction C en marché mort. Règle dure pour S18 : <strong>pas de trade en marché mort sauf conviction A</strong>.
              </p>
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
function EditorialAnalytics() {
  return (
    <div style={edStyles.shell}>
      <EdTopBar active="Analyses" />
      <div style={{ overflow: 'auto', padding: '40px 56px 60px' }}>

        <div style={{ marginBottom: 36 }}>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>30 jours · avril 2026</div>
          <h1 className="serif" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.025em', fontStyle: 'italic' }}>
            Tes patterns, en une page.
          </h1>
        </div>

        {/* Big equity */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic' }}>Capital cumulé</h2>
            <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.5)' }}>+8.90 SOL · drawdown −0.43</span>
          </div>
          <EdEquityBig />
        </div>

        {/* Two columns of analyses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>

          <div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', marginBottom: 18 }}>Par type de trade</h2>
            <EdBarRows rows={[
              { l: 'Momentum', n: 4, pnl: +6.01 },
              { l: 'Breakout', n: 3, pnl: +1.94 },
              { l: 'Early',    n: 2, pnl: +0.55 },
              { l: 'Rotation', n: 3, pnl: +0.40 },
            ]} />

            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', margin: '36px 0 18px' }}>Par narrative</h2>
            <EdBarRows rows={[
              { l: 'Animaux',         n: 5, pnl: +6.66 },
              { l: 'AI',              n: 2, pnl: +2.69 },
              { l: 'Crypto culture',  n: 1, pnl: +1.55 },
              { l: 'Political',       n: 1, pnl: +0.79 },
              { l: 'Internet meme',   n: 3, pnl: -0.57 },
            ]} />
          </div>

          <div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', marginBottom: 18 }}>Tes erreurs</h2>
            <EdBarRows rows={[
              { l: 'FOMO',           n: 2, pnl: -0.40 },
              { l: 'Exit trop tôt',  n: 2, pnl: -0.13 },
              { l: 'Pas de SL',      n: 1, pnl: -0.24 },
              { l: 'Mauvais sizing', n: 1, pnl: -0.21 },
              { l: 'Aucune erreur',  n: 6, pnl: +9.88 },
            ]} />

            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: 'italic', margin: '36px 0 18px' }}>Tes meilleurs tokens</h2>
            <EdBarRows rows={[
              { l: 'WIF',     n: 1, pnl: +3.01 },
              { l: 'GOAT',    n: 1, pnl: +2.30 },
              { l: 'MOODENG', n: 1, pnl: +1.66 },
              { l: 'SPX6900', n: 1, pnl: +1.55 },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EdBarRows({ rows }) {
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.pnl)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map(r => {
        const w = (Math.abs(r.pnl) / maxAbs) * 100;
        return (
          <div key={r.l}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#15151A' }}>{r.l} <span className="mono" style={{ fontSize: 11, color: 'rgba(21,21,26,0.4)', marginLeft: 4 }}>· {r.n}t</span></span>
              <span className="serif" style={{ fontSize: 18, color: edPnl(r.pnl), fontWeight: 500, letterSpacing: '-0.01em' }}>{window.fmtPnl(r.pnl)}</span>
            </div>
            <div style={{ height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1 }}>
              <div style={{ height: '100%', width: `${w}%`, background: r.pnl >= 0 ? POS : NEG, borderRadius: 1, transition: 'width 0.4s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EdEquityBig() {
  const W = 1200, H = 220, P = 12;
  const pts = window.EQUITY;
  const max = Math.max(...pts.map(p => p.y));
  const min = Math.min(0, ...pts.map(p => p.y));
  const x = i => P + (i / (pts.length - 1)) * (W - P*2);
  const y = v => H - P - ((v - min) / (max - min)) * (H - P*2);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 220 }} preserveAspectRatio="none">
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="rgba(0,0,0,0.10)" strokeDasharray="2 4" />
      <path d={path} fill="none" stroke={POS} strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.y)} r="2.5" fill="#FAFAF7" stroke={POS} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

Object.assign(window, { EditorialDashboard, EditorialNew, EditorialDetail, EditorialWeek, EditorialAnalytics });
