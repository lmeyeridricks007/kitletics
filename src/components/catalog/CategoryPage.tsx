import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  BestGuideCard,
  ComparisonCard,
  BuyingGuideCard,
} from "@/components/cards/ContentCards";
import { ToolCard } from "@/components/cards/ToolCard";
import { CatalogInteractive } from "@/components/catalog/CatalogInteractive";
import { ShopByTypeChips } from "@/components/catalog/ShopByTypeChips";
import { CategoryDecisionSection } from "@/components/catalog/CategoryDecisionSection";
import { BrandMark } from "@/components/brands/BrandMark";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/jsonld";
import type { AssembledCategoryPage } from "@/lib/catalog/assemble";
import { brandAccentHex } from "@/lib/brands/brand-colors";
import { siteConfig } from "@/content/config";

export function CategoryPage({ data }: { data: AssembledCategoryPage }) {
  const {
    sport,
    category,
    config,
    catalog,
    featuredSubcategories,
    otherSubcategories,
    goalUseCases,
    runnerUseCases,
    picks,
    bestGuides,
    comparisons,
    comparisonNames,
    buyingGuides,
    tools,
    brands,
    faqs,
    productCount,
    subcategoryCount,
    updatedAt,
  } = data;

  const updatedLabel = new Date(updatedAt).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          collectionPageJsonLd({
            name: category.name,
            description: category.description,
            url: data.basePath,
          }),
          catalog.products.length > 0
            ? itemListJsonLd(
                category.name,
                catalog.products.map((row) => ({
                  name: row.fullName,
                  url: `/products/${row.slug}`,
                })),
              )
            : null,
          faqPageJsonLd(faqs),
        ]}
      />

      {/* Compact hero */}
      <section className="border-b border-border bg-mesh">
        <Container className="py-6 sm:py-8">
          <Breadcrumbs items={data.breadcrumbs} className="mb-4" />
          <div className="max-w-2xl space-y-3">
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase">
              {sport.name}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {config.hero.title}
            </h1>
            <p className="text-[15px] text-muted">{config.hero.description}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <ButtonLink href={config.hero.primaryCta.href}>
                {config.hero.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={config.hero.secondaryCta.href} variant="outline">
                {config.hero.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
            <span>
              <strong className="font-medium text-foreground">{productCount}</strong>{" "}
              products in current catalog
            </span>
            {subcategoryCount > 0 && (
              <span>
                <strong className="font-medium text-foreground">
                  {subcategoryCount}
                </strong>{" "}
                shoe types
              </span>
            )}
            <span>Updated {updatedLabel}</span>
          </div>

          {featuredSubcategories.length > 0 && (
            <Suspense fallback={null}>
              <ShopByTypeChips
                basePath={data.basePath}
                items={[...featuredSubcategories, ...otherSubcategories].map(
                  (sub) => ({
                    id: sub.id,
                    slug: sub.slug,
                    name: sub.name,
                    productCount: sub.productCount,
                  }),
                )}
              />
            </Suspense>
          )}
        </Container>
      </section>

      {/* Catalog first — products are the page job */}
      <Section
        id="catalog"
        title={`All ${category.name}`}
        description={`Filterable catalog · ${productCount} products`}
      >
        <CatalogInteractive
          basePath={data.basePath}
          categoryName={category.name}
          filters={data.filters}
          facets={catalog.availableFilters}
          activeFilters={catalog.activeFilters}
          products={catalog.products}
          total={catalog.total}
          availableSorts={catalog.availableSorts}
          primaryFilterKeys={config.primaryFilterKeys}
          finderHref={
            config.finder
              ? `/tools/${config.finder.toolSlug}`
              : undefined
          }
          compareCategorySlug={category.slug}
          page={catalog.page}
          totalPages={catalog.totalPages}
        />
      </Section>

      {goalUseCases.length > 0 && (
        <Section
          muted
          title="Shop by goal"
          description="Prefilter the catalog by how you train."
        >
          <div className="flex flex-wrap gap-2">
            {goalUseCases.map((uc) => (
              <Link
                key={uc.id}
                href={uc.href}
                className="border border-border bg-surface px-3.5 py-2 text-sm font-medium transition-colors hover:border-foreground"
              >
                {uc.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {runnerUseCases.length > 0 && (
        <Section
          title="Find shoes for you"
          description="Jump to shortlists or prefiltered catalog views."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {runnerUseCases.map((uc) => (
              <Link
                key={uc.id}
                href={uc.href}
                className="border border-border bg-surface p-4 transition-colors hover:border-foreground"
              >
                <h3 className="font-display text-base font-semibold">{uc.name}</h3>
                <p className="mt-1 text-sm text-muted">{uc.description}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {config.finder && (
        <Section>
          <div className="overflow-hidden border border-border bg-charcoal-950 p-6 text-white sm:p-8 dark:bg-charcoal-900">
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
              {config.finder.headline}
            </p>
            <h2 className="mt-2 max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {config.finder.title}
            </h2>
            <p className="mt-2 max-w-xl text-[15px] text-white/75">
              {config.finder.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={`/tools/${config.finder.toolSlug}`} size="lg">
                {config.finder.ctaLabel}
              </ButtonLink>
              {tools.some((t) => t.slug === "shoe-rotation-planner") && (
                <ButtonLink
                  href="/tools/shoe-rotation-planner"
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Already own shoes? Build your rotation
                </ButtonLink>
              )}
            </div>
          </div>
        </Section>
      )}

      {picks.length > 0 && (
        <Section
          muted
          title="Kitletics Picks"
          description="Structured recommendation labels — not inferred from scores alone."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {picks.map((pick) => (
              <Link
                key={pick.label}
                href={`/products/${pick.product.slug}`}
                className="border border-border bg-surface p-5 transition-colors hover:border-foreground"
              >
                <Badge variant="accent">{pick.label}</Badge>
                {pick.brandName && (
                  <p className="mt-3 text-xs font-medium tracking-wide text-muted uppercase">
                    {pick.brandName}
                  </p>
                )}
                <h3 className="mt-1 font-display text-lg font-semibold">
                  {pick.product.name}
                </h3>
                {pick.rationale && (
                  <p className="mt-2 text-sm text-muted">{pick.rationale}</p>
                )}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {bestGuides.length > 0 && (
        <Section
          muted
          title={`Best ${category.name}`}
          description="Editorial decision pages — not a duplicate of the filter UI."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bestGuides.map((guide) => (
              <BestGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </Section>
      )}

      {comparisons.length > 0 && (
        <Section
          title={`${category.name} comparisons`}
          description="Side-by-side picks with product photos — open any pair for the full breakdown."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((comparison) => (
              <ComparisonCard
                key={comparison.id}
                comparison={comparison}
                productNames={comparisonNames[comparison.id]}
              />
            ))}
          </div>
        </Section>
      )}

      {config.decision && <CategoryDecisionSection decision={config.decision} />}

      {config.educationFactors.length > 0 && (
        <Section
          muted
          title={config.decision ? "More decision factors" : "How to choose"}
          description="Decision factors — deeper detail lives in buying guides."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.educationFactors.map((factor, index) => (
              <div
                key={factor.title}
                className="border border-border bg-surface p-5"
              >
                <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
                  {index + 1}. {factor.title}
                </p>
                <p className="mt-2 text-sm text-muted">{factor.body}</p>
                <Link
                  href={factor.href}
                  className="mt-3 inline-block text-sm font-medium text-accent-ink hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </Section>
      )}

      {config.terminology.length > 0 && (
        <Section
          title="Terminology"
          description="Quick definitions that make filters easier to use."
        >
          <div className="divide-y divide-border border border-border bg-surface">
            {config.terminology.map((item) => (
              <details key={item.term} className="group px-5 py-3">
                <summary className="cursor-pointer list-none font-display text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.term}
                    <span className="text-subtle transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-2 pb-2 text-sm text-muted">{item.definition}</p>
              </details>
            ))}
          </div>
        </Section>
      )}

      {tools.length > 0 && (
        <Section muted title={`${category.name} tools`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} featured={tool.type === "finder"} />
            ))}
          </div>
        </Section>
      )}

      {buyingGuides.length > 0 && (
        <Section title="Buying guides">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buyingGuides.map((guide) => (
              <BuyingGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </Section>
      )}

      {brands.length > 0 && (
        <Section
          muted
          title={`${category.name} brands`}
          description="Only brands with published products in this category."
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map(({ brand, count }) => {
              const accent = brandAccentHex(brand.slug);
              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-border bg-white px-3 py-3 transition-colors hover:border-accent"
                >
                  <BrandMark brand={brand} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold text-foreground">
                      {brand.name}
                    </span>
                    <span className="block text-[11px] text-subtle tabular-nums">
                      {count} {count === 1 ? "product" : "products"}
                    </span>
                  </span>
                  {accent ? (
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `#${accent}` }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {faqs.length > 0 && (
        <Section
          title={`${category.name} FAQ`}
          description={`Practical answers from ${siteConfig.name} — not medical advice.`}
        >
          <div className="divide-y divide-border border border-border bg-surface">
            {faqs.map((faq) => (
              <details key={faq.id} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-display text-base font-semibold [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={`/${sport.slug}`} className="text-accent-ink hover:underline">
            ← {sport.name} hub
          </Link>
          <Link href="/gear" className="text-accent-ink hover:underline">
            All gear
          </Link>
          <Link href="/brands" className="text-accent-ink hover:underline">
            Brands
          </Link>
          <Link href="/compare" className="text-accent-ink hover:underline">
            Compare
          </Link>
        </div>
      </Section>
    </>
  );
}
