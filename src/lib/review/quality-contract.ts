/**
 * Fix 85 — one review-quality severity contract across launch, article audit,
 * and site:audit. Implementations may differ; semantics must not contradict.
 *
 * Publication quality evaluates **user-visible enriched decision copy**.
 * Source-seed hygiene is a separate LOW diagnostic.
 */

/** Site-quality / release severities. */
export type ReviewReleaseSeverity =
  | "BLOCKER"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFO";

/** Article-auditor severities (mapped onto the release contract). */
export type ReviewArticleSeverityLabel = "P0" | "P1" | "P2" | "info";

/**
 * Shared meaning of severities.
 *
 * BLOCKER / article P0 — genuinely release-critical on the **enriched page**:
 *   broken buy decision (no verdict / audience), unsupported first-hand,
 *   junk/report voice on decision copy, missing authentic hero on a published
 *   review, missing method disclosure, critically short page, publish-gate fail.
 *
 * HIGH / article P1 — should not ship as flagship polish; launch may still be
 *   LAUNCH_READY / READY (depth, alts, section images, scores).
 *
 * MEDIUM / article P2 — ideal-band polish (length band, second-person).
 *
 * LOW — source-seed hygiene or monitor-only uniqueness; **not** user-facing P0
 *   when the enriched page is clean.
 *
 * INFO — baselines / resolved checks.
 */
export const REVIEW_QUALITY_SEVERITY_MEANING = {
  BLOCKER:
    "Release-critical on user-visible enriched content — do not treat as flagship-ready.",
  HIGH: "Serious quality gap; fix before featuring as a template, may still be INDEXABLE.",
  MEDIUM: "Polish / ideal-band gap — not a launch blocker.",
  LOW: "Diagnostic (e.g. source-seed residue) — not a user-facing release P0 when enriched output is clean.",
  INFO: "Baseline or resolved check.",
} as const;

/** Map article-auditor severity → site:audit severity. */
export function articleSeverityToRelease(
  severity: ReviewArticleSeverityLabel,
): ReviewReleaseSeverity {
  switch (severity) {
    case "P0":
      return "BLOCKER";
    case "P1":
      return "HIGH";
    case "P2":
      return "MEDIUM";
    case "info":
      return "INFO";
  }
}

/**
 * Fields that are methodology / affiliate disclosure — legitimate “Expert Research”
 * wording lives here and must NOT be scored as junk decision voice.
 */
export const REVIEW_DISCLOSURE_FIELD_KEYS = [
  "testingContext",
  "editorialDisclosure",
] as const;

export type ReviewDecisionCopyParts = {
  summary?: string | null;
  verdict?: string | null;
  bottomLine?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  whoShouldBuy?: string[] | null;
  whoShouldAvoid?: string[] | null;
  sections?: Array<{ heading?: string; body?: string }> | null;
};

/** User-visible decision copy only (excludes disclosure fields). */
export function reviewDecisionCopyText(parts: ReviewDecisionCopyParts): string {
  return [
    parts.summary,
    parts.verdict,
    parts.bottomLine,
    ...(parts.pros ?? []),
    ...(parts.cons ?? []),
    ...(parts.whoShouldBuy ?? []),
    ...(parts.whoShouldAvoid ?? []),
    ...(parts.sections ?? []).map((s) => `${s.heading ?? ""}\n${s.body ?? ""}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}
