/**
 * Room-planner readiness QA — `npm run catalog:qa:planner`
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fitnessProducts } from "@/content/fitness";
import { categories } from "@/content/taxonomy/categories";
import {
  canUseInRoomPlanner,
  resolveProductDimensions,
  PLANNING_DIMENSIONS,
} from "@/domain/room-planner/product-geometry";

const lines: string[] = [];
function log(s = "") {
  lines.push(s);
  console.log(s);
}

const published = fitnessProducts.filter((p) => p.status === "published");
const fitnessCatIds = new Set(
  categories
    .filter((c) => c.sportIds.includes("sport-training"))
    .map((c) => c.id),
);

log("# Room Planner Readiness\n");
log(`Generated: ${new Date().toISOString().slice(0, 10)}\n`);
log(`Planning dimension overlays: ${Object.keys(PLANNING_DIMENSIONS).length}\n`);

log("| Category | Products | With footprint | With height | Planner-ready |");
log("| --- | ---: | ---: | ---: | ---: |");

for (const c of categories.filter((x) => fitnessCatIds.has(x.id))) {
  const ps = published.filter((p) => p.categoryId === c.id);
  if (!ps.length) continue;
  let fp = 0;
  let ht = 0;
  let ready = 0;
  for (const p of ps) {
    const d = resolveProductDimensions(p);
    if (typeof d.widthMm === "number" && typeof d.depthMm === "number") fp++;
    if (typeof d.heightMm === "number") ht++;
    if (canUseInRoomPlanner(p)) ready++;
  }
  log(`| ${c.name} | ${ps.length} | ${fp} | ${ht} | ${ready} |`);
}

const readyAll = published.filter((p) => canUseInRoomPlanner(p));
log(`\n**Planner-ready products:** ${readyAll.length} / ${published.length}`);
log(`\n## Gaps\n`);
log(`- Operating / stored dimensions still sparse outside racks, rowers, folding gear`);
log(`- Manufacturer-required clearances rarely published — Kitletics planning used`);
log(`- Mounting flags incomplete on many pull-up / wall products`);
log(`- Continue Prompt 19 research for dimensions before raising planner-ready counts`);

mkdirSync(join(process.cwd(), "reports"), { recursive: true });
const out = join(process.cwd(), "reports", "room-planner-readiness.md");
writeFileSync(out, lines.join("\n") + "\n");
console.log(`\nWrote ${out}`);
