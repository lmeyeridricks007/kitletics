import type { BestGuide } from "@/domain/editorial/types";
import { considered, pick, racketGuide, RACKET_RELATED } from "@/content/padel/best-guides/build";

export const padelRacketsControlGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-control",
  slug: "padel-rackets-control",
  title: "Best Control Padel Rackets",
  subtitle: "Placement, defence, and a centred face — not a counter-attack slogan",
  shortDescription:
    "Control means you can put the ball where you meant. Smash-first diamonds do not win this page.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-control", "uc-padel-defensive"],
  intent:
    "control padel rackets: round or control-leaning cups, centred sweet spots, and manufacturer control/defence jobs — not attacking diamonds",
  intro:
    "Control on a padel racket is placement and a face that stays honest on blocks, chiquitas, and lobs. It is not a marketing synonym for “versatile” and it is not whatever Viper is left after you remove Technical. We awarded ML10 Pro Cup as the classic cup, Gravity Pro as HEAD’s control Pro, Equation Soft as the soft Nox on-ramp, Wilson Blade Pro as the control-leaning Wilson, and Counter Viper as Babolat’s actual counter/control Viper — not as a beginner toy. Hack 04 and Metalbone 3.5 were considered and rejected here. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criteria that change versus the category guide: sweet-spot height and manufacturer control positioning outrank smash mass. Round and control cups score up. High-balance diamonds score down unless they have an explicit counter brief (Counter Viper). Soft cores help when the miss is over-hitting, not under-hitting.",
  criteriaChangePoints: [
    {
      label: "Centred face over tip mass",
      explanation: "Diamond smash frames lose unless the line is explicitly Counter.",
    },
    {
      label: "Defence is a use case",
      explanation: "Glass blocks and lobs matter more here than finishing bandejas.",
    },
  ],
  quickTake: [
    "Choose ML10 Pro Cup if you want the classic Nox control cup.",
    "Choose Gravity Pro if you want HEAD’s control-leaning Pro.",
    "Choose Equation Soft if you want a softer Nox control on-ramp.",
    "Choose Blade Pro if you want Wilson’s control-leaning Pro.",
    "Choose Counter Viper if you want Babolat’s counter Viper — not Technical Viper.",
  ],
  decisionShortcuts: [
    { need: "Classic control cup", productId: "prod-nox-ml10-pro-cup", reason: "ML10 geometry." },
    { need: "HEAD control Pro", productId: "prod-head-gravity-pro", reason: "Gravity Pro." },
    { need: "Soft Nox control", productId: "prod-nox-equation-soft-2026", reason: "Equation Soft." },
    { need: "Wilson control Pro", productId: "prod-wilson-blade-pro-padel", reason: "Blade Pro padel." },
    { need: "Babolat counter Viper", productId: "prod-babolat-counter-viper", reason: "Counter, not Technical." },
  ],
  recommendations: [
    pick({
      productId: "prod-nox-ml10-pro-cup",
      rank: 1,
      awardType: "best-overall",
      role: "Classic control cup",
      summary: "ML10 Pro Cup — the control reference, not Genius Attack.",
      whyWon:
        "ML10 Pro Cup ranks first because the cup geometry and control job are the catalog’s clearest placement tool. Gravity Pro is the HEAD alternative. Counter Viper is the firmer Babolat counter. Neither replaces the ML10 cup as the default control answer.",
      whyFits: [
        "ML10 keeps the ball on the face through defensive patterns. That is control as a job, not as a slogan on an attacking diamond.",
        "I'd shortlist it when your miss is over-hitting. I'd skip it if you already finish overheads and the cup leaves you short at the net — that is Vertex/Hack, on other pages.",
      ],
      bestFor: ["Placement-first players", "Defensive partners", "Classic Nox cup"],
      tradeoff: "Smash mass is the thing you are choosing not to buy.",
      avoid: ["Smash-first diamonds", "Beginners who need a softer Tour round than this cup"],
      instead: [
        { productId: "prod-head-gravity-pro", when: "you want HEAD’s control Pro instead of Nox cup", label: "Gravity Pro" },
        { productId: "prod-babolat-counter-viper", when: "you want a firmer counter Viper that can still attack", label: "Counter Viper" },
        { productId: "prod-bullpadel-indiga-ctr", when: "you still need a beginner round", label: "Indiga CTR" },
      ],
      useCaseIds: ["uc-padel-control", "uc-padel-defensive"],
    }),
    pick({
      productId: "prod-head-gravity-pro",
      rank: 2,
      awardType: "editors-pick",
      role: "HEAD control Pro",
      summary: "Gravity Pro for advanced control, not Coello Pro attack.",
      whyWon:
        "Gravity Pro is the advanced HEAD control award. Coello Pro does not belong on a control shortlist as a default.",
      whyFits: [
        "Gravity Pro is a Pro mould that still leans control. That is a different HEAD job from Coello.",
        "I'd shortlist it when you play at Pro level and still want the ball to stay honest. I'd skip it if you wanted Coello’s smash diamond.",
      ],
      bestFor: ["Advanced HEAD control", "Players who over-hit Coello/Vertex"],
      tradeoff: "Less finishing than Coello Pro.",
      avoid: ["Beginners who need Gravity Motion", "Coello finishers"],
      instead: [
        { productId: "prod-head-gravity-motion", when: "handling mass is the constraint", label: "Gravity Motion" },
        { productId: "prod-head-coello-pro", when: "you actually want the attacking Coello", label: "Coello Pro" },
      ],
      useCaseIds: ["uc-padel-control", "uc-padel-advanced"],
    }),
    pick({
      productId: "prod-nox-equation-soft-2026",
      rank: 3,
      awardType: "best-beginner",
      role: "Soft Nox control on-ramp",
      summary: "Equation Soft — control with a soft Advanced core.",
      whyWon:
        "Equation Soft is the softer Nox control on-ramp. ML10 is the classic cup. This exists for players who want Nox control without the classic cup’s demand.",
      whyFits: [
        "Soft Advanced Nox for players whose control problem is still arm and timing, not just geometry.",
        "I'd shortlist it when ML10 feels too classic-firm. I'd skip it if you already belong on ML10 or Genius.",
      ],
      bestFor: ["Softer Nox control", "Developing placement"],
      tradeoff: "Less of a classic cup identity than ML10.",
      avoid: ["Attack diamonds", "Tapia Genius shoppers who do not need soft"],
      instead: [
        { productId: "prod-nox-ml10-pro-cup", when: "you want the classic cup", label: "ML10 Pro Cup" },
        { productId: "prod-kuikma-pr-comfort-soft", when: "you want value comfort rather than Nox", label: "PR Comfort Soft" },
      ],
      useCaseIds: ["uc-padel-control", "uc-padel-arm-comfort"],
    }),
    pick({
      productId: "prod-wilson-blade-pro-padel",
      rank: 4,
      badge: "Best Wilson control",
      role: "Wilson control Pro",
      summary: "Blade Pro padel — control-leaning Wilson, not Bela Pro attack.",
      whyWon:
        "Blade Pro is Wilson’s control-leaning Pro. Bela Pro is the attacking sibling and does not take this control award.",
      whyFits: [
        "Blade Pro exists in the padel catalog as a control-oriented Wilson Pro, not a Bela finisher.",
        "I'd shortlist it when you want Wilson and Bela would be the wrong job. I'd skip it if you wanted Bela’s attack profile.",
      ],
      bestFor: ["Wilson control players", "Placement with a Pro Wilson face"],
      tradeoff: "Not Bela’s attacking identity.",
      avoid: ["Bela Pro finishers", "Beginner rounds"],
      instead: [
        { productId: "prod-wilson-bela-pro", when: "you want Wilson’s attacking Bela Pro", label: "Bela Pro" },
        { productId: "prod-nox-ml10-pro-cup", when: "you want the Nox cup instead", label: "ML10 Pro Cup" },
      ],
      useCaseIds: ["uc-padel-control"],
    }),
    pick({
      productId: "prod-babolat-counter-viper",
      rank: 5,
      badge: "Best counter Viper",
      role: "Babolat counter",
      summary: "Counter Viper — Babolat’s counter/control Viper, not Technical.",
      whyWon:
        "Counter Viper is the control-leaning Viper. The old category guide used it as a vague “best control” without saying why. Here the job is explicit: counter and transition, not Technical Viper smash.",
      whyFits: [
        "Counter Viper is the Viper you buy when you defend and then attack — a firmer control than ML10, not a beginner round.",
        "I'd shortlist it when you want Babolat and you live in the counter. I'd skip it if you wanted Technical Viper’s striker diamond or Air Viper’s handling.",
      ],
      bestFor: ["Babolat counter players", "Transition from defence to attack"],
      tradeoff: "Stiffer than Equation Soft or Indiga — not a first racket.",
      avoid: ["Beginners", "Technical Viper strikers"],
      instead: [
        { productId: "prod-babolat-technical-viper", when: "you want the technical-striker diamond", label: "Technical Viper" },
        { productId: "prod-nox-ml10-pro-cup", when: "you want a classic cup instead of a Viper counter", label: "ML10 Pro Cup" },
      ],
      useCaseIds: ["uc-padel-control", "uc-padel-defensive"],
    }),
  ],
  consideredProducts: [
    considered("prod-bullpadel-hack-04", "Attacking diamond. Power guide, not control.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-adidas-metalbone-3-5-2026", "Attacking Metalbone. Power guide.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-babolat-technical-viper", "Technical-striker diamond. Power guide.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-siux-diablo", "Advanced teardrop. Not a control cup.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-nox-ml10-pro-cup",
    "prod-head-gravity-pro",
    "prod-nox-equation-soft-2026",
    "prod-wilson-blade-pro-padel",
    "prod-babolat-counter-viper",
  ],
  buyingAdvice:
    "If you lose points by missing the glass, buy control. If you lose points by not finishing, look at power. Counter Viper is not a beginner racket; ML10 is not a smash stick. Pick the control job you actually have.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/nox-ml10-pro-cup-2026-hero.jpg",
  hubImageAlt: "Nox ML10 Pro Cup — control padel racket",
});

