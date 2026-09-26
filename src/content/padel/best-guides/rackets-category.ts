import type { BestGuide } from "@/domain/editorial/types";
import { considered, pick, racketGuide, RACKET_RELATED } from "@/content/padel/best-guides/build";

const PREV = [
  considered(
    "prod-bullpadel-vertex-04",
    "Previous Vertex generation. Useful shopper context, not a current award.",
    "previous-pick",
    { reasonCode: "previous-generation", closestRecommendedProductId: "prod-bullpadel-vertex-05" },
  ),
  considered(
    "prod-bullpadel-hack-03",
    "Previous Hack generation. Hack 04 is the current attacking award.",
    "previous-pick",
    { reasonCode: "previous-generation", closestRecommendedProductId: "prod-bullpadel-hack-04" },
  ),
  considered(
    "prod-adidas-metalbone-3-3-2026",
    "Previous Metalbone. Current award is Metalbone 3.5, not 3.3.",
    "previous-pick",
    { reasonCode: "previous-generation", closestRecommendedProductId: "prod-adidas-metalbone-3-5-2026" },
  ),
  considered(
    "prod-starvie-titania-kepler",
    "Previous-generation Starvie. Not a 2026 role winner.",
    "previous-pick",
    { reasonCode: "previous-generation" },
  ),
  considered(
    "prod-starvie-basalto-osiris",
    "Previous-generation Starvie. Not a current award.",
    "previous-pick",
    { reasonCode: "previous-generation" },
  ),
];

