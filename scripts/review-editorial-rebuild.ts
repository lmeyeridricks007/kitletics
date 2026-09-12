/**
 * Rebuild reviews that have no acceptable consumer editorial source.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { publishedMeta } from "@/content/config";
import { rankedReviewCandidates } from "@/content/reviews";
import { selectWinningReviewDecisions } from "@/content/review-source-precedence";
import { synthesizeUniqueExpertResearch } from "@/domain/review-agent/unique-expert-research";
import { assessConsumerCopyQuality } from "@/lib/review/consumer-copy-quality";
import {
  consumerRebuildPasses,
  mergeConsumerRebuild,
} from "@/lib/review/rebuild-consumer-editorial";
import {
  getBrandById,
  getProductById,
} from "@/repositories";
import type { Review } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";

const PROD = { isDev: true as const };
const pub = publishedMeta();

const rebuilt: Review[] = [];
const kept: string[] = [];
const held: { slug: string; reasons: string[] }[] = [];
const beforeReasons: Record<string, number> = {};
let beforeFail = 0;
let beforeMachine = 0;

const baselineDecisions = selectWinningReviewDecisions(
  rankedReviewCandidates.filter((c) => c.source !== "editorial_rebuild"),
);

for (const decision of baselineDecisions) {
  const current = decision.review;
  if (current.status !== "published") continue;
  const before = assessConsumerCopyQuality(current);
  if (before.ok) {
    kept.push(current.slug);
    continue;
  }
  beforeFail += 1;
  if (before.machineTemplate) beforeMachine += 1;
  for (const r of before.reasons) {
    beforeReasons[r] = (beforeReasons[r] ?? 0) + 1;
  }

  const product = getProductById(current.productId, PROD) as Product | undefined;
  if (!product) {
    held.push({ slug: current.slug, reasons: ["missing_product", ...before.reasons] });
    continue;
  }
  const brand = getBrandById(product.brandId, PROD);
  const alternatives = (product.alternativeProductIds ?? [])
    .map((id) => getProductById(id, PROD))
    .filter((p): p is Product => Boolean(p));

  const result = synthesizeUniqueExpertResearch(product, {
    brandName: brand?.name,
    alternatives,
    evidenceIds:
      current.evidenceIds?.length > 0
        ? current.evidenceIds
        : ["ev-catalog-mfr", "ev-catalog-editorial"],
    existing: {
      ...current,
      ...pub,
      status: "published",
    },
    allowThinCatalog: true,
  });

  if ("status" in result && result.status === "NEEDS_RESEARCH") {
    held.push({
      slug: current.slug,
      reasons: result.gaps.length ? result.gaps : before.reasons,
    });
    continue;
  }

  const synthesized = result as Review;
  const merged = mergeConsumerRebuild(current, {
    ...synthesized,
    ...pub,
    status: "published",
    id: current.id,
    slug: current.slug,
    productId: product.id,
    reviewType: current.reviewType,
  });
  const next = consumerRebuildPasses(merged) ? merged : synthesized;
  const after = assessConsumerCopyQuality(next);
  if (!after.ok) {
    held.push({ slug: current.slug, reasons: after.reasons });
    continue;
  }
  rebuilt.push({
    ...next,
    ...pub,
    status: "published",
    id: current.id,
    slug: current.slug,
    productId: product.id,
  });
}

mkdirSync("src/content", { recursive: true });
mkdirSync("docs/remediation/data", { recursive: true });
writeFileSync(
  "src/content/reviews-editorial-rebuild.json",
  `${JSON.stringify(rebuilt, null, 2)}\n`,
);
writeFileSync(
  "docs/remediation/data/review-editorial-rebuild-stats.json",
  `${JSON.stringify(
    {
      before: {
        publishedKept: kept.length,
        publishedFail: beforeFail,
        machineTemplate: beforeMachine,
        reasons: beforeReasons,
      },
      rebuilt: rebuilt.length,
      held: held.length,
      heldReasons: held.slice(0, 40),
      rebuiltSlugs: rebuilt.map((r) => r.slug),
      keptSlugs: kept,
      heldSlugs: held.map((h) => h.slug),
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    {
      kept: kept.length,
      rebuilt: rebuilt.length,
      held: held.length,
      beforeFail,
      beforeMachine,
      beforeReasons,
      heldSample: held.slice(0, 12),
    },
    null,
    2,
  ),
);
