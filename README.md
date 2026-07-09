# Growth Forge

Multi-agent marketing studio for the Cursor iOS London Hackathon.

**Thesis:** Apply the software-engineering feedback loop (`write → test → fail → fix → pass`) to growth marketing (`create ad → A/B test → CTR score → revise → pass`) — with the generated creative as the only interface.

## Stack

- Next.js App Router + TypeScript + Tailwind + Framer Motion
- `@cursor/sdk` — parallel Cursor agents (Copywriter, Designer, Media Buyer, Analyst)
- Generative UI — ambient agent glows, swipe-to-morph variants, hold-for-trust

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

## Demo flow

1. Pick an example chip (or edit the brief) → **Forge Campaign**
2. Watch the factory loop: **Create → Test → Fail → Fix → Pass**
3. Ambient agent activity on the creative (amber glow, shimmer, platform pulse)
4. Swipe / ← → between variants A (1.2% FAIL) → B (2.8% CLOSE) → C (4.1% PASS)
5. Hold or press **T** for trust overlay · **Approve & Deploy**
6. **Forge another campaign** to loop again

### Keyboard

| Key | Action |
|-----|--------|
| ← / → | Compare variants |
| T | Trust / oversight |
| Esc | Close trust · or new brief |

## Env

```
DEMO_MODE=true
CURSOR_API_KEY=cursor_...
```
