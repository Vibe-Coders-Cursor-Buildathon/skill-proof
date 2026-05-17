"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  Lightbulb,
  Pencil,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { CertificateEarnFlow } from "@/components/certificate/certificate-earn-flow";
import { CERTIFICATE_PASS_PERCENT } from "@/lib/certificates/constants";
import { getQuizPassForCourse } from "@/lib/certificates/quiz-pass-storage";
import { ConceptLearningTree } from "@/components/course/concept-learning-tree";
import { CourseUnlockPanel } from "@/components/course/course-unlock-panel";
import { PublishCoursePanel } from "@/components/course/publish-course-panel";
import { QuizPanel } from "@/components/course/quiz-panel";
import { formatPriceCents } from "@/config/pricing";
import { computeCourseProgressPercent } from "@/lib/courses/course-progress";
import {
  loadCourseProgress,
  saveCourseProgress,
} from "@/lib/courses/course-progress-storage";
import type { PublishStatus } from "@/lib/courses/publish-status";

import { cn } from "@/lib/utils";
import type { CourseContent, Flashcard } from "@/types/course";

type StudyTab = "learn" | "flashcards" | "quiz";

type CourseMeta = {
  slug: string;
  difficulty: string;
  language: string;
  sourceType: string;
};

type CourseStudyViewProps = {
  /** Content shown in tabs (preview slice or full). */
  course: CourseContent;
  /** Full content for unlock totals and post-purchase. */
  fullCourse?: CourseContent;
  meta: CourseMeta;
  canEdit?: boolean;
  hasEditedVersion?: boolean;
  canPublish?: boolean;
  publishStatus?: PublishStatus;
  publishSlotsUsed?: number;
  publishSlotsMax?: number;
  publishRejectionReason?: string | null;
  currentPriceCents?: number | null;
  hasFullAccess?: boolean;
  isPaidPublic?: boolean;
  priceCents?: number | null;
  isSignedIn?: boolean;
  purchaseSuccess?: boolean;
  certificatesEnabled?: boolean;
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  beginner: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Beginner" },
  intermediate: { bg: "bg-amber-100", text: "text-amber-700", label: "Intermediate" },
  expert: { bg: "bg-red-100", text: "text-red-700", label: "Expert" },
};

const TABS: { id: StudyTab; label: string; icon: typeof BookOpen }[] = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: Lightbulb },
];

