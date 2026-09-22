/**
 * Consumer-facing labels for catalog specification keys.
 * Public HTML must never print raw camelCase schema names.
 */

import { allSpecificationDefinitions } from "@/content/specs/definitions";

/** Prefer spoken product language over schema names. */
const CONSUMER_SPEC_LABELS: Record<string, string> = {
  heelStack: "heel stack",
  forefootStack: "forefoot stack",
  stackHeight: "stack height",
  cushionLevel: "cushioning",
  cushionFeel: "cushion feel",
  rideCharacter: "ride character",
  energyReturn: "energy return",
  plateMaterial: "plate material",
  widthOptions: "available widths",
  weightMin: "minimum weight",
  weightMax: "maximum weight",
  archSupport: "arch support",
  intendedJob: "intended job",
  skuSlug: "model",
  skuId: "model",
  batteryGps: "GPS battery",
  batteryLifeHours: "battery life",
  batteryLife: "battery life",
  displayType: "display",
  balanceType: "balance",
  balance: "balance",
  surfaceMaterial: "face material",
  faceMaterial: "face material",
  frameMaterial: "frame",
  frame: "frame",
  coreType: "core",
  core: "core",
  playerLevel: "player level",
  playStyle: "play style",
  courtSurface: "court surface",
  shapeType: "shape",
  shape: "shape",
  sweetSpot: "sweet spot",
  powerScore: "power score",
  controlScore: "control score",
  maneuverabilityScore: "maneuverability score",
  comfortScore: "comfort score",
  // Padel soft goods — spoken labels (defs also supply display labels)
  ballType: "ball type",
  ballPositioning: "ball positioning",
  pressurization: "pressurization",
  packSize: "pack size",
  ballsPerCan: "balls per can",
  cansPerBox: "cans per box",
  feltMaterial: "felt",
  coreMaterial: "core",
  bounceSpec: "bounce spec",
  intendedConditions: "intended conditions",
  manufacturerPositioning: "manufacturer positioning",
  freshnessStatus: "market status",
  racketCompartments: "racket capacity",
  racketCapacity: "racket capacity",
  thermalCompartments: "thermal compartments",
  thermalProtection: "thermal protection",
  thermalRacketCompartment: "thermal racket compartment",
  shoeCompartment: "shoe storage",
  wetCompartment: "wet compartment",
  accessoryPockets: "accessory pockets",
  laptopCompartment: "laptop compartment",
  bottleStorage: "bottle storage",
  carryStyle: "carry style",
  carrySystem: "carry system",
  backpackStraps: "backpack straps",
  colorVariants: "color variants",
  waterResistance: "water resistance",
  gripType: "grip type",
  packQuantity: "pack size",
  perforated: "perforated",
  installationMethod: "installation method",
  handleThicknessEffect: "handle thickness effect",
  claimedBenefits: "manufacturer claims",
  capacityBalls: "ball capacity",
  pressureSystem: "pressure system",
  manualOrElectric: "manual or electric",
  pressureRange: "pressure range",
  powerSource: "power source",
  transparentOrColored: "finish",
  weightGrams: "weight",
  frame_tape: "frame tape",
  training_aid: "training aid",
  grip_system: "grip system",
  ball_basket: "ball basket",
  customization_weight: "customization weight",
  compatibility: "compatibility",
  capacity: "capacity",
  volume: "volume",
  dimensions: "dimensions",
  collection: "collection",
  materials: "materials",
  thickness: "thickness",
  tack: "tack",
  absorption: "absorption",
  form: "bag type",
  type: "type",
  generation: "generation",
  length: "length",
  finish: "finish",
  closure: "closure",
  genderFit: "fit",
  courtFeel: "court feel",
  lateralStability: "lateral stability",
  tractionPattern: "traction pattern",
  surfaceCompatibility: "surface compatibility",
  courtOutsole: "court outsole",
  // Accessory type enum values (stored under specifications.type)
  protector: "frame protector",
  pressurizer: "ball pressurizer",
  wristband: "wristband",
  sweatband: "sweatband",
  maintenance: "maintenance accessory",
  other: "accessory",
  training: "training aid",
  "apparel-accessory": "apparel accessory",
  accessory: "accessory",
};

const DISPLAY_LABEL_OVERRIDES: Record<string, string> = {
  widthOptions: "Available widths",
  weightMin: "Minimum weight",
  weightMax: "Maximum weight",
  frameMaterial: "Frame material",
  faceMaterial: "Face material",
  surfaceMaterial: "Face material",
  racketCapacity: "Racket capacity",
  racketCompartments: "Racket capacity",
  thermalCompartments: "Thermal compartments",
  thermalProtection: "Thermal protection",
  thermalRacketCompartment: "Thermal racket compartment",
  shoeCompartment: "Shoe compartment",
  wetCompartment: "Wet compartment",
  accessoryPockets: "Accessory pockets",
  laptopCompartment: "Laptop compartment",
  bottleStorage: "Bottle storage",
  carrySystem: "Carry system",
  backpackStraps: "Backpack straps",
  capacityBalls: "Ball capacity",
  pressureRange: "Pressure range",
  packQuantity: "Pack size",
  surfaceCompatibility: "Surface compatibility",
  courtOutsole: "Court outsole",
  gripType: "Grip type",
  ballType: "Ball type",
  genderFit: "Fit",
  courtFeel: "Court feel",
  lateralStability: "Lateral stability",
  tractionPattern: "Traction pattern",
};

