import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import {
  formatGuideScore,
  type BestGuidePageData,
  type GuideRecommendationBlock,
} from "@/lib/best/get-best-guide-page-data";
import { getScoreBand } from "@/lib/product/score";
import { cn } from "@/lib/utils";
import { AudienceAvailability } from "@/components/catalog/ShopByFitChips";
import { CatalogFromPrice } from "@/components/commerce/CatalogPriceIsland";
import { ScrollableTableRegion } from "@/components/ui/ScrollableTableRegion";

/**
 * Core decision-guide recommendation blocks.
 * Products are the conclusion of analysis — not a card grid of buy links.
 *
 * Layout: sticky product identity | readable analysis + decision strip.
 * Mid-list comparison tables are intentionally omitted — comparison lives
 * once after the recommendation list.
 */
export function BestGuideDetailedPicks({
  data,
}: {
  data: BestGuidePageData;
}) {
  const { recommendations, category, primaryUseCase, contextConfig } = data;
  if (recommendations.length === 0) return null;

  const categorySlug = category?.slug ?? "";
  const useCaseLabel = primaryUseCase?.name ?? contextConfig.label;
  const whyHeading = `Why it works for ${useCaseLabel.toLowerCase()}`;

  return (
    <section className="py-8">
      <Container size="wide">
        <h2 className="heading-section mb-2">Recommendations</h2>
        <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-muted">
          Each pick explains why it fits this use case, who it is for, the
          trade-offs, and when another product is a better choice. Kitletics
          Score is a product assessment — not why it was selected here.
        </p>

        {recommendations[0]?.entry.whyItWon && (
          <div className="mb-10 border-l-4 border-accent bg-surface-muted/50 px-5 py-5 sm:px-6">
            <p className="text-[12px] font-semibold text-accent-ink">
              Why our #1 ranked first
            </p>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-foreground">
              {recommendations[0].entry.whyItWon}
            </p>
            <p className="mt-3 text-[13px] text-muted">
              Even the top pick is not universal — see its trade-offs and
              “choose something else” notes below.
            </p>
          </div>
        )}

        <div className="divide-y divide-border border-y border-border">
          {recommendations.map((rec, index) => (
            <GuideRecommendationSection
              key={rec.product.id}
              rec={rec}
              categorySlug={categorySlug}
              whyHeading={whyHeading}
              isTopPick={index === 0}
              data={data}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function GuideRecommendationSection({
  rec,
  categorySlug,
  whyHeading,
  isTopPick,
  data,
}: {
  rec: GuideRecommendationBlock;
  categorySlug: string;
  whyHeading: string;
  isTopPick: boolean;
  data: BestGuidePageData;
}) {
  const score = rec.product.recommendationScore;
  const band = score !== undefined ? getScoreBand(score) : undefined;
  const entry = rec.entry;
  const whyParagraphs = (
    entry.whyItFits?.length && entry.whyItFits.length > 0
      ? entry.whyItFits
      : [rec.whyText]
  )
    .map((para) => para.trim())
    .filter((para) => para.length >= 40);
  const bestFor = entry.bestForProfiles?.length
    ? entry.bestForProfiles
    : rec.bestForLabels.slice(0, 4);
  const tradeoffs = entry.tradeoffs?.length
    ? entry.tradeoffs
    : rec.compromises.slice(0, 3);
  const notIdeal = entry.notIdealFor?.length
    ? entry.notIdealFor
    : (entry.whoShouldAvoid ?? []).slice(0, 4);
  const strengths = entry.useCaseStrengths?.length
    ? entry.useCaseStrengths
    : rec.strengths.slice(0, 4);
  const chooseInstead = resolveChooseInstead(rec, data);
  const offerCount = rec.offers.length;
  const fullName = rec.brand?.name
    ? `${rec.brand.name} ${rec.product.name}`
    : rec.product.name;

  return (
    <article
      id={`rec-${rec.product.slug}`}
      className="scroll-mt-24 grid gap-8 py-10 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:items-start lg:gap-12"
    >
      <div className="lg:sticky lg:top-24">
        <ProductIdentityColumn
          rec={rec}
          categorySlug={categorySlug}
          fullName={fullName}
          score={score}
          band={band}
          offerCount={offerCount}
          isTopPick={isTopPick}
          awardLabel={rec.awardLabel}
        />
      </div>

      <div className="min-w-0 space-y-7">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold text-foreground">
            {whyHeading}
          </p>
          <div className="mt-3 space-y-3.5">
            {whyParagraphs.map((para) => (
              <p
                key={para.slice(0, 48)}
                className="text-[15px] leading-relaxed text-foreground"
              >
                {para}
              </p>
            ))}
          </div>

          {strengths.length > 0 && (
            <ul className="mt-5 space-y-1.5">
              {strengths.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-foreground"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-score"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {(entry.worksWellFor?.length || entry.lessSuitedTo?.length) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {entry.worksWellFor?.map((label) => (
                <span
                  key={`w-${label}`}
                  className="border border-border bg-surface px-2 py-0.5 text-[11px] text-muted"
                >
                  Works: {label}
                </span>
              ))}
              {entry.lessSuitedTo?.map((label) => (
                <span
                  key={`l-${label}`}
                  className="border border-dashed border-border px-2 py-0.5 text-[11px] text-subtle"
                >
                  Less suited: {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <DecisionRail
          bestFor={bestFor}
          tradeoffs={tradeoffs}
          notIdeal={notIdeal}
          chooseInstead={chooseInstead}
        />
      </div>
    </article>
  );
}

function ProductIdentityColumn({
  rec,
  categorySlug,
  fullName,
  score,
  band,
  offerCount,
  isTopPick,
  awardLabel,
}: {
  rec: GuideRecommendationBlock;
  categorySlug: string;
  fullName: string;
  score?: number;
  band?: { label: string };
  offerCount: number;
  isTopPick: boolean;
  awardLabel?: string;
}) {
  return (
    <div className="space-y-3">
      {awardLabel && (
        <span className="inline-flex bg-accent px-2 py-1 text-[10px] font-bold tracking-[0.04em] text-accent-foreground uppercase">
          {isTopPick ? "Top pick · " : ""}
          {awardLabel}
        </span>
      )}

      <Link
        href={`/products/${rec.product.slug}`}
        className="relative flex aspect-[4/3] items-center justify-center border border-border bg-white"
      >
        {rec.media ? (
          <Image
            src={rec.media.src}
            alt={rec.media.alt || rec.product.fullName}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 50vw, 260px"
            priority={isTopPick}
          />
        ) : null}
      </Link>

      <div>
        <h3
          className={cn(
            "font-display font-bold leading-tight text-foreground",
            isTopPick ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
          )}
        >
          <Link
            href={`/products/${rec.product.slug}`}
            className="hover:text-link"
          >
            {fullName}
          </Link>
        </h3>
        {rec.entry.summary && (
          <p className="mt-1.5 text-[13px] leading-snug font-medium text-muted">
            {rec.entry.summary}
          </p>
        )}

        <AudienceAvailability
          label={rec.audienceAvailability}
          className="mt-2"
        />

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {score !== undefined && (
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-[4px] bg-score text-[13px] font-bold text-score-foreground tabular-nums">
                {formatGuideScore(score)}
              </span>
              {band && (
                <span className="text-[12px] text-muted">{band.label}</span>
              )}
            </span>
          )}
          {rec.lowestPrice ? (
            <span className="font-display text-lg font-bold text-foreground">
              <CatalogFromPrice
                slug={rec.product.slug}
                fallback={{
                  price: rec.lowestPrice.price,
                  currency: rec.lowestPrice.currency,
                }}
              />
            </span>
          ) : (
            <span className="text-[13px] text-muted">
              No verified Netherlands-shipping retailer is currently available.
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {offerCount > 0 ? (
            <Link
              href={`/products/${rec.product.slug}#offers`}
              className="inline-flex h-9 w-full items-center justify-center bg-accent px-3 text-[11px] font-bold tracking-[0.04em] text-accent-foreground uppercase transition-colors hover:opacity-90"
            >
              Prices ({offerCount}) →
            </Link>
          ) : (
            <Link
              href={`/products/${rec.product.slug}`}
              className="inline-flex h-9 w-full items-center justify-center border border-border bg-white px-3 text-[11px] font-bold tracking-[0.04em] text-foreground uppercase transition-colors hover:border-foreground/40"
            >
              View product →
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {rec.reviewSlug ? (
              <Link
                href={`/reviews/${rec.reviewSlug}`}
                className="text-[13px] font-medium text-link hover:underline"
              >
                Review →
              </Link>
            ) : (
              <Link
                href={`/products/${rec.product.slug}`}
                className="text-[13px] font-medium text-link hover:underline"
              >
                Product →
              </Link>
            )}
            {rec.comparisons[0] && (
              <Link
                href={`/compare/${rec.comparisons[0].slug}`}
                className="text-[13px] font-medium text-link hover:underline"
              >
                Compare closest →
              </Link>
            )}
            <AddToCompareButton
              product={{
                slug: rec.product.slug,
                name: rec.product.name,
                brandName: rec.brand?.name,
                categoryId: rec.product.categoryId,
                categorySlug,
              }}
              source="best-guide"
              size="sm"
              variant="outline"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionRail({
  bestFor,
  tradeoffs,
  notIdeal,
  chooseInstead,
}: {
  bestFor: string[];
  tradeoffs: string[];
  notIdeal: string[];
  chooseInstead: {
    when: string;
    productId?: string;
    label?: string;
    href?: string;
  }[];
}) {
  if (
    bestFor.length === 0 &&
    tradeoffs.length === 0 &&
    notIdeal.length === 0 &&
    chooseInstead.length === 0
  ) {
    return null;
  }

  const panels = [
    bestFor.length > 0,
    tradeoffs.length > 0,
    notIdeal.length > 0,
    chooseInstead.length > 0,
  ].filter(Boolean).length;

  return (
    <aside className="border border-border bg-surface-muted/30 px-4 py-5 sm:px-5">
      <div
        className={cn(
          "grid gap-6",
          panels >= 3
            ? "sm:grid-cols-2 xl:grid-cols-3"
            : panels === 2
              ? "sm:grid-cols-2"
              : "grid-cols-1",
        )}
      >
        {bestFor.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold text-foreground">Best for</p>
            <ul className="mt-2 space-y-1.5">
              {bestFor.map((label) => (
                <li
                  key={label}
                  className="flex items-start gap-2 text-[13px] leading-snug text-foreground"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tradeoffs.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold text-foreground">Trade-offs</p>
            <ul className="mt-2 space-y-1.5">
              {tradeoffs.map((item) => (
                <li key={item} className="text-[13px] leading-snug text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {notIdeal.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold text-foreground">
              Not ideal for
            </p>
            <ul className="mt-2 space-y-1.5">
              {notIdeal.map((item) => (
                <li key={item} className="text-[13px] leading-snug text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {chooseInstead.length > 0 && (
          <div className={cn(panels >= 3 && "sm:col-span-2 xl:col-span-1")}>
            <p className="text-[12px] font-semibold text-foreground">
              Choose something else if…
            </p>
            <ul className="mt-2 space-y-3">
              {chooseInstead.map((alt) => (
                <li key={`${alt.when}-${alt.productId ?? alt.label}`}>
                  <p className="text-[13px] leading-snug text-foreground">
                    {alt.label ? (
                      <>
                        <span className="font-semibold">Choose {alt.label}</span>{" "}
                        if {alt.when}
                      </>
                    ) : (
                      alt.when
                    )}
                  </p>
                  {alt.href && (
                    <Link
                      href={alt.href}
                      className="mt-0.5 inline-block text-[12px] font-medium text-link hover:underline"
                    >
                      Jump to pick →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

function resolveChooseInstead(
  rec: GuideRecommendationBlock,
  data: BestGuidePageData,
): { when: string; productId?: string; label?: string; href?: string }[] {
  const fromEntry = rec.entry.chooseInsteadWhen;
  if (fromEntry?.length) {
    return fromEntry.map((c) => {
      const match = c.productId
        ? data.recommendations.find((r) => r.product.id === c.productId)
        : undefined;
      const consider = c.productId
        ? rec.considerInstead.find((a) => a.product.id === c.productId)
        : undefined;
      const label =
        c.label ??
        (match
          ? match.brand?.name
            ? `${match.brand.name} ${match.product.name}`
            : match.product.name
          : consider
            ? consider.brand?.name
              ? `${consider.brand.name} ${consider.product.name}`
              : consider.product.name
            : undefined);
      return {
        when: c.when,
        productId: c.productId,
        label,
        href: match
          ? `#rec-${match.product.slug}`
          : consider
            ? `/products/${consider.product.slug}`
            : undefined,
      };
    });
  }

  return rec.considerInstead.map((alt) => ({
    when: alt.reason ?? "you want a different balance for this use case",
    productId: alt.product.id,
    label: alt.brand?.name
      ? `${alt.brand.name} ${alt.product.name}`
      : alt.product.name,
    href: data.recommendations.some((r) => r.product.id === alt.product.id)
      ? `#rec-${alt.product.slug}`
      : `/products/${alt.product.slug}`,
  }));
}

/** Shared compact comparison strip used as a dedicated section */
export function GuideContextComparisonInline({
  data,
  compact = false,
}: {
  data: BestGuidePageData;
  compact?: boolean;
}) {
  const { contextComparisonRows, recommendations, contextConfig } = data;
  if (contextComparisonRows.length === 0 || recommendations.length < 2) {
    return null;
  }

  return (
    <div>
      {!compact && (
        <h2 className="heading-section mb-2">How the top picks differ</h2>
      )}
      {compact && (
        <p className="mb-3 text-[12px] font-semibold text-foreground">
          How the top picks differ
        </p>
      )}
      {!compact && (
        <p className="mb-4 max-w-2xl text-[14px] text-muted">
          Guide-specific differences for {contextConfig.label.toLowerCase()} —
          not a raw spec dump.
        </p>
      )}
      <ScrollableTableRegion label="How the top picks differ">
        <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-semibold text-foreground">Product</th>
              {contextComparisonRows.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 font-semibold text-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec) => {
              const name = rec.brand?.name
                ? `${rec.brand.name} ${rec.product.name}`
                : rec.product.name;
              return (
                <tr
                  key={rec.product.id}
                  className="border-b border-border/70 align-top"
                >
                  <td className="py-3 pr-3 font-medium text-foreground">
                    <Link
                      href={`#rec-${rec.product.slug}`}
                      className="flex items-center gap-2.5 hover:text-link"
                    >
                      {rec.media?.src ? (
                        <span className="relative h-11 w-11 shrink-0 border border-border bg-surface-muted">
                          <Image
                            src={rec.media.src}
                            alt={rec.media.alt || name}
                            fill
                            className="object-contain p-0.5"
                            sizes="44px"
                          />
                        </span>
                      ) : null}
                      <span>{name}</span>
                    </Link>
                  </td>
                  {contextComparisonRows.map((col) => (
                    <td key={col.key} className="px-2 py-3 text-muted">
                      {col.values[rec.product.id] ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollableTableRegion>
    </div>
  );
}
