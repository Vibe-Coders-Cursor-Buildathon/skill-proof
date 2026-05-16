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
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            From content to certificate in four simple steps.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, index) => (
            <li key={item.step} className="relative">
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-8 left-[calc(50%+2rem)] hidden h-px w-[calc(100%-4rem)] bg-border lg:block"
                />
              )}
              <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
                <span className="text-3xl font-bold text-primary/20">
                  {item.step}
                </span>
                <h3 className="font-semibold">{item.title}</h3>
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
