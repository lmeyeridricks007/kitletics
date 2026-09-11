/**
 * Fix 65 — audit thin Alternatives pages (fail canPublishAlternativesPage).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  getAllProductRelationships,
  getProducts,
  getCategoryById,
  getComparisons,
  getBestGuides,
} from "@/repositories";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { isAlternativeType } from "@/domain/relationships/types";
import { inferAlternativeRelationshipType } from "@/lib/product/alternative-decision-copy";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };

const GENDER_RE = /-(men|women)$/;

function siblingGenderSlug(slug: string): string | null {
  if (slug.endsWith("-men")) return slug.replace(/-men$/, "-women");
  if (slug.endsWith("-women")) return slug.replace(/-women$/, "-men");
  return null;
}

function main() {
  const rels = getAllProductRelationships();
  const products = getProducts(PROD);
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const byCat = new Map<string, typeof products>();
  for (const p of products) {
    const list = byCat.get(p.categoryId) ?? [];
    list.push(p);
    byCat.set(p.categoryId, list);
  }

  const comparisons = getComparisons(PROD);
  const bestGuides = getBestGuides(PROD);

  const comparisonsByProduct = new Map<string, string[]>();
  for (const c of comparisons) {
    for (const id of c.productIds) {
      const list = comparisonsByProduct.get(id) ?? [];
      list.push(c.slug);
      comparisonsByProduct.set(id, list);
    }
  }
  const bestByProduct = new Map<string, string[]>();
  for (const g of bestGuides) {
    const ids = [
      ...g.recommendations.map((r) => r.productId),
      ...(g.comparisonProductIds ?? []),
      ...(g.consideredProductIds ?? []),
    ];
    for (const id of ids) {
      const list = bestByProduct.get(id) ?? [];
      if (!list.includes(g.slug)) list.push(g.slug);
      bestByProduct.set(id, list);
    }
  }

  const rows: Record<string, unknown>[] = [];
  const failReasonCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  const classCounts: Record<string, number> = {};

  for (const product of products) {
    const alts = rels.filter(
      (r) =>
        r.sourceProductId === product.id &&
        r.status === "approved" &&
        isAlternativeType(r.type),
    );
    if (alts.length === 0) continue;
    const gate = canPublishAlternativesPage(product, rels);
    if (gate.ok) continue;

    for (const r of gate.reasons) {
      failReasonCounts[r] = (failReasonCounts[r] ?? 0) + 1;
    }
    const catName =
      getCategoryById(product.categoryId, PROD)?.name ?? product.categoryId;
    catCounts[catName] = (catCounts[catName] ?? 0) + 1;

    const catalogPeers = (byCat.get(product.categoryId) ?? []).filter(
      (p) => p.id !== product.id && p.status === "published",
    );
    const listed = (product.alternativeProductIds ?? [])
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    const listedPublishedSameCat = listed.filter(
      (p) => p.status === "published" && p.categoryId === product.categoryId,
    );
    const listedUnsynced = listedPublishedSameCat.filter(
      (p) => !alts.some((r) => r.targetProductId === p.id),
    );

    const types = [...new Set(alts.map((r) => r.type))];
    const inferredFromCatalog = catalogPeers
      .filter((p) => p.id !== product.id)
      .map((p) => ({
        slug: p.slug,
        type: inferAlternativeRelationshipType(product, p),
      }));
    const distinctInferredTypes = new Set(
      inferredFromCatalog.map((x) => x.type),
    );

    const genderSib = siblingGenderSlug(product.slug);
    const genderSibProduct = genderSib ? bySlug.get(genderSib) : undefined;
    const genderSibGate =
      genderSibProduct != null
        ? canPublishAlternativesPage(genderSibProduct, rels)
        : null;

    const familyCurrent =
      product.familyId != null
        ? catalogPeers.filter(
            (p) =>
              p.familyId === product.familyId &&
              p.lifecycleStatus === "current" &&
              p.id !== product.id,
          )
        : [];

    const isRunning = product.sportIds.includes("sport-running");

    let cls = "F";
    let clsLabel = "OTHER";
    const notes: string[] = [];

    if (
      product.lifecycleStatus === "previous-generation" ||
      product.lifecycleStatus === "discontinued"
    ) {
      if (familyCurrent.length > 0) {
        cls = "E";
        clsLabel = "OBSOLETE_PRODUCT";
        notes.push(
          `family current: ${familyCurrent.map((p) => p.slug).join(",")}`,
        );
      }
    }

    if (cls === "F" && genderSibProduct && GENDER_RE.test(product.slug)) {
      const thisIsWomen = product.slug.endsWith("-women");
      if (thisIsWomen && genderSibGate?.ok) {
        cls = "D";
        clsLabel = "DUPLICATE_INTENT";
        notes.push(`women SKU of READY men page ${genderSib}`);
      } else if (!thisIsWomen && genderSibGate?.ok && alts.length < 3) {
        cls = "D";
        clsLabel = "DUPLICATE_INTENT";
        notes.push(`men SKU duplicate of READY women page ${genderSib}`);
      }
    }

    const usablePeers = catalogPeers.filter((p) => {
      if (genderSib && p.slug === genderSib) return false;
      return true;
    });

    if (cls === "F") {
      const canType =
        distinctInferredTypes.size >= 2 || types.length >= 2;
      const enoughPeers = usablePeers.length >= 3;
      const alreadyAlmost =
        alts.length >= 3 &&
        (types.length < 2 ||
          gate.reasons.some((r) => r.includes("decision shape") || r.includes("unique reasons")));
      const listedCanFill =
        listedPublishedSameCat.length >= 3 &&
        (listedUnsynced.length > 0 || !isRunning);

      if (alreadyAlmost || listedCanFill || (enoughPeers && canType && usablePeers.length >= 3)) {
        cls = "A";
        clsLabel = "FIXABLE";
        if (listedUnsynced.length) notes.push(`listed unsynced ${listedUnsynced.length}`);
        if (!isRunning) notes.push("non-running (sync skip)");
        if (alreadyAlmost) notes.push("already ≥3 alts, type/copy fail");
      } else if (usablePeers.length < 3) {
        cls = "C";
        clsLabel = "NOT_ENOUGH_REAL_PEERS";
        notes.push(`catalog peers ${usablePeers.length}`);
      } else {
        cls = "B";
        clsLabel = "PRODUCT_TOO_NICHE";
        notes.push(
          `category has ${usablePeers.length} peers but listed=${listedPublishedSameCat.length} graph=${alts.length} inferredTypes=${distinctInferredTypes.size}`,
        );
      }
    }

    classCounts[clsLabel] = (classCounts[clsLabel] ?? 0) + 1;

    rows.push({
      slug: product.slug,
      name: product.fullName,
      categoryId: product.categoryId,
      category: catName,
      vertical: resolveEntityVerticalPolicy(product.sportIds).slug,
      sports: product.sportIds,
      status: product.status,
      lifecycle: product.lifecycleStatus,
      familyId: product.familyId ?? null,
      graphAltCount: alts.length,
      uniqueTypes: types.length,
      types,
      listedIds: product.alternativeProductIds ?? [],
      listedPublishedSameCat: listedPublishedSameCat.map((p) => p.slug),
      listedUnsynced: listedUnsynced.map((p) => p.slug),
      catalogPeerCount: catalogPeers.length,
      usablePeerCount: usablePeers.length,
      gateReasons: gate.reasons,
      isRunning,
      genderSib,
      genderSibGateOk: genderSibGate?.ok ?? null,
      comparisons: comparisonsByProduct.get(product.id) ?? [],
      bestGuides: bestByProduct.get(product.id) ?? [],
      graphAlts: alts.map((r) => ({
        target: byId.get(r.targetProductId)?.slug,
        type: r.type,
        reasonLens: r.reasons.map((x) => x.length),
        reasonsHead: r.reasons[0]?.slice(0, 80),
      })),
      cls,
      clsLabel,
      notes,
    });
  }

  const out = {
    thin: rows.length,
    failReasonCounts,
    catCounts,
    classCounts,
    rows: rows.sort((a, b) =>
      String(a.cls).localeCompare(String(b.cls)) ||
      String(a.category).localeCompare(String(b.category)) ||
      String(a.slug).localeCompare(String(b.slug)),
    ),
  };

  mkdirSync(join(process.cwd(), "docs/prelaunch/data"), { recursive: true });
  writeFileSync(
    join(process.cwd(), "docs/prelaunch/data/65-alt-thin-audit.json"),
    JSON.stringify(out, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        thin: out.thin,
        failReasonCounts,
        catCounts,
        classCounts,
        byClass: Object.fromEntries(
          Object.keys(classCounts).map((k) => [
            k,
            rows
              .filter((r) => r.clsLabel === k)
              .map((r) => ({
                slug: r.slug,
                cat: r.category,
                n: r.graphAltCount,
                types: r.uniqueTypes,
                peers: r.usablePeerCount,
                reasons: r.gateReasons,
                notes: r.notes,
              })),
          ]),
        ),
      },
      null,
      2,
    ),
  );
}

main();
