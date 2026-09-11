import sitemapFn from "@/app/sitemap";
import { writeFileSync } from "fs";

const entries = sitemapFn();
const dates = entries.map((e) => {
  const d = e.lastModified;
  if (!d) return "missing";
  const iso =
    d instanceof Date
      ? d.toISOString().slice(0, 10)
      : String(d).slice(0, 10);
  return iso;
});
const counts = new Map<string, number>();
for (const d of dates) counts.set(d, (counts.get(d) || 0) + 1);
const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
const future = dates.filter((d) => d > "2026-09-06");
const out = {
  n: entries.length,
  uniqueLastmod: counts.size,
  topDates: sorted.slice(0, 20),
  futureCount: future.length,
  missing: counts.get("missing") || 0,
};
writeFileSync(
  "docs/prelaunch/data/rc-final/sitemap-lastmod.json",
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
