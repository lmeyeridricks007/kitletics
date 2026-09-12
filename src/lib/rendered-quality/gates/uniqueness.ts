import {
  analysisTokens,
  classifyUniqueness,
  scaffoldHitCount,
  scrubEntityNames,
  uniqueAnalysisRatio,
} from "@/domain/content-uniqueness/text";
import { excerpt, joinVisible } from "../flatten";
import type { RenderedIssue, VisiblePage } from "../types";

function analysisSet(text: string): Set<string> {
  return new Set(analysisTokens(text));
}

function setJaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Gate 6 — uniqueness of analysis, not identifiers.
 * SKUs/slugs/spec dumps contribute zero. Domain language is not penalized.
 */
export function gateUniqueness(
  pages: VisiblePage[],
  startId: number,
): RenderedIssue[] {
  const reviews = pages.filter(
    (p) => p.assembled && (p.template === "review" || p.entity.kind === "review"),
  );
  const issues: RenderedIssue[] = [];
  let n = startId;

  const items = reviews.map((p) => {
    const text = joinVisible(
      p.components.filter((c) => c.text.trim().split(/\s+/).length >= 12),
    );
    const names = [p.entity.slug.replace(/-/g, " "), p.entity.slug];
    const scrubbed = scrubEntityNames(text, names);
    return {
      page: p,
      text,
      scrubbed,
      tokens: analysisSet(scrubbed),
    };
  });

  for (let i = 0; i < items.length; i++) {
    const a = items[i]!;
    let max = 0;
    let peer: VisiblePage | undefined;
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue;
      const s = setJaccard(a.tokens, items[j]!.tokens);
      if (s > max) {
        max = s;
        peer = items[j]!.page;
      }
    }
    const cls = classifyUniqueness({
      maxPeerSimilarity: max,
      scaffoldHits: scaffoldHitCount(a.text),
      uniqueSignalRatio: uniqueAnalysisRatio(a.text),
    });
    if (cls !== "DUPLICATIVE" && cls !== "NEEDS_DIFFERENTIATION") continue;
    issues.push({
      id: `RQ-${String(++n).padStart(5, "0")}`,
      severity: cls === "DUPLICATIVE" ? "HIGH" : "MEDIUM",
      gate: "uniqueness",
      issueClass: "UNIQUENESS",
      issue: cls,
      component: "body",
      url: a.page.url,
      template: a.page.template,
      entity: a.page.entity,
      rootCause: peer
        ? `Analysis similarity ${max.toFixed(2)} vs ${peer.path} (identifiers excluded)`
        : `Analysis class ${cls}`,
      excerpt: excerpt(a.text, 160),
    });
  }
  return issues;
}
