import {
  Award,
  Brain,
  Layers,
  MessageCircle,
  RefreshCw,
  Share2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Structured micro-courses",
    description:
      "Summary, key concepts, flashcards, and quizzes — generated from any source in one pass.",
    gradient: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
  },
  {
    icon: RefreshCw,
    title: "Adaptive quiz engine",
    description:
      "Difficulty adjusts in real time. Easier when you struggle, harder when you ace it.",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
  {
    icon: MessageCircle,
    title: "AI Study Coach",
    description:
      "Ask anything about the course. Gemini answers using your full course as context.",
    gradient: "from-sky-500 to-blue-500",
    bg: "bg-sky-50",
  },
  {
    icon: Brain,
    title: "Knowledge gap report",
    description:
      "Missed a concept? Get a targeted mini-lesson on exactly what you need to review.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Award,
    title: "Verified certificate",
    description:
      "Score 70%+ to unlock a downloadable PNG certificate with your name on it.",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    icon: Share2,
    title: "Shareable course links",
    description:
      "Every course gets a public URL. Anyone can learn from it without regenerating.",
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-[11px]">
      <div className="mx-auto mb-[100px] mt-[100px] max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl md:text-[2.5rem]">
            Everything you need to learn — and prove it
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Built for speed and impact. Every feature is designed to deliver a
            complete learning experience in minutes.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_4px_24px_-8px_oklch(0.5_0.1_275_/_12%)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_oklch(0.5_0.15_275_/_20%)]"
              >
                <span
                  className={`mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
