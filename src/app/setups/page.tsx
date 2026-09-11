import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getGearSetups, getSportById, getSportBySlug } from "@/repositories";
import { siteConfig } from "@/content/config";
import { NOINDEX_FOLLOW } from "@/lib/seo/query-state";

interface PageProps {
  searchParams: Promise<{ sport?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { sport } = await searchParams;
  return {
    title: "Gear Setups & Kits | Kitletics",
    description:
      "Curated multi-category gear setups for race day, training and starter kits — real products, roles and live regional prices.",
    alternates: { canonical: `${siteConfig.url}/setups` },
    robots: sport ? NOINDEX_FOLLOW : undefined,
  };
}

export default async function SetupsIndexPage({ searchParams }: PageProps) {
  const { sport: sportSlug } = await searchParams;
  const filterSport = sportSlug ? getSportBySlug(sportSlug) : undefined;
  let setups = getGearSetups();
  if (filterSport) {
    setups = setups.filter((s) => s.sportId === filterSport.id);
  }
  const bySport = new Map<string, typeof setups>();
  for (const setup of setups) {
    const key = setup.sportId;
    const list = bySport.get(key) ?? [];
    list.push(setup);
    bySport.set(key, list);
  }

  return (
    <>
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gear Kits" },
            ...(filterSport ? [{ label: filterSport.name }] : []),
          ]}
          className="mb-8"
        />
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {filterSport ? `${filterSport.name} gear setups` : "Gear setups"}
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Coherent multi-category kits for a goal — not single-category best
          lists. Prices come from current regional offers.
        </p>
        {filterSport && (
          <p className="mt-3 text-sm">
            <Link href="/setups" className="text-link hover:underline">
              View all setups →
            </Link>
          </p>
        )}
      </Container>
      <Container className="pb-16 space-y-10">
        {[...bySport.entries()].map(([sportId, list]) => {
          const sport = getSportById(sportId);
          return (
            <section key={sportId}>
              <h2 className="font-display text-2xl font-semibold">
                {sport?.name ?? "Other"}
              </h2>
              <ul className="mt-4 space-y-3">
                {list.map((setup) => (
                  <li key={setup.id}>
                    <Link
                      href={`/setups/${setup.slug}`}
                      className="block rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
                    >
                      <h3 className="font-display text-lg font-semibold">
                        {setup.title}
                      </h3>
                      {setup.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {setup.description}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {bySport.size === 0 && (
          <p className="text-muted">No gear setups published yet.</p>
        )}
      </Container>
    </>
  );
}
