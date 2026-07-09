# Growth Forge

GTM factory for the Cursor iOS London Hackathon.

**Thesis:** Apply a go-to-market stage-gate (`create → test → iterate → launch`) to growth creative — with the generated ad as the only interface.

## Stack

- Next.js App Router + TypeScript + Tailwind + Framer Motion
- `@cursor/sdk` — parallel Cursor agents (Copywriter, Designer, Media Buyer, Analyst)
- `@fal-ai/client` — Producer agent renders vertical video ads via `google/gemini-omni-flash`
- Generative UI — ambient agent glows, swipe-to-morph variants, hold-for-launch-gate, video unmute

## Modes

| Mode | When | Behavior |
|------|------|----------|
| `DEMO_MODE=true` (default) | Vercel / live demo | Theatrical SSE with pre-generated variants A/B/C |
| `DEMO_MODE=false` | Local `next dev` with Cursor | Real `@cursor/sdk` parallel agents |

Video production runs whenever a variant passes the CTR gate and `FAL_KEY` is set — in both demo and live modes.

## Setup

```bash
npm install
cp .env.example .env.local
# Add CURSOR_API_KEY for real SDK path
# Add FAL_KEY for Producer video generation
npm run dev
```

## Routes

| Path | What |
|------|------|
| `/` | Marketing landing — GTM thesis, factory stations, A/B/C showcase |
| `/forge` | Interactive GTM factory — brief → create/test/iterate → launch |
| `POST /api/campaign` | SSE campaign stream (demo or `@cursor/sdk`) |
| `POST /api/video` | Submit Producer job to fal.ai |
| `GET /api/video?requestId=` | Poll Producer job status / video URL |

## Factory stations

| Agent | Role |
|-------|------|
| Copywriter | Messaging & hooks |
| Designer | Creative direction |
| Media Buyer | Channel targeting |
| Analyst | CTR & ROAS gates |
| Producer | Vertical video ad (`gemini-omni-flash` on fal.ai) |

## Demo flow

1. From `/` → **Run GTM Factory** (or open `/forge`)
2. Pick an example chip (or edit the brief) → **Run GTM Factory**
3. Watch stations: **Create → Test → Iterate → Launch**
4. Ambient agent activity on the creative (amber glow, shimmer, platform pulse)
5. Swipe / ← → between variants A (1.2% FAIL) → B (2.8% CLOSE) → C (4.1% PASS)
6. On PASS, Producer queues a 9:16 video from the brief + winning copy; creative upgrades from gradient to video (tap to unmute)
7. Hold or press **T** for launch gate · **Approve & Launch**
8. **Run another GTM loop** to start again

Without `FAL_KEY`, the forge still completes and keeps the static creative (Producer surfaces a clear error).

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
FAL_KEY=fal_...
```
