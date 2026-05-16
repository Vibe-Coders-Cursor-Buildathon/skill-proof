export type SourceType = "youtube" | "article" | "pdf" | "audio";

export type AudioInputMode = "link" | "file";

export type UploadFormPayload = {
  sourceType: SourceType;
  url?: string;
  file?: File;
  language: string;
  difficulty: string;
  /** Set when sourceType is audio — how the user provided the content */
  audioInputMode?: AudioInputMode;
};
