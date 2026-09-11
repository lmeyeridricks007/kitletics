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
  return utility + header + 2.75 * rem;
}

export function ReviewSectionNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    function updateActive() {
      const offset = chromeOffsetPx();
      let current = items[0]?.id ?? "";
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
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this review"
      className="sticky top-[var(--site-chrome-height)] z-30 border-b border-border bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "shrink-0 border-b-2 px-3 py-1.5 text-[13px] font-medium transition-colors",
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
