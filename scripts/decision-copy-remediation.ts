import { mkdirSync, writeFileSync } from "node:fs";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import {
  classifyDecisionLine,
  resolveDecisionCopyForProduct,
  type DecisionLineClass,
} from "@/lib/decision-copy";
import { enrichGuideRecommendation } from "@/lib/best/enrich-guide-recommendation";
import { enrichReviewSubstance } from "@/lib/review/enrich-review-substance";
import {
  getBestGuides,
  getBrandById,
  getComparisons,
  getProductById,
  getProducts,
  getReviews,
} from "@/repositories";
import { getReviewByProduct } from "@/repositories/editorial";

const PROD = { isDev: false as const };

type CsvRow = {
  URL: string;
  entity: string;
  surface: string;
  before: string;
  after: string;
  classification_before: DecisionLineClass | "MISSING";
  classification_after: DecisionLineClass | "MISSING";
  source: string;
  evidence: string;
};

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function rowLine(row: CsvRow): string {
  return [
    row.URL,
    row.entity,
    row.surface,
    row.before,
    row.after,
    row.classification_before,
    row.classification_after,
    row.source,
    row.evidence,
  ]
    .map((v) => csvEscape(String(v ?? "")))
    .join(",");
}

function classify(line: string | undefined): DecisionLineClass | "MISSING" {
  if (!line?.trim()) return "MISSING";
  return classifyDecisionLine(line);
}

function pairLines(
  before: string[],
  after: string[],
): { before: string; after: string }[] {
  const n = Math.max(before.length, after.length);
  const out: { before: string; after: string }[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ before: before[i] ?? "", after: after[i] ?? "" });
  }
  return out;
}

const rows: CsvRow[] = [];
let indexableMachine = 0;
let indexableBroken = 0;
let allMachineAfter = 0;
let allBrokenAfter = 0;

function pushRow(row: CsvRow, indexable: boolean): void {
  rows.push(row);
  if (row.classification_after === "MACHINE_LIKE") {
    allMachineAfter += 1;
    if (indexable) indexableMachine += 1;
  }
  if (row.classification_after === "BROKEN") {
    allBrokenAfter += 1;
    if (indexable) indexableBroken += 1;
  }
}

function emitField(opts: {
  url: string;
  entity: string;
  surface: string;
  before: string[];
  after: string[];
  source: string;
  evidence: string;
  indexable: boolean;
}): void {
  for (const pair of pairLines(opts.before, opts.after)) {
    if (!pair.before && !pair.after) continue;
    pushRow(
      {
        URL: opts.url,
        entity: opts.entity,
        surface: opts.surface,
        before: pair.before,
        after: pair.after,
        classification_before: classify(pair.before),
        classification_after: classify(pair.after),
        source: opts.source,
        evidence: opts.evidence,
      },
      opts.indexable,
    );
  }
}

const products = getProducts(PROD);
const reviews = getReviews(PROD).filter((r) => r.status === "published");
const bestGuides = getBestGuides(PROD);
const comparisons = getComparisons(PROD);

for (const product of products) {
  const storedReview = getReviewByProduct(product.id, PROD);
  const brand = getBrandById(product.brandId, PROD);
  const review = storedReview
    ? enrichReviewSubstance(storedReview, product, brand)
    : undefined;
  const beforeBest = [
    ...(storedReview?.whoShouldBuy ?? []),
    ...product.strengths,
  ].slice(0, 4);
  const beforeNot = [
    ...(storedReview?.whoShouldAvoid ?? []),
    ...product.weaknesses,
  ].slice(0, 4);
  const copy = resolveDecisionCopyForProduct({ product, review });
  const url = `/products/${product.slug}`;
  const elig = getLaunchEligibility({ kind: "product", entity: product }, PROD);
  const indexable = isIndexableEligibility(elig);
  emitField({
    url,
    entity: product.slug,
    surface: "pdp-best-for",
    before: beforeBest,
    after: copy.bestFor,
    source: review ? "review.whoShouldBuy+product.strengths" : "product.strengths",
    evidence: "PDP glance Best for uses situation register",
    indexable,
  });
  emitField({
    url,
    entity: product.slug,
    surface: "pdp-not-ideal-for",
    before: beforeNot,
    after: copy.notIdealFor,
    source: review ? "review.whoShouldAvoid+product.weaknesses" : "product.weaknesses",
    evidence: "PDP Not ideal uses situation register",
    indexable,
  });
  emitField({
    url,
    entity: product.slug,
    surface: "pdp-buy-if",
    before: storedReview?.whoShouldBuy ?? beforeBest,
    after: copy.buyIf,
    source: "review.whoShouldBuy",
    evidence: "PDP Should you buy uses You-form, not Best For",
    indexable,
  });
  emitField({
    url,
    entity: product.slug,
    surface: "pdp-skip-if",
    before: storedReview?.whoShouldAvoid ?? beforeNot,
    after: copy.skipIf,
    source: "review.whoShouldAvoid",
    evidence: "PDP Skip if uses You-form, not Not ideal",
    indexable,
  });
  const altElig = getLaunchEligibility(
    { kind: "alternatives", entity: product },
    PROD,
  );
  emitField({
    url: `/products/${product.slug}/alternatives`,
    entity: product.slug,
    surface: "alternatives-best-for",
    before: product.useCaseIds.slice(0, 3),
    after: copy.bestFor.slice(0, 3),
    source: "product.useCaseIds → canonical bestFor",
    evidence: "Alternatives Best for is situation copy, not taxonomy",
    indexable: isIndexableEligibility(altElig),
  });
}

