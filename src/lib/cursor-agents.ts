import type { AdVariant, CampaignEvent } from "./types";
import {
  BENCHMARK_CTR,
  DEMO_VARIANTS,
  buildReachoutCadence,
} from "./demo-data";

type SDKMessage = import("@cursor/sdk").SDKMessage;
type Run = import("@cursor/sdk").Run;

const LABELS = ["A", "B", "C"] as const;

const GRADIENTS = [
  "linear-gradient(155deg, #1a6b5c 0%, #0f3d36 45%, #0a1f1c 100%)",
  "linear-gradient(155deg, #1a5a8a 0%, #0e3a5c 45%, #081828 100%)",
  "linear-gradient(155deg, #3d2810 0%, #6b4423 40%, #120e0a 100%)",
] as const;

const AGENT_SPECS = [
  {
    role: "copywriter" as const,
    model: "composer-2.5",
    prompt: (brief: string) =>
      `You are a direct-response copywriter. For this brief: ${brief}

Return JSON only (no markdown) with this exact shape:
{"brand":"string","price":"string like $35","variants":[{"headline":"...","body":"...","cta":"..."},{"headline":"...","body":"...","cta":"..."},{"headline":"...","body":"...","cta":"..."}]}
Provide exactly 3 variants with distinct angles (generic, impact-metric, lifestyle).`,
  },
  {
    role: "designer" as const,
    model: "auto",
    prompt: (brief: string) =>
      `You are a performance marketing designer. For this brief: ${brief}

Return JSON only (no markdown) with this exact shape:
{"concepts":[{"caption":"short visual caption","emoji":"01","gradient":"linear-gradient(...)"},{"caption":"...","emoji":"02","gradient":"..."},{"caption":"...","emoji":"03","gradient":"..."}]}
Provide exactly 3 visual concepts matching variants A/B/C.`,
  },
  {
    role: "media_buyer" as const,
    model: "auto",
    prompt: (brief: string) =>
      `You are a media buyer. For this brief: ${brief}

Return JSON only (no markdown) with this exact shape:
{"targeting":"short targeting summary","placements":["Facebook Feed","Instagram Stories"],"notes":["note for variant A","note for B","note for C"]}`,
  },
  {
    role: "analyst" as const,
    model: "composer-2.5",
    prompt: (brief: string) =>
      `You are a growth analyst. Benchmark CTR is ${BENCHMARK_CTR}%. For this brief: ${brief}

Return JSON only (no markdown) with this exact shape:
{"forecasts":[{"ctr":1.2,"cvr":0.8,"roas":1.1,"revenueForecast":50000,"verdict":"fail","note":"..."},{"ctr":2.8,"cvr":1.6,"roas":2.4,"revenueForecast":110000,"verdict":"close","note":"..."},{"ctr":4.1,"cvr":2.9,"roas":4.2,"revenueForecast":170000,"verdict":"pass","note":"..."}]}
Provide exactly 3 forecasts for variants A/B/C. verdict must be fail|close|pass relative to ${BENCHMARK_CTR}% CTR.`,
  },
];

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const objStart = raw.indexOf("{");
  const arrStart = raw.indexOf("[");
  let start = -1;
  if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) start = objStart;
  else if (arrStart >= 0) start = arrStart;
  if (start < 0) throw new Error("No JSON found");
  const candidate = raw.slice(start);
  return JSON.parse(candidate);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asVerdict(value: unknown, ctr: number): AdVariant["verdict"] {
  if (value === "fail" || value === "close" || value === "pass") return value;
  if (ctr >= BENCHMARK_CTR) return "pass";
  if (ctr >= BENCHMARK_CTR * 0.85) return "close";
  return "fail";
}

function parseCopy(text: string): {
  brand: string;
  price: string;
  variants: { headline: string; body: string; cta: string }[];
} | null {
  try {
    const root = asRecord(extractJson(text));
    if (!root) return null;
    const list = Array.isArray(root.variants) ? root.variants : null;
    if (!list || list.length < 3) return null;
    const variants = list.slice(0, 3).map((item, i) => {
      const row = asRecord(item) ?? {};
      const demo = DEMO_VARIANTS[i];
      return {
        headline: asString(row.headline, demo.headline),
        body: asString(row.body, demo.body),
        cta: asString(row.cta, demo.cta),
      };
    });
    if (variants.some((v) => !v.headline)) return null;
    return {
      brand: asString(root.brand, DEMO_VARIANTS[0].brand),
      price: asString(root.price, DEMO_VARIANTS[0].price),
      variants,
    };
  } catch {
    return null;
  }
}

