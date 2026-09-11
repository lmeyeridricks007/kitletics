import type { ContentSection, Review } from "@/domain/editorial/types";
import type { Brand, Product } from "@/domain/products/types";
import {
  REVIEW_MIN_WORDS,
  REVIEW_TARGET_WORDS,
  REVIEW_MAX_WORDS,
  TARGET_SECTION_WORDS,
  buildLengthPadding,
  buildLongformSectionBody,
  extendLongformSectionBody,
  countWords,
  ensureCanonicalSections,
  topicFromSection,
  type LongformTopic,
} from "@/lib/review/review-longform";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";

const THIN_PATTERNS =
  /evaluated from verified specs|where independent wear|Documented compromise:|Catalog strengths relevant|stands out in-catalog for|earns consideration when you specifically want:|Documented ride markers|Catalog fit markers|Verified cushioning context|Upper construction markers|Key tech markers|Traction context|Documented strengths|catalogued with|Published measurements and design markers|primary job \(|Outside that brief|inferred from geometry|research-informed guidance|Kitletics frames performance|Standout catalog points|Contextual factor score|Matched recommendation context|assessed from verified specifications/i;

/** Old formal / research-paper voice — replace the whole section body, do not merge. */
const FORMAL_VOICE =
  /Expert Research|least ambiguous|design facts we treat as anchors|lab certificate|structured catalog|Subjective feel|research estimate|wear-logged|How to read this section|Published measurements are the least|Kitletics has not personally|editorial research|verified product specifications|Performance assessment|measurable design facts|Subjective feel claims|we treat as anchors|not a lab certificate|wear-test on this exact model|research-based guidance|Expert Research only|structured sources|verified specs and what is normal|buying guidance for the .+?, not a lab/i;

/** Meta “how to read this review” filler — never keep; rewrite the section. */
const META_PADDING =
  /Keep the product.?s strengths in view|Also keep the trade-offs in view|When you finish this section|Here.?s what matters in this section|Still deciding on the |Optional stress test:|Think of it as a friend who|not a checklist to memorise|jump to the alternatives before you talk yourself|those pages turn impressions into a clear yes\/no|Use this section as a final decision pass|Before you add the .+ to cart, walk this checklist|Re-check the strengths you would actually use|Want the process behind the scores|A last practical note: buy for the next training block/i;

function isMetaPaddingPara(p: string): boolean {
  return (
    META_PADDING.test(p) ||
    /^How to read this section:/i.test(p) ||
    /^Still deciding on the /i.test(p) ||
    /^Optional stress test:/i.test(p) ||
    /^For feature-heavy products,/i.test(p) ||
    /^For footwear and apparel,/i.test(p) ||
    /^When you finish this section,/i.test(p) ||
    /^Finish by checking live offers/i.test(p) ||
    /^Here'?s what matters in this section:/i.test(p) ||
    /^Keep the product/i.test(p) ||
    /^Also keep the trade-offs/i.test(p) ||
    /^Read fit, ride/i.test(p) ||
    /^Fit decides whether/i.test(p) ||
    /^Practical tip:/i.test(p) ||
    /^Unless this page says/i.test(p) ||
    /^Unless we disclose personal testing/i.test(p) ||
    /^Bottom of this section:/i.test(p) ||
    /^If fit is the main reason/i.test(p) ||
    /^A useful mental model:/i.test(p) ||
    /lands around \d+(\.\d+)?\/10/i.test(p)
  );
}

function isJargonSeed(body: string): boolean {
  return (
    THIN_PATTERNS.test(body.trim()) ||
    FORMAL_VOICE.test(body.trim()) ||
    isReportOrJunkVoice(body)
  );
}

/** Wave1-style editorial notes — keep as the lead; do not bury under a template essay. */
const SEED_LED_TOPICS = new Set<LongformTopic>([
  "fit",
  "ride",
  "value",
  "cushioning",
  "stability",
  "durability",
]);

function isKeepableEditorialSeed(body: string, topic: LongformTopic): boolean {
  const trimmed = body.trim();
  if (!trimmed || isJargonSeed(trimmed) || META_PADDING.test(trimmed)) {
    return false;
  }
  const words = countWords(trimmed);
  if (words < 20 || words > 320) return false;
  return SEED_LED_TOPICS.has(topic) || words >= 70;
}

function stripMetaPadding(body: string): string {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !isMetaPaddingPara(p))
    .join("\n\n");
}

