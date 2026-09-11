import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Database, CalendarDays, Tag } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TrustRow } from "@/components/home/TrustRow";
import { ComparisonShareSave } from "@/components/compare/ComparisonShareSave";
import { ComparisonSectionNav } from "@/components/compare/ComparisonSectionNav";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/jsonld";
import type { ComparisonPageData } from "@/lib/comparison/get-comparison-page-data";
import type { SpecDiffRow } from "@/lib/comparison/engine";
import { getScoreBand } from "@/lib/product/score";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { formatPrice, cn } from "@/lib/utils";
import { ScrollableTableRegion } from "@/components/ui/ScrollableTableRegion";
import { buildOfferClickHref } from "@/repositories/commerce";
import {
  CompareFitSizingBanner,
  comparisonNeedsFitSizingBanner,
} from "@/components/compare/CompareFitSizingBanner";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

function productLabel(
  productId: string,
  labels: Record<string, string>,
): string {
  return labels[productId] ?? productId;
}

function specWinnerCell(
  row: SpecDiffRow,
  productIds: string[],
  labels: Record<string, string>,
): string {
  if (row.state === "same") return "TIE";
  if (
    row.directionality === "neutral" ||
    row.directionality === "contextual" ||
    row.state !== "different"
  ) {
    return "—";
  }

  const numeric = productIds
    .map((id) => ({ id, value: row.rawByProduct[id] }))
    .filter(
      (entry): entry is { id: string; value: number } =>
        typeof entry.value === "number",
    );

  if (numeric.length < 2) return "—";

  const sorted = [...numeric].sort((a, b) =>
    row.directionality === "lower-better"
      ? a.value - b.value
      : b.value - a.value,
  );

  if (sorted[0].value === sorted[1].value) return "TIE";
  return productLabel(sorted[0].id, labels);
}

