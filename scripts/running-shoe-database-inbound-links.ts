/**
 * Count crawlable inbound references to /running/shoes/database.
 * Run: npx tsx --tsconfig tsconfig.json scripts/running-shoe-database-inbound-links.ts
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const TARGET = "/running/shoes/database";

type Hit = { file: string; line: number; text: string; surface: string };

function classify(file: string): string {
  if (file.includes("contextual-nav")) return "contextual-nav";
  if (file.includes("primary-menu")) return "primary-nav-mega-menu";
  if (file.includes("sport-hub/config")) return "running-hub";
  if (file.includes("catalog/running-shoes")) return "category-/running/shoes";
  if (file.includes("best/category-config") || file.includes("get-best-guide"))
    return "best-guides";
  if (file.includes("BuyingGuide") || file.includes("buying"))
    return "buying-guides";
  if (file.includes("finder") || file.includes("Finder")) return "finder";
  if (file.includes("compare") || file.includes("Compare")) return "compare";
  if (file.includes("sitemap")) return "sitemap";
  if (file.includes("running-shoe-database")) return "database-internal";
  if (file.includes("tests/")) return "tests";
  if (file.includes("docs/")) return "docs";
  return "other";
}

function main() {
  const out = execSync(
    `rg -n --glob '!docs/prelaunch/data/**' --glob '!data/**' --glob '!node_modules/**' --glob '!.next/**' ${JSON.stringify(TARGET)} . || true`,
    { cwd: process.cwd(), encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );

  const hits: Hit[] = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const m = line.match(/^([^:]+):(\d+):(.*)$/);
    if (!m) continue;
    const file = m[1]!;
    const lineNo = Number(m[2]);
    const text = m[3]!.trim();
    hits.push({
      file,
      line: lineNo,
      text: text.slice(0, 160),
      surface: classify(file),
    });
  }

  const bySurface = hits.reduce(
    (acc, h) => {
      acc[h.surface] = (acc[h.surface] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const srcHits = hits.filter(
    (h) =>
      h.file.startsWith("src/") &&
      !h.file.includes(".test.") &&
      h.surface !== "database-internal" &&
      h.surface !== "tests",
  );

  const report = {
    target: TARGET,
    generatedAt: new Date().toISOString(),
    totalMatches: hits.length,
    srcSurfaceMatches: srcHits.length,
    bySurface,
    srcSurfaces: [...new Set(srcHits.map((h) => h.surface))].sort(),
    sampleSrcHits: srcHits.slice(0, 40),
  };

  const dir = join(process.cwd(), "docs/data-products");
  mkdirSync(dir, { recursive: true });
  const jsonPath = join(dir, "RUNNING-SHOE-DATABASE-INBOUND-LINKS.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  console.log(`Target: ${TARGET}`);
  console.log(`Total matches: ${hits.length}`);
  console.log(`Src surface matches (excl. database-internal/tests): ${srcHits.length}`);
  console.log("By surface:");
  for (const [k, v] of Object.entries(bySurface).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`Wrote ${jsonPath}`);
}

main();