/** Keep a real editorial lead, then add the full expert section without repeating it. */
function mergeSeedWithGenerated(seed: string, generated: string): string {
  const cleanSeed = seed.trim();
  if (!cleanSeed || isJargonSeed(cleanSeed)) return generated;

  const seedParas = cleanSeed
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const genParas = generated
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const significantWords = (text: string) =>
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);

  const overlaps = (a: string, b: string) => {
    const aw = new Set(significantWords(a));
    const bw = significantWords(b);
    if (aw.size === 0 || bw.length === 0) return false;
    let hits = 0;
    for (const w of bw) if (aw.has(w)) hits += 1;
    return hits >= Math.min(12, Math.floor(bw.length * 0.55));
  };

  const out = [...seedParas];
  let skippedLead = false;
  for (const para of genParas) {
    const hitsSeed = seedParas.some((s) => overlaps(s, para));
    if (hitsSeed && !skippedLead) {
      skippedLead = true;
      continue;
    }
    if (hitsSeed && significantWords(para).length < 28) continue;
    out.push(para);
  }
  return out.join("\n\n");
}

function reviewWordCount(parts: string[]): number {
  return countWords(parts.filter(Boolean).join(" "));
}

/**
 * Expand thin/template review sections into long-form editorial (target 3k–5k words).
 * Injects missing canonical sections, expands short bodies, and pads if still under target.
 */
/** Fix 37 unique Expert Research — do not re-scaffold with shared longform templates. */
function isUniqueExpertResearchBody(review: Review): boolean {
  const ctx = review.testingContext ?? "";
  if (!/Kitletics Expert Research Review/i.test(ctx)) return false;
  if (review.reviewType !== "expert-research") return false;
  const deepSections = review.sections.filter(
    (s) => countWords(s.body) >= 200,
  ).length;
  return deepSections >= 4;
}

