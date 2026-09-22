"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { IndexReviewCard } from "@/components/cards/IndexHubCards";
import type { ReviewType } from "@/domain/editorial/types";
import {
  REVIEW_HUB_MAX_PER_CATEGORY,
  type ReviewIndexCard,
  type ReviewIndexGender,
  type ReviewIndexShellData,
} from "@/lib/review/reviews-index-shared";

const REVIEW_TYPE_FILTERS: { id: "all" | ReviewType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "first-hand-test", label: "Personally Tested" },
  { id: "expert-research", label: "Expert Research" },
  { id: "hybrid", label: "Tested + Research" },
];

const GENDER_IDS = new Set<ReviewIndexGender>(["men", "women", "unisex"]);

function chipClass(active: boolean) {
  return active
    ? "rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
    : "rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:border-accent hover:text-foreground";
}

function shoeReviewsHref(params: {
  brand?: string;
  gender?: string;
  shoeType?: string;
  category?: string;
}) {
  const qs = new URLSearchParams();
  qs.set("domain", "shoes");
  if (params.category) qs.set("category", params.category);
  if (params.brand) qs.set("brand", params.brand);
  if (params.gender) qs.set("gender", params.gender);
  if (params.shoeType) qs.set("shoeType", params.shoeType);
  return `/reviews?${qs.toString()}`;
}

function matchesGender(card: ReviewIndexCard, gender: ReviewIndexGender) {
  if (gender === "unisex") return card.gender === "unisex";
  return card.gender === gender || card.gender === "unisex";
}

