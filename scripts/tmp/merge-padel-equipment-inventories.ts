/**
 * Merge agent market inventories into canonical PADEL-EQUIPMENT-MARKET-INVENTORY.csv
 * then regenerate market-wave for products not yet in catalog.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts } from "@/content/padel";
import { ballDrafts } from "@/content/padel/soft-goods/balls";
import { bagDrafts } from "@/content/padel/soft-goods/bags";
import { gripDrafts } from "@/content/padel/soft-goods/grips";
import { accessoryDrafts } from "@/content/padel/soft-goods/accessories";
import { marketWaveDrafts } from "@/content/padel/soft-goods/market-wave";

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

const SOURCES = [
  "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv",
  "data/staging/padel-balls-market-inventory-2026-09.csv",
  "docs/padel/data/PADEL-BAGS-MARKET-INVENTORY-2026-09.csv",
  "docs/padel/data/PADEL-GRIPS-MARKET-INVENTORY-2026-09.csv",
  "docs/padel/data/PADEL-ACCESSORIES-MARKET-INVENTORY-2026-09.csv",
];

const CAT_IDS = {
  balls: "cat-padel-balls",
  bags: "cat-padel-bags",
  grips: "cat-padel-grips",
  accessories: "cat-padel-accessories",
};

function parseCsv(text: string) {
  const lines = text.trimEnd().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
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
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function normStatus(s: string) {
  const x = (s || "").trim().toUpperCase().replace(/-/g, "_");
  if (x === "CURRENT" || x === "CURRENT_LIMITED" || x === "PREVIOUS_GENERATION" || x === "DISCONTINUED" || x === "UNKNOWN")
    return x;
  if (x === "PREVIOUS" || x === "PREVIOUS_GEN") return "PREVIOUS_GENERATION";
  if (x.includes("LIMITED")) return "CURRENT_LIMITED";
  if (x.includes("DISCONTIN")) return "DISCONTINUED";
  if (x.includes("PREVIOUS")) return "PREVIOUS_GENERATION";
  if (x === "CURRENT_RETAIL" || x === "CURRENT") return "CURRENT";
  // bags agent used lowercase "current"
  if ((s || "").toLowerCase() === "current") return "CURRENT";
  return x || "CURRENT";
}

function normResearch(s: string) {
  const x = (s || "").trim().toLowerCase();
  if (x === "verified" || x === "confirmed") return "verified";
  if (x === "likely") return "likely";
  if (x === "needs_verify" || x === "needs-verify") return "needs_verify";
  return x || "needs_verify";
}

function dedupeKey(r: Record<string, string>) {
  const cat = (r.category || "").toLowerCase().trim();
  const brand = (r.brand || "").toLowerCase().trim();
  const model = (r.model || r.product || "").toLowerCase().trim();
  return `${cat}|${brand}|${model}`;
}

function slugify(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

const soft = padelAllProducts.filter((p) =>
  Object.values(CAT_IDS).includes(p.categoryId),
);
const byId = new Map(soft.map((p) => [p.id, p]));
const byFull = new Map(soft.map((p) => [p.fullName.toLowerCase(), p.id]));
const byName = new Map(soft.map((p) => [p.name.toLowerCase(), p.id]));

/** Base catalog IDs (exclude previous market-wave so regenerating wave does not drop itself). */
const baseDraftIds = new Set(
  [...ballDrafts(), ...bagDrafts(), ...gripDrafts(), ...accessoryDrafts()].map(
    (d) => d.id,
  ),
);
const previousWaveIds = new Set(marketWaveDrafts().map((d) => d.id));

function resolveCatalogId(r: Record<string, string>): {
  id: string;
  inBase: boolean;
} {
  const given = (r.kitletics_product_id || "").trim();
  const candidates = [
    given,
    byFull.get((r.product || "").toLowerCase()) || "",
    byName.get((r.model || "").toLowerCase()) || "",
    `prod-${slugify(`${r.brand}-${r.model}`)}`,
  ].filter(Boolean);

  for (const id of candidates) {
    if (!byId.has(id)) continue;
    if (baseDraftIds.has(id) || (byId.has(id) && !previousWaveIds.has(id))) {
      // Prefer base/seed products; seed products may not be in soft draft lists
      // (existing:true patches). Treat any non-wave catalog id as base.
      if (!previousWaveIds.has(id) || baseDraftIds.has(id)) {
        return { id, inBase: true };
      }
    }
    if (previousWaveIds.has(id)) {
      return { id, inBase: false };
    }
  }
  // seed products not in soft drafts
  for (const id of candidates) {
    if (byId.has(id) && !previousWaveIds.has(id)) return { id, inBase: true };
  }
  return { id: "", inBase: false };
}

const merged = new Map<string, Record<string, string>>();

