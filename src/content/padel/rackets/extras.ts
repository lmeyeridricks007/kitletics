import type { RacketDraft } from "@/content/padel/rackets/build";
import { attrs } from "@/content/padel/rackets/nox";

/** Additional current models needed for a commercially meaningful 2026 range. */
export function extraRacketDrafts(): RacketDraft[] {
  return [
    {
      id: "prod-nox-at10-attack-12k-2026",
      slug: "nox-at10-genius-attack-12k-2026",
      brandId: "brand-nox",
      familyId: "fam-nox-at10",
      generation: "2026-attack-12k",
      name: "AT10 Genius Attack 12K Alum XTREM 2026",
      fullName: "Nox AT10 Genius Attack 12K Alum XTREM 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-maximum-power",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://noxsport.com/en/products/pala-at10-genius-attack-12k-alum-xtrem-2026-by-agustin-tapia",
      sourceName:
        "NOX (noxsport.com) AT10 Genius Attack 12K Alum XTREM 2026",
      shortDescription:
        "Tapia’s 2026 Attack mould with 12K Alum XTREM — diamond/aggressive sibling of Genius 12K. Confirm the live product sheet if you need a model-specific carbon claim beyond the family comparison.",
      verdict:
        "Buy this if you want Attack geometry with the stiffer 12K Alum XTREM face. It is not Genius drop/tear and not Attack 18K.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "Carbon Fiber 12K Alum Xtrem",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K Alum XTREM",
        core: "hard-EVA",
        manufacturerCoreName: "HR3 BLACK EVA",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Aggressive / Attack 12K",
        technologies:
          "Weight Balance, Dual Spin, Carbon Frame, EOS Tunnel, DCS, Pulse System, Custom Grip, SmartStrap, Chromic Paint",
      },
      strengths: [
        "NOX’s own 2026 AT10 comparison lists Attack 12K as Aggressive with a firmer 12K Alum XTREM story",
        "Separate model from Genius 12K drop/tear and Attack 18K",
      ],
      weaknesses: [
        "Diamond Attack demand",
        "Weight Balance system means grams are a band, not a single lock",
      ],
      relatedProductIds: [
        "prod-nox-at10-attack-18k-2026",
        "prod-nox-at10-12k-2026",
      ],
      alternativeProductIds: [
        "prod-nox-at10-attack-18k-2026",
        "prod-bullpadel-hack-04",
      ],
      copy: {
        whatItIs:
          "Attack 12K Alum XTREM is the diamond attacking Genius with Nox’s stiffer 12K Alum XTREM carbon, listed as Aggressive on the official 2026 AT10 comparison.",
        whoItsFor:
          "Advanced finishers who want Attack geometry and a firmer 12K face rather than 18K Alum.",
        howItPlays:
          "NOX groups it with Attack, not versatile Genius. Treat it as the stiffer Attack, not a beginner hybrid.",
        powerVsControl:
          "Power model. Genius drop/tear is the control-leaning Tapia mould.",
        handling:
          "Expect a high-balance Attack mould. Exact grams are UNKNOWN in this pass until the product sheet is attached.",
        comfort:
          "Firmer 12K story. Equation Soft remains the Nox comfort round.",
        forgiveness:
          "Diamond Attack class. Smaller usable zone than Equation Soft or Genius drop/tear.",
        construction:
          "12K Alum XTREM face on the Attack mould. Lock weight, core name and thickness from the live NOX product page before quoting them.",
        bestFor: [
          "Advanced attackers who want Attack 12K rather than Attack 18K",
          "Players comparing Tapia Attack faces inside the same diamond mould",
        ],
        notIdealFor: [
          "Beginners",
          "Anyone who actually wanted Genius drop/tear",
        ],
        buyIf: [
          "You want Tapia’s Attack mould with the 12K Alum XTREM face, not the 18K Attack and not Genius drop/tear.",
          "You already finish balls and can live with a diamond sweet spot.",
        ],
        skipIf: [
          "You need a locked 360–375 g / core sheet today — attach the live product URL first.",
          "You want a round, soft Nox.",
        ],
      },
      attributes: attrs({
        power: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "NOX 2026 AT10 comparison lists Attack 12K as Aggressive.",
        },
        control: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Attack diamond vs Genius drop/tear — less control-first than Genius 12K.",
        },
        forgiveness: {
          score: 46,
          kind: "SPEC_INFERENCE",
          reasoning: "Attack mould is the least forgiving Tapia shape class.",
        },
        maneuverability: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "High-balance Attack class; exact grams not stored this pass.",
        },
        comfort: {
          score: 60,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "12K Alum XTREM is the firmer Genius carbon in Nox’s own comparison.",
        },
        stability: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Professional Attack carbon construction class.",
        },
        spin: {
          score: 84,
          kind: "EXPERT_RESEARCH",
          reasoning:
            "2026 AT10 Attack family uses Dual Spin on the 18K sheet; 12K Attack is the same collection. Not copied as a verified 12K-page spec.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maximum-power",
          score: 90,
          explanation: "Attack 12K is an aggressive diamond in Nox’s own matrix.",
          strengths: ["Attack identity"],
          compromises: ["Incomplete gram sheet"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 16,
          explanation: "Wrong mould.",
          strengths: [],
          compromises: ["Attack diamond"],
        },
      ],
    },
    {
      id: "prod-kuikma-pr-hybrid-carbon",
      slug: "kuikma-pr-hybrid-carbon",
      brandId: "brand-kuikma",
      familyId: "fam-kuikma-pr",
      generation: "hybrid-carbon",
      name: "PR Hybrid Carbon",
      fullName: "Kuikma PR Hybrid Carbon",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: ["uc-padel-balanced", "uc-padel-intermediate", "uc-padel-easy-power"],
      sourceUrl:
        "https://www.decathlon.fr/p/raquette-de-padel-kuikma-pr-hybrid-carbon-coki-nieto/341828/m8979558",
      sourceName: "Decathlon (Kuikma) PR Hybrid Carbon",
      shortDescription:
        "Decathlon Kuikma teardrop around 370 g ±5, medium balance, 12K carbon over fiberglass, Black EVA medium, 38 mm.",
      verdict:
        "Buy this if you want a current Kuikma hybrid carbon at club price. PR Soft 500 stays the softer/value sibling in this catalog.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        face: "12K carbon over fiberglass",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "medium-EVA",
        manufacturerCoreName: "Black EVA medium",
        frameMaterial: "Twin Carbon Tube",
        surfaceTexture: "rough",
        playerLevel: "intermediate",
        manufacturerPositioning: "Regular player hybrid carbon",
        technologies: "Twin Carbon Tube, Shock Block System, Air Foam Frame, Rough Surface",
      },
      strengths: [
        "Decathlon publishes 370 g ±5, teardrop, medium 260 mm, 12K, Black EVA medium, 38 mm",
        "A real step above PR Soft 500 without jumping to a €350 tour racket",
      ],
      weaknesses: [
        "Not as soft as PR Comfort Soft / PR Soft 500",
        "Not a named Premier Padel signature at the Hybrid Pro price",
      ],
      relatedProductIds: ["prod-kuikma-pr-soft-500"],
      alternativeProductIds: [
        "prod-kuikma-pr-soft-500",
        "prod-bullpadel-vertex-advance",
      ],
      copy: {
        whatItIs:
          "Kuikma PR Hybrid Carbon is Decathlon’s accessible carbon hybrid: teardrop, ~370 g, medium balance, 12K carbon with fiberglass layers, Black EVA medium.",
        whoItsFor:
          "Regular club players who want more structure than a soft fiberglass starter without a tour-price Genius.",
        howItPlays:
          "Decathlon copy is power and control from 12K plus medium Black EVA that still works at moderate speed. Manufacturer language, not a Kitletics test.",
        powerVsControl:
          "Hybrid. Easier power than PR Soft 500; less control-first than a round Comfort Soft.",
        handling:
          "370 g ±5 and medium balance — standard adult, not ultralight.",
        comfort:
          "Medium EVA, not Soft. Comfort Soft / PR Soft 500 if arm comfort is the job.",
        forgiveness:
          "Teardrop is more usable than a diamond Vertex, less than a round Kuikma.",
        construction:
          "3× fiberglass + 1× 12K, Twin Carbon Tube, Black EVA medium, 38 mm, rough surface.",
        bestFor: [
          "NL/EU club players buying Kuikma at Decathlon who want carbon without tour pricing",
          "Intermediate all-court players moving off a soft round",
        ],
        notIdealFor: [
          "True beginners who still need a round soft EVA",
          "Tour attackers who want Vertex 05 or AT10 Attack",
        ],
        buyIf: [
          "You want a published 370 g Kuikma teardrop with 12K carbon and medium Black EVA.",
          "You shop Decathlon and need a step up from PR Soft 500.",
        ],
        skipIf: [
          "You want the softest Kuikma round — that is Comfort Soft / PR Soft 500.",
          "You want a Premier Padel diamond.",
        ],
      },
      attributes: attrs({
        power: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Teardrop + 12K + medium EVA is mid-pack power, not a diamond Attack.",
        },
        control: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium balance hybrid. Not a round control racket.",
        },
        forgiveness: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Teardrop + medium EVA, more usable than Hack 04, less than PR Soft 500.",
        },
        maneuverability: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "370 g ±5 is a standard adult band.",
        },
        comfort: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium EVA, not Soft. Shock Block is a manufacturer comfort claim.",
        },
        stability: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Twin Carbon Tube is Decathlon’s stiffness/stability story.",
        },
        spin: {
          score: 72,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Rough Surface is listed on the Decathlon sheet.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 82,
          explanation: "Decathlon hybrid carbon for regular players.",
          strengths: ["Teardrop 12K"],
          compromises: ["Not a tour diamond"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 58,
          explanation: "Possible if you have a racket-sport background; Soft 500 is easier.",
          strengths: ["Accessible price class"],
          compromises: ["Medium EVA"],
        },
      ],
    },
    {
      id: "prod-kuikma-pr-comfort-soft",
      slug: "kuikma-pr-comfort-soft",
      brandId: "brand-kuikma",
      familyId: "fam-kuikma-pr",
      generation: "comfort-soft",
      name: "PR Comfort Soft",
      fullName: "Kuikma PR Comfort Soft",
      lifecycle: "current",
      experienceLevels: ["beginner", "intermediate"],
      useCaseIds: [
        "uc-padel-beginner",
        "uc-padel-arm-comfort",
        "uc-padel-control",
      ],
      sourceUrl: "https://actu-padel.com/en/kuikma-revamps-its-padel-project-players-2026-range-and-international-focus/",
      sourceName: "Kuikma 2026 range notes (PR Comfort Soft: 350 g, round, fiberglass, Soft EVA)",
      shortDescription:
        "Kuikma’s 2026 comfort round: about 350 g, round, low balance, fiberglass, Soft EVA — the on-ramp beside PR Soft 500.",
      verdict:
        "Buy this if you want the lightest, softest current Kuikma round in the 2026 notes. Confirm the live Decathlon NL model listing before treating 350 g as a single gram.",
      specifications: {
        shape: "round",
        balance: "low",
        weightMin: 345,
        weightMax: 355,
        face: "fiberglass",
        faceMaterial: "fiberglass",
        core: "soft-EVA",
        manufacturerCoreName: "Soft EVA",
        playerLevel: "beginner",
        manufacturerPositioning: "Comfort / progress",
        sweetSpot: "large",
      },
      strengths: [
        "Players who want a ~350 g round with Soft EVA and fiberglass for learning",
        "Players who want Kuikma’s arm-comfort / beginner job beside PR Soft 500",
      ],
      weaknesses: [
        "Not a carbon finishing racket",
        "Face and core stay in the Soft EVA / fiberglass comfort lane — not Hybrid Carbon pace",
      ],
      relatedProductIds: ["prod-kuikma-pr-soft-500", "prod-kuikma-pr-hybrid-carbon"],
      alternativeProductIds: [
        "prod-kuikma-pr-soft-500",
        "prod-bullpadel-indiga-ctr",
      ],
      copy: {
        whatItIs:
          "PR Comfort Soft is Kuikma’s 2026 comfort round: around 350 g, low balance, fiberglass, Soft EVA.",
        whoItsFor:
          "New and progressing players who want easy handling and a soft strike at Decathlon prices.",
        howItPlays:
          "Range notes describe easy ball output at moderate intensity. That is positioning, not a test.",
        powerVsControl:
          "Control and comfort. Hybrid Carbon is the power step.",
        handling:
          "350 g and low balance is the maneuverable Kuikma in this set.",
        comfort:
          "Soft EVA is the point. Preference, not medical advice.",
        forgiveness:
          "Round + soft is the forgiving Kuikma.",
        construction:
          "Fiberglass face, Soft EVA, round, ~350 g per Kuikma 2026 range notes.",
        bestFor: [
          "Beginners who want a current Kuikma round",
          "Arm-comfort shoppers on a Decathlon budget",
        ],
        notIdealFor: [
          "Players who already want 12K carbon",
          "Diamond attackers who need finishing geometry beyond a soft round",
        ],
        buyIf: [
          "You want a ~350 g round Kuikma with Soft EVA for learning and comfort.",
          "You are choosing between Comfort Soft and PR Soft 500 on forgiveness versus response.",
        ],
        skipIf: [
          "You already generate pace and want Hybrid Carbon or a tour diamond.",
          "You need a carbon step-up rather than Soft EVA forgiveness.",
        ],
      },
      attributes: attrs({
        power: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + soft EVA + fiberglass is easy output, not smash power.",
        },
        control: {
          score: 84,
          kind: "SPEC_INFERENCE",
          reasoning: "Round, low balance, soft core is the control/comfort Kuikma.",
        },
        forgiveness: {
          score: 90,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + Soft EVA is the most forgiving Kuikma class here.",
        },
        maneuverability: {
          score: 86,
          kind: "SPEC_INFERENCE",
          reasoning: "~350 g and low balance versus 370 g Hybrid Carbon.",
        },
        comfort: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "2026 notes call this the comfort/progress racket with Soft EVA.",
        },
        stability: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "Fiberglass comfort frame, not Twin Carbon Tube Hybrid.",
        },
        spin: {
          score: 58,
          kind: "EXPERT_RESEARCH",
          reasoning: "No Dual Spin-class system named in the 2026 notes we stored.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 90,
          explanation: "The 2026 Kuikma on-ramp.",
          strengths: ["Round soft ~350 g"],
          compromises: ["Not carbon"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 88,
          explanation: "Soft EVA + light round.",
          strengths: ["Comfort positioning"],
          compromises: ["Low power"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 22,
          explanation: "Wrong tool.",
          strengths: [],
          compromises: ["Soft round"],
        },
      ],
    },
  ];
}
