import type { RacketDraft } from "@/content/padel/rackets/build";
import { attrs } from "@/content/padel/rackets/nox";

export function bullpadelDrafts(): RacketDraft[] {
  return [
    {
      id: "prod-bullpadel-vertex-05",
      existing: true,
      slug: "bullpadel-vertex-05-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-vertex",
      generation: "05",
      name: "Vertex 05",
      fullName: "Bullpadel Vertex 05 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5677-racket-bullpadel-vertex-05.html",
      sourceName: "Bullpadel (bullpadel.com) Vertex 05",
      shortDescription:
        "Juan Tello’s 2026 Vertex: diamond mould, X-Tend Carbon 12K and Multieva, listed as professional and versatile Total Play.",
      verdict:
        "Buy this if you already finish points and want Bullpadel’s current Vertex diamond — not the Hybrid, not the lighter W, and not a beginner Indiga.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "X-Tend Carbon 12K",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "rough",
        feel: "medium",
        playerLevel: "professional",
        manufacturerPositioning: "Versatile / Total Play",
        technologies:
          "Curv:aktiv, Air Power, Vertex Core, Ease Vibe, Custom Weight, Top Spin, Hesacore, Vibradrive, Xtend-Carbon 12K, Multieva, Carbontube",
        sweetSpot: "medium-large",
      },
      strengths: [
        "Manufacturer diamond + 12K + Multieva is the current Tello Vertex, not last year’s 04",
        "Bullpadel lists versatile / Total Play rather than a pure smash-only mould",
        "Custom Weight and Top Spin are specified systems, not a colourway change",
      ],
      weaknesses: [
        "365–375 g diamond still punishes a late swing",
        "Not the Hybrid if you want a lower ~25 cm balance",
      ],
      relatedProductIds: [
        "prod-bullpadel-vertex-05-hybrid",
        "prod-bullpadel-hack-04",
        "prod-bullpadel-vertex-04",
      ],
      alternativeProductIds: [
        "prod-bullpadel-vertex-05-hybrid",
        "prod-adidas-metalbone-3-5-2026",
      ],
      copy: {
        whatItIs:
          "The Vertex 05 is Bullpadel’s 2026 Tello diamond: CarbonTube frame, X-Tend Carbon 12K face, three-layer Multieva and Top Spin grain. The official page lists professional level, versatile style, high balance around 25.4 cm and 365–375 g.",
        whoItsFor:
          "Advanced and competitive players who already build the point and still want a finishing window. If you are learning contact, this is the wrong Bullpadel.",
        howItPlays:
          "Bullpadel pitches Total Play — defence, attack and transitions on the same mould — with Multieva’s firmer outer layers for pace and a softer inner layer on slower balls. That is manufacturer language, not a Kitletics on-court test.",
        powerVsControl:
          "This is the standard Vertex diamond, not Hack 04’s attack channel and not XPLO’s geometric power mould. The Hybrid sibling is the lower-balance Vertex if you want more usable face.",
        handling:
          "Published band is 365–375 g. Custom Weight can add plates at the tip. Air Power is the aero story. None of that makes it a light beginner stick.",
        comfort:
          "Touch is listed as intermediate. Ease Vibe, Hesacore and Vibradrive are the vibration claims. Arm-comfort shoppers should look at Hack 04 Comfort, XPLO Comfort or Indiga first.",
        forgiveness:
          "Sweet-spot size is rated higher than Hack/XPLO on Bullpadel’s own scale, but player level is still professional. Off-centre contact will not feel like Indiga CTR.",
        construction:
          "38 mm, 530 cm² face, X-Tend Carbon 12K, Multieva sandwich, Top Spin sand grain. Technologies include Curv:aktiv, Air Power, Vertex Core and Custom Weight.",
        bestFor: [
          "Advanced all-court players who want the current Vertex diamond, not Vertex 04",
          "Competitive pairs who finish some points but still defend from the back",
        ],
        notIdealFor: [
          "Beginners who need a round, soft, light racket",
          "Players who specifically want the Vertex 05 Hybrid’s low ~25 cm balance",
        ],
        buyIf: [
          "You already play at a high club or tournament level and want Tello’s 2026 diamond Vertex with published 12K and Multieva.",
          "You want the current Vertex — not the previous 04 and not a Tour Advance fiberglass.",
        ],
        skipIf: [
          "You are still building contact and need Indiga CTR or Ionic Light.",
          "You specifically want the Hybrid mould or the 350–360 g Vertex 05 W.",
        ],
      },
      attributes: attrs({
        power: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Diamond + 12K + 365–375 g sit in Bullpadel’s versatile Vertex slot, below XPLO’s manufacturer power rating. Inferred from shape/construction, not a lab smash test.",
        },
        control: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "Bullpadel lists playing style as versatile / Total Play and rates control above Hack 04 on the official Vertex 05 sheet.",
        },
        forgiveness: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Official sweet-spot rating is generous for a diamond, but player level is professional — not a large beginner sweet spot.",
        },
        maneuverability: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "Bullpadel rates maneuverability high on the Vertex 05 sheet; published weight still starts at 365 g.",
        },
        comfort: {
          score: 68,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "Intermediate touch plus Ease Vibe / Hesacore / Vibradrive. Not a SoftEva comfort racket.",
        },
        stability: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning:
            "CarbonTube frame, 12K face and 38 mm adult construction imply a stable platform versus Tour fiberglass.",
        },
        spin: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Top Spin is specified as a sandblasted final-layer grain for slice and volley bite.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 88,
          explanation:
            "Bullpadel positions Vertex 05 as versatile Total Play. Suitable as an advanced all-rounder, not a first racket.",
          strengths: ["Versatile manufacturer style", "Current Vertex diamond"],
          compromises: ["Pro-level demand", "Weight still 365 g+"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 92,
          explanation: "Manufacturer player level is professional. Matches advanced/competitive use.",
          strengths: ["Pro mould", "12K + Multieva"],
          compromises: ["Unforgiving if your swing is late"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 90,
          explanation: "Tello’s current Vertex is the tournament model in this family, not Vertex Advance.",
          strengths: ["Current Pro Line", "Custom Weight"],
          compromises: ["Premium street price"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 24,
          explanation: "Wrong tool for new players. Indiga CTR exists for that job.",
          strengths: [],
          compromises: ["Professional diamond", "365 g+ band"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 68,
          explanation: "Use Hack 04 or XPLO if finishing power is the job. This Vertex is the multi-purpose sibling.",
          strengths: ["Still a diamond adult frame"],
          compromises: ["Not the XPLO geometric power mould"],
        },
      ],
    },
    {
      id: "prod-bullpadel-vertex-05-hybrid",
      slug: "bullpadel-vertex-05-hybrid-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-vertex",
      generation: "05-hybrid",
      name: "Vertex 05 Hybrid",
      fullName: "Bullpadel Vertex 05 Hybrid 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-balanced",
        "uc-padel-control",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5679-racket-bullpadel-vertex-05-hyb.html",
      sourceName: "Bullpadel (bullpadel.com) Vertex 05 HYB",
      shortDescription:
        "Separate Vertex 05 Hybrid model: hybrid mould, low ~25 cm balance, same 12K / Multieva stack as the diamond Vertex.",
      verdict:
        "Buy this if you want Vertex construction with a more usable hybrid face. It is not a colourway of Vertex 05 and not a beginner racket.",
      specifications: {
        shape: "hybrid",
        balance: "low",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "X-Tend Carbon 12K",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "rough",
        playerLevel: "professional",
        manufacturerPositioning: "Versatility",
        technologies:
          "Curv:aktiv, Air Power, Vertex Core, Ease Vibe, Custom Weight, Top Spin, Hesacore, Vibradrive, Xtend-Carbon 12K, Multieva, Carbontube",
        sweetSpot: "medium-large",
      },
      strengths: [
        "Official hybrid mould and low ~25 cm balance — a different product from Vertex 05",
        "Same 12K + Multieva Pro Line stack as the diamond",
        "Bullpadel writes it for players who mix control with a pace change",
      ],
      weaknesses: [
        "Still 365–375 g and professional level",
        "Less tip mass than the diamond Vertex if you live on the smash",
      ],
      relatedProductIds: ["prod-bullpadel-vertex-05", "prod-bullpadel-neuron-02"],
      alternativeProductIds: ["prod-bullpadel-vertex-05", "prod-bullpadel-hack-04-hybrid"],
      copy: {
        whatItIs:
          "Vertex 05 Hybrid is a distinct 2026 model: hybrid shape, 531 cm² face, low balance around 25 cm, 365–375 g, X-Tend Carbon 12K and Multieva. Bullpadel lists it under versatility, not as a paint job on the diamond.",
        whoItsFor:
          "Advanced players who like Vertex materials but want a lower balance and a wider hybrid face. Still the wrong buy if you need a Tour soft round.",
        howItPlays:
          "Bullpadel talks about control in long exchanges and a reaction window when the pace lifts. Inferred handling comes from the low-balance hybrid mould — not a Kitletics swingweight test.",
        powerVsControl:
          "More control-leaning than Vertex 05 diamond and less extreme than Hack 04. Power still comes from 12K + Multieva, not from a head-heavy diamond.",
        handling:
          "Same published weight band as Vertex 05; the difference is the low ~25 cm balance and hybrid outline, not a lighter frame.",
        comfort:
          "Same Ease Vibe / Hesacore / Vibradrive story as the diamond. Touch is still a Pro Line carbon, not SoftEva.",
        forgiveness:
          "Hybrid plus a large listed face is typically more usable than a compact diamond. Player level remains professional.",
        construction:
          "38 mm, X-Tend Carbon 12K, Multieva, Top Spin, Curv:aktiv, Air Power, Vertex Core, Custom Weight.",
        bestFor: [
          "Advanced all-court players who want Vertex 12K without the diamond tip bias",
          "Right-side builders who still finish some balls",
        ],
        notIdealFor: [
          "Beginners",
          "Pure smashers who want Vertex 05 diamond or XPLO",
        ],
        buyIf: [
          "You want the official Vertex 05 Hybrid mould — hybrid shape and low ~25 cm balance — not a lighter Vertex 05.",
          "You already play at a high level and prefer a more usable face than the diamond Vertex.",
        ],
        skipIf: [
          "You specifically want Tello’s diamond Vertex 05.",
          "You need a round beginner racket such as Indiga CTR.",
        ],
      },
      attributes: attrs({
        power: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Same 12K/Multieva as Vertex 05 but hybrid + low balance. Inferred milder smash bias than the diamond.",
        },
        control: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "Official page positions the Hybrid for control in demanding exchanges and lists versatility as the performance tag.",
        },
        forgiveness: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Hybrid + 531 cm² is typically more usable than a compact diamond; still a professional carbon.",
        },
        maneuverability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Low ~25 cm balance helps the head come around; static weight is still 365–375 g.",
        },
        comfort: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Same Pro Line dampening stack as Vertex 05. Not a SoftEva Tour racket.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "CarbonTube + 12K + 38 mm adult frame versus club fiberglass.",
        },
        spin: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Top Spin grain is specified on the Hybrid sheet.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-balanced",
          score: 90,
          explanation: "Official versatility tag plus hybrid mould. Advanced all-rounder, not a starter.",
          strengths: ["Hybrid Vertex", "Low listed balance"],
          compromises: ["Still 365 g+"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 86,
          explanation: "Bullpadel writes this Hybrid for control-first Vertex players.",
          strengths: ["Low balance", "Usable hybrid face"],
          compromises: ["Not a round Indiga"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Professional Vertex construction.",
          strengths: ["12K + Multieva"],
          compromises: ["Demands a formed swing"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 26,
          explanation: "Still a Pro Line carbon in a 365 g band.",
          strengths: [],
          compromises: ["Professional mould", "Weight"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 58,
          explanation: "Choose Vertex 05 diamond, Hack 04 or XPLO for tip-biased smash work.",
          strengths: ["Carbon adult frame"],
          compromises: ["Low-balance hybrid"],
        },
      ],
    },
    {
      id: "prod-bullpadel-vertex-05-w",
      slug: "bullpadel-vertex-05-w-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-vertex",
      generation: "05-w",
      name: "Vertex 05 W",
      fullName: "Bullpadel Vertex 05 W 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maneuverability",
        "uc-padel-balanced",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/proline/5681-racket-bullpadel-vertex-05-w.html",
      sourceName: "Bullpadel (bullpadel.com) Vertex 05 W",
      shortDescription:
        "Delfi Brea’s Vertex 05 Woman: diamond, 350–360 g, Fibrix face and Multieva — a lighter Vertex, not a cosmetic women’s paint.",
      verdict:
        "Buy this if you want Vertex geometry in a published 350–360 g band. It is still an advanced diamond, not Indiga.",
      specifications: {
        shape: "diamond",
        balance: "medium",
        weightMin: 350,
        weightMax: 360,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Fibrix",
        faceMaterial: "carbon-hybrid",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "rough",
        playerLevel: "advanced",
        manufacturerPositioning: "Multipurpose / Total Play",
        technologies:
          "Curv:aktiv, Air Power, Vertex Core, Custom Weight, Top Spin, Fibrix, Multieva, Carbontube",
        sweetSpot: "medium",
      },
      strengths: [
        "Official 350–360 g Vertex — a real weight split from the 365–375 g Vertex 05",
        "Fibrix + Multieva is a distinct face from the men’s 12K Vertex",
        "Bullpadel still aims it at advanced multipurpose play with Delfi Brea",
      ],
      weaknesses: [
        "Diamond and advanced level — not a first racket",
        "Fibrix is more elastic than 12K; smash ceiling is not the men’s Vertex",
      ],
      relatedProductIds: ["prod-bullpadel-vertex-05", "prod-bullpadel-ionic-light"],
      alternativeProductIds: ["prod-bullpadel-vertex-05", "prod-head-coello-motion"],
      copy: {
        whatItIs:
          "Vertex 05 W is the 2026 women’s/light Vertex: diamond, 350–360 g, ≈25.4 cm balance, 530 cm², Fibrix face, Multieva, Top Spin. Bullpadel lists advanced level and multipurpose play.",
        whoItsFor:
          "Advanced players who want Vertex shape and technologies in a lighter published band. Not a beginner round.",
        howItPlays:
          "Bullpadel calls it light enough to move freely and firm enough to take impact — Total Play in a lighter Vertex. Manufacturer claim, not a lab test.",
        powerVsControl:
          "Same diamond outline as Vertex 05 with Fibrix instead of 12K and a lower weight band. Expect easier handling, not XPLO-level tip power.",
        handling:
          "350–360 g is the clear handling story versus the 365–375 g Vertex 05. Balance is listed around 25.4 cm.",
        comfort:
          "Fibrix is Bullpadel’s more elastic carbon/glass blend. Still a diamond Vertex, not SoftEva Indiga.",
        forgiveness:
          "Lighter static weight helps some players get the face on time. Shape is still diamond and level is advanced.",
        construction:
          "38 mm diamond, Fibrix, Multieva, Top Spin, Curv:aktiv, Air Power, Vertex Core, Custom Weight, Carbontube.",
        bestFor: [
          "Advanced players who want Vertex geometry under 360 g",
          "Athletes who found Vertex 05 365–375 g too slow through the air",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the 12K men’s Vertex 05 smash stack",
        ],
        buyIf: [
          "You want the official Vertex 05 W: diamond, 350–360 g, Fibrix and Multieva.",
          "You already play at an advanced level and need a lighter Vertex, not Ionic Light.",
        ],
        skipIf: [
          "You want the 12K Vertex 05 in the 365–375 g band.",
          "You need a round beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Diamond Vertex outline with Fibrix and 350–360 g — less mass/stiffness than 12K Vertex 05.",
        },
        control: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official multipurpose / Total Play positioning for the W model.",
        },
        forgiveness: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Lighter band helps timing; diamond + advanced level still demand centre contact.",
        },
        maneuverability: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Bullpadel’s own copy leads on agility; published 350–360 g supports that claim.",
        },
        comfort: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Fibrix is specified as a more elastic hybrid face than 12K. Not SoftEva.",
        },
        stability: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "CarbonTube + Multieva diamond; less mass than Vertex 05.",
        },
        spin: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Top Spin grain is listed on the Vertex 05 W page.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maneuverability",
          score: 88,
          explanation: "The published 350–360 g Vertex is the handling model in this family.",
          strengths: ["Lighter Vertex band", "Diamond still has finishing geometry"],
          compromises: ["Advanced diamond, not a beginner light"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 84,
          explanation: "Manufacturer multipurpose tag in a lighter Vertex.",
          strengths: ["Total Play copy", "Fibrix comfort vs 12K"],
          compromises: ["Less 12K punch"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 86,
          explanation: "Official advanced level with Brea’s Vertex.",
          strengths: ["Pro Line Vertex family"],
          compromises: ["Still a diamond"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 30,
          explanation: "Advanced diamond. Indiga or Ionic Light are the on-ramp.",
          strengths: [],
          compromises: ["Diamond", "Advanced positioning"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 62,
          explanation: "Fibrix is more elastic than 12K; still not a SoftEva comfort line.",
          strengths: ["Fibrix vs 12K"],
          compromises: ["Diamond Vertex"],
        },
      ],
    },
    {
      id: "prod-bullpadel-hack-04",
      existing: true,
      slug: "bullpadel-hack-04-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-hack",
      generation: "04",
      name: "Hack 04",
      fullName: "Bullpadel Hack 04 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-maximum-power",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5674-racket-bullpadel-hack-04-26.html",
      sourceName: "Bullpadel (bullpadel.com) Hack 04 26",
      shortDescription:
        "Paquito Navarro’s 2026 Hack: attacking diamond with Tricarbon 18K, Multieva, Total Channel and Air React Channel.",
      verdict:
        "Buy this if you accelerate through the ball and want the current Hack diamond. Hybrid and Comfort are separate models; Hack 03 is previous-generation.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Tricarbon 18K",
        faceMaterial: "carbon",
        faceCarbonWeave: "18K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        playerLevel: "professional",
        manufacturerPositioning: "Offensive / accelerating attack",
        technologies:
          "Carbon Tube, Hack, Vibradrive, Hesacore, Tricarbon, Multieva, Custom Weight, Air React Channel, 3Dgrain, Ease Vibe, Smart Holes, Total Channel, Tricore",
        sweetSpot: "compact",
      },
      strengths: [
        "Official offensive Hack 04 with Tricarbon 18K — not Hack 03",
        "Total Channel + Air React Channel are the 2026 aero/attack story",
        "Distinct from Hack 04 Hybrid (hybrid, ~25 cm) and Comfort (Fibrix)",
      ],
      weaknesses: [
        "Compact sweet spot and stiff 18K face",
        "Wrong racket if you want Hack’s counter-attack Hybrid",
      ],
      relatedProductIds: [
        "prod-bullpadel-hack-04-hybrid",
        "prod-bullpadel-hack-04-comfort",
        "prod-bullpadel-hack-03",
      ],
      alternativeProductIds: [
        "prod-bullpadel-xplo",
        "prod-adidas-metalbone-hrd",
      ],
      copy: {
        whatItIs:
          "Hack 04 2026 is Bullpadel’s Paquito attack diamond: Tricarbon 18K, Multieva, Total Channel around the frame and Air React Channel through the Tricore heart. Official copy is accelerate and attack.",
        whoItsFor:
          "Advanced attackers who already generate racket-head speed. If you live on the block and counter, look at Hack 04 Hybrid first.",
        howItPlays:
          "Bullpadel talks about dynamic power and a sweet spot that lets you accelerate more easily. That is their positioning, not a measured smash speed.",
        powerVsControl:
          "This is the stiff 18K Hack. Hybrid uses A-18K aluminised carbon and a hybrid mould; Comfort uses Fibrix. Do not treat those as the same racket.",
        handling:
          "Pro Line weight band in the mid-360s. Custom Weight can load the tip. Air React Channel is the agility claim.",
        comfort:
          "Hesacore, Vibradrive and Ease Vibe are listed. Face is still Tricarbon 18K — firmer than Comfort.",
        forgiveness:
          "Attack diamond with 3D grain. Off-centre play is not the point of this model.",
        construction:
          "Tricarbon 18K, Multieva, CarbonTube, Total Channel, Tricore, Air React Channel, 3Dgrain, Custom Weight.",
        bestFor: [
          "Advanced left-side finishers who want the current Hack diamond",
          "Players moving off Hack 03 into the 2026 18K mould",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the Hybrid counter-attack mould or Fibrix Comfort",
        ],
        buyIf: [
          "You want Paquito’s current Hack 04 diamond with Tricarbon 18K and Total Channel.",
          "You already attack and can live with a compact sweet spot.",
        ],
        skipIf: [
          "You need Hack 04 Hybrid’s ~25 cm hybrid counter-attack setup.",
          "You want Fibrix comfort — that is Hack 04 Comfort.",
        ],
      },
      attributes: attrs({
        power: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "Official playing style is offensive / accelerate and attack, with Tricarbon 18K and Total Channel.",
        },
        control: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Attack diamond + compact sweet-spot rating versus Hybrid’s official control-first sheet.",
        },
        forgiveness: {
          score: 42,
          kind: "SPEC_INFERENCE",
          reasoning: "Professional offensive diamond with 3D grain. Low tolerance off-centre.",
        },
        maneuverability: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning:
            "Air React Channel claims faster airflow; static mass remains a mid-360s diamond.",
        },
        comfort: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "18K Tricarbon is the stiff Hack. Comfort is a different model.",
        },
        stability: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Tricore + Total Channel are specified to raise torsional rigidity.",
        },
        spin: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3Dgrain is specified as a mould-matched texture.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 92,
          explanation: "Manufacturer offensive Hack diamond.",
          strengths: ["18K Tricarbon", "Total Channel"],
          compromises: ["Compact sweet spot"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 88,
          explanation: "Hack 04 and XPLO are the two Bullpadel power peaks. This is the Paquito diamond.",
          strengths: ["Attack mould"],
          compromises: ["XPLO is the geometric alternative"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 90,
          explanation: "Professional Pro Line attack racket.",
          strengths: ["Current Hack"],
          compromises: ["Demands timing"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 18,
          explanation: "Not a first racket.",
          strengths: [],
          compromises: ["18K diamond", "Low forgiveness"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 36,
          explanation: "Choose Hack 04 Comfort or a SoftEva line.",
          strengths: [],
          compromises: ["Stiff 18K face"],
        },
        {
          useCaseId: "uc-padel-defensive",
          score: 40,
          explanation: "Hack 04 Hybrid is the counter-attack model.",
          strengths: ["Stable frame if you can prepare"],
          compromises: ["Offensive diamond"],
        },
      ],
    },
    {
      id: "prod-bullpadel-hack-04-hybrid",
      slug: "bullpadel-hack-04-hybrid-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-hack",
      generation: "04-hybrid",
      name: "Hack 04 Hybrid",
      fullName: "Bullpadel Hack 04 Hybrid 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-defensive",
        "uc-padel-balanced",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5675-racket-bullpadel-hack-04-hyb-26.html",
      sourceName: "Bullpadel (bullpadel.com) Hack 04 HYB 26",
      shortDescription:
        "Separate Hack 04 Hybrid: hybrid mould, ~25 cm balance, A-18K aluminised carbon and Multieva for control and counter-attack.",
      verdict:
        "Buy this if you want Hack technologies in a hybrid, not the 18K diamond. It is not a colourway of Hack 04.",
      specifications: {
        shape: "hybrid",
        balance: "low",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Aluminized Carbon A-18K",
        faceMaterial: "carbon",
        faceCarbonWeave: "18K Alum",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        feel: "medium",
        playerLevel: "professional",
        manufacturerPositioning: "Defensive / counter-attack",
        technologies:
          "Hack Core⁴, Tricore, Hesacore, Air React Channel, Vibradrive, Total Channel, Carbon Tube, 3Dgrain, Smart Holes, Ease Vibe, Custom Weight, Multieva, Tricarbon",
        sweetSpot: "medium-large",
      },
      strengths: [
        "Official defensive / counter-attack positioning — not the diamond Hack",
        "A-18K aluminised carbon is specified as more elastic than 3K/12K",
        "Hybrid + ~25 cm balance is a real mould split",
      ],
      weaknesses: [
        "Still 365–375 g professional carbon",
        "Less tip-smash than Hack 04 diamond",
      ],
      relatedProductIds: ["prod-bullpadel-hack-04", "prod-bullpadel-neuron-02"],
      alternativeProductIds: ["prod-bullpadel-hack-04", "prod-bullpadel-vertex-05-hybrid"],
      copy: {
        whatItIs:
          "Hack 04 Hybrid is a 2026 model with hybrid shape, 365–375 g, ~25 cm balance, 529 cm² face, A-18K aluminised carbon and Multieva. Bullpadel lists professional level and defensive / counter-attack style.",
        whoItsFor:
          "Advanced players who steal pace and redirect rather than only smash. Still not a beginner Hack.",
        howItPlays:
          "Official copy is control and counter-attack: Total Channel around the hybrid outline, Tricore with Air React Channel through the heart, A-18K for an easier ball exit than stiff 18K.",
        powerVsControl:
          "Bullpadel’s own ratings put power low and control/maneuverability high versus Hack 04 diamond. Treat that as manufacturer scoring, not a lab result.",
        handling:
          "~25 cm balance and hybrid outline are the handling story. Weight band matches the diamond Hack.",
        comfort:
          "Touch listed intermediate/soft; A-18K is described as absorbing more impact than stiffer carbons. Still Pro Line.",
        forgiveness:
          "Official sweet-spot rating is high for a Hack. Player level remains professional.",
        construction:
          "A-18K, Multieva, Total Channel, Tricore, Air React Channel, concentric 3Dgrain, Custom Weight up to +12 g.",
        bestFor: [
          "Advanced counter-punchers who want Hack tech without the diamond",
          "Pairs who defend first and finish on the second ball",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the 18K diamond Hack 04",
        ],
        buyIf: [
          "You want the official Hack 04 Hybrid: hybrid mould, ~25 cm balance, A-18K and counter-attack positioning.",
          "You already play at a high level and prefer redirection over a stiff smash diamond.",
        ],
        skipIf: [
          "You want Hack 04’s Tricarbon 18K diamond.",
          "You need a Tour beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 64,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official power rating on the Hybrid sheet is low versus Hack 04 diamond.",
        },
        control: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Playing style is listed as defensive; control rating is 4 on Bullpadel’s sheet.",
        },
        forgiveness: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official sweet-spot size rating is 4 with a hybrid outline.",
        },
        maneuverability: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official maneuverability rating is 4; balance ~25 cm.",
        },
        comfort: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "A-18K is described as more elastic/comfortable than 3K or 12K.",
        },
        stability: {
          score: 78,
          kind: "SPEC_INFERENCE",
          reasoning: "Tricore + Total Channel still stiffen the frame; Hybrid is not a floppy club racket.",
        },
        spin: {
          score: 84,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Concentric 3Dgrain is specified for longer contact and spin.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-defensive",
          score: 90,
          explanation: "Manufacturer defensive / counter-attack Hack.",
          strengths: ["Hybrid + low balance", "A-18K exit"],
          compromises: ["Still pro weight"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 86,
          explanation: "Control-first Hack that still has a finishing window.",
          strengths: ["Usable hybrid"],
          compromises: ["Not Indiga-easy"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 88,
          explanation: "Professional Hack construction.",
          strengths: ["Pro Line"],
          compromises: ["365 g+"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 28,
          explanation: "Wrong first racket.",
          strengths: [],
          compromises: ["Professional carbon"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 52,
          explanation: "Diamond Hack 04 or XPLO if smash is the job.",
          strengths: ["Adult carbon"],
          compromises: ["Low-balance hybrid"],
        },
      ],
    },
    {
      id: "prod-bullpadel-hack-04-comfort",
      slug: "bullpadel-hack-04-comfort-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-hack",
      generation: "04-comfort",
      name: "Hack 04 Comfort",
      fullName: "Bullpadel Hack 04 Comfort 2026",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-easy-power",
        "uc-padel-arm-comfort",
        "uc-padel-power",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5676-racket-bullpadel-hack-04-cmf-26.html",
      sourceName: "Bullpadel (bullpadel.com) Hack 04 CMF 26",
      shortDescription:
        "Hack 04 Comfort: same Hack attack platform with a Fibrix face for a softer feel than the 18K Hack 04.",
      verdict:
        "Buy this if you want Hack geometry with Fibrix comfort. It is not Hack 04 18K and not a beginner Indiga.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 360,
        weightMax: 370,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Fibrix",
        faceMaterial: "carbon-hybrid",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        playerLevel: "advanced",
        manufacturerPositioning: "Offensive with easier feel",
        technologies:
          "Carbon Tube, Hack, Vibradrive, Multieva, Custom Weight, Air React Channel, Fibrix, 3Dgrain, Ease Vibe, Smart Holes, Total Channel, Tricore",
        sweetSpot: "medium",
      },
      strengths: [
        "Official CMF model: Fibrix face on the Hack 04 platform",
        "Bullpadel says same features as Hack 04 with a softer feel",
        "Published 360–370 g band is a touch lighter than the 18K Hack listing",
      ],
      weaknesses: [
        "Still an attacking diamond",
        "Fibrix will not feel like 18K on a clean smash",
      ],
      relatedProductIds: ["prod-bullpadel-hack-04", "prod-bullpadel-xplo-comfort"],
      alternativeProductIds: ["prod-bullpadel-hack-04", "prod-bullpadel-vertex-05-w"],
      copy: {
        whatItIs:
          "Hack 04 CMF is the comfort model: Fibrix (glass + carbon) over Multieva on the Hack attack platform with Total Channel, Tricore and Air React Channel. Bullpadel says it keeps Hack 04 features with a softer feel.",
        whoItsFor:
          "Advanced players who like Hack’s attacking outline but want an easier face than Tricarbon 18K. Not a first racket.",
        howItPlays:
          "Manufacturer copy is fast-paced play with more comfort. Weight listings on specialist sheets sit at 360–370 g with a high ~26.4 cm balance.",
        powerVsControl:
          "Easier output than 18K Hack 04; still an offensive diamond, not Hybrid’s counter-attack mould.",
        handling:
          "Slightly lighter published band than the 18K Hack. Still head-biased Hack geometry.",
        comfort:
          "Fibrix is the comfort story. Ease Vibe and Vibradrive are listed. This is the arm-friendlier Hack, not a medical claim.",
        forgiveness:
          "Softer face helps some off-centre balls leave. Shape is still diamond.",
        construction:
          "Fibrix, Multieva, CarbonTube, Total Channel, Tricore, Air React Channel, 3Dgrain.",
        bestFor: [
          "Advanced attackers who found Hack 04 18K too harsh",
          "Players who want Hack geometry with Fibrix",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the stiff 18K Hack 04",
        ],
        buyIf: [
          "You want the official Hack 04 Comfort / CMF with Fibrix, not the 18K diamond.",
          "You already attack and need an easier face than Tricarbon 18K.",
        ],
        skipIf: [
          "You want maximum 18K Hack stiffness.",
          "You need a round beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Hack diamond + Multieva with Fibrix instead of 18K. Still offensive, less peak stiffness.",
        },
        control: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Same Hack platform as 04 with a more elastic face. Not the Hybrid control model.",
        },
        forgiveness: {
          score: 62,
          kind: "SPEC_INFERENCE",
          reasoning: "Fibrix helps versus 18K; diamond outline still compact versus hybrid/round.",
        },
        maneuverability: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "360–370 g listed band is a touch lighter than the 18K Hack.",
        },
        comfort: {
          score: 78,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official CMF story is a softer feel via Fibrix on the Hack 04 platform.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Tricore + Total Channel remain on the Comfort model.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3Dgrain is listed on the CMF technology stack.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-easy-power",
          score: 84,
          explanation: "Hack attack outline with a more elastic Fibrix face.",
          strengths: ["Fibrix vs 18K", "Hack geometry"],
          compromises: ["Still a diamond"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 76,
          explanation: "The comfort Hack. Not a SoftEva medical racket.",
          strengths: ["Fibrix", "Ease Vibe listed"],
          compromises: ["High-balance diamond"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 80,
          explanation: "Offensive Hack family, easier face.",
          strengths: ["Attack platform"],
          compromises: ["Less 18K punch"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 32,
          explanation: "Still an advanced attack diamond.",
          strengths: [],
          compromises: ["Diamond Hack"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 70,
          explanation: "18K Hack 04 or XPLO if you want the stiff peak.",
          strengths: ["Hack diamond"],
          compromises: ["Fibrix not 18K"],
        },
      ],
    },
    {
      id: "prod-bullpadel-neuron-02",
      slug: "bullpadel-neuron-02-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-neuron",
      generation: "02",
      name: "Neuron 02",
      fullName: "Bullpadel Neuron 02 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-control",
        "uc-padel-defensive",
        "uc-padel-advanced",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5684-racket-bullpadel-neuron-02.html",
      sourceName: "Bullpadel (bullpadel.com) Neuron 02",
      shortDescription:
        "Fede Chingotto’s control Neuron 02: PrismLock frame, X-Tend Carbon 3K and Multieva — not the geometric Edge.",
      verdict:
        "Buy this if you want Chingotto’s control Neuron. Edge is a separate geometric/diamond model.",
      specifications: {
        shape: "hybrid",
        balance: "mid-low",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "X-Tend Carbon 3K",
        faceMaterial: "carbon",
        faceCarbonWeave: "3K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        feel: "firm",
        playerLevel: "professional",
        manufacturerPositioning: "Control / precision",
        technologies:
          "Carbon Tube, Vibradrive, Hesacore, Multieva, 3Dgrain, Air Power, XtendCarbon 3K, Neuron, Ease Vibe, Smart Holes, Prismlock",
      },
      strengths: [
        "Official control Neuron, distinct from Neuron 02 Edge",
        "PrismLock triangulation is the 2026 Neuron frame story",
        "3K X-Tend is specified for a firm, dry, precise feel",
      ],
      weaknesses: [
        "Firm 3K is not a soft beginner face",
        "Less geometric tip power than the Edge",
      ],
      relatedProductIds: ["prod-bullpadel-neuron-02-edge", "prod-bullpadel-vertex-05-hybrid"],
      alternativeProductIds: ["prod-bullpadel-neuron-02-edge", "prod-bullpadel-hack-04-hybrid"],
      copy: {
        whatItIs:
          "Neuron 02 is Chingotto’s control racket: PrismLock prismatic frame, X-Tend Carbon 3K, Multieva and 3Dgrain. Bullpadel contrasts it with the Edge — this one prioritises control, a lower balance and comfortable handling with a solid, dry feel.",
        whoItsFor:
          "Advanced players who build the point with placement. If you want Neuron with geometric power, that is Edge.",
        howItPlays:
          "Manufacturer copy is anticipate, stay stable and answer with confidence. Firm 3K is a precision story, not easy power.",
        powerVsControl:
          "Control Neuron. Edge takes the geometric/diamond path. Do not buy this expecting XPLO smash.",
        handling:
          "Bullpadel calls out lower balance and maneuverability versus Edge. Exact grams are omitted here because the official sheet did not publish a clean band on the retrieved page.",
        comfort:
          "Hesacore, Vibradrive and Ease Vibe are listed. Face feel is still firm 3K.",
        forgiveness:
          "More usable than Edge’s geometric power mould; still professional 3K.",
        construction:
          "X-Tend Carbon 3K, Multieva, PrismLock, Air Power, Neuron heart, 3Dgrain.",
        bestFor: [
          "Advanced control players who want Chingotto’s Neuron, not Edge",
          "Pairs who defend and construct rather than only smash",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want Neuron 02 Edge’s geometric power",
        ],
        buyIf: [
          "You want the official Neuron 02 control model with PrismLock and 3K, not the Edge.",
          "You already play at a high level and live on placement.",
        ],
        skipIf: [
          "You want the geometric Neuron 02 Edge.",
          "You need a soft round beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 62,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official copy prioritises control versus Edge’s geometric power.",
        },
        control: {
          score: 90,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Bullpadel’s Neuron 02 page is written as exceptional control and precision.",
        },
        forgiveness: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Control mould versus Edge; still firm professional 3K.",
        },
        maneuverability: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Manufacturer contrasts lower balance and handling with the Edge.",
        },
        comfort: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "Dampening tech is listed; 3K is described as firm and dry.",
        },
        stability: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "PrismLock is specified to block twist and keep the frame stable.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3Dgrain is on the Neuron 02 technology list.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-control",
          score: 92,
          explanation: "Chingotto’s official control Neuron.",
          strengths: ["PrismLock", "3K precision"],
          compromises: ["Firm face"],
        },
        {
          useCaseId: "uc-padel-defensive",
          score: 88,
          explanation: "Built to stay in the point, not to peak on smash.",
          strengths: ["Lower balance vs Edge"],
          compromises: ["Pro demand"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 90,
          explanation: "Professional Neuron construction.",
          strengths: ["Pro Line"],
          compromises: ["Not easy power"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 22,
          explanation: "Firm 3K control pro racket.",
          strengths: [],
          compromises: ["Professional", "Firm 3K"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 48,
          explanation: "Edge, Hack 04 or XPLO if power is the job.",
          strengths: [],
          compromises: ["Control-first Neuron"],
        },
      ],
    },
    {
      id: "prod-bullpadel-neuron-02-edge",
      slug: "bullpadel-neuron-02-edge-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-neuron",
      generation: "02-edge",
      name: "Neuron 02 Edge",
      fullName: "Bullpadel Neuron 02 Edge 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-power",
        "uc-padel-advanced",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5685-racket-bullpadel-neuron-02-edge.html",
      sourceName: "Bullpadel (bullpadel.com) Neuron 02 Edge",
      shortDescription:
        "Neuron 02 Edge: Chingotto’s geometric/diamond model, 365–375 g, ~26 cm balance, 3K and PrismLock — not the control Neuron 02.",
      verdict:
        "Buy this if you want Neuron materials with geometric tip bias. The standard Neuron 02 is the control sibling.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "X-Tend Carbon 3K",
        faceMaterial: "carbon",
        faceCarbonWeave: "3K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        playerLevel: "professional",
        manufacturerPositioning: "Control with geometric power",
        technologies:
          "Carbon Tube, Vibradrive, Hesacore, Multieva, Custom Weight, 3Dgrain, Air Power, XtendCarbon 3K, Neuron, Ease Vibe, Geo Shape, Smart Holes, Prismlock",
        sweetSpot: "medium",
      },
      strengths: [
        "Official geometric/diamond Neuron — a different model from Neuron 02",
        "Published 365–375 g and ~26 cm balance",
        "PrismLock plus geometric frame is the Edge story",
      ],
      weaknesses: [
        "More demanding than the control Neuron",
        "Still 3K precision carbon, not a trampoline",
      ],
      relatedProductIds: ["prod-bullpadel-neuron-02", "prod-bullpadel-xplo"],
      alternativeProductIds: ["prod-bullpadel-neuron-02", "prod-bullpadel-hack-04"],
      copy: {
        whatItIs:
          "Neuron 02 Edge is listed as geometric/diamond, 365–375 g, 38 mm, ~26 cm balance, 535 cm², X-Tend Carbon 3K and Multieva. PrismLock and a wider 2-and-10 frame are the Edge geometry.",
        whoItsFor:
          "Advanced players who like Chingotto’s Neuron family but want more launch from a geometric tip. Not the control Neuron 02.",
        howItPlays:
          "Bullpadel says the geometric frame plus PrismLock keeps the racket stable at speed so you can accelerate without the head twisting. Manufacturer claim.",
        powerVsControl:
          "Official performance tag is still control, with higher power ratings than the standard Neuron. It is not XPLO’s maximum-power mould.",
        handling:
          "Elevated balance versus Neuron 02. Weight 365–375 g.",
        comfort:
          "Same Ease Vibe / Hesacore stack. Firm 3K remains.",
        forgiveness:
          "Wider geometric contact area is the Edge tolerance story. Still professional.",
        construction:
          "3K, Multieva, PrismLock, Geo Shape, Air Power, 3Dgrain, Custom Weight.",
        bestFor: [
          "Advanced players who want Neuron 3K with geometric launch",
          "Chingotto-line buyers who found Neuron 02 too control-linear",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want the lower-balance Neuron 02",
        ],
        buyIf: [
          "You want the official Neuron 02 Edge geometric/diamond model with 365–375 g and ~26 cm balance.",
          "You already play at a high level and want Neuron precision with more tip bias.",
        ],
        skipIf: [
          "You want the control Neuron 02.",
          "You need a beginner round.",
        ],
      },
      attributes: attrs({
        power: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning:
            "Geometric/diamond + elevated balance; official sheet rates power higher than the control Neuron.",
        },
        control: {
          score: 82,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Performance tag remains control; PrismLock is the stability/precision claim.",
        },
        forgiveness: {
          score: 56,
          kind: "SPEC_INFERENCE",
          reasoning: "Wider geometric face versus a compact diamond; still pro 3K.",
        },
        maneuverability: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "~26 cm balance and 365–375 g. Less handy than Neuron 02’s lower-balance copy.",
        },
        comfort: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Firm 3K with listed dampeners.",
        },
        stability: {
          score: 88,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "PrismLock is specified to block deformation at high speed.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3Dgrain is specified.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 82,
          explanation: "Geometric Neuron with elevated balance.",
          strengths: ["Geo/diamond", "365–375 g"],
          compromises: ["Still a control-family 3K"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 90,
          explanation: "Professional Edge model.",
          strengths: ["PrismLock", "3K"],
          compromises: ["Demanding"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 86,
          explanation: "Chingotto Edge for players who already generate pace.",
          strengths: ["Pro Line"],
          compromises: ["Not XPLO peak"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 20,
          explanation: "Geometric pro Neuron.",
          strengths: [],
          compromises: ["Diamond/geo", "3K"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 74,
          explanation: "Standard Neuron 02 is the clearer control buy.",
          strengths: ["PrismLock"],
          compromises: ["Higher balance than Neuron 02"],
        },
      ],
    },
    {
      id: "prod-bullpadel-xplo",
      slug: "bullpadel-xplo-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-xplo",
      generation: "2026",
      name: "XPLO",
      fullName: "Bullpadel XPLO 2026",
      lifecycle: "current",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: [
        "uc-padel-maximum-power",
        "uc-padel-power",
        "uc-padel-competitive",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5682-racket-bullpadel-xplo-26.html",
      sourceName: "Bullpadel (bullpadel.com) XPLO 26",
      shortDescription:
        "Martín Di Nenno’s XPLO: geometric mould, 365–375 g, ~26.5 cm balance, 12K and Multieva — Bullpadel’s listed most-powerful racket.",
      verdict:
        "Buy this if you want Bullpadel’s geometric power peak. Comfort is a separate Fibrix model. This is not Vertex.",
      specifications: {
        shape: "other",
        balance: "high",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "X-Tend Carbon 12K",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        feel: "firm",
        playerLevel: "professional",
        manufacturerPositioning: "Offensive / maximum power",
        technologies:
          "Hesacore, Geometric Core, Air Power, Wave System, Vibradrive, Geometric Shape, Carbon Tube, 3Dgrain, Hexature, Smart Holes, Ease Vibe, Custom Weight, Multieva, XtendCarbon 12K",
        sweetSpot: "compact",
      },
      strengths: [
        "Official ‘most powerful racket in Bullpadel history’ positioning",
        "Geometric shape with published 365–375 g and ~26.5 cm balance",
        "12K + Multieva with Hexature and Geometric Core",
      ],
      weaknesses: [
        "Official power 5 / sweet-spot 2.5 — low tolerance",
        "Maneuverability rated 2.5 on Bullpadel’s sheet",
      ],
      relatedProductIds: ["prod-bullpadel-xplo-comfort", "prod-bullpadel-hack-04"],
      alternativeProductIds: ["prod-bullpadel-hack-04", "prod-head-coello-pro"],
      copy: {
        whatItIs:
          "XPLO 2026 is Di Nenno’s geometric power racket: 365–375 g, 38 mm, ~26.5 cm balance, 535 cm², X-Tend Carbon 12K, Multieva and 3D grain. Shape is listed as Geometric — stored as other, not a fake diamond label.",
        whoItsFor:
          "Elite attackers who already generate speed. If you want the same idea with Fibrix, that is XPLO Comfort.",
        howItPlays:
          "Bullpadel rates power at the top of their scale and sweet spot / maneuverability near the bottom. Wave System is the flex/catapult claim on slower balls.",
        powerVsControl:
          "This is the power peak. Vertex is versatile; Hack is the Paquito diamond; XPLO is geometric explosion.",
        handling:
          "High ~26.5 cm balance and 365–375 g. Official maneuverability rating is low.",
        comfort:
          "Touch is listed as intermediate/hard. The Comfort version exists for a softer feel.",
        forgiveness:
          "Official sweet-spot rating 2.5. Do not buy this to hide mishits.",
        construction:
          "Geometric Shape, Geometric Core, Hexature, Air Power, Wave System, 12K, Multieva, 3Dgrain.",
        bestFor: [
          "Advanced finishers who want Bullpadel’s geometric XPLO",
          "Players who already smash and want the Di Nenno power mould",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want XPLO Comfort’s Fibrix face",
        ],
        buyIf: [
          "You want the official XPLO 26 geometric power racket with 12K, Multieva and a published 365–375 g band.",
          "You already generate your own pace and can live with a small sweet spot.",
        ],
        skipIf: [
          "You want XPLO Comfort.",
          "You need forgiveness or a first racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 96,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Bullpadel calls XPLO its most powerful racket and rates power 5/5.",
        },
        control: {
          score: 48,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official control rating 2.5 on the XPLO sheet.",
        },
        forgiveness: {
          score: 34,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official sweet-spot size 2.5.",
        },
        maneuverability: {
          score: 42,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official maneuverability 2.5 with ~26.5 cm balance.",
        },
        comfort: {
          score: 50,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Touch is listed as intermediate/hard. Comfort is a separate CMF model.",
        },
        stability: {
          score: 84,
          kind: "SPEC_INFERENCE",
          reasoning: "Hexature + Geometric Core are specified to reduce twist under power.",
        },
        spin: {
          score: 80,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3Dgrain is specified for this mould.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maximum-power",
          score: 96,
          explanation: "Bullpadel’s listed power peak.",
          strengths: ["Geometric mould", "Power 5/5"],
          compromises: ["Tiny official sweet spot"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 94,
          explanation: "Offensive professional XPLO.",
          strengths: ["12K geometric"],
          compromises: ["Harsh if late"],
        },
        {
          useCaseId: "uc-padel-competitive",
          score: 88,
          explanation: "Di Nenno’s current power model.",
          strengths: ["Pro Line"],
          compromises: ["Low maneuverability rating"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 12,
          explanation: "Worst-fit Bullpadel in this file for new players.",
          strengths: [],
          compromises: ["Maximum-power geometric"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 28,
          explanation: "Use XPLO Comfort or Indiga.",
          strengths: [],
          compromises: ["Hard 12K geometric"],
        },
      ],
    },
    {
      id: "prod-bullpadel-xplo-comfort",
      slug: "bullpadel-xplo-comfort-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-xplo",
      generation: "2026-cmf",
      name: "XPLO Comfort",
      fullName: "Bullpadel XPLO Comfort 2026",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-easy-power",
        "uc-padel-power",
        "uc-padel-arm-comfort",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5683-racket-bullpadel-xplo-cmf-26.html",
      sourceName: "Bullpadel (bullpadel.com) XPLO CMF 26",
      shortDescription:
        "XPLO Comfort: geometric XPLO idea with a Fibrix face so the power mould is less harsh than 12K XPLO.",
      verdict:
        "Buy this if you want XPLO geometry with Fibrix. It is not a lighter colourway of XPLO 12K.",
      specifications: {
        shape: "other",
        balance: "high",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Fibrix",
        faceMaterial: "carbon-hybrid",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        playerLevel: "advanced",
        manufacturerPositioning: "Explosive power with easier feel",
        technologies:
          "Carbon Tube, Vibradrive, Multieva, Custom Weight, Fibrix, 3Dgrain, Air Power, Wave System, Ease Vibe, Geo Core, Geo Shape, Hexature, Smart Holes",
      },
      strengths: [
        "Official CMF model with Fibrix on the XPLO geometric platform",
        "Wave System + Geo Core remain from the power mould",
        "Bullpadel writes it for players who want explosion without 12K harshness",
      ],
      weaknesses: [
        "Still a geometric power concept",
        "Not as peak-stiff as 12K XPLO",
      ],
      relatedProductIds: ["prod-bullpadel-xplo", "prod-bullpadel-hack-04-comfort"],
      alternativeProductIds: ["prod-bullpadel-xplo", "prod-bullpadel-hack-04-comfort"],
      copy: {
        whatItIs:
          "XPLO CMF is the Comfort XPLO: Fibrix over Multieva on the geometric XPLO platform with Wave System, Hexature, Geo Core and Air Power. Official line is a more comfortable playing experience without dropping the explosive idea.",
        whoItsFor:
          "Advanced players who like Di Nenno’s geometric mould but found 12K XPLO too dry. Still not Indiga.",
        howItPlays:
          "Fibrix is described as flexible glass plus rigid carbon. Wave System is the catapult-on-slow-balls claim.",
        powerVsControl:
          "Easier than 12K XPLO; still a power-family geometric racket.",
        handling:
          "Same geometric outline family as XPLO. A published gram band was not captured on the retrieved CMF sheet, so weight keys are omitted.",
        comfort:
          "This is the XPLO comfort model. Fibrix + Ease Vibe + Vibradrive. Not a medical claim.",
        forgiveness:
          "More elastic face than 12K XPLO. Geometry is still power-first.",
        construction:
          "Fibrix, Multieva, Geo Shape, Geo Core, Hexature, Wave System, Air Power, 3Dgrain.",
        bestFor: [
          "Advanced attackers who want XPLO geometry with Fibrix",
          "Players stepping toward XPLO without the 12K face",
        ],
        notIdealFor: [
          "Beginners",
          "Players who want 12K XPLO’s peak stiffness",
        ],
        buyIf: [
          "You want the official XPLO Comfort / CMF with Fibrix on the geometric XPLO platform.",
          "You already attack and need an easier face than 12K XPLO.",
        ],
        skipIf: [
          "You want 12K XPLO.",
          "You need a round beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 84,
          kind: "SPEC_INFERENCE",
          reasoning: "Geometric XPLO platform with Fibrix instead of 12K. Still a power mould.",
        },
        control: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Easier face than 12K XPLO; outline remains geometric power.",
        },
        forgiveness: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "Fibrix helps versus 12K; geometry is still unforgiving versus hybrid/round.",
        },
        maneuverability: {
          score: 56,
          kind: "SPEC_INFERENCE",
          reasoning: "Same geometric family as XPLO. No published lighter band on the retrieved page.",
        },
        comfort: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official CMF positioning is comfort on the XPLO idea via Fibrix.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Hexature and Geo Core remain on the CMF stack.",
        },
        spin: {
          score: 78,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3Dgrain is listed.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-easy-power",
          score: 86,
          explanation: "XPLO geometry with a more elastic Fibrix face.",
          strengths: ["Fibrix", "Geo mould"],
          compromises: ["Still geometric"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 82,
          explanation: "Power family, easier face.",
          strengths: ["XPLO platform"],
          compromises: ["Not 12K peak"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 72,
          explanation: "The comfort XPLO. Still not SoftEva.",
          strengths: ["Fibrix CMF"],
          compromises: ["Geometric power outline"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 26,
          explanation: "Still a power-mould Bullpadel.",
          strengths: [],
          compromises: ["Geometric XPLO"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 74,
          explanation: "12K XPLO if you want the official peak.",
          strengths: ["Same mould family"],
          compromises: ["Fibrix not 12K"],
        },
      ],
    },
    {
      id: "prod-bullpadel-ionic-light",
      slug: "bullpadel-ionic-light-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-ionic",
      generation: "2026",
      name: "Ionic Light",
      fullName: "Bullpadel Ionic Light 26",
      lifecycle: "current",
      experienceLevels: ["intermediate"],
      useCaseIds: [
        "uc-padel-maneuverability",
        "uc-padel-intermediate",
        "uc-padel-balanced",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5693-racket-bullpadel-ionic-light-26.html",
      sourceName: "Bullpadel (bullpadel.com) Ionic Light 26",
      shortDescription:
        "Next-line Ionic Light: hybrid, medium balance, 350–360 g, Glaphite face and Multieva for intermediate all-court play.",
      verdict:
        "Buy this if you want a lighter hybrid between Indiga and Pro Line Vertex. It is not Vertex 05 W and not a beginner-only toy.",
      specifications: {
        shape: "hybrid",
        balance: "medium",
        weightMin: 350,
        weightMax: 360,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Glaphite",
        faceMaterial: "carbon-hybrid",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        surfaceTexture: "3d-textured",
        feel: "medium",
        playerLevel: "intermediate",
        manufacturerPositioning: "Versatile / Next line",
        technologies: "Carbon Tube, 3Dgrain, Glaphite, XForce, Multieva",
        sweetSpot: "medium",
      },
      strengths: [
        "Official 350–360 g hybrid with medium balance",
        "Glaphite (carbon + glass) is a distinct Next-line face from Vertex 12K",
        "Bullpadel lists intermediate / versatile — the step between Indiga and Pro Line",
      ],
      weaknesses: [
        "Not a Pro Line Vertex if you want 12K Total Play",
        "Still more than a first-week Indiga",
      ],
      relatedProductIds: ["prod-bullpadel-indiga-ctr", "prod-bullpadel-vertex-advance"],
      alternativeProductIds: ["prod-bullpadel-indiga-ctr", "prod-bullpadel-vertex-05-w"],
      copy: {
        whatItIs:
          "Ionic Light 26 is a Next-line hybrid: 350–360 g, 38 mm, medium balance, Glaphite face, Multieva and 3Dgrain. Official segment is women / intermediate / versatile.",
        whoItsFor:
          "Intermediate players who want a light hybrid without jumping to Vertex 05. Useful for developing all-court play.",
        howItPlays:
          "Bullpadel talks about attack-to-defence transitions and less fatigue from the lighter band. XForce is the lateral-stiffening claim.",
        powerVsControl:
          "Official ratings sit in the middle. This is not Hack/XPLO and not a pure control round.",
        handling:
          "350–360 g plus medium balance is the handling story. That is why it exists beside Vertex 05 W.",
        comfort:
          "Glaphite is specified as flexible and resistant. Intermediate touch.",
        forgiveness:
          "Hybrid + lighter band is more usable than a Pro diamond. Still not Indiga’s round SoftEva.",
        construction:
          "Glaphite, Multieva, CarbonTube, XForce, 3Dgrain.",
        bestFor: [
          "Intermediates who want a light hybrid all-rounder",
          "Players moving up from Indiga who are not ready for Vertex 05",
        ],
        notIdealFor: [
          "Absolute beginners who need Indiga CTR",
          "Advanced players who want 12K Vertex or Hack",
        ],
        buyIf: [
          "You want the official Ionic Light 26: hybrid, 350–360 g, medium balance, Glaphite and Multieva.",
          "You already have basic contact and want a lighter Next-line racket, not Pro Line 12K.",
        ],
        skipIf: [
          "You are brand new — start with Indiga CTR.",
          "You want Vertex 05 or Hack 04 construction.",
        ],
      },
      attributes: attrs({
        power: {
          score: 62,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official power rating is 2/5 on the Ionic Light sheet.",
        },
        control: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official control 2.5 with versatile positioning.",
        },
        forgiveness: {
          score: 72,
          kind: "SPEC_INFERENCE",
          reasoning: "Hybrid + 350–360 g is more usable than Pro diamonds; not a large beginner round.",
        },
        maneuverability: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official maneuverability 3.5 and a published 350–360 g band.",
        },
        comfort: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Glaphite is specified as a flexible carbon/glass mix. Intermediate touch.",
        },
        stability: {
          score: 68,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "XForce is specified to stiffen the frame at the balance point; still a light Next racket.",
        },
        spin: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "3Dgrain is listed.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-maneuverability",
          score: 88,
          explanation: "Published 350–360 g hybrid.",
          strengths: ["Light Next line", "Hybrid"],
          compromises: ["Not Pro 12K"],
        },
        {
          useCaseId: "uc-padel-intermediate",
          score: 90,
          explanation: "Official intermediate / versatile Ionic.",
          strengths: ["Glaphite", "Medium balance"],
          compromises: ["Ceiling below Vertex"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 84,
          explanation: "Manufacturer versatility tag.",
          strengths: ["Hybrid all-court"],
          compromises: ["Not a finishing diamond"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 58,
          explanation: "Playable if you already make contact; Indiga is the truer first racket.",
          strengths: ["Light hybrid"],
          compromises: ["Intermediate positioning"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 40,
          explanation: "Wrong family for smash-first play.",
          strengths: [],
          compromises: ["Light Next hybrid"],
        },
      ],
    },
    {
      id: "prod-bullpadel-indiga-ctr",
      slug: "bullpadel-indiga-ctr-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-indiga",
      generation: "2026",
      name: "Indiga CTR",
      fullName: "Bullpadel Indiga CTR 26",
      lifecycle: "current",
      experienceLevels: ["beginner"],
      useCaseIds: [
        "uc-padel-beginner",
        "uc-padel-control",
        "uc-padel-arm-comfort",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5697-racket-bullpadel-indiga-ctr-26.html",
      sourceName: "Bullpadel (bullpadel.com) Indiga CTR 26",
      shortDescription:
        "Tour-line Indiga CTR: round, low balance, 360–370 g, Polyglass face and SoftEva for developing players.",
      verdict:
        "Buy this if you are learning padel and want a round, soft Bullpadel. It is not Vertex and not a hidden power racket.",
      specifications: {
        shape: "round",
        balance: "low",
        weightMin: 360,
        weightMax: 370,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Polyglass",
        faceMaterial: "fiberglass",
        core: "soft-EVA",
        manufacturerCoreName: "SoftEva",
        feel: "soft",
        playerLevel: "beginner",
        manufacturerPositioning: "Defensive / placement",
        technologies: "Carbon Tube, Grip Zone, Soft Eva, Polyglass",
        sweetSpot: "large",
      },
      strengths: [
        "Official beginner / defensive Tour racket",
        "Round + low balance + SoftEva + Polyglass is a real first-racket recipe",
        "Not a fake ‘light’ diamond",
      ],
      weaknesses: [
        "Official power rating is 1.5 — you supply the pace",
        "360–370 g is not an ultralight even if the copy says easy to handle",
      ],
      relatedProductIds: ["prod-bullpadel-ionic-light", "prod-bullpadel-vertex-advance"],
      alternativeProductIds: ["prod-kuikma-pr-soft-500", "prod-head-one-ultralight"],
      copy: {
        whatItIs:
          "Indiga CTR 26 is Bullpadel’s Tour control starter: round, low balance, 360–370 g, 38 mm, Polyglass face, SoftEva core. Player level is beginner; style is defensive.",
        whoItsFor:
          "New and developing players who want placement and a soft face. If you already smash for fun, this will feel dead.",
        howItPlays:
          "Bullpadel writes it for precision and manoeuvrability. SoftEva is the comfort/absorption claim. You will not get Vertex ball speed.",
        powerVsControl:
          "Control and placement. Official power is the bottom of their scale.",
        handling:
          "Low balance is the easy-head story. Static weight is still 360–370 g — not a 300 g Head One.",
        comfort:
          "SoftEva + Polyglass is the comfort pair. That is why this exists beside Vertex.",
        forgiveness:
          "Round + soft core is the forgiveness story. Sweet-spot rating is the highest of the cheap Tour sheet.",
        construction:
          "Polyglass, SoftEva, CarbonTube reinforcements, Grip Zone.",
        bestFor: [
          "Beginners who want a current Bullpadel round",
          "Players prioritising placement and a soft face",
        ],
        notIdealFor: [
          "Advanced attackers",
          "Anyone shopping Vertex or Hack by name only",
        ],
        buyIf: [
          "You are learning and want the official Indiga CTR: round, low balance, SoftEva and Polyglass.",
          "You care more about keeping the ball in play than finishing overheads.",
        ],
        skipIf: [
          "You already generate pace and want Vertex or Hack.",
          "You want a sub-330 g ultralight — look at Head One Ultralight.",
        ],
      },
      attributes: attrs({
        power: {
          score: 32,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official power rating 1.5 on the Indiga CTR sheet.",
        },
        control: {
          score: 78,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Round + low balance + defensive beginner positioning.",
        },
        forgiveness: {
          score: 88,
          kind: "SPEC_INFERENCE",
          reasoning: "Round SoftEva / Polyglass is the classic forgiving starter construction.",
        },
        maneuverability: {
          score: 70,
          kind: "SPEC_INFERENCE",
          reasoning: "Low balance helps; published 360–370 g is not ultralight.",
        },
        comfort: {
          score: 86,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "SoftEva is specified for comfort and vibration absorption.",
        },
        stability: {
          score: 48,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official stability rating is 1 on the Tour sheet.",
        },
        spin: {
          score: 40,
          kind: "SPEC_INFERENCE",
          reasoning: "No Top Spin / 3Dgrain listed — Polyglass starter face.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-beginner",
          score: 92,
          explanation: "Official beginner Tour control racket.",
          strengths: ["Round", "SoftEva"],
          compromises: ["Little smash help"],
        },
        {
          useCaseId: "uc-padel-control",
          score: 84,
          explanation: "Placement-first Indiga.",
          strengths: ["Low balance", "Round"],
          compromises: ["Low power"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 86,
          explanation: "SoftEva + Polyglass is the comfort Bullpadel.",
          strengths: ["Soft core"],
          compromises: ["Not a light 300 g frame"],
        },
        {
          useCaseId: "uc-padel-defensive",
          score: 82,
          explanation: "Official defensive style.",
          strengths: ["Round control"],
          compromises: ["Limited counter punch"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 18,
          explanation: "Wrong racket for finishing power.",
          strengths: [],
          compromises: ["Beginner SoftEva"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 28,
          explanation: "You will outgrow this quickly if you already compete.",
          strengths: [],
          compromises: ["Tour beginner construction"],
        },
      ],
    },
    {
      id: "prod-bullpadel-vertex-advance",
      slug: "bullpadel-vertex-advance-2026",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-vertex",
      generation: "advance-03",
      name: "Vertex Advance",
      fullName: "Bullpadel Vertex Advance",
      lifecycle: "current",
      experienceLevels: ["intermediate", "advanced"],
      useCaseIds: [
        "uc-padel-intermediate",
        "uc-padel-easy-power",
        "uc-padel-power",
      ],
      sourceUrl: "https://www.bullpadel.com/gb/5694-racket-bullpadel-vertex-advance.html",
      sourceName: "Bullpadel (bullpadel.com) Vertex Advance",
      shortDescription:
        "Current Vertex Advance (Vertex 03 Advance on the official page): diamond, Glaphite, Evalastic and Air React Channel — not Vertex 05.",
      verdict:
        "Buy this if you want Vertex-shaped attack on a Tour budget. It is not the 12K Vertex 05.",
      specifications: {
        shape: "diamond",
        balance: "low",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        frameMaterial: "CarbonTube",
        face: "Glaphite",
        faceMaterial: "carbon-hybrid",
        core: "other",
        manufacturerCoreName: "Evalastic",
        surfaceTexture: "rough",
        playerLevel: "advanced",
        manufacturerPositioning: "Attacking Tour Vertex",
        technologies: "Carbon Tube, Air React Channel, Top Spin, Glaphite, Evalastic",
      },
      strengths: [
        "Official diamond Vertex Advance with Air React Channel and Top Spin",
        "Glaphite + Evalastic is a cheaper, more elastic stack than Vertex 05 12K",
        "Clear identity: current Tour Vertex, not previous Vertex 04 Pro Line",
      ],
      weaknesses: [
        "Not Multieva 12K Vertex 05",
        "Diamond still asks for timing",
      ],
      relatedProductIds: ["prod-bullpadel-vertex-05", "prod-bullpadel-ionic-light"],
      alternativeProductIds: ["prod-bullpadel-vertex-05", "prod-bullpadel-hack-03"],
      copy: {
        whatItIs:
          "Bullpadel’s live page titles this Vertex Advance and describes Vertex 03 Advance: diamond, Glaphite outer core, Evalastic rubber, Air React Channel and Top Spin. It is the attacking Tour Vertex, not Vertex 05.",
        whoItsFor:
          "Intermediate and advancing club players who want a diamond Vertex shape without Pro Line 12K money.",
        howItPlays:
          "Official copy is power without giving up a usable response, with Evalastic for an elastic, comfortable hit.",
        powerVsControl:
          "Diamond attack bias on Tour materials. Vertex 05 is the complete Pro Line; this is the on-ramp.",
        handling:
          "Air React Channel is the agility claim. A clean weight band was not on the retrieved sheet, so grams are omitted.",
        comfort:
          "Evalastic is specified as elastic and comfortable versus stiff Pro EVA.",
        forgiveness:
          "More elastic than Vertex 05 12K; still a diamond.",
        construction:
          "Glaphite, Evalastic, CarbonTube, Air React Channel, Top Spin.",
        bestFor: [
          "Club attackers stepping into a Vertex diamond",
          "Players who want Vertex shape without Vertex 05 price",
        ],
        notIdealFor: [
          "Beginners who need Indiga",
          "Players who specifically want Vertex 05 12K",
        ],
        buyIf: [
          "You want the official Vertex Advance diamond with Glaphite, Evalastic and Air React Channel.",
          "You already attack a bit and are not shopping Pro Line 12K.",
        ],
        skipIf: [
          "You want Vertex 05.",
          "You need a round beginner racket.",
        ],
      },
      attributes: attrs({
        power: {
          score: 74,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Official diamond Advance copy is attacking power with Air React Channel.",
        },
        control: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Tour diamond with elastic Evalastic — more usable than Pro 12K, still attack-shaped.",
        },
        forgiveness: {
          score: 60,
          kind: "SPEC_INFERENCE",
          reasoning: "Evalastic + Glaphite help versus Vertex 05; diamond remains less forgiving than Indiga.",
        },
        maneuverability: {
          score: 70,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Air React Channel is specified for a more agile, lighter-feeling swing.",
        },
        comfort: {
          score: 76,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Evalastic is specified for elastic comfort.",
        },
        stability: {
          score: 68,
          kind: "SPEC_INFERENCE",
          reasoning: "CarbonTube frame on a Tour Vertex. Not Hexature XPLO.",
        },
        spin: {
          score: 78,
          kind: "MANUFACTURER_CLAIM",
          reasoning: "Top Spin rough surface is listed.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-intermediate",
          score: 86,
          explanation: "Tour Vertex diamond for developing attackers.",
          strengths: ["Evalastic", "Vertex shape"],
          compromises: ["Not 12K Pro"],
        },
        {
          useCaseId: "uc-padel-easy-power",
          score: 80,
          explanation: "Elastic Tour face on a diamond outline.",
          strengths: ["Glaphite + Evalastic"],
          compromises: ["Still a diamond"],
        },
        {
          useCaseId: "uc-padel-power",
          score: 76,
          explanation: "Attack-shaped Vertex without Pro Line stiffness.",
          strengths: ["Diamond Advance"],
          compromises: ["Below Vertex 05 / Hack 04"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 40,
          explanation: "Diamond Advance is a step up from Indiga.",
          strengths: ["Elastic core"],
          compromises: ["Diamond"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 54,
          explanation: "Vertex 05, Hack 04 or XPLO if you want Pro power.",
          strengths: [],
          compromises: ["Tour materials"],
        },
      ],
    },
    {
      id: "prod-bullpadel-vertex-04",
      existing: true,
      slug: "bullpadel-vertex-04",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-vertex",
      generation: "04",
      name: "Vertex 04",
      fullName: "Bullpadel Vertex 04",
      lifecycle: "previous-generation",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: ["uc-padel-power", "uc-padel-balanced", "uc-padel-advanced"],
      sourceUrl: "https://www.bullpadel.com/gb/5677-racket-bullpadel-vertex-05.html",
      sourceName: "Bullpadel Vertex 05 page (Vertex 04 is the superseded Pro Line diamond)",
      shortDescription:
        "Previous-generation Vertex 04 diamond with Multieva and 12K-class carbon — superseded by Vertex 05, not a current flagship.",
      verdict:
        "Treat this as last year’s Vertex if you find it on sale. The current Vertex is 05. Do not shop it as a 2026 flagship.",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 365,
        weightMax: 375,
        thicknessMm: 38,
        face: "carbon 12K",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        playerLevel: "advanced",
        manufacturerPositioning: "Previous-generation Vertex diamond",
        sweetSpot: "medium",
      },
      strengths: [
        "Known Vertex diamond + Multieva recipe",
        "Often the value path once 05 is on the shelf",
      ],
      weaknesses: [
        "Superseded by Vertex 05 Total Play / Curv:aktiv update",
        "Not the current Tello model",
      ],
      relatedProductIds: ["prod-bullpadel-vertex-05", "prod-bullpadel-hack-03"],
      alternativeProductIds: ["prod-bullpadel-vertex-05", "prod-bullpadel-vertex-advance"],
      copy: {
        whatItIs:
          "Vertex 04 is the previous Pro Line Vertex diamond (commonly listed 365–375 g, Multieva, 12K). Vertex 05 is the current official Vertex on bullpadel.com. This draft patches the old catalog row that was wrongly dated as a 2026 current flagship.",
        whoItsFor:
          "Advanced players who find a clean 04 at a discount and already like that Vertex feel. New buyers should start on 05, Hybrid or Advance.",
        howItPlays:
          "Same family idea as Vertex 05 — diamond all-court attack — without the 2026 Curv:aktiv / Air Power restyle. Inference from generation, not a lab delta.",
        powerVsControl:
          "Previous Vertex diamond. Current versatile flagship is Vertex 05.",
        handling:
          "Typical adult Vertex band 365–375 g. High balance class (not ‘head-heavy’).",
        comfort:
          "Multieva sandwich, not SoftEva.",
        forgiveness:
          "Professional diamond. Not Indiga.",
        construction:
          "Diamond, Multieva, 12K-class carbon, 38 mm. 2026 Vertex technologies live on 05.",
        bestFor: [
          "Value shoppers who want previous-gen Vertex diamond",
          "Players replacing a worn 04 and staying in the same mould",
        ],
        notIdealFor: [
          "Anyone who wants the current Vertex 05",
          "Beginners",
        ],
        buyIf: [
          "You know you are buying previous-generation Vertex 04, not 05.",
          "The price gap versus Vertex 05 is the reason, not a fake ‘2026 Vertex 04’ label.",
        ],
        skipIf: [
          "You want the current official Vertex — that is Vertex 05.",
          "You need a beginner round.",
        ],
      },
      attributes: attrs({
        power: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Previous Vertex diamond + Multieva + 12K-class face. Same job as 05, older mould.",
        },
        control: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Vertex all-court diamond, not Hack-only attack. Inferred from family, not a 04 lab sheet.",
        },
        forgiveness: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "Professional diamond generation.",
        },
        maneuverability: {
          score: 66,
          kind: "SPEC_INFERENCE",
          reasoning: "365–375 g high-balance Vertex band.",
        },
        comfort: {
          score: 64,
          kind: "SPEC_INFERENCE",
          reasoning: "Multieva, not SoftEva.",
        },
        stability: {
          score: 80,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon Vertex Pro Line construction.",
        },
        spin: {
          score: 76,
          kind: "SPEC_INFERENCE",
          reasoning: "Vertex faces of this generation used a rough grain; 05’s Top Spin is the current named system.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 80,
          explanation: "Previous Vertex diamond still attacks. Current buy is 05.",
          strengths: ["Diamond Vertex"],
          compromises: ["Superseded"],
        },
        {
          useCaseId: "uc-padel-balanced",
          score: 78,
          explanation: "Same family role as Vertex 05, older generation.",
          strengths: ["All-court Vertex"],
          compromises: ["Not current"],
        },
        {
          useCaseId: "uc-padel-advanced",
          score: 82,
          explanation: "Still an advanced diamond.",
          strengths: ["Pro Line leftover"],
          compromises: ["Shop 05 if you want current"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 22,
          explanation: "Previous pro diamond is not a starter.",
          strengths: [],
          compromises: ["Diamond", "Old flagship"],
        },
      ],
    },
    {
      id: "prod-bullpadel-hack-03",
      existing: true,
      slug: "bullpadel-hack-03",
      brandId: "brand-bullpadel",
      familyId: "fam-bullpadel-hack",
      generation: "03",
      name: "Hack 03",
      fullName: "Bullpadel Hack 03",
      lifecycle: "previous-generation",
      experienceLevels: ["advanced", "elite"],
      useCaseIds: ["uc-padel-power", "uc-padel-maximum-power"],
      sourceUrl: "https://www.bullpadel.com/gb/5674-racket-bullpadel-hack-04-26.html",
      sourceName: "Bullpadel Hack 04 page (Hack 03 is the superseded Paquito diamond)",
      shortDescription:
        "Previous-generation Hack 03 attack diamond — superseded by Hack 04’s Tricarbon 18K / Total Channel generation.",
      verdict:
        "A previous Hack for sale bins, not the current Paquito racket. Current Hack is 04 (plus Hybrid and Comfort).",
      specifications: {
        shape: "diamond",
        balance: "high",
        weightMin: 365,
        weightMax: 380,
        thicknessMm: 38,
        face: "12K carbon",
        faceMaterial: "carbon",
        faceCarbonWeave: "12K",
        core: "multi-density",
        manufacturerCoreName: "Multieva",
        playerLevel: "advanced",
        manufacturerPositioning: "Previous-generation attacking Hack",
        sweetSpot: "compact",
      },
      strengths: [
        "Known Hack attack diamond",
        "Value once 04 is the current model",
      ],
      weaknesses: [
        "Superseded by Hack 04",
        "Still unforgiving",
      ],
      relatedProductIds: ["prod-bullpadel-hack-04", "prod-bullpadel-vertex-04"],
      alternativeProductIds: ["prod-bullpadel-hack-04", "prod-adidas-metalbone-3-3-2026"],
      copy: {
        whatItIs:
          "Hack 03 is the previous Paquito diamond (typically Multieva, 12K-class carbon, high balance, mid-360s to 380 g). Hack 04 is the current official Hack on bullpadel.com. This patches the catalog row that still read like a current 2026 flagship.",
        whoItsFor:
          "Advanced attackers buying previous-gen on purpose. New Hack shoppers should look at 04 / Hybrid / Comfort.",
        howItPlays:
          "Attack diamond, compact sweet spot. The 04 update is Total Channel + Tricarbon 18K. Inference from generation change, not a lab comparison.",
        powerVsControl:
          "Previous Hack power. Current power Hack is 04 or XPLO.",
        handling:
          "High-balance diamond in a heavy adult band.",
        comfort:
          "Stiff attack carbon. Comfort is the 04 CMF model.",
        forgiveness:
          "Low. That is Hack.",
        construction:
          "Diamond, Multieva, 12K-class carbon, 38 mm. 2026 Hack technologies live on 04.",
        bestFor: [
          "Discount shoppers who want a previous Hack diamond",
          "Players replacing a worn 03",
        ],
        notIdealFor: [
          "Anyone who wants current Hack 04",
          "Beginners",
        ],
        buyIf: [
          "You know this is previous-generation Hack 03, not Hack 04.",
          "The price is the reason to stay on 03.",
        ],
        skipIf: [
          "You want the current Hack — that is 04, Hybrid or Comfort.",
          "You need forgiveness.",
        ],
      },
      attributes: attrs({
        power: {
          score: 86,
          kind: "SPEC_INFERENCE",
          reasoning: "Previous Hack attack diamond. Current peak in-family is Hack 04 / XPLO.",
        },
        control: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "Offensive compact diamond.",
        },
        forgiveness: {
          score: 38,
          kind: "SPEC_INFERENCE",
          reasoning: "Hack sweet spots of this generation were small.",
        },
        maneuverability: {
          score: 58,
          kind: "SPEC_INFERENCE",
          reasoning: "High-balance 365–380 g band.",
        },
        comfort: {
          score: 52,
          kind: "SPEC_INFERENCE",
          reasoning: "Stiff attack carbon; 04 Comfort is the later easy-face Hack.",
        },
        stability: {
          score: 82,
          kind: "SPEC_INFERENCE",
          reasoning: "Carbon Hack Pro Line frame.",
        },
        spin: {
          score: 74,
          kind: "SPEC_INFERENCE",
          reasoning: "Textured Hack faces of this generation; 04 names 3Dgrain.",
        },
      }),
      recs: [
        {
          useCaseId: "uc-padel-power",
          score: 84,
          explanation: "Previous Hack diamond still finishes. Current is 04.",
          strengths: ["Attack diamond"],
          compromises: ["Superseded"],
        },
        {
          useCaseId: "uc-padel-maximum-power",
          score: 80,
          explanation: "Old peak Hack. New peak is 04 / XPLO.",
          strengths: ["Hack DNA"],
          compromises: ["Not current"],
        },
        {
          useCaseId: "uc-padel-beginner",
          score: 16,
          explanation: "Do not start here.",
          strengths: [],
          compromises: ["Previous pro diamond"],
        },
        {
          useCaseId: "uc-padel-arm-comfort",
          score: 32,
          explanation: "Hack 04 Comfort if you want the easy Hack face.",
          strengths: [],
          compromises: ["Stiff 03"],
        },
      ],
    },
  ];
}
