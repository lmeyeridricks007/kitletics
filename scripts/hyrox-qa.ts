/**
 * HYROX readiness — `npm run catalog:qa:hyrox`
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/content/products";
import { recommendations } from "@/content/recommendations";
import { offers } from "@/content/offers";
import { buyingGuides, gearSetups } from "@/content/editorial";
import { bestGuides } from "@/content/best-guides";
import { tools } from "@/content/tools";
import { getCurrentHyroxSinglesFormat } from "@/content/hyrox/competition";
import { getFinderDefinition } from "@/domain/finders/repository";

const lines: string[] = [];
function log(s = "") {
  lines.push(s);
  console.log(s);
}

const fmt = getCurrentHyroxSinglesFormat();
const hyroxRecs = recommendations.filter((r) => r.sportId === "sport-hyrox");
const shoeRecs = hyroxRecs.filter((r) => {
  const p = products.find((x) => x.id === r.productId);
  return (
    p?.categoryId === "cat-training-shoes" ||
    p?.categoryId === "cat-running-shoes"
  );
});

log("# HYROX Readiness Report\n");
log(`Generated: ${new Date().toISOString().slice(0, 10)}\n`);
log(`## CompetitionFormat\n`);
log(`- ${fmt.name} (${fmt.slug})`);
log(`- Verified: ${fmt.lastVerifiedAt.slice(0, 10)}`);
log(`- Effective: ${fmt.effectiveFrom} → ${fmt.effectiveTo ?? "open"}`);
log(`- Stations: ${fmt.stations.map((s) => s.name).join(" → ")}`);

log(`\n## Recommendations (sport-hyrox): ${hyroxRecs.length}`);
log(`- Shoe contexts: ${shoeRecs.length}`);
log(
  `- Products: ${[...new Set(hyroxRecs.map((r) => r.productId))].join(", ")}`,
);

log(`\n## Tools`);
for (const slug of [
  "hyrox-shoe-finder",
  "hyrox-race-kit-builder",
  "hyrox-race-time-calculator",
  "home-gym-builder",
]) {
  const t = tools.find((x) => x.slug === slug);
  const finder = getFinderDefinition(slug);
  log(
    `- ${slug}: tool=${t ? "yes" : "no"} finder=${finder ? "yes" : "n/a"}`,
  );
}

log(`\n## Editorial`);
log(
  `- Best: ${bestGuides.filter((g) => /hyrox/i.test(g.slug) || g.sportId === "sport-hyrox").map((g) => g.slug).join(", ")}`,
);
log(
  `- Guides: ${buyingGuides.filter((g) => g.sportId === "sport-hyrox" || /hyrox/i.test(g.slug)).map((g) => g.slug).join(", ")}`,
);
log(
  `- Setups: ${gearSetups.filter((s) => /hyrox/i.test(s.slug)).map((s) => s.slug).join(", ")}`,
);

log(`\n## Offers on HYROX-recommended products`);
const recIds = new Set(hyroxRecs.map((r) => r.productId));
const withOffers = [...recIds].filter((id) =>
  offers.some((o) => o.productId === id),
);
log(`- ${withOffers.length} / ${recIds.size} have ≥1 offer`);

log(`\n## Gaps`);
log(`- Expand hyrox-race Recommendations across more Running Shoes`);
log(`- Clothing/socks HYROX contexts still thin`);
log(`- Official competition equipment Product links need stronger evidence`);
log(`- Licensed HYROX editorial photography pending`);
log(`- Native watch HYROX mode claims must stay unverified unless proven`);

mkdirSync(join(process.cwd(), "reports"), { recursive: true });
const out = join(process.cwd(), "reports", "hyrox-readiness.md");
writeFileSync(out, lines.join("\n") + "\n");
console.log(`\nWrote ${out}`);
