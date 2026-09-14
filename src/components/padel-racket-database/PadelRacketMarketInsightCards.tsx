"use client";

import Link from "next/link";
import type { InsightCardModel } from "@/lib/padel-racket-database/statistics/types";
import type { PadelRacketMarketInsights } from "@/lib/padel-racket-database/statistics/types";

function coverageLabel(sampleSize: number, populationSize: number): string {
  return `Based on ${sampleSize} of ${populationSize} eligible models`;
}

export function PadelRacketMarketInsightCards({
  insights,
}: {
  insights: PadelRacketMarketInsights;
}) {
  if (insights.cards.length === 0) return null;

  return (
    <section className="border-b border-border bg-[#f5f6f7]">
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
            Calculated from {insights.eligibleCount} eligible product models in
            this Kitletics cohort — not industry-wide market claims. Each card
            shows sample size.
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
        {card.rows.map((row) => (
          <li key={`${card.id}-${row.rank}`} className="flex gap-3 text-[13px]">
            <span className="w-5 shrink-0 font-bold tabular-nums text-muted">
              {row.rank}.
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={row.href}
                className="font-semibold text-foreground hover:underline"
              >
                {row.label}
              </Link>
              <p className="text-muted tabular-nums">{row.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href={card.viewAllHref}
        className="mt-5 text-[12px] font-semibold text-link hover:text-link-hover"
      >
        {card.viewAllLabel}
      </Link>
    </article>
  );
}

export function PadelRacketStatisticsMethodologySection({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}) {
  return (
    <section className="border-t border-border bg-white">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
          Statistics methodology
        </p>
        <h2 className="mt-1 max-w-2xl font-display text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-[14px] leading-relaxed text-muted">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
