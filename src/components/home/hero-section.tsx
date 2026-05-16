import { Badge } from "@/components/ui/badge";
import { ContentUploadCard } from "@/components/upload/content-upload-card";
import { GraduationCap, Sparkles, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-4 md:pb-24 md:pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-200/60 via-violet-100/40 to-transparent blur-3xl" />
        <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Badge
          variant="secondary"
          className="mb-5 gap-1.5 border border-primary/10 bg-white/80 px-3 py-1 text-primary shadow-sm backdrop-blur-sm"
        >
          <Sparkles className="size-3.5" />
          Powered by Gemini 2.0 Flash
        </Badge>

        <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Turn any content into a{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
            micro-course
          </span>{" "}
          in 60 seconds
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          Paste a YouTube link, PDF, article, or audio URL. Get flashcards, an
          adaptive quiz, and a verified certificate — in any language.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-white/60 px-3 py-1 shadow-sm backdrop-blur-sm">
            <Zap className="size-3.5 text-amber-500" />
            Under 60 seconds
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-white/60 px-3 py-1 shadow-sm backdrop-blur-sm">
            <GraduationCap className="size-3.5 text-indigo-500" />
            10+ languages
          </span>
        </div>
      </div>

      <div id="upload" className="mx-auto mt-10 max-w-2xl scroll-mt-24 px-0 sm:mt-12">
        <ContentUploadCard />
      </div>
    </section>
  );
}
