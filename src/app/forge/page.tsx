"use client";

import { useCallback, useRef, useState } from "react";
import { BriefScreen } from "@/components/BriefScreen";
import { ForgeCanvas } from "@/components/ForgeCanvas";
import { ScopeCard } from "@/components/ScopeCard";
import { ReachoutPanel } from "@/components/ReachoutPanel";
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
};

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

  const setRoleActive = (role: string, active: boolean) => {
    setActivity((prev) => {
      if (!(role in prev)) return prev;
      return { ...prev, [role]: active };
    });
  };

  const handleEvent = useCallback((event: CampaignEvent) => {
    switch (event.type) {
      case "system":
      case "tester":
      case "iteration":
      case "task_assigned":
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
          setActiveIndex((prev) => {
            return event.variant
              ? ["A", "B", "C"].indexOf(event.variant.label)
              : prev;
          });
          if (event.message) setStatusMessage(event.message);
        }
        break;
      case "reachout_ready":
        if (event.reachout) setReachout(event.reachout);
        if (event.message) setStatusMessage(event.message);
        break;
      case "complete":
        if (event.variants) {
          setVariants(event.variants);
          const passIdx = event.variants.findIndex((v) => v.verdict === "pass");
          setActiveIndex(passIdx >= 0 ? passIdx : event.variants.length - 1);
        }
        if (event.reachout) setReachout(event.reachout);
        if (event.confidence) setConfidence(event.confidence);
        if (event.message) setStatusMessage(event.message);
        setActivity(IDLE_ACTIVITY);
        setPhase("ready");
        setLoading(false);
        break;
      case "error":
        if (event.message) setStatusMessage(event.message);
        break;
    }
  }, []);

  const runScope = async (nextBrief: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBrief(nextBrief);
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
    const controller = new AbortController();
    abortRef.current = controller;

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
        setActivity(IDLE_ACTIVITY);
        setLoading(false);
        if (sawVariant) {
          setPhase("ready");
          setStatusMessage((m) => m || "Distribution ready.");
        } else {
          setPhase("scope_ready");
          setStatusMessage("Distribution ended early — try again.");
        }
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
      setActivity(IDLE_ACTIVITY);
    }
  };

  const onKill = () => {
    abortRef.current?.abort();
    setActivity(IDLE_ACTIVITY);
    setStatusMessage("Kill switch — agents halted.");
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
    setStatusMessage(
      "Live · replies route back to the factory · gate ≥3%"
    );
  };

  const onReset = () => {
    abortRef.current?.abort();
    setPhase("brief");
    setBrief("");
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
    />
  );
}
