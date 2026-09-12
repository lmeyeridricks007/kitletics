import type { RenderedIssue, VisiblePage } from "../types";

function sourceKey(page: VisiblePage): string {
  const src = page.source ?? page.entity;
  return `${src.kind}:${src.slug}`;
}

/**
 * Gate 5 — one upstream corruption → one root-cause issue + all placements.
 * Does not invent new detectors; it collapses already-found issues.
 */
export function gateCrossSurface(
  pages: VisiblePage[],
  issues: RenderedIssue[],
): RenderedIssue[] {
  const bySource = new Map<string, VisiblePage[]>();
  for (const page of pages) {
    if (!page.assembled) continue;
    const key = sourceKey(page);
    const list = bySource.get(key) ?? [];
    list.push(page);
    bySource.set(key, list);
  }

  const grouped = new Map<string, RenderedIssue[]>();
  for (const issue of issues) {
    const page = pages.find((p) => p.url === issue.url);
    const key = `${page ? sourceKey(page) : issue.entity.kind + ":" + issue.entity.slug}|${issue.issueClass}|${issue.issue}`;
    const list = grouped.get(key) ?? [];
    list.push(issue);
    grouped.set(key, list);
  }

  const collapsed: RenderedIssue[] = [];
  const seen = new Set<string>();
  for (const [key, group] of grouped) {
    if (group.length === 1) {
      collapsed.push(group[0]!);
      continue;
    }
    const primary = group[0]!;
    const placements = [...new Set(group.map((g) => g.url))].sort();
    const id = `${primary.id}-X`;
    if (seen.has(key)) continue;
    seen.add(key);
    collapsed.push({
      ...primary,
      id,
      gate: "cross-surface",
      issueClass: "CROSS_SURFACE",
      rootCause: `${primary.rootCause} · ${placements.length} surfaces`,
      placements,
    });
  }

  void bySource;
  return collapsed;
}

export function rootCausesFrom(issues: RenderedIssue[]): Array<{
  rootCause: string;
  severity: RenderedIssue["severity"];
  issue: string;
  placements: string[];
}> {
  const map = new Map<
    string,
    { rootCause: string; severity: RenderedIssue["severity"]; issue: string; urls: Set<string> }
  >();
  const rank = { BLOCKER: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  for (const issue of issues) {
    const key = `${issue.issueClass}|${issue.issue}|${issue.entity.kind}:${issue.entity.slug}`;
    const prev = map.get(key);
    const urls = new Set(issue.placements?.length ? issue.placements : [issue.url]);
    if (!prev) {
      map.set(key, {
        rootCause: issue.rootCause,
        severity: issue.severity,
        issue: issue.issue,
        urls,
      });
      continue;
    }
    for (const u of urls) prev.urls.add(u);
    if (rank[issue.severity] < rank[prev.severity]) prev.severity = issue.severity;
  }
  return [...map.values()]
    .map((r) => ({
      rootCause: r.rootCause,
      severity: r.severity,
      issue: r.issue,
      placements: [...r.urls].sort(),
    }))
    .sort((a, b) => rank[a.severity] - rank[b.severity] || a.rootCause.localeCompare(b.rootCause));
}
