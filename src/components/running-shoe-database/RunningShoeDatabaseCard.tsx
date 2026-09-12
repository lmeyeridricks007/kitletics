"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCompareTray } from "@/components/compare/CompareTrayProvider";
import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import { humanizeToken } from "@/lib/running-shoe-database/query";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";
import { trackShoeDatabaseEvent } from "@/lib/running-shoe-database/analytics";
import { cn } from "@/lib/utils";

function formatPrice(price: { amount: number; currency: string }): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits: 0,
    }).format(price.amount);
  } catch {
    return `${price.currency} ${price.amount}`;
  }
}

function genderLabel(record: RunningShoeDatabaseRecord): string | undefined {
  const g =
    record.genderFit.length > 0 ? record.genderFit : record.audiences;
  if (g.length === 0) return undefined;
  if (g.length === 1) {
    if (g[0] === "men") return "Men";
    if (g[0] === "women") return "Women";
    return "Unisex";
  }
  if (g.includes("men") && g.includes("women")) return "Men · Women";
  return g.map((x) => (x === "men" ? "Men" : x === "women" ? "Women" : "Unisex")).join(" · ");
}

function Spec({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[13px] font-semibold text-foreground tabular-nums">
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function RunningShoeDatabaseCard({
  record,
  resultPosition,
}: {
  record: RunningShoeDatabaseRecord;
  resultPosition?: number;
}) {
  const tray = useCompareTray();
  const [compareMsg, setCompareMsg] = useState<string | null>(null);
  const selected = tray.isSelected(record.slug);
  const gender = genderLabel(record);

  function trackResultClick() {
    trackShoeDatabaseEvent("shoe_database_result_click", {
      product_slug: record.slug,
      brand: record.brandSlug,
      result_position: resultPosition,
    });
  }

  function toggleCompare() {
    if (selected) {
      tray.removeProduct(record.slug, "shoe-database");
      setCompareMsg(null);
      return;
    }
    const result = tray.addProduct(
      {
        slug: record.slug,
        name: record.name,
        brandName: record.brandName,
        categoryId: record.categoryId,
        categorySlug: record.categorySlug,
      },
      { source: "shoe-database" },
    );
    if (result.ok) {
      trackShoeDatabaseEvent("shoe_database_compare_add", {
        product_slug: record.slug,
        brand: record.brandSlug,
        result_position: resultPosition,
      });
    }
    if (!result.ok && result.reason === "category-conflict") {
      const ok = window.confirm(result.message);
      if (!ok) return;
      const forced = tray.addProduct(
        {
          slug: record.slug,
          name: record.name,
          brandName: record.brandName,
          categoryId: record.categoryId,
          categorySlug: record.categorySlug,
        },
        { source: "shoe-database", forceCategoryReset: true },
      );
      if (forced.ok) {
        trackShoeDatabaseEvent("shoe_database_compare_add", {
          product_slug: record.slug,
          brand: record.brandSlug,
          result_position: resultPosition,
        });
      }
      return;
    }
    if (!result.ok) {
      setCompareMsg(result.message);
    }
  }

  return (
    <article className="group border border-border bg-white transition-colors hover:border-foreground/20">
      <div className="grid sm:grid-cols-[120px_minmax(0,1fr)]">
        <Link
          href={record.productHref}
          className="relative flex aspect-[5/4] items-center justify-center bg-[#f3f4f5] sm:aspect-auto sm:min-h-[140px]"
          aria-label={`View ${record.fullName}`}
          onClick={trackResultClick}
        >
          {record.image ? (
            <Image
              src={record.image.src}
              alt={record.image.alt}
              fill
              sizes={IMAGE_SIZES.productCardCompact}
              quality={IMAGE_QUALITY.card}
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="text-xs text-muted">No image</span>
          )}
        </Link>

        <div className="flex min-w-0 flex-col gap-3 border-t border-border p-4 sm:border-t-0 sm:border-l">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/brands/${record.brandSlug}`}
                  className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase hover:text-foreground"
                >
                  {record.brandName}
                </Link>
                {gender && (
                  <span className="text-[11px] text-muted">{gender}</span>
                )}
              </div>
              <h3 className="mt-0.5 font-display text-[1.05rem] leading-tight font-bold tracking-tight">
                <Link
                  href={record.productHref}
                  className="hover:underline"
                  onClick={trackResultClick}
                >
                  {record.name}
                </Link>
              </h3>
              {record.primaryUseLabel && (
                <p className="mt-1 text-[12px] text-muted">
                  {record.primaryUseLabel}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {record.carbonPlated && (
                  <span className="border border-foreground/15 bg-[#f5f6f7] px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                    Carbon
                  </span>
                )}
                {record.plate === true && !record.carbonPlated && (
                  <span className="border border-foreground/15 bg-[#f5f6f7] px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                    Plated
                  </span>
                )}
                {record.typeLabels[0] && (
                  <span className="border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                    {record.typeLabels[0]}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              {typeof record.score === "number" && (
                <span
                  className="inline-flex items-center bg-score px-2 py-0.5 text-[11px] font-bold text-score-foreground tabular-nums"
                  title="Kitletics recommendation score"
                >
                  {Number.isInteger(record.score)
                    ? record.score
                    : record.score.toFixed(1)}
                </span>
              )}
              {record.price ? (
                <span className="text-[13px] font-semibold tabular-nums">
                  From {formatPrice(record.price)}
                </span>
              ) : (
                <span className="text-[12px] text-muted">Price pending</span>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-4 gap-2 border-t border-border pt-3">
            <Spec
              label="Weight"
              value={
                record.weightG !== undefined ? `${record.weightG} g` : undefined
              }
            />
            <Spec
              label="Drop"
              value={
                record.dropMm !== undefined ? `${record.dropMm} mm` : undefined
              }
            />
            <Spec
              label="Stack"
              value={
                record.heelStackMm !== undefined
                  ? `${record.heelStackMm} mm`
                  : undefined
              }
            />
            <Spec
              label="Stability"
              value={
                record.stability ? humanizeToken(record.stability) : undefined
              }
            />
          </dl>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px]">
            <Link
              href={record.productHref}
              className="font-semibold text-link hover:text-link-hover"
              onClick={trackResultClick}
            >
              Product
            </Link>
            <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-foreground">
              <input
                type="checkbox"
                checked={selected}
                onChange={toggleCompare}
                disabled={!selected && !tray.canAdd && tray.count > 0}
                className="size-3.5 rounded border-border accent-[var(--color-accent,#c8f542)]"
              />
              Add to compare
            </label>
            {record.reviewSlug && (
              <Link
                href={`/reviews/${record.reviewSlug}`}
                className="font-semibold text-link hover:text-link-hover"
                onClick={() =>
                  trackShoeDatabaseEvent("shoe_database_review_click", {
                    product_slug: record.slug,
                    brand: record.brandSlug,
                    result_position: resultPosition,
                  })
                }
              >
                Review
              </Link>
            )}
            {record.hasAlternatives && (
              <Link
                href={`/products/${record.slug}/alternatives`}
                className="font-semibold text-link hover:text-link-hover"
                onClick={() =>
                  trackShoeDatabaseEvent("shoe_database_alternatives_click", {
                    product_slug: record.slug,
                    brand: record.brandSlug,
                    result_position: resultPosition,
                  })
                }
              >
                Alternatives
              </Link>
            )}
            <Link
              href={`/compare?category=running-shoes&products=${record.slug}`}
              className="font-semibold text-link hover:text-link-hover"
            >
              Compare
            </Link>
            <Link
              href="/tools/running-shoe-finder"
              className="font-semibold text-link hover:text-link-hover"
            >
              Finder
            </Link>
            {compareMsg && (
              <span className="text-[11px] text-muted" role="status">
                {compareMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function DatabaseCompareSticky() {
  const tray = useCompareTray();
  if (!tray.hydrated || tray.count === 0) return null;
  if (tray.categorySlug && tray.categorySlug !== "running-shoes") return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgb(11_15_19/0.08)] backdrop-blur",
        "sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-auto sm:border sm:px-4 sm:shadow-md",
      )}
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-3 sm:mx-0 sm:justify-start">
        <p className="text-[13px] font-semibold tabular-nums">
          Compare ({tray.count}/{tray.max})
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => tray.clear("shoe-database")}
            className="px-2 py-1.5 text-[12px] font-medium text-muted hover:text-foreground"
          >
            Clear
          </button>
          <Link
            href={tray.compareHref}
            className={cn(
              "inline-flex h-9 items-center bg-accent px-3 text-[11px] font-bold tracking-[0.06em] text-accent-foreground uppercase",
              tray.count < 2 && "pointer-events-none opacity-50",
            )}
            aria-disabled={tray.count < 2}
          >
            Open compare
          </Link>
        </div>
      </div>
    </div>
  );
}
