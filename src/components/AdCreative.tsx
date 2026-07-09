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
  className?: string;
}

export function AdCreative({
  variant,
  copywriterActive = false,
  designerActive = false,
  mediaBuyerActive = false,
  analystActive = false,
  producerActive = false,
  skeleton = false,
  className,
}: AdCreativeProps) {
  const [muted, setMuted] = useState(true);
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
              Forging creative…
            </p>
          </div>
        </div>
        <div className="space-y-3 bg-black/40 px-6 py-6">
          <div className="skeleton-breathe h-7 w-4/5 rounded-md bg-white/10" style={{ width: "85%" }} />
          <div className="skeleton-breathe h-3 w-full rounded bg-white/[0.06]" />
          <div className="skeleton-breathe h-3 w-2/3 rounded bg-white/[0.06]" style={{ width: "65%" }} />
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
        className
      )}
      style={{ background: variant.gradient }}
    >
      {/* Platform chips */}
      <div className="absolute right-4 top-4 z-20 flex gap-1.5">
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

      {/* Visual plane — video when Producer finishes, else abstract product art */}
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
            <motion.div
              key={variant.id + "-art"}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="relative z-10 flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl sm:h-40 sm:w-40"
            >
              {producing ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="forge-ring h-7 w-7 rounded-full border-2 border-amber/25 border-t-amber" />
                  <span className="font-mono text-[10px] tracking-wide text-white/70">
                    Rendering…
                  </span>
                </div>
              ) : (
                <span className="font-display text-5xl text-white/90 sm:text-6xl">
                  {variant.visualEmoji}
                </span>
              )}
            </motion.div>
            <p className="absolute bottom-3 left-0 right-0 z-10 text-center font-mono text-[10px] tracking-wide text-white/45">
              {producing
                ? "Producer · gemini-omni-flash"
                : variant.visualCaption}
            </p>
          </>
        )}
      </div>

      {/* Copy */}
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

        <p className="text-[13.5px] leading-relaxed text-white/65">{variant.body}</p>

        <div className="flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] tracking-wide text-white/45">{variant.brand}</p>
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
