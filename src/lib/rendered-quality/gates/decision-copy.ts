import {
  classifyDecisionLine,
  classifyDecisionList,
} from "@/lib/decision-copy/classify";
import type { DecisionLineClass, DecisionRole } from "@/lib/decision-copy/types";
import { excerpt } from "../flatten";
import type { RenderedIssue, RenderedSeverity, VisiblePage } from "../types";

function severityOf(cls: DecisionLineClass): RenderedSeverity | null {
  if (cls === "MACHINE_LIKE" || cls === "BROKEN") return "BLOCKER";
  if (cls === "CONFUSING" || cls === "WORDY") return "HIGH";
  if (cls === "GENERIC" || cls === "REPETITIVE") return "MEDIUM";
  return null;
}

const ROLES: Array<{ key: DecisionRole; field: keyof NonNullable<VisiblePage["decision"]> }> = [
  { key: "bestFor", field: "bestFor" },
  { key: "notIdealFor", field: "notIdealFor" },
  { key: "buyIf", field: "buyIf" },
  { key: "skipIf", field: "skipIf" },
  { key: "pro", field: "pros" },
  { key: "con", field: "cons" },
];

export function gateDecisionCopy(
  pages: VisiblePage[],
  startId: number,
): RenderedIssue[] {
  const issues: RenderedIssue[] = [];
  let n = startId;
  for (const page of pages) {
    if (!page.assembled || !page.decision) continue;
    for (const role of ROLES) {
      const lines = page.decision[role.field];
      const classes = classifyDecisionList(lines);
      lines.forEach((line, i) => {
        const cls = classes[i] ?? classifyDecisionLine(line);
        const severity = severityOf(cls);
        if (!severity) return;
        issues.push({
          id: `RQ-${String(++n).padStart(5, "0")}`,
          severity,
          gate: "decision-copy",
          issueClass: "DECISION_COPY",
          issue: `${role.field}:${cls}`,
          component: `decision.${role.field}[${i}]`,
          url: page.url,
          template: page.template,
          entity: page.entity,
          rootCause: `Rendered ${role.field} on ${page.entity.kind}:${page.entity.slug} classified ${cls}`,
          excerpt: excerpt(line, 200),
        });
      });
    }
  }
  return issues;
}
