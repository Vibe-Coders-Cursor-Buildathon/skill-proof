"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { UploadFormPayload } from "@/types/upload";
import { useAuth } from "@/contexts/auth-context";

export type GenerationStepId =
  | "preparing"
  | "extracting"
  | "generating"
  | "saving";

export type GenerationStep = {
  id: GenerationStepId;
  label: string;
  status: "pending" | "active" | "done" | "error";
};

type GenerationContextValue = {
  isOpen: boolean;
  steps: GenerationStep[];
  error: string | null;
  payload: UploadFormPayload | null;
  startGeneration: (payload: UploadFormPayload) => void;
  closeGeneration: () => void;
};

const GenerationContext = createContext<GenerationContextValue | null>(null);

const INITIAL_STEPS: GenerationStep[] = [
  { id: "preparing", label: "Preparing your course", status: "pending" },
  { id: "extracting", label: "Extracting transcript from video", status: "pending" },
  { id: "generating", label: "Generating course with Gemini AI", status: "pending" },
  { id: "saving", label: "Saving your course", status: "pending" },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { updateCredits } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<UploadFormPayload | null>(null);

  const setStepStatus = useCallback(
    (id: GenerationStepId, status: GenerationStep["status"]) => {
      setSteps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s)),
      );
    },
    [],
  );

  const resetSteps = useCallback(() => {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" as const })));
    setError(null);
  }, []);

  const closeGeneration = useCallback(() => {
    setIsOpen(false);
    resetSteps();
    setPayload(null);
  }, [resetSteps]);

  const runPipeline = useCallback(
    async (data: UploadFormPayload) => {
      resetSteps();
      setIsOpen(true);
      setPayload(data);

      try {
        // Step 1 — prepare
        setStepStatus("preparing", "active");
        await delay(400);
        setStepStatus("preparing", "done");

        // Step 2 — extract transcript (YouTube) or skip
        setStepStatus("extracting", "active");
        if (data.sourceType !== "youtube") {
          await delay(300);
        }
        // Actual extraction happens server-side in /api/courses/generate
        setStepStatus("extracting", "done");

        // Step 3 — generate with Gemini (real API call)
        setStepStatus("generating", "active");

        const res = await fetch("/api/courses/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceType: data.sourceType,
            url: data.url,
            language: data.language,
            difficulty: data.difficulty,
          }),
        });

        const json = await res.json() as { slug?: string; error?: string; creditsBalance?: number };

        if (res.status === 402) {
          throw new Error("You have no credits left. Please upgrade your plan to create more courses.");
        }

        if (res.status === 429) {
          throw new Error(json.error ?? "Rate limit reached. Please wait a moment and try again.");
        }

        if (!res.ok) {
          throw new Error(json.error ?? "Course generation failed. Please try again.");
        }

        // Update the credit chip in the header instantly
        if (typeof json.creditsBalance === "number") {
          updateCredits(json.creditsBalance);
        }

        setStepStatus("generating", "done");

        // Step 4 — saving
        setStepStatus("saving", "active");
        await delay(400);
        setStepStatus("saving", "done");

        await delay(600);
        // Fully reset before navigating so the button is never stuck on next visit
        setIsOpen(false);
        resetSteps();
        setPayload(null);

        // Navigate to the new course
        if (json.slug) {
          router.push(`/courses/${json.slug}`);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
        setSteps((prev) =>
          prev.map((s) =>
            s.status === "active" ? { ...s, status: "error" as const } : s,
          ),
        );
      }
    },
    [resetSteps, router, setStepStatus],
  );

  const startGeneration = useCallback(
    (data: UploadFormPayload) => {
      void runPipeline(data);
    },
    [runPipeline],
  );

  return (
    <GenerationContext.Provider
      value={{
        isOpen,
        steps,
        error,
        payload,
        startGeneration,
        closeGeneration,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration(): GenerationContextValue {
  const ctx = useContext(GenerationContext);
  if (!ctx) {
    throw new Error("useGeneration must be used inside <GenerationProvider>");
  }
  return ctx;
}
