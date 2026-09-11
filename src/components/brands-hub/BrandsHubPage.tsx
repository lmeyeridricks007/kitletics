import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { BrandCard } from "@/components/cards/BrandCard";
import { BrandMark } from "@/components/brands/BrandMark";
import { SearchForm } from "@/components/search/SearchForm";
import { TrustRow } from "@/components/home/TrustRow";
import { brandAccentHex } from "@/lib/brands/brand-colors";
import { cn } from "@/lib/utils";
import type { BrandsHubPageData } from "@/lib/brands/get-brands-hub-data";

export function BrandsHubPage({ data }: { data: BrandsHubPageData }) {
  const shoesDomain = data.domain === "shoes";
  const eyebrow = shoesDomain
    ? "Shoe brands"
    : data.sport
      ? `${data.sport.name} brands`
      : "Brands";
  const title = shoesDomain
    ? "Browse shoe brands"
    : data.sport
      ? `Browse ${data.sport.name.toLowerCase()} brands`
      : "Browse brands";
  const deck = shoesDomain
    ? "Manufacturer profiles for running and training shoes — products, reviews and guides in one place."
    : data.sport
      ? `Manufacturer profiles for ${data.sport.name.toLowerCase()} gear — products, reviews and guides in one place.`
      : "Manufacturer profiles linked to products, reviews and guides across Kitletics.";

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-white">
        <Container size="wide" className="py-6 sm:py-8">
          <Breadcrumbs items={data.breadcrumbs} className="mb-5" />
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
                <li>{data.totalCount} brands</li>
              </ul>
            </div>
            <SearchForm
              placeholder="Search brands…"
              action="/brands"
              defaultQuery={data.query ?? ""}
              hiddenFields={
                shoesDomain
                  ? [{ name: "domain", value: "shoes" }]
                  : data.sport
                    ? [{ name: "sport", value: data.sport.slug }]
                    : undefined
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {data.sportFilters.map((filter) => (
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

      {data.featured.length > 0 && (
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
              {data.featured.map((row) => (
                <BrandCard
                  key={row.brand.id}
                  brand={row.brand}
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

          {data.letters.length > 0 && (
            <nav
              aria-label="Jump to letter"
              className="mb-8 flex flex-wrap gap-1.5"
            >
              {data.letters.map((letter) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-white text-[12px] font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {letter}
                </a>
              ))}
            </nav>
          )}

          {data.byLetter.length === 0 ? (
            <p className="text-sm text-muted">
              No brands match this filter.
              {data.query ? " Try a different search." : null}
            </p>
          ) : (
            <div className="space-y-10">
              {data.byLetter.map((group) => (
                <div key={group.letter} id={`letter-${group.letter}`}>
                  <h3 className="mb-3 font-display text-xl font-semibold">
                    {group.letter}
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.brands.map((row) => {
                      const accent = brandAccentHex(row.brand.slug);
                      return (
                      <li key={row.brand.id}>
                        <Link
                          href={row.href}
                          className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-border bg-white px-3 py-3 transition-colors hover:border-accent"
                        >
                          <BrandMark brand={row.brand} size="md" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">
                              {row.brand.name}
                            </span>
                            <span className="block text-[11px] text-subtle tabular-nums">
                              {row.productCount} product
                              {row.productCount === 1 ? "" : "s"}
                              {row.brand.country
                                ? ` · ${row.brand.country}`
                                : ""}
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
