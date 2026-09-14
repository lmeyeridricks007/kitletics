import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Section } from "@/components/layout/Section";
import { ProductCard } from "@/components/cards/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { CategoryPage } from "@/components/catalog/CategoryPage";
import { assembleCategoryPage } from "@/lib/catalog";
import { siteConfig } from "@/content/config";
import {
  getSportBySlug,
  getSports,
  getDisciplineBySlug,
  getDisciplinesBySport,
  getCategoryByPathSegment,
  getCategoriesBySport,
  getProductsByDiscipline,
  getProductsByCategory,
  getBrandById,
  getLowestOfferPrice,
} from "@/repositories";
import { getCategoryHref, isSoftGatedCategory } from "@/lib/navigation/category-href";
import { resolveChildSportRedirect } from "@/lib/seo/category-canonical";
import {
  hasNonCanonicalQueryState,
  NOINDEX_FOLLOW,
} from "@/lib/seo/query-state";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";


/** Request-time / heavy catalog pages — skip SSG to keep builds healthy. */
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{ sport: string; segment: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  const params: { sport: string; segment: string }[] = [];
  for (const sport of getSports()) {
    if (sport.contentStatus !== "live") continue;
    for (const d of getDisciplinesBySport(sport.id)) {
      // Child-sport disciplines (e.g. /racket/padel) redirect to /padel
      if (resolveChildSportRedirect(sport, d.slug)) continue;
      params.push({ sport: sport.slug, segment: d.slug });
    }
    for (const c of getCategoriesBySport(sport.id)) {
      if (getProductsByCategory(c.id).length === 0) continue;
      const canonical = getCategoryHref(c);
      if (canonical !== `/${sport.slug}/${c.pathSegment}`) continue;
      params.push({ sport: sport.slug, segment: c.pathSegment });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { sport: sportSlug, segment } = await params;
  const sp = await searchParams;
  const sport = getSportBySlug(sportSlug);
  if (!sport) return { title: "Not found" };
  const sportIndexable = isIndexableEligibility(
    getLaunchEligibility(
      { kind: "sport", entity: sport },
      { isDev: false },
    ),
  );

  const discipline = getDisciplineBySlug(sportSlug, segment);
  if (discipline) {
    const childRedirect = resolveChildSportRedirect(sport, segment);
    if (childRedirect) {
      return {
        title: discipline.name,
        alternates: { canonical: `${siteConfig.url}${childRedirect}` },
        robots: NOINDEX_FOLLOW,
      };
    }

    const title =
      sportSlug === "fitness" && segment === "hyrox"
        ? "HYROX Gear: Shoes, Race Kit & Training Equipment"
        : `${discipline.name} Gear, Tools & Guides`;
    const description =
      sportSlug === "fitness" && segment === "hyrox"
        ? "Find HYROX race shoes, build a race kit, plan splits and choose training equipment."
        : discipline.description;

    return {
      title,
      description,
      alternates: {
        canonical: `${siteConfig.url}/${sportSlug}/${segment}`,
      },
      robots:
        hasNonCanonicalQueryState(sp) || !sportIndexable
          ? NOINDEX_FOLLOW
          : undefined,
    };
  }

  const category = getCategoryByPathSegment(sport.id, segment);
  if (!category) return { title: "Not found" };

  const canonicalHref = getCategoryHref(category);
  const title =
    category.seoTitle ??
    `${category.name}: Compare & Find the Right Gear`;
  const description =
    category.seoDescription ??
    `Compare ${category.name.toLowerCase()} for ${sport.name.toLowerCase()}. Filter by specs, use finders and browse structured recommendations.`;
  const queryBlocked = hasNonCanonicalQueryState(sp);
  const nonCanonicalShell = canonicalHref !== `/${sport.slug}/${category.pathSegment}`;
  const softGated = isSoftGatedCategory(category);

  if (sportSlug === "running" && segment === "shoes") {
    return {
      title: "Running Shoes: Compare Trainers, Race & Trail Shoes",
      description:
        "Compare running shoes by cushion, stability, drop and terrain. Browse daily trainers, race shoes and trail shoes — or use Kitletics Match to find your fit.",
      alternates: {
        canonical: `${siteConfig.url}/${sport.slug}/${category.pathSegment}`,
      },
      robots:
        queryBlocked || !sportIndexable ? NOINDEX_FOLLOW : undefined,
      openGraph: {
        title: "Running Shoes: Compare Trainers, Race & Trail Shoes",
        description:
          "Compare running shoes by cushion, stability, drop and terrain. Browse daily trainers, race shoes and trail shoes — or use Kitletics Match to find your fit.",
        siteName: siteConfig.name,
        type: "website",
      },
    };
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}${canonicalHref}`,
    },
    robots:
      queryBlocked || nonCanonicalShell || softGated || !sportIndexable
        ? NOINDEX_FOLLOW
        : undefined,
    openGraph: {
      title,
      description,
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export default async function SportSegmentPage({
  params,
  searchParams,
}: PageProps) {
  const { sport: sportSlug, segment } = await params;
  const sp = await searchParams;
  const sport = getSportBySlug(sportSlug);
  if (!sport) notFound();

  const discipline = getDisciplineBySlug(sportSlug, segment);
  if (discipline) {
    const childRedirect = resolveChildSportRedirect(sport, segment);
    if (childRedirect) {
      permanentRedirect(childRedirect);
    }

    if (sportSlug === "fitness" && segment === "hyrox") {
      const { HyroxHubPage } = await import("@/components/hyrox/HyroxHubPage");
      return <HyroxHubPage />;
    }

    const { hasMockupDisciplineHub, getDisciplineHubData } = await import(
      "@/lib/discipline-hub"
    );
    if (hasMockupDisciplineHub(sportSlug, segment)) {
      const { getRequestRegion } = await import("@/lib/region/server");
      const region = await getRequestRegion();
      const data = getDisciplineHubData({
        sportSlug,
        disciplineSlug: segment,
        region,
      });
      if (!data) notFound();
      const { DisciplineHubPage } = await import(
        "@/components/discipline-hub/DisciplineHubPage"
      );
      return <DisciplineHubPage data={data} />;
    }

    const products = getProductsByDiscipline(discipline.id);
    return (
      <DisciplineLayout
        sportName={sport.name}
        sportSlug={sport.slug}
        title={discipline.name}
        description={discipline.description}
        products={products}
      />
    );
  }

  const category = getCategoryByPathSegment(sport.id, segment);
  if (!category) notFound();

  // Empty / future shells are not indexable surfaces
  if (getProductsByCategory(category.id).length === 0) {
    notFound();
  }

  const canonicalHref = getCategoryHref(category);
  const requested = `/${sport.slug}/${category.pathSegment}`;
  if (canonicalHref !== requested) {
    permanentRedirect(canonicalHref);
  }

  if (sportSlug === "running" && segment === "shoes") {
    const { getRequestRegion } = await import("@/lib/region/server");
    const region = await getRequestRegion();

    const { resolveRunningShoesEntryRedirect } = await import(
      "@/lib/catalog/params"
    );
    const entryRedirect = resolveRunningShoesEntryRedirect(sp);
    if (entryRedirect) {
      const { redirect } = await import("next/navigation");
      redirect(entryRedirect);
    }

    const { getRunningShoesCategoryPage } = await import(
      "@/lib/catalog/get-running-shoes-category-page"
    );
    const { RunningShoesCategoryPage } = await import(
      "@/components/catalog/running-shoes/RunningShoesCategoryPage"
    );
    const shoesData = getRunningShoesCategoryPage({
      searchParams: sp,
      region,
    });
    if (!shoesData) notFound();
    return <RunningShoesCategoryPage data={shoesData} />;
  }

  const data = assembleCategoryPage({
    sportSlug,
    pathSegment: segment,
    searchParams: sp,
  });
  if (!data) notFound();

  return <CategoryPage data={data} />;
}

function DisciplineLayout({
  sportName,
  sportSlug,
  title,
  description,
  products,
}: {
  sportName: string;
  sportSlug: string;
  title: string;
  description: string;
  products: ReturnType<typeof getProductsByDiscipline>;
}) {
  return (
    <>
      <section className="bg-mesh">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: sportName, href: `/${sportSlug}` },
              { label: title },
            ]}
            className="mb-8"
          />
          <Badge variant="accent" className="mb-4">
            Discipline
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
            {description}
          </p>
        </Container>
      </section>

      <Section
        title={`${products.length} product${products.length === 1 ? "" : "s"}`}
      >
        {products.length === 0 ? (
          <p className="text-sm text-muted">
            No published products in this discipline yet.{" "}
            <Link href={`/${sportSlug}`} className="text-accent hover:underline">
              Back to {sportName}
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                brandName={getBrandById(product.brandId)?.name}
                lowestPrice={getLowestOfferPrice(product.id)}
              />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
