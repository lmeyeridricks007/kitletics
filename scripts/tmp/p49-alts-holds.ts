import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import { ALTERNATIVES_INDEXABLE_CATEGORIES } from "@/lib/product/alternative-decision-copy";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import { assessEditorialReadiness, getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { getAllProductRelationships, getProductBySlug } from "@/repositories";

const PROD = { isDev: false as const };
const rels = getAllProductRelationships();

for (const slug of [...ALTERNATIVES_UNIQUENESS_HOLD_SLUGS].sort()) {
  const p = getProductBySlug(slug, PROD);
  if (!p) { console.log(slug, "MISSING"); continue; }
  const running = resolveEntityVerticalPolicy(p.sportIds ?? []).slug === "running";
  const gate = canPublishAlternativesPage(p, rels);
  // Assess as if not uniqueness-held: check dimensions except uniqueness
  const editorial = assessEditorialReadiness({ kind: "alternatives", entity: p }, PROD);
  const elig = getLaunchEligibility({ kind: "alternatives", entity: p }, PROD);
  console.log(JSON.stringify({
    slug,
    running,
    categoryOk: ALTERNATIVES_INDEXABLE_CATEGORIES.has(p.categoryId),
    publishOk: gate.ok,
    publishReasons: gate.reasons,
    ready: editorial.ready,
    gaps: editorial.gaps,
    indexable: isIndexableEligibility(elig),
    eligReasons: elig.reasons.map(r=>r.code),
  }));
}
