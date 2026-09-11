/**
 * Detect brand-logo / wordmark heroes for catalog media audit + fetch scripts.
 *
 * Conservative by design: white-background packshots must not be demoted.
 * Catches (1) known CDN logo stubs, (2) tiny extreme-aspect wordmarks,
 * (3) near-duplicate of the product's own brand logo.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { brands } from "@/content/brands";

/** Mirafit (and similar) CDN stubs — sha256 hex prefixes. */
export const KNOWN_LOGO_STUB_SHA256_PREFIXES: ReadonlySet<string> = new Set([
  "8f34363fff41", // Mirafit logo placeholder (~50KB)
]);

const HASH_SIZE = 16;

function requireSharp(): ((input: string) => import("sharp").Sharp) {
  const mod = require("sharp") as
    | ((input: string) => import("sharp").Sharp)
    | { default: (input: string) => import("sharp").Sharp };
  return typeof mod === "function" ? mod : mod.default;
}

export async function averageHashFile(absPath: string): Promise<string | null> {
  try {
    const sharp = requireSharp();
    const { data, info } = await sharp(absPath)
      .resize(HASH_SIZE, HASH_SIZE, { fit: "fill" })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixels = info.width * info.height;
    let sum = 0;
    for (let i = 0; i < pixels; i++) sum += data[i]!;
    const avg = sum / pixels;
    let bits = "";
    for (let i = 0; i < pixels; i++) bits += data[i]! >= avg ? "1" : "0";
    let hex = "";
    for (let i = 0; i < bits.length; i += 4) {
      hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    }
    return hex;
  } catch {
    return null;
  }
}

export function hammingHex(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let dist = 0;
  for (let i = 0; i < n; i++) {
    const x = parseInt(a[i]!, 16) ^ parseInt(b[i]!, 16);
    dist += x.toString(2).replace(/0/g, "").length;
  }
  dist += Math.abs(a.length - b.length) * 4;
  return dist;
}

function fileSha256Prefix(absPath: string, n = 12): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(absPath))
    .digest("hex")
    .slice(0, n);
}

export interface LogoHeroHit {
  src: string;
  absPath: string;
  reason: string;
}

const brandLogoHashBySlug = new Map<string, string>();

