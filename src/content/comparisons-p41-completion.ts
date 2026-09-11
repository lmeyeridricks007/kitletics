/**
 * Editorial Completion 41 — Comparison holds + pair-specific uniqueness rewrites.
 *
 * 1) Hold comparisons whose peers are draft / not production-exposed (no fake products).
 * 2) Replace template “same buying lane” copy on NEEDS_DIFF pairs with decision-quality prose.
 */

import type { Comparison } from "@/domain/editorial/types";

/** Comparisons with at least one draft / non-production peer product. */
export const COMPARISON_BROKEN_PEER_SLUGS = [
  "lululemon-hotty-hot-vs-janji-pace-short",
  "brooks-dare-crossback-vs-lululemon-energy-bra",
  "jabra-elite-8-active-vs-beats-powerbeats-pro-2",
  "knog-frog-v3-vs-nite-ize-radiant-clip",
  "theragun-prime-vs-renpho-r3",
  "triggerpoint-grid-vs-grid-x",
  "triggerpoint-grid-vs-rumbleroller",
  "oofos-ooriginal-vs-hoka-ora-recovery-slide",
] as const;

type CmpPatch = Partial<
  Pick<
    Comparison,
    | "summary"
    | "verdict"
    | "winnerReason"
    | "criteria"
    | "keyDifferences"
    | "chooseProductReasons"
    | "recommendationsByUseCase"
    | "evidenceIds"
  >
>;

