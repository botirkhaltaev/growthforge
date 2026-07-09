"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FactoryLoop } from "./FactoryLoop";
import { cn } from "@/lib/utils";

interface BriefScreenProps {
  onSubmit: (brief: string) => void;
  loading?: boolean;
  errorMessage?: string;
}

type Goal = "Conversions" | "Clicks" | "Awareness";

interface WizardData {
  product: string;
  price: string;
  audience: string;
  goal: Goal;
  notes: string;
  composedBrief: string;
}

const STEPS = ["Product", "Audience", "Goal", "Review"] as const;
const GOALS: Goal[] = ["Conversions", "Clicks", "Awareness"];

const DEFAULTS: WizardData = {
  product: "Sustainable water bottle",
  price: "$35",
  audience: "eco-conscious millennials 25–35",
  goal: "Conversions",
  notes: "",
  composedBrief: "",
};

const EXAMPLES = [
  {
    label: "Eco bottle",
    data: {
      product: "Sustainable water bottle",
      price: "$35",
      audience: "eco-conscious millennials 25–35",
      goal: "Conversions" as Goal,
      notes: "",
    },
  },
  {
    label: "AI notes",
    data: {
      product: "AI meeting notes app",
      price: "$12/mo",
      audience: "remote startup founders",
      goal: "Conversions" as Goal,
      notes: "",
    },
  },
  {
    label: "Run club",
    data: {
      product: "Carbon-plate running shoes",
      price: "$180",
      audience: "urban marathoners 28–40",
      goal: "Clicks" as Goal,
      notes: "",
    },
  },
];

const STEP_COPY: Record<
  number,
  { eyebrow: string; title: ReactNode; subtitle: string }
> = {
  0: {
    eyebrow: "GTM factory",
    title: (
      <>
        What are you{" "}
        <em className="not-italic text-amber-bright">selling?</em>
      </>
    ),
    subtitle:
      "Start with the product. Agents will scope ICP and signals from here.",
  },
  1: {
    eyebrow: "Audience",
    title: (
      <>
        Who is it{" "}
        <em className="not-italic text-amber-bright">for?</em>
      </>
    ),
    subtitle: "Describe the ICP in plain language — role, age, mindset.",
  },
  2: {
    eyebrow: "Objective",
    title: (
      <>
        What&apos;s the{" "}
        <em className="not-italic text-amber-bright">goal?</em>
      </>
    ),
    subtitle: "Pick the outcome the campaign should optimize for.",
  },
  3: {
    eyebrow: "Review",
    title: (
      <>
        Ready to{" "}
        <em className="not-italic text-amber-bright">forge</em>
      </>
    ),
    subtitle: "Tweak the brief if needed, then scope the go-to-market.",
  },
};

function composeBrief(data: WizardData): string {
  const parts = [
    data.product.trim(),
    data.price.trim(),
    data.audience.trim(),
  ].filter(Boolean);

  let brief = parts.join(", ");
  if (data.goal) brief += `. Goal: ${data.goal}`;
  if (data.notes.trim()) brief += `. ${data.notes.trim()}`;
  return brief;
}

const inputClass =
  "w-full rounded-2xl border border-white/[0.07] bg-surface/80 px-5 py-4 text-[15px] leading-relaxed text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-muted/50 focus:border-amber/35 focus:bg-surface-elevated disabled:opacity-60";

