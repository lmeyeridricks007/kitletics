"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
  return utility + header + 3.5 * rem;
}

export function CompareBuilderSectionNav({
  tabs,
}: {
  tabs: { id: string; label: string }[];
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    if (tabs.length === 0) return;
    const ids = tabs.map((t) => t.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    function updateActive() {
      const offset = chromeOffsetPx();
      let current = ids[0] ?? "";
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
  }, [tabs]);

  if (tabs.length === 0) return null;

  return (
    <nav
      aria-label="Comparison sections"
      className="sticky top-[var(--site-chrome-height,var(--header-height,3.5rem))] z-30 -mx-1 border-b border-border bg-white/95 backdrop-blur-sm"
    >
      <div className="flex gap-0.5 overflow-x-auto px-1 py-2">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={cn(
                "shrink-0 border-b-2 px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
