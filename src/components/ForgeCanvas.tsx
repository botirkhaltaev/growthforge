"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdCreative } from "./AdCreative";
import { TrustOverlay } from "./TrustOverlay";
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
}

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
}: ForgeCanvasProps) {
  const [trustOpen, setTrustOpen] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const variant = variants[activeIndex] ?? variants[variants.length - 1];

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setTrustOpen(false);
  }, []);

  const startHold = useCallback(() => {
    holdTimer.current = setTimeout(() => setTrustOpen(true), 450);
  }, []);

  const goPrev = () => {
    if (activeIndex > 0) onIndexChange(activeIndex - 1);
  };
  const goNext = () => {
    if (activeIndex < variants.length - 1) onIndexChange(activeIndex + 1);
  };

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
    if (dx < 0) goNext();
    else goPrev();
  };

  if (!variant) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5">
        <p className="text-sm text-stone-400">{statusMessage || "Forging…"}</p>
      </div>
    );
  }

  const formatRevenue = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Top chrome */}
      <header className="flex items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/70">
          Growth Forge
        </p>
        <p className="max-w-[55%] truncate text-right text-[11px] text-stone-500">
          {statusMessage}
        </p>
      </header>

      {/* Canvas */}
      <div
        className="relative flex flex-1 flex-col justify-center px-4 py-4 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={clearHold}
        onMouseDown={startHold}
        onMouseUp={clearHold}
        onMouseLeave={clearHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.04, x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <AdCreative
              variant={variant}
              copywriterActive={activity.copywriter}
              designerActive={activity.designer}
              mediaBuyerActive={activity.media_buyer}
              analystActive={activity.analyst}
            />
          </motion.div>
        </AnimatePresence>

        {/* Desktop swipe hints */}
        {variants.length > 1 && !forging && (
          <div className="mt-4 hidden justify-center gap-6 sm:flex">
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="text-xs text-stone-500 disabled:opacity-30"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === variants.length - 1}
              className="text-xs text-stone-500 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}

        <TrustOverlay
          open={trustOpen}
          variants={variants}
          confidence={confidence}
          onKill={() => {
            clearHold();
            onKill();
          }}
        />
      </div>

      {/* Bottom bar */}
      <footer className="space-y-4 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {variants.map((v, i) => (
              <button
                key={v.id}
                type="button"
                aria-label={`Variant ${v.label}`}
                onClick={() => onIndexChange(i)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition",
                  i === activeIndex
                    ? "bg-amber-400 text-stone-950"
                    : "bg-white/10 text-stone-400 hover:bg-white/15"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          <span className="text-stone-700">·</span>
          <motion.span
            key={variant.ctr}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className={cn(
              "text-sm font-semibold tabular-nums",
              variant.verdict === "pass" && "text-emerald-400",
              variant.verdict === "close" && "text-amber-300",
              variant.verdict === "fail" && "text-red-400",
              activity.analyst && "metric-refresh"
            )}
          >
            {variant.ctr}% CTR
          </motion.span>
          <span className="text-stone-700">·</span>
          <span className="text-sm tabular-nums text-stone-400">
            {formatRevenue(variant.revenueForecast)}
          </span>
        </div>

        <button
          type="button"
          disabled={forging || deployed || variant.verdict !== "pass"}
          onClick={onDeploy}
          className={cn(
            "w-full rounded-2xl py-3.5 text-base font-semibold transition",
            deployed
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          {deployed
            ? "Deployed to Facebook + Instagram"
            : forging
              ? "Agents working…"
              : variant.verdict === "pass"
                ? "Approve & Deploy"
                : "Waiting for a passing variant…"}
        </button>

        <p className="text-center text-[10px] text-stone-600">
          Swipe to compare · Hold for trust
        </p>
      </footer>
    </div>
  );
}
