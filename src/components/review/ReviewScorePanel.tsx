import Link from "next/link";
import type { ScoreBreakdownItem } from "@/domain/editorial/types";
import { ReviewAmazonCta } from "@/components/review/ReviewAmazonCta";
import type { OfferRow } from "@/lib/product/get-product-page-data";
import { NO_REGIONAL_OFFERS_MESSAGE } from "@/lib/region/commerce-readiness";
import { formatPrice } from "@/lib/utils";

function formatScore(score: number): string {
  return (score / 10).toFixed(1);
}

export function ReviewScorePanel({
  displayScore,
  scoreBandLabel,
  heroCriteria,
  amazonOffer,
  productName,
  lowestPrice,
  hasRegionalOffers = false,
}: {
  displayScore: number;
  scoreBandLabel: string;
  heroCriteria: ScoreBreakdownItem[];
  amazonOffer?: OfferRow;
  productName?: string;
  lowestPrice?: { price: number; currency: string };
  /** True only when the active shopping region has Offer rows */
  hasRegionalOffers?: boolean;
}) {
  return (
    <aside className="rounded-lg bg-[#14181c] p-5 text-white sm:p-6">
      <div className="flex items-end gap-3">
        <span className="font-display text-[3.25rem] leading-none font-bold tabular-nums tracking-tight">
          {formatScore(displayScore)}
        </span>
        <div className="pb-1.5">
          <p className="text-[12px] font-bold tracking-[0.08em] text-accent uppercase">
            {scoreBandLabel}
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-wide text-white/55 uppercase">
            Kitletics Score
          </p>
        </div>
      </div>

      {lowestPrice ? (
        <p className="mt-5 border-t border-white/10 pt-4">
          <span className="block text-[11px] font-medium tracking-[0.08em] text-white/55 uppercase">
            From
          </span>
          <span className="mt-0.5 block font-display text-[1.35rem] font-bold tabular-nums tracking-tight text-white">
            {formatPrice(lowestPrice.price, lowestPrice.currency)}
          </span>
        </p>
      ) : null}

      {heroCriteria.length > 0 && (
        <ul
          className={`space-y-3.5 border-t border-white/10 pt-5 ${
            lowestPrice ? "mt-4" : "mt-6"
          }`}
        >
          {heroCriteria.map((item) => {
            const pct = Math.max(0, Math.min(100, item.score));
            return (
              <li key={item.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] font-medium text-white/80">
                    {item.label}
                  </span>
                  <span className="text-[12px] font-semibold tabular-nums text-white">
                    {formatScore(item.score)}
                  </span>
                </div>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
        {amazonOffer && productName ? (
          <ReviewAmazonCta
            offer={amazonOffer}
            productName={productName}
            placement="product-hero"
            variant="banner"
          />
        ) : hasRegionalOffers ? (
          <Link
            href="#offers"
            className="inline-flex h-11 w-full items-center justify-center bg-accent px-4 text-[12px] font-bold tracking-[0.08em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
          >
            View prices →
          </Link>
        ) : (
          <p className="text-[12px] leading-snug text-white/55">
            {NO_REGIONAL_OFFERS_MESSAGE}
          </p>
        )}
        <Link
          href="/methodology"
          className="inline-block text-[12px] font-semibold tracking-wide text-white/55 uppercase transition-colors hover:text-accent"
        >
          How we score →
        </Link>
      </div>
    </aside>
  );
}
