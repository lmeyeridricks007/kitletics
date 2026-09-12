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
  widthOptions: "width options",
  archSupport: "arch support",
  intendedJob: "intended job",
  skuSlug: "model",
  skuId: "model",
  batteryGps: "GPS battery",
  batteryLifeHours: "battery life",
  batteryLife: "battery life",
  displayType: "display",
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
  const overlay = CONSUMER_SPEC_LABELS[key];
  if (overlay) return titleCaseLabel(overlay);
  const fromDef = LABEL_BY_KEY.get(key);
  if (fromDef?.trim()) return fromDef.trim();
  return titleCaseLabel(humanizeCamelCase(key));
}

/** "heel stack 41.5" — never `heelStack 41.5`. */
export function formatPublicSpecCue(
  key: string,
  value: string | number | boolean,
): string {
  const label = formatPublicSpecKey(key);
  if (typeof value === "boolean") return value ? label : `${label} no`;
  return `${label} ${value}`;
}

export function isRawPublicSpecKey(text: string): boolean {
  return /\b(heelStack|forefootStack|cushionLevel|cushionFeel|rideCharacter|energyReturn|plateMaterial|widthOptions|archSupport|intendedJob|skuSlug|skuId)\b/.test(
    text,
  );
}
