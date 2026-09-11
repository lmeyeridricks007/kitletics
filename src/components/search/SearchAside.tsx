"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import {
  clearRecentSearches,
  pushRecentSearch,
  readRecentSearches,
} from "@/lib/search/recent-searches";

interface SearchAsideProps {
  query: string;
  total: number;
  relatedSearches: { label: string; href: string }[];
  finderCta: { label: string; href: string };
  guidesCtaHref: string;
  compareAction?: { label: string; href: string };
}

export function SearchAside({
  query,
  total,
  relatedSearches,
  finderCta,
  guidesCtaHref,
  compareAction,
}: SearchAsideProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (query.trim()) pushRecentSearch(query);
    setRecent(readRecentSearches());
  }, [query]);

  function onClear() {
    clearRecentSearches();
    setRecent([]);
  }

  return (
    <aside className="w-full space-y-5 xl:w-[250px] xl:shrink-0">
      <div className="border border-border bg-white p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-[0.08em] text-foreground uppercase">
          Search summary
        </h2>
        <p className="font-display text-[17px] font-bold text-foreground">
          “{query}”
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {total.toLocaleString()} result{total === 1 ? "" : "s"} found
        </p>
      </div>

      {compareAction && (
        <div className="border border-border bg-white p-4">
          <Link
            href={compareAction.href}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-link hover:underline"
          >
            {compareAction.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      )}

      {relatedSearches.length > 0 && (
        <div className="border border-border bg-white p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.08em] text-foreground uppercase">
            Explore related
          </h2>
          <ul className="space-y-2.5">
            {relatedSearches.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[13px] font-medium text-foreground hover:text-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div className="border border-border bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-bold tracking-[0.08em] text-foreground uppercase">
              Recent searches
            </h2>
            <button
              type="button"
              onClick={onClear}
              className="text-[12px] font-semibold text-link hover:underline"
            >
              Clear
            </button>
          </div>
          <ul className="space-y-2">
            {recent.map((q) => (
              <li key={q}>
                <Link
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="flex items-center gap-2 text-[13px] text-foreground hover:text-link"
                >
                  <Clock
                    className="size-3.5 shrink-0 text-subtle"
                    aria-hidden
                  />
                  <span className="truncate">{q}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border border-border bg-[#f7f8fa] p-4">
        <h2 className="mb-2 text-[11px] font-bold tracking-[0.08em] text-foreground uppercase">
          Need help choosing?
        </h2>
        <p className="mb-3 text-[12px] leading-relaxed text-muted">
          Use a Finder for a tailored shortlist, or browse decision guides.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href={finderCta.href}
            className="inline-flex h-9 items-center justify-center gap-1 bg-accent px-3 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
          >
            {finderCta.label.replace(/^Try\s+/i, "")}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link
            href={guidesCtaHref}
            className="inline-flex h-9 items-center justify-center gap-1 border border-border bg-white px-3 text-[12px] font-bold tracking-wide text-foreground uppercase hover:bg-surface-muted"
          >
            Browse Guides
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
