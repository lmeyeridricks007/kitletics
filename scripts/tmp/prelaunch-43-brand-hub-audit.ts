/**
 * Editorial 43 — brand hub audit (readonly).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getBrands, getProducts } from "@/repositories";
import { getBrandHubPageData } from "@/lib/brand-hub";
import { isBrandHubIndexable } from "@/lib/seo/brand-indexability";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch/get-launch-eligibility";
import {
  classifyUniqueness,
  scrubEntityNames,
  textSimilarity,
  normalizeText,
} from "@/domain/content-uniqueness/text";

const OUT = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(OUT, { recursive: true });

const prod = { isDev: false as const };
const brands = getBrands(prod);
const products = getProducts(prod);

const BOILER =
  "on kitletics structured product data not a manufacturer microsite";

type Row = {
  slug: string;
  productCount: number;
  categoryCount: number;
  familyCount: number;
  reviewCount: number;
  guideCount: number;
  whyCount: number;
  hasEditorialConfig: boolean;
  boilerBlurb: boolean;
  summaryLen: number;
  indexableGate: boolean;
  launchIndexable: boolean;
  pageBuilt: boolean;
  class: string;
  maxPeerSimilarity: number;
  peerSlug?: string;
};

const rows: Row[] = [];
const texts: { slug: string; text: string; names: string[] }[] = [];

for (const brand of brands) {
  const brandProducts = products.filter((p) => p.brandId === brand.id);
  const cats = new Set(brandProducts.map((p) => p.categoryId)).size;
  const gate = isBrandHubIndexable(brand, prod);
  const data = getBrandHubPageData({ brandSlug: brand.slug });
  const elig = getLaunchEligibility(
    { kind: "brand", entity: brand },
    prod,
  );

  const summary = data?.brand.summary ?? brand.description ?? "";
  const blurb = data?.overview.blurb ?? "";
  const about = data?.about.body ?? "";
  const why = (data?.knownFor.items ?? []).map((i) => i.label).join(" ");
  const fam = (data?.families.items ?? [])
    .map((f) => `${f.name} ${f.description}`)
    .join(" ");

  const text = [summary, blurb, about, why, fam].filter(Boolean).join("\n\n");
  const names = [brand.name, brand.slug.replace(/-/g, " ")];

  if (data) {
    texts.push({ slug: brand.slug, text, names });
  }

  rows.push({
    slug: brand.slug,
    productCount: brandProducts.length,
    categoryCount: cats,
    familyCount: data?.families.items.length ?? 0,
    reviewCount: data?.reviews.items.length ?? 0,
    guideCount: data?.guides.items.length ?? 0,
    whyCount: data?.knownFor.items.length ?? 0,
    hasEditorialConfig: Boolean(data && data.brand.summary !== brand.description),
    boilerBlurb: normalizeText(blurb).includes(BOILER),
    summaryLen: summary.trim().length,
    indexableGate: gate,
    launchIndexable: isIndexableEligibility(elig),
    pageBuilt: Boolean(data),
    class: "GENUINELY_UNIQUE",
    maxPeerSimilarity: 0,
  });
}

const built = rows.filter((r) => r.pageBuilt);
for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    const score = textSimilarity(
      scrubEntityNames(texts[i]!.text, texts[i]!.names),
      scrubEntityNames(texts[j]!.text, texts[j]!.names),
    );
    const a = built.find((r) => r.slug === texts[i]!.slug);
    const b = built.find((r) => r.slug === texts[j]!.slug);
    if (a && score > a.maxPeerSimilarity) {
      a.maxPeerSimilarity = score;
      a.peerSlug = texts[j]!.slug;
    }
    if (b && score > b.maxPeerSimilarity) {
      b.maxPeerSimilarity = score;
      b.peerSlug = texts[i]!.slug;
    }
  }
}

const byClass: Record<string, number> = {};
for (const r of built) {
  r.maxPeerSimilarity = Number(r.maxPeerSimilarity.toFixed(3));
  r.class = classifyUniqueness({
    maxPeerSimilarity: r.maxPeerSimilarity,
    scaffoldHits: r.boilerBlurb ? 2 : 0,
    uniqueSignalRatio: r.summaryLen > 120 ? 0.4 : 0.15,
  });
  byClass[r.class] = (byClass[r.class] ?? 0) + 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    brands: brands.length,
    pageBuilt: built.length,
    indexableGate: rows.filter((r) => r.indexableGate).length,
    launchIndexable: rows.filter((r) => r.launchIndexable).length,
    boilerBlurb: built.filter((r) => r.boilerBlurb).length,
    emptyWhy: built.filter((r) => r.whyCount === 0).length,
    noFamilies: built.filter((r) => r.familyCount === 0).length,
    noReviews: built.filter((r) => r.reviewCount === 0).length,
    noGuides: built.filter((r) => r.guideCount === 0).length,
    thinSummaryUnder80: built.filter((r) => r.summaryLen < 80).length,
    hasEditorialConfig: built.filter((r) => r.hasEditorialConfig).length,
    byUniquenessClass: byClass,
    needsDiff: built.filter((r) => r.class === "NEEDS_DIFFERENTIATION").length,
    duplicative: built.filter((r) => r.class === "DUPLICATIVE").length,
  },
  thinCandidates: rows
    .filter((r) => r.productCount < 3 || (r.productCount < 5 && r.categoryCount < 2))
    .slice(0, 40)
    .map((r) => ({
      slug: r.slug,
      products: r.productCount,
      cats: r.categoryCount,
      gate: r.indexableGate,
    })),
  worstPeers: [...built]
    .sort((a, b) => b.maxPeerSimilarity - a.maxPeerSimilarity)
    .slice(0, 20)
    .map((r) => ({
      slug: r.slug,
      peer: r.peerSlug,
      sim: r.maxPeerSimilarity,
      class: r.class,
      boiler: r.boilerBlurb,
      why: r.whyCount,
    })),
};

writeFileSync(join(OUT, "43-brand-hub-audit.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.totals, null, 2));
console.log("worst", report.worstPeers.slice(0, 10));
