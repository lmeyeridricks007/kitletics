/**
 * Site-wide catalog media audit — authentic primary heroes for published products.
 */
import fs from "node:fs";
import path from "node:path";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { categories } from "@/content/taxonomy/categories";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { RUNNING_PRODUCT_MEDIA } from "@/content/running/product-media";
import type { Product } from "@/domain/products/types";
import { MEDIA_INGEST_POLICY } from "@/lib/media/ingest-policy";
import {
  getPrimaryProductMedia,
  isAuthenticProductMedia,
} from "@/lib/product/media";
import { scanHeroIdentities, isIdentityOcrCategorySlug } from "./hero-identity";
import {
  brandSlugById,
  findLogoHeroSrcs,
  mergeLogoHeroDenylist,
} from "./logo-hero-detect";

export type MediaGapReason =
  | "no-primary"
  | "placeholder-only"
  | "broken-file"
  | "blank-file"
  | "logo-placeholder"
  | "missing-provenance"
  | "wrong-product"
  | "shared-hero";

export interface MediaGapRow {
  productId: string;
  slug: string;
  fullName: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  sportIds: string[];
  lifecycleStatus: string;
  reason: MediaGapReason;
  rawSrc?: string;
  expectedSrc?: string;
  registryKey?: string;
  /** OCR / identity detail when reason is wrong-product or shared-hero */
  detail?: string;
}

export interface CategoryMediaSummary {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  published: number;
  withAuthenticPrimary: number;
  missing: number;
  broken: number;
  placeholderOnly: number;
  coveragePct: number;
}

export interface CatalogMediaAuditReport {
  generatedAt: string;
  totals: {
    published: number;
    withAuthenticPrimary: number;
    missing: number;
    broken: number;
    placeholderOnly: number;
    identityMismatches: number;
    coveragePct: number;
    registryEntries: number;
  };
  byCategory: CategoryMediaSummary[];
  gaps: MediaGapRow[];
}

const brandName = new Map(brands.map((b) => [b.id, b.name]));
const categoryById = new Map(categories.map((c) => [c.id, c]));

function registryFor(productId: string): string | undefined {
  if (RUNNING_PRODUCT_MEDIA[productId]) return "running-product-media";
  if (CATALOG_PRODUCT_MEDIA[productId]) return "catalog-product-media";
  return undefined;
}

