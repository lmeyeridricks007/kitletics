/**
 * Editorial 43 — catalog-driven Brand Hub decision copy.
 * No corporate history filler; no brand-name-only boilerplate shells.
 */

import type { Brand, Product, ProductFamily } from "@/domain/products/types";
import type { AudienceFit } from "@/domain/products/types";
import type {
  BrandHubPillar,
  BrandHubWhyItem,
  BrandHubFamilyCard,
} from "@/lib/brand-hub/types";

export interface BrandHubEditorialInput {
  brand: Brand;
  products: Product[];
  families: ProductFamily[];
  categories: { id: string; name: string; count: number }[];
  /** Optional hand config overrides */
  editorialSummary?: string;
  howLinesDiffer?: string;
  generationContext?: string;
  pillars?: BrandHubPillar[];
  whyItems?: BrandHubWhyItem[];
  familyDescriptions?: Record<string, string>;
}

export interface BrandFamilyEditorial {
  id: string;
  name: string;
  description: string;
  whoSuits: string;
  generationLabel?: string;
  currentProductId?: string;
  currentProductSlug?: string;
}

export interface BrandHubEditorial {
  summary: string;
  overviewBlurb: string;
  aboutBody: string;
  pillars: BrandHubPillar[];
  whyItems: BrandHubWhyItem[];
  familyEditorials: BrandFamilyEditorial[];
  howLinesDiffer: string;
  generationContext: string;
  guideSlugs: string[];
  audienceFits: AudienceFit[];
  decisionDepthOk: boolean;
}

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function lowerLead(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function topStrengths(products: Product[], n = 4): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of products) {
    for (const s of p.strengths ?? []) {
      const key = s.toLowerCase().slice(0, 48);
      if (seen.has(key) || s.trim().length < 8) continue;
      seen.add(key);
      out.push(s.trim());
      if (out.length >= n) return out;
    }
  }
  return out;
}

function currentProducts(products: Product[]): Product[] {
  return products.filter((p) => p.lifecycleStatus === "current");
}

function previousProducts(products: Product[]): Product[] {
  return products.filter((p) => p.lifecycleStatus === "previous-generation");
}

function primaryCategoryName(
  categories: BrandHubEditorialInput["categories"],
): string {
  return categories[0]?.name ?? "sport equipment";
}

function guideSlugsForCategories(categoryIds: string[]): string[] {
  const slugs: string[] = [];
  const push = (s: string) => {
    if (!slugs.includes(s)) slugs.push(s);
  };
  for (const id of categoryIds) {
    if (id === "cat-running-shoes" || id.includes("shoe")) {
      push("how-to-choose-running-shoes");
      push("what-is-a-daily-trainer");
    }
    if (id === "cat-gps-watches") push("how-to-choose-running-watch");
    if (id === "cat-hrm") push("how-to-choose-heart-rate-monitor");
    if (id === "cat-hydration" || id === "cat-packs-vests") {
      push("how-to-choose-running-hydration-vest");
    }
    if (id.includes("headlamp")) push("how-to-choose-running-headlamp");
    if (id === "cat-training-shoes") push("how-to-choose-training-shoes");
    if (id.includes("padel")) push("how-to-choose-a-padel-racket");
    if (id.includes("tennis")) push("how-to-choose-a-tennis-racket");
    if (
      id.includes("rack") ||
      id.includes("dumbbell") ||
      id.includes("pull-up") ||
      id.includes("parallette") ||
      id.includes("gymnastic") ||
      id.includes("weighted-vest")
    ) {
      push("how-to-build-a-home-gym");
    }
  }
  return slugs.slice(0, 3);
}

function familyRole(fam: ProductFamily, products: Product[]): {
  description: string;
  whoSuits: string;
  generationLabel?: string;
  current?: Product;
} {
  const members = fam.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  const current =
    members.find((p) => p.lifecycleStatus === "current") ?? members[0];
  const previous = members.find(
    (p) => p.lifecycleStatus === "previous-generation",
  );
  const strength = current?.strengths?.[0] ?? fam.description ?? "";
  const weak = current?.weaknesses?.[0];
  const description = strength
    ? `${fam.name} line: ${clip(strength, 110)}${weak ? ` Trade-off: ${clip(lowerLead(weak), 70)}.` : ""}`
    : fam.description?.trim() ||
      `${fam.name} products in the ${current?.name ?? "current"} generation on Kitletics.`;
  const whoSuits = current?.useCaseIds?.[0]
    ? `Best when your week matches ${current.useCaseIds[0].replace(/^uc-/, "").replace(/-/g, " ")} more than other ${fam.name} jobs.`
    : `Choose ${fam.name} when ${clip(lowerLead(strength || fam.name), 90)} is the weekly filter.`;
  const generationLabel = current
    ? previous
      ? `Current: ${current.name} · prior: ${previous.name}`
      : `Current generation: ${current.name}`
    : undefined;
  return { description, whoSuits, generationLabel, current };
}

