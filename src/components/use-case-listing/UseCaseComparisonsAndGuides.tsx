import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { UseCaseListingPageData } from "@/lib/use-case-listing";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

export function UseCaseComparisonsAndGuides({
  data,
}: {
  data: UseCaseListingPageData;
}) {
  const { featuredComparisons, relatedGuides, config } = data;

  return (
    <section className="border-t border-border bg-white py-9 sm:py-10">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="heading-section">FEATURED COMPARISONS</h2>
              <Link
                href={`/compare?category=${data.categorySlug}`}
                className="link-accent shrink-0 text-[12px]"
              >
                View all comparisons →
              </Link>
            </div>
            {featuredComparisons.length === 0 ? (
              <p className="text-sm text-muted">
                Comparisons for this list will appear as more side-by-sides are
                published.
              </p>
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {featuredComparisons.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={row.href}
                      className="flex items-center gap-2.5 py-3 transition-colors hover:bg-surface-muted/50"
                    >
                      <Thumb product={row.productA} />
                      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-foreground">
                        {row.productA.name}
                      </span>
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[9px] font-bold text-subtle uppercase">
                        vs
                      </span>
                      <Thumb product={row.productB} />
                      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-foreground">
                        {row.productB.name}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div id="race-day-tips">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="heading-section">{config.relatedGuidesTitle}</h2>
              {config.relatedGuidesIndexHref && (
                <Link
                  href={config.relatedGuidesIndexHref}
                  className="link-accent shrink-0 text-[12px]"
                >
                  View all tips →
                </Link>
              )}
            </div>
            <ul className="space-y-3">
              {relatedGuides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={guide.href}
                    className="flex gap-3 rounded-md transition-colors hover:bg-surface-muted/50"
                  >
                    <span className="relative h-[64px] w-[96px] shrink-0 overflow-hidden rounded-md bg-surface-muted">
                      {guide.imageSrc ? (
                        <Image
                          src={guide.imageSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes={IMAGE_SIZES.listingGuideCover}
                          quality={IMAGE_QUALITY.thumb}
                          loading="lazy"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 py-0.5">
                      <span className="block text-[13px] font-bold text-foreground">
                        {guide.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12px] text-muted">
                        {guide.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Thumb({
  product,
}: {
  product: { name: string; image?: { src: string; alt: string } };
}) {
  return (
    <span className="relative flex size-10 shrink-0 overflow-hidden rounded-md border border-border bg-white">
      {product.image ? (
        <Image
          src={product.image.src}
          alt=""
          fill
          className="object-contain p-1"
          sizes={IMAGE_SIZES.compareThumb}
          quality={IMAGE_QUALITY.thumb}
          loading="lazy"
        />
      ) : (
        <ProductImageFallback
          label={product.name}
          className="size-full p-0 [&_p]:hidden [&_svg]:size-4"
        />
      )}
    </span>
  );
}
