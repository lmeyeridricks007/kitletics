/**
 * Revoke soft-goods registry heroes that fail exact-product identity.
 * Rewrites product-media.ts keeping only MEDIA_VERIFIED-passing entries.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/tmp/revoke-padel-identity-failures.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBrands, getProducts } from "@/repositories";
import { evaluatePadelHeroIdentity } from "@/lib/product/media-identity";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import type { CatalogProductMediaSource } from "@/content/catalog-product-media";

const ROOT = process.cwd();
const DEV = { isDev: true as const };
const brands = Object.fromEntries(getBrands(DEV).map((b) => [b.id, b]));
const products = Object.fromEntries(
  getProducts(DEV)
    .filter((p) => p.categoryId.startsWith("cat-padel-"))
    .map((p) => [p.id, p]),
);

const keep: Record<string, CatalogProductMediaSource> = {};
const revokeIds: string[] = [];
const rows: Array<Record<string, string>> = [];

for (const [id, entry] of Object.entries(PADEL_SECONDARY_PRODUCT_MEDIA)) {
  const p = products[id];
  if (!p) {
    // Orphan registry row — keep for now (may be shoes/rackets not in soft filter).
    keep[id] = entry;
    continue;
  }
  const media = getCatalogProductHeroMedia(id, p.fullName)?.[0] ?? entry;
  const ev = evaluatePadelHeroIdentity(p, media, {
    brandSlug: brands[p.brandId]?.slug,
  });
  if (ev.verified) {
    keep[id] = entry;
  } else {
    revokeIds.push(id);
    rows.push({
      productId: id,
      slug: p.slug,
      category: p.categoryId.replace("cat-padel-", ""),
      heroSrc: media?.src || entry.src,
      sourceUrl: String(media?.sourceUrl || entry.sourceUrl || ""),
      reasons: ev.reasons.join("|"),
    });
  }
}

function esc(s: string): string {
  return JSON.stringify(s);
}

const body = Object.entries(keep)
  .map(([id, e]) => {
    const lines = [
      `  ${esc(id)}: {`,
      `    productId: ${esc(e.productId)},`,
      `    src: ${esc(e.src)},`,
    ];
    if (e.sourceUrl) lines.push(`    sourceUrl: ${esc(e.sourceUrl)},`);
    if (e.source) lines.push(`    source: ${esc(e.source)},`);
    if (e.licence) lines.push(`    licence: ${esc(e.licence)},`);
    if (e.attribution) lines.push(`    attribution: ${esc(e.attribution)},`);
    if (e.width != null) lines.push(`    width: ${e.width},`);
    if (e.height != null) lines.push(`    height: ${e.height},`);
    if (e.retrievedAt) lines.push(`    retrievedAt: ${esc(e.retrievedAt)},`);
    lines.push(`  },`);
    return lines.join("\n");
  })
  .join("\n");

const out = `import type { CatalogProductMediaSource } from "@/content/catalog-product-media";

/**
 * Authentic unique packshots for padel shoes (recovery) and soft goods.
 * CATALOG_PRODUCT_MEDIA wins on ID collision.
 *
 * Only entries that pass exact-product media identity (MEDIA_VERIFIED) remain.
 * Identity failures were revoked ${new Date().toISOString().slice(0, 10)}
 * (${revokeIds.length} entries) — see data/staging/padel-media-identity-revoke.json.
 */
export const PADEL_SECONDARY_PRODUCT_MEDIA: Record<
  string,
  CatalogProductMediaSource
> = {
${body}
};
`;

writeFileSync(join(ROOT, "src/content/padel/soft-goods/product-media.ts"), out);
writeFileSync(
  join(ROOT, "data/staging/padel-media-identity-revoke.json"),
  JSON.stringify(
    {
      asOf: new Date().toISOString().slice(0, 10),
      count: revokeIds.length,
      kept: Object.keys(keep).length,
      ids: revokeIds,
      rows,
    },
    null,
    2,
  ),
);

process.stdout.write(
  `Kept ${Object.keys(keep).length}; revoked ${revokeIds.length} identity-failing secondary media entries\n`,
);
