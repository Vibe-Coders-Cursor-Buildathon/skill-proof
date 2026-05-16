"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Brain,
  Loader2,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { WeakAreasCard } from "@/components/course/weak-areas-card";
import { cn } from "@/lib/utils";
import {
  buildMissedQuestions,
  collectWrongConcepts,
} from "@/lib/quiz/infer-concept";
import type { Concept, QuizQuestion } from "@/types/course";
import type { AdaptiveQuizMode } from "@/lib/prompts/adaptive-quiz";
import type { KnowledgeGapReport } from "@/types/quiz";

type QuizPanelProps = {
  initialQuestions: QuizQuestion[];
  concepts: Concept[];
  courseTitle: string;
  courseSummary: string;
  language: string;
  difficulty: string;
};

type AnswerRecord = { index: number; selected: number };

export function QuizPanel({
  initialQuestions,
  concepts,
  courseTitle,
  courseSummary,
  language,
  difficulty,
}: QuizPanelProps) {
  const [round, setRound] = useState<"main" | "adaptive">("main");
  const [questions, setQuestions] = useState(initialQuestions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<
    "in_progress" | "main_results" | "adaptive_results"
  >("in_progress");

  const [mainPercent, setMainPercent] = useState(0);
  const [adaptiveMode, setAdaptiveMode] = useState<AdaptiveQuizMode | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [weakAreas, setWeakAreas] = useState<KnowledgeGapReport | null>(null);
  const [weakAreasLoading, setWeakAreasLoading] = useState(false);
  const [weakAreasError, setWeakAreasError] = useState<string | null>(null);
  const mainAnswersRef = useRef<AnswerRecord[]>([]);

  const question = questions[index];
  const letters = ["A", "B", "C", "D"];

  const resetQuestionState = useCallback(() => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setAnswers([]);
    setPhase("in_progress");
    setGenerateError(null);
  }, []);

  const resetFullQuiz = useCallback(() => {
    setRound("main");
    setQuestions(initialQuestions);
    setAdaptiveMode(null);
    resetQuestionState();
    setMainPercent(0);
    setWeakAreas(null);
    setWeakAreasError(null);
    mainAnswersRef.current = [];
  }, [initialQuestions, resetQuestionState]);

  const fetchWeakAreas = useCallback(
    async (mainAnswers: AnswerRecord[], percent: number) => {
      const wrongConcepts = collectWrongConcepts(
        initialQuestions,
        mainAnswers,
        concepts,
      );
      if (wrongConcepts.length === 0) {
        setWeakAreas({ weakAreas: [] });
        return;
      }

      setWeakAreasLoading(true);
      setWeakAreasError(null);

      try {
        const res = await fetch("/api/quiz/knowledge-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: percent,
            wrongConcepts,
            courseTitle,
            courseSummary,
            concepts: concepts.map((c) => ({
              title: c.title,
              explanation: c.explanation,
            })),
            missedQuestions: buildMissedQuestions(
              initialQuestions,
              mainAnswers,
              concepts,
            ),
            language,
            difficulty,
          }),
        });

        const data = (await res.json()) as KnowledgeGapReport & {
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error ?? "Could not analyse weak areas");
        }

        setWeakAreas({ weakAreas: data.weakAreas ?? [] });
      } catch (err) {
        setWeakAreasError(
          err instanceof Error ? err.message : "Analysis failed",
        );
      } finally {
        setWeakAreasLoading(false);
      }
    },
    [
      initialQuestions,
      concepts,
      courseTitle,
      courseSummary,
      language,
      difficulty,
    ],
  );

  useEffect(() => {
    if (phase !== "main_results") return;
    const mainAnswers = mainAnswersRef.current;
    if (mainAnswers.length === 0) return;
    if (weakAreas || weakAreasLoading || weakAreasError) return;

    void fetchWeakAreas(mainAnswers, mainPercent);
  }, [
    phase,
    mainPercent,
    weakAreas,
    weakAreasLoading,
    weakAreasError,
    fetchWeakAreas,
  ]);

  const startAdaptiveRound = async (mode: AdaptiveQuizMode) => {
    setIsGenerating(true);
    setGenerateError(null);

    const wrongConcepts = collectWrongConcepts(
      initialQuestions,
      answers,
      concepts,
    );

    const missedQuestions = buildMissedQuestions(
      initialQuestions,
      mainAnswersRef.current,
      concepts,
    );

    try {
      const res = await fetch("/api/quiz/adaptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          score: mainPercent,
          wrongConcepts,
          courseTitle,
          courseSummary,
          concepts: concepts.map((c) => ({
            title: c.title,
            explanation: c.explanation,
          })),
          missedQuestions,
          language,
          difficulty,
        }),
      });

      const data = (await res.json()) as {
        questions?: QuizQuestion[];
        error?: string;
      };

      if (!res.ok || !data.questions?.length) {
        throw new Error(data.error ?? "Could not generate follow-up questions");
      }

      setAdaptiveMode(mode);
      setRound("adaptive");
      setQuestions(data.questions);
      resetQuestionState();
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Generation failed",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (optionIndex: number) => {
    if (revealed || !question) return;
    setSelected(optionIndex);
    setRevealed(true);
    setAnswers((prev) => [...prev, { index, selected: optionIndex }]);
    if (optionIndex === question.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else if (round === "main") {
      const percent = Math.round((score / questions.length) * 100);
      mainAnswersRef.current = [...answers];
      setMainPercent(percent);
      setWeakAreas(null);
      setWeakAreasError(null);
      setPhase("main_results");
    } else {
      setPhase("adaptive_results");
    }
  };

  const percent = Math.round((score / questions.length) * 100);
  const wrongConcepts = collectWrongConcepts(
    round === "main" ? initialQuestions : questions,
    answers,
    concepts,
  );
  const mainWrongConcepts = collectWrongConcepts(
    initialQuestions,
    mainAnswersRef.current,
    concepts,
  );

  if (phase === "main_results") {
    const needsRemedial = mainPercent < 60;
    const needsChallenge = mainPercent > 85;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass-card p-8 text-center">
        <Trophy
          className={cn(
            "mx-auto size-16",
            mainPercent >= 70 ? "text-amber-500" : "text-muted-foreground",
          )}
        />
        <h2 className="mt-4 text-2xl font-bold">Quiz complete!</h2>
        <p className="mt-2 text-muted-foreground">{courseTitle}</p>
        <p className="mt-6 text-5xl font-bold text-gradient">{mainPercent}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {score} of {questions.length} correct
        </p>

        {needsRemedial && (
          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-left text-sm text-amber-950">
            <p className="flex items-center gap-2 font-semibold">
              <Target className="size-4 shrink-0" />
              Practice weak areas
            </p>
            <p className="mt-2 leading-relaxed">
              Score below 60% — Gemini will generate{" "}
              <strong>3 easier follow-up questions</strong> on concepts you
              missed
              {mainWrongConcepts.length > 0 && (
                <>
                  :{" "}
                  <span className="font-medium">
                    {mainWrongConcepts.slice(0, 4).join(", ")}
                  </span>
                </>
              )}
              .
            </p>
          </div>
        )}

        {needsChallenge && (
          <div className="mt-6 rounded-2xl border border-violet-200/80 bg-violet-50/90 px-4 py-4 text-left text-sm text-violet-950">
            <p className="flex items-center gap-2 font-semibold">
              <Zap className="size-4 shrink-0" />
              Challenge round unlocked
            </p>
            <p className="mt-2 leading-relaxed">
              Score above 85% — Gemini will generate{" "}
              <strong>3 harder challenge questions</strong> to push your
              understanding further.
            </p>
          </div>
        )}

        {!needsRemedial && !needsChallenge && (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Solid work! Review flashcards or retry to aim for a challenge round
            (85%+).
          </p>
        )}

        {generateError && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {generateError}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {needsRemedial && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => void startAdaptiveRound("remedial")}
              className="btn-gradient inline-flex items-center justify-center gap-2 rounded-2xl border-0 px-5 py-2.5 text-sm font-semibold"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Brain className="size-4" />
              )}
              Start practice round
            </button>
          )}
          {needsChallenge && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => void startAdaptiveRound("challenge")}
              className="btn-gradient inline-flex items-center justify-center gap-2 rounded-2xl border-0 px-5 py-2.5 text-sm font-semibold"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Take challenge round
            </button>
          )}
          <button
            type="button"
            onClick={resetFullQuiz}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/50"
          >
            <RotateCcw className="size-4" />
            Retry full quiz
          </button>
        </div>
        </div>

        {(mainWrongConcepts.length > 0 || weakAreasLoading) && (
          <WeakAreasCard
            report={weakAreas}
            isLoading={weakAreasLoading}
            error={weakAreasError}
          />
        )}
      </div>
    );
  }

  if (phase === "adaptive_results") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass-card p-8 text-center">
        <Trophy className="mx-auto size-16 text-indigo-500" />
        <h2 className="mt-4 text-2xl font-bold">
          {adaptiveMode === "remedial" ? "Practice complete!" : "Challenge complete!"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {adaptiveMode === "remedial"
            ? "Follow-up on weak concepts"
            : "Bonus challenge round"}
        </p>
        <p className="mt-6 text-5xl font-bold text-gradient">{percent}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {score} of {questions.length} correct in this round
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Main quiz score: {mainPercent}%
        </p>
        <button
          type="button"
          onClick={resetFullQuiz}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/50"
        >
          <RotateCcw className="size-4" />
          Retry full quiz
        </button>
        </div>

        {(mainWrongConcepts.length > 0 || weakAreasLoading) && (
          <WeakAreasCard
            report={weakAreas}
            isLoading={weakAreasLoading}
            error={weakAreasError}
          />
        )}
      </div>
    );
  }

  if (!question) return null;

  const roundLabel =
    round === "adaptive"
      ? adaptiveMode === "remedial"
        ? "Practice round"
        : "Challenge round"
      : "Quiz";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold">
          {roundLabel} · Question {index + 1} / {questions.length}
        </span>
        <span className="text-muted-foreground">Score: {score}</span>
      </div>
      {round === "adaptive" && (
        <p className="rounded-xl bg-indigo-50/80 px-3 py-2 text-xs font-medium text-indigo-800">
          {adaptiveMode === "remedial"
            ? "Adaptive · easier questions on weak concepts (AI-generated)"
            : "Adaptive · harder challenge questions (AI-generated)"}
        </p>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
          style={{
            width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="glass-card p-6 sm:p-8">
        {question.concept && (
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-indigo-600">
            {question.concept}
          </p>
        )}
        <p className="text-lg font-semibold leading-relaxed tracking-tight [word-spacing:0.03em] sm:text-xl sm:leading-snug">
          {question.question}
        </p>
        <ul className="mt-6 space-y-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correct;
            let style =
              "border-border/80 bg-white hover:border-indigo-200 hover:bg-indigo-50/50";
            if (revealed) {
              if (isCorrect) style = "border-emerald-300 bg-emerald-50";
              else if (isSelected && !isCorrect)
                style = "border-red-200 bg-red-50";
              else style = "border-border/60 bg-muted/30 opacity-60";
            } else if (isSelected) {
              style = "border-indigo-300 bg-indigo-50";
            }

            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all sm:text-base",
                    style,
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                    {letters[i]}
                  </span>
                  {option}
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div
            className={cn(
              "mt-6 rounded-xl border p-4 text-sm leading-relaxed sm:text-base sm:leading-relaxed",
              selected === question.correct
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900",
            )}
          >
            <p className="font-semibold">
              {selected === question.correct ? "Correct!" : "Not quite"}
            </p>
            <p className="mt-1">{question.explanation}</p>
          </div>
        )}

        {revealed && (
          <button
            type="button"
            onClick={handleNext}
            className="btn-gradient mt-6 w-full rounded-2xl py-3 text-sm font-semibold"
          >
            {index < questions.length - 1 ? "Next question" : "See results"}
          </button>
        )}
      </div>
    </div>
  );
}
