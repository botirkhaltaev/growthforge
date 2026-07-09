"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GtmScope } from "@/lib/types";
import { FactoryLoop } from "./FactoryLoop";

interface ScopeCardProps {
  scope: GtmScope;
  statusMessage?: string;
  loading?: boolean;
  onConfirm: () => void;
  onReset?: () => void;
}

export function ScopeCard({
  scope,
  statusMessage,
  loading,
  onConfirm,
  onReset,
}: ScopeCardProps) {
  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3 pb-3">
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber/75 transition hover:text-amber-bright"
        >
          GTM Factory
        </button>
        <Link
          href="/"
          className="rounded-full px-2 py-1 font-mono text-[10px] tracking-wide text-muted/55 transition hover:text-amber-bright"
        >
          Home
        </Link>
      </header>

      <div className="px-1 pb-3">
        <FactoryLoop
          compact
          active="scope"
          completedThrough={null}
          showCaption={false}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center space-y-5"
      >
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80">
            Scope
          </p>
          <h1 className="font-display text-balance text-[1.85rem] leading-[1.12] tracking-tight sm:text-3xl">
            Motion scoped.{" "}
            <em className="not-italic text-amber-bright">Confirm to distribute.</em>
          </h1>
          {statusMessage && (
            <p className="font-mono text-[11px] text-muted/70">{statusMessage}</p>
          )}
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-surface/80 p-5 shadow-2xl shadow-black/30">
          <div className="space-y-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted/55">
                ICP
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">
                {scope.icp}
              </p>
            </div>

            {scope.positioning && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted/55">
                  Positioning
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                  {scope.positioning}
                </p>
              </div>
            )}

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted/55">
                Buying signals
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scope.signals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-amber/25 bg-amber/10 px-2 py-1 text-[10px] leading-snug text-amber-bright sm:text-[11px]"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted/55">
                  Matched audience
                </p>
                <p className="mt-1 font-display text-3xl text-pass">
                  {scope.audienceCount.toLocaleString()}
                </p>
                <p className="text-[12px] text-muted">accounts match</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted/55">
                  Channel mix
                </p>
                <div className="mt-2 space-y-1">
                  {scope.channels.map((ch) => (
                    <p
                      key={ch.name}
                      className="font-mono text-[12px] text-foreground/80"
                    >
                      {ch.name}{" "}
                      <span className="text-muted">{ch.budgetShare}%</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-amber px-4 py-3.5 text-[15px] font-semibold text-[#1a1408] transition hover:bg-amber-bright disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-60" />
          <span className="relative">
            {loading ? "Distributing…" : "Distribute the work"}
          </span>
        </button>

        <p className="text-center text-[11px] text-muted/50">
          Work will be assigned across copy, design, audience, and gate agents
        </p>
      </motion.div>
    </div>
  );
}
