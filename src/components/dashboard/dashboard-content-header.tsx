import type { DashboardTabId } from "@/components/dashboard/dashboard-tabs";

const TAB_TITLES: Record<
  DashboardTabId,
  { title: string; description: string }
> = {
  overview: {
    title: "Overview",
    description: "Your learning stats and recent activity",
  },
  courses: {
    title: "My Courses",
    description: "Micro-courses you created with AI",
  },
  paid: {
    title: "Paid Courses",
    description: "Courses you purchased — full access anytime",
  },
  plan: {
    title: "Plan & Credits",
    description: "Manage your subscription and credit usage",
  },
};

type DashboardContentHeaderProps = {
  activeTab: DashboardTabId;
};

export function DashboardContentHeader({ activeTab }: DashboardContentHeaderProps) {
  const { title, description } = TAB_TITLES[activeTab];

  return (
    <header className="mb-6 border-b border-border/40 pb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Dashboard
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </header>
  );
}
