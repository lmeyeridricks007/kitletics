/**
 * Padel Running↔Padel parity gates.
 *
 * REVIEW TEMPLATE-GLUE: FAIL PADEL_REVIEW_PARITY when the same non-structural
 * reader-facing pattern appears systematically across unrelated sections/products
 * without product-specific decision value. Word count never compensates.
 *
 * TEACHING-MEDIA: evaluate concept coverage — not <img> totals. Product cards
 * and repeated packshots do not count as educational teaching media.
 */

import { scrubEntityNames, normalizeText } from "@/domain/content-uniqueness/text";

// ─── Review template glue ───────────────────────────────────────────────────

/** Known deepen / meta filler stems — always fail when present on public padel reviews. */
export const PADEL_REVIEW_TEMPLATE_GLUE_STEMS = [
  /i'?d only keep the /i,
  /if this section still feels generic/i,
  /a sibling that wins a different court problem is the cleaner buy/i,
  /on the .+?, keep .+ in view before you chase extras/i,
  /final note on the .+: buy for the job you will repeat/i,
  /when .+ is not why you would pay for the /i,
  /if this section on the .+ does not change a real session decision/i,
] as const;

/** Legitimate shared structural copy — not template-glue FAIL. */
const STRUCTURAL_ALLOW =
  /affiliate (links|relationships)|expert research review|published numbers for|primary manufacturer source|no invented smash|demo when you can|street price moves|kitletics expert research|weight balance shape core and face are filters|the catalog does not invent missing|manufacturer pages and specialist listings|named systems on the sheet|listed thickness is \d+ mm|treat those as manufacturer labels|we put this guide together from published specs|we have not personally tested this product|unless the page says we did|research from the listed foam family|not a session count we logged|treat that as a category tag not a traction map|not a kitletics hitting test|expert-research accessory note|no injury or .tennis elbow|check live offers rather than treating a homepage|manufacturer and specialist court listings|no invented user ratings|we have not logged a mileage diary|we do not score .+ with running-shoe criteria|replace when tack dies or the wrap rolls|overgrips are consumables|i'?d budget for consumables|retire or service the product when safety|ownership life on the|use the rest of this review to translate those numbers|read the sections below for how it behaves/i;

/** Sections that legitimately restate buy/skip audience — not filler pad. */
const AUDIENCE_SECTION =
  /sec-(best-for|not-ideal|tradeoffs|usecase|strengths|weaknesses|overview)/i;

export type ReviewSectionSample = {
  productSlug: string;
  sectionId: string;
  sectionHeading?: string;
  body: string;
  /** Names to scrub (product full name, brand, model tokens). */
  entityNames?: string[];
};

export type TemplateGlueHit = {
  pattern: string;
  productSlugs: string[];
  sectionIds: string[];
  occurrenceCount: number;
  reason: "known_stem" | "cross_product_reuse" | "cross_section_reuse";
};

export type ReviewTemplateGlueResult = {
  /** Automatically FAIL PADEL_REVIEW_PARITY when true. */
  failPadelReviewParity: boolean;
  hits: TemplateGlueHit[];
  /** Word count on sampled reviews — informational only; never clears a FAIL. */
  totalWords: number;
};

/**
 * Patterns that still carry product-decision anchors after name scrub
 * are allowed to recur only when they are not pure class filler.
 * Presence of anchors does NOT clear known_stem hits.
 */
const DECISION_ANCHOR =
  /\b\d{2,4}\s*[-–]?\s*\d{0,4}\s*g\b|\b\d+k\b|\b\d+\s*cm\b|\b\d+\s*l\b|\bmultieva\b|\bsofteva\b|\bsoft eva\b|\btricarbon\b|\bfiberglass\b|\bpolyglass\b|\bx-?tend\b|\btop spin\b|\bhesacore\b|\bevalastic\b|\bglaphite\b|\bfibrix\b|\bpaletero\b|\bmanometer\b|\bthermoteck\b|\bpressurizer\b/i;

