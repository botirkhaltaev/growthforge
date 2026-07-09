# Growth Forge

GTM factory for the Cursor iOS London Hackathon.

**Thesis:** Apply a GTM person's real workflow (`scope → distribute → reach out`) to growth creative — with the generated ad as the interface during distribution, and a multi-touch cadence as the reach-out plan.

## Workflow

1. **Scope** — brief in; agents propose ICP, buying signals, channel mix, and matched-audience count. Confirm with one tap.
2. **Distribute** — work is assigned across Copywriter, Designer, Media Buyer, and Analyst. They produce and test variants until one clears the ≥3% CTR gate.
3. **Reach out** — the winner fans into a cadence (Meta ads · Day 0 email · Day 2 LinkedIn · Day 5 bump). Approve → live, with replies routing back to the factory.

## Stack

- Next.js App Router + TypeScript + Tailwind + Framer Motion
- `@cursor/sdk` — parallel Cursor agents (Copywriter, Designer, Media Buyer, Analyst)
- Generative UI — ambient agent glows, swipe-to-morph variants, hold-for-distribution-gate

## Modes

| Mode | When | Behavior |
|------|------|----------|
| `DEMO_MODE=true` (default) | Vercel / live demo | Theatrical SSE with scope pause + variants A/B/C + reach-out cadence |
| `DEMO_MODE=false` | Local `next dev` with Cursor | Real `@cursor/sdk` parallel agents (scope still theatrical) |

## Setup

```bash
npm install
cp .env.example .env.local
# Add CURSOR_API_KEY for real SDK path
npm run dev
```

## Routes

| Path | What |
|------|------|
| `/` | Marketing landing — GTM thesis, work distribution, A/B/C showcase |
| `/forge` | Interactive GTM factory — brief → scope → distribute → reach out |

## Demo flow

1. From `/` → **Run GTM Factory** (or open `/forge`)
2. Pick an example chip → **Scope it**
3. Confirm ICP / signals / channels → **Distribute the work**
4. Watch stations: **Scope → Distribute → Reach out**
5. Swipe / ← → between variants A (1.2% FAIL) → B (2.8% CLOSE) → C (4.1% PASS)
6. Hold or press **T** for distribution gate · **Approve → plan reach-out**
7. Review cadence → **Send it** · replies feed back
8. **Scope another motion** to start again

### Keyboard

| Key | Action |
|-----|--------|
| ← / → | Compare variants |
| T | Distribution gate / oversight |
| Esc | Close gate · or new brief |

## Env

```
DEMO_MODE=true
CURSOR_API_KEY=cursor_...
```
