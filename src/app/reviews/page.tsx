import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewCard } from "@/components/cards/ContentCards";
import {
  getReviewsIndexData,
  type ReviewGenderFilter,
} from "@/lib/review/get-review-page-data";
import type { ReviewType } from "@/domain/editorial/types";
import { siteConfig } from "@/content/config";
import {
  hasNonCanonicalQueryState,
  NOINDEX_FOLLOW,
} from "@/lib/seo/query-state";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    sport?: string;
    domain?: string;
    brand?: string;
    gender?: string;
    shoeType?: string;
    category?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = hasNonCanonicalQueryState(sp);
  return {
    title: "Reviews",
    description:
      "Expert research and personally tested product reviews — organised by category, not a blog feed.",
    alternates: { canonical: `${siteConfig.url}/reviews` },
    robots: filtered ? NOINDEX_FOLLOW : undefined,
  };
}

const REVIEW_TYPE_FILTERS: { id: "all" | ReviewType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "first-hand-test", label: "Personally Tested" },
  { id: "expert-research", label: "Expert Research" },
  { id: "hybrid", label: "Tested + Research" },
];

const SHOE_CATEGORY_IDS = new Set([
  "cat-running-shoes",
  "cat-training-shoes",
]);

const GENDER_IDS = new Set<ReviewGenderFilter>(["men", "women", "unisex"]);

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

export default async function ReviewsIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const shoesDomain = params.domain === "shoes";

  const rawType = params.type;
  const typeFilter: "all" | ReviewType =
    !shoesDomain &&
    (rawType === "first-hand-test" ||
      rawType === "expert-research" ||
      rawType === "hybrid")
      ? rawType
      : "all";

  const brandSlug = shoesDomain && params.brand ? params.brand : undefined;
  const gender: ReviewGenderFilter | undefined =
    shoesDomain && params.gender && GENDER_IDS.has(params.gender as ReviewGenderFilter)
      ? (params.gender as ReviewGenderFilter)
      : undefined;
  const shoeType = shoesDomain && params.shoeType ? params.shoeType : undefined;
  const categorySlug =
    shoesDomain && params.category ? params.category : undefined;

  const data = getReviewsIndexData({
    typeFilter,
    sportSlug: shoesDomain ? undefined : params.sport,
    categoryIds: shoesDomain ? [...SHOE_CATEGORY_IDS] : undefined,
    brandSlug,
    gender,
    shoeType,
    categorySlug,
  });

  const activeShoeParams = {
    brand: brandSlug,
    gender,
    shoeType,
    category: categorySlug,
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
              {data.facets.categories.length > 1 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    Category
                  </p>
                  <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Category"
                  >
                    <Link
                      href={shoeReviewsHref({
                        ...activeShoeParams,
                        category: undefined,
                      })}
                      className={chipClass(!categorySlug)}
                    >
                      All
                      <span className="ml-1.5 opacity-60">
                        {data.counts.all}
                      </span>
                    </Link>
                    {data.facets.categories.map((c) => (
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
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Gender
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="list"
                  aria-label="Gender"
                >
                  <Link
                    href={shoeReviewsHref({
                      ...activeShoeParams,
                      gender: undefined,
                    })}
                    className={chipClass(!gender)}
                  >
                    All
                  </Link>
                  {data.facets.genders.map((g) => (
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
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Shoe type
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="list"
                  aria-label="Shoe type"
                >
                  <Link
                    href={shoeReviewsHref({
                      ...activeShoeParams,
                      shoeType: undefined,
                    })}
                    className={chipClass(!shoeType)}
                  >
                    All types
                  </Link>
                  {data.facets.shoeTypes.map((t) => (
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
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Brand
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="list"
                  aria-label="Brand"
                >
                  <Link
                    href={shoeReviewsHref({
                      ...activeShoeParams,
                      brand: undefined,
                    })}
                    className={chipClass(!brandSlug)}
                  >
                    All brands
                  </Link>
                  {data.facets.brands.map((b) => (
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
                if (params.sport) qs.set("sport", params.sport);
                const q = qs.toString();
                const href = q ? `/reviews?${q}` : "/reviews";
                const count =
                  f.id === "all" ? data.counts.all : data.counts[f.id];
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

      <Container className="py-10 sm:py-14 space-y-14">
        {data.byCategory.map((group) => (
          <section key={group.categoryName}>
            <h2 className="font-display text-2xl font-semibold">
              {group.categoryName}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <ReviewCard
                  key={item.review.id}
                  title={item.product?.name ?? item.review.title}
                  brandName={item.brand?.name}
                  review={item.review}
                  product={item.product}
                  displayScore={item.displayScore}
                />
              ))}
            </div>
          </section>
        ))}

        {data.items.length === 0 && (
          <p className="text-muted">No reviews match this filter yet.</p>
        )}
      </Container>
    </>
  );
}