export function BriefScreen({
  onSubmit,
  loading,
  errorMessage,
}: BriefScreenProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<WizardData>(DEFAULTS);
  const [briefTouched, setBriefTouched] = useState(false);
  const productRef = useRef<HTMLInputElement>(null);
  const audienceRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLInputElement>(null);
  const briefRef = useRef<HTMLTextAreaElement>(null);

  const autoBrief = useMemo(() => composeBrief(data), [data]);
  const reviewBrief = briefTouched ? data.composedBrief : autoBrief;

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!finePointer) return;
    const id = window.setTimeout(() => {
      if (step === 0) productRef.current?.focus();
      else if (step === 1) audienceRef.current?.focus();
      else if (step === 2) notesRef.current?.focus();
      else briefRef.current?.focus();
    }, 280);
    return () => window.clearTimeout(id);
  }, [step]);

  const canAdvance = (() => {
    if (step === 0) return data.product.trim().length > 0;
    if (step === 1) return data.audience.trim().length > 0;
    if (step === 2) return true;
    return reviewBrief.trim().length > 0;
  })();

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const goNext = () => {
    if (!canAdvance || loading) return;
    if (step < STEPS.length - 1) {
      if (step === 2 && !briefTouched) {
        setData((prev) => ({ ...prev, composedBrief: composeBrief(prev) }));
      }
      goTo(step + 1);
      return;
    }
    onSubmit(reviewBrief.trim());
  };

  const goBack = () => {
    if (step === 0 || loading) return;
    goTo(step - 1);
  };

  const applyExample = (example: (typeof EXAMPLES)[number]) => {
    const next = {
      ...example.data,
      composedBrief: composeBrief({
        ...example.data,
        composedBrief: "",
      }),
    };
    setBriefTouched(false);
    setData(next);
    // Jump to Review so phone demos aren't stuck tapping Next × 3
    setDirection(1);
    setStep(3);
  };

  const runQuickDemo = () => {
    if (loading) return;
    const eco = EXAMPLES[0];
    const next: WizardData = {
      ...eco.data,
      composedBrief: "",
    };
    const brief = composeBrief(next);
    setBriefTouched(false);
    setData({ ...next, composedBrief: brief });
    setDirection(1);
    setStep(3);
    onSubmit(brief);
  };

  const copy = STEP_COPY[step];

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-14">
      <div className="absolute left-5 top-[max(1rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-wide text-muted/70 transition hover:text-amber-bright"
        >
          ← Growth Forge
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="space-y-5 text-center">
          <motion.p
            key={`eyebrow-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80"
          >
            {copy.eyebrow}
          </motion.p>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.h1
              key={`title-${step}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-balance text-[2.75rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl"
            >
              {copy.title}
            </motion.h1>
          </AnimatePresence>
          <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-muted">
            {copy.subtitle}
          </p>
        </div>

        <FactoryLoop
          completedThrough={null}
          active={loading ? "scope" : null}
          showCaption
          className="opacity-70"
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext();
          }}
          className="space-y-3"
        >
          <div className="relative min-h-[9.5rem] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -36 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                {step === 0 && (
                  <>
                    <label className="sr-only" htmlFor="product">
                      Product
                    </label>
                    <input
                      ref={productRef}
                      id="product"
                      value={data.product}
                      onChange={(e) => {
                        setBriefTouched(false);
                        setData((prev) => ({
                          ...prev,
                          product: e.target.value,
                        }));
                      }}
                      placeholder="Sustainable water bottle"
                      disabled={loading}
                      className={inputClass}
                      autoComplete="off"
                    />
                    <label className="sr-only" htmlFor="price">
                      Price
                    </label>
                    <input
                      id="price"
                      value={data.price}
                      onChange={(e) => {
                        setBriefTouched(false);
                        setData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }));
                      }}
                      placeholder="$35"
                      disabled={loading}
                      className={inputClass}
                      autoComplete="off"
                    />
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {EXAMPLES.map((ex) => {
                        const selected =
                          data.product === ex.data.product &&
                          data.price === ex.data.price &&
                          data.audience === ex.data.audience;
                        return (
                          <button
                            key={ex.label}
                            type="button"
                            disabled={loading}
                            onClick={() => applyExample(ex)}
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
                      type="button"
                      disabled={loading}
                      onClick={runQuickDemo}
                      className="mx-auto flex items-center gap-1.5 rounded-full border border-pass/30 bg-pass/10 px-3.5 py-1.5 text-[11px] font-medium text-pass transition hover:bg-pass/15 disabled:opacity-45"
                    >
                      Quick demo · Eco bottle
                    </button>
                  </>
                )}

                {step === 1 && (
                  <>
                    <label className="sr-only" htmlFor="audience">
                      Audience
                    </label>
                    <input
                      ref={audienceRef}
                      id="audience"
                      value={data.audience}
                      onChange={(e) => {
                        setBriefTouched(false);
                        setData((prev) => ({
                          ...prev,
                          audience: e.target.value,
                        }));
                      }}
                      placeholder="eco-conscious millennials 25–35"
                      disabled={loading}
                      className={inputClass}
                      autoComplete="off"
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {GOALS.map((goal) => {
                        const selected = data.goal === goal;
                        return (
                          <button
                            key={goal}
                            type="button"
                            disabled={loading}
                            onClick={() => {
                              setBriefTouched(false);
                              setData((prev) => ({ ...prev, goal }));
                            }}
                            className={cn(
                              "rounded-full px-4 py-2 text-[13px] font-medium transition",
                              selected
                                ? "bg-amber text-[#1a1408]"
                                : "border border-white/[0.08] bg-white/[0.03] text-muted hover:border-white/15 hover:text-foreground"
                            )}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                    <label className="sr-only" htmlFor="notes">
                      Optional notes
                    </label>
                    <input
                      ref={notesRef}
                      id="notes"
                      value={data.notes}
                      onChange={(e) => {
                        setBriefTouched(false);
                        setData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }));
                      }}
                      placeholder="Optional notes (tone, offer, constraint…)"
                      disabled={loading}
                      className={inputClass}
                      autoComplete="off"
                    />
                  </>
                )}

                {step === 3 && (
                  <>
                    <label className="sr-only" htmlFor="brief">
                      Product brief
                    </label>
                    <textarea
                      ref={briefRef}
                      id="brief"
                      value={reviewBrief}
                      onChange={(e) => {
                        setBriefTouched(true);
                        setData((prev) => ({
                          ...prev,
                          composedBrief: e.target.value,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          if (!reviewBrief.trim() || loading) return;
                          onSubmit(reviewBrief.trim());
                        }
                      }}
                      rows={4}
                      className={cn(inputClass, "resize-none")}
                      placeholder="Sustainable water bottle, $35, eco-conscious millennials 25–35"
                      disabled={loading}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={loading}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3.5 text-[15px] font-medium text-muted transition hover:border-white/15 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
              >
                Back
              </button>
            ) : null}
            <button
              type="submit"
              disabled={loading || !canAdvance}
              className="group relative flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-amber px-4 py-3.5 text-[15px] font-semibold text-[#1a1408] transition hover:bg-amber-bright disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-60" />
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="forge-ring inline-block h-3.5 w-3.5 rounded-full border-2 border-[#1a1408]/30 border-t-[#1a1408]" />
                    Scoping…
                  </>
                ) : step === STEPS.length - 1 ? (
                  "Scope it"
                ) : (
                  "Next"
                )}
              </span>
            </button>
          </div>

          {errorMessage && !loading && (
            <p
              role="alert"
              className="rounded-xl border border-fail/25 bg-fail/10 px-3 py-2 text-center text-[12px] text-fail"
            >
              {errorMessage}
            </p>
          )}
        </form>

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted/60 sm:gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && <span className="h-px w-3 bg-white/10 sm:w-4" />}
              <button
                type="button"
                disabled={loading || i > step}
                onClick={() => {
                  if (i < step) goTo(i);
                }}
                className={cn(
                  "transition",
                  i === step
                    ? "font-medium text-amber-bright"
                    : i < step
                      ? "text-foreground/70 hover:text-amber-bright"
                      : "text-muted/45"
                )}
              >
                {label}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
