/**
 * Pricing audit — which published products can show a From-price in-region.
 */
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { categories } from "@/content/taxonomy/categories";
import { offers as rawOffers } from "@/content/offers";
import type { Offer } from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";
import { REGION_META } from "@/domain/shared/types";
import {
  getOfferFreshness,
  isOfferActive,
  shouldDisplayNumericPrice,
} from "@/domain/commerce/ranking";

export type PricingGapReason =
  | "no-offer"
  | "no-region-offer"
  | "not-displayable"
  | "stale-or-aging";

export interface PricingGapRow {
  productId: string;
  slug: string;
  fullName: string;
  brandName: string;
  categorySlug: string;
  lifecycleStatus: string;
  reason: PricingGapReason;
  region: RegionCode;
  offerCount: number;
  freshness?: string;
  detail?: string;
}

export interface PricingAuditReport {
  generatedAt: string;
  region: RegionCode;
  totals: {
    published: number;
    withOffers: number;
    displayable: number;
    missingOffers: number;
    notDisplayable: number;
    coveragePct: number;
    displayablePct: number;
    offerRows: number;
    freshness: Record<string, number>;
  };
  gaps: PricingGapRow[];
}

const brandName = new Map(brands.map((b) => [b.id, b.name]));
const categoryById = new Map(categories.map((c) => [c.id, c]));

export function runPricingAudit(
  offers: Offer[] = rawOffers,
  region: RegionCode = "NL",
): PricingAuditReport {
  const published = products.filter((p) => p.status === "published");
  const active = offers.filter(isOfferActive);
  const freshness: Record<string, number> = {
    fresh: 0,
    recent: 0,
    aging: 0,
    stale: 0,
  };
  for (const o of active) {
    const band = getOfferFreshness(o.lastChecked);
    freshness[band] = (freshness[band] ?? 0) + 1;
  }

  const gaps: PricingGapRow[] = [];
  let withOffers = 0;
  let displayable = 0;

  for (const product of published) {
    const allForProduct = active.filter((o) => o.productId === product.id);
    const regional = allForProduct.filter((o) => o.region === region);
    const cat = categoryById.get(product.categoryId);

    if (allForProduct.length === 0) {
      gaps.push({
        productId: product.id,
        slug: product.slug,
        fullName: product.fullName,
        brandName: brandName.get(product.brandId) ?? product.brandId,
        categorySlug: cat?.slug ?? product.categoryId,
        lifecycleStatus: product.lifecycleStatus ?? "unknown",
        reason: "no-offer",
        region,
        offerCount: 0,
        detail: "No active offers in any region",
      });
      continue;
    }

    withOffers += 1;

    if (regional.length === 0) {
      gaps.push({
        productId: product.id,
        slug: product.slug,
        fullName: product.fullName,
        brandName: brandName.get(product.brandId) ?? product.brandId,
        categorySlug: cat?.slug ?? product.categoryId,
        lifecycleStatus: product.lifecycleStatus ?? "unknown",
        reason: "no-region-offer",
        region,
        offerCount: allForProduct.length,
        detail: `Has offers elsewhere but none for ${region} (${REGION_META[region].currency})`,
      });
      continue;
    }

    const showable = regional.filter((o) => shouldDisplayNumericPrice(o));
    if (showable.length > 0) {
      displayable += 1;
      continue;
    }

    const band = getOfferFreshness(regional[0]!.lastChecked);
    gaps.push({
      productId: product.id,
      slug: product.slug,
      fullName: product.fullName,
      brandName: brandName.get(product.brandId) ?? product.brandId,
      categorySlug: cat?.slug ?? product.categoryId,
      lifecycleStatus: product.lifecycleStatus ?? "unknown",
      reason: band === "aging" || band === "stale" ? "stale-or-aging" : "not-displayable",
      region,
      offerCount: regional.length,
      freshness: band,
      detail: `Offers exist but shouldDisplayNumericPrice=false (freshness=${band})`,
    });
  }

  const missingOffers = gaps.filter((g) => g.reason === "no-offer").length;
  const notDisplayable = gaps.filter(
    (g) => g.reason !== "no-offer",
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    region,
    totals: {
      published: published.length,
      withOffers,
      displayable,
      missingOffers,
      notDisplayable,
      coveragePct:
        published.length === 0
          ? 100
          : Math.round((withOffers / published.length) * 100),
      displayablePct:
        published.length === 0
          ? 100
          : Math.round((displayable / published.length) * 100),
      offerRows: active.length,
      freshness,
    },
    gaps: gaps.sort(
      (a, b) =>
        a.reason.localeCompare(b.reason) || a.fullName.localeCompare(b.fullName),
    ),
  };
}

export function renderPricingAuditMarkdown(report: PricingAuditReport): string {
  const lines: string[] = [];
  lines.push("# Catalog Pricing Audit");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Region: ${report.region} (${REGION_META[report.region].currency})`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("| --- | ---: |");
  lines.push(`| Published products | ${report.totals.published} |`);
  lines.push(`| With any offers | ${report.totals.withOffers} |`);
  lines.push(`| Displayable From-price | ${report.totals.displayable} |`);
  lines.push(`| Offer coverage | ${report.totals.coveragePct}% |`);
  lines.push(`| Displayable coverage | ${report.totals.displayablePct}% |`);
  lines.push(`| Missing offers | ${report.totals.missingOffers} |`);
  lines.push(`| Not displayable (stale/other) | ${report.totals.notDisplayable} |`);
  lines.push(`| Active offer rows | ${report.totals.offerRows} |`);
  lines.push("");
  lines.push("### Offer freshness");
  lines.push("");
  for (const [band, n] of Object.entries(report.totals.freshness)) {
    lines.push(`- ${band}: ${n}`);
  }
  lines.push("");
  lines.push("## Gaps");
  lines.push("");
  for (const g of report.gaps.slice(0, 120)) {
    lines.push(
      `- \`${g.slug}\` — **${g.reason}**${g.freshness ? ` (${g.freshness})` : ""} · ${g.detail ?? ""}`,
    );
  }
  if (report.gaps.length > 120) {
    lines.push(`- … and ${report.gaps.length - 120} more (see JSON)`);
  }
  return lines.join("\n");
}
