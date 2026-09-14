/**
 * Reconcile market inventory ↔ canonical soft-goods catalog,
 * write PADEL-PRODUCT-COUNT-RECONCILIATION.csv + PADEL-MEDIA-COVERAGE.csv,
 * stamp kitletics_product_id on inventory, regenerate stale padel scorecards.
 *
 * Usage: node --import tsx scripts/tmp/reconcile-padel-equipment-catalog.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts, padelAllOffers } from "@/content/padel";
import {
  hasRegisteredProductHero,
  hasVerifiedProductHero,
} from "@/content/running/products/media-publish-gate";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { evaluatePadelHeroIdentity } from "@/lib/product/media-identity";

const ROOT = process.cwd();
const INV_PATH = join(ROOT, "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv");
const RECON_PATH = join(
  ROOT,
  "docs/padel/data/PADEL-PRODUCT-COUNT-RECONCILIATION.csv",
);
const MEDIA_PATH = join(ROOT, "docs/padel/data/PADEL-MEDIA-COVERAGE.csv");
const BLOCKED_PATH = join(ROOT, "docs/padel/data/PADEL-MEDIA-BLOCKED.csv");
const EQUIP_SCORE = join(
  ROOT,
  "docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json",
);

const CAT_IDS: Record<string, string> = {
  balls: "cat-padel-balls",
  bags: "cat-padel-bags",
  grips: "cat-padel-grips",
  accessories: "cat-padel-accessories",
};
const CAT_BY_ID = Object.fromEntries(
  Object.entries(CAT_IDS).map(([k, v]) => [v, k]),
);

const EXCLUDE = new Set([
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

function parseCsv(text: string) {
  const lines = text.trimEnd().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return {
    headers,
    rows: lines.slice(1).map((line) => {
      const cols = splitCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] ?? "";
      });
      return row;
    }),
  };
}

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function brandKey(b: string) {
  return b.trim().toLowerCase();
}

function guessId(brand: string, model: string) {
  return `prod-${brandKey(brand).replace(/\s+/g, "-")}-${model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

const soft = padelAllProducts.filter((p) =>
  Object.values(CAT_IDS).includes(p.categoryId),
);
const softById = new Map(soft.map((p) => [p.id, p]));
const offerSet = new Set(padelAllOffers.map((o) => o.productId));

function matchProduct(r: Record<string, string>) {
  const pid = r.kitletics_product_id;
  if (pid && softById.has(pid)) return softById.get(pid)!;
  const guess = guessId(r.brand, r.model);
  if (softById.has(guess)) return softById.get(guess)!;
  return soft.find(
    (p) =>
      p.categoryId === CAT_IDS[r.category] &&
      (p.fullName.toLowerCase() === r.product.toLowerCase() ||
        p.name.toLowerCase() === r.model.toLowerCase()),
  );
}

const { headers, rows: inv } = parseCsv(readFileSync(INV_PATH, "utf8"));

const discovered = inv.filter((r) => {
  if (!["CURRENT", "CURRENT_LIMITED"].includes(r.current_status)) return false;
  if (/range$/i.test(r.product) || /range$/i.test(r.model)) return false;
  if (r.brand === "Generic" || r.brand === "various" || r.brand.includes("/"))
    return false;
  if (EXCLUDE.has(r.disposition)) return false;
  return r.research_status === "verified" || r.research_status === "likely";
});

/** Stamp kitletics_product_id for 1:1 auditability */
let stamped = 0;
for (const r of inv) {
  const m = matchProduct(r);
  if (m && r.kitletics_product_id !== m.id) {
    r.kitletics_product_id = m.id;
    r.existing_in_kitletics = "yes";
    stamped++;
  }
}
if (!headers.includes("kitletics_product_id")) headers.push("kitletics_product_id");
writeFileSync(
  INV_PATH,
  [
    headers.join(","),
    ...inv.map((r) => headers.map((h) => csvEscape(r[h] ?? "")).join(",")),
  ].join("\n") + "\n",
);

type CatKey = keyof typeof CAT_IDS;
const cats = Object.keys(CAT_IDS) as CatKey[];

