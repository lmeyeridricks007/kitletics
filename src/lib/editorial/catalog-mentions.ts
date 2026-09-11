import type { Product } from "@/domain/products/types";
import { getBrandById, getBrands, getProducts } from "@/repositories";

export type CatalogMentionKind = "brand" | "product";

export type TextSegment =
  | { type: "text"; value: string }
  | {
      type: "link";
      value: string;
      href: string;
      kind: CatalogMentionKind;
    };

type MentionEntry = {
  label: string;
  href: string;
  kind: CatalogMentionKind;
  priority: number;
};

export type CatalogMentionOptions = {
  /** Do not link the product under review (avoids self-links in every paragraph). */
  excludeProductIds?: string[];
  excludeBrandIds?: string[];
  /** Alternatives / peers — get short-name aliases (e.g. "Pegasus"). */
  preferProductIds?: string[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasesForProduct(product: Product, aggressive: boolean): string[] {
  const out = new Set<string>();
  const full = product.fullName?.trim();
  const name = product.name?.trim();
  if (full) out.add(full);
  if (name) out.add(name);

  const brand = getBrandById(product.brandId);
  if (brand?.name && full?.toLowerCase().startsWith(brand.name.toLowerCase())) {
    const rest = full.slice(brand.name.length).trim();
    if (rest.length >= 4) out.add(rest);
  }

  if (aggressive && name) {
    const base = name
      .replace(/\s+v\d+\b/i, "")
      .replace(/\s+\d+(\.\d+)?\b/, "")
      .trim();
    if (base.length >= 5) out.add(base);
    // "GEL-Kayano" / "Fresh Foam X 1080" → last meaningful token
    const token = base.split(/[\s-]+/).filter(Boolean).pop();
    if (token && token.length >= 5) out.add(token);
  }

  return [...out].filter((a) => a.length >= 3);
}

function buildMentionIndex(options?: CatalogMentionOptions): MentionEntry[] {
  const excludeProducts = new Set(options?.excludeProductIds ?? []);
  const excludeBrands = new Set(options?.excludeBrandIds ?? []);
  const prefer = options?.preferProductIds ?? [];
  const preferRank = new Map(prefer.map((id, i) => [id, prefer.length - i]));

  const byLabel = new Map<string, MentionEntry>();

  const upsert = (entry: MentionEntry) => {
    const key = entry.label.toLowerCase();
    const existing = byLabel.get(key);
    if (!existing || entry.priority > existing.priority) {
      byLabel.set(key, entry);
    }
  };

  for (const product of getProducts({ isDev: true })) {
    if (excludeProducts.has(product.id)) continue;
    const aggressive = preferRank.has(product.id);
    const priority =
      (preferRank.get(product.id) ?? 0) * 100 +
      (product.recommendationScore ?? 0) +
      product.fullName.length;
    for (const label of aliasesForProduct(product, aggressive)) {
      upsert({
        label,
        href: `/products/${product.slug}`,
        kind: "product",
        priority,
      });
    }
  }

  for (const brand of getBrands({ isDev: true })) {
    if (excludeBrands.has(brand.id)) continue;
    const name = brand.name?.trim();
    // Skip tiny names ("On") that collide with English words.
    if (!name || name.length < 3) continue;
    upsert({
      label: name,
      href: `/brands/${brand.slug}`,
      kind: "brand",
      priority: 40 + name.length,
    });
  }

  return [...byLabel.values()].sort((a, b) => b.label.length - a.label.length);
}

/**
 * Split plain editorial text into text/link segments for catalog brands & products.
 * Longest match wins; first occurrence of each span is linked once per pass.
 */
export function segmentCatalogMentions(
  text: string,
  options?: CatalogMentionOptions,
): TextSegment[] {
  if (!text) return [];
  const mentions = buildMentionIndex(options);
  if (mentions.length === 0) return [{ type: "text", value: text }];

  const pattern = new RegExp(
    `(?<![A-Za-z0-9])(${mentions.map((m) => escapeRegExp(m.label)).join("|")})(?![A-Za-z0-9])`,
    "gi",
  );
  const byLower = new Map(mentions.map((m) => [m.label.toLowerCase(), m]));

  const segments: TextSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const raw = match[1];
    if (!raw) continue;
    const index = match.index ?? 0;
    const entry = byLower.get(raw.toLowerCase());
    if (!entry) continue;
    if (index > last) {
      segments.push({ type: "text", value: text.slice(last, index) });
    }
    segments.push({
      type: "link",
      value: raw,
      href: entry.href,
      kind: entry.kind,
    });
    last = index + raw.length;
  }
  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }
  return segments.length ? segments : [{ type: "text", value: text }];
}
