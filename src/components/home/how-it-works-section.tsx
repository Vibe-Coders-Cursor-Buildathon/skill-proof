const STEPS = [
  {
    step: "01",
    title: "Paste or upload",
    description:
      "YouTube URL, PDF, article link, or audio — pick your source and set language & difficulty.",
  },
  {
    step: "02",
    title: "Gemini generates",
    description:
      "AI builds your course in ~15 seconds: summary, concepts, flashcards, and quiz questions.",
  },
  {
    step: "03",
    title: "Learn & adapt",
    description:
      "Study flashcards, take the adaptive quiz, and chat with your AI Study Coach.",
  },
  {
    step: "04",
    title: "Earn & share",
    description:
      "Pass the quiz, download your certificate, and share your public course link.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-4 pt-[110px] pb-[110px] sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl md:text-[2.5rem]">
            Four steps to your certificate
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            From content to certificate in under a minute.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, index) => (
            <li key={item.step} className="relative">
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-10 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-indigo-200 to-violet-200 lg:block"
                />
              )}
              <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/80 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-md">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
