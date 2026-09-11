"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductVariant } from "@/domain/products/types";
import {
  AUDIENCE_LABELS,
  getProductAudiences,
  pickVariant,
  parseAudienceParam,
  readPreferredSizing,
  type AudienceFit,
  writePreferredSizing,
} from "@/lib/product/audience";
import { AudienceVariantSelector } from "@/components/catalog/ShopByFitChips";

export function ProductFitSizingPanel({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariant[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const audiences = useMemo(
    () => getProductAudiences(product, variants),
    [product, variants],
  );

  const urlFit = parseAudienceParam(searchParams.get("fit"));
  const initial =
    (urlFit && audiences.includes(urlFit) ? urlFit : undefined) ??
    (readPreferredSizing() && audiences.includes(readPreferredSizing()!)
      ? readPreferredSizing()!
      : undefined) ??
    audiences[0] ??
    "men";

  const [selected, setSelected] = useState<AudienceFit>(initial);

  useEffect(() => {
    if (urlFit && audiences.includes(urlFit) && urlFit !== selected) {
      setSelected(urlFit);
    }
    // Sync from URL only — including `selected` would fight user clicks mid-update
    // eslint-disable-next-line react-hooks/exhaustive-deps -- urlFit is the sole external driver
  }, [urlFit]);

  if (audiences.length === 0) return null;

  const variant = pickVariant(variants, selected);

  function select(next: AudienceFit) {
    setSelected(next);
    writePreferredSizing(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("fit", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-4">
      {audiences.length > 1 ? (
        <AudienceVariantSelector
          options={audiences}
          value={selected}
          onChange={select}
        />
      ) : (
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
            Fit / sizing
          </p>
          <p className="mt-1 text-[14px] font-semibold text-foreground">
            {AUDIENCE_LABELS[audiences[0]!]}
          </p>
        </div>
      )}

      <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">
            Selected
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {AUDIENCE_LABELS[selected]}
          </dd>
        </div>
        {variant?.sizeRangeLabel && (
          <div>
            <dt className="text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">
              Size range
            </dt>
            <dd className="mt-0.5 text-muted">{variant.sizeRangeLabel}</dd>
          </div>
        )}
        {variant?.widthOptions && variant.widthOptions.length > 0 && (
          <div>
            <dt className="text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">
              Widths
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {variant.widthOptions
                .map((w) => w.replace(/-/g, " "))
                .join(" · ")}
            </dd>
          </div>
        )}
        {variant?.weightVerified && variant.referenceWeightG != null ? (
          <div>
            <dt className="text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">
              Reference weight
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {variant.referenceWeightG} g
              {variant.referenceSizeLabel
                ? ` · ${AUDIENCE_LABELS[selected]} ${variant.referenceSizeLabel}`
                : ""}
            </dd>
          </div>
        ) : selected === "women" ? (
          <div>
            <dt className="text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">
              Reference weight
            </dt>
            <dd className="mt-0.5 text-muted">
              Women&apos;s weight pending verification — do not use men&apos;s
              figure
            </dd>
          </div>
        ) : null}
      </dl>

      {audiences.length > 1 && (
        <p className="text-[12px] leading-snug text-muted">
          Available in{" "}
          {audiences.map((a) => AUDIENCE_LABELS[a]).join(" and ")} sizing.
        </p>
      )}
    </div>
  );
}

/** Compact hero line under product title */
export function ProductAudienceSummary({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariant[];
}) {
  const audiences = getProductAudiences(product, variants);
  if (audiences.length === 0) return null;
  if (audiences.length === 1 && audiences[0] === "unisex") {
    return (
      <p className="mt-2 text-[13px] font-medium text-muted">Unisex sizing.</p>
    );
  }
  return (
    <p className="mt-2 text-[13px] font-medium text-muted">
      Available in {audiences.map((a) => AUDIENCE_LABELS[a]).join(" and ")}{" "}
      sizing.
    </p>
  );
}
