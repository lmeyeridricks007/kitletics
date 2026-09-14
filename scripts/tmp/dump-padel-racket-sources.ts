import fs from "node:fs";
import { padelRacketDrafts } from "@/content/padel/rackets";

const rows = padelRacketDrafts.map((d) => ({
  id: d.id,
  slug: d.slug,
  sourceUrl: d.sourceUrl,
  sourceName: d.sourceName,
}));

fs.mkdirSync("data/staging", { recursive: true });
fs.writeFileSync(
  "data/staging/padel-racket-source-urls.json",
  JSON.stringify(rows, null, 2),
);
console.log(`wrote ${rows.length} source rows`);
