import Link from "next/link";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { formatPrice } from "@/lib/utils";
import type { AlternativesPageData } from "@/lib/product/get-alternatives-page-data";

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

interface SourceProductSummaryProps {
  data: AlternativesPageData;
}

export function SourceProductSummary({ data }: SourceProductSummaryProps) {
  const { product, brand, category, source } = data;
  const categorySlug = category?.pathSegment ?? category?.slug ?? "";

  return (
    <aside className="rounded-xl bg-charcoal-950 p-5 text-white shadow-lg sm:p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
        You&apos;re considering
      </p>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight">
        {product.fullName}
      </h2>

      {typeof source.score === "number" && source.scoreLabel && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-accent px-2 py-1 text-[12px] font-bold text-accent-foreground tabular-nums">
            {displayScore(source.score)}
            <span className="font-semibold">{source.scoreLabel}</span>
          </span>
        </div>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-white/70">
        {source.summary}
      </p>

      <p className="mt-4 text-[14px] tabular-nums">
        {source.price ? (
          <>
            From{" "}
            <span className="font-semibold">
              {formatPrice(source.price.price, source.price.currency)}
            </span>
          </>
        ) : (
          <span className="text-white/50">Check prices</span>
        )}
      </p>

      <Link
        href={`/products/${product.slug}#offers`}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase hover:bg-accent-hover"
      >
        View prices
        {source.offerCount > 0 ? ` (${source.offerCount})` : ""} →
      </Link>

      <div className="mt-3 space-y-2 text-[13px]">
        {source.review ? (
          <Link
            href={`/reviews/${source.review.slug}`}
            className="block font-medium text-accent hover:underline"
          >
            Read full review →
          </Link>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="block font-medium text-accent hover:underline"
          >
            View product →
          </Link>
        )}
        <AddToCompareButton
          product={{
            slug: product.slug,
            name: product.name,
            brandName: brand?.name,
            categoryId: product.categoryId,
            categorySlug,
          }}
          source="alternatives"
          variant="ghost"
          size="sm"
          className="[&_button]:h-auto [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-0 [&_button]:text-[13px] [&_button]:font-medium [&_button]:text-white/80 [&_button]:underline-offset-2 hover:[&_button]:text-white hover:[&_button]:underline"
        />
      </div>
    </aside>
  );
}
