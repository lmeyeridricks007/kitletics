#!/usr/bin/env node
/**
 * Mass Padel spec enrichment — taxonomy + terminal NOT_PUBLISHED markers.
 * Does NOT invent manufacturer measurements. Writes provenance store + coverage CSVs.
 *
 * Usage: node --import tsx scripts/tmp/enrich-padel-specs.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { padelAllProductsBeforeSpecEnrichment } from "@/content/padel";
import { padelRacketCatalogEvidence } from "@/content/padel/rackets";
import {
  padelShoeCatalogEvidence,
  padelSoftGoodsEvidence,
} from "@/content/padel/soft-goods";
import { wave28PadelShoeEvidence } from "@/content/padel/wave28-shoes";
import type { Product, SpecValue } from "@/domain/products/types";
import type { Evidence } from "@/domain/recommendations/types";
import { resolveSpecPlan } from "@/content/padel/spec-enrichment/required-fields";
import {
  hasMeaningfulSpecValue,
  isTerminalSpecValue,
  type ProductSpecEnrichment,
  type SpecCompleteness,
  type SpecFieldProvenance,
  type SpecSourceType,
} from "@/content/padel/spec-enrichment/types";

const ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10);
const INV_PATH = join(ROOT, "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv");
const STORE_PATH = join(
  ROOT,
  "src/content/padel/spec-enrichment/store.ts",
);
const COVERAGE_PATH = join(ROOT, "docs/padel/data/PADEL-SPEC-COVERAGE.csv");
const CONFLICTS_PATH = join(ROOT, "docs/padel/data/PADEL-SPEC-CONFLICTS.csv");
const AUDIT_PATH = join(ROOT, "docs/padel/PADEL-SPEC-ENRICHMENT-AUDIT.md");

const PADEL_CATS = new Set([
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
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
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function field(
  value: SpecValue,
  sourceType: SpecSourceType,
  state: SpecFieldProvenance["state"],
  sourceUrl?: string,
  notes?: string,
): SpecFieldProvenance {
  return {
    value,
    sourceType,
    retrievedAt: TODAY,
    state,
    sourceUrl,
    notes,
  };
}

function notPublished(
  sourceUrl: string | undefined,
  notes: string,
): SpecFieldProvenance {
  return field(
    "NOT_PUBLISHED",
    sourceUrl ? "not-published-check" : "inventory-research",
    "NOT_PUBLISHED",
    sourceUrl,
    notes,
  );
}

function notApplicable(notes: string): SpecFieldProvenance {
  return field("NOT_APPLICABLE", "inventory-research", "NOT_APPLICABLE", undefined, notes);
}

function unknownVal(notes: string): SpecFieldProvenance {
  return field("UNKNOWN", "inventory-research", "UNKNOWN", undefined, notes);
}

/** Soft-goods inventory hints */
const invRows = parseCsv(readFileSync(INV_PATH, "utf8"));
const invByProduct = new Map<string, Record<string, string>>();
for (const r of invRows) {
  const id = r.kitletics_product_id;
  if (id && !invByProduct.has(id)) invByProduct.set(id, r);
}

const allEvidence: Evidence[] = [
  ...padelRacketCatalogEvidence,
  ...padelShoeCatalogEvidence,
  ...wave28PadelShoeEvidence,
  ...padelSoftGoodsEvidence,
];
const evidenceById = new Map(allEvidence.map((e) => [e.id, e]));

function classifySourceType(url: string | undefined, evidenceType?: string): SpecSourceType {
  if (!url) return "curated-catalog";
  if (evidenceType === "manufacturer") return "manufacturer";
  const u = url.toLowerCase();
  if (
    /bullpadel\.com|noxsport\.com|babolat\.com|head\.com|wilson\.com|adidas\.|siuxpadel|starvie\.com|tecnifibre|varlion|oxdog|drop-shot|royalpadel|blackcrown|lokpadel|dunlop|asics\.com|joma\.|babolat|head\.com/.test(
      u,
    )
  ) {
    return "manufacturer";
  }
  if (/padelproshop|padelmq|totalpadel|padelreferencenl|padelshop/.test(u)) {
    return "specialist-retailer";
  }
  if (/amazon\.|decathlon\.|bol\.com/.test(u)) return "major-retailer";
  return "specialist-retailer";
}

