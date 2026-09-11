"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  decision: "Decision guide",
  "key-differences": "Key Differences",
  scores: "Scores",
  "use-cases": "When each wins",
  specs: "Specs",
  prices: "Prices",
  reviews: "Reviews",
  alternatives: "Alternatives",
  faq: "FAQ",
};

function chromeOffsetPx(): number {
  const styles = getComputedStyle(document.documentElement);
  const rem = parseFloat(styles.fontSize) || 16;
  const parseRem = (value: string, fallbackRem: number) => {
    const trimmed = value.trim();
    if (trimmed.endsWith("rem")) return parseFloat(trimmed) * rem;
    if (trimmed.endsWith("px")) return parseFloat(trimmed);
    return fallbackRem * rem;
  };
  const utility = parseRem(styles.getPropertyValue("--utility-height"), 2);
  const header = parseRem(styles.getPropertyValue("--header-height"), 4);
  return utility + header + 2.75 * rem;
}

export function ComparisonSectionNav({ sectionIds }: { sectionIds: string[] }) {
  const items = sectionIds
    .map((id) => ({ id, label: SECTION_LABELS[id] ?? id }))
    .filter((item) => Boolean(SECTION_LABELS[item.id] || item.label));

  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    function updateActive() {
      const offset = chromeOffsetPx();
      let current = sectionIds[0] ?? "";
      for (const el of elements) {
        if (el.getBoundingClientRect().top - offset <= 0) current = el.id;
      }
      setActiveId(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sectionIds]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this comparison"
      className="sticky top-[var(--site-chrome-height)] z-30 border-b border-border bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[var(--container-wide)] gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "shrink-0 border-b-2 px-3 py-1.5 text-[12px] font-semibold tracking-wide uppercase transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
