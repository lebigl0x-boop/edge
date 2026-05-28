# Handoff — Edge Redesign

## Contexte

Edge est un journal de trading memecoin Solana (Next.js 16 App Router + Tailwind v4 + Neon Postgres). Le code existant fonctionne — la base de données, le calcul de PnL, les routes API, le wallet Solana, tout est en place. Ce handoff concerne **uniquement la refonte UI/UX** du frontend.

## ⚠️ À propos des fichiers de design

Les fichiers `.html` / `.jsx` joints sont des **références de design**, pas du code de production. Ils utilisent React via Babel-standalone (CDN) et des styles inline pour permettre une itération rapide en prototype.

**Le travail consiste à recréer ces designs dans le codebase Next.js existant**, en utilisant :
- Les composants React/Next.js déjà en place
- Tailwind CSS v4 (déjà configuré dans `app/globals.css`)
- Les routes API existantes (`/api/trades`, `/api/stats`, `/api/charts`, `/api/months`, `/api/solana`)
- Les types TypeScript existants (`types/trade.ts`)

Ne pas copier-coller le HTML. Reconstruire proprement en composants React idiomatiques.

## Fidélité

**Hi-fi.** Les couleurs, typographies, espacements et interactions sont finaux. À reproduire au pixel près.

## Direction visuelle retenue

> **À compléter par l'utilisateur** — choisir UNE des trois directions ci-dessous avant de lancer le dev :
>
> - [x ] **V1 — Command Bar** (terminal-trader, dense, ⌘K-first)
> - [ ] **V2 — Editorial Journal** (calme, typographie large)
> - [ ] **V3 — Spatial Workspace** (sidebar permanente, table éditable inline)

Voir `edge-redesign.html` ouvert dans le canvas pour comparer côte à côte.

---

## Design tokens (communs aux 3 directions)

### Couleurs (CSS custom properties)

```css
:root {
  color-scheme: dark;

  /* Surfaces */
  --bg-canvas: #0a0a0b;
  --bg:        #0c0c0e;
  --surface-1: #131316;
  --surface-2: #1a1a1f;
  --surface-3: #232329;

  /* Bordures */
  --border:        rgba(255,255,255,0.06);
  --border-strong: rgba(255,255,255,0.10);

  /* Texte */
  --text:   #ededf0;
  --text-2: rgba(237,237,240,0.62);
  --text-3: rgba(237,237,240,0.38);
  --text-4: rgba(237,237,240,0.20);

  /* Signal (P&L, états) */
  --green:      oklch(0.74 0.16 152);
  --green-soft: oklch(0.74 0.16 152 / 0.14);
  --red:        oklch(0.68 0.21 22);
  --red-soft:   oklch(0.68 0.21 22 / 0.14);
  --amber:      oklch(0.78 0.14 70);
  --amber-soft: oklch(0.78 0.14 70 / 0.14);

  /* Accents interactifs / data */
  --accent: oklch(0.74 0.14 240);   /* bleu froid : tags # */
  --violet: oklch(0.72 0.16 290);   /* mentions @token */
}
```

**Règle d'usage** :
- `--green` / `--red` réservés au **signal** (P&L positif/négatif, win/loss). Jamais pour de la déco.
- `--amber` pour les états intermédiaires (conviction B, marché neutre, warnings).
- `--accent` (bleu) pour interactif et tags `#hashtag`.
- `--violet` pour mentions `@token`.

### Typographie

```
UI       : 'Inter Tight', system-ui, sans-serif
Data     : 'JetBrains Mono', ui-monospace, monospace  (font-feature-settings: "tnum")
Editorial: 'Fraunces' (V2 uniquement, pour les chiffres et titres hero)
```

Tous chargés via Google Fonts. **Tous les chiffres (PnL, MC, %, dates) en mono avec `tnum`** pour l'alignement vertical.

### Échelle de typographie

| Usage              | Taille | Poids | Tracking |
|--------------------|--------|-------|----------|
| Hero PnL           | 38–44px| 700   | -0.02em  |
| H1 page            | 22px   | 700   | -0.01em  |
| Section title      | 14px   | 600   | normal   |
| Body               | 13px   | 400   | normal   |
| Data row           | 12px   | 500   | normal   |
| Mono label (CAPS)  | 9.5px  | 700   | 0.12em   |
| Hint               | 10–11px| 400   | normal   |