export function ReviewsIndexClient({ data }: { data: ReviewIndexShellData }) {
  const searchParams = useSearchParams();
  const shoesDomain = searchParams.get("domain") === "shoes";
  const rawType = searchParams.get("type");
  const typeFilter: "all" | ReviewType =
    !shoesDomain &&
    (rawType === "first-hand-test" ||
      rawType === "expert-research" ||
      rawType === "hybrid")
      ? rawType
      : "all";
  const sportSlug = shoesDomain ? null : searchParams.get("sport");
  const brandSlug = shoesDomain ? searchParams.get("brand") : null;
  const genderRaw = searchParams.get("gender");
  const gender: ReviewIndexGender | undefined =
    shoesDomain && genderRaw && GENDER_IDS.has(genderRaw as ReviewIndexGender)
      ? (genderRaw as ReviewIndexGender)
      : undefined;
  const shoeType = shoesDomain ? searchParams.get("shoeType") : null;
  const categorySlug = shoesDomain ? searchParams.get("category") : null;

  const universe = useMemo(() => {
    return data.cards.filter((card) => {
      if (shoesDomain) return card.isShoe;
      if (sportSlug) return card.sportSlugs.includes(sportSlug);
      return true;
    });
  }, [data.cards, shoesDomain, sportSlug]);

  const filtered = useMemo(() => {
    return universe.filter((card) => {
      if (typeFilter !== "all" && card.reviewType !== typeFilter) return false;
      if (categorySlug && card.categorySlug !== categorySlug) return false;
      if (brandSlug && card.brandSlug !== brandSlug) return false;
      if (gender && !matchesGender(card, gender)) return false;
      if (shoeType && !card.shoeTypes.some((t) => t.slug === shoeType)) return false;
      return true;
    });
  }, [universe, typeFilter, categorySlug, brandSlug, gender, shoeType]);

  const cap =
    !shoesDomain && typeFilter === "all" && !sportSlug
      ? REVIEW_HUB_MAX_PER_CATEGORY
      : undefined;

  const byCategory = useMemo(() => {
    const map = new Map<
      string,
      { categoryName: string; items: ReviewIndexCard[]; totalCount: number }
    >();
    for (const card of filtered) {
      const key = card.categoryId;
      if (!map.has(key)) {
        map.set(key, {
          categoryName: card.categoryName,
          items: [],
          totalCount: 0,
        });
      }
      const group = map.get(key)!;
      group.totalCount += 1;
      if (cap === undefined || group.items.length < cap) {
        group.items.push(card);
      }
    }
    return [...map.values()];
  }, [filtered, cap]);

  const counts = useMemo(() => {
    const all = universe.length;
    return {
      all,
      "first-hand-test": universe.filter(
        (c) => c.reviewType === "first-hand-test",
      ).length,
      "expert-research": universe.filter(
        (c) => c.reviewType === "expert-research",
      ).length,
      hybrid: universe.filter((c) => c.reviewType === "hybrid").length,
    };
  }, [universe]);

  const facets = useMemo(() => {
    const brandCounts = new Map<string, { slug: string; name: string; count: number }>();
    const genderCounts: Record<ReviewIndexGender, number> = {
      men: 0,
      women: 0,
      unisex: 0,
    };
    const shoeTypeCounts = new Map<string, { slug: string; name: string; count: number }>();
    const categoryCounts = new Map<string, { slug: string; name: string; count: number }>();
    for (const card of universe) {
      if (card.brandSlug && card.brandName) {
        const existing = brandCounts.get(card.brandSlug);
        if (existing) existing.count += 1;
        else
          brandCounts.set(card.brandSlug, {
            slug: card.brandSlug,
            name: card.brandName,
            count: 1,
          });
      }
      genderCounts[card.gender] += 1;
      categoryCounts.set(card.categorySlug, {
        slug: card.categorySlug,
        name: card.categoryName,
        count: (categoryCounts.get(card.categorySlug)?.count ?? 0) + 1,
      });
      for (const t of card.shoeTypes) {
        const existing = shoeTypeCounts.get(t.slug);
        if (existing) existing.count += 1;
        else
          shoeTypeCounts.set(t.slug, {
            slug: t.slug,
            name: t.name,
            count: 1,
          });
      }
    }
    return {
      brands: [...brandCounts.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      ),
      genders: (
        [
          { id: "men" as const, label: "Men", count: genderCounts.men },
          { id: "women" as const, label: "Women", count: genderCounts.women },
          { id: "unisex" as const, label: "Unisex", count: genderCounts.unisex },
        ] as const
      ).filter((g) => g.count > 0),
      shoeTypes: [...shoeTypeCounts.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      ),
      categories: [...categoryCounts.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      ),
    };
  }, [universe]);

  const activeShoeParams = {
    brand: brandSlug ?? undefined,
    gender,
    shoeType: shoeType ?? undefined,
    category: categorySlug ?? undefined,
  };

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
                    { label: "Reviews" },
                  ]
                : [{ label: "Reviews" }]),
            ]}
            className="mb-6"
          />
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {shoesDomain ? "Shoe reviews" : "Reviews"}
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            {shoesDomain
              ? "Structured editorial assessments. Filter by category, brand, fit, and shoe type."
              : "Structured editorial assessments. Every review discloses whether Kitletics personally tested the product or used expert research."}
          </p>

          {shoesDomain ? (
            <div className="mt-8 space-y-5">
              {facets.categories.length > 1 && (
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Category">
                    <Link
                      href={shoeReviewsHref({
                        ...activeShoeParams,
                        category: undefined,
                      })}
                      className={chipClass(!categorySlug)}
                    >
                      All
                      <span className="ml-1.5 opacity-60">{counts.all}</span>
                    </Link>
                    {facets.categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={shoeReviewsHref({
                          ...activeShoeParams,
                          category: c.slug,
                        })}
                        className={chipClass(categorySlug === c.slug)}
                      >
                        {c.name}
                        <span className="ml-1.5 opacity-60">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                  Gender
                </p>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Gender">
                  <Link
                    href={shoeReviewsHref({
                      ...activeShoeParams,
                      gender: undefined,
                    })}
                    className={chipClass(!gender)}
                  >
                    All
                  </Link>
                  {facets.genders.map((g) => (
                    <Link
                      key={g.id}
                      href={shoeReviewsHref({
                        ...activeShoeParams,
                        gender: g.id,
                      })}
                      className={chipClass(gender === g.id)}
                    >
                      {g.label}
                      <span className="ml-1.5 opacity-60">{g.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                  Shoe type
                </p>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Shoe type">
                  <Link
                    href={shoeReviewsHref({
                      ...activeShoeParams,
                      shoeType: undefined,
                    })}
                    className={chipClass(!shoeType)}
                  >
                    All types
                  </Link>
                  {facets.shoeTypes.map((t) => (
                    <Link
                      key={t.slug}
                      href={shoeReviewsHref({
                        ...activeShoeParams,
                        shoeType: t.slug,
                      })}
                      className={chipClass(shoeType === t.slug)}
                    >
                      {t.name.replace(/ shoes$/i, "")}
                      <span className="ml-1.5 opacity-60">{t.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                  Brand
                </p>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Brand">
                  <Link
                    href={shoeReviewsHref({
                      ...activeShoeParams,
                      brand: undefined,
                    })}
                    className={chipClass(!brandSlug)}
                  >
                    All brands
                  </Link>
                  {facets.brands.map((b) => (
                    <Link
                      key={b.slug}
                      href={shoeReviewsHref({
                        ...activeShoeParams,
                        brand: b.slug,
                      })}
                      className={chipClass(brandSlug === b.slug)}
                    >
                      {b.name}
                      <span className="ml-1.5 opacity-60">{b.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="mt-8 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Review type"
            >
              {REVIEW_TYPE_FILTERS.map((f) => {
                const active = typeFilter === f.id;
                const qs = new URLSearchParams();
                if (f.id !== "all") qs.set("type", f.id);
                if (sportSlug) qs.set("sport", sportSlug);
                const q = qs.toString();
                const href = q ? `/reviews?${q}` : "/reviews";
                const count = f.id === "all" ? counts.all : counts[f.id];
                return (
                  <Link
                    key={f.id}
                    href={href}
                    role="tab"
                    aria-selected={active}
                    className={chipClass(active)}
                  >
                    {f.label}
                    <span className="ml-1.5 opacity-60">{count}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      <Container className="space-y-14 py-10 sm:py-14">
        {byCategory.map((group) => (
          <section key={group.categoryName}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">
                {group.categoryName}
              </h2>
              {group.totalCount > group.items.length ? (
                <p className="text-sm text-muted">
                  Showing {group.items.length} of {group.totalCount}
                </p>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <IndexReviewCard
                  key={item.id}
                  href={`/reviews/${item.slug}`}
                  title={item.productName}
                  summary={item.summary}
                  brandName={item.brandName}
                  reviewType={item.reviewType}
                  displayScore={item.displayScore}
                  image={item.image}
                />
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="text-muted">No reviews match this filter yet.</p>
        )}
      </Container>
    </>
  );
}
