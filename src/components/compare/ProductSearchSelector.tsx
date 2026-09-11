"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  searchCompareProducts,
  type CompareProductIndexItem,
} from "@/lib/comparison/product-index-search";
import { Badge } from "@/components/ui/Badge";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

interface ProductSearchSelectorProps {
  index: CompareProductIndexItem[];
  categoryId?: string;
  excludeSlugs?: string[];
  label: string;
  placeholder?: string;
  selected?: CompareProductIndexItem | null;
  onSelect: (item: CompareProductIndexItem) => void;
  onClear?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

function statusLabel(status: CompareProductIndexItem["lifecycleStatus"]) {
  switch (status) {
    case "previous-generation":
      return "Previous gen";
    case "discontinued":
      return "Discontinued";
    case "upcoming":
      return "Upcoming";
    default:
      return null;
  }
}

function SearchThumb({
  src,
  alt,
  size,
}: {
  src?: string;
  alt?: string;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const sizes =
    size === "sm" ? IMAGE_SIZES.compareSearchThumb : IMAGE_SIZES.altThumb;
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted",
        dim,
        size === "sm" && "rounded-md",
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          className="object-contain"
          sizes={sizes}
          quality={IMAGE_QUALITY.thumb}
          loading="lazy"
        />
      ) : (
        <span className="text-[9px] text-subtle">
          {size === "sm" ? "—" : "Kitletics"}
        </span>
      )}
    </div>
  );
}

export function ProductSearchSelector({
  index,
  categoryId,
  excludeSlugs = [],
  label,
  placeholder = "Search products",
  selected,
  onSelect,
  onClear,
  disabled,
  autoFocus,
}: ProductSearchSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const labelId = useId();

  const excludeIds = useMemo(() => {
    const slugs = new Set(excludeSlugs);
    return index.filter((i) => slugs.has(i.slug)).map((i) => i.id);
  }, [index, excludeSlugs]);

  const results = useMemo(
    () =>
      // Defer result thumbs until the user types — empty focus shows a hint only.
      query.trim().length === 0
        ? []
        : searchCompareProducts(index, query, {
            categoryId,
            excludeIds,
            limit: 10,
          }),
    [index, query, categoryId, excludeIds],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function choose(item: CompareProductIndexItem) {
    onSelect(item);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  if (selected) {
    return (
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-start gap-3">
          <SearchThumb
            src={selected.thumbnailSrc}
            alt={selected.thumbnailAlt}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide text-subtle uppercase">
              {selected.brandName}
            </p>
            <p className="truncate font-medium" title={selected.fullName}>
              {selected.name}
            </p>
            {statusLabel(selected.lifecycleStatus) && (
              <Badge variant="muted" className="mt-1">
                {statusLabel(selected.lifecycleStatus)}
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-surface-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label={`Remove ${selected.name}`}
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClear?.();
                setOpen(true);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="rounded-lg px-2 py-1 text-xs font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label
        id={labelId}
        className="mb-1.5 block text-xs font-medium tracking-wide text-subtle uppercase"
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border bg-surface px-3",
          disabled && "opacity-50",
        )}
      >
        <Search className="size-4 shrink-0 text-subtle" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && results[activeIndex]
              ? `${listId}-option-${activeIndex}`
              : undefined
          }
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
              return;
            }
            if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
              setOpen(true);
              return;
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && results[activeIndex]) {
              e.preventDefault();
              choose(results[activeIndex]);
            }
          }}
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="text-subtle hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Thumbs only while open — no product media until search/focus */}
      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-border bg-surface py-1 shadow-lg"
        >
          {query.trim().length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">
              Type a product name to search
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">No products found</li>
          ) : (
            results.map((item, i) => {
              const excluded = excludeSlugs.includes(item.slug);
              return (
                <li
                  key={item.id}
                  id={`${listId}-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  aria-disabled={excluded}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
                    i === activeIndex && "bg-surface-muted",
                    excluded && "cursor-not-allowed opacity-40",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (!excluded) choose(item);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <SearchThumb src={item.thumbnailSrc} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.fullName}</p>
                    <p className="text-xs text-muted">
                      {statusLabel(item.lifecycleStatus) ?? item.categoryName}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
