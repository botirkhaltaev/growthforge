"use client";

import { useCallback, useRef, useState } from "react";
import { BriefScreen } from "@/components/BriefScreen";
import { ForgeCanvas } from "@/components/ForgeCanvas";
import type {
  AdVariant,
  AgentActivity,
  CampaignEvent,
  ForgePhase,
} from "@/lib/types";

const IDLE_ACTIVITY: AgentActivity = {
  copywriter: false,
  designer: false,
  media_buyer: false,
  analyst: false,
  tester: false,
  producer: false,
};

const VIDEO_POLL_MS = 3000;
const VIDEO_TIMEOUT_MS = 180_000;

export default function ForgePage() {
  const [phase, setPhase] = useState<ForgePhase>("brief");
  const [variants, setVariants] = useState<AdVariant[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activity, setActivity] = useState<AgentActivity>(IDLE_ACTIVITY);
  const [statusMessage, setStatusMessage] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const briefRef = useRef("");
  const videoAbortRef = useRef<AbortController | null>(null);
  const videoStartedForRef = useRef<string | null>(null);

  const setRoleActive = (role: string, active: boolean) => {
    setActivity((prev) => {
      if (!(role in prev)) return prev;
      return { ...prev, [role]: active };
    });
  };

  const patchVariant = useCallback(
    (id: string, patch: Partial<AdVariant>) => {
      setVariants((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
      );
    },
    []
  );

  const produceVideo = useCallback(
    async (variant: AdVariant, brief: string) => {
      if (videoStartedForRef.current === variant.id) return;
      videoStartedForRef.current = variant.id;

      videoAbortRef.current?.abort();
      const controller = new AbortController();
      videoAbortRef.current = controller;

      setRoleActive("producer", true);
      patchVariant(variant.id, { videoStatus: "producing" });
      setStatusMessage("Producer rendering video ad…");

      try {
        const submitRes = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief, variant }),
          signal: controller.signal,
        });

        const submitJson = (await submitRes.json()) as {
          requestId?: string;
          error?: string;
        };

        if (!submitRes.ok || !submitJson.requestId) {
          throw new Error(submitJson.error || "Video submit failed");
        }

        const requestId = submitJson.requestId;
        patchVariant(variant.id, { videoRequestId: requestId });
        setStatusMessage("Producer queued on fal · gemini-omni-flash…");

        const started = Date.now();
        while (Date.now() - started < VIDEO_TIMEOUT_MS) {
          if (controller.signal.aborted) return;

          await new Promise((r) => setTimeout(r, VIDEO_POLL_MS));
          if (controller.signal.aborted) return;

          const statusRes = await fetch(
            `/api/video?requestId=${encodeURIComponent(requestId)}`,
            { signal: controller.signal }
          );
          const statusJson = (await statusRes.json()) as {
            status?: string;
            videoUrl?: string;
            error?: string;
            queuePosition?: number;
          };

          if (!statusRes.ok) {
            throw new Error(statusJson.error || "Video status failed");
          }

          if (statusJson.status === "COMPLETED" && statusJson.videoUrl) {
            patchVariant(variant.id, {
              videoUrl: statusJson.videoUrl,
              videoStatus: "ready",
            });
            setRoleActive("producer", false);
            setStatusMessage("Video ad ready · tap to unmute");
            return;
          }

          if (statusJson.status === "FAILED") {
            throw new Error(statusJson.error || "Video generation failed");
          }

          const pos =
            typeof statusJson.queuePosition === "number"
              ? ` · queue #${statusJson.queuePosition}`
              : "";
          setStatusMessage(
            `Producer ${String(statusJson.status ?? "IN_PROGRESS").toLowerCase()}${pos}…`
          );
        }

        throw new Error("Video generation timed out");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("[growthforge] produceVideo", err);
        patchVariant(variant.id, { videoStatus: "failed" });
        setRoleActive("producer", false);
        setStatusMessage(
          err instanceof Error
            ? `Video unavailable — ${err.message}`
            : "Video unavailable — using static creative"
        );
      }
    },
    [patchVariant]
  );

  const handleEvent = useCallback(
    (event: CampaignEvent) => {
      switch (event.type) {
        case "system":
        case "tester":
        case "iteration":
          if (event.message) setStatusMessage(event.message);
          break;
        case "agent_created":
        case "vm_spawned":
          if (event.message) setStatusMessage(event.message);
          break;
        case "agent_active":
          if (event.role) setRoleActive(event.role, true);
          break;
        case "agent_idle":
          if (event.role) setRoleActive(event.role, false);
          break;
        case "subagent_output":
          if (event.content) setStatusMessage(event.content.slice(0, 80));
          if (event.role) setRoleActive(event.role, true);
          break;
        case "variant_ready":
          if (event.variant) {
            setVariants((prev) => {
              const next = [
                ...prev.filter((v) => v.id !== event.variant!.id),
                event.variant!,
              ];
              next.sort((a, b) => a.label.localeCompare(b.label));
              return next;
            });
            setActiveIndex((prev) => {
              return event.variant
                ? ["A", "B", "C"].indexOf(event.variant.label)
                : prev;
            });
            if (event.message) setStatusMessage(event.message);

            // Kick off Producer as soon as a passing variant lands
            if (event.variant.verdict === "pass") {
              void produceVideo(event.variant, briefRef.current);
            }
          }
          break;
        case "complete":
          if (event.variants) {
            setVariants((prev) => {
              // Preserve any in-flight video fields already patched onto variants
              const byId = new Map(prev.map((v) => [v.id, v]));
              return event.variants!.map((v) => {
                const existing = byId.get(v.id);
                if (!existing) return v;
                return {
                  ...v,
                  videoUrl: existing.videoUrl,
                  videoStatus: existing.videoStatus,
                  videoRequestId: existing.videoRequestId,
                };
              });
            });
            const passIdx = event.variants.findIndex((v) => v.verdict === "pass");
            setActiveIndex(passIdx >= 0 ? passIdx : event.variants.length - 1);

            const winner = event.variants.find((v) => v.verdict === "pass");
            if (winner) {
              void produceVideo(winner, briefRef.current);
            }
          }
          if (event.confidence) setConfidence(event.confidence);
          if (event.message) setStatusMessage(event.message);
          setActivity((prev) => ({
            ...IDLE_ACTIVITY,
            producer: prev.producer,
          }));
          setPhase("ready");
          setLoading(false);
          break;
        case "error":
          if (event.message) setStatusMessage(event.message);
          break;
      }
    },
    [produceVideo]
  );

  const forge = async (brief: string) => {
    abortRef.current?.abort();
    videoAbortRef.current?.abort();
    videoStartedForRef.current = null;
    const controller = new AbortController();
    abortRef.current = controller;
    briefRef.current = brief;

    setLoading(true);
    setPhase("forging");
    setVariants([]);
    setActiveIndex(0);
    setActivity(IDLE_ACTIVITY);
    setConfidence(0);
    setStatusMessage("GTM factory · connecting stations…");

    let sawComplete = false;
    let sawVariant = false;

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Campaign failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const line = chunk
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!line) continue;
          try {
            const event = JSON.parse(line.slice(6)) as CampaignEvent;
            if (event.type === "complete") sawComplete = true;
            if (event.type === "variant_ready" && event.variant) sawVariant = true;
            handleEvent(event);
          } catch {
            // ignore malformed SSE
          }
        }
      }

      if (!sawComplete) {
        setLoading(false);
        if (sawVariant) {
          setPhase("ready");
          setStatusMessage((m) => m || "Campaign ready.");
        } else {
          setPhase("brief");
          setStatusMessage("Forge ended early — try again.");
        }
        setActivity((prev) => ({
          ...IDLE_ACTIVITY,
          producer: prev.producer,
        }));
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatusMessage("Agents halted.");
        setPhase(sawVariant ? "ready" : "brief");
      } else {
        setStatusMessage(
          err instanceof Error ? err.message : "Something went wrong"
        );
        setPhase("brief");
      }
      setLoading(false);
      setActivity((prev) => ({
        ...IDLE_ACTIVITY,
        producer: prev.producer,
      }));
    }
  };

  const onKill = () => {
    abortRef.current?.abort();
    videoAbortRef.current?.abort();
    setActivity(IDLE_ACTIVITY);
    setStatusMessage("Kill switch — agents halted.");
  };

  const onDeploy = () => {
    setPhase("deployed");
    setStatusMessage("Live on Meta · Facebook + Instagram");
  };

  const onReset = () => {
    abortRef.current?.abort();
    videoAbortRef.current?.abort();
    videoStartedForRef.current = null;
    setPhase("brief");
    setVariants([]);
    setActiveIndex(0);
    setActivity(IDLE_ACTIVITY);
    setConfidence(0);
    setStatusMessage("");
    setLoading(false);
  };

  if (phase === "brief") {
    const briefError =
      statusMessage &&
      !statusMessage.toLowerCase().includes("connecting") &&
      !statusMessage.toLowerCase().includes("gtm factory") &&
      !statusMessage.toLowerCase().includes("factory loop")
        ? statusMessage
        : undefined;
    return (
      <BriefScreen
        onSubmit={forge}
        loading={loading}
        errorMessage={briefError}
      />
    );
  }

  return (
    <ForgeCanvas
      variants={variants}
      activeIndex={Math.min(activeIndex, Math.max(0, variants.length - 1))}
      onIndexChange={setActiveIndex}
      activity={activity}
      statusMessage={statusMessage}
      confidence={confidence || (phase === "ready" || phase === "deployed" ? 94 : 0)}
      forging={phase === "forging"}
      deployed={phase === "deployed"}
      onDeploy={onDeploy}
      onKill={onKill}
      onReset={onReset}
    />
  );
}
