import type {
  DiscoveryCandidate,
  ResearchProvider,
  ResearchProviderResult,
} from "@/domain/onboarding/types";

/** Deterministic fixture provider — no live network */
export function createFixtureResearchProvider(
  result: ResearchProviderResult,
): ResearchProvider {
  return {
    id: "fixture",
    async research() {
      return result;
    },
  };
}

export const FIXTURE_NOVABLAST_7: ResearchProviderResult = {
  sources: [
    {
      url: "https://www.asics.com/us/en-us/novablast-7",
      domain: "asics.com",
      sourceType: "manufacturer",
      title: "ASICS Novablast 7",
      publisher: "ASICS",
      retrievedAt: "2026-08-30T10:00:00.000Z",
      authorityLevel: "primary",
    },
    {
      url: "https://www.example-retailer.test/asics-novablast-7",
      domain: "example-retailer.test",
      sourceType: "retailer",
      title: "Novablast 7 listing",
      retrievedAt: "2026-08-30T10:00:00.000Z",
      authorityLevel: "secondary",
    },
  ],
  facts: [
    {
      field: "weight",
      rawValue: 255,
      unit: "g",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
      context: "US Men's 9",
    },
    {
      field: "drop",
      rawValue: 8,
      unit: "mm",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "heelStack",
      rawValue: 41.5,
      unit: "mm",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "forefootStack",
      rawValue: 33.5,
      unit: "mm",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "cushionLevel",
      rawValue: "high",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "medium",
    },
    {
      field: "stability",
      rawValue: "neutral",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "terrain",
      rawValue: "road",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "plateMaterial",
      rawValue: "none",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "shortDescription",
      rawValue:
        "Neutral daily trainer with energetic FF BLAST cushioning for easy and long road miles.",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "medium",
      notes: "Editorial paraphrase required — do not copy manufacturer marketing verbatim",
    },
  ],
  media: [
    {
      src: "https://www.asics.com/media/novablast-7-hero.jpg",
      alt: "ASICS Novablast 7 running shoe",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      usageType: "hero",
      width: 1200,
      height: 1200,
      generationHint: "7",
    },
  ],
  identityHints: {
    brandName: "ASICS",
    modelName: "Novablast 7",
    fullName: "ASICS Novablast 7",
    familyName: "Novablast",
    generation: "7",
    categorySlug: "running-shoes",
    officialUrl: "https://www.asics.com/us/en-us/novablast-7",
    lifecycleHint: "current",
    aliases: ["Novablast7", "Nova blast 7"],
  },
};

/** Conflicting weight: manufacturer vs retailer without size context */
export const FIXTURE_CONFLICT_WEIGHT: ResearchProviderResult = {
  sources: [
    {
      url: "https://www.asics.com/us/en-us/novablast-7",
      domain: "asics.com",
      sourceType: "manufacturer",
      retrievedAt: "2026-08-30T10:00:00.000Z",
      authorityLevel: "primary",
    },
    {
      url: "https://www.example-retailer.test/asics-novablast-7",
      domain: "example-retailer.test",
      sourceType: "retailer",
      retrievedAt: "2026-08-30T10:00:00.000Z",
      authorityLevel: "secondary",
    },
  ],
  facts: [
    {
      field: "weight",
      rawValue: 255,
      unit: "g",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
      context: "US Men's 9",
    },
    {
      field: "weight",
      rawValue: 270,
      unit: "g",
      sourceUrl: "https://www.example-retailer.test/asics-novablast-7",
      confidence: "medium",
      context: "unspecified size",
    },
    {
      field: "drop",
      rawValue: 8,
      unit: "mm",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "cushionLevel",
      rawValue: "high",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "medium",
    },
    {
      field: "stability",
      rawValue: "neutral",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "terrain",
      rawValue: "road",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
    {
      field: "plateMaterial",
      rawValue: "none",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      confidence: "high",
    },
  ],
  media: [],
  identityHints: {
    brandName: "ASICS",
    modelName: "Novablast 7",
    fullName: "ASICS Novablast 7",
    familyName: "Novablast",
    generation: "7",
    officialUrl: "https://www.asics.com/us/en-us/novablast-7",
  },
};

export const FIXTURE_OVERSIZED_MEDIA: ResearchProviderResult = {
  ...FIXTURE_NOVABLAST_7,
  media: [
    {
      src: "https://www.asics.com/media/novablast-7-hero.png",
      alt: "ASICS Novablast 7 running shoe",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      usageType: "hero",
      width: 5000,
      height: 5000,
      generationHint: "7",
    },
  ],
};

export const FIXTURE_WRONG_GENERATION_MEDIA: ResearchProviderResult = {
  ...FIXTURE_NOVABLAST_7,
  media: [
    {
      src: "https://www.asics.com/media/novablast-5-hero.jpg",
      alt: "ASICS Novablast 5",
      sourceUrl: "https://www.asics.com/us/en-us/novablast-7",
      usageType: "hero",
      generationHint: "5",
    },
  ],
};

export const FIXTURE_ASICS_LINEUP: DiscoveryCandidate[] = [
  {
    brandName: "ASICS",
    modelName: "Novablast 6",
    fullName: "ASICS Novablast 6",
    familyName: "Novablast",
    generation: "6",
    categorySlug: "running-shoes",
    priority: "LOW",
    reason: "Already expected in catalog",
    kind: "existing",
  },
  {
    brandName: "ASICS",
    modelName: "Novablast 7",
    fullName: "ASICS Novablast 7",
    familyName: "Novablast",
    generation: "7",
    categorySlug: "running-shoes",
    priority: "HIGH",
    reason:
      "Current generation of major daily trainer family; Kitletics may only have previous generation",
    kind: "new-generation",
  },
  {
    brandName: "ASICS",
    modelName: "GEL-Nimbus 28",
    fullName: "ASICS GEL-Nimbus 28",
    familyName: "GEL-Nimbus",
    generation: "28",
    categorySlug: "running-shoes",
    priority: "MEDIUM",
    reason: "Max-cushion family generation check",
    kind: "new",
  },
];

/** Minimal Padel fixture for multi-sport abstraction test */
export const FIXTURE_PADEL_RACKET: ResearchProviderResult = {
  sources: [
    {
      url: "https://www.bullpadel.com/vertex-05",
      domain: "bullpadel.com",
      sourceType: "manufacturer",
      retrievedAt: "2026-08-30T10:00:00.000Z",
      authorityLevel: "primary",
    },
  ],
  facts: [
    {
      field: "shape",
      rawValue: "diamond",
      sourceUrl: "https://www.bullpadel.com/vertex-05",
      confidence: "high",
    },
    {
      field: "balance",
      rawValue: "head-heavy",
      sourceUrl: "https://www.bullpadel.com/vertex-05",
      confidence: "medium",
    },
    {
      field: "weight",
      rawValue: 365,
      unit: "g",
      sourceUrl: "https://www.bullpadel.com/vertex-05",
      confidence: "high",
    },
  ],
  media: [],
  identityHints: {
    brandName: "Bullpadel",
    modelName: "Vertex 05",
    fullName: "Bullpadel Vertex 05",
    categorySlug: "padel-rackets",
  },
};
