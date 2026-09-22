"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { SetupsIndexShellData } from "@/lib/setups/setups-index-shared";

export function SetupsIndexClient({ data }: { data: SetupsIndexShellData }) {
  const searchParams = useSearchParams();
  const sportSlug = searchParams.get("sport");

  const cards = useMemo(() => {
    if (!sportSlug) return data.cards;
    return data.cards.filter((c) => c.sportSlug === sportSlug);
  }, [data.cards, sportSlug]);

  const sportName = cards[0]?.sportName;
  const bySport = useMemo(() => {
    const map = new Map<string, typeof cards>();
    for (const setup of cards) {
      const list = map.get(setup.sportId) ?? [];
      list.push(setup);
      map.set(setup.sportId, list);
    }
    return [...map.entries()].map(([sportId, list]) => ({
      sportId,
      sportName: list[0]?.sportName ?? "Other",
      list,
    }));
  }, [cards]);

  return (
    <>
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gear Kits" },
            ...(sportSlug && sportName ? [{ label: sportName }] : []),
          ]}
          className="mb-8"
        />
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {sportSlug && sportName ? `${sportName} gear setups` : "Gear setups"}
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Coherent multi-category kits for a goal — not single-category best
          lists. Prices come from current regional offers.
        </p>
        {sportSlug && (
          <p className="mt-3 text-sm">
            <Link href="/setups" className="text-link hover:underline">
              View all setups →
            </Link>
          </p>
        )}
      </Container>
      <Container className="space-y-10 pb-16">
        {bySport.map((group) => (
          <section key={group.sportId}>
            <h2 className="font-display text-2xl font-semibold">
              {group.sportName}
            </h2>
            <ul className="mt-4 space-y-3">
              {group.list.map((setup) => (
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
        ))}
        {bySport.length === 0 && (
          <p className="text-muted">No gear setups published yet.</p>
        )}
      </Container>
    </>
  );
}