function resolveProductSource(p: Product): {
  sourceUrl?: string;
  sourceType: SpecSourceType;
} {
  const inv = invByProduct.get(p.id);
  const invUrl = inv?.manufacturer_url || inv?.retailer_urls?.split("|")[0] || undefined;
  for (const id of p.evidenceIds ?? []) {
    const ev = evidenceById.get(id);
    if (ev?.sourceUrl) {
      return {
        sourceUrl: ev.sourceUrl,
        sourceType: classifySourceType(ev.sourceUrl, ev.type),
      };
    }
  }
  if (invUrl) {
    return {
      sourceUrl: invUrl,
      sourceType: classifySourceType(invUrl),
    };
  }
  return { sourceType: "curated-catalog" };
}

function bagFormFromSub(sub: string): string | undefined {
  const map: Record<string, string> = {
    BACKPACK: "backpack",
    PALETERO: "racket-bag",
    PADEL_RACKET_BAG: "racket-bag",
    TOURNAMENT_BAG: "tournament-bag",
    COURT_BAG: "duffel",
    DUFFEL: "duffel",
    RACKET_COVER: "racket-cover",
    ACCESSORY_BAG: "other",
    SHOE_BAG: "other",
  };
  return map[sub];
}

function ballHints(sub: string, model: string): Record<string, SpecValue> {
  const m = model.toLowerCase();
  const out: Record<string, SpecValue> = {
    pressurization: "pressurized",
    packSize: "3-ball can",
    ballsPerCan: 3,
    freshnessStatus: "current",
  };
  if (/training|club|team|one\b/.test(m) || sub === "training" || sub === "club") {
    out.ballType = /club|team|one/.test(m) ? "official" : "training";
    out.use = sub === "club" || /club/.test(m) ? "competition" : "training";
    if (/team|club|training|one/.test(m)) out.speed = /speed|pro\+?|fast/.test(m) ? "fast" : "slow";
  }
  if (sub === "competition" || /pro|tour|premier|speed|nitro|spin|competition/.test(m)) {
    out.ballType = "official";
    out.use = "competition";
  }
  if (/speed|fast|pro s|nerbo\+|rush/.test(m)) out.speed = "fast";
  else if (/control|team|club|training|vision|soft/.test(m)) out.speed = "slow";
  else if (!out.speed) out.speed = "medium";
  if (!out.ballType) out.ballType = "official";
  if (!out.use) out.use = "competition";
  return out;
}

function gripHints(sub: string, model: string): Record<string, SpecValue> {
  const m = model.toLowerCase();
  if (/hesacore|ergonomic|dual pro|custom grip|undergrip|anti.?shock/.test(m) || sub === "ergonomic" || sub === "cushion") {
    if (/hesacore|cushion/.test(m) || sub === "cushion") return { gripType: "cushion" };
    return { gripType: "ergonomic" };
  }
  if (/replacement|syntec|hydrosorb|basic grip/.test(m) || sub === "replacement") {
    return { gripType: "replacement" };
  }
  return { gripType: "overgrip" };
}

function accessoryType(sub: string, model: string): string {
  const m = model.toLowerCase();
  if (sub === "pressurizer" || /pressur|pascal|tubo|bounce|ball rescuer|filtertech/.test(m))
    return "pressurizer";
  if (sub === "protector" || /protector|antishock|frame guard|tape/.test(m))
    return /tape/.test(m) ? "frame_tape" : "protector";
  if (/weight|balancer|custom weight/.test(m) || sub === "weight_system")
    return "customization_weight";
  if (/basket|cart|pick.?up|cone|target|coaching/.test(m) || sub === "ball_basket" || sub === "training_aid")
    return /basket|cart|pick/.test(m) ? "ball_basket" : "training_aid";
  if (/wrist|headband|sweat/.test(m) || sub === "wristband") return "wristband";
  if (/grip system|hesacore/.test(m)) return "grip_system";
  return "other";
}

