"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { buildOfferClickHref } from "@/lib/commerce/offer-click-href";
import { isAmazonCommerceOffer } from "@/lib/product/product-commerce";
import { NO_REGIONAL_OFFERS_MESSAGE } from "@/lib/region/commerce-readiness";
import type { OfferClickPlacement } from "@/domain/commerce/types";
import {
  CommerceErrorState,
  CommerceLoadingLabel,
  useCommerceView,
} from "@/components/product/ProductCommerceIsland";

type AmazonVariant = "primary" | "secondary" | "inline" | "banner";

const AMAZON_VARIANT_CLASS: Record<AmazonVariant, string> = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 bg-[#ff9900] px-5 text-[12px] font-bold tracking-[0.06em] text-[#111] uppercase transition-opacity hover:opacity-90",
  secondary:
    "inline-flex h-11 items-center justify-center gap-2 border border-border bg-white px-5 text-[12px] font-bold tracking-[0.06em] text-foreground uppercase transition-colors hover:border-foreground/40",
  inline:
    "inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-ink hover:underline",
  banner:
    "inline-flex h-11 w-full items-center justify-center gap-2 bg-[#ff9900] px-5 text-[13px] font-bold tracking-[0.04em] text-[#111] transition-opacity hover:opacity-90 sm:w-auto",
};

export function ReviewCommerceAmazonCta({
  productName,
  placement = "review",
  variant = "primary",
  label,
}: {
  productName: string;
  placement?: OfferClickPlacement;
  variant?: AmazonVariant;
  label?: string;
}) {
  const { status, commerce } = useCommerceView();
  if (status === "loading") {
    return (
      <div className="h-11 w-full max-w-xs animate-pulse rounded bg-black/20" />
    );
  }
  if (status === "error") return <CommerceErrorState />;
  const amazon = commerce?.offers.find(isAmazonCommerceOffer);
  if (!amazon) return null;
  const text = label ?? "Check price on Amazon";
  return (
    <a
      href={buildOfferClickHref(amazon.id, placement)}
      rel="noopener noreferrer sponsored nofollow"
      className={AMAZON_VARIANT_CLASS[variant]}
      aria-label={`${text} for ${productName}`}
    >
      {text}
      {variant !== "inline" ? (
        <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
      ) : null}
    </a>
  );
}

export function ReviewScoreFromPrice() {
  const { status, commerce } = useCommerceView();
  if (status === "loading") {
    return (
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="h-8 w-28 animate-pulse rounded bg-white/15" />
        <CommerceLoadingLabel />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mt-5 border-t border-white/10 pt-4">
        <CommerceErrorState />
      </div>
    );
  }
  const lowestPrice = commerce?.lowestPrice;
  if (!lowestPrice) return null;
  return (
    <p className="mt-5 border-t border-white/10 pt-4">
      <span className="block text-[11px] font-medium tracking-[0.08em] text-white/55 uppercase">
        From
      </span>
      <span className="mt-0.5 block font-display text-[1.35rem] font-bold tabular-nums tracking-tight text-white">
        {formatPrice(lowestPrice.amount, lowestPrice.currency)}
      </span>
    </p>
  );
}

export function ReviewScoreCommerce({
  productName,
}: {
  productName?: string;
}) {
  const { status, commerce } = useCommerceView();
  const offerCount = commerce?.offers.length ?? 0;
  const amazon = commerce?.offers.find(isAmazonCommerceOffer);
  const lowestPrice = commerce?.lowestPrice;

  return (
    <div
      className={`space-y-3 border-t border-white/10 pt-5 ${
        lowestPrice || status === "loading" || status === "error"
          ? "mt-4"
          : "mt-6"
      }`}
    >
      {status === "loading" ? (
        <div className="h-11 w-full animate-pulse rounded bg-white/15" />
      ) : status === "error" ? null : amazon && productName ? (
        <ReviewCommerceAmazonCta
          productName={productName}
          placement="product-hero"
          variant="banner"
        />
      ) : offerCount > 0 ? (
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
    </div>
  );
}

export function ReviewHeroPriceLink() {
  const { status, commerce } = useCommerceView();
  if (status !== "ready") return null;
  const amazon = commerce?.offers.find(isAmazonCommerceOffer);
  if (amazon || !commerce?.offers.length) return null;
  return (
    <Link
      href="#offers"
      className="text-[13px] font-semibold text-accent-ink hover:underline"
    >
      View prices →
    </Link>
  );
}

export function ReviewMidArticleCommerce({
  productName,
}: {
  productName: string;
}) {
  const { status, commerce } = useCommerceView();
  if (status === "loading") {
    return (
      <aside className="h-20 animate-pulse border border-border bg-[#fff8f0]" />
    );
  }
  if (status === "error" || !commerce?.offers.find(isAmazonCommerceOffer)) {
    return null;
  }
  return (
    <aside className="flex flex-col gap-3 border border-border bg-[#fff8f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.12em] text-foreground uppercase">
          Ready to buy?
        </p>
        <p className="mt-1 text-[14px] text-muted">
          Check current {productName} pricing on Amazon.
        </p>
      </div>
      <ReviewCommerceAmazonCta
        productName={productName}
        placement="review"
        variant="banner"
      />
    </aside>
  );
}

export function ReviewVerdictCommerce({
  productName,
  productHref,
}: {
  productName: string;
  productHref: string;
}) {
  const { status, commerce } = useCommerceView();
  const offerCount = commerce?.offers.length ?? 0;
  const amazon = commerce?.offers.find(isAmazonCommerceOffer);

  if (status === "loading") {
    return <CommerceLoadingLabel />;
  }
  if (status === "error") {
    return <CommerceErrorState />;
  }

  return (
    <>
      {amazon ? (
        <ReviewCommerceAmazonCta
          productName={productName}
          placement="review"
          variant="primary"
        />
      ) : null}
      {offerCount > 0 ? (
        <Link
          href="#offers"
          className="inline-flex h-11 items-center justify-center border border-border bg-white px-5 text-[12px] font-bold tracking-[0.08em] text-foreground uppercase transition-colors hover:border-foreground/40 sm:min-w-[11rem]"
        >
          All prices ({offerCount}) →
        </Link>
      ) : (
        <Link
          href={productHref}
          className="inline-flex h-11 items-center justify-center bg-accent px-5 text-[12px] font-bold tracking-[0.08em] text-accent-foreground uppercase transition-opacity hover:opacity-90 sm:min-w-[11rem]"
        >
          View product →
        </Link>
      )}
    </>
  );
}
