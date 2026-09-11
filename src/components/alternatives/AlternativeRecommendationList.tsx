"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Footprints } from "lucide-react";
import { AddAlternativeToCompare } from "@/components/alternatives/AddAlternativeToCompare";
import type {
  AlternativeItem,
  AlternativesPageData,
} from "@/lib/product/get-alternatives-page-data";
import type { AlternativeReasonGroup } from "@/lib/product/get-alternatives-page-data";
import { formatPrice, cn } from "@/lib/utils";

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

interface AlternativeRecommendationListProps {
  data: AlternativesPageData;
  items: AlternativeItem[];
  reasonGroups: AlternativeReasonGroup[];
  activeReasonId: string | null;
  onReasonChange: (reasonId: string | null) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function AlternativeRecommendationList({
  data,
  items,
  reasonGroups,
  activeReasonId,
  onReasonChange,
  sortBy,
  onSortChange,
}: AlternativeRecommendationListProps) {
  const sourceName = data.product.name;
  const categorySlug =
    data.category?.pathSegment ?? data.category?.slug ?? "";

  const tabs = [
    { id: null as string | null, label: "All Alternatives" },
    ...reasonGroups.map((g) => ({
      id: g.reason.id as string | null,
      label: g.reason.tabLabel,
    })),
  ];

  return (
    <section id="alternatives-list" aria-labelledby="alts-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2
          id="alts-heading"
          className="text-[12px] font-bold tracking-[0.14em] text-foreground uppercase"
        >
          Best {data.product.name} alternatives
        </h2>
        <Link
          href="/methodology"
          className="text-[13px] font-medium text-link hover:underline"
        >
          How we choose →
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter by reason"
          className="flex gap-1 overflow-x-auto"
        >
          {tabs.map((tab) => {
            const active = activeReasonId === tab.id;
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onReasonChange(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2 text-[12px] font-semibold tracking-wide transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <label className="flex shrink-0 items-center gap-2 text-[12px] text-muted">
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 border border-border bg-white px-2 text-[12px] text-foreground"
          >
            <option value="relevance">Relevance</option>
            <option value="score">Kitletics Score</option>
            <option value="price">Price</option>
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No alternatives match this filter yet.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {items.map((item) => (
            <li key={item.relationship.id}>
              <AlternativeRow
                item={item}
                sourceName={sourceName}
                source={{
                  slug: data.product.slug,
                  name: data.product.name,
                  brandName: data.brand?.name,
                  categoryId: data.product.categoryId,
                  categorySlug,
                }}
                categorySlug={categorySlug}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AlternativeRow({
  item,
  sourceName,
  source,
  categorySlug,
}: {
  item: AlternativeItem;
  sourceName: string;
  source: {
    slug: string;
    name: string;
    brandName?: string;
    categoryId: string;
    categorySlug: string;
  };
  categorySlug: string;
}) {
  return (
    <article className="grid gap-5 py-6 lg:grid-cols-[140px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.85fr)_minmax(140px,0.7fr)] lg:items-start lg:gap-6">
      <div className="relative">
        <div className="relative aspect-[5/3] w-full max-w-[140px] overflow-hidden bg-surface-muted">
          {item.media ? (
            <Image
              src={item.media.src}
              alt={item.media.alt ?? item.product.fullName}
              fill
              className="object-contain p-1"
              sizes="140px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-subtle">
              —
            </div>
          )}
        </div>
        <span className="absolute top-0 left-0 z-10 max-w-[140px] rounded-[3px] bg-accent px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-accent-foreground uppercase leading-tight">
          {item.badgeLabel}
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="font-display text-[17px] font-bold tracking-tight">
          <Link
            href={`/products/${item.product.slug}`}
            className="hover:text-accent-ink"
          >
            {item.brand?.name} {item.product.name}
          </Link>
        </h3>
        {typeof item.score === "number" && item.scoreLabel && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-[3px] bg-score px-1.5 py-0.5 text-[11px] font-bold text-score-foreground tabular-nums">
            {displayScore(item.score)} {item.scoreLabel}
          </span>
        )}
        <p className="mt-2 text-[13px] leading-snug text-muted">
          {item.whyAlternative || item.summary}
        </p>
        {item.reviewSlug ? (
          <Link
            href={`/reviews/${item.reviewSlug}`}
            className="mt-2 inline-block text-[12px] font-medium text-link hover:underline"
          >
            Read review →
          </Link>
        ) : (
          <Link
            href={`/products/${item.product.slug}`}
            className="mt-2 inline-block text-[12px] font-medium text-link hover:underline"
          >
            View product →
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
            Better than {sourceName}
          </p>
          <ul className="mt-2 space-y-1.5">
            {(item.betterAt?.length ? item.betterAt : item.whyChoose).map(
              (reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-1.5 text-[13px] leading-snug text-foreground"
                >
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-accent"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{reason}</span>
                </li>
              ),
            )}
          </ul>
        </div>
        {item.worseAt?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
              What you give up
            </p>
            <ul className="mt-2 space-y-1.5">
              {item.worseAt.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-1.5 text-[13px] leading-snug text-muted"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-subtle" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
            Who should switch
          </p>
          <p className="mt-2 text-[13px] leading-snug text-foreground">
            {item.whoShouldSwitch}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
            Who should stay with {sourceName}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-muted">
            {item.whoShouldStay}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
            Best for
          </p>
          <ul className="mt-2 space-y-1.5">
            {item.bestFor.length > 0 ? (
              item.bestFor.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 text-[13px] text-foreground"
                >
                  <Footprints
                    className="size-3.5 shrink-0 text-muted"
                    aria-hidden
                  />
                  {label}
                </li>
              ))
            ) : (
              <li className="text-[13px] text-subtle">—</li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:items-stretch">
        <p className="text-[14px] tabular-nums">
          {item.price ? (
            <>
              From{" "}
              <span className="font-semibold">
                {formatPrice(item.price.price, item.price.currency)}
              </span>
            </>
          ) : (
            <span className="text-subtle">Check prices</span>
          )}
        </p>
        <Link
          href={`/products/${item.product.slug}#offers`}
          className="inline-flex h-9 items-center justify-center rounded-[4px] bg-accent px-3 text-[11px] font-bold tracking-[0.04em] text-accent-foreground uppercase hover:bg-accent-hover"
        >
          View prices
          {item.offerCount > 0 ? ` (${item.offerCount})` : ""}
        </Link>
        {item.publishedComparisonSlug ? (
          <Link
            href={`/compare/${item.publishedComparisonSlug}`}
            className="text-center text-[12px] font-medium text-link hover:underline"
          >
            Read full comparison →
          </Link>
        ) : (
          <AddAlternativeToCompare
            source={source}
            alternative={{
              slug: item.product.slug,
              name: item.product.name,
              brandName: item.brand?.name,
              categoryId: item.product.categoryId,
              categorySlug,
            }}
            className="text-center"
          />
        )}
      </div>
    </article>
  );
}