export function CourseStudyView({
  course,
  fullCourse,
  meta,
  canEdit = false,
  hasEditedVersion = false,
  canPublish = false,
  publishStatus = "draft",
  publishSlotsUsed = 0,
  publishSlotsMax = 0,
  publishRejectionReason = null,
  currentPriceCents = null,
  hasFullAccess = true,
  isPaidPublic = false,
  priceCents = null,
  isSignedIn = false,
  purchaseSuccess = false,
  certificatesEnabled = false,
}: CourseStudyViewProps) {
  const totals = fullCourse ?? course;
  const showPreviewGate = isPaidPublic && !hasFullAccess;
  const [activeTab, setActiveTab] = useState<StudyTab>("learn");
  const [masteredConcepts, setMasteredConcepts] = useState<Set<number>>(() => {
    const stored = loadCourseProgress(meta.slug);
    return new Set(stored.masteredConcepts);
  });
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(() => {
    const stored = loadCourseProgress(meta.slug);
    return new Set(stored.knownFlashcards);
  });
  const [quizScorePercent, setQuizScorePercent] = useState<number | null>(() =>
    getQuizPassForCourse(meta.slug),
  );

  useEffect(() => {
    saveCourseProgress(meta.slug, {
      masteredConcepts: [...masteredConcepts],
      knownFlashcards: [...knownCards],
    });
  }, [meta.slug, masteredConcepts, knownCards]);

  useEffect(() => {
    setQuizScorePercent(getQuizPassForCourse(meta.slug));
  }, [meta.slug, activeTab]);

  const difficulty =
    DIFFICULTY_STYLES[meta.difficulty] ?? DIFFICULTY_STYLES.beginner;

  const learnProgress =
    course.concepts.length > 0
      ? Math.round((masteredConcepts.size / course.concepts.length) * 100)
      : 0;
  const flashProgress =
    course.flashcards.length > 0
      ? Math.round((knownCards.size / course.flashcards.length) * 100)
      : 0;

  const quizPassed =
    quizScorePercent != null &&
    quizScorePercent >= CERTIFICATE_PASS_PERCENT;
  const overallProgress = computeCourseProgressPercent({
    masteredConcepts: masteredConcepts.size,
    totalConcepts: course.concepts.length,
    knownFlashcards: knownCards.size,
    totalFlashcards: course.flashcards.length,
    quizPassed: quizScorePercent != null ? quizPassed : undefined,
  });

  const toggleMastered = useCallback((index: number) => {
    setMasteredConcepts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/dashboard?tab=courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* Hero */}
      <div className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  difficulty.bg,
                  difficulty.text,
                )}
              >
                {difficulty.label}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
                {meta.language}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                {meta.sourceType}
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              {totals.title}
            </h1>
            {isPaidPublic && priceCents != null && priceCents > 0 && (
              <p className="mt-2 text-sm font-semibold text-indigo-700">
                {hasFullAccess
                  ? "You have full access"
                  : `${formatPriceCents(priceCents)} · preview available`}
              </p>
            )}
            {purchaseSuccess && hasFullAccess && (
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                Purchase complete — enjoy the full course!
              </p>
            )}
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:line-clamp-none">
              {course.summary}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            {canEdit && (
              <Link
                href={`/courses/${meta.slug}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                <Pencil className="size-4" />
                Edit course
              </Link>
            )}
            <ProgressRing value={overallProgress} />
            {hasEditedVersion && (
              <span className="text-[0.65rem] font-medium text-muted-foreground">
                Custom edits applied
              </span>
            )}
          </div>
        </div>

        {/* Study mode tabs */}
        <div className="relative mt-6 flex gap-1 rounded-2xl border border-border/50 bg-muted/40 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {certificatesEnabled && hasFullAccess && !showPreviewGate && (
        <CertificateEarnFlow
          courseSlug={meta.slug}
          courseTitle={totals.title}
          courseProgressPercent={overallProgress}
          masteredConcepts={masteredConcepts.size}
          knownFlashcards={knownCards.size}
          quizScorePercent={quizScorePercent}
          isSignedIn={isSignedIn}
        />
      )}

      {canPublish && publishSlotsMax > 0 && (
        <div className="mt-6">
          <PublishCoursePanel
            slug={meta.slug}
            publishStatus={publishStatus}
            publishSlotsUsed={publishSlotsUsed}
            publishSlotsMax={publishSlotsMax}
            rejectionReason={publishRejectionReason}
            currentPriceCents={currentPriceCents}
          />
        </div>
      )}

      {showPreviewGate && priceCents != null && (
        <div className="mt-6">
          <CourseUnlockPanel
            slug={meta.slug}
            priceCents={priceCents}
            totalConcepts={totals.concepts.length}
            totalFlashcards={totals.flashcards.length}
            totalQuiz={totals.quiz.length}
            isSignedIn={isSignedIn}
          />
        </div>
      )}

      {/* Tab panels */}
      <div className="mt-6">
        {activeTab === "learn" && (
          <LearnPanel
            course={course}
            mastered={masteredConcepts}
            onToggleMastered={toggleMastered}
            progress={learnProgress}
            onStartFlashcards={() => setActiveTab("flashcards")}
          />
        )}
        {activeTab === "flashcards" && (
          <FlashcardsPanel
            flashcards={course.flashcards}
            index={flashcardIndex}
            flipped={flashcardFlipped}
            known={knownCards}
            onFlip={() => setFlashcardFlipped((f) => !f)}
            onPrev={() => {
              setFlashcardFlipped(false);
              setFlashcardIndex((i) => Math.max(0, i - 1));
            }}
            onNext={() => {
              setFlashcardFlipped(false);
              setFlashcardIndex((i) =>
                Math.min(course.flashcards.length - 1, i + 1),
              );
            }}
            onMarkKnown={() => {
              setKnownCards((prev) => new Set(prev).add(flashcardIndex));
              if (flashcardIndex < course.flashcards.length - 1) {
                setFlashcardFlipped(false);
                setFlashcardIndex((i) => i + 1);
              }
            }}
            onStartQuiz={() => setActiveTab("quiz")}
          />
        )}
        {activeTab === "quiz" && (
          <QuizPanel
            initialQuestions={course.quiz}
            concepts={course.concepts}
            courseTitle={totals.title}
            courseSummary={totals.summary}
            language={meta.language}
            difficulty={meta.difficulty}
            previewMode={showPreviewGate}
            courseSlug={meta.slug}
            certificatesEnabled={certificatesEnabled && !showPreviewGate}
            isSignedIn={isSignedIn}
            courseProgressPercent={overallProgress}
            masteredConcepts={masteredConcepts.size}
            knownFlashcards={knownCards.size}
            onQuizPassed={(percent) => {
              setQuizScorePercent(percent);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="relative size-24">
        <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/60"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="url(#progressGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.52 0.22 275)" />
              <stop offset="100%" stopColor="oklch(0.55 0.2 300)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value}%</span>
          <span className="text-[0.65rem] font-medium text-muted-foreground">
            progress
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        Keep going!
      </span>
    </div>
  );
}

function LearnPanel({
  course,
  mastered,
  onToggleMastered,
  progress,
  onStartFlashcards,
}: {
  course: CourseContent;
  mastered: Set<number>;
  onToggleMastered: (i: number) => void;
  progress: number;
  onStartFlashcards: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Course overview
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {mastered.size}/{course.concepts.length} concepts mastered
          </span>
        </div>
        <p className="text-[1.0625rem] leading-[1.75] tracking-[0.01em] text-foreground/90 [word-spacing:0.04em] sm:text-lg sm:leading-[1.8]">
          {course.summary}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ConceptLearningTree
        concepts={course.concepts}
        mastered={mastered}
        onToggleMastered={onToggleMastered}
      />

      {progress >= 50 && (
        <div className="glass-card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100">
            <Layers className="size-7 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold">Ready for flashcards?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reinforce what you learned with {course.flashcards.length} quick
              recall cards.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartFlashcards}
            className="btn-gradient shrink-0 rounded-2xl px-5 py-2.5 text-sm font-semibold"
          >
            Start flashcards
          </button>
        </div>
      )}
    </div>
  );
}

function FlashcardsPanel({
  flashcards,
  index,
  flipped,
  known,
  onFlip,
  onPrev,
  onNext,
  onMarkKnown,
  onStartQuiz,
}: {
  flashcards: Flashcard[];
  index: number;
  flipped: boolean;
  known: Set<number>;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onMarkKnown: () => void;
  onStartQuiz: () => void;
}) {
  const card = flashcards[index];
  const progress = Math.round(((index + 1) / flashcards.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Card {index + 1} of {flashcards.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {known.size} marked as known
          </p>
        </div>
        <div className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onFlip}
        className="group mx-auto block w-full max-w-lg perspective-[1200px]"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <div
          className={cn(
            "relative min-h-[220px] w-full transition-transform duration-500 transform-3d",
            flipped && "[transform:rotateY(180deg)]",
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="glass-card absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="mb-3 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
              Question
            </span>
            <p className="text-lg font-semibold leading-relaxed tracking-tight [word-spacing:0.03em] sm:text-xl sm:leading-snug">
              {card.question}
            </p>
            <p className="mt-6 text-xs text-muted-foreground group-hover:text-primary">
              Tap to reveal answer
            </p>
          </div>
          <div
            className="glass-card absolute inset-0 flex flex-col items-center justify-center border-2 border-violet-200/80 bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="mb-3 rounded-full bg-violet-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-800">
              Answer
            </span>
            <p className="text-lg font-semibold leading-relaxed tracking-tight text-violet-950 [word-spacing:0.03em] sm:text-xl sm:leading-snug">
              {card.answer}
            </p>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => {
            onFlip();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold"
        >
          <RotateCcw className="size-4" />
          Flip
        </button>
        <button
          type="button"
          onClick={onMarkKnown}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Check className="size-4" />
          Got it
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={index >= flashcards.length - 1}
          className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex justify-center gap-1.5">
        {flashcards.map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-2 rounded-full transition-all",
              i === index
                ? "w-6 bg-primary"
                : known.has(i)
                  ? "bg-emerald-400"
                  : "bg-muted",
            )}
          />
        ))}
      </div>

      {known.size >= flashcards.length * 0.5 && (
        <div className="glass-card flex flex-col items-center gap-3 p-5 text-center sm:flex-row">
          <GraduationCap className="size-8 text-amber-500 sm:mx-2" />
          <p className="flex-1 text-sm">
            <span className="font-semibold">Nice recall!</span> Test yourself
            with the adaptive quiz.
          </p>
          <button
            type="button"
            onClick={onStartQuiz}
            className="btn-gradient rounded-2xl px-5 py-2 text-sm font-semibold"
          >
            Take quiz
          </button>
        </div>
      )}
    </div>
  );
}

