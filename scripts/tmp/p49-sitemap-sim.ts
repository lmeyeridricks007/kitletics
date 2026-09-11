import { simulateDay1LaunchCounts } from "@/domain/launch/simulate-day1";
import sitemap from "@/app/sitemap";

async function main() {
  const sim = simulateDay1LaunchCounts();
  const map = await sitemap();
  const byPrefix: Record<string, number> = {};
  for (const e of map) {
    const u = new URL(e.url);
    const parts = u.pathname.split("/").filter(Boolean);
    const key = parts[0] ?? "home";
    byPrefix[key] = (byPrefix[key] ?? 0) + 1;
  }
  console.log(JSON.stringify({
    simulate: sim.rows.map(r => ({ kind: r.kind, INDEXABLE: r.INDEXABLE, PUBLIC_NOINDEX: r.PUBLIC_NOINDEX, HIDDEN_404: r.HIDDEN_404 })),
    sitemapEntries: map.length,
    sitemapByPrefix: byPrefix,
  }, null, 2));
}
main();
