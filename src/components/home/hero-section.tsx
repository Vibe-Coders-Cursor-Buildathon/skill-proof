import { Badge } from "@/components/ui/badge";
import { PostSignupWelcome } from "@/components/home/post-signup-welcome";
import { ContentUploadCard } from "@/components/upload/content-upload-card";
import {
  Award,
  Globe2,
  Languages,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";

const HERO_STATS = [
  { value: "60s", label: "Avg. generation", icon: Timer },
  { value: "10+", label: "Languages", icon: Languages },
  { value: "4", label: "Source types", icon: Globe2 },
  { value: "70%", label: "To certify", icon: Award },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-6 md:pb-28 md:pt-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-300/50 via-violet-200/30 to-transparent blur-3xl" />
        <div className="absolute -right-20 top-10 size-72 rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="absolute -left-16 bottom-0 size-64 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <Badge
          variant="secondary"
          className="mb-6 gap-2 rounded-full border-0 bg-white/90 px-4 py-1.5 text-sm font-medium text-primary shadow-md shadow-indigo-500/10 backdrop-blur-sm"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-indigo-500" />
          </span>
          <Sparkles className="size-4" />
          Create · Learn · Get certified
        </Badge>

        <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[3.5rem]">
          Turn any content into a{" "}
          <span className="relative inline-block">
            <span className="text-gradient">micro-course</span>
            <svg
              aria-hidden
              viewBox="0 0 240 14"
              className="pointer-events-none absolute -bottom-1.5 left-0 h-2.5 w-full text-violet-400/70"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9 C 60 2, 120 2, 180 6 S 230 11, 238 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          in 60 seconds
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg font-normal leading-relaxed text-muted-foreground sm:text-xl">
          Paste a YouTube link, PDF, article, or audio. Get flashcards, an
          adaptive quiz, and a verified certificate — in any language.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-foreground">
            <Zap className="size-4 text-amber-500" />
            Under 60 seconds
          </span>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-foreground">
            <Globe2 className="size-4 text-indigo-500" />
            10+ languages
          </span>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-foreground">
            <Users className="size-4 text-fuchsia-500" />
            Built for learners & teams
          </span>
        </div>
      </div>

      <div
        id="upload"
        className="relative mx-auto mt-12 max-w-2xl scroll-mt-28 sm:mt-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-300/40 via-violet-300/30 to-fuchsia-300/30 blur-2xl"
        />
        <PostSignupWelcome />
        <ContentUploadCard />
      </div>

      <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {HERO_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 transition-colors group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white">
                <Icon className="size-4" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <dt className="truncate text-xs font-medium text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="text-base font-bold tabular-nums tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
