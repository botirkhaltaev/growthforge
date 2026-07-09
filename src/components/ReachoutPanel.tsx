"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative flex h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex shrink-0 items-center justify-between gap-3 pb-3">
        <button
          type="button"
          onClick={() => {
            if (!onReset) return;
            if (
              !window.confirm(
                "Start a new brief? Current reach-out plan will be cleared."
              )
            ) {
              return;
            }
            onReset();
          }}
          className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber/75 transition hover:text-amber-bright"
          title="Start a new brief"
        >
          New brief
        </button>
        <Link
          href="/"
          className="rounded-full px-2 py-1 font-mono text-[10px] tracking-wide text-muted/55 transition hover:text-amber-bright"
        >
          Home
        </Link>
      </header>

      <div className="shrink-0 px-1 pb-3">
        <FactoryLoop
          compact
          active={launched ? null : "reachout"}
          completedThrough={launched ? "reachout" : "distribute"}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col space-y-4 overflow-y-auto pb-2"
      >
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80">
            Reach out
          </p>
          <h1 className="font-display text-balance text-[1.75rem] leading-[1.12] tracking-tight sm:text-3xl">
            {launched ? (
              <motion.span
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="inline-block"
              >
                Live.{" "}
                <em className="not-italic text-pass">Replies feed back.</em>
              </motion.span>
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted/50">
                  Winning creative · Variant {winner.label}
                </p>
                <p className="mt-1 font-display text-[17px] leading-snug text-foreground">
                  {winner.headline}
                </p>
                <p className="mt-1 font-mono text-[11px] text-pass">
                  {winner.ctr}% CTR · cleared gate
                  {winner.videoStatus === "ready" && winner.videoUrl
                    ? " · video ready"
                    : winner.videoStatus === "producing"
                      ? " · rendering video"
                      : ""}
                </p>
              </div>
              {winner.videoUrl ? (
                <div className="relative shrink-0">
                  <video
                    src={winner.videoUrl}
                    className="h-16 w-12 rounded-lg object-cover ring-1 ring-white/10"
                    muted={muted}
                    playsInline
                    autoPlay
                    loop
                  />
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="absolute inset-x-0 bottom-0 rounded-b-lg bg-black/55 py-0.5 font-mono text-[8px] text-white/85"
                  >
                    {muted ? "Unmute" : "Mute"}
                  </button>
                </div>
              ) : winner.videoStatus === "producing" ? (
                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-amber/25">
                  <span className="forge-ring h-4 w-4 rounded-full border-2 border-amber/25 border-t-amber" />
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="relative space-y-0 pl-1">
          {touches.map((touch, i) => (
            <div
              key={`${touch.day}-${touch.channel}-${touch.title}`}
              className="relative flex gap-3 pb-4"
            >
              <div className="flex w-8 flex-col items-center">
                <motion.span
                  layout
                  className={cn(
                    "mt-1 h-2.5 w-2.5 rounded-full ring-2",
                    touch.status === "live" || launched
                      ? "bg-pass ring-pass/40"
                      : "bg-amber ring-amber/35",
                    launched && "loop-pulse"
                  )}
                />
                {i < touches.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-white/10" />
                )}
              </div>
              <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.07] bg-surface/60 px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted/55">
                    {CHANNEL_LABEL[touch.channel]} · Day {touch.day}
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

      <div className="mx-auto w-full max-w-lg shrink-0 space-y-2 pt-3">
        {launched ? (
          <>
            <motion.button
              type="button"
              disabled
              initial={{ scale: 0.96, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="w-full rounded-2xl bg-pass/15 py-3.5 text-[15px] font-semibold text-pass ring-1 ring-pass/35"
            >
              Live · feedback loop open
            </motion.button>
            <button
              type="button"
              onClick={() => {
                if (!onReset) return;
                if (
                  !window.confirm(
                    "Start a new brief? Current reach-out plan will be cleared."
                  )
                ) {
                  return;
                }
                onReset();
              }}
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
