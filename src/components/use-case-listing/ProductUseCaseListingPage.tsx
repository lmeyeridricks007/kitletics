import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { CatalogInteractive } from "@/components/catalog/CatalogInteractive";
import { UseCaseHero } from "@/components/use-case-listing/UseCaseHero";
import { UseCaseSubnav } from "@/components/use-case-listing/UseCaseSubnav";
import { UseCaseEducationStrip } from "@/components/use-case-listing/UseCaseEducationStrip";
import { UseCaseComparisonsAndGuides } from "@/components/use-case-listing/UseCaseComparisonsAndGuides";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo/jsonld";
import type { UseCaseListingPageData } from "@/lib/use-case-listing";

export function ProductUseCaseListingPage({
  data,
}: {
  data: UseCaseListingPageData;
}) {
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          collectionPageJsonLd({
            name: data.config.title,
            description: data.config.description,
            url: data.basePath,
          }),
          data.products.length > 0
            ? itemListJsonLd(
                data.config.title,
                data.products.slice(0, 24).map((row) => ({
                  name: row.fullName,
                  url: `/products/${row.slug}`,
                })),
              )
            : null,
        ]}
      />

      <UseCaseHero data={data} />

      <Suspense fallback={null}>
        <UseCaseSubnav items={data.config.subnav} basePath={data.basePath} />
      </Suspense>

      <section id="catalog" className="bg-white py-7 sm:py-8">
        <Container size="wide">
          <Suspense fallback={null}>
            <CatalogInteractive
              basePath={data.basePath}
              categoryName={data.config.countLabel}
              filters={data.filters}
              facets={data.facets}
              activeFilters={data.activeFilters}
              products={data.products}
              total={data.total}
              availableSorts={data.availableSorts}
              primaryFilterKeys={data.config.primaryFilterKeys}
              compareCategorySlug={data.categorySlug}
              compact
              mockupLayout
              listingLayout
              lockedTypes={data.lockedType}
              lockedUseCases={data.lockedUseCase}
              page={data.page}
              totalPages={data.totalPages}
            />
          </Suspense>
        </Container>
      </section>

      <UseCaseEducationStrip data={data} />
      <UseCaseComparisonsAndGuides data={data} />
    </>
  );
}
