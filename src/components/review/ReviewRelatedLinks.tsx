import Link from "next/link";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";

/**
 * Contextual next-step links for a product review:
 * Product · Alternatives · Comparisons · Best · Guides
 */
export function ReviewRelatedLinks({ data }: { data: ReviewPageData }) {
  const {
    product,
    brand,
    alternatives,
    comparisons,
    bestGuides,
    buyingGuides,
  } = data;

  const hasContent =
    alternatives.length > 0 ||
    comparisons.length > 0 ||
    bestGuides.length > 0 ||
    buyingGuides.length > 0;
  if (!hasContent) return null;

  const productLabel = brand
    ? `${brand.name} ${product.name}`
    : product.fullName;

  return (
    <section
      id="keep-reading"
      className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-6 border-t border-border pt-10"
    >
      <div>
        <h2 className="heading-section">Keep reading</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
          Specs and buy links live on the product page. Use the paths below when
          you want alternatives, head-to-heads, shortlists, or how-to choose
          frameworks.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href={`/products/${product.slug}`}
            className="block border border-border bg-white px-4 py-3 transition-colors hover:border-accent"
          >
            <span className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
              Product
            </span>
            <span className="mt-1 block text-[14px] font-semibold text-foreground">
              {productLabel} specs &amp; offers
            </span>
          </Link>
        </li>

        {alternatives.length > 0 && (
          <li>
            <Link
              href={`/products/${product.slug}/alternatives`}
              className="block border border-border bg-white px-4 py-3 transition-colors hover:border-accent"
            >
              <span className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                Alternatives
              </span>
              <span className="mt-1 block text-[14px] font-semibold text-foreground">
                What to buy instead of {product.name}
              </span>
            </Link>
          </li>
        )}

        {comparisons.map(({ comparison, productNames }) => (
          <li key={comparison.id}>
            <Link
              href={`/compare/${comparison.slug}`}
              className="block border border-border bg-white px-4 py-3 transition-colors hover:border-accent"
            >
              <span className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                Comparison
              </span>
              <span className="mt-1 block text-[14px] font-semibold text-foreground">
                {productNames.length >= 2
                  ? `${productNames[0]} vs ${productNames[1]}`
                  : comparison.title}
              </span>
            </Link>
          </li>
        ))}

        {bestGuides.slice(0, 2).map((guide) => (
          <li key={guide.id}>
            <Link
              href={`/best/${guide.slug}`}
              className="block border border-border bg-white px-4 py-3 transition-colors hover:border-accent"
            >
              <span className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                Best guide
              </span>
              <span className="mt-1 block text-[14px] font-semibold text-foreground">
                {guide.title}
              </span>
            </Link>
          </li>
        ))}

        {buyingGuides.slice(0, 2).map((guide) => (
          <li key={guide.id}>
            <Link
              href={`/guides/${guide.slug}`}
              className="block border border-border bg-white px-4 py-3 transition-colors hover:border-accent"
            >
              <span className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                Buying guide
              </span>
              <span className="mt-1 block text-[14px] font-semibold text-foreground">
                {guide.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
