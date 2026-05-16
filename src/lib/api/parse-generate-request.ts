import { z } from "zod";

import { difficultySchema, sourceTypeSchema } from "@/types/course";

const generateFieldsSchema = z.object({
  sourceType: sourceTypeSchema,
  language: z.string().min(2).max(10).default("en"),
  difficulty: difficultySchema.default("beginner"),
  url: z.string().url().optional(),
});

export type ParsedGenerateRequest = z.infer<typeof generateFieldsSchema> & {
  file?: File;
};

export async function parseGenerateRequest(
  request: Request,
): Promise<
  | { ok: true; data: ParsedGenerateRequest }
  | { ok: false; error: string; details?: unknown }
> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const sourceTypeRaw = form.get("sourceType");
    const languageRaw = form.get("language");
    const difficultyRaw = form.get("difficulty");
    const urlRaw = form.get("url");
    const fileRaw = form.get("file");

    const parsed = generateFieldsSchema.safeParse({
      sourceType: typeof sourceTypeRaw === "string" ? sourceTypeRaw : undefined,
      language: typeof languageRaw === "string" ? languageRaw : "en",
      difficulty: typeof difficultyRaw === "string" ? difficultyRaw : "beginner",
      url:
        typeof urlRaw === "string" && urlRaw.trim() !== ""
          ? urlRaw.trim()
          : undefined,
    });

    if (!parsed.success) {
      return {
        ok: false,
        error: "Invalid request",
        details: parsed.error.flatten(),
      };
    }

    const file = fileRaw instanceof File && fileRaw.size > 0 ? fileRaw : undefined;

    if (
      (parsed.data.sourceType === "pdf" || parsed.data.sourceType === "audio") &&
      !file &&
      !parsed.data.url
    ) {
      return {
        ok: false,
        error:
          parsed.data.sourceType === "pdf"
            ? "PDF file is required."
            : "Audio file or URL is required.",
      };
    }

    return { ok: true, data: { ...parsed.data, file } };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }

  const parsed = generateFieldsSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid request",
      details: parsed.error.flatten(),
    };
  }

  if (
    (parsed.data.sourceType === "youtube" ||
      parsed.data.sourceType === "article" ||
      parsed.data.sourceType === "audio") &&
    !parsed.data.url
  ) {
    const labels: Record<string, string> = {
      youtube: "YouTube URL is required.",
      article: "Article URL is required.",
      audio: "Audio URL is required.",
    };
    return {
      ok: false,
      error: labels[parsed.data.sourceType] ?? "URL is required.",
    };
  }

  return { ok: true, data: parsed.data };
}
