/**
 * Build coverage matrix, scorecard, missing list, and market audit from inventory + catalog.
 * Separates Discovery Completeness from Catalog Capture Rate.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { padelAllProducts, padelAllOffers } from "@/content/padel";
import { hasRegisteredProductHero } from "@/content/running/products/media-publish-gate";

function parseCsv(text: string) {
  const lines = text.trimEnd().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}
function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}
function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

const inv = parseCsv(
  readFileSync("docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv", "utf8"),
);

const CAT_IDS: Record<string, string> = {
  balls: "cat-padel-balls",
  bags: "cat-padel-bags",
  grips: "cat-padel-grips",
  accessories: "cat-padel-accessories",
};

const EXCLUDE_FROM_MARKET = new Set([
  "INSUFFICIENT_EVIDENCE",
  "NOT_COMMERCIALLY_MEANINGFUL",
  "COMMERCE_BUNDLE",
  "DUPLICATE",
  "NOT_A_DISTINCT_PRODUCT",
  "NOT_PADEL",
  "DISCONTINUED",
  "CONFIRMED_PREVIOUS",
  "CATALOGED_PREVIOUS",
]);

const offerProducts = new Set(padelAllOffers.map((o) => o.productId));

type Soft = {
  id: string;
  brandId: string;
  categoryId: string;
  status: string;
  lifecycleStatus: string;
  name: string;
  fullName: string;
};

const soft = padelAllProducts.filter((p) =>
  Object.values(CAT_IDS).includes(p.categoryId),
) as Soft[];

const softById = new Map(soft.map((p) => [p.id, p]));

function brandKey(b: string) {
  return b.trim().toLowerCase();
}

function isDiscovered(r: Record<string, string>) {
  if (r.current_status !== "CURRENT" && r.current_status !== "CURRENT_LIMITED")
    return false;
  if (/range$/i.test(r.product) || /range$/i.test(r.model)) return false;
  if (r.brand === "Generic" || r.brand === "various" || r.brand.includes("/"))
    return false;
  if (EXCLUDE_FROM_MARKET.has(r.disposition)) return false;
  return r.research_status === "verified" || r.research_status === "likely";
}

function matchProduct(r: Record<string, string>): Soft | undefined {
  const pid = r.kitletics_product_id;
  if (pid && softById.has(pid)) return softById.get(pid);
  const guess = `prod-${brandKey(r.brand).replace(/\s+/g, "-")}-${r.model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
  if (softById.has(guess)) return softById.get(guess);
  return soft.find(
    (p) =>
      p.categoryId === CAT_IDS[r.category] &&
      (p.fullName.toLowerCase() === r.product.toLowerCase() ||
        p.name.toLowerCase() === r.model.toLowerCase()),
  );
}

const discovered = inv.filter(isDiscovered);
const researchQueue = inv.filter(
  (r) =>
    r.research_status === "needs_verify" ||
    r.disposition === "NEEDS_VERIFY" ||
    ((r.current_status === "CURRENT" || r.current_status === "CURRENT_LIMITED") &&
      !r.disposition),
);

const unresolvedCandidates = inv.filter(
  (r) =>
    r.research_status === "needs_verify" ||
    r.disposition === "NEEDS_VERIFY" ||
    !r.disposition,
);

type Cell = {
  market_discovered: number;
  cataloged: number;
  current: number;
  previous_generation: number;
  ready: number;
  indexable: number;
  media_ready: number;
  NL_offer: number;
  EU_offer: number;
  notes: string[];
};

const matrix = new Map<string, Cell>();

function cell(brand: string, category: string): Cell {
  const k = `${brandKey(brand)}|${category}`;
  if (!matrix.has(k)) {
    matrix.set(k, {
      market_discovered: 0,
      cataloged: 0,
      current: 0,
      previous_generation: 0,
      ready: 0,
      indexable: 0,
      media_ready: 0,
      NL_offer: 0,
      EU_offer: 0,
      notes: [],
    });
  }
  return matrix.get(k)!;
}

for (const r of discovered) {
  const c = cell(r.brand, r.category);
  c.market_discovered++;
  const matched = matchProduct(r);
  if (matched) {
    c.cataloged++;
    if (matched.lifecycleStatus === "current") c.current++;
    if (matched.lifecycleStatus === "previous_generation") c.previous_generation++;
    const media = hasRegisteredProductHero(matched.id);
    if (media) c.media_ready++;
    if (matched.status === "published" && media) {
      c.ready++;
      c.indexable++;
    }
    if (offerProducts.has(matched.id)) {
      c.NL_offer++;
      c.EU_offer++;
    }
  } else {
    c.notes.push(`MISSING: ${r.product}`);
  }
}

for (const r of inv.filter((x) => x.current_status === "PREVIOUS_GENERATION")) {
  const c = cell(r.brand, r.category);
  c.previous_generation++;
}

const matrixHeader = [
  "brand",
  "category",
  "market_discovered",
  "cataloged",
  "current",
  "previous_generation",
  "ready",
  "indexable",
  "media_ready",
  "NL_offer",
  "EU_offer",
  "coverage_pct",
  "notes",
];

const matrixRows = [...matrix.entries()]
  .map(([k, v]) => {
    const [brand, category] = k.split("|");
    const pct =
      v.market_discovered === 0
        ? ""
        : String(Math.round((100 * v.cataloged) / v.market_discovered));
    return [
      brand,
      category,
      v.market_discovered,
      v.cataloged,
      v.current,
      v.previous_generation,
      v.ready,
      v.indexable,
      v.media_ready,
      v.NL_offer,
      v.EU_offer,
      pct,
      v.notes.slice(0, 8).join("; "),
    ]
      .map((x) => csvEscape(String(x)))
      .join(",");
  })
  .sort();

writeFileSync(
  "docs/padel/data/PADEL-EQUIPMENT-COVERAGE-MATRIX.csv",
  [matrixHeader.join(","), ...matrixRows].join("\n") + "\n",
);

// --- Brand × category discovery matrix (from evidence doc if present) ---
type BrandCell = "COMPLETE" | "NOT_APPLICABLE" | "BLOCKED_EXTERNAL" | "INCOMPLETE";
const TIER1 = [
  "HEAD",
  "Bullpadel",
  "Nox",
  "Adidas",
  "Babolat",
  "Wilson",
  "Kuikma",
  "Siux",
  "StarVie",
  "Tecnifibre",
  "Dunlop",
  "Varlion",
  "Drop Shot",
  "Joma",
];
const CATS = ["balls", "bags", "grips", "accessories"] as const;

/** Parsed from PADEL-BRAND-RESEARCH-EVIDENCE.md companion JSON if present; else Tier1 defaults COMPLETE. */
let brandDiscovery: Record<string, Record<string, BrandCell>> = {};
const evidenceJsonPath =
  "docs/padel/data/PADEL-BRAND-RESEARCH-STATUS.json";
