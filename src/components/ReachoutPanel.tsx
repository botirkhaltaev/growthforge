"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { AdVariant, ReachoutTouch } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FactoryLoop } from "./FactoryLoop";

interface ReachoutPanelProps {
  touches: ReachoutTouch[];
  winner: AdVariant | null;
  launched: boolean;
  statusMessage?: string;
  onSend: () => void;
  onReset?: () => void;
}

const CHANNEL_LABEL: Record<ReachoutTouch["channel"], string> = {
  meta_ads: "Meta",
  email: "Email",
  linkedin_dm: "LinkedIn",
};

export function ReachoutPanel({
  touches,
  winner,
  launched,
  statusMessage,
  onSend,
  onReset,
}: ReachoutPanelProps) {
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
          active={launched ? null : "reachout"}
          completedThrough={launched ? "reachout" : "distribute"}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col space-y-4 overflow-y-auto pb-2"
      >
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80">
            Reach out
          </p>
          <h1 className="font-display text-balance text-[1.75rem] leading-[1.12] tracking-tight sm:text-3xl">
            {launched ? (
              <>
                Live.{" "}
                <em className="not-italic text-pass">Replies feed back.</em>
              </>
            ) : (
              <>
                Cadence ready.{" "}
                <em className="not-italic text-amber-bright">Send it.</em>
              </>
            )}
          </h1>
          {statusMessage && (
            <p className="font-mono text-[11px] text-muted/70">{statusMessage}</p>
          )}
        </div>

        {winner && (
          <div className="rounded-2xl border border-white/[0.07] bg-surface/70 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted/50">
              Winning creative · Variant {winner.label}
            </p>
            <p className="mt-1 font-display text-[17px] leading-snug text-foreground">
              {winner.headline}
            </p>
            <p className="mt-1 font-mono text-[11px] text-pass">
              {winner.ctr}% CTR · cleared gate
            </p>
          </div>
        )}

        <div className="relative space-y-0 pl-1">
          {touches.map((touch, i) => (
            <div key={`${touch.day}-${touch.channel}-${touch.title}`} className="relative flex gap-3 pb-4">
              <div className="flex w-8 flex-col items-center">
                <span
                  className={cn(
                    "mt-1 h-2.5 w-2.5 rounded-full ring-2",
                    touch.status === "live" || launched
                      ? "bg-pass ring-pass/40"
                      : "bg-amber ring-amber/35"
                  )}
                />
                {i < touches.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-white/10" />
                )}
              </div>
              <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.07] bg-surface/60 px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted/55">
                    {CHANNEL_LABEL[touch.channel]}
                    {touch.channel !== "meta_ads" ? ` · Day ${touch.day}` : ""}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide",
                      touch.status === "live" || launched
                        ? "bg-pass/15 text-pass"
                        : "bg-amber/10 text-amber-bright"
                    )}
                  >
                    {launched
                      ? touch.status === "live"
                        ? "live"
                        : "queued"
                      : touch.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-medium text-foreground">
                  {touch.title}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-[12px] leading-relaxed text-muted">
                  {touch.snippet}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-center font-mono text-[10px] text-muted/60">
          Auto-pause on reply · replies route back to the factory · gate ≥3%
        </p>
      </motion.div>

      <div className="mx-auto w-full max-w-lg space-y-2 pt-3">
        {launched ? (
          <>
            <button
              type="button"
              disabled
              className="w-full rounded-2xl bg-pass/15 py-3.5 text-[15px] font-semibold text-pass"
            >
              Live · feedback loop open
            </button>
            <button
              type="button"
              onClick={onReset}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3 text-[14px] font-medium text-foreground/80 transition hover:border-amber/30 hover:text-amber-bright"
            >
              Scope another motion
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onSend}
            className="relative w-full overflow-hidden rounded-2xl bg-amber py-3.5 text-[15px] font-semibold text-[#1a1408] transition hover:bg-amber-bright"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-60" />
            <span className="relative">Send it</span>
          </button>
        )}
      </div>
    </div>
  );
}
