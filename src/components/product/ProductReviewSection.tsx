import Link from "next/link";
import Image from "next/image";
import { Check, Minus, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommercePeerPrice } from "@/components/product/ProductCommerceIsland";
import { formatVerifiedDate } from "@/lib/product/score";
import type { ProductReviewSummaryData } from "@/lib/product/get-product-review-summary";
import { REVIEW_TYPE_META } from "@/lib/review/review-meta";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";
import { HorizontalPeekRail } from "@/components/ui/HorizontalPeekRail";

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProductReviewSummary({
  data,
}: {
  data: ProductReviewSummaryData;
}) {
  const typeMeta = REVIEW_TYPE_META[data.reviewType];
  const isFullReview = data.presentation === "full-review" && data.fullReviewHref;
  return (
    <div className="rounded-2xl border border-accent/20 bg-[color-mix(in_oklab,var(--color-accent)_8%,white)] p-5 sm:p-7">
      <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
        {isFullReview ? "Kitletics Review" : "Product analysis"}
      </p>
      <div className="mt-5 grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-[7rem]">
          <p className="font-display text-5xl font-semibold tabular-nums text-accent sm:text-6xl">
            {data.displayScore}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {data.scoreLabel}
          </p>
          <Link
            href="/methodology"
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-link hover:underline"
          >
            <Info className="size-3.5" aria-hidden />
            Score explained
          </Link>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            Verdict
          </p>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground">
            {data.verdict}
          </p>
        </div>

        <div className="space-y-3 lg:min-w-[11rem] lg:text-right">
          <p className="text-[12px] font-semibold text-foreground">
            {isFullReview ? typeMeta.shortLabel : "Catalog analysis"}
          </p>
          {data.lastReviewed && (
            <p className="text-[12px] text-muted">
              {isFullReview ? "Last reviewed" : "Updated"}{" "}
              <span className="text-foreground">
                {formatVerifiedDate(data.lastReviewed)}
              </span>
            </p>
          )}
          {data.fullReviewHref ? (
            <Link
              href={data.fullReviewHref}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-link hover:underline"
            >
              Read full review
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ListPanel({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "pro" | "con" | "best" | "avoid";
}) {
  if (!items.length) return null;
  const Icon =
    variant === "pro" || variant === "best"
      ? Check
      : Minus;
  const iconClass =
    variant === "pro" || variant === "best"
      ? "text-accent"
      : variant === "con"
        ? "text-red-600"
        : "text-muted";
  return (
    <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
      <h3 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[13px] leading-snug text-foreground">
            <Icon
              className={cn("mt-0.5 size-4 shrink-0", iconClass)}
              strokeWidth={2.5}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductReviewSection({
  data,
}: {
  data: ProductReviewSummaryData;
}) {
  const isFullReview = data.presentation === "full-review";
  return (
    <section
      id="review"
      className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-10"
    >
      <div>
        <h2 className="heading-section">
          {isFullReview ? "Kitletics Review" : "Product analysis"}
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] text-muted">
          {isFullReview
            ? "A buying decision based on structured product data and evidence — not invented star ratings or fake user reviews."
            : "Structured score and buying signals from verified specs and catalog comparison data — not a published editorial review page."}
        </p>
      </div>

      <ProductReviewSummary data={data} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ListPanel title="Pros" items={data.pros} variant="pro" />
        <ListPanel
          title="Cons / Trade-offs"
          items={data.cons}
          variant="con"
        />
        <ListPanel title="Best for" items={data.bestFor} variant="best" />
        <ListPanel
          title="Not ideal for"
          items={data.notIdealFor}
          variant="avoid"
        />
      </div>

      {(data.criteria.length > 0 || data.sections.length > 0) && (
        <div className="space-y-8">
          {data.criteria.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-semibold">
                Performance breakdown
              </h3>
              <ul
                className={cn(
                  "mt-4 gap-3",
                  data.criteria.length === 1
                    ? "grid max-w-md"
                    : data.criteria.length === 2
                      ? "grid sm:grid-cols-2"
                      : "grid sm:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {data.criteria.map((c) => (
                  <li
                    key={c.key}
                    className="border border-border bg-white px-4 py-3"
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="font-medium text-foreground">
                        {c.label}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted">
                        {(c.score / 10).toFixed(1)}
                        {c.note ? (
                          <span className="ml-1 text-[11px]">· {c.note}</span>
                        ) : null}
                      </span>
                    </div>
                    <ScoreBar score={c.score} max={c.max ?? 100} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-subtle">
                Scale: Poor (1–3) · Fair (4–5) · Good (6–7) · Very Good (8) ·
                Excellent (9–10)
              </p>
            </div>
          )}
          {data.sections.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-semibold">
                How it performs
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {data.sections.map((s) => (
                  <div key={s.id}>
                    <h4 className="text-[13px] font-bold text-foreground">
                      {s.heading}
                    </h4>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
              {data.fullReviewHref ? (
                <Link
                  href={data.fullReviewHref}
                  className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-link hover:underline"
                >
                  Read all performance details
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </div>
          )}
        </div>
      )}

      {data.keySpecs.length > 0 && (
        <div>
          <h3 className="font-display text-xl font-semibold">
            Key specs that matter
          </h3>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface-muted/50 text-[11px] tracking-wide text-subtle uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Spec</th>
                  <th className="px-4 py-2.5 font-medium">Value</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                    Why it matters
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.keySpecs.map((s) => (
                  <tr key={s.key} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {s.label}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {s.value}
                      {s.unit ? ` ${s.unit}` : ""}
                    </td>
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">
                      {s.whyItMatters ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface-muted/30 p-5 sm:p-6">
        <h3 className="font-display text-xl font-semibold">
          Should you buy it?
        </h3>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
              Buy if
            </p>
            <ul className="mt-3 space-y-2">
              {data.buyIf.slice(0, 4).map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[13px] text-foreground"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-red-700 uppercase">
              Skip if
            </p>
            <ul className="mt-3 space-y-2">
              {data.skipIf.slice(0, 4).map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[13px] text-foreground"
                >
                  <Minus
                    className="mt-0.5 size-4 shrink-0 text-red-600"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {data.bottomLine && (
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Final verdict
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-foreground">
              {data.bottomLine}
            </p>
          </div>
        )}
        {data.fullReviewHref ? (
          <Link
            href={data.fullReviewHref}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-foreground hover:opacity-90"
          >
            Read full review
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>

          {data.alternatives.length > 0 && (
        <div className="min-w-0 max-w-full">
          <h3 className="font-display text-xl font-semibold">
            Alternatives to consider
          </h3>
          <HorizontalPeekRail className="mt-4 gap-3 sm:grid sm:grid-cols-3 sm:snap-none sm:overflow-visible">
            {data.alternatives.map((alt) => (
              <li
                key={alt.productId}
                className="w-[220px] shrink-0 snap-start rounded-xl border border-border bg-white p-4 sm:w-auto"
              >
                <Link href={`/products/${alt.slug}`} className="block">
                  <span className="relative mx-auto block h-24 w-full">
                    {alt.imageSrc ? (
                      <Image
                        src={alt.imageSrc}
                        alt={alt.imageAlt ?? alt.fullName}
                        fill
                        sizes={IMAGE_SIZES.brandCard}
                        quality={IMAGE_QUALITY.card}
                        loading="lazy"
                        className="object-contain"
                      />
                    ) : null}
                  </span>
                  <span className="mt-2 block text-[11px] font-medium tracking-wide text-muted uppercase">
                    {alt.brandName}
                  </span>
                  <span className="block text-[14px] font-semibold text-foreground">
                    {alt.name}
                  </span>
                </Link>
                <p className="mt-2 text-[12px] leading-snug text-muted">
                  <span className="font-semibold text-foreground">
                    Why choose this instead:{" "}
                  </span>
                  {alt.why}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {alt.score !== undefined && (
                    <span className="rounded-[3px] bg-score px-1.5 py-0.5 text-[11px] font-bold text-score-foreground">
                      {(alt.score / 10).toFixed(1)}
                      {alt.scoreLabel ? ` · ${alt.scoreLabel}` : ""}
                    </span>
                  )}
                  <span className="text-[12px] text-muted">
                    <CommercePeerPrice
                      productId={alt.productId}
                      fallback={alt.price ?? null}
                    />
                  </span>
                </div>
                <Link
                  href={alt.compareHref}
                  className="mt-3 inline-flex text-[12px] font-semibold text-link hover:underline"
                >
                  Compare →
                </Link>
              </li>
            ))}
          </HorizontalPeekRail>
        </div>
      )}

      {data.comparisons.length > 0 && (
        <div>
          <h3 className="font-display text-xl font-semibold">Compare with</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {data.comparisons.map((cmp) => (
              <li key={cmp.id}>
                <Link
                  href={cmp.href}
                  className="flex h-full flex-col rounded-xl border border-border bg-white p-4 transition-colors hover:border-accent"
                >
                  <span className="text-[14px] font-semibold text-foreground">
                    {cmp.title}
                  </span>
                  <span className="mt-auto pt-3 text-[12px] font-semibold text-link">
                    {cmp.isPublished
                      ? "Read comparison →"
                      : "Compare side by side →"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(data.relatedGuides.length > 0 || data.featuredIn.length > 0) && (
        <div className="grid gap-8 sm:grid-cols-2">
          {data.relatedGuides.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold">
                Related guides
              </h3>
              <ul className="mt-3 space-y-2">
                {data.relatedGuides.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className="text-[13px] font-medium text-link hover:underline"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.featuredIn.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold">Featured in</h3>
              <ul className="mt-3 space-y-2">
                {data.featuredIn.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className="text-[13px] font-medium text-link hover:underline"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
          How we assessed it
        </h3>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted">
          {data.methodology}
        </p>
        {!data.hasPersonalTest && (
          <p className="mt-2 text-[12px] text-subtle">
            Review type: {REVIEW_TYPE_META[data.reviewType].label}.
          </p>
        )}
        <Link
          href="/how-we-review"
          className="mt-3 inline-block text-[12px] font-semibold text-link hover:underline"
        >
          Read how we review products →
        </Link>
      </div>
    </section>
  );
}

/** Sources & Evidence — supporting transparency, not the review itself. */
export function ProductSourcesEvidence({
  data,
}: {
  data: ProductReviewSummaryData;
}) {
  if (data.evidenceCards.length === 0) return null;
  return (
    <section
      id="evidence"
      className="scroll-mt-[calc(var(--site-chrome-height)+3.25rem)] space-y-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading-section">Sources & evidence</h2>
          <p className="mt-2 max-w-2xl text-[13px] text-muted">
            Transparency behind this{" "}
            {data.presentation === "full-review"
              ? "Kitletics Review"
              : "product analysis"}{" "}
            — not a substitute for the buying decision above.
          </p>
        </div>
        <Link
          href="/how-we-review"
          className="text-[12px] font-semibold text-link hover:underline"
        >
          Read how we review products →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {data.evidenceCards.map((card, i) => (
          <li
            key={`${card.title}-${i}`}
            className="rounded-xl border border-border bg-white p-4"
          >
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
              {card.typeLabel}
            </p>
            <p className="mt-1.5 text-[14px] font-semibold text-foreground">
              {card.sourceUrl ? (
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent hover:underline"
                >
                  {card.title}
                </a>
              ) : (
                card.title
              )}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {card.body}
            </p>
            {card.verifiedAt && (
              <p className="mt-2 text-[11px] text-subtle">
                Verified {formatVerifiedDate(card.verifiedAt)}
              </p>
            )}
          </li>
        ))}
      </ul>
      {data.fullReviewHref ? (
        <Link
          href={data.fullReviewHref}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-link hover:underline"
        >
          View full review evidence
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      ) : null}
    </section>
  );
}
