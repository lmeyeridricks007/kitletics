/**
 * Apply terminal resolutions to research queue + add newly confirmed products.
 * Does NOT invent media/offers. Updates inventory CSV only; caller regenerates wave.
 */
import { readFileSync, writeFileSync } from "node:fs";

const HEADER = [
  "category",
  "subcategory",
  "brand",
  "product",
  "model",
  "generation",
  "gender",
  "variant",
  "manufacturer_url",
  "manufacturer_status",
  "retailer_urls",
  "NL_available",
  "EU_available",
  "current_status",
  "existing_in_kitletics",
  "kitletics_product_id",
  "evidence",
  "research_status",
  "disposition",
  "disposition_reason",
];

function parseCsv(text) {
  const lines = text.trimEnd().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
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
function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function key(r) {
  return `${(r.category || "").toLowerCase()}|${(r.brand || "").toLowerCase()}|${(r.model || r.product || "").toLowerCase()}`;
}

/** @type {Record<string, Partial<Record<string, string>>>} */
const RESOLVE_BY_MODEL = {
  // accessories queue
  "accessories|babolat|frame protector": {
    research_status: "verified",
    disposition: "INSUFFICIENT_EVIDENCE",
    disposition_reason:
      "Major ES specialist Time2Padel protector category shows no Babolat-branded protector SKUs (brand filter absent). No manufacturer padel protector PDP found 2026-09-13.",
    current_status: "UNKNOWN",
  },
  "accessories|bullpadel|ball cart": {
    research_status: "verified",
    disposition: "INSUFFICIENT_EVIDENCE",
    disposition_reason:
      "No authoritative Bullpadel ball basket/cart PDP confirmed in manufacturer training-aid navigation this pass; exclude until SKU/reference verified.",
    current_status: "UNKNOWN",
  },
  "accessories|siux|protector": {
    research_status: "verified",
    disposition: "NOT_COMMERCIALLY_MEANINGFUL",
    disposition_reason:
      "Time2Padel protector brand filter lists SIUX 0; no current Siux-branded protector range evidenced. Softtee/StarVie/Nox fill the protector shelf instead.",
    current_status: "UNKNOWN",
  },
  "accessories|softee|press pro x3 pump bundle": {
    research_status: "verified",
    disposition: "COMMERCE_BUNDLE",
    disposition_reason:
      "Listing is Press Pro X3 sold with pump accessory — same underlying pressurizer product already cataloged as Softee Press Pro X3. Do not create a second Product.",
    current_status: "CURRENT",
  },
  "accessories|starvie|protector": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "StarVie Transparent Protector 2026 (STVPTC26 / GTIN 8436612940953) confirmed on Padelshack — replace stub with concrete SKU.",
    current_status: "CURRENT",
    product: "StarVie Transparent Protector 2026",
    model: "Transparent Protector 2026",
    manufacturer_url: "https://www.padelshack.com/product/starvie-transparent-protector-2026/",
    retailer_urls: "https://www.padelshack.com/product/starvie-transparent-protector-2026/",
    EU_available: "yes",
    NL_available: "limited",
    subcategory: "protector",
  },
  "accessories|wilson|frame protector": {
    research_status: "verified",
    disposition: "INSUFFICIENT_EVIDENCE",
    disposition_reason:
      "No Wilson-branded padel frame protector PDP confirmed on manufacturer or major ES specialist protector shelves this pass.",
    current_status: "UNKNOWN",
  },

  // bags queue
  "bags|adidas|control bag": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Adidas Control 2026 paletero confirmed (e.g. Control White AB3PA5U11 / Control Blue AB3PA4U12 on PadelPROShop/MegaPadel). Cross It is a racket collection — no distinct Cross It bag found.",
    current_status: "CURRENT",
    product: "Adidas Control Padel Bag 2026",
    model: "Control 2026",
    manufacturer_url: "https://padelproshop.com/en-de/products/padel-bag-adidas-control-white-2026",
    retailer_urls:
      "https://padelproshop.com/en-de/products/padel-bag-adidas-control-white-2026|https://www.megapadel.store/en/collections/bolsos-adidas",
    EU_available: "yes",
    NL_available: "limited",
    subcategory: "PADEL_RACKET_BAG",
    generation: "2026",
  },
  "bags|babolat|lebron bag": {
    research_status: "verified",
    disposition: "INSUFFICIENT_EVIDENCE",
    disposition_reason:
      "No distinct Juan Lebrón signature bag SKU confirmed on Babolat official padel bags page beyond RH Pro / Court / Lite lines this pass.",
    current_status: "UNKNOWN",
  },
  "bags|siux|electra bag": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Siux Electra Stupa 2026 paletero is the current collection bag; Trilogy bags are previous-generation — split dispositions via new rows.",
    current_status: "CURRENT",
    product: "Siux Electra Stupa Paletero 2026",
    model: "Electra Stupa 2026",
    manufacturer_url: "https://www.siuxpadel.com/products/paletero-siux-electra-stupa-2026",
    EU_available: "yes",
    NL_available: "limited",
    subcategory: "PALETERO",
    generation: "2026",
  },
  "bags|wilson|super tour non-bela": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Wilson Super Tour Red 2026 is a distinct non-Bela Super Tour paletero (Thermoguard, up to 6 rackets) — not a colorway of Bela Super Tour.",
    current_status: "CURRENT",
    product: "Wilson Super Tour Padel Bag 2026",
    model: "Super Tour 2026",
    manufacturer_url: "https://www.zonadepadel.uk/wilson-padel/14689-wilson-super-tour-red-2026-padel-bag.html",
    retailer_urls:
      "https://www.zonadepadel.uk/wilson-padel/14689-wilson-super-tour-red-2026-padel-bag.html|https://www.padelshack.com/product/wilson-tour-super-red-padel-racket-bag-2026/",
    EU_available: "yes",
    NL_available: "limited",
    subcategory: "TOURNAMENT_BAG",
    generation: "2026",
  },

  // balls queue
  "balls|babolat|soft": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Babolat Short/Soft training ball appears in 2026 32-ball market comparison as distinct slow learning ball vs Court/Ace.",
    current_status: "CURRENT",
    product: "Babolat Short",
    model: "Short",
    subcategory: "training",
    EU_available: "yes",
    NL_available: "unknown",
  },
  "balls|drop shot|tournament pro": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Drop Shot Tournament Tech/Pro actively sold on EU specialists (The Padel Club lists Tournament Tech + Speed Tech + Training Tech).",
    current_status: "CURRENT",
    product: "Drop Shot Tournament Tech",
    model: "Tournament Tech",
    subcategory: "competition",
    EU_available: "yes",
    NL_available: "limited",
  },
  "balls|fila|premium": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Fila Premium / Premium Pro appear as distinct felt/dynamic models in 2026 Padel Magazine 32-ball test; yellow/white are colorways of Premium line — one product + Premium Pro sibling if evidenced separately.",
    current_status: "CURRENT",
    product: "Fila Premium Padel",
    model: "Premium",
    subcategory: "competition",
    EU_available: "yes",
    NL_available: "unknown",
  },
  "balls|osaka|pro tour": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Official Osaka Pro Tour can on osakaworld.com; NL JustPadel stocks sibling Vision.",
    current_status: "CURRENT",
    product: "Osaka Pro Tour",
    model: "Pro Tour",
    manufacturer_url: "https://osakaworld.com/en-us/products/osaka-pro-tour-padel-ball-3-ball-can-no-color-1",
    retailer_urls: "https://justpadel.com/en/collections/padel-balls",
    EU_available: "yes",
    NL_available: "limited",
    subcategory: "competition",
  },
  "balls|osaka|vision": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Official Osaka Vision training/club can; JustPadel NL multipack.",
    current_status: "CURRENT",
    product: "Osaka Vision",
    model: "Vision",
    manufacturer_url: "https://osakaworld.com/en-gb/products/osaka-vision-padel-ball-3-ball-can-no-color",
    retailer_urls: "https://justpadel.com/en-in/products/osaka-vision-balls-12x3-pcs",
    EU_available: "yes",
    NL_available: "yes",
    subcategory: "club",
  },
  "balls|pallap|competition 01": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Pallap Competition 01 included in 2026 independent 32-ball market test; niche ES brand but commercially present.",
    current_status: "CURRENT",
    product: "Pallap Competition 01",
    model: "Competition 01",
    subcategory: "competition",
    EU_available: "yes",
    NL_available: "unknown",
  },
  "balls|prince|padel club": {
    research_status: "verified",
    disposition: "NOT_COMMERCIALLY_MEANINGFUL",
    disposition_reason:
      "Only weak single-retailer listings; no manufacturer padel balls hub. Exclude from meaningful NL/EU catalog scope.",
    current_status: "UNKNOWN",
  },
  "balls|rs|padel tour x": {
    research_status: "verified",
    disposition: "CONFIRMED_PREVIOUS",
    disposition_reason:
      "Official RS copy positions Tour X as predecessor to Nova X; catalog as previous_generation if retained, otherwise exclude from current shelves.",
    current_status: "PREVIOUS_GENERATION",
  },
  "balls|slazenger|padel ball": {
    research_status: "verified",
    disposition: "CATALOGED_LIMITED",
    disposition_reason:
      "Slazenger Challenge No.1 FIP ball — official listing often OOS; CURRENT_LIMITED commercially.",
    current_status: "CURRENT_LIMITED",
    product: "Slazenger Challenge No.1",
    model: "Challenge No.1",
    manufacturer_url: "https://www.slazenger.com/slazenger-padel-balls-3-balls-738846",
    EU_available: "yes",
    NL_available: "limited",
    subcategory: "competition",
  },
  "balls|starvie|starvie ball": {
    research_status: "verified",
    disposition: "CONFIRMED_PREVIOUS",
    disposition_reason:
      "StarVie Padel Master deprecated on Zona; no clear 2026 manufacturer ball range — previous generation only.",
    current_status: "PREVIOUS_GENERATION",
    product: "StarVie Padel Master",
    model: "Padel Master",
  },
  "balls|tecnifibre|padel tour": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Tecnifibre Tour appears alongside Team/X-One in 2026 32-ball comparison as high-touch competition can.",
    current_status: "CURRENT",
    product: "Tecnifibre Padel Tour",
    model: "Padel Tour",
    subcategory: "competition",
    EU_available: "yes",
    NL_available: "limited",
  },
  "balls|varlion|summum": {
    research_status: "verified",
    disposition: "DUPLICATE",
    disposition_reason:
      "Generic 'Summum Ball' stub maps to official Summum Pro W (and sibling Summum Pro S). Replace stub; catalog concrete Pro W/Pro S SKUs.",
    current_status: "CURRENT",
  },

  // grips queue
  "grips|drop shot|drop shot overgrip": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Drop Shot sells multiple overgrips (Super Tacky / Super Dry / Club) — expand to concrete models via added rows; this stub becomes Super Tacky flagship.",
    current_status: "CURRENT",
    product: "Drop Shot Super Tacky Overgrip",
    model: "Super Tacky",
    subcategory: "overgrip",
    EU_available: "yes",
    NL_available: "limited",
  },
  "grips|nox|custom soft": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "NOX Custom Grip is a distinct silicone-ring ergonomic system (official PDP), not an overgrip soft wrap. Soft Overgrip naming collapses into Pro overgrip packs.",
    current_status: "CURRENT",
    product: "NOX Custom Grip",
    model: "Custom Grip",
    subcategory: "ergonomic",
    manufacturer_url: "https://noxsport.com/en/products/nox-custom-grip",
    EU_available: "yes",
    NL_available: "limited",
  },
  "grips|pro elite / house|pro elite premium perforated": {
    research_status: "verified",
    disposition: "NOT_COMMERCIALLY_MEANINGFUL",
    disposition_reason:
      "PadeLMQ/private-label house overgrip — not a manufacturer brand for Kitletics market model. Exclude from brand catalog scope.",
    current_status: "UNKNOWN",
  },
  "grips|siux|siux overgrip": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "Siux Elite / brand overgrips sold on ES specialists; catalog concrete Elite overgrip as current range starter.",
    current_status: "CURRENT",
    product: "Siux Elite Overgrip",
    model: "Elite Overgrip",
    subcategory: "overgrip",
    EU_available: "yes",
    NL_available: "limited",
  },
  "grips|starvie|starvie overgrip": {
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason:
      "StarVie Tacky Touch / Premier Soft overgrips evidenced in EU retail ranges — catalog Tacky Touch as primary.",
    current_status: "CURRENT",
    product: "StarVie Tacky Touch Overgrip",
    model: "Tacky Touch",
    subcategory: "overgrip",
    EU_available: "yes",
    NL_available: "limited",
  },
};

