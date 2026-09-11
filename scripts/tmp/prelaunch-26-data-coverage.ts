import { getProducts, getTools, getBuyingGuides, getBestGuides, getOffers } from "@/repositories";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";

const opts = { isDev: false as const };
const products = getProducts().filter((p) => isPubliclyVisible(p, opts));
const shoes = products.filter((p) => p.categoryId === "cat-running-shoes");
const watches = products.filter((p) => p.categoryId === "cat-gps-watches");

function has(p: (typeof shoes)[0], k: string) {
  const v = p.specifications?.[k];
  return v != null && v !== "";
}

const shoeKeys = new Map<string, number>();
for (const p of shoes) {
  for (const k of Object.keys(p.specifications || {})) {
    shoeKeys.set(k, (shoeKeys.get(k) || 0) + 1);
  }
}

const coverage = {
  shoeN: shoes.length,
  weight: shoes.filter((p) => has(p, "weight")).length,
  drop: shoes.filter((p) => has(p, "drop")).length,
  heelStack: shoes.filter((p) => has(p, "heelStack")).length,
  forefootStack: shoes.filter((p) => has(p, "forefootStack")).length,
  plate: shoes.filter((p) => has(p, "plate")).length,
  plateMaterial: shoes.filter((p) => has(p, "plateMaterial")).length,
  cushionLevel: shoes.filter((p) => has(p, "cushionLevel")).length,
  terrain: shoes.filter((p) => has(p, "terrain")).length,
  gender: shoes.filter((p) => has(p, "gender")).length,
  stability: shoes.filter((p) => has(p, "stability")).length,
};

const watchKeys = new Map<string, number>();
for (const p of watches) {
  for (const k of Object.keys(p.specifications || {})) {
    watchKeys.set(k, (watchKeys.get(k) || 0) + 1);
  }
}

const audienceCounts = { men: 0, women: 0, unisex: 0, unknown: 0 };
for (const p of shoes) {
  const g = String(p.specifications?.gender ?? "").toLowerCase();
  if (g.includes("women") || g === "women" || g === "female") audienceCounts.women++;
  else if (g.includes("men") || g === "men" || g === "male") audienceCounts.men++;
  else if (g.includes("unisex") || g === "unisex") audienceCounts.unisex++;
  else audienceCounts.unknown++;
}

const widthWide = shoes.filter((p) =>
  /wide|2e|4e|d\/2e/i.test(JSON.stringify(p.specifications?.widthOptions ?? p.specifications ?? {})),
).length;

const offers = getOffers();
const nlOffers = offers.filter((o) => o.region === "NL" || o.region === "nl");

console.log(
  JSON.stringify(
    {
      coverage,
      audienceCounts,
      widthWideHint: widthWide,
      topShoeSpecs: [...shoeKeys.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
      watchN: watches.length,
      topWatchSpecs: [...watchKeys.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
      tools: getTools()
        .filter((t) => t.available)
        .map((t) => ({ slug: t.slug, type: t.type })),
      guidesPublished: getBuyingGuides().filter((g) => g.status === "published").length,
      guidesIndexable: getBuyingGuides().filter((g) =>
        isIndexableEligibility(
          getLaunchEligibility({ kind: "buying-guide", entity: g }, opts),
        ),
      ).length,
      bestPublished: getBestGuides().filter((g) => g.status === "published").length,
      bestIndexable: getBestGuides().filter((g) =>
        isIndexableEligibility(
          getLaunchEligibility({ kind: "best-guide", entity: g }, opts),
        ),
      ).length,
      offers: {
        total: offers.length,
        priced: offers.filter((o) => typeof o.price === "number" && o.price > 0).length,
        nl: nlOffers.length,
        regions: [...new Set(offers.map((o) => o.region))],
      },
    },
    null,
    2,
  ),
);
