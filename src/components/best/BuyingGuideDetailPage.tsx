import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { BestGuideCard } from "@/components/cards/ContentCards";
import { AuthorCard } from "@/components/review/AuthorCard";
import {
  JsonLdScript,
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/jsonld";
import type { BuyingGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { GuideRelatedComparisons } from "@/components/best/BestGuideRelatedComparisons";

export function BuyingGuideDetailPage({ data }: { data: BuyingGuidePageData }) {
  const {
    guide,
    author,
    relatedProducts,
    useCases,
    bestGuides,
    tools,
    faqs,
    shoeDatabaseLink,
  } = data;

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          articleJsonLd({
            title: guide.title,
            description:
              guide.shortDescription ??
              guide.quickAnswer ??
              guide.sections[0]?.body ??
              guide.title,
            url: `/guides/${guide.slug}`,
            datePublished: guide.publishedAt,
            dateModified: guide.updatedAt,
            authorName: author?.name,
          }),
          faqPageJsonLd(faqs),
        ]}
      />

      <section className="border-b border-border bg-mesh">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs items={data.breadcrumbs} className="mb-6" />
          <p className="text-[11px] font-medium tracking-[0.14em] text-subtle uppercase">
            Buying guide
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {guide.title}
          </h1>
          {guide.subtitle && (
            <p className="mt-3 max-w-2xl text-lg text-muted">{guide.subtitle}</p>
          )}
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        {guide.quickAnswer && (
          <section className="max-w-2xl border-l-2 border-accent pl-5">
            <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              Quick answer
            </p>
            <p className="mt-2 text-lg text-foreground leading-relaxed">
              {guide.quickAnswer}
            </p>
          </section>
        )}

        <div className="mt-12 max-w-2xl space-y-10">
          {guide.sections.map((section) => (
            <section key={section.id}>
              <h2 className="font-display text-2xl font-semibold">
                {section.heading}
              </h2>
              <p className="mt-3 text-muted leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        {useCases.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl font-semibold">
              Common use cases
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {useCases.map((uc) => (
                <li
                  key={uc.id}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted"
                >
                  {uc.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl font-semibold">
              Example products
            </h2>
            <p className="mt-2 text-sm text-muted">
              Illustrative catalog products — see Best Guides for ranked
              recommendations.
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {relatedProducts.map(({ product, brand }) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-block border border-border px-4 py-2 text-sm font-medium hover:border-accent"
                  >
                    {brand?.name} {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <GuideRelatedComparisons comparisons={data.relatedComparisons} />

        {bestGuides.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl font-semibold">
              Related best guides
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {bestGuides.map((g) => (
                <BestGuideCard key={g.id} guide={g} />
              ))}
            </div>
          </section>
        )}

        {tools[0] && (
          <section className="mt-14 border-y border-border py-8">
            <p className="font-display text-xl font-semibold">
              Want a personalised shortlist?
            </p>
            <ButtonLink href={`/tools/${tools[0].slug}`} className="mt-4">
              {tools[0].name}
            </ButtonLink>
          </section>
        )}

        {shoeDatabaseLink && (
          <section className="mt-14 border border-border bg-[#f5f6f7] p-5 sm:p-6">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Specs across the market
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {shoeDatabaseLink.label}
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
              {shoeDatabaseLink.description}
            </p>
            <ButtonLink href={shoeDatabaseLink.href} className="mt-4" variant="outline">
              Open {shoeDatabaseLink.label}
            </ButtonLink>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="mt-14 max-w-2xl">
            <h2 className="font-display text-2xl font-semibold">FAQ</h2>
            <div className="mt-6 space-y-5">
              {faqs.map((faq) => (
                <div key={faq.id}>
                  <h3 className="font-medium">{faq.question}</h3>
                  <p className="mt-2 text-sm text-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {author && (
          <div className="mt-14 max-w-md">
            <AuthorCard author={author} />
          </div>
        )}
      </Container>
    </>
  );
}
