import {
  Award,
  Brain,
  Layers,
  MessageCircle,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Feature = {
  icon: typeof Layers;
  title: string;
  description: string;
  gradient: string;
  glow: string;
  span: string;
  tag: string;
};

const FEATURES: Feature[] = [
  {
    icon: Layers,
    title: "Structured micro-courses",
    description:
      "Summary, key concepts, flashcards, and quizzes — generated from any source in one pass.",
    gradient: "from-indigo-500 to-violet-500",
    glow: "from-indigo-200/50 via-violet-200/40",
    span: "lg:col-span-2",
    tag: "Generation",
  },
  {
    icon: RefreshCw,
    title: "Adaptive quiz engine",
    description:
      "Difficulty adjusts in real time. Easier when you struggle, harder when you ace it.",
    gradient: "from-violet-500 to-purple-500",
    glow: "from-violet-200/50 via-purple-200/40",
    span: "lg:col-span-1",
    tag: "Practice",
  },
  {
    icon: MessageCircle,
    title: "AI Study Coach",
    description:
      "Ask anything about the course. Gemini answers using your full course as context.",
    gradient: "from-sky-500 to-blue-500",
    glow: "from-sky-200/50 via-blue-200/40",
    span: "lg:col-span-1",
    tag: "Coach",
  },
  {
    icon: Brain,
    title: "Knowledge gap report",
    description:
      "Missed a concept? Get a targeted mini-lesson on exactly what you need to review.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "from-emerald-200/50 via-teal-200/40",
    span: "lg:col-span-2",
    tag: "Insights",
  },
  {
    icon: Award,
    title: "Verified certificate",
    description:
      "Score 70%+ to unlock a downloadable PNG certificate with your name on it.",
    gradient: "from-amber-500 to-orange-500",
    glow: "from-amber-200/50 via-orange-200/40",
    span: "lg:col-span-2",
    tag: "Reward",
  },
  {
    icon: Share2,
    title: "Shareable course links",
    description:
      "Every course gets a public URL. Anyone can learn from it without regenerating.",
    gradient: "from-rose-500 to-pink-500",
    glow: "from-rose-200/50 via-pink-200/40",
    span: "lg:col-span-1",
    tag: "Share",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-[11px]">
      <div className="mx-auto mb-[100px] mt-[100px] max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4" />
            Features
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.5rem]">
            Everything you need to learn —{" "}
            <span className="text-gradient">and prove it</span>
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Built for speed and impact. Every feature is designed to deliver a
            complete learning experience in minutes.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[1fr] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={cn(
                  "group relative isolate flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_4px_24px_-8px_oklch(0.5_0.1_275_/_12%)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_-12px_oklch(0.5_0.15_275_/_22%)]",
                  feature.span,
                )}
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-24 -right-16 -z-10 h-52 w-52 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                    feature.glow,
                  )}
                />

                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]",
                      feature.gradient,
                    )}
                  >
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground/70">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
