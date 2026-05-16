"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DIFFICULTIES, LANGUAGES } from "@/config/constants";
import { SOURCE_TYPE_LABELS } from "@/lib/courses/labels";
import { countActiveFilters } from "@/lib/courses/filter";
import { cn } from "@/lib/utils";
import type { CourseFilters, CourseSourceType } from "@/types/course-listing";
import type { Difficulty } from "@/types/course";

const SOURCE_TYPES = Object.keys(SOURCE_TYPE_LABELS) as CourseSourceType[];

type CoursesSidebarProps = {
  filters: CourseFilters;
  onChange: (filters: CourseFilters) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
  onClose?: () => void;
};

export function CoursesSidebar({
  filters,
  onChange,
  resultCount,
  totalCount,
  className,
  onClose,
}: CoursesSidebarProps) {
  const activeCount = countActiveFilters(filters);

  const toggleSource = (type: CourseSourceType) => {
    const next = filters.sourceTypes.includes(type)
      ? filters.sourceTypes.filter((t) => t !== type)
      : [...filters.sourceTypes, type];
    onChange({ ...filters, sourceTypes: next });
  };

  const toggleDifficulty = (d: Difficulty) => {
    const next = filters.difficulties.includes(d)
      ? filters.difficulties.filter((x) => x !== d)
      : [...filters.difficulties, d];
    onChange({ ...filters, difficulties: next });
  };

  const toggleLanguage = (lang: string) => {
    const next = filters.languages.includes(lang)
      ? filters.languages.filter((l) => l !== lang)
      : [...filters.languages, lang];
    onChange({ ...filters, languages: next });
  };

  const clearAll = () => {
    onChange({
      query: "",
      sourceTypes: [],
      difficulties: [],
      languages: [],
      sort: filters.sort,
    });
  };

  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl border border-border/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <h2 className="text-sm font-bold">Filters</h2>
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close filters"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {resultCount} of {totalCount} courses
      </p>

      {/* Search */}
      <div className="relative mt-5">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search courses…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="h-10 rounded-xl border-border bg-muted/30 pl-9"
        />
      </div>

      {/* Sort */}
      <FilterGroup label="Sort by">
        <div className="flex flex-col gap-1">
          {(
            [
              { value: "latest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "title-asc", label: "Title A–Z" },
            ] as const
          ).map((opt) => (
            <FilterRadio
              key={opt.value}
              name="sort"
              checked={filters.sort === opt.value}
              onChange={() => onChange({ ...filters, sort: opt.value })}
              label={opt.label}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Source type */}
      <FilterGroup label="Source">
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_TYPES.map((type) => (
            <FilterChip
              key={type}
              active={filters.sourceTypes.includes(type)}
              onClick={() => toggleSource(type)}
              label={SOURCE_TYPE_LABELS[type]}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Difficulty */}
      <FilterGroup label="Difficulty">
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => (
            <FilterChip
              key={d.value}
              active={filters.difficulties.includes(d.value)}
              onClick={() => toggleDifficulty(d.value)}
              label={d.label}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Language */}
      <FilterGroup label="Language">
        <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {LANGUAGES.map((lang) => (
            <FilterChip
              key={lang.value}
              active={filters.languages.includes(lang.value)}
              onClick={() => toggleLanguage(lang.value)}
              label={lang.label}
            />
          ))}
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="mt-2 w-full rounded-xl"
        >
          Clear all filters
        </Button>
      )}
    </aside>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-border/60 pt-5 first:mt-0 first:border-0 first:pt-0">
      <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/20 hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function FilterRadio({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/50">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-[var(--primary)]"
      />
      <span className={cn(checked ? "font-medium text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </label>
  );
}
