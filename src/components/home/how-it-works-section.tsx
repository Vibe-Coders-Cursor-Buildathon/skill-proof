import {
  ArrowRight,
  GraduationCap,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Paste or upload",
    description:
      "YouTube URL, PDF, article link, or audio — pick your source and set language & difficulty.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Gemini generates",
    description:
      "AI builds your course in ~15 seconds: summary, concepts, flashcards, and quiz questions.",
    icon: Wand2,
  },
  {
    step: "03",
    title: "Learn & adapt",
    description:
      "Study flashcards, take the adaptive quiz, and chat with your AI Study Coach.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Earn & share",
    description:
      "Pass the quiz, download your certificate, and share your public course link.",
    icon: GraduationCap,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
            <ArrowRight className="size-4" />
            How it works
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.5rem]">
            Four steps to your{" "}
            <span className="text-gradient">certificate</span>
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            From content to certificate in under a minute.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-indigo-200/80 to-transparent lg:block"
          />

          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === STEPS.length - 1;
            return (
              <li key={item.step} className="relative">
                <div className="group relative flex h-full flex-col gap-4 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/95 hover:shadow-[0_16px_40px_-12px_oklch(0.5_0.15_275_/_18%)]">
                  <div className="flex items-center justify-between">
                    <span className="relative inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="size-5" strokeWidth={2.25} />
                      <span className="absolute -right-1.5 -top-1.5 inline-flex size-6 items-center justify-center rounded-full border border-white bg-white text-[0.6rem] font-bold tabular-nums tracking-tight text-indigo-700 shadow-sm">
                        {item.step}
                      </span>
                    </span>
                    {!isLast && (
                      <ArrowRight className="hidden size-4 shrink-0 text-indigo-300 transition-colors group-hover:text-indigo-500 lg:block" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
