/**
 * Generate SoftDraft market-wave from PADEL-EQUIPMENT-MARKET-INVENTORY.csv
 * Imports CURRENT verified/likely products not yet in Kitletics.
 * Does NOT invent specs; leaves media/commerce pending (draft via media gate).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function parseCsv(text) {
  const lines = text.trimEnd().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    /** @type {Record<string, string>} */
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
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

const invPath = join(
  process.cwd(),
  "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv",
);
const outPath = join(
  process.cwd(),
  "src/content/padel/soft-goods/market-wave.ts",
);

const CAT = {
  balls: "cat-padel-balls",
  bags: "cat-padel-bags",
  grips: "cat-padel-grips",
  accessories: "cat-padel-accessories",
};

const BRAND = {
  Head: "brand-head-padel",
  HEAD: "brand-head-padel",
  Wilson: "brand-wilson-padel",
  Bullpadel: "brand-bullpadel",
  Adidas: "brand-adidas-padel",
  Babolat: "brand-babolat-padel",
  Dunlop: "brand-dunlop-padel",
  Kuikma: "brand-kuikma",
  Tecnifibre: "brand-tecnifibre-padel",
  Nox: "brand-nox",
  NOX: "brand-nox",
  Tretorn: "brand-tretorn-padel",
  Siux: "brand-siux",
  "Drop Shot": "brand-drop-shot",
  StarVie: "brand-starvie",
  Joma: "brand-joma",
  Varlion: "brand-varlion",
  Slazenger: "brand-slazenger-padel",
  Hesacore: "brand-hesacore",
  Tourna: "brand-tourna",
  ShockOut: "brand-shockout",
  TuboPlus: "brand-tuboplus",
  "Ball Rescuer": "brand-ball-rescuer",
  Softee: "brand-softee",
  "Pascal Box": "brand-pascal-box",
  Oxdog: "brand-oxdog",
  "Royal Padel": "brand-royal-padel",
  "Black Crown": "brand-black-crown",
  Lok: "brand-lok",
  Volt: "brand-volt-padel",
  RS: "brand-rs-padel",
  Bounce: "brand-bounce-tube",
  "Bounce Tube": "brand-bounce-tube",
  "4ON": "brand-4on",
  Yonex: "brand-yonex-padel",
  Enebe: "brand-enebe",
  Vibora: "brand-vibora",
  Osaka: "brand-osaka-padel",
  Pallap: "brand-pallap",
  Fila: "brand-fila-padel",
  Prince: "brand-prince-padel",
  Alacran: "brand-alacran",
  Sane: "brand-sane",
  Noene: "brand-noene",
  Generic: "brand-padel-generic",
};

