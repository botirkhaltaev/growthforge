"use client";

import { motion } from "framer-motion";
import type { AdVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdCreativeProps {
  variant: AdVariant;
  copywriterActive?: boolean;
  designerActive?: boolean;
  mediaBuyerActive?: boolean;
  analystActive?: boolean;
  className?: string;
}

export function AdCreative({
  variant,
  copywriterActive = false,
  designerActive = false,
  mediaBuyerActive = false,
  analystActive = false,
  className,
}: AdCreativeProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50",
        className
      )}
      style={{ background: variant.gradient }}
    >
      {/* Platform pulse */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <span
          className={cn(
            "rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium tracking-wide text-white/80 backdrop-blur",
            mediaBuyerActive && "pulse-platform ring-1 ring-amber-400/50"
          )}
        >
          IG
        </span>
        <span
          className={cn(
            "rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium tracking-wide text-white/80 backdrop-blur",
            mediaBuyerActive && "pulse-platform ring-1 ring-amber-400/50"
          )}
          style={{ animationDelay: "0.3s" }}
        >
          FB
        </span>
      </div>

      {/* Visual */}
      <div
        className={cn(
          "relative flex h-52 items-center justify-center sm:h-64",
          designerActive && "shimmer-active"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
        <motion.div
          key={variant.visualEmoji}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative z-10 text-7xl drop-shadow-2xl sm:text-8xl"
          aria-hidden
        >
          {variant.visualEmoji}
        </motion.div>
        <p className="absolute bottom-3 left-0 right-0 z-10 text-center text-[11px] text-white/50">
          {variant.visualCaption}
        </p>
      </div>

      {/* Copy */}
      <div className="relative z-10 space-y-3 bg-black/35 px-6 pb-7 pt-5 backdrop-blur-md">
        <motion.h1
          key={variant.headline}
          className={cn(
            "text-balance text-2xl font-semibold leading-snug tracking-tight text-white sm:text-[1.65rem]",
            copywriterActive && "glow-amber"
          )}
        >
          {variant.headline}
        </motion.h1>

        <p className="text-sm leading-relaxed text-white/70">{variant.body}</p>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            <p className="text-xs text-white/50">{variant.brand}</p>
            <p
              className={cn(
                "text-lg font-semibold text-amber-300",
                analystActive && "metric-refresh"
              )}
            >
              {variant.price}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300"
          >
            {variant.cta} →
          </button>
        </div>
      </div>
    </div>
  );
}
