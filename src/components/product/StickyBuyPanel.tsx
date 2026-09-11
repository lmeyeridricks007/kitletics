"use client";

import Link from "next/link";
import { KitleticsScore } from "@/components/product/KitleticsScore";
import { PriceBadge } from "@/components/content/PriceBadge";
import { ButtonLink } from "@/components/ui/Button";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";

interface StickyBuyPanelProps {
  productName: string;
  brandName?: string;
  score?: number;
  lowestPrice?: { price: number; currency: string };
  hasOffers: boolean;
  compareProduct: {
    slug: string;
    name: string;
    brandName?: string;
    categoryId: string;
    categorySlug: string;
  };
  lifecycleStatus: string;
}

export function StickyBuyPanel({
  productName,
  brandName,
  score,
  lowestPrice,
  hasOffers,
  compareProduct,
  lifecycleStatus,
}: StickyBuyPanelProps) {
  if (lifecycleStatus === "upcoming") return null;

  return (
    <aside className="hidden rounded-2xl border border-border bg-surface p-5 lg:block">
      <div className="sticky top-[calc(var(--site-chrome-height)+1.5rem)] space-y-4">
        {brandName && (
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {brandName}
          </p>
        )}
        <p className="font-display text-lg font-semibold text-foreground">
          {productName}
        </p>
        {score !== undefined && (
          <KitleticsScore score={score} compact />
        )}
        {lowestPrice ? (
          <PriceBadge
            amount={lowestPrice.price}
            currency={lowestPrice.currency}
            from
          />
        ) : (
          <p className="text-sm text-muted">
            No verified retailer offers currently available in your region.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {hasOffers && (
            <ButtonLink href="#offers" className="w-full justify-center">
              View offers
            </ButtonLink>
          )}
          <AddToCompareButton
            product={compareProduct}
            source="product-sticky"
            variant="outline"
            className="w-full [&_button]:w-full"
          />
        </div>
        <Link
          href="/affiliate-disclosure"
          className="block text-[11px] text-subtle hover:underline"
        >
          Affiliate disclosure
        </Link>
      </div>
    </aside>
  );
}