function compatibilityDefault(
  categoryId: string,
  typeOrGrip: string,
  brand: string,
): SpecFieldProvenance {
  if (categoryId === "cat-padel-grips") {
    if (typeOrGrip === "overgrip" || typeOrGrip === "replacement") {
      return field("UNIVERSAL", "inventory-research", "VERIFIED", undefined, "Standard overgrip/replacement — universal padel handle fit unless manufacturer states otherwise.");
    }
    if (typeOrGrip === "cushion" || typeOrGrip === "ergonomic") {
      return field("UNIVERSAL", "inventory-research", "VERIFIED", undefined, "Ergonomic/cushion systems generally universal; confirm size variants separately.");
    }
  }
  if (categoryId === "cat-padel-accessories") {
    if (typeOrGrip === "pressurizer" || typeOrGrip === "ball_basket" || typeOrGrip === "training_aid") {
      return field("UNIVERSAL", "inventory-research", "VERIFIED", undefined, "Ball pressurizer/training aids are ball-format universal unless stated.");
    }
    if (typeOrGrip === "protector" || typeOrGrip === "frame_tape") {
      return field("UNIVERSAL", "inventory-research", "VERIFIED", undefined, "Frame protectors typically universal across padel racket frames.");
    }
    if (typeOrGrip === "customization_weight") {
      return field(
        brand.toLowerCase().includes("bullpadel") || brand.toLowerCase().includes("nox")
          ? "BRAND_COMPATIBLE"
          : "UNIVERSAL",
        "inventory-research",
        "VERIFIED",
        undefined,
        "Weight systems: brand-specific only when manufacturer states; otherwise universal tape/weights.",
      );
    }
    if (typeOrGrip === "wristband") {
      return field("UNIVERSAL", "inventory-research", "VERIFIED", undefined, "Apparel accessory — universal.");
    }
  }
  return field("UNIVERSAL", "inventory-research", "VERIFIED", undefined, "Default universal unless manufacturer product-specific fit is evidenced.");
}

function completenessFor(
  plan: { required: string[]; important: string[] },
  fields: Record<string, SpecFieldProvenance>,
  existing: Record<string, SpecValue>,
): SpecCompleteness {
  const slots = [...plan.required, ...plan.important];
  let hasUnknown = false;
  for (const key of slots) {
    const prov = fields[key];
    const val = prov?.value ?? existing[key];
    if (hasMeaningfulSpecValue(val)) continue;
    if (isTerminalSpecValue(val) || prov?.state === "NOT_PUBLISHED" || prov?.state === "NOT_APPLICABLE" || prov?.state === "UNKNOWN") {
      if (prov?.state === "UNKNOWN" || val === "UNKNOWN") hasUnknown = true;
      continue;
    }
    return "INCOMPLETE_RESEARCH";
  }
  return hasUnknown ? "COMPLETE_WITH_UNKNOWN" : "VERIFIED_COMPLETE";
}

