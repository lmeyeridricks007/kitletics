import { inspectPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { excerpt, joinVisible } from "../flatten";
import type { RenderedIssue, VisiblePage } from "../types";

export function gateTokenLeak(pages: VisiblePage[], startId: number): RenderedIssue[] {
  const issues: RenderedIssue[] = [];
  let n = startId;
  for (const page of pages) {
    if (!page.assembled) continue;
    const blob = joinVisible(page.components);
    const hits = inspectPublicContentCorruption(blob);
    if (!hits.length) continue;
    const componentHit =
      page.components.find((c) => inspectPublicContentCorruption(c.text).length > 0) ??
      page.components[0];
    issues.push({
      id: `RQ-${String(++n).padStart(5, "0")}`,
      severity: "BLOCKER",
      gate: "token-leak",
      issueClass: "TOKEN_LEAK",
      issue: hits.join("|"),
      component: componentHit?.id ?? "page",
      url: page.url,
      template: page.template,
      entity: page.entity,
      rootCause: `Internal/token leak in rendered ${page.entity.kind}:${page.entity.slug} (${hits.join(", ")})`,
      excerpt: excerpt(componentHit?.text ?? blob),
    });
  }
  return issues;
}
