import type { RacketDraft } from "@/content/padel/rackets/build";
import { attrs } from "@/content/padel/rackets/nox";

export function headBabolatDrafts(): RacketDraft[] {
  return [
    {
      id: "prod-head-coello-pro",
      existing: true,
      slug: "head-coello-pro-2026",
      brandId: "brand-head-padel",
      familyId: "fam-head-coello",
      generation: "pro-2026",
      name: "Coello Pro",
      fullName: "HEAD Coello Pro 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maximum-power",
        "uc-padel-power",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.head.com/en/product/coello-pro-2026-225036",
      sourceName: "HEAD (head.com) Coello Pro 2026",
      shortDescription:
        "Arturo Coello’s 2026 Pro: diamond, 370 g, high balance 272, Carbon Hybrid, Power FOAM, Extreme Spin — not a beginner teardrop.",
      verdict:
        "Buy this if you already finish overheads and can swing a 370 g high-balance diamond. The old catalog row that called this a forgiving beginner hybrid was wrong.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 370,
        weightMax: 370,
        thicknessMm: 38,
        face: "Carbon Hybrid",
        faceMaterial: "carbon-hybrid",
        core: "foam",
        manufacturerCoreName: "Power FOAM",
        surfaceTexture: "3d-textured",
        feel: "firm",
        playerLevel: "professional",
        manufacturerPositioning: "Finisher / explosive power",
        technologies: "Carbon Hybrid, Power FOAM, Extreme Spin",
        sweetSpot: "compact",
      },
      strengths: [
        "HEAD lists diamond, 370 g, high balance 272, Power FOAM and Extreme Spin",
        "Written for tournament/expert attackers — Coello’s Pro, not Team",
        "Carbon Hybrid is a higher-carbon mix, not a soft club fiberglass",
      ],
      weaknesses: [
        "370 g + 272 mm balance is slow if your smash is late",
        "Not Coello Motion (360 g) or Team (fiberglass, no roughness)",
      ],
      relatedProductIds: [
        "prod-head-coello-motion",
        "prod-head-coello-team",
        "prod-head-extreme-pro-padel",
      ],
      alternativeProductIds: [
        "prod-bullpadel-xplo",
        "prod-adidas-metalbone-hrd",
      ],
      copy: {
        whatItIs:
          "HEAD’s Coello Pro 2026 page is unambiguous: tournament/expert, finisher, explosive power, diamond, hard. Specs: 370 g, high balance 272, Carbon Hybrid face, Power FOAM, Extreme Spin 3D decal.",
        whoItsFor:
          "Advanced and elite attackers in Coello’s mould. If you are learning, this is the wrong Head — look at One Ultralight or Coello Team.",
        howItPlays:
          "HEAD says Power FOAM is the most reactive foam for smash, X3 and X4, and that high balance puts mass in the head for overheads. Manufacturer claim, not a Kitletics lab test.",
        powerVsControl:
          "This is the power Coello. Motion is the 360 g diamond; Team is the fiberglass soft diamond.",
        handling:
          "HEAD classifies it heavy-weight. 370 g and 272 mm balance need a prepared swing.",
        comfort:
          "Hard / Power FOAM. Team is the comfort Coello.",
        forgiveness:
          "Diamond finisher. Off-centre balls will not feel like Gravity or One.",
        construction:
          "Diamond, Carbon Hybrid, Power FOAM, Extreme Spin, 370 g, balance 272.",
        bestFor: [
          "Advanced finishers who want Coello’s 2026 Pro diamond",
          "Players who can swing 370 g at 272 mm balance",
        ],
        notIdealFor: [
          "Beginners — this was never a starter teardrop",
          "Players who want Coello Motion or Team",
        ],
        buyIf: [
          "You want the official Coello Pro: diamond, 370 g, high balance 272, Carbon Hybrid, Power FOAM, Extreme Spin.",
          "You already play at tournament or strong-club attack level.",
        ],
        skipIf: [
          "You are learning — One Ultralight or Coello Team.",
          "You want the 360 g Coello Motion.",
        ],
      },
      attributes: attrs({
        power: {
          score: 94,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD tags Finisher / Explosive Power / Power FOAM for smash and X3/X4.",
        },
        control: {
          score: 56,
          kind: "SPEC_INFERENCE",
          reasoning: "Diamond + 272 mm high balance. Control Coellos do not exist; Gravity is Head’s control family.",
        },
        forgiveness: {
          score: 36,
          kind: "SPEC_INFERENCE",
          reasoning: "Expert diamond, hard feel, 370 g. Low tolerance.",
        },
        maneuverability: {
          score: 48,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD says high balance needs more effort to manoeuvre.",
        },
        comfort: {
          score: 46,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official feel is Hard. Team is Soft with fiberglass.",
        },
        stability: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD’s heavy-weight copy is stability and extra momentum on attack.",
        },
        spin: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Extreme Spin is specified as a rough 3D decal.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maximum-power",
          score: 94,
          explanation: "HEAD’s Coello Pro is a 370 g high-balance diamond finisher.",
          strengths: ["Power FOAM", "272 balance"],
          compromises: ["Brutal if late"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 92,
          explanation: "Official explosive-power Coello.",
          strengths: ["Diamond", "Carbon Hybrid"],
          compromises: ["370 g"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 90,
          explanation: "Tournament/expert positioning.",
          strengths: ["Coello Pro"],
          compromises: ["Not Motion"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 12,
          explanation: "The opposite of a first racket. This ID was wrongly sold as one in the old seed.",
          strengths: [],
          compromises: ["370 g diamond"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 38,
          explanation: "Gravity Pro / Motion if you want Head control.",
          strengths: [],
          compromises: ["Finisher diamond"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 28,
          explanation: "Coello Team or One Ultralight.",
          strengths: [],
          compromises: ["Hard Power FOAM"],
        },
      ],
    },
    {
      id: "prod-head-coello-motion",
      slug: "head-coello-motion-2026",
      brandId: "brand-head-padel",
      familyId: "fam-head-coello",
      generation: "motion-2026",
      name: "Coello Motion",
      fullName: "HEAD Coello Motion 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-maneuverability",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.head.com/product/coello-motion-2026-225046",
      sourceName: "HEAD (head.com) Coello Motion 2026",
      shortDescription:
        "Coello Motion 2026: diamond, 360 g, high balance 268, Carbon Hybrid, Power FOAM, Extreme Spin — the lighter Pro-construction Coello.",
      verdict:
        "Buy this if you want Coello’s carbon diamond at 360 g. Pro is 370/272; Team is fiberglass.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 360,
        face: "Carbon Hybrid",
        faceMaterial: "carbon-hybrid",
        core: "foam",
        manufacturerCoreName: "Power FOAM",
        surfaceTexture: "3d-textured",
        feel: "firm",
        playerLevel: "advanced",
        manufacturerPositioning: "Finisher / explosive power / more mobile",
        technologies: "Carbon Hybrid, Power FOAM, Extreme Spin",
      },
      strengths: [
        "Official 360 g Coello diamond with the same Carbon Hybrid / Power FOAM / Extreme Spin stack as Pro",
        "High balance 268 — still an attacker, easier than 370/272",
      ],
      weaknesses: [
        "Still a hard diamond",
        "Not Team’s soft fiberglass",
      ],
      relatedProductIds: ["prod-head-coello-pro", "prod-head-extreme-motion-2026"],
      alternativeProductIds: ["prod-head-coello-pro", "prod-head-coello-team"],
      copy: {
        whatItIs:
          "HEAD lists Coello Motion 2026 as midweight 360 g, high balance 268, Carbon Hybrid, Power FOAM, Extreme Spin, diamond, hard, finisher.",
        whoItsFor:
          "Advanced and tournament players who want Coello power without Pro’s 370 g.",
        howItPlays:
          "Same Power FOAM / Extreme Spin story as Pro on a 10 g lighter, slightly lower-balance diamond.",
        powerVsControl:
          "Attack Coello. Less mass than Pro.",
        handling:
          "360 g is the Motion reason to exist.",
        comfort:
          "Still hard. Team is soft.",
        forgiveness:
          "Diamond finisher, more swingable than Pro.",
        construction:
          "Diamond, Carbon Hybrid, Power FOAM, Extreme Spin, 360 g, balance 268.",
        bestFor: [
          "Advanced attackers who found Coello Pro too heavy",
          "Players who want Coello carbon, not Team glass",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the 370 g Pro",
        ],
        buyIf: [
          "You want official Coello Motion: 360 g, balance 268, Carbon Hybrid, Power FOAM, Extreme Spin.",
          "You already attack and want a faster Coello diamond than Pro.",
        ],
        skipIf: [
          "You want Coello Pro’s 370/272 mass.",
          "You need Team’s soft fiberglass.",
        ],
      },
      attributes: attrs({
        power: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Same Finisher / Power FOAM tags as Pro on a 360 g diamond.",
        },
        control: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "Still a high-balance diamond. Easier than 370 g, not Gravity.",
        },
        forgiveness: {
          score: 44,
          kind: "SPEC_INFERENCE",
          reasoning: "Hard diamond. 360 g helps timing versus Pro.",
        },
        maneuverability: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD midweight 360 g versus Pro heavy-weight 370 g.",
        },
        comfort: {
          score: 50,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official feel Hard. Team is Soft.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon Hybrid diamond, 10 g under Pro.",
        },
        spin: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Extreme Spin 3D decal is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 88,
          explanation: "Coello carbon diamond at 360 g.",
          strengths: ["Power FOAM", "Extreme Spin"],
          compromises: ["Still hard"],
        },
        {
          useCaseId: "uc-padel-maneuverability",
          score: 78,
          explanation: "The mobile Coello carbon versus Pro.",
          strengths: ["360 g"],
          compromises: ["High balance 268"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "HEAD advanced/tournament Motion.",
          strengths: ["Carbon Hybrid"],
          compromises: ["Not Team"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 20,
          explanation: "Still a Coello diamond.",
          strengths: [],
          compromises: ["Hard diamond"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 76,
          explanation: "Pro is the heavier finisher.",
          strengths: ["Same foam family"],
          compromises: ["Less mass than 370 g"],
        },
      ],
    },
    {
      id: "prod-head-coello-team",
      slug: "head-coello-team-2026",
      brandId: "brand-head-padel",
      familyId: "fam-head-coello",
      generation: "team-2026",
      name: "Coello Team",
      fullName: "HEAD Coello Team 2026",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-easy-power",
        "uc-padel-intermediate",
        "uc-padel-arm-comfort",
      ],
      sourceUrl: "https://www.head.com/product/coello-team-2026-225056",
      sourceName: "HEAD (head.com) Coello Team 2026",
      shortDescription:
        "Coello Team 2026: diamond, 360 g, high balance 270, fiberglass, Power FOAM, no roughness — easy-power Coello, not Pro.",
      verdict:
        "Buy this if you want Coello’s diamond with a soft glass face. It is not the Carbon Hybrid Pro.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 360,
        face: "Fiberglass",
        faceMaterial: "fiberglass",
        core: "foam",
        manufacturerCoreName: "Power FOAM",
        surfaceTexture: "smooth",
        feel: "soft",
        playerLevel: "intermediate",
        manufacturerPositioning: "Easy power / Coello Team",
        technologies: "Fiberglass, Power FOAM, no roughness",
      },
      strengths: [
        "Official soft / fiberglass Coello diamond",
        "Power FOAM still on the sheet for easier ball exit",
        "Smooth face — HEAD lists no roughness",
      ],
      weaknesses: [
        "High balance 270 on a diamond — not a round beginner",
        "Less spin hardware than Pro/Motion Extreme Spin",
      ],
      relatedProductIds: ["prod-head-coello-pro", "prod-head-one-ultralight"],
      alternativeProductIds: ["prod-head-coello-motion", "prod-adidas-match-light"],
      copy: {
        whatItIs:
          "HEAD: easy power meets comfort. Coello Team 2026 is 360 g, high balance 270, fiberglass, Power FOAM, no roughness, diamond, soft, for intermediate and advanced players.",
        whoItsFor:
          "Club players who want Coello’s outline without Carbon Hybrid stiffness. Still a high-balance diamond.",
        howItPlays:
          "Glass + Power FOAM is the easy-exit story. Smooth face is for a direct hit, not Extreme Spin.",
        powerVsControl:
          "Easier than Pro. Not Gravity control.",
        handling:
          "360 g midweight. Balance still high.",
        comfort:
          "Official Soft feel. The comfort Coello.",
        forgiveness:
          "Softer face helps; diamond + 270 mm balance does not make it One Ultralight.",
        construction:
          "Fiberglass, Power FOAM, smooth face, 360 g, balance 270, diamond.",
        bestFor: [
          "Intermediates who want Coello shape with a soft face",
          "Players who liked the Coello look and not Pro’s hardness",
        ],
        notIdealFor: [
          "Players who want Extreme Spin Carbon Hybrid",
          "Absolute beginners who need One Ultralight",
        ],
        buyIf: [
          "You want official Coello Team: fiberglass, Power FOAM, 360 g, balance 270, soft, no roughness.",
          "You already play a bit and want easier Coello power than Pro.",
        ],
        skipIf: [
          "You want Coello Pro or Motion carbon.",
          "You need a 300 g first racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD’s easy-power Team with Power FOAM on a diamond.",
        },
        control: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft glass helps placement; high-balance diamond is still attack-shaped.",
        },
        forgiveness: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Soft fiberglass versus Pro hybrid carbon. Outline remains diamond.",
        },
        maneuverability: {
          score: 68,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Midweight 360 g; high balance 270.",
        },
        comfort: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official Soft feel and fiberglass face.",
        },
        stability: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "360 g diamond. Less carbon mass than Pro.",
        },
        spin: {
          score: 40,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD specifies no roughness / flat surface.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-easy-power",
          score: 86,
          explanation: "Official easy-power Coello.",
          strengths: ["Soft glass", "Power FOAM"],
          compromises: ["High balance"],
        },
        {
          useCaseId: "uc-padel-intermediate",
          score: 84,
          explanation: "HEAD intermediate/advanced Team.",
          strengths: ["Softer than Pro"],
          compromises: ["Still a diamond"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 78,
          explanation: "The soft Coello. Not One Ultralight.",
          strengths: ["Fiberglass", "Soft"],
          compromises: ["270 balance"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 48,
          explanation: "Possible if you have some contact; One is the true starter.",
          strengths: ["Soft face"],
          compromises: ["Diamond 360 g"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 58,
          explanation: "Pro is the finisher.",
          strengths: ["Diamond"],
          compromises: ["Glass not Carbon Hybrid"],
        },
      ],
    },
    {
      id: "prod-head-extreme-pro-padel",
      existing: true,
      slug: "head-extreme-pro-padel",
      brandId: "brand-head-padel",
      familyId: "fam-head-extreme",
      generation: "2025",
      name: "Extreme Pro",
      fullName: "HEAD Extreme Pro",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: ["uc-padel-power", "uc-padel-advanced", "uc-padel-competitive"],
      sourceUrl: "https://www.head.com/en/product/extreme-pro-2025-223125",
      sourceName: "HEAD (head.com) Extreme Pro 2025",
      shortDescription:
        "Current Extreme Pro on HEAD.com: diamond, 370 g, high balance 270, Hybrid Woven, Power FOAM, Extreme Spin.",
      verdict:
        "Buy this if you want Head’s Extreme attack diamond. Motion is the 360 g sibling. HEAD’s live page is the 2025 Pro, still the current Extreme Pro model.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 370,
        weightMax: 370,
        face: "Hybrid Woven",
        faceMaterial: "carbon-hybrid",
        core: "foam",
        manufacturerCoreName: "Power FOAM",
        surfaceTexture: "3d-textured",
        feel: "medium",
        playerLevel: "professional",
        manufacturerPositioning: "Finisher / dynamic power",
        technologies: "Hybrid Woven, Power FOAM, Extreme Spin",
      },
      strengths: [
        "Official Extreme Pro: 370 g, balance 270, Extreme Spin",
        "Hybrid Woven is Head’s carbon/glass mix for this series",
      ],
      weaknesses: [
        "Heavy high-balance diamond",
        "Not Gravity control",
      ],
      relatedProductIds: ["prod-head-extreme-motion-2026", "prod-head-coello-pro"],
      alternativeProductIds: ["prod-head-extreme-motion-2026", "prod-head-coello-pro"],
      copy: {
        whatItIs:
          "HEAD Extreme Pro (live 2025 page): heaviest Extreme, tournament/expert, diamond, 370 g, high balance 270, Hybrid Woven, Power FOAM, Extreme Spin, medium feel.",
        whoItsFor:
          "Advanced attackers in the Extreme family. Coello Pro is the other Head finisher diamond.",
        howItPlays:
          "Dynamic power + Extreme Spin is the Extreme story versus Coello’s explosive-power tag.",
        powerVsControl:
          "Attack Extreme. Motion is lighter. Gravity is control.",
        handling:
          "370 g, balance 270. Motion is 360/270.",
        comfort:
          "Medium feel — between Coello Pro hard and Team soft.",
        forgiveness:
          "Diamond expert racket.",
        construction:
          "Hybrid Woven, Power FOAM, Extreme Spin, 370 g, balance 270.",
        bestFor: [
          "Advanced players who want Extreme Pro’s 370 g diamond",
          "Spin-first attackers who prefer Extreme over Coello",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Extreme Motion’s 360 g",
        ],
        buyIf: [
          "You want the official Extreme Pro: 370 g, high balance 270, Hybrid Woven, Power FOAM, Extreme Spin.",
          "You already attack and like the Extreme series more than Coello.",
        ],
        skipIf: [
          "You want Extreme Motion.",
          "You need Gravity or One.",
        ],
      },
      attributes: attrs({
        power: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD Finisher / Dynamic Power, 370 g diamond, Power FOAM.",
        },
        control: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "High-balance Extreme diamond. Gravity is the control Head.",
        },
        forgiveness: {
          score: 40,
          kind: "SPEC_INFERENCE",
          reasoning: "Expert 370 g diamond.",
        },
        maneuverability: {
          score: 50,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Heavy-weight + high balance 270.",
        },
        comfort: {
          score: 58,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official feel Medium.",
        },
        stability: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD heavy-weight stability copy.",
        },
        spin: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Extreme Spin 3D decal.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 88,
          explanation: "Official Extreme Pro diamond.",
          strengths: ["370 g", "Extreme Spin"],
          compromises: ["Heavy"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Tournament/expert Extreme.",
          strengths: ["Hybrid Woven"],
          compromises: ["Not Motion"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 86,
          explanation: "Current Extreme Pro on HEAD.com.",
          strengths: ["Power FOAM"],
          compromises: ["High balance"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 16,
          explanation: "Not a starter.",
          strengths: [],
          compromises: ["370 g diamond"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 80,
          explanation: "Coello Pro is Head’s heavier finisher story.",
          strengths: ["Extreme diamond"],
          compromises: ["370 vs Coello 370/272"],
        },
      ],
    },
    {
      id: "prod-head-extreme-motion-2026",
      existing: true,
      slug: "head-extreme-motion",
      brandId: "brand-head-padel",
      familyId: "fam-head-extreme",
      generation: "2025",
      name: "Extreme Motion",
      fullName: "HEAD Extreme Motion",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-maneuverability",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.head.com/en_GB/product/extreme-motion-2025-223135",
      sourceName: "HEAD (head.com) Extreme Motion 2025",
      shortDescription:
        "Extreme Motion: diamond, 360 g, high balance 270, Hybrid Woven, Power FOAM, Extreme Spin — lighter Extreme, not a round control racket.",
      verdict:
        "Buy this if you want Extreme spin/power at 360 g. The old catalog note that treated this as a teardrop control stand-in was wrong.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 360,
        face: "Hybrid Woven",
        faceMaterial: "carbon-hybrid",
        core: "foam",
        manufacturerCoreName: "Power FOAM",
        surfaceTexture: "3d-textured",
        feel: "medium",
        playerLevel: "advanced",
        manufacturerPositioning: "Attacking Extreme / more mobile",
        technologies: "Hybrid Woven, Power FOAM, Extreme Spin",
      },
      strengths: [
        "Official 360 g Extreme diamond with Extreme Spin",
        "Same Hybrid Woven / Power FOAM stack as Pro",
      ],
      weaknesses: [
        "Still high-balance diamond — not Gravity",
        "Less mass than Extreme Pro",
      ],
      relatedProductIds: ["prod-head-extreme-pro-padel", "prod-head-coello-motion"],
      alternativeProductIds: ["prod-head-extreme-pro-padel", "prod-head-gravity-motion"],
      copy: {
        whatItIs:
          "HEAD Extreme Motion 2025 page: lighter than Pro, advanced/tournament attacking game, diamond, 360 g, high balance 270, Hybrid Woven, Power FOAM, Extreme Spin, medium feel.",
        whoItsFor:
          "Advanced attackers who want Extreme spin without 370 g.",
        howItPlays:
          "Same Extreme recipe as Pro on a midweight diamond.",
        powerVsControl:
          "Attack Extreme. Not a control teardrop.",
        handling:
          "360 g is the Motion split.",
        comfort:
          "Medium feel.",
        forgiveness:
          "More swingable than Pro; still a diamond.",
        construction:
          "Hybrid Woven, Power FOAM, Extreme Spin, 360 g, balance 270.",
        bestFor: [
          "Advanced players who want Extreme Motion’s 360 g diamond",
          "Attackers who prefer Extreme Spin to a smooth Speed face",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Gravity’s round control",
        ],
        buyIf: [
          "You want official Extreme Motion: 360 g, balance 270, Hybrid Woven, Power FOAM, Extreme Spin.",
          "You already attack and found Extreme Pro too heavy.",
        ],
        skipIf: [
          "You want Extreme Pro’s 370 g.",
          "You need a round control Head.",
        ],
      },
      attributes: attrs({
        power: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Extreme attacking diamond with Power FOAM at 360 g.",
        },
        control: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "More mobile than Pro; still high-balance Extreme, not Gravity.",
        },
        forgiveness: {
          score: 48,
          kind: "SPEC_INFERENCE",
          reasoning: "360 g helps versus 370 g; diamond remains.",
        },
        maneuverability: {
          score: 72,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD’s lighter-than-Pro Motion copy.",
        },
        comfort: {
          score: 60,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Medium feel.",
        },
        stability: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "10 g under Extreme Pro.",
        },
        spin: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Extreme Spin 3D decal.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 84,
          explanation: "Extreme diamond at 360 g.",
          strengths: ["Extreme Spin"],
          compromises: ["High balance"],
        },
        {
          useCaseId: "uc-padel-maneuverability",
          score: 76,
          explanation: "The mobile Extreme.",
          strengths: ["360 g"],
          compromises: ["Still 270 balance"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 86,
          explanation: "HEAD advanced/tournament Motion.",
          strengths: ["Hybrid Woven"],
          compromises: ["Not Gravity"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 22,
          explanation: "Not a control starter.",
          strengths: [],
          compromises: ["Diamond Extreme"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 50,
          explanation: "Gravity if control is the job.",
          strengths: [],
          compromises: ["Attack Extreme"],
        },
      ],
    },
    {
      id: "prod-head-gravity-pro",
      slug: "head-gravity-pro",
      brandId: "brand-head-padel",
      familyId: "fam-head-gravity",
      generation: "2024",
      name: "Gravity Pro",
      fullName: "HEAD Gravity Pro",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.head.com/product/gravity-pro-2024-224004",
      sourceName: "HEAD (head.com) Gravity Pro 2024",
      shortDescription:
        "Current Gravity Pro on HEAD.com: control-family racket with Control FOAM and spin surface — not a Coello diamond.",
      verdict:
        "Buy this if you want Head’s control Pro. Live manufacturer page is still the 2024 Gravity Pro.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 365,
        weightMax: 365,
        thicknessMm: 38,
        core: "foam",
        manufacturerCoreName: "Control FOAM",
        face: "Hybrid Woven",
        faceMaterial: "carbon-hybrid",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Control / extended sweet spot",
        technologies: "Control FOAM, Spin Surface, Auxetic 2.0",
      },
      strengths: [
        "Official Control FOAM and spin-surface Gravity Pro",
        "HEAD’s control family, not Extreme/Coello attack",
      ],
      weaknesses: [
        "Heavy-weight control Pro — not a light beginner round",
        "Older year on the live URL; still the current Gravity Pro HEAD sells",
      ],
      relatedProductIds: ["prod-head-gravity-motion", "prod-head-speed-pro"],
      alternativeProductIds: ["prod-head-gravity-motion", "prod-babolat-counter-viper"],
      copy: {
        whatItIs:
          "HEAD Gravity Pro is sold for tournament players who want to control the game. Named pieces: lighter construction versus prior Gravity, new hitting surface for spin, Auxetic 2.0, Control FOAM (sweet-spot / bandeja / chiquita copy), Spin Surface lacquer.",
        whoItsFor:
          "Advanced control players in the Head ecosystem. Coello/Extreme are the finishers.",
        howItPlays:
          "Control FOAM is specified to enlarge the sweet spot and help precision shots. Manufacturer claim.",
        powerVsControl:
          "Gravity is control. Extreme/Coello are power.",
        handling:
          "HEAD mentions a lighter construction. Exact grams omitted.",
        comfort:
          "Control FOAM is a precision foam, not Power FOAM.",
        forgiveness:
          "HEAD’s Gravity marketing is extended sweet spot. Still a Pro.",
        construction:
          "Control FOAM, Spin Surface, Auxetic 2.0. Shape/weight omitted pending a full spec block.",
        bestFor: [
          "Advanced players who want Head Gravity Pro control",
          "Pairs who build the point instead of only smashing",
        ],
        notIdealFor: [
          "Beginners — try Gravity Motion or One",
          "Players who want Coello Pro",
        ],
        buyIf: [
          "You want the official Gravity Pro with Control FOAM and Spin Surface.",
          "You already play at a high level and want Head’s control Pro.",
        ],
        skipIf: [
          "You want Gravity Motion’s lighter control.",
          "You want Coello/Extreme power.",
        ],
      },
      attributes: attrs({
        power: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Control FOAM family versus Power FOAM Extreme/Coello.",
        },
        control: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD Gravity Pro is written as control the game + Control FOAM precision.",
        },
        forgiveness: {
          score: 72,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Extended sweet-spot Gravity copy. Still Pro level.",
        },
        maneuverability: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Lighter-construction claim versus prior Gravity. Grams not published on the retrieved page.",
        },
        comfort: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Control FOAM is the precision/comfort-side foam versus Power FOAM.",
        },
        stability: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Tournament Pro Gravity. Not a floppy starter.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Spin Surface rough lacquer is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 92,
          explanation: "HEAD’s control Pro.",
          strengths: ["Control FOAM", "Spin Surface"],
          compromises: ["Not Motion-light"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Tournament Gravity.",
          strengths: ["Auxetic 2.0"],
          compromises: ["Pro demand"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 84,
          explanation: "Current Gravity Pro HEAD sells.",
          strengths: ["Control family"],
          compromises: ["2024 live URL"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 34,
          explanation: "Gravity Motion or One.",
          strengths: [],
          compromises: ["Pro control"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 42,
          explanation: "Coello/Extreme for Head power.",
          strengths: [],
          compromises: ["Control FOAM"],
        },
      ],
    },
    {
      id: "prod-head-gravity-motion",
      slug: "head-gravity-motion",
      brandId: "brand-head-padel",
      familyId: "fam-head-gravity",
      generation: "2024",
      name: "Gravity Motion",
      fullName: "HEAD Gravity Motion",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-maneuverability",
        "uc-padel-arm-comfort",
      ],
      sourceUrl: "https://www.head.com/en_GB/product/gravity-motion-2024-224014",
      sourceName: "HEAD (head.com) Gravity Motion 2024",
      shortDescription:
        "Gravity Motion: lighter Gravity with lower balance, Auxetic 2.0 and Control FOAM — Head’s mobile control model.",
      verdict:
        "Buy this if you want Gravity control that is easier to swing than Pro. Live HEAD page is the 2024 Motion.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 355,
        weightMax: 355,
        thicknessMm: 38,
        core: "foam",
        manufacturerCoreName: "Control FOAM",
        face: "Fiberglass",
        faceMaterial: "fiberglass",
        surfaceTexture: "rough",
        playerLevel: "advanced",
        manufacturerPositioning: "Lightweight Gravity control",
        technologies: "Control FOAM, Auxetic 2.0, Spin Surface",
      },
      strengths: [
        "Official lighter Gravity with mid balance (265 mm on HEAD.com)",
        "Control FOAM plus a more elastic face versus Pro carbon",
      ],
      weaknesses: [
        "Not Coello power",
        "Exact grams omitted — HEAD copy is qualitative on the retrieved page",
      ],
      relatedProductIds: ["prod-head-gravity-pro", "prod-head-one-ultralight"],
      alternativeProductIds: ["prod-head-gravity-pro", "prod-head-one-ultralight"],
      copy: {
        whatItIs:
          "HEAD Gravity Motion: lightweight, easy to manoeuvre, lower balance, Auxetic 2.0, Control FOAM. Face copy on the page is the elastic/flexible material (fiberglass).",
        whoItsFor:
          "Advanced players who want Gravity control with faster hands. Specialists often point this at players who need an easier swing than Gravity Pro.",
        howItPlays:
          "Control FOAM + lower balance is the Motion control story.",
        powerVsControl:
          "Control Gravity, easier than Pro. Not Extreme.",
        handling:
          "Lower balance and lightweight copy. Grams omitted.",
        comfort:
          "Elastic face + Control FOAM.",
        forgiveness:
          "More usable than Gravity Pro. Still not One Ultralight.",
        construction:
          "Control FOAM, Auxetic 2.0, fiberglass face, lower balance. Weight omitted.",
        bestFor: [
          "Control players who want Gravity Motion",
          "Players who found Gravity Pro too demanding",
        ],
        notIdealFor: [
          "Smash-first Coello shoppers",
          "True beginners — One Ultralight is lighter",
        ],
        buyIf: [
          "You want official Gravity Motion: lower balance, Control FOAM, Auxetic 2.0.",
          "You already play and want Head control that moves faster than Pro.",
        ],
        skipIf: [
          "You want Gravity Pro.",
          "You need a 300 g first racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 50,
          kind: "SPEC_INFERENCE",
          reasoning: "Control FOAM + lighter Gravity. Not Power FOAM.",
        },
        control: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Gravity Motion is sold to control the game with a lower balance.",
        },
        forgiveness: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Lighter, lower-balance Gravity with an elastic face.",
        },
        maneuverability: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD lead copy is lightweight and easy to manoeuvre.",
        },
        comfort: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Elastic face + Control FOAM.",
        },
        stability: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Lighter than Gravity Pro by positioning.",
        },
        spin: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Gravity family uses a spin surface on Pro; Motion page emphasizes foam/balance.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 90,
          explanation: "Mobile Gravity control.",
          strengths: ["Control FOAM", "Lower balance"],
          compromises: ["Not Pro mass"],
        },
        {
          useCaseId: "uc-padel-maneuverability",
          score: 90,
          explanation: "Official lightweight Gravity.",
          strengths: ["Motion"],
          compromises: ["Less plow"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 82,
          explanation: "Easier Gravity. One is still lighter.",
          strengths: ["Elastic face"],
          compromises: ["Still a Gravity Pro-adjacent player target"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 50,
          explanation: "Possible; One Ultralight is the true starter.",
          strengths: ["Easier Gravity"],
          compromises: ["Advanced listing"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 34,
          explanation: "Wrong Head family.",
          strengths: [],
          compromises: ["Control Motion"],
        },
      ],
    },
    {
      id: "prod-head-speed-pro",
      slug: "head-speed-pro",
      brandId: "brand-head-padel",
      familyId: "fam-head-speed-padel",
      generation: "2025",
      name: "Speed Pro",
      fullName: "HEAD Speed Pro",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.head.com/en/product/speed-pro-2025-221065",
      sourceName: "HEAD (head.com) Speed Pro 2025",
      shortDescription:
        "Speed Pro: 370 g, high balance 270, Hybrid Woven, Power FOAM, smooth face — Head’s tactical speed diamond/teardrop family, not Extreme Spin.",
      verdict:
        "Buy this if you want a fast Head with a flat face. Extreme is the spin sibling; Gravity is control foam.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 370,
        weightMax: 370,
        thicknessMm: 38,
        face: "Hybrid Woven",
        faceMaterial: "carbon-hybrid",
        core: "foam",
        manufacturerCoreName: "Power FOAM",
        surfaceTexture: "smooth",
        playerLevel: "professional",
        manufacturerPositioning: "Tactical / play fast",
        technologies: "Hybrid Woven, Power FOAM, Auxetic 2.0, Graphene Inside",
      },
      strengths: [
        "Official Speed Pro 370 g / 270 balance with a smooth face",
        "Power FOAM without Extreme Spin — a different Head job",
      ],
      weaknesses: [
        "Heavy high-balance",
        "Shape not restated on the retrieved spec block — omitted",
      ],
      relatedProductIds: ["prod-head-extreme-pro-padel", "prod-head-gravity-pro"],
      alternativeProductIds: ["prod-head-extreme-pro-padel", "prod-head-coello-pro"],
      copy: {
        whatItIs:
          "HEAD Speed Pro: play fast, tournament players, Auxetic 2.0, 370 g, high balance 270, Hybrid Woven, Power FOAM, no roughness / flat surface.",
        whoItsFor:
          "Advanced tactical players who want a direct face, not Extreme’s 3D decal.",
        howItPlays:
          "Power FOAM for pace, smooth face for a clean hit. Manufacturer tactical tag.",
        powerVsControl:
          "Between Extreme smash-spin and Gravity control. Speed is the pace/reaction family.",
        handling:
          "370 g, balance 270 — not a light Speed One.",
        comfort:
          "Hybrid Woven + Power FOAM. Not Control FOAM.",
        forgiveness:
          "Pro 370 g. Low beginner fit.",
        construction:
          "Hybrid Woven, Power FOAM, smooth face, 370 g, balance 270, Auxetic 2.0.",
        bestFor: [
          "Advanced players who want Speed Pro’s flat Power FOAM face",
          "Pairs who play fast at the net without Extreme texture",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Extreme Spin",
        ],
        buyIf: [
          "You want official Speed Pro: 370 g, balance 270, Hybrid Woven, Power FOAM, no roughness.",
          "You already play at tournament pace and want a direct Head face.",
        ],
        skipIf: [
          "You want Extreme Spin.",
          "You need Gravity or One.",
        ],
      },
      attributes: attrs({
        power: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Power FOAM + 370 g high balance. Tactical, not Coello finisher copy.",
        },
        control: {
          score: 72,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Smooth face is specified for ball control and a direct impact.",
        },
        forgiveness: {
          score: 44,
          kind: "SPEC_INFERENCE",
          reasoning: "370 g pro Speed.",
        },
        maneuverability: {
          score: 52,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Heavy-weight + high balance 270.",
        },
        comfort: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "Hybrid Woven Power FOAM, not Control FOAM.",
        },
        stability: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD heavy-weight stability copy.",
        },
        spin: {
          score: 38,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official no roughness / flat surface.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 82,
          explanation: "Tactical Speed Pro — pace without Extreme texture.",
          strengths: ["Power FOAM", "Smooth face"],
          compromises: ["370 g"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Tournament Speed.",
          strengths: ["Auxetic 2.0"],
          compromises: ["Heavy"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 84,
          explanation: "Current Speed Pro on HEAD.com.",
          strengths: ["Hybrid Woven"],
          compromises: ["High balance"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 18,
          explanation: "Not a starter.",
          strengths: [],
          compromises: ["370 g"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 70,
          explanation: "Coello/Extreme Pro if finishing is the only job.",
          strengths: ["Power FOAM"],
          compromises: ["Tactical vs finisher"],
        },
      ],
    },
    {
      id: "prod-head-one-ultralight",
      slug: "head-one-ultralight",
      brandId: "brand-head-padel",
      familyId: "fam-head-one",
      generation: "ultralight",
      name: "One Ultralight",
      fullName: "HEAD One Ultralight",
      lifecycle: "current",
      experienceLevels: ["beginner"],
      useCaseIds: [
        "uc-padel-beginner",
        "uc-padel-maneuverability",
        "uc-padel-arm-comfort",
      ],
      sourceUrl: "https://www.head.com/product/one-ultralight-black-225024",
      sourceName: "HEAD (head.com) One Ultralight",
      shortDescription:
        "HEAD One Ultralight: 300 g adult racket for beginners and casual players — the light Head, not Coello Pro.",
      verdict:
        "Buy this to learn or to keep the swing easy. It is not a tournament diamond.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 300,
        weightMax: 300,
        thicknessMm: 38,
        face: "12K Carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "foam",
        manufacturerCoreName: "Comfort Foam",
        surfaceTexture: "rough",
        playerLevel: "beginner",
        manufacturerPositioning: "Lightest adult Head / beginner-casual",
        technologies: "Auxetic 2.0, Comfort Foam, Spin Surface, Soft Butt Cap, IPS",
      },
      strengths: [
        "Official ~300 g adult Head",
        "Written for beginners and casual players",
      ],
      weaknesses: [
        "High balance 265 on the collection card — light but not handle-heavy",
        "Little plow-through versus a 370 g Pro",
      ],
      relatedProductIds: ["prod-head-coello-team", "prod-bullpadel-indiga-ctr"],
      alternativeProductIds: ["prod-adidas-match-light", "prod-kuikma-pr-soft-500"],
      copy: {
        whatItIs:
          "HEAD calls One Ultralight the lightest adult padel racket at 300–303 g, for beginners and casual players. Collection listing also shows 12K carbon and high balance 265 on one colourway.",
        whoItsFor:
          "New players, casual players, anyone who wants a genuinely light Head. Not Coello Pro.",
        howItPlays:
          "HEAD: easier to swing, faster reactions, comfort and control while you learn. Power is limited by mass.",
        powerVsControl:
          "Easy handling first. You supply pace.",
        handling:
          "300 g is the product. Balance can still sit high — it is not a 300 g round Indiga clone.",
        comfort:
          "Official beginner/casual comfort story.",
        forgiveness:
          "Light and easy to get around. Not a huge Head Gravity sweet-spot essay on this page.",
        construction:
          "300–303 g, 12K carbon listed on the One collection, high balance on the white version.",
        bestFor: [
          "Beginners who want a true light Head",
          "Casual players who hate 360 g+ frames",
        ],
        notIdealFor: [
          "Advanced smashers",
          "Players who want Coello/Extreme mass",
        ],
        buyIf: [
          "You want official One Ultralight at about 300 g for learning or easy swinging.",
          "You are new or casual and do not want a 370 g diamond.",
        ],
        skipIf: [
          "You already compete with a 360 g+ carbon diamond.",
          "You want Extreme Spin or Power FOAM attack.",
        ],
      },
      attributes: attrs({
        power: {
          score: 38,
          kind: "SPEC_INFERENCE",
          reasoning: "300 g adult frame. Little momentum versus Pro diamonds.",
        },
        control: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD beginner/casual control-and-comfort copy.",
        },
        forgiveness: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Very light and easy to get the face on the ball. Not a huge advertised sweet spot.",
        },
        maneuverability: {
          score: 96,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official lightest adult Head at ~300 g.",
        },
        comfort: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HEAD lists comfort and reduced arm fatigue for this model.",
        },
        stability: {
          score: 40,
          kind: "SPEC_INFERENCE",
          reasoning: "300 g will move more on a heavy ball than a 370 g Pro.",
        },
        spin: {
          score: 50,
          kind: "SPEC_INFERENCE",
          reasoning: "12K face listed; no Extreme Spin name on the Ultralight page.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 94,
          explanation: "HEAD’s light beginner/casual adult racket.",
          strengths: ["~300 g"],
          compromises: ["Little mass"],
        },
        {
          useCaseId: "uc-padel-maneuverability",
          score: 96,
          explanation: "Lightest adult Head.",
          strengths: ["300 g"],
          compromises: ["High balance still possible"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 90,
          explanation: "Official easy-swing comfort story.",
          strengths: ["Low mass"],
          compromises: ["Not Gravity Pro control foam"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 28,
          explanation: "You will want Coello/Extreme/Speed soon.",
          strengths: [],
          compromises: ["Ultralight"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 16,
          explanation: "Opposite job.",
          strengths: [],
          compromises: ["300 g"],
        },
      ],
    },
    {
      id: "prod-babolat-technical-viper",
      existing: true,
      slug: "babolat-technical-viper-3-0",
      brandId: "brand-babolat-padel",
      familyId: "fam-babolat-viper",
      generation: "3.0",
      name: "Technical Viper 3.0",
      fullName: "Babolat Technical Viper 3.0",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maximum-power",
        "uc-padel-power",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.babolat.com/us/technical-viper-3.0/150175.html",
      sourceName: "Babolat (babolat.com) Technical Viper 3.0",
      shortDescription:
        "Technical Viper 3.0: diamond, 370 g ±10, balance 270 mm, 3K carbon, Hard EVA — Babolat’s technical-striker power model.",
      verdict:
        "Buy this if you want the current Technical Viper. It is a 370 g diamond with Hard EVA, not a club hybrid.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 380,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "3K Carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "3K",
        core: "hard-EVA",
        manufacturerCoreName: "Hard EVA",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Technical striker / maximum power",
        technologies: "Carbon Power Layer, Dynamic Stability System, 3K carbon, Hard EVA",
      },
      strengths: [
        "Official 3.0 sheet: diamond, 370±10 g, 270 mm, 3K, Hard EVA",
        "Carbon Power Layer and Dynamic Stability System are named",
      ],
      weaknesses: [
        "Hard EVA + diamond is demanding",
        "Not Counter (round) or Air (teardrop 355 g)",
      ],
      relatedProductIds: [
        "prod-babolat-counter-viper",
        "prod-babolat-air-viper",
      ],
      alternativeProductIds: [
        "prod-head-coello-pro",
        "prod-bullpadel-hack-04",
      ],
      copy: {
        whatItIs:
          "Babolat Technical Viper 3.0: technical striker, diamond, 3K carbon surface, carbon frame, Hard EVA, 370 g ±10, 38 mm, balance 270 mm, rough finish.",
        whoItsFor:
          "Competitive attackers who already generate speed. Veron is the Carbon Flex on-ramp; Air Viper is the lighter teardrop.",
        howItPlays:
          "Babolat talks explosive power and Carbon Power Layer energy transfer. Manufacturer claim.",
        powerVsControl:
          "The power Viper. Counter is the round X-EVA; Air is the 355 g teardrop.",
        handling:
          "370±10 g, 270 mm. Not Air’s 355 g.",
        comfort:
          "Hard EVA. Soft 3.0 is a different version — not this one.",
        forgiveness:
          "Diamond technical striker. Low.",
        construction:
          "3K carbon, Hard EVA, carbon frame, Carbon Power Layer, Dynamic Stability System, 38 mm.",
        bestFor: [
          "Advanced technical strikers who want Viper 3.0",
          "Players who want Babolat’s 370 g Hard EVA diamond",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Counter or Air Viper",
        ],
        buyIf: [
          "You want official Technical Viper 3.0: diamond, 370±10 g, 270 mm, 3K, Hard EVA.",
          "You already attack at a high level.",
        ],
        skipIf: [
          "You want Counter Viper’s round X-EVA.",
          "You want Air Viper’s 355 g teardrop.",
        ],
      },
      attributes: attrs({
        power: {
          score: 94,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official maximum-power / technical-striker 3.0 with Hard EVA and 3K.",
        },
        control: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Diamond 270 mm Hard EVA. Counter is Babolat’s control Viper.",
        },
        forgiveness: {
          score: 36,
          kind: "SPEC_INFERENCE",
          reasoning: "Hard EVA diamond ±10 g around 370.",
        },
        maneuverability: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "370±10 g, 270 mm balance.",
        },
        comfort: {
          score: 42,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Core is Hard EVA.",
        },
        stability: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Dynamic Stability System and a reinforced heart bar are specified.",
        },
        spin: {
          score: 78,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Rough finish is specified for spin on the 3.0 page.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maximum-power",
          score: 94,
          explanation: "Babolat’s Hard EVA Technical Viper 3.0.",
          strengths: ["3K", "370 g"],
          compromises: ["Harsh"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 92,
          explanation: "Official technical-striker power.",
          strengths: ["Diamond"],
          compromises: ["Hard EVA"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 90,
          explanation: "Current Viper 3.0.",
          strengths: ["Carbon Power Layer"],
          compromises: ["Demanding"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 14,
          explanation: "Wrong Babolat.",
          strengths: [],
          compromises: ["Hard EVA diamond"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 40,
          explanation: "Counter Viper.",
          strengths: [],
          compromises: ["Technical striker"],
        },
      ],
    },
    {
      id: "prod-babolat-counter-viper",
      existing: true,
      slug: "babolat-counter-viper",
      brandId: "brand-babolat-padel",
      familyId: "fam-babolat-viper",
      generation: "2.6",
      name: "Counter Viper",
      fullName: "Babolat Counter Viper 2.6",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-defensive",
        "uc-padel-control",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.babolat.com/us/padel/racquets.html",
      sourceName: "Babolat (babolat.com) Counter Viper",
      shortDescription:
        "Counter Viper: round, 365 g ±10, 3K carbon, X-EVA — Babolat’s counter-striker, not a teardrop Technical.",
      verdict:
        "Buy this if you steal pace from a round Viper. The old hybrid/teardrop catalog row was wrong.",
      specifications: {
        shape: "round",
        weightMin: 355,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "3K Carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "3K",
        core: "multi-density",
        manufacturerCoreName: "X-EVA",
        playerLevel: "advanced",
        manufacturerPositioning: "Counter striker / precision",
      },
      strengths: [
        "Official round Counter Viper with 3K and X-EVA",
        "365±10 g — a real control Viper, not Technical’s diamond",
      ],
      weaknesses: [
        "Still a 3K Viper, not Vertuo fiberglass",
        "X-EVA is firmer than Black EVA Veron",
      ],
      relatedProductIds: [
        "prod-babolat-technical-viper",
        "prod-babolat-air-viper",
      ],
      alternativeProductIds: [
        "prod-babolat-air-veron",
        "prod-head-gravity-pro",
      ],
      copy: {
        whatItIs:
          "Babolat’s racquet index lists Counter Viper as counter striker, round, 3K carbon, carbon frame, X-EVA, 365 g ±10, 38 mm.",
        whoItsFor:
          "Advanced players who redirect and then finish. Technical is the diamond; Air is the teardrop.",
        howItPlays:
          "Official tags include precision and high responsiveness. X-EVA is the sandwich core name.",
        powerVsControl:
          "Control/counter Viper. Not Technical 3.0 Hard EVA.",
        handling:
          "365±10 g round. More usable outline than Technical.",
        comfort:
          "X-EVA, not Black EVA Veron. Still a Viper carbon.",
        forgiveness:
          "Round helps. 3K Viper still asks for a formed swing.",
        construction:
          "3K, X-EVA, carbon frame, round, 38 mm, 365±10 g.",
        bestFor: [
          "Advanced counter-punchers who want a round Viper",
          "Players who found Technical 3.0 too diamond-hard",
        ],
        notIdealFor: [
          "Beginners — look at Vertuo/Origin if you stay Babolat",
          "Pure Technical strikers",
        ],
        buyIf: [
          "You want official Counter Viper: round, 365±10 g, 3K, X-EVA.",
          "You already play and live on the block and redirect.",
        ],
        skipIf: [
          "You want Technical Viper 3.0.",
          "You want Air Viper’s 355 g teardrop.",
        ],
      },
      attributes: attrs({
        power: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "3K X-EVA Viper on a round mould. Less smash than Technical 3.0.",
        },
        control: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official counter-striker / precision / round shape.",
        },
        forgiveness: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Round versus Technical diamond. Still 3K Viper.",
        },
        maneuverability: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "365±10 g. Round outline helps the face come around versus a 370 g diamond.",
        },
        comfort: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "X-EVA sandwich versus Hard EVA Technical. Not Black EVA Veron-soft.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "3K carbon Viper frame.",
        },
        spin: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Viper carbon faces are typically raw/rough; not separately named on the index card.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-defensive",
          score: 88,
          explanation: "Official counter-striker Viper.",
          strengths: ["Round", "X-EVA"],
          compromises: ["Still 3K"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 86,
          explanation: "Babolat’s control Viper.",
          strengths: ["365 g round"],
          compromises: ["Not Veron-soft"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 84,
          explanation: "Advanced Counter Viper.",
          strengths: ["3K"],
          compromises: ["Not a starter"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 30,
          explanation: "Too much Viper for a first racket.",
          strengths: [],
          compromises: ["3K X-EVA"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 56,
          explanation: "Technical Viper 3.0.",
          strengths: ["3K"],
          compromises: ["Round counter"],
        },
      ],
    },
    {
      id: "prod-babolat-air-viper",
      slug: "babolat-air-viper-2-6",
      brandId: "brand-babolat-padel",
      familyId: "fam-babolat-viper",
      generation: "2.6",
      name: "Air Viper",
      fullName: "Babolat Air Viper 2.6",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maneuverability",
        "uc-padel-power",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.babolat.com/us/air-viper-2.6/150176.html",
      sourceName: "Babolat (babolat.com) Air Viper 2.6",
      shortDescription:
        "Air Viper 2.6: teardrop, 355 g ±10, 16K carbon, X-EVA — the speed Viper, not Technical 3.0.",
      verdict:
        "Buy this if you want a lighter teardrop Viper. Technical is the 370 g diamond; Veron is the easier Air.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 345,
        weightMax: 365,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "16K Carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "16K",
        core: "multi-density",
        manufacturerCoreName: "X-EVA",
        playerLevel: "advanced",
        manufacturerPositioning: "Air striker / speed",
      },
      strengths: [
        "Official 355±10 g teardrop with 16K and X-EVA",
        "Distinct Air family — not a colourway of Technical",
      ],
      weaknesses: [
        "Still a Viper carbon",
        "Less smash mass than Technical 3.0",
      ],
      relatedProductIds: [
        "prod-babolat-air-veron",
        "prod-babolat-technical-viper",
      ],
      alternativeProductIds: [
        "prod-babolat-air-veron",
        "prod-head-coello-motion",
      ],
      copy: {
        whatItIs:
          "Babolat lists Air Viper 2.6 as air striker, teardrop, 16K carbon, carbon frame, X-EVA, 355 g ±10, 38 mm.",
        whoItsFor:
          "Advanced players who want Viper materials in a faster teardrop.",
        howItPlays:
          "Air is Babolat’s speed family. 16K + X-EVA is the pro Air stack; Veron uses Carbon Flex + Black EVA.",
        powerVsControl:
          "In-between Technical smash and Counter round. Teardrop 355 g.",
        handling:
          "355±10 g is the Air reason to exist.",
        comfort:
          "X-EVA, not Black EVA Veron.",
        forgiveness:
          "Teardrop more usable than Technical diamond; still Viper.",
        construction:
          "16K, X-EVA, carbon frame, teardrop, 38 mm, 355±10 g.",
        bestFor: [
          "Advanced players who want Air Viper speed",
          "Players who found Technical 3.0 too heavy",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Air Veron’s Carbon Flex",
        ],
        buyIf: [
          "You want official Air Viper 2.6: teardrop, 355±10 g, 16K, X-EVA.",
          "You already play at a high level and want a faster Viper.",
        ],
        skipIf: [
          "You want Technical Viper 3.0.",
          "You want Air Veron.",
        ],
      },
      attributes: attrs({
        power: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "16K X-EVA teardrop at 355 g. Less mass than Technical 3.0, more speed.",
        },
        control: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Teardrop Air versus Counter round and Technical diamond.",
        },
        forgiveness: {
          score: 56,
          kind: "SPEC_INFERENCE",
          reasoning: "Lighter teardrop helps; still a Viper carbon.",
        },
        maneuverability: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Air family + official 355±10 g.",
        },
        comfort: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "X-EVA, not Black EVA Veron.",
        },
        stability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "16K carbon, 10–20 g under Technical.",
        },
        spin: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "16K Viper carbon face; texture not separately named on the index card.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maneuverability",
          score: 86,
          explanation: "Official 355 g Air Viper.",
          strengths: ["Teardrop", "16K"],
          compromises: ["Still Viper"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 80,
          explanation: "Speed-first Viper power.",
          strengths: ["X-EVA"],
          compromises: ["Less than Technical 3.0"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 86,
          explanation: "Pro Air Viper.",
          strengths: ["16K"],
          compromises: ["Not Veron"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 24,
          explanation: "Air Veron or a Vertuo if you stay Babolat.",
          strengths: [],
          compromises: ["Viper carbon"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 68,
          explanation: "Technical 3.0 is the smash Viper.",
          strengths: ["16K"],
          compromises: ["355 g teardrop"],
        },
      ],
    },
    {
      id: "prod-babolat-air-veron",
      slug: "babolat-air-veron-2-6",
      brandId: "brand-babolat-padel",
      familyId: "fam-babolat-veron",
      generation: "2.6",
      name: "Air Veron",
      fullName: "Babolat Air Veron 2.6",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-intermediate",
        "uc-padel-maneuverability",
        "uc-padel-easy-power",
      ],
      sourceUrl: "https://www.babolat.com/us/air-veron-2.6/150180.html",
      sourceName: "Babolat (babolat.com) Air Veron 2.6",
      shortDescription:
        "Air Veron 2.6: teardrop, 355 g ±10, Carbon Flex, Black EVA — the playable Air, not Air Viper.",
      verdict:
        "Buy this if you want Air geometry with a softer Carbon Flex / Black EVA stack.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 345,
        weightMax: 365,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "Carbon Flex",
        faceMaterial: "carbon-hybrid",
        core: "EVA",
        manufacturerCoreName: "Black EVA",
        playerLevel: "intermediate",
        manufacturerPositioning: "Air striker / playability",
      },
      strengths: [
        "Official Air Veron: 355±10 g teardrop, Carbon Flex, Black EVA",
        "Babolat tags maneuverability, playability, comfort",
      ],
      weaknesses: [
        "Not 16K X-EVA Air Viper",
        "Still not a Vertuo beginner",
      ],
      relatedProductIds: ["prod-babolat-air-viper", "prod-babolat-counter-viper"],
      alternativeProductIds: ["prod-babolat-air-viper", "prod-head-coello-team"],
      copy: {
        whatItIs:
          "Babolat lists Air Veron 2.6 as air striker, teardrop, Carbon Flex, carbon frame, Black EVA, 355 g ±10, 38 mm, with maneuverability / playability / comfort tags.",
        whoItsFor:
          "Intermediate and advancing players who want Air speed without Viper stiffness.",
        howItPlays:
          "Carbon Flex + Black EVA is Babolat’s easier Air recipe versus 16K X-EVA.",
        powerVsControl:
          "Easier Air. Viper is the pro Air.",
        handling:
          "Same 355±10 g teardrop band as Air Viper.",
        comfort:
          "Official comfort tag + Black EVA.",
        forgiveness:
          "More playable than Air Viper. Not a first Vertuo.",
        construction:
          "Carbon Flex, Black EVA, carbon frame, teardrop, 38 mm, 355±10 g.",
        bestFor: [
          "Intermediates who want Air Veron",
          "Players stepping toward Air Viper",
        ],
        notIdealFor: [
          "Beginners who need Vertuo/Origin",
          "Players who want Air Viper 16K",
        ],
        buyIf: [
          "You want official Air Veron 2.6: teardrop, 355±10 g, Carbon Flex, Black EVA.",
          "You already have contact and want a playable Air, not Viper stiffness.",
        ],
        skipIf: [
          "You want Air Viper.",
          "You are brand new.",
        ],
      },
      attributes: attrs({
        power: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon Flex + Black EVA teardrop at 355 g. Easier than Air Viper.",
        },
        control: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Playability / comfort Air striker tags.",
        },
        forgiveness: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon Flex + Black EVA versus 16K X-EVA.",
        },
        maneuverability: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official maneuverability tag + 355±10 g.",
        },
        comfort: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official comfort tag and Black EVA.",
        },
        stability: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "Lighter Flex stack than Viper 16K.",
        },
        spin: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "No named rough system on the index card.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-intermediate",
          score: 88,
          explanation: "Official playable Air Veron.",
          strengths: ["Carbon Flex", "Black EVA"],
          compromises: ["Not Viper"],
        },
        {
          useCaseId: "uc-padel-maneuverability",
          score: 86,
          explanation: "355 g Air geometry.",
          strengths: ["Teardrop light band"],
          compromises: ["Not ultralight"],
        },
        {
          useCaseId: "uc-padel-easy-power",
          score: 80,
          explanation: "Easier Air output than Viper.",
          strengths: ["Black EVA"],
          compromises: ["Less 16K punch"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 44,
          explanation: "Possible late-beginner; Vertuo is easier.",
          strengths: ["Playability tags"],
          compromises: ["Still a Veron carbon mix"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 46,
          explanation: "Air/Technical Viper.",
          strengths: [],
          compromises: ["Veron stack"],
        },
      ],
    },
  ];
}