const PHOTO_BLOCKED = [
  considered(
    "prod-nox-at10-attack-12k-2026",
    "Photo-blocked draft. Attack 18K is the published Tapia diamond, not this 12K Attack listing.",
    "rejected",
    { reasonCode: "insufficient-evidence" },
  ),
  considered(
    "prod-kuikma-pr-soft-500",
    "Photo-blocked draft. Comfort Soft is the published Kuikma comfort award.",
    "rejected",
    { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-kuikma-pr-comfort-soft" },
  ),
  considered(
    "prod-drop-shot-canyon-pro",
    "Photo-blocked draft — no authentic hero, so it cannot win a Best Guide.",
    "rejected",
    { reasonCode: "insufficient-evidence" },
  ),
  considered(
    "prod-black-crown-special-one-soft",
    "Photo-blocked draft. Soft-core job is covered by published Comfort Soft / Equation Soft.",
    "rejected",
    { reasonCode: "insufficient-evidence" },
  ),
];

const WRONG_JOB = [
  considered(
    "prod-siux-diablo",
    "Advanced teardrop, not a beginner round. Evaluated and rejected as a first-racket award.",
    "rejected",
    { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-bullpadel-indiga-ctr" },
  ),
  considered(
    "prod-head-coello-pro",
    "Professional Coello diamond. Strong on the advanced/power pages; too demanding as a category beginner or value toy.",
    "shortlisted",
    { reasonCode: "niche", closestRecommendedProductId: "prod-bullpadel-hack-04" },
  ),
  considered(
    "prod-adidas-metalbone-hrd",
    "HRD+ is the High Memory sibling. Category attack award is current Metalbone 3.5 with Soft Performance EVA.",
    "rejected",
    { reasonCode: "redundant-role", closestRecommendedProductId: "prod-adidas-metalbone-3-5-2026" },
  ),
  considered(
    "prod-nox-at10-12k-2026",
    "Teardrop Genius, not a diamond Attack. Shortlisted for all-round; not a smash-first category award.",
    "shortlisted",
    { reasonCode: "niche", closestRecommendedProductId: "prod-bullpadel-vertex-05-hybrid" },
  ),
];

export const padelRacketsCategoryGuide: BestGuide = racketGuide({
  id: "best-padel-rackets",
  slug: "padel-rackets",
  title: "Best Padel Rackets",
  subtitle: "Role winners for control, attack, hybrid play, comfort, and first rackets",
  shortDescription:
    "A category shortlist mapped to real jobs — not a generic top-10 or an affiliate ranking.",
  guideKind: "category",
  rankingMode: "category-picks",
  useCaseIds: [
    "uc-padel-beginner",
    "uc-padel-control",
    "uc-padel-power",
    "uc-padel-balanced",
  ],
  intent:
    "a current padel racket shortlist by role: first racket, control classic, hybrid all-court, attacking diamond, comfort round, and adjustable Metalbone attack",
  intro:
    "Best Padel Rackets is a role map, not a popularity contest. A round SoftEva beginner racket and a 18K attacking diamond can both be “best” for different weeks — they are not interchangeable. We start from published current products with authentic photography, then keep only frames that own a distinct job: first contact, control cup, hybrid all-court, finishing diamond, comfort core, or a tunable Metalbone. Previous Vertex 04, Hack 03, and Metalbone 3.3 stay labelled as previous-generation. Siux Diablo is not a beginner award. AT10 Genius 12K is a teardrop Genius, not Tapia’s Attack diamond. Affiliate commission does not rank this page.",
  whatMattersIntro:
    "Match shape and manufacturer level before you chase carbon K-count. Round and low-balance frames keep the sweet spot reachable while you learn. Hybrid/teardrop covers most club all-court play. Diamond and high-balance frames add smash mass after timing already exists. Weight bands matter inside a family: Vertex 05 at 365–375 g is not Vertex 05 W at 350–360 g. If you already know the constraint — beginner, control, power, comfort, women’s last — use that dedicated guide instead of forcing one overall winner.",
  quickTake: [
    "Choose Vertex 05 if you want the current Tello diamond as a broad advanced all-court flagship.",
    "Choose Indiga CTR if you are still building contact and need a round SoftEva first racket.",
    "Choose ML10 Pro Cup if placement and a centred cup matter more than smash ceiling.",
    "Choose Hack 04 if you already generate head speed and want the current attacking Hack.",
    "Choose Vertex 05 Hybrid if you want Vertex construction without a pure diamond tax.",
    "Choose PR Comfort Soft if arm comfort and a value round beat flagship carbon.",
    "Choose Metalbone 3.5 if you want Galán’s current adjustable attack — not Metalbone 3.3.",
  ],
  decisionShortcuts: [
    {
      need: "Current advanced diamond that still covers all-court play",
      productId: "prod-bullpadel-vertex-05",
      reason: "Vertex 05 is the category flagship, not Vertex 04.",
    },
    {
      need: "First racket / forgiveness",
      productId: "prod-bullpadel-indiga-ctr",
      reason: "Round SoftEva Tour-line — not a disguised diamond.",
    },
    {
      need: "Classic control cup",
      productId: "prod-nox-ml10-pro-cup",
      reason: "ML10 geometry for placement, not smash-first carbon.",
    },
    {
      need: "Smash-first current Hack",
      productId: "prod-bullpadel-hack-04",
      reason: "Hack 04, not Hack 03.",
    },
    {
      need: "Hybrid Vertex without diamond-only tax",
      productId: "prod-bullpadel-vertex-05-hybrid",
      reason: "Sibling mould, not a paint job.",
    },
    {
      need: "Comfort / value round",
      productId: "prod-kuikma-pr-comfort-soft",
      reason: "Published Kuikma comfort, not photo-blocked PR Soft 500.",
    },
    {
      need: "Adjustable Metalbone attack",
      productId: "prod-adidas-metalbone-3-5-2026",
      reason: "Current 3.5 with Soft Performance EVA — not 3.3, not HRD+.",
    },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-vertex-05",
      rank: 1,
      awardType: "best-overall",
      role: "Current advanced all-court diamond",
      summary: "Current Tello Vertex: diamond attack with a usable all-court brief.",
      whyWon:
        "Vertex 05 wins the category flagship slot because it is the current Vertex diamond with a published all-court / Total Play brief — not because it is the stiffest smash frame in the catalog. Hack 04 and Metalbone 3.5 beat it when finishing is the only job. Indiga and ML10 beat it when you still need a centred sweet spot.",
      whyFits: [
        "Vertex 05 is the 2026 Tello Vertex: diamond geometry, 12K face, and a manufacturer brief aimed at advanced multipurpose play rather than a one-dimensional smash stick.",
        "Against Hack 04 it is the more all-court diamond. Against Vertex 05 Hybrid it keeps the diamond outline if you already live at the net and want that finishing height.",
        "I'd shortlist it when timing already exists and you want one current Bullpadel flagship. I'd pause if you are still spraying the glass on defensive blocks — start with Indiga or ML10 instead.",
      ],
      bestFor: [
        "Advanced intermediates who attack and defend in the same match",
        "Players replacing Vertex 04 and wanting the current generation",
        "Buyers who want a diamond that is not a pure Hack/Metalbone finisher",
      ],
      tradeoff:
        "Still a diamond with a 365–375 g band — late preparation gets punished, and it is not a first racket.",
      extraTradeoffs: [
        "Premium street price versus Comfort Soft or Indiga.",
      ],
      avoid: [
        "Absolute beginners who need a round, soft first racket",
        "Players who want maximum smash stiffness (Hack 04 / Metalbone 3.5)",
        "Players who specifically want the 350–360 g Vertex 05 W last",
      ],
      instead: [
        {
          productId: "prod-bullpadel-indiga-ctr",
          when: "you are still building consistent contact and need a round SoftEva frame",
          label: "Indiga CTR",
        },
        {
          productId: "prod-bullpadel-hack-04",
          when: "finishing smashes is the weekly job and you already generate head speed",
          label: "Hack 04",
        },
        {
          productId: "prod-bullpadel-vertex-05-hybrid",
          when: "you want Vertex construction with a hybrid outline instead of diamond-only height",
          label: "Vertex 05 Hybrid",
        },
      ],
      useCaseIds: ["uc-padel-balanced", "uc-padel-power", "uc-padel-advanced"],
      works: ["Advanced all-court", "Diamond finishing", "Current Vertex family"],
      lessSuited: ["First racket", "Pure control cup", "Women’s 350–360 g Vertex"],
    }),
    pick({
      productId: "prod-bullpadel-indiga-ctr",
      rank: 2,
      awardType: "best-beginner",
      role: "First racket / forgiveness",
      summary: "Round SoftEva Tour-line for learning contact — not a hidden flagship.",
      whyWon:
        "Indiga CTR wins the first-racket role because Bullpadel lists it as a round, low-balance, SoftEva Tour frame for developing players. Siux Diablo and Coello Pro were evaluated and rejected here: they are advanced teardrop/diamond tools, not on-ramps.",
      whyFits: [
        "Indiga CTR is a round Polyglass / SoftEva Tour racket with a centred sweet spot. That is the honest beginner job in this catalog — not a diamond with a friendly paint.",
        "Against Comfort Soft it is the Bullpadel-shaped on-ramp with explicit beginner positioning. Against Ionic Light it is the truer first week; Ionic is the step-up hybrid.",
        "I'd shortlist it for new players and anyone returning from a long break. I'd skip it once you are already attacking on purpose and the round ceiling is the weekly complaint.",
      ],
      bestFor: [
        "New padel players who need the sweet spot in the middle of the face",
        "Club beginners who should not buy a professional diamond first",
        "Anyone who was about to buy Diablo or Coello Pro as a “starter”",
      ],
      tradeoff:
        "Power ceiling is limited — you supply pace, and advanced attackers will out-hit this frame.",
      avoid: [
        "Advanced attackers who already time diamonds",
        "Players shopping a women’s Vertex last (that is Vertex 05 W, not Indiga)",
      ],
      instead: [
        {
          productId: "prod-kuikma-pr-comfort-soft",
          when: "you want a value comfort round rather than Bullpadel Tour Indiga",
          label: "PR Comfort Soft",
        },
        {
          productId: "prod-bullpadel-ionic-light",
          when: "you already make contact and want a lighter hybrid step-up",
          label: "Ionic Light",
        },
        {
          productId: "prod-nox-ml10-pro-cup",
          when: "control still matters but you want a classic cup instead of a Tour beginner",
          label: "ML10 Pro Cup",
        },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-control", "uc-padel-arm-comfort"],
      works: ["Beginner", "Round forgiveness", "Soft core"],
      lessSuited: ["Elite smash", "Professional diamond"],
    }),
    pick({
      productId: "prod-nox-ml10-pro-cup",
      rank: 3,
      awardType: "editors-pick",
      badge: "Best classic control",
      role: "Control cup",
      summary: "Classic ML10 cup for placement and defence — not a 12K Genius attack story.",
      whyWon:
        "ML10 Pro Cup wins the control classic role on published cup geometry and a control-first manufacturer job. Counter Viper is a firmer Viper-line counter, not this cup. AT10 Genius 12K is a teardrop Genius, not a round control award.",
      whyFits: [
        "ML10 Pro Cup is the control reference in the Nox range: a classic cup for players who want the ball to stay on the face through blocks, chiquitas, and lobs.",
        "Against Gravity Pro it is the Nox classic rather than HEAD’s round-leaning Pro. Against Equation Soft it is the firmer classic cup, not the soft Advanced on-ramp.",
        "I'd shortlist it when you already play and your miss is over-hitting, not under-hitting. I'd skip it if you need a first-week SoftEva round or a finishing diamond.",
      ],
      bestFor: [
        "Placement-first club players",
        "Defensive partners who live on the glass",
        "Buyers who want a control classic rather than a textured attack face",
      ],
      tradeoff:
        "You give up smash mass versus Hack 04 and Metalbone 3.5 — that is the point of this role.",
      avoid: [
        "Finishers who want a high-balance diamond",
        "Brand-new players who need Indiga’s softer Tour round",
      ],
      instead: [
        {
          productId: "prod-head-gravity-pro",
          when: "you want HEAD’s round-leaning Pro control instead of the ML10 cup",
          label: "Gravity Pro",
        },
        {
          productId: "prod-bullpadel-vertex-05",
          when: "you already attack enough that a control cup leaves you short at the net",
          label: "Vertex 05",
        },
        {
          productId: "prod-nox-equation-soft-2026",
          when: "you want Nox control with a softer Advanced core",
          label: "Equation Soft",
        },
      ],
      useCaseIds: ["uc-padel-control", "uc-padel-defensive"],
      works: ["Control", "Defence", "Classic cup"],
      lessSuited: ["Smash-first", "Beginner SoftEva"],
    }),
    pick({
      productId: "prod-bullpadel-hack-04",
      rank: 4,
      awardType: "best-premium",
      badge: "Best attacking diamond",
      role: "Smash-first current Hack",
      summary: "Current Paquito Hack: 18K attack diamond — not Hack 03.",
      whyWon:
        "Hack 04 wins the attacking-diamond role as the current Hack with Tricarbon 18K and an offensive manufacturer brief. Vertex 05 is the more all-court diamond. Metalbone 3.5 is the adjustable Adidas alternative, not a duplicate Hack.",
      whyFits: [
        "Hack 04 is the 2026 attacking Hack: diamond, high structural stiffness, and a manufacturer job aimed at players who already generate head speed.",
        "Against Vertex 05 it is less of a Total Play all-courter and more of a finisher. Against Metalbone 3.5 it is the Bullpadel 18K path instead of Weight & Balance plates.",
        "I'd shortlist it when your week is bandejas that you want to finish and overheads you can already time. I'd skip it if off-centre blocks are still your match.",
      ],
      bestFor: [
        "Advanced attackers who already time a diamond",
        "Players replacing Hack 03 with the current generation",
        "Right-side finishers who want 18K Hack, not Vertex hybrid",
      ],
      tradeoff:
        "Low off-centre forgiveness and arm-demanding stiffness — the sweet spot is not Indiga.",
      extraTradeoffs: ["Not the Comfort / Fibrix Hack 04 CMF if you wanted easier feel."],
      avoid: [
        "Beginners and developing intermediates",
        "Players shopping Hack 04 Comfort for a softer Fibrix face",
      ],
      instead: [
        {
          productId: "prod-adidas-metalbone-3-5-2026",
          when: "you want adjustable Metalbone attack with Soft Performance EVA instead of 18K Hack",
          label: "Metalbone 3.5",
        },
        {
          productId: "prod-bullpadel-hack-04-comfort",
          when: "you want Hack geometry with a Fibrix comfort face",
          label: "Hack 04 Comfort",
        },
        {
          productId: "prod-bullpadel-vertex-05",
          when: "you need more all-court coverage than a pure attacking Hack",
          label: "Vertex 05",
        },
      ],
      useCaseIds: ["uc-padel-power", "uc-padel-maximum-power", "uc-padel-competitive"],
      works: ["Attack", "Smash", "Current Hack"],
      lessSuited: ["First racket", "Soft control"],
    }),
    pick({
      productId: "prod-bullpadel-vertex-05-hybrid",
      rank: 5,
      badge: "Best hybrid all-court",
      role: "Hybrid Vertex",
      summary: "Vertex construction in a hybrid outline — not a cosmetic Vertex 05.",
      whyWon:
        "Vertex 05 Hybrid wins the hybrid role because it is a distinct mould in the Vertex 05 family, not a paint swap. AT10 Genius 12K and 18K are the Nox teardrop alternatives; this is the Bullpadel hybrid path.",
      whyFits: [
        "Vertex 05 Hybrid exists so you can keep Vertex construction without committing to the diamond-only sweet-spot height of Vertex 05.",
        "Against AT10 18K it is the Bullpadel hybrid rather than Tapia’s teardrop Genius. Against Vertex 05 it trades some finishing height for a more centred hybrid face.",
        "I'd shortlist it when you play both sides of the court and the diamond Vertex felt late on defence. I'd skip it if you already want Hack-level smash mass.",
      ],
      bestFor: [
        "All-court players who like Vertex but not a pure diamond",
        "Advanced intermediates stepping out of round frames",
        "Left-side players who still defend a lot",
      ],
      tradeoff:
        "Less peak smash height than Vertex 05 diamond and Hack 04 — hybrid is the compromise.",
      avoid: [
        "Players who already know they want a finishing diamond",
        "Beginners who still need Indiga",
      ],
      instead: [
        {
          productId: "prod-nox-at10-18k-2026",
          when: "you want Tapia’s teardrop Genius 18K instead of Vertex Hybrid",
          label: "AT10 Genius 18K",
        },
        {
          productId: "prod-bullpadel-vertex-05",
          when: "you want the diamond Vertex 05 outline",
          label: "Vertex 05",
        },
        {
          productId: "prod-bullpadel-ionic-light",
          when: "you want a lighter Next-line hybrid, not Pro Line Vertex",
          label: "Ionic Light",
        },
      ],
      useCaseIds: ["uc-padel-balanced"],
      works: ["Hybrid all-court", "Vertex family", "Defence-to-attack"],
      lessSuited: ["Pure smash diamond", "Beginner round"],
    }),
    pick({
      productId: "prod-kuikma-pr-comfort-soft",
      rank: 6,
      awardType: "best-value",
      role: "Comfort / value round",
      summary: "Published Kuikma comfort round — not the photo-blocked PR Soft 500.",
      whyWon:
        "Comfort Soft wins the value-comfort role as the published Kuikma soft round with authentic photography. PR Soft 500 is photo-blocked and cannot take an award. Indiga is the Bullpadel beginner alternative at typically higher street price.",
      whyFits: [
        "PR Comfort Soft is the catalog’s honest value comfort round: a soft core for players who want the ball to stay on the face without buying Pro Line carbon.",
        "Against Indiga it is the Decathlon-path comfort option. Against Hack 04 Comfort it is a round beginner/comfort tool, not a Fibrix attacking diamond.",
        "I'd shortlist it when arm comfort and budget are the weekly constraints. I'd skip it once you are ready for a hybrid step-up like Ionic Light or PR Hybrid Carbon.",
      ],
      bestFor: [
        "Club players who want a soft round without flagship pricing",
        "Arm-sensitive players who should not start on 18K diamonds",
        "Buyers comparing value comfort, not Pro Line Vertex",
      ],
      tradeoff:
        "Lower finishing ceiling and less prestige construction than Vertex / Hack — that is why it is the value role.",
      avoid: [
        "Advanced attackers who need a finishing diamond this season",
        "Anyone expecting photo-blocked PR Soft 500 to appear as a current award",
      ],
      instead: [
        {
          productId: "prod-bullpadel-indiga-ctr",
          when: "you want Bullpadel’s named beginner round instead of Kuikma",
          label: "Indiga CTR",
        },
        {
          productId: "prod-bullpadel-hack-04-comfort",
          when: "you want attacking geometry with a comfort face, not a round value frame",
          label: "Hack 04 Comfort",
        },
        {
          productId: "prod-nox-equation-soft-2026",
          when: "you want Nox’s soft Advanced rather than Kuikma",
          label: "Equation Soft",
        },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-arm-comfort"],
      works: ["Comfort", "Value round", "Soft core"],
      lessSuited: ["Competitive smash", "Pro Line 12K"],
    }),
    pick({
      productId: "prod-adidas-metalbone-3-5-2026",
      rank: 7,
      badge: "Best adjustable attack",
      role: "Current Metalbone attack",
      summary: "Galán’s current Metalbone 3.5 — not 3.3 and not HRD+.",
      whyWon:
        "Metalbone 3.5 wins the adjustable-attack role because it is the current Metalbone with Weight & Balance and Soft Performance EVA. Metalbone 3.3 is previous-generation. HRD+ is the High Memory sibling, not this award.",
      whyFits: [
        "Metalbone 3.5 is the 2026 Galán Metalbone: diamond, Carbon Aluminized 16K, Soft Performance EVA, and plates that can push a 345–360 g base toward 371 g.",
        "Against Hack 04 it is the Adidas customisable path. Against Vertex 05 it is more of a dedicated attacker once you add mass at the head.",
        "I'd shortlist it when you want to tune balance and you already play at an advanced attacking level. I'd skip it if you needed Metalbone CTRL’s round sweet spot or HRD+ High Memory stiffness.",
      ],
      bestFor: [
        "Advanced attackers who want to tune Metalbone balance",
        "Players replacing Metalbone 3.3 with the current generation",
        "Adidas-system players who do not want HRD+ High Memory",
      ],
      tradeoff:
        "Still a professional diamond with a compact sweet spot — plates can make it heavier, not easier.",
      extraTradeoffs: ["Not Metalbone CTRL if you wanted a round Metalbone."],
      avoid: [
        "Beginners",
        "Players who specifically want HRD+ High Memory EVA",
        "Anyone treating 3.3 as the current award",
      ],
      instead: [
        {
          productId: "prod-bullpadel-hack-04",
          when: "you want 18K Hack attack without Weight & Balance plates",
          label: "Hack 04",
        },
        {
          productId: "prod-adidas-metalbone-ctrl",
          when: "you want the round Metalbone, not the attacking diamond",
          label: "Metalbone CTRL",
        },
        {
          productId: "prod-babolat-technical-viper",
          when: "you want Babolat’s technical-striker diamond instead of Metalbone",
          label: "Technical Viper",
        },
      ],
      useCaseIds: ["uc-padel-power", "uc-padel-advanced"],
      works: ["Adjustable attack", "Current Metalbone", "Advanced diamond"],
      lessSuited: ["Round control", "Beginner", "Previous 3.3"],
    }),
  ],
  consideredProducts: [
    ...PREV,
    ...PHOTO_BLOCKED,
    ...WRONG_JOB,
    considered(
      "prod-babolat-counter-viper",
      "Viper-line counter. Shortlisted for the control guide; not a category beginner or overall flagship.",
      "shortlisted",
      { reasonCode: "niche", closestRecommendedProductId: "prod-nox-ml10-pro-cup" },
    ),
    considered(
      "prod-nox-at10-18k-2026",
      "Teardrop Genius 18K. Shortlisted for all-round; Vertex Hybrid covers the Bullpadel hybrid role here.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-vertex-05-hybrid" },
    ),
    considered(
      "prod-babolat-technical-viper",
      "Technical-striker diamond. Better on the power guide than as a second category smash clone of Hack 04.",
      "shortlisted",
      { reasonCode: "redundant-role", closestRecommendedProductId: "prod-bullpadel-hack-04" },
    ),
    considered(
      "prod-wilson-blade-pro-padel",
      "Control-leaning Wilson Pro. Considered for control; ML10 keeps the classic cup award here.",
      "considered",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-nox-ml10-pro-cup" },
    ),
  ],
  comparisonProductIds: [
    "prod-bullpadel-vertex-05",
    "prod-bullpadel-indiga-ctr",
    "prod-nox-ml10-pro-cup",
    "prod-bullpadel-hack-04",
    "prod-bullpadel-vertex-05-hybrid",
    "prod-kuikma-pr-comfort-soft",
    "prod-adidas-metalbone-3-5-2026",
  ],
  buyingAdvice:
    "Buy from the job, not from a leaderboard. If you cannot yet hit a consistent bandeja, do not buy Hack 04 because it “won best power” on another page. If you already finish overheads, Indiga will feel like a ceiling, not a bargain. Use the dedicated beginner, control, power, all-round, comfort, lightweight, maneuverability, and women’s guides when that constraint is already known. This page exists so those roles do not collapse into one fake overall ranking.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/bullpadel-vertex-05-hero.png",
  hubImageAlt: "Bullpadel Vertex 05 — flagship racket for the category Best Guide hub",
  criteriaChangePoints: [
    {
      label: "Role before rank",
      explanation:
        "We do not pick a universal number-one. Vertex 05 is the flagship all-court diamond; it is the wrong first racket.",
    },
    {
      label: "Current generation only for awards",
      explanation:
        "Vertex 04, Hack 03, and Metalbone 3.3 are labelled previous-generation. They do not take current awards.",
    },
    {
      label: "Commission is not a criterion",
      explanation:
        "Offer availability never changes considered, shortlisted, recommended, rank, or award.",
    },
  ],
});
