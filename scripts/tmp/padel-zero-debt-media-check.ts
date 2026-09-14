/**
 * Independent media family + duplicate-hero checks for zero-debt launch.
 * Uses catalog identity (not remediation reports).
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBrands, getProducts } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  evaluatePadelHeroIdentity,
  classifySharedHeroReuse,
} from "@/lib/product/media-identity";

const PROD = { isDev: false as const };
const brands = Object.fromEntries(getBrands(PROD).map((b) => [b.id, b]));
const soft = getProducts(PROD).filter((p) =>
  [
    "cat-padel-balls",
    "cat-padel-bags",
    "cat-padel-grips",
    "cat-padel-accessories",
  ].includes(p.categoryId),
);

const FORBIDDEN = [
  {
    family: "balls",
    srcIncludes: "head-padel-pro-s",
    allowProductIds: new Set(["prod-head-padel-pro-s", "prod-head-padel-pro-s-balls"]),
  },
  {
    family: "bags",
    srcIncludes: "nox-at10-team-paletero",
    allowBrandIncludes: "nox",
  },
  {
    family: "grips",
    srcIncludes: "wilson-padel-overgrip",
    allowBrandIncludes: "wilson",
  },
  {
    family: "accessories",
    srcIncludes: "bullpadel-frame-protector",
    allowBrandIncludes: "bullpadel",
  },
];

const issues: Array<Record<string, string>> = [];
const bySrc = new Map<string, string[]>();

for (const p of soft) {
  const media = getPrimaryProductMedia(p);
  const brand = brands[p.brandId];
  const identity = evaluatePadelHeroIdentity(p, media, { brandSlug: brand?.slug });
  if (p.status === "published" && !identity.verified) {
    issues.push({
      severity: "BLOCKER",
      class: "MEDIA_IDENTITY",
      productId: p.id,
      slug: p.slug,
      detail: identity.reasons.join("|") || "unverified",
    });
  }
  const src = media?.src || "";
  if (src) {
    const list = bySrc.get(src) ?? [];
    list.push(p.id);
    bySrc.set(src, list);
  }
  for (const rule of FORBIDDEN) {
    if (!src.includes(rule.srcIncludes)) continue;
    const brandOk =
      "allowBrandIncludes" in rule &&
      Boolean(brand?.slug?.includes(rule.allowBrandIncludes as string));
    const idOk =
      "allowProductIds" in rule &&
      (rule.allowProductIds as Set<string>).has(p.id);
    if (!brandOk && !idOk) {
      issues.push({
        severity: "BLOCKER",
        class: "MEDIA_FAMILY_REUSE",
        productId: p.id,
        slug: p.slug,
        detail: `${rule.family} uses forbidden hero fragment ${rule.srcIncludes}`,
      });
    }
  }
}

let invalidShared = 0;
for (const [src, ids] of bySrc) {
  if (ids.length < 2) continue;
  const products = ids
    .map((id) => soft.find((p) => p.id === id)!)
    .filter(Boolean);
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const cls = classifySharedHeroReuse(products[i]!, products[j]!);
      if (cls === "INVALID" || cls === "SUSPICIOUS") {
        invalidShared++;
        issues.push({
          severity: "BLOCKER",
          class: "DUPLICATE_HERO",
          productId: `${products[i]!.id}|${products[j]!.id}`,
          slug: `${products[i]!.slug}|${products[j]!.slug}`,
          detail: `${cls}:${src}`,
        });
      }
    }
  }
}

const out = {
  asOf: new Date().toISOString().slice(0, 10),
  softPublished: soft.length,
  invalidSharedHeroes: invalidShared,
  issueCount: issues.length,
  issues,
};
writeFileSync(
  join(process.cwd(), "docs/padel/data/PADEL-ZERO-DEBT-MEDIA-CHECK.json"),
  JSON.stringify(out, null, 2) + "\n",
);
process.stdout.write(JSON.stringify(out, null, 2) + "\n");
process.exitCode = issues.length ? 1 : 0;
