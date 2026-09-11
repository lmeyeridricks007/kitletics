/**
 * Editorial 42 — verify alternatives decision quality + uniqueness (eligible pages).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getProducts } from "@/repositories";
import { getAllProductRelationships } from "@/repositories/relationships";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch/get-launch-eligibility";
import {
  textSimilarity,
  scrubEntityNames,
  classifyUniqueness,
} from "@/domain/content-uniqueness/text";
import { isAlternativeType } from "@/domain/relationships/types";

const OUT = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(OUT, { recursive: true });

const prod = { isDev: false as const };
const products = getProducts(prod);
const rels = getAllProductRelationships();
const altRels = rels.filter(
  (r) => r.status === "approved" && isAlternativeType(r.type),
);

let syncTemplateHits = 0;
for (const r of altRels) {
  for (const reason of r.reasons) {
    if (/same-category alternative when you want a peer/i.test(reason)) {
      syncTemplateHits++;
    }
  }
}

type PageRow = {
  slug: string;
  altCount: number;
  reasonTypes: number;
  hasWorse: boolean;
  hasStay: boolean;
  hasSwitch: boolean;
  eligibilityOk: boolean;
  pageIndexable: boolean;
  launchIndexable: boolean;
  class: string;
  maxPeerSimilarity: number;
  peerSlug?: string;
};

const pages: PageRow[] = [];
const texts: { slug: string; text: string; names: string[] }[] = [];

let builtWithAlts = 0;
let substantiveEligible = 0;

for (const p of products) {
  const gate = canPublishAlternativesPage(p, rels);
  const data = getAlternativesPageData(p.slug, prod);
  if (!data || data.alternatives.length === 0) continue;
  builtWithAlts++;

  const elig = getLaunchEligibility(
    { kind: "alternatives", entity: p },
    prod,
  );

  if (gate.ok && data.indexable) substantiveEligible++;

  // Uniqueness only among page-indexable substantive pages
  if (!data.indexable) continue;

  const blob = [
    data.source.intro,
    ...data.alternatives.map(
      (a) =>
        `${a.badgeLabel}\n${a.whyAlternative}\n${a.betterAt.join("\n")}\n${a.worseAt.join("\n")}\n${a.whoShouldSwitch}\n${a.whoShouldStay}`,
    ),
  ].join("\n\n");

  const names = [
    p.fullName,
    p.name,
    ...data.alternatives.flatMap((a) => [
      a.product.fullName,
      a.product.name,
      a.brand?.name ?? "",
    ]),
  ].filter(Boolean);

  texts.push({ slug: p.slug, text: blob, names });
  pages.push({
    slug: p.slug,
    altCount: data.alternatives.length,
    reasonTypes: data.reasonGroups.length,
    hasWorse: data.alternatives.every((a) => a.worseAt.length > 0),
    hasStay: data.alternatives.every((a) => /stay|keep /i.test(a.whoShouldStay)),
    hasSwitch: data.alternatives.every((a) =>
      /switch|choose|move to/i.test(a.whoShouldSwitch),
    ),
    eligibilityOk: gate.ok,
    pageIndexable: data.indexable,
    launchIndexable: isIndexableEligibility(elig),
    class: "GENUINELY_UNIQUE",
    maxPeerSimilarity: 0,
  });
}

for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    const score = textSimilarity(
      scrubEntityNames(texts[i]!.text, texts[i]!.names),
      scrubEntityNames(texts[j]!.text, texts[j]!.names),
    );
    if (score > pages[i]!.maxPeerSimilarity) {
      pages[i]!.maxPeerSimilarity = score;
      pages[i]!.peerSlug = texts[j]!.slug;
    }
    if (score > pages[j]!.maxPeerSimilarity) {
      pages[j]!.maxPeerSimilarity = score;
      pages[j]!.peerSlug = texts[i]!.slug;
    }
  }
}

const byClass: Record<string, number> = {};
for (const p of pages) {
  p.maxPeerSimilarity = Number(p.maxPeerSimilarity.toFixed(3));
  p.class = classifyUniqueness({
    maxPeerSimilarity: p.maxPeerSimilarity,
    scaffoldHits: 0,
    uniqueSignalRatio: 0.45,
  });
  byClass[p.class] = (byClass[p.class] ?? 0) + 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    publishedProducts: products.length,
    approvedAltEdges: altRels.length,
    syncTemplateReasonHits: syncTemplateHits,
    pagesWithAlternatives: builtWithAlts,
    eligibilityOk: pages.filter((p) => p.eligibilityOk).length,
    pageIndexable: pages.filter((p) => p.pageIndexable).length,
    launchIndexable: pages.filter((p) => p.launchIndexable).length,
    substantiveEligible,
    decisionComplete: pages.filter((p) => p.hasWorse && p.hasStay && p.hasSwitch)
      .length,
    byUniquenessClass: byClass,
    needsDiff: pages.filter((p) => p.class === "NEEDS_DIFFERENTIATION").length,
    duplicative: pages.filter((p) => p.class === "DUPLICATIVE").length,
  },
  worstPeers: [...pages]
    .sort((a, b) => b.maxPeerSimilarity - a.maxPeerSimilarity)
    .slice(0, 15)
    .map((p) => ({
      slug: p.slug,
      peer: p.peerSlug,
      sim: p.maxPeerSimilarity,
      class: p.class,
    })),
  sampleIndexable: pages
    .filter((p) => p.pageIndexable)
    .slice(0, 12)
    .map((p) => ({
      slug: p.slug,
      alts: p.altCount,
      groups: p.reasonTypes,
      class: p.class,
      sim: p.maxPeerSimilarity,
    })),
};

writeFileSync(
  join(OUT, "42-alternatives-completion.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report.totals, null, 2));
console.log("worst", report.worstPeers.slice(0, 8));
