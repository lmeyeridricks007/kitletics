import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { BestGuideHero } from "@/components/best/BestGuideHero";
import { UseCaseRecommendationHero } from "@/components/best/UseCaseRecommendationHero";
import { BestGuideQuickPicks } from "@/components/best/BestGuideQuickPicks";
import { BestGuideComparisonTable } from "@/components/best/BestGuideComparisonTable";
import { BestGuideDetailedPicks } from "@/components/best/BestGuideDetailedPicks";
import { BestGuideProductsConsidered } from "@/components/best/BestGuideProductsConsidered";
import { BestGuideLowerCards } from "@/components/best/BestGuideLowerCards";
import { BestGuideWhatWeLookFor } from "@/components/best/BestGuideWhatWeLookFor";
import {
  BestGuideQuickTake,
  BestGuideDecisionShortcuts,
  BestGuideContextComparison,
} from "@/components/best/BestGuideDecisionSections";
import { BestGuideRelatedComparisons } from "@/components/best/BestGuideRelatedComparisons";
import { TrustRow } from "@/components/home/TrustRow";
import { BestGuideCard } from "@/components/cards/ContentCards";
import {
  JsonLdScript,
  itemListJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  articleJsonLd,
} from "@/lib/seo/jsonld";
import type { BestGuidePageData } from "@/lib/best/get-best-guide-page-data";

export function BestGuideDetailPage({ data }: { data: BestGuidePageData }) {
  const {
    guide,
    author,
    recommendations,
    relatedGuides,
    faqs,
    isUseCaseGuide,
  } = data;

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          articleJsonLd({
            title: guide.title,
            description: guide.shortDescription ?? guide.intro,
            url: `/best/${guide.slug}`,
            datePublished: guide.publishedAt,
            dateModified: guide.updatedAt,
            authorName: author?.name,
          }),
          itemListJsonLd(
            guide.title,
            recommendations.map((r) => ({
              name: r.product.fullName,
              url: `/products/${r.product.slug}`,
            })),
          ),
          faqPageJsonLd(faqs),
        ]}
      />

      {isUseCaseGuide ? (
        <UseCaseRecommendationHero data={data} />
      ) : (
        <BestGuideHero data={data} />
      )}
      {/* Picks first — criteria come after the shortlist */}
      <BestGuideQuickPicks
        quickPicks={data.quickPicks}
        title={data.quickPicksTitle}
      />
      <BestGuideQuickTake data={data} />
      <BestGuideWhatWeLookFor data={data} />
      <BestGuideDetailedPicks data={data} />
      <BestGuideContextComparison data={data} />
      <BestGuideRelatedComparisons data={data} />
      <BestGuideDecisionShortcuts data={data} />      <BestGuideComparisonTable data={data} />
      <BestGuideProductsConsidered data={data} />
      <BestGuideLowerCards data={data} />
      <TrustRow />

      {(relatedGuides.length > 0 || faqs.length > 0) && (
        <Container size="wide" className="py-8">
          {relatedGuides.length > 0 && (
            <section>
              <h2 className="heading-section">More guides</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGuides.slice(0, 3).map((g) => (
                  <BestGuideCard key={g.id} guide={g} />
                ))}
              </div>
            </section>
          )}

          {faqs.length > 0 && (
            <section className={`max-w-2xl ${relatedGuides.length > 0 ? "mt-8" : ""}`}>
              <h2 className="heading-section">FAQ</h2>
              <div className="mt-4 space-y-4">
                {faqs.slice(0, 4).map((faq) => (
                  <div key={faq.id}>
                    <h3 className="text-[14px] font-semibold">{faq.question}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="mt-8 text-[11px] text-subtle">
            Kitletics may earn a commission from qualifying purchases. This does
            not affect our recommendations.{" "}
            <Link
              href="/affiliate-disclosure"
              className="text-link underline underline-offset-2 hover:text-link-hover"
            >
              Affiliate disclosure
            </Link>
          </p>
        </Container>
      )}
    </>
  );
}