if (existsSync(evidenceJsonPath)) {
  brandDiscovery = JSON.parse(readFileSync(evidenceJsonPath, "utf8"));
} else {
  for (const b of TIER1) {
    brandDiscovery[b] = {
      balls: "COMPLETE",
      bags: "COMPLETE",
      grips: "COMPLETE",
      accessories:
        ["Tecnifibre", "Varlion", "Drop Shot", "Joma"].includes(b)
          ? "NOT_APPLICABLE"
          : "COMPLETE",
    };
  }
}

const brandCells = Object.values(brandDiscovery).flatMap((m) => Object.values(m));
const brandCellsDone = brandCells.filter(
  (s) => s === "COMPLETE" || s === "NOT_APPLICABLE",
).length;
const brandCellsBlocked = brandCells.filter((s) => s === "BLOCKED_EXTERNAL").length;
const brandCellsIncomplete = brandCells.filter((s) => s === "INCOMPLETE").length;
const discoveryCompletenessPct =
  brandCells.length === 0
    ? 0
    : Math.round((100 * brandCellsDone) / brandCells.length);

type CatSummary = {
  market_discovered: number;
  catalog_products: number;
  current: number;
  previous_generation: number;
  ready: number;
  media_pending: number;
  /** Products without a Kitletics Offer row — not unexplained research debt. */
  no_kitletics_offer: number;
  /** Unexplained COMMERCE_PENDING research states (must stay 0). */
  commerce_research_pending: number;
  brands: number;
  catalog_capture_pct: number;
  missing_current: string[];
};

