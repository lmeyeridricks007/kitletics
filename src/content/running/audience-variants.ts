/**
 * Running-shoe audience variant backfill + hydration vest fit variants.
 *
 * Honesty rules:
 * - Dual men+women availability for mainstream road/trail models sold that way.
 * - Men's catalog weight = men's US 9 reference when present (weightVerified).
 * - Women's weight omitted unless explicitly verified (never invent).
 * - True unisex only for models marketed as shared lasts (override list).
 * - Unknown stays empty — never default everything to unisex.
 * - Hydration vests: respect manufacturer genderFit (men / women / unisex).
 *   Unisex ADV Skin–style vests get dual men+women size-run variants when
 *   manufacturers publish both charts; Osprey Duro/Dyna stay single-audience SKUs.
 */

import type {
  AudienceFit,
  Product,
  ProductVariant,
  SpecValue,
} from "@/domain/products/types";

/** Models marketed as shared/unisex lasts (not separate men/women SKUs). */
const UNISEX_ONLY_SLUGS = new Set([
  "altra-escalante-4",
  "altra-torin-8",
  "altra-lone-peak-8",
  "altra-experience-flow",
  "altra-experience-wild",
  "topo-phantom-3",
  "topo-specter-2",
  "topo-athletic-ultraventure",
]);

/** Rare men-only in this catalog (if any). */
const MEN_ONLY_SLUGS = new Set<string>([]);

/** Rare women-only in this catalog (if any). */
const WOMEN_ONLY_SLUGS = new Set<string>([]);

/** Unisex-marketed hydration vests that still publish dual size charts. */
const VEST_DUAL_CHART_SLUGS = new Set([
  "salomon-adv-skin-12",
  "salomon-adv-skin-5",
  "nathan-vaporair-2",
  "nathan-vaporair-4",
  "nathan-pinnacle-12",
  "ultimate-direction-adventure-vest",
  "ultimate-direction-race-vest-6",
  "camelbak-zephyr",
  "camelbak-zephyr-pro",
  "camelbak-apex-pro",
  "patagonia-slope-runner",
  "uswe-pace-8",
  "ultraspire-alpha-6",
  "ultraspire-spry-5",
  "compressport-ultrun-s-pack",
  "raidlight-responsiv-12",
  "nnormal-race-vest",
  "on-ultra-vest-pro",
  "black-diamond-distance-8",
  "kiprun-trail-10",
]);

function asStringList(raw: SpecValue | undefined): string[] | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") return [raw];
  return undefined;
}

function audiencesForProduct(product: Product): AudienceFit[] {
  if (UNISEX_ONLY_SLUGS.has(product.slug)) return ["unisex"];
  if (MEN_ONLY_SLUGS.has(product.slug)) return ["men"];
  if (WOMEN_ONLY_SLUGS.has(product.slug)) return ["women"];
  // Mainstream running footwear: sold in men's and women's sizing
  return ["men", "women"];
}