/**
 * Minimum depth for a useful Brand Hub (not a thin SEO stub).
 */
export function brandHasDecisionDepth(input: {
  productCount: number;
  categoryCount: number;
  familyCount: number;
  strengthSignalCount: number;
}): boolean {
  const { productCount, categoryCount, familyCount, strengthSignalCount } =
    input;
  if (productCount < 3) return false;
  if (productCount >= 5) return true;
  if (categoryCount >= 2) return true;
  if (familyCount >= 1 && strengthSignalCount >= 2) return true;
  if (strengthSignalCount >= 3) return true;
  return false;
}

export function buildBrandHubEditorial(
  input: BrandHubEditorialInput,
): BrandHubEditorial {
  const { brand, products, families, categories } = input;
  const catNames = categories.map((c) => c.name);
  const catIds = categories.map((c) => c.id);
  const primary = primaryCategoryName(categories);
  const strengths = topStrengths(products);
  const current = currentProducts(products);
  const previous = previousProducts(products);
  const familyEditorials: BrandFamilyEditorial[] = families.map((fam) => {
    const role = familyRole(fam, products);
    const override = input.familyDescriptions?.[fam.id];
    return {
      id: fam.id,
      name: fam.name,
      description: override ?? role.description,
      whoSuits: role.whoSuits,
      generationLabel: role.generationLabel,
      currentProductId: role.current?.id,
      currentProductSlug: role.current?.slug,
    };
  });

  const strengthSignalCount = products.filter(
    (p) => (p.strengths?.length ?? 0) > 0,
  ).length;

  const decisionDepthOk = brandHasDecisionDepth({
    productCount: products.length,
    categoryCount: categories.length,
    familyCount: families.length,
    strengthSignalCount,
  });

  const familyNames = familyEditorials.map((f) => f.name).slice(0, 5);
  const howLinesDiffer =
    input.howLinesDiffer?.trim() ||
    (familyEditorials.length >= 2
      ? `${brand.name} lines split by job: ${familyEditorials
          .slice(0, 4)
          .map((f) => `${f.name} (${clip(f.description.replace(/^[^:]+:\s*/, ""), 60)})`)
          .join("; ")}. Pick the family whose weekly use case matches — not the loudest model name.`
      : familyEditorials.length === 1
        ? `${brand.name} is concentrated in the ${familyEditorials[0]!.name} family on Kitletics. Compare generations inside that line before jumping brands.`
        : `${brand.name} products on Kitletics sit mainly in ${catNames.slice(0, 3).join(", ") || primary}. Compare by use case and current-generation status rather than brand loyalty alone.`);

  const generationContext =
    input.generationContext?.trim() ||
    (current.length > 0
      ? `${current.length} current-generation product${current.length === 1 ? "" : "s"} in catalog${
          previous.length
            ? `; ${previous.length} previous-generation option${previous.length === 1 ? "" : "s"} when value or familiarity matters`
            : ""
        }. Prefer current unless a prior model still matches your sessions and street price.`
      : `Generation labels are thin for ${brand.name} on Kitletics — verify lifecycle on each Product page before buying.`);

  const productCues = products
    .slice(0, 5)
    .map((p) => {
      const cue =
        p.strengths?.[0] ||
        p.shortDescription?.split(".")[0] ||
        p.name;
      return `${p.name} (${clip(cue, 48)})`;
    })
    .join("; ");

  const summary =
    input.editorialSummary?.trim() ||
    `${brand.name} on Kitletics covers ${catNames.slice(0, 3).join(", ") || primary} (${products.length} products)${
      familyNames.length
        ? ` across families like ${familyNames.join(", ")}`
        : ""
    }. Catalog cues: ${productCues}. ${
      strengths[0]
        ? `Recurring strengths include ${lowerLead(strengths[0])}`
        : `Shop by category role and current generation`
    }${strengths[1] ? `, plus ${lowerLead(strengths[1])}` : ""}. Use family roles and reviews below to decide which line fits — not a manufacturer slogan page.`;

  const overviewBlurb = `${brand.name} buyer map: ${products.length} products · ${categories.length} categor${
    categories.length === 1 ? "y" : "ies"
  }${familyNames.length ? ` · key lines ${familyNames.slice(0, 3).join(", ")}` : ""}. Standouts: ${clip(productCues, 140)}. ${clip(howLinesDiffer, 120)}`;

  const aboutParts: string[] = [
    summary,
    howLinesDiffer,
    generationContext,
  ];
  // History only when it helps equipment context (long-running footwear / tooling credibility)
  if (
    brand.foundedYear &&
    brand.foundedYear <= 1995 &&
    (primary.toLowerCase().includes("shoe") ||
      primary.toLowerCase().includes("rack") ||
      primary.toLowerCase().includes("watch"))
  ) {
    aboutParts.push(
      `Founded ${brand.foundedYear}${brand.country ? ` (${brand.country})` : ""} — useful as context for a long product-family tree, not as a reason to buy.`,
    );
  }
  const aboutBody = aboutParts.join(" ");

  const pillars: BrandHubPillar[] =
    input.pillars && input.pillars.length > 0
      ? input.pillars
      : [
          {
            id: "cats",
            title: catNames.slice(0, 2).join(" · ") || primary,
            description: `${categories.map((c) => `${c.count} in ${c.name}`).slice(0, 3).join("; ")}.`,
            icon: "layers",
          },
          {
            id: "families",
            title:
              familyNames.length > 0
                ? `${familyNames.length} product famil${familyNames.length === 1 ? "y" : "ies"}`
                : `${current.length || products.length} current models`,
            description:
              familyNames.length > 0
                ? `Lines include ${familyNames.slice(0, 4).join(", ")}.`
                : generationContext.slice(0, 120),
            icon: "route",
          },
          {
            id: "fit",
            title: strengths[0]
              ? clip(strengths[0], 42)
              : "Decision-led catalog",
            description: strengths[1]
              ? `Also: ${clip(strengths[1], 90)}`
              : `Compare ${brand.name} by use case on Kitletics — not by brand story.`,
            icon: "flag",
          },
        ];

  const whyItems: BrandHubWhyItem[] =
    input.whyItems && input.whyItems.length > 0
      ? input.whyItems
      : [
          ...categories.slice(0, 2).map((c) => ({
            id: `cat-${c.id}`,
            label: `${c.count} ${c.name} product${c.count === 1 ? "" : "s"} on Kitletics`,
          })),
          ...familyNames.slice(0, 2).map((name, i) => ({
            id: `fam-${i}`,
            label: `${name} family with a distinct training/race role`,
          })),
          ...strengths.slice(0, 2).map((s, i) => ({
            id: `str-${i}`,
            label: clip(s, 72),
          })),
          {
            id: "gen",
            label: generationContext.split(".")[0] ?? "Current-generation context on Product pages",
          },
        ].slice(0, 5);

  // Audience fits present on any product via catalog conventions — resolved later with variants
  const audienceFits: AudienceFit[] = [];

  return {
    summary: clip(summary, 420),
    overviewBlurb: clip(overviewBlurb, 280),
    aboutBody: clip(aboutBody, 900),
    pillars,
    whyItems,
    familyEditorials,
    howLinesDiffer,
    generationContext,
    guideSlugs: guideSlugsForCategories(catIds),
    audienceFits,
    decisionDepthOk,
  };
}

