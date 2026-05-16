import { PageShell } from "@/components/layout/page-shell";
import { CoachPlaceholder } from "@/components/coach/coach-placeholder";
import { CoursePlaceholder } from "@/components/course/course-placeholder";
import { FlashcardsPlaceholder } from "@/components/flashcards/flashcards-placeholder";
import { QuizPlaceholder } from "@/components/quiz/quiz-placeholder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Course viewer</h1>
          <p className="text-sm text-muted-foreground">Slug: {slug}</p>
        </div>

        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="coach">Study Coach</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <CoursePlaceholder />
          </TabsContent>
          <TabsContent value="flashcards">
            <FlashcardsPlaceholder />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizPlaceholder />
          </TabsContent>
          <TabsContent value="coach">
            <CoachPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
