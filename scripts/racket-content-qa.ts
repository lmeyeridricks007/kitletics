/**
 * npm run racket:content-qa
 */
import { bestGuides } from "@/content/best-guides";
import { buyingGuides, gearSetups, comparisons } from "@/content/editorial";
import { products } from "@/content/products";
import { tools } from "@/content/tools";

const p0: string[] = [];
const p1: string[] = [];
const log = (s = "") => console.log(s);

log("# Racket Content QA\n");

const padelBest = bestGuides.find((g) => g.slug === "padel-rackets");
const tennisBest = bestGuides.find((g) => g.slug === "tennis-rackets");
const padelGuide = buyingGuides.find((g) => g.slug === "how-to-choose-a-padel-racket");
const tennisGuide = buyingGuides.find((g) => g.slug === "how-to-choose-a-tennis-racket");
const padelSetup = gearSetups.find((g) => g.slug === "padel-starter-kit");
const tennisSetup = gearSetups.find((g) => g.slug === "tennis-starter-kit");

log(`- Best padel: ${Boolean(padelBest)} picks=${padelBest?.recommendations.length ?? 0}`);
log(`- Best tennis: ${Boolean(tennisBest)} picks=${tennisBest?.recommendations.length ?? 0}`);
log(`- Padel buying guide sections: ${padelGuide?.sections.length ?? 0}`);
log(`- Tennis buying guide sections: ${tennisGuide?.sections.length ?? 0}`);
log(`- Padel starter kit: ${Boolean(padelSetup)}`);
log(`- Tennis starter kit: ${Boolean(tennisSetup)}`);

if (!padelBest) p0.push("Missing Best Padel Rackets");
if (!tennisBest) p0.push("Missing Best Tennis Rackets");
if (!padelGuide) p0.push("Missing padel buying guide");
if (!tennisGuide) p0.push("Missing tennis buying guide");
if (!padelSetup) p1.push("Missing padel starter kit");

function assertPicksExist(label: string, ids: string[] | undefined) {
  for (const id of ids ?? []) {
    if (!products.some((p) => p.id === id)) p0.push(`${label} pick missing product ${id}`);
  }
}
assertPicksExist("Padel Best", padelBest?.recommendations.map((r) => r.productId));
assertPicksExist("Tennis Best", tennisBest?.recommendations.map((r) => r.productId));

// Prefer current-gen picks
for (const rec of padelBest?.recommendations ?? []) {
  const p = products.find((x) => x.id === rec.productId);
  if (p?.lifecycleStatus === "previous-generation") {
    p1.push(`Padel Best still features previous-gen ${rec.productId}`);
  }
}
for (const rec of tennisBest?.recommendations ?? []) {
  const p = products.find((x) => x.id === rec.productId);
  if (p?.lifecycleStatus === "previous-generation") {
    p1.push(`Tennis Best still features previous-gen ${rec.productId}`);
  }
}

const padelComps = comparisons.filter((c) =>
  c.productIds.some((id) =>
    products.find((p) => p.id === id)?.categoryId === "cat-padel-rackets",
  ),
);
const tennisComps = comparisons.filter((c) =>
  c.productIds.some((id) =>
    products.find((p) => p.id === id)?.categoryId === "cat-tennis-rackets",
  ),
);
log(`- Padel comparisons: ${padelComps.length}`);
log(`- Tennis comparisons: ${tennisComps.length}`);
if (padelComps.length < 3) p1.push("Few padel editorial comparisons");
if (tennisComps.length < 2) p1.push("Few tennis editorial comparisons");

log(
  `- Padel finder tool available: ${tools.find((t) => t.slug === "padel-racket-finder")?.available}`,
);
log(
  `- Tennis finder tool available: ${tools.find((t) => t.slug === "tennis-racket-finder")?.available}`,
);

log(`\nP0: ${p0.length}`);
p0.forEach((x) => log(`- ${x}`));
log(`P1: ${p1.length}`);
p1.forEach((x) => log(`- ${x}`));
if (p0.length) process.exit(1);
