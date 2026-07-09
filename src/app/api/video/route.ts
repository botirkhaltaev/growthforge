import { NextResponse } from "next/server";
import { FAL_VIDEO_MODEL, getFal, type FalVideoOutput } from "@/lib/fal";
import type { AdVariant } from "@/lib/types";
import { buildVideoPrompt } from "@/lib/video-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SubmitBody = {
  brief?: string;
  variant?: AdVariant;
  prompt?: string;
  aspect_ratio?: "16:9" | "9:16";
  duration?: number;
};

export async function POST(req: Request) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "FAL_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as SubmitBody;
    const variant = body.variant;
    if (!variant?.headline) {
      return NextResponse.json(
        { error: "variant with headline is required" },
        { status: 400 }
      );
    }

    const brief =
      typeof body.brief === "string" && body.brief.trim()
        ? body.brief.trim()
        : `${variant.brand}, ${variant.price}`;

    const prompt =
      typeof body.prompt === "string" && body.prompt.trim()
        ? body.prompt.trim()
        : buildVideoPrompt(brief, variant);

    const aspect_ratio = body.aspect_ratio === "16:9" ? "16:9" : "9:16";
    const duration = Math.min(10, Math.max(3, body.duration ?? 8));

    const fal = getFal();
    const submitted = await fal.queue.submit(FAL_VIDEO_MODEL, {
      input: {
        prompt,
        aspect_ratio,
        duration,
      },
    });

    return NextResponse.json({
      requestId: submitted.request_id,
      prompt,
      model: FAL_VIDEO_MODEL,
      aspect_ratio,
      duration,
    });
  } catch (err) {
    console.error("[growthforge] video submit failed", err);
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status: unknown }).status === "number"
        ? (err as { status: number }).status
        : 500;
    const detail =
      typeof err === "object" &&
      err !== null &&
      "body" in err &&
      typeof (err as { body: unknown }).body === "object" &&
      (err as { body: { detail?: unknown } }).body?.detail
        ? String((err as { body: { detail: unknown } }).body.detail)
        : err instanceof Error
          ? err.message
          : "Failed to submit video job";
    return NextResponse.json({ error: detail }, { status });
  }
}

export async function GET(req: Request) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "FAL_KEY is not configured" },
        { status: 500 }
      );
    }

    const requestId = new URL(req.url).searchParams.get("requestId");
    if (!requestId) {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 }
      );
    }

    const fal = getFal();
    const status = await fal.queue.status(FAL_VIDEO_MODEL, {
      requestId,
      logs: true,
    });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(FAL_VIDEO_MODEL, { requestId });
      const data = result.data as FalVideoOutput;
      const videoUrl = data?.video?.url;
      if (!videoUrl) {
        return NextResponse.json(
          { status: "FAILED", error: "Completed but no video URL returned" },
          { status: 502 }
        );
      }
      return NextResponse.json({
        status: "COMPLETED",
        videoUrl,
        requestId,
      });
    }

    // IN_QUEUE | IN_PROGRESS (FAILED surfaces as thrown errors from the client)
    return NextResponse.json({
      status: status.status,
      requestId,
      queuePosition:
        "queue_position" in status ? status.queue_position : undefined,
    });
  } catch (err) {
    console.error("[growthforge] video status failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to check video status",
      },
      { status: 500 }
    );
  }
}