type Recon = {
  category: string;
  market_discovered: number;
  inventory_rows_to_unique_products: number;
  multi_row_collapses: number;
  canonical_products: number;
  lifecycle_current: number;
  lifecycle_other: number;
  product_families: number;
  variants_as_products: number;
  pack_color_modeled_as_offers: string;
  publication_ready: number;
  public_featured: number;
  draft_media_pending: number;
  difference_explained: string;
};

const reconRows: Recon[] = [];
const collapseNotes: string[] = [];

for (const cat of cats) {
  const disc = discovered.filter((r) => r.category === cat);
  const products = soft.filter((p) => p.categoryId === CAT_IDS[cat]);
  const matched = new Map<string, string[]>();
  for (const r of disc) {
    const m = matchProduct(r);
    if (!m) continue;
    const list = matched.get(m.id) ?? [];
    list.push(r.product);
    matched.set(m.id, list);
  }
  const multi = [...matched.entries()].filter(([, names]) => names.length > 1);
  for (const [id, names] of multi) {
    collapseNotes.push(`${cat}|${id}|${names.length}|${names.join(" / ")}`);
  }

  const current = products.filter((p) => p.lifecycleStatus === "current");
  const other = products.filter((p) => p.lifecycleStatus !== "current");
  const ready = products.filter(
    (p) => p.status === "published" && hasVerifiedProductHero(p),
  );
  const draft = products.filter((p) => p.status === "draft");

  // Soft goods: 1 Product = 1 commercial identity; no ProductFamily entities yet
  const families = products.length; // 1:1 until familyId populated
  const variantProducts = 0; // packs/colors not separate Products

  const delta = disc.length - products.length;
  let explanation = "";
  if (delta > 0) {
    explanation = `${delta} market rows collapse onto fewer canonical Products (same architecture / alternate titles). Multi-row collapses: ${multi.length}.`;
  } else if (delta < 0) {
    explanation = `${-delta} canonical Products are seed/orphan/previous naming not counted in CURRENT discovered market rows (still in registry).`;
  } else {
    explanation = "Market discovered row count equals canonical Product count.";
  }
  if (multi.length) {
    explanation += ` Pack/color collapses already applied at inventory disposition (DUPLICATE/NOT_A_DISTINCT_PRODUCT excluded from market count).`;
  }

  reconRows.push({
    category: cat,
    market_discovered: disc.length,
    inventory_rows_to_unique_products: matched.size,
    multi_row_collapses: multi.length,
    canonical_products: products.length,
    lifecycle_current: current.length,
    lifecycle_other: other.length,
    product_families: families,
    variants_as_products: variantProducts,
    pack_color_modeled_as_offers:
      "packs/colorways are offers or collapsed inventory rows — not separate Products",
    publication_ready: ready.length,
    public_featured: ready.length,
    draft_media_pending: draft.length,
    difference_explained: explanation,
  });
}

const reconHeader = [
  "category",
  "market_discovered",
  "unique_matched_products",
  "multi_row_collapses",
  "canonical_products",
  "lifecycle_current",
  "lifecycle_other",
  "product_families",
  "variants_as_separate_products",
  "pack_color_modeling",
  "publication_ready",
  "public_featured",
  "draft_media_pending",
  "difference_explained",
];

writeFileSync(
  RECON_PATH,
  [
    reconHeader.join(","),
    ...reconRows.map((r) =>
      [
        r.category,
        r.market_discovered,
        r.inventory_rows_to_unique_products,
        r.multi_row_collapses,
        r.canonical_products,
        r.lifecycle_current,
        r.lifecycle_other,
        r.product_families,
        r.variants_as_products,
        r.pack_color_modeled_as_offers,
        r.publication_ready,
        r.public_featured,
        r.draft_media_pending,
        r.difference_explained,
      ]
        .map((x) => csvEscape(String(x)))
        .join(","),
    ),
    "",
    "# collapse_detail: category|productId|row_count|inventory_titles",
    ...collapseNotes.map((n) => `# ${n}`),
  ].join("\n") + "\n",
);

/** Media coverage for every canonical soft product */
type MediaStatus =
  | "MEDIA_VERIFIED"
  | "MEDIA_CANDIDATE"
  | "MEDIA_MISSING"
  | "MEDIA_AMBIGUOUS"
  | "MEDIA_BLOCKED";

