import type { Product, ProductFamily, ProductVariant } from "@/domain/products/types";
import type {
  AlternativeRelationship,
  Evidence,
  Recommendation,
} from "@/domain/recommendations/types";
import { publishedMeta, SEED_DATES } from "@/content/config";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import type {
  PadelDecisionAttribute,
  PadelDecisionKey,
  PadelEvidenceKind,
  PadelRacketPdpCopy,
} from "@/domain/padel/racket-decision";
import { formatPublicSpecDisplayLabel } from "@/lib/specs/public-label";

export interface RacketDraft {
  id: string;
  slug: string;
  brandId: string;
  familyId: string;
  generation?: string;
  name: string;
  fullName: string;
  /** When true, patch an existing seed/wave product instead of inserting a duplicate. */
  existing?: boolean;
  lifecycle: Product["lifecycleStatus"];
  experienceLevels: Product["experienceLevels"];
  useCaseIds: string[];
  sourceUrl: string;
  sourceName: string;
  shortDescription: string;
  verdict: string;
  specifications: Product["specifications"];
  strengths: string[];
  weaknesses: string[];
  relatedProductIds?: string[];
  alternativeProductIds?: string[];
  copy: Omit<PadelRacketPdpCopy, "productId">;
  attributes: Record<
    PadelDecisionKey,
    { score: number; reasoning: string; kind: PadelEvidenceKind }
  >;
  recs: Array<{
    useCaseId: string;
    score: number;
    explanation: string;
    strengths: string[];
    compromises: string[];
  }>;
  variants?: Array<{
    id: string;
    label: string;
    audience: ProductVariant["audience"];
    attributes: Record<string, string>;
    referenceWeightG?: number;
  }>;
}

const padelSportId = "sport-padel" as const;

const PLACEHOLDER_SVGS = [
  "/images/padel/products/racket-1.svg",
  "/images/padel/products/racket-2.svg",
  "/images/padel/products/racket-3.svg",
  "/images/padel/products/racket-4.svg",
  "/images/padel/products/racket-5.svg",
] as const;

export function placeholderRacketImages(
  productId: string,
  alt: string,
  index: number,
) {
  return [
    {
      id: `img-${productId}`,
      src: PLACEHOLDER_SVGS[index % PLACEHOLDER_SVGS.length]!,
      alt: `${alt} — catalog placeholder — authentic product photograph pending`,
      type: "image" as const,
      source: "Kitletics padel placeholder",
      usageType: "hero" as const,
      licence: "kitletics-owned" as const,
    },
  ];
}

export function racketImages(
  productId: string,
  alt: string,
  index: number,
) {
  const registered = getCatalogProductHeroMedia(productId, alt);
  if (registered?.[0]) return registered;
  return placeholderRacketImages(productId, alt, index);
}

export function stripDeprecatedRacketSpecs(
  specs: Product["specifications"],
): Product["specifications"] {
  const next = { ...specs };
  delete next.powerPositioning;
  delete next.controlPositioning;
  if (next.balance === "head-heavy") next.balance = "high";
  return next;
}

export function toProductPatch(
  draft: RacketDraft,
  imgIndex: number,
): Partial<Product> {
  return {
    slug: draft.slug,
    name: draft.name,
    fullName: draft.fullName,
    familyId: draft.familyId,
    generation: draft.generation,
    lifecycleStatus: draft.lifecycle,
    shortDescription: draft.shortDescription,
    verdict: draft.verdict,
    experienceLevels: draft.experienceLevels,
    useCaseIds: draft.useCaseIds,
    specifications: stripDeprecatedRacketSpecs(draft.specifications),
    strengths: draft.strengths,
    weaknesses: draft.weaknesses,
    relatedProductIds: draft.relatedProductIds ?? [],
    alternativeProductIds: draft.alternativeProductIds ?? [],
    evidenceIds: [`ev-${draft.id}-mfr`, `ev-${draft.id}-editorial`],
    recommendationScore: undefined,
    images: racketImages(draft.id, draft.fullName, imgIndex),
  };
}

export function toProduct(draft: RacketDraft, imgIndex: number): Product {
  return {
    id: draft.id,
    slug: draft.slug,
    brandId: draft.brandId,
    familyId: draft.familyId,
    generation: draft.generation,
    name: draft.name,
    fullName: draft.fullName,
    shortDescription: draft.shortDescription,
    verdict: draft.verdict,
    lifecycleStatus: draft.lifecycle,
    sportIds: [padelSportId],
    disciplineIds: [],
    categoryId: "cat-padel-rackets",
    subcategoryIds: [],
    useCaseIds: draft.useCaseIds,
    specifications: stripDeprecatedRacketSpecs(draft.specifications),
    strengths: draft.strengths,
    weaknesses: draft.weaknesses,
    experienceLevels: draft.experienceLevels,
    images: racketImages(draft.id, draft.fullName, imgIndex),
    videos: [],
    offerIds: [],
    evidenceIds: [`ev-${draft.id}-mfr`, `ev-${draft.id}-editorial`],
    relatedProductIds: draft.relatedProductIds ?? [],
    alternativeProductIds: draft.alternativeProductIds ?? [],
    ...publishedMeta(),
  };
}

export function toEvidence(draft: RacketDraft): Evidence[] {
  return [
    {
      id: `ev-${draft.id}-mfr`,
      type: "manufacturer",
      source: draft.sourceName,
      sourceUrl: draft.sourceUrl,
      summary: `Manufacturer specifications and positioning for ${draft.fullName}. Not a Kitletics lab measurement.`,
      verifiedAt: SEED_DATES.verified,
      confidence: "high",
    },
    {
      id: `ev-${draft.id}-editorial`,
      type: "editorial-research",
      source: "Kitletics padel racket research",
      sourceUrl: draft.sourceUrl,
      summary: `Editorial synthesis of manufacturer specs and specialist range notes for ${draft.fullName}. Not first-hand testing.`,
      verifiedAt: SEED_DATES.verified,
      confidence: "medium",
    },
  ];
}