export function enrichReviewSectionBodies(
  review: Review,
  product: Product,
  brand?: Brand,
): ContentSection[] {
  // Unique rewrites already carry product-specific depth — only normalize order
  // and strip meta; never merge buildLongformSectionBody scaffolds back in.
  if (isUniqueExpertResearchBody(review)) {
    return ensureCanonicalSections(review, product).map((section) => ({
      ...section,
      body: finalizeSectionBody(section.body),
    }));
  }

  const withCanonical = ensureCanonicalSections(review, product);

  let sections = withCanonical.map((section) => {
    const topic = topicFromSection(section.id, section.heading);
    const cleanedSeed = stripMetaPadding(section.body);
    const hasMetaPadding = META_PADDING.test(section.body);
    const hasFormalVoice =
      FORMAL_VOICE.test(section.body) ||
      hasMetaPadding ||
      isReportOrJunkVoice(section.body);

    const finalizeBody = (raw: string) => {
      const seen = new Set<string>();
      return stripMetaPadding(raw)
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => {
          if (!p || isMetaPaddingPara(p)) return false;
          const key = p.slice(0, 72).toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .join("\n\n");
    };

    const withHeading = (body: string): ContentSection => ({
      ...section,
      heading:
        topic === "specs" && /verified|design & specs/i.test(section.heading)
          ? "Key specs"
          : topic === "usecase"
            ? "Who should buy"
            : section.heading,
      body,
    });

    // Real editorial notes: keep as the lead, then full expert section (not seed alone).
    if (!hasFormalVoice && isKeepableEditorialSeed(cleanedSeed, topic)) {
      const generated = buildLongformSectionBody(
        topic,
        product,
        review,
        brand?.name,
      );
      return withHeading(
        finalizeBody(mergeSeedWithGenerated(cleanedSeed, generated)),
      );
    }

    // Formal / meta filler: replace wholesale with buying-guide copy.
    if (hasFormalVoice) {
      const seedParas = section.body
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(
          (p) =>
            p &&
            !isJargonSeed(p) &&
            !isMetaPaddingPara(p) &&
            countWords(p) >= 20 &&
            countWords(p) <= 200,
        );
      const generated = buildLongformSectionBody(
        topic,
        product,
        review,
        brand?.name,
      );
      if (seedParas.length > 0 && SEED_LED_TOPICS.has(topic)) {
        return withHeading(
          finalizeBody(
            mergeSeedWithGenerated(seedParas.join("\n\n"), generated),
          ),
        );
      }
      return withHeading(finalizeBody(generated));
    }

    const needsDepth = countWords(cleanedSeed) < TARGET_SECTION_WORDS;

    if (!needsDepth && !isJargonSeed(section.body)) {
      const cleaned = finalizeBody(section.body);
      return withHeading(cleaned);
    }

    // Empty / jargon / under target depth: generate full topic copy and merge any usable seed.
    const generated = buildLongformSectionBody(
      topic,
      product,
      review,
      brand?.name,
    );
    if (
      cleanedSeed &&
      !isJargonSeed(cleanedSeed) &&
      countWords(cleanedSeed) >= 20
    ) {
      return withHeading(
        finalizeBody(mergeSeedWithGenerated(cleanedSeed, generated)),
      );
    }
    return withHeading(finalizeBody(generated));
  });

  // Never keep old checklist/decision lectures — they were meta filler.
  sections = sections.filter(
    (s) => s.id !== "sec-decision-guide" && s.id !== "sec-buying-checklist",
  );

  const measure = () =>
    reviewWordCount([
      review.summary,
      review.verdict,
      review.bottomLine ?? "",
      review.testingContext ?? "",
      ...review.pros,
      ...review.cons,
      ...review.whoShouldBuy,
      ...review.whoShouldAvoid,
      ...sections.map((s) => `${s.heading} ${s.body}`),
    ]);

  // Deepen shortest sections until we clear the long-form floor, then keep
  // going toward the ideal band so pages are deep — not merely readable.
  const deepenPasses = new Map<string, number>();
  let deepenGuard = 0;
  const deepenCeiling = Math.min(REVIEW_TARGET_WORDS, REVIEW_MAX_WORDS - 200);
  while (measure() < deepenCeiling && deepenGuard < 140) {
    deepenGuard += 1;
    let shortestIdx = -1;
    let shortestWords = Number.POSITIVE_INFINITY;
    // After the floor, allow longer sections before saturating.
    const sectionCap = measure() < REVIEW_MIN_WORDS ? 520 : 720;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]!;
      if (section.id === "sec-buying-checklist") continue;
      const w = countWords(section.body);
      if (w < shortestWords && w < sectionCap) {
        shortestWords = w;
        shortestIdx = i;
      }
    }
    if (shortestIdx < 0) break;
    const section = sections[shortestIdx]!;
    const topic = topicFromSection(section.id, section.heading);
    const pass = (deepenPasses.get(section.id) ?? 0) + 1;
    deepenPasses.set(section.id, pass);
    const extra = extendLongformSectionBody(
      topic,
      product,
      review,
      brand?.name,
      pass,
    );
    // Topic-tagged closer so repeated deepen passes stay unique after dedupe.
    const tagged = joinUniqueParas(section.body, extra, deepenCloser(topic, product, pass));
    if (countWords(tagged) <= countWords(section.body) + 6) {
      // Section cannot grow further — mark as saturated.
      deepenPasses.set(section.id, 99);
      if ([...deepenPasses.values()].every((v) => v >= 99)) break;
      continue;
    }
    sections[shortestIdx] = { ...section, body: tagged };
  }

  // Only add a short product-focused close if still under the floor — never meta lectures.
  if (
    measure() < REVIEW_MIN_WORDS &&
    !sections.some((s) => s.id === "sec-buying-checklist")
  ) {
    sections = [
      ...sections,
      buildLengthPadding(product, review, brand, "checklist"),
    ];
  }

  if (measure() > REVIEW_MAX_WORDS) {
    sections = sections.filter((s) => s.id !== "sec-buying-checklist");
  }

  // Last resort: peel trailing paragraphs from the longest sections until under max.
  let guard = 0;
  while (measure() > REVIEW_MAX_WORDS && guard < 80) {
    guard += 1;
    let longestIdx = -1;
    let longestWords = 0;
    for (let i = 0; i < sections.length; i++) {
      const w = countWords(sections[i]!.body);
      if (w > longestWords) {
        longestWords = w;
        longestIdx = i;
      }
    }
    if (longestIdx < 0) break;
    const section = sections[longestIdx]!;
    const paras = section.body
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paras.length <= 3) break;
    sections[longestIdx] = {
      ...section,
      body: paras.slice(0, -1).join("\n\n"),
    };
  }

  return sections;
}

