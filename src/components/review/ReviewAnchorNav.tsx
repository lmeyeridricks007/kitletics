"use client";

import { cn } from "@/lib/utils";

export function ReviewAnchorNav({
  items,
  className,
}: {
  items: { id: string; label: string }[];
  className?: string;
}) {
  if (items.length < 2) return null;
  return (
    <nav
      aria-label="Review sections"
      className={cn(
        "sticky top-16 z-10 -mx-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <ul className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-block rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
