import type {
  AdVariant,
  CampaignEvent,
  GtmScope,
  ReachoutTouch,
} from "./types";

export const BENCHMARK_CTR = 3.0;

export const DEMO_VARIANTS: AdVariant[] = [
  {
    id: "a",
    label: "A",
    headline: "Eco-friendly water bottles for a greener planet",
    body: "Made from recycled ocean plastic. Join 12,000 people cutting single-use waste.",
    cta: "Shop Now",
    brand: "Sustainable Bottle Co.",
    price: "$35",
    gradient: "linear-gradient(155deg, #1a6b5c 0%, #0f3d36 45%, #0a1f1c 100%)",
    visualEmoji: "01",
    visualCaption: "vA · studio product",
    ctr: 1.2,
    cvr: 0.8,
    roas: 1.1,
    revenueForecast: 50_000,
    verdict: "fail",
    iterationNote: "Generic eco claim. Low emotional hook.",
  },
  {
    id: "b",
    label: "B",
    headline: "This bottle saved 340 plastic units from the ocean",
    body: "Every purchase funds coastal cleanups. Trace your impact in the app.",
    cta: "See Your Impact",
    brand: "Sustainable Bottle Co.",
    price: "$35",
    gradient: "linear-gradient(155deg, #1a5a8a 0%, #0e3a5c 45%, #081828 100%)",
    visualEmoji: "02",
    visualCaption: "vB · impact metric",
    ctr: 2.8,
    cvr: 1.6,
    roas: 2.4,
    revenueForecast: 110_000,
    verdict: "close",
    iterationNote:
      "Copywriter revised headline (+134% CTR). Still below 3% benchmark.",
  },
  {
    id: "c",
    label: "C",
    headline: "Your morning coffee just got 10x greener",
    body: "The bottle that fits your commute — and your values. Recycled ocean plastic.",
    cta: "Shop the Drop",
    brand: "Sustainable Bottle Co.",
    price: "$35",
    gradient: "linear-gradient(155deg, #3d2810 0%, #6b4423 40%, #120e0a 100%)",
    visualEmoji: "03",
    visualCaption: "vC · lifestyle commute",
    ctr: 4.1,
    cvr: 2.9,
    roas: 4.2,
    revenueForecast: 170_000,
    verdict: "pass",
    iterationNote:
      "Copywriter changed headline. Designer swapped to lifestyle image. Total +241% CTR.",
  },
];

export const DEMO_SCOPE: GtmScope = {
  icp: "Eco-conscious millennials 25–35 · urban · $50k+ HHI · sustainability interest",
  signals: [
    "Visited competitor PDP in last 14d",
    "Engaged with climate content",
    "Added reusable bottle to cart (abandoned)",
    "Follows outdoor / wellness brands",
  ],
  audienceCount: 1240,
  channels: [
    { name: "Meta ads", budgetShare: 55 },
    { name: "Email", budgetShare: 25 },
    { name: "LinkedIn DM", budgetShare: 20 },
  ],
  positioning: "Lifestyle commute hook over generic eco claim",
};

/** AI notes demo set — matches BriefScreen "AI notes" example */
export const DEMO_VARIANTS_AI: AdVariant[] = [
  {
    id: "a",
    label: "A",
    headline: "AI meeting notes for busy teams",
    body: "Auto-summarize every Zoom. Share action items before the next standup.",
    cta: "Start Free",
    brand: "NoteForge",
    price: "$12/mo",
    gradient: "linear-gradient(155deg, #1a3a6b 0%, #0f2440 45%, #0a1420 100%)",
    visualEmoji: "01",
    visualCaption: "vA · generic SaaS",
    ctr: 1.1,
    cvr: 0.7,
    roas: 1.0,
    revenueForecast: 42_000,
    verdict: "fail",
    iterationNote: "Generic SaaS claim. No founder pain.",
  },
  {
    id: "b",
    label: "B",
    headline: "Get 4 hours back from every week of meetings",
    body: "Notes, decisions, and owners — drafted before you leave the call.",
    cta: "Reclaim Your Week",
    brand: "NoteForge",
    price: "$12/mo",
    gradient: "linear-gradient(155deg, #2a1a6b 0%, #1a0f40 45%, #0e0a20 100%)",
    visualEmoji: "02",
    visualCaption: "vB · time-back metric",
    ctr: 2.7,
    cvr: 1.5,
    roas: 2.3,
    revenueForecast: 98_000,
    verdict: "close",
    iterationNote:
      "Copywriter led with time-back (+145% CTR). Still below 3% benchmark.",
  },
  {
    id: "c",
    label: "C",
    headline: "Your cofounder stopped asking 'what did we decide?'",
    body: "Meeting notes that ship with owners. Built for Series A chaos.",
    cta: "Try NoteForge",
    brand: "NoteForge",
    price: "$12/mo",
    gradient: "linear-gradient(155deg, #3d2810 0%, #6b4423 40%, #120e0a 100%)",
    visualEmoji: "03",
    visualCaption: "vC · founder lifestyle",
    ctr: 4.3,
    cvr: 3.1,
    roas: 4.5,
    revenueForecast: 185_000,
    verdict: "pass",
    iterationNote:
      "Copywriter used founder voice. Designer swapped to warm amber. Total +291% CTR.",
  },
];

