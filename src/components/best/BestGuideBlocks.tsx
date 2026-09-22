import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GuideRecommendationBlock } from "@/lib/best/get-best-guide-page-data";
import { PriceBadge } from "@/components/content/PriceBadge";
import { CatalogFromPrice } from "@/components/commerce/CatalogPriceIsland";
import { RatingBadge } from "@/components/content/RatingBadge";
import { Badge } from "@/components/ui/Badge";
import { ScrollableTableRegion } from "@/components/ui/ScrollableTableRegion";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { buildOfferClickHref } from "@/repositories/commerce";

export function QuickPicks({
  recommendations,
  className,
}: {
  recommendations: GuideRecommendationBlock[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {recommendations.map((rec) => {
        const img = rec.product.images[0];
        return (
          <a
            key={rec.product.id}
            href={`#rec-${rec.product.slug}`}
            className="group block border-b border-border pb-4 transition-colors hover:border-accent"
          >
            <div className="relative mb-3 aspect-[4/3] overflow-hidden bg-surface-muted">
              {img ? (
                <Image
                  src={img.src}
                  alt={img.alt || rec.product.fullName}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              ) : null}
            </div>
            {rec.awardLabel && (
              <p className="text-[10px] font-medium tracking-[0.12em] text-accent uppercase">
                {rec.awardLabel}
              </p>
            )}
            <p className="mt-1 text-xs text-subtle">{rec.brand?.name}</p>
            <p className="font-display text-lg font-semibold group-hover:text-accent">
              {rec.product.name}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">
              {rec.entry.summary ?? rec.entry.rationale}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {rec.product.recommendationScore !== undefined && (
                <RatingBadge score={rec.product.recommendationScore} />
              )}
              {rec.lowestPrice && (
                <CatalogFromPrice
                  slug={rec.product.slug}
                  fallback={{
                    price: rec.lowestPrice.price,
                    currency: rec.lowestPrice.currency,
                  }}
                />
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}

export function GuideComparisonTable({
  rows,
  products,
}: {
  rows: { key: string; label: string; unit?: string; values: Record<string, string> }[];
  products: { product: { id: string; name: string; slug: string }; brand?: { name: string } }[];
}) {
  if (products.length === 0 || rows.length === 0) return null;

  return (
    <ScrollableTableRegion
      label="Product comparison"
      className="rounded-xl border border-border"
    >
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">Product comparison</caption>
        <thead className="bg-surface-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Spec
            </th>
            {products.map(({ product, brand }) => (
              <th key={product.id} scope="col" className="px-4 py-3 font-medium">
                <Link
                  href={`/products/${product.slug}`}
                  className="hover:text-accent"
                >
                  {brand?.name ? `${brand.name} ` : ""}
                  {product.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.key}>
              <th
                scope="row"
                className="px-4 py-2.5 font-normal text-muted"
              >
                {row.label}
                {row.unit ? ` (${row.unit})` : ""}
              </th>
              {products.map(({ product }) => (
                <td key={product.id} className="px-4 py-2.5 tabular-nums">
                  {row.values[product.id] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTableRegion>
  );
}

export function RecommendationBlock({
  rec,
  rankDisplay,
  categorySlug,
}: {
  rec: GuideRecommendationBlock;
  rankDisplay: string;
  categorySlug: string;
}) {
  return (
    <article
      id={`rec-${rec.product.slug}`}
      className="scroll-mt-28 border-t border-border pt-10"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-accent">
              {rankDisplay}
            </span>
            {rec.awardLabel && (
              <Badge variant="accent">{rec.awardLabel}</Badge>
            )}
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            <Link
              href={`/products/${rec.product.slug}`}
              className="hover:text-accent"
            >
              {rec.brand?.name} {rec.product.name}
            </Link>
          </h3>

          {rec.evidenceBadges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {rec.evidenceBadges.map((b) => (
                <Badge key={b} variant="muted">
                  {b}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-5">
            <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              Why we recommend it
            </p>
            <p className="mt-2 max-w-2xl text-muted leading-relaxed">
              {rec.whyText}
            </p>
          </div>

          {rec.entry.useCaseIds && rec.entry.useCaseIds.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                Best for
              </p>
              <p className="mt-2 text-sm text-foreground">
                {(rec.entry.summary ?? rec.entry.rationale).slice(0, 120)}
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {rec.strengths.length > 0 && (
              <div>
                <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                  Strengths
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted">
                  {rec.strengths.map((s) => (
                    <li key={s}>
                      <span className="text-accent">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rec.compromises.length > 0 && (
              <div>
                <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                  Trade-offs
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted">
                  {rec.compromises.map((c) => (
                    <li key={c}>
                      <span className="text-subtle">–</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {rec.entry.whoShouldAvoid && rec.entry.whoShouldAvoid.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                Skip if
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {rec.entry.whoShouldAvoid.map((w) => (
                  <li key={w}>– {w}</li>
                ))}
              </ul>
            </div>
          )}

          {rec.keySpecs.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              {rec.keySpecs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs text-subtle">{spec.label}</dt>
                  <dd className="text-sm font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {rec.considerInstead.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                Consider instead
              </p>
              <ul className="mt-2 space-y-2">
                {rec.considerInstead.map((alt) => (
                  <li key={alt.product.id} className="text-sm">
                    <Link
                      href={`/products/${alt.product.slug}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {alt.brand?.name} {alt.product.name}
                    </Link>
                    {alt.reason && (
                      <span className="text-muted"> — {alt.reason}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/products/${rec.product.slug}`}
              className="font-medium text-accent hover:underline"
            >
              View Product
            </Link>
            <AddToCompareButton
              product={{
                slug: rec.product.slug,
                name: rec.product.name,
                brandName: rec.brand?.name,
                categoryId: rec.product.categoryId,
                categorySlug,
              }}
              source="best-guide"
              variant="ghost"
              size="sm"
            />
            {rec.reviewSlug && (
              <Link
                href={`/reviews/${rec.reviewSlug}`}
                className="font-medium text-accent hover:underline"
              >
                Read Full Review
              </Link>
            )}
            {rec.comparisons[0] && (
              <Link
                href={`/compare/${rec.comparisons[0].slug}`}
                className="font-medium text-accent hover:underline"
              >
                Full Comparison
              </Link>
            )}
            {rec.offers.length > 0 && (
              <a
                href={`#offers-${rec.product.slug}`}
                className="font-medium text-accent hover:underline"
              >
                Check Prices
              </a>
            )}
          </div>

          {rec.offers.length > 0 && (
            <div id={`offers-${rec.product.slug}`} className="mt-4 scroll-mt-28">
              <ul className="space-y-2 text-sm">
                {rec.offers.slice(0, 3).map(({ offer, retailer }) => (
                  <li key={offer.id}>
                    <a
                      href={buildOfferClickHref(offer.id, "best-guide")}
                      rel="noopener noreferrer sponsored nofollow"
                      className="text-muted hover:text-accent"
                      aria-label={`Check price at ${retailer?.name ?? "retailer"} for ${rec.product.fullName}`}
                    >
                      {retailer?.name ?? "Retailer"} —{" "}
                      <PriceBadge
                        amount={offer.price}
                        currency={offer.currency}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative aspect-square overflow-hidden bg-surface-muted lg:sticky lg:top-28">
          {rec.product.images[0] ? (
            <Image
              src={rec.product.images[0].src}
              alt={rec.product.images[0].alt || rec.product.fullName}
              fill
              className="object-contain p-4"
              sizes="240px"
            />
          ) : null}
          {rec.lowestPrice && (
            <div className="absolute bottom-3 left-3">
              <CatalogFromPrice
                slug={rec.product.slug}
                fallback={{
                  price: rec.lowestPrice.price,
                  currency: rec.lowestPrice.currency,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
