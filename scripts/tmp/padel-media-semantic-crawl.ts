/**
 * Catalog-level media semantics crawl (no Next server).
 * Walks every public/indexable padel Product via getProductPageData +
 * alternatives hero config. Writes docs/padel/data/PADEL-MEDIA-SEMANTIC-CRAWL.csv
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBrands, getProducts } from "@/repositories";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  evaluatePadelHeroIdentity,
  isPadelCatalogProduct,
} from "@/lib/product/media-identity";
import { getAlternativesPageConfig } from "@/lib/product/alternatives-config";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";

const PROD = { isDev: false as const };
const brands = Object.fromEntries(getBrands(PROD).map((b) => [b.id, b]));
const products = getProducts(PROD).filter((p) => isPadelCatalogProduct(p));

type Row = Record<string, string>;
const rows: Row[] = [];
let wrongProduct = 0;
let wrongBrand = 0;
let wrongSport = 0;
let missingPrimary = 0;
let ok = 0;

for (const p of products) {
  const brand = brands[p.brandId];
  const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  const indexable = isIndexableEligibility(elig);
  const primary = getPrimaryProductMedia(p);
  const page = getProductPageData(p.slug, PROD);
  const heroSrc = primary?.src || page?.heroImage?.src || "";
  const identity = evaluatePadelHeroIdentity(p, primary, {
    brandSlug: brand?.slug,
  });

  let semantic = "OK";
  if (p.status === "published" && indexable) {
    if (!primary) {
      semantic = "MISSING_VERIFIED_PRIMARY";
      missingPrimary++;
    } else if (!identity.verified) {
      if (identity.reasons.some((r) => r.startsWith("filename_brand_mismatch") || r.startsWith("source_other_brand"))) {
        semantic = "WRONG_BRAND";
        wrongBrand++;
      } else if (identity.reasons.includes("wrong_sport_namespace")) {
        semantic = "WRONG_SPORT";
        wrongSport++;
      } else {
        semantic = "WRONG_PRODUCT";
        wrongProduct++;
      }
    } else {
      ok++;
    }
  } else if (p.status === "published" && !primary) {
    semantic = "PUBLISHED_WITHOUT_PRIMARY";
    missingPrimary++;
  }

  // Alternatives cross-sport probe (config-level; mirrors rendered hero when used).
  const altCfg = getAlternativesPageConfig(p.categoryId);
  const altHero = altCfg?.heroImageSrc || "";
  if (altHero.includes("guide-running-shoes") || altHero.includes("/images/running/") || altHero.includes("/images/home/guide-")) {
    if (!altHero.includes("/images/padel/")) {
      wrongSport++;
      semantic = semantic === "OK" ? "WRONG_SPORT_ALTERNATIVES" : `${semantic}|WRONG_SPORT_ALTERNATIVES`;
    }
  }

  rows.push({
    productId: p.id,
    url: `/products/${p.slug}`,
    status: p.status,
    indexable: indexable ? "yes" : "no",
    expectedBrand: brand?.slug || "",
    expectedCategory: p.categoryId.replace("cat-padel-", ""),
    heroSrc,
    mediaIdentity: identity.verified ? "MEDIA_VERIFIED" : identity.reasons.join("|") || "none",
    semanticResult: semantic,
    alternativesHero: altHero,
  });
}

function csv(data: Row[]): string {
  if (!data.length) return "";
  const keys = Object.keys(data[0]!);
  return [keys.join(","), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))].join("\n");
}

const out = join(process.cwd(), "docs/padel/data/PADEL-MEDIA-SEMANTIC-CRAWL.csv");
writeFileSync(out, csv(rows) + "\n");
const summary = {
  asOf: new Date().toISOString().slice(0, 10),
  publicProducts: products.filter((p) => p.status === "published").length,
  indexable: rows.filter((r) => r.indexable === "yes").length,
  ok,
  WRONG_PRODUCT: wrongProduct,
  WRONG_BRAND: wrongBrand,
  WRONG_SPORT: wrongSport,
  MISSING_VERIFIED_PRIMARY: missingPrimary,
};
writeFileSync(
  join(process.cwd(), "docs/padel/data/PADEL-MEDIA-SEMANTIC-CRAWL-SUMMARY.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
process.stdout.write(`wrote ${out} (${rows.length} rows)\n`);
