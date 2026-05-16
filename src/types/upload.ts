export type SourceType = "youtube" | "article" | "pdf" | "audio";

export type UploadFormPayload = {
  sourceType: SourceType;
  url?: string;
  file?: File;
  language: string;
  difficulty: string;
};
