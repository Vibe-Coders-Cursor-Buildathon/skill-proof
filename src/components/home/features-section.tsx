import {
  Award,
  Brain,
  Layers,
  MessageCircle,
  RefreshCw,
  Share2,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: Layers,
    title: "Structured micro-courses",
    description:
      "Summary, key concepts, flashcards, and quizzes — generated from any source in one pass.",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: RefreshCw,
    title: "Adaptive quiz engine",
    description:
      "Difficulty adjusts in real time. Easier questions when you struggle, harder when you ace it.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: MessageCircle,
    title: "AI Study Coach",
    description:
      "Ask anything about the course. Gemini answers using your full course as context.",
    color: "text-sky-600 bg-sky-50",
  },
  {
    icon: Brain,
    title: "Knowledge gap report",
    description:
      "Missed a concept? Get a targeted mini-lesson on exactly what you need to review.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Award,
    title: "Verified certificate",
    description:
      "Score 70%+ to unlock a downloadable PNG certificate with your name on it.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: Share2,
    title: "Shareable course links",
    description:
      "Every course gets a public URL. Anyone can learn from it without regenerating.",
    color: "text-rose-600 bg-rose-50",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to learn — and prove it
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for the demo stage. Every feature is designed to wow judges
            in under two minutes.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="border-border/60 bg-card/80 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-4">
                  <span
                    className={`mb-1 flex size-10 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
