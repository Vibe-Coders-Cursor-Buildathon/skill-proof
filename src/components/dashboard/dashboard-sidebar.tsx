import Link from "next/link";
import {
  Award,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import type { DashboardTabId } from "@/components/dashboard/dashboard-tabs";
import { cn } from "@/lib/utils";

const NAV_ITEMS: {
  id: DashboardTabId;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Stats & quick actions",
  },
  {
    id: "courses",
    label: "My Courses",
    icon: BookOpen,
    description: "Your course library",
  },
  {
    id: "paid",
    label: "Paid Courses",
    icon: ShoppingBag,
    description: "Purchased catalog courses",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: Award,
    description: "Earned credentials & LinkedIn",
  },
  {
    id: "plan",
    label: "Plan & Credits",
    icon: CreditCard,
    description: "Billing & usage",
  },
];

type DashboardSidebarProps = {
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
  displayName: string;
  email: string;
  avatarLetter: string;
  planName: string;
  credits: number;
  courseCount: number;
  paidCourseCount: number;
  certificateCount: number;
};

export function DashboardSidebar({
  activeTab,
  onTabChange,
  displayName,
  email,
  avatarLetter,
  planName,
  credits,
  courseCount,
  paidCourseCount,
  certificateCount,
}: DashboardSidebarProps) {
  const firstName = displayName.split(" ")[0] ?? displayName;
  const lowCredits = credits <= 1;

  return (
    <aside className="flex w-full flex-col lg:w-[260px] lg:shrink-0">
      <div className="glass-card flex flex-col overflow-hidden p-4 lg:sticky lg:top-24">
        <div className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              {avatarLetter}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {firstName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-2.5 py-0.5 text-[0.65rem] font-semibold text-indigo-700">
              <Sparkles className="size-3" />
              {planName}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold",
                lowCredits
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
            >
              {credits} credits
            </span>
          </div>
        </div>

        <nav className="mt-4 flex flex-col gap-1" aria-label="Dashboard sections">
          <p className="mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge =
              item.id === "courses" && courseCount > 0
                ? courseCount
                : item.id === "paid" && paidCourseCount > 0
                  ? paidCourseCount
                  : item.id === "certificates" && certificateCount > 0
                    ? certificateCount
                    : item.id === "plan" && lowCredits
                  ? "!"
                  : undefined;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground group-hover:bg-white group-hover:text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.label}</span>
                    {badge !== undefined && (
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full text-[0.6rem] font-bold",
                          isActive
                            ? "bg-white/25 text-white"
                            : typeof badge === "number"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs leading-snug",
                      isActive ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-border/50 pt-4">
          <Link
            href="/#upload"
            className="btn-gradient flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
          >
            <Plus className="size-4" />
            Create course
          </Link>
        </div>
      </div>
    </aside>
  );
}
