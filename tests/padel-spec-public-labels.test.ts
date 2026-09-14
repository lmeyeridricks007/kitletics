import { describe, expect, it } from "vitest";
import {
  formatPublicSpecDisplayLabel,
  formatPublicSpecKey,
  isRawPublicSpecKey,
} from "@/lib/specs/public-label";
import { PADEL_SPEC_PLANS } from "@/content/padel/spec-enrichment/required-fields";

/** All Padel-specific schema keys that must never leak as raw camelCase publicly. */
const PADEL_PUBLIC_SPEC_KEYS = [
  ...new Set(
    Object.values(PADEL_SPEC_PLANS).flatMap((plan) => [
      ...plan.required,
      ...plan.important,
      ...plan.optional,
      ...Object.values(plan.byType ?? {}).flatMap((t) => [
        ...(t.required ?? []),
        ...(t.important ?? []),
        ...(t.optional ?? []),
      ]),
    ]),
  ),
];

describe("Padel public spec labels", () => {
  it("formats every Padel plan field without leaking camelCase schema keys", () => {
    expect(PADEL_PUBLIC_SPEC_KEYS.length).toBeGreaterThan(40);
    for (const key of PADEL_PUBLIC_SPEC_KEYS) {
      const spoken = formatPublicSpecKey(key);
      const display = formatPublicSpecDisplayLabel(key);
      // CamelCase schema keys must never appear unchanged in public copy.
      if (/[A-Z]/.test(key) || key.includes("_")) {
        expect(spoken).not.toBe(key);
        expect(display).not.toBe(key);
      }
      expect(spoken).not.toMatch(/[A-Z]/);
      expect(isRawPublicSpecKey(spoken)).toBe(false);
      expect(isRawPublicSpecKey(display)).toBe(false);
      if (/[A-Z]/.test(key)) {
        expect(isRawPublicSpecKey(`check ${key} here`)).toBe(true);
      }
    }
  });

  it("uses Title Case display labels for key Padel soft-goods fields", () => {
    expect(formatPublicSpecDisplayLabel("weightMin")).toBe("Minimum weight");
    expect(formatPublicSpecDisplayLabel("frameMaterial")).toBe("Frame material");
    expect(formatPublicSpecDisplayLabel("racketCapacity")).toBe(
      "Racket capacity",
    );
    expect(formatPublicSpecDisplayLabel("thermalCompartments")).toBe(
      "Thermal compartments",
    );
    expect(formatPublicSpecDisplayLabel("shoeCompartment")).toBe(
      "Shoe compartment",
    );
    expect(formatPublicSpecDisplayLabel("surfaceCompatibility")).toBe(
      "Surface compatibility",
    );
  });
});