### Spacing scale
4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40

### Radius
- Inputs / boutons : `6–8px`
- Cards : `12px`
- Modals / hero : `14px`
- Pills / badges : `99px`

### Shadows
- Modal : `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`
- Toggle thumb : `0 1px 4px rgba(0,0,0,0.4)`
- Hover : pas de shadow, juste `background: rgba(255,255,255,0.025)`

---

## Écrans (5 par direction)

Pour chaque écran, voir l'artboard correspondant dans `edge-redesign.html`. Composition générale :

### 1. Dashboard
- Top bar 44px sticky : brand + ⌘K search + wallet balance + bouton "+ New" (raccourci `N`)
- Hero strip : **PnL héro** (gros chiffre mono) + **equity curve** SVG sur la droite
- Stat row : 6 KPIs en ligne (Win Rate, RR Réel, Discipline, SL Respect, SL Hit, A+ Rate) avec hint "cible > X%"
- 2 colonnes : **table de trades** (gauche) + **side widgets** Top errors / By narrative (droite)

### 2. Saisie / Quick Capture
- Modal centrée 760px largeur (V1) ou wizard 3 étapes (V2) ou inline drawer (V3)
- **Live PnL preview** qui réagit aux 3 inputs (MC entrée, MC sortie, Taille) — calcul `taille × (mcS − mcE) / mcE − fees`
- Pills colorées pour Conviction (A vert / B amber / C rouge), Marché, Erreur
- Discipline : 4 toggles compacts en grille 4×1
- **Note avec parsing #tags et @mentions** (highlight inline pendant la frappe)
- Footer : auto-save indicator, raccourcis clavier visibles (⏎ pour save, esc pour cancel)

### 3. Détail trade
- Hero : token + badge A+ + PnL/Perf en gros mono + viz MC entrée → sortie
- Note rendue avec tags/mentions colorés
- Discipline checklist : 4 cards en grille avec ✓/✗
- Sidebar droite 360px : 3 cards meta (date/type, numbers, exécution)

### 4. Semaine
- Header : titre semaine + bilan (X trades, ±SOL, W/L, A+ rate)
- Grille 7 jours : chaque jour = card avec PnL du jour + liste des trades
- Bilan bas : 6 stats clés + zone "Notes & tags de la semaine" avec compteurs

### 5. Analytics
- Filtre temporel 7D / 30D / 90D / ALL en pills mono
- Equity curve grand format avec annotations (peak, drawdown)
- Grid 2×2 : Performance par type, Performance par narrative, Distribution erreurs, Top tokens
- Chaque card : `BarRows` horizontales avec largeur proportionnelle au max absolu, vertes/rouges selon signe

---

## Composants à créer dans le codebase

À placer dans `edge/components/ui/` (nouveau dossier) :

```
components/ui/
├── PnlNumber.tsx        # mono, signé, coloré selon signe
├── StatCard.tsx         # label CAPS + valeur mono + hint
├── Pill.tsx             # variants: green/red/amber/accent/neutral
├── Toggle.tsx           # iOS-style, déjà existant — à restyler
├── EquityCurve.tsx      # SVG curve, props: points, height
├── BarRows.tsx          # liste horizontale de barres signées
├── TagInput.tsx         # parser #tags @mentions live
├── KpiRow.tsx           # ligne de 6 KPIs séparés par border
├── TopBar.tsx           # 44px, brand + ⌘K + wallet + new
├── CmdMenu.tsx          # ⌘K palette (recherche trades + commands)
└── tokens.ts            # export des design tokens en TS
```

Les pages existantes (`app/page.tsx`, `app/nouveau/page.tsx`, `app/trade/[id]/page.tsx`) sont à réécrire en consommant ces composants.

---

## Interactions & comportements

### Quick capture (saisie)
- **PnL live** : recalcul à chaque keystroke sur mcE, mcS, taille. Transition `0.2s` sur la couleur du conteneur (vert/rouge/neutre).
- **Tab order** : token → mcE → mcS → taille → conviction → type → marché → discipline → erreur → note.
- **⏎ pour save**, **esc pour cancel**.
- **Auto-save indicator** : "saved · 2s ago" en bas, mise à jour debounced 2s après dernière modif.
- **Raccourci global `N`** ouvre la modal depuis n'importe où.