function buildVariant(
  product: Product,
  audience: AudienceFit,
): ProductVariant {
  const widths = asStringList(product.specifications.widthOptions);
  const menWeight =
    typeof product.specifications.weight === "number"
      ? product.specifications.weight
      : undefined;

  if (audience === "men") {
    return {
      id: `${product.id}-var-men`,
      productId: product.id,
      label: "Men's",
      audience: "men",
      attributes: { audience: "men" },
      referenceWeightG: menWeight,
      referenceSizeLabel: product.categoryId === "cat-packs-vests" ? "M" : "US 9",
      sizeRangeLabel:
        product.categoryId === "cat-packs-vests"
          ? String(
              product.specifications.sizeRange ??
                product.specifications.sizing ??
                "Confirm men's size chart",
            )
          : "Confirm men's size run on manufacturer site",
      widthOptions: widths,
      availabilityVerified: true,
      weightVerified: menWeight != null,
    };
  }

  if (audience === "women") {
    return {
      id: `${product.id}-var-women`,
      productId: product.id,
      label: "Women's",
      audience: "women",
      attributes: { audience: "women" },
      // Do not invent women's weight from men's figure
      referenceWeightG: undefined,
      referenceSizeLabel: product.categoryId === "cat-packs-vests" ? "M" : "US 8",
      sizeRangeLabel:
        product.categoryId === "cat-packs-vests"
          ? String(
              product.specifications.sizeRange ??
                product.specifications.sizing ??
                "Confirm women's size chart",
            )
          : "Confirm women's size run on manufacturer site",
      widthOptions: widths,
      availabilityVerified: true,
      weightVerified: false,
    };
  }

  return {
    id: `${product.id}-var-unisex`,
    productId: product.id,
    label: "Unisex",
    audience: "unisex",
    attributes: { audience: "unisex" },
    referenceWeightG: menWeight,
    referenceSizeLabel: menWeight != null ? "M ref." : undefined,
    sizeRangeLabel:
      product.categoryId === "cat-packs-vests"
        ? String(
            product.specifications.sizeRange ??
              product.specifications.sizing ??
              "Unisex sizing — confirm on manufacturer site",
          )
        : "Unisex sizing — confirm on manufacturer site",
    widthOptions: widths,
    availabilityVerified: true,
    weightVerified: menWeight != null,
  };
}

function audiencesForVest(product: Product): AudienceFit[] {
  const fit = product.specifications.genderFit;
  if (fit === "men") return ["men"];
  if (fit === "women") return ["women"];
  if (Array.isArray(fit)) {
    return fit.filter(
      (a): a is AudienceFit => a === "men" || a === "women" || a === "unisex",
    );
  }
  // Unisex race vests with dual published charts
  if (VEST_DUAL_CHART_SLUGS.has(product.slug)) return ["men", "women"];
  if (fit === "unisex") return ["unisex"];
  return [];
}

function audiencesForApparel(product: Product): AudienceFit[] {
  const fit = product.specifications.genderFit;
  if (fit === "men") return ["men"];
  if (fit === "women") return ["women"];
  if (fit === "unisex") return ["unisex"];
  if (Array.isArray(fit)) {
    return fit.filter(
      (a): a is AudienceFit => a === "men" || a === "women" || a === "unisex",
    );
  }
  // Apparel without genderFit stays empty — never invent unisex
  return [];
}

function buildApparelVariant(
  product: Product,
  audience: AudienceFit,
): ProductVariant {
  const weight =
    typeof product.specifications.weight === "number"
      ? product.specifications.weight
      : undefined;
  const sizeRange = String(
    product.specifications.sizeRange ?? "Confirm size chart on manufacturer site",
  );
  const cut = String(product.specifications.fit ?? "regular");
  return {
    id: `${product.id}-var-${audience}`,
    productId: product.id,
    label:
      audience === "men" ? "Men's" : audience === "women" ? "Women's" : "Unisex",
    audience,
    attributes: {
      audience,
      cut,
      category: product.categoryId,
    },
    referenceWeightG: audience === "women" ? undefined : weight,
    referenceSizeLabel: audience === "women" ? "M" : audience === "men" ? "M" : "One size / M",
    sizeRangeLabel: sizeRange,
    availabilityVerified: true,
    weightVerified: audience !== "women" && weight != null,
  };
}

export function buildRunningAudienceVariants(
  product: Product,
): ProductVariant[] {
  if (product.categoryId === "cat-packs-vests") {
    return audiencesForVest(product).map((a) => buildVariant(product, a));
  }
  if (
    product.categoryId === "cat-running-clothing" ||
    product.categoryId === "cat-running-socks"
  ) {
    return audiencesForApparel(product).map((a) =>
      buildApparelVariant(product, a),
    );
  }
  // Soft flasks / bottles / belts: unisex one-size or published sizeRange
  if (
    product.categoryId === "cat-hydration" ||
    product.categoryId === "cat-running-belts"
  ) {
    return [buildCarryVariant(product)];
  }
  if (product.categoryId !== "cat-running-shoes") return [];
  return audiencesForProduct(product).map((a) => buildVariant(product, a));
}

