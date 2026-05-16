"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Lightbulb,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { courseContentSchema, type CourseContent } from "@/types/course";
import { cn } from "@/lib/utils";

type EditorTab = "basics" | "concepts" | "flashcards" | "quiz";

const TABS: { id: EditorTab; label: string; icon: typeof BookOpen }[] = [
  { id: "basics", label: "Basics", icon: Sparkles },
  { id: "concepts", label: "Concepts", icon: BookOpen },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: Lightbulb },
];

type CourseEditorProps = {
  slug: string;
  initialContent: CourseContent;
};

export function CourseEditor({ slug, initialContent }: CourseEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<CourseContent>(() =>
    structuredClone(initialContent),
  );
  const [tab, setTab] = useState<EditorTab>("basics");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateContent = (patch: Partial<CourseContent>) => {
    setContent((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError(null);
    const parsed = courseContentSchema.safeParse(content);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Check all fields — concepts, 10 flashcards, and 5 quiz questions required.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_edited: parsed.data }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save changes");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href={`/courses/${slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="size-3" />
            Course editor
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Edit course content
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Fix AI mistakes, update flashcards, and adjust quiz questions. Changes
            apply to your study view immediately after saving.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-border/50 bg-muted/40 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                tab === t.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-card p-6 sm:p-8">
        {tab === "basics" && (
          <div className="space-y-5">
            <Field label="Course title">
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateContent({ title: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Summary">
              <textarea
                value={content.summary}
                onChange={(e) => updateContent({ summary: e.target.value })}
                rows={5}
                className={textareaClass}
              />
            </Field>
          </div>
        )}

        {tab === "concepts" && (
          <div className="space-y-6">
            {content.concepts.map((concept, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-white/80 p-5"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-indigo-600">
                  Concept {i + 1}
                </p>
                <Field label="Title">
                  <input
                    type="text"
                    value={concept.title}
                    onChange={(e) => {
                      const concepts = [...content.concepts];
                      concepts[i] = { ...concepts[i], title: e.target.value };
                      updateContent({ concepts });
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field label="Explanation" className="mt-3">
                  <textarea
                    value={concept.explanation}
                    onChange={(e) => {
                      const concepts = [...content.concepts];
                      concepts[i] = {
                        ...concepts[i],
                        explanation: e.target.value,
                      };
                      updateContent({ concepts });
                    }}
                    rows={4}
                    className={textareaClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        )}

        {tab === "flashcards" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Edit the front (question) and back (answer) for each flashcard.
            </p>
            {content.flashcards.map((card, i) => (
              <div
                key={i}
                className="rounded-2xl border border-violet-200/60 bg-violet-50/30 p-5"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-violet-700">
                  Card {i + 1}
                </p>
                <Field label="Question (front)">
                  <textarea
                    value={card.question}
                    onChange={(e) => {
                      const flashcards = [...content.flashcards];
                      flashcards[i] = {
                        ...flashcards[i],
                        question: e.target.value,
                      };
                      updateContent({ flashcards });
                    }}
                    rows={2}
                    className={textareaClass}
                  />
                </Field>
                <Field label="Answer (back)" className="mt-3">
                  <textarea
                    value={card.answer}
                    onChange={(e) => {
                      const flashcards = [...content.flashcards];
                      flashcards[i] = {
                        ...flashcards[i],
                        answer: e.target.value,
                      };
                      updateContent({ flashcards });
                    }}
                    rows={2}
                    className={textareaClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        )}

        {tab === "quiz" && (
          <div className="space-y-8">
            {content.quiz.map((q, qi) => (
              <div
                key={qi}
                className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-5"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-800">
                  Question {qi + 1}
                </p>
                <Field label="Question">
                  <textarea
                    value={q.question}
                    onChange={(e) => {
                      const quiz = [...content.quiz];
                      quiz[qi] = { ...quiz[qi], question: e.target.value };
                      updateContent({ quiz });
                    }}
                    rows={2}
                    className={textareaClass}
                  />
                </Field>
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Answer options
                  </p>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-start gap-3">
                      <label className="mt-2.5 flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correct === oi}
                          onChange={() => {
                            const quiz = [...content.quiz];
                            quiz[qi] = { ...quiz[qi], correct: oi };
                            updateContent({ quiz });
                          }}
                          className="size-4 accent-indigo-600"
                        />
                        <span className="text-xs font-bold text-muted-foreground">
                          {String.fromCharCode(65 + oi)}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const quiz = [...content.quiz];
                          const options = [...quiz[qi].options] as [
                            string,
                            string,
                            string,
                            string,
                          ];
                          options[oi] = e.target.value;
                          quiz[qi] = { ...quiz[qi], options };
                          updateContent({ quiz });
                        }}
                        className={cn(inputClass, "flex-1")}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      />
                    </div>
                  ))}
                </div>
                <Field label="Explanation (shown after answer)" className="mt-4">
                  <textarea
                    value={q.explanation}
                    onChange={(e) => {
                      const quiz = [...content.quiz];
                      quiz[qi] = { ...quiz[qi], explanation: e.target.value };
                      updateContent({ quiz });
                    }}
                    rows={3}
                    className={textareaClass}
                  />
                </Field>
                {q.concept !== undefined && (
                  <Field label="Concept tag (optional)" className="mt-3">
                    <input
                      type="text"
                      value={q.concept ?? ""}
                      onChange={(e) => {
                        const quiz = [...content.quiz];
                        quiz[qi] = {
                          ...quiz[qi],
                          concept: e.target.value || undefined,
                        };
                        updateContent({ quiz });
                      }}
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {saved && (
        <p className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-800">
          Changes saved successfully.
        </p>
      )}

      <div className="sticky bottom-4 mt-8 flex flex-wrap gap-3 rounded-2xl border border-border/60 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
        <Button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="btn-gradient h-11 flex-1 rounded-xl border-0 font-semibold sm:flex-none sm:px-8"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => router.push(`/courses/${slug}`)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-border/80 bg-white px-3 text-sm font-medium outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const textareaClass =
  "w-full rounded-xl border border-border/80 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
