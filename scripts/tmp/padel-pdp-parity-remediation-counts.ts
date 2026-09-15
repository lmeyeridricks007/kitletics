#!/usr/bin/env npx tsx
/**
 * Snapshot counts for PADEL-PDP-PARITY-REMEDIATION.md
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts } from "@/content/padel";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import { hasVerifiedProductHero } from "@/content/running/products/media-publish-gate";
import { canFeatureProduct } from "@/lib/product/media";
import { evaluatePadelHeroIdentity } from "@/lib/product/media-identity";
import { getPadelSoftPdpCopy } from "@/content/padel/pdp-editorial";
import { getProductPageCategoryConfig } from "@/lib/product/category-config";

const CATS = [
  ["cat-padel-rackets", "RACKETS"],
  ["cat-padel-shoes", "SHOES"],
  ["cat-padel-balls", "BALLS"],
  ["cat-padel-bags", "BAGS"],
  ["cat-padel-grips", "GRIPS"],
  ["cat-padel-accessories", "ACCESSORIES"],
] as const;

const all = padelAllProducts.filter((p) =>
  CATS.some(([id]) => id === p.categoryId),
);

type Row = {
  family: string;
  total: number;
  published: number;
  verifiedHero: number;
  featureable: number;
  mediaBlocked: number;
  draft: number;
  featuredSpecKeys: number;
  softEditorialReady: number;
};

const rows: Row[] = [];
for (const [id, family] of CATS) {
  const ps = all.filter((p) => p.categoryId === id);
  const cfg = getProductPageCategoryConfig(id);
  rows.push({
    family,
    total: ps.length,
    published: ps.filter((p) => p.status === "published").length,
    verifiedHero: ps.filter(hasVerifiedProductHero).length,
    featureable: ps.filter(canFeatureProduct).length,
    mediaBlocked: ps.filter((p) => !hasVerifiedProductHero(p)).length,
    draft: ps.filter((p) => p.status === "draft").length,
    featuredSpecKeys: cfg.featuredSpecificationKeys.length,
    softEditorialReady: ps.filter((p) => {
      const e = getPadelSoftPdpCopy(p.id);
      return (
        e &&
        (e.editorialState === "EDITORIAL_READY" ||
          e.editorialState === "EDITORIAL_LIGHT")
      );
    }).length,
  });
}

const heroesAdded = [
  "prod-adidas-crazyquick-boost-m",
  "prod-adidas-courtquick-w",
  "prod-adidas-crazyquick-boost-w",
  "prod-asics-gel-dedicate-8-padel",
  "prod-asics-game-ff-padel",
  "prod-asics-solution-swift-ff2-padel",
  "prod-bullpadel-hybrid-fly",
  "prod-bullpadel-ionic-woman",
  "prod-nox-at10-lux",
  "prod-nox-ml10-hexa",
  "prod-babolat-movea-2",
  "prod-babolat-sensa-women",
  "prod-joma-slam-lady",
  "prod-joma-spin-men",
  "prod-head-sprint-pro-4-padel",
  "prod-wilson-rush-pro-5-padel",
  "prod-joma-t-slam",
  "prod-asics-gel-resolution-padel-w",
  "prod-joma-spin-lady",
  "prod-babolat-jet-premura-2-men",
].filter((id) => {
  const p = all.find((x) => x.id === id);
  return p && hasVerifiedProductHero(p);
});

const revokedWrongIdentity = [
  "prod-siux-diablo-pro",
  "prod-siux-comodo-woman",
  "prod-oxdog-hyper-court",
  "prod-wilson-bela-pro-padel",
  "prod-bullpadel-hack-hybrid",
  "prod-nox-at10-pro-shoe",
  "prod-tecnifibre-t-fight-padel",
  "prod-varlion-bourne-padel-shoe",
  "prod-lok-padel-one",
  "prod-asics-solution-swift-padel-w",
];

const out = {
  asOf: "2026-09-14",
  productsProcessed: all.length,
  totals: {
    published: all.filter((p) => p.status === "published").length,
    verifiedHero: all.filter(hasVerifiedProductHero).length,
    featureable: all.filter(canFeatureProduct).length,
    mediaBlocked: all.filter((p) => !hasVerifiedProductHero(p)).length,
    draftHidden: all.filter((p) => p.status === "draft").length,
  },
  byFamily: rows,
  exactHeroesUnlockedThisPass: heroesAdded.length,
  exactHeroProductIds: heroesAdded,
  revokedWrongCategoryOrIdentity: revokedWrongIdentity,
  galleriesAdded: 0,
  noteGalleries:
    "Running shoe PDP median gallery=1; no synthetic multi-angle galleries manufactured from single crops.",
};

writeFileSync(
  join(process.cwd(), "docs/padel/data/PADEL-PDP-PARITY-REMEDIATION-COUNTS.json"),
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