### Tags & mentions dans les notes
- Pendant la frappe, dès qu'on tape `#` ou `@`, afficher dropdown autocomplete :
  - `#` → tags récents (`#breakout`, `#fomo`, `#discipline`, `#patience`, `#regret`)
  - `@` → tokens de la base (récents en premier)
- Au rendu, `#xxx` colorés en `--accent`, `@xxx` en `--violet`, fond pill `radius: 4px`.
- Stocké en string brute en DB ; parsing au rendu côté client.

### ⌘K command palette (V1 surtout)
- `⌘K` ou `/` ouvre la palette
- Sections : Trades récents · Tokens · Commands (`/new`, `/week`, `/analytics`, `/export`)
- ↑↓ pour naviguer, ⏎ pour valider, esc pour fermer

### Micro-interactions (priorité utilisateur)
- Hover de row table : `background: rgba(255,255,255,0.025)` + chevron `›` qui apparaît à droite (`opacity 0 → 1`, transition 0.15s)
- Pill click : transition `0.15s` sur background + border + color
- Toggle iOS : transition `0.2s` sur background, `0.2s` sur position du thumb
- Bar rows : `width` animée en `0.4s` au mount
- Equity curve : path `stroke-dasharray` animation au mount (optionnel)

### Filtres
- Period : segmented control (Tout / Cette semaine / Ce mois / par mois / plage custom) — déjà fonctionnel, restyler
- Trade filter : All / Wins / Losses / A+ en pills

---

## State management

Le state actuel (`useState` + `fetch` direct) est OK pour l'app. Pas besoin de Redux/Zustand.

Suggestions :
- Extraire les fetches dans `lib/api.ts` (un fichier de helpers typés)
- Ajouter SWR ou TanStack Query si on veut du cache + revalidation
- Garder le `localStorage` pour fees + wallet address

---

## Routes API (existantes, à ne pas toucher)

```
GET    /api/trades          ?filter=week|month|YYYY-MM|custom:from:to
POST   /api/trades
GET    /api/trades/[id]
PATCH  /api/trades/[id]
DELETE /api/trades/[id]
GET    /api/stats           ?filter=...
GET    /api/charts          ?filter=...
GET    /api/months
GET    /api/solana          (proxy RPC pour wallet balance)
```

---

## Fichiers de référence dans ce package

```
edge-redesign.html        # Entrée — canvas avec les 3 directions
design-canvas.jsx         # Composant canvas (pan/zoom, focus mode)
edge-data.jsx             # Mock data partagée
edge-v1-command.jsx       # Direction 1 — 5 écrans
edge-v2-editorial.jsx     # Direction 2 — 5 écrans
edge-v3-spatial.jsx       # Direction 3 — 5 écrans
README.md                 # Ce fichier
```

Pour ouvrir le prototype : ouvrir `edge-redesign.html` dans un navigateur (les CDN se chargent automatiquement).

---

## Plan d'implémentation suggéré

1. **Tokens & globals.css** — remplacer les variables CSS dans `app/globals.css` par celles ci-dessus, charger les Google Fonts dans `app/layout.tsx`.
2. **Composants UI partagés** — créer `components/ui/*` (voir liste plus haut).
3. **Refonte page par page** :
   - `app/page.tsx` (Dashboard) en premier
   - `app/nouveau/page.tsx` (Saisie) — gros morceau, attention au PnL live + tags
   - `app/trade/[id]/page.tsx` (Détail)
   - `components/WeekView.tsx` (Semaine)
   - `components/AnalyticsTab.tsx` (Analytics) — utiliser Recharts déjà installé, restyler avec les tokens
4. **⌘K palette** — fichier dédié, `cmdk` package recommandé
5. **Migration parsing tags/mentions** — script de parsing au rendu, stockage brut en DB

---

## Notes finales

- Les `console.log` du prototype sont à retirer.
- Les `style={{ ... }}` inline du prototype sont OK pour l'itération mais à migrer vers Tailwind classes ou CSS modules en prod.
- Pas de framer-motion nécessaire — les transitions CSS suffisent pour les micro-interactions demandées.
- Tester en priorité sur Chrome/Safari desktop. Pas de mobile pour l'instant (confirmé par l'utilisateur).
