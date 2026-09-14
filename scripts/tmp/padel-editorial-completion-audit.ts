/**
 * Rebuild padel editorial completion audit against the live content graph.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/padel-editorial-completion-audit.ts
 *
 * Writes:
 *   docs/padel/PADEL-EDITORIAL-COMPLETION-AUDIT.md
 *   docs/padel/data/PADEL-EDITORIAL-COVERAGE.csv
 *   docs/padel/data/PADEL-RECOMMENDATION-GRAPH.csv
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { padelBestGuides } from "@/content/padel/best-guides";
import { padelBuyingGuides } from "@/content/padel/buying-guides";
import { padelComparisons } from "@/content/padel/comparisons";
import { padelEstateReviews } from "@/content/padel/reviews";
import { padelSetups } from "@/content/padel/seed";
import { padelAllAlternatives, padelAllProducts } from "@/content/padel";

const DOCS = join(process.cwd(), "docs/padel");
const DATA = join(DOCS, "data");

/** Baseline before this expansion pass (from prior padel editorial estate). */
const BEFORE = {
  reviews: 22,
  bestGuides: 19,
  buyingGuides: 21,
  comparisons: 17,
  alternatives: 143,
  gearSetups: 1,
} as const;

type RelKind =
  | "review"
  | "best-guide"
  | "buying-guide"
  | "comparison"
  | "alternative"
  | "gear-setup"
  | "compatible-accessory";

