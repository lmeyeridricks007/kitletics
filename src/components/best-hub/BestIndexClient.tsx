"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { IndexBestGuideCard } from "@/components/cards/IndexHubCards";
import { formatVerifiedDate } from "@/lib/product/score";
import {
  BEST_SHOE_CATEGORY_IDS,
  type BestIndexShellData,
} from "@/lib/best/best-index-shared";

export function BestIndexClient({ data }: { data: BestIndexShellData }) {
  const searchParams = useSearchParams();
  const sportSlug = searchParams.get("sport");
  const shoesDomain = searchParams.get("domain") === "shoes";

  const cards = useMemo(() => {
    return data.cards.filter((card) => {
      if (shoesDomain) return BEST_SHOE_CATEGORY_IDS.has(card.categoryId);
      if (sportSlug) return card.sportSlug === sportSlug;
      return true;
    });
  }, [data.cards, shoesDomain, sportSlug]);

  const sportName = cards.find((c) => c.sportSlug === sportSlug)?.sportName;
  const title = shoesDomain
    ? "Best shoes"
    : sportName
      ? `Best ${sportName} gear`
      : "Best gear";

  const bySport = useMemo(() => {
    const map = new Map<string, typeof cards>();
    for (const card of cards) {
      const key = card.sportId;
      const list = map.get(key) ?? [];
      list.push(card);
      map.set(key, list);
    }
    return [...map.entries()].map(([sportId, list]) => ({
      sportId,
      sportName: list[0]?.sportName ?? "Other",
      cards: list,
    }));
  }, [cards]);

  const latest = cards
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

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
                    ...(sportName ? [{ label: sportName }] : []),
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
          {(sportSlug || shoesDomain) && (
            <p className="mt-3 text-sm">
              <Link href="/best" className="text-link hover:underline">
                View all sports →
              </Link>
            </p>
          )}
        </Container>
      </section>

      <Container className="space-y-14 py-10 sm:py-14">
        {bySport.map((group) => (
          <section key={group.sportId}>
            <h2 className="font-display text-2xl font-semibold">
              {group.sportName}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.cards.map((guide) => (
                <IndexBestGuideCard
                  key={guide.id}
                  href={`/best/${guide.slug}`}
                  title={guide.title}
                  description={guide.description}
                  recCount={guide.recCount}
                  image={guide.image}
                />
              ))}
            </div>
          </section>
        ))}

        {bySport.length === 0 && (
          <p className="text-muted">No published best guides yet.</p>
        )}

        <p className="text-sm text-subtle">
          Looking for education instead of rankings?{" "}
          <Link href="/guides" className="text-accent hover:underline">
            Buying guides
          </Link>
          {latest && (
            <>
              {" · "}
              Updated {formatVerifiedDate(latest.updatedAt)}
            </>
          )}
        </p>
      </Container>
    </>
  );
}
