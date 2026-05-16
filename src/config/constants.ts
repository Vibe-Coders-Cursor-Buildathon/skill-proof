export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
] as const;

export const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const;

export const QUIZ_PASS_THRESHOLD = 70;
export const ADAPTIVE_EASY_THRESHOLD = 60;
export const ADAPTIVE_HARD_THRESHOLD = 85;