export function toFamilyCards(
  editorials: BrandFamilyEditorial[],
  mediaByProductId: Map<string, { src: string; alt: string } | undefined>,
): BrandHubFamilyCard[] {
  return editorials.map((f) => ({
    id: f.id,
    name: f.name,
    description: [f.description, f.whoSuits, f.generationLabel]
      .filter(Boolean)
      .join(" "),
    href: f.currentProductSlug
      ? `/products/${f.currentProductSlug}`
      : "#families",
    image: f.currentProductId
      ? mediaByProductId.get(f.currentProductId)
      : undefined,
    whoSuits: f.whoSuits,
    generationLabel: f.generationLabel,
  }));
}

/** Category ids → default guide image map */
export const BRAND_HUB_GUIDE_IMAGES: Record<string, string> = {
  "how-to-choose-running-shoes": "/images/home/guide-running-shoes.jpg",
  "what-is-a-daily-trainer": "/images/running/guides/daily-vs-long.jpg",
  "how-to-choose-running-watch":
    "/images/watches/products/garmin-forerunner-970-hero.jpg",
  "how-to-choose-heart-rate-monitor":
    "/images/hrm/products/polar-h10-hero.png",
  "how-to-choose-running-hydration-vest":
    "/images/packs/products/salomon-adv-skin-12-hero.jpg",
  "how-to-choose-running-headlamp":
    "/images/headlamps/products/petzl-swift-rl-hero.jpg",
  "how-to-choose-training-shoes":
    "/images/training/guides/concepts/cross-training-shoe-gym.jpg",
  "how-to-choose-a-padel-racket": "/images/home/guide-how-to-choose.jpg",
  "how-to-choose-a-tennis-racket": "/images/home/guide-tennis.jpg",
  "how-to-build-a-home-gym": "/images/home/guide-home-gym.jpg",
  "how-to-choose-a-power-rack": "/images/home/guide-home-gym.jpg",
};