/** Framework filler that must not be stamped across analysis sections. */
const FILLER_FRAMEWORK =
  /i'?d (buy|rather|only|shortlist)|when the fit is close|outcomes match what you need|none of those strengths|clear specialist and rotate|who should skip list|force one product to cover|published job matches your week|lockdown without hot spots after a match/i;

function extractPatterns(body: string, entityNames: string[]): string[] {
  const scrubbed = scrubEntityNames(body, entityNames);
  const chunks = scrubbed
    .split(/\n\n+|(?<=[.!?])\s+/)
    .map((c) => normalizeText(c))
    .filter((c) => {
      const words = c.split(" ").filter(Boolean);
      if (words.length < 12) return false;
      if (STRUCTURAL_ALLOW.test(c)) return false;
      // Spec bullet lines are structural
      if (/^• /.test(c) || /^weight balance shape/.test(c)) return false;
      return true;
    });
  return chunks.map((c) => c.slice(0, 160));
}

/**
 * Detect systematic non-structural template glue across padel reviews.
 * Word count is recorded but never used to clear a failure.
 */
export function evaluateReviewTemplateGlue(
  samples: ReviewSectionSample[],
): ReviewTemplateGlueResult {
  const hits: TemplateGlueHit[] = [];
  let totalWords = 0;

  for (const sample of samples) {
    totalWords += sample.body.trim().split(/\s+/).filter(Boolean).length;
    for (const stem of PADEL_REVIEW_TEMPLATE_GLUE_STEMS) {
      if (stem.test(sample.body)) {
        hits.push({
          pattern: stem.source.slice(0, 80),
          productSlugs: [sample.productSlug],
          sectionIds: [sample.sectionId],
          occurrenceCount: 1,
          reason: "known_stem",
        });
      }
    }
  }

  const index = new Map<
    string,
    { products: Set<string>; sections: Set<string>; count: number }
  >();

  for (const sample of samples) {
    const names = sample.entityNames ?? [sample.productSlug.replace(/-/g, " ")];
    for (const pattern of extractPatterns(sample.body, names)) {
      const row = index.get(pattern) ?? {
        products: new Set<string>(),
        sections: new Set<string>(),
        count: 0,
      };
      row.products.add(sample.productSlug);
      row.sections.add(`${sample.productSlug}::${sample.sectionId}`);
      row.count += 1;
      index.set(pattern, row);
    }
  }

  for (const [pattern, row] of index) {
    // Spec-anchored lines that remain after name scrub are product decisions
    // (weight bands, weave, core names) — not interchangeable filler.
    if (DECISION_ANCHOR.test(pattern)) continue;

    // Systematic = across 3+ unrelated products, or heavy reuse (4+ occurrences
    // spanning 2+ products). Pairwise identical lines alone are not automatic FAIL
    // when products share a legitimate published stack sentence with anchors.
    if (
      row.products.size >= 3 ||
      (row.products.size >= 2 && row.count >= 5)
    ) {
      hits.push({
        pattern,
        productSlugs: [...row.products].sort(),
        sectionIds: [...row.sections].map((s) => s.split("::")[1]!).sort(),
        occurrenceCount: row.count,
        reason: "cross_product_reuse",
      });
      continue;
    }
    // Same product, 3+ analysis sections sharing framework filler = pad.
    // Product-specific seed paragraphs may recur via merge; those keep decision anchors.
    const analysisSections = [...row.sections].filter(
      (key) => !AUDIENCE_SECTION.test(key.split("::")[1] ?? ""),
    );
    if (
      row.products.size === 1 &&
      analysisSections.length >= 3 &&
      row.count >= 3 &&
      FILLER_FRAMEWORK.test(pattern)
    ) {
      hits.push({
        pattern,
        productSlugs: [...row.products],
        sectionIds: analysisSections.map((s) => s.split("::")[1]!),
        occurrenceCount: row.count,
        reason: "cross_section_reuse",
      });
    }
  }

  return {
    failPadelReviewParity: hits.length > 0,
    hits,
    totalWords,
  };
}

