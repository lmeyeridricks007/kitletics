/**
 * Fix 69 — current NNormal trail shoes (Kjerag 02, Tomir 02).
 * Specs from manufacturer pages 2026-09-10. Conflicts are not averaged.
 */

import type { Product } from "@/domain/products/types";
import { publishedMeta } from "@/content/config";
import { categoryFallbackImage } from "@/content/running/media";

const pub = publishedMeta();

/**
 * Sources (manufacturer):
 * - Kjerag 02 PDP: https://www.nnormal.com/en_GB/men/shoes/kjr/nnormal-kjerag_02_shoe_green_white-N1ZKGM2-006
 *   stack 20/26 mm, drop 6 mm, lugs 3.5 mm
 * - Kjerag family: https://www.nnormal.com/en_GB/content/meet-the-kjerag-family
 *   weight 230 g at UK 8.5 / EU 42⅔ (PDP lists 214 g at UK 7.5 — different size, not averaged)
 * - Tomir 02 PDP: https://www.nnormal.com/en_GB/men/shoes/tmi/nnormal-tomir_02_shoe_green_white-N2ZTR25-005
 *   stack 25/33 mm, drop 8 mm, lugs 5 mm, 264 g UK 8.5
 *   (manufacturer comparison page listed 288 g at the same size — prefer current PDP)
 * Cadí / Kjerag Brut / Kjerag 01 / Kboix are not ingested here.
 */
export const runningNnormalTrail: Product[] = [
  {
    id: "prod-nnormal-kjerag-02",
    slug: "nnormal-kjerag-02",
    brandId: "brand-nnormal",
    familyId: "fam-nnormal-kjerag",
    generation: "02",
    name: "Kjerag 02",
    fullName: "NNormal Kjerag 02",
    shortDescription:
      "NNormal’s current technical race-trail shoe — Matryx Light Jacquard, EExpure TPEE foam, Vibram Megagrip Litebase — for fast, efficient running on technical ground.",
    lifecycleStatus: "current",
    sportIds: ["sport-running"],
    disciplineIds: ["disc-running-trail", "disc-running-racing"],
    categoryId: "cat-running-shoes",
    subcategoryIds: ["sub-trail", "sub-race", "sub-neutral"],
    useCaseIds: [
      "uc-trail-training",
      "uc-advanced",
      "uc-pb",
      "uc-intervals",
    ],
    specifications: {
      weight: 230,
      heelStack: 26,
      forefootStack: 20,
      drop: 6,
      cushionLevel: "medium",
      cushionFeel: "firm",
      stability: "neutral",
      rideCharacter: "responsive",
      energyReturn: "high",
      flexibility: "moderate",
      upper: "Matryx Light Jacquard",
      midsole: "EExpure TPEE supercritical foam",
      outsole: "Vibram Megagrip Litebase",
      plate: false,
      plateMaterial: "none",
      terrain: ["trail"],
      widthOptions: ["standard"],
      archSupport: "medium",
      grip: "aggressive-trail",
      durability: "high",
      breathability: "high",
      raceLegal: true,
      recommendedPaceRange: null,
      recommendedDistance: ["daily"],
      recommendedRunnerWeightRange: null,
      trainingTypes: ["tempo", "race", "long"],
      surface: ["trail"],
      weatherSuitability: ["dry", "wet"],
    },
    strengths: [
      "Light, precise race-trail geometry on technical ground",
      "Vibram Megagrip Litebase with 3.5 mm lugs",
      "Matryx Light Jacquard upper with no insole",
    ],
    weaknesses: [
      "Narrower, more demanding last than Tomir 02",
      "Not the shoe for long, protective mountain days — that is Tomir",
    ],
    recommendationScore: 86,
    valueScore: 74,
    experienceLevels: ["advanced", "elite"],
    images: categoryFallbackImage(
      "cat-running-shoes",
      "prod-nnormal-kjerag-02",
      "NNormal Kjerag 02 — manufacturer packshot",
    ),
    videos: [],
    offerIds: [],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
    relatedProductIds: [
      "prod-nnormal-tomir-02",
      "prod-nnormal-race-vest",
      "prod-peregrine-15",
    ],
    alternativeProductIds: ["prod-peregrine-15", "prod-sense-ride-5"],
    ...pub,
  },
  {
    id: "prod-nnormal-tomir-02",
    slug: "nnormal-tomir-02",
    brandId: "brand-nnormal",
    familyId: "fam-nnormal-tomir",
    generation: "02",
    name: "Tomir 02",
    fullName: "NNormal Tomir 02",
    shortDescription:
      "NNormal’s long-technical trail shoe — higher stack than Kjerag 02, 8 mm drop, 5 mm Vibram Megagrip Litebase Traction Lug — for stability and protection on unpredictable mountain days.",
    lifecycleStatus: "current",
    sportIds: ["sport-running"],
    disciplineIds: ["disc-running-trail", "disc-running-ultra"],
    categoryId: "cat-running-shoes",
    subcategoryIds: ["sub-trail", "sub-neutral"],
    useCaseIds: [
      "uc-trail-training",
      "uc-ultra",
      "uc-long-runs",
      "uc-advanced",
    ],
    specifications: {
      weight: 264,
      heelStack: 33,
      forefootStack: 25,
      drop: 8,
      cushionLevel: "high",
      cushionFeel: "balanced",
      stability: "mild-stability",
      rideCharacter: "protective",
      energyReturn: "moderate",
      flexibility: "moderate",
      upper: "Ripstop TPE",
      midsole: "EExpure supercritical foam",
      outsole: "Vibram Megagrip Litebase with Traction Lug",
      plate: false,
      plateMaterial: "none",
      terrain: ["trail"],
      widthOptions: ["standard"],
      archSupport: "medium",
      grip: "aggressive-trail",
      durability: "high",
      breathability: "moderate",
      raceLegal: true,
      recommendedPaceRange: null,
      recommendedDistance: ["ultra", "daily"],
      recommendedRunnerWeightRange: null,
      trainingTypes: ["long", "easy", "race"],
      surface: ["trail"],
      weatherSuitability: ["dry", "wet", "all-season"],
    },
    strengths: [
      "Protective 25/33 mm stack for long technical terrain",
      "5 mm Vibram Megagrip Litebase Traction Lug",
      "More stable, forgiving last than Kjerag 02",
    ],
    weaknesses: [
      "Heavier and less precise than Kjerag 02 on race-pace technical ground",
      "Not Cadí — less stack and less easy-terrain plush",
    ],
    recommendationScore: 88,
    valueScore: 80,
    experienceLevels: ["intermediate", "advanced"],
    images: categoryFallbackImage(
      "cat-running-shoes",
      "prod-nnormal-tomir-02",
      "NNormal Tomir 02 — manufacturer packshot",
    ),
    videos: [],
    offerIds: [],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
    relatedProductIds: [
      "prod-nnormal-kjerag-02",
      "prod-nnormal-race-vest",
      "prod-speedgoat-6",
    ],
    alternativeProductIds: ["prod-speedgoat-6", "prod-cascadia-18"],
    ...pub,
  },
];