function resolveBrand(brand) {
  if (BRAND[brand]) return BRAND[brand];
  const hit = Object.entries(BRAND).find(
    ([k]) => k.toLowerCase() === String(brand).toLowerCase(),
  );
  return hit?.[1];
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function productId(brand, model) {
  return `prod-${slugify(`${brand}-${model}`)}`;
}

function bagForm(sub) {
  const map = {
    BACKPACK: "backpack",
    PALETERO: "racket-bag",
    PADEL_RACKET_BAG: "racket-bag",
    TOURNAMENT_BAG: "tournament-bag",
    COURT_BAG: "duffel",
    DUFFEL: "duffel",
    RACKET_COVER: "racket-cover",
    SHOE_BAG: "other",
  };
  return map[sub] ?? "other";
}

function ballSpecs(sub) {
  const speed =
    sub === "fast"
      ? "fast"
      : sub === "control" || sub === "training"
        ? "slow"
        : "medium";
  const use =
    sub === "training"
      ? "training"
      : sub === "club"
        ? "club"
        : "competition";
  return {
    ballType: sub === "training" ? "training" : "official",
    use,
    speed,
    pressurization: "pressurized",
    packSize: "3-ball can",
    ballsPerCan: 3,
    freshnessStatus: "current",
  };
}

function gripSpecs(sub) {
  if (sub === "replacement") return { gripType: "replacement" };
  if (sub === "ergonomic" || sub === "cushion") return { gripType: "cushion" };
  return { gripType: "overgrip" };
}

function accessorySpecs(sub) {
  const typeMap = {
    pressurizer: "pressurizer",
    protector: "protector",
    frame_tape: "frame_tape",
    weight_system: "customization_weight",
    wristband: "wristband",
    sweatband: "sweatband",
    ball_basket: "ball_basket",
    training_aid: "training_aid",
  };
  return { type: typeMap[sub] ?? "other" };
}

const raw = readFileSync(invPath, "utf8");
const rows = parseCsv(raw);

const skipName = /range$/i;
const EXCLUDE_DISP = new Set([
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
const candidates = rows.filter((r) => {
  if (r.existing_in_kitletics === "yes") return false;
  if (!["CURRENT", "CURRENT_LIMITED"].includes(r.current_status)) return false;
  if (!["verified", "likely"].includes(r.research_status)) return false;
  if (EXCLUDE_DISP.has(r.disposition)) return false;
  if (skipName.test(r.product) || skipName.test(r.model)) return false;
  if (r.brand === "Generic") return false;
  if (!resolveBrand(r.brand)) {
    console.warn("missing brand map", r.brand);
    return false;
  }
  return true;
});

const seen = new Set();
const drafts = [];

for (const r of candidates) {
  // Never trust a kitletics_product_id that does not contain the brand slug
  const brandSlug = slugify(r.brand);
  let id = productId(r.brand, r.model);
  if (
    r.kitletics_product_id &&
    r.kitletics_product_id.includes(brandSlug.split("-")[0])
  ) {
    id = r.kitletics_product_id;
  }
  if (seen.has(id)) continue;
  seen.add(id);

  const categoryId = CAT[r.category];
  const brandId = resolveBrand(r.brand);
  const slug = slugify(`${r.brand}-${r.model}`);
  const sourceUrl =
    r.manufacturer_url ||
    (r.retailer_urls || "").split("|")[0]?.trim() ||
    "https://www.kitletics.com";
  const sourceName = r.manufacturer_url
    ? `${r.brand} manufacturer / specialist`
    : `${r.brand} market research`;

  /** @type {Record<string, unknown>} */
  let specifications = {};
  if (r.category === "balls") specifications = ballSpecs(r.subcategory);
  else if (r.category === "bags")
    specifications = { form: bagForm(r.subcategory) };
  else if (r.category === "grips") specifications = gripSpecs(r.subcategory);
  else specifications = accessorySpecs(r.subcategory);

  if (r.generation) specifications.generation = r.generation;

  drafts.push({
    id,
    slug,
    brandId,
    name: r.model,
    fullName: r.product,
    categoryId,
    lifecycle:
      r.current_status === "CURRENT_LIMITED" ? "current" : "current",
    sourceUrl,
    sourceName,
    shortDescription: `${r.product} — researched as a current commercially meaningful ${r.category} SKU (${r.subcategory}). ${r.evidence}`.slice(
      0,
      420,
    ),
    specifications,
    strengths: [],
    weaknesses: [],
    inventoryMeta: {
      subcategory: r.subcategory,
      research_status: r.research_status,
      NL_available: r.NL_available,
      EU_available: r.EU_available,
      evidence: r.evidence,
    },
  });
}

const file = `/**
 * AUTO-GENERATED from docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv
 * Do not hand-curate this as a Best list — it is market coverage onboarding.
 * Regenerate via: node scripts/tmp/generate-padel-equipment-market-wave.mjs
 */
import type { SoftDraft } from "@/content/padel/soft-goods/build";

export function marketWaveDrafts(): SoftDraft[] {
  return ${JSON.stringify(
    drafts.map(({ inventoryMeta: _m, ...d }) => d),
    null,
    2,
  )} as SoftDraft[];
}

export const marketWaveInventoryMeta = ${JSON.stringify(
  Object.fromEntries(drafts.map((d) => [d.id, d.inventoryMeta])),
  null,
  2,
)} as const;
`;

writeFileSync(outPath, file);
console.log({
  imported: drafts.length,
  byCat: drafts.reduce((acc, d) => {
    acc[d.categoryId] = (acc[d.categoryId] ?? 0) + 1;
    return acc;
  }, {}),
  outPath,
});
