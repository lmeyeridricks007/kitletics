import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBrands, getProducts } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import {
  evaluatePadelHeroIdentity,
  classifySharedHeroReuse,
  type HeroReuseClass,
} from "@/lib/product/media-identity";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { getRunningProductHeroMedia } from "@/content/running/product-media";
import { isAuthenticProductMedia } from "@/lib/product/media-authentic";

const PROD = { isDev: false as const };
const DEV = { isDev: true as const };
const CATS = [
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
];

const brands = Object.fromEntries(getBrands(DEV).map((b) => [b.id, b]));
// Include drafts (de-published) so remediation CSV shows BEFORE→AFTER survivors + demotions.
const products = getProducts(DEV).filter((p) => CATS.includes(p.categoryId));

const remediation: Array<Record<string, string>> = [];
const bySrc = new Map<string, string[]>();

for (const p of products) {
  const brand = brands[p.brandId];
  const registered = getRunningProductHeroMedia(p.id, p.fullName)?.[0];
  const media = registered ?? p.images[0];
  const primary = getPrimaryProductMedia(p);
  const identity = evaluatePadelHeroIdentity(p, media, {
    brandSlug: brand?.slug,
  });
  const src = media?.src || "";
  if (src && isAuthenticProductMedia(media)) {
    const list = bySrc.get(src) ?? [];
    list.push(p.id);
    bySrc.set(src, list);
  }
  remediation.push({
    productId: p.id,
    slug: p.slug,
    category: p.categoryId.replace("cat-padel-", ""),
    brand: brand?.slug || "",
    status: p.status,
    heroSrc: src,
    sourceUrl: media?.sourceUrl || "",
    identityVerified: identity.verified ? "yes" : "no",
    identityReasons: identity.reasons.join("|"),
    primaryResolves: primary ? "yes" : "no",
    primarySrc: primary?.src || "",
    action:
      p.status === "published" && !identity.verified
        ? "DE_PUBLISH"
        : identity.verified
          ? "KEEP"
          : "STAY_DRAFT",
  });
}

const reuseRows: Array<Record<string, string>> = [];
for (const [src, ids] of bySrc) {
  if (ids.length < 2) {
    const p = products.find((x) => x.id === ids[0]);
    reuseRows.push({
      heroSrc: src,
      productIds: ids.join("|"),
      slugs: p?.slug || "",
      reuseClass: "UNIQUE",
      notes: "",
    });
    continue;
  }
  let worst: HeroReuseClass = "VALID_VARIANT_REUSE";
  const notes: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = products.find((x) => x.id === ids[i])!;
      const b = products.find((x) => x.id === ids[j])!;
      const cls = classifySharedHeroReuse(a, b);
      if (cls === "INVALID") worst = "INVALID";
      else if (cls === "SUSPICIOUS" && worst !== "INVALID") worst = "SUSPICIOUS";
      notes.push(`${a.slug}↔${b.slug}:${cls}`);
    }
  }
  reuseRows.push({
    heroSrc: src,
    productIds: ids.join("|"),
    slugs: ids
      .map((id) => products.find((p) => p.id === id)?.slug || id)
      .join("|"),
    reuseClass: worst,
    notes: notes.join("; "),
  });
}

function writeCsv(path: string, rows: Array<Record<string, string>>) {
  if (!rows.length) {
    writeFileSync(path, "\n");
    return;
  }
  const cols = Object.keys(rows[0]!);
  const lines = [
    cols.join(","),
    ...rows.map((r) =>
      cols
        .map((c) => {
          const v = r[c] ?? "";
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(","),
    ),
  ];
  writeFileSync(path, `${lines.join("\n")}\n`);
}

const outDir = join(process.cwd(), "docs/padel/data");
writeCsv(join(outDir, "PADEL-MEDIA-REMEDIATION.csv"), remediation);
writeCsv(join(outDir, "PADEL-DUPLICATE-HERO-AUDIT.csv"), reuseRows);

const published = remediation.filter((r) => r.status === "published");
const verifiedPub = published.filter((r) => r.identityVerified === "yes");
const depub = published.filter((r) => r.action === "DE_PUBLISH");
const invalidReuse = reuseRows.filter((r) => r.reuseClass === "INVALID");

process.stdout.write(
  JSON.stringify(
    {
      total: remediation.length,
      published: published.length,
      publishedVerified: verifiedPub.length,
      wouldDePublish: depub.length,
      byCategory: Object.fromEntries(
        CATS.map((c) => {
          const key = c.replace("cat-padel-", "");
          const rows = published.filter((r) => r.category === key);
          return [
            key,
            {
              published: rows.length,
              verified: rows.filter((r) => r.identityVerified === "yes").length,
              dePublish: rows.filter((r) => r.action === "DE_PUBLISH").length,
            },
          ];
        }),
      ),
      invalidSharedHeroes: invalidReuse.length,
      sampleDepub: depub.slice(0, 25).map((r) => `${r.category}:${r.slug}:${r.identityReasons}`),
    },
    null,
    2,
  ) + "\n",
);

// Registry revoke candidates (soft-goods entries that fail identity)
const revokeIds: string[] = [];
for (const id of Object.keys(PADEL_SECONDARY_PRODUCT_MEDIA)) {
  const p = products.find((x) => x.id === id);
  if (!p) continue;
  const media = getCatalogProductHeroMedia(id, p.fullName)?.[0];
  if (!evaluatePadelHeroIdentity(p, media, { brandSlug: brands[p.brandId]?.slug }).verified) {
    revokeIds.push(id);
  }
}
writeFileSync(
  join(process.cwd(), "data/staging/padel-media-revoke-ids.json"),
  JSON.stringify(revokeIds, null, 2) + "\n",
);
process.stdout.write(`revokeCandidates ${revokeIds.length}\n`);
