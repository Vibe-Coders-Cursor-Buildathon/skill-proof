"use client";

import { useCallback, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FileUp,
  Link2,
  Mic,
  Upload,
  Video,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTIES, LANGUAGES } from "@/config/constants";
import { useAuth } from "@/contexts/auth-context";
import { useGeneration } from "@/contexts/generation-context";
import { cn } from "@/lib/utils";
import type {
  AudioInputMode,
  SourceType,
  UploadFormPayload,
} from "@/types/upload";

const SOURCE_OPTIONS: {
  id: SourceType;
  label: string;
  description: string;
  icon: typeof Video;
}[] = [
  {
    id: "youtube",
    label: "YouTube",
    description: "Paste any video link",
    icon: Video,
  },
  {
    id: "article",
    label: "Article",
    description: "Blog or web page URL",
    icon: FileText,
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Upload a document",
    icon: FileUp,
  },
  {
    id: "audio",
    label: "Audio",
    description: "Link or upload a file",
    icon: Mic,
  },
];

const URL_PLACEHOLDERS: Record<"youtube" | "article" | "audio", string> = {
  youtube: "https://www.youtube.com/watch?v=...",
  article: "https://example.com/your-article",
  audio: "https://open.spotify.com/episode/... or podcast URL",
};

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".webm", ".flac"];

type FileKind = "pdf" | "audio";

const FILE_RULES: Record<
  FileKind,
  { accept: string; maxBytes: number; label: string; hint: string }
> = {
  pdf: {
    accept: "application/pdf,.pdf",
    maxBytes: 25 * 1024 * 1024,
    label: "Upload PDF",
    hint: "Drag & drop your PDF here",
  },
  audio: {
    accept: "audio/*,.mp3,.wav,.m4a,.ogg,.aac,.webm,.flac",
    maxBytes: 50 * 1024 * 1024,
    label: "Upload audio",
    hint: "Drag & drop your audio file here",
  },
};

