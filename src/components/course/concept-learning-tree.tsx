"use client";

import { useState } from "react";
import { Brain, Check, Sparkles, Sprout } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Concept } from "@/types/course";

const NODE_ACCENTS = [
  { ring: "ring-indigo-400", bg: "bg-indigo-600", leaf: "border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white" },
  { ring: "ring-violet-400", bg: "bg-violet-600", leaf: "border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white" },
  { ring: "ring-sky-400", bg: "bg-sky-600", leaf: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-white" },
  { ring: "ring-emerald-400", bg: "bg-emerald-600", leaf: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white" },
  { ring: "ring-amber-400", bg: "bg-amber-600", leaf: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white" },
  { ring: "ring-pink-400", bg: "bg-pink-600", leaf: "border-pink-200/80 bg-gradient-to-br from-pink-50/90 to-white" },
  { ring: "ring-teal-400", bg: "bg-teal-600", leaf: "border-teal-200/80 bg-gradient-to-br from-teal-50/90 to-white" },
  { ring: "ring-orange-400", bg: "bg-orange-600", leaf: "border-orange-200/80 bg-gradient-to-br from-orange-50/90 to-white" },
];

type ConceptLearningTreeProps = {
  concepts: Concept[];
  mastered: Set<number>;
  onToggleMastered: (index: number) => void;
};

export function ConceptLearningTree({
  concepts,
  mastered,
  onToggleMastered,
}: ConceptLearningTreeProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = concepts[selectedIndex];
  const accent = NODE_ACCENTS[selectedIndex % NODE_ACCENTS.length];

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-border/40 bg-gradient-to-r from-indigo-50/80 via-violet-50/50 to-transparent px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Brain className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold">Knowledge tree</h3>
              <p className="text-xs text-muted-foreground">
                Follow the path — tap each branch to grow
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/60">
            {mastered.size}/{concepts.length} mastered
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Tree spine */}
        <div className="relative border-b border-border/40 px-4 py-6 sm:px-6 lg:border-b-0 lg:border-r">
          {/* Root */}
          <div className="relative mb-2 flex items-center gap-3 pl-1">
            <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Sprout className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-indigo-600">
                Start
              </p>
              <p className="text-sm font-semibold text-foreground">Learning path</p>
            </div>
          </div>

          {/* Trunk line */}
          <div
            className="absolute left-[1.35rem] top-14 bottom-6 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 via-violet-400 to-fuchsia-300 sm:left-[1.6rem]"
            aria-hidden
          />

          <ul className="relative space-y-1 pt-2">
            {concepts.map((concept, i) => {
              const nodeAccent = NODE_ACCENTS[i % NODE_ACCENTS.length];
              const isSelected = selectedIndex === i;
              const isMastered = mastered.has(i);
              const isLast = i === concepts.length - 1;

              return (
                <li key={i} className="relative">
                  {i > 0 && (
                    <svg
                      className="pointer-events-none absolute left-[1.35rem] -top-1 h-8 w-8 -translate-x-1/2 text-violet-300/70 sm:left-[1.6rem]"
                      viewBox="0 0 32 32"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M16 0 V12 Q16 20 24 28"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className={cn(
                          isMastered && "text-emerald-400",
                          isSelected && !isMastered && "text-indigo-400",
                        )}
                      />
                    </svg>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    className={cn(
                      "group relative flex w-full items-start gap-3 rounded-2xl py-3 pl-1 pr-2 text-left transition-all",
                      isSelected && "bg-white/60",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-all",
                        nodeAccent.bg,
                        isSelected && `ring-4 ring-offset-2 ring-offset-background ${nodeAccent.ring}`,
                        isMastered && "bg-emerald-500 ring-emerald-300",
                      )}
                    >
                      {isMastered ? (
                        <Check className="size-4" strokeWidth={3} />
                      ) : (
                        i + 1
                      )}
                    </span>

                    <span className="min-w-0 flex-1 pt-1.5">
                      <span
                        className={cn(
                          "line-clamp-2 text-sm font-semibold leading-snug transition-colors",
                          isSelected
                            ? "text-indigo-700"
                            : "text-foreground group-hover:text-primary",
                        )}
                      >
                        {concept.title}
                      </span>
                      {!isLast && (
                        <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                          Branch {i + 1} of {concepts.length}
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <Sparkles className="mt-2 size-4 shrink-0 animate-pulse text-indigo-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detail leaf */}
        <div className="flex flex-col p-5 sm:p-6">
          <div
            className={cn(
              "flex flex-1 flex-col rounded-2xl border-2 p-5 shadow-sm transition-all sm:p-6",
              accent.leaf,
            )}
          >
            <div className="mb-4 flex items-start gap-3">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white",
                  mastered.has(selectedIndex) ? "bg-emerald-500" : accent.bg,
                )}
              >
                {mastered.has(selectedIndex) ? (
                  <Check className="size-5" strokeWidth={3} />
                ) : (
                  selectedIndex + 1
                )}
              </span>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Concept {selectedIndex + 1}
                </p>
                <h4 className="mt-0.5 text-lg font-bold leading-snug">
                  {selected.title}
                </h4>
              </div>
            </div>

            <p className="flex-1 text-sm leading-relaxed text-foreground/85">
              {selected.explanation}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleMastered(selectedIndex)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  mastered.has(selectedIndex)
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "btn-gradient border-0",
                )}
              >
                <Check className="size-4" />
                {mastered.has(selectedIndex) ? "Mastered" : "Mark as understood"}
              </button>

              {selectedIndex < concepts.length - 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedIndex(selectedIndex + 1)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Next concept →
                </button>
              )}
            </div>
          </div>

          {/* Mini map dots */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {concepts.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                aria-label={`Go to concept ${i + 1}`}
                className={cn(
                  "size-2.5 rounded-full transition-all",
                  i === selectedIndex && "w-6 bg-primary",
                  i !== selectedIndex && mastered.has(i) && "bg-emerald-400",
                  i !== selectedIndex &&
                    !mastered.has(i) &&
                    "bg-muted hover:bg-indigo-300",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
