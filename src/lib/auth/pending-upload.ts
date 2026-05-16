import type { UploadFormPayload } from "@/types/upload";

export const PENDING_UPLOAD_KEY = "skillproof_pending_upload";
export const WELCOME_FLAG_KEY = "skillproof_show_welcome";

/** Serializable upload draft (no File objects). */
export type PendingUploadDraft = {
  sourceType: UploadFormPayload["sourceType"];
  url?: string;
  language: string;
  difficulty: string;
  audioInputMode?: UploadFormPayload["audioInputMode"];
};

export function savePendingUpload(payload: UploadFormPayload) {
  if (typeof window === "undefined") return;

  const draft: PendingUploadDraft = {
    sourceType: payload.sourceType,
    language: payload.language,
    difficulty: payload.difficulty,
    ...(payload.audioInputMode ? { audioInputMode: payload.audioInputMode } : {}),
    ...(payload.url ? { url: payload.url } : {}),
  };

  try {
    sessionStorage.setItem(PENDING_UPLOAD_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function loadPendingUpload(): PendingUploadDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_UPLOAD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingUploadDraft;
  } catch {
    return null;
  }
}

export function clearPendingUpload() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_UPLOAD_KEY);
  } catch {
    // ignore
  }
}

export function markWelcomeOnboarding() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(WELCOME_FLAG_KEY, "1");
  } catch {
    // ignore
  }
}

export function consumeWelcomeOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const show = sessionStorage.getItem(WELCOME_FLAG_KEY) === "1";
    if (show) sessionStorage.removeItem(WELCOME_FLAG_KEY);
    return show;
  } catch {
    return false;
  }
}
