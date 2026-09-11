"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "kit-overview", label: "Kit Overview" },
  { id: "whats-included", label: "What's Included" },
  { id: "why-these-picks", label: "Why These Picks" },
  { id: "alternatives", label: "Alternatives" },
  { id: "what-to-buy-next", label: "What to Buy Next" },
  { id: "faq-checklist", label: "Checklist" },
] as const;

export function GearSetupNav() {
  const [active, setActive] = useState<string>(NAV[0].id);

  useEffect(() => {
    const nodes = NAV.map((n) => document.getElementById(n.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Setup sections"
      className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "shrink-0 px-3 py-1.5 text-[12px] font-semibold tracking-wide whitespace-nowrap transition-colors",
              active === item.id
                ? "text-accent border-b-2 border-accent"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
