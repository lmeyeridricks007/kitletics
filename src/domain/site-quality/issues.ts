import type { IssueArea, IssueOwner, IssueSeverity, SiteIssue } from "./types";

let counters: Record<string, number> = {};

export function resetIssueCounters(): void {
  counters = {};
}

export function issue(
  prefix: string,
  severity: IssueSeverity,
  area: IssueArea,
  input: Omit<SiteIssue, "id" | "severity" | "area" | "status"> & {
    status?: SiteIssue["status"];
    idSuffix?: string;
  },
): SiteIssue {
  const key = prefix;
  counters[key] = (counters[key] ?? 0) + 1;
  const n = String(counters[key]).padStart(3, "0");
  const id = input.idSuffix ? `${prefix}-${input.idSuffix}` : `${prefix}-${n}`;
  const { idSuffix: _drop, status, ...rest } = input;
  return {
    id,
    severity,
    area,
    status: status ?? "open",
    ...rest,
  };
}

export function countBySeverity(issues: SiteIssue[]): Record<IssueSeverity, number> {
  const counts: Record<IssueSeverity, number> = {
    BLOCKER: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };
  for (const i of issues) counts[i.severity] += 1;
  return counts;
}

export function defaultOwner(area: IssueArea): IssueOwner {
  if (area === "content" || area === "guide" || area === "review" || area === "best-guide") {
    return "Editorial";
  }
  if (area === "commercial" || area === "backlinks") return "Commercial";
  if (area === "seo" || area === "technical-seo" || area === "indexation") return "SEO";
  return "Engineering";
}
