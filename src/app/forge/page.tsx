"use client";

import { useCallback, useRef, useState } from "react";
import { BriefScreen } from "@/components/BriefScreen";
import { ForgeCanvas } from "@/components/ForgeCanvas";
import { ScopeCard } from "@/components/ScopeCard";
import { ReachoutPanel } from "@/components/ReachoutPanel";
import type { LoopStep } from "@/components/FactoryLoop";
import type {
  AdVariant,
  AgentActivity,
  CampaignEvent,
  ForgePhase,
  GtmScope,
  ReachoutTouch,
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

async function consumeSSE(
  res: Response,
  onEvent: (event: CampaignEvent) => void
) {
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
      const line = chunk.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        onEvent(JSON.parse(line.slice(6)) as CampaignEvent);
      } catch {
        // ignore malformed SSE
      }
    }
  }
}

export default function ForgePage() {
  const [phase, setPhase] = useState<ForgePhase>("brief");
  const [brief, setBrief] = useState("");
  const [scope, setScope] = useState<GtmScope | null>(null);
  const [variants, setVariants] = useState<AdVariant[]>([]);
  const [reachout, setReachout] = useState<ReachoutTouch[]>([]);
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

  const patchVariant = useCallback((id: string, patch: Partial<AdVariant>) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  }, []);

  const produceVideo = useCallback(
    async (variant: AdVariant, nextBrief: string) => {
      if (videoStartedForRef.current === variant.id) return;
      videoStartedForRef.current = variant.id;

      videoAbortRef.current?.abort();
      const controller = new AbortController();
      videoAbortRef.current = controller;

      // Background job — never blocks Approve → reach-out.
      // Progress lives on the Video pill, not the main status line.
      setRoleActive("producer", true);
      patchVariant(variant.id, { videoStatus: "producing" });

      try {
        const submitRes = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: nextBrief, variant }),
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
            setStatusMessage((prev) => {
              const p = prev.toLowerCase();
              if (
                p.includes("live ·") ||
                p.includes("reach-out") ||
                p.includes("planning reach")
              ) {
                return prev;
              }
              return "Video ad ready · tap to unmute";
            });
            return;
          }

          if (statusJson.status === "FAILED") {
            throw new Error(statusJson.error || "Video generation failed");
          }
        }

        throw new Error("Video generation timed out");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("[growthforge] produceVideo", err);
        patchVariant(variant.id, { videoStatus: "failed" });
        setRoleActive("producer", false);
        // Keep campaign status; Video pill shows failure
      }
    },
    [patchVariant]
  );

  /** Unlock Approve as soon as a variant passes — video keeps rendering in background. */
  const unlockDistribute = useCallback((message?: string) => {
    setPhase("ready");
    setLoading(false);
    setActivity((prev) => ({
      ...IDLE_ACTIVITY,
      producer: prev.producer,
    }));
    if (message) {
      setStatusMessage((prev) => {
        const p = prev.toLowerCase();
        if (
          p.includes("gate cleared") ||
          p.includes("pass ·") ||
          p.includes("cleared 3%") ||
          p.includes("video rendering in background") ||
          p.includes("video ad ready")
        ) {
          return prev;
        }
        return message;
      });
    }
  }, []);

  const handleEvent = useCallback(
    (event: CampaignEvent) => {
      const setStatusIfDistributing = (message?: string) => {
        if (!message) return;
        setStatusMessage((prev) => {
          // Once gate is cleared / ready, don't let late SSE chatter overwrite
          const p = prev.toLowerCase();
          if (
            p.includes("gate cleared") ||
            p.includes("video rendering in background") ||
            p.includes("video ad ready") ||
            p.includes("plan reach-out") ||
            p.includes("distribution complete")
          ) {
            return prev;
          }
          return message;
        });
      };

      switch (event.type) {
        case "system":
        case "tester":
        case "iteration":
        case "task_assigned":
          setStatusIfDistributing(event.message);
          break;
        case "agent_created":
        case "vm_spawned":
          setStatusIfDistributing(event.message);
          break;
        case "agent_active":
          if (event.role) setRoleActive(event.role, true);
          break;
        case "agent_idle":
          if (event.role) setRoleActive(event.role, false);
          break;
        case "subagent_output":
          setStatusIfDistributing(event.content?.slice(0, 80));
          if (event.role) setRoleActive(event.role, true);
          break;
        case "scope_ready":
          if (event.scope) setScope(event.scope);
          if (event.message) setStatusMessage(event.message);
          setPhase("scope_ready");
          setLoading(false);
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
            setActiveIndex(() =>
              event.variant
                ? ["A", "B", "C"].indexOf(event.variant.label)
                : 0
            );

            if (event.variant.verdict === "pass") {
              // Unlock reach-out gate immediately; Producer runs in background
              unlockDistribute(
                `Gate cleared · Variant ${event.variant.label} · video rendering in background`
              );
              void produceVideo(event.variant, briefRef.current);
            } else if (event.message) {
              setStatusMessage(event.message);
            }
          }
          break;
        case "reachout_ready":
          if (event.reachout) setReachout(event.reachout);
          // Cadence detail lives on ReachoutPanel — keep gate-cleared status
          break;
        case "complete":
          if (event.variants) {
            setVariants((prev) => {
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
            const passIdx = event.variants.findIndex(
              (v) => v.verdict === "pass"
            );
            setActiveIndex(passIdx >= 0 ? passIdx : event.variants.length - 1);

            const winner = event.variants.find((v) => v.verdict === "pass");
            if (winner) {
              void produceVideo(winner, briefRef.current);
            }
          }
          if (event.reachout) setReachout(event.reachout);
          if (event.confidence) setConfidence(event.confidence);
          unlockDistribute(
            event.message || "Distribution complete · ready for reach-out"
          );
          break;
        case "error":
          if (event.message) setStatusMessage(event.message);
          break;
      }
    },
    [produceVideo, unlockDistribute]
  );

  const runScope = async (nextBrief: string) => {
    abortRef.current?.abort();
    videoAbortRef.current?.abort();
    videoStartedForRef.current = null;
    const controller = new AbortController();
    abortRef.current = controller;

    setBrief(nextBrief);
    briefRef.current = nextBrief;
    setLoading(true);
    setPhase("scoping");
    setScope(null);
    setVariants([]);
    setReachout([]);
    setActiveIndex(0);
    setActivity(IDLE_ACTIVITY);
    setConfidence(0);
    setStatusMessage("Scoping GTM motion…");

    let sawScope = false;

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: nextBrief, stage: "scope" }),
        signal: controller.signal,
      });

      await consumeSSE(res, (event) => {
        if (event.type === "scope_ready") sawScope = true;
        handleEvent(event);
      });

      if (!sawScope) {
        setLoading(false);
        setPhase("brief");
        setStatusMessage("Scope ended early — try again.");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatusMessage("Scoping halted.");
        setPhase("brief");
      } else {
        setStatusMessage(
          err instanceof Error ? err.message : "Something went wrong"
        );
        setPhase("brief");
      }
      setLoading(false);
      setActivity(IDLE_ACTIVITY);
    }
  };

  const runDistribute = async () => {
    if (!brief) return;
    abortRef.current?.abort();
    videoAbortRef.current?.abort();
    videoStartedForRef.current = null;
    const controller = new AbortController();
    abortRef.current = controller;
    briefRef.current = brief;

    setLoading(true);
    setPhase("distributing");
    setVariants([]);
    setReachout([]);
    setActiveIndex(0);
    setActivity(IDLE_ACTIVITY);
    setConfidence(0);
    setStatusMessage("Distributing work across agents…");

    let sawComplete = false;
    let sawVariant = false;

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          stage: "distribute",
          scope: scope ?? undefined,
        }),
        signal: controller.signal,
      });

      await consumeSSE(res, (event) => {
        if (event.type === "complete") sawComplete = true;
        if (event.type === "variant_ready" && event.variant) sawVariant = true;
        handleEvent(event);
      });

      if (!sawComplete) {
        setLoading(false);
        if (sawVariant) {
          setPhase("ready");
          setStatusMessage((m) => m || "Distribution ready.");
        } else {
          setPhase("scope_ready");
          setStatusMessage("Distribution ended early — try again.");
        }
        setActivity((prev) => ({
          ...IDLE_ACTIVITY,
          producer: prev.producer,
        }));
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatusMessage("Agents halted.");
        setPhase(sawVariant ? "ready" : "scope_ready");
      } else {
        setStatusMessage(
          err instanceof Error ? err.message : "Something went wrong"
        );
        setPhase("scope_ready");
      }
      setLoading(false);
      setActivity((prev) => ({
        ...IDLE_ACTIVITY,
        producer: prev.producer,
      }));
    }
  };

  const onKill = () => {
    // Halt distribution agents only — leave background video rendering
    abortRef.current?.abort();
    setActivity((prev) => ({
      ...IDLE_ACTIVITY,
      producer: prev.producer,
    }));
    setPhase((p) => (p === "distributing" ? "ready" : p));
    setLoading(false);
    setStatusMessage("Kill switch — agents halted. Video still rendering…");
  };

  const onApproveReachout = () => {
    setPhase("reachout");
    setStatusMessage(
      reachout.length
        ? "Reach-out cadence ready · review touches"
        : "Planning reach-out cadence…"
    );
  };

  const onSend = () => {
    setPhase("launched");
    setStatusMessage("Live · replies route back to the factory · gate ≥3%");
  };

  const navigableSteps: LoopStep[] =
    phase === "launched" ||
    phase === "scoping" ||
    phase === "distributing" ||
    phase === "brief"
      ? []
      : [
          ...(scope ? (["scope"] as const) : []),
          ...(variants.length > 0 ? (["distribute"] as const) : []),
          ...(reachout.length > 0 ? (["reachout"] as const) : []),
        ];

  const goToStep = (step: LoopStep) => {
    if (!navigableSteps.includes(step)) return;
    if (step === "scope") {
      setPhase("scope_ready");
      return;
    }
    if (step === "distribute") {
      setPhase("ready");
      return;
    }
    setPhase("reachout");
    setStatusMessage(
      reachout.length
        ? "Reach-out cadence ready · review touches"
        : "Planning reach-out cadence…"
    );
  };

  const onReset = () => {
    abortRef.current?.abort();
    videoAbortRef.current?.abort();
    videoStartedForRef.current = null;
    setPhase("brief");
    setBrief("");
    briefRef.current = "";
    setScope(null);
    setVariants([]);
    setReachout([]);
    setActiveIndex(0);
    setActivity(IDLE_ACTIVITY);
    setConfidence(0);
    setStatusMessage("");
    setLoading(false);
  };

  if (phase === "brief" || phase === "scoping") {
    const briefError =
      phase === "brief" &&
      statusMessage &&
      !statusMessage.toLowerCase().includes("scoping") &&
      !statusMessage.toLowerCase().includes("gtm")
        ? statusMessage
        : undefined;
    return (
      <BriefScreen
        onSubmit={runScope}
        loading={loading || phase === "scoping"}
        errorMessage={briefError}
      />
    );
  }

  if (phase === "scope_ready") {
    if (!scope) {
      return (
        <BriefScreen
          onSubmit={runScope}
          loading={false}
          errorMessage="Scope missing — try again."
        />
      );
    }
    return (
      <ScopeCard
        scope={scope}
        statusMessage={statusMessage}
        loading={loading}
        onConfirm={runDistribute}
        onReset={onReset}
        navigable={navigableSteps}
        onNavigate={goToStep}
      />
    );
  }

  if (phase === "reachout" || phase === "launched") {
    const winner =
      variants.find((v) => v.verdict === "pass") ??
      variants[variants.length - 1] ??
      null;
    return (
      <ReachoutPanel
        touches={reachout}
        winner={winner}
        launched={phase === "launched"}
        statusMessage={statusMessage}
        onSend={onSend}
        onReset={onReset}
        navigable={navigableSteps}
        onNavigate={goToStep}
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
      confidence={confidence || (phase === "ready" ? 94 : 0)}
      distributing={phase === "distributing"}
      ready={phase === "ready"}
      onApproveReachout={onApproveReachout}
      onKill={onKill}
      onReset={onReset}
      navigable={navigableSteps}
      onNavigate={goToStep}
    />
  );
}
