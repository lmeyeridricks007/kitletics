import { PriceBadge } from "@/components/content/PriceBadge";
import { Badge } from "@/components/ui/Badge";
import { AffiliateDisclosure } from "@/components/commerce/AffiliateDisclosure";
import type { OfferRow } from "@/lib/product/get-product-page-data";
import { formatVerifiedDate } from "@/lib/product/score";
import { buildOfferClickHref } from "@/repositories/commerce";
import { shouldDisplayNumericPrice } from "@/domain/commerce/ranking";
import { isAmazonOfferRow } from "@/lib/review/amazon-offer";
import { NO_REGIONAL_OFFERS_MESSAGE } from "@/lib/region/commerce-readiness";
import { REGION_META } from "@/domain/shared/types";
import type { RegionCode } from "@/domain/shared/types";

interface OfferPanelProps {
  offers: OfferRow[];
  otherRegionOffers?: OfferRow[];
  regionLabel: string;
  productName: string;
  placement?: "product-offers" | "review";
}

export function OfferPanel({
  offers,
  otherRegionOffers = [],
  regionLabel,
  productName,
  placement = "product-offers",
}: OfferPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Where to buy
          </h2>
          <p className="mt-1 text-sm text-muted">
            Showing offers for {regionLabel}. Prices may change at the retailer.
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center">
          <p className="text-sm text-muted">{NO_REGIONAL_OFFERS_MESSAGE}</p>
          <p className="mt-2 text-xs text-subtle">
            Product specs and editorial guidance still apply. Shopping region
            can be changed in the site header — coverage is not equal in every
            market.
          </p>
          {otherRegionOffers.length > 0 ? (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-accent-ink">
                Listings from other regions (not local to {regionLabel})
              </summary>
              <p className="mt-2 mb-3 text-xs text-subtle">
                These retailer links are for other shopping regions. They are
                not verified offers for {regionLabel}.
              </p>
              <OfferList
                offers={otherRegionOffers}
                productName={productName}
                placement={placement}
                emphasizeRegion
              />
            </details>
          ) : null}
        </div>
      ) : (
        <OfferList
          offers={offers}
          productName={productName}
          placement={placement}
        />
      )}

      <AffiliateDisclosure />
    </div>
  );
}

function OfferList({
  offers,
  productName,
  placement,
  emphasizeRegion = false,
}: {
  offers: OfferRow[];
  productName: string;
  placement: "product-offers" | "review";
  emphasizeRegion?: boolean;
}) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {offers.map(({ offer, retailer, stale }) => {
        const row = { offer, retailer, stale };
        const href = buildOfferClickHref(offer.id, placement);
        const showPrice = shouldDisplayNumericPrice(offer) && !stale;
        const retailerName = retailer?.name ?? "Retailer";
        const amazon = isAmazonOfferRow(row);
        const regionLabel =
          offer.region in REGION_META
            ? REGION_META[offer.region as RegionCode].label
            : offer.region;
        let typeLabel: string | null = null;
        if (retailer?.retailerType === "brand-direct") typeLabel = "Brand Direct";
        else if (retailer?.retailerType === "marketplace") typeLabel = "Marketplace";
        else if (retailer?.retailerType === "specialist-retailer") {
          typeLabel = "Specialist";
        }

        return (
          <li
            key={offer.id}
            className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">{retailerName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <Badge variant="muted">
                  {offer.availability.replace("-", " ")}
                </Badge>
                {typeLabel ? (
                  <Badge variant="muted">{typeLabel}</Badge>
                ) : null}
                {offer.sellerName ? (
                  <span>Sold by {offer.sellerName}</span>
                ) : null}
                <Badge variant={emphasizeRegion ? "default" : "muted"}>
                  {emphasizeRegion ? regionLabel : offer.region}
                </Badge>
                {offer.shipping ? <span>{offer.shipping}</span> : null}
                {offer.lastChecked ? (
                  <span>
                    Last checked {formatVerifiedDate(offer.lastChecked)}
                    {stale ? " · may be outdated" : ""}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showPrice ? (
                <PriceBadge amount={offer.price} currency={offer.currency} />
              ) : (
                <span className="text-sm text-muted">Check latest price</span>
              )}
              <a
                href={href}
                rel="noopener noreferrer sponsored nofollow"
                className={
                  amazon
                    ? "inline-flex h-10 items-center rounded-xl bg-[#ff9900] px-4 text-sm font-semibold text-[#111] hover:opacity-90"
                    : "inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                }
                aria-label={
                  amazon
                    ? `View on Amazon for ${productName}`
                    : `Check price at ${retailerName} for ${productName}`
                }
              >
                {amazon ? "View on Amazon" : "Check price"}
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
