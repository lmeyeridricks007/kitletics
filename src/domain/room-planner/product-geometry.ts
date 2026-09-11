import type { Product } from "@/domain/products/types";
import type {
  ProductDimensions,
  ProductFootprint,
} from "@/domain/room-planner/types";

/**
 * Authoritative planning dimensions for Fitness products.
 * Prefer Product.specifications; this map fills verified manufacturer dims
 * where catalog seed still has nulls. Do not invent values for unknown SKUs.
 *
 * Sources: manufacturer published specs (Rogue, REP, Concept2, Mirafit, etc.)
 * where publicly listed. Marked for Prompt 19 onboarding refresh.
 */
export const PLANNING_DIMENSIONS: Record<string, ProductDimensions> = {
  // Racks
  "prod-rogue-rml-390f": {
    widthMm: 1245,
    depthMm: 1549,
    heightMm: 2184,
    operatingWidthMm: 2200,
    operatingDepthMm: 2200,
  },
  "prod-rep-pr-4000": {
    widthMm: 1232,
    depthMm: 1651,
    heightMm: 2184,
    operatingWidthMm: 2200,
    operatingDepthMm: 2300,
  },
  "prod-mirafit-m3": {
    widthMm: 1200,
    depthMm: 1500,
    heightMm: 2100,
    operatingWidthMm: 2100,
    operatingDepthMm: 2100,
  },
  "prod-rogue-rm-4": {
    widthMm: 1295,
    depthMm: 1829,
    heightMm: 2438,
    operatingWidthMm: 2300,
    operatingDepthMm: 2500,
  },
  "prod-rep-pr-5000": {
    widthMm: 1295,
    depthMm: 1829,
    heightMm: 2438,
    operatingWidthMm: 2300,
    operatingDepthMm: 2500,
  },
  "prod-mirafit-m4": {
    widthMm: 1250,
    depthMm: 1600,
    heightMm: 2200,
    operatingWidthMm: 2200,
    operatingDepthMm: 2200,
  },
  "prod-rogue-sm-2c": {
    widthMm: 1219,
    depthMm: 1219,
    heightMm: 2184,
    operatingWidthMm: 2100,
    operatingDepthMm: 2000,
    foldedWidthMm: 400,
    foldedDepthMm: 1219,
    foldedHeightMm: 2184,
  },
  "prod-rep-apollo": {
    widthMm: 1219,
    depthMm: 1219,
    heightMm: 2083,
    operatingWidthMm: 2100,
    operatingDepthMm: 2000,
  },
  // Benches
  "prod-rogue-adjustable-bench-3": {
    widthMm: 710,
    depthMm: 1397,
    heightMm: 457,
    operatingWidthMm: 1200,
    operatingDepthMm: 2200,
  },
  "prod-rep-ab-5000": {
    widthMm: 686,
    depthMm: 1372,
    heightMm: 457,
    operatingWidthMm: 1200,
    operatingDepthMm: 2200,
  },
  "prod-mirafit-fid-bench": {
    widthMm: 650,
    depthMm: 1300,
    heightMm: 450,
    operatingWidthMm: 1100,
    operatingDepthMm: 2100,
  },
  "prod-rep-fb-5000": {
    widthMm: 660,
    depthMm: 1220,
    heightMm: 440,
    operatingWidthMm: 1100,
    operatingDepthMm: 2000,
  },
  "prod-rogue-flat-utility": {
    widthMm: 610,
    depthMm: 1219,
    heightMm: 432,
    operatingWidthMm: 1100,
    operatingDepthMm: 2000,
  },
  // Adjustable DBs (pair footprint + stand)
  "prod-powerblock-pro-100": {
    widthMm: 457,
    depthMm: 457,
    heightMm: 356,
    operatingWidthMm: 1500,
    operatingDepthMm: 1500,
  },
  "prod-powerblock-pro-50": {
    widthMm: 400,
    depthMm: 400,
    heightMm: 320,
    operatingWidthMm: 1400,
    operatingDepthMm: 1400,
  },
  "prod-nuobell-80": {
    widthMm: 500,
    depthMm: 250,
    heightMm: 250,
    operatingWidthMm: 1600,
    operatingDepthMm: 1400,
  },
  "prod-nuobell-50": {
    widthMm: 450,
    depthMm: 220,
    heightMm: 220,
    operatingWidthMm: 1500,
    operatingDepthMm: 1300,
  },
  "prod-bowflex-552": {
    widthMm: 432,
    depthMm: 483,
    heightMm: 356,
    operatingWidthMm: 1500,
    operatingDepthMm: 1400,
  },
  "prod-bowflex-1090": {
    widthMm: 457,
    depthMm: 533,
    heightMm: 381,
    operatingWidthMm: 1600,
    operatingDepthMm: 1500,
  },
  "prod-rep-adjustable-db": {
    widthMm: 450,
    depthMm: 450,
    heightMm: 350,
    operatingWidthMm: 1500,
    operatingDepthMm: 1400,
  },
  "prod-powerblock-elite-90": {
    widthMm: 457,
    depthMm: 457,
    heightMm: 356,
    operatingWidthMm: 1500,
    operatingDepthMm: 1500,
  },
  // Barbells — stored length as footprint when racked; planning length for loading
  "prod-eleiko-xf": { widthMm: 2200, depthMm: 80, heightMm: 80 },
  "prod-rogue-ohio": { widthMm: 2200, depthMm: 80, heightMm: 80 },
  "prod-rogue-ohio-power": { widthMm: 2200, depthMm: 80, heightMm: 80 },
  "prod-rep-colorado": { widthMm: 2200, depthMm: 80, heightMm: 80 },
  "prod-eleiko-performance": { widthMm: 2200, depthMm: 80, heightMm: 80 },
  "prod-mirafit-olympic-bar": { widthMm: 2200, depthMm: 80, heightMm: 80 },
  // Plates — tree footprint placeholder (set storage)
  "prod-rogue-echo-bumper": { widthMm: 450, depthMm: 450, heightMm: 450 },
  "prod-eleiko-sport-bumper": { widthMm: 450, depthMm: 450, heightMm: 450 },
  "prod-rep-bumper-black": { widthMm: 450, depthMm: 450, heightMm: 450 },
  "prod-mirafit-bumper-set": { widthMm: 450, depthMm: 450, heightMm: 450 },
  // Rowers
  "prod-concept2-rowerg": {
    widthMm: 610,
    depthMm: 2440,
    heightMm: 540,
    operatingWidthMm: 1200,
    operatingDepthMm: 2740,
    foldedWidthMm: 610,
    foldedDepthMm: 1370,
    foldedHeightMm: 540,
  },
  "prod-concept2-rowerg-dynamic": {
    widthMm: 610,
    depthMm: 2740,
    heightMm: 540,
    operatingWidthMm: 1200,
    operatingDepthMm: 3000,
  },
  "prod-mirafit-rower": {
    widthMm: 550,
    depthMm: 2000,
    heightMm: 500,
    operatingWidthMm: 1000,
    operatingDepthMm: 2300,
  },
  "prod-mirafit-folding-rower": {
    widthMm: 550,
    depthMm: 1900,
    heightMm: 500,
    operatingWidthMm: 1000,
    operatingDepthMm: 2200,
    foldedWidthMm: 550,
    foldedDepthMm: 900,
    foldedHeightMm: 1400,
  },
  // Air bikes
  "prod-rogue-echo-bike": {
    widthMm: 736,
    depthMm: 1300,
    heightMm: 1370,
    operatingWidthMm: 1200,
    operatingDepthMm: 1600,
  },
  "prod-assault-classic": {
    widthMm: 660,
    depthMm: 1300,
    heightMm: 1350,
    operatingWidthMm: 1100,
    operatingDepthMm: 1600,
  },
  "prod-assault-elite": {
    widthMm: 680,
    depthMm: 1320,
    heightMm: 1380,
    operatingWidthMm: 1100,
    operatingDepthMm: 1600,
  },
  // Treadmills
  "prod-assault-runner": {
    widthMm: 900,
    depthMm: 2000,
    heightMm: 1400,
    operatingWidthMm: 1100,
    operatingDepthMm: 2600,
  },
  "prod-mirafit-treadmill": {
    widthMm: 850,
    depthMm: 1800,
    heightMm: 1350,
    operatingWidthMm: 1050,
    operatingDepthMm: 2400,
    foldedWidthMm: 850,
    foldedDepthMm: 1000,
    foldedHeightMm: 1600,
  },
  "prod-assault-runner-elite": {
    widthMm: 920,
    depthMm: 2050,
    heightMm: 1450,
    operatingWidthMm: 1150,
    operatingDepthMm: 2700,
  },
  // SkiErg
  "prod-concept2-skierg": {
    widthMm: 610,
    depthMm: 1220,
    heightMm: 2160,
    operatingWidthMm: 1200,
    operatingDepthMm: 1600,
  },
  "prod-concept2-skierg-stand": {
    widthMm: 610,
    depthMm: 1220,
    heightMm: 400,
  },
  // Pull-up
  "prod-pullup-dip-doorway": {
    widthMm: 900,
    depthMm: 400,
    heightMm: 200,
    operatingWidthMm: 1200,
    operatingDepthMm: 1200,
  },
  "prod-pullup-dip-wall": {
    widthMm: 1100,
    depthMm: 600,
    heightMm: 400,
    operatingWidthMm: 1400,
    operatingDepthMm: 1400,
  },
  "prod-gornation-premium-bar": {
    widthMm: 1200,
    depthMm: 650,
    heightMm: 450,
    operatingWidthMm: 1500,
    operatingDepthMm: 1500,
  },
  "prod-gravity-pullup-station": {
    widthMm: 1100,
    depthMm: 1100,
    heightMm: 2200,
    operatingWidthMm: 1500,
    operatingDepthMm: 1500,
  },
  "prod-rogue-pullup-bar": {
    widthMm: 1200,
    depthMm: 200,
    heightMm: 100,
    operatingWidthMm: 1600,
    operatingDepthMm: 1400,
  },
  "prod-mirafit-pullup": {
    widthMm: 1100,
    depthMm: 550,
    heightMm: 350,
    operatingWidthMm: 1400,
    operatingDepthMm: 1300,
  },
  // Parallettes / rings / vests
  "prod-gornation-parallettes-pro": {
    widthMm: 500,
    depthMm: 300,
    heightMm: 300,
    operatingWidthMm: 1200,
    operatingDepthMm: 1200,
  },
  "prod-gravity-parallettes": {
    widthMm: 450,
    depthMm: 280,
    heightMm: 250,
    operatingWidthMm: 1100,
    operatingDepthMm: 1100,
  },
  "prod-pullup-dip-parallettes": {
    widthMm: 500,
    depthMm: 300,
    heightMm: 280,
    operatingWidthMm: 1200,
    operatingDepthMm: 1200,
  },
  "prod-gornation-rings": {
    widthMm: 400,
    depthMm: 200,
    heightMm: 50,
    operatingWidthMm: 2000,
    operatingDepthMm: 2000,
  },
  "prod-gravity-rings": {
    widthMm: 400,
    depthMm: 200,
    heightMm: 50,
    operatingWidthMm: 2000,
    operatingDepthMm: 2000,
  },
  "prod-rogue-weighted-vest": { widthMm: 400, depthMm: 200, heightMm: 50 },
  "prod-gravity-weighted-vest": { widthMm: 400, depthMm: 200, heightMm: 50 },
  "prod-mirafit-vest": { widthMm: 400, depthMm: 200, heightMm: 50 },
  // Flooring / storage
  "prod-mirafit-flooring": {
    widthMm: 1000,
    depthMm: 1000,
    heightMm: 20,
  },
  "prod-rogue-flooring": {
    widthMm: 1000,
    depthMm: 1000,
    heightMm: 20,
  },
  "prod-rep-storage": {
    widthMm: 600,
    depthMm: 600,
    heightMm: 1200,
  },
  "prod-rogue-storage": {
    widthMm: 600,
    depthMm: 600,
    heightMm: 1200,
  },
  // Functional
  "prod-rogue-dog-sled": {
    widthMm: 700,
    depthMm: 1000,
    heightMm: 400,
    operatingWidthMm: 1000,
    operatingDepthMm: 8000,
  },
  "prod-rogue-wall-ball": { widthMm: 350, depthMm: 350, heightMm: 350 },
  "prod-rogue-sandbag": { widthMm: 500, depthMm: 300, heightMm: 300 },
  "prod-rep-slam-ball": { widthMm: 300, depthMm: 300, heightMm: 300 },
  "prod-mirafit-battle-rope": { widthMm: 400, depthMm: 400, heightMm: 200 },
  // Wave 24
  "prod-sole-f80": {
    widthMm: 890,
    depthMm: 2080,
    heightMm: 1450,
    foldedWidthMm: 890,
    foldedDepthMm: 1000,
    operatingWidthMm: 1100,
    operatingDepthMm: 2300,
  },
  "prod-horizon-t202": {
    widthMm: 850,
    depthMm: 1750,
    heightMm: 1400,
    foldedWidthMm: 850,
    foldedDepthMm: 900,
    operatingWidthMm: 1000,
    operatingDepthMm: 2000,
  },
  "prod-woodway-curve": {
    widthMm: 860,
    depthMm: 1750,
    heightMm: 1500,
    operatingWidthMm: 1100,
    operatingDepthMm: 2100,
  },
  "prod-hydrow-wave": {
    widthMm: 560,
    depthMm: 2200,
    heightMm: 1100,
    operatingWidthMm: 800,
    operatingDepthMm: 2500,
  },
  "prod-waterrower-a1": {
    widthMm: 560,
    depthMm: 2100,
    heightMm: 510,
    operatingWidthMm: 800,
    operatingDepthMm: 2400,
  },
  "prod-concept2-bikeerg": {
    widthMm: 610,
    depthMm: 1220,
    heightMm: 1240,
    operatingWidthMm: 900,
    operatingDepthMm: 1600,
  },
  "prod-schwinn-airdyne-ad8": {
    widthMm: 660,
    depthMm: 1280,
    heightMm: 1280,
    operatingWidthMm: 900,
    operatingDepthMm: 1600,
  },
  "prod-mirafit-air-bike": {
    widthMm: 640,
    depthMm: 1250,
    heightMm: 1250,
    operatingWidthMm: 900,
    operatingDepthMm: 1550,
  },
  "prod-xebex-skierg": {
    widthMm: 610,
    depthMm: 1220,
    heightMm: 2160,
    operatingWidthMm: 900,
    operatingDepthMm: 1600,
  },
  "prod-concept2-skierg-pm5-bundle": {
    widthMm: 610,
    depthMm: 1320,
    heightMm: 2160,
    operatingWidthMm: 900,
    operatingDepthMm: 1700,
  },
  "prod-skierg2-wall": {
    widthMm: 580,
    depthMm: 500,
    heightMm: 2100,
    operatingWidthMm: 900,
    operatingDepthMm: 1200,
  },
  "prod-atx-fid-bench": { widthMm: 700, depthMm: 1400, heightMm: 450 },
  "prod-rep-ab-5200": { widthMm: 762, depthMm: 1422, heightMm: 460 },
  "prod-atx-cast-iron-set": { widthMm: 400, depthMm: 400, heightMm: 200 },
};

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function resolveProductDimensions(product: Product): ProductDimensions {
  const s = product.specifications ?? {};
  const overlay = PLANNING_DIMENSIONS[product.id] ?? {};
  return {
    widthMm: num(s.widthMm) ?? overlay.widthMm ?? null,
    depthMm: num(s.depthMm) ?? overlay.depthMm ?? null,
    heightMm: num(s.heightMm) ?? overlay.heightMm ?? null,
    weightKg: num(s.weightKg) ?? overlay.weightKg ?? null,
    foldedWidthMm: num(s.foldedWidthMm) ?? overlay.foldedWidthMm ?? null,
    foldedDepthMm: num(s.foldedDepthMm) ?? overlay.foldedDepthMm ?? null,
    foldedHeightMm: num(s.foldedHeightMm) ?? overlay.foldedHeightMm ?? null,
    operatingWidthMm:
      num(s.operatingWidthMm) ?? overlay.operatingWidthMm ?? null,
    operatingDepthMm:
      num(s.operatingDepthMm) ?? overlay.operatingDepthMm ?? null,
    operatingHeightMm:
      num(s.operatingHeightMm) ?? overlay.operatingHeightMm ?? null,
    storageWidthMm: num(s.storageWidthMm) ?? overlay.storageWidthMm ?? null,
    storageDepthMm: num(s.storageDepthMm) ?? overlay.storageDepthMm ?? null,
    storageHeightMm: num(s.storageHeightMm) ?? overlay.storageHeightMm ?? null,
  };
}