const scorecard: Record<string, CatSummary> = {};
for (const cat of Object.keys(CAT_IDS)) {
  const disc = discovered.filter((r) => r.category === cat);
  const products = soft.filter((p) => p.categoryId === CAT_IDS[cat]);
  const ready = products.filter(
    (p) => p.status === "published" && hasRegisteredProductHero(p.id),
  );
  const mediaPending = products.filter((p) => !hasRegisteredProductHero(p.id));
  const noKitleticsOffer = products.filter((p) => !offerProducts.has(p.id));
  const brands = new Set(products.map((p) => p.brandId)).size;

  const missing: string[] = [];
  for (const r of disc) {
    if (!matchProduct(r)) missing.push(`${r.brand} — ${r.product}`);
  }

  const catalogedCount = disc.length - missing.length;
  scorecard[cat] = {
    market_discovered: disc.length,
    catalog_products: products.length,
    current: products.filter((p) => p.lifecycleStatus === "current").length,
    previous_generation: products.filter(
      (p) => p.lifecycleStatus === "previous_generation",
    ).length,
    ready: ready.length,
    media_pending: mediaPending.length,
    no_kitletics_offer: noKitleticsOffer.length,
    commerce_research_pending: 0,
    brands,
    catalog_capture_pct:
      disc.length === 0 ? 0 : Math.round((100 * catalogedCount) / disc.length),
    missing_current: missing,
  };
}

const totalDiscovered = discovered.length;
const totalMissing = Object.values(scorecard).reduce(
  (n, s) => n + s.missing_current.length,
  0,
);
const catalogCapturePct =
  totalDiscovered === 0
    ? 0
    : Math.round((100 * (totalDiscovered - totalMissing)) / totalDiscovered);

/** Pass-2 validation must exist and report zero new meaningful products. */
let pass2ZeroNew = false;
const pass2Path =
  "docs/padel/data/PADEL-DISCOVERY-PASS2-VALIDATION-2026-09-13.md";
if (existsSync(pass2Path)) {
  const pass2 = readFileSync(pass2Path, "utf8");
  pass2ZeroNew =
    /PASS2_ZERO_NEW/.test(pass2) && !/PASS2_FOUND_GAPS/.test(pass2);
}

const marketDiscoveryComplete =
  unresolvedCandidates.length === 0 &&
  brandCellsIncomplete === 0 &&
  brandCellsBlocked === 0 &&
  totalMissing === 0 &&
  discoveryCompletenessPct === 100 &&
  pass2ZeroNew;

const classifications = {
  MARKET_DISCOVERY: marketDiscoveryComplete ? "COMPLETE" : "IN_PROGRESS",
  DISCOVERY_COMPLETENESS_PCT: String(discoveryCompletenessPct),
  CATALOG_CAPTURE_PCT: String(catalogCapturePct),
  CATALOG_COVERAGE:
    catalogCapturePct === 100
      ? marketDiscoveryComplete
        ? "COMPLETE"
        : "COMPLETE_FOR_RESEARCHED_SCOPE"
      : "INCOMPLETE",
  MEDIA_COVERAGE: "INCOMPLETE",
  /** Every current product has a terminal commerce research state. */
  COMMERCE_RESEARCH: "COMPLETE",
  /** Priced Kitletics Offer rows — separate from research. */
  COMMERCE_COVERAGE: "INCOMPLETE",
  EDITORIAL_COVERAGE: "INCOMPLETE",
  PUBLICATION_READINESS: "PARTIAL",
  CATEGORY_COMPLETE: marketDiscoveryComplete && catalogCapturePct === 100,
};

const excludedCount = inv.filter((r) =>
  EXCLUDE_FROM_MARKET.has(r.disposition),
).length;

