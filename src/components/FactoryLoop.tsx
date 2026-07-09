"use client";

import { cn } from "@/lib/utils";

/** GTM stations — scope the motion, distribute the work, reach the market */
export type LoopStep = "scope" | "distribute" | "reachout";

const STEPS: { id: LoopStep; label: string }[] = [
  { id: "scope", label: "Scope" },
  { id: "distribute", label: "Distribute" },
  { id: "reachout", label: "Reach out" },
];

interface FactoryLoopProps {
  active?: LoopStep | null;
  completedThrough?: LoopStep | null;
  compact?: boolean;
  showCaption?: boolean;
  className?: string;
  /** Stations the user can jump to (visited / data already exists). */
  navigable?: LoopStep[];
  onNavigate?: (step: LoopStep) => void;
}

const ORDER: LoopStep[] = ["scope", "distribute", "reachout"];

function rank(step: LoopStep | null | undefined) {
  if (!step) return -1;
  return ORDER.indexOf(step);
}

export function FactoryLoop({
  active,
  completedThrough,
  compact = false,
  showCaption = false,
  className,
  navigable = [],
  onNavigate,
}: FactoryLoopProps) {
  const doneRank = rank(completedThrough);
  const activeRank = rank(active);
  const navigableSet = new Set(navigable);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center",
          compact ? "gap-1" : "gap-1.5"
        )}
        aria-label="GTM factory loop"
      >
        {STEPS.map((step, i) => {
          const stepRank = i;
          const isActive = active === step.id;
          const isFinal =
            completedThrough === "reachout" && step.id === "reachout";
          const isDone = stepRank <= doneRank && !isActive && !isFinal;
          const isUpcoming = stepRank > Math.max(doneRank, activeRank);
          const canNavigate =
            Boolean(onNavigate) && navigableSet.has(step.id) && !isActive;

          const pillClass = cn(
            "rounded-full font-mono tracking-wide transition",
            compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
            isActive &&
              "bg-amber/20 text-amber-bright ring-1 ring-amber/40 loop-pulse",
            isFinal && "bg-pass/20 font-medium text-pass ring-1 ring-pass/45",
            isDone && "bg-white/[0.07] text-foreground/55",
            isUpcoming && "text-muted/35",
            canNavigate &&
              "cursor-pointer hover:bg-amber/15 hover:text-amber-bright hover:ring-1 hover:ring-amber/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40"
          );

          return (
            <div key={step.id} className="flex items-center gap-1.5">
              {i > 0 && (
                <span
                  className={cn(
                    "h-px w-2 sm:w-3",
                    isDone || isActive || isFinal ? "bg-amber/40" : "bg-white/10"
                  )}
                />
              )}
              {canNavigate ? (
                <button
                  type="button"
                  className={pillClass}
                  onClick={() => onNavigate?.(step.id)}
                  aria-label={`Go to ${step.label}`}
                >
                  {step.label}
                </button>
              ) : (
                <span
                  className={pillClass}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {showCaption && !compact && (
        <p className="text-center font-mono text-[9px] tracking-wide text-muted/45">
          scope the motion · distribute the work · reach the market
        </p>
      )}
    </div>
  );
}

/** Map campaign status / phase into a GTM station */
export function inferLoopStep(opts: {
  phase?: string;
  distributing: boolean;
  launched: boolean;
  statusMessage: string;
  hasPass: boolean;
  variantCount: number;
  hasScope?: boolean;
}): LoopStep | null {
  const {
    phase,
    distributing,
    launched,
    statusMessage,
    hasPass,
    variantCount,
    hasScope,
  } = opts;

  if (launched || phase === "launched" || phase === "reachout") return "reachout";
  if (hasPass && !distributing) return "reachout";
  if (phase === "scoping" || phase === "scope_ready") return "scope";
  if (!distributing) {
    if (hasScope) return "scope";
    return null;
  }

  const msg = statusMessage.toLowerCase();
  if (
    msg.includes("scope") ||
    msg.includes("icp") ||
    msg.includes("buying signal")
  ) {
    return "scope";
  }
  if (
    msg.includes("reach-out") ||
    msg.includes("reach out") ||
    msg.includes("cadence")
  ) {
    return "reachout";
  }
  if (
    msg.includes("producer") ||
    msg.includes("video ad") ||
    msg.includes("gemini-omni") ||
    msg.includes("rendering video")
  ) {
    return "distribute";
  }
  if (variantCount === 0 && msg.includes("task")) return "distribute";
  return "distribute";
}
