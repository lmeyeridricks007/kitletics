import type { Product } from "@/domain/products/types";
import type { Evidence } from "@/domain/recommendations/types";
import { SEED_DATES } from "@/content/config";

const padel = "sport-padel" as const;
const tennis = "sport-tennis" as const;

type Surface =
  | "padel-specific"
  | "tennis-padel-crossover"
  | "unknown";

type Outsole = "padel" | "herringbone" | "omni" | "other" | "unknown";
type Lateral = "low" | "moderate" | "high" | "unknown";
type Feel = "connected" | "moderate" | "plush" | "unknown";
type Dur = "low" | "moderate" | "high" | "unknown";

/** Visual review: registered hero is not that shoe (racket, bag, apparel, or other brand). */
export const padelShoeWrongImageIds = new Set([
  "prod-bullpadel-hack-hybrid",
  "prod-tecnifibre-t-fight-padel",
  "prod-varlion-bourne-padel-shoe",
  "prod-nox-at10-pro-shoe",
  "prod-oxdog-hyper-court",
  "prod-lok-padel-one",
  "prod-siux-comodo-woman",
  "prod-wilson-bela-pro-padel",
]);

/** Identity hold — no verified shoe SKU/packshot yet. */
const unverifiedDraftIds = new Set([
  "prod-siux-diablo-pro",
  "prod-starvie-absolute-padel",
  "prod-kuikma-ps-560-women",
  "prod-adidas-solecourt-boost-padel",
  "prod-head-revolt-court",
]);

const crossoverIds = new Set([
  "prod-asics-gel-challenger-court",
  "prod-head-revolt-pro-court",
  "prod-wilson-rush-pro-5-padel",
  "prod-asics-gel-dedicate-8-padel",
  "prod-asics-game-ff-padel",
  "prod-adidas-solecourt-boost-padel",
  "prod-head-revolt-court",
]);

/** Manufacturer / specialist PDPs for surfaceCompatibility research (2026-09-13). */
const SHOE_EVIDENCE_URLS: Record<string, string> = {
  "prod-nox-at10-pro-shoe":
    "https://noxsport.com/en/products/calzado-at10-pro-white-grey",
  "prod-bullpadel-hack-hybrid":
    "https://www.zonadepadel.com/bullpadel/6665-sneakers-bullpadel-hack-hybrid-fly-22v-white-khaki.html",
  "prod-adidas-solecourt-boost-padel":
    "https://www.streetpadel.com/adidas-solecourt-boost-negro-rojo-mujer-g26297-p-21363.html",
};

type ShoeRow = {
  id: string;
  surface: Surface;
  courtOutsole: Outsole;
  tractionPattern?: string;
  lateralStability: Lateral;
  courtFeel: Feel;
  durability: Dur;
  upper?: string;
};

