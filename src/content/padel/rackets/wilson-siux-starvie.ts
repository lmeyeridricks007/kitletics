import type { RacketDraft } from "@/content/padel/rackets/build";
import { attrs } from "@/content/padel/rackets/nox";

export function wilsonSiuxStarvieDrafts(): RacketDraft[] {
  return [
    {
      id: "prod-siux-diablo",
      existing: true,
      slug: "siux-diablo-pro-2026",
      brandId: "brand-siux",
      familyId: "fam-siux-diablo",
      generation: "pro-2026",
      name: "Diablo Pro",
      fullName: "Siux Diablo Pro 2026",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-advanced",
        "uc-padel-control",
      ],
      sourceUrl: "https://siuxusa.com/products/diablo-pro-2026-night-blue",
      sourceName: "Siux official store (siuxusa.com) Diablo Pro 2026",
      shortDescription:
        "2026 Diablo Pro: teardrop, medium balance, 365 g ±10, 24K TeXtreme + 3K, EVA — not a round beginner racket. ID stays prod-siux-diablo (the shoe is prod-siux-diablo-pro).",
      verdict:
        "Buy this if you want Tino Libaak’s teardrop Diablo Pro. Do not confuse it with the Diablo Pro shoe.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 355,
        weightMax: 375,
        face: "24K TeXtreme + 3K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "24K TeXtreme",
        core: "EVA",
        manufacturerCoreName: "EVA rubber",
        surfaceTexture: "3d-textured",
        feel: "medium",
        playerLevel: "advanced",
        manufacturerPositioning: "Multipurpose / all-court",
      },
      strengths: [
        "Official teardrop + medium balance — not round",
        "24K TeXtreme + 3K and 3D texture are named",
        "Separate identity from the Diablo Pro shoe",
      ],
      weaknesses: [
        "Advanced/pro positioning — not a first racket",
        "Electra and Fenix are different Siux jobs",
      ],
      relatedProductIds: ["prod-siux-electra", "prod-siux-fenix"],
      alternativeProductIds: ["prod-siux-electra", "prod-bullpadel-vertex-05-hybrid"],
      copy: {
        whatItIs:
          "Siux’s official Diablo Pro 2026 listing: advanced, multipurpose, teardrop, medium balance, EVA, 24K TeXtreme + 3K, satin + 3D texture, medium feel, 365 g ±10 (EU sheets also print 355–375 g).",
        whoItsFor:
          "Advanced all-court players. Electra is the other teardrop; Fenix is the diamond power Siux.",
        howItPlays:
          "Manufacturer copy is defence-to-attack on one teardrop. That is not a Kitletics test.",
        powerVsControl:
          "All-court Diablo. Fenix is the smash diamond. Electra is the other hybrid-attack teardrop.",
        handling:
          "Medium balance, 355–375 g. Not a light beginner.",
        comfort:
          "EVA + medium feel. Not a SoftEva Indiga.",
        forgiveness:
          "Teardrop more usable than Fenix diamond. Still a Pro carbon.",
        construction:
          "24K TeXtreme + 3K, EVA, teardrop, medium balance, 3D texture.",
        bestFor: [
          "Advanced players who want the 2026 Diablo Pro teardrop",
          "Pairs who build and finish on the same racket",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Fenix’s diamond or Electra Stupa’s attack teardrop",
        ],
        buyIf: [
          "You want official Diablo Pro 2026: teardrop, medium balance, 24K TeXtreme + 3K, 365±10 g.",
          "You already play at club-advanced level and want Siux’s all-court Pro.",
        ],
        skipIf: [
          "You need a beginner round.",
          "You want Fenix or Electra instead — those are different models.",
        ],
      },
      attributes: attrs({
        power: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Teardrop 24K Pro with medium balance. Fenix is the power Siux.",
        },
        control: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official multipurpose / all-court Diablo with medium balance.",
        },
        forgiveness: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Teardrop versus Fenix diamond; still advanced carbon.",
        },
        maneuverability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium balance, 355–375 g.",
        },
        comfort: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official medium feel (7/10 on the US sheet).",
        },
        stability: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "24K TeXtreme + 3K Pro frame.",
        },
        spin: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Satin + 3D texture is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 88,
          explanation: "Official multipurpose teardrop Diablo.",
          strengths: ["Medium balance", "24K + 3K"],
          compromises: ["Advanced"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 86,
          explanation: "Pro Diablo 2026.",
          strengths: ["Teardrop Pro"],
          compromises: ["Not Fenix smash"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 80,
          explanation: "More placement-led than Fenix.",
          strengths: ["Medium teardrop"],
          compromises: ["Not a round LW"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 28,
          explanation: "Not a starter. The shoe ID must not be used as a ‘softer Diablo’.",
          strengths: [],
          compromises: ["Pro carbon"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 58,
          explanation: "Fenix Pro is the diamond Siux.",
          strengths: ["24K"],
          compromises: ["All-court teardrop"],
        },
      ],
    },
    {
      id: "prod-siux-electra",
      slug: "siux-electra-pro-2026",
      brandId: "brand-siux",
      familyId: "fam-siux-electra",
      generation: "pro-2026",
      name: "Electra Pro",
      fullName: "Siux Electra Pro 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-power",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.siuxpadel.com/products/siux-electra-pro-2026-fire-red",
      sourceName: "Siux (siuxpadel.com) Electra Pro 2026 — Stupaczuk line",
      shortDescription:
        "Electra Pro 2026: Franco Stupaczuk’s teardrop/hybrid attack racket — a distinct model from Diablo Pro and Fenix Pro.",
      verdict:
        "Buy this if you want Stupa’s Electra. Diablo is the other teardrop; Fenix is the diamond. Do not invent a shoe-style ID.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        face: "12K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "EVA",
        playerLevel: "professional",
        manufacturerPositioning: "Versatile attacking Electra",
      },
      strengths: [
        "Distinct Electra Pro family — not a Diablo colourway",
        "Teardrop/hybrid attack positioning versus Fenix diamond",
      ],
      weaknesses: [
        "Weight band from specialist sheet (Zona de Padel); Siux PDP lists shape/balance but not grams",
        "Still a Pro carbon",
      ],
      relatedProductIds: ["prod-siux-diablo", "prod-siux-fenix"],
      alternativeProductIds: ["prod-siux-diablo", "prod-siux-fenix"],
      copy: {
        whatItIs:
          "Electra Pro 2026 is Stupaczuk’s Siux: teardrop mould, typically 12K carbon and EVA, sold as a versatile attacking racket. Specialist sheets often print 355–375 g; that band is not stored here because it was not on a retrieved manufacturer table.",
        whoItsFor:
          "Advanced all-court attackers who prefer Electra’s teardrop to Diablo’s placement teardrop or Fenix’s diamond.",
        howItPlays:
          "Siux pitches Electra as attack with a usable hybrid face. Inference: more finishing than Diablo, less tip-extreme than Fenix.",
        powerVsControl:
          "Between Diablo and Fenix. Electra Team is a different beginner-focused model.",
        handling:
          "Medium-class teardrop. Grams omitted.",
        comfort:
          "EVA Pro carbon. Not a soft starter.",
        forgiveness:
          "Teardrop versus Fenix diamond.",
        construction:
          "12K carbon, EVA, teardrop, 38 mm typical Pro profile. Weight omitted.",
        bestFor: [
          "Advanced players who want Electra Pro, not Diablo",
          "Attacking all-court pairs",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Fenix’s diamond",
        ],
        buyIf: [
          "You want Stupaczuk’s Electra Pro 2026 teardrop, not Diablo Pro.",
          "You already play at a high level and want Siux’s versatile attack model.",
        ],
        skipIf: [
          "You want Diablo Pro’s official 24K sheet.",
          "You want Fenix’s diamond.",
        ],
      },
      attributes: attrs({
        power: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Electra is Siux’s versatile attack teardrop — above Diablo, below Fenix diamond.",
        },
        control: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Teardrop Electra versus Fenix tip bias. Diablo is the calmer teardrop.",
        },
        forgiveness: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "Pro teardrop. More usable than Fenix; still not a round.",
        },
        maneuverability: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium teardrop class. Grams not stored.",
        },
        comfort: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "12K EVA Pro. Not a soft Team.",
        },
        stability: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Pro carbon Electra frame.",
        },
        spin: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Siux Pro faces typically carry a rough/sand finish; not over-claimed here.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 84,
          explanation: "Versatile attacking Electra.",
          strengths: ["Teardrop Pro"],
          compromises: ["Not Diablo-calm"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 80,
          explanation: "More attack than Diablo.",
          strengths: ["12K Electra"],
          compromises: ["Fenix is the diamond"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 86,
          explanation: "Stupaczuk’s Pro model.",
          strengths: ["Pro line"],
          compromises: ["Demanding"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 24,
          explanation: "Not a first Siux.",
          strengths: [],
          compromises: ["Pro teardrop"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 64,
          explanation: "Fenix if smash is the only job.",
          strengths: [],
          compromises: ["Hybrid-attack, not diamond"],
        },
      ],
    },
    {
      id: "prod-siux-fenix",
      slug: "siux-fenix-pro-2026",
      brandId: "brand-siux",
      familyId: "fam-siux-fenix",
      generation: "pro-2026",
      name: "Fenix Pro",
      fullName: "Siux Fenix Pro 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maximum-power",
        "uc-padel-power",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.siuxpadel.com/products/siux-fenix-pro-2026-glow-purple",
      sourceName: "Siux (siuxpadel.com) Fenix Pro 2026 — Augsburger line",
      shortDescription:
        "Fenix Pro 2026: diamond, high-balance Siux power racket — not Diablo’s teardrop and not a shoe.",
      verdict:
        "Buy this if you want Siux’s diamond finisher. Diablo and Electra are teardrops.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        face: "12K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "EVA",
        playerLevel: "professional",
        manufacturerPositioning: "Maximum power / Fenix diamond",
      },
      strengths: [
        "Official Fenix diamond identity versus Diablo/Electra teardrops",
        "12K power-family Siux",
      ],
      weaknesses: [
        "Low forgiveness versus Diablo",
        "Weight band from specialist sheet (Zona de Padel); Siux PDP lists shape/balance but not grams",
      ],
      relatedProductIds: ["prod-siux-diablo", "prod-siux-electra"],
      alternativeProductIds: ["prod-siux-electra", "prod-bullpadel-hack-04"],
      copy: {
        whatItIs:
          "Fenix Pro 2026 is Leo Augsburger’s diamond Siux: high balance, 12K carbon, EVA, sold for maximum offensive strength. It is a different product from Diablo Pro.",
        whoItsFor:
          "Advanced finishers. If you want teardrop all-court, that is Diablo or Electra.",
        howItPlays:
          "Diamond + high balance is the smash story. Manufacturer power positioning.",
        powerVsControl:
          "The power Siux. Diablo is control-leaning teardrop; Electra sits between.",
        handling:
          "High-balance diamond. Grams omitted.",
        comfort:
          "Stiffer job than Diablo.",
        forgiveness:
          "Lowest of the three Pro Siux shapes in this file.",
        construction:
          "Diamond, 12K, EVA, high balance. Weight omitted.",
        bestFor: [
          "Advanced smashers who want Fenix Pro",
          "Players who found Diablo too all-court",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Diablo’s teardrop",
        ],
        buyIf: [
          "You want Siux’s 2026 Fenix Pro diamond, not Diablo Pro.",
          "You already generate overheads and want the power Siux.",
        ],
        skipIf: [
          "You want Diablo or Electra teardrops.",
          "You need a first racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Fenix is Siux’s diamond / maximum-power Pro.",
        },
        control: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "High-balance diamond versus Diablo teardrop.",
        },
        forgiveness: {
          score: 38,
          kind: "SPEC_INFERENCE",
          reasoning: "Power diamond. Lowest tolerance in this Siux trio.",
        },
        maneuverability: {
          score: 54,
          kind: "SPEC_INFERENCE",
          reasoning: "High-balance diamond class.",
        },
        comfort: {
          score: 50,
          kind: "SPEC_INFERENCE",
          reasoning: "12K power EVA. Firmer job than Diablo.",
        },
        stability: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Pro diamond carbon.",
        },
        spin: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Typical Pro texture; not over-specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maximum-power",
          score: 90,
          explanation: "Siux’s diamond Fenix.",
          strengths: ["Diamond", "12K"],
          compromises: ["Unforgiving"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 88,
          explanation: "Official power Pro.",
          strengths: ["High balance"],
          compromises: ["Not Diablo"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 84,
          explanation: "Augsburger’s power model.",
          strengths: ["Pro line"],
          compromises: ["Demanding"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 14,
          explanation: "Wrong Siux.",
          strengths: [],
          compromises: ["Diamond Pro"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 40,
          explanation: "Diablo if you want the teardrop.",
          strengths: [],
          compromises: ["Power diamond"],
        },
      ],
    },
    {
      id: "prod-wilson-bela-pro",
      existing: true,
      slug: "wilson-bela-pro-v3",
      brandId: "brand-wilson-padel",
      familyId: "fam-wilson-bela",
      generation: "v3",
      name: "Bela Pro V3",
      fullName: "Wilson Bela Pro V3",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.wilson.com/en-us/padel/racquets",
      sourceName: "Wilson (wilson.com) Bela padel line — Bela Pro V3",
      shortDescription:
        "Current Bela Pro V3: diamond, 360–375 g, 24K carbon and Power Foam — Belasteguín’s attacking Wilson, not Blade.",
      verdict:
        "Buy this if you want the current Bela Pro diamond. Blade Pro is the other Wilson job. Patch the old V2 2026 row.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 375,
        face: "24K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "24K",
        core: "foam",
        manufacturerCoreName: "Power Foam",
        surfaceTexture: "rough",
        playerLevel: "advanced",
        manufacturerPositioning: "Bela attack / precision power",
        technologies: "C2 Tubular, V-Bridge, 24K carbon, Power Foam",
      },
      strengths: [
        "Current Bela Pro V3 identity with 24K and Power Foam",
        "Published 360–375 g diamond",
      ],
      weaknesses: [
        "High-balance diamond — not Blade control",
        "Not a beginner Wilson",
      ],
      relatedProductIds: ["prod-wilson-blade-pro-padel"],
      alternativeProductIds: [
        "prod-wilson-blade-pro-padel",
        "prod-head-coello-pro",
      ],
      copy: {
        whatItIs:
          "Bela Pro V3 is the current Belasteguín Pro Wilson sold in EU/US padel: diamond (often oversize), 360–375 g, 24K carbon faces, Power Foam, rough surface, C2 tubular and V-Bridge. The old catalog V2-2026 name is retired here.",
        whoItsFor:
          "Advanced attackers who construct then finish. Blade Pro is Wilson’s control/precision sibling.",
        howItPlays:
          "Retailer/manufacturer copy is power with a usable diamond sweet zone and a fast foam. Not a Kitletics test.",
        powerVsControl:
          "Bela is the attack Wilson. Blade is the control Wilson.",
        handling:
          "360–375 g high-balance diamond.",
        comfort:
          "Power Foam, not a soft beginner EVA.",
        forgiveness:
          "Oversize diamond claims a wider zone than a tiny smash head; still advanced.",
        construction:
          "24K carbon, Power Foam, C2 tubular, V-Bridge, diamond, 360–375 g.",
        bestFor: [
          "Advanced players who want current Bela Pro V3",
          "Wilson shoppers who attack more than they carve",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Blade Pro",
        ],
        buyIf: [
          "You want the current Bela Pro V3 diamond with 24K carbon and Power Foam in a 360–375 g band.",
          "You already play at an advanced level.",
        ],
        skipIf: [
          "You want Blade Pro.",
          "You need a first racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 86,
          kind: "SPEC_INFERENCE",
          reasoning: "Diamond Bela + Power Foam + 24K. Wilson’s attack Pro.",
        },
        control: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Bela still plays a constructed game; Blade is the control sibling.",
        },
        forgiveness: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "Advanced diamond. Oversize claims help a little versus a tiny head.",
        },
        maneuverability: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "360–375 g high-balance diamond.",
        },
        comfort: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "Power Foam Pro, not a soft starter.",
        },
        stability: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "C2 tubular and V-Bridge are named for strength and stability.",
        },
        spin: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Rough surface is listed on current Bela Pro sheets.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 86,
          explanation: "Current Bela Pro diamond.",
          strengths: ["24K", "Power Foam"],
          compromises: ["Not Blade"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Advanced Bela Pro.",
          strengths: ["360–375 g"],
          compromises: ["Demanding"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 84,
          explanation: "Belasteguín’s Pro model.",
          strengths: ["V-Bridge"],
          compromises: ["Premium"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 20,
          explanation: "Wrong Wilson.",
          strengths: [],
          compromises: ["Diamond Pro"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 58,
          explanation: "Blade Pro is the control Wilson.",
          strengths: [],
          compromises: ["Attack Bela"],
        },
      ],
    },
    {
      id: "prod-wilson-blade-pro-padel",
      existing: true,
      slug: "wilson-blade-pro-v3-padel",
      brandId: "brand-wilson-padel",
      familyId: "fam-wilson-blade-padel",
      generation: "v3",
      name: "Blade Pro V3",
      fullName: "Wilson Blade Pro V3 Padel",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-balanced",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.wilson.com/en-us/padel/racquets",
      sourceName: "Wilson (wilson.com) Blade padel line — Blade Pro",
      shortDescription:
        "Blade Pro: Wilson’s control/precision padel Pro — distinct from Bela Pro’s diamond attack.",
      verdict:
        "Buy this if you want Wilson’s Blade feel on padel. Bela Pro is the smash sibling. Patch the generic 2026 row.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 355,
        weightMax: 370,
        core: "EVA",
        face: "carbon",
        faceMaterial: "carbon",
        playerLevel: "advanced",
        manufacturerPositioning: "Control / Blade precision",
      },
      strengths: [
        "Distinct Blade Pro identity versus Bela",
        "Teardrop/medium class used for Wilson’s precision padel Pro",
      ],
      weaknesses: [
        "Less raw smash than Bela Pro V3",
        "Face weave not over-specified",
      ],
      relatedProductIds: ["prod-wilson-bela-pro"],
      alternativeProductIds: ["prod-wilson-bela-pro", "prod-drop-shot-canyon-pro"],
      copy: {
        whatItIs:
          "Blade Pro is Wilson’s precision padel Pro (current shops show V3/V4 Blade families). This ID stays the Blade Pro padel product: control-oriented, carbon face, EVA, typically teardrop/medium in the mid-350s to 370 g — not Bela’s diamond.",
        whoItsFor:
          "Intermediate-advanced players who place and redirect. Bela if you finish first.",
        howItPlays:
          "Blade DNA: feel and control. Manufacturer/line positioning, not a lab stiffness number.",
        powerVsControl:
          "Control Wilson. Bela is power Wilson.",
        handling:
          "Medium teardrop band 355–370 g where listed.",
        comfort:
          "EVA carbon Pro — not a foam beginner.",
        forgiveness:
          "More usable than Bela diamond. Still a Pro.",
        construction:
          "Carbon face, EVA, teardrop/medium, 355–370 g typical Blade Pro padel.",
        bestFor: [
          "Players who want Blade Pro, not Bela Pro",
          "Pairs who value placement over smash peak",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Bela’s diamond Power Foam",
        ],
        buyIf: [
          "You want Wilson Blade Pro as the control/precision padel model, not Bela.",
          "You already play and prefer feel over smash mass.",
        ],
        skipIf: [
          "You want Bela Pro V3.",
          "You need a first racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "Blade precision Pro versus Bela Power Foam diamond.",
        },
        control: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Blade line is Wilson’s control/precision padel story.",
        },
        forgiveness: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Teardrop geometry keeps a more usable sweet spot than Bela’s compact diamond.",
        },
        maneuverability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Listed in a mid-350s to 370 g medium-balance class.",
        },
        comfort: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "EVA carbon Blade feel — firmer than a soft starter frame.",
        },
        stability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Pro carbon Blade frame holds its shape under attack.",
        },
        spin: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning:
            "No named 3D face system on the Wilson hub card — treat spin as secondary.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 86,
          explanation: "Wilson’s Blade Pro job.",
          strengths: ["Precision line"],
          compromises: ["Less smash than Bela"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 82,
          explanation: "All-court Blade versus Bela finish.",
          strengths: ["Teardrop/medium"],
          compromises: ["Pro demand"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 82,
          explanation: "Advanced Blade Pro.",
          strengths: ["Carbon EVA"],
          compromises: ["Not beginner"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 30,
          explanation: "Too much Pro Blade.",
          strengths: [],
          compromises: ["Pro carbon"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 50,
          explanation: "Bela Pro V3.",
          strengths: [],
          compromises: ["Control Blade"],
        },
      ],
    },
    {
      id: "prod-starvie-titania-kepler",
      existing: true,
      slug: "starvie-titania-kepler",
      brandId: "brand-starvie",
      familyId: "fam-starvie-titania",
      generation: "kepler-2.0",
      name: "Titania Kepler",
      fullName: "StarVie Titania Kepler",
      lifecycle: "previous-generation",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: ["uc-padel-balanced", "uc-padel-intermediate", "uc-padel-control"],
      sourceUrl: "https://starvie.com/en/products/astrum",
      sourceName: "StarVie (starvie.com) — Titania Kepler is the older Titania identity; Astrum+ is the current versatile teardrop",
      shortDescription:
        "Titania Kepler (2.0-era): StarVie’s intermediate Titania — still a catalog identity, not the 2026 Astrum+ flagship.",
      verdict:
        "Keep this ID as the Kepler Titania. New versatile StarVie money should look at Astrum+. Do not relabel Kepler as a 2026 flagship.",
      specifications: {
        shape: "round",
        balance: "low",
        weightMin: 350,
        weightMax: 385,
        thicknessMm: 38,
        face: "fiberglass",
        faceMaterial: "fiberglass",
        core: "medium-EVA",
        manufacturerCoreName: "EVA Pro 50",
        playerLevel: "intermediate",
        manufacturerPositioning: "Titania intermediate / older Kepler",
      },
      strengths: [
        "Manufacturer-verified Kepler 2.0 sheet (round, 350–385 g, EVA Pro 50) exists from StarVie-era listings",
        "Honest previous-generation flag versus inventing a 2026 Kepler",
      ],
      weaknesses: [
        "Superseded as StarVie’s versatile story by Astrum+",
        "Wide 350–385 g band",
      ],
      relatedProductIds: ["prod-starvie-astrum", "prod-starvie-basalto-osiris"],
      alternativeProductIds: ["prod-starvie-astrum", "prod-adidas-metalbone-team-light"],
      copy: {
        whatItIs:
          "Titania Kepler in this catalog is the Kepler 2.0 Titania identity: StarVie-verified listings used round, low-to-medium balance, 350–385 g, 38 mm, fiberglass face, EVA Pro 50, amateur/intermediate. It is not Astrum+ 2026.",
        whoItsFor:
          "Intermediate players who already own or find Kepler. New buyers should compare Astrum+.",
        howItPlays:
          "Titania was the accessible StarVie. Astrum+ is the current 12K versatile teardrop.",
        powerVsControl:
          "Control-leaning Titania. Basalto was the firmer sibling; Astrum+ is the new hybrid flagship.",
        handling:
          "350–385 g is a wide factory band — try the actual frame.",
        comfort:
          "EVA Pro 50 / glass Titania, not 12K Hyper.",
        forgiveness:
          "Round Titania is the usable StarVie of that era.",
        construction:
          "Fiberglass, EVA Pro 50, 38 mm, 350–385 g, round on the verified 2.0 sheet.",
        bestFor: [
          "Players staying on Titania Kepler they already know",
          "Value Titania versus new Astrum+",
        ],
        notIdealFor: [
          "Shoppers who want current Astrum+",
          "Diamond smashers (that was Basalto / now Triton-class)",
        ],
        buyIf: [
          "You want this catalog’s Titania Kepler identity and understand it is previous-generation versus Astrum+.",
          "You play intermediate and like a more accessible StarVie.",
        ],
        skipIf: [
          "You want current Astrum+ 12K Hyper.",
          "You want Basalto’s firmer diamond/tear attack.",
        ],
      },
      attributes: attrs({
        power: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Glass / EVA Pro 50 Titania versus 12K Astrum+.",
        },
        control: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Round intermediate Titania on the verified 2.0 sheet.",
        },
        forgiveness: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + intermediate EVA. Wide weight band.",
        },
        maneuverability: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Low/medium Titania class; 350–385 g spread.",
        },
        comfort: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Glass + EVA Pro 50 versus basalt/12K.",
        },
        stability: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Titania amateur/intermediate construction.",
        },
        spin: {
          score: 54,
          kind: "SPEC_INFERENCE",
          reasoning: "2.0 sheet listed a smoother face than Basalto’s moulded roughness.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 78,
          explanation: "Older Titania all-rounder.",
          strengths: ["Accessible StarVie"],
          compromises: ["Not Astrum+"],
        },
        {
          useCaseId: "uc-padel-intermediate",
          score: 84,
          explanation: "Kepler’s listed job.",
          strengths: ["EVA Pro 50"],
          compromises: ["Previous gen"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 80,
          explanation: "Round Titania.",
          strengths: ["Usable face"],
          compromises: ["Wide weight band"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 52,
          explanation: "Possible; Indiga/Kuikma are clearer starters.",
          strengths: ["Intermediate glass"],
          compromises: ["350–385 g"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 40,
          explanation: "Basalto or a current StarVie attack model.",
          strengths: [],
          compromises: ["Titania"],
        },
      ],
    },
    {
      id: "prod-starvie-basalto-osiris",
      existing: true,
      slug: "starvie-basalto-osiris",
      brandId: "brand-starvie",
      familyId: "fam-starvie-basalto",
      generation: "osiris-2.0",
      name: "Basalto Osiris",
      fullName: "StarVie Basalto Osiris",
      lifecycle: "previous-generation",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: ["uc-padel-power", "uc-padel-advanced"],
      sourceUrl: "https://starvie.com/en/products/astrum",
      sourceName: "StarVie (starvie.com) — Basalto Osiris is the older basalt/3K identity; Astrum+ is current versatile",
      shortDescription:
        "Basalto Osiris 2.0-era: teardrop, basalt + 3K, EVA Soft 30 — previous StarVie attack/control hybrid, not Astrum+.",
      verdict:
        "Keep the Osiris ID. It is previous-generation versus 2026 Astrum+. Do not invent a 2026 Osiris flagship.",
      specifications: {
        shape: "teardrop",
        balance: "high",
        weightMin: 350,
        weightMax: 385,
        thicknessMm: 38,
        face: "basalt + 3K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "3K",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft 30",
        surfaceTexture: "rough",
        playerLevel: "advanced",
        manufacturerPositioning: "Previous Basalto attack/control",
      },
      strengths: [
        "StarVie-verified 2.0 sheet: teardrop, 350–385 g, basalt+3K, Soft 30",
        "Full Plane Effect roughness from the mould",
      ],
      weaknesses: [
        "Previous generation versus Astrum+",
        "Wide weight band",
      ],
      relatedProductIds: ["prod-starvie-titania-kepler", "prod-starvie-astrum"],
      alternativeProductIds: ["prod-starvie-astrum", "prod-adidas-metalbone-hrd"],
      copy: {
        whatItIs:
          "Basalto Osiris in this catalog is the 2.0 identity StarVie verified: teardrop, 350–385 g, 38 mm, basalt + 3K, EVA Soft 30, Full Plane Effect roughness, competition/intermediate-advanced.",
        whoItsFor:
          "Advanced players who already like Basalto. New versatile money is Astrum+.",
        howItPlays:
          "Teardrop with a high sweet zone and Soft 30 for ball speed. Firmer story than Titania glass.",
        powerVsControl:
          "More attack than Titania Kepler. Astrum+ is the current 12K hybrid.",
        handling:
          "350–385 g factory spread — check the frame.",
        comfort:
          "Soft 30 is the comfort claim on a carbon/basalt face.",
        forgiveness:
          "Teardrop + Soft 30 versus a dry diamond. Still advanced.",
        construction:
          "Basalt + 3K, EVA Soft 30, 38 mm, Full Plane Effect, 350–385 g.",
        bestFor: [
          "Players staying on Basalto Osiris",
          "Value previous-gen StarVie attack/hybrid",
        ],
        notIdealFor: [
          "Shoppers who want Astrum+ 2026",
          "Beginners",
        ],
        buyIf: [
          "You want this catalog’s Basalto Osiris 2.0 identity and know it is previous-generation.",
          "You play advanced and like basalt/3K with Soft 30.",
        ],
        skipIf: [
          "You want current Astrum+.",
          "You need a beginner StarVie.",
        ],
      },
      attributes: attrs({
        power: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Teardrop Basalto + 3K / Soft 30. More attack than Titania glass.",
        },
        control: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft 30 teardrop, not a pure control round.",
        },
        forgiveness: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "Advanced Basalto. Soft 30 helps versus a dry diamond.",
        },
        maneuverability: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "High-balance teardrop class; wide gram band.",
        },
        comfort: {
          score: 72,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "EVA Soft 30 is specified on the verified sheet.",
        },
        stability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Basalt + 3K two-layer face.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Full Plane Effect moulded roughness is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 80,
          explanation: "Previous Basalto attack/hybrid.",
          strengths: ["3K + basalt"],
          compromises: ["Not current Astrum+"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 82,
          explanation: "Competition-level Osiris identity.",
          strengths: ["Soft 30"],
          compromises: ["Previous gen"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 26,
          explanation: "Wrong StarVie.",
          strengths: [],
          compromises: ["Advanced Basalto"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 64,
          explanation: "Titania / Astrum+ depending on generation.",
          strengths: ["Teardrop"],
          compromises: ["High sweet zone"],
        },
      ],
    },
    {
      id: "prod-starvie-astrum",
      slug: "starvie-astrum-plus-2026",
      brandId: "brand-starvie",
      familyId: "fam-starvie-astrum",
      generation: "plus-2026",
      name: "Astrum+",
      fullName: "StarVie Astrum+ 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://starvie.com/en/products/astrum",
      sourceName: "StarVie (starvie.com) Astrum+",
      shortDescription:
        "Current Astrum+: teardrop, 360±8 g, medium balance, 12K Carbon Hyper and M-EVA Balance — StarVie’s 2026 versatile Pro.",
      verdict:
        "Buy this if you want current StarVie all-court. Titania Kepler and Basalto Osiris in this catalog are older identities.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 352,
        weightMax: 368,
        thicknessMm: 38,
        face: "12K Carbon Hyper",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "medium-EVA",
        manufacturerCoreName: "M-EVA Balance",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Versatile teardrop / Pro Line",
        technologies:
          "12K Carbon Hyper, M-EVA Balance, Spin Boost Tech, Air Booster, Shock Shield, Five Sides Tech, Z-Shock",
      },
      strengths: [
        "Official 2026 Astrum+ table: teardrop, 360±8 g, medium, 12K Hyper, M-EVA Balance",
        "Named aero and vibration systems",
      ],
      weaknesses: [
        "Pro versatile — not Titania-easy",
        "Not a smash-only diamond",
      ],
      relatedProductIds: [
        "prod-starvie-titania-kepler",
        "prod-starvie-basalto-osiris",
      ],
      alternativeProductIds: [
        "prod-bullpadel-vertex-05-hybrid",
        "prod-siux-diablo",
      ],
      copy: {
        whatItIs:
          "StarVie Astrum+: versatile teardrop, 12K Carbon Hyper, M-EVA Balance (medium-high density), 38 mm, 360±8 g, medium balance. Air Booster, Shock Shield and Z-Shock are named.",
        whoItsFor:
          "Advanced all-court players who want current StarVie. Kepler/Osiris are the older catalog rows.",
        howItPlays:
          "StarVie says a softer, more precise 12K Hyper feel and a well-rounded M-EVA response. Manufacturer copy.",
        powerVsControl:
          "Versatile teardrop, not a dedicated diamond smash model.",
        handling:
          "360±8 g, medium balance, Air Booster aero claim.",
        comfort:
          "Shock Shield and Z-Shock are the vibration claims. Core is medium-high density, not SoftEva.",
        forgiveness:
          "12K Hyper is said to expand the sweet spot. Still Pro Line.",
        construction:
          "12K Carbon Hyper, M-EVA Balance, 38 mm, Spin Boost, Air Booster, Shock Shield, Five Sides, Z-Shock.",
        bestFor: [
          "Advanced players who want current Astrum+",
          "Pairs who want a 2026 StarVie teardrop, not Kepler leftover",
        ],
        notIdealFor: [
          "Beginners",
          "Players who only want a previous Titania/Basalto they already know",
        ],
        buyIf: [
          "You want official Astrum+: teardrop, 360±8 g, medium balance, 12K Hyper, M-EVA Balance.",
          "You already play at a high level and want current StarVie.",
        ],
        skipIf: [
          "You want to stay on Titania Kepler or Basalto Osiris you already own.",
          "You need a beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "12K Hyper teardrop with medium-high density M-EVA. Versatile, not a diamond peak.",
        },
        control: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official versatile / precise 12K Hyper copy.",
        },
        forgiveness: {
          score: 68,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "12K Hyper is specified to expand the sweet spot. Still Pro.",
        },
        maneuverability: {
          score: 78,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Air Booster plus 360±8 g medium balance.",
        },
        comfort: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Shock Shield and Z-Shock are named. Core is medium-high density.",
        },
        stability: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Five Sides Tech and Shock Shield are specified to stabilize the frame.",
        },
        spin: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Spin Boost Tech is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 90,
          explanation: "Official 2026 versatile Astrum+.",
          strengths: ["12K Hyper", "M-EVA Balance"],
          compromises: ["Pro demand"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Pro Line Astrum+.",
          strengths: ["360±8 g"],
          compromises: ["Not Titania-easy"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 86,
          explanation: "Current StarVie hybrid flagship.",
          strengths: ["Air Booster"],
          compromises: ["Premium"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 26,
          explanation: "Wrong StarVie.",
          strengths: [],
          compromises: ["Pro 12K"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 62,
          explanation: "A diamond StarVie if smash is the only job.",
          strengths: ["12K"],
          compromises: ["Versatile teardrop"],
        },
      ],
    },
  ];
}
