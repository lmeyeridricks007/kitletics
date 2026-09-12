import { containsMachineTemplateCopy } from "@/lib/review/consumer-copy-quality";
import { REVIEW_SCAFFOLD_PHRASES, scaffoldHitCount } from "@/domain/content-uniqueness/text";
import { excerpt, joinVisible } from "../flatten";
import type { RenderedIssue, VisiblePage } from "../types";

const MALFORMED_UNIT =
  /\b\d+\s*(mmmm|gg|kgg|mlml)\b|\b\d{2,4}(weight|heelstack|forefootstack)[a-z]/i;
/** Catalog primary keys in prose — not use-case slugs or category chips. */
const RAW_ID = /\b(prod|rev|sku)-[a-z0-9]*\d[a-z0-9-]{3,}\b/i;
const INTERNAL_TAXONOMY =
  /\b(heelStack|forefootStack|cushionLevel|cushionFeel|rideCharacter|intendedJob)\b/;
/** Unreadable serialization — never ship. */
const IMPOSSIBLE_BLOCKER =
  /you need not a [a-z]+(?: [a-z]+){0,2}[.!]|\[object Object\]/i;
/** Awkward uniqueness-era skip lines — HIGH, not launch BLOCKER. */
const IMPOSSIBLE_HIGH =
  /\blook elsewhere if not a [a-z]+(?: [a-z]+){0,2}[.!]|i'd pause if not a [a-z]+(?: [a-z]+){0,2}[.!]/i;
const STUFFING_PHRASE = /\b([a-z]{4,}(?:\s+[a-z]+){1,3})\b/gi;

function duplicateParagraphs(text: string): string | undefined {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.split(" ").length >= 18);
  const seen = new Map<string, number>();
  for (const p of paras) {
    const key = p.slice(0, 180).toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if ((seen.get(key) ?? 0) >= 2) return p;
  }
  return undefined;
}

function stuffingPhrase(text: string): string | undefined {
  const counts = new Map<string, number>();
  const lower = text.toLowerCase();
  for (const m of lower.matchAll(STUFFING_PHRASE)) {
    const phrase = m[1]!;
    if (phrase.length < 12) continue;
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
  }
  for (const [phrase, n] of counts) {
    if (n >= 12) return phrase;
  }
  return undefined;
}

export function gateContentSanity(
  pages: VisiblePage[],
  startId: number,
): RenderedIssue[] {
  const issues: RenderedIssue[] = [];
  let n = startId;
  for (const page of pages) {
    if (!page.assembled) continue;
    const blob = joinVisible(page.components);
    if (!blob.trim()) continue;

    const dup = duplicateParagraphs(blob);
    if (dup) {
      issues.push({
        id: `RQ-${String(++n).padStart(5, "0")}`,
        severity: "HIGH",
        gate: "content-sanity",
        issueClass: "CONTENT_SANITY",
        issue: "duplicate_paragraph",
        component: "body",
        url: page.url,
        template: page.template,
        entity: page.entity,
        rootCause: `Duplicate paragraph on ${page.entity.kind}:${page.entity.slug}`,
        excerpt: excerpt(dup),
      });
    }

    const stuffed =
      page.template === "review" ||
      page.template === "product" ||
      page.template === "buying-guide" ||
      page.template === "alternatives"
        ? stuffingPhrase(blob)
        : undefined;
    if (stuffed) {
      issues.push({
        id: `RQ-${String(++n).padStart(5, "0")}`,
        severity: "HIGH",
        gate: "content-sanity",
        issueClass: "CONTENT_SANITY",
        issue: "keyword_stuffing",
        component: "body",
        url: page.url,
        template: page.template,
        entity: page.entity,
        rootCause: `Repeated phrase "${stuffed}" on ${page.path}`,
        excerpt: excerpt(stuffed),
      });
    }

    const scaffold = scaffoldHitCount(blob);
    if (scaffold >= 4 || containsMachineTemplateCopy(blob)) {
      issues.push({
        id: `RQ-${String(++n).padStart(5, "0")}`,
        severity: scaffold >= 4 || containsMachineTemplateCopy(blob) ? "HIGH" : "MEDIUM",
        gate: "content-sanity",
        issueClass: "CONTENT_SANITY",
        issue: containsMachineTemplateCopy(blob)
          ? "machine_filler"
          : "template_repetition",
        component: "body",
        url: page.url,
        template: page.template,
        entity: page.entity,
        rootCause: containsMachineTemplateCopy(blob)
          ? `Machine filler on ${page.path}`
          : `Scaffold phrases (${scaffold}) including ${REVIEW_SCAFFOLD_PHRASES[0]}`,
        excerpt: excerpt(blob, 180),
      });
    }

    if (INTERNAL_TAXONOMY.test(blob)) {
      issues.push({
        id: `RQ-${String(++n).padStart(5, "0")}`,
        severity: "HIGH",
        gate: "content-sanity",
        issueClass: "CONTENT_SANITY",
        issue: "internal_taxonomy",
        component: "body",
        url: page.url,
        template: page.template,
        entity: page.entity,
        rootCause: `Catalog field names in rendered copy on ${page.path}`,
        excerpt: excerpt(blob),
      });
    }

    if (MALFORMED_UNIT.test(blob) || RAW_ID.test(blob) || IMPOSSIBLE_BLOCKER.test(blob)) {
      const issue = MALFORMED_UNIT.test(blob)
        ? "malformed_units"
        : RAW_ID.test(blob)
          ? "raw_ids"
          : "impossible_sentence";
      issues.push({
        id: `RQ-${String(++n).padStart(5, "0")}`,
        severity: "BLOCKER",
        gate: "content-sanity",
        issueClass: "CONTENT_SANITY",
        issue,
        component: "body",
        url: page.url,
        template: page.template,
        entity: page.entity,
        rootCause: `${issue} in rendered copy on ${page.path}`,
        excerpt: excerpt(blob),
      });
    } else if (IMPOSSIBLE_HIGH.test(blob)) {
      issues.push({
        id: `RQ-${String(++n).padStart(5, "0")}`,
        severity: "HIGH",
        gate: "content-sanity",
        issueClass: "CONTENT_SANITY",
        issue: "awkward_skip_line",
        component: "body",
        url: page.url,
        template: page.template,
        entity: page.entity,
        rootCause: `Awkward uniqueness-era skip line on ${page.path}`,
        excerpt: excerpt(blob),
      });
    }
  }
  return issues;
}
