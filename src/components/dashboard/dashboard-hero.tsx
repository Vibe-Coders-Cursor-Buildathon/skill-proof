import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

type DashboardHeroProps = {
  displayName: string;
  email: string;
  avatarLetter: string;
  planName: string;
};

export function DashboardHero({
  displayName,
  email,
  avatarLetter,
  planName,
}: DashboardHeroProps) {
  const firstName = displayName.split(" ")[0] ?? displayName;

  return (
    <div className="glass-card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-violet-400/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
            {avatarLetter}
          </span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Dashboard
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Hey {firstName},{" "}
              <span className="text-gradient">keep learning</span>
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              {email}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="size-3" />
              {planName} plan
            </span>
          </div>
        </div>

        <Link
          href="/#upload"
          className="btn-gradient inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
        >
          <Plus className="size-4" />
          Create course
          <ArrowRight className="size-4 opacity-80" />
        </Link>
      </div>
    </div>
  );
}