const mediaHeader = [
  "productId",
  "category",
  "brandId",
  "brand",
  "model",
  "generation",
  "variant",
  "identityKey",
  "lifecycleStatus",
  "publicationStatus",
  "currentHero",
  "currentHeroSource",
  "status",
  "candidateSource",
  "candidateImage",
  "identityConfidence",
  "semanticChecks",
  "hasOffer",
  "notes",
];

const invByProduct = new Map<string, Record<string, string>>();
for (const r of inv) {
  const m = matchProduct(r);
  if (m && !invByProduct.has(m.id)) invByProduct.set(m.id, r);
}

const mediaRows: string[] = [];
const blockedRows: string[] = [];

/** Overlay reject / missing notes from media triage so admin queue is honest. */
type TriageDecision = {
  productId: string;
  decision: string;
  reason?: string;
  candidateImage?: string;
  priorScore?: number;
};
const triageById = new Map<string, TriageDecision>();
try {
  const triagePath = join(ROOT, "data/staging/padel-soft-media-triage.json");
  const triage = JSON.parse(readFileSync(triagePath, "utf8")) as {
    decisions?: TriageDecision[];
  };
  for (const d of triage.decisions ?? []) {
    triageById.set(d.productId, d);
  }
} catch {
  /* optional */
}

let revokedWrong = new Set<string>();
try {
  const rev = JSON.parse(
    readFileSync(join(ROOT, "data/staging/padel-soft-media-revoked.json"), "utf8"),
  ) as { revokedWrongProduct?: string[] };
  revokedWrong = new Set(rev.revokedWrongProduct ?? []);
} catch {
  /* optional */
}

for (const p of soft) {
  const cat = CAT_BY_ID[p.categoryId] ?? "unknown";
  const brand = p.brandId.replace(/^brand-/, "").replace(/-padel$/, "");
  const invRow = invByProduct.get(p.id);
  const generation = invRow?.generation || p.lifecycleStatus || "";
  const variant = invRow?.variant || "";
  const identityKey = [
    "padel",
    cat,
    brand,
    p.name,
    generation,
    variant,
  ]
    .map((s) =>
      String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean)
    .join("|");

  const registered = getCatalogProductHeroMedia(p.id, p.fullName);
  const secondary = PADEL_SECONDARY_PRODUCT_MEDIA[p.id];
  const primary = getPrimaryProductMedia(p);
  const hasHero = hasRegisteredProductHero(p.id);
  const verified = hasVerifiedProductHero(p);
  const identity = evaluatePadelHeroIdentity(p, registered?.[0] ?? secondary ?? primary, {
    brandSlug: p.brandId.replace(/^brand-/, ""),
  });
  const heroSrc = registered?.[0]?.src || secondary?.src || primary?.src || "";
  const heroSource =
    registered?.[0]?.source ||
    secondary?.sourceName ||
    primary?.source ||
    "";

  let status: MediaStatus = "MEDIA_MISSING";
  let notes = "";
  let identityConfidence = "";
  let semanticChecks = "";
  const candidateSource = "";
  let candidateImage = "";

  if (verified && heroSrc && !heroSrc.includes("fallbacks") && !heroSrc.endsWith(".svg")) {
    status = "MEDIA_VERIFIED";
    identityConfidence = "95";
    semanticChecks = `exact_product_identity;${identity.reasons.join(";") || "ok"}`;
    notes = "Hero registered AND passed exact-product MEDIA_VERIFIED identity.";
  } else if (hasHero && heroSrc && !heroSrc.includes("fallbacks") && !heroSrc.endsWith(".svg")) {
    status = "MEDIA_MISSING";
    identityConfidence = "20";
    semanticChecks = identity.reasons.join(";") || "identity_failed";
    notes = `Registered hero failed exact-product identity (${identity.reasons.join("|")}). Demoted from MEDIA_VERIFIED; product stays draft until exact packshot is registered.`;
  } else if (p.lifecycleStatus === "discontinued" || p.lifecycleStatus === "previous_generation") {
    status = "MEDIA_BLOCKED";
    notes = `Lifecycle ${p.lifecycleStatus} — media acquisition deferred; not CURRENT market target.`;
    identityConfidence = "0";
  } else {
    status = "MEDIA_MISSING";
    identityConfidence = "0";
    const t = triageById.get(p.id);
    if (revokedWrong.has(p.id)) {
      notes =
        "REJECTED_WRONG_PRODUCT — triage download failed visual identity check; hero revoked. Needs manufacturer PDP packshot.";
    } else if (t?.decision === "REJECT") {
      notes = `REJECTED — ${t.reason || "unsafe_candidate"}. No authentic registered hero; stays draft via media publish gate.`;
      if (t.candidateImage) {
        candidateImage = t.candidateImage;
        identityConfidence = String(t.priorScore ?? 0);
      }
    } else if (t?.decision === "MISSING" || t?.decision === "APPROVED") {
      // Approved but later revoked lands above; remaining missing
      notes = `Researched: ${t.reason || "no_safe_distinct_image"}. No authentic registered hero. Product remains draft via media publish gate.`;
      if (t.candidateImage) {
        candidateImage = t.candidateImage;
        identityConfidence = String(t.priorScore ?? 0);
      }
    } else {
      notes =
        "No authentic registered hero. Product remains draft via media publish gate.";
    }
    if (invRow?.manufacturer_url || invRow?.retailer_urls) {
      notes += ` Research hints: ${[invRow.manufacturer_url, invRow.retailer_urls]
        .filter(Boolean)
        .join(" | ")}`;
    }
  }

  const row = [
    p.id,
    cat,
    p.brandId,
    brand,
    p.name,
    generation,
    variant,
    identityKey,
    p.lifecycleStatus,
    p.status,
    heroSrc,
    heroSource,
    status,
    candidateSource,
    candidateImage,
    identityConfidence,
    semanticChecks,
    offerSet.has(p.id) ? "yes" : "no",
    notes,
  ]
    .map((x) => csvEscape(String(x)))
    .join(",");
  mediaRows.push(row);
  if (status === "MEDIA_BLOCKED") blockedRows.push(row);
}

