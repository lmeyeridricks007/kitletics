import {
  getBuyingGuides,
  getBestGuides,
  getProducts,
  getOffers,
} from "@/repositories";
import { isPubliclyVisible } from "@/lib/publishing/resolver";

const opts = { isDev: false as const };

const guides = getBuyingGuides(opts).filter((g) => isPubliclyVisible(g, opts));
const techKeywords =
  /drop|cushion|plate|carbon|foam|stack|gps|heart|hrm|rotation|width|stability|tempo|race|choose|vs-|vs_|versus|daily-trainer|max-cushion|super/i;
const tech = guides.filter(
  (g) => techKeywords.test(g.slug) || techKeywords.test(g.title),
);
console.log(
  JSON.stringify(
    {
      guidesTotal: guides.length,
      techGuides: tech.map((g) => ({ slug: g.slug, title: g.title })),
      best: getBestGuides(opts)
        .filter((g) => isPubliclyVisible(g, opts))
        .map((b) => b.slug),
    },
    null,
    2,
  ),
);

const shoes = getProducts().filter(
  (p) => isPubliclyVisible(p, opts) && p.categoryId === "cat-running-shoes",
);

function dist(key: string) {
  const vals = shoes
    .map((p) => Number(p.specifications?.[key]))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  const pct = (p: number) => vals[Math.min(vals.length - 1, Math.floor((p / 100) * vals.length))];
  const buckets = new Map<string, number>();
  for (const v of vals) {
    const b =
      key === "drop"
        ? `${Math.floor(v / 2) * 2}-${Math.floor(v / 2) * 2 + 1}`
        : key === "weight"
          ? `${Math.floor(v / 25) * 25}`
          : `${Math.floor(v / 5) * 5}`;
    buckets.set(b, (buckets.get(b) || 0) + 1);
  }
  return {
    n: vals.length,
    min: vals[0],
    p25: pct(25),
    med: pct(50),
    p75: pct(75),
    max: vals.at(-1),
    buckets: [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])),
  };
}

const plateMat = new Map<string, number>();
const cushion = new Map<string, number>();
const terrain = new Map<string, number>();
const stability = new Map<string, number>();
for (const p of shoes) {
  const pm = String(p.specifications?.plateMaterial ?? "none");
  plateMat.set(pm, (plateMat.get(pm) || 0) + 1);
  const c = String(p.specifications?.cushionLevel ?? "?");
  cushion.set(c, (cushion.get(c) || 0) + 1);
  const t = String(p.specifications?.terrain ?? "?");
  terrain.set(t, (terrain.get(t) || 0) + 1);
  const s = String(p.specifications?.stability ?? "?");
  stability.set(s, (stability.get(s) || 0) + 1);
}

const offers = getOffers().filter((o) => o.price != null && o.price > 0);
const byRegion = new Map<string, number>();
for (const o of offers) {
  const r = o.region ?? o.market ?? "?";
  byRegion.set(String(r), (byRegion.get(String(r)) || 0) + 1);
}

const shoeOffers = offers.filter((o) =>
  shoes.some((p) => p.id === o.productId),
);
const nlShoe = shoeOffers.filter(
  (o) => String(o.region ?? o.market ?? "").toUpperCase().includes("NL"),
);
const nlPrices = nlShoe
  .map((o) => Number(o.price))
  .filter((n) => !Number.isNaN(n))
  .sort((a, b) => a - b);

console.log(
  "\nSTATS",
  JSON.stringify(
    {
      weight: dist("weight"),
      drop: dist("drop"),
      heelStack: dist("heelStack"),
      plateMaterial: [...plateMat.entries()],
      cushionLevel: [...cushion.entries()],
      terrain: [...terrain.entries()],
      stability: [...stability.entries()],
      offers: { n: offers.length, byRegion: [...byRegion.entries()] },
      nlShoeOffers: {
        n: nlPrices.length,
        min: nlPrices[0],
        med: nlPrices[Math.floor(nlPrices.length / 2)],
        max: nlPrices.at(-1),
      },
    },
    null,
    2,
  ),
);
