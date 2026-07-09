"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AdVariant } from "@/lib/types";

interface TrustOverlayProps {
  open: boolean;
  variants: AdVariant[];
  confidence: number;
  agentCount?: number;
  onKill?: () => void;
}

export function TrustOverlay({
  open,
  variants,
  confidence,
  agentCount = 4,
  onKill,
}: TrustOverlayProps) {
  const iterations = Math.max(1, variants.length);
  const winner = [...variants].reverse().find((v) => v.verdict === "pass");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-end justify-center bg-black/70 p-5 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/80">
              Trust
            </p>
            <h2 className="mt-1 text-lg font-semibold text-stone-100">
              Oversight at a glance
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Agents</dt>
                <dd className="font-medium text-stone-200">
                  {agentCount} specialists · parallel
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Iterations</dt>
                <dd className="font-medium text-stone-200">{iterations}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Confidence</dt>
                <dd className="font-medium text-amber-300">{confidence}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Winner</dt>
                <dd className="font-medium text-stone-200">
                  Variant {winner?.label ?? "—"} · {winner?.ctr ?? "—"}% CTR
                </dd>
              </div>
            </dl>

            <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-xs text-stone-500">
              {variants.map((v) => (
                <li key={v.id} className="flex justify-between gap-2">
                  <span>
                    {v.label} · {v.verdict.toUpperCase()}
                  </span>
                  <span className="text-stone-400">{v.ctr}% CTR</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onKill}
              className="mt-5 w-full rounded-xl border border-red-500/40 bg-red-500/10 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              Kill switch — halt agents
            </button>

            <p className="mt-3 text-center text-[11px] text-stone-600">
              Release to dismiss
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