writeFileSync(MEDIA_PATH, [mediaHeader.join(","), ...mediaRows].join("\n") + "\n");
writeFileSync(
  BLOCKED_PATH,
  [mediaHeader.join(","), ...blockedRows].join("\n") + "\n",
);

/** Refresh stale PADEL-CATALOG-SCORECARD soft-goods totals from live catalog */
function patchScorecard(path: string) {
  try {
    const sc = JSON.parse(readFileSync(path, "utf8"));
    const now = new Date().toISOString().slice(0, 10);
    sc.asOf = now;
    sc.softGoodsSourceOfTruth =
      "docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json";
    sc.note =
      "Soft-goods totals regenerated from padelAllProducts after market-wave materialization. Do not use pre-wave 11/13/10/9 figures.";
    for (const cat of cats) {
      const products = soft.filter((p) => p.categoryId === CAT_IDS[cat]);
      const ready = products.filter(
        (p) => p.status === "published" && hasVerifiedProductHero(p),
      );
      const withHero = products.filter((p) => hasVerifiedProductHero(p));
      const blocked = products.length - ready.length;
      if (!sc.categories) sc.categories = {};
      sc.categories[cat] = {
        ...(sc.categories[cat] ?? {}),
        categoryId: CAT_IDS[cat],
        total: products.length,
        ready_published: ready.length,
        indexable: ready.length,
        blocked_or_hidden: blocked,
        with_hero: withHero.length,
        with_source: products.length,
        media_pending: products.length - withHero.length,
        draft: products.filter((p) => p.status === "draft").length,
      };
    }
    writeFileSync(path, JSON.stringify(sc, null, 2) + "\n");
    return true;
  } catch {
    return false;
  }
}

patchScorecard(join(ROOT, "docs/padel/data/PADEL-CATALOG-SCORECARD.json"));
patchScorecard(join(ROOT, "docs/padel/data/PADEL-FINAL-CATALOG-SCORECARD.json"));

const byStatus = mediaRows.reduce(
  (a, line) => {
    const status = splitCsvLine(line)[12];
    a[status] = (a[status] || 0) + 1;
    return a;
  },
  {} as Record<string, number>,
);

console.log(
  JSON.stringify(
    {
      stampedInventoryIds: stamped,
      recon: reconRows.map((r) => ({
        category: r.category,
        market: r.market_discovered,
        canonical: r.canonical_products,
        ready: r.publication_ready,
        draft: r.draft_media_pending,
      })),
      mediaByStatus: byStatus,
      equipScorecard: EQUIP_SCORE,
    },
    null,
    2,
  ),
);