const LABEL_BY_KEY = new Map<string, string>();
for (const def of allSpecificationDefinitions) {
  if (!LABEL_BY_KEY.has(def.key) && def.label?.trim()) {
    LABEL_BY_KEY.set(def.key, def.label.trim());
  }
}

function humanizeCamelCase(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function titleCaseLabel(label: string): string {
  return label.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Lowercase spoken label for running text ("heel stack", not "heelStack"). */
export function formatPublicSpecKey(key: string): string {
  const overlay = CONSUMER_SPEC_LABELS[key];
  if (overlay) return overlay;
  const fromDef = LABEL_BY_KEY.get(key);
  if (fromDef) return fromDef.toLowerCase();
  return humanizeCamelCase(key);
}

/** Spec-table / card label. Never the raw camelCase schema key. */
export function formatPublicSpecDisplayLabel(key: string): string {
  const displayOverride = DISPLAY_LABEL_OVERRIDES[key];
  if (displayOverride) return displayOverride;
  const overlay = CONSUMER_SPEC_LABELS[key];
  if (overlay) return titleCaseLabel(overlay);
  const fromDef = LABEL_BY_KEY.get(key);
  if (fromDef?.trim()) return fromDef.trim();
  return titleCaseLabel(humanizeCamelCase(key));
}

/** "heel stack 41.5" — never `heelStack 41.5` or `type customization_weight`. */
export function formatPublicSpecCue(
  key: string,
  value: string | number | boolean,
): string {
  const label = formatPublicSpecKey(key);
  if (typeof value === "boolean") return value ? label : `${label} no`;
  if (typeof value === "string") {
    return `${label} ${formatPublicSpecValueToken(value)}`;
  }
  return `${label} ${value}`;
}

/** Speak enum / schema tokens used as specification values. */
export function formatPublicSpecValueToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("_") || /^[a-z]+[A-Z]/.test(trimmed)) {
    return formatPublicSpecKey(trimmed);
  }
  if (trimmed.includes("-")) {
    return trimmed
      .split("-")
      .map((p) => p.toLowerCase())
      .join(" ");
  }
  return trimmed;
}

/**
 * Spoken noun for accessory `specifications.type` enum values in PDP prose.
 * Prefer shopper language over enum formatting alone.
 */
export function formatPublicAccessoryTypeNoun(type: string): string {
  const normalized = type.trim().toLowerCase().replace(/\s+/g, "_");
  const contextual: Record<string, string> = {
    customization_weight: "racket balance-adjustment accessory",
    protector: "frame-protection accessory",
    pressurizer: "ball-pressurizer accessory",
    frame_tape: "frame-tape accessory",
    training_aid: "training accessory",
    grip_system: "grip-system accessory",
    ball_basket: "ball-basket accessory",
    wristband: "wristband",
    sweatband: "sweatband",
    maintenance: "maintenance accessory",
    other: "padel accessory",
    accessory: "padel accessory",
    "apparel-accessory": "apparel accessory",
    training: "training accessory",
  };
  if (contextual[normalized]) return contextual[normalized];
  const spoken = formatPublicSpecKey(normalized);
  if (spoken === normalized) return "padel accessory";
  return /accessory$/i.test(spoken) ? spoken : `${spoken} accessory`;
}

/** Stable public row id for tables/React keys — never raw camelCase schema keys. */
export function publicSpecRowKey(key: string): string {
  // Facet / filter public key: genderFit → fit (matches catalog facet remap).
  if (key === "genderFit") return "fit";
  return formatPublicSpecKey(key).replace(/\s+/g, "-");
}

/**
 * Remap canonical specification object keys to public-safe keys for RSC/page
 * payloads. Values stay canonical (filter URLs / matching still use enum tokens).
 */
export function toPublicSpecifications(
  specs: Record<string, unknown> | undefined | null,
): Record<string, unknown> {
  if (!specs) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(specs)) {
    out[publicSpecRowKey(key)] = value;
  }
  return out;
}

/** Public filter / config key lists — never ship raw camelCase schema names. */
export function toPublicSpecKeyList(keys: string[]): string[] {
  return keys.map((k) => publicSpecRowKey(k));
}

/**
 * Canonical Kitletics catalog/editorial schema keys that must never appear as
 * public JSON object keys or shopper-facing copy.
 */
