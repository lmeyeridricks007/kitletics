import type { ContentSection, Review } from "@/domain/editorial/types";
import {
  assessConsumerCopyQuality,
  containsMachineTemplateCopy,
  isKeepableEditorialSection,
} from "@/lib/review/consumer-copy-quality";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function scrubBanned(text: string): string {
  return text
    .replace(
      /when its main job matches most of your week(?:\s*[—–-]\s*not as a default for every session)?/gi,
      "when this role is most of your week",
    )
    .replace(/\bSKU\b/g, "model")
    .replace(/\btokens?\b/gi, "details")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function keepableBullets(lines: string[] | undefined, min: number): string[] | null {
  const list = (lines ?? [])
    .map((l) => scrubBanned(l))
    .filter((l) => l.length >= 8)
    .filter((l) => !containsMachineTemplateCopy(l) && !containsPublicContentCorruption(l));
  return list.length >= min ? list.slice(0, 5) : null;
}

function mergeSections(
  existing: ContentSection[],
  synthesized: ContentSection[],
): ContentSection[] {
  const keep = existing
    .map((s) => ({
      ...s,
      body: scrubBanned(s.body),
      heading: s.heading,
    }))
    .filter((s) => isKeepableEditorialSection(s.body));

  if (keep.length < 3) return synthesized;

  const keepIds = new Set(keep.map((s) => s.id));
  const keepHeadings = new Set(keep.map((s) => s.heading.toLowerCase()));
  const extras = synthesized.filter((s) => {
    if (keepIds.has(s.id)) return false;
    if (keepHeadings.has(s.heading.toLowerCase())) return false;
    return /ride|stability|upper|grip|lockdown|outsole/i.test(
      `${s.id} ${s.heading}`,
    );
  });
  return [...keep, ...extras];
}

/**
 * Prefer existing product-specific analysis; replace unusable
 * verdict / decision / methodology fields from a consumer synthesis.
 */
export function mergeConsumerRebuild(
  existing: Review,
  synthesized: Review,
): Review {
  const sections = mergeSections(existing.sections ?? [], synthesized.sections ?? []);
  const firstHand =
    existing.reviewType === "first-hand-test" || existing.reviewType === "hybrid";
  const keepTesting =
    firstHand &&
    existing.testingContext &&
    countWords(existing.testingContext) >= 40 &&
    !containsMachineTemplateCopy(existing.testingContext) &&
    !containsPublicContentCorruption(existing.testingContext);

  return {
    ...existing,
    verdict: synthesized.verdict,
    bottomLine: synthesized.verdict,
    summary: synthesized.summary || synthesized.verdict,
    testingContext: keepTesting
      ? existing.testingContext
      : synthesized.testingContext,
    whoShouldBuy: synthesized.whoShouldBuy,
    whoShouldAvoid: synthesized.whoShouldAvoid,
    pros: keepableBullets(existing.pros, 3) ?? synthesized.pros,
    cons: keepableBullets(existing.cons, 2) ?? synthesized.cons,
    sections,
    seoTitle: existing.seoTitle
      ? scrubBanned(existing.seoTitle)
      : synthesized.seoTitle,
    seoDescription: existing.seoDescription
      ? scrubBanned(existing.seoDescription)
      : synthesized.seoDescription,
    updatedAt: synthesized.updatedAt ?? existing.updatedAt,
  };
}

export function consumerRebuildPasses(review: Review): boolean {
  return assessConsumerCopyQuality(review).ok;
}
