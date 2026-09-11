/**
 * Editorial 43 — brand hub completion verify.
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
  pageBuilt: boolean;
  indexableGate: boolean;
  launchIndexable: boolean;
  boilerBlurb: boolean;
  whyCount: number;
  familyCount: number;
  guideCount: number;
  comparisonCount: number;
  bestCount: number;
  hasHowLinesDiffer: boolean;
  hasGeneration: boolean;
  summaryLen: number;
  class: string;
  maxPeerSimilarity: number;
  peerSlug?: string;
};

const rows: Row[] = [];
const texts: { slug: string; text: string; names: string[] }[] = [];

for (const brand of brands) {
  const brandProducts = products.filter((p) => p.brandId === brand.id);
  const gate = isBrandHubIndexable(brand, prod);
  const data = getBrandHubPageData({ brandSlug: brand.slug });
  const elig = getLaunchEligibility({ kind: "brand", entity: brand }, prod);

  const blurb = data?.overview.blurb ?? "";
  const text = data
    ? [
        data.brand.summary,
        data.overview.blurb,
        data.about.body,
        data.about.howLinesDiffer,
        data.about.generationContext,
        ...(data.knownFor.items ?? []).map((i) => i.label),
        ...(data.families.items ?? []).map((f) => f.description),
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";

  if (data && isIndexableEligibility(elig)) {
    texts.push({
      slug: brand.slug,
      text,
      names: [brand.name, brand.slug.replace(/-/g, " ")],
    });
  }

  rows.push({
    slug: brand.slug,
    productCount: brandProducts.length,
    pageBuilt: Boolean(data),
    indexableGate: gate,
    launchIndexable: isIndexableEligibility(elig),
    boilerBlurb: normalizeText(blurb).includes(BOILER),
    whyCount: data?.knownFor.items.length ?? 0,
    familyCount: data?.families.items.length ?? 0,
    guideCount: data?.guides.items.length ?? 0,
    comparisonCount: data?.comparisons.items.length ?? 0,
    bestCount: data?.bestAppearances.items.length ?? 0,
    hasHowLinesDiffer: Boolean(data?.about.howLinesDiffer),
    hasGeneration: Boolean(data?.about.generationContext),
    summaryLen: (data?.brand.summary ?? "").length,
    class: "GENUINELY_UNIQUE",
    maxPeerSimilarity: 0,
  });
}

const built = rows.filter((r) => r.pageBuilt);
const indexableRows = rows.filter((r) => r.launchIndexable);
for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    const score = textSimilarity(
      scrubEntityNames(texts[i]!.text, texts[i]!.names),
      scrubEntityNames(texts[j]!.text, texts[j]!.names),
    );
    const a = indexableRows.find((r) => r.slug === texts[i]!.slug);
    const b = indexableRows.find((r) => r.slug === texts[j]!.slug);
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
for (const r of indexableRows) {
  r.maxPeerSimilarity = Number(r.maxPeerSimilarity.toFixed(3));
  r.class = classifyUniqueness({
    maxPeerSimilarity: r.maxPeerSimilarity,
    scaffoldHits: r.boilerBlurb ? 2 : 0,
    uniqueSignalRatio: r.summaryLen > 120 ? 0.4 : 0.2,
  });
  byClass[r.class] = (byClass[r.class] ?? 0) + 1;
}

const heldThin = rows.filter((r) => !r.pageBuilt && r.productCount > 0);

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    brands: brands.length,
    pageBuilt: built.length,
    indexableGate: rows.filter((r) => r.indexableGate).length,
    launchIndexable: rows.filter((r) => r.launchIndexable).length,
    gatePageAligned: rows.filter((r) => r.indexableGate === r.pageBuilt).length,
    boilerBlurb: built.filter((r) => r.boilerBlurb).length,
    emptyWhy: built.filter((r) => r.whyCount === 0).length,
    withGuides: built.filter((r) => r.guideCount > 0).length,
    withComparisons: built.filter((r) => r.comparisonCount > 0).length,
    withBest: built.filter((r) => r.bestCount > 0).length,
    withHowLinesDiffer: built.filter((r) => r.hasHowLinesDiffer).length,
    withGeneration: built.filter((r) => r.hasGeneration).length,
    heldThinWithProducts: heldThin.length,
    byUniquenessClass: byClass,
    needsDiff: indexableRows.filter((r) => r.class === "NEEDS_DIFFERENTIATION")
      .length,
    duplicative: indexableRows.filter((r) => r.class === "DUPLICATIVE").length,
  },
  heldThinSample: heldThin.slice(0, 25).map((r) => ({
    slug: r.slug,
    products: r.productCount,
  })),
  worstPeers: [...indexableRows]
    .sort((a, b) => b.maxPeerSimilarity - a.maxPeerSimilarity)
    .slice(0, 15)
    .map((r) => ({
      slug: r.slug,
      peer: r.peerSlug,
      sim: r.maxPeerSimilarity,
      class: r.class,
    })),
};

writeFileSync(
  join(OUT, "43-brand-hub-completion.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report.totals, null, 2));
console.log("worst", report.worstPeers.slice(0, 8));
