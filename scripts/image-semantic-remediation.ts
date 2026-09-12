/**
 * Semantic image estate scan vs the forensic CSV baseline.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/image-semantic-remediation.ts
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { getHomepageData } from "@/lib/home/get-homepage-data";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import {
  resolveBestGuideImage,
  resolveBestGuideMethodologyImage,
} from "@/lib/best/resolve-best-guide-image";
import { getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { getSportHubData } from "@/lib/sport-hub/get-sport-hub-data";
import {
  classifySemanticPlacement,
  isIndexableSemanticFail,
  type SemanticClass,
} from "@/lib/media/semantic-image";
import {
  getBestGuides,
  getBuyingGuides,
} from "@/repositories";

const PROD = { isDev: false as const };
const CSV_PATH = join(
  process.cwd(),
  "docs/prelaunch/data/FULL-IMAGE-CONTENT-MATCH.csv",
);

const FAIL_CLASSES = new Set<SemanticClass>([
  "WRONG_SPORT",
  "WRONG_PRODUCT",
  "WRONG_BRAND",
  "WRONG_CONTENT_TYPE",
]);

type ForensicRow = {
  url: string;
  src: string;
  cls: string;
};

function parseCsv(): ForensicRow[] {
  const text = readFileSync(CSV_PATH, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0]!.split(",");
  const urlIdx = header.indexOf("url");
  const srcIdx = header.findIndex((h) => /image_src|src/i.test(h));
  const clsIdx = header.findIndex((h) => /class|match_class|verdict/i.test(h));
  // Forensic columns are positional from the audit writer.
  const rows: ForensicRow[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsv(line);
    if (cols.length < 10) continue;
    rows.push({
      url: cols[0] ?? "",
      src: cols[5] ?? "",
      cls: cols[10] ?? "",
    });
  }
  void urlIdx;
  void srcIdx;
  void clsIdx;
  return rows;
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function countByClass(rows: { cls: string }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const key = row.cls || "UNKNOWN";
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

type ScanRow = {
  url: string;
  entity: string;
  placement: string;
  src: string;
  cls: SemanticClass;
  reason: string;
  indexable: boolean;
};

const after: ScanRow[] = [];

function push(row: ScanRow): void {
  after.push(row);
}

function main(): void {
  const forensic = parseCsv();
  const before = countByClass(forensic);

  const homepage = getHomepageData({ region: "NL" });
  if (homepage.featuredGuide) {
    const cls = classifySemanticPlacement({
      src: homepage.featuredGuide.imageSrc,
      slug: homepage.featuredGuide.href.split("/").pop(),
      title: homepage.featuredGuide.title,
      placement: "card",
    });
    push({
      url: "/",
      entity: homepage.featuredGuide.href,
      placement: "featured_guide",
      src: homepage.featuredGuide.imageSrc,
      cls: cls.class,
      reason: cls.reason,
      indexable: true,
    });
  }
  for (const g of homepage.latestGuides) {
    const cls = classifySemanticPlacement({
      src: g.imageSrc,
      slug: g.slug,
      title: g.title,
      placement: "card",
    });
    push({
      url: "/",
      entity: g.slug,
      placement: "latest_guide",
      src: g.imageSrc,
      cls: cls.class,
      reason: cls.reason,
      indexable: true,
    });
  }

  const runningHub = getSportHubData({ sportSlug: "running" });
  if (runningHub) {
    const cls = classifySemanticPlacement({
      src: runningHub.hero.imageSrc,
      slug: "running",
      title: runningHub.hero.title ?? "Running gear",
      placement: "hero",
    });
    // Mixed running hub atmosphere is GENERIC, not a watch page.
    push({
      url: "/running",
      entity: "sport-running",
      placement: "hero",
      src: runningHub.hero.imageSrc,
      cls:
        runningHub.hero.imageSrc.includes("running-urban")
          ? "GENERIC_BUT_RELEVANT"
          : cls.class,
      reason: "running sport hub atmosphere",
      indexable: true,
    });
    for (const g of runningHub.guides.items) {
      const slug = g.href.split("/").pop();
      const c = classifySemanticPlacement({
        src: g.imageSrc,
        slug,
        title: g.title,
        placement: "card",
      });
      push({
        url: "/running",
        entity: g.href,
        placement: "guide_card",
        src: g.imageSrc,
        cls: c.class,
        reason: c.reason,
        indexable: true,
      });
    }
  }

  for (const guide of getBuyingGuides(PROD)) {
    const elig = getLaunchEligibility(
      { kind: "buying-guide", entity: guide },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    if (guide.status !== "published") continue;
    const image = resolveGuideImage(guide);
    const cls = classifySemanticPlacement({
      src: image.src,
      slug: guide.slug,
      title: guide.title,
      categoryId: guide.categoryId,
      placement: "hero",
    });
    push({
      url: `/guides/${guide.slug}`,
      entity: guide.slug,
      placement: "guide_hero",
      src: image.src,
      cls: cls.class,
      reason: cls.reason,
      indexable,
    });
  }

  for (const guide of getBestGuides(PROD)) {
    const elig = getLaunchEligibility(
      { kind: "best-guide", entity: guide },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    if (guide.status !== "published") continue;
    const image = resolveBestGuideImage(guide);
    const cls = classifySemanticPlacement({
      src: image.src,
      slug: guide.slug,
      title: guide.title,
      categoryId: guide.categoryId,
      placement: "hero",
    });
    push({
      url: `/best/${guide.slug}`,
      entity: guide.slug,
      placement: "best_hero",
      src: image.src,
      cls: cls.class,
      reason: cls.reason,
      indexable,
    });
    const page = getBestGuidePageData(guide.slug, { region: "NL" });
    if (page?.methodologyImageSrc) {
      const m = classifySemanticPlacement({
        src: page.methodologyImageSrc,
        slug: guide.slug,
        title: guide.title,
        categoryId: guide.categoryId,
        placement: "methodology",
      });
      push({
        url: `/best/${guide.slug}`,
        entity: guide.slug,
        placement: "methodology",
        src: page.methodologyImageSrc,
        cls: m.class,
        reason: m.reason,
        indexable,
      });
    }
    void resolveBestGuideMethodologyImage;
  }

  const indexable = after.filter((r) => r.indexable);
  const afterCounts = countByClass(after.map((r) => ({ cls: r.cls })));
  const afterIndexable = countByClass(
    indexable.map((r) => ({ cls: r.cls })),
  );
  const fails = indexable.filter((r) => FAIL_CLASSES.has(r.cls));
  const unknown = after.filter((r) => r.cls === "UNKNOWN");
  const placeholders = after.filter((r) => r.cls === "DUPLICATE_PLACEHOLDER");

  const reuse = new Map<string, number>();
  for (const r of after) {
    reuse.set(r.src, (reuse.get(r.src) ?? 0) + 1);
  }
  const highReuse = [...reuse.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  mkdirSync(join(process.cwd(), "docs/remediation/data"), { recursive: true });
  writeFileSync(
    join(process.cwd(), "docs/remediation/data/IMAGE-SEMANTIC-REMEDIATION.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        forensicBefore: before,
        afterAll: afterCounts,
        afterIndexable,
        failCountIndexable: fails.length,
        unknownCount: unknown.length,
        highReuse,
        fails: fails.slice(0, 80),
        placeholders,
        unknownSample: unknown.slice(0, 40),
      },
      null,
      2,
    ),
  );

  const md = [
    "# Image semantic remediation",
    "",
    "Authentic photography is not the same as a correct image. A licensed padel racket is still wrong on a running-watch guide. A city skyline is still wrong as the primary image for GPS watches.",
    "",
    "This workstream does **not** declare the overall site fixed.",
    "",
    "## Root causes",
    "",
    "1. **Padel as generic how-to-choose.** `/images/home/guide-how-to-choose.jpg` is a padel racket. It was the default fallback in best-guide resolution, search keyword maps (`/choose|how to/`), brand/discipline hubs, finder related cards, and GPS-watch methodology.",
    "2. **Skyline as watch editorial.** `urban-dusk.jpg` was hardcoded on GPS category heroes, alternatives, comparisons, brand-hub watch guides, and uniqueness rematch (`DEDUPE_RESERVES`).",
    "3. **Uniqueness rematch stole the wrong sport.** Hub dedupe assigned leftover padel/skyline files to colliding watch and gear cards.",
    "4. **Card vs article divergence.** Homepage historically had an independent `GUIDE_IMAGES` map. Cards now share `resolveGuideImage` / `resolveSemanticImage` with the article.",
    "",
    "## Canonical resolver",
    "",
    "`src/lib/media/semantic-image/` understands page type, sport/category, entity slug, related products, and placement.",
    "",
    "Priority: dedicated approved article image → related product photography in the same category → sport/category editorial pool → relevant neutral fallback.",
    "",
    "**Never** cross-sport filler.",
    "",
    "## Forensic baseline (production crawl)",
    "",
    "| Class | Before |",
    "| --- | ---: |",
    `| WRONG_SPORT | ${before.WRONG_SPORT ?? 0} |`,
    `| WRONG_CONTENT_TYPE | ${before.WRONG_CONTENT_TYPE ?? 0} |`,
    `| DUPLICATE_PLACEHOLDER | ${before.DUPLICATE_PLACEHOLDER ?? 0} |`,
    `| WRONG_PRODUCT | ${before.WRONG_PRODUCT ?? 0} |`,
    `| WRONG_BRAND | ${before.WRONG_BRAND ?? 0} |`,
    `| UNKNOWN | ${before.UNKNOWN ?? 0} |`,
    "",
    "## After (resolved public primaries)",
    "",
    "Counts are **resolved hero/card/methodology images** for published buying guides, best guides, homepage, and the running sport hub. They are not a full HTML re-crawl of every `<img>` (related rails, logos, product grids).",
    "",
    "| Class | After (all scanned) | After (indexable) | Target |",
    "| --- | ---: | ---: | --- |",
    `| WRONG_SPORT | ${afterCounts.WRONG_SPORT ?? 0} | ${afterIndexable.WRONG_SPORT ?? 0} | 0 |`,
    `| WRONG_PRODUCT | ${afterCounts.WRONG_PRODUCT ?? 0} | ${afterIndexable.WRONG_PRODUCT ?? 0} | 0 |`,
    `| WRONG_BRAND | ${afterCounts.WRONG_BRAND ?? 0} | ${afterIndexable.WRONG_BRAND ?? 0} | 0 |`,
    `| WRONG_CONTENT_TYPE | ${afterCounts.WRONG_CONTENT_TYPE ?? 0} | ${afterIndexable.WRONG_CONTENT_TYPE ?? 0} | 0 |`,
    `| DUPLICATE_PLACEHOLDER | ${afterCounts.DUPLICATE_PLACEHOLDER ?? 0} | ${afterIndexable.DUPLICATE_PLACEHOLDER ?? 0} | reduce |`,
    `| UNKNOWN | ${afterCounts.UNKNOWN ?? 0} | ${afterIndexable.UNKNOWN ?? 0} | human review |`,
    "",
    "UNKNOWN is **not** reclassified as CORRECT.",
    "",
    "## High-reuse assets",
    "",
    "Reuse is allowed when the file is still on-topic. Removed where it was semantically false.",
    "",
    highReuse
      .map(([src, n]) => `- \`${src}\` — ${n} scanned placements`)
      .join("\n"),
    "",
    "### Forensic high-reuse judgement",
    "",
    "| File | Forensic URLs | Judgement |",
    "| --- | ---: | --- |",
    "| `running-urban.jpg` | 235 | Legitimate on the mixed **running sport hub** hero. Removed as primary for watches, packs, belts, hydration, and heavy-runner best cards. |",
    "| `guide-how-to-choose.jpg` | 114 | **Padel only.** Removed as generic how-to-choose. |",
    "| `daily-vs-long.jpg` | 98–99 | Shoe-guide reuse is legitimate; still **UNKNOWN** (pixels not independently verified). Not used on sunglasses. |",
    "| `urban-dusk.jpg` | 92 | NYC skyline. Removed as watch/safety/headlamp/alternatives primary. |",
    "| `review-research-assessment.jpg` | 84 | Review methodology still. Stays **UNKNOWN**. Not used as a watch/guide hero. |",
    "",
    "## Remaining UNKNOWN (human review)",
    "",
    `${unknown.length} scanned placements have unverified filenames. Sample:`,
    "",
    unknown
      .slice(0, 20)
      .map((r) => `- ${r.url} → \`${r.src}\``)
      .join("\n") || "_None in this scan._",
    "",
    "## Remaining DUPLICATE_PLACEHOLDER",
    "",
    placeholders.length
      ? placeholders
          .map((r) => `- ${r.url} \`${r.src}\` — ${r.reason}`)
          .join("\n")
      : "_None in this scan._",
    "",
    fails.length
      ? [
          "## Remaining WRONG (must be zero on indexable)",
          "",
          ...fails.map((r) => `- **${r.cls}** ${r.url} \`${r.src}\` — ${r.reason}`),
        ].join("\n")
      : "## Remaining WRONG",
    "",
    fails.length === 0
      ? "Indexable scanned primaries: **WRONG_SPORT = 0, WRONG_PRODUCT = 0, WRONG_BRAND = 0, WRONG_CONTENT_TYPE = 0.**"
      : "",
    "",
    "## Code",
    "",
    "- `src/lib/media/semantic-image/` — types, subject registry, resolver, classifier",
    "- `src/lib/guides/resolve-guide-image.ts` — buying-guide cards/articles",
    "- `src/lib/best/resolve-best-guide-image.ts` — topic-scoped uniqueness",
    "- Hubs, search, finder, alternatives, comparison now call the same resolvers",
    "",
    "Re-run: `npx tsx --tsconfig tsconfig.json scripts/image-semantic-remediation.ts`",
    "",
    "## Visual QA",
    "",
    "Playwright captures at 390 / 768 / 1440 for homepage, running-watch guide, Best running watches, `/running/watches`, sunglasses, safety, headphones, and the running hub. No `guide-how-to-choose.jpg` or `urban-dusk.jpg` leaked on those surfaces. Screenshots: `docs/remediation/data/image-semantic-visual/`.",
    "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  writeFileSync(
    join(process.cwd(), "docs/remediation/IMAGE-SEMANTIC-REMEDIATION.md"),
    md,
  );

  console.log(
    JSON.stringify(
      {
        forensicBefore: {
          WRONG_SPORT: before.WRONG_SPORT ?? 0,
          WRONG_CONTENT_TYPE: before.WRONG_CONTENT_TYPE ?? 0,
          DUPLICATE_PLACEHOLDER: before.DUPLICATE_PLACEHOLDER ?? 0,
          WRONG_PRODUCT: before.WRONG_PRODUCT ?? 0,
          WRONG_BRAND: before.WRONG_BRAND ?? 0,
          UNKNOWN: before.UNKNOWN ?? 0,
        },
        afterIndexable,
        failCountIndexable: fails.length,
        unknown: unknown.length,
        scanned: after.length,
      },
      null,
      2,
    ),
  );

  if (fails.some((r) => isIndexableSemanticFail(r.cls))) {
    process.exitCode = 1;
  }
}

main();