export const padelRacketsPowerGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-power",
  slug: "padel-rackets-power",
  title: "Best Power Padel Rackets",
  subtitle: "Smash and attack diamonds for players who already generate head speed",
  shortDescription:
    "Power means finishing. Beginner rounds and teardrop Genius frames are the wrong tool here.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-power", "uc-padel-maximum-power"],
  intent:
    "power padel rackets: current attacking diamonds with manufacturer attack/professional jobs and authentic heroes — not teardrop Genius and not beginner rounds",
  intro:
    "Power here is smash and finishing geometry: diamond or high-balance attack moulds for players who already generate head speed. We awarded Hack 04, Metalbone 3.5, Technical Viper, Coello Pro, and AT10 Genius Attack 18K. AT10 Genius 12K is a teardrop Genius — considered and rejected as a diamond attacker. Metalbone 3.3 is previous-generation. Coello Pro is not a value beginner. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criteria that change versus all-round: diamond/high-balance, stiff or attacking faces, and manufacturer attack tags outrank centred sweet spots. Forgiveness is a negative if it comes from a round beginner mould. You should already time overheads.",
  criteriaChangePoints: [
    {
      label: "Diamond attack, not Genius teardrop",
      explanation: "AT10 Genius 12K/18K are teardrop all-courters. Attack 18K is the Tapia diamond on this page.",
    },
    {
      label: "Current Metalbone",
      explanation: "3.5 wins. 3.3 is previous-generation. HRD+ is a stiffness sibling, not the default award.",
    },
  ],
  quickTake: [
    "Choose Hack 04 if you want the current 18K attacking Hack.",
    "Choose Metalbone 3.5 if you want Galán’s adjustable current Metalbone.",
    "Choose Technical Viper if you want Babolat’s technical-striker diamond.",
    "Choose Coello Pro if you want HEAD’s professional Coello diamond.",
    "Choose Attack 18K if you want Tapia’s Attack diamond — not Genius 12K.",
  ],
  decisionShortcuts: [
    { need: "Current Hack smash", productId: "prod-bullpadel-hack-04", reason: "Hack 04 18K." },
    { need: "Adjustable Metalbone", productId: "prod-adidas-metalbone-3-5-2026", reason: "3.5, not 3.3." },
    { need: "Babolat striker diamond", productId: "prod-babolat-technical-viper", reason: "Technical Viper." },
    { need: "HEAD Coello diamond", productId: "prod-head-coello-pro", reason: "Coello Pro, not Team." },
    { need: "Tapia Attack diamond", productId: "prod-nox-at10-attack-18k-2026", reason: "Attack 18K, not Genius 12K." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-hack-04",
      rank: 1,
      awardType: "best-overall",
      role: "Primary smash diamond",
      summary: "Hack 04 18K — current attacking Hack.",
      whyWon:
        "Hack 04 ranks first for power because it is the current Hack diamond with an offensive 18K brief. Metalbone 3.5 is the adjustable Adidas path. Technical Viper is the Babolat striker. Coello Pro is HEAD’s Pro diamond. Attack 18K is Tapia’s Attack, not Genius.",
      whyFits: [
        "Hack 04 is for players who already swing. Off-centre blocks are not this frame’s job.",
        "I'd shortlist it when finishing is the weekly constraint. I'd skip it if you still need Vertex 05’s all-court diamond or Hack 04 Comfort’s Fibrix face.",
      ],
      bestFor: ["Advanced smash", "Current Hack family", "Right-side finishers"],
      tradeoff: "Low forgiveness and high stiffness.",
      extraTradeoffs: ["Not Hack 04 Comfort."],
      avoid: ["Beginners", "Control-cup players", "Hack 03 as a current stand-in"],
      instead: [
        { productId: "prod-adidas-metalbone-3-5-2026", when: "you want adjustable Metalbone attack", label: "Metalbone 3.5" },
        { productId: "prod-bullpadel-hack-04-comfort", when: "you want Hack geometry with Fibrix comfort", label: "Hack 04 Comfort" },
        { productId: "prod-bullpadel-vertex-05", when: "you need more all-court coverage", label: "Vertex 05" },
      ],
      useCaseIds: ["uc-padel-power", "uc-padel-maximum-power"],
    }),
    pick({
      productId: "prod-adidas-metalbone-3-5-2026",
      rank: 2,
      awardType: "best-premium",
      role: "Adjustable Metalbone attack",
      summary: "Metalbone 3.5 — current Galán, not 3.3.",
      whyWon:
        "3.5 is the current Metalbone attack award. HRD+ is High Memory. 3.3 is previous-generation.",
      whyFits: [
        "Weight & Balance plus Soft Performance EVA is the current Metalbone attack story.",
        "I'd shortlist it to tune head mass. I'd skip it if you wanted round CTRL or HRD+ stiffness.",
      ],
      bestFor: ["Adidas attackers", "Players replacing 3.3"],
      tradeoff: "Compact sweet spot; plates can add mass.",
      avoid: ["Beginners", "3.3 as current", "HRD+ shoppers expecting this to be High Memory"],
      instead: [
        { productId: "prod-bullpadel-hack-04", when: "you want 18K Hack instead of plates", label: "Hack 04" },
        { productId: "prod-adidas-metalbone-ctrl", when: "you want round Metalbone", label: "Metalbone CTRL" },
      ],
      useCaseIds: ["uc-padel-power"],
    }),
    pick({
      productId: "prod-babolat-technical-viper",
      rank: 3,
      awardType: "editors-pick",
      role: "Babolat striker diamond",
      summary: "Technical Viper — not Counter, not Air.",
      whyWon:
        "Technical Viper is the striker diamond. Counter Viper is control/counter. Air Viper is handling.",
      whyFits: [
        "This is the Viper for players who already strike the ball. Not a beginner handling story.",
        "I'd shortlist it in the Babolat attack lane. I'd skip it if you needed Counter or Air.",
      ],
      bestFor: ["Technical strikers", "Babolat attack diamonds"],
      tradeoff: "Demands timing — not Air Viper’s easier swing.",
      avoid: ["Beginners", "Counter-first players"],
      instead: [
        { productId: "prod-babolat-counter-viper", when: "you want the counter Viper", label: "Counter Viper" },
        { productId: "prod-babolat-air-viper", when: "you want the lighter Viper", label: "Air Viper" },
      ],
      useCaseIds: ["uc-padel-power"],
    }),
    pick({
      productId: "prod-head-coello-pro",
      rank: 4,
      badge: "Best HEAD attack diamond",
      role: "Coello Pro",
      summary: "Coello Pro — professional diamond, not a value beginner.",
      whyWon:
        "Coello Pro is HEAD’s professional attack diamond. The old category guide treated it as value/beginner. That job is false. Team and Motion are the step-downs.",
      whyFits: [
        "Coello Pro assumes you already play. It is not a bargain hybrid for new players.",
        "I'd shortlist it when you want HEAD’s Coello diamond. I'd skip it if you needed Team or Motion.",
      ],
      bestFor: ["HEAD attackers", "Coello system at Pro level"],
      tradeoff: "Demanding diamond — not Team.",
      avoid: ["Beginners", "Anyone buying this as “approachable value”"],
      instead: [
        { productId: "prod-head-coello-team", when: "you need the Team step-down", label: "Coello Team" },
        { productId: "prod-head-coello-motion", when: "you need the Motion handling Coello", label: "Coello Motion" },
      ],
      useCaseIds: ["uc-padel-power", "uc-padel-advanced"],
    }),
    pick({
      productId: "prod-nox-at10-attack-18k-2026",
      rank: 5,
      badge: "Best Tapia Attack diamond",
      role: "AT10 Attack 18K",
      summary: "Genius Attack 18K — the published Tapia diamond, not Genius 12K.",
      whyWon:
        "Attack 18K is the Tapia diamond. Genius 12K and 18K are teardrop Genius moulds. Attack 12K is photo-blocked and cannot win.",
      whyFits: [
        "If you want Tapia in a diamond, this is the published Attack 18K. Genius 12K is not that racket.",
        "I'd shortlist it when Genius teardrop left you wanting Attack geometry. I'd skip it if you wanted Genius 18K all-court.",
      ],
      bestFor: ["Tapia Attack diamond", "Nox smash-first"],
      tradeoff: "Not the Genius teardrop all-courter.",
      avoid: ["Players confusing Genius 12K with Attack", "Photo-blocked Attack 12K"],
      instead: [
        { productId: "prod-nox-at10-18k-2026", when: "you want Genius teardrop 18K", label: "AT10 Genius 18K" },
        { productId: "prod-bullpadel-hack-04", when: "you want Hack 18K instead of Nox Attack", label: "Hack 04" },
      ],
      useCaseIds: ["uc-padel-power", "uc-padel-maximum-power"],
    }),
  ],
  consideredProducts: [
    considered("prod-nox-at10-12k-2026", "Teardrop Genius, not a diamond Attack. All-round guide.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-adidas-metalbone-3-3-2026", "Previous Metalbone.", "previous-pick", { reasonCode: "previous-generation" }),
    considered("prod-nox-at10-attack-12k-2026", "Photo-blocked Attack 12K draft.", "rejected", { reasonCode: "insufficient-evidence" }),
    considered("prod-bullpadel-indiga-ctr", "Beginner round. Wrong job.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-bullpadel-hack-04",
    "prod-adidas-metalbone-3-5-2026",
    "prod-babolat-technical-viper",
    "prod-head-coello-pro",
    "prod-nox-at10-attack-18k-2026",
  ],
  buyingAdvice:
    "If you cannot already generate head speed, a power diamond will make you miss. Buy intermediate or control first. If you can already finish, do not buy Genius 12K thinking it is Attack, and do not buy Metalbone 3.3 as current.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/bullpadel-hack-04-hero.png",
  hubImageAlt: "Bullpadel Hack 04 — power padel racket",
});

