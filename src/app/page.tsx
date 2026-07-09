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
};

export default function Home() {
  const [phase, setPhase] = useState<ForgePhase>("brief");
  const [variants, setVariants] = useState<AdVariant[]>([]);
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
            const next = [...prev.filter((v) => v.id !== event.variant!.id), event.variant!];
            next.sort((a, b) => a.label.localeCompare(b.label));
            return next;
          });
          setActiveIndex((prev) => {
            // Prefer showing the newest variant
            return event.variant
              ? ["A", "B", "C"].indexOf(event.variant.label)
              : prev;
          });
          if (event.message) setStatusMessage(event.message);
        }
        break;
      case "complete":
        if (event.variants) {
          setVariants(event.variants);
          const passIdx = event.variants.findIndex((v) => v.verdict === "pass");
          setActiveIndex(passIdx >= 0 ? passIdx : event.variants.length - 1);
        }
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

  const forge = async (brief: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setPhase("forging");
    setVariants([]);
    setActiveIndex(0);
    setActivity(IDLE_ACTIVITY);
    setConfidence(0);
    setStatusMessage("Connecting to agents…");

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
            handleEvent(event);
          } catch {
            // ignore malformed SSE
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatusMessage("Agents halted.");
        setPhase(variants.length ? "ready" : "brief");
      } else {
        setStatusMessage(
          err instanceof Error ? err.message : "Something went wrong"
        );
        setPhase("brief");
      }
    } finally {
      setLoading(false);
      setActivity(IDLE_ACTIVITY);
    }
  };

  const onKill = () => {
    abortRef.current?.abort();
    setActivity(IDLE_ACTIVITY);
    setStatusMessage("Kill switch — agents halted.");
  };

  const onDeploy = () => {
    setPhase("deployed");
    setStatusMessage("Live on Meta · Facebook + Instagram");
  };

  const onReset = () => {
    abortRef.current?.abort();
    setPhase("brief");
    setVariants([]);
    setActiveIndex(0);
    setActivity(IDLE_ACTIVITY);
    setConfidence(0);
    setStatusMessage("");
    setLoading(false);
  };

  if (phase === "brief") {
    return <BriefScreen onSubmit={forge} loading={loading} />;
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
