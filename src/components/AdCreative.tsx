"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AdVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdCreativeProps {
  variant: AdVariant;
  copywriterActive?: boolean;
  designerActive?: boolean;
  mediaBuyerActive?: boolean;
  analystActive?: boolean;
  producerActive?: boolean;
  skeleton?: boolean;
  showVerdict?: boolean;
  /** When false, hide the in-card iteration note (useful on landing showcase) */
  showIterationNote?: boolean;
  className?: string;
}

const VERDICT_STYLES = {
  fail: "bg-fail/20 text-fail ring-fail/30",
  close: "bg-close/20 text-close ring-close/30",
  pass: "bg-pass/20 text-pass ring-pass/30",
} as const;

function CreativeArt({
  label,
  designerActive,
  producing,
}: {
  label: AdVariant["label"];
  designerActive: boolean;
  producing: boolean;
}) {
  if (producing) {
    return (
      <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center gap-2 sm:h-40 sm:w-40">
        <div className="forge-ring h-7 w-7 rounded-full border-2 border-amber/25 border-t-amber" />
        <span className="font-mono text-[10px] tracking-wide text-white/70">
          Rendering…
        </span>
      </div>
    );
  }

  return (
    <motion.div
      key={label + "-art"}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className={cn(
        "relative z-10 flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40",
        designerActive && "shimmer-active"
      )}
    >
      {label === "A" && (
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-xl" />
          <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-white/25 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
        </div>
      )}
      {label === "B" && (
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rotate-6 rounded-[1.75rem] border border-white/15 bg-white/5" />
          <div className="absolute inset-0 -rotate-3 rounded-[1.75rem] border border-white/25 bg-white/10 backdrop-blur-xl" />
          <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-white/35" />
          <div className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-white/35" />
        </div>
      )}
      {label === "C" && (
        <div className="relative h-28 w-28">
          <div className="absolute inset-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl" />
          <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber/40 to-white/20" />
          <div className="absolute bottom-3 left-1/2 h-8 w-14 -translate-x-1/2 rounded-t-full bg-white/15" />
        </div>
      )}
    </motion.div>
  );
}

export function AdCreative({
  variant,
  copywriterActive = false,
  designerActive = false,
  mediaBuyerActive = false,
  analystActive = false,
  producerActive = false,
  skeleton = false,
  showVerdict = false,
  showIterationNote,
  className,
}: AdCreativeProps) {
  const [muted, setMuted] = useState(true);
  const noteVisible = showIterationNote ?? showVerdict;
  const hasVideo = Boolean(variant.videoUrl);
  const producing =
    variant.videoStatus === "producing" || (producerActive && !hasVideo);

  if (skeleton) {
    return (
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-surface shadow-2xl shadow-black/40",
          className
        )}
      >
        <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-[#1a1814] to-[#0c0c10] sm:h-64">
          <div className="skeleton-breathe absolute inset-6 rounded-2xl border border-dashed border-white/10" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="forge-ring h-8 w-8 rounded-full border-2 border-amber/20 border-t-amber" />
            <p className="font-mono text-[11px] tracking-wide text-muted">
              Distributing GTM creative…
            </p>
            <p className="max-w-[14rem] text-center text-[10px] leading-relaxed text-muted/50">
              Stations writing copy, composing visuals, setting targets
            </p>
          </div>
        </div>
        <div className="space-y-3 bg-black/40 px-6 py-6">
          <div
            className="skeleton-breathe h-7 rounded-md bg-white/10"
            style={{ width: "85%" }}
          />
          <div className="skeleton-breathe h-3 w-full rounded bg-white/[0.06]" />
          <div
            className="skeleton-breathe h-3 rounded bg-white/[0.06]"
            style={{ width: "65%" }}
          />
          <div className="flex items-center justify-between pt-3">
            <div className="skeleton-breathe h-8 w-20 rounded bg-white/[0.06]" />
            <div className="skeleton-breathe h-10 w-28 rounded-full bg-amber/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] shadow-2xl shadow-black/50",
        variant.verdict === "pass" && "ring-1 ring-pass/25",
        className
      )}
      style={{ background: variant.gradient }}
    >
      <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-2">
        {showVerdict ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ring-1 backdrop-blur-md",
              VERDICT_STYLES[variant.verdict]
            )}
          >
            {variant.verdict}
          </span>
        ) : (
          <span />
        )}
        <div className="flex gap-1.5">
          {["IG", "FB"].map((p, i) => (
            <span
              key={p}
              className={cn(
                "rounded-full bg-black/45 px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider text-white/75 backdrop-blur-md",
                mediaBuyerActive && "pulse-platform ring-1 ring-amber/50"
              )}
              style={i === 1 ? { animationDelay: "0.3s" } : undefined}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "relative flex h-48 items-center justify-center overflow-hidden sm:h-56",
          (designerActive || producing) && "shimmer-active"
        )}
      >
        {hasVideo ? (
          <>
            <video
              key={variant.videoUrl}
              src={variant.videoUrl}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted={muted}
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMuted((m) => !m);
              }}
              className="absolute bottom-3 right-3 z-20 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[10px] tracking-wide text-white/85 backdrop-blur-md transition hover:bg-black/70"
            >
              {muted ? "Tap to unmute" : "Mute"}
            </button>
            <p className="absolute bottom-3 left-3 z-10 font-mono text-[10px] tracking-wide text-white/55">
              v{variant.label} · video ad
            </p>
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.35), transparent 50%)",
              }}
            />
            <CreativeArt
              label={variant.label}
              designerActive={designerActive}
              producing={producing}
            />
            <p className="absolute bottom-3 left-0 right-0 z-10 text-center font-mono text-[10px] tracking-wide text-white/45">
              {producing
                ? "Producer · gemini-omni-flash"
                : variant.visualCaption}
            </p>
          </>
        )}
      </div>

      <div className="relative z-10 space-y-3 bg-black/40 px-6 pb-7 pt-5 backdrop-blur-md">
        <motion.h2
          key={variant.headline}
          className={cn(
            "font-display text-balance text-[1.65rem] leading-[1.15] tracking-tight text-white sm:text-[1.85rem]",
            copywriterActive && "glow-amber"
          )}
        >
          {variant.headline}
        </motion.h2>

        <p className="text-[13.5px] leading-relaxed text-white/65">
          {variant.body}
        </p>

        {variant.iterationNote && noteVisible && (
          <p className="line-clamp-2 font-mono text-[10px] leading-relaxed text-white/40">
            {variant.iterationNote}
          </p>
        )}

        <div className="flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] tracking-wide text-white/45">
              {variant.brand}
            </p>
            <p
              className={cn(
                "font-mono text-lg font-medium text-amber-bright",
                analystActive && "metric-refresh"
              )}
            >
              {variant.price}
            </p>
          </div>
          <span className="rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-stone-950 shadow-lg">
            {variant.cta}
          </span>
        </div>
      </div>
    </div>
  );
}
