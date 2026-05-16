"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { UploadFormPayload } from "@/types/upload";
import type { YouTubeTranscriptResponse } from "@/types/youtube";

export type GenerationStepId =
  | "preparing"
  | "extracting"
  | "structuring"
  | "done";

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
  transcriptResult: YouTubeTranscriptResponse | null;
  startGeneration: (payload: UploadFormPayload) => void;
  closeGeneration: () => void;
};

const GenerationContext = createContext<GenerationContextValue | null>(null);

const INITIAL_STEPS: GenerationStep[] = [
  { id: "preparing", label: "Preparing your course", status: "pending" },
  { id: "extracting", label: "Extracting transcript from YouTube video", status: "pending" },
  { id: "structuring", label: "Structuring course content", status: "pending" },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<UploadFormPayload | null>(null);
  const [transcriptResult, setTranscriptResult] =
    useState<YouTubeTranscriptResponse | null>(null);

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
    setTranscriptResult(null);
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
        setStepStatus("preparing", "active");
        await delay(600);
        setStepStatus("preparing", "done");

        if (data.sourceType === "youtube" && data.url) {
          setStepStatus("extracting", "active");

          const res = await fetch("/api/content/youtube", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: data.url, language: data.language }),
          });

          const json = await res.json();

          if (!res.ok) {
            throw new Error(json.error ?? "Failed to extract transcript");
          }

          const result = json as YouTubeTranscriptResponse;
          setTranscriptResult(result);

          try {
            sessionStorage.setItem(
              "skillproof_last_transcript",
              JSON.stringify({
                ...result,
                sourceUrl: data.url,
                language: data.language,
                difficulty: data.difficulty,
                savedAt: new Date().toISOString(),
              }),
            );
          } catch {
            // ignore
          }

          setStepStatus("extracting", "done");
        } else {
          setStepStatus("extracting", "done");
        }

        setStepStatus("structuring", "active");
        await delay(800);
        setStepStatus("structuring", "done");

        await delay(500);
        setIsOpen(false);
        router.push("/dashboard");
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
        transcriptResult,
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