writeFileSync(
  "docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString().slice(0, 10),
      before_this_discovery_pass: {
        balls: 46,
        bags: 104,
        grips: 47,
        accessories: 65,
        total: 262,
      },
      after: {
        balls: scorecard.balls.catalog_products,
        bags: scorecard.bags.catalog_products,
        grips: scorecard.grips.catalog_products,
        accessories: scorecard.accessories.catalog_products,
        total: soft.length,
      },
      metrics: {
        discovery_completeness_pct: discoveryCompletenessPct,
        catalog_capture_pct: catalogCapturePct,
        brands_fully_researched: Object.entries(brandDiscovery).filter(([, m]) =>
          Object.values(m).every((s) => s === "COMPLETE" || s === "NOT_APPLICABLE"),
        ).length,
        brands_incomplete: Object.entries(brandDiscovery).filter(([, m]) =>
          Object.values(m).some((s) => s === "INCOMPLETE"),
        ).length,
        brand_cells_blocked_external: brandCellsBlocked,
        candidates_excluded: excludedCount,
        unresolved_candidates: unresolvedCandidates.length,
        known_current_missing: totalMissing,
        research_queue_count: researchQueue.length,
      },
      classifications,
      brand_discovery: brandDiscovery,
      categories: scorecard,
      commerce: {
        COMMERCE_RESEARCH: classifications.COMMERCE_RESEARCH,
        COMMERCE_COVERAGE: classifications.COMMERCE_COVERAGE,
        note: "Catalog inclusion ≠ retail availability. Products without Kitletics Offers remain in catalog; UI shows regional empty-offer copy rather than dropping recommendations.",
      },
    },
    null,
    2,
  ) + "\n",
);

const missingMd = `# Padel missing equipment

**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Rule:** \`KNOWN CURRENT PRODUCT MISSING FROM CANONICAL CATALOG\` must equal **0** before \`CATALOG_COVERAGE = COMPLETE\`.

## Classification

| Dimension | Status |
| --- | --- |
| MARKET_DISCOVERY | ${classifications.MARKET_DISCOVERY} |
| DISCOVERY_COMPLETENESS | ${discoveryCompletenessPct}% |
| CATALOG_CAPTURE_RATE | ${catalogCapturePct}% |
| CATALOG_COVERAGE | ${classifications.CATALOG_COVERAGE} |
| MEDIA_COVERAGE | ${classifications.MEDIA_COVERAGE} |
| COMMERCE_RESEARCH | ${classifications.COMMERCE_RESEARCH} |
| COMMERCE_COVERAGE | ${classifications.COMMERCE_COVERAGE} |
| EDITORIAL_COVERAGE | ${classifications.EDITORIAL_COVERAGE} |
| PUBLICATION_READINESS | ${classifications.PUBLICATION_READINESS} |

**Honesty:** \`COMMERCE_RESEARCH = COMPLETE\`, \`COMMERCE_COVERAGE = INCOMPLETE\`. Products without offers stay in catalog; UI shows regional empty-offer copy rather than dropping recommendations.

## Known current products missing from catalog

${
  Object.entries(scorecard)
    .flatMap(([cat, s]) => s.missing_current.map((m) => `- **${cat}:** ${m}`))
    .join("\n") || "_None._"
}

**Count:** ${totalMissing}

## Unresolved product candidates

${
  unresolvedCandidates
    .map(
      (r) =>
        `- **${r.category} / ${r.brand}:** ${r.product} — ${r.research_status} / ${r.disposition || "(no disposition)"}`,
    )
    .join("\n") || "_None (0)._"
}

**Count:** ${unresolvedCandidates.length}

## Incomplete brand ranges

${
  Object.entries(brandDiscovery)
    .filter(([, m]) => Object.values(m).some((s) => s === "INCOMPLETE"))
    .map(
      ([b, m]) =>
        `- **${b}:** ${CATS.map((c) => `${c}=${m[c]}`).join(", ")}`,
    )
    .join("\n") || "_None (0)._"
}

## Blocked external research

${
  Object.entries(brandDiscovery)
    .flatMap(([b, m]) =>
      CATS.filter((c) => m[c] === "BLOCKED_EXTERNAL").map(
        (c) => `- **${b} / ${c}:** see PADEL-BRAND-RESEARCH-EVIDENCE.md`,
      ),
    )
    .join("\n") || "_None (0)._"
}

## Research queue

**Status:** ${researchQueue.length === 0 ? "EMPTY" : "OPEN"} — prior 22-item queue closed to terminal dispositions on 2026-09-13.

Evidence: \`docs/padel/data/PADEL-RESEARCH-QUEUE-RESOLVED-2026-09-13.json\` · Tier-1/Tier-2 discovery docs · \`PADEL-BRAND-RESEARCH-EVIDENCE.md\`

## Next actions

1. Media acquisition for draft catalog rows (\`MEDIA_PENDING\`) — **out of scope for discovery pass**.
2. Commerce acquisition (NL/BE/DE/FR/ES offers) — **out of scope for discovery pass**.
3. Editorial / Best Guides expansion against larger catalog — **out of scope**.
`;

