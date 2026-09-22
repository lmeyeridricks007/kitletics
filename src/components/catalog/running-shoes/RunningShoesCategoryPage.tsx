import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { CatalogInteractive } from "@/components/catalog/CatalogInteractive";
import { ShoesCategoryHero } from "@/components/catalog/running-shoes/ShoesCategoryHero";
import { ShoesTypeNav } from "@/components/catalog/running-shoes/ShoesTypeNav";
import { ShoesBestAndFinder } from "@/components/catalog/running-shoes/ShoesBestAndFinder";
import { ShoesHowYouRun } from "@/components/catalog/running-shoes/ShoesHowYouRun";
import { ShoesGuidesAndComparisons } from "@/components/catalog/running-shoes/ShoesGuidesAndComparisons";
import { ShoesBrandStrip } from "@/components/catalog/running-shoes/ShoesBrandStrip";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/jsonld";
import type { ShoesCategoryPageData } from "@/lib/catalog/get-running-shoes-category-page";

export function RunningShoesCategoryPage({
  data,
}: {
  data: ShoesCategoryPageData;
}) {
  const updatedLabel = new Date(data.updatedAt).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          collectionPageJsonLd({
            name: data.category.name,
            description: data.category.description,
            url: data.basePath,
          }),
          data.catalog.products.length > 0
            ? itemListJsonLd(
                data.category.name,
                data.catalog.products.map((row) => ({
                  name: row.fullName,
                  url: `/products/${row.slug}`,
                })),
              )
            : null,
          faqPageJsonLd(data.faqs),
        ]}
      />

      <ShoesCategoryHero
        breadcrumbs={data.breadcrumbs}
        sportName={data.sport.name}
        title={data.config.hero.title}
        description={data.config.hero.description}
        primaryCta={data.config.hero.primaryCta}
        secondaryCta={data.config.hero.secondaryCta}
        productCount={data.productCount}
        subcategoryCount={data.subcategoryCount}
        updatedLabel={updatedLabel}
        heroProducts={data.heroProducts}
      />

      <Suspense fallback={null}>
        <ShoesTypeNav typeNav={data.typeNav} />
      </Suspense>

      <ShoesBestAndFinder
        bestSection={data.bestSection}
        finder={data.finder}
      />

      <ShoesHowYouRun howYouRun={data.howYouRun} />

      <section
        id="catalog"
        className="border-t border-border bg-white py-8 sm:py-9"
      >
        <Container size="wide">
          <div className="mb-5">
            <h2 className="heading-section">ALL RUNNING SHOES</h2>
            <p className="mt-2 max-w-2xl text-[14px] text-muted">
              Compare current running shoes by fit/sizing, type, cushioning,
              terrain, price and more. Use Men&apos;s / Women&apos;s / Unisex
              before browsing the grid.
            </p>
          </div>
          <Suspense fallback={null}>
          <CatalogInteractive
            basePath={data.basePath}
            categoryName={data.category.name}
            filters={data.filters}
            facets={data.catalog.availableFilters}
            activeFilters={data.catalog.activeFilters}
            products={data.catalog.products}
            total={data.catalog.total}
            availableSorts={data.catalog.availableSorts}
            primaryFilterKeys={data.config.primaryFilterKeys}
            compareCategorySlug={data.category.slug}
            finderHref="/tools/running-shoe-finder"
            compact
            mockupLayout
            page={data.catalog.page}
            totalPages={data.catalog.totalPages}
          />
          </Suspense>
        </Container>
      </section>

      <ShoesGuidesAndComparisons
        guideBlock={data.guideBlock}
        featuredComparisons={data.featuredComparisons}
        toolsSection={data.toolsSection}
      />

      <ShoesBrandStrip brandStrip={data.brandStrip} />
    </>
  );
}
