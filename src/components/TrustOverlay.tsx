"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AdVariant } from "@/lib/types";
import { FactoryLoop } from "./FactoryLoop";

interface TrustOverlayProps {
  open: boolean;
  variants: AdVariant[];
  confidence: number;
  agentCount?: number;
  forging?: boolean;
  onClose?: () => void;
  onKill?: () => void;
}

export function TrustOverlay({
  open,
  variants,
  confidence,
  agentCount = 4,
  forging = false,
  onClose,
  onKill,
}: TrustOverlayProps) {
  const iterations = Math.max(variants.length, 1);
  const winner = [...variants].reverse().find((v) => v.verdict === "pass");
  const hasPass = Boolean(winner);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="trust-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-end justify-center bg-black/75 p-5 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="trust-scroll max-h-[min(85dvh,36rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-white/[0.08] bg-surface-elevated p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-amber/80">
                  Trust
                </p>
                <h2
                  id="trust-title"
                  className="mt-1 font-display text-xl text-foreground"
                >
                  Factory oversight
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-2 py-1 text-muted transition hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <FactoryLoop
              className="mt-4"
              compact
              active={forging ? "fix" : null}
              completedThrough={hasPass ? "pass" : variants.length > 0 ? "fail" : null}
            />

            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Agents" value={`${agentCount} specialists · parallel`} />
              <Row label="Iterations" value={`${iterations} · write→test→fix`} />
              <Row label="Confidence" value={`${confidence}%`} accent />
              <Row
                label="Winner"
                value={
                  winner
                    ? `Variant ${winner.label} · ${winner.ctr}% CTR`
                    : "Pending"
                }
              />
            </dl>

            {variants.length > 0 && (
              <ul className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-4">
                {variants.map((v) => (
                  <li key={v.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                      <span className="text-muted">
                        {v.label} · {v.verdict.toUpperCase()}
                      </span>
                      <span
                        className={
                          v.verdict === "pass"
                            ? "text-pass"
                            : v.verdict === "close"
                              ? "text-close"
                              : "text-fail"
                        }
                      >
                        {v.ctr}% CTR
                      </span>
                    </div>
                    {v.iterationNote && (
                      <p className="text-[10px] leading-relaxed text-muted/60">
                        {v.iterationNote}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {forging ? (
              <button
                type="button"
                onClick={onKill}
                className="mt-5 w-full rounded-xl border border-fail/35 bg-fail/10 py-2.5 text-sm font-semibold text-fail transition hover:bg-fail/20"
              >
                Kill switch — halt agents
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-white/[0.06]"
              >
                Back to creative
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={
          accent
            ? "font-medium text-amber-bright"
            : "font-medium text-foreground/90"
        }
      >
        {value}
      </dd>
    </div>
  );
}