const P41_UNIQUE: Record<string, CmpPatch> = {
  "concept2-rowerg-vs-mirafit-magnetic-rower": {
    summary:
      "Concept2 RowErg is the air-resistance reference most HYROX gyms, clubs and online scoreboards assume. Mirafit Magnetic Rower is a quieter, apartment-friendlier magnetic machine when neighbour noise and price matter more than community-comparable splits. The fork is standardised metrics + race familiarity versus household quiet — not which brand “rows better” in marketing copy.",
    verdict:
      "Choose Concept2 if you need comparable splits, HYROX/club familiarity, or a resale/ecosystem machine. Choose Mirafit Magnetic if quiet operation and entry cost dominate and you accept less standardised metrics. Choose neither if you need a folding footprint first — look at folding magnetic options before forcing either into a tiny room.",
    winnerReason:
      "Concept2 wins when scores must travel across venues; Mirafit wins when the flywheel noise of an air rower is the deal-breaker.",
    criteria: [
      { key: "metrics", label: "Standardised metrics", winnerProductId: "prod-concept2-rowerg" },
      { key: "noise", label: "Household noise", winnerProductId: "prod-mirafit-rower" },
      { key: "hyrox", label: "HYROX / club familiarity", winnerProductId: "prod-concept2-rowerg" },
      { key: "value", label: "Entry value", winnerProductId: "prod-mirafit-rower" },
      { key: "footprint", label: "Footprint honesty" },
    ],
    keyDifferences: [
      {
        key: "biggest-difference",
        label: "Biggest difference",
        productImpacts: [
          { productId: "prod-concept2-rowerg", impact: "Air flywheel + PM ecosystem with community-comparable splits" },
          { productId: "prod-mirafit-rower", impact: "Magnetic quiet aimed at home use" },
        ],
        explanation:
          "Concept2’s value is transferable numbers and race-station familiarity. Mirafit’s value is lower acoustic impact when the machine lives in a flat.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "specs-caveat",
        label: "Spec comparability",
        productImpacts: [
          { productId: "prod-concept2-rowerg", impact: "Damper + PM5 splits are a known language" },
          { productId: "prod-mirafit-rower", impact: "Magnetic levels are brand-specific — do not treat them as Concept2 dampers" },
        ],
        explanation:
          "Do not equate Mirafit resistance numbers with Concept2 damper settings. Compare feel and noise in your room; compare scores only inside one ecosystem.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "tradeoffs",
        label: "Main trade-offs",
        productImpacts: [
          { productId: "prod-concept2-rowerg", impact: "Louder air flywheel; longer footprint" },
          { productId: "prod-mirafit-rower", impact: "Metrics less standardised; less race-station transfer" },
        ],
        explanation:
          "Accept noise for transferable scores, or accept metric isolation for quieter living.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-concept2-rowerg",
        reason:
          "Choose Concept2 if HYROX, club classes or online rankings need splits others recognise.",
      },
      {
        productId: "prod-mirafit-rower",
        reason:
          "Choose Mirafit Magnetic if downstairs neighbours or early-morning sessions make an air flywheel unacceptable.",
      },
      {
        productId: "prod-concept2-rowerg",
        context: "Choose neither when",
        reason:
          "Your hard constraint is fold-flat storage — shortlist folding magnetic rowers before either of these.",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-hyrox",
        productId: "prod-concept2-rowerg",
        rationale: "HYROX and many gym scores assume Concept2.",
      },
      {
        useCaseId: "uc-home-quiet",
        productId: "prod-mirafit-rower",
        rationale: "Quieter magnetic resistance for apartments.",
      },
      {
        useCaseId: "uc-community-rowing",
        productId: "prod-concept2-rowerg",
        rationale: "Community workouts and resale favour the PM ecosystem.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },

  "concept2-rowerg-vs-hydrow-wave": {
    summary:
      "Concept2 RowErg is an open, coach-agnostic air rower with gold-standard splits. Hydrow Wave is a quieter magnetic connected rower built around guided classes and a subscription content model. The decision is open metrics + ownership of your training data versus quiet connected coaching — not a simple “better rower” ranking.",
    verdict:
      "Choose Concept2 when you want portable scores, HYROX/gym transfer and no content subscription. Choose Hydrow Wave when quiet magnetic feel plus on-screen coaching is the product you will actually use. Choose neither if you refuse both air noise and subscriptions — look at non-connected magnetic rowers instead.",
    winnerReason:
      "Concept2 wins on open standards; Hydrow wins on quiet connected coaching when you will pay for the content habit.",
    criteria: [
      { key: "scores", label: "Open / transferable scores", winnerProductId: "prod-concept2-rowerg" },
      { key: "quiet", label: "Quiet magnetic feel", winnerProductId: "prod-hydrow-wave" },
      { key: "coaching", label: "Connected coaching", winnerProductId: "prod-hydrow-wave" },
      { key: "ownership", label: "No subscription required", winnerProductId: "prod-concept2-rowerg" },
      { key: "hyrox", label: "Race-station familiarity", winnerProductId: "prod-concept2-rowerg" },
    ],
    keyDifferences: [
      {
        key: "biggest-difference",
        label: "Biggest difference",
        productImpacts: [
          { productId: "prod-concept2-rowerg", impact: "Open PM ecosystem, air resistance, no class subscription" },
          { productId: "prod-hydrow-wave", impact: "Magnetic quiet + subscription coaching library" },
        ],
        explanation:
          "Concept2 sells a standardised tool. Hydrow sells a quieter connected experience whose long-term cost includes content.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "value",
        label: "Value difference",
        productImpacts: [
          { productId: "prod-concept2-rowerg", impact: "Up-front machine + optional accessories" },
          { productId: "prod-hydrow-wave", impact: "Machine + ongoing subscription for full coaching value" },
        ],
        explanation:
          "Price the Hydrow on multi-year subscription total, not sticker alone. Concept2’s “price” includes noise and footprint trade-offs instead of content fees.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "tradeoffs",
        label: "Main trade-offs",
        productImpacts: [
          { productId: "prod-concept2-rowerg", impact: "Loud flywheel; no built-in class theatre" },
          { productId: "prod-hydrow-wave", impact: "Subscription dependence; less HYROX score transfer" },
        ],
        explanation:
          "Pick the friction you can live with: acoustic noise or recurring content cost.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-concept2-rowerg",
        reason:
          "Choose Concept2 if you already train to open splits or race HYROX stations.",
      },
      {
        productId: "prod-hydrow-wave",
        reason:
          "Choose Hydrow Wave if quiet magnetic rowing plus guided classes is what keeps you consistent.",
      },
      {
        productId: "prod-concept2-rowerg",
        context: "Choose neither when",
        reason:
          "You want quiet magnetic rowing without a coaching subscription — shortlist non-connected magnetic rowers.",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-hyrox",
        productId: "prod-concept2-rowerg",
        rationale: "Race-station familiarity and open scores.",
      },
      {
        useCaseId: "uc-home-quiet",
        productId: "prod-hydrow-wave",
        rationale: "Quieter magnetic connected rower for shared living spaces.",
      },
      {
        useCaseId: "uc-guided-training",
        productId: "prod-hydrow-wave",
        rationale: "When on-screen coaching is the adherence tool.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },

  "nox-at10-genius-18k-2026-vs-bullpadel-vertex-04-2026": {
    summary:
      "Nox AT10 Genius 18K 2026 is a hybrid all-court frame for players who attack and defend in equal measure. Bullpadel Vertex 04 is a more attacking diamond biased to finishing power when you already generate head speed. The split is hybrid versatility versus diamond finishing — not a generic “control vs power” slogan recycled across every padel pair.",
    verdict:
      "Choose AT10 18K if your match pattern needs bandeja defence and counter as often as finishers. Choose Vertex 04 if you already prepare early and want diamond finishing authority. Choose neither if you still spray the sweet spot — start on a rounder/forgiving frame before either of these.",
    winnerReason:
      "AT10 wins hybrid weeks; Vertex wins when finishing geometry is the weekly constraint.",
    criteria: [
      { key: "shape", label: "Shape / balance", winnerProductId: "prod-bullpadel-vertex-04" },
      { key: "hybrid", label: "All-court hybrid play", winnerProductId: "prod-nox-at10-18k-2026" },
      { key: "finish", label: "Finishing bias", winnerProductId: "prod-bullpadel-vertex-04" },
      { key: "defence", label: "Defensive recovery", winnerProductId: "prod-nox-at10-18k-2026" },
      { key: "level", label: "Level honesty" },
    ],
    keyDifferences: [
      {
        key: "biggest-difference",
        label: "Biggest difference",
        productImpacts: [
          { productId: "prod-nox-at10-18k-2026", impact: "Hybrid geometry for mixed rally patterns" },
          { productId: "prod-bullpadel-vertex-04", impact: "Diamond attacking stability for finishers" },
        ],
        explanation:
          "Vertex pushes the sweet spot and balance toward attack. AT10 keeps more all-court forgiveness when points restart from defence.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "who-wins",
        label: "Where each wins",
        productImpacts: [
          { productId: "prod-nox-at10-18k-2026", impact: "Wins counterpunching and balanced pairs play" },
          { productId: "prod-bullpadel-vertex-04", impact: "Wins when you finish above the shoulder often" },
        ],
        explanation:
          "If your highlight reel is mostly blocks and rebuilds, AT10 fits. If it is mostly viboras and smashes you can already time, Vertex fits.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "tradeoffs",
        label: "Main trade-offs",
        productImpacts: [
          { productId: "prod-nox-at10-18k-2026", impact: "Less pure finishing punch than a dedicated diamond" },
          { productId: "prod-bullpadel-vertex-04", impact: "Less forgiving when preparation is late" },
        ],
        explanation:
          "Hybrid margin versus diamond demand — pick the error you make less often.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nox-at10-18k-2026",
        reason:
          "Choose AT10 Genius 18K if you need one frame for attack and glass defence in the same match.",
      },
      {
        productId: "prod-bullpadel-vertex-04",
        reason:
          "Choose Vertex 04 if finishing power is the weekly gap and your timing already supports a diamond.",
      },
      {
        productId: "prod-nox-at10-18k-2026",
        context: "Choose neither when",
        reason:
          "You are still consolidating contact — a rounder control frame will teach more than either attacking tool.",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-all-court",
        productId: "prod-nox-at10-18k-2026",
        rationale: "Hybrid all-court when attack and defence share the week.",
      },
      {
        useCaseId: "uc-attacking",
        productId: "prod-bullpadel-vertex-04",
        rationale: "Diamond finishing when overhead authority is the job.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },

  "nox-at10-genius-18k-2026-vs-babolat-technical-viper-2026": {
    summary:
      "Nox AT10 Genius 18K 2026 stays a hybrid all-court tool. Babolat Technical Viper 2026 is a stiffer, more explosive attacking frame for players who already produce head speed. Unlike AT10-vs-Vertex, this pair contrasts hybrid balance with Babolat’s explosive face response — not another diamond-vs-diamond clone.",
    verdict:
      "Choose AT10 18K for versatile hybrid weeks. Choose Technical Viper when explosive finishing and a firmer Babolat response are the point of the purchase. Choose neither if beginners’ forgiveness is still the constraint.",
    winnerReason:
      "AT10 covers mixed patterns; Viper pays off only when you can already accelerate cleanly into finishers.",
    criteria: [
      { key: "hybrid", label: "Hybrid versatility", winnerProductId: "prod-nox-at10-18k-2026" },
      { key: "explosive", label: "Explosive finishing", winnerProductId: "prod-babolat-technical-viper" },
      { key: "stiffness", label: "Face stiffness demand", winnerProductId: "prod-babolat-technical-viper" },
      { key: "forgiveness", label: "Mishit margin", winnerProductId: "prod-nox-at10-18k-2026" },
      { key: "level", label: "Level filter" },
    ],
    keyDifferences: [
      {
        key: "biggest-difference",
        label: "Biggest difference",
        productImpacts: [
          { productId: "prod-nox-at10-18k-2026", impact: "Hybrid feel for rebuild-to-attack points" },
          { productId: "prod-babolat-technical-viper", impact: "Explosive power bias with less beginner margin" },
        ],
        explanation:
          "Viper amplifies clean acceleration. AT10 keeps you in the point when the first ball is defensive.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "tradeoffs",
        label: "Main trade-offs",
        productImpacts: [
          { productId: "prod-nox-at10-18k-2026", impact: "Not the lightest; less peak smash pop than Viper" },
          { productId: "prod-babolat-technical-viper", impact: "Demanding for developing timing" },
        ],
        explanation:
          "If mishits still decide your sets, Viper’s explosiveness is the wrong upgrade path.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nox-at10-18k-2026",
        reason:
          "Choose AT10 if hybrid all-court feel matches most matches.",
      },
      {
        productId: "prod-babolat-technical-viper",
        reason:
          "Choose Technical Viper if explosive finishing is the gap and your preparation is already early.",
      },
      {
        productId: "prod-nox-at10-18k-2026",
        context: "Choose neither when",
        reason:
          "You need maximum forgiveness — look at rounder control frames before either.",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-all-court",
        productId: "prod-nox-at10-18k-2026",
        rationale: "Hybrid balance for attack-and-defence weeks.",
      },
      {
        useCaseId: "uc-attacking",
        productId: "prod-babolat-technical-viper",
        rationale: "Finishing power when smash output is the priority.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },

  "babolat-technical-viper-2026-vs-wilson-bela-pro-v2-2026": {
    summary:
      "Both are attack-capable padel frames, but they are not interchangeable. Technical Viper 2026 emphasises explosive Babolat finishing response; Bela Pro V2 2026 carries Wilson’s attacking pro-line profile with a different stiffness and head-feel signature. The useful question is which attacking personality matches your preparation speed — not which logo is louder.",
    verdict:
      "Choose Technical Viper for explosive finishing if you already generate head speed. Choose Bela Pro V2 if you want Wilson’s attacking profile and prefer that head-feel. Choose neither if you still need hybrid forgiveness more than another attacking stick.",
    winnerReason:
      "Viper for explosive pop; Bela Pro for Wilson attacking geometry — both punish late preparation.",
    criteria: [
      { key: "explosive", label: "Explosive response", winnerProductId: "prod-babolat-technical-viper" },
      { key: "attack-profile", label: "Attacking pro profile", winnerProductId: "prod-wilson-bela-pro" },
      { key: "feel", label: "Head / stiffness feel" },
      { key: "level", label: "Level demand" },
      { key: "forgiveness", label: "Beginner forgiveness" },
    ],
    keyDifferences: [
      {
        key: "biggest-difference",
        label: "Biggest difference",
        productImpacts: [
          { productId: "prod-babolat-technical-viper", impact: "Explosive power emphasis" },
          { productId: "prod-wilson-bela-pro", impact: "Attacking Wilson pro-line head-feel" },
        ],
        explanation:
          "Same broad attacking lane, different face personalities. Demo finishers and blocks — do not buy on player endorsement alone.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "tradeoffs",
        label: "Main trade-offs",
        productImpacts: [
          { productId: "prod-babolat-technical-viper", impact: "Demanding for beginners" },
          { productId: "prod-wilson-bela-pro", impact: "Still attack-biased — not a soft starter frame" },
        ],
        explanation:
          "Either frame can shrink your margin if timing is inconsistent.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-babolat-technical-viper",
        reason:
          "Choose Technical Viper if explosive smash output is the weekly priority.",
      },
      {
        productId: "prod-wilson-bela-pro",
        reason:
          "Choose Bela Pro V2 if Wilson’s attacking profile and head-feel fit your preparation better.",
      },
      {
        productId: "prod-babolat-technical-viper",
        context: "Choose neither when",
        reason:
          "You need hybrid or round-frame forgiveness more than another attacking option.",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-attacking",
        productId: "prod-babolat-technical-viper",
        rationale: "Pure attacking bias for finishers with head speed.",
      },
      {
        useCaseId: "uc-attacking-alt",
        productId: "prod-wilson-bela-pro",
        rationale: "Attack-capable with a different stiffness/head-feel profile.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },

  "babolat-pure-drive-2025-vs-wilson-clash-100-v2": {
    summary:
      "Pure Drive 2025 is a lively midplus built for accessible depth and ball speed. Clash 100 v2 is Wilson’s freer, more flexible comfort frame for players who prioritise arm-friendly flex over free power. This is a power-oriented 100 versus a comfort-flex 100 — not the same decision as EZONE-vs-Clash v3.",
    verdict:
      "Choose Pure Drive 2025 if you want easier depth and a firmer, livelier response. Choose Clash 100 v2 if arm comfort and free swinging matter more than free power. Choose neither if you need a dense control 98 — those are a different lane.",
    winnerReason:
      "Pure Drive wins accessible power; Clash v2 wins flexible comfort.",
    criteria: [
      { key: "power", label: "Accessible power", winnerProductId: "prod-babolat-pure-drive-2025" },
      { key: "comfort", label: "Arm-friendly flex", winnerProductId: "prod-wilson-clash-100-v2" },
      { key: "spin", label: "Spin potential" },
      { key: "stability", label: "Plough / stability on pace" },
      { key: "strings", label: "Stringbed sensitivity" },
    ],
    keyDifferences: [
      {
        key: "biggest-difference",
        label: "Biggest difference",
        productImpacts: [
          { productId: "prod-babolat-pure-drive-2025", impact: "Livelier accessible power" },
          { productId: "prod-wilson-clash-100-v2", impact: "More flexible comfort-oriented flex" },
        ],
        explanation:
          "Pure Drive helps produce depth; Clash helps you swing freer when comfort is the limiter. Spec sheets should note strung weight and string/tension — demos without your stringbed mislead.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "variant-note",
        label: "Variant / generation note",
        productImpacts: [
          { productId: "prod-babolat-pure-drive-2025", impact: "2025 generation Pure Drive" },
          { productId: "prod-wilson-clash-100-v2", impact: "Clash 100 v2 — not Clash v3" },
        ],
        explanation:
          "Do not treat Clash v2 and Clash v3 as identical in comparisons elsewhere. This page is specifically v2 comfort-flex versus Pure Drive 2025 power.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "tradeoffs",
        label: "Main trade-offs",
        productImpacts: [
          { productId: "prod-babolat-pure-drive-2025", impact: "Less surgical than dense control frames; firmer than Clash" },
          { productId: "prod-wilson-clash-100-v2", impact: "Less free power than Pure Drive" },
        ],
        explanation:
          "Pick power you can control or comfort you will actually swing.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-babolat-pure-drive-2025",
        reason:
          "Choose Pure Drive 2025 if you want free power and a lively midplus.",
      },
      {
        productId: "prod-wilson-clash-100-v2",
        reason:
          "Choose Clash 100 v2 if you prioritise comfort and arm-friendly flex.",
      },
      {
        productId: "prod-babolat-pure-drive-2025",
        context: "Choose neither when",
        reason:
          "You need a precision 98 control frame — shortlist Blade/EZONE 98-class options instead.",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-power",
        productId: "prod-babolat-pure-drive-2025",
        rationale: "Easier depth and ball speed.",
      },
      {
        useCaseId: "uc-comfort",
        productId: "prod-wilson-clash-100-v2",
        rationale: "Softer flex and freer swing.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },

  "yonex-ezone-100-2025-vs-wilson-clash-100-v3": {
    summary:
      "EZONE 100 8th Gen 2025 pairs forgiving ISOMETRIC power with a plush large sweet spot. Clash 100 v3 continues Wilson’s flexible comfort story into the newer Clash generation. Relative to Pure Drive-vs-Clash v2, this page is forgiving Yonex power versus Clash v3 flex — generation and brand response both differ.",
    verdict:
      "Choose EZONE 100 2025 for forgiving power and a large sweet spot. Choose Clash 100 v3 for flexible comfort when arm ease is the weekly filter. Choose neither if you want a dense 98 control pattern.",
    winnerReason:
      "EZONE wins forgiveness-plus-depth; Clash v3 wins freer flex comfort.",
    criteria: [
      { key: "forgiveness", label: "Sweet-spot forgiveness", winnerProductId: "prod-yonex-ezone-100-2025" },
      { key: "power", label: "Forgiving power", winnerProductId: "prod-yonex-ezone-100-2025" },
      { key: "comfort", label: "Flexible comfort", winnerProductId: "prod-wilson-clash-100-v3" },
      { key: "spin", label: "Spin / launch" },
      { key: "generation", label: "Generation clarity" },
    ],
    keyDifferences: [
      {
        key: "biggest-difference",
        label: "Biggest difference",
        productImpacts: [
          { productId: "prod-yonex-ezone-100-2025", impact: "ISOMETRIC forgiving power" },
          { productId: "prod-wilson-clash-100-v3", impact: "Clash v3 flexible comfort" },
        ],
        explanation:
          "EZONE helps centred and near-centred contact produce depth. Clash v3 emphasises flex and comfort through the swing. Compare with the same string class when possible.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "generation",
        label: "Generation / variant",
        productImpacts: [
          { productId: "prod-yonex-ezone-100-2025", impact: "8th Gen 2025 EZONE 100" },
          { productId: "prod-wilson-clash-100-v3", impact: "Clash 100 v3 — not v2" },
        ],
        explanation:
          "Clash v3 is not a drop-in synonym for Clash v2 used in other Kitletics comparisons. Keep generation straight when shopping used frames.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "tradeoffs",
        label: "Main trade-offs",
        productImpacts: [
          { productId: "prod-yonex-ezone-100-2025", impact: "Less dense control than EZONE 98 / Blade-class frames" },
          { productId: "prod-wilson-clash-100-v3", impact: "Less free power than lively power 100s" },
        ],
        explanation:
          "Forgiving power versus freer flex — both can be wrong if you need ploughing control.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-yonex-ezone-100-2025",
        reason:
          "Choose EZONE 100 2025 if you want forgiving power with a plush ISOMETRIC response.",
      },
      {
        productId: "prod-wilson-clash-100-v3",
        reason:
          "Choose Clash 100 v3 if you prioritise flexible comfort and free swing.",
      },
      {
        productId: "prod-yonex-ezone-100-2025",
        context: "Choose neither when",
        reason:
          "You need a precision 98 — look at EZONE 98 / Blade-class frames instead.",
      },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-power",
        productId: "prod-yonex-ezone-100-2025",
        rationale: "More free depth with a large sweet spot.",
      },
      {
        useCaseId: "uc-comfort",
        productId: "prod-wilson-clash-100-v3",
        rationale: "Softer flex when arm comfort is the priority.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "asics-novablast-5-vs-brooks-ghost-16": {
    summary:
      "Novablast 5 is FF BLAST PLUS ECO at 8 mm drop with a rockered, energetic easy-mileage ride. Ghost 16 is DNA LOFT at 12 mm with a width ladder (narrow through extra-wide) and a softer, even daily. This is bounce-versus-fit-range, not two interchangeable high-cushion road shoes.",
    verdict:
      "Choose Novablast 5 when you want pop on easy and long-run days and you are fine in a standard last. Choose Ghost 16 when width SKUs and a calmer DNA LOFT ride matter more than energy return. Choose neither if you need GuideRail/4D GUIDANCE — that is Adrenaline or Kayano, not this pair.",
    winnerReason:
      "Novablast wins energy; Ghost wins fit flexibility. There is no blended winner if your week is half bounce and half 2E/4E widths.",
    keyDifferences: [
      {
        key: "foam-drop",
        label: "Foam and drop",
        productImpacts: [
          { productId: "prod-novablast-5", impact: "FF BLAST PLUS ECO, 8 mm, 41 mm heel, rockered" },
          { productId: "prod-ghost-16", impact: "DNA LOFT, 12 mm, width ladder, even ride" },
        ],
        explanation:
          "An 8 mm energetic rocker is a different geometry from a 12 mm even Ghost. Do not treat stack height as the decision.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "fit",
        label: "Fit range",
        productImpacts: [
          { productId: "prod-novablast-5", impact: "Standard last — not a width family" },
          { productId: "prod-ghost-16", impact: "Narrow through extra-wide" },
        ],
        explanation:
          "Ghost exists in this comparison because of widths. If you are a standard-width runner who wants pop, Novablast is the more honest daily.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-novablast-5",
        reason:
          "Choose Novablast 5 if most of your week is easy/long miles and you want FF BLAST pop rather than a width SKU.",
      },
      {
        productId: "prod-ghost-16",
        reason:
          "Choose Ghost 16 if you need Brooks widths or a calmer DNA LOFT ride and will not miss Novablast’s rocker.",
      },
      {
        productId: "prod-novablast-5",
        context: "Choose neither when",
        reason:
          "You need stability posting — look at Kayano 32 or Adrenaline GTS rather than forcing a neutral daily.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "head-coello-pro-2026-vs-siux-diablo-revolution-2026": {
    summary:
      "Coello Pro 2026 is Head’s value hybrid all-court padel frame. Diablo Revolution 2026 is Siux’s rounder, quicker defensive counter-puncher. This is hybrid versatility versus round control — not two diamond power rackets and not a tennis comparison.",
    verdict:
      "Choose Coello if you want one hybrid that can attack and defend at a friendlier price. Choose Diablo if you want quicker handling and a rounder sweet spot for defence. Choose neither if you need a teardrop power attacker — look at Vertex/Metalbone-class frames instead.",
    winnerReason:
      "Coello wins value-hybrid versatility; Diablo wins defensive maneuverability. Shape class is the fork.",
    keyDifferences: [
      {
        key: "shape-job",
        label: "Shape and job",
        productImpacts: [
          { productId: "prod-head-coello-pro", impact: "Hybrid all-court value" },
          { productId: "prod-siux-diablo", impact: "Rounder defensive handling" },
        ],
        explanation:
          "Hybrid versus round is the buying decision. Do not shop these as interchangeable 2026 ‘pro’ stickers.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-head-coello-pro",
        reason: "Choose Coello Pro for hybrid value if your game is balanced all-court, not pure defence.",
      },
      {
        productId: "prod-siux-diablo",
        reason: "Choose Diablo Revolution when quicker round handling and counter-punching are the week.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "nike-metcon-9-vs-reebok-nano-x4": {
    summary:
      "Metcon 9 is Nike’s planted gym platform for lifting and mixed gym work. Nano X4 is Reebok’s lift-to-run hybrid — the more honest HYROX daily when run stations show up. This is gym-stability versus run-hybrid, not two identical CrossFit shoes.",
    verdict:
      "Choose Metcon 9 when the week is barbell, rope, and gym floor. Choose Nano X4 when HYROX or mixed running is weekly, not occasional. Choose neither if you need a raised Olympic lifter (Romaleos/Adipower) or a road trainer.",
    winnerReason:
      "Metcon wins planted lifting; Nano wins lift-to-run. HYROX athletes should not default to Metcon by habit.",
    keyDifferences: [
      {
        key: "hybrid",
        label: "Run stations",
        productImpacts: [
          { productId: "prod-nike-metcon-9", impact: "Gym-first, limited run comfort" },
          { productId: "prod-reebok-nano-x4", impact: "Better lift-to-run balance for HYROX prep" },
        ],
        explanation:
          "If you run 1 km between stations most sessions, Nano is the comparison’s point. Metcon is the gym-stability answer.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nike-metcon-9",
        reason: "Choose Metcon 9 if lifting and gym floor work dominate and running is a warm-up.",
      },
      {
        productId: "prod-reebok-nano-x4",
        reason: "Choose Nano X4 if HYROX-style run legs are part of the week, not a once-a-month metcon.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "nike-metcon-9-vs-adidas-dropset-3": {
    summary:
      "Metcon 9 is a mixed gym trainer. Dropset 3 is adidas’ more strength-biased, planted trainer for heavy sessions and machine volume. Both are gym shoes — the fork is mixed conditioning versus strength-day bias, not Metcon versus another HYROX hybrid.",
    verdict:
      "Choose Dropset 3 when the week is mostly heavy lifting. Choose Metcon 9 when sessions mix lifts with conditioning. Choose neither if you need Nano/CXT run-hybrid or a heeled Olympic lifter.",
    winnerReason:
      "Dropset wins strength-day plant; Metcon wins mixed gym versatility.",
    keyDifferences: [
      {
        key: "strength-bias",
        label: "Strength vs mix",
        productImpacts: [
          { productId: "prod-nike-metcon-9", impact: "Broader mixed-gym platform" },
          { productId: "prod-adidas-dropset-3", impact: "More planted for heavy and machine work" },
        ],
        explanation:
          "Do not buy Dropset hoping it runs like a Nano. Do not buy Metcon hoping it feels as flat as The Total.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nike-metcon-9",
        reason: "Choose Metcon 9 for mixed gym weeks that still include rope, box, and light conditioning.",
      },
      {
        productId: "prod-adidas-dropset-3",
        reason: "Choose Dropset 3 when almost every session is strength and you want adidas’ planted gym last.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "reebok-nano-x4-vs-tyr-cxt-2": {
    summary:
      "Nano X4 is the daily HYROX hybrid most athletes already know. CXT-2 is TYR’s lighter, race-day-sharper update for run stations. Same sport — different week: Nano for gym-plus-prep, CXT-2 when race-run feel is the shopping trigger.",
    verdict:
      "Choose Nano X4 as the year-round HYROX trainer. Choose CXT-2 when race-day running stations matter more than Nano familiarity. Choose CXT-1 only on a discount; choose neither if you need a planted Metcon gym shoe with almost no running.",
    winnerReason:
      "Nano wins daily hybrid familiarity; CXT-2 wins race-run sharpness.",
    keyDifferences: [
      {
        key: "race-vs-daily",
        label: "Race vs daily HYROX",
        productImpacts: [
          { productId: "prod-reebok-nano-x4", impact: "Familiar daily hybrid for gym weeks and prep" },
          { productId: "prod-tyr-cxt-2", impact: "Sharper, lighter race-station run feel" },
        ],
        explanation:
          "CXT-2 is not a Nano clone with a different logo. If most of your week is gym, Nano is still the default.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-reebok-nano-x4",
        reason: "Choose Nano X4 if you want one hybrid for gym weeks and HYROX prep without a race-day specialist.",
      },
      {
        productId: "prod-tyr-cxt-2",
        reason: "Choose CXT-2 when the run legs on race day are why you are shopping, not the lifting blocks.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "nike-free-metcon-6-vs-reebok-nano-x4": {
    summary:
      "Free Metcon 6 is Nike’s flexible mobility/gym trainer — more give than Metcon 9, not a HYROX run hybrid. Nano X4 is the lift-to-run shoe. If your week is floor work and flexibility, Free Metcon; if you actually run between stations, Nano.",
    verdict:
      "Choose Free Metcon 6 for mobility, floor, and mixed gym days that barely run. Choose Nano X4 when HYROX running is weekly. Choose Metcon 9 instead if you want a firmer planted gym platform than Free Metcon.",
    winnerReason:
      "Free Metcon wins flexibility; Nano wins run-hybrid. They share a ‘trainer’ aisle and almost nothing else.",
    keyDifferences: [
      {
        key: "flex-vs-run",
        label: "Flexibility vs run hybrid",
        productImpacts: [
          { productId: "prod-nike-free-metcon-6", impact: "More flexible Free forefoot for floor and mobility" },
          { productId: "prod-reebok-nano-x4", impact: "Cushioned hybrid for lift-to-run sessions" },
        ],
        explanation:
          "Free Metcon is not a Nano with more flex. Running stations expose the Free forefoot; heavy lifting exposes Nano’s less-planted gym stance versus Metcon 9.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nike-free-metcon-6",
        reason: "Choose Free Metcon 6 if mobility and floor work dominate and you do not need a HYROX run shoe.",
      },
      {
        productId: "prod-reebok-nano-x4",
        reason: "Choose Nano X4 if run legs are part of the session, not a cooldown jog.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "adidas-dropset-3-vs-adidas-the-total": {
    summary:
      "Dropset 3 is adidas’ cushioned strength trainer for long gym sessions. The Total is the flatter, firmer adidas lifting shoe — closer to a powerlifting trainer than a Dropset. Same brand, two jobs: volume comfort versus flat pulls and presses.",
    verdict:
      "Choose Dropset 3 for volume and mixed strength days that still want some foam. Choose The Total when you want a flat, firm platform for heavy pulls and presses. Choose neither if you need a Metcon mixed-gym shoe or a heeled Olympic lifter.",
    winnerReason:
      "Dropset wins cushioned strength volume; The Total wins flat, firm lifting feel. Do not treat them as colourways of one shoe.",
    keyDifferences: [
      {
        key: "stack-feel",
        label: "Cushion vs flat",
        productImpacts: [
          { productId: "prod-adidas-dropset-3", impact: "More daily gym foam for long sessions" },
          { productId: "prod-adidas-the-total", impact: "Flatter, firmer strength platform" },
        ],
        explanation:
          "The Total is the adidas answer when Dropset still feels too much like a trainer. Dropset is the answer when The Total beats you up on high-rep days.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-adidas-dropset-3",
        reason: "Choose Dropset 3 for long strength sessions that still want some cushion.",
      },
      {
        productId: "prod-adidas-the-total",
        reason: "Choose The Total when you want a flat, firm shoe for heavy pulls and presses.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "nike-romaleos-5-vs-adidas-adipower-3": {
    summary:
      "Romaleos 5 and Adipower Weightlifting 3 are the same job class: dedicated weightlifting shoes, both catalogued at maximum stability, very-high lifting suitability, and very-low running suitability. The fork is planted Olympic geometry versus midfoot lockdown. Romaleos is the squat-depth, rock-solid platform for squats, cleans, and Olympic lifts, and the catalog still lists intermediate alongside advanced and elite. Adipower is the competition-ready heel with secure lockdown for heavy lifts, aimed at advanced and elite only. Heel millimetres, weight, and toe-box width are not published here — do not invent them. Neither shoe is a Metcon, Nano, or walking trainer.",
    verdict:
      "Buy Romaleos 5 when squat depth and a planted Olympic platform are the reason you left the trainer aisle, including if you are still intermediate but already committed to a dedicated lifter. Buy Adipower 3 when midfoot lockdown under a heavy squat or pull is the shopping trigger and you are already in the advanced/elite lane. Buy neither if any weekly block still needs running, HYROX, or mixed metcons — that is a trainer. Closest third: Reebok Legacy Lifter III if you want a weightlifting shoe that also bridges CrossFit-style sessions instead of a single-purpose competition last.",
    winnerReason:
      "Romaleos wins the planted Olympic platform and squat-depth brief; Adipower wins lockdown on a competition-ready heel. Same dedicated-lifter aisle, different fit trigger — not a preference tie.",
    criteria: [
      { key: "platform", label: "Planted Olympic platform", winnerProductId: "prod-nike-romaleos-5" },
      { key: "lockdown", label: "Midfoot lockdown", winnerProductId: "prod-adidas-adipower-3" },
      { key: "audience", label: "Who the catalog targets", winnerProductId: "prod-nike-romaleos-5" },
      { key: "run-versatility", label: "Run / metcon / walk versatility" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-olympic-lifting",
        productId: "prod-nike-romaleos-5",
        rationale:
          "Romaleos is the catalog Olympic last: raised heel for squat depth and a rock-solid platform for cleans and Olympic lifts, not a hybrid trainer.",
      },
      {
        useCaseId: "uc-powerlifting",
        productId: "prod-adidas-adipower-3",
        rationale:
          "Adipower is the lockdown pick when heavy squat and pull sessions need a competition-ready heel more than Nike’s planted last.",
      },
    ],
    keyDifferences: [
      {
        key: "platform-vs-lockdown",
        label: "Platform vs lockdown",
        productImpacts: [
          { productId: "prod-nike-romaleos-5", impact: "Raised heel for squat depth + rock-solid platform" },
          { productId: "prod-adidas-adipower-3", impact: "Secure lockdown for heavy lifts + competition-ready heel" },
        ],
        explanation:
          "Both are maximum-stability dedicated lifters. Romaleos is the planted Olympic geometry. Adipower is the midfoot wrap. Catalog does not publish heel height in millimetres or shoe weight, so do not treat marketing ‘lift’ language as a measured stack fight.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "who-its-for",
        label: "Experience targeting",
        productImpacts: [
          { productId: "prod-nike-romaleos-5", impact: "Intermediate through elite" },
          { productId: "prod-adidas-adipower-3", impact: "Advanced and elite only" },
        ],
        explanation:
          "If you are still building toward competition and need a dedicated heel, Romaleos is the catalog’s more inclusive last. Adipower assumes you already know you want a competition lockdown shoe.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "not-a-trainer",
        label: "What both refuse",
        productImpacts: [
          { productId: "prod-nike-romaleos-5", impact: "Unsuitable for running or metcons" },
          { productId: "prod-adidas-adipower-3", impact: "Single-purpose lifting shoe" },
        ],
        explanation:
          "Running suitability is very-low on both. If you walk the gym floor, do conditioning, or mix metcons, leave this page and shop Metcon 9 or Nano X4.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-nike-romaleos-5",
        reason:
          "Choose Romaleos 5 if squat depth and a rock-solid Olympic platform are why you are buying a dedicated lifter, not because the other shoe ‘looks similar.’",
      },
      {
        productId: "prod-adidas-adipower-3",
        reason:
          "Choose Adipower 3 if secure midfoot lockdown under heavy loads is the non-negotiable and you already sit in the advanced/elite lane.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "adidas-powerlift-5-vs-nike-romaleos-5": {
    summary:
      "Powerlift 5 versus Romaleos 5 is an accessible gym heel versus a premium maximum-stability Olympic platform — not two colourways of one competition shoe. Powerlift is catalogued very-stable (not maximum), with beginner-strength plus powerlifting and Olympic-lift practice, valueScore 88, and a list band near €120. Romaleos is maximum stability, rock-solid platform, raised heel for squat depth, intermediate-to-elite, valueScore 70, Amazon NL offer listed at €200. Powerlift’s second strength is secure midfoot lockdown; Romaleos does not lead on that trait. Heel millimetres and mass are unpublished — the documented split is stability class, use-case breadth, and spend, not a guessed wedge height.",
    verdict:
      "Buy Powerlift 5 if you want a raised-heel shoe for gym squats, presses, and Olympic practice without paying competition-platform money, and catalog very-stable is enough. Buy Romaleos 5 when maximum stability and a planted Olympic last are the shopping trigger. Buy neither if you need mixed-gym work (Metcon 9) or a flat strength trainer (The Total). Closest cheaper dedicated heels: Nike Savaleos or Do-Win Classic. If you wanted Adipower-style lockdown at competition spend, that is the other Romaleos page, not this one.",
    winnerReason:
      "Powerlift wins accessible raised-heel gym strength and value; Romaleos wins maximum-stability Olympic platform. Do not treat Powerlift as a discount Romaleos.",
    criteria: [
      { key: "value", label: "Accessible spend / valueScore", winnerProductId: "prod-adidas-powerlift-5" },
      { key: "stability-class", label: "Catalog stability class", winnerProductId: "prod-nike-romaleos-5" },
      { key: "beginner-strength", label: "Beginner-strength + presses", winnerProductId: "prod-adidas-powerlift-5" },
      { key: "olympic-platform", label: "Competition Olympic platform", winnerProductId: "prod-nike-romaleos-5" },
    ],
    recommendationsByUseCase: [
      {
        useCaseId: "uc-beginner-strength",
        productId: "prod-adidas-powerlift-5",
        rationale:
          "Powerlift is the catalog entry into a raised-heel lifter for gym strength and Olympic practice without the Romaleos spend.",
      },
      {
        useCaseId: "uc-olympic-lifting",
        productId: "prod-nike-romaleos-5",
        rationale:
          "Romaleos is the premium planted platform when Olympic lifting is the job and maximum stability is the requirement.",
      },
    ],
    keyDifferences: [
      {
        key: "stability-and-spend",
        label: "Stability class and spend",
        productImpacts: [
          { productId: "prod-adidas-powerlift-5", impact: "Very-stable, valueScore 88, ~€120 catalog list" },
          { productId: "prod-nike-romaleos-5", impact: "Maximum stability, valueScore 70, ~€200 offer band" },
        ],
        explanation:
          "Powerlift is not ‘Romaleos with a lower sticker.’ Very-stable versus maximum is a catalog class change. Verify live street price in offers; the value story is the role, not a frozen MSRP.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "session-mix",
        label: "Session mix",
        productImpacts: [
          { productId: "prod-adidas-powerlift-5", impact: "Squats, presses, Olympic-lift practice, beginner-strength" },
          { productId: "prod-nike-romaleos-5", impact: "Squats, cleans, Olympic lifts on a rock-solid platform" },
        ],
        explanation:
          "Powerlift’s brief includes presses and practice. Romaleos is the competition-oriented Olympic platform. Both refuse conditioning runs / metcons.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        key: "not-a-trainer",
        label: "What both refuse",
        productImpacts: [
          { productId: "prod-adidas-powerlift-5", impact: "Not for conditioning runs; running suitability very-low" },
          { productId: "prod-nike-romaleos-5", impact: "Unsuitable for running or metcons; running suitability very-low" },
        ],
        explanation:
          "A raised heel does not make either shoe a walking or HYROX trainer. Mixed gym days belong on Metcon 9, not on this pair.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-adidas-powerlift-5",
        reason:
          "Choose Powerlift 5 for a raised-heel gym shoe you can actually start on — squats, presses, practice — without the Romaleos competition spend.",
      },
      {
        productId: "prod-nike-romaleos-5",
        reason:
          "Choose Romaleos 5 when you need the maximum-stability planted Olympic platform and you already know a cheaper very-stable heel is not enough.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "tyr-cxt-1-vs-tyr-cxt-2": {
    summary:
      "CXT-1 versus CXT-2 is a TYR generation split, not a Nano comparison. CXT-2 is the current race-oriented hybrid; CXT-1 is the prior platform you buy on a discount, not as a different sport. Same family, updated race-run bias.",
    verdict:
      "Choose CXT-2 if you are buying TYR hybrid new for HYROX race-run feel. Choose CXT-1 only when the discount is the point and you accept the older platform. Choose Nano X4 if you want the more common daily hybrid instead of TYR’s race-day sharpness.",
    winnerReason:
      "CXT-2 is the current TYR hybrid; CXT-1 is previous-gen value. This is not ‘which TYR colourway.’",
    keyDifferences: [
      {
        key: "generation",
        label: "Generation",
        productImpacts: [
          { productId: "prod-tyr-cxt-1", impact: "First-gen CXT — buy on discount" },
          { productId: "prod-tyr-cxt-2", impact: "Current race-oriented update" },
        ],
        explanation:
          "Do not pay CXT-2 money for CXT-1. Do not expect CXT-1 to feel like CXT-2 on race-run stations.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-tyr-cxt-2",
        reason: "Choose CXT-2 as the current TYR HYROX hybrid when race-run feel is why you are in this family.",
      },
      {
        productId: "prod-tyr-cxt-1",
        reason: "Choose CXT-1 only when discounted and you already like the first-gen CXT platform.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
  "rogue-echo-bike-vs-assaultbike-elite": {
    summary:
      "Echo Bike is Rogue’s dual-action air bike — widely available, simple, brutal. AssaultBike Elite is the Assault Fitness lineage with a more modern console. Same fan-bike stimulus class; the fork is Rogue availability/value versus Assault’s monitor/ecosystem, not which brand ‘feels harder.’",
    verdict:
      "Choose Echo when you want a proven dual-action bike you can actually buy and service in a garage. Choose AssaultBike Elite when you want Assault’s console and you accept availability/price. Choose BikeErg instead if you want PM5 standardised metrics rather than a fan bike.",
    winnerReason:
      "Echo wins garage availability and value; Assault Elite wins console lineage. Fan stimulus is not the differentiator.",
    keyDifferences: [
      {
        key: "console-availability",
        label: "Console vs availability",
        productImpacts: [
          { productId: "prod-rogue-echo-bike", impact: "Simple, widely stocked dual-action fan bike" },
          { productId: "prod-assault-elite", impact: "Assault console/lineage for HIIT spaces that want that monitor" },
        ],
        explanation:
          "Both punish with dual-action air. Shop monitor, parts, and street price — not marketing ‘elite’ labels.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    chooseProductReasons: [
      {
        productId: "prod-rogue-echo-bike",
        reason: "Choose Echo Bike for a garage dual-action bike you can source and replace parts for.",
      },
      {
        productId: "prod-assault-elite",
        reason: "Choose AssaultBike Elite when the Assault console is the reason you are not buying an Echo.",
      },
    ],
    evidenceIds: ["ev-catalog-editorial"],
  },
};

export function applyComparisonP41Completion(
  comparisons: Comparison[],
): Comparison[] {
  const broken = new Set<string>(COMPARISON_BROKEN_PEER_SLUGS);
  return comparisons.map((cmp) => {
    if (broken.has(cmp.slug)) {
      return {
        ...cmp,
        status: "draft",
        noindex: true,
      };
    }
    const patch = P41_UNIQUE[cmp.slug];
    if (!patch) return cmp;
    return {
      ...cmp,
      ...patch,
      evidenceIds: [
        ...new Set([
          ...(cmp.evidenceIds ?? []),
          ...(patch.evidenceIds ?? []),
          "ev-catalog-editorial",
        ]),
      ],
    };
  });
}
