import Link from "next/link";
import { LandingHero } from "@/components/LandingHero";
import { LandingShowcase } from "@/components/LandingShowcase";

const LOOP_STEPS = [
  { label: "Create ad", color: "text-foreground/70" },
  { label: "A/B test", color: "text-foreground/70" },
  { label: "CTR score", color: "text-close" },
  { label: "Revise", color: "text-foreground/70" },
  { label: "Pass", color: "text-pass" },
] as const;

const AGENTS = [
  { role: "Copywriter", task: "Headlines & hooks" },
  { role: "Designer", task: "Visual direction" },
  { role: "Media Buyer", task: "Platform targeting" },
  { role: "Analyst", task: "CTR & ROAS scoring" },
] as const;

export default function LandingPage() {
  return (
    <main>
      <LandingHero />

      <section
        id="how-it-works"
        className="border-y border-white/[0.06] px-5 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-4xl space-y-10 text-center">
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80">
              The loop
            </p>
            <h2 className="font-display text-balance text-[2rem] leading-[1.12] tracking-tight sm:text-3xl">
              Write → test → fail → fix → pass
            </h2>
            <p className="mx-auto max-w-lg text-[15px] leading-relaxed text-muted">
              Same feedback cycle that ships software — applied to growth
              marketing. Agents don&apos;t stop at the first draft.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[12px] sm:text-[13px]">
            {LOOP_STEPS.map((step, i) => (
              <span key={step.label} className="flex items-center gap-3">
                <span className={step.color}>{step.label}</span>
                {i < LOOP_STEPS.length - 1 && (
                  <span className="text-muted/40">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      <LandingShowcase />

      <section className="px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber/80">
              The agents
            </p>
            <h2 className="font-display text-balance text-[2rem] leading-[1.12] tracking-tight sm:text-3xl">
              Parallel specialists, one creative
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AGENTS.map((agent) => (
              <div
                key={agent.role}
                className="rounded-2xl border border-white/[0.07] bg-surface/60 px-5 py-6 text-center"
              >
                <p className="font-display text-lg text-amber-bright">
                  {agent.role}
                </p>
                <p className="mt-2 text-[13px] text-muted">{agent.task}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 pt-8">
        <div className="mx-auto max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="font-display text-balance text-[2rem] leading-[1.12] tracking-tight sm:text-3xl">
              Ready to forge?
            </h2>
            <p className="text-[15px] leading-relaxed text-muted">
              Enter a product brief and watch four agents iterate until the
              creative clears the bar.
            </p>
          </div>

          <Link
            href="/forge"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-amber px-10 py-3.5 text-[15px] font-semibold text-[#1a1408] transition hover:bg-amber-bright"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-60" />
            <span className="relative">Forge a campaign</span>
          </Link>

          <p className="font-mono text-[11px] tracking-wide text-muted/50">
            Built with @cursor/sdk · parallel agents · generative UI
          </p>
        </div>
      </section>
    </main>
  );
}
