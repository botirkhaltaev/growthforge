"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdCreative } from "./AdCreative";
import { TrustOverlay } from "./TrustOverlay";
import { FactoryLoop, inferLoopStep } from "./FactoryLoop";
import type { AdVariant, AgentActivity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ForgeCanvasProps {
  variants: AdVariant[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  activity: AgentActivity;
  statusMessage: string;
  confidence: number;
  forging: boolean;
  deployed: boolean;
  onDeploy: () => void;
  onKill: () => void;
  onReset?: () => void;
}

const AGENT_LABELS: { key: keyof AgentActivity; label: string }[] = [
  { key: "copywriter", label: "Copy" },
  { key: "designer", label: "Design" },
  { key: "media_buyer", label: "Target" },
  { key: "analyst", label: "Score" },
];

export function ForgeCanvas({
  variants,
  activeIndex,
  onIndexChange,
  activity,
  statusMessage,
  confidence,
  forging,
  deployed,
  onDeploy,
  onKill,
  onReset,
}: ForgeCanvasProps) {
  const [trustOpen, setTrustOpen] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const variant = variants[activeIndex] ?? variants[variants.length - 1];
  const showSkeleton = forging && !variant;
  const hasPass = variants.some((v) => v.verdict === "pass");
  const passVariant = variants.find((v) => v.verdict === "pass");
  const loopStep = inferLoopStep({
    forging,
    deployed,
    statusMessage,
    hasPass,
    variantCount: variants.length,
  });

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const startHold = useCallback(() => {
    didSwipe.current = false;
    holdTimer.current = setTimeout(() => {
      if (!didSwipe.current) setTrustOpen(true);
    }, 500);
  }, []);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) onIndexChange(activeIndex - 1);
  }, [activeIndex, onIndexChange]);

  const goNext = useCallback(() => {
    if (activeIndex < variants.length - 1) onIndexChange(activeIndex + 1);
  }, [activeIndex, onIndexChange, variants.length]);

  const jumpToPass = useCallback(() => {
    if (!passVariant) return;
    const idx = variants.findIndex((v) => v.id === passVariant.id);
    if (idx >= 0) onIndexChange(idx);
  }, [passVariant, variants, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (trustOpen) {
        if (e.key === "Escape") setTrustOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "t" || e.key === "T") setTrustOpen(true);
      if (e.key === "Escape" && onReset) onReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, trustOpen, onReset]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    startHold();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    clearHold();
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    didSwipe.current = true;
    if (dx < 0) goNext();
    else goPrev();
  };

  const formatRevenue = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  const anyActive = Object.values(activity).some(Boolean);

  const ctaLabel = (() => {
    if (deployed) return "Live on Meta · Facebook + Instagram";
    if (forging) return "Agents iterating…";
    if (variant?.verdict === "pass") return "Approve & Deploy";
    if (hasPass) return `Jump to winner · Variant ${passVariant?.label}`;
    return "Waiting for a passing variant…";
  })();

  const canJumpToWinner =
    !forging && !deployed && hasPass && variant?.verdict !== "pass";
  const canDeploy =
    !forging && !deployed && variant?.verdict === "pass";
  const ctaDisabled = !canDeploy && !canJumpToWinner;

  const onCta = () => {
    if (canDeploy) {
      onDeploy();
      return;
    }
    if (canJumpToWinner) jumpToPass();
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 px-5 pb-1 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber/75 transition hover:text-amber-bright"
          title="New brief"
        >
          Growth Forge
        </button>
        <button
          type="button"
          onClick={() => setTrustOpen(true)}
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10px] tracking-wide text-muted transition hover:border-amber/30 hover:text-amber-bright"
        >
          Trust{confidence > 0 ? ` · ${confidence}%` : ""}
        </button>
      </header>

      {/* Factory loop — thesis made visible, chrome kept thin */}
      <div className="px-5 pt-1 pb-0.5">
        <FactoryLoop
          compact
          active={forging && !hasPass ? loopStep : null}
          completedThrough={
            deployed || hasPass
              ? "pass"
              : variants.some(
                  (v) => v.verdict === "fail" || v.verdict === "close"
                )
                ? "fail"
                : null
          }
        />
      </div>

      {/* Ambient agent strip — only lit agents, never a dashboard */}
      <div className="flex h-7 items-center justify-center gap-1.5 px-5">
        {anyActive
          ? AGENT_LABELS.filter(({ key }) => activity[key]).map(
              ({ key, label }) => (
                <span
                  key={key}
                  className="rounded-full bg-amber/15 px-2.5 py-1 font-mono text-[10px] tracking-wide text-amber-bright ring-1 ring-amber/30"
                >
                  {label}
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-bright" />
                </span>
              )
            )
          : forging && (
              <span className="font-mono text-[10px] text-muted/40">
                Agents on the creative…
              </span>
            )}
      </div>

      {/* Canvas */}
      <div
        className="relative flex flex-1 flex-col justify-center px-4 py-3 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={clearHold}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          startHold();
        }}
        onMouseUp={clearHold}
        onMouseLeave={clearHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {showSkeleton ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <AdCreative
                variant={
                  {
                    id: "sk",
                    label: "A",
                    headline: "",
                    body: "",
                    cta: "",
                    brand: "",
                    price: "",
                    gradient: "",
                    visualEmoji: "",
                    visualCaption: "",
                    ctr: 0,
                    cvr: 0,
                    roas: 0,
                    revenueForecast: 0,
                    verdict: "fail",
                    iterationNote: "",
                  } as AdVariant
                }
                skeleton
              />
            </motion.div>
          ) : variant ? (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, scale: 0.96, x: 36 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.03, x: -36 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <AdCreative
                variant={variant}
                copywriterActive={activity.copywriter}
                designerActive={activity.designer}
                mediaBuyerActive={activity.media_buyer}
                analystActive={activity.analyst}
                showVerdict={!forging}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Live status under creative */}
        <p className="mt-4 min-h-[1.25rem] text-center font-mono text-[11px] text-muted/80">
          {statusMessage || (anyActive ? "Agents working…" : "")}
        </p>

        {variants.length > 1 && (
          <div className="mt-2 hidden justify-center gap-8 sm:flex">
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="text-xs text-muted disabled:opacity-25"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === variants.length - 1}
              className="text-xs text-muted disabled:opacity-25"
            >
              Next →
            </button>
          </div>
        )}

        <TrustOverlay
          open={trustOpen}
          variants={variants}
          confidence={confidence}
          forging={forging}
          onClose={() => setTrustOpen(false)}
          onKill={() => {
            setTrustOpen(false);
            onKill();
          }}
        />

        {/* Deploy toast — celebrates without burying the creative */}
        <AnimatePresence>
          {deployed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pointer-events-none absolute left-4 right-4 top-2 z-30 flex justify-center"
            >
              <div className="rounded-full border border-pass/35 bg-pass/15 px-4 py-2 text-center shadow-lg backdrop-blur-md">
                <p className="font-mono text-[11px] font-medium text-pass">
                  Deployed · factory loop complete
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <footer className="space-y-3.5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
        <div className="flex items-center justify-center gap-3.5">
          <div className="flex items-center gap-1.5">
            {variants.length > 0 ? (
              variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  aria-label={`Variant ${v.label} · ${v.verdict}`}
                  onClick={() => onIndexChange(i)}
                  className={cn(
                    "relative flex h-7 min-w-7 items-center justify-center rounded-full px-2 font-mono text-[11px] font-medium transition",
                    i === activeIndex
                      ? "bg-amber text-[#1a1408]"
                      : "bg-white/[0.06] text-muted"
                  )}
                >
                  {v.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full",
                      v.verdict === "pass" && "bg-pass",
                      v.verdict === "close" && "bg-close",
                      v.verdict === "fail" && "bg-fail",
                      i === activeIndex && "opacity-0"
                    )}
                  />
                </button>
              ))
            ) : (
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/[0.06] px-2 font-mono text-[11px] text-muted/50">
                —
              </span>
            )}
          </div>
          {variant && (
            <>
              <span className="text-white/15">·</span>
              <motion.span
                key={variant.ctr}
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className={cn(
                  "font-mono text-sm font-medium tabular-nums",
                  variant.verdict === "pass" && "text-pass",
                  variant.verdict === "close" && "text-close",
                  variant.verdict === "fail" && "text-fail",
                  activity.analyst && "metric-refresh"
                )}
              >
                {variant.ctr}% CTR
              </motion.span>
              <span className="text-white/15">·</span>
              <span className="font-mono text-sm tabular-nums text-muted">
                {formatRevenue(variant.revenueForecast)}
              </span>
            </>
          )}
        </div>

        {deployed ? (
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              disabled
              className="w-full rounded-2xl bg-pass/15 py-3.5 text-[15px] font-semibold text-pass"
            >
              {ctaLabel}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3 text-[14px] font-medium text-foreground/80 transition hover:border-amber/30 hover:text-amber-bright"
            >
              Forge another campaign
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={ctaDisabled}
            onClick={onCta}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl py-3.5 text-[15px] font-semibold transition",
              canJumpToWinner
                ? "border border-amber/30 bg-amber/10 text-amber-bright hover:bg-amber/15"
                : "bg-amber text-[#1a1408] hover:bg-amber-bright disabled:cursor-not-allowed disabled:opacity-35"
            )}
          >
            {ctaLabel}
          </button>
        )}

        <p className="text-center text-[10px] text-muted/45">
          {forging
            ? "Hold for trust · Kill switch inside"
            : "Swipe to compare · Hold for trust"}
        </p>
      </footer>
    </div>
  );
}