function parseDesigner(text: string): {
  caption: string;
  emoji: string;
  gradient: string;
}[] {
  try {
    const root = asRecord(extractJson(text));
    const list = Array.isArray(root?.concepts) ? root.concepts : null;
    if (!list) return [];
    return list.slice(0, 3).map((item, i) => {
      const row = asRecord(item) ?? {};
      return {
        caption: asString(row.caption, DEMO_VARIANTS[i].visualCaption),
        emoji: asString(row.emoji, DEMO_VARIANTS[i].visualEmoji),
        gradient: asString(row.gradient, GRADIENTS[i]),
      };
    });
  } catch {
    return [];
  }
}

function parseAnalyst(text: string): {
  ctr: number;
  cvr: number;
  roas: number;
  revenueForecast: number;
  verdict: AdVariant["verdict"];
  note: string;
}[] {
  try {
    const root = asRecord(extractJson(text));
    const list = Array.isArray(root?.forecasts) ? root.forecasts : null;
    if (!list) return [];
    return list.slice(0, 3).map((item, i) => {
      const row = asRecord(item) ?? {};
      const demo = DEMO_VARIANTS[i];
      const ctr = asNumber(row.ctr, demo.ctr);
      return {
        ctr,
        cvr: asNumber(row.cvr, demo.cvr),
        roas: asNumber(row.roas, demo.roas),
        revenueForecast: asNumber(row.revenueForecast, demo.revenueForecast),
        verdict: asVerdict(row.verdict, ctr),
        note: asString(row.note, demo.iterationNote),
      };
    });
  } catch {
    return [];
  }
}

function parseMediaNotes(text: string): string[] {
  try {
    const root = asRecord(extractJson(text));
    if (!root) return [];
    if (Array.isArray(root.notes)) {
      return root.notes.map((n) => asString(n)).filter(Boolean);
    }
    const targeting = asString(root.targeting);
    return targeting ? [targeting] : [];
  } catch {
    return [];
  }
}

/** Merge live agent JSON into AdVariants; fall back to demo data on parse failure. */
export function buildVariantsFromResults(
  results: { role: string; text: string }[]
): { variants: AdVariant[]; usedLive: boolean } {
  const byRole = Object.fromEntries(results.map((r) => [r.role, r.text])) as Record<
    string,
    string
  >;
  const copy = byRole.copywriter ? parseCopy(byRole.copywriter) : null;
  if (!copy) {
    return { variants: DEMO_VARIANTS, usedLive: false };
  }

  const design = byRole.designer ? parseDesigner(byRole.designer) : [];
  const forecasts = byRole.analyst ? parseAnalyst(byRole.analyst) : [];
  const mediaNotes = byRole.media_buyer ? parseMediaNotes(byRole.media_buyer) : [];

  const variants: AdVariant[] = copy.variants.map((v, i) => {
    const demo = DEMO_VARIANTS[i];
    const d = design[i];
    const f = forecasts[i];
    const media = mediaNotes[i] ?? mediaNotes[0];
    const noteParts = [f?.note, media].filter(Boolean);
    return {
      id: LABELS[i].toLowerCase(),
      label: LABELS[i],
      headline: v.headline,
      body: v.body,
      cta: v.cta,
      brand: copy.brand,
      price: copy.price,
      gradient: d?.gradient || GRADIENTS[i],
      visualEmoji: d?.emoji || demo.visualEmoji,
      visualCaption: d?.caption || demo.visualCaption,
      ctr: f?.ctr ?? demo.ctr,
      cvr: f?.cvr ?? demo.cvr,
      roas: f?.roas ?? demo.roas,
      revenueForecast: f?.revenueForecast ?? demo.revenueForecast,
      verdict: f?.verdict ?? asVerdict(undefined, f?.ctr ?? demo.ctr),
      iterationNote:
        noteParts.length > 0
          ? noteParts.join(" · ")
          : `Live agent copy for variant ${LABELS[i]}.`,
    };
  });

  return { variants, usedLive: true };
}

/**
 * Real @cursor/sdk path — 4 parallel agents, each with its own model.
 * Dynamically imports the SDK so Turbopack/Vercel builds don't choke on it.
 * Requires a local Cursor executor (next dev on a machine with Cursor).
 */
