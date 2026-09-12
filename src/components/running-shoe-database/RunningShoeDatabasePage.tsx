import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { RunningShoeDatabaseExplorer } from "@/components/running-shoe-database/RunningShoeDatabaseExplorer";
import {
  RunningShoeMarketInsightCards,
  RunningShoeStatisticsMethodologySection,
} from "@/components/running-shoe-database/RunningShoeMarketInsightCards";
import { RunningShoeDataExplorerLazy } from "@/components/running-shoe-database/RunningShoeDataExplorerLazy";
import { RunningShoeDatasetAboutSection } from "@/components/running-shoe-database/RunningShoeDatasetAboutSection";
import type { RunningShoeDatabasePageData } from "@/lib/running-shoe-database/types";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo/jsonld";

function MarketStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 border border-white/15 bg-white/5 px-3 py-2.5 sm:px-4">
      <p className="font-display text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-medium tracking-wide text-white/65 uppercase">
        {label}
      </p>
    </div>
  );
}

export function RunningShoeDatabasePage({
  data,
}: {
  data: RunningShoeDatabasePageData;
}) {
  const { market } = data.insights;

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          collectionPageJsonLd({
            name: data.title,
            description: data.description,
            url: data.path,
          }),
          itemListJsonLd(
            data.title,
            data.records.slice(0, 50).map((r) => ({
              name: r.fullName,
              url: r.productHref,
            })),
          ),
        ]}
      />

      <section className="relative overflow-hidden border-b border-border-dark bg-[#0b0f13] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[55%] max-w-[640px]"
        >
          <div className="absolute top-[-20%] right-[10%] h-[140%] w-[42%] rotate-[-24deg] bg-gradient-to-b from-accent/40 via-accent/10 to-transparent" />
          <div className="absolute top-[10%] right-[36%] h-[110%] w-[10%] rotate-[-24deg] bg-accent/25" />
        </div>

        <Container className="relative py-10 sm:py-12 lg:py-14">
          <nav aria-label="Breadcrumb" className="text-[12px] text-white/55">
            <ol className="flex flex-wrap items-center gap-1.5">
              {data.breadcrumbs.map((crumb, i) => (
                <li
                  key={`${crumb.label}-${i}`}
                  className="flex items-center gap-1.5"
                >
                  {i > 0 && <span aria-hidden>›</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-white"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white/80">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <p className="mt-5 text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
            Kitletics data product
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.1rem,4.8vw,3.25rem)] leading-[1.02] font-bold tracking-tight">
            Running Shoe Database
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            Explore{" "}
            <span className="font-semibold text-white tabular-nums">
              {data.total}
            </span>{" "}
            running shoes. Find and compare shoes by how you run — then inspect
            the specs and Kitletics analysis behind each model.
          </p>

          <div className="mt-7 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-5">
            <MarketStat label="Shoes" value={market.total} />
            <MarketStat label="Brands" value={market.brandCount} />
            <MarketStat label="Daily trainers" value={market.dailyTrainers} />
            <MarketStat label="Race shoes" value={market.raceShoes} />
            <MarketStat label="Trail shoes" value={market.trailShoes} />
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="#explorer"
              className="inline-flex h-11 items-center justify-center bg-accent px-5 text-[11px] font-bold tracking-[0.08em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
            >
              Explore database
            </Link>
            <Link
              href="#data-explorer"
              className="inline-flex h-11 items-center justify-center border border-white/25 px-5 text-[11px] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:border-white/50"
            >
              Data explorer
            </Link>
            <Link
              href="#about-dataset"
              className="inline-flex h-11 items-center justify-center border border-white/25 px-5 text-[11px] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:border-white/50"
            >
              Cite this data
            </Link>
            <Link
              href="/tools/running-shoe-finder"
              className="inline-flex h-11 items-center justify-center border border-white/25 px-5 text-[11px] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:border-white/50"
            >
              Find my shoes
            </Link>
          </div>
        </Container>
      </section>

      <RunningShoeMarketInsightCards insights={data.marketInsights} />

      <RunningShoeDataExplorerLazy payload={data.dataExplorer} />

      <section id="explorer" className="scroll-mt-24 bg-white">
        <Container className="py-8 sm:py-10">
          <Suspense
            fallback={
              <p className="text-sm text-muted">Loading shoe explorer…</p>
            }
          >
            <RunningShoeDatabaseExplorer data={data} />
          </Suspense>
        </Container>
      </section>

      <RunningShoeStatisticsMethodologySection
        title={data.statisticsMethodology.title}
        paragraphs={data.statisticsMethodology.paragraphs}
      />

      <RunningShoeDatasetAboutSection about={data.datasetAbout} />

      <section className="border-t border-border bg-[#f5f6f7]">
        <Container className="grid gap-10 py-12 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Methodology
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
              {data.methodology.title}
            </h2>
            <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
              {data.methodology.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
            <p className="mt-4 text-[13px]">
              <Link
                href="/methodology"
                className="font-semibold text-link hover:text-link-hover"
              >
                Full Kitletics methodology
              </Link>
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                Related tools
              </p>
              <ul className="mt-3 space-y-3">
                {data.related.tools.map((item) => (
                  <li
                    key={item.href}
                    className="border border-border bg-white p-4"
                  >
                    <Link
                      href={item.href}
                      className="font-display text-base font-bold hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-[13px] text-muted">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                Editorial
              </p>
              <ul className="mt-3 space-y-3">
                {data.related.editorial.map((item) => (
                  <li
                    key={item.href}
                    className="border border-border bg-white p-4"
                  >
                    <Link
                      href={item.href}
                      className="font-display text-base font-bold hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-[13px] text-muted">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
