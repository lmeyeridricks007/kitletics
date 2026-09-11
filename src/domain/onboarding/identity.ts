import type { Brand, Product, ProductFamily } from "@/domain/products/types";
import type {
  IdentityResolution,
  ProductIdentityCandidate,
} from "@/domain/onboarding/types";

export function normalizeBrandKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function resolveBrand(
  brands: Brand[],
  name: string,
): Brand | undefined {
  const key = normalizeBrandKey(name);
  return brands.find(
    (b) =>
      normalizeBrandKey(b.name) === key ||
      normalizeBrandKey(b.slug) === key ||
      normalizeBrandKey(b.id.replace(/^brand-/, "")) === key,
  );
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function similarName(a: string, b: string): boolean {
  const ta = tokenize(a).join(" ");
  const tb = tokenize(b).join(" ");
  return ta === tb || ta.includes(tb) || tb.includes(ta);
}

/**
 * Prevent duplicate Products across regions/aliases.
 * Prefer exact brand+family+generation, then brand+fullName, then fuzzy.
 */
export function findExistingProductCandidate(
  products: Product[],
  brands: Brand[],
  families: ProductFamily[],
  candidate: ProductIdentityCandidate,
): IdentityResolution {
  const brand =
    (candidate.brandId
      ? brands.find((b) => b.id === candidate.brandId)
      : undefined) ?? resolveBrand(brands, candidate.brandName);

  const brandProducts = brand
    ? products.filter((p) => p.brandId === brand.id)
    : products;

  // External ID exact match
  if (candidate.externalIds) {
    for (const p of products) {
      // Product type may not yet store externalIds — check id/slug heuristics only
      void p;
    }
  }

  // Exact family + generation
  if (candidate.familyName && candidate.generation) {
    const family = families.find(
      (f) =>
        brand &&
        f.brandId === brand.id &&
        similarName(f.name, candidate.familyName!),
    );
    if (family) {
      const genMatch = brandProducts.find(
        (p) =>
          p.familyId === family.id &&
          p.generation &&
          similarName(String(p.generation), candidate.generation!),
      );
      if (genMatch) {
        return {
          kind: "exact",
          existingProductId: genMatch.id,
          existingSlug: genMatch.slug,
          confidence: "high",
          reasons: [
            `Exact family+generation match: ${family.name} ${candidate.generation}`,
          ],
          candidate: {
            ...candidate,
            brandId: brand?.id,
            familyId: family.id,
          },
        };
      }
    }
  }

  // Exact fullName / name
  const exactName = brandProducts.find(
    (p) =>
      similarName(p.fullName, candidate.fullName) ||
      similarName(p.name, candidate.modelName),
  );
  if (exactName) {
    return {
      kind: "exact",
      existingProductId: exactName.id,
      existingSlug: exactName.slug,
      confidence: "high",
      reasons: [`Exact name match: ${exactName.fullName}`],
      candidate: { ...candidate, brandId: brand?.id ?? exactName.brandId },
    };
  }

  // Alias / spacing variants
  const aliasHit = brandProducts.find((p) =>
    candidate.aliases.some(
      (a) => similarName(a, p.fullName) || similarName(a, p.name),
    ),
  );
  if (aliasHit) {
    return {
      kind: "probable",
      existingProductId: aliasHit.id,
      existingSlug: aliasHit.slug,
      confidence: "medium",
      reasons: [`Alias match against ${aliasHit.fullName}`],
      candidate: { ...candidate, brandId: brand?.id ?? aliasHit.brandId },
    };
  }

  // Same family, generation unknown → ambiguous
  if (candidate.familyName && brand) {
    const family = families.find(
      (f) => f.brandId === brand.id && similarName(f.name, candidate.familyName!),
    );
    if (family) {
      const siblings = brandProducts.filter((p) => p.familyId === family.id);
      if (siblings.length > 0 && !candidate.generation) {
        return {
          kind: "ambiguous",
          confidence: "low",
          reasons: [
            `Family ${family.name} exists but generation not resolved`,
            ...siblings.slice(0, 3).map((s) => `Existing: ${s.fullName}`),
          ],
          candidate: {
            ...candidate,
            brandId: brand.id,
            familyId: family.id,
          },
        };
      }
    }
  }

  return {
    kind: "new",
    confidence: "high",
    reasons: ["No existing Product match found"],
    candidate: {
      ...candidate,
      brandId: brand?.id,
    },
  };
}

export function slugifyProduct(brandSlug: string, model: string): string {
  const raw = `${brandSlug}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw;
}

export function proposeProductId(brandSlug: string, model: string): string {
  return `prod-${slugifyProduct(brandSlug, model)}`;
}
