/**
 * Editorial 42 — alternatives estate audit (readonly).
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
  normalizeText,
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

const reasonCounts = new Map<string, number>();
const templatePhrase =
  "is a same-category alternative when you want a peer to";
let syncTemplateHits = 0;
for (const r of altRels) {
  for (const reason of r.reasons) {
    const n = normalizeText(reason);
    if (n.includes(normalizeText(templatePhrase))) syncTemplateHits++;
    if (n.length < 20) continue;
    reasonCounts.set(n, (reasonCounts.get(n) ?? 0) + 1);
  }
}
const dupReasons = [...reasonCounts.entries()]
  .filter(([, c]) => c >= 3)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25);

type PageRow = {
  slug: string;
  altCount: number;
  reasonTypes: number;
  whyAvgChars: number;
  hasWorse: boolean;
  hasStay: boolean;
  eligibilityOk: boolean;
  indexable: boolean;
  class: string;
  maxPeerSimilarity: number;
  peerSlug?: string;
};

const pages: PageRow[] = [];
const texts: { slug: string; text: string; names: string[] }[] = [];

for (const p of products) {
  const gate = canPublishAlternativesPage(p, rels);
  const data = getAlternativesPageData(p.slug, prod);
  if (!data && !gate.ok) continue;
  if (!data) continue;

  const elig = getLaunchEligibility(
    { kind: "alternatives", entity: p },
    prod,
  );
  const whyTexts = data.alternatives.map((a) => a.whyChoose.join(" "));
  const whyAvg =
    whyTexts.reduce((s, t) => s + t.length, 0) / Math.max(1, whyTexts.length);

  const blob = data.alternatives
    .map(
      (a) =>
        `${a.badgeLabel}\n${a.summary}\n${a.whyChoose.join("\n")}\n${a.bestFor.join(", ")}`,
    )
    .join("\n\n");

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
    whyAvgChars: Math.round(whyAvg),
    hasWorse: /worse|trade-?off|give up|lose|less |not as /i.test(blob),
    hasStay: /stay|keep |stick with|remain with/i.test(blob),
    eligibilityOk: gate.ok,
    indexable: isIndexableEligibility(elig),
    class: "GENUINELY_UNIQUE",
    maxPeerSimilarity: 0,
  });
}

// pairwise within sample if huge — full for now
for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i]!;
    const b = texts[j]!;
    const score = textSimilarity(
      scrubEntityNames(a.text, a.names),
      scrubEntityNames(b.text, b.names),
    );
    const pa = pages[i]!;
    const pb = pages[j]!;
    if (score > pa.maxPeerSimilarity) {
      pa.maxPeerSimilarity = score;
      pa.peerSlug = b.slug;
    }
    if (score > pb.maxPeerSimilarity) {
      pb.maxPeerSimilarity = score;
      pb.peerSlug = a.slug;
    }
  }
}

for (const p of pages) {
  p.maxPeerSimilarity = Number(p.maxPeerSimilarity.toFixed(3));
  p.class = classifyUniqueness({
    maxPeerSimilarity: p.maxPeerSimilarity,
    scaffoldHits: 0,
    uniqueSignalRatio: 0.4,
  });
}

const byClass: Record<string, number> = {};
for (const p of pages) byClass[p.class] = (byClass[p.class] ?? 0) + 1;

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    publishedProducts: products.length,
    approvedAltEdges: altRels.length,
    syncTemplateReasonHits: syncTemplateHits,
    pagesBuilt: pages.length,
    eligibilityOk: pages.filter((p) => p.eligibilityOk).length,
    indexable: pages.filter((p) => p.indexable).length,
    missingWorseSignal: pages.filter((p) => !p.hasWorse).length,
    missingStaySignal: pages.filter((p) => !p.hasStay).length,
    thinWhyAvgUnder80: pages.filter((p) => p.whyAvgChars < 80).length,
    byUniquenessClass: byClass,
  },
  topDupReasons: dupReasons.map(([t, c]) => ({ count: c, text: t.slice(0, 160) })),
  worstPeers: [...pages]
    .sort((a, b) => b.maxPeerSimilarity - a.maxPeerSimilarity)
    .slice(0, 20)
    .map((p) => ({
      slug: p.slug,
      peer: p.peerSlug,
      sim: p.maxPeerSimilarity,
      class: p.class,
    })),
  sampleThin: pages
    .filter((p) => !p.hasWorse || !p.hasStay || p.whyAvgChars < 80)
    .slice(0, 30)
    .map((p) => ({
      slug: p.slug,
      whyAvgChars: p.whyAvgChars,
      hasWorse: p.hasWorse,
      hasStay: p.hasStay,
      alts: p.altCount,
    })),
};

writeFileSync(
  join(OUT, "42-alternatives-audit.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report.totals, null, 2));
console.log("top dup reasons", report.topDupReasons.slice(0, 8));
console.log("worst peers", report.worstPeers.slice(0, 8));
