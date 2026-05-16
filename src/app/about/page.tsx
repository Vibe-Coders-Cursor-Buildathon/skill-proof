import Link from "next/link";
import { ArrowRight, BookOpen, Globe2, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";

const VALUES = [
  {
    icon: Zap,
    title: "Speed without shortcuts",
    description:
      "A full micro-course — summary, flashcards, quiz, and certificate path — in about a minute, not a weekend.",
  },
  {
    icon: Globe2,
    title: "Learn in any language",
    description:
      "Generate and study courses in 10+ languages so teams and classrooms worldwide can use the same workflow.",
  },
  {
    icon: BookOpen,
    title: "Proof you learned",
    description:
      "Verified certificates and shareable course links turn passive watching into evidence of real understanding.",
  },
];

export const metadata = {
  title: "About | SkillProof",
  description:
    "SkillProof turns YouTube videos, PDFs, articles, and audio into structured micro-courses with quizzes and certificates.",
};

export default function AboutPage() {
  return (
    <PageShell wide>
      <div className="pb-16 pt-4 md:pb-24 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4" />
            About SkillProof
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Learning proof for the{" "}
            <span className="text-gradient">age of AI</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            SkillProof helps learners and teams turn any content into a
            structured micro-course — powered by Gemini, built for speed, and
            designed so you can actually show what you learned.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="glass-card p-8 sm:p-10">
            <h2 className="text-xl font-bold">Our mission</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Most online content is consumed once and forgotten. SkillProof
              extracts the ideas, organizes them into concepts and flashcards,
              and adds an adaptive quiz plus a certificate — so every video,
              article, or document becomes a repeatable learning experience.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We built SkillProof for students, educators, and teams who need to
              move fast without sacrificing structure. Whether you are prepping
              for an exam, onboarding a cohort, or publishing public courses,
              the workflow stays the same: paste a link, generate, learn, prove
              it.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {VALUES.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              className="btn-gradient h-11 rounded-xl border-0 px-6 font-semibold"
              render={<Link href="/#upload" />}
            >
              Create your first course
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-indigo-200/80 font-semibold text-primary"
              render={<Link href="/pricing" />}
            >
              View pricing
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