/** Run club demo set — matches BriefScreen "Run club" example */
export const DEMO_VARIANTS_RUN: AdVariant[] = [
  {
    id: "a",
    label: "A",
    headline: "Carbon-plate running shoes for athletes",
    body: "Engineered for race day. Lightweight. Responsive. Built to PR.",
    cta: "Shop Now",
    brand: "Stride Lab",
    price: "$180",
    gradient: "linear-gradient(155deg, #1a4a3c 0%, #0f2d26 45%, #0a1814 100%)",
    visualEmoji: "01",
    visualCaption: "vA · product studio",
    ctr: 1.3,
    cvr: 0.9,
    roas: 1.2,
    revenueForecast: 55_000,
    verdict: "fail",
    iterationNote: "Spec-sheet energy. No race-day emotion.",
  },
  {
    id: "b",
    label: "B",
    headline: "Shave 47 seconds off your half — without the hype tax",
    body: "Carbon plate. Soft landings. Race-day edge for urban marathoners.",
    cta: "See the Plate",
    brand: "Stride Lab",
    price: "$180",
    gradient: "linear-gradient(155deg, #1a3a6b 0%, #0e2448 45%, #081428 100%)",
    visualEmoji: "02",
    visualCaption: "vB · race metric",
    ctr: 2.9,
    cvr: 1.7,
    roas: 2.5,
    revenueForecast: 120_000,
    verdict: "close",
    iterationNote:
      "Copywriter led with race delta (+123% CTR). Still under 3% bar.",
  },
  {
    id: "c",
    label: "C",
    headline: "Your 6am loop just got unfair",
    body: "The plate that turns Tuesday miles into race-day confidence.",
    cta: "Lace Up",
    brand: "Stride Lab",
    price: "$180",
    gradient: "linear-gradient(155deg, #3d2810 0%, #6b4423 40%, #120e0a 100%)",
    visualEmoji: "03",
    visualCaption: "vC · dawn run",
    ctr: 4.0,
    cvr: 2.8,
    roas: 4.1,
    revenueForecast: 165_000,
    verdict: "pass",
    iterationNote:
      "Copywriter went lifestyle. Designer used dawn amber. Total +208% CTR.",
  },
];

export type DemoBriefKind = "eco" | "ai" | "run";

export function detectBriefKind(brief: string): DemoBriefKind {
  const lower = brief.toLowerCase();
  if (
    /\bai\b/.test(lower) ||
    lower.includes("notes") ||
    lower.includes("meeting")
  ) {
    return "ai";
  }
  if (
    lower.includes("run") ||
    lower.includes("shoe") ||
    lower.includes("marathon")
  ) {
    return "run";
  }
  return "eco";
}

export function variantsForBrief(brief: string): AdVariant[] {
  const kind = detectBriefKind(brief);
  if (kind === "ai") return DEMO_VARIANTS_AI;
  if (kind === "run") return DEMO_VARIANTS_RUN;
  return DEMO_VARIANTS;
}

