import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { TrustRow } from "@/components/home/TrustRow";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchAside } from "@/components/search/SearchAside";
import {
  SearchBrandResultCard,
  SearchCategoryResultCard,
  SearchComparisonResultCard,
  SearchGuideResultCard,
  SearchProductResultCard,
  SearchToolResultCard,
} from "@/components/search/SearchResultCards";
import { JsonLdScript, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import type { SearchPageData } from "@/lib/search/get-search-page-data";
import { DiscoveryShortcuts } from "@/components/discovery/DiscoveryShortcuts";

export function SearchResultsPage({ data }: { data: SearchPageData }) {
  const crumbLd = breadcrumbJsonLd(data.breadcrumbs);
  const showProductFacets =
    data.filter === "all" ||
    data.filter === "products" ||
    data.filter === "categories" ||
    data.filter === "brands";

  return (
    <div className="bg-white" data-search-results>
      <JsonLdScript data={crumbLd} />

      <Container size="wide" className="pt-4 pb-2">
        <Breadcrumbs items={data.breadcrumbs} />
      </Container>

      <Container size="wide" className="pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              {data.query
                ? `Results for “${data.query}”`
                : "Search Kitletics"}
            </h1>
            {data.query ? (
              <p className="mt-1.5 text-[14px] text-muted" aria-live="polite">
                {data.total.toLocaleString()} result
                {data.total === 1 ? "" : "s"} across {data.typeLabel}
              </p>
            ) : (
              <p className="mt-1.5 text-[14px] text-muted">
                Search products, brands, categories, guides, comparisons and
                tools.
              </p>
            )}
          </div>
          {data.query && data.total > 0 && (
            <div className="text-[13px] text-muted">
              Sort by:{" "}
              <span className="font-semibold text-foreground">Relevance</span>
            </div>
          )}
        </div>
      </Container>

      <Container size="wide" className="pb-14">
        {!data.query && (
          <DiscoveryShortcuts
            items={[
              { label: "Running Shoes", href: "/search?q=running+shoes" },
              {
                label: "Women's running shoes",
                href: "/running/shoes?gender=women",
              },
              {
                label: "Men's running shoes",
                href: "/running/shoes?gender=men",
              },
              { label: "Best Running Shoes", href: "/best/running-shoes" },
              { label: "Shoe Finder", href: "/tools/running-shoe-finder" },
              { label: "Brands", href: "/brands" },
            ]}
          />
        )}

        {data.query && data.total === 0 && (
          <div className="mx-auto max-w-xl space-y-5 py-10 text-center">
            <h2 className="font-display text-xl font-bold">
              No results for “{data.query}”
            </h2>
            <p className="text-sm text-muted">
              Check spelling, try a broader term, or browse gear and tools.
            </p>
            <DiscoveryShortcuts
              items={[
                { label: "Browse Gear", href: "/gear" },
                { label: "Explore Tools", href: "/tools" },
                { label: "Running shoes", href: "/search?q=running+shoes" },
                { label: "Brands", href: "/brands" },
              ]}
            />
          </div>
        )}

        {data.query && data.total > 0 && (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
            <SearchFilters
              query={data.query}
              filter={data.filter}
              brandFilter={data.brandFilter}
              typeFacets={data.typeFacets}
              sportFacets={data.sportFacets}
              categoryFacets={data.categoryFacets}
              brandFacets={data.brandFacets}
              featureFacets={data.featureFacets}
              priceFacet={data.priceFacet}
              pricesUpdating={data.pricesUpdating}
              activeFeatures={data.activeFeatures}
              showProductFacets={showProductFacets}
            />

            <div className="min-w-0 flex-1 space-y-10">
              {data.groups.map((group) => (
                <section key={group.key} aria-labelledby={`group-${group.key}`}>
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-2">
                    <h2
                      id={`group-${group.key}`}
                      className="text-[13px] font-bold tracking-[0.06em] text-foreground uppercase"
                    >
                      {group.label}{" "}
                      <span className="font-semibold text-muted">
                        ({group.total})
                      </span>
                    </h2>
                    {data.filter === "all" && (
                      <Link
                        href={group.viewAllHref}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-link hover:underline"
                      >
                        View all {group.label.toLowerCase()}
                        <ArrowRight className="size-3" aria-hidden />
                      </Link>
                    )}
                  </div>

                  {group.products && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {group.products.map((p) => (
                        <SearchProductResultCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}

                  {group.categories && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {group.categories.map((c) => (
                        <SearchCategoryResultCard key={c.id} category={c} />
                      ))}
                    </div>
                  )}

                  {group.brands && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {group.brands.map((b) => (
                        <SearchBrandResultCard key={b.id} brand={b} />
                      ))}
                    </div>
                  )}

                  {group.guides && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                      {group.guides.map((g) => (
                        <SearchGuideResultCard key={g.id} guide={g} />
                      ))}
                    </div>
                  )}

                  {group.comparisons && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {group.comparisons.map((c) => (
                        <SearchComparisonResultCard
                          key={c.id}
                          comparison={c}
                        />
                      ))}
                    </div>
                  )}

                  {group.tools && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                      {group.tools.map((t) => (
                        <SearchToolResultCard key={t.id} tool={t} />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            <div className="order-last xl:order-none">
              <SearchAside
                query={data.query}
                total={data.total}
                relatedSearches={data.relatedSearches}
                finderCta={data.finderCta}
                guidesCtaHref={data.guidesCtaHref}
                compareAction={data.compareAction}
              />
            </div>
          </div>
        )}
      </Container>

      <TrustRow />
    </div>
  );
}