export function ComparisonPage({ data }: { data: ComparisonPageData }) {
  const {
    comparison,
    products,
    category,
    differences,
    chooseReasons,
    keyDifferencesEditorial,
    alternatives,
    relatedComparisons,
    faq,
    regionLabel,
    breadcrumbs,
    editorialSlug,
    builderQuery,
    pricesLastChecked,
    mode,
    groupedSpecs,
    heroImageSrc,
    displayTitle,
    scoreRows,
    useCaseCards,
    productMedia,
    finderHref,
    finderCtaLabel,
    finderThumbnails,
    updatedLabel,
    metaKind,
    sectionIds,
  } = data;

  const productIds = products.map((p) => p.product.id);
  const productLabels: Record<string, string> = {};
  for (const b of products) {
    productLabels[b.product.id] = b.product.name;
  }

  const summary =
    comparison?.summary ??
    "Structured comparison from product specifications, recommendations and regional offers.";

  const saveKey =
    comparison?.slug ?? products.map((p) => p.product.slug).join("-vs-");

  const hasKeyDiffs =
    keyDifferencesEditorial.length > 0 ||
    differences.importantDifferences.length > 0;
  const hasScores = scoreRows.length > 0;
  const showDiffScoresRow = hasKeyDiffs || hasScores;

  const allSpecRows = groupedSpecs.flatMap((g) => g.rows);
  const primarySpecs =
    allSpecRows.length > 0
      ? allSpecRows
      : differences.importantDifferences.length > 0
        ? differences.importantDifferences
        : differences.allSpecs.slice(0, 12);

  const twoProducts = products.length === 2;

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd(breadcrumbs),
          faq.length > 0 ? faqPageJsonLd(faq) : null,
          comparison
            ? {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: comparison.title,
                description: comparison.summary,
                dateModified: comparison.updatedAt,
                datePublished: comparison.publishedAt,
              }
            : null,
        ]}
      />

      {/* Split hero */}
      <section className="border-b border-border bg-white">
        <Container size="wide" className="pt-6 pb-0 sm:pt-8">
          <Breadcrumbs items={breadcrumbs} className="mb-5" />

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
            <div className="pb-8 lg:pb-10">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase">
                  Comparison
                </p>
                <ComparisonShareSave
                  saveKey={saveKey}
                  shareTitle={displayTitle}
                  className="shrink-0"
                />
              </div>

              {editorialSlug && (
                <p className="mt-3 text-sm">
                  <Link
                    href={`/compare/${editorialSlug}`}
                    className="font-medium text-accent-ink hover:underline"
                  >
                    View full editorial comparison →
                  </Link>
                </p>
              )}

              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
                {displayTitle}
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                {summary}
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                <li className="flex items-start gap-2.5 text-[12px] text-muted">
                  <BadgeCheck
                    className="mt-0.5 size-4 shrink-0 text-foreground"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>{metaKind}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[12px] text-muted">
                  <Database
                    className="mt-0.5 size-4 shrink-0 text-foreground"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>Data driven</span>
                </li>
                <li className="flex items-start gap-2.5 text-[12px] text-muted">
                  <CalendarDays
                    className="mt-0.5 size-4 shrink-0 text-foreground"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>Updated {updatedLabel}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[12px] text-muted">
                  <Tag
                    className="mt-0.5 size-4 shrink-0 text-foreground"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>{category?.name ?? "Products"}</span>
                </li>
              </ul>
            </div>

            {heroImageSrc ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted lg:mb-0">
                <Image
                  src={heroImageSrc}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
              </div>
            ) : (
              <div className="hidden aspect-[4/3] bg-surface-muted lg:block" />
            )}
          </div>
        </Container>
      </section>

      {/* Product cards + VS + Quick Verdict */}
      <section id="overview" className={cn(SCROLL, "border-b border-border bg-white py-8")}>
        <Container size="wide">
          <CompareFitSizingBanner
            show={comparisonNeedsFitSizingBanner(category?.id, category?.slug)}
            className="mb-6 rounded-lg border border-border bg-surface-muted/60 px-4 py-3 text-[13px] leading-relaxed text-muted"
          />
          <div
            className={cn(
              "grid gap-4",
              twoProducts
                ? "lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(240px,0.85fr)] lg:items-stretch"
                : "sm:grid-cols-2 xl:grid-cols-3",
            )}
          >
            {products.map((b, index) => {
              const media = productMedia[b.product.id];
              const score = b.product.recommendationScore;
              const band =
                typeof score === "number" ? getScoreBand(score) : undefined;

              return (
                <div key={b.product.id} className="contents">
                  {twoProducts && index === 1 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-2 lg:py-0">
                      <span
                        className="inline-flex size-14 items-center justify-center rounded-full bg-charcoal-800 text-[13px] font-bold tracking-wide text-white"
                        aria-hidden
                      >
                        VS
                      </span>
                      <Link
                        href="#key-differences"
                        className="max-w-[5.5rem] text-center text-[10px] font-semibold leading-tight tracking-wide text-subtle uppercase hover:text-foreground"
                      >
                        Compare side by side →
                      </Link>
                    </div>
                  )}
                  <article className="flex flex-col border border-border bg-white p-4 sm:p-5">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                      {media ? (
                        <Image
                          src={media.src}
                          alt={media.alt ?? `${b.brand?.name ?? ""} ${b.product.name}`}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[12px] text-subtle">
                          Image unavailable
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-[11px] font-semibold tracking-wide text-subtle uppercase">
                      {b.brand?.name}
                    </p>
                    <h2 className="font-display text-xl font-bold tracking-tight">
                      <Link
                        href={`/products/${b.product.slug}`}
                        className="hover:text-accent-ink"
                      >
                        {b.product.name}
                      </Link>
                    </h2>

                    {typeof score === "number" && band && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-[4px] bg-score px-1.5 text-[14px] font-bold text-score-foreground tabular-nums">
                          {displayScore(score)}
                        </span>
                        <span className="text-[13px] font-medium text-foreground">
                          {band.label}
                        </span>
                      </div>
                    )}

                    {b.product.shortDescription && (
                      <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-muted">
                        {b.product.shortDescription}
                      </p>
                    )}

                    <div className="mt-3 text-[13px]">
                      {b.lowestPrice ? (
                        <p className="font-semibold tabular-nums">
                          From{" "}
                          {formatPrice(
                            b.lowestPrice.price,
                            b.lowestPrice.currency,
                          )}
                        </p>
                      ) : (
                        <p className="text-subtle">No current regional offer</p>
                      )}
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-4">
                      <Link
                        href={`/products/${b.product.slug}#offers`}
                        className="inline-flex h-10 items-center justify-center rounded-[4px] bg-accent px-3 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
                      >
                        View prices
                        {b.offers.length > 0 ? ` (${b.offers.length})` : ""} →
                      </Link>
                      {b.review?.slug ? (
                        <Link
                          href={`/reviews/${b.review.slug}`}
                          className="text-center text-[12px] font-medium text-link hover:underline"
                        >
                          Read review →
                        </Link>
                      ) : (
                        <Link
                          href={`/products/${b.product.slug}`}
                          className="text-center text-[12px] font-medium text-link hover:underline"
                        >
                          View product →
                        </Link>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}

            {/* Quick Verdict — white card matching mockup */}
            <aside className="border border-border bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.06)] sm:col-span-2 xl:col-span-1 lg:col-span-1">
              <p className="text-[11px] font-bold tracking-[0.12em] text-foreground uppercase">
                Quick Verdict
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {comparison?.verdict ??
                  (mode === "generated"
                    ? "Structured differences only — no fabricated overall winner."
                    : "See choose-if guidance below for which product fits your goals.")}
              </p>
              {chooseReasons.length > 0 && (
                <div className="mt-5 space-y-4">
                  {productIds.map((pid) => {
                    const reasons = chooseReasons.filter(
                      (r) => r.productId === pid,
                    );
                    if (reasons.length === 0) return null;
                    return (
                      <div key={pid}>
                        <p className="text-[12px] font-bold text-accent-ink">
                          Choose {productLabels[pid]} if…
                        </p>
                        <ul className="mt-1.5 space-y-1.5 text-[12px] leading-snug text-foreground">
                          {reasons.map((r, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span
                                className="mt-1 size-1.5 shrink-0 rounded-full bg-score"
                                aria-hidden
                              />
                              <span>{r.reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <ComparisonSectionNav sectionIds={sectionIds} />

      {/* Editorial decision guide — before stats */}
      {(comparison?.verdict ||
        chooseReasons.length > 0 ||
        (comparison?.editorialSections?.length ?? 0) > 0) && (
        <section
          id="decision"
          className={cn(
            SCROLL,
            "border-b border-border bg-[linear-gradient(180deg,#f0f2f4_0%,#ffffff_42%)] py-10 sm:py-12",
          )}
        >
          <Container size="wide">
            <h2 className="heading-section">Decision guide</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">
              When each shoe is the better buy — by training mix and conditions,
              not overall score alone.
            </p>

            {comparison?.verdict && (
              <div className="mt-6 border-l-4 border-accent bg-white/80 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:px-6">
                <p className="text-[12px] font-bold tracking-[0.08em] text-accent-ink uppercase">
                  Bottom line
                </p>
                <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-foreground">
                  {comparison.verdict}
                </p>
                {comparison.winnerReason && (
                  <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted">
                    {comparison.winnerReason}
                  </p>
                )}
              </div>
            )}

            {chooseReasons.length > 0 && (
              <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-5">
                {productIds.map((pid) => {
                  const reasons = chooseReasons.filter(
                    (r) => r.productId === pid,
                  );
                  if (reasons.length === 0) return null;
                  const media = productMedia[pid];
                  const bundle = products.find((b) => b.product.id === pid);
                  return (
                    <article
                      key={pid}
                      className="group overflow-hidden border border-border bg-white transition-[border-color,box-shadow] duration-300 hover:border-charcoal-800/25 hover:shadow-[0_12px_32px_-18px_rgba(15,23,32,0.35)]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(ellipse_at_center,#e8eaed_0%,#f5f6f7_70%)]">
                        {media ? (
                          <Image
                            src={media.src}
                            alt={
                              media.alt ??
                              `${bundle?.brand?.name ?? ""} ${productLabels[pid]}`
                            }
                            fill
                            className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04] sm:p-7"
                            sizes="(max-width: 1024px) 100vw, 40vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[12px] text-subtle">
                            Image unavailable
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                      </div>
                      <div className="relative -mt-3 px-5 pb-5 pt-1 sm:px-6">
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-subtle uppercase">
                          {bundle?.brand?.name}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                          Choose {productLabels[pid]} if…
                        </p>
                        <ul className="mt-4 space-y-3">
                          {reasons.map((r, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-[14px] leading-snug text-foreground"
                            >
                              <span
                                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-score"
                                aria-hidden
                              />
                              <span className="first-letter:uppercase">
                                {r.reason}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {(comparison?.editorialSections?.length ?? 0) > 0 && (
              <div className="mt-10 space-y-6">
                {comparison!.editorialSections!.map((section) => {
                  const matched = products.find((b) =>
                    section.heading
                      .toLowerCase()
                      .includes(b.product.name.toLowerCase()),
                  );
                  const media = matched
                    ? productMedia[matched.product.id]
                    : undefined;

                  if (matched && media) {
                    return (
                      <article
                        key={section.id}
                        className="grid overflow-hidden border border-border bg-white sm:grid-cols-[minmax(140px,220px)_minmax(0,1fr)]"
                      >
                        <div className="relative min-h-[160px] bg-[radial-gradient(ellipse_at_center,#e8eaed_0%,#f5f6f7_70%)] sm:min-h-full">
                          <Image
                            src={media.src}
                            alt={
                              media.alt ??
                              `${matched.brand?.name ?? ""} ${matched.product.name}`
                            }
                            fill
                            className="object-contain p-6"
                            sizes="220px"
                          />
                        </div>
                        <div className="flex flex-col justify-center border-t border-border p-5 sm:border-t-0 sm:border-l sm:p-7">
                          <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                            {section.heading}
                          </h3>
                          <p className="mt-3 text-[15px] leading-relaxed text-muted">
                            {section.body}
                          </p>
                        </div>
                      </article>
                    );
                  }

                  return (
                    <div
                      key={section.id}
                      className="max-w-3xl border-l-2 border-border pl-5 sm:pl-6"
                    >
                      <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                        {section.heading}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">
                        {section.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Key Differences + Scores */}
      {showDiffScoresRow && (
        <section className="border-b border-border bg-white py-10">
          <Container size="wide">
            <div
              className={cn(
                "grid gap-10",
                hasKeyDiffs && hasScores
                  ? "lg:grid-cols-2 lg:gap-12"
                  : "grid-cols-1",
              )}
            >
              {hasKeyDiffs && (
                <div id="key-differences" className={SCROLL}>
                  <h2 className="heading-section">Key Differences</h2>
                  {keyDifferencesEditorial.length > 0 ? (
                    <ul className="mt-5 divide-y divide-border border-y border-border">
                      {keyDifferencesEditorial.map((kd, i) => (
                        <li key={kd.key ?? i} className="py-4">
                          <h3 className="text-[14px] font-bold text-foreground">
                            {kd.label}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                            {kd.productImpacts.map((pi) => (
                              <span key={pi.productId}>
                                <span className="text-muted">
                                  {productLabels[pi.productId]}:{" "}
                                </span>
                                <span className="font-medium">{pi.impact}</span>
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed text-muted">
                            {kd.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-5 divide-y divide-border border-y border-border">
                      {differences.importantDifferences.map((row) => (
                        <li key={row.key} className="py-3">
                          <p className="text-[13px] font-semibold">
                            {row.label}
                            {row.unit ? ` (${row.unit})` : ""}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-4 text-[13px] text-muted">
                            {productIds.map((id) => (
                              <span key={id}>
                                {productLabels[id]}:{" "}
                                <span className="font-medium text-foreground">
                                  {row.valuesByProduct[id]}
                                </span>
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {hasScores && (
                <div id="scores" className={SCROLL}>
                  <h2 className="heading-section">Score Comparison</h2>
                  <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {productIds.slice(0, 2).map((id, i) => (
                      <span key={id} className="inline-flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-block size-2.5 rounded-[2px]",
                            i === 0 ? "bg-accent" : "bg-charcoal-800",
                          )}
                        />
                        {productLabels[id]}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-5 space-y-4">
                    {scoreRows.map((row) => (
                      <li key={row.key}>
                        <p className="mb-1.5 text-[12px] font-semibold text-foreground">
                          {row.label}
                        </p>
                        <div className="space-y-1.5">
                          {productIds.slice(0, 2).map((id, i) => {
                            const value = row.valuesByProduct[id];
                            const width =
                              typeof value === "number"
                                ? Math.max(4, Math.min(100, value))
                                : 0;
                            return (
                              <div key={id} className="flex items-center gap-3">
                                <div className="h-2.5 flex-1 overflow-hidden rounded-[2px] bg-surface-muted">
                                  {typeof value === "number" && (
                                    <div
                                      className={cn(
                                        "h-full rounded-[2px]",
                                        i === 0
                                          ? "bg-accent"
                                          : "bg-charcoal-800",
                                      )}
                                      style={{ width: `${width}%` }}
                                      role="meter"
                                      aria-valuenow={value}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                      aria-label={`${productLabels[id]} ${row.label} ${displayScore(value)}`}
                                    />
                                  )}
                                </div>
                                <span className="w-8 text-right text-[12px] font-bold tabular-nums text-foreground">
                                  {typeof value === "number"
                                    ? displayScore(value)
                                    : "—"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Use-Case Winners */}
      {useCaseCards.length > 0 && (
        <section
          id="use-cases"
          className={cn(SCROLL, "border-b border-border bg-white py-10 sm:py-12")}
        >
          <Container size="wide">
            <h2 className="heading-section">When each wins</h2>
            <p className="mt-2 max-w-2xl text-[14px] text-muted">
              Context winners by session type — use these with the decision guide
              above, not as a universal ranking.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {useCaseCards.map((card) => {
                const media =
                  card.winnerProductId && card.state !== "tie"
                    ? productMedia[card.winnerProductId]
                    : undefined;

                return (
                  <article
                    key={card.useCaseId}
                    className="group flex flex-col border border-border bg-white transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-charcoal-800/30"
                  >
                    <div className="relative flex h-[7.5rem] items-end justify-center overflow-hidden bg-[radial-gradient(ellipse_at_60%_40%,#e8eaed_0%,#f5f6f7_68%)] px-4 pt-4">
                      {card.state === "tie" ? (
                        <div className="flex w-full items-center justify-center gap-3 pb-3">
                          {productIds.slice(0, 2).map((id, i) => {
                            const m = productMedia[id];
                            return m ? (
                              <div
                                key={id}
                                className="relative aspect-[4/3] w-[42%] max-w-[7rem]"
                              >
                                <Image
                                  src={m.src}
                                  alt={m.alt ?? productLabels[id]}
                                  fill
                                  className="object-contain"
                                  sizes="112px"
                                />
                                {i === 0 && (
                                  <span className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-charcoal-800 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
                                    VS
                                  </span>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : media ? (
                        <div className="relative aspect-[4/3] w-[72%] max-w-[12rem] transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                          <Image
                            src={media.src}
                            alt={
                              media.alt ??
                              card.winnerLabel ??
                              "Winning product"
                            }
                            fill
                            className="object-contain"
                            sizes="192px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full items-center text-[12px] text-subtle">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col border-t border-border p-4">
                      <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                        {card.label}
                      </p>
                      <p className="mt-1.5 font-display text-lg font-bold tracking-tight">
                        {card.state === "tie"
                          ? "TIE"
                          : card.winnerLabel ?? "—"}
                      </p>
                      {card.rationale ? (
                        <p className="mt-2 text-[13px] leading-relaxed text-muted">
                          {card.rationale}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Specs */}
      {primarySpecs.length > 0 && (
        <section id="specs" className={cn(SCROLL, "border-b border-border bg-white py-10")}>
          <Container size="wide">
            <h2 className="heading-section">Specs</h2>
            <ScrollableTableRegion
              label="Specification comparison"
              className="mt-5 max-w-full border border-border"
            >
              <table className="w-full min-w-[36rem] text-left text-[13px]">
                <caption className="sr-only">Specification comparison</caption>
                <thead className="bg-surface-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Spec
                    </th>
                    {productIds.map((id) => (
                      <th
                        key={id}
                        scope="col"
                        className="px-3 py-2.5 font-semibold"
                      >
                        {productLabels[id]}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Winner
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {primarySpecs.map((row) => (
                    <tr key={row.key}>
                      <th
                        scope="row"
                        className="px-3 py-2.5 font-normal text-muted"
                      >
                        {row.label}
                        {row.unit ? ` (${row.unit})` : ""}
                      </th>
                      {productIds.map((id) => (
                        <td
                          key={id}
                          className="px-3 py-2.5 font-medium tabular-nums"
                        >
                          {row.valuesByProduct[id]}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 font-semibold">
                        {specWinnerCell(row, productIds, productLabels)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTableRegion>
          </Container>
        </section>
      )}

      {/* Prices + Finder CTA */}
      <section id="prices" className={cn(SCROLL, "border-b border-border bg-white py-10")}>
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
            <div>
              <h2 className="heading-section">Current Prices</h2>
              <p className="mt-1 text-[12px] text-subtle">
                Regional prices · {regionLabel}
              </p>
              <div
                className={cn(
                  "mt-5 grid gap-3",
                  productIds.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {products.map((b) => (
                  <div
                    key={b.product.id}
                    className="border border-border bg-white p-4"
                  >
                    <h3 className="text-[14px] font-bold">{b.product.name}</h3>
                    {b.lowestPrice ? (
                      <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                        From{" "}
                        {formatPrice(
                          b.lowestPrice.price,
                          b.lowestPrice.currency,
                        )}
                      </p>
                    ) : (
                      <p className="mt-2 text-[13px] text-subtle">
                        No current regional offer found
                      </p>
                    )}
                    {b.offers.length > 0 && (
                      <ul className="mt-3 space-y-1 text-[12px] text-muted">
                        {b.offers.slice(0, 3).map(({ offer, retailer }) => (
                          <li key={offer.id}>
                            {retailer?.name ?? "Retailer"}:{" "}
                            {formatPrice(offer.price, offer.currency)}
                            {offer.url ? (
                              <>
                                {" · "}
                                <a
                                  href={buildOfferClickHref(
                                    offer.id,
                                    "comparison",
                                  )}
                                  rel="noopener noreferrer sponsored nofollow"
                                  className="font-medium text-accent-ink hover:underline"
                                >
                                  Check price
                                </a>
                              </>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              {pricesLastChecked && (
                <p className="mt-4 text-[11px] text-subtle">
                  Prices last checked:{" "}
                  {new Date(pricesLastChecked).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  . Offer updates do not mean the editorial comparison was
                  re-reviewed.
                </p>
              )}
            </div>

            <aside className="border border-border bg-white p-5 sm:p-6">
              <h2 className="heading-section text-[15px]">Still Not Sure?</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                This comparison shows structured differences. The finder
                personalises for your training, preferences and budget.
              </p>
              {finderHref ? (
                <Link
                  href={finderHref}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
                >
                  {finderCtaLabel ?? "Find my match →"}
                </Link>
              ) : (
                <Link
                  href={`/compare?${builderQuery}${category ? `&category=${category.slug}` : ""}&edit=1`}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
                >
                  Compare another
                </Link>
              )}
              {finderThumbnails.length > 0 && (
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {finderThumbnails.map((src, i) => (
                    <div
                      key={`${src}-${i}`}
                      className="relative aspect-square overflow-hidden bg-surface-muted"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>

      {/* Reviews */}
      {products.some((p) => p.review?.slug) && (
        <section id="reviews" className={cn(SCROLL, "border-b border-border bg-white py-10")}>
          <Container size="wide">
            <h2 className="heading-section">Reviews</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {products
                .filter((p) => p.review?.slug)
                .map((p) => (
                  <Link
                    key={p.product.id}
                    href={`/reviews/${p.review!.slug}`}
                    className="inline-flex h-10 items-center rounded-[4px] border border-border px-4 text-[13px] font-semibold hover:bg-surface-muted"
                  >
                    {p.product.name} review
                  </Link>
                ))}
            </div>
          </Container>
        </section>
      )}

      {alternatives.length > 0 ? (
        <section
          id="alternatives"
          className={cn(SCROLL, "border-b border-border bg-white py-10")}
        >
          <Container size="wide">
            <h2 className="heading-section mb-4">Top Alternatives</h2>
            <ul className="divide-y divide-border border-y border-border">
              {alternatives.map((alt) => {
                const media = getPrimaryProductMedia(alt.product);
                return (
                  <li key={alt.product.id}>
                    <Link
                      href={`/products/${alt.product.slug}`}
                      className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-muted/40"
                    >
                      <span className="relative flex size-12 shrink-0 overflow-hidden rounded-[4px] border border-border bg-white">
                        {media ? (
                          <Image
                            src={media.src}
                            alt=""
                            fill
                            className="object-contain p-1"
                            sizes={IMAGE_SIZES.altThumb}
                            quality={IMAGE_QUALITY.thumb}
                            loading="lazy"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-foreground">
                          {alt.brand?.name} {alt.product.name}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-muted">
                          {alt.reason}
                        </span>
                      </span>
                      <span className="text-subtle" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {products.length >= 2 && (
              <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
                {products.slice(0, 2).map((p) => (
                  <Link
                    key={p.product.id}
                    href={`/products/${p.product.slug}/alternatives`}
                    className="font-medium text-link hover:underline"
                  >
                    Full alternatives to {p.product.name} →
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      ) : products.length >= 2 ? (
        <section
          id="alternatives"
          className={cn(SCROLL, "border-b border-border bg-white py-10")}
        >
          <Container size="wide">
            <h2 className="heading-section mb-2">Alternatives</h2>
            <p className="mb-4 max-w-2xl text-[14px] text-muted">
              Prefer a different shoe than either side of this matchup? Open the
              full replace-X shortlists.
            </p>
            <div className="flex flex-wrap gap-3 text-[13px]">
              {products.slice(0, 2).map((p) => (
                <Link
                  key={p.product.id}
                  href={`/products/${p.product.slug}/alternatives`}
                  className="font-medium text-link hover:underline"
                >
                  Alternatives to {p.product.name} →
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <TrustRow />

      {/* FAQ */}
      {faq.length > 0 && (
        <section
          id="faq"
          className={cn(
            SCROLL,
            "border-b border-border bg-[linear-gradient(180deg,#f0f2f4_0%,#ffffff_38%)] py-10 sm:py-12",
          )}
        >
          <Container size="wide">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.85fr)] lg:items-start lg:gap-10">
              <div>
                <h2 className="heading-section">FAQ</h2>
                <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
                  Practical answers for this pair — open a question for the
                  short call and which shoe it points to.
                </p>
                <div className="mt-6 divide-y divide-border border border-border bg-white">
                  {faq.map((f, index) => {
                    const hintMedia = f.productId
                      ? productMedia[f.productId]
                      : undefined;
                    const hintLabel = f.productId
                      ? productLabels[f.productId]
                      : undefined;
                    return (
                      <details
                        key={f.id}
                        className="group"
                        open={index === 0}
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 marker:content-none sm:px-5 [&::-webkit-details-marker]:hidden">
                          <span className="font-display text-[15px] font-bold leading-snug tracking-tight text-foreground sm:text-base">
                            {f.question}
                          </span>
                          <span
                            className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center border border-border text-[18px] leading-none text-muted transition-transform duration-200 group-open:rotate-45"
                            aria-hidden
                          >
                            +
                          </span>
                        </summary>
                        <div className="border-t border-border bg-surface-muted/40 px-4 py-4 sm:px-5">
                          <div className="flex gap-4">
                            {hintMedia && (
                              <Link
                                href={`/products/${products.find((b) => b.product.id === f.productId)?.product.slug ?? ""}`}
                                className="relative hidden size-[4.5rem] shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_center,#e8eaed_0%,#f5f6f7_70%)] sm:block"
                              >
                                <Image
                                  src={hintMedia.src}
                                  alt={
                                    hintMedia.alt ??
                                    hintLabel ??
                                    "Referenced product"
                                  }
                                  fill
                                  className="object-contain p-1.5"
                                  sizes="72px"
                                />
                              </Link>
                            )}
                            <div className="min-w-0 flex-1">
                              {hintLabel && (
                                <p className="text-[11px] font-bold tracking-[0.1em] text-accent-ink uppercase">
                                  Points to {hintLabel}
                                </p>
                              )}
                              <p
                                className={cn(
                                  "text-[14px] leading-relaxed text-muted",
                                  hintLabel && "mt-1.5",
                                )}
                              >
                                {f.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>

              <aside className="border border-border bg-white p-5 sm:p-6 lg:sticky lg:top-[calc(var(--site-chrome-height)+4rem)]">
                <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                  Still deciding?
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  Jump back to the decision guide, or open either product for
                  fit notes and current prices.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {products.slice(0, 2).map((b) => {
                    const media = productMedia[b.product.id];
                    return (
                      <Link
                        key={b.product.id}
                        href={`/products/${b.product.slug}`}
                        className="group overflow-hidden border border-border transition-colors hover:border-charcoal-800/30"
                      >
                        <div className="relative aspect-[4/3] bg-[radial-gradient(ellipse_at_center,#e8eaed_0%,#f5f6f7_70%)]">
                          {media ? (
                            <Image
                              src={media.src}
                              alt={
                                media.alt ??
                                `${b.brand?.name ?? ""} ${b.product.name}`
                              }
                              fill
                              className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
                              sizes="140px"
                            />
                          ) : null}
                        </div>
                        <p className="border-t border-border px-2 py-2 text-center text-[11px] font-semibold leading-tight">
                          {b.product.name}
                        </p>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="#decision"
                    className="inline-flex h-10 items-center justify-center rounded-[4px] bg-accent px-3 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
                  >
                    Decision guide →
                  </Link>
                  <Link
                    href="#use-cases"
                    className="inline-flex h-10 items-center justify-center rounded-[4px] border border-border px-3 text-[12px] font-bold tracking-[0.04em] uppercase transition-colors hover:bg-surface-muted"
                  >
                    When each wins →
                  </Link>
                </div>
              </aside>
            </div>
          </Container>
        </section>
      )}

      {relatedComparisons.length > 0 && (
        <section className="border-b border-border bg-white py-8">
          <Container size="wide">
            <h2 className="heading-section">Related comparisons</h2>
            <ul className="mt-4 space-y-2">
              {relatedComparisons.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/compare/${c.slug}`}
                    className="text-[13px] font-medium text-accent-ink hover:underline"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="bg-white py-8">
        <Container size="wide">
          <Link
            href={`/compare?${builderQuery}${category ? `&category=${category.slug}` : ""}&edit=1`}
            className="inline-flex h-10 items-center rounded-[4px] border border-border px-4 text-[13px] font-semibold hover:bg-surface-muted"
          >
            Compare another{" "}
            {category?.name?.toLowerCase().replace(/s$/, "") ?? "product"}
          </Link>
        </Container>
      </section>
    </>
  );
}
