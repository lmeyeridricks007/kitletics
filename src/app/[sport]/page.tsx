import { RacketSportsFamilyHub } from "@/components/sports/RacketSportsFamilyHub";
import { SportHub } from "@/components/hub/SportHub";
import { SportHubPage } from "@/components/sport-hub/SportHubPage";
import { SportPageHeader } from "@/components/headers/PageHeaders";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import {
  hasDeclarativeSportHub,
  getSportHubData,
  hasAssembleSportHub,
  assembleSportHubData,
} from "@/lib/sport-hubs";
import {
  getSportBySlug,
  getSports,
  getDisciplinesBySport,
  getCategoriesBySport,
  getSportGraph,
  getBrandById,
  getLowestOfferPrice,
  getProductsByCategory,
} from "@/repositories";
import { sportMetadata } from "@/lib/seo/metadata";
import { getCategoryHref } from "@/lib/navigation/category-href";
import { resolveChildSportRedirect } from "@/lib/seo/category-canonical";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { ToolCard } from "@/components/cards/ToolCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { getLaunchEligibility } from "@/domain/launch";
import { withLaunchRobots } from "@/lib/launch/apply-eligibility";

interface PageProps {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ gender?: string }>;
}

const RESERVED = new Set([
  "gear",
  "brands",
  "best",
  "reviews",
  "compare",
  "tools",
  "search",
  "products",
  "guides",
  "setups",
  "finders",
  "about",
  "methodology",
  "how-we-review",
  "editorial-policy",
  "evidence-policy",
  "scoring-methodology",
  "authors",
  "affiliate-disclosure",
  "contact",
  "privacy",
  "terms",
  "api",
  "icon",
]);

export async function generateStaticParams() {
  return getSports()
    .filter((s) => s.contentStatus === "live")
    // Alias sport hub — production 301s /hyrox → /fitness/hyrox
    .filter((s) => s.slug !== "hyrox")
    .map((s) => ({ sport: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { sport: slug } = await params;
  if (RESERVED.has(slug)) return {};
  const sport = getSportBySlug(slug);
  if (!sport) return { title: "Not found" };
  const elig = getLaunchEligibility({ kind: "sport", entity: sport });
  return withLaunchRobots(sportMetadata(sport), elig);
}

export default async function SportPage({ params, searchParams }: PageProps) {
  const { sport: slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const sport = getSportBySlug(slug);
  if (!sport) notFound();

  if (sport.contentStatus !== "live") {
    // Future / incomplete sport hubs are not soft-indexable shells
    notFound();
  }

  if (slug === "racket") {
    return <RacketSportsFamilyHub />;
  }

  // Declarative hubs (running, padel) — canonical presentation stack
  if (hasDeclarativeSportHub(slug)) {
    const data = getSportHubData({ sportSlug: slug, region: "NL" });
    if (!data) notFound();
    const { gender: genderRaw } = await searchParams;
    return <SportHubPage data={data} genderRaw={genderRaw} />;
  }

  // Assemble hubs (fitness) — keep until migrated to declarative stack
  if (hasAssembleSportHub(slug)) {
    const hub = assembleSportHubData(slug);
    if (!hub) notFound();
    return <SportHub data={hub} />;
  }

  // Generic live sport fallback (future sports before they get a hub config)
  return <GenericLiveSportHub sportSlug={slug} />;
}

async function GenericLiveSportHub({ sportSlug }: { sportSlug: string }) {
  const sport = getSportBySlug(sportSlug);
  if (!sport) notFound();

  const graph = getSportGraph(sport.id);
  if (!graph) notFound();

  const disciplines = getDisciplinesBySport(sport.id);
  const categories = getCategoriesBySport(sport.id);
  const products = graph.products.slice(0, 8);

  return (
    <>
      <SportPageHeader
        breadcrumbs={resolveBreadcrumbs({ type: "sport", sportSlug })}
        eyebrow={sport.name}
        title={`${sport.name} gear`}
        description={sport.description}
      />

      {disciplines.length > 0 && (
        <Section
          eyebrow="Disciplines"
          title={`How you do ${sport.name}`}
          description="Disciplines are filters on gear needs — not content silos."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((d) => {
              const href =
                resolveChildSportRedirect(sport, d.slug) ??
                `/${sport.slug}/${d.slug}`;
              return (
                <Link
                  key={d.id}
                  href={href}
                  className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
                >
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {d.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">{d.description}</p>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {categories.length > 0 && (
        <Section
          muted
          eyebrow="Categories"
          title={`${sport.name} categories`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories
              .filter((category) => getProductsByCategory(category.id).length > 0)
              .filter(
                (category) =>
                  getCategoryHref(category) ===
                  `/${sport.slug}/${category.pathSegment}`,
              )
              .map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                href={getCategoryHref(category)}
                productCount={getProductsByCategory(category.id).length}
              />
            ))}
          </div>
        </Section>
      )}

      {products.length > 0 && (
        <Section eyebrow="Products" title={`Recommended ${sport.name} gear`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                brandName={getBrandById(product.brandId)?.name}
                lowestPrice={getLowestOfferPrice(product.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {graph.tools.length > 0 && (
        <Section muted eyebrow="Tools" title={`${sport.name} tools`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {graph.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
