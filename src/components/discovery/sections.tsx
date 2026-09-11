import type { ReactNode } from "react";
import { Section } from "@/components/layout/Section";
import { ProductCard } from "@/components/cards/ProductCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { SportCard } from "@/components/cards/SportCard";
import { ToolCard } from "@/components/cards/ToolCard";
import { BrandCard } from "@/components/cards/BrandCard";
import {
  BestGuideCard,
  ComparisonCard,
  BuyingGuideCard,
} from "@/components/cards/ContentCards";
import type { Product } from "@/domain/products/types";
import type { ProductCategory, Sport, UseCase } from "@/domain/sports/types";
import type { Brand } from "@/domain/products/types";
import type { Tool } from "@/domain/tools/types";
import type { BestGuide, Comparison, BuyingGuide } from "@/domain/editorial/types";

interface SectionCommon {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  muted?: boolean;
}

export function FeaturedProductsSection({
  products,
  brandNames,
  categoryNames,
  prices,
  recommendationLabels,
  ...section
}: SectionCommon & {
  products: Product[];
  brandNames?: Record<string, string>;
  categoryNames?: Record<string, string>;
  prices?: Record<string, { price: number; currency: string }>;
  recommendationLabels?: Record<string, string>;
}) {
  if (products.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            brandName={brandNames?.[product.brandId]}
            categoryName={categoryNames?.[product.categoryId]}
            lowestPrice={prices?.[product.id]}
            recommendationLabel={recommendationLabels?.[product.id]}
          />
        ))}
      </div>
    </Section>
  );
}

export function CategoriesSection({
  categories,
  hrefs,
  counts,
  sportLabels,
  ...section
}: SectionCommon & {
  categories: ProductCategory[];
  hrefs?: Record<string, string>;
  counts?: Record<string, number>;
  sportLabels?: Record<string, string>;
}) {
  if (categories.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            href={hrefs?.[category.id]}
            productCount={counts?.[category.id]}
            sportLabel={sportLabels?.[category.id]}
          />
        ))}
      </div>
    </Section>
  );
}

export function SportsSection({
  sports,
  ...section
}: SectionCommon & { sports: Sport[] }) {
  if (sports.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sports.map((sport) => (
          <SportCard key={sport.id} sport={sport} />
        ))}
      </div>
    </Section>
  );
}

export function ToolsSection({
  tools,
  sportLabels,
  featured,
  ...section
}: SectionCommon & {
  tools: Tool[];
  sportLabels?: Record<string, string>;
  featured?: boolean;
}) {
  if (tools.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            featured={featured}
            sportLabel={sportLabels?.[tool.id]}
          />
        ))}
      </div>
    </Section>
  );
}

export function BrandsSection({
  brands,
  ...section
}: SectionCommon & { brands: Brand[] }) {
  if (brands.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </Section>
  );
}

export function PopularGuidesSection({
  guides,
  ...section
}: SectionCommon & { guides: BestGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <BestGuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </Section>
  );
}

export function PopularComparisonsSection({
  comparisons,
  productNames,
  ...section
}: SectionCommon & {
  comparisons: Comparison[];
  productNames?: Record<string, string[]>;
}) {
  if (comparisons.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comparisons.map((comparison) => (
          <ComparisonCard
            key={comparison.id}
            comparison={comparison}
            productNames={productNames?.[comparison.id]}
          />
        ))}
      </div>
    </Section>
  );
}

export function RelatedContentSection({
  title = "Related",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  if (!children) return null;
  return <Section title={title}>{children}</Section>;
}

export function UseCasesSection({
  useCases,
  ...section
}: SectionCommon & { useCases: UseCase[] }) {
  if (useCases.length === 0) return null;
  return (
    <Section {...section}>
      <div className="flex flex-wrap gap-2">
        {useCases.map((uc) => (
          <span
            key={uc.id}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-sm text-muted"
          >
            {uc.name}
          </span>
        ))}
      </div>
    </Section>
  );
}

export function BuyingGuidesSection({
  guides,
  ...section
}: SectionCommon & { guides: BuyingGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <Section {...section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <BuyingGuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </Section>
  );
}

export { DiscoveryShortcuts } from "@/components/discovery/DiscoveryShortcuts";