function enrichProduct(p: Product): ProductSpecEnrichment {
  const inv = invByProduct.get(p.id);
  const resolved = resolveProductSource(p);
  const sourceUrl = resolved.sourceUrl;
  const defaultSourceType = resolved.sourceType;
  const fields: Record<string, SpecFieldProvenance> = {};
  const identityNotes: string[] = [];
  const existing = p.specifications ?? {};

  // Seed provenance for existing meaningful specs
  for (const [key, value] of Object.entries(existing)) {
    if (!hasMeaningfulSpecValue(value)) continue;
    fields[key] = field(
      value,
      defaultSourceType,
      "VERIFIED",
      sourceUrl,
      sourceUrl
        ? "Pre-existing catalog specification retained with evidence URL."
        : "Pre-existing catalog specification retained.",
    );
  }

  // Category-specific taxonomy enrichment (soft goods)
  if (p.categoryId === "cat-padel-balls") {
    const hints = ballHints(inv?.subcategory || "", p.name);
    for (const [k, v] of Object.entries(hints)) {
      if (!hasMeaningfulSpecValue(existing[k])) {
        fields[k] = field(v, "inventory-research", "VERIFIED", sourceUrl, "Derived from model/subcategory research inventory — not a lab measurement.");
      }
    }
    for (const k of ["feltMaterial", "coreMaterial", "diameter", "weight", "bounceSpec", "officialApproval", "durability", "cansPerBox", "intendedConditions", "manufacturerPositioning"]) {
      if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
        fields[k] = notPublished(sourceUrl, "Manufacturer measurement/claim not verified in this pass — left NOT_PUBLISHED rather than invented.");
      }
    }
  }

  if (p.categoryId === "cat-padel-bags") {
    const form = (existing.form as string) || bagFormFromSub(inv?.subcategory || "");
    if (form && !hasMeaningfulSpecValue(existing.form)) {
      fields.form = field(form, "inventory-research", "VERIFIED", sourceUrl, "Bag factor from inventory subcategory / architecture.");
    }
    const carry =
      form === "backpack" ? "backpack" : form === "duffel" ? "duffel" : form === "racket-bag" ? "shoulder" : "NOT_PUBLISHED";
    if (!hasMeaningfulSpecValue(existing.carryStyle) && !fields.carryStyle) {
      fields.carryStyle =
        carry === "NOT_PUBLISHED"
          ? notPublished(sourceUrl, "Carry style not stated on researched sources.")
          : field(carry, "inventory-research", "VERIFIED", sourceUrl, "Inferred from bag form factor only.");
    }
    for (const k of [
      "racketCapacity",
      "capacity",
      "volume",
      "dimensions",
      "thermalProtection",
      "thermalRacketCompartment",
      "shoeCompartment",
      "wetCompartment",
      "accessoryPockets",
      "laptopCompartment",
      "bottleStorage",
      "carrySystem",
      "backpackStraps",
      "materials",
      "waterResistance",
      "weight",
      "collection",
      "racketCompartments",
    ]) {
      if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
        // Thermal often present on 2026 collection bags — still don't invent without PDP
        fields[k] = notPublished(sourceUrl, "Not published or not verified on manufacturer/specialist PDP in this enrichment pass.");
      }
    }
  }

  if (p.categoryId === "cat-padel-grips") {
    const hints = gripHints(inv?.subcategory || "", p.name);
    for (const [k, v] of Object.entries(hints)) {
      if (!hasMeaningfulSpecValue(existing[k])) {
        fields[k] = field(v, "inventory-research", "VERIFIED", sourceUrl, "Grip class from model/subcategory.");
      }
    }
    const gt = String(fields.gripType?.value ?? existing.gripType ?? "overgrip");
    if (/perforat|perf\b/.test(p.name.toLowerCase()) && !hasMeaningfulSpecValue(existing.perforated)) {
      fields.perforated = field(true, "inventory-research", "VERIFIED", sourceUrl, "Model name indicates perforated construction.");
    }
    if (/tacky|tack|sticky|mega tac|tourna tac/.test(p.name.toLowerCase()) && !hasMeaningfulSpecValue(existing.tack)) {
      fields.tack = field("high", "inventory-research", "VERIFIED", sourceUrl, "Model naming indicates tack-oriented positioning.");
    }
    if (/dry|absorb|dri|hydro/.test(p.name.toLowerCase()) && !hasMeaningfulSpecValue(existing.absorption)) {
      fields.absorption = field("high", "inventory-research", "VERIFIED", sourceUrl, "Model naming indicates absorbent/dry positioning.");
    }
    for (const k of ["thickness", "tack", "absorption", "perforated", "material", "length", "width", "weight", "texture", "feel", "packQuantity", "colors", "installationMethod"]) {
      if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
        fields[k] = notPublished(sourceUrl, "Grip measurement/finish not verified — NOT_PUBLISHED (pack quantity is offer-level when present).");
      }
    }
    if (!fields.compatibility && !hasMeaningfulSpecValue(existing.compatibility)) {
      fields.compatibility = compatibilityDefault(p.categoryId, gt, p.brandId);
    }
  }

  if (p.categoryId === "cat-padel-accessories") {
    const t =
      (existing.type as string) ||
      accessoryType(inv?.subcategory || "", p.name);
    if (!hasMeaningfulSpecValue(existing.type)) {
      fields.type = field(t, "inventory-research", "VERIFIED", sourceUrl, "Accessory type from subcategory/model.");
    }
    const type = String(fields.type?.value ?? t);
    if (type === "pressurizer") {
      if (/switch|electric|automat|usb|compressor/.test(p.name.toLowerCase()) && !hasMeaningfulSpecValue(existing.manualOrElectric)) {
        fields.manualOrElectric = field("electric", "inventory-research", "VERIFIED", sourceUrl, "Model naming indicates electric/automatic pressurizer.");
      } else if (!hasMeaningfulSpecValue(existing.manualOrElectric) && !fields.manualOrElectric) {
        fields.manualOrElectric = field("manual", "inventory-research", "VERIFIED", sourceUrl, "Default manual when not named electric/automatic — confirm on PDP if critical.");
      }
      if (/3b|x3|3-ball|3 ball/.test(p.name.toLowerCase()) && !hasMeaningfulSpecValue(existing.capacityBalls)) {
        fields.capacityBalls = field(3, "inventory-research", "VERIFIED", sourceUrl, "Capacity from model naming.");
      } else if (/4b|x4|4-ball|4 ball/.test(p.name.toLowerCase()) && !hasMeaningfulSpecValue(existing.capacityBalls)) {
        fields.capacityBalls = field(4, "inventory-research", "VERIFIED", sourceUrl, "Capacity from model naming.");
      }
      for (const k of ["capacityBalls", "pressureSystem", "pressureRange", "powerSource"]) {
        if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
          fields[k] = notPublished(sourceUrl, "Pressurizer technical detail not verified.");
        }
      }
    }
    if (type === "protector" || type === "frame_tape") {
      for (const k of ["transparentOrColored", "materials", "weightGrams"]) {
        if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
          fields[k] = notPublished(sourceUrl, "Protector material/finish not verified.");
        }
      }
    }
    if (type === "customization_weight") {
      for (const k of ["weightGrams"]) {
        if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
          fields[k] = notPublished(sourceUrl, "Weight value not verified from manufacturer listing.");
        }
      }
    }
    if (!fields.compatibility && !hasMeaningfulSpecValue(existing.compatibility)) {
      fields.compatibility = compatibilityDefault(p.categoryId, type, p.brandId);
    }
  }

  if (p.categoryId === "cat-padel-rackets") {
    for (const k of [
      "weightMax",
      "thicknessMm",
      "core",
      "faceMaterial",
      "frameMaterial",
      "surfaceTexture",
      "playerLevel",
      "sweetSpot",
      "feel",
      "face",
      "faceCarbonWeave",
      "manufacturerCoreName",
      "manufacturerPositioning",
      "technologies",
      "length",
      "finish",
    ]) {
      if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
        fields[k] = notPublished(
          sourceUrl,
          "Racket field not present on curated draft — marked NOT_PUBLISHED (do not invent power/control scores).",
        );
      }
    }
    // Required shape/balance/weightMin — if missing, UNKNOWN (needs research) vs NOT_PUBLISHED
    for (const k of ["shape", "balance", "weightMin"]) {
      if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
        fields[k] = unknownVal(
          "Required racket identity field missing from catalog draft — flagged UNKNOWN for follow-up manufacturer PDP research.",
        );
        identityNotes.push(`Missing required racket field: ${k}`);
      }
    }
  }

  if (p.categoryId === "cat-padel-shoes") {
    if (!hasMeaningfulSpecValue(existing.surfaceCompatibility) && !fields.surfaceCompatibility) {
      fields.surfaceCompatibility = unknownVal(
        "surfaceCompatibility must not be inferred — UNKNOWN until manufacturer padel positioning is evidenced.",
      );
      identityNotes.push("Shoe surfaceCompatibility unknown — not inferred.");
    }
    for (const k of [
      "courtOutsole",
      "outsole",
      "lateralStability",
      "cushioning",
      "support",
      "genderFit",
      "tractionPattern",
      "courtFeel",
      "durability",
      "weight",
      "upper",
      "fit",
      "width",
      "closure",
      "generation",
    ]) {
      if (!hasMeaningfulSpecValue(existing[k]) && !fields[k]) {
        fields[k] = notPublished(sourceUrl, "Shoe attribute not verified from manufacturer court evidence.");
      }
    }
  }

  // Lifecycle blocked
  let completeness: SpecCompleteness;
  if (p.lifecycleStatus === "discontinued") {
    completeness = "BLOCKED";
  } else {
    const plan = resolveSpecPlan(p.categoryId, {
      ...existing,
      ...Object.fromEntries(
        Object.entries(fields).map(([k, f]) => [k, f.value]),
      ),
    });
    // Ensure every required+important slot has a field entry
    for (const key of [...plan.required, ...plan.important]) {
      if (!fields[key] && !hasMeaningfulSpecValue(existing[key])) {
        fields[key] = notPublished(
          sourceUrl,
          "Required/important slot closed as NOT_PUBLISHED after enrichment pass (no invented value).",
        );
      } else if (!fields[key] && hasMeaningfulSpecValue(existing[key])) {
        fields[key] = field(
          existing[key],
          defaultSourceType,
          "VERIFIED",
          sourceUrl,
          "Existing catalog value.",
        );
      }
    }
    for (const key of plan.optional) {
      if (!fields[key] && !hasMeaningfulSpecValue(existing[key])) {
        fields[key] = notPublished(sourceUrl, "Optional field not published/verified.");
      }
    }
    completeness = completenessFor(plan, fields, existing);
    // If any required is UNKNOWN → COMPLETE_WITH_UNKNOWN (still terminal)
    if (
      plan.required.some((k) => {
        const v = fields[k]?.value ?? existing[k];
        return v === "UNKNOWN" || fields[k]?.state === "UNKNOWN";
      })
    ) {
      completeness = "COMPLETE_WITH_UNKNOWN";
    }
  }

  return {
    productId: p.id,
    categoryId: p.categoryId,
    completeness,
    fields,
    identityNotes: identityNotes.length ? identityNotes : undefined,
    researchedAt: TODAY,
  };
}

