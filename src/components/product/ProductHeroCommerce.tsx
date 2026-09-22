"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCommerceView, CommerceErrorState, CommerceLoadingLabel } from "@/components/product/ProductCommerceIsland";

export function ProductHeroCommerce({
  lifecycleStatus,
  newerGeneration,
}: {
  lifecycleStatus: string;
  newerGeneration?: { slug: string; name: string };
}) {
  const { status, commerce } = useCommerceView();
  const canBuy =
    lifecycleStatus !== "upcoming" &&
    lifecycleStatus !== "discontinued" &&
    (commerce?.offers.length ?? 0) > 0;
  const lowestPrice = commerce?.lowestPrice;

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      {status === "loading" ? (
        <div className="space-y-3">
          <div className="h-7 w-28 animate-pulse rounded bg-surface-muted" />
          <CommerceLoadingLabel />
          <div className="h-11 w-full animate-pulse rounded-md bg-surface-muted" />
        </div>
      ) : status === "error" ? (
        <CommerceErrorState />
      ) : lowestPrice && canBuy ? (
        <>
          <p className="font-display text-xl font-bold tracking-tight text-foreground uppercase">
            From {formatPrice(lowestPrice.amount, lowestPrice.currency)}
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Price may vary by size and colour.
          </p>
          <Link
            href="#offers"
            className="mt-3 flex h-11 w-full items-center justify-center rounded-md bg-accent text-[13px] font-bold tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90"
          >
            View prices ({commerce?.offers.length ?? 0}) →
          </Link>
        </>
      ) : lifecycleStatus === "discontinued" ? (
        <p className="text-sm font-semibold text-foreground">
          No longer widely available
          {newerGeneration && (
            <>
              {" "}
              — see{" "}
              <Link
                href={`/products/${newerGeneration.slug}`}
                className="text-link hover:underline"
              >
                {newerGeneration.name}
              </Link>
            </>
          )}
        </p>
      ) : (
        <>
          <p className="text-[15px] font-bold text-foreground">
            Regional pricing
          </p>
          <p className="mt-1 text-[12px] text-muted">
            No verified retailer offers currently available in your region.
          </p>
          <Link
            href="#offers"
            className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-border text-[13px] font-medium tracking-wide text-muted"
          >
            Pricing details →
          </Link>
        </>
      )}
    </div>
  );
}
