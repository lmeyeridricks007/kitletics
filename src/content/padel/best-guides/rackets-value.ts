/**
 * Best Value Padel Rackets — re-evaluated against published catalog winners with authentic media.
 * Do not preserve old “value” badges on professional diamonds (e.g. Coello Pro).
 */
import type { BestGuide } from "@/domain/editorial/types";
import {
  considered,
  pick,
  racketGuide,
  RACKET_RELATED,
} from "@/content/padel/best-guides/build";

export const padelRacketsValueGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-value",
  slug: "padel-rackets-value",
  title: "Best Value Padel Rackets",
  subtitle: "Street-price forgiveness and soft rounds — not downsized Pro Line diamonds",
  shortDescription:
    "Value-oriented published rackets with authentic media: Kuikma PR Comfort Soft, Indiga CTR, Equation Soft, Match Light, PR Hybrid Carbon.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-beginner", "uc-padel-arm-comfort"],
  intent:
    "value padel rackets whose published job is accessible street price with authentic heroes — soft/round or light entry frames, not professional diamonds with friendly paint",
  intro:
    "Value means a published racket you can learn and play with without Pro Line street prices — not a professional diamond with an old “bargain” badge. From the current catalog we award Kuikma PR Comfort Soft as the value soft round, Bullpadel Indiga CTR as the named beginner round that still undercuts Vertex/Hack money, Nox Equation Soft as the soft Advanced on-ramp, Adidas Match Light as the light Adidas entry, and Kuikma PR Hybrid Carbon as the value hybrid step-up. Coello Pro, Hack 04, and Metalbone 3.5 were considered and rejected as value winners. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Authentic media and a learnable mould first. Then street-price positioning versus Pro Line. Soft cores and round/hybrid forgiveness beat unfinished smash geometry. Previous-generation clearance can be labelled — it does not automatically win.",
  criteriaChangePoints: [
    {
      label: "Value ≠ light diamond",
      explanation: "Professional attack frames do not win value awards because a shop called them approachable.",
    },
    {
      label: "Photo-blocked drafts out",
      explanation: "PR Soft 500 cannot take Comfort Soft’s award.",
    },
  ],
  quickTake: [
    "PR Comfort Soft for the value soft round with authentic photography.",
    "Indiga CTR for Bullpadel’s named beginner round without Vertex money.",
    "Equation Soft for Nox soft Advanced without Genius pricing.",
    "Match Light for Adidas entry instead of Metalbone.",
    "PR Hybrid Carbon when you outgrow Comfort Soft on a budget.",
  ],
  decisionShortcuts: [
    { need: "Value soft round", productId: "prod-kuikma-pr-comfort-soft", reason: "PR Comfort Soft." },
    { need: "Named Bullpadel beginner", productId: "prod-bullpadel-indiga-ctr", reason: "Indiga CTR." },
    { need: "Nox soft on-ramp", productId: "prod-nox-equation-soft-2026", reason: "Equation Soft." },
    { need: "Light Adidas entry", productId: "prod-adidas-match-light", reason: "Match Light." },
    { need: "Value hybrid step-up", productId: "prod-kuikma-pr-hybrid-carbon", reason: "PR Hybrid Carbon." },
  ],
  recommendations: [
    pick({
      productId: "prod-kuikma-pr-comfort-soft",
      rank: 1,
      awardType: "best-value",
      role: "Value soft round",
      summary: "Kuikma PR Comfort Soft — published soft round with authentic hero.",
      whyWon:
        "Comfort Soft is the clearest value racket in this catalog: soft-round job, authentic photography, and Decathlon-path pricing. PR Soft 500 is photo-blocked and cannot win. Indiga is the Bullpadel alternative at typically higher street price.",
      whyFits: [
        "I’d shortlist Comfort Soft when budget and arm-friendly contact matter more than Pro Line carbon.",
        "I’d skip it once you need a hybrid step-up — that is PR Hybrid Carbon or Ionic Light.",
      ],
      bestFor: ["Budget soft round", "First contact on a value path", "Replaceable club frames"],
      tradeoff: "Lower finishing ceiling than Vertex / Hack — that is why it is value.",
      avoid: ["Advanced attackers", "Photo-blocked PR Soft 500 shoppers"],
      instead: [
        { productId: "prod-bullpadel-indiga-ctr", when: "you want Bullpadel’s named beginner round", label: "Indiga CTR" },
        { productId: "prod-kuikma-pr-hybrid-carbon", when: "you outgrew the soft round", label: "PR Hybrid Carbon" },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-arm-comfort"],
    }),
    pick({
      productId: "prod-bullpadel-indiga-ctr",
      rank: 2,
      awardType: "editors-pick",
      role: "Named beginner round under Pro Line money",
      summary: "Indiga CTR — round SoftEva Tour beginner that still beats Vertex street prices.",
      whyWon:
        "Indiga is not the cheapest SKU, but it is the honest Bullpadel value-vs-Pro-Line fork: SoftEva round forgiveness without buying Vertex 05 or Hack 04.",
      whyFits: [
        "I’d pick Indiga when I want Bullpadel’s development pathway without flagship carbon pricing.",
        "I’d skip it if Comfort Soft already covers budget and I do not need Bullpadel Tour identity.",
      ],
      bestFor: ["Bullpadel beginner value", "Round SoftEva without Vertex spend"],
      tradeoff: "Usually above Kuikma street price.",
      avoid: ["Players forcing Indiga as a smash diamond substitute"],
      instead: [
        { productId: "prod-kuikma-pr-comfort-soft", when: "pure budget soft round is enough", label: "PR Comfort Soft" },
        { productId: "prod-bullpadel-ionic-light", when: "you already outgrew Indiga", label: "Ionic Light" },
      ],
      useCaseIds: ["uc-padel-beginner"],
    }),
    pick({
      productId: "prod-nox-equation-soft-2026",
      rank: 3,
      awardType: "editors-pick",
      badge: "Best Nox soft value on-ramp",
      role: "Nox soft Advanced value on-ramp",
      summary: "Equation Soft — soft Advanced Nox without Genius / Attack pricing.",
      whyWon:
        "Equation Soft keeps Nox players off AT10 Genius 12K/18K spend while still offering a published soft Advanced mould with authentic media.",
      whyFits: [
        "I’d shortlist Equation Soft when I want Nox feel without Tapia mould money.",
        "I’d skip it if Kuikma Comfort Soft is enough and brand does not matter.",
      ],
      bestFor: ["Nox soft on-ramp", "Value versus Genius carbon"],
      tradeoff: "Not as explicitly first-week as Indiga; still more than a toy.",
      avoid: ["Players who already need AT10 Genius Attack"],
      instead: [
        { productId: "prod-kuikma-pr-comfort-soft", when: "you want cheaper soft round value", label: "PR Comfort Soft" },
        { productId: "prod-nox-ml10-pro-cup", when: "control cup is already the job", label: "ML10 Pro Cup" },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-arm-comfort"],
    }),
    pick({
      productId: "prod-adidas-match-light",
      rank: 4,
      awardType: "best-lightweight",
      role: "Light Adidas entry value",
      summary: "Match Light — Adidas on-ramp instead of Metalbone spend.",
      whyWon:
        "Value for Adidas-system beginners is Match Light, not a discounted Metalbone 3.5 story. Authentic entry media; professional diamonds stay out.",
      whyFits: [
        "I’d pick Match Light when Adidas branding matters and Metalbone would be a joke for the week.",
        "I’d skip it if Indiga’s round forgiveness is the real need.",
      ],
      bestFor: ["Adidas entry value", "Light on-ramp vs Metalbone"],
      tradeoff: "Less centred than Indiga’s round SoftEva.",
      avoid: ["Anyone treating this as a Metalbone substitute"],
      instead: [
        { productId: "prod-bullpadel-indiga-ctr", when: "you need maximum round forgiveness", label: "Indiga CTR" },
        { productId: "prod-kuikma-pr-comfort-soft", when: "you want the softest value round", label: "PR Comfort Soft" },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-maneuverability"],
    }),
    pick({
      productId: "prod-kuikma-pr-hybrid-carbon",
      rank: 5,
      badge: "Best value hybrid step-up",
      role: "Value hybrid after Comfort Soft",
      summary: "Kuikma PR Hybrid Carbon — published hybrid carbon step-up on a budget.",
      whyWon:
        "Value does not stop at beginner rounds. PR Hybrid Carbon is the published Kuikma hybrid step with authentic hero — not photo-blocked Soft 500 and not Ionic Light’s Next-line price.",
      whyFits: [
        "I’d shortlist Hybrid Carbon when Comfort Soft’s ceiling showed up but Pro Line still feels expensive.",
        "I’d skip it if I wanted Bullpadel Ionic Light’s named pathway instead.",
      ],
      bestFor: ["Value intermediate hybrid", "Step-up from Comfort Soft"],
      tradeoff: "Less prestige construction than Ionic / Vertex Advance.",
      avoid: ["Brand-new players who still need Comfort Soft or Indiga"],
      instead: [
        { productId: "prod-kuikma-pr-comfort-soft", when: "you still need the soft round", label: "PR Comfort Soft" },
        { productId: "prod-bullpadel-ionic-light", when: "you want Bullpadel’s hybrid step-up", label: "Ionic Light" },
      ],
      useCaseIds: ["uc-padel-balanced"],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-kuikma-pr-soft-500",
      "Photo-blocked. Comfort Soft is the published Kuikma value round.",
      "rejected",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-kuikma-pr-comfort-soft" },
    ),
    considered(
      "prod-head-coello-pro",
      "Professional Coello diamond — rejected as a value toy.",
      "rejected",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-adidas-match-light" },
    ),
    considered(
      "prod-bullpadel-hack-04",
      "Pro Line attack diamond — rejected from value awards.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-adidas-metalbone-3-5-2026",
      "Current Metalbone attack — rejected from value awards.",
      "rejected",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-adidas-match-light" },
    ),
    considered(
      "prod-bullpadel-ionic-light",
      "Next-line hybrid — shortlisted as the Bullpadel step-up above Indiga; usually above Kuikma Hybrid street price.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-kuikma-pr-hybrid-carbon" },
    ),
    considered(
      "prod-head-one-ultralight",
      "Genuine light specialist — shortlisted; lives primarily on the lightweight guide.",
      "shortlisted",
      { reasonCode: "niche", closestRecommendedProductId: "prod-adidas-match-light" },
    ),
    considered(
      "prod-bullpadel-hack-04-comfort",
      "Comfort face inside Hack geometry — shortlisted; not a value soft round.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-kuikma-pr-comfort-soft" },
    ),
  ],
  comparisonProductIds: [
    "prod-kuikma-pr-comfort-soft",
    "prod-bullpadel-indiga-ctr",
    "prod-nox-equation-soft-2026",
    "prod-adidas-match-light",
    "prod-kuikma-pr-hybrid-carbon",
  ],
  buyingAdvice:
    "Buy the soft/round or light entry you will actually rally with. Do not buy Coello Pro or Metalbone because an old page called them value. When the soft round’s ceiling is obvious in matches, step to PR Hybrid Carbon or Ionic Light — not straight to 18K.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/kuikma-pr-comfort-soft-hero.jpg",
  hubImageAlt: "Kuikma PR Comfort Soft — value padel racket",
});
