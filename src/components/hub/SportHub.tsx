import Link from "next/link";
import {
  FeaturedProductsSection,
  PopularGuidesSection,
  ToolsSection,
  BrandsSection,
} from "@/components/discovery/sections";
import { GearSetupCard } from "@/components/cards/ContentCards";
import { ProductCard } from "@/components/cards/ProductCard";
import { Section } from "@/components/layout/Section";
import { SportHubHero, PrimaryActionsBar } from "@/components/hub/SportHubHero";
import {
  LookingForSection,
  ShoeTypesSection,
  UseCaseCardsSection,
  DisciplineCardsSection,
  FinderCtaSection,
} from "@/components/hub/SportHubSections";
import {
  CompareSpotlightSection,
  GearChecklistSection,
  ShoeEducationSection,
  MethodologyModule,
  RecentlyUpdatedSection,
} from "@/components/hub/SportHubModules";
import { SportSearchField } from "@/components/hub/SportSearchField";
import { JsonLdScript, breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import type { SportHubData } from "@/lib/hubs/types";

/**
 * Reusable live sport hub composition.
 * Running-specific density comes from SportHubData / config — not hardcoded JSX branches.
 */
export function SportHub({ data }: { data: SportHubData }) {
  const {
    sport,
    config,
    featuredProducts,
    productMeta,
    categoryRows,
    bestGuides,
    tools,
    setups,
    brands,
    shoeTypes,
    useCases,
    disciplines,
    recentlyUpdated,
  } = data;

  const brandByBrandId: Record<string, string> = {};
  const categoryByCatId: Record<string, string> = {};
  const prices: Record<string, { price: number; currency: string }> = {};
  const labels: Record<string, string> = {};
  for (const product of featuredProducts) {
    const meta = productMeta[product.id];
    if (meta?.brandName) brandByBrandId[product.brandId] = meta.brandName;
    if (meta?.categoryName) categoryByCatId[product.categoryId] = meta.categoryName;
    if (meta?.price) prices[product.id] = meta.price;
    if (meta?.recommendationLabel) labels[product.id] = meta.recommendationLabel;
  }
  for (const row of categoryRows) {
    for (const product of row.products) {
      const meta = productMeta[product.id];
      if (meta?.brandName) brandByBrandId[product.brandId] = meta.brandName;
      if (meta?.categoryName) categoryByCatId[product.categoryId] = meta.categoryName;
      if (meta?.price) prices[product.id] = meta.price;
      if (meta?.recommendationLabel) labels[product.id] = meta.recommendationLabel;
    }
  }

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          collectionPageJsonLd({
            name: `${sport.name} Gear`,
            description:
              sport.seoDescription ??
              sport.description,
            url: `/${sport.slug}`,
          }),
          featuredProducts.length > 0
            ? itemListJsonLd(
                `Recommended ${sport.name} gear`,
                featuredProducts.map((p) => ({
                  name: p.fullName,
                  url: `/products/${p.slug}`,
                })),
              )
            : null,
        ]}
      />

      <SportHubHero data={data} />
      <PrimaryActionsBar data={data} />

      <LookingForSection data={data} />

      <ShoeTypesSection shoeTypes={shoeTypes} sportSlug={sport.slug} />

      {data.primaryTool ? <FinderCtaSection data={data} /> : null}

      <UseCaseCardsSection useCases={useCases} />

      <DisciplineCardsSection
        disciplines={disciplines}
        sportSlug={sport.slug}
      />

      <FeaturedProductsSection
        eyebrow="Recommended"
        title={`Recommended ${sport.name} gear`}
        description="Seed catalog picks with real scores and offers only when present."
        products={featuredProducts}
        brandNames={brandByBrandId}
        categoryNames={categoryByCatId}
        prices={prices}
        recommendationLabels={labels}
        action={
          <Link
            href={`/gear?sport=${sport.slug}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Browse all gear →
          </Link>
        }
      />

      {categoryRows.map((row) => (
        <Section
          key={row.category.id}
          muted
          eyebrow={row.category.name}
          title={`Recommended ${row.category.name}`}
          action={
            <Link
              href={data.categoryHrefs[row.category.id]}
              className="text-sm font-medium text-accent hover:underline"
            >
              View category →
            </Link>
          }
        >
          <div className="flex max-w-full gap-4 overflow-x-auto overscroll-x-contain pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {row.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                brandName={productMeta[product.id]?.brandName}
                categoryName={productMeta[product.id]?.categoryName}
                lowestPrice={productMeta[product.id]?.price}
                recommendationLabel={productMeta[product.id]?.recommendationLabel}
                className="min-w-[240px] shrink-0 lg:min-w-0"
              />
            ))}
          </div>
        </Section>
      ))}

      <PopularGuidesSection
        eyebrow="Best of"
        title={`Best ${sport.name} gear`}
        description="Structured shortlists mapped to use cases — not generic top-10 posts."
        guides={bestGuides}
        action={
          <Link
            href="/best"
            className="text-sm font-medium text-accent hover:underline"
          >
            All best guides →
          </Link>
        }
      />

      <CompareSpotlightSection data={data} />

      <ToolsSection
        eyebrow="Tools"
        title={`${sport.name} tools`}
        description="Finders and calculators to decide faster."
        tools={tools}
        featured
        action={
          <Link
            href={`/tools?sport=${sport.slug}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            All tools →
          </Link>
        }
      />

      {setups.length > 0 && (
        <Section
          muted
          eyebrow="Setups"
          title={`Complete ${sport.name} setups`}
          description="Whole-kit recommendations — not just single products."
          action={
            <Link
              href="/setups"
              className="text-sm font-medium text-accent hover:underline"
            >
              All setups →
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {setups.map((setup) => (
              <GearSetupCard key={setup.id} setup={setup} />
            ))}
          </div>
        </Section>
      )}

      <GearChecklistSection data={data} />

      <ShoeEducationSection data={data} />

      <BrandsSection
        eyebrow="Brands"
        title={`Popular ${sport.name} brands`}
        description="Brands derived from products in the Running catalog — no invented logos."
        brands={brands}
        action={
          <Link
            href={`/brands?sport=${sport.slug}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            All brands →
          </Link>
        }
      />

      <RecentlyUpdatedSection items={recentlyUpdated} />

      <SportSearchField
        sportName={sport.name}
        placeholders={config.searchPlaceholders}
      />

      <MethodologyModule />
    </>
  );
}