// ─── Teaching media ─────────────────────────────────────────────────────────

export type TeachingVisualKind =
  | "educational-diagram"
  | "education-asset"
  | "product-card"
  | "product-packshot"
  | "unknown";

export type TeachingVisual = {
  /** Diagram variant id, education path, or image src. */
  id: string;
  kind: TeachingVisualKind;
  /** Concepts this visual is allowed to satisfy. */
  concepts?: string[];
};

/** Major guides and the educational concepts that materially need a visual. */
export const MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS: Record<string, string[]> = {
  "how-to-choose-a-padel-racket": [
    "racket-shapes",
    "racket-balance",
    "sweet-spot",
    "power-control",
    "core-feel",
    "weight",
    "decision-steps",
  ],
  "how-to-choose-padel-shoes": [
    "shoe-support",
    "shoe-outsole",
    "decision-steps",
  ],
  "how-to-choose-a-padel-bag": ["bag-anatomy", "bag-forms", "decision-steps"],
  "how-to-choose-padel-balls": ["ball-types", "pressurizer", "decision-steps"],
  "padel-grips-overgrips-explained": [
    "grip-vs-overgrip",
    "grip-layers",
    "decision-steps",
  ],
  "beginner-padel-gear-guide": [
    "beginner-kit",
    "racket-shapes",
    "decision-steps",
  ],
};

/** Map known diagram / education ids → concepts they teach. */
export const TEACHING_VISUAL_CONCEPT_MAP: Record<string, string[]> = {
  "padel-racket-shapes": ["racket-shapes"],
  "padel-racket-balance": ["racket-balance"],
  "padel-racket-weight": ["weight"],
  "padel-sweet-spot": ["sweet-spot"],
  "padel-power-control": ["power-control"],
  "padel-core-feel": ["core-feel"],
  "padel-decision-steps": ["decision-steps"],
  "padel-shoe-outsole": ["shoe-outsole"],
  "padel-shoe-support": ["shoe-support"],
  "padel-bag-forms": ["bag-forms"],
  "padel-bag-anatomy": ["bag-anatomy"],
  "padel-grip-vs-overgrip": ["grip-vs-overgrip"],
  "padel-grip-layers": ["grip-layers"],
  "padel-ball-types": ["ball-types"],
  "padel-pressurizer": ["pressurizer"],
  "padel-beginner-kit": ["beginner-kit"],
  "/images/padel/education/padel-racket-shapes.svg": ["racket-shapes"],
  "/images/padel/education/padel-sweet-spot.svg": ["sweet-spot"],
  "/images/padel/education/padel-power-control.svg": ["power-control"],
  "/images/padel/education/padel-grip-layers.svg": ["grip-layers"],
};