export const padelRacketsAllRoundGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-all-round",
  slug: "padel-rackets-all-round",
  title: "Best All-Round Padel Rackets",
  subtitle: "Hybrid and teardrop frames that attack and defend in the same match",
  shortDescription:
    "All-round means hybrid/teardrop coverage — not a diamond smash stick and not a beginner round.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-balanced"],
  intent:
    "all-round padel rackets: hybrid and teardrop moulds with manufacturer versatile/all-court jobs — not pure diamonds and not beginner rounds",
  intro:
    "All-round means you attack and defend in the same match without changing rackets. That usually lives in hybrid and teardrop moulds. We awarded Vertex 05 Hybrid, AT10 Genius 12K, AT10 Genius 18K, Siux Diablo, and HEAD Speed Pro. Vertex 05 diamond and Hack 04 remain useful rackets — they are just not this job. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criteria that change versus power: a usable defensive face matters as much as finishing. Versus beginners: you already make contact, so a centred round is no longer enough. Medium balance and hybrid/teardrop outlines score up.",
  criteriaChangePoints: [
    {
      label: "Hybrid/teardrop first",
      explanation: "Pure diamonds can be all-court in marketing copy; this page requires the mould to match.",
    },
    {
      label: "Genius is teardrop",
      explanation: "12K and 18K Genius belong here. Attack 18K belongs on power.",
    },
  ],
  quickTake: [
    "Choose Vertex 05 Hybrid if you want Vertex construction without diamond-only height.",
    "Choose AT10 Genius 12K if you want the firmer Genius teardrop.",
    "Choose AT10 Genius 18K if you want the 18K Genius teardrop.",
    "Choose Diablo if you want Siux’s advanced teardrop all-courter.",
    "Choose Speed Pro if you want HEAD’s Speed Pro all-court.",
  ],
  decisionShortcuts: [
    { need: "Vertex hybrid", productId: "prod-bullpadel-vertex-05-hybrid", reason: "Hybrid Vertex 05." },
    { need: "Firmer Genius", productId: "prod-nox-at10-12k-2026", reason: "12K Alum XTREM Genius." },
    { need: "18K Genius teardrop", productId: "prod-nox-at10-18k-2026", reason: "18K Genius, not Attack." },
    { need: "Siux teardrop", productId: "prod-siux-diablo", reason: "Advanced Diablo." },
    { need: "HEAD Speed all-court", productId: "prod-head-speed-pro", reason: "Speed Pro." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-vertex-05-hybrid",
      rank: 1,
      awardType: "best-overall",
      role: "Hybrid Vertex all-court",
      summary: "Vertex 05 Hybrid — Vertex without diamond-only tax.",
      whyWon:
        "Vertex 05 Hybrid is the clearest Bullpadel all-rounder: Vertex construction, hybrid outline. Genius 12K/18K are the Nox teardrop pair. Diablo is Siux. Speed Pro is HEAD.",
      whyFits: [
        "Hybrid Vertex is for players who like Vertex but defend too much for a pure diamond.",
        "I'd shortlist it as the default all-round Bullpadel. I'd skip it if you already want diamond Vertex 05 or Hack.",
      ],
      bestFor: ["All-court Vertex", "Defence-to-attack in one mould"],
      tradeoff: "Less peak diamond smash than Vertex 05.",
      avoid: ["Beginners", "Smash-only diamonds"],
      instead: [
        { productId: "prod-bullpadel-vertex-05", when: "you want the diamond Vertex", label: "Vertex 05" },
        { productId: "prod-nox-at10-18k-2026", when: "you want Tapia Genius teardrop", label: "AT10 Genius 18K" },
      ],
      useCaseIds: ["uc-padel-balanced"],
    }),
    pick({
      productId: "prod-nox-at10-12k-2026",
      rank: 2,
      awardType: "editors-pick",
      role: "Firmer Genius teardrop",
      summary: "AT10 Genius 12K — teardrop Genius, not Attack.",
      whyWon:
        "12K Genius wins the firmer Genius all-round slot. The old category guide treated it as a premium attack diamond. That is the wrong mould.",
      whyFits: [
        "Drop/tear Genius with 12K Alum XTREM and HR3 Black Eva — firmer than 18K, still not Attack.",
        "I'd shortlist it when you want Genius with a stiffer face. I'd skip it if you wanted Attack 18K.",
      ],
      bestFor: ["Firmer Genius all-court", "Nox teardrop players"],
      tradeoff: "Firmer than 18K; still not a diamond Attack.",
      avoid: ["Players who wanted Attack geometry", "Beginners"],
      instead: [
        { productId: "prod-nox-at10-18k-2026", when: "you want the 18K Genius core", label: "AT10 Genius 18K" },
        { productId: "prod-nox-at10-attack-18k-2026", when: "you want Attack diamond", label: "AT10 Attack 18K" },
      ],
      useCaseIds: ["uc-padel-balanced", "uc-padel-advanced"],
    }),
    pick({
      productId: "prod-nox-at10-18k-2026",
      rank: 3,
      badge: "Best 18K Genius teardrop",
      role: "18K Genius",
      summary: "AT10 Genius 18K — Tapia all-court teardrop.",
      whyWon:
        "18K Genius is the other Genius all-rounder. It does not duplicate 12K: different face and core.",
      whyFits: [
        "18K Genius with MLD Black Eva is the more comfort-leaning professional Genius versus 12K.",
        "I'd shortlist it when 12K feels too firm. I'd skip it if you wanted Attack.",
      ],
      bestFor: ["18K Genius all-court", "Tapia teardrop"],
      tradeoff: "Not Attack diamond.",
      avoid: ["Attack-only players", "Beginners"],
      instead: [
        { productId: "prod-nox-at10-12k-2026", when: "you want the firmer 12K Genius", label: "AT10 Genius 12K" },
        { productId: "prod-bullpadel-vertex-05-hybrid", when: "you want Vertex hybrid instead of Genius", label: "Vertex 05 Hybrid" },
      ],
      useCaseIds: ["uc-padel-balanced"],
    }),
    pick({
      productId: "prod-siux-diablo",
      rank: 4,
      badge: "Best Siux teardrop all-court",
      role: "Diablo teardrop",
      summary: "Advanced Diablo as an all-court teardrop — not a beginner.",
      whyWon:
        "Diablo is an advanced teardrop all-courter. It is the opposite of the old beginner badge.",
      whyFits: [
        "Teardrop Diablo for skilled all-court play with a spin-friendly face.",
        "I'd shortlist it on Siux. I'd skip it if you are still learning.",
      ],
      bestFor: ["Advanced Siux all-court", "Teardrop with spin face"],
      tradeoff: "Firm and premium.",
      avoid: ["Beginners"],
      instead: [
        { productId: "prod-head-speed-pro", when: "you want HEAD Speed Pro instead", label: "Speed Pro" },
        { productId: "prod-bullpadel-indiga-ctr", when: "you actually need a beginner round", label: "Indiga CTR" },
      ],
      useCaseIds: ["uc-padel-balanced", "uc-padel-advanced"],
    }),
    pick({
      productId: "prod-head-speed-pro",
      rank: 5,
      badge: "Best HEAD Speed all-court",
      role: "Speed Pro",
      summary: "HEAD Speed Pro — all-court Speed, not Extreme Motion.",
      whyWon:
        "Speed Pro is HEAD’s all-court Speed. Extreme Motion is a handling specialist on the maneuverability page.",
      whyFits: [
        "Speed Pro covers mixed-phase play in the HEAD Speed family.",
        "I'd shortlist it when you want HEAD all-court without Coello diamond. I'd skip it if you wanted Gravity control or Coello smash.",
      ],
      bestFor: ["HEAD Speed all-court", "Mixed attack and defence"],
      tradeoff: "Not Gravity control and not Coello smash.",
      avoid: ["Beginners", "Extreme Motion handling shoppers expecting this to be that frame"],
      instead: [
        { productId: "prod-head-gravity-pro", when: "you want Gravity control", label: "Gravity Pro" },
        { productId: "prod-head-extreme-motion-2026", when: "you want Extreme Motion handling", label: "Extreme Motion" },
      ],
      useCaseIds: ["uc-padel-balanced"],
    }),
  ],
  consideredProducts: [
    considered("prod-bullpadel-vertex-05", "Diamond Vertex. Category/advanced, not this hybrid job.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-bullpadel-hack-04", "Smash diamond. Power guide.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-nox-at10-attack-18k-2026", "Attack diamond. Power guide.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-bullpadel-vertex-05-hybrid",
    "prod-nox-at10-12k-2026",
    "prod-nox-at10-18k-2026",
    "prod-siux-diablo",
    "prod-head-speed-pro",
  ],
  buyingAdvice:
    "If your week is half defence and half attack, stay here. If you only finish, use power. If you only survive, use control or beginners. Genius 12K is a teardrop all-courter — do not buy it as a hidden Attack diamond.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/bullpadel-vertex-05-hybrid-hero.jpg",
  hubImageAlt: "Bullpadel Vertex 05 Hybrid — all-round padel racket",
});
