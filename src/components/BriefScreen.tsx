"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface BriefScreenProps {
  onSubmit: (brief: string) => void;
  loading?: boolean;
}

const PLACEHOLDER =
  "Sustainable water bottle, $35, eco-conscious millennials 25–35";

export function BriefScreen({ onSubmit, loading }: BriefScreenProps) {
  const [brief, setBrief] = useState(PLACEHOLDER);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg space-y-10"
      >
        <div className="space-y-5 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80"
          >
            Growth Forge
          </motion.p>
          <h1 className="font-display text-balance text-[2.75rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            What are you{" "}
            <em className="not-italic text-amber-bright">selling?</em>
          </h1>
          <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-muted">
            Four agents write, design, target, and score — then iterate until
            the creative clears the bar.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!brief.trim() || loading) return;
            onSubmit(brief.trim());
          }}
          className="space-y-3"
        >
          <label className="sr-only" htmlFor="brief">
            Product brief
          </label>
          <textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/[0.07] bg-surface/80 px-5 py-4 text-[15px] leading-relaxed text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-muted/50 focus:border-amber/35 focus:bg-surface-elevated"
            placeholder={PLACEHOLDER}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !brief.trim()}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-amber px-4 py-3.5 text-[15px] font-semibold text-[#1a1408] transition hover:bg-amber-bright disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-60" />
            <span className="relative">
              {loading ? "Forging…" : "Forge Campaign"}
            </span>
          </button>
        </form>

        <div className="flex items-center justify-center gap-6 text-[11px] text-muted/60">
          <span>Copy</span>
          <span className="h-px w-4 bg-white/10" />
          <span>Design</span>
          <span className="h-px w-4 bg-white/10" />
          <span>Target</span>
          <span className="h-px w-4 bg-white/10" />
          <span>Score</span>
        </div>
      </motion.div>
    </div>
  );
}
