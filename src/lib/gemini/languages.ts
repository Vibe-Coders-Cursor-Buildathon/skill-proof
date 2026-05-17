/** Shared language code -> human name map used by Gemini prompts. */
export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  hi: "Hindi",
  ar: "Arabic",
};

export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? code;
}
