import type { Product, SpecValue } from "@/domain/products/types";

type SpecFill = Record<string, SpecValue>;

/**
 * Catalog spec backfill for P2 coverage.
 * Only fills keys that are currently null/undefined on the product —
 * never overwrites verified seed values.
 *
 * Shoe geometry/weight: men's US 9 / EU 42.5 manufacturer or lab-typical values.
 * Fitness dimensions: manufacturer published footprint / capacity where available.
 */
export const PRODUCT_SPEC_FILL: Record<string, SpecFill> = {
  // ── Running shoes ────────────────────────────────────────────────────────
  "prod-novablast-4": {
    weight: 255,
    heelStack: 41,
    forefootStack: 33,
    upper: "Engineered woven mesh",
    midsole: "FF BLAST+",
    outsole: "AHAR / ASICSGRIP",
  },
  "prod-nimbus-27": { weight: 305, heelStack: 43.5, forefootStack: 35.5 },
  "prod-pegasus-41": {
    weight: 280,
    heelStack: 37,
    forefootStack: 27,
    upper: "Engineered mesh",
    midsole: "ReactX + Air Zoom",
    outsole: "Waffle rubber",
  },
  "prod-ghost-16": { weight: 278, heelStack: 36, forefootStack: 24 },
  "prod-clifton-9": {
    weight: 248,
    heelStack: 29,
    forefootStack: 24,
    upper: "Engineered mesh",
    midsole: "CMEV",
    outsole: "Rubber",
  },
  "prod-endorphin-speed-4": {
    weight: 227,
    heelStack: 36,
    forefootStack: 28,
    upper: "Engineered mesh",
    midsole: "PWRRUN PB + nylon plate",
    outsole: "XT-900",
  },
  "prod-rebel-4": { weight: 199, heelStack: 30, forefootStack: 24 },
  "prod-boston-12": { weight: 215, heelStack: 39.5, forefootStack: 31.5 },
  "prod-superblast-2": { weight: 250, heelStack: 45.5, forefootStack: 37.5 },
  "prod-kayano-32": { weight: 303, heelStack: 40, forefootStack: 30 },
  "prod-cumulus-27": { weight: 280, heelStack: 39, forefootStack: 31 },
  "prod-metaspeed-sky-paris": { weight: 183, heelStack: 39, forefootStack: 34 },
  "prod-gt-2000-14": { weight: 275, heelStack: 37, forefootStack: 29 },
  "prod-pegasus-42": { weight: 275, heelStack: 37, forefootStack: 27 },
  "prod-vomero-18": { weight: 288, heelStack: 40, forefootStack: 30 },
  "prod-invincible-3": { weight: 308, heelStack: 40, forefootStack: 32 },
  "prod-vaporfly-4": { weight: 170, heelStack: 40, forefootStack: 32 },
  "prod-alphafly-3": { weight: 210, heelStack: 40, forefootStack: 32 },
  "prod-structure-26": { weight: 295, heelStack: 37, forefootStack: 27 },
  "prod-structure-plus": { weight: 300, heelStack: 38, forefootStack: 28 },
  "prod-ghost-18": { weight: 272, heelStack: 36, forefootStack: 24 },
  "prod-glycerin-22": { weight: 289, heelStack: 38, forefootStack: 28 },
  "prod-glycerin-21": { weight: 283, heelStack: 38, forefootStack: 28 },
  "prod-adrenaline-gts-25": { weight: 283, heelStack: 36, forefootStack: 24 },
  "prod-hyperion-max-2": { weight: 224, heelStack: 36, forefootStack: 28 },
  "prod-clifton-10": { weight: 250, heelStack: 37, forefootStack: 32 },
  "prod-bondi-9": { weight: 307, heelStack: 42, forefootStack: 37 },
  "prod-bondi-8": { weight: 307, heelStack: 39.5, forefootStack: 35.5 },
  "prod-mach-6": { weight: 228, heelStack: 34, forefootStack: 29 },
  "prod-speedgoat-6": { weight: 290, heelStack: 37, forefootStack: 32 },
  "prod-clifton-pro": { weight: 265, heelStack: 35, forefootStack: 30 },
  "prod-endorphin-speed-5": { weight: 227, heelStack: 36, forefootStack: 28 },
  "prod-endorphin-pro-4": { weight: 204, heelStack: 39, forefootStack: 31 },
  "prod-endorphin-pro-3": {
    weight: 207,
    heelStack: 39,
    forefootStack: 31,
    upper: "Engineered mesh",
    midsole: "PWRRUN PB + carbon plate",
    outsole: "XT-900",
  },
  "prod-ride-18": { weight: 261, heelStack: 35, forefootStack: 27 },
  "prod-triumph-22": { weight: 269, heelStack: 39, forefootStack: 29 },
  "prod-peregrine-15": { weight: 275, heelStack: 31, forefootStack: 27 },
  "prod-1080-v14": { weight: 278, heelStack: 38, forefootStack: 32 },
  "prod-1080-v13": { weight: 280, heelStack: 38, forefootStack: 32 },
  "prod-sc-elite-v4": { weight: 198, heelStack: 40, forefootStack: 32 },
  "prod-rebel-v5": { weight: 200, heelStack: 30, forefootStack: 24 },
  "prod-sc-trainer-v3": { weight: 252, heelStack: 40, forefootStack: 34 },
  "prod-adios-pro-4": { weight: 199, heelStack: 39, forefootStack: 33 },
  "prod-cloudmonster-2": { weight: 275, heelStack: 36, forefootStack: 30 },
  "prod-cloudsurfer-next": { weight: 240, heelStack: 37, forefootStack: 31 },
  "prod-torin-8": { weight: 278, heelStack: 28, forefootStack: 28 },
  "prod-escalante-4": { weight: 238, heelStack: 23, forefootStack: 23 },
  "prod-lone-peak-8": { weight: 289, heelStack: 25, forefootStack: 25 },
  "prod-aero-glide-2": { weight: 270, heelStack: 39, forefootStack: 31 },
  "prod-sense-ride-5": { weight: 295, heelStack: 32, forefootStack: 24 },
  "prod-pulsar-trail-2": { weight: 270, heelStack: 33, forefootStack: 27 },
  "prod-specter-2": { weight: 227, heelStack: 31, forefootStack: 26 },
  "prod-phantom-3": { weight: 258, heelStack: 33, forefootStack: 28 },
  "prod-deviate-nitro-3": { weight: 234, heelStack: 38, forefootStack: 30 },
  "prod-magnify-nitro-2": { weight: 275, heelStack: 38, forefootStack: 28 },
  "prod-wave-rider-28": { weight: 270, heelStack: 36, forefootStack: 24 },
  "prod-trailfly-ultra-g-300-max": { weight: 300, heelStack: 36, forefootStack: 30 },

  // Pre-launch 04 — niche / prior-gen shoes (men's US 9 typical published values)
  "prod-adizero-boston-13": {
    weight: 215,
    heelStack: 39,
    forefootStack: 33,
    drop: 6,
    upper: "Engineered mesh",
    midsole: "Lightstrike Pro + Energy Rods 2.0",
    outsole: "Continental rubber",
  },
  "prod-terrex-agravic-3": {
    weight: 310,
    heelStack: 32,
    forefootStack: 24,
    drop: 8,
    upper: "Engineered mesh with overlays",
    midsole: "Lightstrike",
    outsole: "Continental Contagrip",
  },
  "prod-ultraboost-5": {
    weight: 310,
    heelStack: 32,
    forefootStack: 22,
    drop: 10,
    upper: "Primeknit+",
    midsole: "BOOST",
    outsole: "Continental rubber",
  },
  "prod-experience-flow": {
    weight: 255,
    heelStack: 28,
    forefootStack: 24,
    drop: 4,
    upper: "Engineered mesh",
    midsole: "Altra EGO",
    outsole: "Rubber",
  },
  "prod-paradigm-7": {
    weight: 292,
    heelStack: 30,
    forefootStack: 30,
    drop: 0,
    upper: "Engineered mesh",
    midsole: "Altra EGO MAX",
    outsole: "FootShape rubber",
  },
  "prod-trabuco-13": {
    weight: 295,
    heelStack: 33,
    forefootStack: 25,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "FF BLAST+",
    outsole: "ASICSGRIP",
  },
  "prod-gt-1000-13": {
    weight: 285,
    heelStack: 36,
    forefootStack: 28,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "FF BLAST + DuoMax",
    outsole: "AHAR",
  },
  "prod-cascadia-18": {
    weight: 295,
    heelStack: 32,
    forefootStack: 24,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "DNA Loft v3",
    outsole: "TrailTack Green",
  },
  "prod-glycerin-gts-22": {
    weight: 292,
    heelStack: 38,
    forefootStack: 28,
    drop: 10,
    upper: "Engineered mesh",
    midsole: "DNA Loft v3 + GuideRails",
    outsole: "Blown rubber",
  },
  "prod-arahi-7": {
    weight: 275,
    heelStack: 35,
    forefootStack: 30,
    drop: 5,
    upper: "Engineered mesh",
    midsole: "CMEV + J-Frame",
    outsole: "Rubber",
  },
  "prod-gaviota-5": {
    weight: 303,
    heelStack: 38,
    forefootStack: 33,
    drop: 5,
    upper: "Engineered mesh",
    midsole: "CMEV + Hoka meta-rocker + J-Frame",
    outsole: "Rubber",
  },
  "prod-860-v14": {
    weight: 303,
    heelStack: 36,
    forefootStack: 28,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "Fresh Foam X + medial support",
    outsole: "Blown rubber",
  },
  "prod-hierro-v9": {
    weight: 315,
    heelStack: 33,
    forefootStack: 25,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "Fresh Foam X",
    outsole: "Vibram Megagrip",
  },
  "prod-pegasus-trail-5": {
    weight: 295,
    heelStack: 35,
    forefootStack: 25,
    drop: 10,
    upper: "Engineered mesh",
    midsole: "ReactX",
    outsole: "Aggressive trail rubber",
  },
  "prod-react-infinity-4": {
    weight: 295,
    heelStack: 36,
    forefootStack: 27,
    drop: 9,
    upper: "Flyknit / engineered mesh",
    midsole: "ReactX",
    outsole: "Rubber",
  },
  "prod-cloudmonster-hyper": {
    weight: 260,
    heelStack: 37,
    forefootStack: 31,
    drop: 6,
    upper: "Engineered mesh",
    midsole: "Helion superfoam CloudTec",
    outsole: "Missiongrip",
  },
  "prod-cloudsurfer-2": {
    weight: 255,
    heelStack: 37,
    forefootStack: 29,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "CloudTec Phase + Helion",
    outsole: "Rubber",
  },
  "prod-genesis-salomon": {
    weight: 280,
    heelStack: 32,
    forefootStack: 24,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "Energy Surge",
    outsole: "Contagrip",
  },
  "prod-ultra-glide-2": {
    weight: 275,
    heelStack: 36,
    forefootStack: 30,
    drop: 6,
    upper: "Engineered mesh",
    midsole: "Energy Surge",
    outsole: "Contagrip",
  },
  "prod-guide-18": {
    weight: 275,
    heelStack: 36,
    forefootStack: 28,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "PWRRUN + medial guidance",
    outsole: "XT-900",
  },
  "prod-xodus-ultra-3": {
    weight: 300,
    heelStack: 35,
    forefootStack: 27,
    drop: 8,
    upper: "Engineered mesh",
    midsole: "PWRRUN + rock plate",
    outsole: "PWRTRAC",
  },
  "prod-terraventure-4": {
    weight: 295,
    heelStack: 29,
    forefootStack: 24,
    drop: 5,
    upper: "Engineered mesh",
    midsole: "ZipFoam",
    outsole: "Vibram Megagrip",
  },

  // ── Power racks ──────────────────────────────────────────────────────────
  "prod-rogue-rml-390f": { weightCapacity: 454 },
  "prod-rep-pr-4000": {
    heightMm: 2311,
    widthMm: 1219,
    depthMm: 1245,
    weightCapacity: 454,
    uprightSize: "3x3",
    holeSpacing: "westside",
  },
  "prod-mirafit-m3": {
    heightMm: 2150,
    widthMm: 1200,
    depthMm: 1350,
    weightCapacity: 350,
    uprightSize: "2x2",
    holeSpacing: "standard",
  },
  "prod-rogue-rm-4": {
    heightMm: 2311,
    widthMm: 1219,
    depthMm: 1549,
    weightCapacity: 454,
    uprightSize: "3x3",
    holeSpacing: "westside",
  },
  "prod-rep-pr-5000": {
    heightMm: 2413,
    widthMm: 1219,
    depthMm: 1245,
    weightCapacity: 454,
    uprightSize: "3x3",
    holeSpacing: "westside",
  },
  "prod-mirafit-m4": {
    heightMm: 2250,
    widthMm: 1250,
    depthMm: 1500,
    weightCapacity: 400,
    uprightSize: "2x3",
    holeSpacing: "standard",
  },
  "prod-rogue-sm-2c": {
    heightMm: 2286,
    widthMm: 1219,
    depthMm: 1219,
    weightCapacity: 318,
    uprightSize: "3x3",
    holeSpacing: "westside",
  },
  "prod-rep-apollo": {
    heightMm: 2159,
    widthMm: 1219,
    depthMm: 1118,
    weightCapacity: 318,
    uprightSize: "2x3",
    holeSpacing: "hybrid",
  },

  // ── Benches ──────────────────────────────────────────────────────────────
  "prod-rogue-adjustable-bench-3": {
    benchType: "fid",
    weightCapacity: 454,
    widthMm: 305,
    depthMm: 1397,
    foldable: false,
    adjustable: true,
  },
  "prod-rep-ab-5000": {
    benchType: "adjustable",
    weightCapacity: 454,
    widthMm: 305,
    depthMm: 1422,
    foldable: false,
    adjustable: true,
  },
  "prod-mirafit-fid-bench": {
    benchType: "fid",
    weightCapacity: 300,
    widthMm: 280,
    depthMm: 1350,
    foldable: false,
    adjustable: true,
  },
  "prod-rep-fb-5000": {
    benchType: "flat",
    weightCapacity: 454,
    widthMm: 305,
    depthMm: 1321,
    foldable: false,
    adjustable: false,
  },
  "prod-rogue-flat-utility": {
    benchType: "utility",
    weightCapacity: 454,
    widthMm: 305,
    depthMm: 1219,
    foldable: false,
    adjustable: false,
  },

  // ── Rowers ───────────────────────────────────────────────────────────────
  "prod-concept2-rowerg": {
    maxUserWeight: 227,
    dimensions: "2440 × 610 mm footprint",
  },
  "prod-concept2-rowerg-dynamic": {
    maxUserWeight: 227,
    dimensions: "2150 × 610 mm footprint",
  },
  "prod-mirafit-rower": {
    maxUserWeight: 150,
    dimensions: "2100 × 550 mm footprint",
  },
  "prod-mirafit-folding-rower": {
    maxUserWeight: 120,
    dimensions: "Folds upright for storage",
  },

  // ── Air bikes ────────────────────────────────────────────────────────────
  "prod-assault-classic": {
    maxUserWeight: 159,
    widthMm: 686,
    depthMm: 1295,
  },
  "prod-rogue-echo-bike": {
    maxUserWeight: 159,
    widthMm: 737,
    depthMm: 1321,
  },
  "prod-assault-elite": {
    maxUserWeight: 159,
    widthMm: 686,
    depthMm: 1295,
  },

  // ── Treadmills ───────────────────────────────────────────────────────────
  "prod-assault-runner": {
    maxUserWeight: 159,
    widthMm: 838,
    depthMm: 1778,
  },
  "prod-mirafit-treadmill": {
    maxUserWeight: 120,
    maxSpeedKph: 16,
    widthMm: 780,
    depthMm: 1600,
  },
  "prod-assault-runner-elite": {
    maxUserWeight: 159,
    widthMm: 838,
    depthMm: 1778,
  },

  // ── SkiErgs ──────────────────────────────────────────────────────────────
  "prod-concept2-skierg": {
    maxUserWeight: 227,
    widthMm: 610,
    depthMm: 1320,
  },
  "prod-concept2-skierg-stand": {
    maxUserWeight: 227,
    widthMm: 610,
    depthMm: 1320,
  },
  "prod-xebex-skierg": { maxUserWeight: 150 },
  "prod-concept2-skierg-pm5-bundle": { maxUserWeight: 227 },
  "prod-skierg2-wall": { maxUserWeight: 150 },
};

/** Categories that should expose Gender filters sitewide. */
const GENDER_FIT_CATEGORIES = new Set([
  "cat-running-shoes",
  "cat-padel-shoes",
  "cat-tennis-shoes",
  "cat-training-shoes",
  "cat-running-clothing",
]);

/** Merge fill values onto products without clobbering existing non-null specs. */
export function applyProductSpecFill(products: Product[]): Product[] {
  return products.map((product) => {
    const fill = PRODUCT_SPEC_FILL[product.id];
    const specifications = { ...product.specifications };
    let changed = false;

    if (fill) {
      for (const [key, value] of Object.entries(fill)) {
        if (value === undefined) continue;
        if (specifications[key] == null) {
          specifications[key] = value;
          changed = true;
        }
      }
    }

    if (
      GENDER_FIT_CATEGORIES.has(product.categoryId) &&
      product.categoryId !== "cat-running-shoes" &&
      specifications.genderFit == null
    ) {
      // Running shoes get audience variants applied separately — do not invent unisex.
      specifications.genderFit = "unisex";
      changed = true;
    }

    return changed ? { ...product, specifications } : product;
  });
}
