"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FactoryLoop } from "./FactoryLoop";

interface BriefScreenProps {
  onSubmit: (brief: string) => void;
  loading?: boolean;
  errorMessage?: string;
}

const PLACEHOLDER =
  "Sustainable water bottle, $35, eco-conscious millennials 25–35";

const EXAMPLES = [
  {
    label: "Eco bottle",
    brief: "Sustainable water bottle, $35, eco-conscious millennials 25–35",
  },
  {
    label: "AI notes",
    brief: "AI meeting notes app, $12/mo, remote startup founders",
  },
  {
    label: "Run club",
    brief: "Carbon-plate running shoes, $180, urban marathoners 28–40",
  },
];

export function BriefScreen({
  onSubmit,
  loading,
  errorMessage,
}: BriefScreenProps) {
  const [brief, setBrief] = useState(PLACEHOLDER);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="space-y-5 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80"
          >
            Growth Forge · GTM factory
          </motion.p>
          <h1 className="font-display text-balance text-[2.75rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            What are you{" "}
            <em className="not-italic text-amber-bright">launching?</em>
          </h1>
          <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-muted">
            Brief in. Agents create, test, and iterate GTM creative until it
            clears the gate — then you launch.
          </p>
        </div>

        <FactoryLoop completedThrough={null} className="opacity-70" />

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
            autoFocus
          />

          <div className="flex flex-wrap items-center justify-center gap-2">
            {EXAMPLES.map((ex) => {
              const selected = brief === ex.brief;
              return (
                <button
                  key={ex.label}
                  type="button"
                  disabled={loading}
                  onClick={() => setBrief(ex.brief)}
                  className={
                    selected
                      ? "rounded-full border border-amber/40 bg-amber/10 px-3 py-1.5 text-[11px] font-medium text-amber-bright"
                      : "rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted transition hover:border-white/15 hover:text-foreground"
                  }
                >
                  {ex.label}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading || !brief.trim()}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-amber px-4 py-3.5 text-[15px] font-semibold text-[#1a1408] transition hover:bg-amber-bright disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-60" />
            <span className="relative flex items-center gap-2">
              {loading ? (
                <>
                  <span className="forge-ring inline-block h-3.5 w-3.5 rounded-full border-2 border-[#1a1408]/30 border-t-[#1a1408]" />
                  Running factory…
                </>
              ) : (
                "Run GTM Factory"
              )}
            </span>
          </button>

          {errorMessage && !loading && (
            <p
              role="alert"
              className="rounded-xl border border-fail/25 bg-fail/10 px-3 py-2 text-center text-[12px] text-fail"
            >
              {errorMessage}
            </p>
          )}
        </form>

        <p className="text-center text-[11px] leading-relaxed text-muted/55">
          create → test → iterate → launch
        </p>
      </motion.div>
    </div>
  );
}