export const KITLETICS_INTERNAL_SCHEMA_KEYS = [
  "genderFit",
  "courtFeel",
  "cushionLevel",
  "cushionFeel",
  "weightMin",
  "weightMax",
  "heelStack",
  "forefootStack",
  "heelToToeDrop",
  "rideCharacter",
  "widthOptions",
  "customization_weight",
  "lateralStability",
  "tractionPattern",
  "surfaceCompatibility",
  "courtOutsole",
  "faceMaterial",
  "playerLevel",
  "surfaceTexture",
  "frame_tape",
  "grip_system",
  "training_aid",
  "ball_basket",
  "pressureSystem",
  "packQuantity",
] as const;

export type KitleticsInternalSchemaKey =
  (typeof KITLETICS_INTERNAL_SCHEMA_KEYS)[number];

const INTERNAL_SCHEMA_KEY_SET = new Set<string>(KITLETICS_INTERNAL_SCHEMA_KEYS);

const PUBLIC_TO_CANONICAL_SPEC_KEY: Record<string, string> = {};
for (const key of KITLETICS_INTERNAL_SCHEMA_KEYS) {
  PUBLIC_TO_CANONICAL_SPEC_KEY[publicSpecRowKey(key)] = key;
}

export function isInternalSchemaKey(key: string): boolean {
  return INTERNAL_SCHEMA_KEY_SET.has(key);
}

/** Map a public/alias spec key back to the canonical catalog field. */
export function resolveCanonicalSpecKey(key: string): string {
  if (INTERNAL_SCHEMA_KEY_SET.has(key)) return key;
  return PUBLIC_TO_CANONICAL_SPEC_KEY[key] ?? key;
}

export function readPublicSpecValue(
  specs: Record<string, unknown> | undefined | null,
  canonicalKey: string,
): unknown {
  if (!specs) return undefined;
  const publicKey = publicSpecRowKey(canonicalKey);
  if (publicKey in specs) return specs[publicKey];
  if (canonicalKey in specs) return specs[canonicalKey];
  return undefined;
}

/** True when a shopper-facing label still looks like a schema identifier. */
export function isMachinePublicLabel(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (INTERNAL_SCHEMA_KEY_SET.has(trimmed)) return true;
  const lower = trimmed.toLowerCase();
  for (const schemaKey of KITLETICS_INTERNAL_SCHEMA_KEYS) {
    if (lower.includes(schemaKey.toLowerCase())) return true;
  }
  if (/^[a-z]+(?:_[a-z0-9]+)+$/.test(trimmed)) return true;
  if (/^[a-z]+[A-Z][A-Za-z0-9]*$/.test(trimmed)) return true;
  return /[a-z][A-Z]/.test(trimmed) && isRawPublicSpecKey(trimmed);
}

/** Rewrite a criterion/filter label so it never prints camelCase or snake_case. */
export function toPublicCriterionLabel(label: string, key?: string): string {
  const trimmed = label.trim();
  if (!trimmed) return key ? formatPublicSpecDisplayLabel(key) : trimmed;
  if (!isMachinePublicLabel(trimmed) && !isRawPublicSpecKey(trimmed)) {
    return trimmed;
  }
  let out = trimmed;
  for (const schemaKey of KITLETICS_INTERNAL_SCHEMA_KEYS) {
    if (out.toLowerCase().includes(schemaKey.toLowerCase())) {
      out = out.replace(new RegExp(schemaKey, "gi"), formatPublicSpecDisplayLabel(schemaKey));
    }
  }
  if (!isMachinePublicLabel(out) && !isRawPublicSpecKey(out)) return out;
  if (key) return formatPublicSpecDisplayLabel(key);
  return titleCaseLabel(humanizeCamelCase(out));
}

export function isRawPublicSpecKey(text: string): boolean {
  // Detect known camelCase / snake schema keys only — never flag spoken English
  // labels, and never treat retailer URL path segments (large_default) as leaks.
  return /\b(?:heelStack|forefootStack|cushionLevel|cushionFeel|rideCharacter|energyReturn|plateMaterial|widthOptions|weightMin|weightMax|archSupport|intendedJob|skuSlug|skuId|shapeType|balanceType|coreType|frameMaterial|surfaceMaterial|faceMaterial|playerLevel|playStyle|courtSurface|sweetSpot|ballType|gripType|racketCapacity|racketCompartments|thermalCompartments|thermalProtection|thermalRacketCompartment|shoeCompartment|wetCompartment|accessoryPockets|laptopCompartment|bottleStorage|carryStyle|carrySystem|backpackStraps|packSize|ballsPerCan|cansPerBox|feltMaterial|coreMaterial|bounceSpec|freshnessStatus|officialApproval|manufacturerPositioning|surfaceCompatibility|courtOutsole|lateralStability|courtFeel|genderFit|capacityBalls|pressureSystem|manualOrElectric|pressureRange|powerSource|transparentOrColored|weightGrams|packQuantity|installationMethod|handleThicknessEffect|claimedBenefits|thicknessMm|surfaceTexture|faceCarbonWeave|manufacturerCoreName|tractionPattern|intendedConditions|waterResistance|customization_weight|frame_tape|grip_system|training_aid|ball_basket|curated_seed|[a-z][A-Za-z]*Score)\b/.test(
    text,
  );
}
