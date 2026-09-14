"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCompareTray } from "@/components/compare/CompareTrayProvider";
import type { PadelRacketDatabaseRecord } from "@/lib/padel-racket-database/types";
import { humanizeToken } from "@/lib/padel-racket-database/query";
import { formatWeightLabel } from "@/lib/padel-racket-database/quality";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";
import { trackRacketDatabaseEvent } from "@/lib/padel-racket-database/analytics";
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

export function PadelRacketDatabaseCard({
  record,
  resultPosition,
}: {
  record: PadelRacketDatabaseRecord;
  resultPosition?: number;
}) {
  const tray = useCompareTray();
  const [compareMsg, setCompareMsg] = useState<string | null>(null);
  const selected = tray.isSelected(record.slug);

  function trackResultClick() {
    trackRacketDatabaseEvent("racket_database_result_click", {
      product_slug: record.slug,
      brand: record.brandSlug,
      result_position: resultPosition,
    });
  }

  function toggleCompare() {
    if (selected) {
      tray.removeProduct(record.slug, "racket-database");
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
      { source: "racket-database" },
    );
    if (result.ok) {
      trackRacketDatabaseEvent("racket_database_compare_add", {
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
        { source: "racket-database", forceCategoryReset: true },
      );
      if (forced.ok) {
        trackRacketDatabaseEvent("racket_database_compare_add", {
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
              <Link
                href={`/brands/${record.brandSlug}`}
                className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase hover:text-foreground"
              >
                {record.brandName}
              </Link>
              <h3 className="mt-0.5 font-display text-[1.05rem] leading-tight font-bold tracking-tight">
                <Link
                  href={record.productHref}
                  className="hover:underline"
                  onClick={trackResultClick}
                >
                  {record.name}
                </Link>
              </h3>
              {record.useCaseLabels[0] && (
                <p className="mt-1 text-[12px] text-muted">
                  {record.useCaseLabels[0]}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {record.shape && (
                  <span className="border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                    {humanizeToken(record.shape)}
                  </span>
                )}
                {record.balance && (
                  <span className="border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                    {humanizeToken(record.balance)} balance
                  </span>
                )}
                {record.faceMaterial && (
                  <span className="border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                    {humanizeToken(record.faceMaterial)}
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
            <Spec label="Weight" value={formatWeightLabel(record)} />
            <Spec
              label="Shape"
              value={record.shape ? humanizeToken(record.shape) : undefined}
            />
            <Spec
              label="Power"
              value={
                record.powerScore !== undefined
                  ? String(record.powerScore)
                  : undefined
              }
            />
            <Spec
              label="Control"
              value={
                record.controlScore !== undefined
                  ? String(record.controlScore)
                  : undefined
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
                  trackRacketDatabaseEvent("racket_database_review_click", {
                    product_slug: record.slug,
                    brand: record.brandSlug,
                    result_position: resultPosition,
                  })
                }
              >
                Review
              </Link>
            )}
            {compareMsg && (
              <span className={cn("text-muted")}>{compareMsg}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function DatabaseCompareSticky() {
  const tray = useCompareTray();
  if (tray.count === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] font-medium">
          {tray.count} racket{tray.count === 1 ? "" : "s"} in compare tray
        </p>
        <Link
          href="/compare?category=padel-rackets"
          className="inline-flex h-10 items-center bg-accent px-4 text-[11px] font-bold tracking-[0.08em] text-accent-foreground uppercase"
        >
          Open compare
        </Link>
      </div>
    </div>
  );
}
