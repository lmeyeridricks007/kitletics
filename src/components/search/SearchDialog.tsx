"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";
import { POPULAR_SEARCHES } from "@/lib/search/popular";
import { searchKitleticsAction } from "@/lib/search/search-action";
import type { SearchHit } from "@/lib/search/types";
import { SearchResultItem } from "@/components/search/SearchResultItems";
import { DiscoveryShortcuts } from "@/components/discovery/DiscoveryShortcuts";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [grouped, setGrouped] = useState<
    { type: SearchHit["type"]; label: string; hits: SearchHit[] }[]
  >([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const listId = useId();
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setHits([]);
      setGrouped([]);
      setSearching(false);
      return;
    }

    const id = ++requestId.current;
    setSearching(true);
    const timer = window.setTimeout(() => {
      void searchKitleticsAction(q, 24).then((result) => {
        if (requestId.current !== id) return;
        setHits(result.hits);
        setGrouped(result.grouped);
        setSearching(false);
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const close = useCallback(() => {
    onOpenChange(false);
    setQuery("");
  }, [onOpenChange]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useModalFocus(open, dialogRef, close);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]">
      <div
        className="absolute inset-0 bg-charcoal-950/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-lg outline-none"
      >
        <h2 id={titleId} className="sr-only">
          Search Kitletics
        </h2>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-subtle" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Kitletics..."
            className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-subtle"
            autoComplete="off"
            spellCheck={false}
            aria-controls={listId}
            aria-autocomplete="list"
          />
          <kbd className="hidden rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline">
            ESC
          </kbd>
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(60vh,28rem)] overflow-y-auto p-2"
        >
          {!query.trim() && (
            <div className="space-y-3 px-3 py-4">
              <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                Recent / Popular
              </p>
              <ul className="space-y-0.5">
                {POPULAR_SEARCHES.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface-muted"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query.trim() && searching && hits.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted" role="status">
              Searching…
            </p>
          )}

          {query.trim() && !searching && hits.length === 0 && (
            <div className="space-y-4 px-3 py-8 text-center">
              <p className="text-sm text-muted" role="status">
                No results for “{query}”
              </p>
              <p className="text-xs text-subtle">Try:</p>
              <DiscoveryShortcuts
                items={[
                  { label: "Browse Running", href: "/running" },
                  { label: "Search a brand", href: "/brands" },
                  {
                    label: "Running Shoe Finder",
                    href: "/tools/running-shoe-finder",
                  },
                  { label: "All gear", href: "/gear" },
                ]}
              />
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.type} className="mb-2">
              <p className="px-3 py-1.5 text-[11px] font-medium tracking-wide text-subtle uppercase">
                {group.label}
                <span className="ml-2 text-subtle/80">
                  {group.hits.length} result{group.hits.length === 1 ? "" : "s"}
                </span>
              </p>
              <ul>
                {group.hits.map((hit) => {
                  const flatIndex = hits.findIndex(
                    (h) => h.type === hit.type && h.id === hit.id,
                  );
                  return (
                    <li
                      key={`${hit.type}-${hit.id}`}
                      role="option"
                      aria-selected={flatIndex === activeIndex}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                    >
                      <SearchResultItem hit={hit} onSelect={close} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-subtle">
          <span>Publication-gated search</span>
          <Link
            href={
              query.trim()
                ? `/search?q=${encodeURIComponent(query)}`
                : "/search"
            }
            onClick={close}
            className="font-medium text-accent hover:underline"
          >
            View all results
          </Link>
        </div>
      </div>
    </div>
  );
}

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open search"
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-muted transition-colors hover:bg-surface-muted hover:text-foreground",
        className,
      )}
    >
      <Search className="size-4" />
      <span className="hidden text-sm sm:inline">Search</span>
      <kbd className="ml-1 hidden rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium lg:inline">
        ⌘K
      </kbd>
    </button>
  );
}

export type { SearchHit };
