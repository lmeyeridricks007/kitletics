"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";

interface SportSearchFieldProps {
  sportName: string;
  placeholders: string[];
  className?: string;
}

export function SportSearchField({
  sportName,
  placeholders,
  className,
}: SportSearchFieldProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const hint = placeholders[0] ?? "Novablast";

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <Section
      className={className}
      eyebrow="Search"
      title={`Search ${sportName} gear`}
      description="Jump straight to products, brands, guides and tools."
    >
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
        <label htmlFor="sport-hub-search" className="sr-only">
          Search {sportName} gear
        </label>
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 shadow-sm focus-within:border-accent",
          )}
        >
          <Search className="size-4 shrink-0 text-subtle" aria-hidden />
          <input
            id="sport-hub-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Try “${hint}”…`}
            className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-subtle"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Search
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {placeholders.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                router.push(`/search?q=${encodeURIComponent(item)}`)
              }
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {item}
            </button>
          ))}
        </div>
      </form>
    </Section>
  );
}
