import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { OfferPanel } from "@/components/product/OfferPanel";
import { TrustRow } from "@/components/home/TrustRow";
import { LinkifiedText } from "@/components/editorial/LinkifiedText";
import { ReviewHero } from "@/components/review/ReviewHero";
import { ReviewSectionNav } from "@/components/review/ReviewSectionNav";
import { ReviewSummaryBlock } from "@/components/review/ReviewSummaryBlock";
import { ReviewPerformanceGauges } from "@/components/review/ReviewPerformanceGauges";
import { ReviewAssessment } from "@/components/review/ReviewAssessment";
import { ReviewEditorialSections } from "@/components/review/ReviewEditorialSections";
import { ReviewComparisonTable } from "@/components/review/ReviewComparisonTable";
import { ReviewRelatedLinks } from "@/components/review/ReviewRelatedLinks";
import { ReviewVerdictCard } from "@/components/review/ReviewVerdictCard";
import { pickAmazonOffer } from "@/lib/review/amazon-offer";
import {
  JsonLdScript,
  reviewJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  productJsonLd,
} from "@/lib/seo/jsonld";
import {
  PRODUCT_SOURCE_LABELS,
  type ReviewPageData,
} from "@/lib/review/get-review-page-data";
import { formatVerifiedDate } from "@/lib/product/score";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

function sourceDisclosure(data: ReviewPageData): string | undefined {
  const source =
    data.review.productSource ?? data.review.testingDetails?.productSource;
  if (!source) return data.review.editorialDisclosure;
  const label = PRODUCT_SOURCE_LABELS[source] ?? source;
  let text = `Product source: ${label}.`;
  if (
    source === "provided-by-brand" ||
    source === "loaned-by-brand" ||
    source === "retailer-sample"
  ) {
    text += " The supplier had no editorial control over this review.";
  }
  if (data.review.editorialDisclosure) {
    text += ` ${data.review.editorialDisclosure}`;
  }
  return text;
}

export function ReviewDetailPage({ data }: { data: ReviewPageData }) {
  const {
    review,
    product,
    brand,
    author,
    offers,
    offersOtherRegions,
    regionLabel,
    faqs,
    newerGeneration,
    sectionNav,
    showResearchModule,
    showTestingModule,
    comparisonTable,
    category,
  } = data;

  const disclosure = sourceDisclosure(data);
  const showAssessment = showResearchModule && !showTestingModule;
  const amazonOffer = pickAmazonOffer(offers);
  const mentionOptions = {
    excludeProductIds: [product.id],
    preferProductIds: [
      ...review.alternativeProductIds,
      ...comparisonTable.map((row) => row.product.id),
    ].filter((id) => id !== product.id),
  };

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          reviewJsonLd(review, product, author),
          productJsonLd(
            product,
            offers.map((o) => o.offer),
            brand?.name,
          ),
          faqPageJsonLd(faqs),
        ]}
      />

      <ReviewHero data={data} />
      <ReviewSectionNav items={sectionNav} />

      <Container size="wide" className="space-y-14 py-10 sm:space-y-16 sm:py-14">
        <ReviewSummaryBlock data={data} mentionOptions={mentionOptions} />
        <ReviewPerformanceGauges data={data} />
        {showAssessment ? <ReviewAssessment data={data} /> : null}
        <ReviewEditorialSections
          sections={review.sections}
          mentionOptions={mentionOptions}
          amazonOffer={amazonOffer}
          productName={product.fullName}
        />
        <ReviewComparisonTable
          rows={comparisonTable}
          categorySlug={category?.slug}
        />
        <ReviewRelatedLinks data={data} />

        <div className="space-y-8 border-t border-border pt-10">
          {newerGeneration && (
            <div className="border border-border bg-surface-muted/60 px-4 py-3.5 text-[14px] text-muted">
              A newer generation is available:{" "}
              <Link
                href={`/products/${newerGeneration.slug}`}
                className="font-semibold text-accent-ink hover:underline"
              >
                {newerGeneration.name}
              </Link>
            </div>
          )}

          <ReviewVerdictCard data={data} mentionOptions={mentionOptions} />

          <div className="border border-border bg-[#f7f7f5] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 className="text-[12px] font-bold tracking-[0.12em] text-foreground uppercase">
                About this review
              </h2>
              <p className="text-[12px] text-subtle">
                <Link
                  href="/how-we-review"
                  className="text-accent-ink hover:underline"
                >
                  How we review
                </Link>
                {" · "}
                <Link
                  href="/methodology"
                  className="text-accent-ink hover:underline"
                >
                  Methodology
                </Link>
              </p>
            </div>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              <div className="flex gap-2">
                <dt className="text-subtle">Type</dt>
                <dd className="font-medium text-foreground">
                  {data.visibleTypeMeta.label}
                </dd>
              </div>
              {author && (
                <div className="flex gap-2">
                  <dt className="text-subtle">Reviewer</dt>
                  <dd className="font-medium text-foreground">
                    <Link
                      href={`/authors/${author.slug}`}
                      className="text-accent-ink hover:underline"
                    >
                      {author.name}
                    </Link>
                  </dd>
                </div>
              )}
              {review.publishedAt && (
                <div className="flex gap-2">
                  <dt className="text-subtle">Published</dt>
                  <dd className="font-medium text-foreground">
                    {formatVerifiedDate(review.publishedAt)}
                  </dd>
                </div>
              )}
              {review.updatedAt && (
                <div className="flex gap-2">
                  <dt className="text-subtle">Updated</dt>
                  <dd className="font-medium text-foreground">
                    {formatVerifiedDate(review.updatedAt)}
                  </dd>
                </div>
              )}
              {review.lastVerifiedAt && (
                <div className="flex gap-2">
                  <dt className="text-subtle">Verified</dt>
                  <dd className="font-medium text-foreground">
                    {formatVerifiedDate(review.lastVerifiedAt)}
                  </dd>
                </div>
              )}
            </dl>
            {disclosure && (
              <p className="mt-3 text-[12px] leading-relaxed text-muted">
                {disclosure}
              </p>
            )}
          </div>

          {faqs.length > 0 && (
            <div>
              <h2 className="heading-section">FAQ</h2>
              <div className="mt-5 space-y-5">
                {faqs.map((faq) => (
                  <div key={faq.id}>
                    <h3 className="font-medium text-foreground">
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">
                      <LinkifiedText
                        text={faq.answer}
                        options={mentionOptions}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <section id="offers" className={SCROLL}>
          <OfferPanel
            offers={offers}
            otherRegionOffers={offersOtherRegions}
            regionLabel={regionLabel}
            productName={product.fullName}
            placement="review"
          />
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <Link
              href={`/products/${product.slug}`}
              className="text-[13px] font-semibold text-accent-ink hover:underline"
            >
              View full specifications and product details →
            </Link>
          </p>
        </section>
      </Container>

      <TrustRow />
    </>
  );
}
