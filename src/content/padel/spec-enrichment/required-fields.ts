/**
 * Required / important / optional spec fields for Padel enrichment completeness.
 * Terminal markers (NOT_PUBLISHED / NOT_APPLICABLE / UNKNOWN) satisfy required slots.
 */

export type SpecFieldTier = "required" | "important" | "optional";

export interface CategorySpecPlan {
  categoryId: string;
  required: string[];
  important: string[];
  optional: string[];
  /** Extra required by accessory `type` or grip subtype */
  byType?: Record<string, { required?: string[]; important?: string[]; optional?: string[] }>;
}

export const PADEL_SPEC_PLANS: Record<string, CategorySpecPlan> = {
  "cat-padel-rackets": {
    categoryId: "cat-padel-rackets",
    required: ["shape", "balance", "weightMin"],
    important: [
      "weightMax",
      "thicknessMm",
      "core",
      "faceMaterial",
      "frameMaterial",
      "surfaceTexture",
      "playerLevel",
    ],
    optional: [
      "sweetSpot",
      "feel",
      "face",
      "faceCarbonWeave",
      "manufacturerCoreName",
      "manufacturerPositioning",
      "technologies",
      "length",
      "finish",
    ],
  },
  "cat-padel-shoes": {
    categoryId: "cat-padel-shoes",
    required: ["surfaceCompatibility"],
    important: [
      "courtOutsole",
      "outsole",
      "lateralStability",
      "cushioning",
      "support",
      "genderFit",
    ],
    optional: [
      "tractionPattern",
      "courtFeel",
      "durability",
      "weight",
      "upper",
      "fit",
      "width",
      "closure",
      "generation",
    ],
  },
  "cat-padel-balls": {
    categoryId: "cat-padel-balls",
    required: ["ballType", "use", "pressurization", "packSize", "freshnessStatus"],
    important: ["speed", "ballsPerCan", "officialApproval", "durability"],
    optional: [
      "feltMaterial",
      "coreMaterial",
      "diameter",
      "weight",
      "bounceSpec",
      "intendedConditions",
      "manufacturerPositioning",
      "generation",
      "cansPerBox",
    ],
  },
  "cat-padel-bags": {
    categoryId: "cat-padel-bags",
    required: ["form"],
    important: [
      "racketCapacity",
      "capacity",
      "thermalProtection",
      "shoeCompartment",
      "carryStyle",
    ],
    optional: [
      "dimensions",
      "volume",
      "thermalRacketCompartment",
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
    ],
  },
  "cat-padel-grips": {
    categoryId: "cat-padel-grips",
    required: ["gripType"],
    important: ["thickness", "tack", "absorption", "perforated", "material"],
    optional: [
      "packQuantity",
      "length",
      "width",
      "weight",
      "texture",
      "feel",
      "colors",
      "installationMethod",
      "handleThicknessEffect",
      "claimedBenefits",
      "compatibility",
    ],
  },
  "cat-padel-accessories": {
    categoryId: "cat-padel-accessories",
    required: ["type"],
    important: ["compatibility"],
    optional: ["weightGrams", "materials", "generation"],
    byType: {
      pressurizer: {
        required: ["type", "capacityBalls", "manualOrElectric"],
        important: ["pressureSystem", "pressureRange", "powerSource", "compatibility"],
      },
      protector: {
        required: ["type"],
        important: ["transparentOrColored", "materials", "compatibility", "weightGrams"],
      },
      customization_weight: {
        required: ["type"],
        important: ["weightGrams", "compatibility"],
      },
      training_aid: {
        required: ["type"],
        important: ["compatibility"],
      },
      ball_basket: {
        required: ["type"],
        important: ["capacityBalls", "compatibility"],
      },
      grip_system: {
        required: ["type"],
        important: ["compatibility", "installationMethod"],
      },
      wristband: {
        required: ["type"],
        important: ["compatibility"],
      },
      frame_tape: {
        required: ["type"],
        important: ["compatibility"],
      },
      other: {
        required: ["type"],
        important: ["compatibility"],
      },
    },
  },
};

export function resolveSpecPlan(
  categoryId: string,
  specs: Record<string, unknown>,
): { required: string[]; important: string[]; optional: string[] } {
  const plan = PADEL_SPEC_PLANS[categoryId];
  if (!plan) {
    return { required: [], important: [], optional: [] };
  }
  const typeKey =
    categoryId === "cat-padel-accessories"
      ? String(specs.type ?? "other")
      : categoryId === "cat-padel-grips"
        ? String(specs.gripType ?? "")
        : "";
  const typed = plan.byType?.[typeKey] ?? plan.byType?.other;
  if (!typed) {
    return {
      required: plan.required,
      important: plan.important,
      optional: plan.optional,
    };
  }
  return {
    required: typed.required ?? plan.required,
    important: [...new Set([...(typed.important ?? []), ...plan.important])],
    optional: [...new Set([...(typed.optional ?? []), ...plan.optional])],
  };
}