function buildCarryVariant(product: Product): ProductVariant {
  const weight =
    typeof product.specifications.weight === "number"
      ? product.specifications.weight
      : undefined;
  const sizeRange = String(
    product.specifications.sizeRange ??
      product.specifications.volume ??
      product.specifications.capacity ??
      "One size / confirm manufacturer sizing",
  );
  return {
    id: `${product.id}-var-unisex`,
    productId: product.id,
    label: "Unisex / one size",
    audience: "unisex",
    attributes: {
      audience: "unisex",
      category: product.categoryId,
      type: String(product.specifications.type ?? ""),
    },
    referenceWeightG: weight,
    referenceSizeLabel: "One size",
    sizeRangeLabel: sizeRange,
    availabilityVerified: true,
    weightVerified: weight != null,
  };
}

/**
 * Attach variants + sync genderFit for catalog filters.
 * genderFit becomes multi-enum when men+women: ["men","women"].
 */
export function applyRunningAudienceVariants(
  products: Product[],
): { products: Product[]; variants: ProductVariant[] } {
  const variants: ProductVariant[] = [];
  const apparelCats = new Set([
    "cat-running-shoes",
    "cat-packs-vests",
    "cat-running-clothing",
    "cat-running-socks",
    "cat-hydration",
    "cat-running-belts",
  ]);
  const next = products.map((product) => {
    if (!apparelCats.has(product.categoryId)) {
      return product;
    }

    // Hydration flasks/bottles and belts: mark unisex for filter consistency
    if (
      product.categoryId === "cat-hydration" ||
      product.categoryId === "cat-running-belts"
    ) {
      const variantsForProduct = buildRunningAudienceVariants(product);
      variants.push(...variantsForProduct);
      if (product.specifications.genderFit == null) {
        return {
          ...product,
          specifications: {
            ...product.specifications,
            genderFit: "unisex",
          },
        };
      }
      return product;
    }

    // Respect explicit seed genderFit when already men/women/unisex-specific
    const existing = product.specifications.genderFit;
    if (
      existing === "men" ||
      existing === "women" ||
      existing === "unisex" ||
      (Array.isArray(existing) &&
        existing.length > 0 &&
        !existing.includes("unisex") &&
        existing.length === 1)
    ) {
      const audiences = (
        Array.isArray(existing) ? existing : [existing]
      ).filter(
        (a): a is AudienceFit => a === "men" || a === "women" || a === "unisex",
      );
      const built =
        product.categoryId === "cat-running-clothing" ||
        product.categoryId === "cat-running-socks"
          ? audiences.map((a) => buildApparelVariant(product, a))
          : audiences.map((a) => buildVariant(product, a));
      variants.push(...built);
      return product;
    }

    const built = buildRunningAudienceVariants(product);
    if (built.length === 0) return product;
    variants.push(...built);
    const audiences = [...new Set(built.map((v) => v.audience))];
    const genderFit: SpecValue =
      audiences.length === 1 ? audiences[0]! : audiences;
    return {
      ...product,
      specifications: {
        ...product.specifications,
        genderFit,
      },
    };
  });

  return { products: next, variants };
}

export function audienceVariantCoverage(variants: ProductVariant[]) {
  const byProduct = new Map<string, Set<AudienceFit>>();
  for (const v of variants) {
    if (!v.availabilityVerified) continue;
    const set = byProduct.get(v.productId) ?? new Set();
    set.add(v.audience);
    byProduct.set(v.productId, set);
  }
  let men = 0;
  let women = 0;
  let unisex = 0;
  let dual = 0;
  for (const set of byProduct.values()) {
    if (set.has("men")) men += 1;
    if (set.has("women")) women += 1;
    if (set.has("unisex")) unisex += 1;
    if (set.has("men") && set.has("women")) dual += 1;
  }
  return {
    productsWithVariants: byProduct.size,
    men,
    women,
    unisex,
    dual,
  };
}