for (const src of SOURCES) {
  let text: string;
  try {
    text = readFileSync(join(process.cwd(), src), "utf8");
  } catch {
    console.warn("skip missing", src);
    continue;
  }
  const rows = parseCsv(text);
  for (const raw of rows) {
    if (!raw.category || !raw.brand || !(raw.product || raw.model)) continue;
    // Drop placeholder "range" stubs
    if (/range$/i.test(raw.product || "") || /range$/i.test(raw.model || "")) continue;
    if ((raw.brand || "").toLowerCase() === "generic") continue;

    const row: Record<string, string> = {
      category: raw.category.toLowerCase().trim(),
      subcategory: raw.subcategory || "",
      brand: raw.brand.trim(),
      product: (raw.product || raw.model || "").trim(),
      model: (raw.model || raw.product || "").trim(),
      generation: raw.generation || "",
      gender: raw.gender || "unisex",
      variant: raw.variant || "",
      manufacturer_url: raw.manufacturer_url || "",
      manufacturer_status: raw.manufacturer_status || "current",
      retailer_urls: raw.retailer_urls || "",
      NL_available: raw.NL_available || "unknown",
      EU_available: raw.EU_available || "yes",
      current_status: normStatus(raw.current_status || "CURRENT"),
      existing_in_kitletics: "no",
      kitletics_product_id: "",
      evidence: raw.evidence || "",
      research_status: normResearch(raw.research_status || "needs_verify"),
      disposition: raw.disposition || "",
      disposition_reason: raw.disposition_reason || "",
    };

    if (!["balls", "bags", "grips", "accessories"].includes(row.category)) continue;

    const key = dedupeKey(row);
    const prev = merged.get(key);
    if (!prev) {
      merged.set(key, row);
      continue;
    }
    // Prefer verified + disposition terminal over needs_verify stubs
    const rank = (r: Record<string, string>) =>
      (r.disposition ? 5 : 0) +
      (r.research_status === "verified" ? 3 : r.research_status === "likely" ? 2 : 0) +
      (r.manufacturer_url ? 1 : 0) +
      (r.kitletics_product_id ? 1 : 0) +
      Math.min(2, Math.floor((r.evidence?.length || 0) / 80));
    if (rank(row) >= rank(prev)) {
      merged.set(key, {
        ...prev,
        ...row,
        evidence: row.evidence.length >= prev.evidence.length ? row.evidence : prev.evidence,
        manufacturer_url: row.manufacturer_url || prev.manufacturer_url,
        retailer_urls: row.retailer_urls || prev.retailer_urls,
        kitletics_product_id: row.kitletics_product_id || prev.kitletics_product_id,
        disposition: row.disposition || prev.disposition,
        disposition_reason: row.disposition_reason || prev.disposition_reason,
        research_status:
          prev.disposition && prev.research_status === "verified"
            ? prev.research_status
            : row.research_status,
      });
    } else if (prev.disposition && !row.disposition) {
      // keep terminal disposition
      merged.set(key, prev);
    }
  }
}

// Resolve catalog membership against base catalog (not market-wave alone).
for (const row of merged.values()) {
  const { id, inBase } = resolveCatalogId(row);
  if (id && inBase) {
    row.kitletics_product_id = id;
    row.existing_in_kitletics = "yes";
  } else if (id && !inBase) {
    // Already in previous market-wave — keep id for mapping, still importable/regenerable
    row.kitletics_product_id = id;
    row.existing_in_kitletics = "no";
  } else {
    row.existing_in_kitletics = "no";
    row.kitletics_product_id = "";
  }
}

const rows = [...merged.values()].sort((a, b) =>
  `${a.category}|${a.brand}|${a.product}`.localeCompare(
    `${b.category}|${b.brand}|${b.product}`,
  ),
);

const outPath = "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv";
writeFileSync(
  outPath,
  [HEADER.join(","), ...rows.map((r) => HEADER.map((h) => csvEscape(r[h] ?? "")).join(","))].join(
    "\n",
  ) + "\n",
);

const byCat: Record<string, { total: number; existing: number; current: number }> = {};
for (const r of rows) {
  byCat[r.category] ??= { total: 0, existing: 0, current: 0 };
  byCat[r.category].total++;
  if (r.existing_in_kitletics === "yes") byCat[r.category].existing++;
  if (r.current_status === "CURRENT" || r.current_status === "CURRENT_LIMITED")
    byCat[r.category].current++;
}

const missing = rows.filter(
  (r) =>
    r.existing_in_kitletics === "no" &&
    (r.current_status === "CURRENT" || r.current_status === "CURRENT_LIMITED") &&
    (r.research_status === "verified" || r.research_status === "likely"),
);

console.log(
  JSON.stringify(
    {
      total: rows.length,
      byCat,
      missingToImport: missing.length,
      sampleMissing: missing.slice(0, 25).map((r) => `${r.category}:${r.brand}:${r.product}`),
    },
    null,
    2,
  ),
);