export function classifyTeachingVisualKind(
  srcOrVariant: string,
): TeachingVisualKind {
  const s = srcOrVariant.toLowerCase();
  if (
    s.startsWith("padel-") &&
    !s.includes("/") &&
    !s.includes(".jpg") &&
    !s.includes(".png") &&
    !s.includes(".webp")
  ) {
    return "educational-diagram";
  }
  if (s.includes("/images/padel/education/") || s.includes("/education/padel-")) {
    return "education-asset";
  }
  if (
    /\/products\//.test(s) ||
    /hero\.(jpg|jpeg|png|webp)/.test(s) ||
    /packshot|product-card/.test(s)
  ) {
    return /hero|packshot/.test(s) ? "product-packshot" : "product-card";
  }
  if (/\/gallery\//.test(s)) return "product-packshot";
  return "unknown";
}

export function isEducationalTeachingMedia(kind: TeachingVisualKind): boolean {
  return kind === "educational-diagram" || kind === "education-asset";
}

export type TeachingMediaCoverageResult = {
  guideSlug: string;
  requiredConcepts: string[];
  coveredConcepts: string[];
  missingConcepts: string[];
  /** Intentionally ignored — never use to pass. */
  totalImgCount: number;
  productCardOrPackshotCount: number;
  teachingVisualCount: number;
  /** FAIL PADEL_GUIDE_PARITY / PADEL_MEDIA_PARITY when true. */
  failTeachingMediaParity: boolean;
};

/**
 * Evaluate whether each major educational concept has an intentional teaching visual.
 * Product cards and packshots never satisfy a concept. totalImgCount is informational only.
 */
export function evaluateTeachingMediaCoverage(input: {
  guideSlug: string;
  visuals: TeachingVisual[];
  /** Optional raw <img> count for reporting — never clears a FAIL. */
  totalImgCount?: number;
  /** Override required concepts; defaults to MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS. */
  requiredConcepts?: string[];
}): TeachingMediaCoverageResult {
  const required =
    input.requiredConcepts ??
    MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS[input.guideSlug] ??
    [];
  const covered = new Set<string>();
  let productCardOrPackshotCount = 0;
  let teachingVisualCount = 0;

  for (const visual of input.visuals) {
    const kind =
      visual.kind === "unknown"
        ? classifyTeachingVisualKind(visual.id)
        : visual.kind;
    if (kind === "product-card" || kind === "product-packshot") {
      productCardOrPackshotCount += 1;
      continue;
    }
    if (!isEducationalTeachingMedia(kind)) continue;
    teachingVisualCount += 1;
    const concepts =
      visual.concepts ??
      TEACHING_VISUAL_CONCEPT_MAP[visual.id] ??
      TEACHING_VISUAL_CONCEPT_MAP[visual.id.split("/").pop() ?? ""] ??
      [];
    for (const c of concepts) covered.add(c);
  }

  const coveredConcepts = required.filter((c) => covered.has(c));
  const missingConcepts = required.filter((c) => !covered.has(c));

  return {
    guideSlug: input.guideSlug,
    requiredConcepts: required,
    coveredConcepts,
    missingConcepts,
    totalImgCount: input.totalImgCount ?? 0,
    productCardOrPackshotCount,
    teachingVisualCount,
    failTeachingMediaParity: missingConcepts.length > 0,
  };
}

export type PadelParityGateVerdict = {
  PADEL_REVIEW_PARITY: "PASS" | "FAIL";
  PADEL_GUIDE_PARITY: "PASS" | "FAIL";
  PADEL_MEDIA_PARITY: "PASS" | "FAIL";
  reviewGlue: ReviewTemplateGlueResult;
  teaching: TeachingMediaCoverageResult[];
};

/**
 * Combine review-glue + teaching-media rules into parity gate verdicts.
 * Does not declare OVERALL_RUNNING_PADEL_PARITY — that stays with the full audit.
 */
export function evaluatePadelEditorialParityGates(input: {
  reviewSamples: ReviewSectionSample[];
  guides: Array<{
    guideSlug: string;
    visuals: TeachingVisual[];
    totalImgCount?: number;
  }>;
}): PadelParityGateVerdict {
  const reviewGlue = evaluateReviewTemplateGlue(input.reviewSamples);
  const teaching = input.guides.map((g) =>
    evaluateTeachingMediaCoverage({
      guideSlug: g.guideSlug,
      visuals: g.visuals,
      totalImgCount: g.totalImgCount,
    }),
  );
  const anyTeachingFail = teaching.some((t) => t.failTeachingMediaParity);

  return {
    PADEL_REVIEW_PARITY: reviewGlue.failPadelReviewParity ? "FAIL" : "PASS",
    PADEL_GUIDE_PARITY: anyTeachingFail ? "FAIL" : "PASS",
    PADEL_MEDIA_PARITY: anyTeachingFail ? "FAIL" : "PASS",
    reviewGlue,
    teaching,
  };
}