export function buildReachoutCadence(winner: AdVariant): ReachoutTouch[] {
  const hook = winner.headline;
  return [
    {
      day: 0,
      channel: "meta_ads",
      title: "Meta ad set · live",
      snippet: `${hook} — ${winner.cta}`,
      status: "live",
    },
    {
      day: 0,
      channel: "email",
      title: "Day 0 · cold email",
      snippet: `Subject: ${hook}\n\n${winner.body}\n\n→ ${winner.cta}`,
      status: "queued",
    },
    {
      day: 2,
      channel: "linkedin_dm",
      title: "Day 2 · LinkedIn connect + note",
      snippet: `Saw you're into sustainable swaps — ${hook.toLowerCase()}. Worth a look?`,
      status: "queued",
    },
    {
      day: 5,
      channel: "email",
      title: "Day 5 · bump",
      snippet: `Quick bump — still thinking about cutting single-use? ${winner.cta}.`,
      status: "queued",
    },
  ];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scopeFromBrief(brief: string): GtmScope {
  const lower = brief.toLowerCase();
  if (
    /\bai\b/.test(lower) ||
    lower.includes("notes") ||
    lower.includes("meeting")
  ) {
    return {
      icp: "Remote startup founders · 10–80 employees · Series A–B · US/UK",
      signals: [
        "Posted about meeting overload",
        "Hired first ops / EA role",
        "Uses Notion + Zoom stack",
        "Raised funding in last 90d",
      ],
      audienceCount: 860,
      channels: [
        { name: "LinkedIn DM", budgetShare: 40 },
        { name: "Email", budgetShare: 35 },
        { name: "Meta ads", budgetShare: 25 },
      ],
      positioning: "Time-back for founders drowning in meetings",
    };
  }
  if (
    lower.includes("run") ||
    lower.includes("shoe") ||
    lower.includes("marathon")
  ) {
    return {
      icp: "Urban marathoners 28–40 · 3+ races/year · premium gear buyers",
      signals: [
        "Registered for a race in next 90d",
        "Engaged with carbon-plate content",
        "Follows run clubs / Strava elites",
        "Abandoned cart on performance shoes",
      ],
      audienceCount: 980,
      channels: [
        { name: "Meta ads", budgetShare: 50 },
        { name: "Email", budgetShare: 30 },
        { name: "LinkedIn DM", budgetShare: 20 },
      ],
      positioning: "Race-day edge without the hype tax",
    };
  }
  return { ...DEMO_SCOPE };
}

/** Stage 1 — Scope the motion (ICP, signals, channels) */
export async function* demoScopeStream(
  brief: string
): AsyncGenerator<CampaignEvent> {
  const product = brief.trim() || "Sustainable water bottle, $35, millennials";

  yield {
    type: "system",
    message: `Scoping GTM motion · ${product.slice(0, 64)}…`,
  };
  await sleep(220);

  yield {
    type: "agent_created",
    role: "foreman",
    message: "Foreman online · scope → distribute → reach out",
  };
  await sleep(180);

  yield {
    type: "system",
    message: "Mapping ICP, buying signals, and channel mix…",
  };
  await sleep(280);

  yield {
    type: "subagent_output",
    role: "analyst",
    content: "Scoring beachhead segment against win-rate history…",
  };
  await sleep(300);

  yield {
    type: "subagent_output",
    role: "media_buyer",
    content: "Selecting 1–2 primary channels where ICP already spends time…",
  };
  await sleep(280);

  const scope = scopeFromBrief(product);
  yield {
    type: "scope_ready",
    scope,
    message: `Scope ready · ${scope.audienceCount.toLocaleString()} accounts match`,
  };
}

function distributeCopyForKind(kind: DemoBriefKind) {
  if (kind === "ai") {
    return {
      angles: "generic SaaS · time-back metric · founder voice…",
      visuals: "dashboard UI · calendar chaos · warm founder desk…",
      enrichment: "Enriching founders · LinkedIn + email · Series A–B",
      reviseB: 'Revised: "Get 4 hours back from every week of meetings"',
      designC: "Swapped dashboard → warm founder desk. Amber accents.",
      finalC: 'Final: "Your cofounder stopped asking \'what did we decide?\'"',
    };
  }
  if (kind === "run") {
    return {
      angles: "spec-sheet · race delta · dawn-loop lifestyle…",
      visuals: "studio shoe · race clock · 6am urban loop…",
      enrichment: "Enriching marathoners · Meta + Strava interests",
      reviseB: 'Revised: "Shave 47 seconds off your half — without the hype tax"',
      designC: "Swapped studio → dawn amber run. Warm lifestyle plate.",
      finalC: 'Final: "Your 6am loop just got unfair"',
    };
  }
  return {
    angles: "eco-generic · impact-metric · lifestyle…",
    visuals: "studio product · ocean texture · lifestyle commute…",
    enrichment: "Enriching matched accounts · IG + FB · interest: sustainability",
    reviseB: 'Revised: "This bottle saved 340 plastic units from the ocean"',
    designC: "Swapped studio shot → lifestyle hiking image. Warm amber palette.",
    finalC: 'Final: "Your morning coffee just got 10x greener"',
  };
}

/** Stage 2 — Distribute work across agents, test variants, plan reach-out */
export async function* demoDistributeStream(
  brief: string,
  scope?: GtmScope
): AsyncGenerator<CampaignEvent> {
  void scope;
  const product = brief.trim() || "Sustainable water bottle, $35, millennials";
  const kind = detectBriefKind(product);
  const variants = variantsForBrief(product);
  const copy = distributeCopyForKind(kind);

  yield {
    type: "system",
    message: `Distributing work · ${product.slice(0, 48)}…`,
  };
  await sleep(200);

  yield {
    type: "system",
    message: "Spawning 5 GTM stations on parallel runtimes…",
  };
  await sleep(140);

  const agents = [
    { role: "copywriter" as const, model: "composer-2.5", task: "Copy & hooks" },
    { role: "designer" as const, model: "auto", task: "Creative direction" },
    {
      role: "media_buyer" as const,
      model: "auto",
      task: "Audience & enrichment",
    },
    { role: "analyst" as const, model: "composer-2.5", task: "Gate & forecast" },
    {
      role: "producer" as const,
      model: "fal · gemini-omni-flash",
      task: "Video ad render",
    },
  ];

  for (const a of agents) {
    yield {
      type: "vm_spawned",
      role: a.role,
      model: a.model,
      message: `Spawning ${a.role} (${a.model})…`,
    };
    await sleep(100);
  }

  for (const a of agents) {
    yield {
      type: "task_assigned",
      role: a.role,
      task: a.task,
      message: `${a.task} → ${a.role.replace("_", " ")}`,
    };
    yield { type: "agent_active", role: a.role };
    await sleep(180);
    yield { type: "agent_idle", role: a.role };
  }

  for (const a of agents) {
    yield { type: "agent_active", role: a.role };
  }
  // Producer stays ambient until a pass variant kicks real FAL render
  yield { type: "agent_idle", role: "producer" };
  await sleep(280);

  yield {
    type: "subagent_output",
    role: "copywriter",
    content: `Drafting 3 headline angles: ${copy.angles}`,
  };
  await sleep(320);

  yield {
    type: "subagent_output",
    role: "designer",
    content: `Composing visual concepts: ${copy.visuals}`,
  };
  await sleep(280);

  yield {
    type: "subagent_output",
    role: "media_buyer",
    content: copy.enrichment,
  };
  await sleep(240);

  yield {
    type: "subagent_output",
    role: "analyst",
    content: `Gate set: ≥${BENCHMARK_CTR}% CTR · kill underperforming segments`,
  };
  await sleep(280);

  for (const a of agents) {
    yield { type: "agent_idle", role: a.role };
  }

  // Variant A — fail
  yield {
    type: "tester",
    role: "tester",
    message: "Gate · scoring Variant A…",
  };
  await sleep(400);
  yield {
    type: "variant_ready",
    variant: variants[0],
    message: `Fail · Variant A ${variants[0].ctr}% CTR (need ≥${BENCHMARK_CTR}%)`,
  };
  await sleep(220);

  yield {
    type: "iteration",
    iteration: 1,
    message: "Redistributing · Copywriter revising hooks…",
    role: "copywriter",
  };
  yield { type: "agent_active", role: "copywriter" };
  await sleep(400);
  yield {
    type: "subagent_output",
    role: "copywriter",
    content: copy.reviseB,
  };
  yield { type: "agent_idle", role: "copywriter" };

  // Variant B — close
  yield {
    type: "tester",
    role: "tester",
    message: "Gate · re-scoring Variant B…",
  };
  await sleep(400);
  yield {
    type: "variant_ready",
    variant: variants[1],
    message: `Close · Variant B ${variants[1].ctr}% CTR — under ${BENCHMARK_CTR}% bar`,
  };
  await sleep(220);

  yield {
    type: "iteration",
    iteration: 2,
    message: "Redistributing · Designer + Copywriter…",
    role: "designer",
  };
  yield { type: "agent_active", role: "designer" };
  await sleep(400);
  yield {
    type: "subagent_output",
    role: "designer",
    content: copy.designC,
  };
  yield { type: "agent_idle", role: "designer" };
  yield { type: "agent_active", role: "copywriter" };
  await sleep(280);
  yield {
    type: "subagent_output",
    role: "copywriter",
    content: copy.finalC,
  };
  yield { type: "agent_idle", role: "copywriter" };

  // Variant C — pass
  yield {
    type: "tester",
    role: "tester",
    message: "Gate · final scoring on Variant C…",
  };
  await sleep(450);
  yield {
    type: "variant_ready",
    variant: variants[2],
    message: `Pass · Variant C ${variants[2].ctr}% CTR — clears ${BENCHMARK_CTR}% bar`,
  };
  await sleep(180);

  const reachout = buildReachoutCadence(variants[2]);
  yield {
    type: "reachout_ready",
    reachout,
    message: "Reach-out cadence drafted · Meta + email + LinkedIn",
  };
  await sleep(160);

  yield {
    type: "complete",
    variants,
    reachout,
    confidence: 94,
    message:
      "Distribution gate open · Variant C cleared 3% CTR. Plan reach-out.",
  };
}

/** Full stream (legacy / non-interactive) — scope then distribute without pause */
export async function* demoCampaignStream(
  brief: string
): AsyncGenerator<CampaignEvent> {
  yield* demoScopeStream(brief);
  yield* demoDistributeStream(brief, DEMO_SCOPE);
}