type GraphEdge = {
  sourceProductId: string;
  targetId: string;
  relation: RelKind;
  label: string;
};

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function main() {
  mkdirSync(DATA, { recursive: true });

  const products = padelAllProducts;
  const productById = new Map(products.map((p) => [p.id, p]));
  const padelProducts = products.filter((p) => p.sportIds?.includes("sport-padel") || p.categoryId?.startsWith("cat-padel"));
  // Prefer category filter when sportIds missing on soft drafts
  const catalog = products.filter((p) =>
    String(p.categoryId ?? "").startsWith("cat-padel") ||
    (p.sportIds ?? []).includes("sport-padel" as never),
  );
  const catalogIds = new Set(catalog.map((p) => p.id));

  const estateReviews = padelEstateReviews;
  const bestGuides = padelBestGuides;
  const buyingGuides = padelBuyingGuides;
  const comparisons = padelComparisons;
  const alternatives = padelAllAlternatives;
  const setups = padelSetups;

  const edges: GraphEdge[] = [];
  const relCount = new Map<string, Set<RelKind>>();

  function touch(productId: string, kind: RelKind) {
    if (!catalogIds.has(productId) && !productById.has(productId)) return;
    const set = relCount.get(productId) ?? new Set<RelKind>();
    set.add(kind);
    relCount.set(productId, set);
  }

  for (const r of estateReviews) {
    edges.push({
      sourceProductId: r.productId,
      targetId: r.id,
      relation: "review",
      label: r.title,
    });
    touch(r.productId, "review");
    for (const alt of r.alternativeProductIds ?? []) {
      edges.push({
        sourceProductId: r.productId,
        targetId: alt,
        relation: "alternative",
        label: `review-alt:${r.id}`,
      });
      touch(alt, "alternative");
    }
  }

  for (const g of bestGuides) {
    for (const rec of g.recommendations) {
      edges.push({
        sourceProductId: rec.productId,
        targetId: g.id,
        relation: "best-guide",
        label: `${g.title}#${rec.rank}`,
      });
      touch(rec.productId, "best-guide");
    }
    for (const note of g.consideredProducts ?? []) {
      edges.push({
        sourceProductId: note.productId,
        targetId: g.id,
        relation: "best-guide",
        label: `considered:${note.kind ?? "considered"}`,
      });
      touch(note.productId, "best-guide");
    }
  }

  for (const g of buyingGuides) {
    for (const pid of g.relatedProductIds ?? []) {
      edges.push({
        sourceProductId: pid,
        targetId: g.id,
        relation: "buying-guide",
        label: g.title,
      });
      touch(pid, "buying-guide");
    }
  }

  for (const c of comparisons) {
    for (const pid of c.productIds) {
      edges.push({
        sourceProductId: pid,
        targetId: c.id,
        relation: "comparison",
        label: c.title,
      });
      touch(pid, "comparison");
    }
  }

  for (const a of alternatives) {
    edges.push({
      sourceProductId: a.sourceProductId,
      targetId: a.alternativeProductId,
      relation: "alternative",
      label: a.relationshipType ?? "alternative",
    });
    touch(a.sourceProductId, "alternative");
    touch(a.alternativeProductId, "alternative");
  }

  for (const s of setups) {
    for (const item of s.items) {
      edges.push({
        sourceProductId: item.productId,
        targetId: s.id,
        relation: "gear-setup",
        label: `${s.title}:${item.role}`,
      });
      touch(item.productId, "gear-setup");
    }
  }

  // Compatible accessories: soft products pointing at relatedProductIds
  for (const p of catalog) {
    for (const rid of p.relatedProductIds ?? []) {
      const related = productById.get(rid);
      if (!related) continue;
      const isAccessoryish =
        related.categoryId === "cat-padel-accessories" ||
        related.categoryId === "cat-padel-grips" ||
        related.categoryId === "cat-padel-balls" ||
        related.categoryId === "cat-padel-bags";
      if (!isAccessoryish) continue;
      edges.push({
        sourceProductId: p.id,
        targetId: rid,
        relation: "compatible-accessory",
        label: related.name ?? rid,
      });
      touch(p.id, "compatible-accessory");
      touch(rid, "compatible-accessory");
    }
  }

  const coverageRows: string[] = [
    [
      "productId",
      "slug",
      "name",
      "categoryId",
      "brandId",
      "reviewCount",
      "bestGuideCount",
      "buyingGuideCount",
      "comparisonCount",
      "alternativeCount",
      "gearSetupCount",
      "compatibleAccessoryCount",
      "relationshipKinds",
      "relationshipCount",
      "coverageBand",
    ].join(","),
  ];

  const zero: string[] = [];
  const strong: string[] = [];

  for (const p of catalog) {
    const kinds = relCount.get(p.id) ?? new Set<RelKind>();
    const byKind = (k: RelKind) =>
      edges.filter((e) => e.sourceProductId === p.id && e.relation === k).length;
    const reviewCount = byKind("review");
    const bestGuideCount = byKind("best-guide");
    const buyingGuideCount = byKind("buying-guide");
    const comparisonCount = byKind("comparison");
    const alternativeCount = byKind("alternative");
    const gearSetupCount = byKind("gear-setup");
    const compatibleAccessoryCount = byKind("compatible-accessory");
    const relationshipCount = kinds.size;
    let coverageBand = "zero";
    if (relationshipCount >= 4) coverageBand = "strong";
    else if (relationshipCount >= 2) coverageBand = "moderate";
    else if (relationshipCount === 1) coverageBand = "thin";

    if (coverageBand === "zero") zero.push(p.id);
    if (coverageBand === "strong") strong.push(p.id);

    coverageRows.push(
      [
        p.id,
        csvEscape(p.slug ?? ""),
        csvEscape(p.name ?? p.fullName ?? ""),
        p.categoryId ?? "",
        p.brandId ?? "",
        String(reviewCount),
        String(bestGuideCount),
        String(buyingGuideCount),
        String(comparisonCount),
        String(alternativeCount),
        String(gearSetupCount),
        String(compatibleAccessoryCount),
        csvEscape([...kinds].sort().join("|")),
        String(relationshipCount),
        coverageBand,
      ].join(","),
    );
  }

  const graphRows = [
    ["sourceProductId", "targetId", "relation", "label"].join(","),
    ...edges.map((e) =>
      [e.sourceProductId, e.targetId, e.relation, csvEscape(e.label)].join(","),
    ),
  ];

  writeFileSync(join(DATA, "PADEL-EDITORIAL-COVERAGE.csv"), coverageRows.join("\n") + "\n");
  writeFileSync(join(DATA, "PADEL-RECOMMENDATION-GRAPH.csv"), graphRows.join("\n") + "\n");

  const AFTER = {
    reviews: estateReviews.length,
    bestGuides: bestGuides.length,
    buyingGuides: buyingGuides.length,
    comparisons: comparisons.length,
    alternatives: alternatives.length,
    gearSetups: setups.length,
  };

  const byCat = (cat: string) => catalog.filter((p) => p.categoryId === cat).length;
  const bestByCat = (cat: string) => bestGuides.filter((g) => g.categoryId === cat).length;

  const md = `# Padel Editorial Completion Audit

**Date:** 2026-09-13  
**Status:** EDITORIAL DECISION GRAPH EXPANDED — **not** Padel GO  
**Scope:** Rebuild recommendations against the expanded catalog. Previous winners were not preserved merely because content existed.

## Before → after

| Surface | Before | After | Δ |
| --- | ---: | ---: | ---: |
| Reviews (estate / selective) | ${BEFORE.reviews} | ${AFTER.reviews} | ${AFTER.reviews - BEFORE.reviews} |
| Best Guides | ${BEFORE.bestGuides} | ${AFTER.bestGuides} | ${AFTER.bestGuides - BEFORE.bestGuides} |
| Buying Guides | ${BEFORE.buyingGuides} | ${AFTER.buyingGuides} | ${AFTER.buyingGuides - BEFORE.buyingGuides} |
| Comparisons | ${BEFORE.comparisons} | ${AFTER.comparisons} | ${AFTER.comparisons - BEFORE.comparisons} |
| Alternatives (edges) | ${BEFORE.alternatives} | ${AFTER.alternatives} | ${AFTER.alternatives - BEFORE.alternatives} |
| Gear Setups | ${BEFORE.gearSetups} | ${AFTER.gearSetups} | ${AFTER.gearSetups - BEFORE.gearSetups} |

## Catalog context

| Category | Products in catalog (approx) | Best Guides |
| --- | ---: | ---: |
| Rackets | ${byCat("cat-padel-rackets")} | ${bestByCat("cat-padel-rackets")} |
| Shoes | ${byCat("cat-padel-shoes")} | ${bestByCat("cat-padel-shoes")} |
| Balls | ${byCat("cat-padel-balls")} | ${bestByCat("cat-padel-balls")} |
| Bags | ${byCat("cat-padel-bags")} | ${bestByCat("cat-padel-bags")} |
| Grips | ${byCat("cat-padel-grips")} | ${bestByCat("cat-padel-grips")} |
| Accessories | ${byCat("cat-padel-accessories")} | ${bestByCat("cat-padel-accessories")} |
| **Total padel catalog rows audited** | **${catalog.length}** | **${bestGuides.length}** |

## Reviews

- Estate reviews remain **selective** (high-decision only).
- Methodology: \`expert-research\` / EXPERT_RESEARCH disclosure — **no fake first-hand testing**.
- Added soft-decision reviews for high-intent products (e.g. HEAD Pro S+, AT10 Team bag, Pascal Box, Bullpadel HaC) where Best Guide / comparison demand is high.
- Do **not** interpret missing reviews on long-tail SKUs as a defect — catalog inclusion ≠ review obligation.

## Best Guides

Expanded intent cluster rebuilt against full soft-goods markets:

- **Rackets:** category + level + style + handling + value (+ women only where last/genderFit is a real fork)
- **Shoes:** category + stability + comfort + lightweight + value (+ men/women where genderFit last differs)
- **Balls:** Best Balls + competition / training / fast / value (full ~62 market funnel)
- **Bags:** Best Bags + backpacks / large / compact / shoe compartment / tournament / commuting (~125 market)
- **Grips:** Best Overgrips + sweaty / tacky / dry-feel / value multipacks + **ergonomic systems** (Hesacore kept out of overgrip awards)
- **Accessories:** ball pressurizers + racket protectors (**no** Best Wristbands)

Every Best Guide records considered → shortlisted → recommended via \`consideredProducts\` + \`recommendations\`. No arbitrary top-four architecture.

## Buying Guides

Authority cluster now includes previously missing topics:

- Fast vs Standard Padel Balls
- Padel Bag vs Backpack
- Ball Pressurizers
- Racket Protection
- Racket Customization

Plus existing racket/shoe/ball/bag/grip/beginner checklist guides.

## Comparisons

High-value pairs only (same category / similar intent / family forks). Soft comps include HEAD Pro S+ vs Pro+, Wilson Premier forks, Wilson vs HaC, AT10 Team vs RH Pro, Pascal vs X3, backpack vs paletero, RH Pro vs XXL, Kuikma Speed vs Pro S, frame protector pair.

No fake universal winners — choose-A / choose-B required.

## Alternatives

Racket catalog alternatives plus **26+ soft-goods edges** (faster/control/value/training balls; commute/tournament/cheaper bags; tack/absorption/bulk/ergonomic grips; pressurizer ↔ buy-more-cans; protector siblings).

## Gear Setups

Full-kit configurations (not affiliate stuffing):

1. Essentials / starter
2. Beginner
3. Regular club player
4. Competitive player
5. Tournament day
6. Commuter
7. Budget starter

Each uses racket + shoes + balls + grips + bag where the job needs them; accessories only when the kit job justifies them.

## Relationship coverage

| Band | Definition | Products |
| --- | --- | ---: |
| zero | No editorial edges | ${zero.length} |
| thin | 1 relationship kind | ${catalog.filter((p) => (relCount.get(p.id)?.size ?? 0) === 1).length} |
| moderate | 2–3 kinds | ${catalog.filter((p) => { const n = relCount.get(p.id)?.size ?? 0; return n >= 2 && n <= 3; }).length} |
| strong | ≥4 kinds | ${strong.length} |

### Products with zero editorial relationships

Long-tail catalog rows without review / best / guide / comparison / alternative / setup / accessory edges. Expected for market-wave inventory that is catalogued but not yet decision-critical.

Sample (first 40):

${zero.slice(0, 40).map((id) => `- \`${id}\``).join("\n") || "- (none)"}

