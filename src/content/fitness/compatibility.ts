import type { ProductCompatibility } from "@/domain/compatibility/types";
import { SEED_DATES } from "@/content/config";

/**
 * Seed physical/ecosystem compatibility for Fitness equipment.
 * Prefer verified manufacturer fitment; mark assumed when geometry-only.
 */
export const fitnessCompatibilities: ProductCompatibility[] = [
  {
    id: "compat-rogue-rml-olympic-plates",
    sourceProductId: "prod-rogue-rml-390f",
    compatibilityType: "requires",
    status: "assumed",
    evidenceIds: ["ev-fitness-editorial"],
    notes:
      "Loaded barbell training requires Olympic plates and a compatible bar — not sold as a rack dependency SKU.",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  },
  {
    id: "compat-rogue-rml-ohio-bar",
    sourceProductId: "prod-rogue-rml-390f",
    targetProductId: "prod-rogue-ohio",
    compatibilityType: "compatible-with",
    status: "verified",
    evidenceIds: ["ev-fitness-mfr"],
    notes: "Standard Olympic sleeve geometry fits Rogue Monster Lite uprights for racked lifts.",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  },
  {
    id: "compat-rep-pr4000-fid-bench",
    sourceProductId: "prod-rep-pr-4000",
    targetProductId: "prod-rep-ab-5000",
    compatibilityType: "compatible-with",
    status: "assumed",
    evidenceIds: ["ev-fitness-editorial"],
    notes: "Bench rolls into REP PR-4000 footprint for flat/incline pressing when space allows.",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  },
  {
    id: "compat-rep-ecosystem",
    sourceProductId: "prod-rep-pr-4000",
    ecosystemKey: "rep-pr-4000",
    compatibilityType: "ecosystem-compatible",
    status: "verified",
    evidenceIds: ["ev-fitness-mfr"],
    notes:
      "REP PR-4000 uses proprietary upright / hole spacing — do not mix Rogue Monster Lite attachments without verified adapters.",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  },
  {
    id: "compat-rogue-ecosystem",
    sourceProductId: "prod-rogue-rml-390f",
    ecosystemKey: "rogue-monster-lite",
    compatibilityType: "ecosystem-compatible",
    status: "verified",
    evidenceIds: ["ev-fitness-mfr"],
    notes: "Monster Lite attachments are not interchangeable with Westside / Infinity hole patterns.",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  },
  {
    id: "compat-barbell-requires-plates",
    sourceProductId: "prod-rogue-ohio",
    compatibilityType: "requires",
    status: "assumed",
    evidenceIds: ["ev-fitness-editorial"],
    notes: "Barbell without plates cannot deliver loaded strength training.",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  },
  {
    id: "compat-rogue-ohio-plates",
    sourceProductId: "prod-rogue-ohio",
    targetProductId: "prod-rogue-echo-bumper",
    compatibilityType: "compatible-with",
    status: "verified",
    evidenceIds: ["ev-fitness-mfr"],
    notes: "Olympic sleeve diameter matches Rogue Echo bumper plates.",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
  },
];
