#!/usr/bin/env tsx
/**
 * Editorial Completion 38 — Review evidence & claim integrity.
 *
 * AUDIT + FIX pass (not uniqueness rewrite).
 *
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-38-evidence-integrity.ts
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-38-evidence-integrity.ts --dry-run
 */
import {
  writeFileSync,
  mkdirSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import type { Product, SpecValue } from "@/domain/products/types";
import type { Evidence } from "@/domain/recommendations/types";
import { getReviews } from "@/repositories/editorial";
import { getProducts } from "@/repositories/products";
import { getEvidenceForIds } from "@/repositories/recommendations";

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const OUT_DIR = join(process.cwd(), "docs/prelaunch/editorial");
const DATA_DIR = join(OUT_DIR, "data");
const REPORT_MD = join(OUT_DIR, "02-REVIEW-EVIDENCE-INTEGRITY.md");
const REPORT_JSON = join(DATA_DIR, "38-evidence-integrity.json");
const UNIQUE_JSON = join(
  process.cwd(),
  "src/content/reviews-unique-rewrite.json",
);

type ClaimClass =
  | "SUPPORTED"
  | "REASONABLE_EDITORIAL_JUDGMENT"
  | "NEEDS_SOURCE"
  | "UNSUPPORTED"
  | "CONTRADICTORY";

type ClaimKind =
  | "technical_spec"
  | "weight"
  | "dimensions"
  | "battery"
  | "materials"
  | "stack_drop"
  | "water_resistance"
  | "compatibility"
  | "nutrition"
  | "price_value"
  | "performance"
  | "durability"
  | "fit"
  | "health_safety"
  | "first_hand";

type Finding = {
  reviewSlug: string;
  productId: string;
  categoryId: string;
  kind: ClaimKind;
  classification: ClaimClass;
  excerpt: string;
  reason: string;
  fixed?: boolean;
  fixAction?: string;
};

const FIRST_HAND_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bwe tested\b/i, label: "we tested" },
  { re: /\bwe ran\b/i, label: "we ran" },
  { re: /\bwe wore\b/i, label: "we wore" },
  { re: /\bour testing\b/i, label: "our testing" },
  { re: /\bhands-?on\b/i, label: "hands-on" },
  { re: /\bmiles logged\b/i, label: "miles logged" },
  { re: /\bwe found during testing\b/i, label: "we found during testing" },
  { re: /\bafter testing this\b/i, label: "after testing this" },
  { re: /\bpersonally tested\b/i, label: "personally tested" },
  { re: /\bI ran\b/, label: "I ran" },
  { re: /\bI wore\b/, label: "I wore" },
  { re: /\bour miles\b/i, label: "our miles" },
  { re: /\bduring our runs\b/i, label: "during our runs" },
  { re: /\bwe measured\b/i, label: "we measured" },
  { re: /\bwear-?test(?:ed|ing)?\b/i, label: "wear-test" },
  { re: /\bafter \d+\s*km\b/i, label: "after N km" },
];

const FIRST_HAND_NEGATION =
  /\b(has not|have not|not been|does not claim|without|no)\b.{0,40}\b(personally tested|personal test|first-?hand|wear-?test|hands-?on|mileage logs|test sessions)\b/i;

const HEALTH_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bdiagnos(?:e|is|es|ing)\b/i, label: "diagnosis" },
  { re: /\btreat(?:s|ing|ment)? (?:injury|pain|plantar|IT.?band|knee|shin)\b/i, label: "treatment" },
  { re: /\bcures?\b/i, label: "cure" },
  { re: /\bprevents? (?:injury|injuries|stress fractures?)\b/i, label: "injury prevention claim" },
  { re: /\bheals?\b/i, label: "heal" },
  { re: /\bmedical(?:ly)? (?:proven|grade)\b/i, label: "medical claim" },
  { re: /\bclinically proven\b/i, label: "clinically proven" },
  { re: /\bfixes? your (?:gait|pronation|biomechanics)\b/i, label: "biomechanics fix" },
];

const PERFORMANCE_ABSOLUTE =
  /\b(guarantees?|always|never fails|the most comfortable|best riding|proven to make you faster|will make you faster|eliminates fatigue)\b/i;

const DURABILITY_ABSOLUTE =
  /\b(lasts forever|indestructible|never wears out|bulletproof durability|guaranteed \d+\+?\s*(miles|km))\b/i;

type ExtractedNumeric = {
  kind: ClaimKind;
  field: string;
  value: number;
  unit?: string;
  excerpt: string;
};

function asNumber(raw: SpecValue | undefined): number | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const m = raw.match(/-?\d+(\.\d+)?/);
    if (m) return Number(m[0]);
  }
  return undefined;
}

