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
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400/80">
            Growth Forge
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-stone-100 sm:text-4xl">
            What are you selling?
          </h1>
          <p className="text-sm text-stone-400">
            Four Cursor agents will forge, test, and iterate until the creative
            wins.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!brief.trim() || loading) return;
            onSubmit(brief.trim());
          }}
          className="space-y-4"
        >
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/10 bg-surface px-4 py-3.5 text-base text-stone-100 outline-none ring-amber-400/0 transition placeholder:text-stone-600 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
            placeholder={PLACEHOLDER}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !brief.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3.5 text-base font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-950/30 border-t-stone-950" />
                Forging…
              </>
            ) : (
              "Forge Campaign"
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-stone-600">
          Built with @cursor/sdk · generative UI · one canvas
        </p>
      </motion.div>
    </div>
  );
}
