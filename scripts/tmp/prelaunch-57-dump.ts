/**
 * Fix 57 dump — remaining uniqueness slugs, broken alt targets, generic indexable cmps.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getComparisons, getProducts, getProductById } from "@/repositories";
import { getAllProductRelationships } from "@/repositories/relationships";
import { isAlternativeType } from "@/domain/relationships/types";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch/get-launch-eligibility";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";

const report = JSON.parse(
  readFileSync(
    join(process.cwd(), "docs/prelaunch/data/57-cmp-alt-validation.json"),
    "utf8",
  ),
);
const PROD = { isDev: false as const };

const products = getProducts(PROD);
const rels = getAllProductRelationships();
const publishedCmp = getComparisons(PROD);

const generic = new Set(report.comparisons.genericVerdicts as string[]);
console.log("GENERIC verdicts indexable?");
for (const slug of generic) {
  const cmp = publishedCmp.find((c) => c.slug === slug);
  if (!cmp) {
    console.log("  MISSING", slug);
    continue;
  }
  const elig = getLaunchEligibility({ kind: "comparison", entity: cmp }, PROD);
  console.log(
    `  ${slug}  ${elig.disposition}  indexable=${isIndexableEligibility(elig)}`,
  );
}

console.log("\nCMP uniqueness by indexable:");
const needs = report.comparisons.needsDiffRows as { slug: string; indexable: boolean; maxSim: number; peer: string }[];
console.log("  needsDiff indexable", needs.filter((n) => n.indexable).length);
console.log("  needsDiff hidden", needs.filter((n) => !n.indexable).length);

console.log("\nALT NEEDS_DIFF all:");
for (const r of report.alternatives.needsDiffRows as { slug: string; maxSim: number; peer: string }[]) {
  console.log(`  ${r.slug} <-> ${r.peer} ${r.maxSim}`);
}
console.log("worst extra:");
for (const w of report.alternatives.worstPeers as { slug: string; peer: string; sim: number; uniqueness: string }[]) {
  if (w.uniqueness === "NEEDS_DIFFERENTIATION") {
    console.log(`  ${w.slug} <-> ${w.peer} ${w.sim}`);
  }
}

console.log("\nBROKEN ALT TARGETS:");
for (const p of products) {
  const sourceAlts = rels.filter(
    (r) =>
      r.sourceProductId === p.id &&
      r.status === "approved" &&
      isAlternativeType(r.type),
  );
  for (const r of sourceAlts) {
    const t = getProductById(r.targetProductId, PROD);
    if (!t) {
      const any = getProductById(r.targetProductId, { isDev: true });
      console.log(
        `  ${p.slug} -> ${r.targetProductId} type=${r.type} status=${any?.status ?? "MISSING"} slug=${any?.slug ?? "?"}`,
      );
    }
  }
}

const sample = ["polar-verity-sense", "coros-heart-rate-monitor", "asics-novablast-5"];
console.log("\nSAMPLE INTROS:");
for (const slug of sample) {
  const data = getAlternativesPageData(slug, PROD);
  console.log("\n===", slug, "alts", data?.alternatives.length);
  console.log("INTRO:", data?.source.intro);
  console.log("FIRST WHY:", data?.alternatives[0]?.whyAlternative);
  console.log("FIRST SWITCH:", data?.alternatives[0]?.whoShouldSwitch);
}
