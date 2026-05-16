import { Badge } from "@/components/ui/badge";
import { PostSignupWelcome } from "@/components/home/post-signup-welcome";
import { ContentUploadCard } from "@/components/upload/content-upload-card";
import { Globe2, Sparkles, Zap } from "lucide-react";

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
          <Sparkles className="size-4" />
          Powered by Gemini 2.5 Flash
        </Badge>

        <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[3.5rem]">
          Turn any content into a{" "}
          <span className="text-gradient">micro-course</span> in 60 seconds
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
        </div>
      </div>

      <div
        id="upload"
        className="mx-auto mt-12 max-w-2xl scroll-mt-28 sm:mt-14"
      >
        <PostSignupWelcome />
        <ContentUploadCard />
      </div>
    </section>
  );
}