export async function* realCampaignStream(
  brief: string,
  signal?: AbortSignal
): AsyncGenerator<CampaignEvent> {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    yield {
      type: "error",
      message: "CURSOR_API_KEY missing — falling back to demo variants",
    };
    yield {
      type: "complete",
      variants: DEMO_VARIANTS,
      confidence: 90,
      message: "Demo fallback complete",
    };
    return;
  }

  let Agent: typeof import("@cursor/sdk").Agent;
  let CursorAgentError: typeof import("@cursor/sdk").CursorAgentError;

  try {
    const sdk = await import("@cursor/sdk");
    Agent = sdk.Agent;
    CursorAgentError = sdk.CursorAgentError;
  } catch (err) {
    yield {
      type: "error",
      message: `Failed to load @cursor/sdk: ${err instanceof Error ? err.message : String(err)}`,
    };
    yield {
      type: "complete",
      variants: DEMO_VARIANTS,
      confidence: 85,
      message: "SDK unavailable — demo variants packaged.",
    };
    return;
  }

  if (signal?.aborted) {
    yield {
      type: "error",
      message: "Request aborted before agents started",
    };
    return;
  }

  yield { type: "system", message: "Creating parallel Cursor agents…" };
  yield { type: "agent_created", role: "foreman", message: "Orchestrator ready" };

  const queue: CampaignEvent[] = [];
  let done = false;
  let resolveWait: (() => void) | null = null;
  const activeRuns = new Set<Run>();

  const push = (event: CampaignEvent) => {
    queue.push(event);
    resolveWait?.();
    resolveWait = null;
  };

  const waitForEvent = () =>
    new Promise<void>((resolve) => {
      if (queue.length > 0) resolve();
      else resolveWait = resolve;
    });

  const cancelActiveRuns = () => {
    for (const run of activeRuns) {
      if (run.supports("cancel")) {
        void run.cancel().catch(() => {
          /* ignore cancel races */
        });
      }
    }
  };

  const onAbort = () => {
    cancelActiveRuns();
    push({
      type: "error",
      message: "Client disconnected — cancelling agent runs",
    });
    done = true;
    resolveWait?.();
  };

  signal?.addEventListener("abort", onAbort, { once: true });

  const results: { role: string; text: string }[] = [];

  const workers = AGENT_SPECS.map(async (spec) => {
    if (signal?.aborted) return;

    push({
      type: "vm_spawned",
      role: spec.role,
      model: spec.model,
      message: `Spawning ${spec.role} (${spec.model})…`,
    });
    push({ type: "agent_active", role: spec.role });

    try {
      await using agent = await Agent.create({
        apiKey,
        model: { id: spec.model },
        local: { cwd: process.cwd() },
      });

      console.log(
        `[growthforge] ${spec.role} agent.agentId=${agent.agentId}`
      );

      if (signal?.aborted) return;

      const run = await agent.send(spec.prompt(brief));
      activeRuns.add(run);
      console.log(
        `[growthforge] ${spec.role} agent.agentId=${agent.agentId} run.id=${run.id}`
      );

      if (signal?.aborted) {
        if (run.supports("cancel")) await run.cancel();
        return;
      }

      let text = "";
      for await (const event of run.stream() as AsyncGenerator<SDKMessage>) {
        if (signal?.aborted) {
          if (run.supports("cancel")) await run.cancel();
          break;
        }
        if (event.type === "assistant") {
          for (const block of event.message.content) {
            if (block.type === "text" && block.text) {
              text += block.text;
              push({
                type: "subagent_output",
                role: spec.role,
                content: block.text.slice(0, 200),
              });
            }
          }
        }
      }

      const result = await run.wait();
      activeRuns.delete(run);

      if (signal?.aborted || result.status === "cancelled") return;

      if (result.status === "error") {
        push({
          type: "error",
          role: spec.role,
          message: `${spec.role} run failed: ${result.id}`,
        });
      } else {
        results.push({
          role: spec.role,
          text: text || String(result.result ?? ""),
        });
      }
    } catch (err) {
      if (signal?.aborted) return;
      if (err instanceof CursorAgentError) {
        push({
          type: "error",
          role: spec.role,
          message: `${spec.role} startup failed: ${err.message} (retryable=${err.isRetryable})`,
        });
      } else {
        push({
          type: "error",
          role: spec.role,
          message: `${spec.role} error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    } finally {
      push({ type: "agent_idle", role: spec.role });
    }
  });

  void Promise.all(workers)
    .then(() => {
      if (signal?.aborted) {
        done = true;
        resolveWait?.();
        return;
      }

      const { variants, usedLive } = buildVariantsFromResults(results);
      const winner =
        [...variants].reverse().find((v) => v.verdict === "pass") ??
        variants[variants.length - 1];
      const reachout = buildReachoutCadence(winner);

      push({
        type: "tester",
        role: "tester",
        message: "Scoring variants against 3% CTR benchmark…",
      });
      for (const v of variants) {
        push({ type: "variant_ready", variant: v });
      }
      push({
        type: "reachout_ready",
        reachout,
        message: "Reach-out cadence drafted · Meta + email + LinkedIn",
      });
      push({
        type: "complete",
        variants,
        reachout,
        confidence: usedLive
          ? results.length >= 3
            ? 96
            : 88
          : results.length > 0
            ? 82
            : 75,
        message: usedLive
          ? `Live agents returned ${results.length}/4 outputs. Campaign ready.`
          : results.length > 0
            ? "Agent outputs unparseable — demo variants packaged."
            : "Agents unavailable — demo variants packaged.",
      });
      done = true;
      resolveWait?.();
    })
    .finally(() => {
      signal?.removeEventListener("abort", onAbort);
    });

  while (!done || queue.length > 0) {
    if (queue.length === 0) await waitForEvent();
    while (queue.length > 0) {
      yield queue.shift()!;
    }
  }
}
