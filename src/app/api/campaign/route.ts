import {
  demoDistributeStream,
  demoScopeStream,
} from "@/lib/demo-data";
import type { CampaignEvent, GtmScope } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function encodeSSE(event: CampaignEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(req: Request) {
  let brief = "Sustainable water bottle, $35, eco-conscious millennials 25-35";
  let stage: "scope" | "distribute" = "scope";
  let scope: GtmScope | undefined;

  try {
    const body = await req.json();
    if (typeof body?.brief === "string" && body.brief.trim()) {
      brief = body.brief.trim();
    }
    if (body?.stage === "distribute" || body?.stage === "scope") {
      stage = body.stage;
    }
    if (body?.scope && typeof body.scope === "object") {
      scope = body.scope as GtmScope;
    }
  } catch {
    // keep defaults
  }

  const demoMode = process.env.DEMO_MODE !== "false";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!demoMode && stage === "distribute") {
          const generator = (await import("@/lib/cursor-agents")).realCampaignStream(
            brief
          );
          for await (const event of generator) {
            controller.enqueue(encodeSSE(event));
          }
          return;
        }

        if (!demoMode && stage === "scope") {
          // Real SDK path still uses theatrical scope for the pause UX
          for await (const event of demoScopeStream(brief)) {
            controller.enqueue(encodeSSE(event));
          }
          return;
        }

        const generator =
          stage === "distribute"
            ? demoDistributeStream(brief, scope)
            : demoScopeStream(brief);

        for await (const event of generator) {
          controller.enqueue(encodeSSE(event));
        }
      } catch (err) {
        controller.enqueue(
          encodeSSE({
            type: "error",
            message: err instanceof Error ? err.message : "Stream failed",
          })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
