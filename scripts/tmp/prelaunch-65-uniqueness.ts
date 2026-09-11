import {
  getAllProductRelationships,
  getProducts,
} from "@/repositories";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { isAlternativeType } from "@/domain/relationships/types";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  textSimilarity,
  scaffoldHitCount,
} from "@/domain/content-uniqueness/text";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };

function blobOf(data: NonNullable<ReturnType<typeof getAlternativesPageData>>) {
  return [
    data.source.intro,
    ...data.alternatives.map(
      (a) =>
        `${a.whyAlternative} ${a.betterAt.join(" ")} ${a.worseAt.join(" ")} ${a.whoShouldSwitch} ${a.whoShouldStay}`,
    ),
  ].join("\n");
}

const rels = getAllProductRelationships();
const items: { slug: string; text: string; names: string[]; indexable: boolean }[] = [];
for (const product of getProducts(PROD)) {
  const alts = rels.filter(
    (r) =>
      r.sourceProductId === product.id &&
      r.status === "approved" &&
      isAlternativeType(r.type),
  );
  if (alts.length === 0) continue;
  const gate = canPublishAlternativesPage(product, rels);
  const elig = getLaunchEligibility({ kind: "alternatives", entity: product }, PROD);
  const indexable = isIndexableEligibility(elig);
  if (!gate.ok && !indexable) continue;
  const data = getAlternativesPageData(product.slug, PROD);
  if (!data) continue;
  items.push({
    slug: product.slug,
    text: blobOf(data),
    names: [
      product.fullName,
      product.name,
      ...data.alternatives.flatMap((a) => [a.product.fullName, a.product.name]),
    ],
    indexable,
  });
}
const scrubbed = items.map((it) => ({
  slug: it.slug,
  text: normalizeText(scrubEntityNames(it.text, it.names)),
  indexable: it.indexable,
}));
const counts: Record<string, number> = {};
const idxCounts: Record<string, number> = {};
const bad: unknown[] = [];
for (let i = 0; i < scrubbed.length; i++) {
  let max = 0;
  let peer = "";
  for (let j = 0; j < scrubbed.length; j++) {
    if (i === j) continue;
    const s = textSimilarity(scrubbed[i]!.text, scrubbed[j]!.text);
    if (s > max) {
      max = s;
      peer = scrubbed[j]!.slug;
    }
  }
  const cls = classifyUniqueness({
    maxPeerSimilarity: max,
    scaffoldHits: scaffoldHitCount(scrubbed[i]!.text),
    uniqueSignalRatio: 0.5,
  });
  counts[cls] = (counts[cls] ?? 0) + 1;
  if (scrubbed[i]!.indexable) {
    idxCounts[cls] = (idxCounts[cls] ?? 0) + 1;
    if (cls === "NEEDS_DIFFERENTIATION" || cls === "DUPLICATIVE") {
      bad.push({ slug: scrubbed[i]!.slug, cls, max: Number(max.toFixed(3)), peer });
    }
  }
}
console.log(JSON.stringify({ cluster: items.length, counts, idxCounts, indexableBad: bad }, null, 2));