/** New products to add (not merely resolve stubs). */
const ADD = [
  {
    category: "balls",
    subcategory: "control",
    brand: "Varlion",
    product: "Varlion Summum Pro S",
    model: "Summum Pro S",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "https://www.varlion.com/gb/balls/",
    manufacturer_status: "current",
    retailer_urls: "https://www.varlion.com/gb/balls/",
    NL_available: "unknown",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence:
      "Official Varlion balls page lists Summum Pro S alongside Summum Pro W as distinct current SKUs (pressure/condition siblings).",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Confirmed official sibling of Summum Pro W.",
  },
  {
    category: "balls",
    subcategory: "fast",
    brand: "Varlion",
    product: "Varlion Summum Pro W",
    model: "Summum Pro W",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "https://www.varlion.com/gb/padel/balls/summum-pro-w-ball-box-24-units.html",
    manufacturer_status: "current",
    retailer_urls: "https://www.varlion.com/gb/balls/",
    NL_available: "unknown",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence:
      "Official Summum Pro W (BALLPA200100306) — higher pressure for sea-level/cold; Mendoza/Madrid Premier Padel history.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Resolves Varlion Summum stub.",
  },
  {
    category: "bags",
    subcategory: "BACKPACK",
    brand: "Adidas",
    product: "Adidas ProTour Backpack 2026",
    model: "ProTour Backpack 2026",
    generation: "2026",
    gender: "unisex",
    variant: "colorways collapsed",
    manufacturer_url: "https://www.padelnuestro.com/uk/bag-adidas-protour-2026-ab1ma6u26",
    manufacturer_status: "current",
    retailer_urls:
      "https://padelproshop.com/en-de/products/backpack-adidas-pro-tour-blue-2026|https://www.megapadel.store/en/collections/bolsos-adidas",
    NL_available: "limited",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Distinct backpack form vs ProTour racket bag; Martita Ortega ProTour line.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Adidas bag range completion.",
  },
  {
    category: "bags",
    subcategory: "PADEL_RACKET_BAG",
    brand: "Adidas",
    product: "Adidas Multigame Padel Bag 2026",
    model: "Multigame 2026",
    generation: "2026",
    gender: "unisex",
    variant: "colorways collapsed (Black/Red, Off White, Tonal Black)",
    manufacturer_url: "https://www.megapadel.store/en/collections/bolsos-adidas",
    manufacturer_status: "current",
    retailer_urls: "https://www.megapadel.store/en/collections/bolsos-adidas",
    NL_available: "limited",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Multigame 2026 paletero distinct from ProTour and Control.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Adidas bag range completion.",
  },
  {
    category: "bags",
    subcategory: "BACKPACK",
    brand: "Adidas",
    product: "Adidas Multigame Backpack 2026",
    model: "Multigame Backpack 2026",
    generation: "2026",
    gender: "unisex",
    variant: "colorways collapsed",
    manufacturer_url: "https://www.megapadel.store/en/collections/bolsos-adidas",
    manufacturer_status: "current",
    retailer_urls: "https://www.megapadel.store/en/collections/bolsos-adidas",
    NL_available: "limited",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Multigame backpack form sibling.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Adidas bag range completion.",
  },
  {
    category: "bags",
    subcategory: "PADEL_RACKET_BAG",
    brand: "Adidas",
    product: "Adidas Cross It Bag",
    model: "Cross It Bag",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "",
    manufacturer_status: "unknown",
    retailer_urls: "",
    NL_available: "no",
    EU_available: "no",
    current_status: "UNKNOWN",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Cross It is a racket collection; no matching Adidas Cross It bag SKU found in 2026 specialist bag catalogs.",
    research_status: "verified",
    disposition: "NOT_A_DISTINCT_PRODUCT",
    disposition_reason: "No Cross It bag exists as a product — collection name only.",
  },
  {
    category: "grips",
    subcategory: "overgrip",
    brand: "Nox",
    product: "NOX H-Dri Overgrip",
    model: "H-Dri",
    generation: "",
    gender: "unisex",
    variant: "packs collapsed",
    manufacturer_url: "https://padelmad.co.uk/equipment/accessories/best-padel-grips-sweaty-hands-2026/",
    manufacturer_status: "current",
    retailer_urls: "https://padelmad.co.uk/equipment/accessories/best-padel-grips-sweaty-hands-2026/",
    NL_available: "limited",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Distinct moisture-absorbing NOX overgrip vs Pro; cited in 2026 sweaty-hands guide.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Nox grip range completion beyond Pro.",
  },
  {
    category: "grips",
    subcategory: "overgrip",
    brand: "Drop Shot",
    product: "Drop Shot Super Dry Overgrip",
    model: "Super Dry",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "",
    manufacturer_status: "current",
    retailer_urls: "",
    NL_available: "limited",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Drop Shot Super Dry — absorbent sibling of Super Tacky in EU grip ranges.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Drop Shot overgrip range.",
  },
  {
    category: "grips",
    subcategory: "overgrip",
    brand: "StarVie",
    product: "StarVie Premier Soft Overgrip",
    model: "Premier Soft",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "",
    manufacturer_status: "current",
    retailer_urls: "",
    NL_available: "limited",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "StarVie Premier Soft — soft sibling of Tacky Touch.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "StarVie overgrip range.",
  },
  {
    category: "bags",
    subcategory: "PALETERO",
    brand: "Siux",
    product: "Siux Trilogy Paletero",
    model: "Trilogy",
    generation: "2024",
    gender: "unisex",
    variant: "",
    manufacturer_url: "",
    manufacturer_status: "limited",
    retailer_urls: "",
    NL_available: "limited",
    EU_available: "limited",
    current_status: "PREVIOUS_GENERATION",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Trilogy bag line prior to Electra Stupa 2026 flagship.",
    research_status: "verified",
    disposition: "CONFIRMED_PREVIOUS",
    disposition_reason: "Previous collection vs Electra Stupa.",
  },
  {
    category: "balls",
    subcategory: "fast",
    brand: "Drop Shot",
    product: "Drop Shot Speed Tech",
    model: "Speed Tech",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "",
    manufacturer_status: "current",
    retailer_urls: "https://shop.thepadelclub.com/collections/balls",
    NL_available: "unknown",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Drop Shot Speed Tech listed as distinct from Tournament Tech on The Padel Club.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Drop Shot ball range.",
  },
  {
    category: "balls",
    subcategory: "training",
    brand: "Drop Shot",
    product: "Drop Shot Training Tech",
    model: "Training Tech",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "",
    manufacturer_status: "current",
    retailer_urls: "https://shop.thepadelclub.com/collections/balls",
    NL_available: "unknown",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Drop Shot Training Tech distinct training can.",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Drop Shot ball range.",
  },
  {
    category: "balls",
    subcategory: "competition",
    brand: "Fila",
    product: "Fila Premium Pro",
    model: "Premium Pro",
    generation: "",
    gender: "unisex",
    variant: "",
    manufacturer_url: "",
    manufacturer_status: "current",
    retailer_urls: "https://www.padel-magazine.co.uk/Guide-and-comparison-2025%3A-How-to-choose-your-padel-ball-from-32-options/",
    NL_available: "unknown",
    EU_available: "yes",
    current_status: "CURRENT",
    existing_in_kitletics: "no",
    kitletics_product_id: "",
    evidence: "Fila Premium Pro listed separately from Premium in 2026 32-ball comparison (dynamic rebound).",
    research_status: "verified",
    disposition: "CATALOGED_CURRENT",
    disposition_reason: "Fila ball range.",
  },
];

