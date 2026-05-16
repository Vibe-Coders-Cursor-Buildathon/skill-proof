import Link from "next/link";
import { BookOpen, Crown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardStatsProps = {
  courseCount: number;
  credits: number;
  creditsMax: number;
  planName: string;
};

export function DashboardStats({
  courseCount,
  credits,
  creditsMax,
  planName,
}: DashboardStatsProps) {
  const creditsUsed = Math.max(0, creditsMax - credits);
  const creditsPercent =
    creditsMax > 0 ? Math.min(100, (credits / creditsMax) * 100) : 0;
  const lowCredits = credits <= 1;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={BookOpen}
        label="Courses"
        value={String(courseCount)}
        hint="in your library"
        accent="indigo"
      />

      <div
        className={cn(
          "glass-card flex flex-col justify-between p-5",
          lowCredits && "ring-1 ring-amber-200/80",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              lowCredits
                ? "bg-amber-100 text-amber-700"
                : "bg-indigo-100 text-indigo-600",
            )}
          >
            <Sparkles className="size-5" />
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
              lowCredits
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700",
            )}
          >
            {lowCredits ? "Low" : "Active"}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Credits left
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{credits}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                lowCredits
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500",
              )}
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {creditsUsed} of {creditsMax} used this cycle
          </p>
        </div>
        {lowCredits && (
          <Link
            href="/#pricing"
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Get more credits →
          </Link>
        )}
      </div>

      <StatCard
        icon={Crown}
        label="Current plan"
        value={planName}
        hint="Upgrade anytime"
        accent="violet"
        compactValue
      />
    </div>
  );
}

type StatCardProps = {
  icon: typeof BookOpen;
  label: string;
  value: string;
  hint: string;
  accent: "indigo" | "violet";
  compactValue?: boolean;
};

const ACCENT_STYLES = {
  indigo: {
    icon: "bg-indigo-100 text-indigo-600",
    glow: "from-indigo-500/10 to-transparent",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600",
    glow: "from-violet-500/10 to-transparent",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  compactValue,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className="glass-card group relative overflow-hidden p-5">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
          styles.glow,
        )}
      />
      <div className="relative">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="size-5" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 font-bold tracking-tight text-foreground",
            compactValue ? "text-xl capitalize" : "text-3xl",
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