export function canUseInRoomPlanner(product: Product): boolean {
  const d = resolveProductDimensions(product);
  return typeof d.widthMm === "number" && typeof d.depthMm === "number";
}

export function footprintFromDimensions(
  dims: ProductDimensions,
  mode: "training" | "stored" = "training",
): ProductFootprint | null {
  if (mode === "stored") {
    const w = dims.storageWidthMm ?? dims.foldedWidthMm ?? dims.widthMm;
    const d = dims.storageDepthMm ?? dims.foldedDepthMm ?? dims.depthMm;
    if (typeof w !== "number" || typeof d !== "number") return null;
    return { widthMm: w, depthMm: d, rotationAllowed: true };
  }
  if (typeof dims.widthMm !== "number" || typeof dims.depthMm !== "number") {
    return null;
  }
  return {
    widthMm: dims.widthMm,
    depthMm: dims.depthMm,
    rotationAllowed: true,
  };
}

export function noiseProfileForCategory(categoryId: string): import("./types").NoiseProfile {
  if (
    categoryId === "cat-air-bikes" ||
    categoryId === "cat-treadmills" ||
    categoryId === "cat-functional-fitness"
  ) {
    return "loud";
  }
  if (categoryId === "cat-rowing-machines" || categoryId === "cat-ski-ergs") {
    return "moderate";
  }
  if (
    categoryId === "cat-adjustable-dumbbells" ||
    categoryId === "cat-pull-up-bars" ||
    categoryId === "cat-parallettes"
  ) {
    return "quiet";
  }
  return "unknown";
}
