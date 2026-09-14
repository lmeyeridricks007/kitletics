import type { BestGuide } from "@/domain/editorial/types";
import {
  PADEL_SPORT,
  baseGuide,
  bagCriteria,
  considered,
  gripCriteria,
  method,
  pick,
} from "@/content/padel/best-guides/build";

export const padelOvergripsGuide: BestGuide = baseGuide({
  id: "best-padel-overgrips",
  slug: "padel-overgrips",
  title: "Best Padel Overgrips",
  subtitle: "Thin tack versus absorption — not a replacement grip and not Hesacore",
  shortDescription:
    "Two published overgrips with distinct jobs. Comfort sleeves and draft products do not win.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-grips",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intentionallyNarrow: true,
  relatedBuyingGuideIds: [
    "guide-padel-grips",
    "guide-padel-grip-vs-overgrip",
    "guide-how-often-replace-padel-overgrip",
  ],
  ...method(
    "published padel overgrips whose job is a wrap over the base grip — thin tack versus absorption — not replacement grips or draft comfort sleeves",
  ),
  intro:
    "An overgrip is a thin wrap you replace often. It is not a replacement grip and it is not a shaped comfort sleeve. We awarded published products with authentic packshots and opposite jobs: Wilson Pro Padel Overgrip for thin tack, Bullpadel HaC for absorption, and Nox Pro as a padel-native absorbent alternative. Hesacore is a cushion system — considered, not ranked as an overgrip. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Grip type first: overgrip versus replacement versus sleeve. Then tack versus absorption. Thickness should stay thin enough that you do not jump a grip size. We do not invent sweat-hour lab results.",
  selectionCriteria: gripCriteria,
  whatWeLookFor: [
    {
      key: "type",
      label: "Overgrip job",
      whyItMatters: "If it is a sleeve or replacement grip, it is a different product.",
      importance: "high",
    },
    {
      key: "tack",
      label: "Tack vs absorption",
      whyItMatters: "Thin tack for feel; absorbent wraps when sweat kills tack mid-set.",
      importance: "high",
    },
    {
      key: "photo",
      label: "Authentic packshot",
      whyItMatters: "Draft products without a real packshot cannot win.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Overgrip only",
      explanation: "Hesacore-type sleeves are a different job and currently unpublished.",
    },
    {
      label: "Intentionally two",
      explanation: "The catalog supports tack versus absorption. It does not support a fake third winner.",
    },
  ],
  quickTake: [
    "Choose Wilson Pro if you want a thin, lightly tacky padel-length overgrip as the default wrap.",
    "Choose Bullpadel HaC if Wilson feels slippery and you need absorption first.",
  ],
  decisionShortcuts: [
    { need: "Thin tack default", productId: "prod-wilson-overgrip", reason: "Wilson Pro Padel Overgrip." },
    { need: "Absorption first", productId: "prod-bullpadel-gb1200", reason: "Bullpadel HaC." },
  ],
  recommendations: [
    pick({
      productId: "prod-wilson-overgrip",
      rank: 1,
      awardType: "best-overall",
      role: "Thin tack default",
      summary: "Wilson Pro Padel Overgrip — thin stretch felt, lightly tacky 3-pack.",
      whyWon:
        "Wilson Pro is the default overgrip because it is a published padel-length wrap with a thin, lightly tacky job and an authentic packshot. HaC wins absorption. Hesacore cannot win.",
      whyFits: [
        "Thin enough that it does not jump a grip size. Replace it when tack dies — that is the product, not a seasonal event.",
        "I'd wrap this as the default. I'd switch to HaC when sweat kills this wrap mid-set.",
      ],
      bestFor: ["Default thin overgrip", "Feel and tack", "Padel-length wrap"],
      tradeoff: "Not the driest option for heavy sweat — that is HaC’s job.",
      avoid: ["Players who need a shaped comfort sleeve (Hesacore is unpublished)", "Replacement-grip shoppers"],
      instead: [
        { productId: "prod-bullpadel-gb1200", when: "sweat kills tack and you need absorption", label: "Bullpadel HaC" },
      ],
    }),
    pick({
      productId: "prod-bullpadel-gb1200",
      rank: 2,
      awardType: "editors-pick",
      role: "Absorption wrap",
      summary: "Bullpadel HaC — thin absorbent padel overgrip.",
      whyWon:
        "HaC is the absorption award: a padel-native thin wrap when Wilson Pro goes slippery. It does not replace Wilson as the default tack wrap.",
      whyFits: [
        "Absorption-first overgrip with an authentic HaC packshot. Use it when tack is not the problem — moisture is.",
        "I'd pick this mid-summer or if Wilson feels like soap. I'd skip it if you wanted maximum tacky feel.",
      ],
      bestFor: ["Sweat / absorption", "Padel-native wrap"],
      tradeoff: "Less of a tack-first story than Wilson Pro.",
      avoid: ["Players who want Wilson’s tack as the whole point"],
      instead: [
        { productId: "prod-wilson-overgrip", when: "you want thin tack as the default", label: "Wilson Pro" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-hesacore-padel",
      "Comfort sleeve / ergonomic cushion system — not an overgrip. Different job; see Hesacore Gel/Pro/W as related systems.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-nox-pro-overgrip",
      "Padel-native absorbent 3-pack with authentic packshot — shortlisted as HaC alternative, not a third award to avoid duplicating absorption.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
    considered(
      "prod-head-xtreme-soft",
      "Soft tacky wrap with packshot — overlaps Wilson’s thin-tack job.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-wilson-overgrip" },
    ),
    considered(
      "prod-babolat-pro-response",
      "Babolat Pro Response — shortlisted for dry/tack feel once stocked as a ready alternative to Wilson.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-wilson-overgrip" },
    ),
    considered(
      "prod-kuikma-overgrip",
      "Kuikma value overgrip — shortlisted for multipack price-per-grip buyers.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
    considered(
      "prod-tourna-grip-xl",
      "Tourna Grip XL absorbent classic — shortlisted; packs remain offers of one product.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
    considered(
      "prod-tourna-mega-tac",
      "Tourna Mega Tac — distinct tacky sibling; shortlisted vs Wilson thin-tack lane.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-wilson-overgrip" },
    ),
    considered(
      "prod-hesacore-gel",
      "Hesacore Gel — ergonomic system, not overgrip; rejected from this guide.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
  ],
  comparisonProductIds: ["prod-wilson-overgrip", "prod-bullpadel-gb1200"],
  buyingAdvice:
    "Replace overgrips often. If you need a thicker handle, that is a replacement grip or a sleeve — different products. Hesacore Tour/Gel/Pro/W stay in the ergonomic system lane, not this overgrip ranking.",
  relatedGuideIds: [
    "best-padel-overgrips-sweaty",
    "best-padel-tacky-overgrips",
    "best-padel-dry-feel-overgrips",
    "best-padel-value-overgrips",
    "best-padel-ergonomic-grips",
    "best-padel-bags",
  ],
  hubImageSrc: "/images/padel/guides/grips.jpg",
  hubImageAlt: "Padel overgrips — tack versus absorption",
});

export const padelBagsGuide: BestGuide = baseGuide({
  id: "best-padel-bags",
  slug: "padel-bags",
  title: "Best Padel Bags",
  subtitle: "Club paletero, tournament volume, and a day backpack — three carry jobs",
  shortDescription:
    "Bags by job: 42 L thermo paletero, 62 L tournament duffel, commute backpack. Not a ranked top-10 of identical paleteros.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-bags",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  relatedBuyingGuideIds: ["guide-choose-padel-bag", "guide-complete-padel-gear-checklist"],
  ...method(
    "published padel bags whose form, litre count, and thermo/shoe features define a distinct carry job — not duplicate paleteros",
  ),
  intro:
    "A padel bag is a carry job. A 42 L paletero with thermo is not a 62 L tournament duffel, and neither is a commute backpack. We awarded Nox AT10 Team (42 L, ThermoTech plus shoes) as the club paletero, Babolat RH Pro (62 L / four rackets) and Nox AT10 XXL (90 L) as tournament volume options, Bullpadel Vertex Geo as the thermo commute backpack, and Tecnifibre Tour Endurance as the day backpack with a shoe well. Nox Thermo Bag 10 stays out — collection URL, unknown dimensions. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Form first (paletero vs backpack), then published capacity and racket count, then thermo and a shoe compartment. Unknown-spec collection listings cannot win.",
  selectionCriteria: bagCriteria,
  whatWeLookFor: [
    {
      key: "job",
      label: "Carry job",
      whyItMatters: "Club night, tournament weekend, and commute are three products.",
      importance: "high",
    },
    {
      key: "thermo",
      label: "Thermo pocket",
      whyItMatters: "Frames cook in a hot car. Thermo is a real feature when the manufacturer lists it.",
      importance: "high",
    },
    {
      key: "shoes",
      label: "Shoe isolation",
      whyItMatters: "Sand-filled turf grit should not live on your clothes.",
      importance: "medium",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Distinct jobs only",
      explanation: "We do not rank three similar paleteros. Each pick must own a carry job.",
    },
  ],
  quickTake: [
    "Choose AT10 Team if you want a 42 L club paletero with thermo and a shoe slot.",
    "Choose RH Pro if you need 62 L / four-racket tournament volume.",
    "Choose Tour Endurance if you want a day backpack with a shoe well, not a paletero.",
  ],
  decisionShortcuts: [
    { need: "Club paletero with thermo", productId: "prod-nox-at10-team-bag", reason: "AT10 Team 42 L." },
    { need: "Tournament volume", productId: "prod-babolat-rh-pro-padel", reason: "RH Pro 62 L." },
    { need: "Day backpack", productId: "prod-tecnifibre-tour-endurance-backpack", reason: "Tour Endurance backpack." },
  ],
  recommendations: [
    pick({
      productId: "prod-nox-at10-team-bag",
      rank: 1,
      awardType: "best-overall",
      role: "Club paletero",
      summary: "Nox AT10 Team — 42 L, three + two thermo, shoe vent, backpack straps.",
      whyWon:
        "AT10 Team is the club paletero: published 42 L, ThermoTech for the frames you play, ventilated shoes, removable backpack straps. RH Pro is bigger on purpose. The backpack is a different form.",
      whyFits: [
        "42 L is enough for club night without becoming a 62 L travel duffel. Thermo is listed, not guessed.",
        "I'd take this as the default Nox match bag. I'd skip it if you pack four frames for a weekend — that is RH Pro.",
      ],
      bestFor: ["Club paletero", "Thermo plus shoes", "Backpack-strap nights"],
      tradeoff: "Not a 4+ racket travel duffel.",
      avoid: ["Players who need RH Pro volume", "Collection-only Thermo Bag 10 as a spec-complete award"],
      instead: [
        { productId: "prod-babolat-rh-pro-padel", when: "you need 62 L / four-racket tournament volume", label: "RH Pro" },
        { productId: "prod-tecnifibre-tour-endurance-backpack", when: "you want a commute backpack, not a paletero", label: "Tour Endurance" },
      ],
    }),
    pick({
      productId: "prod-babolat-rh-pro-padel",
      rank: 2,
      awardType: "best-premium",
      role: "Tournament volume",
      summary: "Babolat RH Pro — 62 L, four rackets, insulated pocket, shoe pocket.",
      whyWon:
        "RH Pro wins tournament volume. It is overkill for a two-racket club night — that is the Team paletero or a backpack.",
      whyFits: [
        "Published 62 L and four-racket capacity with an insulated compartment. Weekend-bag energy.",
        "I'd pack this for a tournament. I'd skip it for a bike commute — that is the backpack.",
      ],
      bestFor: ["Tournament weekends", "Four-racket capacity", "Insulated plus shoes"],
      tradeoff: "Large for commute and club-night minimalism.",
      avoid: ["Players who only carry two frames to the club"],
      instead: [
        { productId: "prod-nox-at10-team-bag", when: "you want a 42 L club paletero", label: "AT10 Team" },
        { productId: "prod-tecnifibre-tour-endurance-backpack", when: "you commute with a backpack", label: "Tour Endurance" },
      ],
    }),
    pick({
      productId: "prod-tecnifibre-tour-endurance-backpack",
      rank: 3,
      awardType: "editors-pick",
      role: "Day backpack",
      summary: "Tecnifibre Tour Endurance backpack — shoe well, not a paletero.",
      whyWon:
        "The backpack job is distinct. Exact racket count is unknown without a full PDP — we still award the form because the authentic packshot and shoe well exist, and we do not pretend it is a 10-racket thermo.",
      whyFits: [
        "Day bag with a visible shoe well. Do not confuse it with a Tecnifibre court shoe — that was a catalog mix-up on the packshot path.",
        "I'd use this for commute. I'd skip it if you need thermo for two match frames — that is AT10 Team.",
      ],
      bestFor: ["Commute backpack", "Shoe well without a paletero"],
      tradeoff: "Exact racket count unpublished; no listed thermo.",
      extraTradeoffs: ["Not a tournament 62 L duffel."],
      avoid: ["Players who need listed thermo and racket counts"],
      instead: [
        { productId: "prod-nox-at10-team-bag", when: "you need listed thermo and 42 L paletero specs", label: "AT10 Team" },
        { productId: "prod-babolat-rh-pro-padel", when: "you need tournament volume", label: "RH Pro" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-nox-bag-10",
      "Thermo Bag 10 seed: collection URL, unknown dimensions. Cannot win.",
      "rejected",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-nox-at10-team-bag" },
    ),
    considered(
      "prod-bullpadel-vertex-backpack",
      "Vertex Geo backpack now has authentic packshot — shortlisted as the thermo commute backpack alternative to Tour Endurance.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-tecnifibre-tour-endurance-backpack" },
    ),
    considered(
      "prod-nox-at10-xxl-bag",
      "90 L tournament XXL — shortlisted as RH Pro alternative for maximum volume.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-babolat-rh-pro-padel" },
    ),
    considered(
      "prod-wilson-super-tour-padel",
      "Bela Super Tour tournament paletero — shortlisted alongside RH Pro / XXL volume jobs.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-babolat-rh-pro-padel" },
    ),
    considered(
      "prod-nox-at10-competition-trolley",
      "AT10 Competition Trolley — shortlisted for wheeled tournament carry.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-nox-at10-xxl-bag" },
    ),
    considered(
      "prod-bullpadel-hack-bpp26012",
      "Hack 2026 paletero — shortlisted signature collection bag once media ready.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-nox-at10-team-bag" },
    ),
    considered(
      "prod-bullpadel-hack-bpm26002",
      "Hack 2026 backpack — shortlisted commute alternative in the Hack family.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-tecnifibre-tour-endurance-backpack" },
    ),
    considered(
      "prod-head-tour-backpack-25l",
      "HEAD Tour 25L 2026 backpack — shortlisted compact commute job.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-tecnifibre-tour-endurance-backpack" },
    ),
    considered(
      "prod-wilson-bela-backpack",
      "Bela backpack sibling to Super Tour — shortlisted compact Bela lane.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-tecnifibre-tour-endurance-backpack" },
    ),
    considered(
      "prod-nox-pro-series-bag",
      "Pro Series paletero — shortlisted mid bag; colors stay variants.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-nox-at10-team-bag" },
    ),
  ],
  comparisonProductIds: [
    "prod-nox-at10-team-bag",
    "prod-babolat-rh-pro-padel",
    "prod-tecnifibre-tour-endurance-backpack",
  ],
  buyingAdvice:
    "Pick the carry job. Club thermo paletero, tournament duffel, or backpack. Do not buy a 62 L bag for two rackets because it ranked higher on a fake list.",
  relatedGuideIds: [
    "best-padel-backpacks",
    "best-large-padel-bags",
    "best-compact-padel-bags",
    "best-padel-bags-shoe-compartment",
    "best-padel-tournament-bags",
    "best-padel-bags-commuting",
    "best-padel-overgrips",
  ],
  hubImageSrc: "/images/padel/products/nox-at10-team-paletero-hero.jpg",
  hubImageAlt: "Nox AT10 Team paletero — padel bag",
});
