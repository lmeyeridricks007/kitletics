"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { BrandCard } from "@/components/cards/BrandCard";
import { BrandMark } from "@/components/brands/BrandMark";
import { SearchForm } from "@/components/search/SearchForm";
import { TrustRow } from "@/components/home/TrustRow";
import { brandAccentHex } from "@/lib/brands/brand-colors";
import { cn } from "@/lib/utils";
import type {
  BrandsIndexRow,
  BrandsIndexShellData,
} from "@/lib/brands/brands-index-shared";

const FEATURED_SLUG_PRIORITY = [
  "asics",
  "nike",
  "adidas",
  "saucony",
  "hoka",
  "brooks",
  "new-balance",
  "garmin",
  "coros",
  "salomon",
  "on",
  "rogue",
] as const;

const SHOE_FEATURED_SLUG_PRIORITY = [
  "asics",
  "nike",
  "adidas",
  "saucony",
  "hoka",
  "brooks",
  "new-balance",
  "salomon",
  "on",
  "altra",
  "topo",
  "puma",
] as const;

function pickFeatured(
  rows: BrandsIndexRow[],
  priority: readonly string[],
): BrandsIndexRow[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const picked: BrandsIndexRow[] = [];
  for (const slug of priority) {
    const row = bySlug.get(slug);
    if (row?.logo) picked.push(row);
    if (picked.length >= 4) return picked;
  }
  const rest = [...rows]
    .filter((r) => r.logo && !picked.some((p) => p.id === r.id))
    .sort((a, b) => b.productCount - a.productCount);
  for (const row of rest) {
    picked.push(row);
    if (picked.length >= 4) break;
  }
  if (picked.length < 4) {
    for (const row of [...rows].sort((a, b) => b.productCount - a.productCount)) {
      if (picked.some((p) => p.id === row.id)) continue;
      picked.push(row);
      if (picked.length >= 4) break;
    }
  }
  return picked;
}