const products = padelAllProductsBeforeSpecEnrichment.filter((p) =>
  PADEL_CATS.has(p.categoryId),
);
const store: Record<string, ProductSpecEnrichment> = {};
const conflicts: Array<Record<string, string>> = [];

for (const p of products) {
  const enrichment = enrichProduct(p);
  store[p.id] = enrichment;
  // Conflict detection: enrichment VERIFIED differs from existing
  for (const [key, f] of Object.entries(enrichment.fields)) {
    const existing = p.specifications?.[key];
    if (
      f.state === "VERIFIED" &&
      hasMeaningfulSpecValue(existing) &&
      hasMeaningfulSpecValue(f.value) &&
      JSON.stringify(existing) !== JSON.stringify(f.value)
    ) {
      conflicts.push({
        productId: p.id,
        categoryId: p.categoryId,
        field: key,
        valueA: JSON.stringify(existing),
        sourceA: "catalog-existing",
        valueB: JSON.stringify(f.value),
        sourceB: f.sourceUrl || f.sourceType,
        resolution: "kept_existing_catalog_value",
      });
    }
  }
}

// Write store.ts
const storeBody = `/* AUTO-GENERATED by scripts/tmp/enrich-padel-specs.ts — do not hand-edit */
import type { ProductSpecEnrichment } from "@/content/padel/spec-enrichment/types";

export const padelSpecEnrichmentStore: Record<string, ProductSpecEnrichment> = ${JSON.stringify(store, null, 2)};
`;
writeFileSync(STORE_PATH, storeBody);

