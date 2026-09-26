import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  Scale,
  Target,
  Footprints,
  CalendarDays,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductMediaGallery } from "@/components/product/ProductMediaGallery";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { readPublicSpecValue } from "@/lib/specs/public-label";
import {
  SpecificationSummary,
  SpecificationGroup,
} from "@/components/product/SpecificationBlocks";
import {
  ProductCommerceIsland,
  CommercePeerPrice,
} from "@/components/product/ProductCommerceIsland";
import { ProductHeroCommerce } from "@/components/product/ProductHeroCommerce";
import {
  CommerceOfferPanel,
  CommercePricesChecked,
} from "@/components/product/CommerceOfferPanel";
import { productPageDataToCommerce } from "@/lib/product/product-commerce-from-page";
import type { CommercePrice } from "@/lib/product/product-commerce";
import {
  ProductAudienceSummary,
  ProductFitSizingPanel,
} from "@/components/product/ProductFitSizingPanel";
import { Suspense } from "react";
import {
  UseCasePerformance,
  HyroxPerformanceModule,
  ProductFamilySection,
  EvidenceSummary,
} from "@/components/product/ProductSections";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";
import {
  ProductReviewSection,
  ProductSourcesEvidence,
} from "@/components/product/ProductReviewSection";
import { getProductReviewSummary } from "@/lib/product/get-product-review-summary";
import { ProductAnchorNav } from "@/components/product/ProductAnchorNav";
import { ToolCard } from "@/components/cards/ToolCard";
import { BestGuideCard, BuyingGuideCard } from "@/components/cards/ContentCards";
import { TrustRow } from "@/components/home/TrustRow";
import { HorizontalPeekRail } from "@/components/ui/HorizontalPeekRail";
import {
  JsonLdScript,
  productJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  reviewJsonLd,
} from "@/lib/seo/jsonld";
import { formatVerifiedDate, getScoreBand } from "@/lib/product/score";
import { getPrimaryProductMedia, canFeatureProduct } from "@/lib/product/media";
import { getLowestOfferPrice, getProductById, getBrandById } from "@/repositories";
import { cn } from "@/lib/utils";
import { getProductDetailConfig } from "@/lib/product/product-detail-config";
import type { ProductPageData } from "@/lib/product/get-product-page-data";

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

