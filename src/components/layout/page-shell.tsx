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
    <>
      <Header />
      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col",
          wide ? "max-w-6xl px-4" : "max-w-5xl px-4 py-8",
        )}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
