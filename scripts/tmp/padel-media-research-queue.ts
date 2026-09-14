import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBrands } from "@/repositories/products";
import { getProducts } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { evaluatePadelHeroIdentity } from "@/lib/product/media-identity";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";

const revoke = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/staging/padel-media-identity-revoke.json"),
    "utf8",
  ),
) as { ids: string[] };

const DEV = { isDev: true as const };
const brands = Object.fromEntries(getBrands(DEV).map((b) => [b.id, b]));
const softCats = new Set([
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
]);

const products = getProducts(DEV).filter((p) => softCats.has(p.categoryId));
const rows: Array<Record<string, string>> = [];

for (const p of products) {
  if (p.status === "published") continue;
  const brand = brands[p.brandId];
  const media =
    getCatalogProductHeroMedia(p.id, p.fullName)?.[0] ||
    PADEL_SECONDARY_PRODUCT_MEDIA[p.id] ||
    p.images[0];
  const identity = evaluatePadelHeroIdentity(p, media, {
    brandSlug: brand?.slug,
  });
  const revoked = (revoke as { ids: string[] }).ids.includes(p.id);
  rows.push({
    productId: p.id,
    slug: p.slug,
    category: p.categoryId.replace("cat-padel-", ""),
    brand: brand?.slug || "",
    status: p.status,
    revokedWrongMedia: revoked ? "yes" : "no",
    priorHeroSrc: media?.src || "",
    priorSourceUrl: media?.sourceUrl || "",
    identityReasons: identity.reasons.join("|") || (revoked ? "revoked" : "missing"),
    researchPriority:
      revoked || identity.reasons.some((r) => r.includes("other_brand") || r.includes("foreign"))
        ? "P0_EXACT_MANUFACTURER"
        : "P1_REGISTER_EXACT",
    sourcePriority:
      "1_official_manufacturer|2_official_distributor|3_specialist_retailer|4_major_retailer",
  });
}

function csv(data: Array<Record<string, string>>): string {
  if (!data.length) return "";
  const keys = Object.keys(data[0]!);
  return [
    keys.join(","),
    ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")),
  ].join("\n");
}

const out = join(process.cwd(), "docs/padel/data/PADEL-MEDIA-RESEARCH-QUEUE.csv");
writeFileSync(out, csv(rows) + "\n");
process.stdout.write(
  `research queue ${rows.length} (revoked ${(revoke as { ids: string[] }).ids.length})\n`,
);

// Canary sample for manual visual review
const PROD = { isDev: false as const };
const canaries: Array<Record<string, string>> = [];
for (const cat of softCats) {
  const list = getProducts(PROD).filter(
    (p) => p.categoryId === cat && p.status === "published",
  );
  const target =
    cat === "cat-padel-bags" ? 25 : cat === "cat-padel-balls" ? 15 : 15;
  for (const p of list.slice(0, target)) {
    const m = getPrimaryProductMedia(p);
    canaries.push({
      category: cat.replace("cat-padel-", ""),
      productId: p.id,
      slug: p.slug,
      brand: brands[p.brandId]?.slug || "",
      heroSrc: m?.src || "",
      sourceUrl: m?.sourceUrl || "",
      visualReview: "PENDING_HUMAN",
    });
  }
}
writeFileSync(
  join(process.cwd(), "docs/padel/data/PADEL-MEDIA-VISUAL-CANARIES.csv"),
  csv(canaries) + "\n",
);
process.stdout.write(`canaries ${canaries.length}\n`);
