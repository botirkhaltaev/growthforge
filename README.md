# Growth Forge

GTM factory for the Cursor iOS London Hackathon.

**Thesis:** Apply a go-to-market stage-gate (`create → test → iterate → launch`) to growth creative — with the generated ad as the only interface.

## Stack

- Next.js App Router + TypeScript + Tailwind + Framer Motion
- `@cursor/sdk` — parallel Cursor agents (Copywriter, Designer, Media Buyer, Analyst)
- Generative UI — ambient agent glows, swipe-to-morph variants, hold-for-launch-gate

## Modes

| Mode | When | Behavior |
|------|------|----------|
| `DEMO_MODE=true` (default) | Vercel / live demo | Theatrical SSE with pre-generated variants A/B/C |
| `DEMO_MODE=false` | Local `next dev` with Cursor | Real `@cursor/sdk` parallel agents |

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
| `/` | Marketing landing — GTM thesis, factory stations, A/B/C showcase |
| `/forge` | Interactive GTM factory — brief → create/test/iterate → launch |

## Demo flow

1. From `/` → **Run GTM Factory** (or open `/forge`)
2. Pick an example chip (or edit the brief) → **Run GTM Factory**
3. Watch stations: **Create → Test → Iterate → Launch**
4. Ambient agent activity on the creative (amber glow, shimmer, platform pulse)
5. Swipe / ← → between variants A (1.2% FAIL) → B (2.8% CLOSE) → C (4.1% PASS)
6. Hold or press **T** for launch gate · **Approve & Launch**
7. **Run another GTM loop** to start again

### Keyboard

| Key | Action |
|-----|--------|
| ← / → | Compare variants |
| T | Launch gate / oversight |
| Esc | Close gate · or new brief |

## Env

```
DEMO_MODE=true
CURSOR_API_KEY=cursor_...
```
