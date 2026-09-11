/**
 * Optional structured generation-change records.
 * Prefer editorial Comparison.upgradeAdvice + keyDifferences for Prompt 9;
 * this model supports finer "what changed" rows when seeded.
 *
 * Only verified differences — no auto "worth upgrading: yes".
 */
export interface ProductGenerationChangeEntry {
  key: string;
  previousValue?: string;
  newValue?: string;
  /** Editorial note only when evidence supports interpretation */
  editorialImpact?: string;
  evidenceIds?: string[];
}

export interface ProductGenerationChange {
  id: string;
  familyId: string;
  fromProductId: string;
  toProductId: string;
  changes: ProductGenerationChangeEntry[];
  editorialSummary?: string;
}

export const productGenerationChanges: ProductGenerationChange[] = [
  {
    id: "gen-nb4-nb5",
    familyId: "fam-novablast",
    fromProductId: "prod-novablast-4",
    toProductId: "prod-novablast-5",
    editorialSummary:
      "Novablast 5 published structured weight and reinforced daily/long Recommendation coverage versus generation 4.",
    changes: [
      {
        key: "generation",
        previousValue: "4",
        newValue: "5",
        evidenceIds: ["ev-nb5-editorial"],
      },
      {
        key: "weight",
        previousValue: "Unknown",
        newValue: "255 g",
        editorialImpact: "Structured manufacturer-reference weight published for Novablast 5.",
        evidenceIds: ["ev-nb5-mfr"],
      },
    ],
  },
  {
    id: "gen-nb5-nb6",
    familyId: "fam-novablast",
    fromProductId: "prod-novablast-5",
    toProductId: "prod-novablast-6",
    editorialSummary:
      "Key changes: FF TURBO SQUARED forefoot pod, engineered woven upper, and ASICSGRIP forefoot — stack/drop remain 41.5/33.5 mm and 8 mm.",
    changes: [
      {
        key: "midsole",
        previousValue: "FF BLAST MAX (full)",
        newValue: "FF BLAST MAX + FF TURBO SQUARED forefoot pod",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        key: "outsole",
        previousValue: "AHAR LO",
        newValue: "ASICSGRIP forefoot + AHAR LO",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        key: "upper",
        previousValue: "Jacquard / engineered mesh",
        newValue: "Engineered woven",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        key: "weight",
        previousValue: "255 g (men’s reference)",
        newValue: "253 g (men’s reference)",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        key: "heelStack",
        previousValue: "41.5 mm",
        newValue: "41.5 mm",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
      {
        key: "drop",
        previousValue: "8 mm",
        newValue: "8 mm",
        evidenceIds: ["ev-novablast-6-mfr"],
      },
    ],
  },
  {
    id: "gen-ghost16-ghost18",
    familyId: "fam-ghost",
    fromProductId: "prod-ghost-16",
    toProductId: "prod-ghost-18",
    editorialSummary:
      "Ghost 18 is the current soft daily generation; Ghost 16 remains relevant as previous-generation value inventory.",
    changes: [
      {
        key: "generation",
        previousValue: "16",
        newValue: "18",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "lifecycleStatus",
        previousValue: "current",
        newValue: "Ghost 16 → previous-generation; Ghost 18 → current",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
  },
  {
    id: "gen-pegasus41-42",
    familyId: "fam-pegasus",
    fromProductId: "prod-pegasus-41",
    toProductId: "prod-pegasus-42",
    editorialSummary:
      "Pegasus 42 is the current versatile daily generation succeeding Pegasus 41.",
    changes: [
      {
        key: "generation",
        previousValue: "41",
        newValue: "42",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
  },
  {
    id: "gen-clifton9-10",
    familyId: "fam-clifton",
    fromProductId: "prod-clifton-9",
    toProductId: "prod-clifton-10",
    editorialSummary:
      "Clifton 10 is the current lightweight max-cushion daily; Clifton 9 remains previous-generation.",
    changes: [
      {
        key: "generation",
        previousValue: "9",
        newValue: "10",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
  },
  {
    id: "gen-speed4-5",
    familyId: "fam-endorphin-speed",
    fromProductId: "prod-endorphin-speed-4",
    toProductId: "prod-endorphin-speed-5",
    editorialSummary:
      "Endorphin Speed 5 is the current nylon-plated tempo platform succeeding Speed 4.",
    changes: [
      {
        key: "generation",
        previousValue: "4",
        newValue: "5",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "plateMaterial",
        previousValue: "nylon",
        newValue: "nylon",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
  },
  {
    id: "gen-fr965-970",
    familyId: "fam-forerunner",
    fromProductId: "prod-forerunner-965",
    toProductId: "prod-forerunner-970",
    editorialSummary:
      "Forerunner 970 succeeds 965 as flagship AMOLED Forerunner with maps; hardware extras (e.g. flashlight/ECG on 970) are manufacturer-differentiated.",
    changes: [
      {
        key: "generation",
        previousValue: "965",
        newValue: "970",
        evidenceIds: ["ev-fr970-mfr"],
      },
      {
        key: "ecg",
        previousValue: "false",
        newValue: "true",
        evidenceIds: ["ev-fr970-mfr"],
      },
      {
        key: "maps",
        previousValue: "true",
        newValue: "true",
        evidenceIds: ["ev-fr970-mfr"],
      },
    ],
  },
];
