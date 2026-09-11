import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BestGuideCard } from "@/components/cards/ContentCards";
import { getBestIndexData } from "@/lib/best/get-best-guide-page-data";
import { resolveUniqueBestGuideImages } from "@/lib/best/resolve-best-guide-image";
import { siteConfig } from "@/content/config";
import { formatVerifiedDate } from "@/lib/product/score";
import { getSportBySlug } from "@/repositories";
import { NOINDEX_FOLLOW } from "@/lib/seo/query-state";

interface PageProps {
  searchParams: Promise<{ sport?: string; domain?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { sport, domain } = await searchParams;
  if (domain === "shoes") {
    return {
      title: "Best Shoes",
      description:
        "Evidence-led best shoe guides — recommendations tied to products, use cases and evidence.",
      alternates: { canonical: `${siteConfig.url}/best?domain=shoes` },
    };
  }
  return {
    title: "Best Gear Guides",
    description:
      "Evidence-led best gear guides organised by sport — recommendations tied to products, use cases and evidence.",
    alternates: { canonical: `${siteConfig.url}/best` },
    robots: sport ? NOINDEX_FOLLOW : undefined,
  };
}

export default async function BestIndexPage({ searchParams }: PageProps) {
  const { sport: sportSlug, domain } = await searchParams;
  const shoesDomain = domain === "shoes";
  const sport = !shoesDomain && sportSlug ? getSportBySlug(sportSlug) : undefined;
  const { bySport } = getBestIndexData({
    sportSlug: sport?.slug,
    domain: shoesDomain ? "shoes" : undefined,
  });

  const title = shoesDomain
    ? "Best shoes"
    : sport
      ? `Best ${sport.name} gear`
      : "Best gear";

  return (
    <>
      <section className="border-b border-border bg-mesh">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              ...(shoesDomain
                ? [
                    { label: "Shoes", href: "/running/shoes" },
                    { label: "Best" },
                  ]
                : [
                    { label: "Best" },
                    ...(sport ? [{ label: sport.name }] : []),
                  ]),
            ]}
            className="mb-6"
          />
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            {shoesDomain
              ? "Recommendation guides for running and training shoes — tied to product data, use cases and evidence."
              : "Structured recommendation guides — not affiliate listicles. Each pick links to Product data, use-case scores and evidence."}
          </p>
          {(sport || shoesDomain) && (
            <p className="mt-3 text-sm">
              <Link href="/best" className="text-link hover:underline">
                View all sports →
              </Link>
            </p>
          )}
        </Container>
      </section>

      <Container className="space-y-14 py-10 sm:py-14">
        {bySport.map(({ sport: groupSport, guides }) => {
          const uniqueImages = resolveUniqueBestGuideImages(guides);
          return (
            <section key={groupSport?.id ?? "other"}>
              <h2 className="font-display text-2xl font-semibold">
                {groupSport?.name ?? "Other"}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide) => (
                  <BestGuideCard
                    key={guide.id}
                    guide={guide}
                    imageOverride={uniqueImages.get(guide.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {bySport.length === 0 && (
          <p className="text-muted">No published best guides yet.</p>
        )}

        <p className="text-sm text-subtle">
          Looking for education instead of rankings?{" "}
          <Link href="/guides" className="text-accent hover:underline">
            Buying guides
          </Link>
          {bySport.length > 0 && (
            <>
              {" · "}
              Updated{" "}
              {formatVerifiedDate(
                bySport
                  .flatMap((g) => g.guides)
                  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
                  ?.updatedAt ?? new Date().toISOString(),
              )}
            </>
          )}
        </p>
      </Container>
    </>
  );
}