const ROWS: ShoeRow[] = [
  { id: "prod-adidas-courtstabil", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Adidas court rubber", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-asics-gel-resolution-padel", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "AHARPLUS", lateralStability: "high", courtFeel: "plush", durability: "high", upper: "synthetic overlay mesh" },
  { id: "prod-asics-gel-challenger-court", surface: "tennis-padel-crossover", courtOutsole: "herringbone", tractionPattern: "AHAR court", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-babolat-jet-premura", surface: "padel-specific", courtOutsole: "padel", tractionPattern: "Michelin padel", lateralStability: "high", courtFeel: "connected", durability: "high", upper: "mesh" },
  { id: "prod-joma-t-slam", surface: "padel-specific", courtOutsole: "other", tractionPattern: "DURABILITY rubber", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-head-revolt-pro-court", surface: "tennis-padel-crossover", courtOutsole: "herringbone", tractionPattern: "Hybrasion", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "ribbed mesh" },
  { id: "prod-adidas-crazyquick-boost-m", surface: "padel-specific", courtOutsole: "omni", tractionPattern: "Adidas padel court", lateralStability: "high", courtFeel: "plush", durability: "high", upper: "mesh" },
  { id: "prod-adidas-courtquick-w", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Adidas court rubber", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-adidas-crazyquick-boost-w", surface: "padel-specific", courtOutsole: "omni", tractionPattern: "Adidas padel court", lateralStability: "high", courtFeel: "plush", durability: "high", upper: "mesh" },
  { id: "prod-asics-gel-dedicate-8-padel", surface: "tennis-padel-crossover", courtOutsole: "herringbone", tractionPattern: "AHAR", lateralStability: "moderate", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-asics-game-ff-padel", surface: "tennis-padel-crossover", courtOutsole: "herringbone", tractionPattern: "AHAR", lateralStability: "moderate", courtFeel: "connected", durability: "moderate", upper: "mesh" },
  { id: "prod-asics-solution-swift-ff2-padel", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "AHAR", lateralStability: "moderate", courtFeel: "connected", durability: "moderate", upper: "mesh" },
  { id: "prod-bullpadel-hybrid-fly", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Bullpadel court", lateralStability: "moderate", courtFeel: "connected", durability: "moderate", upper: "mesh" },
  { id: "prod-bullpadel-ionic-woman", surface: "padel-specific", courtOutsole: "padel", tractionPattern: "Hybrid Bottom", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "knit mesh" },
  { id: "prod-nox-at10-lux", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Nox court rubber", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-nox-ml10-hexa", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Nox HEXA court", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-babolat-movea-2", surface: "padel-specific", courtOutsole: "padel", tractionPattern: "Michelin", lateralStability: "moderate", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-babolat-sensa-women", surface: "padel-specific", courtOutsole: "padel", tractionPattern: "Michelin", lateralStability: "moderate", courtFeel: "moderate", durability: "moderate", upper: "knit" },
  { id: "prod-joma-slam-lady", surface: "padel-specific", courtOutsole: "other", tractionPattern: "DURABILITY rubber", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-joma-spin-men", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Joma padel", lateralStability: "moderate", courtFeel: "connected", durability: "moderate", upper: "mesh" },
  { id: "prod-head-sprint-pro-4-padel", surface: "padel-specific", courtOutsole: "omni", tractionPattern: "Hybrasion+", lateralStability: "moderate", courtFeel: "connected", durability: "moderate", upper: "mesh" },
  { id: "prod-wilson-rush-pro-5-padel", surface: "tennis-padel-crossover", courtOutsole: "omni", tractionPattern: "Endofoot / Speedplate", lateralStability: "high", courtFeel: "connected", durability: "high", upper: "synthetic mesh" },
  // Still UNKNOWN — no manufacturer padel PDP verified for this SKU identity
  { id: "prod-siux-diablo-pro", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-siux-comodo-woman", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-starvie-absolute-padel", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-kuikma-ps-990", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Kuikma court rubber", lateralStability: "moderate", courtFeel: "moderate", durability: "moderate", upper: "mesh" },
  // Kuikma PS line is Decathlon padel footwear; PS 560 women kept conservative — family evidence only points at PS Pro line
  { id: "prod-kuikma-ps-560-women", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-oxdog-hyper-court", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-asics-gel-resolution-padel-w", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "AHARPLUS", lateralStability: "high", courtFeel: "plush", durability: "high", upper: "synthetic overlay mesh" },
  { id: "prod-asics-solution-swift-padel-w", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "AHAR", lateralStability: "moderate", courtFeel: "connected", durability: "moderate", upper: "mesh" },
  // Specialist padel retailer lists Solecourt Boost as zapatillas de pádel
  { id: "prod-adidas-solecourt-boost-padel", surface: "tennis-padel-crossover", courtOutsole: "herringbone", tractionPattern: "Adiwear court", lateralStability: "high", courtFeel: "plush", durability: "high", upper: "mesh" },
  // HEAD Revolt Court — tennis court last commonly sold into padel; no padel-specific mould claim verified
  { id: "prod-head-revolt-court", surface: "tennis-padel-crossover", courtOutsole: "herringbone", tractionPattern: "Hybrasion", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "mesh" },
  { id: "prod-wilson-bela-pro-padel", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-joma-spin-lady", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Joma padel", lateralStability: "moderate", courtFeel: "connected", durability: "moderate", upper: "mesh" },
  { id: "prod-bullpadel-hack-hybrid", surface: "padel-specific", courtOutsole: "other", tractionPattern: "Hybrid clay / ROTOX", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "tricot mesh" },
  { id: "prod-nox-at10-pro-shoe", surface: "padel-specific", courtOutsole: "herringbone", tractionPattern: "Nox AGG grip", lateralStability: "high", courtFeel: "moderate", durability: "high", upper: "grid TPU mesh" },
  { id: "prod-babolat-jet-premura-2-men", surface: "padel-specific", courtOutsole: "padel", tractionPattern: "Michelin", lateralStability: "high", courtFeel: "connected", durability: "high", upper: "mesh" },
  { id: "prod-tecnifibre-t-fight-padel", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-varlion-bourne-padel-shoe", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
  { id: "prod-lok-padel-one", surface: "unknown", courtOutsole: "unknown", lateralStability: "unknown", courtFeel: "unknown", durability: "unknown" },
];

function toSpecs(row: ShoeRow): Product["specifications"] {
  return {
    surfaceCompatibility: row.surface,
    courtOutsole: row.courtOutsole,
    ...(row.tractionPattern ? { tractionPattern: row.tractionPattern } : {}),
    lateralStability: row.lateralStability,
    courtFeel: row.courtFeel,
    durability: row.durability,
    ...(row.upper ? { upper: row.upper } : {}),
  };
}

export const padelShoeCatalogPatches: Record<string, Partial<Product>> = {};

for (const row of ROWS) {
  const draft =
    padelShoeWrongImageIds.has(row.id) || unverifiedDraftIds.has(row.id);
  const patch: Partial<Product> = {
    sportIds: crossoverIds.has(row.id) ? [padel, tennis] : [padel],
    specifications: toSpecs(row),
    evidenceIds: [`ev-${row.id}-editorial`],
    ...(draft ? { status: "draft" as const } : {}),
  };
  padelShoeCatalogPatches[row.id] = patch;
}

padelShoeCatalogPatches["prod-bullpadel-hybrid-fly"] = {
  ...padelShoeCatalogPatches["prod-bullpadel-hybrid-fly"],
  name: "Fastgear",
  fullName: "Bullpadel Fastgear",
  shortDescription:
    "Bullpadel Fastgear padel court shoe — the packshot shows the Fastgear last. Catalog ID stays prod-bullpadel-hybrid-fly so existing review URLs do not break.",
};

export const padelShoeCatalogEvidence: Evidence[] = ROWS.map((row) => {
  const sourceUrl = SHOE_EVIDENCE_URLS[row.id];
  const wrong = padelShoeWrongImageIds.has(row.id);
  const unverified = unverifiedDraftIds.has(row.id);
  return {
    id: `ev-${row.id}-editorial`,
    type: (sourceUrl ? "manufacturer" : "editorial-research") as Evidence["type"],
    source: sourceUrl
      ? `Manufacturer / specialist PDP for ${row.id}`
      : "Kitletics padel court-shoe research",
    sourceUrl,
    summary: wrong
      ? `Identity/media hold for ${row.id}: registered hero may not match this shoe. SurfaceCompatibility set only when manufacturer padel positioning is evidenced.`
      : unverified && row.surface === "unknown"
        ? `SurfaceCompatibility remains UNKNOWN — no manufacturer padel positioning verified for ${row.id}.`
        : `Court-shoe classification for ${row.id} from manufacturer/specialist padel positioning. Not a wear test.`,
    verifiedAt: SEED_DATES.verified,
    confidence:
      wrong || row.surface === "unknown" ? "low" : sourceUrl ? "high" : "medium",
  };
});
