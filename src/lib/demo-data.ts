import type { AdVariant, CampaignEvent } from "./types";

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
    gradient: "linear-gradient(155deg, #0d3d38 0%, #14534c 40%, #061a18 100%)",
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
    gradient: "linear-gradient(155deg, #0c2a45 0%, #134e6b 45%, #061018 100%)",
    visualEmoji: "02",
    visualCaption: "vB · impact metric",
    ctr: 2.8,
    cvr: 1.6,
    roas: 2.4,
    revenueForecast: 110_000,
    verdict: "close",
    iterationNote: "Copywriter revised headline (+134% CTR). Still below 3% benchmark.",
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Theatrical SSE event sequence for DEMO_MODE */
export async function* demoCampaignStream(
  brief: string
): AsyncGenerator<CampaignEvent> {
  const product = brief.trim() || "Sustainable water bottle, $35, millennials";

  yield {
    type: "system",
    message: `Factory loop starting · ${product.slice(0, 64)}…`,
  };
  await sleep(400);

  yield {
    type: "agent_created",
    role: "foreman",
    message: "Foreman online · create → test → fail → fix → pass",
  };
  await sleep(300);

  yield {
    type: "system",
    message: "Spawning 4 specialist agents on parallel runtimes…",
  };
  await sleep(200);

  const agents = [
    { role: "copywriter" as const, model: "composer-2.5" },
    { role: "designer" as const, model: "auto" },
    { role: "media_buyer" as const, model: "auto" },
    { role: "analyst" as const, model: "composer-2.5" },
  ];

  for (const a of agents) {
    yield {
      type: "vm_spawned",
      role: a.role,
      model: a.model,
      message: `Spawning ${a.role} (${a.model})…`,
    };
    await sleep(180);
  }

  // Parallel "work" — activate all
  for (const a of agents) {
    yield { type: "agent_active", role: a.role };
  }
  await sleep(500);

  yield {
    type: "subagent_output",
    role: "copywriter",
    content: "Drafting 3 headline angles: eco-generic · impact-metric · lifestyle…",
  };
  await sleep(600);

  yield {
    type: "subagent_output",
    role: "designer",
    content: "Composing visual concepts: studio product · ocean texture · lifestyle commute…",
  };
  await sleep(500);

  yield {
    type: "subagent_output",
    role: "media_buyer",
    content: "Targeting: IG + FB · eco-conscious millennials 25–35 · interest: sustainability",
  };
  await sleep(400);

  yield {
    type: "subagent_output",
    role: "analyst",
    content: `Benchmark set: ${BENCHMARK_CTR}% CTR · industry: CPG beverage · forecast model ready`,
  };
  await sleep(500);

  for (const a of agents) {
    yield { type: "agent_idle", role: a.role };
  }

  // Variant A — fail
  yield {
    type: "tester",
    role: "tester",
    message: "Running A/B simulation on Variant A…",
  };
  await sleep(700);
  yield {
    type: "variant_ready",
    variant: DEMO_VARIANTS[0],
    message: `Variant A: ${DEMO_VARIANTS[0].ctr}% CTR — FAIL`,
  };
  await sleep(400);

  yield {
    type: "iteration",
    iteration: 1,
    message: "Below benchmark. Re-dispatching Copywriter…",
    role: "copywriter",
  };
  yield { type: "agent_active", role: "copywriter" };
  await sleep(800);
  yield {
    type: "subagent_output",
    role: "copywriter",
    content: 'Revised: "This bottle saved 340 plastic units from the ocean"',
  };
  yield { type: "agent_idle", role: "copywriter" };

  // Variant B — close
  yield {
    type: "tester",
    role: "tester",
    message: "Re-testing Variant B…",
  };
  await sleep(700);
  yield {
    type: "variant_ready",
    variant: DEMO_VARIANTS[1],
    message: `Variant B: ${DEMO_VARIANTS[1].ctr}% CTR — CLOSE`,
  };
  await sleep(400);

  yield {
    type: "iteration",
    iteration: 2,
    message: "Close but under 3%. Re-dispatching Designer…",
    role: "designer",
  };
  yield { type: "agent_active", role: "designer" };
  await sleep(800);
  yield {
    type: "subagent_output",
    role: "designer",
    content: "Swapped studio shot → lifestyle hiking image. Warm amber palette.",
  };
  yield { type: "agent_idle", role: "designer" };
  yield { type: "agent_active", role: "copywriter" };
  await sleep(500);
  yield {
    type: "subagent_output",
    role: "copywriter",
    content: 'Final: "Your morning coffee just got 10x greener"',
  };
  yield { type: "agent_idle", role: "copywriter" };

  // Variant C — pass
  yield {
    type: "tester",
    role: "tester",
    message: "Final A/B simulation on Variant C…",
  };
  await sleep(800);
  yield {
    type: "variant_ready",
    variant: DEMO_VARIANTS[2],
    message: `Variant C: ${DEMO_VARIANTS[2].ctr}% CTR — PASS`,
  };
  await sleep(300);

  yield {
    type: "complete",
    variants: DEMO_VARIANTS,
    confidence: 94,
    message: "Loop complete · Variant C passed 3% CTR. Ready to deploy.",
  };
}
