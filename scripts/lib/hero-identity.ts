/**
 * Detect product-hero mismatches via on-image text (model names stamped on
 * shoes / watches / dumbbells) and duplicate file hashes shared across products.
 *
 * OCR: macOS Vision (`scripts/bin/vision-ocr`) when available; optional tesseract fallback.
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/domain/products/types";
import { brands } from "@/content/brands";

export interface HeroIdentityHit {
  productId: string;
  slug: string;
  fullName: string;
  src: string;
  reason: "wrong-product" | "shared-hero";
  detail: string;
  ocrText?: string;
}

/**
 * Categories where on-product model text is reliably OCR-able.
 * Shared-hash runs for all products; OCR defaults to these unless `--identity`.
 */
export const IDENTITY_OCR_CATEGORY_SLUGS = [
  "running-shoes",
  "training-shoes",
  "gps-watches",
  "hrm",
  "adjustable-dumbbells",
] as const;

export type IdentityOcrCategorySlug =
  (typeof IDENTITY_OCR_CATEGORY_SLUGS)[number];

export function isIdentityOcrCategorySlug(slug: string | undefined): boolean {
  if (!slug) return false;
  return (IDENTITY_OCR_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

const brandById = new Map(brands.map((b) => [b.id, b]));

/** Models we do not sell but often appear when a wrong packshot is used. */
const EXTRA_FOREIGN_PATTERNS: Array<{ id: string; re: RegExp }> = [
  { id: "gt-4000", re: /(?:^|[^A-Z0-9])(?:GT|8T|G7)[\s\-]?4000(?:\s*[0-9])?/i },
  { id: "gt-3000", re: /(?:^|[^A-Z0-9])(?:GT|8T)[\s\-]?3000/i },
  { id: "caldera", re: /(?:^|[^A-Z0-9])CALDERA(?:\s*\d+)?/i },
];

function ensureVisionOcrBinary(): string | null {
  if (process.platform !== "darwin") return null;
  const bin = path.join(process.cwd(), "scripts/bin/vision-ocr");
  const src = path.join(process.cwd(), "scripts/lib/vision-ocr.swift");
  if (!fs.existsSync(src)) return null;
  const needsBuild =
    !fs.existsSync(bin) ||
    fs.statSync(src).mtimeMs > fs.statSync(bin).mtimeMs;
  if (needsBuild) {
    fs.mkdirSync(path.dirname(bin), { recursive: true });
    const res = spawnSync("swiftc", ["-O", src, "-o", bin], {
      encoding: "utf8",
      cwd: process.cwd(),
      timeout: 120_000,
    });
    if (res.status !== 0) return null;
  }
  return bin;
}

function normalizeOcr(text: string): string {
  return text
    .toUpperCase()
    .replace(/\b8T\b/g, "GT")
    .replace(/8T[\s\-]?/g, "GT-")
    .replace(/G7[\s\-]?4000/g, "GT-4000")
    .replace(/O(?=\d)/g, "0")
    .replace(/[|]/g, "I")
    .replace(/\s+/g, " ")
    .trim();
}

/** Compact alnum form for substring checks: "gel-cumulus-27" → "GELCUMULUS27". */
function compact(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Stable identity needles for a product (must be long enough to avoid foam/tech false hits).
 */
export function productIdentityNeedles(product: Product): string[] {
  const brand = brandById.get(product.brandId);
  const brandSlug = brand?.slug ?? "";
  let core = product.slug;
  if (brandSlug && core.startsWith(`${brandSlug}-`)) {
    core = core.slice(brandSlug.length + 1);
  }
  const variants = new Set<string>();
  const add = (raw: string, minLen = 6) => {
    const c = compact(raw);
    if (c.length >= minLen) variants.add(c);
  };
  add(core);
  add(core.replace(/^gel-/, ""));
  // Family without generation (GLYCERIN, TRIUMPH, CUMULUS, ADRENALINEGTS)
  const family = core.replace(/^gel-/, "").replace(/-\d+$/, "").replace(/\d+$/, "");
  add(family);
  // fullName without brand prefix
  let name = product.fullName;
  if (brand?.name) {
    name = name.replace(new RegExp(`^${brand.name}\\s+`, "i"), "");
  }
  add(name);
  add(name.replace(/^GEL[-\s]*/i, ""));
  add(name.replace(/\s+\d+$/, "")); // "Glycerin 22" → "Glycerin"

  // Watch face / bezel stamps (Forerunner 970 → FR970; Fenix 8 → FENIX8)
  const forerunner = core.match(/^forerunner-(\d+)/i);
  if (forerunner) add(`fr${forerunner[1]}`, 5);
  const fenix = core.match(/^fenix-?([\d]+[a-z]*)/i);
  if (fenix) add(`fenix${fenix[1]}`, 5);
  const enduro = core.match(/^enduro-?(\d+)/i);
  if (enduro) add(`enduro${enduro[1]}`, 6);
  const coros = core.match(/^(pace|apex|vertix)-?([\w-]+)/i);
  if (coros) add(`${coros[1]}${coros[2]}`, 5);

  // Adjustable dumbbell dial / end-cap stamps (SelectTech 1090, Pro Series 100)
  const selectTech = core.match(/selecttech-(\d+)/i);
  if (selectTech) add(`selecttech${selectTech[1]}`, 6);
  const powerblock = core.match(/^(?:pro-series|elite-exp)-?(\d+)/i);
  if (powerblock) add(`proseries${powerblock[1]}`, 6);
  const nuobell = product.slug.match(/nuobell-(\d+)/i);
  if (nuobell) add(`nuobell${nuobell[1]}`, 6);

  return [...variants];
}

/** Family key used to compare OCR hits across the catalog (e.g. cumulus, kayano, gt-2000). */
export function productFamilyKey(product: Product): string {
  const brand = brandById.get(product.brandId);
  let core = product.slug;
  if (brand?.slug && core.startsWith(`${brand.slug}-`)) {
    core = core.slice(brand.slug.length + 1);
  }
  core = core.replace(/^gel-/, "");
  return compact(core.replace(/-\d+$/, "").replace(/\d+$/, "")) || compact(core);
}

export function productGeneration(product: Product): string | null {
  // Tennis/padel string gauges use slug tails like 1-28 (= 1.28mm), not model gens.
  // OCR of "BLACK CODE 16/1.28" must not be treated as generation 28 vs 1612.
  const brand = brandById.get(product.brandId);
  let core = product.slug;
  if (brand?.slug && core.startsWith(`${brand.slug}-`)) {
    core = core.slice(brand.slug.length + 1);
  }
  const gauge = core.match(/-(\d+)-(\d+)$/);
  if (gauge) {
    const whole = Number(gauge[1]);
    const frac = Number(gauge[2]);
    if (whole <= 2 && frac >= 15 && frac <= 40) {
      return null;
    }
  }
  const m = product.slug.match(/(\d+)$/);
  return m ? m[1] : null;
}

/**
 * When OCR names the same model family with a different generation (TRIUMPH 24 vs 22).
 *
 * Guards against common Vision false positives:
 * - Truncated gens: SelectTech **10** from **1090**, SoftFlask **25** from **250**
 * - Glued UI digits: Enduro **32** from face weather field next to **Enduro 3**
 */
export function ocrGenerationMismatch(
  product: Product,
  ocrRaw: string,
): { conflict: boolean; detail: string } {
  const family = productFamilyKey(product);
  const expectedGen = productGeneration(product);
  if (!family || family.length < 5 || !expectedGen) {
    return { conflict: false, detail: "no-gen" };
  }
  const ocrCompact = compact(normalizeOcr(ocrRaw));
  const expectedToken = `${family}${expectedGen}`;

  // Strong accept: family + full expected generation, not the start of a longer gen.
  const expectedIdx = ocrCompact.indexOf(expectedToken);
  if (expectedIdx >= 0) {
    const afterExpected = ocrCompact.slice(
      expectedIdx + expectedToken.length,
    );
    if (!/^\d/.test(afterExpected)) {
      return { conflict: false, detail: "gen-ok" };
    }
  }

  const idx = ocrCompact.indexOf(family);
  if (idx < 0) return { conflict: false, detail: "family-absent" };
  const after = ocrCompact.slice(idx + family.length);
  const m = after.match(/^(\d{1,4})/);
  if (!m) return { conflict: false, detail: "no-ocr-gen" };
  const ocrGen = m[1]!;
  if (ocrGen === expectedGen) {
    return { conflict: false, detail: "gen-ok" };
  }

  // Truncated OCR of a longer generation (10 ⊂ 1090, 25 ⊂ 250) when full token exists.
  if (
    expectedGen.startsWith(ocrGen) &&
    expectedGen.length > ocrGen.length &&
    ocrCompact.includes(expectedToken)
  ) {
    return { conflict: false, detail: "gen-truncated-but-full-present" };
  }

  // Extra digits glued after a short generation (ENDURO + "32" weather) —
  // only accept when the full expected token never appears as a clean number
  // and OCR gen is a longer string that merely starts with expectedGen.
  if (
    ocrGen.startsWith(expectedGen) &&
    ocrGen.length > expectedGen.length &&
    expectedGen.length <= 2
  ) {
    return { conflict: false, detail: "gen-glued-ui-digits" };
  }

  return {
    conflict: true,
    detail: `OCR shows ${family} ${ocrGen} but product is ${product.slug}`,
  };
}

export function ocrFile(absPath: string): string {
  const bin = ensureVisionOcrBinary();
  if (bin) {
    const res = spawnSync(bin, [absPath], {
      encoding: "utf8",
      timeout: 30_000,
      maxBuffer: 2_000_000,
    });
    if (res.status === 0 && res.stdout) return res.stdout.trim();
  }
  const tess = spawnSync(
    "tesseract",
    [absPath, "stdout", "--psm", "11"],
    { encoding: "utf8", timeout: 30_000, maxBuffer: 2_000_000 },
  );
  if (tess.status === 0 && tess.stdout) return tess.stdout.trim();
  return "";
}

function cachePath(): string {
  return path.join(process.cwd(), "data/staging/hero-ocr-cache.json");
}

type OcrCache = Record<string, { text: string; at: string }>;

function loadCache(): OcrCache {
  try {
    return JSON.parse(fs.readFileSync(cachePath(), "utf8")) as OcrCache;
  } catch {
    return {};
  }
}

function saveCache(cache: OcrCache): void {
  fs.mkdirSync(path.dirname(cachePath()), { recursive: true });
  fs.writeFileSync(cachePath(), JSON.stringify(cache, null, 2));
}

function fileSha(absPath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(absPath)).digest("hex");
}

export function ocrFileCached(absPath: string): string {
  const hash = fileSha(absPath);
  const cache = loadCache();
  if (cache[hash]) return cache[hash].text;
  const text = ocrFile(absPath);
  cache[hash] = { text, at: new Date().toISOString() };
  saveCache(cache);
  return text;
}

/**
 * True when OCR clearly names a different model than `product`.
 */
export function ocrConflictsWithProduct(
  product: Product,
  ocrRaw: string,
  catalog: Product[],
): { conflict: boolean; detail: string } {
  if (!ocrRaw.trim()) return { conflict: false, detail: "no-ocr-text" };
  const ocr = normalizeOcr(ocrRaw);
  const ocrCompact = compact(ocr);
  const expected = productIdentityNeedles(product);
  const expectedHit = expected.some((n) => ocrCompact.includes(n));

  const gen = ocrGenerationMismatch(product, ocrRaw);
  if (gen.conflict) return gen;

  // Extra foreign models (not in catalog)
  for (const foreign of EXTRA_FOREIGN_PATTERNS) {
    if (foreign.re.test(ocr) && !expected.some((n) => n.includes(compact(foreign.id)))) {
      const selfIsForeign = compact(product.slug).includes(compact(foreign.id));
      if (!selfIsForeign) {
        return {
          conflict: true,
          detail: `OCR mentions ${foreign.id} but product is ${product.slug}`,
        };
      }
    }
  }

  // Another catalog product's identity appears, and ours does not
  for (const other of catalog) {
    if (other.id === product.id) continue;
    if (other.brandId !== product.brandId) continue; // same-brand mixups are the common failure
    const otherNeedles = productIdentityNeedles(other);
    const otherHit = otherNeedles.some((n) => ocrCompact.includes(n));
    if (!otherHit) continue;
    // Avoid substring traps: shorter needle contained in longer expected
    const strongOther = otherNeedles
      .filter((n) => ocrCompact.includes(n))
      .sort((a, b) => b.length - a.length)[0];
    if (!strongOther || strongOther.length < 7) continue;
    if (expected.some((n) => n.includes(strongOther) || strongOther.includes(n))) {
      continue;
    }
    // Same family different gen already handled; skip shared family-only hit when expected also hits
    if (expectedHit && productFamilyKey(product) === productFamilyKey(other)) {
      continue;
    }
    if (!expectedHit) {
      return {
        conflict: true,
        detail: `OCR matches ${other.slug} (${strongOther}) but not ${product.slug}`,
      };
    }
  }

  return { conflict: false, detail: expectedHit ? "identity-ok" : "inconclusive" };
}

export interface IdentityScanInput {
  product: Product;
  src: string;
  absPath: string;
}

export type ScanHeroIdentityOptions = {
  /**
   * `true` — OCR every row; `false` — shared-hash only;
   * predicate — OCR only matching products (default categories).
   */
  ocr?: boolean | ((product: Product) => boolean);
};

/**
 * Scan heroes for wrong-product OCR and shared content hashes.
 * Shared-hash always runs; OCR follows `options.ocr`.
 */
export function scanHeroIdentities(
  rows: IdentityScanInput[],
  options: ScanHeroIdentityOptions = {},
): HeroIdentityHit[] {
  const hits: HeroIdentityHit[] = [];
  const catalog = rows.map((r) => r.product);
  const byHash = new Map<string, IdentityScanInput[]>();

  for (const row of rows) {
    if (!fs.existsSync(row.absPath)) continue;
    const hash = fileSha(row.absPath);
    const list = byHash.get(hash) ?? [];
    list.push(row);
    byHash.set(hash, list);
  }

  for (const [, group] of byHash) {
    if (group.length < 2) continue;
    const ids = new Set(group.map((g) => g.product.id));
    if (ids.size < 2) continue;
    // Same product alternate filenames sharing bytes are OK; different products are not
    for (const row of group) {
      const others = group
        .filter((g) => g.product.id !== row.product.id)
        .map((g) => g.product.slug)
        .join(", ");
      hits.push({
        productId: row.product.id,
        slug: row.product.slug,
        fullName: row.product.fullName,
        src: row.src,
        reason: "shared-hero",
        detail: `Same image bytes as ${others}`,
      });
    }
  }

  const shouldOcr: (product: Product) => boolean =
    typeof options.ocr === "function"
      ? options.ocr
      : options.ocr === false
        ? () => false
        : () => true;

  for (const row of rows) {
    if (!shouldOcr(row.product)) continue;
    if (!fs.existsSync(row.absPath)) continue;
    const text = ocrFileCached(row.absPath);
    const { conflict, detail } = ocrConflictsWithProduct(row.product, text, catalog);
    if (conflict) {
      hits.push({
        productId: row.product.id,
        slug: row.product.slug,
        fullName: row.product.fullName,
        src: row.src,
        reason: "wrong-product",
        detail,
        ocrText: text.slice(0, 240),
      });
    }
  }

  return hits;
}
