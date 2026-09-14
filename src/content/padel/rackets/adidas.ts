import type { RacketDraft } from "@/content/padel/rackets/build";
import { attrs } from "@/content/padel/rackets/nox";

export function adidasDrafts(): RacketDraft[] {
  return [
    {
      id: "prod-adidas-metalbone-3-5-2026",
      slug: "adidas-metalbone-3-5-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-metalbone",
      generation: "3.5-2026",
      name: "Metalbone 3.5",
      fullName: "Adidas Metalbone 3.5 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7521-padel-racket-adidas-metalbone-2026-ale-galan-8435739405802.html",
      sourceName: "adidas official store (allforpadel.com) Metalbone 2026 — Ale Galán",
      shortDescription:
        "Current Metalbone 2026 / 3.5: diamond, Weight & Balance, Carbon Aluminized 16K and Soft Performance EVA — not the 3.3 and not HRD+.",
      verdict:
        "Buy this if you want Galán’s current adjustable Metalbone with Soft Performance EVA. HRD+ is the High Memory sibling; 3.3 is previous-generation.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 345,
        weightMax: 371,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "Carbon Aluminized 16K",
        faceMaterial: "carbon",
        faceCarbonWeave: "16K Alum",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft Performance",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Attack / customizable power",
        technologies:
          "Weight & Balance System, Octagonal Structure, Low Poly, Extra Power Grip, Power Groove, Spin Blade Decal, Smart Holes Curve, Structural Reinforcement",
        sweetSpot: "compact",
      },
      strengths: [
        "Official 2026 Metalbone with Weight & Balance (+0–11.2 g on a 345–360 g base)",
        "Soft Performance EVA — not HRD+ High Memory",
        "16K aluminised carbon and diamond attack mould",
      ],
      weaknesses: [
        "Still a pro diamond; adjustable weights can push it toward 371 g",
        "Not the round CTRL if you want a centred sweet spot",
      ],
      relatedProductIds: [
        "prod-adidas-metalbone-hrd",
        "prod-adidas-metalbone-ctrl",
        "prod-adidas-metalbone-3-3-2026",
      ],
      alternativeProductIds: [
        "prod-adidas-metalbone-hrd",
        "prod-bullpadel-vertex-05",
      ],
      copy: {
        whatItIs:
          "Adidas lists this as Metalbone 2026 by Ale Galán — the current Metalbone 3.5 generation. Official store: diamond, head-heavy, 345–360 g plus 0–11.2 g Weight & Balance, 38 mm, Carbon Aluminized 16K, Soft Performance EVA, Spin Blade Decal, top sweet spot.",
        whoItsFor:
          "Advanced attackers who want to tune balance. If you want the stiffer High Memory smash, that is HRD+.",
        howItPlays:
          "Official copy is total power with customisation. Soft Performance EVA is the comfort/output claim versus HRD+. Manufacturer language, not a Kitletics test.",
        powerVsControl:
          "Attack diamond. CTRL is the round Metalbone. HRD+ keeps the diamond and swaps in High Memory EVA.",
        handling:
          "Base 345–360 g is lighter than many Spanish 365 g flags until you add plates. Extra Power Grip is the longer-handle inertia claim.",
        comfort:
          "Soft Performance EVA is why this is not HRD+. Still a pro carbon diamond.",
        forgiveness:
          "Top sweet spot on a 485 cm² diamond. Off-centre play is not the job.",
        construction:
          "16K aluminised carbon, Soft Performance EVA, Octagonal Structure, Low Poly, Weight & Balance, Spin Blade Decal.",
        bestFor: [
          "Advanced players who want the current Metalbone 3.5 / 2026 diamond",
          "Attackers who will actually use Weight & Balance",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want HRD+ High Memory or Metalbone CTRL",
        ],
        buyIf: [
          "You want the official 2026 Metalbone diamond with 16K aluminised carbon and Soft Performance EVA.",
          "You already attack and want to add or omit the 11.2 g Weight & Balance kit.",
        ],
        skipIf: [
          "You want HRD+ High Memory.",
          "You need a beginner Match / RX racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official attack / total-power Metalbone 2026 with diamond and Extra Power Grip.",
        },
        control: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Softer EVA than HRD+ but still a head-heavy diamond. CTRL is the control Metalbone.",
        },
        forgiveness: {
          score: 48,
          kind: "SPEC_INFERENCE",
          reasoning: "Top sweet spot, 485 cm² diamond. Low tolerance.",
        },
        maneuverability: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "345–360 g base is lighter than many flags; plates and high balance add inertia.",
        },
        comfort: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Soft Performance EVA is specified versus HRD+ High Memory.",
        },
        stability: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Octagonal Structure, Low Poly and Power Groove are the rigidity claims.",
        },
        spin: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Spin Blade Decal and Smart Holes Curve are specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 90,
          explanation: "Current Metalbone attack diamond.",
          strengths: ["16K alum", "Weight & Balance"],
          compromises: ["Pro diamond"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 92,
          explanation: "PRO level on the official sheet.",
          strengths: ["Galán Metalbone"],
          compromises: ["Demands timing"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 90,
          explanation: "Current Metalbone flagship, not 3.3.",
          strengths: ["2026 model"],
          compromises: ["Premium"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 20,
          explanation: "Match Light or RX if you are starting.",
          strengths: [],
          compromises: ["Pro diamond"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 84,
          explanation: "HRD+ is the stiffer smash Metalbone.",
          strengths: ["Attack diamond"],
          compromises: ["Soft Performance vs High Memory"],
        },
      ],
    },
    {
      id: "prod-adidas-metalbone-hrd",
      existing: true,
      slug: "adidas-metalbone-hrd-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-metalbone",
      generation: "hrd-2026",
      name: "Metalbone HRD+",
      fullName: "Adidas Metalbone HRD+ 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maximum-power",
        "uc-padel-power",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7522-padel-racket-adidas-metalbone-hrd-2026-ale-galan-8435739405826.html",
      sourceName: "adidas official store (allforpadel.com) Metalbone HRD+ 2026",
      shortDescription:
        "Metalbone HRD+ 2026: same adjustable diamond as Metalbone 2026 with High Memory EVA and 16K aluminised carbon.",
      verdict:
        "Buy this if you want the stiff High Memory Metalbone. The standard 3.5 uses Soft Performance EVA.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 345,
        weightMax: 371,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "Carbon Aluminized 16K",
        faceMaterial: "carbon",
        faceCarbonWeave: "16K Alum",
        core: "hard-EVA",
        manufacturerCoreName: "EVA High Memory",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Maximum attack / High Memory",
        technologies:
          "Weight & Balance System, Octagonal Structure, Low Poly, Extra Power Grip, Power Groove, Spin Blade Decal, Smart Holes Curve",
        sweetSpot: "compact",
      },
      strengths: [
        "Official High Memory EVA — the stiff Metalbone",
        "Same Weight & Balance diamond platform as Metalbone 2026",
        "Written for players who finish by force",
      ],
      weaknesses: [
        "Harsher than Soft Performance Metalbone 3.5",
        "Still a compact top sweet spot",
      ],
      relatedProductIds: [
        "prod-adidas-metalbone-3-5-2026",
        "prod-adidas-metalbone-3-3-2026",
      ],
      alternativeProductIds: [
        "prod-adidas-metalbone-3-5-2026",
        "prod-bullpadel-hack-04",
      ],
      copy: {
        whatItIs:
          "HRD+ 2026 is Galán’s power Metalbone: diamond, head-heavy, 345–360 g + 0–11.2 g, 16K aluminised carbon and High Memory EVA. Official store copy is hit harder, faster and deeper.",
        whoItsFor:
          "Advanced finishers who want a dense EVA. If you want the same mould with a softer core, buy Metalbone 3.5 / 2026.",
        howItPlays:
          "High Memory is specified as high-density EVA for high-speed shots. That is the whole point of HRD+ versus the standard Metalbone.",
        powerVsControl:
          "The stiffer Metalbone. CTRL is round. 3.5 is Soft Performance.",
        handling:
          "Same Weight & Balance kit as the standard 2026 Metalbone.",
        comfort:
          "Lower than 3.5 by construction. Not a comfort model.",
        forgiveness:
          "Top sweet spot, pro diamond.",
        construction:
          "16K aluminised carbon, High Memory EVA, Weight & Balance, Octagonal Structure, Spin Blade Decal.",
        bestFor: [
          "Advanced smashers who want High Memory Metalbone",
          "Players who already liked older HRD generations",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Soft Performance Metalbone 3.5",
        ],
        buyIf: [
          "You want the official 2026 HRD+ with High Memory EVA and Weight & Balance.",
          "You already generate racket-head speed and want the stiff Metalbone.",
        ],
        skipIf: [
          "You want Soft Performance Metalbone 3.5.",
          "You need Match Light or Team Light.",
        ],
      },
      attributes: attrs({
        power: {
          score: 94,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official HRD+ copy is maximum ball speed with High Memory EVA.",
        },
        control: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Stiffer core than Metalbone 3.5 on the same diamond.",
        },
        forgiveness: {
          score: 40,
          kind: "SPEC_INFERENCE",
          reasoning: "High Memory + top sweet spot diamond.",
        },
        maneuverability: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Same 345–360 g + plates platform as Metalbone 2026.",
        },
        comfort: {
          score: 48,
          kind: "SPEC_INFERENCE",
          reasoning: "High Memory is the dense EVA. 3.5 is the softer Metalbone.",
        },
        stability: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Octagonal Structure and Low Poly are specified to turn swing into acceleration.",
        },
        spin: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Spin Blade Decal is listed.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maximum-power",
          score: 94,
          explanation: "The High Memory Metalbone.",
          strengths: ["HRD+ EVA", "Diamond"],
          compromises: ["Harsh if late"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 92,
          explanation: "Official attack HRD+.",
          strengths: ["16K alum"],
          compromises: ["Low comfort"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 90,
          explanation: "PRO Galán power model.",
          strengths: ["Current HRD+"],
          compromises: ["Demanding"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 14,
          explanation: "Do not start on HRD+.",
          strengths: [],
          compromises: ["High Memory diamond"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 30,
          explanation: "Choose Metalbone 3.5, Team Light or Match Light.",
          strengths: [],
          compromises: ["Dense EVA"],
        },
      ],
    },
    {
      id: "prod-adidas-metalbone-ctrl",
      slug: "adidas-metalbone-ctrl-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-metalbone",
      generation: "ctrl-2026",
      name: "Metalbone CTRL",
      fullName: "Adidas Metalbone CTRL 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-balanced",
        "uc-padel-advanced",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7525-padel-racket-adidas-metalbone-ctrl-2026-8435739405819.html",
      sourceName: "adidas official store (allforpadel.com) Metalbone CTRL 2026",
      shortDescription:
        "Metalbone CTRL 2026: round, even balance, 16K aluminised carbon and Soft Performance EVA with the same Weight & Balance kit.",
      verdict:
        "Buy this if you want Metalbone materials in a round control mould. It is not the diamond 3.5.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 345,
        weightMax: 371,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "Carbon Aluminized 16K",
        faceMaterial: "carbon",
        faceCarbonWeave: "16K Alum",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft Performance",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Control / customizable Metalbone",
        technologies:
          "Weight & Balance System, Octagonal Structure, Low Poly, Extra Power Grip, Power Groove, Spin Blade Decal, Smart Holes Curve",
        sweetSpot: "medium",
      },
      strengths: [
        "Official round Metalbone with centred sweet spot",
        "Same 16K + Weight & Balance as the diamond, Soft Performance EVA",
        "Even balance on the official sheet (not head-heavy)",
      ],
      weaknesses: [
        "Still PRO level — not Match Light",
        "Less smash inertia than the diamond Metalbone",
      ],
      relatedProductIds: [
        "prod-adidas-metalbone-3-5-2026",
        "prod-adidas-cross-it-ctrl",
      ],
      alternativeProductIds: [
        "prod-adidas-metalbone-3-5-2026",
        "prod-adidas-arrow-hit-ctrl",
      ],
      copy: {
        whatItIs:
          "Metalbone CTRL 2026 is the round Metalbone: even balance, 345–360 g + 0–11.2 g, 16K aluminised carbon, Soft Performance EVA, centre sweet spot.",
        whoItsFor:
          "Advanced players who want Metalbone construction without the diamond tip. Still a pro carbon.",
        howItPlays:
          "Official copy is precision and power with a round shape for control. Soft Performance EVA is the consistent output claim.",
        powerVsControl:
          "The control Metalbone. Diamond 3.5 / HRD+ are the attack pair.",
        handling:
          "Even balance plus optional plates. Extra Power Grip is still on the sheet.",
        comfort:
          "Soft Performance EVA, same family as Metalbone 3.5, round outline.",
        forgiveness:
          "Centre sweet spot on a round face is the CTRL story. Level is still PRO.",
        construction:
          "16K alum, Soft Performance EVA, Weight & Balance, Spin Blade Decal, Octagonal Structure.",
        bestFor: [
          "Advanced control players who want Metalbone materials",
          "Pairs who build the point and still want 16K carbon",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the diamond Metalbone smash",
        ],
        buyIf: [
          "You want the official Metalbone CTRL 2026: round, even balance, 16K and Soft Performance EVA.",
          "You already play at a high level and prefer a centred sweet spot.",
        ],
        skipIf: [
          "You want diamond Metalbone 3.5 or HRD+.",
          "You need a beginner Match racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "16K Metalbone stack on a round even-balance mould. Less tip mass than 3.5.",
        },
        control: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official CTRL / total-control positioning with a centre sweet spot.",
        },
        forgiveness: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + centre sweet spot versus diamond Metalbone. Still PRO carbon.",
        },
        maneuverability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Even balance and 345–360 g base. Plates can add tip mass.",
        },
        comfort: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Soft Performance EVA is specified.",
        },
        stability: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Octagonal Structure and Power Groove remain on CTRL.",
        },
        spin: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Spin Blade Decal is listed.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 90,
          explanation: "Official Metalbone control model.",
          strengths: ["Round", "Centre sweet spot"],
          compromises: ["PRO demand"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 86,
          explanation: "16K Metalbone with a usable round face.",
          strengths: ["Soft Performance EVA"],
          compromises: ["Not a beginner round"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "PRO Metalbone construction.",
          strengths: ["Weight & Balance"],
          compromises: ["Still carbon-pro"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 28,
          explanation: "Match Light or RX, not CTRL.",
          strengths: [],
          compromises: ["PRO 16K"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 56,
          explanation: "Diamond Metalbone or HRD+ for smash-first play.",
          strengths: ["16K carbon"],
          compromises: ["Round even balance"],
        },
      ],
    },
    {
      id: "prod-adidas-metalbone-team-light",
      slug: "adidas-metalbone-team-light-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-metalbone",
      generation: "team-light-2026",
      name: "Metalbone Team Light",
      fullName: "Adidas Metalbone Team Light 2026",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-maneuverability",
        "uc-padel-intermediate",
        "uc-padel-arm-comfort",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7535-padel-racket-adidas-metalbone-team-light-2026-8435739405864.html",
      sourceName: "adidas official store (allforpadel.com) Metalbone Team Light 2026",
      shortDescription:
        "Metalbone Team Light 2026: lighter round Metalbone with fiberglass and Soft Performance EVA — not the 16K Pro diamond.",
      verdict:
        "Buy this if you want Metalbone styling and a lighter round face. It is not Metalbone 3.5.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 345,
        weightMax: 360,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "Fiberglass",
        faceMaterial: "fiberglass",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft Performance",
        surfaceTexture: "rough",
        playerLevel: "advanced",
        manufacturerPositioning: "Lightweight Metalbone progression",
        technologies:
          "Octagonal Structure, Low Poly, Extra Power Grip, Spin Blade Gritt, Structural Reinforcement",
      },
      strengths: [
        "Official Team Light: fiberglass + Soft Performance EVA on a round Metalbone",
        "Written for faster reactions and less fatigue",
        "Distinct from 16K Pro Metalbone",
      ],
      weaknesses: [
        "Not 16K aluminised carbon",
        "Official level is still advanced, not Match beginner",
      ],
      relatedProductIds: [
        "prod-adidas-metalbone-3-5-2026",
        "prod-adidas-match-light",
      ],
      alternativeProductIds: [
        "prod-adidas-cross-it-light",
        "prod-adidas-match-light",
      ],
      copy: {
        whatItIs:
          "Team Light 2026 is the accessible Metalbone: round, fiberglass, Soft Performance EVA, Octagonal Structure and Spin Blade Gritt. Official copy is reduced weight and faster reactions. A full gram band was not cleanly captured on the retrieved sheet, so weight keys are omitted.",
        whoItsFor:
          "Intermediate and advancing players who want Metalbone geometry cues without 16K Pro stiffness.",
        howItPlays:
          "Adidas writes comfort and controlled ball output from glass + Soft Performance EVA. Round shape is said to keep weight toward the handle for defensive agility.",
        powerVsControl:
          "Easier than 3.5 / HRD+. Not a smash flagship.",
        handling:
          "Lightness is the product name and the official lead claim.",
        comfort:
          "Fiberglass + Soft Performance EVA is the comfort Metalbone.",
        forgiveness:
          "Round glass face versus 16K diamond. Still listed advanced.",
        construction:
          "Fiberglass, Soft Performance EVA, Octagonal Structure, Low Poly, Spin Blade Gritt.",
        bestFor: [
          "Club players who want a lighter Metalbone",
          "Players moving up from Match who are not ready for 16K",
        ],
        notIdealFor: [
          "Players who want Metalbone 3.5 16K",
          "Absolute beginners — Match Light is the entry-level model",
        ],
        buyIf: [
          "You want the official Metalbone Team Light 2026: round, fiberglass, Soft Performance EVA.",
          "You want Metalbone handling without 16K Pro stiffness.",
        ],
        skipIf: [
          "You want 16K Metalbone 3.5 or HRD+.",
          "You are brand new — look at Match Light.",
        ],
      },
      attributes: attrs({
        power: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Fiberglass Team Light versus 16K diamond Metalbone.",
        },
        control: {
          score: 78,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official copy leads on control, confidence and a round handle-biased shape.",
        },
        forgiveness: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Round glass + soft EVA is more usable than Pro 16K diamonds.",
        },
        maneuverability: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Product is named and sold on reduced weight and faster reactions.",
        },
        comfort: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Soft Performance EVA and fiberglass are specified for a comfortable feel.",
        },
        stability: {
          score: 68,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Octagonal Structure and Low Poly are listed to keep precision without extra fatigue.",
        },
        spin: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Spin Blade Gritt is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maneuverability",
          score: 88,
          explanation: "Official light Metalbone.",
          strengths: ["Reduced weight copy", "Round"],
          compromises: ["Not 16K"],
        },
        {
          useCaseId: "uc-padel-intermediate",
          score: 86,
          explanation: "Progression Metalbone between Match and Pro.",
          strengths: ["Glass + soft EVA"],
          compromises: ["Listed advanced"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 80,
          explanation: "Softer Metalbone stack.",
          strengths: ["Fiberglass", "Soft Performance"],
          compromises: ["Not Match-level discovery"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 54,
          explanation: "Playable; Match Light is the true beginner adidas.",
          strengths: ["Round soft"],
          compromises: ["Advanced listing"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 36,
          explanation: "3.5 or HRD+ for Metalbone power.",
          strengths: [],
          compromises: ["Team Light glass"],
        },
      ],
    },
    {
      id: "prod-adidas-cross-it-light",
      slug: "adidas-cross-it-light-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-cross-it",
      generation: "2026",
      name: "Cross It Light",
      fullName: "Adidas Cross It Light 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maneuverability",
        "uc-padel-control",
        "uc-padel-advanced",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7528-padel-racket-adidas-cross-it-light-2026-martita-ortega-8435739405956.html",
      sourceName: "adidas official store (allforpadel.com) Cross It Light 2026 — Martita Ortega",
      shortDescription:
        "Martita Ortega’s Cross It Light 2026: Soft Energy EVA and Aluminized Carbon 24K with Dynamic Air Flow — a distinct Cross It model.",
      verdict:
        "Buy this if you want the current Cross It Light carbon. Team Light glass models are separate.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 345,
        weightMax: 360,
        thicknessMm: 38,
        face: "Aluminized Carbon 24K",
        faceMaterial: "carbon",
        faceCarbonWeave: "24K Alum",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft Energy",
        playerLevel: "professional",
        manufacturerPositioning: "Maneuverable Cross It / Martita Ortega",
        technologies:
          "Dynamic Air Flow, Extra Power Grip, 11 Thirteen holes, Soft Energy EVA, Aluminized Carbon 24K",
      },
      strengths: [
        "Official Ortega Cross It Light with 24K aluminised carbon",
        "Soft Energy EVA is a different core name from Metalbone Soft Performance",
        "Dynamic Air Flow is the Cross It handling claim",
      ],
      weaknesses: [
        "Not the Cross It CTRL High Memory round",
        "Still a pro carbon, not Match Light",
      ],
      relatedProductIds: [
        "prod-adidas-cross-it-ctrl",
        "prod-adidas-metalbone-team-light",
      ],
      alternativeProductIds: [
        "prod-adidas-cross-it-ctrl",
        "prod-head-coello-motion",
      ],
      copy: {
        whatItIs:
          "Cross It Light 2026 is Martita Ortega’s racket on the official adidas store: Dynamic Air Flow, Extra Power Grip, 11 Thirteen hole pattern, Soft Energy EVA and Aluminized Carbon 24K. Shape/weight keys are omitted where the collection card did not publish a full spec table.",
        whoItsFor:
          "Advanced players who want a faster Cross It carbon, not the Team glass versions.",
        howItPlays:
          "Official line is maneuverability, precision and controlled power with a solid touch from 24K alum + Soft Energy EVA.",
        powerVsControl:
          "Cross It family is adidas’s control/agility line versus Metalbone power. Light is the Ortega carbon model; CTRL is the High Memory control model.",
        handling:
          "Dynamic Air Flow and Extra Power Grip are the handling claims. Light is in the name.",
        comfort:
          "Soft Energy EVA is specified for ball output with a solid touch.",
        forgiveness:
          "More agile Cross It than a Metalbone diamond; still pro carbon.",
        construction:
          "24K aluminised carbon, Soft Energy EVA, Dynamic Air Flow, 11 Thirteen holes.",
        bestFor: [
          "Advanced players who want Ortega’s Cross It Light",
          "Pairs who value hand speed over Metalbone smash",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Cross It CTRL High Memory",
        ],
        buyIf: [
          "You want the official Cross It Light 2026 with 24K aluminised carbon and Soft Energy EVA.",
          "You already play at a high level and want Cross It speed, not Metalbone HRD+.",
        ],
        skipIf: [
          "You want Cross It CTRL.",
          "You need a beginner fiberglass adidas.",
        ],
      },
      attributes: attrs({
        power: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "24K alum Cross It Light — controlled power, not Metalbone HRD+.",
        },
        control: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official Cross It positioning is precision and controlled power.",
        },
        forgiveness: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Pro carbon Light. More usable than a smash diamond; not Match Light.",
        },
        maneuverability: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official lead claim is maneuverability and Dynamic Air Flow.",
        },
        comfort: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Soft Energy EVA is specified for output with a solid touch.",
        },
        stability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "24K alum + Extra Power Grip. Not Octagonal Metalbone.",
        },
        spin: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "No Spin Blade Decal named on the collection card; omitted as a hard claim.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maneuverability",
          score: 92,
          explanation: "Ortega Cross It Light is sold on hand speed.",
          strengths: ["Dynamic Air Flow", "Light model"],
          compromises: ["Pro carbon"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 84,
          explanation: "Cross It family control/agility.",
          strengths: ["Soft Energy EVA"],
          compromises: ["CTRL is the High Memory control model"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Pro Ortega carbon.",
          strengths: ["24K alum"],
          compromises: ["Not a starter"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 26,
          explanation: "Match Light, not Cross It Light.",
          strengths: [],
          compromises: ["Pro 24K"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 50,
          explanation: "Metalbone HRD+ / 3.5 for adidas power.",
          strengths: [],
          compromises: ["Cross It Light"],
        },
      ],
    },
    {
      id: "prod-adidas-cross-it-ctrl",
      slug: "adidas-cross-it-ctrl-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-cross-it",
      generation: "ctrl-2026",
      name: "Cross It CTRL",
      fullName: "Adidas Cross It CTRL 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7527-padel-racket-adidas-cross-it-ctrl-2026-8435739405949.html",
      sourceName: "adidas official store (allforpadel.com) Cross IT Ctrl 2026",
      shortDescription:
        "Cross It CTRL 2026: round, Carbon Aluminized 15K and EVA High Memory with Dynamic Air Flow — not Cross It Light.",
      verdict:
        "Buy this if you want the firm High Memory Cross It control racket. Light is Ortega’s 24K Soft Energy model.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        face: "Carbon Aluminized 15K",
        faceMaterial: "carbon",
        faceCarbonWeave: "15K Alum",
        core: "hard-EVA",
        manufacturerCoreName: "EVA High Memory",
        playerLevel: "professional",
        manufacturerPositioning: "Precision control / Cross It CTRL",
        technologies: "Dynamic Air Flow, Carbon Aluminized 15K, EVA High Memory",
      },
      strengths: [
        "Official round Cross It CTRL with 15K alum and High Memory EVA",
        "Distinct from Cross It Light’s Soft Energy / 24K stack",
        "Dynamic Air Flow remains the Cross It aero claim",
      ],
      weaknesses: [
        "High Memory is firmer than Light",
        "Still a pro control carbon",
      ],
      relatedProductIds: [
        "prod-adidas-cross-it-light",
        "prod-adidas-metalbone-ctrl",
      ],
      alternativeProductIds: [
        "prod-adidas-cross-it-light",
        "prod-adidas-metalbone-ctrl",
      ],
      copy: {
        whatItIs:
          "The official store describes Cross IT Ctrl 2026 as a round racket with Carbon Aluminized 15K, EVA High Memory and Dynamic Air Flow for stability, precise feel and quick response.",
        whoItsFor:
          "Advanced control players who want a firmer Cross It than Ortega Light.",
        howItPlays:
          "High Memory on a round Cross It is a precise, quick face — not a soft beginner rubber.",
        powerVsControl:
          "Control-first Cross It. Metalbone CTRL is the other adidas round control flagship.",
        handling:
          "Dynamic Air Flow is the speed claim. Weight omitted — not on the listing card.",
        comfort:
          "High Memory is denser than Soft Energy Light.",
        forgiveness:
          "Round helps versus diamonds; High Memory does not.",
        construction:
          "15K aluminised carbon, High Memory EVA, Dynamic Air Flow, round mould.",
        bestFor: [
          "Advanced players who want a firm Cross It control racket",
          "Players who found Light too lively and Metalbone diamond too extreme",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Ortega’s Soft Energy Light",
        ],
        buyIf: [
          "You want the official Cross It CTRL 2026: round, 15K aluminised carbon, High Memory EVA.",
          "You already play at a high level and want a firm control Cross It.",
        ],
        skipIf: [
          "You want Cross It Light 24K Soft Energy.",
          "You need Match Light.",
        ],
      },
      attributes: attrs({
        power: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "High Memory on a round Cross It — precise punch, not a smash diamond.",
        },
        control: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official precision-control Cross IT Ctrl copy.",
        },
        forgiveness: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "Round outline, High Memory face. Firmer than Light.",
        },
        maneuverability: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Dynamic Air Flow and quick-response copy.",
        },
        comfort: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "High Memory EVA is the dense rubber. Light uses Soft Energy.",
        },
        stability: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official listing leads on exceptional stability.",
        },
        spin: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "No named spin system on the category card.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 92,
          explanation: "Official Cross It CTRL.",
          strengths: ["Round", "High Memory precision"],
          compromises: ["Firm"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Pro control carbon.",
          strengths: ["15K alum"],
          compromises: ["Not Light’s soft energy"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 84,
          explanation: "Tournament-level Cross It control.",
          strengths: ["Dynamic Air Flow"],
          compromises: ["Demanding EVA"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 24,
          explanation: "Wrong adidas for new players.",
          strengths: [],
          compromises: ["High Memory pro"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 48,
          explanation: "Metalbone HRD+ is the power adidas.",
          strengths: [],
          compromises: ["Round CTRL"],
        },
      ],
    },
    {
      id: "prod-adidas-arrow-hit-ctrl",
      slug: "adidas-arrow-hit-ctrl-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-arrow-hit",
      generation: "ctrl-2026",
      name: "Arrow Hit CTRL",
      fullName: "Adidas Arrow Hit CTRL 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-balanced",
        "uc-padel-advanced",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7526-padel-racket-adidas-arrow-hit-ctrl-8435739405895.html",
      sourceName: "adidas official store (allforpadel.com) Arrow Hit CTRL",
      shortDescription:
        "Arrow Hit CTRL 2026: round, even balance, 360–375 g, ASC face, Soft Performance EVA and Intelligent Balance System.",
      verdict:
        "Buy this if you want the new Arrow Hit control model with IBS. The diamond Arrow Hit is a different product.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        face: "ASC carbon",
        faceMaterial: "carbon",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft Performance",
        playerLevel: "professional",
        manufacturerPositioning: "Adaptive control / IBS",
        technologies:
          "Intelligent Balance System, Structural Reinforcement, Muscle Power System, Power Groove, Extra Power Grip, Spin Blade Decal, Smart Holes Curve",
        sweetSpot: "medium",
      },
      strengths: [
        "Official IBS adjustable-balance Arrow Hit CTRL",
        "Round, even, 360–375 g, Soft Performance EVA",
        "Not a cosmetic of the diamond Arrow Hit",
      ],
      weaknesses: [
        "360–375 g is a full adult band",
        "PRO level — not Match Light",
      ],
      relatedProductIds: [
        "prod-adidas-arrow-hit-attk",
        "prod-adidas-metalbone-ctrl",
      ],
      alternativeProductIds: [
        "prod-adidas-arrow-hit-attk",
        "prod-adidas-metalbone-ctrl",
      ],
      copy: {
        whatItIs:
          "Arrow Hit CTRL 2026 is listed PRO, round, even balance, 360–375 g, 38 mm, 455 mm length, EVA Soft Performance, ASC face, centre sweet spot and Intelligent Balance System.",
        whoItsFor:
          "Advanced players who want a new adidas family with adjustable balance on a round control mould.",
        howItPlays:
          "Official copy is adaptive control: IBS to shift balance, Soft Performance EVA for output, Spin Blade Decal for spin.",
        powerVsControl:
          "CTRL is the round Arrow Hit. The diamond Arrow Hit is the attack sibling.",
        handling:
          "Even balance plus IBS. Static weight 360–375 g.",
        comfort:
          "Soft Performance EVA. Still a 360 g+ pro carbon.",
        forgiveness:
          "Centre sweet spot on a round face. Level is PRO.",
        construction:
          "ASC, Soft Performance EVA, IBS, Power Groove, Extra Power Grip, Spin Blade Decal.",
        bestFor: [
          "Advanced players who want Arrow Hit CTRL with IBS",
          "Control players curious about the 2026 Arrow Hit family",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the diamond Arrow Hit ATTK",
        ],
        buyIf: [
          "You want the official Arrow Hit CTRL: round, even, 360–375 g, Soft Performance EVA and IBS.",
          "You already play at a high level and want adjustable balance on a control mould.",
        ],
        skipIf: [
          "You want the diamond Arrow Hit.",
          "You need a beginner adidas.",
        ],
      },
      attributes: attrs({
        power: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Round even Arrow Hit with Soft Performance EVA. The Attack version is the diamond.",
        },
        control: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official adaptive-control Arrow Hit CTRL copy.",
        },
        forgiveness: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "Round centre sweet spot; 360–375 g PRO carbon.",
        },
        maneuverability: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Even balance; IBS can shift it. Weight is a full adult band.",
        },
        comfort: {
          score: 72,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Soft Performance EVA is specified.",
        },
        stability: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Structural Reinforcement, Muscle Power System and Power Groove are listed.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Spin Blade Decal and Smart Holes Curve are specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 88,
          explanation: "Official Arrow Hit control model.",
          strengths: ["Round", "IBS"],
          compromises: ["360 g+"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 84,
          explanation: "Even balance with optional IBS shift.",
          strengths: ["Soft Performance EVA"],
          compromises: ["PRO demand"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 86,
          explanation: "PRO Arrow Hit.",
          strengths: ["ASC carbon"],
          compromises: ["Not beginner"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 24,
          explanation: "Match Light instead.",
          strengths: [],
          compromises: ["PRO 360 g+"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 54,
          explanation: "Arrow Hit diamond / Metalbone HRD+.",
          strengths: [],
          compromises: ["Round CTRL"],
        },
      ],
    },
    {
      id: "prod-adidas-arrow-hit-attk",
      slug: "adidas-arrow-hit-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-arrow-hit",
      generation: "2026",
      name: "Arrow Hit",
      fullName: "Adidas Arrow Hit 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7523-padel-racket-adidas-arrow-hit-8435739405888.html",
      sourceName: "adidas official store (allforpadel.com) Arrow Hit 2026",
      shortDescription:
        "Arrow Hit 2026 attack model: diamond mould and Intelligent Balance System — not the round CTRL.",
      verdict:
        "Buy this if you want the diamond Arrow Hit. CTRL is the round IBS sibling.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft Performance",
        playerLevel: "professional",
        manufacturerPositioning: "Adjustable attacking Arrow Hit",
        technologies:
          "Intelligent Balance System, Extra Power Grip, Muscle Power System, Spin Blade Decal, Soft Performance EVA",
      },
      strengths: [
        "Official diamond Arrow Hit with IBS",
        "Separate product from Arrow Hit CTRL",
      ],
      weaknesses: [
        "IBS adjustable balance means published Head Heavy is a starting point, not a fixed lab lock",
        "PRO attack diamond",
      ],
      relatedProductIds: ["prod-adidas-arrow-hit-ctrl", "prod-adidas-metalbone-3-5-2026"],
      alternativeProductIds: [
        "prod-adidas-arrow-hit-ctrl",
        "prod-adidas-metalbone-3-5-2026",
      ],
      copy: {
        whatItIs:
          "The official 2026 collection describes Arrow Hit as intelligent-balance technology, structural reinforcements and a diamond shape for accurate, explosive impact. CTRL is the documented round sibling.",
        whoItsFor:
          "Advanced attackers who want the new Arrow Hit diamond, not Metalbone 3.5.",
        howItPlays:
          "Adidas pitches adjustable precision and controlled power for competitive attackers. Spec keys not on the card are omitted.",
        powerVsControl:
          "Diamond Arrow Hit versus round CTRL. Both use IBS.",
        handling:
          "IBS is the handling story. Grams omitted.",
        comfort:
          "Unknown core name on the collection card — omitted.",
        forgiveness:
          "Diamond attack mould. Low beginner fit.",
        construction:
          "Diamond Arrow Hit with IBS and structural reinforcements. Face/core omitted pending a full spec table.",
        bestFor: [
          "Advanced attackers who want the diamond Arrow Hit",
          "Players who like IBS and a smash-oriented outline",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Arrow Hit CTRL",
        ],
        buyIf: [
          "You want the official diamond Arrow Hit 2026 with Intelligent Balance System.",
          "You already attack and do not want the round CTRL.",
        ],
        skipIf: [
          "You want Arrow Hit CTRL’s published 360–375 g round sheet.",
          "You need a beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official diamond Arrow Hit copy is explosive, accurate impact for attackers.",
        },
        control: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "IBS can tune balance; mould is still diamond. CTRL is the control model.",
        },
        forgiveness: {
          score: 44,
          kind: "SPEC_INFERENCE",
          reasoning: "Diamond attack mould without a published large sweet spot.",
        },
        maneuverability: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "IBS is the adjustment claim. No published light band.",
        },
        comfort: {
          score: 56,
          kind: "SPEC_INFERENCE",
          reasoning: "Core not published on the collection card. Not treated as Soft Performance.",
        },
        stability: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Structural reinforcements are named on the official card.",
        },
        spin: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Spin system not named on the collection card.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 86,
          explanation: "Official diamond Arrow Hit.",
          strengths: ["Diamond", "IBS"],
          compromises: ["Incomplete public spec table"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 86,
          explanation: "Competitive attacker positioning.",
          strengths: ["New 2026 family"],
          compromises: ["Demanding mould"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 84,
          explanation: "Pro Arrow Hit attack model.",
          strengths: ["IBS"],
          compromises: ["CTRL is easier to document"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 16,
          explanation: "Not a first racket.",
          strengths: [],
          compromises: ["Diamond pro"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 58,
          explanation: "Buy Arrow Hit CTRL for the round IBS.",
          strengths: ["IBS"],
          compromises: ["Diamond"],
        },
      ],
    },
    {
      id: "prod-adidas-match-light",
      slug: "adidas-match-light-2026",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-rx",
      generation: "match-2026",
      name: "Match Light",
      fullName: "Adidas Match Light 2026",
      lifecycle: "current",
      experienceLevels: ["beginner"],
      useCaseIds: [
        "uc-padel-beginner",
        "uc-padel-easy-power",
        "uc-padel-arm-comfort",
      ],
      sourceUrl:
        "https://allforpadel.com/en/padel-rackets/7495-padel-racket-adidas-match-light-2026-8435739406076.html",
      sourceName: "adidas official store (allforpadel.com) Match Light 2026",
      shortDescription:
        "Match Light 2026 beginner racket: allround shape, fiberglass, Soft Performance EVA — adidas’s entry-level model, not Metalbone.",
      verdict:
        "Buy this to learn. The name says Light; the official weight is still 360–375 g with a slightly high balance.",
      specifications: {
        shape: "hybrid",
        balance: "mid-high",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        face: "Fiberglass",
        faceMaterial: "fiberglass",
        core: "soft-EVA",
        manufacturerCoreName: "EVA Soft Performance",
        playerLevel: "beginner",
        manufacturerPositioning: "Beginner / allround discovery",
        technologies: "Structural Reinforcement, Smart Holes Lineal, Fiberglass",
        sweetSpot: "medium",
      },
      strengths: [
        "Official beginner Match with fiberglass and Soft Performance EVA",
        "Allround shape and middle sweet spot",
        "Honest discovery racket — not a fake Metalbone",
      ],
      weaknesses: [
        "Official weight 360–375 g and slightly head-heavy — not an ultralight",
        "Little help if you already smash at a high level",
      ],
      relatedProductIds: [
        "prod-adidas-metalbone-team-light",
        "prod-bullpadel-indiga-ctr",
      ],
      alternativeProductIds: [
        "prod-bullpadel-indiga-ctr",
        "prod-kuikma-pr-soft-500",
      ],
      copy: {
        whatItIs:
          "Match Light 2026 is listed beginner, attack-type game, allround shape, slightly head-heavy, 360–375 g, 38 mm, 520 cm², Soft Performance EVA, fiberglass, middle sweet spot.",
        whoItsFor:
          "New players. Allround here is stored as hybrid — adidas’s word is Allround, not a verified teardrop drawing.",
        howItPlays:
          "Official copy is soft touch and high ball output from glass + Soft Performance EVA so you can play longer while you learn.",
        powerVsControl:
          "Easy output, not Metalbone power. Type of game is listed Attack, which for a beginner allround means help sending the ball, not a diamond smash mould.",
        handling:
          "Name says Light; published band is 360–375 g with a slightly high balance. Say that out loud before you buy it for a small player.",
        comfort:
          "Fiberglass + Soft Performance EVA is the comfort story.",
        forgiveness:
          "Middle sweet spot and allround outline. Best adidas on-ramp in this file.",
        construction:
          "Fiberglass, Soft Performance EVA, Structural Reinforcement, Smart Holes Lineal.",
        bestFor: [
          "Beginners who want an official adidas first racket",
          "Casual players who want a soft glass face",
        ],
        notIdealFor: [
          "Advanced Metalbone shoppers",
          "Anyone who needs a true sub-340 g frame",
        ],
        buyIf: [
          "You are starting and want Match Light 2026: fiberglass, Soft Performance EVA, allround mould.",
          "You understand the official 360–375 g band — Light is the line name, not a 320 g promise.",
        ],
        skipIf: [
          "You already play at an advanced level — look at Team Light or Metalbone.",
          "You need a 300 g ultralight (Head One).",
        ],
      },
      attributes: attrs({
        power: {
          score: 48,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft glass beginner face. Listed attack-type is easy output, not a smash diamond.",
        },
        control: {
          score: 72,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Allround beginner with a middle sweet spot.",
        },
        forgiveness: {
          score: 84,
          kind: "SPEC_INFERENCE",
          reasoning: "Fiberglass + soft EVA + allround outline is a forgiving starter recipe.",
        },
        maneuverability: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "360–375 g and slightly high balance. Not actually light.",
        },
        comfort: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official soft touch and Soft Performance EVA.",
        },
        stability: {
          score: 56,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Structural Reinforcement is listed; it is still a beginner glass frame.",
        },
        spin: {
          score: 42,
          kind: "SPEC_INFERENCE",
          reasoning: "Smart Holes Lineal is a durability/hole story, not a 3D spin face.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 90,
          explanation: "Official adidas beginner Match.",
          strengths: ["Glass", "Soft EVA"],
          compromises: ["360–375 g"],
        },
        {
          useCaseId: "uc-padel-easy-power",
          score: 78,
          explanation: "Soft face helps the ball leave while you learn.",
          strengths: ["Soft Performance EVA"],
          compromises: ["Not a diamond"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 84,
          explanation: "Soft glass beginner stack.",
          strengths: ["Fiberglass"],
          compromises: ["Slightly high balance"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 30,
          explanation: "You will want Team Light or Metalbone soon.",
          strengths: [],
          compromises: ["Beginner Match"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 22,
          explanation: "Wrong family.",
          strengths: [],
          compromises: ["Discovery glass"],
        },
      ],
    },
    {
      id: "prod-adidas-metalbone-3-3-2026",
      existing: true,
      slug: "adidas-metalbone-3-3",
      brandId: "brand-adidas-padel",
      familyId: "fam-adidas-metalbone",
      generation: "3.3",
      name: "Metalbone 3.3",
      fullName: "Adidas Metalbone 3.3",
      lifecycle: "previous-generation",
      experienceLevels: ["intermediate", "advanced", "elite"],
      useCaseIds: ["uc-padel-power", "uc-padel-balanced"],
      sourceUrl: "https://allforpadel.com/en/54-padel-rackets",
      sourceName: "adidas official store (allforpadel.com) — Metalbone 3.3 superseded by Metalbone 2026 / 3.5",
      shortDescription:
        "Previous-generation Metalbone 3.3 diamond — superseded by Metalbone 2026 / 3.5. Do not treat this ID as the current Galán flagship.",
      verdict:
        "A previous Metalbone if you find it priced as one. The current adjustable 16K Soft Performance Metalbone is 3.5 / 2026.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        face: "Carbon Aluminized",
        faceMaterial: "carbon",
        core: "soft-EVA",
        manufacturerCoreName: "Soft Performance EVA",
        playerLevel: "advanced",
        manufacturerPositioning: "Previous-generation Metalbone diamond",
        sweetSpot: "medium",
      },
      strengths: [
        "Known Metalbone diamond + Weight & Balance generation",
        "Value once 3.5 is on the shelf",
      ],
      weaknesses: [
        "Superseded by Metalbone 2026 / 3.5",
        "Catalog previously labelled this as the current Metalbone 2026",
      ],
      relatedProductIds: [
        "prod-adidas-metalbone-3-5-2026",
        "prod-adidas-metalbone-hrd",
      ],
      alternativeProductIds: [
        "prod-adidas-metalbone-3-5-2026",
        "prod-bullpadel-hack-03",
      ],
      copy: {
        whatItIs:
          "Metalbone 3.3 is the previous Galán diamond (commonly Soft Performance EVA, aluminised carbon, Weight & Balance). The live official flagship is Metalbone 2026 / 3.5. This patch stops the old row pretending to be current.",
        whoItsFor:
          "Players buying previous-gen on purpose. New Metalbone shoppers should look at 3.5, HRD+, CTRL or Team Light.",
        howItPlays:
          "Same family idea — attacking diamond with a softer EVA than HRD. 3.5 updates the 2026 kit (including the published 345–360 g + plates band).",
        powerVsControl:
          "Previous Metalbone attack. Current diamond Soft Performance is 3.5.",
        handling:
          "Older listings sat in a 365–375 g band. 3.5 publishes 345–360 + plates.",
        comfort:
          "Soft Performance EVA generation, not High Memory.",
        forgiveness:
          "Pro diamond. Not Match Light.",
        construction:
          "Aluminised carbon, Soft Performance EVA, diamond. Current 16K / 3.5 tech lives on the newer model.",
        bestFor: [
          "Discount shoppers who want previous Metalbone 3.3",
          "Players replacing a worn 3.3",
        ],
        notIdealFor: [
          "Anyone who wants current Metalbone 3.5",
          "Beginners",
        ],
        buyIf: [
          "You know this is previous-generation Metalbone 3.3, not 3.5 / 2026.",
          "The price gap versus the current Metalbone is the reason.",
        ],
        skipIf: [
          "You want the current official Metalbone — that is 3.5 / 2026 or HRD+ 2026.",
          "You need a beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 84,
          kind: "SPEC_INFERENCE",
          reasoning: "Previous Metalbone diamond. Current Soft Performance flagship is 3.5.",
        },
        control: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "Attack diamond, softer EVA than HRD.",
        },
        forgiveness: {
          score: 46,
          kind: "SPEC_INFERENCE",
          reasoning: "Pro Metalbone diamond.",
        },
        maneuverability: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Older 365–375 g listings. 3.5’s base band is lighter before plates.",
        },
        comfort: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft Performance EVA generation.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Metalbone octagonal-generation carbon frame.",
        },
        spin: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Spin Blade family texture on this generation.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 82,
          explanation: "Previous Metalbone diamond. Current is 3.5 / HRD+.",
          strengths: ["Metalbone attack"],
          compromises: ["Superseded"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 74,
          explanation: "Softer EVA than HRD on an older diamond.",
          strengths: ["Soft Performance"],
          compromises: ["Not current"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 22,
          explanation: "Previous pro diamond.",
          strengths: [],
          compromises: ["Old flagship"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 76,
          explanation: "HRD+ 2026 if you want the current stiff Metalbone.",
          strengths: ["Diamond"],
          compromises: ["Not HRD+ 2026"],
        },
      ],
    },
  ];
}
