"use client";

import { motion } from "framer-motion";
import { AdCreative } from "@/components/AdCreative";
import { DEMO_VARIANTS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const verdictStyles = {
  fail: "text-fail",
  close: "text-close",
  pass: "text-pass",
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.55,
      ease: EASE,
    },
  }),
};

export function LandingShowcase() {
  return (
    <section id="showcase" className="relative px-5 py-24 pb-28 sm:py-32 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 space-y-4 text-center"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80"
          >
            Live output
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-display text-balance text-[2.25rem] leading-[1.1] tracking-tight sm:text-4xl"
          >
            Three variants. One winner.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto max-w-md text-[15px] leading-relaxed text-muted"
          >
            Work is distributed until CTR clears the 3% gate — from generic eco
            copy to a lifestyle hook that converts.
          </motion.p>
        </motion.div>

        <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted/50 sm:hidden">
          Swipe to compare · winner highlighted
        </p>

        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 scrollbar-none sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0 lg:gap-6">
          {DEMO_VARIANTS.map((variant, i) => (
            <motion.div
              key={variant.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={i}
              variants={fadeUp}
              className={cn(
                "flex w-[78vw] max-w-[300px] shrink-0 snap-center flex-col items-center gap-5 sm:w-auto sm:max-w-none",
                variant.verdict === "pass" &&
                  "rounded-3xl ring-2 ring-pass/40 ring-offset-4 ring-offset-[#0c0c10] lg:-mt-2"
              )}
            >
              <div className="flex w-full items-center justify-between px-1">
                <span className="font-mono text-[11px] tracking-wider text-muted">
                  Variant {variant.label}
                  {variant.verdict === "pass" && (
                    <span className="ml-2 text-pass">· gate cleared</span>
                  )}
                </span>
                <span
                  className={cn(
                    "font-mono text-[13px] font-medium",
                    verdictStyles[variant.verdict]
                  )}
                >
                  {variant.ctr}% CTR · {variant.verdict}
                </span>
              </div>
              <AdCreative
                variant={variant}
                showVerdict
                showIterationNote={false}
                className={cn(
                  "max-w-sm",
                  variant.verdict === "pass" &&
                    "shadow-[0_0_40px_rgba(125,206,160,0.12)]"
                )}
              />
              <p className="max-w-xs text-center text-[13px] leading-relaxed text-muted/80">
                {variant.iterationNote}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
