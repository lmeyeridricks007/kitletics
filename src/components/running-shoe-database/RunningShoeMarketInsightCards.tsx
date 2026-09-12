"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { InsightCardModel } from "@/lib/running-shoe-database/statistics/types";
import type { RunningShoeMarketInsights } from "@/lib/running-shoe-database/statistics/types";
import { trackShoeDatabaseEvent } from "@/lib/running-shoe-database/analytics";

function coverageLabel(sampleSize: number, populationSize: number): string {
  return `Based on ${sampleSize} of ${populationSize} eligible models`;
}

export function RunningShoeMarketInsightCards({
  insights,
}: {
  insights: RunningShoeMarketInsights;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewed = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || viewed.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (viewed.current) return;
        if (entries.some((e) => e.isIntersecting)) {
          viewed.current = true;
          trackShoeDatabaseEvent("shoe_database_insight_view", {
            insight_type: "market_insights_section",
            result_count: insights.cards.length,
          });
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [insights.cards.length]);

  if (insights.cards.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="border-b border-border bg-[#f5f6f7]"
    >
      <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Market insights
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              What the current catalog shows
            </h2>
          </div>
          <p className="max-w-md text-[13px] text-muted">
            Calculated from {insights.eligibleCount} eligible product models —
            not manually authored claims. Each card shows sample size.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insights.cards.map((card) => (
            <InsightCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightCard({ card }: { card: InsightCardModel }) {
  function trackClick(opts: { target: string; productSlug?: string }) {
    trackShoeDatabaseEvent("shoe_database_insight_click", {
      insight_type: card.id,
      filter_value: opts.target.slice(0, 40),
      product_slug: opts.productSlug,
    });
  }

  return (
    <article className="flex h-full flex-col border border-border bg-white p-5">
      <p className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">
        {card.eyebrow}
      </p>
      <h3 className="mt-1 font-display text-lg font-bold tracking-tight">
        {card.title}
      </h3>
      <p className="mt-2 text-[12px] text-muted">
        {coverageLabel(card.sampleSize, card.populationSize)}
      </p>

      <ol className="mt-4 flex-1 space-y-2.5">
        {card.rows.map((row) => {
          const productSlug = row.href.includes("/products/")
            ? row.href.split("/").pop()
            : undefined;
          return (
          <li key={`${card.id}-${row.rank}`} className="flex gap-3 text-[13px]">
            <span className="w-5 shrink-0 font-bold tabular-nums text-muted">
              {row.rank}.
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={row.href}
                className="font-semibold text-foreground hover:underline"
                onClick={() =>
                  trackClick({
                    target: productSlug ? "product_row" : "filter_row",
                    productSlug,
                  })
                }
              >
                {row.label}
              </Link>
              <p className="text-muted tabular-nums">{row.detail}</p>
            </div>
          </li>
          );
        })}
      </ol>

      {card.caveat && (
        <p className="mt-4 text-[11px] leading-relaxed text-muted">{card.caveat}</p>
      )}

      <Link
        href={card.viewAllHref}
        className="mt-5 inline-flex text-[12px] font-bold tracking-wide text-link uppercase hover:text-link-hover"
        onClick={() => trackClick({ target: "view_all" })}
      >
        {card.viewAllLabel} →
      </Link>
    </article>
  );
}

export function RunningShoeStatisticsMethodologySection({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}) {
  return (
    <section id="statistics-methodology" className="border-t border-border bg-white">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
          For journalists & researchers
        </p>
        <h2 className="mt-1 max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {paragraphs.map((p) => (
            <p
              key={p.slice(0, 56)}
              className="border border-border bg-[#f5f6f7] p-4 text-[14px] leading-relaxed text-muted"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