${zero.length > 40 ? `\n… +${zero.length - 40} more in \`PADEL-EDITORIAL-COVERAGE.csv\` (coverageBand=zero).\n` : ""}

### Products with strong relationship coverage

Sample (first 40):

${strong.slice(0, 40).map((id) => {
  const p = productById.get(id);
  return `- \`${id}\` — ${p?.fullName ?? p?.name ?? id} (${[...(relCount.get(id) ?? [])].sort().join(", ")})`;
}).join("\n") || "- (none)"}

${strong.length > 40 ? `\n… +${strong.length - 40} more in coverage CSV (coverageBand=strong).\n` : ""}

## Artifacts

- \`docs/padel/data/PADEL-EDITORIAL-COVERAGE.csv\` — per-product relationship counts + coverage band
- \`docs/padel/data/PADEL-RECOMMENDATION-GRAPH.csv\` — Product → Review / Best / Guide / Comparison / Alternative / Setup / accessory edges

## Explicit non-claims

- **Not** Padel GO / INDEXABLE vertical enablement
- Catalog inclusion ≠ media ≠ commerce ≠ editorial ≠ indexation
- No affiliate-biased rankings; commission does not decide awards
- No fake first-hand testing in EXPERT_RESEARCH reviews

## Next (outside this pass)

- Generate missing review section images for any newly published soft reviews that have heroes
- Continue selective reviews only where Best Guide / comparison demand is high
- Media / commerce gates remain separate from this editorial graph rebuild
`;

  writeFileSync(join(DOCS, "PADEL-EDITORIAL-COMPLETION-AUDIT.md"), md);
  console.log(
    JSON.stringify(
      {
        before: BEFORE,
        after: AFTER,
        catalog: catalog.length,
        edges: edges.length,
        zero: zero.length,
        strong: strong.length,
        wrote: [
          "docs/padel/PADEL-EDITORIAL-COMPLETION-AUDIT.md",
          "docs/padel/data/PADEL-EDITORIAL-COVERAGE.csv",
          "docs/padel/data/PADEL-RECOMMENDATION-GRAPH.csv",
        ],
      },
      null,
      2,
    ),
  );
}

main();