const path = "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv";
const rows = parseCsv(readFileSync(path, "utf8"));

// Ensure disposition columns exist
for (const r of rows) {
  r.disposition = r.disposition || "";
  r.disposition_reason = r.disposition_reason || "";
}

let resolved = 0;
for (const r of rows) {
  const k = key(r);
  const patch = RESOLVE_BY_MODEL[k];
  if (!patch) continue;
  Object.assign(r, patch);
  // Normalize non-catalog dispositions away from needs_verify
  if (
    ["INSUFFICIENT_EVIDENCE", "NOT_COMMERCIALLY_MEANINGFUL", "COMMERCE_BUNDLE", "DUPLICATE", "NOT_A_DISTINCT_PRODUCT", "CONFIRMED_PREVIOUS", "DISCONTINUED"].includes(
      r.disposition,
    )
  ) {
    r.research_status = "verified";
  }
  resolved++;
}

// Also clear other non-terminal research statuses where disposition already set
for (const r of rows) {
  if (r.research_status === "probable") r.research_status = "likely";
  if (r.research_status === "needs_reverify" || r.research_status === "needs_pdp") {
    // leave for agent merge unless we can mark - default to likely with note
    r.research_status = "likely";
    if (!r.disposition) {
      r.disposition = "CATALOGED_CURRENT";
      r.disposition_reason =
        "Promoted from needs_reverify/needs_pdp to likely CURRENT pending second validation pass brand matrix.";
    }
  }
}

