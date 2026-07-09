"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.1,
      duration: 0.55,
      ease: EASE,
    },
  }),
};

export function LandingHero() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-3xl space-y-10 text-center"
      >
        <motion.p
          variants={fadeUp}
          custom={0}
          className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80"
        >
          Growth Forge
        </motion.p>

        <motion.h1
          variants={fadeUp}
          custom={1}
          className="font-display text-balance text-[2.75rem] leading-[1.06] tracking-tight sm:text-[3.5rem] lg:text-[4rem]"
        >
          The software feedback loop,{" "}
          <em className="not-italic text-amber-bright">applied to growth</em>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={2}
          className="mx-auto max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]"
        >
          Four Cursor agents write, design, target, and score ad creative — then
          iterate until it passes. The generated ad is the only interface.
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={3}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/forge"
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-amber px-8 py-3.5 text-[15px] font-semibold text-[#1a1408] transition hover:bg-amber-bright sm:w-auto"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-60" />
            <span className="relative">Forge a campaign</span>
          </Link>
          <a
            href="#how-it-works"
            className="rounded-2xl border border-white/[0.08] px-8 py-3.5 text-[15px] font-medium text-foreground/80 transition hover:border-amber/30 hover:text-foreground"
          >
            How it works
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={4}
          className="flex items-center justify-center gap-6 pt-2 text-[11px] text-muted/60"
        >
          <span>Copy</span>
          <span className="h-px w-4 bg-white/10" />
          <span>Design</span>
          <span className="h-px w-4 bg-white/10" />
          <span>Target</span>
          <span className="h-px w-4 bg-white/10" />
          <span>Score</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
