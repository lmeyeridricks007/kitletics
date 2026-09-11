"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { BrandHubNavItem } from "@/lib/brand-hub/types";

export function BrandLocalNav({ items }: { items: BrandHubNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "overview");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const item of items) {
      if (!item.href.startsWith("#")) continue;
      const el = document.getElementById(item.href.slice(1));
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActiveId(item.id);
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
      aria-label="Brand sections"
      className="sticky top-[var(--site-chrome-height)] z-30 overflow-x-hidden border-b border-border bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-[90rem] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive =
            item.href.startsWith("#")
              ? activeId === item.id
              : false;
          const overviewActive =
            item.id === "overview" && activeId === "overview";
          const active = isActive || overviewActive;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active
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
