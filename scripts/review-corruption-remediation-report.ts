/**
 * One-shot inventory for docs/remediation/REVIEW-CORRUPTION-REMEDIATION.md
 */
import { mkdirSync, writeFileSync } from "node:fs";
import {
  rankedReviewCandidates,
  reviewMergeDecisions,
} from "@/content/reviews";
import { selectFirstWinsBySlug } from "@/content/review-source-precedence";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { reviewsP53Differentiation } from "@/content/reviews-p53-differentiation";
import { reviewsP54HeldFinalized } from "@/content/reviews-p54-held-finalized";
import { reviewsUniqueRewrite } from "@/content/reviews-unique-rewrite";

const PROD = { isDev: false as const };

const firstWins = selectFirstWinsBySlug(rankedReviewCandidates);
const corruptedBefore = firstWins.filter((c) =>
  containsPublicContentCorruption(c.review),
);
const restored = reviewMergeDecisions.filter((d) => {
  const before = firstWins.find((c) => c.review.slug === d.review.slug);
  if (!before) return false;
  return (
    containsPublicContentCorruption(before.review) &&
    !d.corrupted &&
    (d.classification === "A" || d.classification === "B")
  );
});
const classA = reviewMergeDecisions.filter((d) => d.classification === "A");
const classB = reviewMergeDecisions.filter((d) => d.classification === "B");
const classC = reviewMergeDecisions.filter((d) => d.classification === "C");
const classD = reviewMergeDecisions.filter((d) => d.classification === "D");
const held = reviewMergeDecisions.filter((d) => {
  if (!d.corrupted) return false;
  const elig = getLaunchEligibility(
    { kind: "review", entity: d.review },
    PROD,
  );
  return elig.disposition === "HIDDEN_404" || elig.disposition === "PUBLIC_NOINDEX";
});
const indexableCorrupt = reviewMergeDecisions.filter((d) => {
  if (!containsPublicContentCorruption(d.review)) return false;
  return isIndexableEligibility(
    getLaunchEligibility({ kind: "review", entity: d.review }, PROD),
  );
});

function tokenCount(reviews: { slug: string }[], label: string) {
  const rows = reviews.filter((r) => containsPublicContentCorruption(r));
  return { label, total: reviews.length, tokenBearing: rows.length };
}

const sources = [
  tokenCount(reviewsP54HeldFinalized, "P54 uniqueness overlay"),
  tokenCount(reviewsP53Differentiation, "P53 uniqueness overlay"),
  tokenCount(reviewsUniqueRewrite, "unique-rewrite generated research"),
];

const winnersBySource = reviewMergeDecisions.reduce<Record<string, number>>(
  (acc, d) => {
    acc[d.source] = (acc[d.source] ?? 0) + 1;
    return acc;
  },
  {},
);

const restoredSlugs = restored.map((d) => d.review.slug).sort();
const rewriteSlugs = classC.map((d) => d.review.slug).sort();
const heldSlugs = held.map((d) => d.review.slug).sort();

const md = `# Review corruption remediation

This workstream fixes the **uniqueness-token architecture** only.
It does **not** declare the overall site fixed.

## Target

**PUBLIC/INDEXABLE CORRUPTED REVIEWS = ${indexableCorrupt.length}**

## Root cause (confirmed)

\`unique-expert-research.ts\` uniqueness stamps → P53/P54 JSON →
\`reviews.ts\` first-wins merge → Review → PDP / alternatives / brands / author.

The generator no longer emits \`skuslug\` / \`skuid\` / concatenated-token
sentences. Merge order is no longer business logic.

## Counts

| Metric | Count |
| --- | ---: |
| Corrupted winning reviews **before** (first-wins) | ${corruptedBefore.length} |
| Clean reviews restored (A/B; overlay no longer wins) | ${restored.length} |
| Class A (clean handwritten / genuine rewrite wins) | ${classA.length} |
| Class B (clean generated-research alternate wins) | ${classB.length} |
| Reviews requiring rewrite (class C) | ${classC.length} |
| Temporarily held (corrupted winner → HIDDEN_404 / noindex) | ${held.length} |
| Class D (not currently public: draft/scheduled/archived/noindex) | ${classD.length} |
| Public/indexable corrupted reviews **after** | ${indexableCorrupt.length} |

### Winning source mix after precedence

| Source | Winning reviews |
| --- | ---: |
${Object.entries(winnersBySource)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join("\n")}

## Remaining token-bearing source records

These JSON overlays remain on disk as source records. They must not win
publicly when a clean candidate exists; if they are the only candidate they
are held, not regex-stripped.

| Source | Records | Token-bearing |
| --- | ---: | ---: |
${sources.map((s) => `| ${s.label} | ${s.total} | ${s.tokenBearing} |`).join("\n")}

## Clean reviews restored (A/B)

${restoredSlugs.length ? `<details>
<summary>${restoredSlugs.length} slugs</summary>

${restoredSlugs.map((s) => `- \`${s}\``).join("\n")}

</details>` : "_None — first-wins already matched precedence for clean winners._"}

## Reviews requiring editorial regeneration (class C)

Do not salvage identifier-stuffed overlay JSON by deleting tokens.
${rewriteSlugs.length
  ? `The following public winners have no clean source and are held until editorial rewrite.`
  : "Every slug that had a token-bearing overlay also had a clean handwritten/curated candidate, so precedence restored that copy rather than holding a stamped overlay. P53/P54 records remain on disk for audit and must not be re-selected as public copy."}

<details>
<summary>${rewriteSlugs.length} slugs</summary>

${rewriteSlugs.map((s) => `- \`${s}\``).join("\n")}

</details>

## Temporarily held

Publication policy: \`assessReviewLaunchQuality\` → \`BLOCKED\` → \`HIDDEN_404\`.
Review pages and PDP review summaries refuse corrupted objects.

<details>
<summary>${heldSlugs.length} slugs</summary>

${heldSlugs.map((s) => `- \`${s}\``).join("\n")}

</details>

## Defence in depth

1. Generator: \`synthesizeUniqueExpertResearch\` no longer stamps public copy;
   returns \`NEEDS_RESEARCH\` if corruption is still detected.
2. Merge: \`src/content/review-source-precedence.ts\` — handwritten >
   genuine rewrite > generated research > uniqueness overlay; skip corrupted
   candidates when a clean one exists.
3. Detector: \`containsPublicContentCorruption\` in
   \`src/lib/review/public-content-corruption.ts\`.
4. Publication: corruption is a **BLOCKER** (\`PUBLIC_CONTENT_CORRUPTION\`),
   including site-quality \`CONTENT-CORRUPTION\`.
5. Consumers: review page, PDP, PDP review summary, and alternatives will not
   assemble corrupted review copy.

## Out of scope

Image mismatches, machine-like Buy/Skip templates without tokens, and
full editorial rewrites of class C reviews.
`;

mkdirSync("docs/remediation", { recursive: true });
writeFileSync("docs/remediation/REVIEW-CORRUPTION-REMEDIATION.md", md);
console.log(
  JSON.stringify(
    {
      corruptedBefore: corruptedBefore.length,
      restored: restored.length,
      classA: classA.length,
      classB: classB.length,
      classC: classC.length,
      classD: classD.length,
      held: held.length,
      indexableCorrupt: indexableCorrupt.length,
      winnersBySource,
      sources,
    },
    null,
    2,
  ),
);