function isAudioFile(file: File) {
  if (file.type.startsWith("audio/")) return true;
  const lower = file.name.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

type ContentUploadCardProps = {
  onSubmit?: (payload: UploadFormPayload) => void;
};

export function ContentUploadCard({ onSubmit }: ContentUploadCardProps) {
  const { startGeneration, isOpen: isGenerating } = useGeneration();
  const { requireAuth, isLoading: isAuthLoading } = useAuth();
  const [sourceType, setSourceType] = useState<SourceType>("youtube");
  const [audioInputMode, setAudioInputMode] = useState<AudioInputMode>("link");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [difficulty, setDifficulty] = useState("beginner");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = sourceType === "pdf";
  const isAudio = sourceType === "audio";
  const showUrlInput =
    sourceType === "youtube" ||
    sourceType === "article" ||
    (isAudio && audioInputMode === "link");
  const showFileUpload = isPdf || (isAudio && audioInputMode === "file");
  const fileKind: FileKind | null = isPdf ? "pdf" : isAudio && audioInputMode === "file" ? "audio" : null;

  const handleSourceChange = (next: SourceType) => {
    setSourceType(next);
    setAudioInputMode("link");
    setError(null);
    setUrl("");
    setFile(null);
  };

  const handleAudioModeChange = (mode: AudioInputMode) => {
    setAudioInputMode(mode);
    setError(null);
    setUrl("");
    setFile(null);
  };

  const handleFile = useCallback((incoming: File | null, kind: FileKind) => {
    if (!incoming) {
      setFile(null);
      return;
    }

    const rules = FILE_RULES[kind];
    const valid = kind === "pdf" ? isPdfFile(incoming) : isAudioFile(incoming);

    if (!valid) {
      setError(
        kind === "pdf"
          ? "Please upload a PDF file."
          : "Please upload an audio file (MP3, WAV, M4A, etc.).",
      );
      return;
    }
    if (incoming.size > rules.maxBytes) {
      setError(
        `File must be under ${rules.maxBytes / 1024 / 1024} MB.`,
      );
      return;
    }
    setError(null);
    setFile(incoming);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, kind: FileKind) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped, kind);
    },
    [handleFile],
  );

  const handleGenerate = (payload: UploadFormPayload) => {
    onSubmit?.(payload);
    startGeneration(payload);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (showFileUpload) {
      if (!file) {
        setError(
          isPdf ? "Upload a PDF to continue." : "Upload an audio file to continue.",
        );
        return;
      }
    } else if (!url.trim()) {
      setError("Paste a link to continue.");
      return;
    } else {
      try {
        new URL(url.trim());
      } catch {
        setError("Enter a valid URL.");
        return;
      }
    }

    const payload: UploadFormPayload = {
      sourceType,
      language,
      difficulty,
      ...(isAudio ? { audioInputMode } : {}),
      ...(showFileUpload ? { file: file! } : { url: url.trim() }),
    };

    requireAuth(() => handleGenerate(payload));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card w-full overflow-hidden p-6 sm:p-8"
    >
      <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
        Choose a source to get started
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SOURCE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = sourceType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSourceChange(opt.id)}
                className={cn(
                  "group relative flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                  active
                    ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                    : "border-transparent bg-slate-50/80 hover:border-slate-200 hover:bg-white hover:shadow-sm",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl transition-all duration-200",
                    active
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                      : "bg-white text-muted-foreground shadow-sm ring-1 ring-slate-200/80 group-hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={`${sourceType}-${audioInputMode}`}
          className="mt-5 animate-in fade-in-0 duration-300"
        >
          {isAudio && (
            <div className="mb-4 flex rounded-2xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200/60">
              <button
                type="button"
                onClick={() => handleAudioModeChange("link")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  audioInputMode === "link"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Link2 className="size-4" />
                Paste link
              </button>
              <button
                type="button"
                onClick={() => handleAudioModeChange("file")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  audioInputMode === "file"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Upload className="size-4" />
                Upload file
              </button>
            </div>
          )}

          {showUrlInput && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {sourceType === "youtube"
                  ? "Video URL"
                  : sourceType === "article"
                    ? "Article URL"
                    : "Audio URL"}
              </label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder={URL_PLACEHOLDERS[sourceType as "youtube" | "article" | "audio"]}
                  className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white pr-4 pl-11 text-base shadow-sm transition-all outline-none placeholder:text-muted-foreground/60 focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-500/15 md:text-sm"
                />
              </div>
            </div>
          )}

          {showFileUpload && fileKind && (
            <FileDropZone
              kind={fileKind}
              file={file}
              isDragging={isDragging}
              fileInputRef={fileInputRef}
              onPick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, fileKind)}
              onFileChange={(f) => handleFile(f, fileKind)}
              onRemove={() => setFile(null)}
            />
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold">Language</label>
            <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
              <SelectTrigger className="h-11 w-full rounded-2xl bg-white">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold">Difficulty</label>
            <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
              <SelectTrigger className="h-11 w-full rounded-2xl bg-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isAuthLoading || isGenerating}
          className="btn-gradient mt-6 h-12 w-full rounded-2xl border-0 text-base font-semibold"
        >
          {isAuthLoading ? (
            "Checking session…"
          ) : isGenerating ? (
            "Preparing your course…"
          ) : (
            <>
              Generate course
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="mt-4 text-center text-xs font-medium text-muted-foreground">
          Powered by Gemini 2.0 Flash · Course ready in ~60 seconds
        </p>
    </form>
  );
}

function FileDropZone({
  kind,
  file,
  isDragging,
  fileInputRef,
  onPick,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemove,
}: {
  kind: FileKind;
  file: File | null;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  const rules = FILE_RULES[kind];
  const maxMb = rules.maxBytes / 1024 / 1024;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{rules.label}</label>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPick();
          }
        }}
        onClick={onPick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex min-h-[148px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200",
          isDragging
            ? "border-indigo-400 bg-indigo-50/80"
            : file
              ? "border-indigo-300 bg-indigo-50/50"
              : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={rules.accept}
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
              <Upload className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{rules.hint}</p>
              <p className="text-sm text-muted-foreground">
                or click to browse · max {maxMb} MB
                {kind === "audio" ? " · MP3, WAV, M4A, OGG" : ""}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}