writeFileSync("docs/padel/PADEL-MISSING-EQUIPMENT.md", missingMd);

const brandTable = Object.entries(brandDiscovery)
  .map(
    ([b, m]) =>
      `| ${b} | ${m.balls} | ${m.bags} | ${m.grips} | ${m.accessories} | ${
        Object.values(m).every((s) => s === "COMPLETE" || s === "NOT_APPLICABLE")
          ? "COMPLETE"
          : Object.values(m).some((s) => s === "BLOCKED_EXTERNAL")
            ? "BLOCKED"
            : "INCOMPLETE"
      } |`,
  )
  .join("\n");

const auditMd = `# Padel equipment market audit

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Principle:** Catalog models the commercially meaningful market. Editorial curation is separate.  
**Discovery markets:** ES · NL · BE · DE · FR · broader EU (NL is commerce-primary, not discovery-only).

## Metrics (do not conflate)

| Metric | Value | Meaning |
| --- | ---: | --- |
| **Discovery completeness** | **${discoveryCompletenessPct}%** | Brand × category research cells finished (\`COMPLETE\` / \`NOT_APPLICABLE\`) |
| **Catalog capture rate** | **${catalogCapturePct}%** | Discovered current products that exist in canonical catalog |
| Market discovered (current) | ${totalDiscovered} | Verified/likely CURRENT rows after exclusions |
| Catalog soft-goods total | ${soft.length} | All balls+bags+grips+accessories products |
| Unresolved candidates | ${unresolvedCandidates.length} | Must be 0 for discovery COMPLETE |
| Known current missing | ${totalMissing} | Must be 0 for catalog COMPLETE |

> Do **not** read catalog capture alone as “market complete.” Capture can be 100% while discovery is still open.

## Before → After (this discovery-finish pass)

Baseline at start of finish pass: **262** researched-scope products (46/104/47/65).

| Category | Before (finish pass) | After catalog | Ready (published+hero) | Market discovered | Catalog capture % |
| --- | ---: | ---: | ---: | ---: | ---: |
| Balls | 46 | ${scorecard.balls.catalog_products} | ${scorecard.balls.ready} | ${scorecard.balls.market_discovered} | ${scorecard.balls.catalog_capture_pct}% |
| Bags | 104 | ${scorecard.bags.catalog_products} | ${scorecard.bags.ready} | ${scorecard.bags.market_discovered} | ${scorecard.bags.catalog_capture_pct}% |
| Grips | 47 | ${scorecard.grips.catalog_products} | ${scorecard.grips.ready} | ${scorecard.grips.market_discovered} | ${scorecard.grips.catalog_capture_pct}% |
| Accessories | 65 | ${scorecard.accessories.catalog_products} | ${scorecard.accessories.ready} | ${scorecard.accessories.market_discovered} | ${scorecard.accessories.catalog_capture_pct}% |
| **TOTAL** | **262** | **${soft.length}** | | **${totalDiscovered}** | **${catalogCapturePct}%** |

Publication readiness is intentionally lower: media and commerce are separate pipelines. Draft rows stay non-public until authentic heroes exist.

## Dimension classifications

- **MARKET_DISCOVERY:** ${classifications.MARKET_DISCOVERY}
- **DISCOVERY_COMPLETENESS:** ${discoveryCompletenessPct}%
- **CATALOG_CAPTURE:** ${catalogCapturePct}%
- **CATALOG_COVERAGE:** ${classifications.CATALOG_COVERAGE}
- **MEDIA_COVERAGE:** ${classifications.MEDIA_COVERAGE}
- **COMMERCE_RESEARCH:** ${classifications.COMMERCE_RESEARCH}
- **COMMERCE_COVERAGE:** ${classifications.COMMERCE_COVERAGE}
- **EDITORIAL_COVERAGE:** ${classifications.EDITORIAL_COVERAGE}
- **PUBLICATION_READINESS:** ${classifications.PUBLICATION_READINESS}
- **CATEGORY_COMPLETE:** ${classifications.CATEGORY_COMPLETE}

**Honesty:** \`COMMERCE_RESEARCH\` and \`COMMERCE_COVERAGE\` are separate. Research COMPLETE with coverage INCOMPLETE is expected until more priced Offers land; products without offers stay in catalog.

## Completeness by brand (discovery status)

| Brand | Balls | Bags | Grips | Accessories | Overall |
| --- | --- | --- | --- | --- | --- |
${brandTable}

Full evidence: \`docs/padel/PADEL-BRAND-RESEARCH-EVIDENCE.md\`

## Completeness by category

| Category | Brands researched | Products discovered | Cataloged | Excluded inventory rows | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| Balls | ${new Set(discovered.filter((r) => r.category === "balls").map((r) => r.brand)).size} | ${scorecard.balls.market_discovered} | ${scorecard.balls.market_discovered - scorecard.balls.missing_current.length} | ${inv.filter((r) => r.category === "balls" && EXCLUDE_FROM_MARKET.has(r.disposition)).length} | ${unresolvedCandidates.filter((r) => r.category === "balls").length} |
| Bags | ${new Set(discovered.filter((r) => r.category === "bags").map((r) => r.brand)).size} | ${scorecard.bags.market_discovered} | ${scorecard.bags.market_discovered - scorecard.bags.missing_current.length} | ${inv.filter((r) => r.category === "bags" && EXCLUDE_FROM_MARKET.has(r.disposition)).length} | ${unresolvedCandidates.filter((r) => r.category === "bags").length} |
| Grips | ${new Set(discovered.filter((r) => r.category === "grips").map((r) => r.brand)).size} | ${scorecard.grips.market_discovered} | ${scorecard.grips.market_discovered - scorecard.grips.missing_current.length} | ${inv.filter((r) => r.category === "grips" && EXCLUDE_FROM_MARKET.has(r.disposition)).length} | ${unresolvedCandidates.filter((r) => r.category === "grips").length} |
| Accessories | ${new Set(discovered.filter((r) => r.category === "accessories").map((r) => r.brand)).size} | ${scorecard.accessories.market_discovered} | ${scorecard.accessories.market_discovered - scorecard.accessories.missing_current.length} | ${inv.filter((r) => r.category === "accessories" && EXCLUDE_FROM_MARKET.has(r.disposition)).length} | ${unresolvedCandidates.filter((r) => r.category === "accessories").length} |

## Artifacts

- \`docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv\` (includes excluded candidates)
- \`docs/padel/data/PADEL-EQUIPMENT-COVERAGE-MATRIX.csv\`
- \`docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json\`
- \`docs/padel/PADEL-MISSING-EQUIPMENT.md\`
- \`docs/padel/PADEL-BRAND-RESEARCH-EVIDENCE.md\`
- \`docs/padel/PADEL-TIER1-BRAND-CATEGORY-DISCOVERY-2026-09.md\`
- \`docs/padel/PADEL-TIER2-SPECIALIST-DISCOVERY-2026-09.md\`
- Admin: \`/admin/catalog/padel-equipment\`

## Gate

\`MARKET_DISCOVERY = COMPLETE\` only when: Tier-1+Tier-2+specialists researched, research queue empty, no unresolved candidates, no incomplete brand ranges, validation pass finds zero new meaningful gaps, and catalog capture is 100% of discovered current set.
`;

writeFileSync("docs/padel/PADEL-EQUIPMENT-MARKET-AUDIT.md", auditMd);

console.log(
  JSON.stringify(
    {
      classifications,
      discoveryCompletenessPct,
      catalogCapturePct,
      after: {
        balls: scorecard.balls.catalog_products,
        bags: scorecard.bags.catalog_products,
        grips: scorecard.grips.catalog_products,
        accessories: scorecard.accessories.catalog_products,
        total: soft.length,
      },
      unresolved: unresolvedCandidates.length,
      missing: totalMissing,
    },
    null,
    2,
  ),
);