function publicFileExists(src: string | undefined): boolean {
  if (!src || !src.startsWith("/")) return false;
  return fs.existsSync(path.join(process.cwd(), "public", src.replace(/^\//, "")));
}

/** Pixel-scan heroes once per audit — catches all-white CDN stubs. */
function findBlankHeroSrcs(srcs: string[]): Set<string> {
  const unique = [...new Set(srcs.filter(Boolean))];
  if (unique.length === 0) return new Set();
  try {
    const { spawnSync } = require("node:child_process") as typeof import("node:child_process");
    const script = `
      const sharp = require('sharp');
      const fs = require('fs');
      const path = require('path');
      const srcs = ${JSON.stringify(unique)};
      (async () => {
        const blank = [];
        for (const src of srcs) {
          const full = path.join(process.cwd(), 'public', src.replace(/^\\//, ''));
          if (!fs.existsSync(full)) continue;
          try {
            const { data, info } = await sharp(full)
              .raw()
              .ensureAlpha()
              .resize(24, 24, { fit: 'fill' })
              .toBuffer({ resolveWithObject: true });
            let white = 0;
            const total = info.width * info.height;
            for (let i = 0; i < data.length; i += 4) {
              const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
              if (data[i + 3] < 20 || lum > 248) white += 1;
            }
            if ((100 * white) / total >= 97) blank.push(src);
          } catch {}
        }
        process.stdout.write(JSON.stringify(blank));
      })();
    `;
    const result = spawnSync(process.execPath, ["-e", script], {
      encoding: "utf8",
      cwd: process.cwd(),
      maxBuffer: 10_000_000,
      timeout: 120_000,
    });
    if (result.status !== 0 || !result.stdout) return new Set();
    const parsed = JSON.parse(result.stdout) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

let blankHeroCache: Set<string> | null = null;
let logoHeroCache: Map<string, string> | null = null;

function isBlankHero(src: string | undefined): boolean {
  if (!src || !blankHeroCache) return false;
  return blankHeroCache.has(src);
}

function logoHeroReason(src: string | undefined): string | undefined {
  if (!src || !logoHeroCache) return undefined;
  return logoHeroCache.get(src);
}

/** Classify a single product’s primary media gap (uses canonical getPrimaryProductMedia). */
export function classifyGap(product: Product): MediaGapRow | null {
  const cat = categoryById.get(product.categoryId);
  const media = getPrimaryProductMedia(product);
  const raw = product.images[0];
  const base: Omit<MediaGapRow, "reason"> = {
    productId: product.id,
    slug: product.slug,
    fullName: product.fullName,
    brandId: product.brandId,
    brandName: brandName.get(product.brandId) ?? product.brandId,
    categoryId: product.categoryId,
    categoryName: cat?.name ?? product.categoryId,
    categorySlug: cat?.slug ?? product.categoryId,
    sportIds: product.sportIds ?? [],
    lifecycleStatus: product.lifecycleStatus ?? "unknown",
    registryKey: registryFor(product.id),
  };

  if (!media) {
    const reason: MediaGapReason =
      raw && !isAuthenticProductMedia(raw) ? "placeholder-only" : "no-primary";
    return {
      ...base,
      reason,
      rawSrc: raw?.src,
    };
  }

  if (!publicFileExists(media.src)) {
    return {
      ...base,
      reason: "broken-file",
      expectedSrc: media.src,
    };
  }

  if (isBlankHero(media.src)) {
    return {
      ...base,
      reason: "blank-file",
      expectedSrc: media.src,
    };
  }

  const logoReason = logoHeroReason(media.src);
  if (logoReason) {
    return {
      ...base,
      reason: "logo-placeholder",
      expectedSrc: media.src,
      detail: logoReason,
    };
  }

  if (!isAuthenticProductMedia(media)) {
    return {
      ...base,
      reason: "placeholder-only",
      rawSrc: media.src,
    };
  }

  if (!media.sourceUrl && !registryFor(product.id)) {
    return {
      ...base,
      reason: "missing-provenance",
      expectedSrc: media.src,
    };
  }

  return null;
}

export interface AuditFilters {
  categorySlug?: string;
  brandSlug?: string;
  sportSlug?: string;
  missingOnly?: boolean;
  /**
   * Identity checks (shared-hash + OCR).
   * - `true` (`--identity`): shared-hash + OCR for all filtered products
   * - `false` (`--no-identity`): skip both
   * - omit: shared-hash for all; OCR for OCR-able categories (shoes, watches, dumbbells)
   */
  checkIdentity?: boolean;
}

export async function runCatalogMediaAudit(
  filters: AuditFilters = {},
): Promise<CatalogMediaAuditReport> {
  let published = products.filter((p) => p.status === "published");

  if (filters.categorySlug) {
    const cat = categories.find((c) => c.slug === filters.categorySlug);
    if (cat) published = published.filter((p) => p.categoryId === cat.id);
  }

  if (filters.brandSlug) {
    const brand = brands.find((b) => b.slug === filters.brandSlug);
    if (brand) published = published.filter((p) => p.brandId === brand.id);
  }

  if (filters.sportSlug) {
    published = published.filter((p) =>
      p.sportIds?.some((id) => id.includes(filters.sportSlug!)),
    );
  }

  const brandSlugs = brandSlugById();
  const primarySrcRows = published
    .map((p) => {
      const media = getPrimaryProductMedia(p);
      if (!media?.src) return null;
      return {
        src: media.src,
        brandSlug: brandSlugs.get(p.brandId),
      };
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  blankHeroCache = findBlankHeroSrcs(primarySrcRows.map((r) => r.src));
  logoHeroCache = await findLogoHeroSrcs(primarySrcRows);

  const gaps: MediaGapRow[] = [];
  let withAuthenticPrimary = 0;
  let broken = 0;
  let placeholderOnly = 0;
  let identityMismatches = 0;

  const catStats = new Map<
    string,
    {
      published: number;
      ok: number;
      missing: number;
      broken: number;
      placeholder: number;
      identity: number;
    }
  >();

  const okProducts: Product[] = [];

  for (const product of published) {
    const catId = product.categoryId;
    const row =
      catStats.get(catId) ??
      {
        published: 0,
        ok: 0,
        missing: 0,
        broken: 0,
        placeholder: 0,
        identity: 0,
      };
    row.published += 1;

    const gap = classifyGap(product);
    if (!gap) {
      withAuthenticPrimary += 1;
      row.ok += 1;
      okProducts.push(product);
    } else {
      if (gap.reason === "broken-file" || gap.reason === "blank-file") {
        broken += 1;
        row.broken += 1;
      } else if (
        gap.reason === "placeholder-only" ||
        gap.reason === "logo-placeholder"
      ) {
        placeholderOnly += 1;
        row.placeholder += 1;
      } else {
        row.missing += 1;
      }
      if (!filters.missingOnly || gap.reason !== "missing-provenance") {
        gaps.push(gap);
      }
    }
    catStats.set(catId, row);
  }

  const runIdentity = filters.checkIdentity !== false;

  if (runIdentity && okProducts.length > 0) {
    const identityRows = okProducts
      .map((product) => {
        const media = getPrimaryProductMedia(product);
        if (!media?.src) return null;
        return {
          product,
          src: media.src,
          absPath: path.join(process.cwd(), "public", media.src.replace(/^\//, "")),
        };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    const forceAllOcr = filters.checkIdentity === true;
    const identityHits = scanHeroIdentities(identityRows, {
      ocr: forceAllOcr
        ? true
        : (product) => {
            const catSlug = categoryById.get(product.categoryId)?.slug;
            return isIdentityOcrCategorySlug(catSlug);
          },
    });
    const demoted = new Set<string>();
    const seen = new Set<string>();
    for (const hit of identityHits) {
      const key = `${hit.productId}:${hit.reason}:${hit.detail}`;
      if (seen.has(key)) continue;
      seen.add(key);
      identityMismatches += 1;
      const product = okProducts.find((p) => p.id === hit.productId);
      if (!product) continue;
      if (!demoted.has(hit.productId)) {
        demoted.add(hit.productId);
        const stats = catStats.get(product.categoryId);
        if (stats) {
          stats.ok = Math.max(0, stats.ok - 1);
          stats.identity += 1;
        }
        withAuthenticPrimary = Math.max(0, withAuthenticPrimary - 1);
      }
      const cat = categoryById.get(product.categoryId);
      gaps.push({
        productId: hit.productId,
        slug: hit.slug,
        fullName: hit.fullName,
        brandId: product.brandId,
        brandName: brandName.get(product.brandId) ?? product.brandId,
        categoryId: product.categoryId,
        categoryName: cat?.name ?? product.categoryId,
        categorySlug: cat?.slug ?? product.categoryId,
        sportIds: product.sportIds ?? [],
        lifecycleStatus: product.lifecycleStatus ?? "unknown",
        reason: hit.reason,
        expectedSrc: hit.src,
        registryKey: registryFor(hit.productId),
        detail: hit.detail,
        rawSrc: hit.ocrText,
      });
    }
  }

  const byCategory: CategoryMediaSummary[] = [...catStats.entries()]
    .map(([categoryId, s]) => {
      const cat = categoryById.get(categoryId);
      return {
        categoryId,
        categoryName: cat?.name ?? categoryId,
        categorySlug: cat?.slug ?? categoryId,
        published: s.published,
        withAuthenticPrimary: s.ok,
        missing: s.missing,
        broken: s.broken,
        placeholderOnly: s.placeholder,
        coveragePct:
          s.published === 0
            ? 100
            : Math.round((s.ok / s.published) * 100),
      };
    })
    .sort((a, b) => a.coveragePct - b.coveragePct || b.missing - a.missing);

  const missingCount = gaps.filter(
    (g) => g.reason === "no-primary" || g.reason === "placeholder-only",
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      published: published.length,
      withAuthenticPrimary,
      missing: missingCount,
      broken,
      placeholderOnly,
      identityMismatches,
      coveragePct:
        published.length === 0
          ? 100
          : Math.round((withAuthenticPrimary / published.length) * 100),
      registryEntries:
        Object.keys(CATALOG_PRODUCT_MEDIA).length +
        Object.keys(RUNNING_PRODUCT_MEDIA).length,
    },
    byCategory,
    gaps: gaps.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName) ||
      a.fullName.localeCompare(b.fullName),
    ),
  };
}

export function renderCatalogMediaReportMarkdown(
  report: CatalogMediaAuditReport,
): string {
  const lines: string[] = [];
  lines.push("# Catalog Media Audit");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Published products | ${report.totals.published} |`);
  lines.push(`| Authentic primary hero | ${report.totals.withAuthenticPrimary} |`);
  lines.push(`| Coverage | ${report.totals.coveragePct}% |`);
  lines.push(`| Missing / placeholder | ${report.totals.missing + report.totals.placeholderOnly} |`);
  lines.push(`| Broken file on disk | ${report.totals.broken} |`);
  lines.push(
    `| Wrong / shared hero (identity) | ${report.totals.identityMismatches} |`,
  );
  lines.push(
    `| Logo / wordmark placeholders | ${report.gaps.filter((g) => g.reason === "logo-placeholder").length} |`,
  );
  lines.push(`| Registry entries | ${report.totals.registryEntries} |`);
  lines.push("");
  lines.push("## By category (lowest coverage first)");
  lines.push("");
  lines.push(
    "| Category | Published | OK | Missing | Broken | Placeholder | Coverage |",
  );
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const c of report.byCategory) {
    if (c.published === 0) continue;
    lines.push(
      `| ${c.categoryName} | ${c.published} | ${c.withAuthenticPrimary} | ${c.missing} | ${c.broken} | ${c.placeholderOnly} | ${c.coveragePct}% |`,
    );
  }
  lines.push("");
  lines.push("## Gaps (action list)");
  lines.push("");
  const identityGaps = report.gaps.filter(
    (g) => g.reason === "wrong-product" || g.reason === "shared-hero",
  );
  if (identityGaps.length) {
    lines.push(`**Identity mismatches — wrong or shared hero (${identityGaps.length})**`);
    lines.push("");
    for (const g of identityGaps.slice(0, 50)) {
      lines.push(
        `- \`${g.slug}\` (${g.fullName}) — **${g.reason}**: ${g.detail ?? ""}`,
      );
    }
    lines.push("");
  }
  const logoGaps = report.gaps.filter((g) => g.reason === "logo-placeholder");
  if (logoGaps.length) {
    lines.push(`**Logo / wordmark heroes (${logoGaps.length})**`);
    lines.push("");
    for (const g of logoGaps.slice(0, 50)) {
      lines.push(
        `- \`${g.slug}\` (${g.fullName}) — ${g.detail ?? "logo placeholder"}`,
      );
    }
    lines.push("");
  }
  const p0 = report.gaps.filter(
    (g) =>
      g.reason !== "missing-provenance" &&
      g.reason !== "wrong-product" &&
      g.reason !== "shared-hero" &&
      g.lifecycleStatus === "current",
  );
  lines.push(`**P0 — current products without authentic hero (${p0.length})**`);
  lines.push("");
  for (const g of p0.slice(0, 100)) {
    lines.push(
      `- \`${g.slug}\` (${g.fullName}) — ${g.reason} · ${g.categoryName}`,
    );
  }
  if (p0.length > 100) {
    lines.push(`- … and ${p0.length - 100} more (see JSON report)`);
  }
  return lines.join("\n");
}

export function writeCatalogMediaReport(
  report: CatalogMediaAuditReport,
  outDir = path.join(process.cwd(), "data/staging"),
): { jsonPath: string; mdPath: string; denylistAdded: string[] } {
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = report.generatedAt.slice(0, 10);
  const jsonPath = path.join(outDir, `catalog-media-audit-${stamp}.json`);
  const mdPath = path.join(outDir, `catalog-media-audit-${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, renderCatalogMediaReportMarkdown(report));
  const logoSrcs = report.gaps
    .filter((g) => g.reason === "logo-placeholder")
    .map((g) => g.expectedSrc ?? g.rawSrc)
    .filter((s): s is string => Boolean(s));
  const { added: denylistAdded } = mergeLogoHeroDenylist(logoSrcs);
  return { jsonPath, mdPath, denylistAdded };
}

/** Production tree only. QA screenshots are skipped. Does not fail media:ci. */
export function listPublicMastersOverError(
  imagesRoot = path.join(process.cwd(), "public/images"),
): { src: string; bytes: number }[] {
  const hits: { src: string; bytes: number }[] = [];
  const cap = MEDIA_INGEST_POLICY.errorBytes;
  const publicRoot = path.join(process.cwd(), "public");
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith(".")) continue;
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        if (name === "qa") continue;
        walk(p);
        continue;
      }
      if (!/\.(png|jpe?g|webp|avif|gif)$/i.test(name)) continue;
      if (st.size <= cap) continue;
      hits.push({
        src:
          "/" +
          path.relative(publicRoot, p).split(path.sep).join("/"),
        bytes: st.size,
      });
    }
  }
  walk(imagesRoot);
  return hits.sort((a, b) => b.bytes - a.bytes);
}
