import type { GenerationStep } from "@/types/generation";
import type { SourceType } from "@/types/upload";

const EXTRACTING_LABELS: Record<SourceType, string> = {
  youtube: "Extracting transcript from video",
  article: "Extracting article text",
  pdf: "Reading your PDF",
  audio: "Transcribing audio",
};

const SUBTITLE_LABELS: Record<SourceType, string> = {
  youtube: "Hang tight — we're pulling content from your video",
  article: "Fetching and reading your article",
  pdf: "Extracting text from your document",
  audio: "Transcribing your audio, then building your course",
};

export function buildGenerationSteps(sourceType: SourceType): GenerationStep[] {
  return [
    { id: "preparing", label: "Preparing your course", status: "pending" },
    {
      id: "extracting",
      label: EXTRACTING_LABELS[sourceType],
      status: "pending",
    },
    {
      id: "generating",
      label: "Generating course with Gemini AI",
      status: "pending",
    },
    { id: "saving", label: "Saving your course", status: "pending" },
  ];
}

export function getGenerationSubtitle(sourceType: SourceType): string {
  return SUBTITLE_LABELS[sourceType];
}
