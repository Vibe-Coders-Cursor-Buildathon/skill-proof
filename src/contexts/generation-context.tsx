"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { buildGenerationSteps } from "@/lib/content/generation-labels";
import type { UploadFormPayload } from "@/types/upload";
import type { GenerationStep, GenerationStepId } from "@/types/generation";
import { useAuth } from "@/contexts/auth-context";

export type { GenerationStep, GenerationStepId } from "@/types/generation";

type GenerationContextValue = {
  isOpen: boolean;
  steps: GenerationStep[];
  error: string | null;
  payload: UploadFormPayload | null;
  startGeneration: (payload: UploadFormPayload) => void;
  closeGeneration: () => void;
};

const GenerationContext = createContext<GenerationContextValue | null>(null);

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function submitGenerateRequest(data: UploadFormPayload): Promise<Response> {
  if (data.file) {
    const form = new FormData();
    form.append("sourceType", data.sourceType);
    form.append("language", data.language);
    form.append("difficulty", data.difficulty);
    form.append("file", data.file);
    if (data.url) {
      form.append("url", data.url);
    }
    return fetch("/api/courses/generate", {
      method: "POST",
      body: form,
    });
  }

  return fetch("/api/courses/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceType: data.sourceType,
      url: data.url,
      language: data.language,
      difficulty: data.difficulty,
    }),
  });
}

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { updateCredits } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
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

  const closeGeneration = useCallback(() => {
    setIsOpen(false);
    setSteps([]);
    setError(null);
    setPayload(null);
  }, []);

  const runPipeline = useCallback(
    async (data: UploadFormPayload) => {
      const initialSteps = buildGenerationSteps(data.sourceType);
      setSteps(initialSteps.map((s) => ({ ...s, status: "pending" as const })));
      setError(null);
      setIsOpen(true);
      setPayload(data);

      try {
        setStepStatus("preparing", "active");
        await delay(400);
        setStepStatus("preparing", "done");

        setStepStatus("extracting", "active");

        const res = await submitGenerateRequest(data);

        const json = (await res.json()) as {
          slug?: string;
          error?: string;
          creditsBalance?: number;
        };

        if (res.status === 402) {
          throw new Error(
            "You have no credits left. Please upgrade your plan to create more courses.",
          );
        }

        if (res.status === 429) {
          throw new Error(
            json.error ?? "Rate limit reached. Please wait a moment and try again.",
          );
        }

        if (!res.ok) {
          throw new Error(
            json.error ?? "Course generation failed. Please try again.",
          );
        }

        setStepStatus("extracting", "done");
        setStepStatus("generating", "active");

        if (typeof json.creditsBalance === "number") {
          updateCredits(json.creditsBalance);
        }

        setStepStatus("generating", "done");

        setStepStatus("saving", "active");
        await delay(400);
        setStepStatus("saving", "done");

        await delay(600);
        setIsOpen(false);
        setSteps([]);
        setPayload(null);

        if (json.slug) {
          router.push(`/courses/${json.slug}`);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
        setSteps((prev) =>
          prev.map((s) =>
            s.status === "active" ? { ...s, status: "error" as const } : s,
          ),
        );
      }
    },
    [router, setStepStatus, updateCredits],
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
