import { getProducts } from "@/repositories";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
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
const FOCUS = [
  "garmin-forerunner-255",
  "garmin-forerunner-165",
  "garmin-forerunner-570",
  "coros-pace-pro",
  "saucony-peregrine-15",
  "inov8-trailfly-ultra-g-300-max",
];

function blobOf(data: NonNullable<ReturnType<typeof getAlternativesPageData>>) {
  return [
    data.source.intro,
    ...data.alternatives.map(
      (a) =>
        `${a.whyAlternative} ${a.betterAt.join(" ")} ${a.worseAt.join(" ")} ${a.whoShouldSwitch} ${a.whoShouldStay}`,
    ),
  ].join("\n");
}

const items: { slug: string; text: string; names: string[] }[] = [];
for (const product of getProducts(PROD)) {
  const elig = getLaunchEligibility({ kind: "alternatives", entity: product }, PROD);
  if (!isIndexableEligibility(elig)) continue;
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
  });
}
const scrubbed = items.map((it) => ({
  slug: it.slug,
  text: normalizeText(scrubEntityNames(it.text, it.names)),
}));
const bad: unknown[] = [];
const focusOut: unknown[] = [];
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
  if (cls === "NEEDS_DIFFERENTIATION" || cls === "DUPLICATIVE") {
    bad.push({ slug: scrubbed[i]!.slug, cls, max: Number(max.toFixed(3)), peer });
  }
  if (FOCUS.includes(scrubbed[i]!.slug)) {
    focusOut.push({ slug: scrubbed[i]!.slug, cls, max: Number(max.toFixed(3)), peer });
  }
}
console.log(JSON.stringify({ indexable: items.length, indexableBad: bad, focus: focusOut }, null, 2));
