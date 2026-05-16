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
import { cn } from "@/lib/utils";
import type { SourceType, UploadFormPayload } from "@/types/upload";

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
    description: "Podcast or audio URL",
    icon: Mic,
  },
];

const URL_PLACEHOLDERS: Record<Exclude<SourceType, "pdf">, string> = {
  youtube: "https://www.youtube.com/watch?v=...",
  article: "https://example.com/your-article",
  audio: "https://open.spotify.com/episode/... or audio file URL",
};

type ContentUploadCardProps = {
  onSubmit?: (payload: UploadFormPayload) => void;
};

export function ContentUploadCard({ onSubmit }: ContentUploadCardProps) {
  const [sourceType, setSourceType] = useState<SourceType>("youtube");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [difficulty, setDifficulty] = useState("beginner");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = sourceType === "pdf";
  const needsUrl = !isPdf;

  const handleSourceChange = (next: SourceType) => {
    setSourceType(next);
    setError(null);
    setUrl("");
    setFile(null);
  };

  const handleFile = useCallback((incoming: File | null) => {
    if (!incoming) {
      setFile(null);
      return;
    }
    if (incoming.type !== "application/pdf" && !incoming.name.endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    if (incoming.size > 25 * 1024 * 1024) {
      setError("PDF must be under 25 MB.");
      return;
    }
    setError(null);
    setFile(incoming);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isPdf) {
      if (!file) {
        setError("Upload a PDF to continue.");
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
      ...(isPdf ? { file: file! } : { url: url.trim() }),
    };

    setIsSubmitting(true);
    try {
      onSubmit?.(payload);
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-border/80 bg-card p-1 shadow-xl shadow-indigo-500/5 ring-1 ring-foreground/5"
    >
      <div className="rounded-xl bg-card p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SOURCE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = sourceType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSourceChange(opt.id)}
                className={cn(
                  "group relative flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all duration-200",
                  active
                    ? "border-primary/30 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-transparent bg-muted/40 hover:border-border hover:bg-muted/70",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={sourceType}
          className="mt-5 animate-in fade-in-0 duration-300"
        >
          {needsUrl ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
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
                  placeholder={
                    URL_PLACEHOLDERS[
                      sourceType as Exclude<SourceType, "pdf">
                    ]
                  }
                  className="h-12 w-full rounded-xl border border-input bg-background pr-4 pl-11 text-base shadow-sm transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/15 md:text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Upload PDF
              </label>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : file
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <>
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Click to
                        replace
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
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
                      <p className="font-medium">
                        Drag & drop your PDF here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse · max 25 MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select
              value={language}
              onValueChange={(v) => v && setLanguage(v)}
            >
              <SelectTrigger className="h-10 w-full">
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
            <label className="text-sm font-medium">Difficulty</label>
            <Select
              value={difficulty}
              onValueChange={(v) => v && setDifficulty(v)}
            >
              <SelectTrigger className="h-10 w-full">
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
          disabled={isSubmitting}
          className="mt-5 h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-md shadow-primary/20 hover:bg-primary/90"
        >
          {isSubmitting ? (
            "Preparing your course…"
          ) : (
            <>
              Generate course
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Powered by Gemini 2.0 Flash · Course ready in ~60 seconds
        </p>
      </div>
    </form>
  );
}
