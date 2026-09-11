import type { ReviewAgentCategoryConfig } from "@/domain/review-agent/types";
import { getReviewPageCategoryConfig } from "@/lib/review/category-config";

type PartialCfg = Omit<
  ReviewAgentCategoryConfig,
  "categoryId" | "reviewRecommended"
> & { reviewRecommended?: boolean };

function cfg(
  categoryId: string,
  partial: PartialCfg,
): ReviewAgentCategoryConfig {
  return {
    categoryId,
    reviewRecommended: partial.reviewRecommended ?? true,
    criteria: partial.criteria,
    sectionTypes: partial.sectionTypes,
    requiredEvidenceTypes: partial.requiredEvidenceTypes,
    minIndependentSources: partial.minIndependentSources,
  };
}

const VALUE = { key: "value", label: "Value" };

const BY_ID: Record<string, ReviewAgentCategoryConfig> = {
  "cat-running-shoes": cfg("cat-running-shoes", {
    criteria: [
      { key: "comfort", label: "Comfort" },
      { key: "cushioning", label: "Cushioning" },
      { key: "ride", label: "Ride" },
      { key: "responsiveness", label: "Responsiveness" },
      { key: "stability", label: "Stability" },
      { key: "fit", label: "Fit" },
      { key: "upper", label: "Upper" },
      { key: "grip", label: "Grip" },
      { key: "durability", label: "Durability" },
      { key: "versatility", label: "Versatility" },
      VALUE,
    ],
    sectionTypes: [
      "fit",
      "cushioning",
      "ride",
      "stability",
      "upper",
      "grip",
      "durability",
      "value",
    ],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-gps-watches": cfg("cat-gps-watches", {
    criteria: [
      { key: "design", label: "Design & Comfort" },
      { key: "display", label: "Display & Readability" },
      { key: "gps-accuracy", label: "GPS Accuracy" },
      { key: "battery", label: "Battery" },
      { key: "sensors", label: "Sensors" },
      { key: "training-features", label: "Training Analytics" },
      { key: "recovery-features", label: "Recovery" },
      { key: "navigation", label: "Navigation & Mapping" },
      { key: "ecosystem", label: "Ecosystem" },
      { key: "ease-of-use", label: "Ease of Use" },
      { key: "smartwatch-features", label: "Smart Features" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: [
      "gps",
      "battery",
      "training",
      "navigation",
      "sensors",
      "interface",
      "ecosystem",
      "recovery",
      "value",
    ],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-hrm": cfg("cat-hrm", {
    criteria: [
      { key: "accuracy", label: "Accuracy" },
      { key: "connection-stability", label: "Connection Stability" },
      { key: "comfort", label: "Comfort" },
      { key: "battery", label: "Battery" },
      { key: "device-compatibility", label: "Device Compatibility" },
      { key: "running-dynamics", label: "Running Dynamics" },
      { key: "standalone", label: "Standalone Capability" },
      { key: "maintenance", label: "Ease of Maintenance" },
      { key: "versatility", label: "Versatility" },
      VALUE,
    ],
    sectionTypes: [
      "accuracy",
      "comfort",
      "connectivity",
      "battery",
      "setup",
      "compatibility",
      "training",
      "value",
    ],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-packs-vests": cfg("cat-packs-vests", {
    criteria: [
      { key: "fit", label: "Fit" },
      { key: "bounce", label: "Bounce" },
      { key: "storage", label: "Storage" },
      { key: "access", label: "Access" },
      { key: "hydration", label: "Hydration" },
      { key: "breathability", label: "Breathability" },
      { key: "weight", label: "Weight" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["fit", "storage", "hydration", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-headphones": cfg("cat-headphones", {
    criteria: [
      { key: "sound", label: "Sound" },
      { key: "fit", label: "Secure Fit" },
      { key: "stability", label: "Stability on the run" },
      { key: "battery", label: "Battery" },
      { key: "controls", label: "Controls" },
      { key: "weather", label: "Weather Resistance" },
      { key: "awareness", label: "Situational Awareness" },
      VALUE,
    ],
    sectionTypes: ["fit", "sound", "awareness", "battery", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-padel-rackets": cfg("cat-padel-rackets", {
    criteria: [
      { key: "control", label: "Control" },
      { key: "power", label: "Power" },
      { key: "maneuverability", label: "Maneuverability" },
      { key: "forgiveness", label: "Forgiveness" },
      { key: "spin", label: "Spin" },
      { key: "comfort", label: "Comfort" },
      { key: "construction", label: "Construction" },
      VALUE,
    ],
    sectionTypes: ["play", "construction", "comfort", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-tennis-rackets": cfg("cat-tennis-rackets", {
    criteria: [
      { key: "control", label: "Control" },
      { key: "power", label: "Power" },
      { key: "spin", label: "Spin" },
      { key: "comfort", label: "Comfort" },
      { key: "maneuverability", label: "Maneuverability" },
      VALUE,
    ],
    sectionTypes: ["play", "construction", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-pickleball-paddles": cfg("cat-pickleball-paddles", {
    criteria: [
      { key: "control", label: "Control" },
      { key: "power", label: "Power" },
      { key: "spin", label: "Spin" },
      { key: "forgiveness", label: "Forgiveness" },
      { key: "comfort", label: "Comfort" },
      VALUE,
    ],
    sectionTypes: ["play", "construction", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-badminton-rackets": cfg("cat-badminton-rackets", {
    criteria: [
      { key: "power", label: "Power" },
      { key: "control", label: "Control" },
      { key: "maneuverability", label: "Maneuverability" },
      { key: "comfort", label: "Comfort" },
      VALUE,
    ],
    sectionTypes: ["play", "construction", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-squash-rackets": cfg("cat-squash-rackets", {
    criteria: [
      { key: "power", label: "Power" },
      { key: "control", label: "Control" },
      { key: "maneuverability", label: "Maneuverability" },
      { key: "comfort", label: "Comfort" },
      VALUE,
    ],
    sectionTypes: ["play", "construction", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-training-shoes": cfg("cat-training-shoes", {
    criteria: [
      { key: "stability", label: "Stability" },
      { key: "grip", label: "Grip" },
      { key: "comfort", label: "Comfort" },
      { key: "durability", label: "Durability" },
      { key: "versatility", label: "Versatility" },
      VALUE,
    ],
    sectionTypes: ["fit", "stability", "grip", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-tennis-shoes": cfg("cat-tennis-shoes", {
    criteria: [
      { key: "stability", label: "Stability" },
      { key: "grip", label: "Grip" },
      { key: "comfort", label: "Comfort" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["fit", "grip", "durability", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-padel-shoes": cfg("cat-padel-shoes", {
    criteria: [
      { key: "stability", label: "Stability" },
      { key: "grip", label: "Grip" },
      { key: "comfort", label: "Comfort" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["fit", "grip", "durability", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-power-racks": cfg("cat-power-racks", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "stability", label: "Stability" },
      { key: "space", label: "Space Efficiency" },
      { key: "compatibility", label: "Compatibility" },
      { key: "expandability", label: "Expandability" },
      VALUE,
    ],
    sectionTypes: ["construction", "setup", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-adjustable-dumbbells": cfg("cat-adjustable-dumbbells", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "adjustability", label: "Adjustability" },
      { key: "range", label: "Weight Range" },
      { key: "space", label: "Space Efficiency" },
      { key: "experience", label: "Training Experience" },
      VALUE,
    ],
    sectionTypes: ["construction", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-weight-benches": cfg("cat-weight-benches", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "stability", label: "Stability" },
      { key: "adjustability", label: "Adjustability" },
      { key: "comfort", label: "Comfort" },
      VALUE,
    ],
    sectionTypes: ["construction", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-barbells": cfg("cat-barbells", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "spin", label: "Sleeve Spin" },
      { key: "knurl", label: "Knurl" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["construction", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-weight-plates": cfg("cat-weight-plates", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "durability", label: "Durability" },
      { key: "compatibility", label: "Compatibility" },
      VALUE,
    ],
    sectionTypes: ["construction", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-kettlebells": cfg("cat-kettlebells", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "handle", label: "Handle Feel" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["construction", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-rowing-machines": cfg("cat-rowing-machines", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "feel", label: "Stroke Feel" },
      { key: "noise", label: "Noise" },
      { key: "space", label: "Space / Storage" },
      { key: "connectivity", label: "Connectivity" },
      VALUE,
    ],
    sectionTypes: ["performance", "setup", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-air-bikes": cfg("cat-air-bikes", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "feel", label: "Training Feel" },
      { key: "noise", label: "Noise" },
      { key: "space", label: "Space" },
      VALUE,
    ],
    sectionTypes: ["performance", "setup", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-treadmills": cfg("cat-treadmills", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "deck", label: "Deck / Cushioning" },
      { key: "motor", label: "Motor" },
      { key: "noise", label: "Noise" },
      { key: "space", label: "Space / Fold" },
      VALUE,
    ],
    sectionTypes: ["performance", "setup", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-ski-ergs": cfg("cat-ski-ergs", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "feel", label: "Pull Feel" },
      { key: "space", label: "Space" },
      { key: "connectivity", label: "Connectivity" },
      VALUE,
    ],
    sectionTypes: ["performance", "setup", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-pull-up-bars": cfg("cat-pull-up-bars", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "stability", label: "Stability" },
      { key: "install", label: "Installation" },
      { key: "versatility", label: "Versatility" },
      VALUE,
    ],
    sectionTypes: ["construction", "setup", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-parallettes": cfg("cat-parallettes", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "stability", label: "Stability" },
      { key: "comfort", label: "Comfort" },
      VALUE,
    ],
    sectionTypes: ["construction", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-gymnastic-rings": cfg("cat-gymnastic-rings", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "grip", label: "Grip" },
      { key: "adjustability", label: "Adjustability" },
      VALUE,
    ],
    sectionTypes: ["construction", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-weighted-vests": cfg("cat-weighted-vests", {
    criteria: [
      { key: "fit", label: "Fit" },
      { key: "comfort", label: "Comfort" },
      { key: "adjustability", label: "Adjustability" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["fit", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-functional-fitness": cfg("cat-functional-fitness", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "versatility", label: "Versatility" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["construction", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-recovery-gear": cfg("cat-recovery-gear", {
    criteria: [
      { key: "practical-use", label: "Practical Use" },
      { key: "comfort", label: "Comfort" },
      { key: "portability", label: "Portability" },
      { key: "evidence", label: "Evidence Honesty" },
      { key: "tradeoffs", label: "Trade-offs" },
      VALUE,
    ],
    sectionTypes: ["what-it-does", "evidence", "practical-use", "comfort", "portability", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-running-clothing": cfg("cat-running-clothing", {
    criteria: [
      { key: "fit", label: "Fit" },
      { key: "breathability", label: "Breathability" },
      { key: "comfort", label: "Comfort" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["fit", "fabric", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-running-socks": cfg("cat-running-socks", {
    criteria: [
      { key: "fit", label: "Fit" },
      { key: "cushioning", label: "Cushioning" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["fit", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
    reviewRecommended: true,
  }),
  "cat-running-belts": cfg("cat-running-belts", {
    criteria: [
      { key: "fit", label: "Fit" },
      { key: "bounce", label: "Bounce" },
      { key: "storage", label: "Storage" },
      { key: "access", label: "Access" },
      VALUE,
    ],
    sectionTypes: ["fit", "storage", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-hydration": cfg("cat-hydration", {
    criteria: [
      { key: "capacity", label: "Capacity" },
      { key: "access", label: "Access" },
      { key: "leak", label: "Seal / Leak Resistance" },
      { key: "carry", label: "Carry Comfort" },
      VALUE,
    ],
    sectionTypes: ["use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-sunglasses": cfg("cat-sunglasses", {
    criteria: [
      { key: "fit", label: "Fit & Face Coverage" },
      { key: "coverage", label: "Peripheral Coverage" },
      { key: "optics", label: "Optics / Lens Clarity" },
      { key: "stability", label: "No-Slip Stability" },
      { key: "ventilation", label: "Ventilation" },
      { key: "versatility", label: "Light Versatility" },
      VALUE,
    ],
    sectionTypes: ["fit", "optics", "stability", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-running-lights": cfg("cat-running-lights", {
    criteria: [
      { key: "brightness", label: "Brightness" },
      { key: "beam", label: "Beam Pattern & Distance" },
      { key: "battery", label: "Runtime / Battery" },
      { key: "comfort", label: "Bounce & Comfort" },
      { key: "controls", label: "Modes & Lockout" },
      { key: "weather", label: "Weather Resistance" },
      VALUE,
    ],
    sectionTypes: ["beam", "runtime", "comfort", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-lifting-accessories": cfg("cat-lifting-accessories", {
    criteria: [
      { key: "build", label: "Build Quality" },
      { key: "comfort", label: "Comfort" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
  "cat-accessories": cfg("cat-accessories", {
    criteria: [VALUE],
    sectionTypes: ["overview", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
  "cat-safety": cfg("cat-safety", {
    criteria: [
      { key: "visibility", label: "Visibility" },
      { key: "comfort", label: "Comfort on the run" },
      { key: "battery", label: "Battery / Runtime" },
      { key: "weather", label: "Weather Resistance" },
      { key: "usability", label: "Ease of Use" },
      VALUE,
    ],
    sectionTypes: ["visibility", "comfort", "use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
  }),
  "cat-nutrition": cfg("cat-nutrition", {
    criteria: [
      { key: "format", label: "Format & Carry" },
      { key: "carbs", label: "Carbohydrate Delivery" },
      { key: "caffeine", label: "Caffeine Preference" },
      { key: "texture", label: "Taste / Texture Practicality" },
      { key: "race-use", label: "Practical Race Use" },
      VALUE,
    ],
    sectionTypes: ["format", "carbs", "caffeine", "carry", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 1,
  }),
  "cat-gym-flooring": cfg("cat-gym-flooring", {
    criteria: [
      { key: "protection", label: "Floor Protection" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["construction", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
  "cat-gym-storage": cfg("cat-gym-storage", {
    criteria: [
      { key: "capacity", label: "Capacity" },
      { key: "build", label: "Build" },
      VALUE,
    ],
    sectionTypes: ["use", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
  "cat-tennis-strings": cfg("cat-tennis-strings", {
    criteria: [
      { key: "feel", label: "Feel" },
      { key: "durability", label: "Durability" },
      { key: "spin", label: "Spin" },
      VALUE,
    ],
    sectionTypes: ["play", "value"],
    requiredEvidenceTypes: ["manufacturer", "editorial-research"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
  "cat-padel-balls": cfg("cat-padel-balls", {
    criteria: [VALUE],
    sectionTypes: ["overview"],
    requiredEvidenceTypes: ["manufacturer"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
  "cat-padel-grips": cfg("cat-padel-grips", {
    criteria: [
      { key: "feel", label: "Feel" },
      { key: "durability", label: "Durability" },
      VALUE,
    ],
    sectionTypes: ["use", "value"],
    requiredEvidenceTypes: ["manufacturer"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
  "cat-padel-bags": cfg("cat-padel-bags", {
    criteria: [
      { key: "capacity", label: "Capacity" },
      { key: "protection", label: "Protection" },
      VALUE,
    ],
    sectionTypes: ["use", "value"],
    requiredEvidenceTypes: ["manufacturer"],
    minIndependentSources: 0,
    reviewRecommended: false,
  }),
};

export function getReviewAgentCategoryConfig(
  categoryId: string,
): ReviewAgentCategoryConfig {
  if (BY_ID[categoryId]) return BY_ID[categoryId]!;
  const page = getReviewPageCategoryConfig(categoryId);
  return {
    categoryId,
    criteria: page.scoreCriteriaKeys.length
      ? page.scoreCriteriaKeys.map((key) => ({
          key,
          label: key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        }))
      : [VALUE],
    sectionTypes: page.defaultSectionKeys.length
      ? page.defaultSectionKeys
      : ["overview", "value"],
    requiredEvidenceTypes: page.recommendedEvidenceTypes,
    minIndependentSources: 0,
    reviewRecommended: true,
  };
}

export function hasExplicitReviewCategoryConfig(categoryId: string): boolean {
  return Boolean(BY_ID[categoryId]);
}

export const EXPERT_RESEARCH_METHODOLOGY =
  "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.";

export const EDITORIAL_DISCLOSURE =
  "No brand-supplied product or sponsored testing applied to this review unless stated. Affiliate availability does not affect scores or verdict.";