export function toRecommendations(draft: RacketDraft): Recommendation[] {
  return draft.recs.map((row) => ({
    id: `rec-${draft.id}-${row.useCaseId.replace(/^uc-/, "")}`,
    productId: draft.id,
    sportId: padelSportId,
    useCaseId: row.useCaseId,
    score: row.score,
    factors: (Object.keys(draft.attributes) as PadelDecisionKey[]).map(
      (key) => ({
        key,
        label: formatPublicSpecDisplayLabel(key),
        score: draft.attributes[key].score,
        weight: 1 / 7,
        explanation: draft.attributes[key].reasoning,
      }),
    ),
    strengths: row.strengths,
    compromises: row.compromises,
    explanation: row.explanation,
    evidenceIds: [`ev-${draft.id}-mfr`, `ev-${draft.id}-editorial`],
  }));
}

export function toPdpCopy(draft: RacketDraft): PadelRacketPdpCopy {
  return { productId: draft.id, ...draft.copy };
}

export function toDecisionAttributes(
  draft: RacketDraft,
): PadelDecisionAttribute[] {
  return (Object.keys(draft.attributes) as PadelDecisionKey[]).map((key) => ({
    key,
    score: draft.attributes[key].score,
    reasoning: draft.attributes[key].reasoning,
    evidenceKind: draft.attributes[key].kind,
    evidenceIds: [`ev-${draft.id}-mfr`, `ev-${draft.id}-editorial`],
  }));
}

export function toVariants(draft: RacketDraft): ProductVariant[] {
  return (draft.variants ?? []).map((v) => ({
    id: v.id,
    productId: draft.id,
    label: v.label,
    audience: v.audience,
    attributes: v.attributes,
    referenceWeightG: v.referenceWeightG,
    weightVerified: v.referenceWeightG != null,
    availabilityVerified: false,
  }));
}

export function mergeFamilies(
  drafts: RacketDraft[],
  extra: ProductFamily[],
): ProductFamily[] {
  const byId = new Map<string, ProductFamily>();
  for (const fam of extra) {
    byId.set(fam.id, { ...fam, productIds: [...fam.productIds] });
  }
  for (const d of drafts) {
    const existing = byId.get(d.familyId);
    if (!existing) continue;
    if (!existing.productIds.includes(d.id)) existing.productIds.push(d.id);
  }
  return [...byId.values()];
}

export function toAlternatives(drafts: RacketDraft[]): AlternativeRelationship[] {
  const out: AlternativeRelationship[] = [];
  for (const d of drafts) {
    for (const altId of d.alternativeProductIds ?? []) {
      const type = relationshipFor(d, altId);
      out.push({
        id: `alt-${d.id}-${altId}`,
        sourceProductId: d.id,
        alternativeProductId: altId,
        similarityScore: 78,
        reasons: reasonsFor(type, d.name),
        relationshipType: type,
      });
    }
  }
  return out;
}

function reasonsFor(
  type: AlternativeRelationship["relationshipType"],
  sourceName: string,
): string[] {
  switch (type) {
    case "beginner-friendly":
      return [
        `More forgiving alternative when ${sourceName} punishes late or off-centre contact`,
        "Switch when contact consistency is the weekly problem",
        `Stay with ${sourceName} if your timing already supports its geometry`,
      ];
    case "lighter":
      return [
        `Easier handling alternative when ${sourceName} feels late between balls`,
        "Switch when preparation speed matters more than tip authority",
        `Stay with ${sourceName} if stability on hard contact still wins your week`,
      ];
    case "faster":
      return [
        `More power-oriented alternative when ${sourceName} lacks finishing authority`,
        "Switch when smash output is the shopping trigger",
        `Stay with ${sourceName} if forgiveness still matters more than peak finishers`,
      ];
    case "better-value":
      return [
        `Value alternative with a different job than ${sourceName}`,
        "Switch when price matters and the peer role still fits",
        `Stay with ${sourceName} if the role fit outweighs the price gap`,
      ];
    default:
      return [
        `Peer padel racket with a different job than ${sourceName}`,
        "Switch only when the peer’s role matches your weekly gap",
        `Stay with ${sourceName} when its strengths still cover your use case`,
      ];
  }
}

function relationshipFor(
  d: RacketDraft,
  altId: string,
): AlternativeRelationship["relationshipType"] {
  const alt = altId.toLowerCase();
  if (
    alt.includes("indiga") ||
    alt.includes("comfort-soft") ||
    alt.includes("equation-soft") ||
    alt.includes("match-light")
  ) {
    return "beginner-friendly";
  }
  if (
    alt.includes("ml10") ||
    alt.includes("gravity") ||
    alt.includes("counter") ||
    alt.includes("ctrl")
  ) {
    return "beginner-friendly";
  }
  if (
    alt.includes("light") ||
    alt.includes("motion") ||
    alt.includes("hybrid") ||
    alt.includes("air-")
  ) {
    return "lighter";
  }
  if (
    alt.includes("hack") ||
    alt.includes("attack") ||
    alt.includes("metalbone") ||
    alt.includes("technical-viper") ||
    alt.includes("coello") ||
    alt.includes("bela")
  ) {
    return "faster";
  }
  if (d.useCaseIds.includes("uc-padel-power")) return "faster";
  if (d.useCaseIds.includes("uc-padel-control")) return "beginner-friendly";
  return "better-value";
}
