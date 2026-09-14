import fs from "node:fs";
import path from "node:path";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { evidence } from "@/content/evidence";
import { recommendations } from "@/content/recommendations";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { PADEL_RACKET_PRODUCT_MEDIA } from "@/content/padel/rackets/product-media";
import {
  padelRacketDrafts,
  padelRacketPdpCopyById,
  padelRacketCatalogFamilies,
  padelRacketVariants,
} from "@/content/padel/rackets";
import { getPrimaryProductMedia } from "@/lib/product/media";

const SPEC_KEYS = [
  "shape",
  "balance",
  "weightMin",
  "weightMax",
  "thicknessMm",
  "frameMaterial",
  "face",
  "faceMaterial",
  "faceCarbonWeave",
  "core",
  "manufacturerCoreName",
  "surfaceTexture",
  "feel",
  "playerLevel",
  "manufacturerPositioning",
  "technologies",
] as const;

const ROOT = process.cwd();

function fileExists(src: string | undefined): boolean {
  if (!src) return false;
  return fs.existsSync(path.join(ROOT, "public", src.replace(/^\//, "")));
}

function brandName(id: string) {
  return brands.find((b) => b.id === id)?.name ?? id;
}

const rackets = products.filter((p) => p.categoryId === "cat-padel-rackets");
const draftIds = new Set(padelRacketDrafts.map((d) => d.id));
const racketFamilies = padelRacketCatalogFamilies;

const rows = padelRacketDrafts.map((d) => {
  const product = products.find((p) => p.id === d.id);
  const catalog = CATALOG_PRODUCT_MEDIA[d.id];
  const padel = PADEL_RACKET_PRODUCT_MEDIA[d.id];
  const media = catalog ?? padel;
  const primary = product ? getPrimaryProductMedia(product) : undefined;
  const specs = product?.specifications ?? d.specifications;
  const present = SPEC_KEYS.filter((k) => {
    const v = specs[k];
    return v != null && v !== "" && !(Array.isArray(v) && v.length === 0);
  });
  const ev = evidence.filter((e) => e.id.startsWith(`ev-${d.id}-`) || product?.evidenceIds.includes(e.id));
  const recs = recommendations.filter((r) => r.productId === d.id);
  const copy = padelRacketPdpCopyById[d.id];
  const authenticFile = Boolean(primary && fileExists(primary.src) && !primary.src.endsWith(".svg"));
  return {
    id: d.id,
    slug: d.slug,
    name: d.fullName,
    brand: brandName(d.brandId),
    familyId: d.familyId,
    lifecycle: product?.lifecycleStatus ?? d.lifecycle,
    status: product?.status ?? "missing",
    existing: Boolean(d.existing),
    sourceUrl: d.sourceUrl,
    sourceName: d.sourceName,
    specKeys: present,
    specCount: present.length,
    specTotal: SPEC_KEYS.length,
    hasCopy: Boolean(copy?.whatItIs && copy.whoItsFor && copy.howItPlays),
    recCount: recs.length,
    evidenceCount: ev.length,
    variantCount: padelRacketVariants.filter((v) => v.productId === d.id).length,
    mediaSrc: primary?.src ?? media?.src ?? null,
    mediaFileExists: authenticFile,
    mediaRegistry: catalog ? "catalog" : padel ? "padel" : null,
  };
});

const extraLive = rackets.filter((p) => !draftIds.has(p.id)).map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.fullName,
  brand: brandName(p.brandId),
  lifecycle: p.lifecycleStatus,
  status: p.status,
  note: "live padel racket not in 2026 catalog drafts",
}));

const payload = {
  generatedAt: new Date().toISOString(),
  drafts: padelRacketDrafts.length,
  liveRackets: rackets.length,
  published: rackets.filter((p) => p.status === "published").length,
  draftStatus: rackets.filter((p) => p.status === "draft").length,
  current: rackets.filter((p) => p.lifecycleStatus === "current").length,
  previous: rackets.filter((p) => p.lifecycleStatus === "previous-generation").length,
  families: racketFamilies.length,
  familyIds: racketFamilies.map((f) => f.id),
  variantsOnDrafts: padelRacketVariants.length,
  extraLive,
  rows,
};

const out = path.join(ROOT, "data/staging/padel-racket-catalog-audit.json");
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(JSON.stringify({
  drafts: payload.drafts,
  liveRackets: payload.liveRackets,
  published: payload.published,
  draftStatus: payload.draftStatus,
  current: payload.current,
  previous: payload.previous,
  families: payload.families,
  variantsOnDrafts: payload.variantsOnDrafts,
  extraLive: extraLive.length,
  withMediaFile: rows.filter((r) => r.mediaFileExists).length,
  publishedWithMedia: rows.filter((r) => r.status === "published" && r.mediaFileExists).length,
}, null, 2));