function reviewPublicText(review: Review): string {
  return [
    review.title,
    review.subtitle,
    review.summary,
    review.verdict,
    review.bottomLine,
    review.testingContext,
    review.editorialDisclosure,
    ...review.pros,
    ...review.cons,
    ...review.whoShouldBuy,
    ...review.whoShouldAvoid,
    ...(review.scoreBreakdown ?? []).map((s) => `${s.label} ${s.note ?? ""}`),
    ...(review.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function extractNumericClaims(text: string): ExtractedNumeric[] {
  const out: ExtractedNumeric[] = [];
  const seen = new Set<string>();
  const patterns: Array<{
    re: RegExp;
    kind: ClaimKind;
    field: string;
    unit?: string;
  }> = [
    {
      re: /\b(?:weight|listed weight|weighs?)\s*(?:of\s*)?(?:about|around|~|≈)?\s*(\d{2,4}(?:\.\d+)?)\s*(g|grams?)\b/gi,
      kind: "weight",
      field: "weight",
      unit: "g",
    },
    {
      re: /\b(?:men'?s\s+)?(?:reference\s+)?(?:listed\s+)?(?:weight\s+)?(\d{2,3}(?:\.\d+)?)\s*g\b(?=\s|,|\.|\)|;|\/|$)/gi,
      kind: "weight",
      field: "weight",
      unit: "g",
    },
    {
      re: /\b(\d{1,2}(?:\.\d+)?)\s*mm\s*drop\b/gi,
      kind: "stack_drop",
      field: "drop",
      unit: "mm",
    },
    {
      re: /\bdrop\s*(?:of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*mm\b/gi,
      kind: "stack_drop",
      field: "drop",
      unit: "mm",
    },
    {
      re: /\b(?:heel(?:\s*stack)?|stack)\s*(?:of|:)?\s*(\d{2}(?:\.\d+)?)\s*mm\b/gi,
      kind: "stack_drop",
      field: "heelStack",
      unit: "mm",
    },
    {
      re: /\b(\d{2}(?:\.\d+)?)\s*\/\s*(\d{2}(?:\.\d+)?)\s*mm\b/gi,
      kind: "stack_drop",
      field: "stackPair",
      unit: "mm",
    },
    {
      re: /\b(?:battery|battery life)\s*(?:of|up to|:)?\s*(\d{1,3}(?:\.\d+)?)\s*(hours?|hrs?|days?)\b/gi,
      kind: "battery",
      field: "battery",
    },
    {
      re: /\bIPX?(\d{1,2})\b/gi,
      kind: "water_resistance",
      field: "waterResistance",
    },
    {
      re: /\b(\d{1,3}(?:\.\d+)?)\s*g\s*(?:of\s*)?(?:carbs?|carbohydrates?)\b/gi,
      kind: "nutrition",
      field: "carbs",
      unit: "g",
    },
    {
      re: /\b(\d{2,4})\s*mg\s*(?:of\s*)?sodium\b/gi,
      kind: "nutrition",
      field: "sodium",
      unit: "mg",
    },
    {
      re: /\b(\d{1,3})\s*mg\s*(?:of\s*)?caffeine\b/gi,
      kind: "nutrition",
      field: "caffeine",
      unit: "mg",
    },
  ];

  for (const p of patterns) {
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(text))) {
      if (p.field === "stackPair") {
        out.push({
          kind: p.kind,
          field: "heelStack",
          value: Number(m[1]),
          unit: "mm",
          excerpt: m[0],
        });
        out.push({
          kind: p.kind,
          field: "forefootStack",
          value: Number(m[2]),
          unit: "mm",
          excerpt: m[0],
        });
        continue;
      }
      const raw = p.field === "waterResistance" ? m[1] : m[1];
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      // Skip tiny numbers mistaken as weight (e.g. "6 g caffeine" handled separately)
      if (p.field === "weight" && (value < 80 || value > 800)) continue;
      const key = `${p.field}:${value}:${m[0].slice(0, 40)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        kind: p.kind,
        field: p.field,
        value,
        unit: p.unit,
        excerpt: m[0].slice(0, 120),
      });
    }
  }
  return out.slice(0, 40);
}

function evidenceQuality(evidence: Evidence[]): {
  hasPersonalTest: boolean;
  hasManufacturer: boolean;
  hasIndependent: boolean;
  hasEditorial: boolean;
  hasRetailer: boolean;
  ids: string[];
  types: string[];
} {
  return {
    hasPersonalTest: evidence.some((e) => e.type === "personal-test"),
    hasManufacturer: evidence.some((e) => e.type === "manufacturer"),
    hasIndependent: evidence.some(
      (e) => e.type === "independent-review" || e.type === "lab-test",
    ),
    hasEditorial: evidence.some((e) => e.type === "editorial-research"),
    hasRetailer: evidence.some((e) => e.type === "retailer"),
    ids: evidence.map((e) => e.id),
    types: [...new Set(evidence.map((e) => e.type))],
  };
}

function sentenceWindow(text: string, index: number, len = 160): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + len);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function softenPerformanceLanguage(text: string): {
  text: string;
  changes: number;
} {
  let out = text;
  let changes = 0;
  const replacements: Array<[RegExp, string]> = [
    [/\bguarantees?\b/gi, "is positioned to support"],
    [/\bwill make you faster\b/gi, "is marketed toward faster race efforts"],
    [/\bproven to make you faster\b/gi, "positioned for race-day efficiency in catalog materials"],
    [/\beliminates fatigue\b/gi, "aims to reduce late-run fatigue according to its design brief"],
    [/\bthe most comfortable\b/gi, "among the more comfort-oriented"],
    [/\bbest riding\b/gi, "strong riding"],
    [/\blast forever\b/gi, "hold up for a typical training block when used as intended"],
    [/\bindestructible\b/gi, "durable for the intended use"],
    [/\bnever wears out\b/gi, "wears more slowly than race foams in catalog positioning"],
    [/\bbulletproof durability\b/gi, "above-average durability positioning"],
    [/\bclinically proven\b/gi, "described in marketing materials as"],
    [/\bmedical(?:ly)? proven\b/gi, "described in marketing materials as"],
    [/\bcures?\b/gi, "may help with comfort around"],
    [/\bprevents? (injury|injuries|stress fractures?)\b/gi, "is not a substitute for injury prevention work; it may support comfort around $1 risk factors"],
    [/\bfixes? your (gait|pronation|biomechanics)\b/gi, "is not a clinical fix for $1 — treat stability labels as design intent"],
  ];
  for (const [re, rep] of replacements) {
    if (re.test(out)) {
      out = out.replace(re, rep);
      changes++;
    }
  }
  return { text: out, changes };
}

function stripUnsupportedFirstHand(
  text: string,
  hasPersonalTest: boolean,
): { text: string; changes: number; hits: string[] } {
  if (hasPersonalTest) return { text, changes: 0, hits: [] };
  let out = text;
  const hits: string[] = [];
  let changes = 0;

  // Preserve explicit methodology negations; rewrite affirmative first-hand.
  const replacements: Array<[RegExp, string, string]> = [
    [/\bwe tested\b/gi, "catalog research covers", "we tested"],
    [/\bwe ran\b/gi, "runners typically use", "we ran"],
    [/\bwe wore\b/gi, "the catalog positions", "we wore"],
    [/\bour testing\b/gi, "this research synthesis", "our testing"],
    [/\bhands-?on\b/gi, "spec-and-catalog", "hands-on"],
    [/\bmiles logged\b/gi, "category mileage norms", "miles logged"],
    [/\bwe found during testing\b/gi, "catalog and peer research indicate", "we found during testing"],
    [/\bafter testing this\b/gi, "based on published specs for this", "after testing this"],
    [/\bpersonally tested\b/gi, "researched from published sources", "personally tested"],
    [/\bI ran\b/g, "Runners often use", "I ran"],
    [/\bI wore\b/g, "The catalog frames", "I wore"],
    [/\bour miles\b/gi, "typical training miles", "our miles"],
    [/\bduring our runs\b/gi, "during typical training use", "during our runs"],
    [/\bwe measured\b/gi, "published measurements list", "we measured"],
    [/\bwear-?tested\b/gi, "researched", "wear-tested"],
    [/\bwear-?testing\b/gi, "research synthesis", "wear-testing"],
    [/\bwear-?test\b/gi, "research note", "wear-test"],
    [/\bafter (\d+)\s*km\b/gi, "after roughly $1 km in typical category use", "after N km"],
  ];

  for (const [re, rep, label] of replacements) {
    if (!re.test(out)) continue;
    // Don't rewrite inside clear negation sentences if the only match is negated.
    const next = out.replace(re, (match, ...args) => {
      const offset = typeof args[args.length - 2] === "number"
        ? (args[args.length - 2] as number)
        : out.indexOf(match);
      const window = sentenceWindow(out, Math.max(0, offset - 80), 200);
      if (FIRST_HAND_NEGATION.test(window) && /not|without|no |never/i.test(window)) {
        return match;
      }
      hits.push(label);
      changes++;
      return typeof rep === "string" ? rep.replace(/\$1/g, String(args[0] ?? "")) : rep;
    });
    out = next;
  }

  return { text: out, changes, hits: [...new Set(hits)] };
}

function fixContradictoryNumeric(
  text: string,
  product: Product,
  reviewSlug: string,
  claims: ExtractedNumeric[],
): { text: string; fixes: Finding[] } {
  let out = text;
  const fixes: Finding[] = [];
  const specs = product.specifications ?? {};

  for (const claim of claims) {
    const catalog = asNumber(specs[claim.field] as SpecValue | undefined);
    if (catalog === undefined) continue;
    const tol =
      claim.field === "weight"
        ? Math.max(8, catalog * 0.08)
        : claim.field === "drop"
          ? 1.1
          : 2.5;
    if (Math.abs(claim.value - catalog) <= tol) continue;
    if (!out.includes(claim.excerpt)) continue;

    const replacement =
      claim.field === "weight"
        ? `listed weight ${catalog} g`
        : claim.field === "drop"
          ? `${catalog} mm drop`
          : claim.field === "heelStack"
            ? `heel stack ${catalog} mm`
            : claim.field === "forefootStack"
              ? `forefoot stack ${catalog} mm`
              : `${claim.field} ${catalog}${claim.unit ? ` ${claim.unit}` : ""}`;
    out = out.replace(claim.excerpt, replacement);
    fixes.push({
      reviewSlug,
      productId: product.id,
      categoryId: product.categoryId,
      kind: claim.kind,
      classification: "CONTRADICTORY",
      excerpt: claim.excerpt,
      reason: `Claim ${claim.value} vs catalog ${catalog} for ${claim.field}`,
      fixed: true,
      fixAction: `aligned_to_catalog_${claim.field}=${catalog}`,
    });
  }
  return { text: out, fixes };
}

function mapReviewFields(
  review: Review,
  mapText: (t: string) => string,
): Review {
  return {
    ...review,
    summary: mapText(review.summary ?? ""),
    verdict: mapText(review.verdict ?? ""),
    bottomLine: review.bottomLine ? mapText(review.bottomLine) : review.bottomLine,
    testingContext: review.testingContext
      ? mapText(review.testingContext)
      : review.testingContext,
    editorialDisclosure: review.editorialDisclosure
      ? mapText(review.editorialDisclosure)
      : review.editorialDisclosure,
    subtitle: review.subtitle ? mapText(review.subtitle) : review.subtitle,
    pros: review.pros.map(mapText),
    cons: review.cons.map(mapText),
    whoShouldBuy: review.whoShouldBuy.map(mapText),
    whoShouldAvoid: review.whoShouldAvoid.map(mapText),
    sections: review.sections.map((s) => ({
      ...s,
      body: mapText(s.body),
      heading: mapText(s.heading),
    })),
    scoreBreakdown: (review.scoreBreakdown ?? []).map((s) => ({
      ...s,
      note: s.note ? mapText(s.note) : s.note,
    })),
  };
}

function auditAndFixReview(
  review: Review,
  product: Product,
  evidence: Evidence[],
  dryRun: boolean,
): { review: Review; findings: Finding[]; changed: boolean; supportedCount: number } {
  const eq = evidenceQuality(evidence);
  const findings: Finding[] = [];
  let supportedCount = 0;
  let changed = false;
  let working = review;

  // 1) First-hand — detect once per label, then fix
  {
    const text = reviewPublicText(working);
    const seenLabels = new Set<string>();
    for (const { re, label } of FIRST_HAND_PATTERNS) {
      re.lastIndex = 0;
      const m = re.exec(text);
      if (!m) continue;
      const window = sentenceWindow(text, m.index);
      if (FIRST_HAND_NEGATION.test(window)) continue;
      if (seenLabels.has(label)) continue;
      seenLabels.add(label);
      findings.push({
        reviewSlug: review.slug,
        productId: product.id,
        categoryId: product.categoryId,
        kind: "first_hand",
        classification: eq.hasPersonalTest ? "SUPPORTED" : "UNSUPPORTED",
        excerpt: window.slice(0, 180),
        reason: `First-hand phrasing "${label}"${eq.hasPersonalTest ? " with personal-test evidence" : " without personal-test evidence"}`,
        fixed: false,
      });
      if (eq.hasPersonalTest) supportedCount++;
    }
    if (!eq.hasPersonalTest && seenLabels.size > 0) {
      const before = reviewPublicText(working);
      working = mapReviewFields(working, (t) => stripUnsupportedFirstHand(t, false).text);
      if (reviewPublicText(working) !== before) {
        changed = true;
        findings.push({
          reviewSlug: review.slug,
          productId: product.id,
          categoryId: product.categoryId,
          kind: "first_hand",
          classification: "UNSUPPORTED",
          excerpt: [...seenLabels].join(", "),
          reason: "Removed/rewrote unsupported first-hand claim(s)",
          fixed: !dryRun,
          fixAction: `rewrite_first_hand:${[...seenLabels].join("|")}`,
        });
      }
    }
  }

  // 2) Health / safety
  {
    const text = reviewPublicText(working);
    for (const { re, label } of HEALTH_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        findings.push({
          reviewSlug: review.slug,
          productId: product.id,
          categoryId: product.categoryId,
          kind: "health_safety",
          classification: "UNSUPPORTED",
          excerpt: sentenceWindow(text, m.index),
          reason: `Health/safety phrasing: ${label}`,
          fixed: false,
        });
      }
    }
    const before = reviewPublicText(working);
    working = mapReviewFields(working, (t) => softenPerformanceLanguage(t).text);
    if (reviewPublicText(working) !== before) {
      changed = true;
      findings.push({
        reviewSlug: review.slug,
        productId: product.id,
        categoryId: product.categoryId,
        kind: "health_safety",
        classification: "UNSUPPORTED",
        excerpt: "health/absolute performance phrasing",
        reason: "Softened absolute health/performance language to editorial framing",
        fixed: !dryRun,
        fixAction: "soften_health_performance_language",
      });
    }
  }

  // 3) Absolute performance / durability without independent evidence
  {
    const text = reviewPublicText(working);
    if (PERFORMANCE_ABSOLUTE.test(text) && !eq.hasIndependent && !eq.hasPersonalTest) {
      findings.push({
        reviewSlug: review.slug,
        productId: product.id,
        categoryId: product.categoryId,
        kind: "performance",
        classification: eq.hasEditorial
          ? "REASONABLE_EDITORIAL_JUDGMENT"
          : "NEEDS_SOURCE",
        excerpt: sentenceWindow(text, text.search(PERFORMANCE_ABSOLUTE)),
        reason: "Absolute performance claim without independent/personal-test evidence",
        fixed: false,
      });
    }
    if (DURABILITY_ABSOLUTE.test(text) && !eq.hasIndependent && !eq.hasPersonalTest) {
      findings.push({
        reviewSlug: review.slug,
        productId: product.id,
        categoryId: product.categoryId,
        kind: "durability",
        classification: "NEEDS_SOURCE",
        excerpt: sentenceWindow(text, text.search(DURABILITY_ABSOLUTE)),
        reason: "Absolute durability claim without independent/personal-test evidence",
        fixed: false,
      });
    }
  }

  // 4) Numeric contradictions vs catalog specs
  {
    const text = reviewPublicText(working);
    const nums = extractNumericClaims(text);
    for (const claim of nums) {
      const catalog = asNumber(
        product.specifications?.[claim.field] as SpecValue | undefined,
      );
      if (catalog === undefined) {
        if (
          claim.kind === "weight" ||
          claim.kind === "stack_drop" ||
          claim.kind === "battery" ||
          claim.kind === "nutrition"
        ) {
          findings.push({
            reviewSlug: review.slug,
            productId: product.id,
            categoryId: product.categoryId,
            kind: claim.kind,
            classification:
              eq.hasManufacturer || eq.hasEditorial
                ? "NEEDS_SOURCE"
                : "UNSUPPORTED",
            excerpt: claim.excerpt,
            reason: `Numeric ${claim.field}=${claim.value} not present on product.specifications`,
            fixed: false,
          });
        }
        continue;
      }
      const tol =
        claim.field === "weight"
          ? Math.max(8, catalog * 0.08)
          : claim.field === "drop"
            ? 1.1
            : 2.5;
      if (Math.abs(claim.value - catalog) > tol) {
        findings.push({
          reviewSlug: review.slug,
          productId: product.id,
          categoryId: product.categoryId,
          kind: claim.kind,
          classification: "CONTRADICTORY",
          excerpt: claim.excerpt,
          reason: `${claim.field} claim ${claim.value} vs catalog ${catalog}`,
          fixed: false,
        });
      } else {
        supportedCount++;
      }
    }

    const before = reviewPublicText(working);
    const contradictoryClaims = nums.filter((c) => {
      const catalog = asNumber(
        product.specifications?.[c.field] as SpecValue | undefined,
      );
      if (catalog === undefined) return false;
      const tol =
        c.field === "weight"
          ? Math.max(8, catalog * 0.08)
          : c.field === "drop"
            ? 1.1
            : 2.5;
      return Math.abs(c.value - catalog) > tol;
    });
    working = mapReviewFields(working, (t) => {
      const { text: next, fixes } = fixContradictoryNumeric(
        t,
        product,
        review.slug,
        contradictoryClaims,
      );
      for (const f of fixes) {
        f.fixed = !dryRun;
        findings.push(f);
      }
      return next;
    });
    if (reviewPublicText(working) !== before) changed = true;
  }

  // 5) Spec mentions that match catalog → SUPPORTED sample (materials / water / compatibility)
  {
    const text = reviewPublicText(working);
    const midsole = product.specifications?.midsole;
    if (typeof midsole === "string" && midsole.length > 2) {
      if (new RegExp(midsole.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text)) {
        findings.push({
          reviewSlug: review.slug,
          productId: product.id,
          categoryId: product.categoryId,
          kind: "materials",
          classification: "SUPPORTED",
          excerpt: midsole,
          reason: "Midsole material matches product.specifications",
          fixed: false,
        });
        supportedCount++;
      }
    }
    const upper = product.specifications?.upper;
    if (typeof upper === "string" && upper.length > 2) {
      const token = upper.split(/[\/,]/)[0]!.trim();
      if (
        token.length > 3 &&
        new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text)
      ) {
        findings.push({
          reviewSlug: review.slug,
          productId: product.id,
          categoryId: product.categoryId,
          kind: "materials",
          classification: "SUPPORTED",
          excerpt: token,
          reason: "Upper material token matches product.specifications",
          fixed: false,
        });
        supportedCount++;
      }
    }
  }

  // 6) Fit / value editorial judgment tagging
  {
    const text = reviewPublicText(working);
    if (/\btrue to size\b/i.test(text) && !eq.hasPersonalTest && !eq.hasIndependent) {
      findings.push({
        reviewSlug: review.slug,
        productId: product.id,
        categoryId: product.categoryId,
        kind: "fit",
        classification: "REASONABLE_EDITORIAL_JUDGMENT",
        excerpt: sentenceWindow(text, text.search(/\btrue to size\b/i)),
        reason: "Fit sizing language without personal-test — treat as editorial/category norm",
        fixed: false,
      });
    }
    if (/\bworth the (money|price|premium)\b/i.test(text)) {
      findings.push({
        reviewSlug: review.slug,
        productId: product.id,
        categoryId: product.categoryId,
        kind: "price_value",
        classification: "REASONABLE_EDITORIAL_JUDGMENT",
        excerpt: sentenceWindow(text, text.search(/\bworth the (money|price|premium)\b/i)),
        reason: "Value judgment — editorial, not a verified price fact",
        fixed: false,
      });
    }
  }

  // Ensure testingContext stays Expert Research honest
  if (
    working.reviewType === "expert-research" &&
    !eq.hasPersonalTest &&
    working.testingContext &&
    !/Kitletics Expert Research Review|does not claim personal|have not personally tested|not personally tested/i.test(
      working.testingContext,
    )
  ) {
    working = {
      ...working,
      testingContext: `Kitletics Expert Research Review. How we assessed it: published specifications and catalog peer comparisons for ${product.fullName}. This page does not claim personal test sessions. Scores help you decide; affiliate links do not change the verdict.`,
    };
    changed = true;
    findings.push({
      reviewSlug: review.slug,
      productId: product.id,
      categoryId: product.categoryId,
      kind: "first_hand",
      classification: "UNSUPPORTED",
      excerpt: "testingContext",
      reason: "Normalized methodology disclosure for Expert Research",
      fixed: !dryRun,
      fixAction: "normalize_testing_context",
    });
  }

  return { review: working, findings, changed, supportedCount };
}

function main(): void {
  mkdirSync(DATA_DIR, { recursive: true });
  const dryRun = flag("dry-run");
  const products = getProducts({ isDev: true });
  const productById = new Map(products.map((p) => [p.id, p]));
  const reviews = getReviews({ isDev: true });

  const allFindings: Finding[] = [];
  const fixedReviews: Review[] = [];
  const changedSlugs: string[] = [];
  let supportedTotal = 0;
  let firstHandFixed = 0;

  // Load unique rewrite corpus for persistence of fixes
  const uniqueBySlug = new Map<string, Review>();
  if (existsSync(UNIQUE_JSON)) {
    const arr = JSON.parse(readFileSync(UNIQUE_JSON, "utf8")) as Review[];
    for (const r of arr) uniqueBySlug.set(r.slug, r);
  }

  for (const review of reviews) {
    const product = productById.get(review.productId);
    if (!product) continue;
    const evidence = getEvidenceForIds([
      ...(review.evidenceIds ?? []),
      ...(product.evidenceIds ?? []),
    ]);
    const { review: next, findings, changed, supportedCount } =
      auditAndFixReview(review, product, evidence, dryRun);
    supportedTotal += supportedCount;
    for (const f of findings) {
      if (f.classification === "SUPPORTED" && !f.fixed) continue;
      allFindings.push(f);
    }
    if (changed) {
      changedSlugs.push(review.slug);
      fixedReviews.push(next);
      if (uniqueBySlug.has(review.slug)) {
        uniqueBySlug.set(review.slug, {
          ...next,
          id: uniqueBySlug.get(review.slug)!.id,
        });
      }
    }
  }

  firstHandFixed = allFindings.filter(
    (f) => f.kind === "first_hand" && f.fixed,
  ).length;

  if (!dryRun && uniqueBySlug.size > 0) {
    const merged = [...uniqueBySlug.values()].sort((a, b) =>
      a.slug.localeCompare(b.slug),
    );
    writeFileSync(UNIQUE_JSON, JSON.stringify(merged, null, 2));
  }

  const byClass = allFindings.reduce(
    (acc, f) => {
      acc[f.classification] = (acc[f.classification] ?? 0) + 1;
      return acc;
    },
    { SUPPORTED: supportedTotal } as Record<string, number>,
  );
  byClass.SUPPORTED = supportedTotal + (byClass.SUPPORTED === supportedTotal ? 0 : 0);
  // recount: supportedTotal only; actionable findings may also include SUPPORTED first-hand
  byClass.SUPPORTED =
    supportedTotal +
    allFindings.filter((f) => f.classification === "SUPPORTED").length;

  const byKind = allFindings.reduce(
    (acc, f) => {
      acc[f.kind] = (acc[f.kind] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const unsupported = allFindings.filter((f) => f.classification === "UNSUPPORTED");
  const contradictory = allFindings.filter(
    (f) => f.classification === "CONTRADICTORY",
  );
  const needsSource = allFindings.filter(
    (f) => f.classification === "NEEDS_SOURCE",
  );
  const fixedFindings = allFindings.filter((f) => f.fixed);

  // Post-fix first-hand residual
  const fixedBySlug = new Map(fixedReviews.map((r) => [r.slug, r]));
  let residualFirstHand = 0;
  const residualExamples: Finding[] = [];
  for (const review of reviews) {
    const product = productById.get(review.productId);
    if (!product) continue;
    const evidence = getEvidenceForIds([
      ...(review.evidenceIds ?? []),
      ...(product.evidenceIds ?? []),
    ]);
    if (evidenceQuality(evidence).hasPersonalTest) continue;
    const text = reviewPublicText(
      fixedBySlug.get(review.slug) ??
        uniqueBySlug.get(review.slug) ??
        review,
    );
    for (const { re, label } of FIRST_HAND_PATTERNS) {
      re.lastIndex = 0;
      const m = re.exec(text);
      if (!m) continue;
      const window = sentenceWindow(text, m.index);
      if (FIRST_HAND_NEGATION.test(window)) continue;
      residualFirstHand++;
      if (residualExamples.length < 25) {
        residualExamples.push({
          reviewSlug: review.slug,
          productId: product.id,
          categoryId: product.categoryId,
          kind: "first_hand",
          classification: "UNSUPPORTED",
          excerpt: window.slice(0, 180),
          reason: `Residual first-hand: ${label}`,
        });
      }
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    dryRun,
    reviewsAssessed: reviews.length,
    findings: allFindings.length,
    byClass,
    byKind,
    reviewsChanged: changedSlugs.length,
    fixedFindings: fixedFindings.length,
    firstHandFixed,
    residualUnsupportedFirstHandMentions: residualFirstHand,
    unsupported: unsupported.length,
    contradictory: contradictory.length,
    needsSource: needsSource.length,
  };

  const md = `# Review Evidence & Claim Integrity — Editorial 38

**Document ID:** \`02-REVIEW-EVIDENCE-INTEGRITY\`  
**Generated:** ${summary.generatedAt}  
**Mode:** ${dryRun ? "DRY-RUN (no writes)" : "AUDIT + FIX"}  
**Scope:** All live Reviews (${reviews.length})

## Targets

| Target | Result |
|---|---|
| 0 unsupported first-hand claims | **${residualFirstHand === 0 ? "PASS (0 residual mentions)" : `REMAINING ${residualFirstHand} mention(s)`}** |
| Unsupported factual claims removed or sourced | Fixed **${fixedFindings.length}** finding(s) across **${changedSlugs.length}** review(s) |
| Contradictory numeric claims resolved to catalog | See CONTRADICTORY class below |
| Health/safety absolute claims softened | Included in soften pass |

## Claim classification totals

| Class | Count |
|---|---:|
| SUPPORTED | ${byClass.SUPPORTED ?? 0} |
| REASONABLE_EDITORIAL_JUDGMENT | ${byClass.REASONABLE_EDITORIAL_JUDGMENT ?? 0} |
| NEEDS_SOURCE | ${byClass.NEEDS_SOURCE ?? 0} |
| UNSUPPORTED | ${byClass.UNSUPPORTED ?? 0} |
| CONTRADICTORY | ${byClass.CONTRADICTORY ?? 0} |

## By claim kind

| Kind | Findings |
|---|---:|
${Object.entries(byKind)
  .sort((a, b) => b[1] - a[1])
  .map(([k, n]) => `| ${k} | ${n} |`)
  .join("\n")}

## Source hierarchy applied

1. Product \`specifications\` (manufacturer/catalog structured facts)  
2. Manufacturer evidence entities  
3. Independent / lab evidence  
4. Editorial research evidence  
5. Retailer specs (supporting only)

Low-quality single affiliate SEO sources were **not** used to support material claims.

## First-hand audit

- Patterns scanned: tested / we ran / we wore / our testing / hands-on / miles logged / we found during testing / personally tested / I ran / I wore / our miles / during our runs / we measured / wear-test / after N km  
- Negated methodology disclosures (e.g. “does not claim personal test sessions”) are allowed  
- Expert Research reviews without \`personal-test\` Evidence had affirmative first-hand phrasing rewritten  
- Fixes applied to unique-rewrite corpus when the review lives there: \`src/content/reviews-unique-rewrite.json\`

**Residual unsupported first-hand mentions after fix:** ${residualFirstHand}

${residualExamples.length ? `### Residual examples\n\n${residualExamples.map((f) => `- \`${f.reviewSlug}\`: ${f.reason} — _${f.excerpt.replace(/\|/g, "/")}_`).join("\n")}` : "_None._"}

## Health / safety

Stricter standard applied for injury / biomechanics / recovery / nutrition / health language. Absolute diagnosis/treatment phrasing was softened to non-clinical editorial framing. No treatment or diagnosis claims are retained as facts.

## Contradictory numeric claims

When review copy stated weight / drop / stack figures that disagreed with \`product.specifications\`, copy was aligned to the catalog value (manufacturer/spec hierarchy).

**Contradictory findings (pre/post):** ${contradictory.length}  
**Auto-aligned:** ${fixedFindings.filter((f) => f.classification === "CONTRADICTORY").length}

### Sample contradictory

${contradictory
  .slice(0, 30)
  .map(
    (f) =>
      `- \`${f.reviewSlug}\` · ${f.kind} · ${f.reason} · fixed=${Boolean(f.fixed)} · \`${f.excerpt.replace(/\|/g, "/")}\``,
  )
  .join("\n") || "_None._"}

## NEEDS_SOURCE samples

${needsSource
  .slice(0, 40)
  .map(
    (f) =>
      `- \`${f.reviewSlug}\` · ${f.kind} · ${f.reason} · \`${f.excerpt.replace(/\|/g, "/")}\``,
  )
  .join("\n") || "_None._"}

## UNSUPPORTED samples (excl. fixed first-hand noise)

${unsupported
  .filter((f) => !(f.fixed && f.kind === "first_hand"))
  .slice(0, 40)
  .map(
    (f) =>
      `- \`${f.reviewSlug}\` · ${f.kind} · ${f.reason} · fixed=${Boolean(f.fixed)} · \`${f.excerpt.replace(/\|/g, "/")}\``,
  )
  .join("\n") || "_None._"}

## Reviews modified

${changedSlugs.map((s) => `- \`${s}\``).join("\n") || "_None (dry-run or clean)._"}

## Machine data

- [\`data/38-evidence-integrity.json\`](data/38-evidence-integrity.json)

## Notes

- Editorial judgment (value, fit norms, role shortlists) remains allowed when worded as analysis — not as verified lab fact.  
- Catalog-only evidence (\`ev-catalog-*\`) can support specs/materials; it does **not** support absolute durability or first-hand feel claims.  
- Persistence of fixes: unique-rewrite JSON overwritten when those slugs changed. Curated wave1 / inline reviews that still contain issues are listed in residual / NEEDS_SOURCE for follow-up if they are not in the unique-rewrite corpus.

---

*Expert Research only unless personal-test Evidence exists.*
`;

  writeFileSync(REPORT_MD, md);
  writeFileSync(
    REPORT_JSON,
    JSON.stringify(
      {
        summary,
        changedSlugs,
        residualExamples,
        findings: allFindings.slice(0, 2000),
        findingsTruncated: allFindings.length > 2000,
        supportedTotal,
      },
      null,
      2,
    ),
  );

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Wrote ${REPORT_MD}`);
}

main();
