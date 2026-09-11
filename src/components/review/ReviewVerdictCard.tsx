import Image from "next/image";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { LinkifiedText } from "@/components/editorial/LinkifiedText";
import { ReviewAmazonCta } from "@/components/review/ReviewAmazonCta";
import type { CatalogMentionOptions } from "@/lib/editorial/catalog-mentions";
import { pickAmazonOffer } from "@/lib/review/amazon-offer";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

function formatScore(score: number): string {
  return (score / 10).toFixed(1);
}

export function ReviewVerdictCard({
  data,
  mentionOptions,
}: {
  data: ReviewPageData;
  mentionOptions?: CatalogMentionOptions;
}) {
  const {
    review,
    product,
    brand,
    category,
    displayScore,
    scoreBandLabel,
    offers,
    heroImage,
    heroCriteria,
    bottomLine,
  } = data;

  const buySignals = review.whoShouldBuy.slice(0, 3);
  const skipSignals = review.whoShouldAvoid.slice(0, 3);
  const topCriteria = heroCriteria.slice(0, 4);
  const verdictCopy = bottomLine?.trim() || review.verdict;
  const amazon = pickAmazonOffer(offers);

  return (
    <section id="verdict" className={SCROLL}>
      <div className="overflow-hidden border border-border bg-white">
        <div className="grid lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
          {/* Score panel */}
          <div className="bg-[#14181c] px-5 py-6 text-white sm:px-6 sm:py-7">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-bold tracking-[0.16em] text-white/50 uppercase">
                Verdict
              </p>
              {heroImage ? (
                <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-white/10 lg:hidden">
                  <Image
                    src={heroImage.src}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-end gap-3">
              <span className="font-display text-[3.5rem] leading-none font-bold tabular-nums tracking-tight">
                {formatScore(displayScore)}
              </span>
              <div className="pb-1.5">
                <p className="text-[13px] font-bold tracking-[0.1em] text-accent uppercase">
                  {scoreBandLabel}
                </p>
                <p className="mt-0.5 text-[11px] font-medium tracking-wide text-white/50 uppercase">
                  Kitletics Score
                </p>
              </div>
            </div>

            {topCriteria.length > 0 ? (
              <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
                {topCriteria.map((item) => {
                  const pct = Math.max(0, Math.min(100, item.score));
                  return (
                    <li key={item.key}>
                      <div className="flex items-baseline justify-between gap-3 text-[12px]">
                        <span className="font-medium text-white/75">
                          {item.label}
                        </span>
                        <span className="tabular-nums font-semibold text-white">
                          {formatScore(item.score)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <Link
              href="/methodology"
              className="mt-5 inline-block text-[11px] font-semibold tracking-wide text-white/50 uppercase transition-colors hover:text-accent"
            >
              How we score →
            </Link>
          </div>

          {/* Decision body */}
          <div className="flex flex-col px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Should you buy the {product.name}?
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                  <LinkifiedText text={verdictCopy} options={mentionOptions} />
                </p>
              </div>
              {heroImage ? (
                <span className="relative hidden size-24 shrink-0 overflow-hidden bg-surface-muted lg:block">
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt || product.fullName}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </span>
              ) : null}
            </div>

            {(buySignals.length > 0 || skipSignals.length > 0) && (
              <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                {buySignals.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] text-accent-ink uppercase">
                      Buy if
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {buySignals.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-[13px] leading-relaxed text-foreground"
                        >
                          <Check
                            className="mt-0.5 size-3.5 shrink-0 text-accent-ink"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                          <span>
                            <LinkifiedText
                              text={item}
                              options={mentionOptions}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {skipSignals.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                      Skip if
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {skipSignals.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-[13px] leading-relaxed text-foreground"
                        >
                          <Minus
                            className="mt-0.5 size-3.5 shrink-0 text-subtle"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                          <span>
                            <LinkifiedText
                              text={item}
                              options={mentionOptions}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
              {amazon ? (
                <ReviewAmazonCta
                  offer={amazon}
                  productName={product.fullName}
                  placement="review"
                  variant="primary"
                />
              ) : null}
              {offers.length > 0 ? (
                <Link
                  href="#offers"
                  className="inline-flex h-11 items-center justify-center border border-border bg-white px-5 text-[12px] font-bold tracking-[0.08em] text-foreground uppercase transition-colors hover:border-foreground/40 sm:min-w-[11rem]"
                >
                  All prices ({offers.length}) →
                </Link>
              ) : (
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex h-11 items-center justify-center bg-accent px-5 text-[12px] font-bold tracking-[0.08em] text-accent-foreground uppercase transition-opacity hover:opacity-90 sm:min-w-[11rem]"
                >
                  View product →
                </Link>
              )}
              <AddToCompareButton
                product={{
                  slug: product.slug,
                  name: product.name,
                  brandName: brand?.name,
                  categoryId: product.categoryId,
                  categorySlug: category?.slug ?? "",
                }}
                source="review"
                variant="outline"
                className="sm:min-w-[11rem] [&_button]:h-11 [&_button]:w-full [&_button]:text-[12px] [&_button]:font-bold [&_button]:tracking-[0.06em] [&_button]:uppercase"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