for (const review of reviews) {
  const product = getProductById(review.productId, PROD);
  if (!product) continue;
  const brand = getBrandById(product.brandId, PROD);
  const enriched = enrichReviewSubstance(review, product, brand);
  const copy = resolveDecisionCopyForProduct({ product, review: enriched });
  const url = `/reviews/${review.slug}`;
  const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
  const indexable = isIndexableEligibility(elig);
  emitField({
    url,
    entity: review.slug,
    surface: "review-best-for",
    before: review.whoShouldBuy ?? [],
    after: copy?.bestFor ?? [],
    source: "review.whoShouldBuy",
    evidence: "Glance / Who it's for uses situation register",
    indexable,
  });
  emitField({
    url,
    entity: review.slug,
    surface: "review-buy-if",
    before: review.whoShouldBuy ?? [],
    after: copy?.buyIf ?? [],
    source: "review.whoShouldBuy",
    evidence: "Verdict Buy if uses You-form",
    indexable,
  });
  emitField({
    url,
    entity: review.slug,
    surface: "review-not-ideal-for",
    before: review.whoShouldAvoid ?? [],
    after: copy?.notIdealFor ?? [],
    source: "review.whoShouldAvoid",
    evidence: "Who it's not for uses situation register",
    indexable,
  });
  emitField({
    url,
    entity: review.slug,
    surface: "review-skip-if",
    before: review.whoShouldAvoid ?? [],
    after: copy?.skipIf ?? [],
    source: "review.whoShouldAvoid",
    evidence: "Verdict Skip if uses You-form",
    indexable,
  });
  emitField({
    url,
    entity: review.slug,
    surface: "review-pros",
    before: review.pros ?? [],
    after: copy.pros,
    source: "review.pros",
    evidence: "Pros stay as product traits",
    indexable,
  });
  emitField({
    url,
    entity: review.slug,
    surface: "review-cons",
    before: review.cons ?? [],
    after: copy.cons,
    source: "review.cons",
    evidence: "Cons stay as product traits",
    indexable,
  });
}