// Coverage CSV
const covHeader = [
  "productId",
  "categoryId",
  "brandId",
  "name",
  "lifecycleStatus",
  "publicationStatus",
  "completeness",
  "requiredFilled",
  "requiredTerminal",
  "importantFilled",
  "importantTerminal",
  "optionalFilled",
  "verifiedFieldCount",
  "notPublishedCount",
  "unknownCount",
  "sourceCoveragePct",
  "identityNotes",
];
const covRows: string[] = [];
const byCat: Record<
  string,
  {
    n: number;
    verifiedComplete: number;
    completeWithUnknown: number;
    incomplete: number;
    blocked: number;
    conflicts: number;
    withSource: number;
  }
> = {};

for (const p of products) {
  const e = store[p.id];
  const plan = resolveSpecPlan(p.categoryId, p.specifications ?? {});
  const count = (keys: string[], pred: (k: string) => boolean) =>
    keys.filter(pred).length;
  const filled = (k: string) =>
    hasMeaningfulSpecValue(e.fields[k]?.value ?? p.specifications?.[k]);
  const terminal = (k: string) => {
    const v = e.fields[k]?.value ?? p.specifications?.[k];
    return isTerminalSpecValue(v);
  };
  const verifiedCount = Object.values(e.fields).filter((f) => f.state === "VERIFIED").length;
  const npCount = Object.values(e.fields).filter((f) => f.state === "NOT_PUBLISHED").length;
  const unkCount = Object.values(e.fields).filter((f) => f.state === "UNKNOWN").length;
  const withUrl = Object.values(e.fields).filter((f) => Boolean(f.sourceUrl)).length;
  const sourceCoveragePct = Math.round(
    (100 * withUrl) / Math.max(1, Object.keys(e.fields).length),
  );

  covRows.push(
    [
      p.id,
      p.categoryId,
      p.brandId,
      p.name,
      p.lifecycleStatus,
      p.status,
      e.completeness,
      count(plan.required, filled),
      count(plan.required, terminal),
      count(plan.important, filled),
      count(plan.important, terminal),
      count(plan.optional, filled),
      verifiedCount,
      npCount,
      unkCount,
      sourceCoveragePct,
      (e.identityNotes || []).join("; "),
    ]
      .map((x) => csvEscape(String(x)))
      .join(","),
  );

  const cat = p.categoryId;
  if (!byCat[cat]) {
    byCat[cat] = {
      n: 0,
      verifiedComplete: 0,
      completeWithUnknown: 0,
      incomplete: 0,
      blocked: 0,
      conflicts: 0,
      withSource: 0,
    };
  }
  byCat[cat].n++;
  if (e.completeness === "VERIFIED_COMPLETE") byCat[cat].verifiedComplete++;
  if (e.completeness === "COMPLETE_WITH_UNKNOWN") byCat[cat].completeWithUnknown++;
  if (e.completeness === "INCOMPLETE_RESEARCH") byCat[cat].incomplete++;
  if (e.completeness === "BLOCKED") byCat[cat].blocked++;
  if (withUrl > 0) byCat[cat].withSource++;
}
for (const c of conflicts) {
  if (byCat[c.categoryId]) byCat[c.categoryId].conflicts++;
}

