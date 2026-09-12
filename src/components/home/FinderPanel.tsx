"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { HomepageData } from "@/lib/home/types";
import {
  SPORT_NAV_ICONS,
  type SportNavIconId,
} from "@/components/icons/SportNavIcons";
import {
  FinderPreviewSelect,
  type FinderPreviewField,
} from "@/components/finder/FinderPreviewSelect";
import { runningShoeFinderDefinition } from "@/domain/finders/configs/running-shoe-finder";
import { encodeFinderShareStateBrowser } from "@/domain/finders/share-state";
import type { FinderResponses } from "@/domain/finders/types";

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

/** Align with Running Shoe Finder question values (share-state prefill). */
const RUNNING_FIELDS: FinderPreviewField[] = [
  {
    label: "My Level",
    name: "experience",
    value: "intermediate",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    label: "Primary Use",
    name: "primaryUse",
    value: "daily-training",
    options: [
      { value: "daily-training", label: "Daily training" },
      { value: "easy-runs", label: "Easy runs" },
      { value: "long-runs", label: "Long runs" },
      { value: "tempo", label: "Tempo / faster training" },
      { value: "intervals", label: "Intervals" },
      { value: "racing", label: "Racing" },
      { value: "recovery", label: "Recovery runs" },
      { value: "everything", label: "A bit of everything" },
    ],
  },
  {
    label: "Cushion Preference",
    name: "cushioning",
    value: "balanced",
    options: [
      { value: "minimal", label: "Minimal / ground feel" },
      { value: "balanced", label: "Balanced" },
      { value: "cushioned", label: "Cushioned" },
      { value: "maximum", label: "Maximum cushioning" },
      { value: "no-preference", label: "No preference" },
    ],
  },
  {
    label: "Budget",
    name: "budget",
    value: "100-150",
    options: [
      { value: "under-100", label: "Under €100" },
      { value: "100-150", label: "€100–€150" },
      { value: "150-200", label: "€150–€200" },
      { value: "200-plus", label: "€200+" },
      { value: "no-limit", label: "No budget limit" },
    ],
  },
];

const HELD_FIELDS: Record<Exclude<FinderTab, "running">, FinderPreviewField[]> =
  {
    padel: [
      {
        label: "My Level",
        name: "level",
        value: "intermediate",
        options: [
          { value: "beginner", label: "Beginner" },
          { value: "intermediate", label: "Intermediate" },
          { value: "advanced", label: "Advanced" },
        ],
      },
      {
        label: "My Play Style",
        name: "style",
        value: "control",
        options: [
          { value: "control", label: "Control & Maneuverability" },
          { value: "power", label: "Power" },
          { value: "all-round", label: "All-round" },
        ],
      },
      {
        label: "Shape Preference",
        name: "shape",
        value: "round-teardrop",
        options: [
          { value: "round", label: "Round" },
          { value: "teardrop", label: "Teardrop" },
          { value: "diamond", label: "Diamond" },
          { value: "round-teardrop", label: "Round / Teardrop" },
        ],
      },
      {
        label: "Budget",
        name: "budget",
        value: "150-250",
        options: [
          { value: "under-150", label: "Under €150" },
          { value: "150-250", label: "€150 – €250" },
          { value: "250-400", label: "€250 – €400" },
          { value: "no-limit", label: "No budget limit" },
        ],
      },
    ],
    tennis: [
      {
        label: "My Level",
        name: "level",
        value: "intermediate",
        options: [
          { value: "beginner", label: "Beginner" },
          { value: "intermediate", label: "Intermediate" },
          { value: "advanced", label: "Advanced" },
        ],
      },
      {
        label: "My Play Style",
        name: "style",
        value: "all-court",
        options: [
          { value: "baseline", label: "Baseline" },
          { value: "all-court", label: "All-court" },
          { value: "serve-volley", label: "Serve & volley" },
        ],
      },
      {
        label: "Head Size",
        name: "headSize",
        value: "98-100",
        options: [
          { value: "under-98", label: "Under 98 sq in" },
          { value: "98-100", label: "98 – 100 sq in" },
          { value: "100-plus", label: "100+ sq in" },
        ],
      },
      {
        label: "Budget",
        name: "budget",
        value: "150-250",
        options: [
          { value: "under-150", label: "Under €150" },
          { value: "150-250", label: "€150 – €250" },
          { value: "250-plus", label: "€250+" },
          { value: "no-limit", label: "No budget limit" },
        ],
      },
    ],
    fitness: [
      {
        label: "Space",
        name: "space",
        value: "garage",
        options: [
          { value: "apartment", label: "Apartment / small room" },
          { value: "garage", label: "Garage / Spare Room" },
          { value: "dedicated", label: "Dedicated gym room" },
        ],
      },
      {
        label: "Goals",
        name: "goals",
        value: "strength",
        options: [
          { value: "strength", label: "Strength & Conditioning" },
          { value: "hypertrophy", label: "Muscle building" },
          { value: "general", label: "General fitness" },
        ],
      },
      {
        label: "Ceiling",
        name: "ceiling",
        value: "2.4",
        options: [
          { value: "under-2.2", label: "Under 2.2 m" },
          { value: "2.2-2.4", label: "2.2 – 2.4 m" },
          { value: "2.4", label: "2.4 m+" },
        ],
      },
      {
        label: "Budget",
        name: "budget",
        value: "1000-2500",
        options: [
          { value: "under-1000", label: "Under €1,000" },
          { value: "1000-2500", label: "€1,000 – €2,500" },
          { value: "2500-plus", label: "€2,500+" },
          { value: "no-limit", label: "No budget limit" },
        ],
      },
    ],
  };

function fieldsForTab(tab: FinderTab): FinderPreviewField[] {
  return tab === "running" ? RUNNING_FIELDS : HELD_FIELDS[tab];
}

function defaultsFor(fields: FinderPreviewField[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.name, f.value]));
}

export function FinderPanel({ finder }: { finder: HomepageData["finder"] }) {
  const router = useRouter();
  const [tab, setTab] = useState<FinderTab>("running");
  const fields = fieldsForTab(tab);
  const [values, setValues] = useState<Record<string, string>>(() =>
    defaultsFor(RUNNING_FIELDS),
  );
  const activeTab = TABS.find((t) => t.id === tab)!;

  const cta = useMemo(() => {
    if (tab === "running") {
      return { label: "FIND MY SHOES", href: finder.shoeFinderHref };
    }
    return { label: "BROWSE TOOLS", href: "/tools" };
  }, [tab, finder]);

  function switchTab(next: FinderTab) {
    setTab(next);
    setValues(defaultsFor(fieldsForTab(next)));
  }

  function buildRunningHref(): string {
    const responses: FinderResponses = {
      experience: values.experience,
      primaryUse: values.primaryUse,
      cushioning: values.cushioning,
      budget: values.budget,
    };
    const encoded = encodeFinderShareStateBrowser(
      runningShoeFinderDefinition,
      responses,
    );
    const base = finder.shoeFinderHref;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}s=${encodeURIComponent(encoded)}`;
  }

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
                  onClick={() => switchTab(item.id)}
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
              if (tab === "running" && activeTab.live) {
                router.push(buildRunningHref());
                return;
              }
              router.push(cta.href);
            }}
          >
            {fields.map((field) => (
              <FinderPreviewSelect
                key={`${tab}-${field.name}`}
                field={field}
                appearance="light"
                disabled={!activeTab.live}
                onValueChange={(name, value) =>
                  setValues((prev) => ({ ...prev, [name]: value }))
                }
              />
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