for (const guide of bestGuides) {
  const url = `/best/${guide.slug}`;
  const elig = getLaunchEligibility({ kind: "best-guide", entity: guide }, PROD);
  const indexable = isIndexableEligibility(elig);
  const peers = guide.recommendations
    .map((entry) => {
      const product = getProductById(entry.productId, PROD);
      return product ? { product, entry } : undefined;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  for (const rec of peers) {
    const review = getReviewByProduct(rec.product.id, PROD);
    const brand = getBrandById(rec.product.brandId, PROD);
    const entry = enrichGuideRecommendation({
      guide,
      entry: rec.entry,
      product: rec.product,
      brand,
      review,
      peers,
      isTopPick: rec.entry === peers[0]?.entry,
    });
    emitField({
      url,
      entity: `${guide.slug}:${rec.product.slug}`,
      surface: "best-best-for",
      before: rec.entry.bestForProfiles ?? [],
      after: entry.bestForProfiles ?? [],
      source: "bestForProfiles",
      evidence: "Best guide Best for is situation copy",
      indexable,
    });
    emitField({
      url,
      entity: `${guide.slug}:${rec.product.slug}`,
      surface: "best-not-ideal-for",
      before: rec.entry.notIdealFor ?? rec.entry.whoShouldAvoid ?? [],
      after: entry.notIdealFor ?? [],
      source: "notIdealFor/whoShouldAvoid",
      evidence: "Not ideal is situation copy; Skip if is You-form",
      indexable,
    });
    emitField({
      url,
      entity: `${guide.slug}:${rec.product.slug}`,
      surface: "best-skip-if",
      before: rec.entry.whoShouldAvoid ?? rec.entry.notIdealFor ?? [],
      after: entry.whoShouldAvoid ?? [],
      source: "whoShouldAvoid",
      evidence: "Skip if derived from the same limitation evidence",
      indexable,
    });
  }
}

for (const cmp of comparisons) {
  const url = `/compare/${cmp.slug}`;
  const elig = getLaunchEligibility({ kind: "comparison", entity: cmp }, PROD);
  const indexable = isIndexableEligibility(elig);
  for (const productId of cmp.productIds) {
    const product = products.find((p) => p.id === productId);
    if (!product) continue;
    const review = getReviewByProduct(product.id, PROD);
    const copy = resolveDecisionCopyForProduct({ product, review });
    emitField({
      url,
      entity: `${cmp.slug}:${product.slug}`,
      surface: "comparison-best-for",
      before: product.strengths.slice(0, 3),
      after: copy.bestFor.slice(0, 2),
      source: "product.strengths",
      evidence: "Comparison Best for uses situation labels",
      indexable,
    });
  }
}

const beforeMachine = rows.filter((r) => r.classification_before === "MACHINE_LIKE").length;
const beforeBroken = rows.filter((r) => r.classification_before === "BROKEN").length;
const beforeWordy = rows.filter((r) => r.classification_before === "WORDY").length;
const afterGood = rows.filter((r) => r.classification_after === "GOOD").length;

const md = `# Decision copy remediation

This workstream makes consumer decision copy the easiest part of Kitletics to scan.
A visitor should understand **yes, this is probably for me** or **no, this is probably not** within seconds.

It does **not** generate section images. It does **not** declare the overall site fixed.

## Canonical model

The site had too many overlapping fields that were independently generated and then rendered as duplicates. Stored source of truth is unchanged. We did not add four new independently authored fields.

Page-time \`resolveCanonicalDecisionCopy\` produces **one model, two registers**:

| Register | Fields | Voice | Example |
| --- | --- | --- | --- |
| Situation glance | Best For, Not Ideal For, Who it's for / not | Buyer/use situations | Daily training with a soft, energetic ride. |
| Decision | Buy If, Skip If | Second person | You're looking for a soft, energetic daily trainer. |
| Traits | Pros, Cons | Product traits | Soft energetic daily ride with rocker geometry. |

Best For is derived from Buy If. They must not be the same string.

## Surfaces

- Review — glance / Who it's for = situation; verdict Buy if / Skip if = You-form
- PDP — hero Best for is a situation, not use-case taxonomy; review module Best for ≠ Buy if
- Best guides, comparisons, alternatives, catalog cards, finder role labels

Buying-guide explainer chips stay educational labels, not product Buy If blocks.

## Classifier

Deterministic classes: \`MACHINE_LIKE\`, \`WORDY\`, \`GENERIC\`, \`REPETITIVE\`, \`CONFUSING\`, \`BROKEN\`, \`GOOD\`.

Indexable product/review decision copy must not contain \`MACHINE_LIKE\` or \`BROKEN\`. Publication and launch assessment block those classes after resolve.

## Estate scan

Full published estate. Not a sample.

| Metric | Count |
| --- | ---: |
| Decision lines scanned | ${rows.length} |
| MACHINE_LIKE before | ${beforeMachine} |
| BROKEN before | ${beforeBroken} |
| WORDY before | ${beforeWordy} |
| GOOD after | ${afterGood} |
| MACHINE_LIKE after (all) | ${allMachineAfter} |
| BROKEN after (all) | ${allBrokenAfter} |
| MACHINE_LIKE after (indexable) | ${indexableMachine} |
| BROKEN after (indexable) | ${indexableBroken} |

Published products: ${products.length}. Published reviews: ${reviews.length}. Best guides: ${bestGuides.length}. Comparisons: ${comparisons.length}.

CSV: \`docs/remediation/data/DECISION-COPY-REMEDIATION.csv\`

## Code

- \`src/lib/decision-copy/\` — types, classifier, transforms, resolver
- \`src/lib/review/audience-signals.ts\` — keep GOOD/WORDY consumer lines; rebuild only MACHINE / BROKEN / CONFUSING
- \`src/lib/review/enrich-review-substance.ts\` — apply canonical Buy/Skip when salvage has ≥2 lines
- Publication gates in \`can-publish.ts\` and \`assess-review-quality.ts\`

Re-run: \`npx tsx --tsconfig tsconfig.json scripts/decision-copy-remediation.ts\`
`;

mkdirSync("docs/remediation/data", { recursive: true });
writeFileSync(
  "docs/remediation/data/DECISION-COPY-REMEDIATION.csv",
  [
    "URL,entity,surface,before,after,classification_before,classification_after,source,evidence",
    ...rows.map(rowLine),
  ].join("\n"),
);
writeFileSync("docs/remediation/DECISION-COPY-REMEDIATION.md", md);
writeFileSync(
  "docs/remediation/data/decision-copy-remediation-stats.json",
  JSON.stringify(
    {
      rows: rows.length,
      beforeMachine,
      beforeBroken,
      beforeWordy,
      afterGood,
      allMachineAfter,
      allBrokenAfter,
      indexableMachine,
      indexableBroken,
      products: products.length,
      reviews: reviews.length,
      bestGuides: bestGuides.length,
      comparisons: comparisons.length,
    },
    null,
    2,
  ),
);

console.log(
  JSON.stringify(
    {
      rows: rows.length,
      beforeMachine,
      beforeBroken,
      indexableMachine,
      indexableBroken,
      allMachineAfter,
      allBrokenAfter,
    },
    null,
    2,
  ),
);

if (indexableMachine > 0 || indexableBroken > 0) {
  process.exitCode = 1;
}
