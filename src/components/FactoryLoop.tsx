"use client";

import { cn } from "@/lib/utils";

/** GTM factory stations — create assets, test, iterate, launch */
export type LoopStep = "create" | "test" | "iterate" | "launch";

const STEPS: { id: LoopStep; label: string }[] = [
  { id: "create", label: "Create" },
  { id: "test", label: "Test" },
  { id: "iterate", label: "Iterate" },
  { id: "launch", label: "Launch" },
];

interface FactoryLoopProps {
  active?: LoopStep | null;
  completedThrough?: LoopStep | null;
  compact?: boolean;
  className?: string;
}

const ORDER: LoopStep[] = ["create", "test", "iterate", "launch"];

function rank(step: LoopStep | null | undefined) {
  if (!step) return -1;
  return ORDER.indexOf(step);
}

export function FactoryLoop({
  active,
  completedThrough,
  compact = false,
  className,
}: FactoryLoopProps) {
  const doneRank = rank(completedThrough);
  const activeRank = rank(active);

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "gap-1" : "gap-1.5",
        className
      )}
      aria-label="GTM factory loop"
    >
      {STEPS.map((step, i) => {
        const stepRank = i;
        const isActive = active === step.id;
        const isFinalLaunch =
          completedThrough === "launch" && step.id === "launch";
        const isDone = stepRank <= doneRank && !isActive && !isFinalLaunch;
        const isUpcoming = stepRank > Math.max(doneRank, activeRank);

        return (
          <div key={step.id} className="flex items-center gap-1.5">
            {i > 0 && (
              <span
                className={cn(
                  "h-px w-2 sm:w-3",
                  isDone || isActive || isFinalLaunch
                    ? "bg-amber/40"
                    : "bg-white/10"
                )}
              />
            )}
            <span
              className={cn(
                "rounded-full font-mono tracking-wide transition",
                compact
                  ? "px-2 py-0.5 text-[9px]"
                  : "px-2.5 py-1 text-[10px]",
                isActive &&
                  "bg-amber/20 text-amber-bright ring-1 ring-amber/40 loop-pulse",
                isFinalLaunch &&
                  "bg-pass/20 font-medium text-pass ring-1 ring-pass/45",
                isDone && "bg-white/[0.07] text-foreground/55",
                isUpcoming && "text-muted/35"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Map campaign status / phase into a GTM factory station */
export function inferLoopStep(opts: {
  forging: boolean;
  deployed: boolean;
  statusMessage: string;
  hasPass: boolean;
  variantCount: number;
}): LoopStep | null {
  const { forging, deployed, statusMessage, hasPass, variantCount } = opts;
  if (deployed) return "launch";
  if (hasPass && !forging) return "launch";
  if (!forging) return null;

  const msg = statusMessage.toLowerCase();
  if (
    msg.includes("re-dispatch") ||
    msg.includes("revised") ||
    msg.includes("swapped") ||
    msg.includes("iterate") ||
    msg.includes("fix ·") ||
    msg.includes("final:")
  ) {
    return "iterate";
  }
  if (
    msg.includes("fail") ||
    msg.includes("below") ||
    msg.includes("close but") ||
    msg.includes("under bar")
  ) {
    return "iterate";
  }
  if (
    msg.includes("simulation") ||
    msg.includes("re-scoring") ||
    msg.includes("re-testing") ||
    msg.includes("scoring") ||
    msg.includes("a/b") ||
    msg.includes("test ·")
  ) {
    return "test";
  }
  if (variantCount === 0) return "create";
  return "create";
}
