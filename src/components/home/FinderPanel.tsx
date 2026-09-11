"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { HomepageData } from "@/lib/home/types";
import {
  SPORT_NAV_ICONS,
  type SportNavIconId,
} from "@/components/icons/SportNavIcons";

type FinderTab = "running" | "padel" | "tennis" | "fitness";

const TABS: {
  id: FinderTab;
  label: string;
  icon: SportNavIconId;
  /** Day-1: only Running finders are live; others redirect to /tools hub */
  live: boolean;
}[] = [
  { id: "running", label: "Running Shoes", icon: "running", live: true },
  { id: "padel", label: "Padel Racket", icon: "padel", live: false },
  { id: "tennis", label: "Tennis Racket", icon: "tennis", live: false },
  { id: "fitness", label: "Home Gym", icon: "fitness", live: false },
];

const FIELDS: Record<
  FinderTab,
  { label: string; value: string }[]
> = {
  running: [
    { label: "My Level", value: "Intermediate" },
    { label: "Primary Use", value: "Daily Training" },
    { label: "Cushion Preference", value: "Soft / Balanced" },
    { label: "Budget", value: "€120 – €180" },
  ],
  padel: [
    { label: "My Level", value: "Intermediate" },
    { label: "My Play Style", value: "Control & Maneuverability" },
    { label: "Shape Preference", value: "Round / Teardrop" },
    { label: "Budget", value: "€150 – €250" },
  ],
  tennis: [
    { label: "My Level", value: "Intermediate" },
    { label: "My Play Style", value: "All-court" },
    { label: "Head Size", value: "98 – 100 sq in" },
    { label: "Budget", value: "€150 – €250" },
  ],
  fitness: [
    { label: "Space", value: "Garage / Spare Room" },
    { label: "Goals", value: "Strength & Conditioning" },
    { label: "Ceiling", value: "2.4 m+" },
    { label: "Budget", value: "€1,000 – €2,500" },
  ],
};

export function FinderPanel({ finder }: { finder: HomepageData["finder"] }) {
  const router = useRouter();
  const [tab, setTab] = useState<FinderTab>("running");
  const fields = FIELDS[tab];
  const activeTab = TABS.find((t) => t.id === tab)!;

  const cta = useMemo(() => {
    if (tab === "running") {
      return { label: "FIND MY SHOES", href: finder.shoeFinderHref };
    }
    // Held verticals — do not deep-link into HIDDEN finder URLs
    return { label: "BROWSE TOOLS", href: "/tools" };
  }, [tab, finder]);

  return (
    <div className="relative z-10 -mt-14 mb-2">
      <Container size="wide">
        <div className="rounded-2xl border border-border bg-white px-5 py-6 shadow-[var(--shadow-finder)] sm:px-8 sm:py-7">
          <h2 className="font-display text-xl font-bold text-foreground sm:text-[22px]">
            {finder.title}
          </h2>

          <div
            className="mt-5 flex gap-4 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Gear finder category"
          >
            {TABS.map((item) => {
              const Icon = SPORT_NAV_ICONS[item.icon];
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2.5 pb-3 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border",
                      active
                        ? "border-accent text-foreground"
                        : "border-border text-muted",
                    )}
                    aria-hidden
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="flex flex-col items-start">
                    {item.label}
                    {!item.live ? (
                      <span className="text-[10px] font-normal tracking-wide text-subtle uppercase">
                        Soon
                      </span>
                    ) : null}
                  </span>
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
                  )}
                </button>
              );
            })}
          </div>

          <form
            className="mt-5 grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(cta.href);
            }}
          >
            {fields.map((field) => (
              <label key={field.label} className="block min-w-0">
                <span className="mb-1.5 block text-[11px] font-medium tracking-wide text-muted uppercase">
                  {field.label}
                </span>
                <span className="relative flex h-11 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground">
                  <span className="truncate pr-6">{field.value}</span>
                  <ChevronDown className="pointer-events-none absolute right-3 size-4 text-subtle" />
                  <select
                    className="absolute inset-0 cursor-pointer opacity-0"
                    defaultValue={field.value}
                    aria-label={field.label}
                    disabled={!activeTab.live}
                  >
                    <option value={field.value}>{field.value}</option>
                  </select>
                </span>
              </label>
            ))}
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-foreground px-5 text-[12px] font-bold tracking-[0.06em] whitespace-nowrap text-white uppercase transition-opacity hover:opacity-90 lg:min-w-[168px]"
              >
                {cta.label} →
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            {finder.footnotePrefix}{" "}
            <Link
              href={finder.footnoteHref}
              className="font-medium text-link hover:text-link-hover hover:underline"
            >
              {finder.footnoteLinkLabel}
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
