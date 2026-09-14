import type { RacketDraft } from "@/content/padel/rackets/build";
import { attrs } from "@/content/padel/rackets/nox";

export function valueAndSpecialistDrafts(): RacketDraft[] {
  return [
    {
      id: "prod-tecnifibre-wall-breaker-365-2026",
      existing: true,
      slug: "tecnifibre-wall-breaker-365",
      brandId: "brand-tecnifibre-padel",
      familyId: "fam-tecnifibre-wall",
      generation: "365",
      name: "Wall Breaker 365",
      fullName: "Tecnifibre Wall Breaker 365",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: ["uc-padel-power", "uc-padel-balanced", "uc-padel-advanced"],
      sourceUrl: "https://www.tecnifibre.com",
      sourceName: "Tecnifibre (tecnifibre.com) Wall Breaker 365",
      shortDescription:
        "Wall Breaker 365: Tecnifibre’s named ~365 g attack racket with X-TOP and a spin skin — current catalog identity, not a second invented model.",
      verdict:
        "Buy this if you want Tecnifibre’s Wall Breaker 365. Weight is a ± band around 365 g, not a single invented gram.",
      specifications: {
        weightMin: 355,
        weightMax: 375,
        thicknessMm: 38,
        face: "carbon",
        faceMaterial: "carbon",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft",
        surfaceTexture: "rough",
        playerLevel: "advanced",
        manufacturerPositioning: "Attack / Wall Breaker 365",
        technologies: "X-TOP, D-Bridge, PHD holes, 3D Spin Skin",
      },
      strengths: [
        "Named 365 g class with X-TOP abrasion protection",
        "Spin Skin and D-Bridge are Tecnifibre’s own systems",
      ],
      weaknesses: [
        "Shape listings disagree across years (tear vs diamond) — shape omitted rather than guessed",
        "Less forgiving than a round control specialist",
      ],
      relatedProductIds: ["prod-babolat-technical-viper", "prod-babolat-air-viper"],
      alternativeProductIds: ["prod-head-extreme-pro-padel", "prod-adidas-metalbone-3-5-2026"],
      copy: {
        whatItIs:
          "Wall Breaker 365 is Tecnifibre’s high-performance padel model named for a 365 g target (store as 355–375 g). Technologies repeatedly attached to this name: X-TOP (aramid/PTFE tip), D-Bridge, PHD hole pattern, 3D Spin Skin. Shape is omitted because manufacturer/retailer pages have not agreed tear vs diamond across seasons.",
        whoItsFor:
          "Advanced club attackers who want Tecnifibre, not Babolat/Head.",
        howItPlays:
          "Tecnifibre writes finishing help from D-Bridge and spin from the rough skin. Soft EVA appears on current Kitletics/EU sheets — not a Hard EVA Viper clone.",
        powerVsControl:
          "Attack-leaning 365. Not a round LW.",
        handling:
          "365-class adult weight. Not a 300 g Head One.",
        comfort:
          "EVA Soft on the stored core. X-TOP is durability, not cushioning.",
        forgiveness:
          "PHD holes claim more tolerance off-centre. Still an advanced attack racket.",
        construction:
          "Carbon face, EVA Soft, 38 mm, X-TOP, D-Bridge, PHD, Spin Skin. Shape omitted.",
        bestFor: [
          "Advanced players who want Wall Breaker 365",
          "Tecnifibre shoppers who finish points",
        ],
        notIdealFor: [
          "Beginners",
          "Players who need a verified round control mould",
        ],
        buyIf: [
          "You want Tecnifibre’s Wall Breaker 365 with X-TOP and a 355–375 g band around the name weight.",
          "You already attack and like a French-brand carbon.",
        ],
        skipIf: [
          "You need a beginner round.",
          "You will only buy a racket with a single agreed official shape drawing.",
        ],
      },
      attributes: attrs({
        power: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Wall Breaker 365 is Tecnifibre’s attack-named 365-class carbon. Shape omitted.",
        },
        control: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "PHD holes claim centre precision. Not a control-first LW.",
        },
        forgiveness: {
          score: 58,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "PHD larger outer holes are specified for off-centre tolerance.",
        },
        maneuverability: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "365-class adult band — compromise, not ultralight.",
        },
        comfort: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Stored core is EVA Soft versus a Hard EVA smash racket.",
        },
        stability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon + D-Bridge finishing geometry.",
        },
        spin: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3D Spin Skin / sanded paint is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 84,
          explanation: "Tecnifibre’s 365 attack model.",
          strengths: ["X-TOP", "Spin Skin"],
          compromises: ["Shape not stored"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 76,
          explanation: "365-class carbon with a softer EVA than many smash rackets.",
          strengths: ["EVA Soft"],
          compromises: ["Still attack-named"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 84,
          explanation: "High-performance player positioning.",
          strengths: ["D-Bridge"],
          compromises: ["Not a starter"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 24,
          explanation: "Wrong Tecnifibre.",
          strengths: [],
          compromises: ["365 attack"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 72,
          explanation: "A 375 Wall Breaker exists as another name if Tecnifibre splits it — this ID is the 365.",
          strengths: ["365 class"],
          compromises: ["Not the heaviest TF"],
        },
      ],
    },
    {
      id: "prod-kuikma-pr-soft-500",
      existing: true,
      slug: "kuikma-pr-soft-500",
      brandId: "brand-kuikma",
      familyId: "fam-kuikma-pr",
      generation: "soft-500",
      name: "PR Soft 500",
      fullName: "Kuikma PR Soft 500",
      lifecycle: "current",
      experienceLevels: ["beginner", "intermediate"],
      useCaseIds: [
        "uc-padel-beginner",
        "uc-padel-control",
        "uc-padel-arm-comfort",
      ],
      sourceUrl: "https://www.decathlon.nl",
      sourceName: "Decathlon / Kuikma (decathlon.nl) PR Soft 500",
      shortDescription:
        "Kuikma PR Soft 500: Decathlon’s value round soft racket for beginners — the NL-first starter, not a tour diamond.",
      verdict:
        "Buy this to learn on a price that makes sense. It will not smash like Vertex.",
      specifications: {
        shape: "round",
        balance: "low",
        weightMin: 350,
        weightMax: 365,
        thicknessMm: 38,
        face: "fiberglass",
        faceMaterial: "fiberglass",
        core: "soft-EVA",
        playerLevel: "beginner",
        manufacturerPositioning: "Beginner control / value",
        sweetSpot: "large",
      },
      strengths: [
        "Official Decathlon beginner recipe: round, low balance, soft EVA, glass",
        "The value on-ramp this catalog needs",
      ],
      weaknesses: [
        "Little smash authority",
        "Not a carbon Pro Line",
      ],
      relatedProductIds: ["prod-bullpadel-indiga-ctr", "prod-head-one-ultralight"],
      alternativeProductIds: ["prod-bullpadel-indiga-ctr", "prod-adidas-match-light"],
      copy: {
        whatItIs:
          "Kuikma PR Soft 500 is Decathlon’s named beginner padel racket: round, low balance, 350–365 g, 38 mm, fiberglass, soft EVA. Sold as forgiveness and value.",
        whoItsFor:
          "New players in NL/EU who will actually buy a first racket. Not a hidden tour frame.",
        howItPlays:
          "Soft glass round. You supply technique; the racket supplies a usable face.",
        powerVsControl:
          "Control and comfort. Power is not the job.",
        handling:
          "Low balance, 350–365 g. Not Head’s 300 g One, still easy versus a 370 g diamond.",
        comfort:
          "Soft EVA + glass is the comfort story.",
        forgiveness:
          "Large central sweet spot on a round starter.",
        construction:
          "Fiberglass, soft EVA, round, low balance, 38 mm.",
        bestFor: [
          "Beginners who want a Decathlon Kuikma",
          "Players who care about price and a soft face",
        ],
        notIdealFor: [
          "Advanced attackers",
          "Anyone shopping Vertex by name",
        ],
        buyIf: [
          "You are starting and want PR Soft 500: round, low balance, soft EVA, fiberglass.",
          "You want a first racket you can replace without crying.",
        ],
        skipIf: [
          "You already generate pace and want carbon Pro.",
          "You need a 300 g ultralight.",
        ],
      },
      attributes: attrs({
        power: {
          score: 34,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft glass beginner. Low smash help.",
        },
        control: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Decathlon positions PR Soft as control/forgiveness.",
        },
        forgiveness: {
          score: 90,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + soft EVA + glass is the starter recipe.",
        },
        maneuverability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Low balance, 350–365 g.",
        },
        comfort: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Soft EVA is the product name.",
        },
        stability: {
          score: 46,
          kind: "SPEC_INFERENCE",
          reasoning: "Value glass frame versus carbon Pro.",
        },
        spin: {
          score: 38,
          kind: "SPEC_INFERENCE",
          reasoning: "Smooth-ish starter glass, not a 3D Pro face.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 94,
          explanation: "The NL value starter.",
          strengths: ["Round", "Soft EVA"],
          compromises: ["No smash"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 82,
          explanation: "Placement-first Kuikma.",
          strengths: ["Low balance"],
          compromises: ["Low power"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 88,
          explanation: "Soft EVA glass.",
          strengths: ["Soft core"],
          compromises: ["Value durability"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 28,
          explanation: "You will want carbon soon.",
          strengths: [],
          compromises: ["Beginner Kuikma"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 16,
          explanation: "Opposite job.",
          strengths: [],
          compromises: ["Soft 500"],
        },
      ],
    },
    {
      id: "prod-drop-shot-canyon-pro",
      existing: true,
      slug: "drop-shot-canyon-pro",
      brandId: "brand-drop-shot",
      familyId: "fam-drop-shot-canyon",
      generation: "pro",
      name: "Canyon Pro",
      fullName: "Drop Shot Canyon Pro",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: ["uc-padel-balanced", "uc-padel-control", "uc-padel-advanced"],
      sourceUrl: "https://www.drop-shot.com",
      sourceName: "Drop Shot (drop-shot.com) Canyon Pro",
      shortDescription:
        "Canyon Pro: Drop Shot’s teardrop all-court Pro — control/redirect first, not a fake Vertex clone.",
      verdict:
        "Buy this if you want a Drop Shot teardrop that builds the point. Attack Soft and Attack diamonds are other Canyon models where Drop Shot lists them separately.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 355,
        weightMax: 370,
        thicknessMm: 38,
        face: "12K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft",
        playerLevel: "intermediate",
        manufacturerPositioning: "Canyon Pro all-court",
      },
      strengths: [
        "Teardrop 12K Canyon Pro identity already in catalog",
        "EVA Soft keeps it from being a dry smash diamond",
      ],
      weaknesses: [
        "Less explosive than a dedicated attack diamond",
        "Do not merge Attack Soft into this ID",
      ],
      relatedProductIds: ["prod-starvie-astrum", "prod-siux-diablo"],
      alternativeProductIds: ["prod-starvie-titania-kepler", "prod-wilson-blade-pro-padel"],
      copy: {
        whatItIs:
          "Canyon Pro in this catalog is Drop Shot’s teardrop all-court Pro: 355–370 g, medium balance, 12K, EVA Soft, 38 mm. If Drop Shot also sells Canyon Pro Attack / Attack Soft, those are separate products — not this row.",
        whoItsFor:
          "Intermediate-advanced players who redirect and place. Not a first Kuikma.",
        howItPlays:
          "Teardrop + Soft EVA is a mid-court / control-leaning Pro. Manufacturer family positioning.",
        powerVsControl:
          "Control/balanced Canyon. Attack-named Canyons are other models.",
        handling:
          "Medium, 355–370 g.",
        comfort:
          "EVA Soft on 12K — more elastic than a Hard EVA diamond.",
        forgiveness:
          "Teardrop Pro. Better than a compact smash head.",
        construction:
          "12K, EVA Soft, teardrop, 38 mm, 355–370 g.",
        bestFor: [
          "Club players who want Canyon Pro all-court",
          "Drop Shot shoppers who do not want an Attack diamond",
        ],
        notIdealFor: [
          "Beginners",
          "Pure smashers — look at a named Attack Canyon if it exists as its own model",
        ],
        buyIf: [
          "You want this catalog’s Canyon Pro: teardrop, 12K, EVA Soft, 355–370 g.",
          "You already play and prefer redirect over smash peak.",
        ],
        skipIf: [
          "You want a beginner glass racket.",
          "You only smash — do not assume this ID is Attack Soft.",
        ],
      },
      attributes: attrs({
        power: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "12K teardrop with EVA Soft. Not an Attack diamond.",
        },
        control: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Canyon Pro stored as control/balanced teardrop.",
        },
        forgiveness: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft EVA teardrop versus a compact power diamond.",
        },
        maneuverability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "355–370 g medium.",
        },
        comfort: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "EVA Soft is the stored core name.",
        },
        stability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "12K Pro teardrop.",
        },
        spin: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "12K carbon; texture not over-named.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 84,
          explanation: "All-court Canyon Pro.",
          strengths: ["Teardrop", "12K"],
          compromises: ["Not Attack-named"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 82,
          explanation: "Redirect-first Drop Shot.",
          strengths: ["EVA Soft"],
          compromises: ["Still carbon Pro"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 78,
          explanation: "Intermediate-advanced Canyon.",
          strengths: ["12K"],
          compromises: ["Not a tour diamond"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 36,
          explanation: "Kuikma/Indiga first.",
          strengths: [],
          compromises: ["12K Pro"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 50,
          explanation: "Not the Attack Canyon.",
          strengths: [],
          compromises: ["Soft teardrop"],
        },
      ],
    },
    {
      id: "prod-varlion-lw-carbon-difusor",
      existing: true,
      slug: "varlion-lw-carbon-difusor",
      brandId: "brand-varlion",
      familyId: "fam-varlion-lw",
      generation: "lw-carbon",
      name: "LW Carbon Difusor",
      fullName: "Varlion LW Carbon Difusor",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-defensive",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.varlion.com",
      sourceName: "Varlion (varlion.com) LW Carbon Difusor",
      shortDescription:
        "LW Carbon Difusor: Varlion’s round control LW with Difusor — not a Bourne attack racket.",
      verdict:
        "Buy this if you want Varlion’s LW control. Bourne is a different family if you need an attack Varlion.",
      specifications: {
        shape: "round",
        balance: "low",
        weightMin: 350,
        weightMax: 365,
        thicknessMm: 38,
        face: "carbon",
        faceMaterial: "carbon",
        core: "soft-EVA",
        manufacturerCoreName: "Hypersoft",
        playerLevel: "advanced",
        manufacturerPositioning: "LW control / Difusor",
        sweetSpot: "large",
      },
      strengths: [
        "Round LW + Difusor is a real Varlion control identity",
        "Hypersoft / low balance is the defensive story",
      ],
      weaknesses: [
        "Limited smash versus Bourne/Cañon",
        "Do not invent a second LW colourway",
      ],
      relatedProductIds: ["prod-oxdog-sense-pro-2026", "prod-royal-padel-rp-m27-2026"],
      alternativeProductIds: ["prod-oxdog-sense-pro-2026", "prod-babolat-counter-viper"],
      copy: {
        whatItIs:
          "LW Carbon Difusor is Varlion’s round control racket with Difusor technology: typically 350–365 g, low balance, carbon face, Hypersoft-class core, 38 mm.",
        whoItsFor:
          "Intermediate-advanced players who defend and place. Bourne if you want Varlion attack — that would be another ID.",
        howItPlays:
          "Round + low + soft-ish core. Difusor is Varlion’s hole/air control story.",
        powerVsControl:
          "Control LW. Not a smash diamond.",
        handling:
          "Low balance, 350–365 g.",
        comfort:
          "Hypersoft name is the comfort/absorption claim.",
        forgiveness:
          "Large central sweet spot on a round LW.",
        construction:
          "Carbon, Hypersoft, Difusor, round, 38 mm, 350–365 g.",
        bestFor: [
          "Control players who want Varlion LW",
          "Defensive pairs",
        ],
        notIdealFor: [
          "Beginners who should start cheaper",
          "Smash-first Bourne shoppers",
        ],
        buyIf: [
          "You want Varlion LW Carbon Difusor: round, low balance, carbon, Hypersoft-class core.",
          "You already play and live on the block and lob.",
        ],
        skipIf: [
          "You want an attack Varlion (Bourne family — not this ID).",
          "You need a €80 starter.",
        ],
      },
      attributes: attrs({
        power: {
          score: 48,
          kind: "SPEC_INFERENCE",
          reasoning: "Round low LW. Smash is not the job.",
        },
        control: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "LW + Difusor is Varlion’s control line.",
        },
        forgiveness: {
          score: 84,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + large sweet spot + soft-class core.",
        },
        maneuverability: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Low balance, 350–365 g.",
        },
        comfort: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Hypersoft is the stored core name.",
        },
        stability: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon LW, not a 370 g diamond.",
        },
        spin: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon LW; texture not over-named.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 92,
          explanation: "Varlion LW job.",
          strengths: ["Round", "Difusor"],
          compromises: ["Low smash"],
        },
        {
          useCaseId: "uc-padel-defensive",
          score: 90,
          explanation: "Low-balance control LW.",
          strengths: ["Hypersoft"],
          compromises: ["Not Bourne"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 80,
          explanation: "Advanced control, not a toy.",
          strengths: ["Carbon LW"],
          compromises: ["Specialist"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 48,
          explanation: "Playable; Kuikma is the value start.",
          strengths: ["Round"],
          compromises: ["Premium control"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 28,
          explanation: "Wrong Varlion family.",
          strengths: [],
          compromises: ["LW control"],
        },
      ],
    },
    {
      id: "prod-oxdog-sense-pro-2026",
      existing: true,
      slug: "oxdog-sense-pro",
      brandId: "brand-oxdog",
      familyId: "fam-oxdog-sense",
      generation: "classics",
      name: "Sense Pro",
      fullName: "Oxdog Sense Pro",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: ["uc-padel-control", "uc-padel-balanced", "uc-padel-advanced"],
      sourceUrl: "https://oxdogpadel.com",
      sourceName: "Oxdog (oxdogpadel.com) Sense Pro",
      shortDescription:
        "Sense Pro: Oxdog’s round control Classic with HES carbon — not Ultimate/Hyper power.",
      verdict:
        "Buy this if you want Oxdog’s Sense control. Power Oxdogs are other families.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 360,
        weightMax: 370,
        thicknessMm: 38,
        face: "HES carbon",
        faceMaterial: "carbon",
        core: "foam",
        playerLevel: "advanced",
        manufacturerPositioning: "Sense control / Classics",
        sweetSpot: "large",
        technologies: "HES Carbon, RBS, sandy spin face",
      },
      strengths: [
        "Round Sense Pro with HES carbon on Oxdog’s own site",
        "Control-first versus Hyper/Ultimate",
      ],
      weaknesses: [
        "Less smash than Oxdog power lines",
        "Fewer NL big-box listings than Iberian brands",
      ],
      relatedProductIds: ["prod-royal-padel-rp-m27-2026", "prod-varlion-lw-carbon-difusor"],
      alternativeProductIds: ["prod-varlion-lw-carbon-difusor", "prod-siux-diablo"],
      copy: {
        whatItIs:
          "Oxdog Sense Pro (Classics): round, medium balance, about 360–370 g, 38 mm, HES carbon, control-first. RBS is Oxdog’s balance-tuning story; the face is typically sandy for spin.",
        whoItsFor:
          "Intermediate-advanced control players who want a Nordic brand with a real carbon face.",
        howItPlays:
          "Round Sense. Power is not the headline. Manufacturer Classics positioning.",
        powerVsControl:
          "Control Sense. Ultimate/Hyper if you want Oxdog attack — other IDs.",
        handling:
          "Medium, 360–370 g.",
        comfort:
          "Medium foam-class core versus a rock-hard EVA.",
        forgiveness:
          "Round + large sweet spot.",
        construction:
          "HES carbon, round, 38 mm, 360–370 g, RBS, sandy face.",
        bestFor: [
          "Control players who want Sense Pro",
          "Pairs who value a round carbon over a smash diamond",
        ],
        notIdealFor: [
          "Beginners on a Decathlon budget",
          "Smash-first Hyper shoppers",
        ],
        buyIf: [
          "You want Oxdog Sense Pro: round, HES carbon, ~360–370 g, medium balance.",
          "You already play and want control, not Oxdog’s power families.",
        ],
        skipIf: [
          "You want an Oxdog power mould.",
          "You need a €90 starter.",
        ],
      },
      attributes: attrs({
        power: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Round Sense Classic. Not Hyper/Ultimate.",
        },
        control: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Sense is Oxdog’s control Classic.",
        },
        forgiveness: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + large sweet spot.",
        },
        maneuverability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium 360–370 g. RBS can tune balance.",
        },
        comfort: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium foam-class Sense versus a hard EVA diamond.",
        },
        stability: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "HES carbon adult frame.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Sandy/spin face is part of Oxdog’s Sense copy.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 90,
          explanation: "Oxdog Sense job.",
          strengths: ["Round", "HES carbon"],
          compromises: ["Not Hyper"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 82,
          explanation: "Usable round carbon.",
          strengths: ["Medium balance"],
          compromises: ["Control-first"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 80,
          explanation: "Pro-ish Classic Sense.",
          strengths: ["RBS"],
          compromises: ["Specialist brand"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 42,
          explanation: "Playable; Kuikma is cheaper to learn on.",
          strengths: ["Round"],
          compromises: ["Premium Sense"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 36,
          explanation: "Wrong Oxdog family.",
          strengths: [],
          compromises: ["Sense control"],
        },
      ],
    },
    {
      id: "prod-royal-padel-rp-m27-2026",
      existing: true,
      slug: "royal-padel-m27-poly-2026",
      brandId: "brand-royal-padel",
      familyId: "fam-royal-m27",
      generation: "2026-poly",
      name: "M27 Poly",
      fullName: "Royal Padel M27 Poly 2026",
      lifecycle: "current",
      experienceLevels: ["beginner", "intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-beginner",
        "uc-padel-arm-comfort",
      ],
      sourceUrl: "https://www.royalpadel.com",
      sourceName: "Royal Padel (royalpadel.com) M27 Poly 2026",
      shortDescription:
        "M27 Poly 2026: round control flagship with a soft polyethylene core and 3K carbon — not an older M27 Hybrid version.",
      verdict:
        "Buy this if you want Royal’s current M27 Poly. Hybrid M27s are other products.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 360,
        weightMax: 380,
        thicknessMm: 38,
        face: "3K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "3K",
        core: "other",
        manufacturerCoreName: "Polyethylene Soft",
        playerLevel: "intermediate",
        manufacturerPositioning: "M27 control / Poly 2026",
        sweetSpot: "large",
        technologies: "Shock Absorption, 3K carbon, polyethylene core",
      },
      strengths: [
        "Current Poly 2026 identity versus older Hybrid M27",
        "Round + soft poly core + 3K is a real comfort-control recipe",
      ],
      weaknesses: [
        "Top of the weight band is heavy",
        "Not a smash diamond",
      ],
      relatedProductIds: ["prod-oxdog-sense-pro-2026", "prod-varlion-lw-carbon-difusor"],
      alternativeProductIds: ["prod-kuikma-pr-soft-500", "prod-varlion-lw-carbon-difusor"],
      copy: {
        whatItIs:
          "Royal Padel M27 Poly 2026: round, 360–380 g, 38 mm, 3K carbon, soft polyethylene core. Distinct from older M27 Hybrid versions.",
        whoItsFor:
          "Players who want a forgiving round with a carbon face and a soft poly core — from solid beginners up to control-minded advanced.",
        howItPlays:
          "Large sweet spot, Shock Absorption copy, control-first. Manufacturer claim.",
        powerVsControl:
          "Control M27. Not a geometric smash Royal.",
        handling:
          "360–380 g — try before you assume it is light.",
        comfort:
          "Polyethylene Soft + shock-absorption naming.",
        forgiveness:
          "Round + large sweet spot + soft core.",
        construction:
          "3K, polyethylene soft, round, 38 mm, 360–380 g.",
        bestFor: [
          "Control players who want current M27 Poly",
          "Players who want carbon without a hard EVA smash",
        ],
        notIdealFor: [
          "Pure smashers",
          "Anyone who needs a sub-350 g frame",
        ],
        buyIf: [
          "You want M27 Poly 2026: round, 3K, polyethylene soft, 360–380 g.",
          "You want a forgiving carbon round, not a Hybrid leftover.",
        ],
        skipIf: [
          "You want an older M27 Hybrid.",
          "You only smash.",
        ],
      },
      attributes: attrs({
        power: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "Round Poly M27. Soft core, not a diamond.",
        },
        control: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "M27 Poly is Royal’s control flagship.",
        },
        forgiveness: {
          score: 88,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + large sweet spot + soft poly.",
        },
        maneuverability: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "360–380 g can feel stout.",
        },
        comfort: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Polyethylene Soft and Shock Absorption are named.",
        },
        stability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "3K carbon, heavier top band.",
        },
        spin: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "3K carbon; not a named 3D system here.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 90,
          explanation: "Current M27 Poly.",
          strengths: ["Round", "Poly core"],
          compromises: ["Up to 380 g"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 78,
          explanation: "Forgiving carbon round — heavier than Kuikma.",
          strengths: ["Soft poly"],
          compromises: ["Weight"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 90,
          explanation: "The comfort Royal.",
          strengths: ["Shock Absorption"],
          compromises: ["Not light"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 70,
          explanation: "Usable for control-minded advanced.",
          strengths: ["3K"],
          compromises: ["Not a smash tool"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 32,
          explanation: "Wrong Royal.",
          strengths: [],
          compromises: ["Poly round"],
        },
      ],
    },
    {
      id: "prod-black-crown-special-one-soft",
      existing: true,
      slug: "black-crown-special-one-soft",
      brandId: "brand-black-crown",
      familyId: "fam-black-crown-special",
      generation: "soft",
      name: "Special One Soft",
      fullName: "Black Crown Special One Soft",
      lifecycle: "current",
      experienceLevels: ["beginner", "intermediate"],
      useCaseIds: ["uc-padel-beginner", "uc-padel-control", "uc-padel-arm-comfort"],
      sourceUrl: "https://blackcrown.es",
      sourceName: "Black Crown (blackcrown.es) Special One Soft",
      shortDescription:
        "Special One Soft: value round/soft Black Crown for beginners — fiberglass and soft EVA, not a 12K flagship.",
      verdict:
        "Buy this to start cheap with a soft round. It is not a tour carbon.",
      specifications: {
        shape: "round",
        balance: "low",
        weightMin: 350,
        weightMax: 365,
        thicknessMm: 38,
        face: "fiberglass",
        faceMaterial: "fiberglass",
        core: "soft-EVA",
        playerLevel: "beginner",
        manufacturerPositioning: "Beginner value / Special One Soft",
        sweetSpot: "large",
      },
      strengths: [
        "Honest club-value round",
        "Soft EVA + glass + low balance",
      ],
      weaknesses: [
        "Limited smash and face durability versus 12K",
        "Do not duplicate colourways",
      ],
      relatedProductIds: ["prod-kuikma-pr-soft-500", "prod-lok-maxx-flow"],
      alternativeProductIds: ["prod-kuikma-pr-soft-500", "prod-bullpadel-indiga-ctr"],
      copy: {
        whatItIs:
          "Special One Soft is Black Crown’s value round: 350–365 g, low balance, 38 mm, fiberglass, soft EVA. Club beginner positioning.",
        whoItsFor:
          "New players who want a named Black Crown without Pro money.",
        howItPlays:
          "Soft and easy. You will outgrow the smash.",
        powerVsControl:
          "Control/comfort. Power is not why it exists.",
        handling:
          "Low balance, 350–365 g.",
        comfort:
          "Soft EVA glass.",
        forgiveness:
          "Large round sweet spot.",
        construction:
          "Fiberglass, soft EVA, round, 38 mm.",
        bestFor: [
          "Beginners who want Black Crown Soft",
          "Value shoppers beside Kuikma",
        ],
        notIdealFor: [
          "Advanced carbon shoppers",
          "Smash-first players",
        ],
        buyIf: [
          "You want Special One Soft: round, low balance, fiberglass, soft EVA.",
          "You are learning and want a cheap named racket.",
        ],
        skipIf: [
          "You already play advanced carbon.",
          "You want a 12K Black Crown — that would be another model.",
        ],
      },
      attributes: attrs({
        power: {
          score: 32,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft glass beginner.",
        },
        control: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Round low-balance starter.",
        },
        forgiveness: {
          score: 90,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + soft EVA + glass.",
        },
        maneuverability: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Low balance, 350–365 g.",
        },
        comfort: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Soft is in the name and the EVA.",
        },
        stability: {
          score: 44,
          kind: "SPEC_INFERENCE",
          reasoning: "Value glass versus carbon Pro.",
        },
        spin: {
          score: 36,
          kind: "SPEC_INFERENCE",
          reasoning: "Starter glass face.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 90,
          explanation: "Value Black Crown starter.",
          strengths: ["Soft EVA", "Round"],
          compromises: ["No smash"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 80,
          explanation: "Placement-first Soft.",
          strengths: ["Low balance"],
          compromises: ["Value face"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 86,
          explanation: "Soft glass.",
          strengths: ["Soft EVA"],
          compromises: ["Durability"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 26,
          explanation: "Outgrow it.",
          strengths: [],
          compromises: ["Beginner Soft"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 14,
          explanation: "No.",
          strengths: [],
          compromises: ["Soft One"],
        },
      ],
    },
    {
      id: "prod-lok-maxx-flow",
      existing: true,
      slug: "lok-maxx-flow",
      brandId: "brand-lok",
      familyId: "fam-lok-maxx",
      generation: "gen2",
      name: "Maxx Flow",
      fullName: "Lok Maxx Flow",
      lifecycle: "current",
      experienceLevels: ["beginner", "intermediate"],
      useCaseIds: [
        "uc-padel-beginner",
        "uc-padel-balanced",
        "uc-padel-easy-power",
      ],
      sourceUrl: "https://www.lokpadel.com",
      sourceName: "Lok (lokpadel.com) Maxx Flow",
      shortDescription:
        "Maxx Flow: Lok’s value teardrop for progressing beginners — more output than an ultra-soft round, not a tour diamond.",
      verdict:
        "Buy this if you want a cheaper teardrop to grow into club play. It is not Vertex.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 350,
        weightMax: 370,
        thicknessMm: 38,
        face: "fiberglass/carbon",
        faceMaterial: "hybrid",
        core: "medium-EVA",
        playerLevel: "intermediate",
        manufacturerPositioning: "Value teardrop / Maxx Flow",
        sweetSpot: "medium-large",
      },
      strengths: [
        "Teardrop value identity — not a second colourway of Special One",
        "Room to grow versus a dead-soft round",
      ],
      weaknesses: [
        "Not a tour-stiff diamond",
        "Fewer independent lab numbers",
      ],
      relatedProductIds: ["prod-black-crown-special-one-soft", "prod-kuikma-pr-soft-500"],
      alternativeProductIds: ["prod-siux-diablo", "prod-head-coello-team"],
      copy: {
        whatItIs:
          "Lok Maxx Flow is a value teardrop: about 350–370 g, medium balance, hybrid glass/carbon face, soft/medium EVA. Sold as an accessible all-court step up from ultra-soft rounds.",
        whoItsFor:
          "Progressing beginners and intermediates who want a bit more shape than a round starter.",
        howItPlays:
          "Teardrop value. More output than Special One Soft; less than a 12K Pro.",
        powerVsControl:
          "Balanced-easy. Not Maxx attack if Lok splits that name — this ID is Flow.",
        handling:
          "Medium, 350–370 g.",
        comfort:
          "Softer EVA class than a Hard Pro.",
        forgiveness:
          "Medium-large teardrop. Easier than a compact diamond.",
        construction:
          "Hybrid face, medium EVA, teardrop, 38 mm, 350–370 g.",
        bestFor: [
          "Players leaving a round starter",
          "Value teardrop shoppers",
        ],
        notIdealFor: [
          "Advanced 18K shoppers",
          "Players who need a dead-soft round only",
        ],
        buyIf: [
          "You want Lok Maxx Flow: teardrop, 350–370 g, hybrid face, medium EVA.",
          "You have basic contact and want a cheaper teardrop.",
        ],
        skipIf: [
          "You want a tour carbon.",
          "You are happier in a round Soft 500.",
        ],
      },
      attributes: attrs({
        power: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Value teardrop. More than a soft round, less than Pro 12K.",
        },
        control: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium teardrop Flow, not a smash diamond.",
        },
        forgiveness: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium-large teardrop on a value EVA.",
        },
        maneuverability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "350–370 g medium.",
        },
        comfort: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft/medium EVA value stack.",
        },
        stability: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Hybrid value frame versus full carbon Pro.",
        },
        spin: {
          score: 54,
          kind: "SPEC_INFERENCE",
          reasoning: "No named 3D system stored.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 78,
          explanation: "Progressing-beginner teardrop.",
          strengths: ["Value tear"],
          compromises: ["Not as soft as a round starter"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 80,
          explanation: "All-court Flow.",
          strengths: ["Medium tear"],
          compromises: ["Value materials"],
        },
        {
          useCaseId: "uc-padel-easy-power",
          score: 76,
          explanation: "Easier output than Special One Soft.",
          strengths: ["Teardrop"],
          compromises: ["Not Pro 12K"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 48,
          explanation: "You will want a named Pro carbon.",
          strengths: [],
          compromises: ["Value Flow"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 40,
          explanation: "Not a smash Lok.",
          strengths: [],
          compromises: ["Flow"],
        },
      ],
    },
  ];
}
