# Edge — Journal de Trading Memecoin

## Objectif

Edge est un outil de suivi personnel conçu pour les traders de memecoins sur Solana.

L'objectif est simple : **devenir un meilleur trader en gardant une trace honnête de chaque trade**, pas seulement du PnL. Le memecoin est un jeu rapide (3-10 trades par jour), où les erreurs comportementales — FOMO, overtrade, mauvais sizing, absence de règles — coûtent plus que les mauvaises analyses. Edge force à documenter les décisions *après* chaque trade pendant que le souvenir est frais, et permet de repérer les patterns sur la durée.

**Ce que l'app permet de répondre :**
- Est-ce que je suis mes règles de discipline ?
- Sur quelles narratives est-ce que je performe le mieux ?
- Quelles erreurs est-ce que je répète ?
- Mon win rate s'améliore-t-il dans le temps ?
- Quel est mon PnL réel net de frais ?

---

## Informations collectées par trade

### Le Trade — les chiffres bruts

| Champ | Description |
|-------|-------------|
| **Token** | Symbole du coin (ex: WIF, BONK) |
| **Type** | Early / Breakout / Momentum / Rotation |
| **Date & Heure** | Horodatage de l'entrée |
| **MC Entrée** | Market cap au moment de l'achat (en k$) |
| **MC Sortie** | Market cap au moment de la vente (en k$) |
| **Taille** | Montant investi en SOL |
| **PnL SOL** | Profit/perte net en SOL (auto-calculé depuis MC + taille + frais) |
| **PnL %** | Performance en % (auto-calculé depuis MC entrée/sortie) |

### L'Edge — pourquoi ce trade

| Champ | Description |
|-------|-------------|
| **Narrative** | Catégorie du meme (Animaux, AI, Political, Tweet Play...) |
| **Conviction** | Forte / Moyenne / Faible — à quel point tu croyais au setup |
| **Marché** | État du marché global au moment du trade (Bull / Neutre / Mort) |

### Discipline — les 4 règles

| Règle | Question posée |
|-------|----------------|
| **R1 — Narrative** | Est-ce que je comprends le meme ? Pourquoi les gens le partageraient ? |
| **R2 — ATH potentiel** | Est-ce que j'ai estimé le market cap cible et le risk/reward avant d'entrer ? |
| **R3 — Capital mobile** | Est-ce que j'ai libéré le capital si le coin est devenu lent ? |
| **R4 — Stop loss** | Est-ce que j'ai limité ma perte à -20% maximum ? |
| **SL touché** | Est-ce que le stop loss a été déclenché ? |
| **Coupé au bon moment** | Est-ce que la sortie était au bon moment ? |
| **Coin lent / stagné** | Est-ce que le coin a stagné sans pump ? |

### Review — l'autocritique

| Champ | Description |
|-------|-------------|
| **Erreur** | Aucune / FOMO / Overtrade / Mauvais sizing / Pas de SL / Exit trop tôt / Autre |
| **Trade A+** | Ce trade était-il parfaitement exécuté selon les règles ? |
| **Note rapide** | Contexte libre, ce à retenir pour la prochaine fois |

---

## Calcul automatique du PnL

```
PnL brut (SOL) = taille × (MC Sortie − MC Entrée) / MC Entrée
PnL net  (SOL) = PnL brut − (priority fee + tip) × 2
PnL %          = (MC Sortie − MC Entrée) / MC Entrée × 100
```

Les frais (priority fee + tip Jito) sont configurables via le menu ⚙ dans le header — sauvegardés en localStorage, partagés sur tout le site. Défaut : 0.001 + 0.001 SOL par transaction.

Les MC se saisissent en **k$** (ex: `29.9` = $29 900). Stockées en $ complets dans la base de données.

---

## Analytics

- **Equity curve** — PnL cumulé dans le temps
- **Win rate par mois** — évolution de la performance mensuelle
- **Performance par type de trade** — Early vs Breakout vs Momentum vs Rotation
- **Distribution des erreurs** — quelles erreurs reviennent le plus
- **Top tokens** — les coins les plus/moins rentables

---

## Wallet Solana

Adresse publique (read-only) saisie dans le header, stockée en localStorage. Balance rafraîchie toutes les 30 secondes via un proxy serveur (évite les restrictions CORS du RPC Solana).

---

## Stack technique

- **Next.js 16** App Router + Turbopack
- **TypeScript**
- **Neon Postgres** — base de données serverless HTTP, zéro module natif, compatible Vercel edge
- **Recharts** — graphiques analytics côté client
- **Tailwind CSS v4** + design system iOS dark custom

---

## Installation locale

```bash
git clone <repo> && cd edge
npm install
```

Créer `.env.local` :
```env
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require&channel_binding=require
```

Lancer :
```bash
npm run dev
```

Puis initialiser le schéma une seule fois : `http://localhost:3000/api/init`

---

## Déploiement Vercel

1. Push sur GitHub
2. Importer sur [vercel.com](https://vercel.com)
3. Ajouter `DATABASE_URL` dans les variables d'environnement Vercel
4. Deploy (auto-détecté, aucun `vercel.json` nécessaire)
5. Visiter `/api/init` une fois pour créer la table

---

## Structure

```
edge/
├── app/
│   ├── api/
│   │   ├── trades/[id]/     # GET · PATCH · DELETE
│   │   ├── trades/          # GET (liste) · POST (créer)
│   │   ├── stats/           # Stats agrégées avec filtre période
│   │   ├── charts/          # Données Recharts
│   │   ├── months/          # Mois disponibles pour le filtre
│   │   ├── solana/          # Proxy RPC Solana
│   │   └── init/            # Init schéma Postgres (une fois)
│   ├── nouveau/             # Formulaire création
│   ├── trade/[id]/          # Détail du trade
│   │   └── edit/            # Formulaire modification
│   ├── layout.tsx           # Header sticky (wallet · frais)
│   ├── page.tsx             # Dashboard
│   └── globals.css          # Design system
├── components/
│   ├── AnalyticsTab.tsx     # Graphiques
│   ├── SolanaBalance.tsx    # Balance wallet
│   └── FeesMenu.tsx         # Config frais
└── lib/
    └── db.ts                # Couche base de données (Neon)
```
