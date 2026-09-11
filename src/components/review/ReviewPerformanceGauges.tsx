import Link from "next/link";
import type { ScoreBreakdownItem } from "@/domain/editorial/types";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";
import { buildMetricEditorials, friendlyScoreNote } from "@/lib/review/metric-editorials";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

function formatScore(score: number): string {
  return (score / 10).toFixed(1);
}

function ScoreGauge({ item }: { item: ScoreBreakdownItem }) {
  const display = formatScore(item.score);
  const pct = Math.max(0, Math.min(100, item.score)) / 100;
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const gap = c - dash;

  return (
    <div className="flex flex-col items-center text-center">
      <svg
        viewBox="0 0 96 96"
        className="size-[88px]"
        role="img"
        aria-label={`${item.label}: ${display} out of 10`}
      >
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-border"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          className="text-foreground"
          transform="rotate(-90 48 48)"
        />
        <text
          x="48"
          y="53"
          textAnchor="middle"
          fill="currentColor"
          className="text-foreground"
          style={{ fontSize: "17px", fontWeight: 700 }}
        >
          {display}
        </text>
      </svg>
      <p className="mt-2 text-[13px] font-semibold text-foreground">{item.label}</p>
      <p className="mt-1 min-h-[2.5rem] max-w-[11rem] text-[12px] leading-snug text-muted">
        {item.note ? friendlyScoreNote(item.note, item.key) : ""}
      </p>
    </div>
  );
}

function TestingSummaryCard({ data }: { data: ReviewPageData }) {
  const details = data.review.testingDetails;
  if (!details) return null;

  const lines: string[] = [];
  if (details.distanceKm !== undefined) {
    lines.push(`Tested over ${details.distanceKm} km`);
  }
  if (details.durationDays !== undefined) {
    lines.push(
      details.durationDays === 1
        ? "Over 1 day"
        : `Over ${details.durationDays} days`,
    );
  }
  if (details.activities?.length) {
    lines.push(details.activities.slice(0, 3).join(", "));
  }

  return (
    <div
      id="testing"
      className={`${SCROLL} rounded-lg border border-border bg-surface-muted p-5`}
    >
      <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
        Testing summary
      </p>
      <ul className="mt-3 space-y-1.5 text-[14px] text-foreground">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {details.surfaces?.length ? (
        <p className="mt-3 text-[13px] text-muted">
          Surfaces: {details.surfaces.join(", ")}
        </p>
      ) : null}
      {details.notes && (
        <p className="mt-2 text-[13px] text-muted">{details.notes}</p>
      )}
    </div>
  );
}

export function ReviewPerformanceGauges({ data }: { data: ReviewPageData }) {
  const { heroCriteria, visibleReviewType, showTestingModule, review, category } =
    data;
  if (heroCriteria.length === 0) return null;

  const heading =
    visibleReviewType === "expert-research"
      ? "How it scores"
      : "Performance scores";

  const editorials = buildMetricEditorials(
    heroCriteria,
    review,
    category?.id ?? data.product.categoryId,
    data.product,
  );

  const intro =
    visibleReviewType === "expert-research"
      ? "Scores are out of 10 for this product’s job — not a claim it wins every category. Each note below is about this product, not a generic glossary."
      : "Scores are out of 10 from our testing and comparisons for this product’s intended use. Each note below explains why the score landed where it did for this product.";

  return (
    <section id="performance" className={SCROLL}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="heading-section">{heading}</h2>
        <Link
          href="/methodology"
          className="text-[12px] font-semibold tracking-wide text-accent-ink uppercase hover:underline"
        >
          How we score
        </Link>
      </div>

      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">
        {intro}
      </p>

      <div
        className={
          showTestingModule
            ? "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-start"
            : "mt-8"
        }
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {heroCriteria.map((item) => (
            <ScoreGauge key={item.key} item={item} />
          ))}
        </div>
        {showTestingModule ? <TestingSummaryCard data={data} /> : null}
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h3 className="text-[12px] font-bold tracking-[0.12em] text-subtle uppercase">
          What these scores mean
        </h3>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {editorials.map((metric) => (
            <li
              key={metric.key}
              className="rounded-xl border border-border bg-surface px-4 py-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-[15px] font-semibold text-foreground">
                  {metric.label}
                </p>
                <p className="shrink-0 text-[13px] font-bold tabular-nums text-foreground">
                  {metric.displayScore}
                  <span className="font-medium text-muted">/10</span>
                </p>
              </div>
              <p className="mt-1 text-[11px] font-semibold tracking-wide text-accent-ink uppercase">
                {metric.band}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {metric.meaning}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground">
                {metric.why}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
