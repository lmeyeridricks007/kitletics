"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { DisciplineHubNavItem } from "@/lib/discipline-hub/types";

export function DisciplineLocalNav({ items }: { items: DisciplineHubNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "overview");

  useEffect(() => {
    const ids = items.map((i) => i.id);
    const observers: IntersectionObserver[] = [];

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  return (
    <nav
      aria-label="Discipline sections"
      className="sticky top-[var(--site-chrome-height)] z-30 border-b border-border bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-[90rem] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                isActive
                  ? "border-accent text-foreground"
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
