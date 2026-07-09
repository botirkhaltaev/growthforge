import { demoCampaignStream } from "@/lib/demo-data";
import type { CampaignEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function encodeSSE(event: CampaignEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(req: Request) {
  let brief = "Sustainable water bottle, $35, eco-conscious millennials 25-35";
  try {
    const body = await req.json();
    if (typeof body?.brief === "string" && body.brief.trim()) {
      brief = body.brief.trim();
    }
  } catch {
    // keep default brief
  }

  const demoMode = process.env.DEMO_MODE !== "false";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const generator = demoMode
          ? demoCampaignStream(brief)
          : (await import("@/lib/cursor-agents")).realCampaignStream(brief);

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