function finalizeSectionBody(raw: string): string {
  const seen = new Set<string>();
  return stripMetaPadding(raw)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => {
      if (!p || isMetaPaddingPara(p)) return false;
      const key = p.slice(0, 72).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n\n");
}

function joinUniqueParas(...chunks: Array<string | undefined>): string {
  return finalizeSectionBody(chunks.filter(Boolean).join("\n\n"));
}

function deepenCloser(
  topic: LongformTopic,
  product: { fullName: string },
  pass: number,
): string {
  const name = product.fullName;
  if (pass <= 1) {
    return `For this ${topic} read on the ${name}, keep the weekly-session filter in view before you chase extras.`;
  }
  if (pass === 2) {
    return `Pass ${pass} check for ${name}: if this ${topic} section does not change a real session decision, skim the alternatives instead of re-reading specs.`;
  }
  return `Final ${topic} note on the ${name}: buy for the job you will repeat, not for a one-off edge case.`;
}

export function enrichReviewSummary(
  review: Review,
  product: Product,
): string {
  const summary = review.summary?.trim() ?? "";
  if (
    countWords(summary) >= 90 &&
    !THIN_PATTERNS.test(summary) &&
    !FORMAL_VOICE.test(summary)
  ) {
    return summary;
  }

  const strengths = product.strengths?.length
    ? product.strengths
    : review.pros;
  const weaknesses = product.weaknesses?.length
    ? product.weaknesses
    : review.cons;
  const desc = product.shortDescription?.trim() || summary;

  const soft = (items: string[]) =>
    items
      .slice(0, 3)
      .map((s) => s.charAt(0).toLowerCase() + s.slice(1))
      .join(", ")
      .replace(/, ([^,]*)$/, " or $1");

  return [
    `${desc} Here's a practical take on the ${product.fullName} — what it's for, who it suits, and when to pick something else.`,
    strengths.length
      ? `I'd shortlist it if you want ${soft(strengths)}.`
      : `Match it to the sessions you'll use it for most weeks.`,
    weaknesses.length
      ? `I'd pause if ${soft(weaknesses)} would show up often in your week.`
      : `Every shoe in this lane trades something away — the sections below spell out where.`,
    review.bottomLine?.trim() ||
      review.verdict?.trim() ||
      `Skim fit, ride and value before you buy on brand name alone.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function enrichTestingContext(
  review: Review,
  product: Product,
): string {
  const existing = review.testingContext?.trim() ?? "";

  // Fix 37 unique rewrites — preserve Expert Research methodology copy as-is.
  if (
    /Kitletics Expert Research Review/i.test(existing) &&
    /How we assessed it/i.test(existing) &&
    countWords(existing) >= 40
  ) {
    return existing;
  }

  const isTemplate =
    /has not been personally tested by Kitletics|not personally wear-tested|Kitletics has not personally|Expert Research|editorial research|structured catalog|verified product specifications/i.test(
      existing,
    ) || countWords(existing) < 40;

  if (
    existing &&
    !isTemplate &&
    !FORMAL_VOICE.test(existing) &&
    countWords(existing) >= 80
  ) {
    return existing;
  }

  return `Kitletics Expert Research Review. How we assessed it: published specifications and catalog peer comparisons for the ${product.fullName}'s stated role. This page does not claim personal test sessions unless a first-hand section is explicitly present. Scores help you decide; affiliate links do not change the verdict.`;
}