export function BrandsHubClient({ data }: { data: BrandsIndexShellData }) {
  const searchParams = useSearchParams();
  const shoesDomain = searchParams.get("domain") === "shoes";
  const sportSlug = shoesDomain ? null : searchParams.get("sport");
  const query = searchParams.get("q")?.trim() ?? "";

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return data.brands.filter((row) => {
      if (needle) {
        const hit =
          row.name.toLowerCase().includes(needle) || row.slug.includes(needle);
        if (!hit) return false;
      }
      if (shoesDomain) return row.shoeProductCount > 0;
      if (sportSlug) return row.sportSlugs.includes(sportSlug);
      return true;
    });
  }, [data.brands, query, shoesDomain, sportSlug]);

  const rows = filtered.map((row) => ({
    ...row,
    productCount: shoesDomain ? row.shoeProductCount : row.productCount,
  }));

  const featured = pickFeatured(
    rows,
    shoesDomain ? SHOE_FEATURED_SLUG_PRIORITY : FEATURED_SLUG_PRIORITY,
  );

  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
  const letterMap = new Map<string, BrandsIndexRow[]>();
  for (const row of sorted) {
    const letter = row.name[0]?.toUpperCase() ?? "#";
    const list = letterMap.get(letter) ?? [];
    list.push(row);
    letterMap.set(letter, list);
  }
  const byLetter = [...letterMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, brands]) => ({ letter, brands }));

  const sportName = data.sports.find((s) => s.slug === sportSlug)?.name;
  const eyebrow = shoesDomain
    ? "Shoe brands"
    : sportName
      ? `${sportName} brands`
      : "Brands";
  const title = shoesDomain
    ? "Browse shoe brands"
    : sportName
      ? `Browse ${sportName.toLowerCase()} brands`
      : "Browse brands";
  const deck = shoesDomain
    ? "Manufacturer profiles for running and training shoes — products, reviews and guides in one place."
    : sportName
      ? `Manufacturer profiles for ${sportName.toLowerCase()} gear — products, reviews and guides in one place.`
      : "Manufacturer profiles linked to products, reviews and guides across Kitletics.";

  const sportFilters = shoesDomain
    ? [
        {
          slug: "shoes",
          label: "Shoes",
          href: query
            ? `/brands?domain=shoes&q=${encodeURIComponent(query)}`
            : "/brands?domain=shoes",
          active: true,
        },
        {
          slug: "all",
          label: "All sports",
          href: query ? `/brands?q=${encodeURIComponent(query)}` : "/brands",
          active: false,
        },
      ]
    : [
        {
          slug: "all",
          label: "All sports",
          href: query ? `/brands?q=${encodeURIComponent(query)}` : "/brands",
          active: !sportSlug,
        },
        ...data.sports.map((s) => ({
          slug: s.slug,
          label: s.name,
          href: query
            ? `/brands?sport=${s.slug}&q=${encodeURIComponent(query)}`
            : `/brands?sport=${s.slug}`,
          active: sportSlug === s.slug,
        })),
      ];

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-white">
        <Container size="wide" className="py-6 sm:py-8">
          <Breadcrumbs
            items={
              shoesDomain
                ? [
                    { label: "Home", href: "/" },
                    { label: "Shoes", href: "/running/shoes" },
                    { label: "Brands" },
                  ]
                : [
                    { label: "Home", href: "/" },
                    { label: "Brands" },
                  ]
            }
            className="mb-5"
          />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.55fr)] lg:items-end">
            <div className="space-y-3">
              <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
                {eyebrow}
              </p>
              <h1 className="font-display text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.35rem] leading-[1.05]">
                {title}
              </h1>
              <p className="max-w-xl text-[14px] leading-relaxed text-muted sm:text-[15px]">
                {deck}
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-medium text-subtle tabular-nums">
                <li>{rows.length} brands</li>
              </ul>
            </div>
            <SearchForm
              key={`${shoesDomain ? "shoes" : sportSlug ?? "all"}:${query}`}
              placeholder="Search brands…"
              action="/brands"
              defaultQuery={query}
              hiddenFields={
                shoesDomain
                  ? [{ name: "domain", value: "shoes" }]
                  : sportSlug
                    ? [{ name: "sport", value: sportSlug }]
                    : undefined
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {sportFilters.map((filter) => (
              <Link
                key={filter.slug}
                href={filter.href}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  filter.active
                    ? "border-foreground bg-foreground text-white"
                    : "border-border bg-white text-muted hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {featured.length > 0 && (
        <section className="border-b border-border py-10 sm:py-12">
          <Container size="wide">
            <div className="mb-6">
              <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
                Featured
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Featured brands
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((row) => (
                <BrandCard
                  key={row.id}
                  brand={row}
                  href={row.href}
                  productCount={row.productCount}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-b border-border bg-surface-muted/40 py-10 sm:py-12">
        <Container size="wide">
          <div className="mb-6">
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              A–Z
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              All brands
            </h2>
          </div>

          {byLetter.length > 0 && (
            <nav
              aria-label="Jump to letter"
              className="mb-8 flex flex-wrap gap-1.5"
            >
              {byLetter.map((group) => (
                <a
                  key={group.letter}
                  href={`#letter-${group.letter}`}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-white text-[12px] font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {group.letter}
                </a>
              ))}
            </nav>
          )}

          {byLetter.length === 0 ? (
            <p className="text-sm text-muted">
              No brands match this filter.
              {query ? " Try a different search." : null}
            </p>
          ) : (
            <div className="space-y-10">
              {byLetter.map((group) => (
                <div key={group.letter} id={`letter-${group.letter}`}>
                  <h3 className="mb-3 font-display text-xl font-semibold">
                    {group.letter}
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.brands.map((row) => {
                      const accent = brandAccentHex(row.slug);
                      return (
                        <li key={row.id}>
                          <Link
                            href={row.href}
                            className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-border bg-white px-3 py-3 transition-colors hover:border-accent"
                          >
                            <BrandMark brand={row} size="md" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {row.name}
                              </span>
                              <span className="block text-[11px] text-subtle tabular-nums">
                                {row.productCount} product
                                {row.productCount === 1 ? "" : "s"}
                                {row.country ? ` · ${row.country}` : ""}
                              </span>
                            </span>
                            {accent && (
                              <span
                                aria-hidden
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: `#${accent}` }}
                              />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <TrustRow />
    </div>
  );
}