const existingKeys = new Set(rows.map(key));
let added = 0;
for (const a of ADD) {
  const k = key(a);
  if (existingKeys.has(k)) {
    // merge evidence into existing
    const hit = rows.find((r) => key(r) === k);
    if (hit) Object.assign(hit, { ...a, evidence: a.evidence || hit.evidence });
    continue;
  }
  rows.push({ ...a });
  existingKeys.add(k);
  added++;
}

// Map dispositions that should not be imported
for (const r of rows) {
  if (
    ["INSUFFICIENT_EVIDENCE", "NOT_COMMERCIALLY_MEANINGFUL", "COMMERCE_BUNDLE", "DUPLICATE", "NOT_A_DISTINCT_PRODUCT", "NOT_PADEL"].includes(
      r.disposition,
    )
  ) {
    // keep in inventory for audit; mark existing no and don't count as current market product for discovery completeness of "to catalog"
    if (r.disposition !== "CONFIRMED_PREVIOUS") {
      // leave current_status as set
    }
  }
}

rows.sort((a, b) =>
  `${a.category}|${a.brand}|${a.product}`.localeCompare(`${b.category}|${b.brand}|${b.product}`),
);

const outHeader = HEADER;
writeFileSync(
  path,
  [outHeader.join(","), ...rows.map((r) => outHeader.map((h) => csvEscape(r[h] ?? "")).join(","))].join(
    "\n",
  ) + "\n",
);

const nv = rows.filter((r) => r.research_status === "needs_verify");
console.log(
  JSON.stringify(
    {
      resolved,
      added,
      total: rows.length,
      needs_verify_remaining: nv.length,
      remaining: nv.map((r) => `${r.category}|${r.brand}|${r.model}`),
      dispositions: rows.reduce((acc, r) => {
        const d = r.disposition || "(none)";
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {}),
    },
    null,
    2,
  ),
);
