import { PageShell } from "@/components/layout/page-shell";
import { UploadPlaceholder } from "@/components/upload/upload-placeholder";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Badge>Phase 0</Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Turn any content into a micro-course
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Paste a YouTube link, PDF, or article. Get a full course with
            flashcards, quizzes, and a certificate — in 60 seconds.
          </p>
        </div>
        <UploadPlaceholder />
      </div>
    </PageShell>
  );
}
