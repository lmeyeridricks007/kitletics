import Link from "next/link";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewScorePanel } from "@/components/review/ReviewScorePanel";
import { pickAmazonOffer } from "@/lib/review/amazon-offer";
import { formatVerifiedDate } from "@/lib/product/score";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "K";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function testingSummaryLine(data: ReviewPageData): string | null {
  const details = data.review.testingDetails;
  if (!data.showTestingModule || !details) return null;
  const parts: string[] = [];
  if (details.distanceKm !== undefined) {
    parts.push(`Tested over ${details.distanceKm} km`);
  }
  if (details.durationDays !== undefined) {
    parts.push(
      details.durationDays === 1
        ? "1 day"
        : `${details.durationDays} days`,
    );
  } else if (details.durationHours !== undefined) {
    parts.push(`${details.durationHours} hours`);
  }
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]} · ${parts.slice(1).join(" · ")}`;
}

export function ReviewHero({ data }: { data: ReviewPageData }) {
  const {
    review,
    product,
    brand,
    author,
    config,
    displayScore,
    scoreBandLabel,
    heroCriteria,
    visibleTypeMeta,
    heroImage,
    breadcrumbs,
    showTestingModule,
    offers,
  } = data;

  const published =
    review.publishedAt ?? review.updatedAt ?? review.lastVerifiedAt;
  const testingLine = testingSummaryLine(data);
  const atmosphereSrc = config.heroAtmosphereSrc;
  const amazon = pickAmazonOffer(offers);

  return (
    <section className="border-b border-border bg-[#f4f4f2]">
      <Container size="wide" className="py-6 sm:py-8 lg:py-10">
        <Breadcrumbs items={breadcrumbs} tone="default" className="mb-6" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_280px] lg:items-start lg:gap-8 xl:gap-10">
          {/* Left — copy */}
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.16em] text-accent-ink uppercase">
              {visibleTypeMeta.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.85rem,3.2vw,2.65rem)] leading-[1.08] font-bold tracking-tight text-foreground">
              {review.title}
            </h1>
            {review.subtitle && (
              <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
                {review.subtitle}
              </p>
            )}

            {author && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {author.image ? (
                  <Image
                    src={author.image.src}
                    alt={author.image.alt || author.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="flex size-10 items-center justify-center rounded-full bg-charcoal-800 text-[12px] font-bold tracking-wide text-white"
                    aria-hidden
                  >
                    {authorInitials(author.name)}
                  </span>
                )}
                <div className="min-w-0 text-sm">
                  <p className="text-foreground">
                    By{" "}
                    <Link
                      href={`/authors/${author.slug}`}
                      className="font-semibold hover:text-accent-ink"
                    >
                      {author.name}
                    </Link>
                  </p>
                  <p className="text-[13px] text-muted">
                    {[author.title, published ? formatVerifiedDate(published) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-border/80 pt-5">
              <p className="text-[10px] font-bold tracking-[0.14em] text-subtle uppercase">
                Review type
              </p>
              <div className="mt-2 flex items-start gap-2.5">
                <Footprints
                  className="mt-0.5 size-4 shrink-0 text-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div>
                  <p className="text-[14px] font-semibold text-foreground">
                    {visibleTypeMeta.typeBlockLabel}
                  </p>
                  <p className="mt-0.5 max-w-sm text-[13px] leading-snug text-muted">
                    {visibleTypeMeta.description}
                  </p>
                </div>
              </div>
              {showTestingModule && testingLine && (
                <p className="mt-3 text-[13px] font-medium text-foreground">
                  {testingLine}
                </p>
              )}
            </div>
          </div>

          {/* Center — product + atmosphere */}
          <div className="min-w-0">
            <div className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-sm lg:max-w-none">
              {atmosphereSrc && (
                <Image
                  src={atmosphereSrc}
                  alt=""
                  fill
                  className="object-cover object-center opacity-55 brightness-[0.7] saturate-[0.65]"
                  sizes="(max-width: 1024px) 80vw, 32vw"
                  priority
                />
              )}
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#f4f4f2]/85 via-[#f4f4f2]/25 to-transparent"
                aria-hidden
              />
              {heroImage ? (
                <div className="relative z-[1] flex h-full items-center justify-center p-3 sm:p-5">
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt || `${product.fullName} review`}
                    fill
                    className="object-contain p-3 drop-shadow-lg sm:p-5"
                    sizes="(max-width: 1024px) 70vw, 32vw"
                    priority
                  />
                </div>
              ) : (
                <div className="relative z-[1] flex h-full items-center justify-center text-sm text-subtle">
                  {brand?.name ?? "Kitletics"}
                </div>
              )}
            </div>
            <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
              <Link
                href={`/products/${product.slug}`}
                className="text-[13px] font-semibold text-accent-ink hover:underline"
              >
                View product details →
              </Link>
              {!amazon && offers.length > 0 ? (
                <Link
                  href="#offers"
                  className="text-[13px] font-semibold text-accent-ink hover:underline"
                >
                  View prices →
                </Link>
              ) : null}
            </p>
          </div>

          {/* Right — score panel */}
          <div className="lg:pt-1">
            <ReviewScorePanel
              displayScore={displayScore}
              scoreBandLabel={scoreBandLabel}
              heroCriteria={heroCriteria}
              amazonOffer={amazon}
              productName={product.fullName}
              lowestPrice={data.lowestPrice}
              hasRegionalOffers={offers.length > 0}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