async function ensureBrandLogoHash(
  brandSlug: string,
  root = process.cwd(),
): Promise<string | null> {
  if (brandLogoHashBySlug.has(brandSlug)) {
    return brandLogoHashBySlug.get(brandSlug)!;
  }
  const brandDir = path.join(root, "public/images/brands");
  const candidates = [
    path.join(brandDir, `${brandSlug}-logo.svg`),
    path.join(brandDir, `${brandSlug}-logo.png`),
    path.join(brandDir, `${brandSlug.replace(/-/g, "")}-logo.svg`),
  ];
  const abs = candidates.find((p) => fs.existsSync(p));
  if (!abs) return null;

  const sharp = requireSharp();
  const tmpDir = path.join(root, "data/staging/_brand-logo-hash");
  fs.mkdirSync(tmpDir, { recursive: true });
  const raster = path.join(tmpDir, `${brandSlug}.png`);
  try {
    await sharp(abs)
      .resize(256, 128, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(raster);
    const hash = await averageHashFile(raster);
    if (hash) brandLogoHashBySlug.set(brandSlug, hash);
    return hash;
  } catch {
    return null;
  }
}

export interface DetectLogoHeroOptions {
  /** Brand slug for same-brand logo compare (e.g. nathan). */
  brandSlug?: string;
  /** Max aHash hamming distance to the brand's own logo. */
  maxBrandHamming?: number;
}

/**
 * True when the hero looks like a brand logo / known CDN logo stub.
 */
export async function detectLogoHero(
  absPath: string,
  src: string,
  options: DetectLogoHeroOptions = {},
): Promise<LogoHeroHit | null> {
  if (!fs.existsSync(absPath)) return null;
  const maxBrandHamming = options.maxBrandHamming ?? 4;

  const sha = fileSha256Prefix(absPath);
  if (KNOWN_LOGO_STUB_SHA256_PREFIXES.has(sha)) {
    return {
      src,
      absPath,
      reason: `Known logo CDN stub (sha256 ${sha}…)`,
    };
  }

  try {
    const sharp = requireSharp();
    const meta = await sharp(absPath).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const bytes = fs.statSync(absPath).size;
    if (w > 0 && h > 0) {
      const area = w * h;
      const ratio = w > h ? w / h : h / w;
      // UI wordmarks / banner logos — not product packshots
      if (bytes < 16_000 && area < 100_000 && ratio >= 2.5) {
        return {
          src,
          absPath,
          reason: `Tiny extreme-aspect asset (${w}×${h}, ${bytes}B) — likely wordmark`,
        };
      }
    }
  } catch {
    // continue
  }

  if (options.brandSlug) {
    const brandHash = await ensureBrandLogoHash(options.brandSlug);
    const heroHash = await averageHashFile(absPath);
    if (brandHash && heroHash) {
      const dist = hammingHex(heroHash, brandHash);
      const bytes = fs.statSync(absPath).size;
      // Same-brand near-duplicate only when the file is also small (logo stub),
      // so detailed packshots that include a logo print do not demote.
      if (dist <= maxBrandHamming && bytes < 80_000) {
        return {
          src,
          absPath,
          reason: `Near-duplicate of ${options.brandSlug} brand logo (hamming ${dist}, ${bytes}B)`,
        };
      }
    }
  }

  return null;
}

export interface LogoScanInput {
  src: string;
  brandSlug?: string;
}

/**
 * Scan hero srcs for logo placeholders. Returns src → reason.
 */
export async function findLogoHeroSrcs(
  rows: LogoScanInput[],
  root = process.cwd(),
): Promise<Map<string, string>> {
  const hits = new Map<string, string>();
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.src?.startsWith("/") || seen.has(row.src)) continue;
    seen.add(row.src);
    const abs = path.join(root, "public", row.src.replace(/^\//, ""));
    const hit = await detectLogoHero(abs, row.src, {
      brandSlug: row.brandSlug,
    });
    if (hit) hits.set(row.src, hit.reason);
  }
  return hits;
}

/** Map brandId → slug for audit wiring. */
export function brandSlugById(): Map<string, string> {
  return new Map(brands.map((b) => [b.id, b.slug]));
}

/**
 * Merge logo-hero src paths into `src/content/logo-hero-src-denylist.ts`
 * so `isAuthenticProductMedia` rejects them at request time.
 */
export function mergeLogoHeroDenylist(
  srcs: string[],
  root = process.cwd(),
): { path: string; added: string[] } {
  const filePath = path.join(root, "src/content/logo-hero-src-denylist.ts");
  const existing = new Set<string>();
  if (fs.existsSync(filePath)) {
    const text = fs.readFileSync(filePath, "utf8");
    for (const m of text.matchAll(/"(\/images\/[^"]+)"/g)) {
      existing.add(m[1]!);
    }
  }
  const added = srcs.filter((s) => s.startsWith("/images/") && !existing.has(s));
  if (added.length === 0) {
    return { path: filePath, added: [] };
  }
  for (const s of added) existing.add(s);
  const sorted = [...existing].sort();
  const body = `/**
 * Product-hero \`src\` paths that are brand logos / wordmarks / logo CDN stubs —
 * not product photography. Populated by media audit logo detection and manual QA.
 *
 * \`isAuthenticProductMedia\` rejects these so hub cards never promote them.
 */
export const LOGO_HERO_SRC_DENYLIST: ReadonlySet<string> = new Set([
${sorted.map((s) => `  ${JSON.stringify(s)},`).join("\n")}
]);
`;
  fs.writeFileSync(filePath, body);
  return { path: filePath, added };
}
