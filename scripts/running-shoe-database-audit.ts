/**
 * One-shot audit: Running Shoes catalog coverage for the public database.
 * Run: npx tsx --tsconfig tsconfig.json scripts/running-shoe-database-audit.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getProductsByCategory, getBrandById, getProductFamilyById, getVariantsForProduct, getLowestOfferPrice } from "@/repositories/products";
import { getOffersForProduct } from "@/repositories/commerce";
import { getReviews } from "@/repositories/editorial";
import { getComparisons } from "@/repositories/editorial";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getSubcategoriesByCategory } from "@/repositories/sports";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  isLaunchListable,
  shouldRenderPublicly,
} from "@/domain/launch";
import { canFeatureProduct, getPrimaryProductMedia } from "@/lib/product/media";
import { runningShoeSpecs } from "@/content/specs/definitions";

const CATEGORY_ID = "cat-running-shoes";
const opts = { isDev: false as const };

function hasValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "boolean") return true;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") {
    const o = v as { min?: number; max?: number };
    return o.min !== undefined || o.max !== undefined;
  }
  return false;
}

function pct(n: number, total: number): string {
  if (total === 0) return "0.0%";
  return `${((n / total) * 100).toFixed(1)}%`;
}

function main() {
  const all = getProductsByCategory(CATEGORY_ID, opts);
  const published = all.filter((p) => p.status === "published");
  const listable = all.filter(
    (p) =>
      canFeatureProduct(p) &&
      isLaunchListable(getLaunchEligibility({ kind: "product", entity: p }, opts)),
  );
  const indexable = all.filter((p) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "product", entity: p }, opts),
    ),
  );
  const renderable = all.filter((p) =>
    shouldRenderPublicly(
      getLaunchEligibility({ kind: "product", entity: p }, opts),
    ),
  );

  // Database eligibility = same as catalog listing (published + authentic media + launch listable)
  const eligible = listable;

  const reviews = getReviews(opts);
  const reviewByProductId = new Map(
    reviews.filter((r) => r.productId).map((r) => [r.productId!, r]),
  );
  const comparisons = getComparisons(opts);
  const productsInComparisons = new Set<string>();
  for (const c of comparisons) {
    for (const id of c.productIds ?? []) productsInComparisons.add(id);
  }
  const relationships = getAllProductRelationships();
  const productsWithAlts = new Set<string>();
  for (const r of relationships) {
    if (
      r.fromProductId &&
      (r.type.includes("alternative") ||
        r.type === "similar" ||
        r.type === "cheaper-alternative" ||
        r.type === "more-cushioned" ||
        r.type === "previous-generation" ||
        r.type === "next-generation")
    ) {
      productsWithAlts.add(r.fromProductId);
    }
  }
  for (const p of eligible) {
    if (p.alternativeProductIds?.length || p.relatedProductIds?.length) {
      productsWithAlts.add(p.id);
    }
  }

  const subcats = getSubcategoriesByCategory(CATEGORY_ID);
  const subcatName = Object.fromEntries(subcats.map((s) => [s.id, s.name]));

  type FieldRow = {
    field: string;
    source: string;
    present: number;
    coverage: string;
    publicReady: "yes" | "partial" | "no";
    notes: string;
  };

  const rows: FieldRow[] = [];
  const n = eligible.length;

  const count = (pred: (p: (typeof eligible)[0]) => boolean) =>
    eligible.filter(pred).length;

  const add = (
    field: string,
    source: string,
    present: number,
    publicReady: FieldRow["publicReady"],
    notes: string,
  ) => {
    rows.push({
      field,
      source,
      present,
      coverage: pct(present, n),
      publicReady,
      notes,
    });
  };

  add(
    "brand",
    "Product.brandId → Brand",
    count((p) => Boolean(getBrandById(p.brandId, opts))),
    "yes",
    "Always required on products",
  );
  add(
    "model (name)",
    "Product.name / fullName",
    count((p) => Boolean(p.name && p.fullName)),
    "yes",
    "Always present",
  );
  add(
    "family",
    "Product.familyId → ProductFamily",
    count((p) => Boolean(p.familyId && getProductFamilyById(p.familyId))),
    "partial",
    "Useful when present; omit when missing",
  );
  add(
    "generation",
    "Product.generation",
    count((p) => hasValue(p.generation)),
    "partial",
    "String generation label when known",
  );
  add(
    "gender / variant",
    "ProductVariant.audience + genderFit spec",
    count((p) => {
      const v = getVariantsForProduct(p.id);
      return v.length > 0 || hasValue(p.specifications.genderFit);
    }),
    "yes",
    "Prefer variants; fall back to genderFit multi-enum",
  );
  add(
    "use case",
    "Product.useCaseIds",
    count((p) => p.useCaseIds.length > 0),
    "yes",
    "Mapped via UseCase taxonomy",
  );
  add(
    "shoe type (subcategory)",
    "Product.subcategoryIds",
    count((p) => p.subcategoryIds.some((id) => subcatName[id])),
    "yes",
    "Daily trainer, race, trail, stability, etc.",
  );

  for (const spec of runningShoeSpecs) {
    const present = count((p) => hasValue(p.specifications[spec.key]));
    const core = [
      "weight",
      "heelStack",
      "forefootStack",
      "drop",
      "cushionLevel",
      "stability",
      "plate",
      "plateMaterial",
      "terrain",
      "surface",
      "recommendedDistance",
      "widthOptions",
    ].includes(spec.key);
    const coverageNum = present / Math.max(n, 1);
    let ready: FieldRow["publicReady"] = "no";
    if (coverageNum >= 0.85) ready = "yes";
    else if (coverageNum >= 0.5) ready = "partial";
    if (!core && coverageNum < 0.5) ready = "no";
    add(
      spec.key,
      `specifications.${spec.key}`,
      present,
      ready,
      `${spec.label} (${spec.type}${spec.unit ? `, ${spec.unit}` : ""})`,
    );
  }

  add(
    "release date/year",
    "Product.releaseDate",
    count((p) => hasValue(p.releaseDate)),
    count((p) => hasValue(p.releaseDate)) / Math.max(n, 1) >= 0.5
      ? "partial"
      : "no",
    "ISO date when known — do not invent year",
  );
  add(
    "launch / MSRP price",
    "(no dedicated field)",
    0,
    "no",
    "No canonical launchPrice field — do not invent",
  );
  add(
    "current offers / price",
    "Offer via getLowestOfferPrice (NL default)",
    count((p) => Boolean(getLowestOfferPrice(p.id, "NL", opts))),
    "partial",
    "Regional; may be missing for some SKUs",
  );
  add(
    "any active offer rows",
    "getOffersForProduct(productId, region)",
    count((p) => getOffersForProduct(p.id, "NL").length > 0),
    "partial",
    "Offer rows may exist without valid price; use getLowestOfferPrice for display",
  );
  add(
    "product imagery (authentic)",
    "getPrimaryProductMedia / canFeatureProduct",
    count((p) => Boolean(getPrimaryProductMedia(p))),
    "yes",
    "Required for listable eligibility",
  );
  add(
    "Kitletics recommendationScore",
    "Product.recommendationScore",
    count((p) => typeof p.recommendationScore === "number"),
    "partial",
    "Expose only when present",
  );
  add(
    "valueScore",
    "Product.valueScore",
    count((p) => typeof p.valueScore === "number"),
    "partial",
    "Expose only when present",
  );
  add(
    "review",
    "Product.reviewId / Review by productId",
    count(
      (p) =>
        Boolean(p.reviewId) ||
        Boolean(reviewByProductId.get(p.id)?.status === "published"),
    ),
    "partial",
    "Link when published review exists",
  );
  add(
    "comparison membership",
    "Comparison.productIds",
    count((p) => productsInComparisons.has(p.id)),
    "partial",
    "Flag/link when product appears in a comparison",
  );
  add(
    "alternatives / relationships",
    "ProductRelationship + legacy arrays",
    count((p) => productsWithAlts.has(p.id)),
    "partial",
    "Not required on every row",
  );

  const statusBreakdown: Record<string, number> = {};
  for (const p of all) {
    statusBreakdown[p.status] = (statusBreakdown[p.status] ?? 0) + 1;
  }

  const dispositionBreakdown: Record<string, number> = {};
  for (const p of all) {
    const d = getLaunchEligibility({ kind: "product", entity: p }, opts)
      .disposition;
    dispositionBreakdown[d] = (dispositionBreakdown[d] ?? 0) + 1;
  }

  const carbonPlated = count(
    (p) =>
      p.specifications.plate === true &&
      p.specifications.plateMaterial === "carbon",
  );

  const lines: string[] = [];
  lines.push("# Running Shoe Database — Data Audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push(
    "Audit of canonical `cat-running-shoes` products for the public flagship page `/running/shoes/database`.",
  );
  lines.push("");
  lines.push("**Rules:** no invented specs; coverage measured only on values present in catalog.");
  lines.push("");
  lines.push("## Population");
  lines.push("");
  lines.push("| Cohort | Count |");
  lines.push("|--------|------:|");
  lines.push(`| All products in category | ${all.length} |`);
  lines.push(`| \`status === published\` | ${published.length} |`);
  lines.push(`| Publicly renderable (launch) | ${renderable.length} |`);
  lines.push(
    `| **Database-eligible** (catalog-listable: published + authentic media + \`isLaunchListable\`) | **${eligible.length}** |`,
  );
  lines.push(`| INDEXABLE (SEO) | ${indexable.length} |`);
  lines.push("");
  lines.push("### Publication status breakdown (all category products)");
  lines.push("");
  lines.push("| Status | Count |");
  lines.push("|--------|------:|");
  for (const [k, v] of Object.entries(statusBreakdown).sort()) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push("");
  lines.push("### Launch disposition breakdown (all category products)");
  lines.push("");
  lines.push("| Disposition | Count |");
  lines.push("|-------------|------:|");
  for (const [k, v] of Object.entries(dispositionBreakdown).sort()) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push("");
  lines.push("## Field coverage (database-eligible cohort)");
  lines.push("");
  lines.push(
    `Denominator **n = ${n}** (same gate as \`/running/shoes\` catalog listing).`,
  );
  lines.push("");
  lines.push(
    "| Field | Source | Present | Coverage | Public-ready | Notes |",
  );
  lines.push(
    "|-------|--------|--------:|---------:|:------------:|-------|",
  );
  for (const r of rows) {
    lines.push(
      `| ${r.field} | ${r.source} | ${r.present} | ${r.coverage} | ${r.publicReady} | ${r.notes} |`,
    );
  }
  lines.push("");
  lines.push("## Derived market signals (eligible only)");
  lines.push("");
  lines.push(`- Carbon-plated (\`plate === true\` && \`plateMaterial === "carbon"\`): **${carbonPlated}** (${pct(carbonPlated, n)})`);
  lines.push(
    `- With heel + forefoot stack + drop: **${count((p) => hasValue(p.specifications.heelStack) && hasValue(p.specifications.forefootStack) && hasValue(p.specifications.drop))}**`,
  );
  lines.push("");
  lines.push("## Public-ready field policy");
  lines.push("");
  lines.push("### Expose as primary filters / columns (high coverage + buyer-critical)");
  lines.push("");
  const primary = rows.filter((r) => r.publicReady === "yes");
  for (const r of primary) {
    lines.push(`- **${r.field}** — ${r.coverage} — ${r.notes}`);
  }
  lines.push("");
  lines.push("### Expose optionally (show when present; never invent)");
  lines.push("");
  for (const r of rows.filter((r) => r.publicReady === "partial")) {
    lines.push(`- **${r.field}** — ${r.coverage} — ${r.notes}`);
  }
  lines.push("");
  lines.push("### Do not expose as authoritative public facts yet");
  lines.push("");
  for (const r of rows.filter((r) => r.publicReady === "no")) {
    lines.push(`- **${r.field}** — ${r.coverage} — ${r.notes}`);
  }
  lines.push("");
  lines.push("## Architecture implications");
  lines.push("");
  lines.push("1. Build `RunningShoeDatabaseRecord` as a **derived view** over Product + Brand + Family + Variant + Offer + media — not a duplicate catalog.");
  lines.push("2. Eligibility = `canFeatureProduct` + `isLaunchListable(getLaunchEligibility(...))` (same as catalog).");
  lines.push("3. SEO indexation of individual product URLs remains gated by `isIndexableEligibility`; the database hub page is a separate static hub.");
  lines.push("4. Missing specs must render as empty / “—” — never inferred from peers or marketing copy.");
  lines.push("5. Compact client payload: only discovery fields (ids, slug, brand, image src, numeric/enum specs present, price, audiences, scores when present).");
  lines.push("");
  lines.push("## Missing-data findings");
  lines.push("");
  lines.push("- No canonical **launch / MSRP** price field exists.");
  lines.push(
    "- Spec coverage varies; geometry trio (weight / stack / drop) and plate fields are the strongest for a data explorer.",
  );
  lines.push(
    "- Reviews, comparisons, and alternatives are partial overlays — use as links/badges, not required columns.",
  );
  lines.push("");

  const outDir = join(process.cwd(), "docs/data-products");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "RUNNING-SHOE-DATABASE-DATA-AUDIT.md");
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(lines.join("\n"));
  console.log(`\nWrote ${outPath}`);
}

main();