export function ProductDetailPage({ data }: { data: ProductPageData }) {
  const {
    product,
    brand,
    category,
    featuredSpecs,
    specGroups,
    recommendations,
    bestFor,
    offers,
    review,
    alternatives,
    family,
    familyMembers,
    newerGeneration,
    olderGeneration,
    evidence,
    hasPersonalTest,
    bestGuides,
    buyingGuides,
    tools,
    faqs,
    comparisons,
    galleryImages,
    heroTags,
    quickFacts,
    variants,
    padelEditorial,
    padelSoftEditorial,
    notIdealFor,
    buyIf,
    skipIf,
  } = data;

  const detailConfig = getProductDetailConfig(product.categoryId);
  const mediaAspectClass =
    detailConfig.mediaAspect === "tall"
      ? "aspect-[3/4]"
      : detailConfig.mediaAspect === "square"
        ? "aspect-square"
        : undefined;

  const compareProduct = {
    slug: product.slug,
    name: product.name,
    brandName: brand?.name,
    categoryId: product.categoryId,
    categorySlug: category?.slug ?? "",
  };

  const hasHyroxRec = recommendations.some(
    (r) =>
      r.recommendation.sportId === "sport-hyrox" ||
      r.recommendation.useCaseId?.includes("hyrox"),
  );

  const catalogScore = product.recommendationScore;
  const heroScore = catalogScore ?? review?.score;
  const band = heroScore !== undefined ? getScoreBand(heroScore) : undefined;
  const showHeroScore = heroScore !== undefined && Boolean(band);
  const factors = data.scoreExplainFactors.slice(
    0,
    data.padelDecisionAttributes.length > 0 ? 7 : 6,
  );
  const reviewSummary = review
    ? getProductReviewSummary({
        productSlug: product.slug,
        region: data.region,
        pageData: data,
      })
    : undefined;

  const anchorItems = [
    { id: "overview", label: "Overview" },
    padelEditorial ? { id: "how-it-plays", label: "How it plays" } : null,
    padelSoftEditorial && !padelEditorial
      ? { id: "how-to-choose", label: "How to choose" }
      : null,
    featuredSpecs.length > 0 || specGroups.length > 0
      ? { id: "specs", label: "Specs" }
      : null,
    factors.length > 0 || recommendations.length > 0
      ? { id: "performance", label: "Performance" }
      : null,
    reviewSummary ? { id: "review", label: "Review" } : null,
    comparisons.length > 0 || alternatives.length > 0
      ? { id: "compare", label: "Compare" }
      : null,
    alternatives.length > 0
      ? { id: "alternatives", label: "Alternatives" }
      : null,
    { id: "offers", label: "Prices" },
    reviewSummary || evidence.length > 0
      ? { id: "evidence", label: "Evidence" }
      : null,
    faqs.length > 0 ? { id: "faq", label: "FAQ" } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  const midsole = String(readPublicSpecValue(product.specifications, "midsole") ?? "");
  const outsole = String(readPublicSpecValue(product.specifications, "outsole") ?? "");
  const techItems = [
    midsole
      ? {
          id: "midsole",
          title: midsole.split(/[+/,]/)[0]?.trim() || "Midsole",
          body: midsole,
        }
      : null,
    outsole
      ? {
          id: "outsole",
          title: outsole.split(/[+/,]/)[0]?.trim() || "Outsole",
          body: outsole,
        }
      : null,
    readPublicSpecValue(product.specifications, "plate")
      ? {
          id: "plate",
          title: String(
            readPublicSpecValue(product.specifications, "plateMaterial") ?? "Plate",
          ),
          body: "Structured plate for stiffness and ride character.",
        }
      : null,
  ].filter(Boolean) as { id: string; title: string; body: string }[];

  // Compare rail: current + up to 3 comparison partners
  const compareRail = buildCompareRail(data);

  // Unique alternatives (dedupe by product id), max 3
  const uniqueAlts = [];
  const seenAlt = new Set<string>();
  for (const alt of alternatives) {
    if (seenAlt.has(alt.product.id)) continue;
    if (!canFeatureProduct(alt.product) && !getPrimaryProductMedia(alt.product))
      continue;
    seenAlt.add(alt.product.id);
    uniqueAlts.push(alt);
    if (uniqueAlts.length >= 3) break;
  }

  const peerPrices: Record<string, CommercePrice | null> = {};
  for (const id of new Set([
    ...product.alternativeProductIds,
    ...product.relatedProductIds,
  ])) {
    const price = getLowestOfferPrice(id, data.region);
    peerPrices[id] = price
      ? {
          amount: price.price,
          currency: price.currency,
          offerId: price.offerId,
        }
      : null;
  }
  const initialCommerce = productPageDataToCommerce(data, peerPrices);

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          productJsonLd(product, offers.map((o) => o.offer), brand?.name),
          review ? reviewJsonLd(review, product) : null,
          faqPageJsonLd(faqs),
        ]}
      />

      <ProductCommerceIsland
        slug={product.slug}
        initialCommerce={initialCommerce}
      >
      {/* Hero */}
      <section className="border-b border-border bg-white">
        <Container size="wide" className="py-5 sm:py-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Breadcrumbs items={data.breadcrumbs} />
            <div className="flex items-center gap-2">
              <AddToCompareButton
                product={compareProduct}
                source="product-detail"
                variant="outline"
                size="sm"
                labelStyle="compact"
              />
            </div>
          </div>

          {/* Identity — above gallery + score, matching mockup */}
          <div className="max-w-3xl">
            {brand && (
              <Link
                href={`/brands/${brand.slug}`}
                className="text-[12px] font-medium tracking-[0.14em] text-muted uppercase"
              >
                {brand.name}
              </Link>
            )}
            <div className="mt-1 flex flex-wrap items-end gap-3">
              <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-bold tracking-tight text-foreground">
                {product.name}
              </h1>
              {showHeroScore && heroScore !== undefined && band && (
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 min-w-9 items-center justify-center rounded-[4px] bg-score px-1.5 text-[14px] font-bold text-score-foreground tabular-nums">
                    {displayScore(heroScore)}
                  </span>
                  <span className="text-[12px] font-bold tracking-wide text-foreground uppercase">
                    {band.label}
                  </span>
                  {heroScore >= 90 && (
                    <>
                      <span className="text-border" aria-hidden>
                        |
                      </span>
                      <span className="text-[12px] font-medium text-muted">
                        Recommended
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              {product.shortDescription}
            </p>
            <ProductAudienceSummary
              product={product}
              variants={variants}
            />
            {heroTags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {heroTags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md border border-border bg-surface-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <div className="min-w-0">
              <ProductMediaGallery
                images={galleryImages}
                productName={product.fullName}
                categoryLabel={category?.name}
                layout="pdp"
                imageFit="contain"
                mainAspectClass={mediaAspectClass}
              />
            </div>

            <aside className="space-y-3 lg:sticky lg:top-[calc(var(--site-chrome-height)+1rem)]">
              {variants.length > 0 && (
                <Suspense fallback={null}>
                  <ProductFitSizingPanel
                    product={product}
                    variants={variants}
                  />
                </Suspense>
              )}
              {showHeroScore && heroScore !== undefined && band && (
                <div className="rounded-lg border border-border bg-white p-4">
                  <div className="flex items-end gap-2.5">
                    <span className="font-display text-4xl font-bold tabular-nums text-foreground">
                      {displayScore(heroScore)}
                    </span>
                    <div className="pb-1">
                      <p className="text-[11px] font-bold tracking-wide text-foreground uppercase">
                        {band.label}
                      </p>
                      <p className="text-[11px] text-muted">Kitletics Score</p>
                    </div>
                  </div>
                  {factors.length > 0 && (
                    <ul className="mt-4 space-y-2.5">
                      {factors.map((f) => (
                        <li key={f.label}>
                          <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                            <span className="text-muted">{f.label}</span>
                            <span className="font-semibold tabular-nums text-foreground">
                              {displayScore(f.score)}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{
                                width: `${Math.min(100, Math.max(0, f.score))}%`,
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/methodology"
                    className="mt-3 inline-block text-[12px] font-medium text-link hover:underline"
                  >
                    How we score →
                  </Link>
                </div>
              )}

              <ProductHeroCommerce
                lifecycleStatus={product.lifecycleStatus}
                newerGeneration={
                  newerGeneration
                    ? { slug: newerGeneration.slug, name: newerGeneration.name }
                    : undefined
                }
              />
            </aside>
          </div>
        </Container>
      </section>

      {/* Quick facts */}
      {quickFacts.length > 0 && (
        <section className="border-b border-border bg-[#f6f7f8]">
          <Container size="wide">
            <ul className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
              {quickFacts.map((fact, i) => (
                <li
                  key={fact.id}
                  className={cn(
                    "flex gap-3 px-0 py-4 sm:px-4 lg:py-5",
                    i > 0 && "lg:border-l lg:border-border",
                  )}
                >
                  <QuickFactIcon index={i} />
                  <span>
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">
                      {fact.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] font-medium text-foreground">
                      {fact.value}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <ProductAnchorNav items={anchorItems} />

      <Container size="wide" className="space-y-12 py-9 sm:py-11">
        {/* Overview + At a glance */}
        <section
          id="overview"
          className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10"
        >
          <div>
            <h2 className="heading-section">Overview</h2>
            <div className="mt-3 max-w-2xl space-y-3 text-[14px] leading-relaxed text-muted">
              <p>{product.shortDescription}</p>
              {data.verdict && <p>{data.verdict}</p>}
              {!data.verdict && product.strengths[0] && (
                <p>
                  Kitletics notes particular strengths around{" "}
                  {product.strengths.slice(0, 2).join(" and ").toLowerCase()}.
                </p>
              )}
            </div>
            {product.strengths.length > 0 && (
              <ul className="mt-5 space-y-2">
                {product.strengths.slice(0, 4).map((s) => (
                  <li
                    key={s}
                    className="flex gap-2 text-[13px] text-foreground"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-accent"
                      strokeWidth={2.5}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}

            {reviewSummary && (
              <div className="mt-6 rounded-lg border border-border bg-surface-muted/40 p-4">
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
                  {reviewSummary.presentation === "full-review"
                    ? "Kitletics Review"
                    : "Product analysis"}{" "}
                  · {reviewSummary.displayScore} {reviewSummary.scoreLabel}
                </p>
                <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-foreground">
                  {reviewSummary.verdict}
                </p>
                <a
                  href="#review"
                  className="mt-3 inline-block text-[13px] font-medium text-link hover:underline"
                >
                  {reviewSummary.presentation === "full-review"
                    ? "Read Kitletics Review →"
                    : "See product analysis →"}
                </a>
              </div>
            )}
          </div>

          {featuredSpecs.length > 0 && (
            <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
              <h3 className="text-[13px] font-bold tracking-wide text-foreground uppercase">
                At a glance
              </h3>
              <dl className="mt-3 divide-y divide-border">
                {featuredSpecs.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-baseline justify-between gap-4 py-2 text-[13px]"
                  >
                    <dt className="text-muted">{row.label}</dt>
                    <dd className="text-right font-medium text-foreground">
                      {row.value}
                      {row.unit ? ` ${row.unit}` : ""}
                    </dd>
                  </div>
                ))}
                {category && (
                  <div className="flex items-baseline justify-between gap-4 py-2 text-[13px]">
                    <dt className="text-muted">Category</dt>
                    <dd className="text-right font-medium text-foreground">
                      {category.name}
                    </dd>
                  </div>
                )}
                {bestFor[0] && (
                  <div className="flex items-baseline justify-between gap-4 py-2 text-[13px]">
                    <dt className="text-muted">Best for</dt>
                    <dd className="text-right font-medium text-foreground">
                      {bestFor[0].replace(/\.$/, "")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </section>

        {padelEditorial && (
          <section
            id="how-it-plays"
            className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-6"
          >
            <h2 className="heading-section">How to think about this racket</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  ["What it is", padelEditorial.whatItIs],
                  ["Who it's for", padelEditorial.whoItsFor],
                  ["How it plays", padelEditorial.howItPlays],
                  ["Power vs control", padelEditorial.powerVsControl],
                  ["Handling", padelEditorial.handling],
                  ["Comfort", padelEditorial.comfort],
                  ["Sweet spot / forgiveness", padelEditorial.forgiveness],
                  ["Materials", padelEditorial.construction],
                ] as const
              ).map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-white p-4 sm:p-5"
                >
                  <h3 className="text-[13px] font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>
            {(buyIf.length > 0 || skipIf.length > 0) && (
              <div className="grid gap-4 md:grid-cols-2">
                {buyIf.length > 0 && (
                  <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
                    <h3 className="text-[13px] font-bold text-foreground">
                      Buy if
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {buyIf.map((line) => (
                        <li
                          key={line}
                          className="flex gap-2 text-[13px] text-foreground"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-accent"
                            strokeWidth={2.5}
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {skipIf.length > 0 && (
                  <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
                    <h3 className="text-[13px] font-bold text-foreground">
                      Skip if
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {skipIf.map((line) => (
                        <li
                          key={line}
                          className="flex gap-2 text-[13px] text-foreground"
                        >
                          <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
                            <X className="size-2.5" strokeWidth={3} />
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {notIdealFor.length > 0 && (
              <p className="text-[13px] text-muted">
                Not ideal for: {notIdealFor.join(" · ")}
              </p>
            )}
          </section>
        )}

        {padelSoftEditorial && !padelEditorial && (
          <section
            id="how-to-choose"
            className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-6"
          >
            <h2 className="heading-section">
              {padelSoftEditorial.category === "shoes"
                ? "How to think about this shoe"
                : padelSoftEditorial.category === "balls"
                  ? "How to think about this ball"
                  : padelSoftEditorial.category === "bags"
                    ? "How to think about this bag"
                    : padelSoftEditorial.category === "grips"
                      ? "How to think about this grip"
                      : "How to think about this accessory"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  ["What it is", padelSoftEditorial.whatItIs],
                  ["Who it's for", padelSoftEditorial.whoItsFor],
                  ["Why choose it", padelSoftEditorial.whyChooseIt],
                  ["What to pick instead", padelSoftEditorial.chooseInstead],
                  ...padelSoftEditorial.topicBlocks.map(
                    (b) => [b.title, b.body] as [string, string],
                  ),
                ] as const
              ).map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-white p-4 sm:p-5"
                >
                  <h3 className="text-[13px] font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>
            {padelSoftEditorial.strengthsNarrative.length > 0 && (
              <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
                <h3 className="text-[13px] font-bold text-foreground">
                  Meaningful strengths
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] text-muted">
                  {padelSoftEditorial.strengthsNarrative.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {padelSoftEditorial.tradeoffsNarrative.length > 0 && (
              <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
                <h3 className="text-[13px] font-bold text-foreground">
                  Trade-offs that matter
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] text-muted">
                  {padelSoftEditorial.tradeoffsNarrative.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {(buyIf.length > 0 || skipIf.length > 0) && (
              <div className="grid gap-4 md:grid-cols-2">
                {buyIf.length > 0 && (
                  <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
                    <h3 className="text-[13px] font-bold text-foreground">
                      Buy if
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {buyIf.map((line) => (
                        <li
                          key={line}
                          className="flex gap-2 text-[13px] text-foreground"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-accent"
                            strokeWidth={2.5}
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {skipIf.length > 0 && (
                  <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
                    <h3 className="text-[13px] font-bold text-foreground">
                      Skip if
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {skipIf.map((line) => (
                        <li
                          key={line}
                          className="flex gap-2 text-[13px] text-foreground"
                        >
                          <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
                            <X className="size-2.5" strokeWidth={3} />
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {notIdealFor.length > 0 && (
              <p className="text-[13px] text-muted">
                Not ideal for: {notIdealFor.join(" · ")}
              </p>
            )}
          </section>
        )}

        {/* Performance / Pros / Tech */}
        <section
          id="performance"
          className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] grid gap-4 lg:grid-cols-3"
        >
          {factors.length > 0 && (heroScore !== undefined || padelEditorial) && (
            <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
              <h2 className="heading-section">
                {hasPersonalTest
                  ? "Test results"
                  : padelEditorial
                    ? "How it decides"
                    : detailConfig.performanceSectionTitle}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {factors.map((f) => (
                  <li key={f.label}>
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span className="text-muted">{f.label}</span>
                      <span className="font-semibold tabular-nums">
                        {displayScore(f.score)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, f.score)}%` }}
                      />
                    </div>
                    {f.explanation ? (
                      <p className="mt-1 text-[11px] leading-snug text-muted">
                        {f.explanation}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {heroScore !== undefined ? (
                <>
                  <p className="mt-4 inline-flex rounded-md bg-accent px-2.5 py-1.5 text-[12px] font-bold text-accent-foreground">
                    Overall score: {displayScore(heroScore)}
                  </p>
                  {catalogScore === undefined && padelEditorial ? (
                    <p className="mt-2 text-[11px] leading-snug text-muted">
                      Research score from published specs and manufacturer positioning, not a hitting test.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-4 text-[11px] leading-snug text-muted">
                  These are explainable buying attributes with source type, not
                  laboratory measurements or a Kitletics overall score.
                </p>
              )}
            </div>
          )}

          {(product.strengths.length > 0 || product.weaknesses.length > 0) && (
            <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
              <h2 className="heading-section">Pros & cons</h2>
              {product.strengths.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
                    Pros
                  </p>
                  <ul className="mt-2 space-y-2">
                    {product.strengths.map((s) => (
                      <li
                        key={s}
                        className="flex gap-2 text-[13px] text-foreground"
                      >
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-accent"
                          strokeWidth={2.5}
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {product.weaknesses.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
                    Cons
                  </p>
                  <ul className="mt-2 space-y-2">
                    {product.weaknesses.map((s) => (
                      <li
                        key={s}
                        className="flex gap-2 text-[13px] text-foreground"
                      >
                        <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
                          <X className="size-2.5" strokeWidth={3} />
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {techItems.length > 0 && (
            <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
              <h2 className="heading-section">Key technologies</h2>
              <ul className="mt-4 space-y-3">
                {techItems.map((t) => (
                  <li key={t.id}>
                    <p className="text-[13px] font-bold text-foreground">
                      {t.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted">
                      {t.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {recommendations.length > 0 && (
          <section className="space-y-4">
            <h2 className="heading-section">How it fits different uses</h2>
            <UseCasePerformance rows={recommendations} />
          </section>
        )}

        {hasHyroxRec && <HyroxPerformanceModule rows={recommendations} />}

        {reviewSummary && <ProductReviewSection data={reviewSummary} />}

        {/* Compare + Alternatives */}
        {(compareRail.length > 1 || uniqueAlts.length > 0) && (
          <section
            id="compare"
            className="min-w-0 max-w-full scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-10"
          >
            {compareRail.length > 1 && (
              <div className="min-w-0 max-w-full">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 className="heading-section">Compare with</h2>
                  <Link
                    href={
                      comparisons[0]
                        ? `/compare/${comparisons[0].slug}`
                        : `/compare?category=${category?.slug ?? ""}`
                    }
                    className="link-accent text-[12px]"
                  >
                    View full comparison →
                  </Link>
                </div>
                <HorizontalPeekRail className="gap-2 sm:grid sm:grid-cols-4 sm:snap-none sm:overflow-visible sm:gap-3">
                  {compareRail.map((item, i) => (
                    <li
                      key={item.id}
                      className="relative flex w-[140px] shrink-0 snap-start flex-col sm:w-auto"
                    >
                      {i > 0 && (
                        <span className="absolute top-1/3 -left-2 z-10 hidden size-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-subtle uppercase sm:flex">
                          vs
                        </span>
                      )}
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-full flex-col overflow-hidden rounded-lg border bg-white p-2.5",
                          item.current
                            ? "border-accent ring-1 ring-accent"
                            : "border-border",
                        )}
                      >
                        <span className="relative mx-auto block h-20 w-full">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes={IMAGE_SIZES.compareRail}
                              quality={IMAGE_QUALITY.thumb}
                              loading="lazy"
                              className="object-contain"
                            />
                          ) : null}
                        </span>
                        <span className="mt-1 text-[10px] font-medium tracking-wide text-muted uppercase">
                          {item.brand}
                        </span>
                        <span className="text-[12px] leading-snug font-semibold text-foreground">
                          {item.name}
                        </span>
                        {item.score !== undefined && (
                          <span className="mt-1 inline-flex w-fit items-center gap-1">
                            <span className="rounded-[3px] bg-score px-1 text-[10px] font-bold text-score-foreground">
                              {displayScore(item.score)}
                            </span>
                          </span>
                        )}
                      <span className="mt-1 text-[11px] text-muted">
                        <CommercePeerPrice
                          productId={item.id}
                          fallback={item.price}
                          self={item.current}
                        />
                      </span>
                      </Link>
                    </li>
                  ))}
                </HorizontalPeekRail>
              </div>
            )}

            {uniqueAlts.length > 0 && (
              <div id="alternatives" className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]">
                <h2 className="heading-section mb-4">Top alternatives</h2>
                <ul className="divide-y divide-border border-y border-border">
                  {uniqueAlts.map((alt) => {
                    const media = getPrimaryProductMedia(alt.product);
                    const price = getLowestOfferPrice(alt.product.id, data.region);
                    return (
                      <li key={alt.product.id}>
                        <Link
                          href={`/products/${alt.product.slug}`}
                          className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-muted/40"
                        >
                          <span className="relative flex size-12 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                            {media ? (
                              <Image
                                src={media.src}
                                alt=""
                                fill
                                sizes={IMAGE_SIZES.altThumb}
                                quality={IMAGE_QUALITY.thumb}
                                loading="lazy"
                                className="object-contain p-1"
                              />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-semibold text-foreground">
                              {alt.brand?.name} {alt.product.name}
                            </span>
                            <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                              {alt.product.recommendationScore !== undefined && (
                                <span className="rounded-[3px] bg-score px-1 font-bold text-score-foreground">
                                  {displayScore(alt.product.recommendationScore)}
                                </span>
                              )}
                              {price && (
                                <span>
                                  <CommercePeerPrice
                                    productId={alt.product.id}
                                    fallback={{
                                      amount: price.price,
                                      currency: price.currency,
                                    }}
                                  />
                                </span>
                              )}
                            </span>
                          </span>
                          <span className="text-subtle" aria-hidden>
                            ›
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href={`/products/${product.slug}/alternatives`}
                  className="mt-3 inline-block text-[12px] font-medium text-link hover:underline"
                >
                  View all alternatives →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Specs */}
        {(featuredSpecs.length > 0 || specGroups.length > 0) && (
          <section id="specs" className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-6">
            <h2 className="heading-section">Specifications</h2>
            {featuredSpecs.length > 0 && (
              <SpecificationSummary rows={featuredSpecs} />
            )}
            {specGroups.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {specGroups.map((group) => (
                  <SpecificationGroup key={group.id} group={group} />
                ))}
              </div>
            )}          </section>
        )}

        {family && familyMembers.length > 1 && (
          <ProductFamilySection
            familyName={family.name}
            members={familyMembers}
            newer={newerGeneration}
            older={olderGeneration}
          />
        )}

        <CommerceOfferPanel productName={product.fullName} />

        {/* Sources & Evidence — supporting transparency (after prices) */}
        {reviewSummary ? (
          <ProductSourcesEvidence data={reviewSummary} />
        ) : (
          evidence.length > 0 && (
            <section
              id="evidence"
              className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-4"
            >
              <h2 className="heading-section">Sources & evidence</h2>
              <p className="max-w-2xl text-[13px] text-muted">
                Kitletics does not invent star ratings or buyer reviews. Below is
                the structured evidence behind this product page.
              </p>
              <EvidenceSummary
                evidence={evidence}
                hasPersonalTest={hasPersonalTest}
              />
            </section>
          )
        )}

        {(bestGuides.length > 0 || buyingGuides.length > 0) && (
          <section className="grid gap-4 sm:grid-cols-2">
            {bestGuides.slice(0, 2).map((g) => (
              <BestGuideCard key={g.id} guide={g} />
            ))}
            {buyingGuides.slice(0, 2).map((g) => (
              <BuyingGuideCard key={g.id} guide={g} />
            ))}
          </section>
        )}

        {tools.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </section>
        )}

        {faqs.length > 0 && (
          <section id="faq" className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-4">
            <h2 className="heading-section">FAQ</h2>
            <dl className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id}>
                  <dt className="font-semibold text-foreground">{faq.question}</dt>
                  <dd className="mt-1 text-sm text-muted">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <p className="text-[12px] text-subtle">
          {product.lastVerifiedAt && (
            <>
              Product data verified{" "}
              {formatVerifiedDate(product.lastVerifiedAt)}.{" "}
            </>
          )}
          <CommercePricesChecked />
        </p>
      </Container>

      <TrustRow />
      </ProductCommerceIsland>
    </>
  );
}

function QuickFactIcon({ index }: { index: number }) {
  const cls = "mt-0.5 size-4 shrink-0 text-foreground/55";
  if (index === 0) return <Target className={cls} strokeWidth={1.75} />;
  if (index === 1) return <Footprints className={cls} strokeWidth={1.75} />;
  if (index === 2) return <Scale className={cls} strokeWidth={1.75} />;
  return <CalendarDays className={cls} strokeWidth={1.75} />;
}

function buildCompareRail(data: ProductPageData) {
  const items: {
    id: string;
    name: string;
    brand: string;
    href: string;
    image?: string;
    score?: number;
    price?: { amount: number; currency: string };
    current?: boolean;
  }[] = [];

  const selfMedia = getPrimaryProductMedia(data.product);
  items.push({
    id: data.product.id,
    name: data.product.name,
    brand: data.brand?.name ?? "",
    href: `/products/${data.product.slug}`,
    image: selfMedia?.src,
    score: data.product.recommendationScore,
    price: data.lowestPrice
      ? { amount: data.lowestPrice.price, currency: data.lowestPrice.currency }
      : undefined,
    current: true,
  });

  for (const c of data.comparisons.slice(0, 3)) {
    const otherId = c.productIds.find((id) => id !== data.product.id);
    if (!otherId) continue;
    const other = getProductById(otherId);
    if (!other) continue;
    const media = getPrimaryProductMedia(other);
    const price = getLowestOfferPrice(other.id, data.region);
    const otherBrand = getBrandById(other.brandId);
    items.push({
      id: other.id,
      name: other.name,
      brand: otherBrand?.name ?? "",
      href: `/compare/${c.slug}`,
      image: media?.src,
      score: other.recommendationScore,
      price: price
        ? { amount: price.price, currency: price.currency }
        : undefined,
    });
    if (items.length >= 4) break;
  }

  return items;
}
