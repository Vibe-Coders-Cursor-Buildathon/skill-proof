import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="bg-mesh bg-grid-pattern relative min-h-screen">
      <Header />
      <main
        className={cn(
          "relative mx-auto flex w-full flex-1 flex-col",
          wide ? "max-w-6xl px-4 sm:px-6" : "max-w-5xl px-4 py-8",
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
