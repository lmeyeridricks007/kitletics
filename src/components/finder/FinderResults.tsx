import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Info,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FinderProgressSidebar } from "@/components/finder/FinderProgressSidebar";
import { ShareResultsButton } from "@/components/finder/ShareResultsButton";
import type { FinderResultsPageData } from "@/lib/finder/get-finder-results-data";
import { formatPrice, cn } from "@/lib/utils";

function MatchGauge({
  percent,
  size = "md",
  label = "Match",
}: {
  percent: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const dim = size === "lg" ? 120 : size === "sm" ? 72 : 96;
  const r = dim / 2 - 8;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: dim, height: dim }}
      role="img"
      aria-label={`${percent}% ${label}`}
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="rgba(11,18,32,0.08)"
          strokeWidth="8"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent, #c8f135)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-display font-bold tabular-nums text-[#0b1220]",
            size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl",
          )}
        >
          {percent}%
        </span>
        <span className="text-[10px] font-medium tracking-wide text-muted uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}

function DarkMatchGauge({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  const arcLen = Math.PI * 56;
  const dash = (percent / 100) * arcLen;
  return (
    <div
      className="relative mx-auto h-[84px] w-[148px]"
      role="img"
      aria-label={`${percent}% ${label}`}
    >
      <svg viewBox="0 0 140 80" className="size-full" aria-hidden>
        <path
          d="M 14 72 A 56 56 0 0 1 126 72"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 14 72 A 56 56 0 0 1 126 72"
          fill="none"
          stroke="var(--color-accent, #c8f135)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${arcLen}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-0.5">
        <span className="font-display text-[1.75rem] font-bold leading-none text-accent">
          {percent}%
        </span>
      </div>
    </div>
  );
}

function FinderResultCard({
  row,
  isTop,
}: {
  row: FinderResultsPageData["topResults"][number];
  isTop?: boolean;
}) {
  const { product, brand, evaluation, lowestPrice, offerCount } = row;
  const match = Math.round(evaluation.matchScore);
  const strengths =
    evaluation.strengths.length > 0
      ? evaluation.strengths.slice(0, 5)
      : ["Strong overall fit for your answers"];
  const compromises =
    evaluation.compromises.length > 0
      ? evaluation.compromises.slice(0, 4)
      : [];

  return (
    <article
      className={cn(
        "border bg-white p-4 sm:p-5",
        isTop ? "border-accent/50 bg-[#fbfef0]" : "border-border",
      )}
    >
      <div className="grid gap-5 lg:grid-cols-[140px_minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left: rank + image */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-[#0b1220]">
              {evaluation.rank}
            </span>
            {isTop && (
              <span className="rounded bg-[#eef9c0] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#0b1220] uppercase">
                Top match
              </span>
            )}
          </div>
          <div className="relative aspect-square w-full max-w-[140px] overflow-hidden bg-white">
            {row.imageSrc ? (
              <Image
                src={row.imageSrc}
                alt={row.imageAlt || product.fullName}
                fill
                className="object-contain p-1"
                sizes="140px"
                priority={isTop}
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[11px] text-subtle">
                Image unavailable
              </span>
            )}
          </div>
        </div>

        {/* Center: identity + actions */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-subtle uppercase">
            {brand?.name}
          </p>
          <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-accent"
            >
              {product.name}
            </Link>
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded bg-[#123524] px-2 py-0.5 text-[11px] font-bold text-accent">
              {match}% MATCH
            </span>
            <span className="text-[12px] font-medium text-muted">
              {row.rankLabel}
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            {row.summary}
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-2 text-[13px]">
            {lowestPrice ? (
              <>
                <span className="font-semibold text-foreground">
                  From {formatPrice(lowestPrice.price, lowestPrice.currency)}
                </span>
                {offerCount > 0 && (
                  <Link
                    href={`/products/${product.slug}#offers`}
                    className="text-[12px] font-medium text-[#2563eb] hover:underline"
                  >
                    {offerCount} {offerCount === 1 ? "offer" : "offers"}
                  </Link>
                )}
              </>
            ) : (
              <span className="text-subtle">Price unavailable</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/products/${product.slug}#offers`}
              className="inline-flex items-center justify-center bg-accent px-4 py-2.5 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
            >
              View prices
            </Link>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center justify-center border border-border bg-white px-4 py-2.5 text-[12px] font-semibold text-foreground hover:border-accent/50"
            >
              View details
            </Link>
          </div>
        </div>

        {/* Right: why / compromises / gauge */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-subtle uppercase">
                Why it matched you
              </p>
              <ul className="mt-2 space-y-1.5">
                {strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[12px] leading-snug text-foreground"
                  >
                    <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-[#0b1220]">
                      <Check className="size-2.5" strokeWidth={3} aria-hidden />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-subtle uppercase">
                Potential compromises
              </p>
              {compromises.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {compromises.map((s, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[12px] leading-snug text-muted"
                    >
                      <AlertCircle
                        className="mt-0.5 size-3.5 shrink-0 text-subtle"
                        aria-hidden
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[12px] text-muted">
                  No major compromises identified from the available structured
                  data.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-center sm:items-start">
            <MatchGauge percent={match} size={isTop ? "md" : "sm"} />
          </div>
        </div>
      </div>
    </article>
  );
}

function OtherMatchCard({
  row,
}: {
  row: FinderResultsPageData["otherResults"][number];
}) {
  const match = Math.round(row.evaluation.matchScore);
  return (
    <article className="flex flex-col border border-border bg-white p-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        {row.imageSrc ? (
          <Image
            src={row.imageSrc}
            alt={row.imageAlt || row.product.fullName}
            fill
            className="object-contain p-2"
            sizes="200px"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] text-subtle">
            Image unavailable
          </span>
        )}
      </div>
      <p className="mt-2 text-[10px] font-semibold tracking-wide text-subtle uppercase">
        {row.brand?.name}
      </p>
      <h3 className="font-display text-[14px] font-semibold leading-snug">
        <Link
          href={`/products/${row.product.slug}`}
          className="hover:text-accent"
        >
          {row.product.name}
        </Link>
      </h3>
      <p className="mt-1 text-[12px] font-semibold text-foreground">
        {match}% Match{" "}
        <span className="font-normal text-muted">· {row.rankLabel}</span>
      </p>
      {row.lowestPrice ? (
        <p className="mt-1 text-[12px] text-muted">
          From {formatPrice(row.lowestPrice.price, row.lowestPrice.currency)}
          {row.offerCount > 0 ? ` · ${row.offerCount} offers` : ""}
        </p>
      ) : (
        <p className="mt-1 text-[12px] text-subtle">Price unavailable</p>
      )}
      <Link
        href={`/products/${row.product.slug}`}
        className="mt-2 inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#2563eb]"
      >
        View details
        <ArrowRight className="size-3" aria-hidden />
      </Link>
    </article>
  );
}

export function FinderResultsView({
  data,
  sharePath,
  encodedState,
}: {
  data: FinderResultsPageData;
  sharePath: string;
  encodedState: string;
}) {
  const editHref = `/tools/${data.definition.slug}?s=${encodeURIComponent(encodedState)}&edit=1`;
  const restartHref = `/tools/${data.definition.slug}`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    {
      label: data.definition.title,
      href: `/tools/${data.definition.slug}`,
    },
    { label: "Results" },
  ];

  return (
    <div className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[250px_minmax(0,1fr)_300px]">
        {/* Left rail */}
        <div className="hidden lg:block">
          <div className="sticky top-0 max-h-screen overflow-y-auto">
            <FinderProgressSidebar
              steps={data.steps}
              currentStepIndex={data.steps.length - 1}
              responses={{}}
              summaryRows={data.summaryRows}
              helpGuideHref={data.ui.helpGuideHref}
              helpGuideLabel={data.ui.helpGuideLabel}
              resultsComplete
              editHref={editHref}
            />
          </div>
        </div>

        {/* Center */}
        <div className="min-w-0 px-4 py-5 sm:px-7 sm:py-6">
          {/* Mobile completed bar */}
          <div className="mb-4 flex items-center justify-between border border-border bg-surface-muted px-3 py-2 lg:hidden">
            <p className="text-[12px] font-semibold">
              Finder complete · {data.steps.length}/{data.steps.length}
            </p>
            <Link
              href={editHref}
              className="text-[12px] font-semibold text-accent"
            >
              View answers
            </Link>
          </div>

          <Breadcrumbs items={breadcrumbs} className="mb-4" />

          <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(140px,0.45fr)] lg:items-start">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
                Your results
              </p>
              <h1 className="mt-1.5 font-display text-[1.65rem] font-bold tracking-tight text-foreground sm:text-[2rem] leading-[1.1]">
                Here are your best matches
              </h1>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
                {data.ui.resultsSupportingCopy ??
                  `Based on your answers, we found the ${data.productNoun} that best match your needs.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
                  Match quality:{" "}
                  <span className="font-semibold text-foreground">
                    {data.overallQuality}
                  </span>
                </span>
                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
                  Results based on {data.candidateCount} {data.productNoun}
                </span>
                <Link
                  href={data.ui.helpGuideHref ?? "/guides/how-to-choose-running-shoes"}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:text-foreground"
                >
                  <Info className="size-3" aria-hidden />
                  How matching works
                </Link>
              </div>
            </div>
            {data.headerHeroes.length > 0 && (
              <div className="relative hidden h-24 sm:block lg:h-28">
                {data.headerHeroes.map((p, i) => (
                  <div
                    key={p.id}
                    className="absolute top-0 aspect-square w-[44%]"
                    style={{
                      left: `${i * 26}%`,
                      zIndex: 3 - i,
                      transform: `rotate(${(i - 1) * 7}deg)`,
                    }}
                  >
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      className="object-contain p-0.5"
                      sizes="120px"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.topResults.length === 0 ? (
            <NoResults
              data={data}
              editHref={editHref}
              productNoun={data.productNoun}
            />
          ) : (
            <>
              <div className="space-y-4">
                {data.topResults.map((row, i) => (
                  <FinderResultCard
                    key={row.product.id}
                    row={row}
                    isTop={i === 0}
                  />
                ))}
              </div>

              {data.compareTopHref && data.compareCount >= 2 && (
                <section className="mt-6 border border-[#e5efc0] bg-[#f7fbe8] px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold tracking-[0.14em] text-[#0b1220] uppercase">
                        Compare your top matches
                      </p>
                      <p className="mt-1 text-[13px] text-muted">
                        Compare these {data.productNoun} side-by-side to see key
                        differences.
                      </p>
                      <div className="mt-3 flex -space-x-2">
                        {data.topResults.map((r) => (
                          <div
                            key={r.product.id}
                            className="relative size-10 overflow-hidden rounded-full border-2 border-white bg-white"
                          >
                            {r.imageSrc ? (
                              <Image
                                src={r.imageSrc}
                                alt=""
                                fill
                                className="object-contain p-0.5"
                                sizes="40px"
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={data.compareTopHref}
                      className="inline-flex items-center gap-1.5 bg-accent px-4 py-2.5 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
                    >
                      Compare top {data.compareCount}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </section>
              )}

              <section className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-surface-muted px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    Want different results?
                  </p>
                  <p className="text-[12px] text-muted">
                    Edit your answers to fine-tune your matches.
                  </p>
                </div>
                <Link
                  href={editHref}
                  className="inline-flex items-center gap-1 border border-border bg-white px-3 py-2 text-[12px] font-semibold uppercase tracking-wide hover:border-accent/50"
                >
                  Edit answers
                </Link>
              </section>

              {data.otherResults.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    Other good matches
                  </h2>
                  <p className="mt-1 text-[13px] text-muted">
                    Strong alternatives that still fit your criteria.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {data.otherResults.map((row) => (
                      <OtherMatchCard key={row.product.id} row={row} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareResultsButton
              path={sharePath}
              finderId={data.definition.id}
            />
            <Link
              href={editHref}
              className="text-[12px] font-medium text-muted hover:text-foreground"
            >
              Edit answers
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
            {[
              "Evidence-backed matches",
              "Independent methodology",
              "Structured product data",
              "Regularly verified prices",
              "Find what fits you",
            ].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>

          {data.debug && (
            <pre className="mt-8 overflow-auto border border-border bg-surface p-4 text-xs">
              {JSON.stringify(
                data.rows.map((r) => ({
                  product: r.product.slug,
                  match: r.evaluation.matchScore,
                  coverage: r.evaluation.dataCoverage,
                  factors: r.evaluation.factorScores,
                })),
                null,
                2,
              )}
            </pre>
          )}
        </div>

        {/* Right rail */}
        <div className="hidden border-l border-[#0d1216] bg-[#0d1216] p-4 lg:block">
          <div className="sticky top-4 space-y-4">
            <aside className="border border-white/10 bg-[#12181c] p-5 text-white">
              <p className="text-[11px] font-bold tracking-[0.16em] text-white/50 uppercase">
                Your match summary
              </p>
              <div className="mt-4">
                <DarkMatchGauge
                  percent={data.overallConfidencePercent}
                  label="Match quality"
                />
                <p className="mt-2 text-center text-[12px] text-white/70">
                  Match quality
                </p>
                <p className="mt-1 text-center text-[13px] font-semibold text-accent">
                  {data.overallQuality} match quality
                </p>
                <p className="mt-2 text-center text-[11px] leading-snug text-white/45">
                  Recommendation confidence from your answers and product data
                  coverage — not a probability of satisfaction, and not the same
                  as a single product&apos;s Match %.
                </p>
              </div>
            </aside>

            <aside className="border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                  Your answers
                </p>
                <Link
                  href={editHref}
                  className="text-[11px] font-semibold text-accent hover:underline"
                >
                  Edit answers →
                </Link>
              </div>
              <ul className="mt-3 space-y-2">
                {data.summaryRows.map((r) => (
                  <li key={r.key} className="text-[12px]">
                    <span className="text-subtle">{r.label}</span>
                    <p className="font-medium text-foreground">{r.value}</p>
                  </li>
                ))}
              </ul>
            </aside>

            {data.relatedGuides.length > 0 && (
              <aside className="border border-border bg-white p-4">
                <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                  Related guides
                </p>
                <ul className="mt-3 space-y-3">
                  {data.relatedGuides.map((g) => (
                    <li key={g.href}>
                      <Link href={g.href} className="flex gap-3 group">
                        {g.imageSrc ? (
                          <span className="relative size-12 shrink-0 overflow-hidden bg-surface-muted">
                            <Image
                              src={g.imageSrc}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </span>
                        ) : null}
                        <span className="min-w-0">
                          <span className="block text-[13px] font-semibold text-foreground group-hover:text-accent">
                            {g.title}
                          </span>
                          {g.description && (
                            <span className="mt-0.5 line-clamp-2 text-[11px] text-muted">
                              {g.description}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            <aside className="border border-accent/40 bg-[#f4ffe0] p-4">
              <p className="text-[11px] font-bold tracking-[0.14em] text-[#0b1220] uppercase">
                Need more help?
              </p>
              <p className="mt-2 text-[12px] text-[#0b1220]/90">
                Try again with different answers or explore other Kitletics
                tools.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={restartHref}
                  className="inline-flex bg-[#0b1220] px-3 py-2 text-[11px] font-bold tracking-wide text-white uppercase"
                >
                  Start again
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex border border-[#0b1220]/30 bg-white px-3 py-2 text-[11px] font-bold tracking-wide text-[#0b1220] uppercase"
                >
                  Tools hub
                </Link>
              </div>
            </aside>

            {data.topResults[0] && (
              <aside className="border border-border bg-white p-4">
                <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                  What&apos;s next?
                </p>
                <p className="mt-2 text-[12px] text-muted">
                  Compare current retailer offers on your top picks. Continue to
                  the retailer to purchase.
                </p>
                <ul className="mt-3 space-y-1.5 text-[12px] text-muted">
                  <li className="flex gap-2">
                    <Check className="size-3.5 text-accent" aria-hidden />
                    Compare current retailer offers
                  </li>
                  <li className="flex gap-2">
                    <Check className="size-3.5 text-accent" aria-hidden />
                    Check available sizes/variants where provided
                  </li>
                  <li className="flex gap-2">
                    <Check className="size-3.5 text-accent" aria-hidden />
                    Continue to the retailer to purchase
                  </li>
                </ul>
                <Link
                  href={`/products/${data.topResults[0].product.slug}#offers`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1 bg-accent px-3 py-2.5 text-[12px] font-bold tracking-wide text-[#0b1220] uppercase"
                >
                  View prices
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
                <p className="mt-2 text-[10px] leading-snug text-subtle">
                  Kitletics may earn a commission from retailer links. Commission
                  does not affect rankings.
                </p>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoResults({
  data,
  editHref,
  productNoun,
}: {
  data: FinderResultsPageData;
  editHref: string;
  productNoun: string;
}) {
  return (
    <div className="border border-border bg-white p-6">
      <h2 className="font-display text-xl font-semibold">
        We couldn&apos;t find a strong match for all your requirements
      </h2>
      <p className="mt-2 text-sm text-muted">
        Your answers may be highly restrictive for the current catalog (
        {data.candidateCount} {productNoun} analysed · {data.run.eligibleCount}{" "}
        eligible).
      </p>
      {data.overallQuality === "Low" && (
        <p className="mt-2 text-sm text-muted">
          We found limited coverage for some of your preferences — try relaxing
          strict filters.
        </p>
      )}
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
        <li>Edit answers</li>
        <li>Relax strict budget if set</li>
        <li>Browse the category catalog</li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={editHref}
          className="inline-flex bg-accent px-4 py-2.5 text-[12px] font-bold uppercase text-[#0b1220]"
        >
          Edit answers
        </Link>
        {data.categorySlug && (
          <Link
            href={`/${data.categorySlug.includes("running") ? "running/shoes" : "tools"}`}
            className="inline-flex border border-border px-4 py-2.5 text-[12px] font-semibold"
          >
            Browse category
          </Link>
        )}
      </div>
    </div>
  );
}

/** Alias for reusable framework consumers */
export { FinderResultsView as FinderResultsShell };
