import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Section } from "@/components/layout/Section";
import { ProductCard } from "@/components/cards/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import {
  getCategoryBySlug,
  getCategories,
  getCategoryGraph,
  getBrandById,
  getLowestOfferPrice,
  getProductsByCategory,
} from "@/repositories";
import { categoryMetadata } from "@/lib/seo/metadata";
import { getCategoryHref } from "@/lib/navigation/category-href";
import { siteConfig } from "@/content/config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCategories()
    .filter((c) => getProductsByCategory(c.id).length > 0)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  const canonical = getCategoryHref(category);
  if (canonical !== `/gear/${category.slug}`) {
    return {
      ...categoryMetadata(category),
      alternates: { canonical: `${siteConfig.url}${canonical}` },
      robots: { index: false, follow: true },
    };
  }
  if (getProductsByCategory(category.id).length === 0) {
    return {
      title: category.name,
      robots: { index: false, follow: true },
    };
  }
  return categoryMetadata(category);
}

export default async function GearCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const canonical = getCategoryHref(category);
  if (canonical !== `/gear/${category.slug}`) {
    permanentRedirect(canonical);
  }

  const products = getProductsByCategory(category.id);
  if (products.length === 0) {
    return (
      <div className="bg-mesh">
        <Container className="py-10 sm:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Gear", href: "/gear" },
              { label: category.name },
            ]}
            className="mb-10"
          />
          <Badge variant="muted" className="mb-4">
            Coming soon
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            We’re still stocking this category. Browse live gear while we finish
            the catalog.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/gear">Browse all gear</ButtonLink>
            <ButtonLink href="/running" variant="outline">
              Running hub
            </ButtonLink>
          </div>
        </Container>
      </div>
    );
  }

  const graph = getCategoryGraph(category.id);

  return (
    <>
      <div className="bg-mesh">
        <Container className="py-10 sm:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Gear", href: "/gear" },
              { label: category.name },
            ]}
            className="mb-10"
          />
          <Badge variant="accent" className="mb-4">
            Category
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-muted">{category.description}</p>
          <div className="mt-8">
            <ButtonLink href="/running" variant="outline">
              Running hub
            </ButtonLink>
          </div>
        </Container>
      </div>

      <Section
        title={`${graph?.products.length ?? 0} products`}
        description="Via getCategoryGraph() — publication-gated."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {graph?.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              brandName={getBrandById(product.brandId)?.name}
              lowestPrice={getLowestOfferPrice(product.id)}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
