import type { RacketDraft } from "@/content/padel/rackets/build";
import type { PadelDecisionKey, PadelEvidenceKind } from "@/domain/padel/racket-decision";

type Attr = Record<
  PadelDecisionKey,
  { score: number; reasoning: string; kind: PadelEvidenceKind }
>;

export function attrs(rows: Attr): Attr {
  return rows;
}

export function noxDrafts(): RacketDraft[] {
  return [
    {
      id: "prod-nox-at10-18k-2026",
      existing: true,
      slug: "nox-at10-genius-18k-2026",
      brandId: "brand-nox",
      familyId: "fam-nox-at10",
      generation: "2026-18k",
      name: "AT10 Genius 18K Alum 2026",
      fullName: "Nox AT10 Genius 18K Alum 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://noxsport.com/en/products/pala-at10-genius-18k-alum-2026-by-agustin-tapia",
      sourceName: "NOX (noxsport.com) AT10 Luxury Genius 18K Alum 2026",
      shortDescription:
        "Agustín Tapia’s 2026 all-rounder: drop/teardrop mould, 18K aluminised carbon and a multilayer black EVA core with Dual Spin texture.",
      verdict:
        "Buy this if you already generate your own pace and want Tapia’s multi-purpose mould, not a beginner-friendly round. It is not the Attack diamond — that is a separate product.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "18K Alum carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "18K Alum",
        core: "multi-density",
        manufacturerCoreName: "MLD Black Eva",
        surfaceTexture: "3d-textured",
        feel: "medium",
        playerLevel: "professional",
        manufacturerPositioning: "Multipurpose / professional",
        technologies:
          "Weight Balance, Dual Spin, EOS Tunnel, DCS, Pulse System, Custom Grip, Oversize Grip, SmartStrap, Photochromic Paint",
        sweetSpot: "medium",
      },
      strengths: [
        "Manufacturer drop/tear mould keeps more usable face than the Attack diamond",
        "18K Alum + MLD Black Eva is a current Tapia construction, not a club fiberglass",
        "Dual Spin (3D + sand) is a manufacturer spin system, not a marketing sticker only",
      ],
      weaknesses: [
        "360–375 g and a pro-level mould still punish a late swing",
        "Not the easiest racket in the Nox line if you want a round sweet spot",
      ],
      relatedProductIds: [
        "prod-nox-at10-12k-2026",
        "prod-nox-at10-attack-18k-2026",
      ],
      alternativeProductIds: [
        "prod-nox-at10-attack-18k-2026",
        "prod-bullpadel-vertex-05",
      ],
      copy: {
        whatItIs:
          "The 2026 AT10 Genius 18K Alum is Tapia’s multi-purpose racket: a drop/tear face, carbon frame, 18K aluminised carbon and Nox’s multilayer black EVA. NOX lists it as professional, intermediate touch, multipurpose style.",
        whoItsFor:
          "Advanced and competitive players who already build the point and still want a finishing window. If you are still learning contact, this is the wrong Nox.",
        howItPlays:
          "NOX pitches a solid, temperature-stable 18K Alum feel with MLD Eva helping slower balls leave the face and denser layers supporting the finish. That is manufacturer language, not a Kitletics on-court test.",
        powerVsControl:
          "This is the all-round Genius, not the Attack. Same weight band as Attack (360–375 g) but drop/tear rather than diamond, so the power bias is milder than the Attack sibling.",
        handling:
          "Weight Balance lets you add 2 g or 4 g pieces. EOS Tunnel is the aero/mast story. None of that makes it a light beginner stick — the published band still starts at 360 g.",
        comfort:
          "Pulse System and Custom Grip are Nox’s vibration stories. Touch is listed as intermediate, not soft. Arm-comfort shoppers should look at Equation Soft or a Comfort-line from another house first.",
        forgiveness:
          "Drop/tear is more usable than a compact diamond, but NOX still aims this at professionals. Off-centre contact will not feel like a round Indiga.",
        construction:
          "Carbon frame, 18K Alum face, MLD Black Eva, Dual Spin 3D + silica sand, 38 mm. Technologies include DCS, Oversize Grip (+30 mm), Weight Balance and photochromic core paint.",
        bestFor: [
          "Advanced all-court players who want Tapia’s 2026 Genius, not the Attack diamond",
          "Competitive pairs who finish some points but still defend from the back",
        ],
        notIdealFor: [
          "Beginners who need a round, soft, light racket",
          "Pure smashers who specifically want the Genius Attack diamond",
        ],
        buyIf: [
          "You already play at a high club or tournament level and want Tapia’s drop/tear 18K, not a diamond attacker.",
          "You want manufacturer Dual Spin and a published 360–375 g carbon frame with a multilayer EVA core.",
        ],
        skipIf: [
          "You are still building contact and need a round, forgiving Nox such as Equation Soft or X-One.",
          "You specifically want the diamond Attack mould — that is a different model.",
        ],
      },
      attributes: attrs({
        power: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Drop/tear + 18K Alum + MLD Eva and a 360–375 g band sit below the Attack diamond. Inferred from shape/construction, not a lab smash test.",
        },
        control: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "NOX lists style as Multipurpose (not Aggressive) on the Genius 18K page, distinct from Attack.",
        },
        forgiveness: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Drop/tear is typically more usable than diamond, but player level is professional — not a large beginner sweet spot.",
        },
        maneuverability: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Published 360–375 g is a standard-to-heavy adult band. EOS Tunnel claims faster handling; we do not treat that as a measured swingweight.",
        },
        comfort: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "NOX lists intermediate touch plus Pulse System / Custom Grip. Not a soft-EVA comfort racket.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Carbon frame, 18K face and 38 mm adult construction imply a stable platform versus fiberglass club frames.",
        },
        spin: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "Dual Spin is specified as 3D texture plus sandblasted silica across the face.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 88,
          explanation:
            "NOX positions this Genius as multipurpose. Suitable as an advanced all-rounder, not a beginner hybrid.",
          strengths: ["Multipurpose manufacturer style", "Drop/tear vs Attack diamond"],
          compromises: ["Pro-level demand", "Weight still 360 g+"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 90,
          explanation:
            "Manufacturer player level is professional. Matches advanced/competitive use, not first rackets.",
          strengths: ["Pro mould", "18K Alum construction"],
          compromises: ["Unforgiving if your swing is late"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 28,
          explanation:
            "Wrong tool for new players. Round/soft Nox lines exist for that job.",
          strengths: [],
          compromises: ["Professional mould", "Medium-large weight"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 64,
          explanation:
            "Use the Attack 18K if finishing power is the job. This Genius is the multi-purpose sibling.",
          strengths: ["Still a carbon adult frame"],
          compromises: ["Not the diamond Attack"],
        },
      ],
    },
    {
      id: "prod-nox-at10-12k-2026",
      existing: true,
      slug: "nox-at10-genius-12k-alum-xtrem-2026",
      brandId: "brand-nox",
      familyId: "fam-nox-at10",
      generation: "2026-12k",
      name: "AT10 Genius 12K Alum XTREM 2026",
      fullName: "Nox AT10 Genius 12K Alum XTREM 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://noxsport.com/en/products/pala-at10-genius-12k-alum-xtrem-2026-by-agustin-tapia",
      sourceName: "NOX (noxsport.com) AT10 Genius 12K Alum XTREM 2026",
      shortDescription:
        "Tapia’s firmer 2026 Genius: drop/tear, 12K Alum XTREM carbon and HR3 Black Eva — same family as the 18K, stiffer face, not the Attack diamond.",
      verdict:
        "Buy this if you want the Genius mould with a stiffer 12K Alum XTREM face. It is still drop/tear, not Attack.",
      specifications: {
        shape: "teardrop",
        balance: "medium",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "12K Alum XTREM carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K Alum XTREM",
        core: "medium-EVA",
        manufacturerCoreName: "HR3 Black Eva",
        surfaceTexture: "3d-textured",
        feel: "firm",
        playerLevel: "professional",
        manufacturerPositioning: "Versatile / firmer Genius",
        technologies: "Weight Balance, Dual Spin, 12K Alum XTREM, Chromic Paint",
        sweetSpot: "medium",
      },
      strengths: [
        "Manufacturer drop/tear Genius mould with a stiffer 12K Alum XTREM face",
        "HR3 Black Eva is the 12K core — not the 18K’s MLD Black Eva",
        "Same Dual Spin and Weight Balance family tech as the 18K",
      ],
      weaknesses: [
        "Firmer than the 18K — less of a comfort step-in",
        "Still a 360–375 g professional mould",
      ],
      relatedProductIds: [
        "prod-nox-at10-18k-2026",
        "prod-nox-at10-attack-18k-2026",
      ],
      alternativeProductIds: [
        "prod-nox-at10-18k-2026",
        "prod-nox-at10-attack-18k-2026",
      ],
      copy: {
        whatItIs:
          "The 2026 AT10 Genius 12K Alum XTREM is Tapia’s firmer Genius: drop/tear, carbon frame, 12K Alum XTREM carbon and HR3 Black Eva, with Dual Spin and Weight Balance.",
        whoItsFor:
          "Advanced players who want the Genius mould with a stiffer face than the 18K. Not a first racket.",
        howItPlays:
          "NOX says 12K Alum XTREM is stiffer on impact with more uniform fibre. Core is HR3 Black Eva, not MLD. That is manufacturer construction language.",
        powerVsControl:
          "NOX still calls this versatile, not aggressive. The Attack 12K is the diamond sibling if you want that job.",
        handling:
          "Published 360–375 g plus optional 2 g / 4 g Weight Balance pieces. Not a Lite.",
        comfort:
          "Firmer than the 18K by manufacturer intent. Equation Soft is the Nox comfort round.",
        forgiveness:
          "Drop/tear helps versus a diamond, but this is still a professional Genius.",
        construction:
          "Carbon frame, 12K Alum XTREM, HR3 Black Eva, Dual Spin, 38 mm, 360–375 g.",
        bestFor: [
          "Advanced players who want Tapia’s Genius with a stiffer 12K face",
          "Players comparing 12K vs 18K inside the same drop/tear family",
        ],
        notIdealFor: [
          "Beginners",
          "Players who specifically want the Attack diamond",
        ],
        buyIf: [
          "You want the 2026 Genius mould with the stiffer 12K Alum XTREM face and HR3 Black Eva.",
          "You already play at a high level and are choosing between 12K and 18K Genius, not learning the game.",
        ],
        skipIf: [
          "You want the diamond Attack — that is a different model.",
          "You need a round, soft Nox such as Equation Soft.",
        ],
      },
      attributes: attrs({
        power: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Same drop/tear and weight as 18K but a stiffer 12K Alum XTREM face and HR3 core — inferred a bit more punch than 18K, still below Attack diamond.",
        },
        control: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "NOX positions this Genius as versatile / power-and-control, not Aggressive Attack.",
        },
        forgiveness: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Drop/tear plus a firmer face is less forgiving than the 18K and far from Equation Soft.",
        },
        maneuverability: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "Same 360–375 g published band as the 18K Genius.",
        },
        comfort: {
          score: 64,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "NOX markets a firmer, more solid impact than the 18K Alum.",
        },
        stability: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon frame, 12K face and 38 mm adult construction.",
        },
        spin: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Dual Spin (3D + sand) is specified on the 12K page too.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 86,
          explanation:
            "Manufacturer versatile Genius mould with a firmer face than 18K.",
          strengths: ["Drop/tear Genius", "12K Alum XTREM"],
          compromises: ["Firmer than 18K"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 91,
          explanation: "Professional Genius aimed at players who want a stiffer Tapia face.",
          strengths: ["Pro mould", "Stiffer carbon"],
          compromises: ["Not a comfort racket"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 24,
          explanation: "Wrong job. Use Equation Soft or X-line if Nox is the brand.",
          strengths: [],
          compromises: ["Professional firmer Genius"],
        },
      ],
    },
    {
      id: "prod-nox-at10-attack-18k-2026",
      slug: "nox-at10-genius-attack-18k-2026",
      brandId: "brand-nox",
      familyId: "fam-nox-at10",
      generation: "2026-attack-18k",
      name: "AT10 Genius Attack 18K Alum 2026",
      fullName: "Nox AT10 Genius Attack 18K Alum 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-maximum-power",
        "uc-padel-competitive",
      ],
      sourceUrl:
        "https://noxsport.com/en/products/pala-at10-genius-attack-18k-alum-2026-by-agustin-tapia",
      sourceName: "NOX (noxsport.com) AT10 Genius Attack 18K Alum 2026",
      shortDescription:
        "Tapia’s 2026 attacking Genius: diamond, high balance, 18K Alum, MLD Black Eva, Dual Spin — a separate model from the drop/tear Genius 18K.",
      verdict:
        "Buy this if you specifically want the diamond Attack mould. Do not confuse it with the drop/tear Genius 18K that already sits in the catalog.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "18K Alum carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "18K Alum",
        core: "multi-density",
        manufacturerCoreName: "MLD Black Eva",
        surfaceTexture: "3d-textured",
        feel: "medium",
        playerLevel: "professional",
        manufacturerPositioning: "Aggressive / attacking",
        technologies:
          "Weight Balance, Dual Spin, EOS Tunnel, DCS, Pulse System, Oversize Grip",
        sweetSpot: "compact",
      },
      strengths: [
        "Diamond geometry with high balance and an aggressive Attack identity",
        "Same 18K Alum + MLD Black Eva construction language as Genius 18K, different mould",
        "Dual Spin plus Oversize Grip listed for the attacking Tapia spec",
      ],
      weaknesses: [
        "Compact diamond sweet spot versus the drop/tear Genius",
        "High balance asks for a prepared swing",
      ],
      relatedProductIds: [
        "prod-nox-at10-18k-2026",
        "prod-nox-at10-12k-2026",
      ],
      alternativeProductIds: [
        "prod-nox-at10-18k-2026",
        "prod-head-coello-pro",
      ],
      copy: {
        whatItIs:
          "The 2026 AT10 Genius Attack 18K Alum is Tapia’s diamond attacker: high balance, 18K Alum carbon, MLD Black Eva, Dual Spin, 360–375 g, 38 mm.",
        whoItsFor:
          "Advanced attackers who finish overheads and want the Attack mould, not the multi-purpose Genius.",
        howItPlays:
          "NOX copy is maximum power without losing precision, diamond format, high balance, longer grip. Intermediate touch, aggressive style.",
        powerVsControl:
          "This is the power model in the AT10 family. Control players should stay on Genius drop/tear or Equation Soft.",
        handling:
          "High balance and 360–375 g. Weight Balance can shift mass, but the mould is still a diamond attacker.",
        comfort:
          "Pulse System is listed. Touch is intermediate, not soft. Not an arm-comfort racket.",
        forgiveness:
          "Diamond + compact sweet-spot class. Mishits will feel smaller than Genius drop/tear.",
        construction:
          "Carbon frame, 18K Alum, MLD Black Eva, Dual Spin, Weight Balance, 38 mm.",
        bestFor: [
          "Advanced finishers who want Tapia’s 2026 Attack diamond",
          "Players comparing Attack vs Genius inside the same 18K Alum construction",
        ],
        notIdealFor: [
          "Beginners and high-forgiveness shoppers",
          "Players who actually wanted the drop/tear Genius 18K",
        ],
        buyIf: [
          "You want the diamond Attack 18K Alum, not the drop/tear Genius, and you already generate pace.",
          "You want manufacturer Dual Spin and high-balance Attack geometry in the Tapia line.",
        ],
        skipIf: [
          "You thought this was the same racket as Genius 18K — it is not.",
          "You need a round, soft, usable face.",
        ],
      },
      attributes: attrs({
        power: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "NOX lists diamond, high balance and Aggressive style for Attack 18K. Distinct from Multipurpose Genius.",
        },
        control: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Same 18K Alum construction as Genius but diamond/high balance reduces usable control versus the drop/tear sibling.",
        },
        forgiveness: {
          score: 48,
          kind: "SPEC_INFERENCE",
          reasoning: "Diamond + professional Attack mould implies a smaller usable zone than Genius or Equation Soft.",
        },
        maneuverability: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "High balance plus 360–375 g is slower to prepare than a low-balance round.",
        },
        comfort: {
          score: 66,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Intermediate touch and Pulse System; not a soft-EVA comfort model.",
        },
        stability: {
          score: 84,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon frame, 18K face, high-balance diamond typically tracks stable through the smash.",
        },
        spin: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Dual Spin 3D + sand specified on the Attack page.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maximum-power",
          score: 92,
          explanation:
            "Manufacturer Attack diamond with high balance and aggressive style.",
          strengths: ["Diamond Attack identity", "18K Alum"],
          compromises: ["Compact sweet spot"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 90,
          explanation: "The AT10 power model for 2026.",
          strengths: ["Aggressive positioning"],
          compromises: ["Less usable than Genius drop/tear"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 18,
          explanation: "Not a learning racket.",
          strengths: [],
          compromises: ["Diamond Attack"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 52,
          explanation: "Use Genius drop/tear or Equation Soft for control.",
          strengths: [],
          compromises: ["Aggressive diamond"],
        },
      ],
    },
    {
      id: "prod-nox-equation-soft-2026",
      slug: "nox-equation-soft-advanced-2026",
      brandId: "brand-nox",
      familyId: "fam-nox-equation",
      generation: "2026-soft",
      name: "Equation Soft Advanced 2026",
      fullName: "Nox Equation Soft Advanced 2026",
      lifecycle: "current",
      experienceLevels: ["beginner", "intermediate"],
      useCaseIds: [
        "uc-padel-beginner",
        "uc-padel-control",
        "uc-padel-arm-comfort",
        "uc-padel-defensive",
      ],
      sourceUrl: "https://noxsport.com/en/products/pala-equation-soft-advanced",
      sourceName: "NOX (noxsport.com) Equation Soft Advanced 2026",
      shortDescription:
        "Nox’s 2026 comfort round: HR3 Soft EVA, 3K fiberglass face, carbon frame, Exclusive Spin, medium balance, 360–375 g.",
      verdict:
        "Buy this if you want a Nox with a round face and a soft core. It is not Tapia’s Genius, and it is not a 330 g ultralight.",
      specifications: {
        shape: "round",
        balance: "medium",
        weightMin: 360,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "Carbon",
        face: "3K fiberglass",
        faceMaterial: "fiberglass",
        faceCarbonWeave: "3K",
        core: "soft-EVA",
        manufacturerCoreName: "HR3 Soft EVA",
        surfaceTexture: "rough",
        feel: "soft",
        playerLevel: "intermediate",
        manufacturerPositioning: "Comfort / control — Equation Soft",
        technologies: "Exclusive Spin, AVS, DCS, Carbon Frame, SmartStrap",
        sweetSpot: "large",
      },
      strengths: [
        "Manufacturer round + HR3 Soft EVA + 3K fiberglass is a real comfort construction",
        "NOX publishes 80/100 power and 100/100 control on this page — treated as claims, not lab scores",
        "Exclusive Spin texture is specified, not a smooth cheap club face",
      ],
      weaknesses: [
        "Still 360–375 g — not an ultralight",
        "Fiberglass face will not feel like 18K Genius when you want a dry finish",
      ],
      relatedProductIds: ["prod-nox-at10-18k-2026", "prod-nox-ml10-pro-cup"],
      alternativeProductIds: [
        "prod-bullpadel-indiga-ctr",
        "prod-kuikma-pr-soft-500",
      ],
      copy: {
        whatItIs:
          "Equation Soft Advanced 2026 is Nox’s round comfort racket: carbon frame, 3K fiberglass, HR3 Soft EVA, Exclusive Spin, medium balance, 38 mm, 360–375 g.",
        whoItsFor:
          "Improvers and frequent club players who want control and a softer strike. NOX-adjacent listings also mention beginner/exerciser — we treat that as a comfort round, not a kids’ racket.",
        howItPlays:
          "NOX says greater rebound and a more comfortable strike in long sessions, with anti-vibration. Manufacturer control claim is 100/100; we do not repeat that as a Kitletics score.",
        powerVsControl:
          "Control-first round. Power is the easier ball-exit of a soft core, not a diamond smash racket.",
        handling:
          "Medium balance. Weight is still a standard adult band — do not expect Head One Ultralight handling.",
        comfort:
          "This is the Nox arm-comfort priority in this catalog. Soft EVA + AVS is the story. Not medical advice.",
        forgiveness:
          "Round + soft core is the forgiving Nox. Genius Attack is the opposite job.",
        construction:
          "Carbon frame, 3K fiberglass, HR3 Soft EVA, Exclusive Spin, SmartStrap, 38 mm.",
        bestFor: [
          "Club players who want a Nox round with a soft core",
          "Arm-comfort priority without leaving the Nox ecosystem",
        ],
        notIdealFor: [
          "Attackers who want Genius Attack or a diamond Vertex",
          "Players hunting a sub-350 g ultralight",
        ],
        buyIf: [
          "You want a round Nox with HR3 Soft EVA and a 3K fiberglass face for comfort and control.",
          "You play often and prefer rebound and a larger usable face over a dry carbon finish.",
        ],
        skipIf: [
          "You want Tapia’s Genius or Attack carbon moulds.",
          "You need a true ultralight — this still publishes 360–375 g.",
        ],
      },
      attributes: attrs({
        power: {
          score: 62,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "NOX prints 80/100 power on the Equation Soft page. Treated as a claim, not a measurement.",
        },
        control: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "NOX prints 100/100 control and round shape for this model.",
        },
        forgiveness: {
          score: 86,
          kind: "SPEC_INFERENCE",
          reasoning: "Round + soft EVA + fiberglass face is the forgiving construction in this line.",
        },
        maneuverability: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Medium balance helps; 360–375 g is not a light racket.",
        },
        comfort: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "HR3 Soft EVA and anti-vibration are the manufacturer comfort story.",
        },
        stability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon frame at 38 mm is more stable than a cheap fiberglass hoop, less than 18K Genius.",
        },
        spin: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Exclusive Spin rough face is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 84,
          explanation:
            "Round + soft core is the Nox on-ramp in this catalog. Weight is still adult.",
          strengths: ["Round", "Soft EVA"],
          compromises: ["Not ultralight"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 90,
          explanation: "The Nox comfort-priority model among the current options here.",
          strengths: ["HR3 Soft EVA", "AVS"],
          compromises: ["Less finishing power"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 88,
          explanation: "Manufacturer control-first round.",
          strengths: ["Round", "Control claim"],
          compromises: ["Not an Attack"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 32,
          explanation: "Wrong job — use Attack 18K or a diamond from another house.",
          strengths: [],
          compromises: ["Soft round"],
        },
      ],
    },
    {
      id: "prod-nox-ml10-pro-cup",
      existing: true,
      slug: "nox-ml10-pro-cup",
      brandId: "brand-nox",
      familyId: "fam-nox-ml10",
      generation: "pro-cup",
      name: "ML10 Pro Cup",
      fullName: "Nox ML10 Pro Cup",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: ["uc-padel-control", "uc-padel-balanced", "uc-padel-intermediate"],
      sourceUrl: "https://noxsport.com",
      sourceName: "NOX ML10 family (manufacturer site; exact current Pro Cup product page varies by season)",
      shortDescription:
        "Miguel Lamperti’s ML10 Pro Cup identity: Nox’s classic control-oriented cup racket. The exact 2026 face/core version should be confirmed on the live NOX sheet before treating every spec as 2026-new.",
      verdict:
        "Keep this catalog ID as the ML10 Pro Cup. It is not an AT10 Genius. Some construction details remain UNKNOWN until the live product sheet is locked.",
      specifications: {
        shape: "round",
        playerLevel: "intermediate",
        manufacturerPositioning: "ML10 control / classic cup",
      },
      strengths: [
        "Distinct ML10 family identity — not an AT10 duplicate",
        "Historically a control/round Nox, which is why it stays in the catalog",
      ],
      weaknesses: [
        "Live 2026 carbon/core figures are not fully locked on a single product URL in this pass",
        "Do not invent a 12K/18K face for Pro Cup",
      ],
      relatedProductIds: ["prod-nox-equation-soft-2026", "prod-nox-at10-18k-2026"],
      alternativeProductIds: ["prod-nox-equation-soft-2026", "prod-oxdog-sense-pro-2026"],
      copy: {
        whatItIs:
          "ML10 Pro Cup is Nox’s Lamperti-line classic in this catalog — a control-oriented cup identity separate from AT10 Genius.",
        whoItsFor:
          "Club players who want the ML10 name and a more classic control racket, not Tapia’s 2026 Genius.",
        howItPlays:
          "Treat play character as control-leaning until the live 2026 sheet is attached. We do not invent a core hardness.",
        powerVsControl:
          "Control family. Power shoppers should look at AT10 Attack, not Pro Cup.",
        handling:
          "UNKNOWN exact 2026 weight band in this pass — do not invent grams.",
        comfort:
          "Historically more approachable than Genius Attack. Not confirmed as Soft EVA in this file.",
        forgiveness:
          "Round/cup identity is typically more usable than a diamond. Exact sweet-spot class not invented here.",
        construction:
          "Confirm frame/face/core on the current NOX ML10 Pro Cup product page before quoting weaves.",
        bestFor: [
          "Players who specifically want the ML10 Pro Cup identity",
          "Control-leaning Nox buyers who do not want AT10 Attack",
        ],
        notIdealFor: [
          "Anyone needing verified 2026 carbon-weave figures today",
          "Diamond attackers who want Tapia’s Attack mould instead",
        ],
        buyIf: [
          "You want the ML10 Pro Cup name and a control-oriented Nox, not an AT10 Genius.",
          "You are comparing classic ML10 to Equation Soft and can live with some spec UNKNOWN.",
        ],
        skipIf: [
          "You need a fully locked 2026 spec sheet before you will consider the racket.",
          "You want Tapia’s diamond Attack.",
        ],
      },
      attributes: attrs({
        power: {
          score: 58,
          kind: "EXPERT_RESEARCH",
          reasoning:
            "ML10 Pro Cup is consistently positioned as a control cup, not an Attack diamond. Score is research positioning, not a 2026 lab number.",
        },
        control: {
          score: 84,
          kind: "EXPERT_RESEARCH",
          reasoning: "Family identity is control. Exact 2026 claim scores are not copied from a locked sheet.",
        },
        forgiveness: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Round/cup class is typically more usable than Genius Attack. Not a measured sweet spot.",
        },
        maneuverability: {
          score: 70,
          kind: "EXPERT_RESEARCH",
          reasoning: "Classic ML10 is not marketed as a high-balance diamond. Exact grams UNKNOWN here.",
        },
        comfort: {
          score: 76,
          kind: "EXPERT_RESEARCH",
          reasoning: "More approachable than AT10 Attack in specialist writing. Not first-hand.",
        },
        stability: {
          score: 72,
          kind: "EXPERT_RESEARCH",
          reasoning: "Adult Nox cup construction, not a kids’ frame. Weave unconfirmed this pass.",
        },
        spin: {
          score: 70,
          kind: "EXPERT_RESEARCH",
          reasoning: "Nox rough-face families often include spin texture; not asserted as Dual Spin without the sheet.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 82,
          explanation: "ML10 Pro Cup remains the control Nox identity beside Equation Soft.",
          strengths: ["Control family"],
          compromises: ["Spec sheet incomplete"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 34,
          explanation: "Wrong family — use AT10 Attack.",
          strengths: [],
          compromises: ["Control cup"],
        },
      ],
    },
  ];
}