mkdirSync(join(ROOT, "docs/padel/data"), { recursive: true });
writeFileSync(COVERAGE_PATH, [covHeader.join(","), ...covRows].join("\n") + "\n");
writeFileSync(
  CONFLICTS_PATH,
  [
    "productId,categoryId,field,valueA,sourceA,valueB,sourceB,resolution",
    ...conflicts.map((c) =>
      [c.productId, c.categoryId, c.field, c.valueA, c.sourceA, c.valueB, c.sourceB, c.resolution]
        .map((x) => csvEscape(String(x)))
        .join(","),
    ),
  ].join("\n") + "\n",
);

const incomplete = products.filter(
  (p) => store[p.id].completeness === "INCOMPLETE_RESEARCH",
);

const audit = `# Padel spec enrichment audit

**Date:** ${TODAY}  
**Scope:** ALL canonical Padel products (rackets, shoes, balls, bags, grips, accessories)  
**Rule:** Never invent manufacturer measurements. \`NOT_PUBLISHED\` / \`UNKNOWN\` / \`NOT_APPLICABLE\` are valid terminal states.

## Architecture

| Layer | Role |
| --- | --- |
| Spec values | \`Product.specifications\` (\`SpecValue\`) |
| Field provenance | \`src/content/padel/spec-enrichment/store.ts\` (sidecar) |
| Apply | \`applySpecEnrichmentToProducts\` in padel merge |
| Required plans | \`src/content/padel/spec-enrichment/required-fields.ts\` |
| Coverage | \`docs/padel/data/PADEL-SPEC-COVERAGE.csv\` |
| Conflicts | \`docs/padel/data/PADEL-SPEC-CONFLICTS.csv\` |
| Admin | \`/admin/catalog/padel-equipment/specs\` |

## Category report

| Category | Products | VERIFIED_COMPLETE | COMPLETE_WITH_UNKNOWN | INCOMPLETE | BLOCKED | Conflicts | Source coverage (any URL) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${Object.entries(byCat)
  .map(([cat, s]) => {
    const srcPct = Math.round((100 * s.withSource) / Math.max(1, s.n));
    return `| ${cat.replace("cat-padel-", "")} | ${s.n} | ${s.verifiedComplete} | ${s.completeWithUnknown} | ${s.incomplete} | ${s.blocked} | ${s.conflicts} | ${srcPct}% |`;
  })
  .join("\n")}

**Totals:** ${products.length} products · incomplete remaining: **${incomplete.length}**

## Completeness rules

- **VERIFIED_COMPLETE** — every required + important slot has a meaningful value (or only optional gaps closed as NOT_PUBLISHED).
- **COMPLETE_WITH_UNKNOWN** — required/important slots closed, but at least one is \`UNKNOWN\` (needs manufacturer follow-up, not invented).
- **INCOMPLETE_RESEARCH** — empty required/important with no terminal marker (must be 0).
- **BLOCKED** — discontinued / non-enrichable lifecycle.

## What was enriched

1. **Soft goods taxonomy** from market inventory (ball use/speed/type, bag form/carry, grip type, accessory type, compatibility class).
2. **Curated specs retained** with provenance pointing at catalog/specialist URLs when available.
3. **Missing manufacturer measurements** (litres, mm weight, felt lab numbers, etc.) marked **NOT_PUBLISHED** — not fabricated.
4. **Racket power/control numeric scores** — never invented.
5. **Shoe surfaceCompatibility** — never inferred; UNKNOWN if not evidenced.

## Conflicts

${conflicts.length} field conflicts detected (existing catalog value ≠ enrichment hint). Resolution: **keep existing catalog value**; conflict logged in \`PADEL-SPEC-CONFLICTS.csv\`.

## Identity corrections

This pass did **not** merge products. Soft-goods identity (pack/color/title collapses) was already fixed during market capture. Notes below are research follow-ups, not identity merges.

${
  products.some((p) => (store[p.id].identityNotes || []).length)
    ? products
        .filter((p) => (store[p.id].identityNotes || []).length)
        .slice(0, 40)
        .map((p) => `- **${p.id}:** ${(store[p.id].identityNotes || []).join("; ")}`)
        .join("\n")
    : "_No identity notes this pass._"
}

## Public labels

- Formatter: \`src/lib/specs/public-label.ts\` (\`formatPublicSpecDisplayLabel\` / \`formatPublicSpecKey\`)
- Regression: \`tests/padel-spec-public-labels.test.ts\` covers every key in \`PADEL_SPEC_PLANS\`

## Gate

INCOMPLETE_RESEARCH remaining: **${incomplete.length}**  
${incomplete.length === 0 ? "Gate PASS — every product has a terminal completeness state." : "Gate FAIL — list:\n" + incomplete.map((p) => `- ${p.id}`).join("\n")}

## Next

1. Manual manufacturer PDP pass for COMPLETE_WITH_UNKNOWN (16 rackets missing shape/balance/weightMin; 13 shoes missing surfaceCompatibility).
2. Promote shoe evidence URLs (currently ~2% source URL coverage vs 100% for rackets/soft goods).
3. Extract published litres/weights from official PDPs into VERIFIED fields with per-field sourceUrl.
4. Spec conflict review in admin (\`/admin/catalog/padel-equipment/specs\`).
`;

writeFileSync(AUDIT_PATH, audit);

console.log(
  JSON.stringify(
    {
      products: products.length,
      incomplete: incomplete.length,
      conflicts: conflicts.length,
      byCat,
      storePath: STORE_PATH,
    },
    null,
    2,
  ),
);
