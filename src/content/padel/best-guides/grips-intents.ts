/**
 * Overgrip / ergonomic-grip Best Guides — rebuilt against the soft-goods + market-wave catalog.
 * Each guide records considered → shortlisted → recommended with exclusion logic.
 * Voice: EXPERT_RESEARCH via method() — never fake first-hand lab sweat tests.
 */
import type { BestGuide } from "@/domain/editorial/types";
import {
  PADEL_SPORT,
  baseGuide,
  considered,
  gripCriteria,
  method,
  pick,
} from "@/content/padel/best-guides/build";

export const padelOvergripsSweatyGuide: BestGuide = baseGuide({
  id: "best-padel-overgrips-sweaty",
  slug: "padel-overgrips-sweaty-hands",
  title: "Best Padel Overgrips for Sweaty Hands",
  subtitle: "Absorption-first wraps — not tacky defaults and not Hesacore sleeves",
  shortDescription:
    "Absorbent overgrips for humid sessions: Bullpadel HaC, Nox Pro, with Tourna Grip XL shortlisted.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-grips",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  relatedBuyingGuideIds: [
    "guide-padel-grip-vs-overgrip",
    "guide-how-often-replace-padel-overgrip",
    "guide-padel-grips",
  ],
  ...method(
    "published absorbent / dry-feel padel overgrips whose job is moisture management over thin tack — not ergonomic cushion sleeves",
  ),
  intro:
    "Sweaty-hands overgrips are absorption jobs. From the catalog we shortlisted Bullpadel HaC and Nox Pro as padel-native absorbent wraps with authentic packshots, and Tourna Grip XL as the classic absorbent shortlist when you want that dry chalk feel. Wilson Pro stays considered as the opposite tack default. Hesacore is a shaped cushion system — rejected here as context-mismatch, not as a bad product.",
  whatMattersIntro:
    "Absorption first. Then thin enough not to jump a grip size. Then authentic packshot. We do not invent sweat-hour lab results — EXPERT_RESEARCH on published jobs and materials only.",
  selectionCriteria: gripCriteria,
  whatWeLookFor: [
    {
      key: "absorption",
      label: "Absorption job",
      whyItMatters: "Thin tack defaults fail mid-set when moisture is the problem.",
      importance: "high",
    },
    {
      key: "type",
      label: "Overgrip, not sleeve",
      whyItMatters: "Hesacore changes handle geometry — different product class.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Absorption filter",
      explanation: "Wilson thin-tack and Hesacore sleeves do not win sweaty-hands awards.",
    },
  ],
  quickTake: [
    "HaC when you want Bullpadel’s absorption-first padel wrap.",
    "Nox Pro when you want a padel-native absorbent 3-pack alternative.",
    "Shortlist Tourna Grip XL for classic dry absorbent feel — media/identity still fragile for a primary award.",
  ],
  decisionShortcuts: [
    { need: "Absorption default", productId: "prod-bullpadel-gb1200", reason: "Bullpadel HaC." },
    { need: "Nox absorbent 3-pack", productId: "prod-nox-pro-overgrip", reason: "Nox Pro." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-gb1200",
      rank: 1,
      awardType: "best-overall",
      role: "Absorption-first padel wrap",
      summary: "Bullpadel HaC — thin absorbent overgrip for sweaty sessions.",
      whyWon:
        "HaC owns the sweaty-hands job: published absorption-first padel wrap with an authentic packshot. Nox Pro is the sibling absorbent. Hesacore cannot win this guide.",
      whyFits: [
        "I’d wrap HaC when Wilson Pro turns slippery mid-set and moisture is the weekly complaint.",
        "I’d skip it if you wanted maximum tacky feel — that is the tacky-overgrips guide.",
      ],
      bestFor: ["Humid club nights", "Sweat kills tack", "Padel-native absorbent wrap"],
      tradeoff: "Less of a tack-first story than Wilson Pro.",
      avoid: ["Players who want thin tack as the whole point", "Hesacore shoppers treating this as a sleeve"],
      instead: [
        { productId: "prod-nox-pro-overgrip", when: "you want Nox’s absorbent 3-pack instead", label: "Nox Pro" },
        { productId: "prod-wilson-overgrip", when: "you want thin tack, not absorption", label: "Wilson Pro" },
      ],
    }),
    pick({
      productId: "prod-nox-pro-overgrip",
      rank: 2,
      awardType: "editors-pick",
      role: "Padel-native absorbent 3-pack",
      summary: "Nox Pro Overgrip — absorbent padel wrap alternative to HaC.",
      whyWon:
        "Distinct Nox absorbent lane with authentic packshot — not a third identical HaC clone and not a Hesacore award.",
      whyFits: [
        "I’d pick Nox Pro when Nox kit cohesion matters and Wilson already feels like soap.",
        "I’d skip it if HaC already covers absorption in the bag.",
      ],
      bestFor: ["Nox absorbent wrap", "Humid sessions"],
      tradeoff: "Overlaps HaC’s absorption job.",
      avoid: ["Players who already settled on HaC"],
      instead: [
        { productId: "prod-bullpadel-gb1200", when: "HaC already solves sweat", label: "HaC" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-tourna-grip-xl",
      "Classic absorbent Tourna Grip XL — shortlisted for dry chalk feel; dedicated authentic packshot still fragile versus HaC/Nox awards.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
    considered(
      "prod-tourna-tourna-grip-original-xl",
      "Tourna Grip Original XL media sibling — shortlisted; packs remain offers of one absorbent job.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
    considered(
      "prod-wilson-overgrip",
      "Thin tack default — rejected from sweaty-hands awards (opposite job).",
      "rejected",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
    considered(
      "prod-hesacore-padel",
      "Ergonomic cushion system — not an absorbent overgrip. Rejected as context-mismatch.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-head-xtreme-soft",
      "Soft tacky wrap — rejected as sweaty-hands primary (tack lane).",
      "rejected",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-wilson-overgrip" },
    ),
    considered(
      "prod-kuikma-overgrip",
      "Value absorbent wrap — shortlisted; awarded on the value multipack guide.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
  ],
  buyingAdvice:
    "If tack dies because of sweat, buy absorption — do not stack another tacky wrap and hope. Hesacore is a different mechanism (shaped cushion), not a sweaty-hands overgrip award.",
  relatedGuideIds: [
    "best-padel-overgrips",
    "best-padel-dry-feel-overgrips",
    "best-padel-tacky-overgrips",
    "best-padel-value-overgrips",
  ],
  comparisonProductIds: ["prod-bullpadel-gb1200", "prod-nox-pro-overgrip"],
  hubImageSrc: "/images/padel/guides/grips.jpg",
  hubImageAlt: "Padel overgrips for sweaty hands",
});

export const padelTackyOvergripsGuide: BestGuide = baseGuide({
  id: "best-padel-tacky-overgrips",
  slug: "padel-tacky-overgrips",
  title: "Best Tacky Padel Overgrips",
  subtitle: "Thin tack and soft tack — absorbent wraps stay out of primary awards",
  shortDescription:
    "Tack-first overgrips: Wilson Pro, HEAD Xtreme Soft, Babolat Pro Response — with Tourna Mega Tac shortlisted.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-grips",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  relatedBuyingGuideIds: [
    "guide-padel-grip-vs-overgrip",
    "guide-how-often-replace-padel-overgrip",
  ],
  ...method(
    "published thin/soft tacky overgrips with authentic packshots — absorbent-first wraps are not primary awards here",
  ),
  intro:
    "Tacky overgrips win when you want the handle to stick lightly without jumping a grip size. We award Wilson Pro as the thin tack default, HEAD Xtreme Soft as the softer tacky feel, and Babolat Pro Response as the thin tacky multipack. Absorbent-first wraps (HaC, Nox Pro) stay shortlisted/rejected as primary awards unless you only need them as the opposite fork. Tourna Mega Tac is shortlisted as a tacky sibling.",
  whatMattersIntro:
    "Published tack / soft-tack positioning first. Thickness stays thin. Authentic packshot required. Absorption-first products are a different guide.",
  selectionCriteria: gripCriteria,
  whatWeLookFor: [
    {
      key: "tack",
      label: "Tack-first job",
      whyItMatters: "Absorbent wraps are the opposite fork.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Tack filter",
      explanation: "HaC / Nox Pro do not take primary tacky awards.",
    },
  ],
  quickTake: [
    "Wilson Pro for thin lightly tacky padel-length default.",
    "Xtreme Soft for softer tacky feel.",
    "Pro Response for thin tacky 3-pack alternative.",
  ],
  decisionShortcuts: [
    { need: "Thin tack default", productId: "prod-wilson-overgrip", reason: "Wilson Pro." },
    { need: "Soft tacky feel", productId: "prod-head-xtreme-soft", reason: "Xtreme Soft." },
  ],
  recommendations: [
    pick({
      productId: "prod-wilson-overgrip",
      rank: 1,
      awardType: "best-overall",
      role: "Thin tack default",
      summary: "Wilson Pro Padel Overgrip — thin stretch felt, lightly tacky 3-pack.",
      whyWon:
        "Clearest thin-tack padel-length wrap with authentic packshot. Soft tack lives on Xtreme Soft; absorption lives on HaC.",
      whyFits: [
        "I’d wrap Wilson as the default tacky feel for most club weeks.",
        "I’d skip it when sweat kills tack mid-set — switch to the sweaty-hands guide.",
      ],
      bestFor: ["Default thin tack", "Feel-first wraps", "Padel-length 3-pack"],
      tradeoff: "Not the driest option for heavy sweat.",
      avoid: ["Players who need absorption-first wraps as the whole point"],
      instead: [
        { productId: "prod-head-xtreme-soft", when: "you want softer tacky feel", label: "Xtreme Soft" },
        { productId: "prod-bullpadel-gb1200", when: "sweat kills tack", label: "HaC" },
      ],
    }),
    pick({
      productId: "prod-head-xtreme-soft",
      rank: 2,
      awardType: "editors-pick",
      role: "Soft tacky wrap",
      summary: "HEAD Xtreme Soft — soft, tacky overgrip.",
      whyWon:
        "Distinct soft-tack job versus Wilson’s thinner light tack — not an absorbent award.",
      whyFits: [
        "I’d use Xtreme Soft when I want a stickier, softer wrap than Wilson.",
        "I’d skip it if Wilson’s thinner feel is already enough.",
      ],
      bestFor: ["Soft tacky feel", "HEAD wrap lane"],
      tradeoff: "Often sold per grip — check multipack economics.",
      avoid: ["Players who only wanted Wilson’s thinner light tack"],
      instead: [
        { productId: "prod-wilson-overgrip", when: "you want the thin tack default 3-pack", label: "Wilson Pro" },
        { productId: "prod-babolat-pro-response", when: "you want thin tacky multipack instead", label: "Pro Response" },
      ],
    }),
    pick({
      productId: "prod-babolat-pro-response",
      rank: 3,
      awardType: "editors-pick",
      badge: "Best thin tacky multipack",
      role: "Thin tacky multipack",
      summary: "Babolat Pro Response — thin 0.45 mm tacky 3-pack.",
      whyWon:
        "Thin tacky multipack with published thickness — preferred over Mega Tac as a primary award while Mega Tac media identity stays fragile.",
      whyFits: [
        "I’d shortlist Pro Response when I want thin tacky feel in a 3-pack.",
        "I’d skip it if Wilson already covers the tack default.",
      ],
      bestFor: ["Thin tacky multipack", "Babolat wrap lane"],
      tradeoff: "Shared racket-sports grip, not padel-exclusive.",
      avoid: ["Absorption-first shoppers"],
      instead: [
        { productId: "prod-wilson-overgrip", when: "Wilson’s padel-length default is enough", label: "Wilson Pro" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-tourna-mega-tac",
      "Tourna Mega Tac — tacky sibling shortlisted; packshot identity still fragile for a primary award versus Pro Response / Wilson.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-wilson-overgrip" },
    ),
    considered(
      "prod-bullpadel-gb1200",
      "Absorbent-first — rejected as a primary tacky award.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-nox-pro-overgrip",
      "Absorbent-first — rejected as a primary tacky award.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-hesacore-padel",
      "Ergonomic sleeve — rejected from overgrip tack awards.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
  ],
  buyingAdvice:
    "Buy tack when feel is the problem. Buy absorption when sweat is the problem. Do not award HaC as “best tacky.”",
  relatedGuideIds: [
    "best-padel-overgrips",
    "best-padel-overgrips-sweaty",
    "best-padel-dry-feel-overgrips",
  ],
  comparisonProductIds: [
    "prod-wilson-overgrip",
    "prod-head-xtreme-soft",
    "prod-babolat-pro-response",
  ],
  hubImageSrc: "/images/padel/products/wilson-padel-overgrip-hero.jpg",
  hubImageAlt: "Wilson Pro tacky padel overgrip",
});

export const padelDryFeelOvergripsGuide: BestGuide = baseGuide({
  id: "best-padel-dry-feel-overgrips",
  slug: "padel-dry-feel-overgrips",
  title: "Best Dry-Feel Padel Overgrips",
  subtitle: "Absorption / dry wrap feel — not Hesacore geometry",
  shortDescription:
    "Dry-feel absorbent overgrips: Bullpadel HaC, Nox Pro — Hydrosorb shortlisted as a replacement-grip mechanism.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-grips",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  relatedBuyingGuideIds: [
    "guide-padel-grip-vs-overgrip",
    "guide-how-often-replace-padel-overgrip",
  ],
  ...method(
    "published absorbent / dry-feel overgrips — dry-feel means wrap moisture behaviour, not an ergonomic Hesacore sleeve",
  ),
  intro:
    "Dry-feel here means an absorbent overgrip that stays usable when humidity kills tack — not a shaped Hesacore cushion. We award HaC and Nox Pro. HEAD Hydrosorb is a replacement base grip with high absorption positioning — shortlisted as a different mechanism, not mixed into overgrip awards without explanation. Hesacore is explicitly not “dry feel.”",
  whatMattersIntro:
    "Absorbent wrap job first. Then overgrip vs replacement vs sleeve. Dry-feel ≠ Hesacore finger-channel geometry.",
  selectionCriteria: gripCriteria,
  whatWeLookFor: [
    {
      key: "dry",
      label: "Dry / absorbent wrap",
      whyItMatters: "Must be moisture behaviour of a wrap, not handle reshaping.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Dry-feel ≠ Hesacore",
      explanation: "Hesacore changes handle shape. Dry-feel overgrips manage moisture on a thin wrap.",
    },
  ],
  quickTake: [
    "HaC for dry absorbent overgrip default.",
    "Nox Pro for padel-native dry absorbent alternative.",
    "Hydrosorb only if you are rebuilding the base grip — different product class.",
  ],
  decisionShortcuts: [
    { need: "Dry absorbent overgrip", productId: "prod-bullpadel-gb1200", reason: "HaC." },
    { need: "Nox dry absorbent", productId: "prod-nox-pro-overgrip", reason: "Nox Pro." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-gb1200",
      rank: 1,
      awardType: "best-overall",
      role: "Dry absorbent overgrip",
      summary: "Bullpadel HaC — dry-feel absorbent overgrip.",
      whyWon:
        "Best clear dry/absorbent overgrip award with authentic packshot. This is wrap moisture behaviour — not Hesacore.",
      whyFits: [
        "I’d wrap HaC when I want the handle to feel drier mid-set.",
        "I’d skip it if I wanted tacky feel or a Hesacore sleeve.",
      ],
      bestFor: ["Dry absorbent wrap", "Humid sessions"],
      tradeoff: "Not a tack-first story.",
      avoid: ["Hesacore shoppers confusing dry-feel with ergonomic sleeves"],
      instead: [
        { productId: "prod-nox-pro-overgrip", when: "you want Nox absorbent instead", label: "Nox Pro" },
        { productId: "prod-hesacore-padel", when: "you actually want an ergonomic cushion — see ergonomic guide", label: "Hesacore" },
      ],
    }),
    pick({
      productId: "prod-nox-pro-overgrip",
      rank: 2,
      awardType: "editors-pick",
      role: "Nox dry absorbent wrap",
      summary: "Nox Pro — padel-native dry absorbent overgrip.",
      whyWon: "Second dry-feel overgrip lane without inventing a Hesacore award.",
      whyFits: [
        "I’d pick Nox Pro for dry absorbent feel in a Nox 3-pack.",
        "I’d skip it if HaC already covers the week.",
      ],
      bestFor: ["Nox dry absorbent", "Replaceable wraps"],
      tradeoff: "Overlaps HaC.",
      avoid: ["Players who already bought HaC for the same job"],
      instead: [
        { productId: "prod-bullpadel-gb1200", when: "HaC is enough", label: "HaC" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-head-hydrosorb",
      "HEAD Hydrosorb — replacement base grip with high absorption positioning. Different mechanism from an overgrip; shortlisted, not awarded as an overgrip.",
      "shortlisted",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
    considered(
      "prod-hesacore-padel",
      "Ergonomic sleeve — dry-feel ≠ Hesacore. Rejected from dry-feel overgrip awards.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-wilson-overgrip",
      "Thin tack — opposite of dry absorbent priority.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-tourna-grip-xl",
      "Classic dry absorbent Tourna — shortlisted; fragile media for primary award.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-bullpadel-gb1200" },
    ),
  ],
  buyingAdvice:
    "Dry-feel overgrips are thin wraps you replace often. Hesacore is a cushion system that changes handle girth — buy that only from the ergonomic guide.",
  relatedGuideIds: [
    "best-padel-overgrips-sweaty",
    "best-padel-overgrips",
    "best-padel-ergonomic-grips",
  ],
  comparisonProductIds: ["prod-bullpadel-gb1200", "prod-nox-pro-overgrip"],
  hubImageSrc: "/images/padel/products/bullpadel-hac-overgrip-hero.jpg",
  hubImageAlt: "Bullpadel HaC dry-feel overgrip",
});

export const padelValueOvergripsGuide: BestGuide = baseGuide({
  id: "best-padel-value-overgrips",
  slug: "padel-value-overgrips-multipacks",
  title: "Best Value Padel Overgrips",
  subtitle: "Multipack economics — price per wrap, not fake “best grip” crowns",
  shortDescription:
    "Value multipack overgrips: Kuikma, Wilson Pro 3-pack, Nox Pro 3-pack.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-grips",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  relatedBuyingGuideIds: [
    "guide-how-often-replace-padel-overgrip",
    "guide-padel-grips",
  ],
  ...method(
    "current overgrips where pack economics and replaceable weekly wraps dominate — compare price per grip",
  ),
  intro:
    "Value overgrips are about price per wrap for the weeks you actually replace them. We award Kuikma for Decathlon-path club value, Wilson Pro as the default 3-pack reference, and Nox Pro as a padel-native absorbent 3-pack that still makes multipack sense. Premium sleeves and single soft wraps sold one-at-a-time stay considered when economics hurt.",
  whatMattersIntro:
    "Pack quantity and street price per wrap first. Then whether the job is tack or absorption. Authentic packshot still required.",
  selectionCriteria: gripCriteria,
  whatWeLookFor: [
    {
      key: "value",
      label: "Multipack economics",
      whyItMatters: "Single soft wraps look cheap until you replace them twice a week.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Per-wrap maths",
      explanation: "Do not compare a Hesacore sleeve sticker to a 3-pack overgrip blindly.",
    },
  ],
  quickTake: [
    "Kuikma for club value wraps.",
    "Wilson Pro 3-pack as the default replaceable tack multipack.",
    "Nox Pro 3-pack when absorbent multipacks matter.",
  ],
  decisionShortcuts: [
    { need: "Club value wrap", productId: "prod-kuikma-overgrip", reason: "Kuikma." },
    { need: "Default 3-pack", productId: "prod-wilson-overgrip", reason: "Wilson Pro." },
  ],
  recommendations: [
    pick({
      productId: "prod-kuikma-overgrip",
      rank: 1,
      awardType: "best-overall",
      role: "Club value wrap",
      summary: "Kuikma Padel Overgrip Pro — Decathlon-path value wrap.",
      whyWon:
        "Best value job in the expanded overgrip catalog without crowning it “best overgrip overall.” Confirm local pack counts.",
      whyFits: [
        "I’d buy Kuikma when I burn wraps weekly and want replaceable club stock.",
        "I’d skip it if I specifically wanted Wilson’s padel-length tack identity.",
      ],
      bestFor: ["Value multipacks", "High replacement frequency", "Decathlon path"],
      tradeoff: "Pack count varies by market — confirm per-wrap maths.",
      avoid: ["Players who need Wilson’s thin tack as the whole point"],
      instead: [
        { productId: "prod-wilson-overgrip", when: "you want the default tack 3-pack", label: "Wilson Pro" },
        { productId: "prod-nox-pro-overgrip", when: "you want absorbent 3-pack value", label: "Nox Pro" },
      ],
    }),
    pick({
      productId: "prod-wilson-overgrip",
      rank: 2,
      awardType: "editors-pick",
      role: "Default 3-pack reference",
      summary: "Wilson Pro Padel Overgrip — 3-pack thin tack default.",
      whyWon:
        "Published 3-pack economics with authentic packshot — the multipack reference most players should price against.",
      whyFits: [
        "I’d keep Wilson 3-packs in the bag as default replaceable stock.",
        "I’d skip it if Kuikma is materially cheaper per wrap for the same weeks.",
      ],
      bestFor: ["Default 3-pack", "Thin tack value"],
      tradeoff: "Not the cheapest Decathlon path.",
      avoid: ["Absorption-only shoppers"],
      instead: [
        { productId: "prod-kuikma-overgrip", when: "club value beats brand 3-pack", label: "Kuikma" },
        { productId: "prod-bullpadel-gb1200", when: "you need absorbent, not tack value", label: "HaC" },
      ],
    }),
    pick({
      productId: "prod-nox-pro-overgrip",
      rank: 3,
      awardType: "best-value",
      role: "Absorbent 3-pack value",
      summary: "Nox Pro Overgrip — absorbent padel 3-pack with multipack framing.",
      whyWon:
        "Absorbent multipack lane so value buyers are not forced into Wilson tack when sweat is the problem.",
      whyFits: [
        "I’d buy Nox Pro 3-packs when humid weeks burn absorbent wraps.",
        "I’d skip it if Kuikma already covers value absorption in your market.",
      ],
      bestFor: ["Absorbent multipacks", "Nox value wraps"],
      tradeoff: "Still not a Hesacore sleeve.",
      avoid: ["Hesacore shoppers", "Single soft-wrap bargain hunters ignoring pack maths"],
      instead: [
        { productId: "prod-kuikma-overgrip", when: "you want cheaper club value", label: "Kuikma" },
        { productId: "prod-bullpadel-gb1200", when: "HaC absorption is the preferred brand", label: "HaC" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-head-xtreme-soft",
      "Often sold per grip — shortlisted; economics hurt versus 3-packs.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-wilson-overgrip" },
    ),
    considered(
      "prod-bullpadel-gb1200",
      "HaC 3-pack — shortlisted absorbent alternative; sweaty/dry guides own the primary absorption awards.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-nox-pro-overgrip" },
    ),
    considered(
      "prod-hesacore-padel",
      "Ergonomic sleeve — rejected from value overgrip multipack awards.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
  ],
  buyingAdvice:
    "Do the per-wrap maths. A cheap single soft wrap loses to a 3-pack if you replace twice a week.",
  relatedGuideIds: [
    "best-padel-overgrips",
    "best-padel-overgrips-sweaty",
    "best-padel-tacky-overgrips",
  ],
  comparisonProductIds: [
    "prod-kuikma-overgrip",
    "prod-wilson-overgrip",
    "prod-nox-pro-overgrip",
  ],
  hubImageSrc: "/images/padel/products/kuikma-padel-overgrip-hero.jpg",
  hubImageAlt: "Kuikma value padel overgrip",
});

export const padelErgonomicGripsGuide: BestGuide = baseGuide({
  id: "best-padel-ergonomic-grips",
  slug: "padel-ergonomic-grip-systems",
  title: "Best Ergonomic Padel Grip Systems",
  subtitle: "Hesacore cushion systems — not overgrip rankings",
  shortDescription:
    "Ergonomic Hesacore systems: Tour/padel flagship, Pro Carbon, with Gel shortlisted. Overgrips are a different mechanism.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-grips",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intentionallyNarrow: true,
  relatedBuyingGuideIds: [
    "guide-padel-grip-vs-overgrip",
    "guide-padel-grips",
  ],
  ...method(
    "published Hesacore / ergonomic cushion grip systems that reshape handle feel — thin overgrips are not primary awards without explanation",
  ),
  intro:
    "This is not an overgrip guide. Ergonomic grip systems (Hesacore) change handle geometry and perceived girth. We award prod-hesacore-padel as the catalog flagship cushion, prod-hesacore-tour-original as the manufacturer Tour/Original reference with authentic packshot, and prod-hesacore-pro-carbon as the firmer Pro/Carbon lane. Overgrips (Wilson, HaC) can be shortlisted only as a different mechanism — they do not take Hesacore awards. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Cushion / ergonomic system first. Then Tour vs Gel vs Pro/Carbon material fork. Overgrips wrap on top; they do not replace this page’s winners.",
  selectionCriteria: gripCriteria,
  whatWeLookFor: [
    {
      key: "system",
      label: "Ergonomic cushion system",
      whyItMatters: "Thin overgrips are a different product class.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Not an overgrip ranking",
      explanation: "Wilson / HaC / Nox Pro cannot win without an explicit different-mechanism note — and they do not win awards here.",
    },
  ],
  quickTake: [
    "Hesacore padel / Tour Original for the default ergonomic cushion.",
    "Pro Carbon when you want the firmer Hesacore lane.",
    "Shortlist Gel when you want the Gel material fork — dedicated media still thinner than Tour/Pro Carbon.",
  ],
  decisionShortcuts: [
    { need: "Default Hesacore cushion", productId: "prod-hesacore-padel", reason: "Hesacore padel catalog flagship." },
    { need: "Tour Original packshot", productId: "prod-hesacore-tour-original", reason: "Tour / Original." },
    { need: "Firmer Pro Carbon", productId: "prod-hesacore-pro-carbon", reason: "Pro Carbon." },
  ],
  recommendations: [
    pick({
      productId: "prod-hesacore-padel",
      rank: 1,
      awardType: "best-overall",
      role: "Default ergonomic cushion",
      summary: "Hesacore Padel Grip — structured cushion system, not an overgrip.",
      whyWon:
        "Catalog flagship ergonomic system with authentic packshot. Overgrips cannot take this award.",
      whyFits: [
        "I’d try Hesacore when a standard handle feels skinny after long sessions and I want shaped cushion channels.",
        "I’d skip it if I only needed a thin replaceable wrap — that is Wilson / HaC.",
      ],
      bestFor: ["Ergonomic cushion", "Handle girth / channel feel", "Hesacore system players"],
      tradeoff: "Changes effective handle size — fit is personal; not a medical claim.",
      avoid: ["Players who only wanted a thin overgrip multipack"],
      instead: [
        { productId: "prod-hesacore-tour-original", when: "you want the manufacturer Tour/Original SKU", label: "Tour Original" },
        { productId: "prod-wilson-overgrip", when: "you only needed a thin wrap (different mechanism)", label: "Wilson Pro" },
      ],
    }),
    pick({
      productId: "prod-hesacore-tour-original",
      rank: 2,
      awardType: "editors-pick",
      role: "Tour / Original reference",
      summary: "Hesacore Tour Original — manufacturer flagship ergonomic undergrip.",
      whyWon:
        "Manufacturer Tour/Original packshot reference — distinct listing from the catalog’s prod-hesacore-padel seed while staying in the same system family.",
      whyFits: [
        "I’d shortlist Tour Original when buying from Hesacore’s own Tour SKU.",
        "I’d skip it if the catalog Hesacore padel listing already matches the sleeve you tried.",
      ],
      bestFor: ["Tour Original SKU", "Manufacturer Hesacore path"],
      tradeoff: "Overlaps the catalog Hesacore padel flagship job — confirm which SKU you actually tried.",
      avoid: ["Overgrip-only shoppers"],
      instead: [
        { productId: "prod-hesacore-padel", when: "the catalog Hesacore padel listing is enough", label: "Hesacore padel" },
        { productId: "prod-hesacore-pro-carbon", when: "you want firmer Pro Carbon", label: "Pro Carbon" },
      ],
    }),
    pick({
      productId: "prod-hesacore-pro-carbon",
      rank: 3,
      awardType: "editors-pick",
      badge: "Best firmer Pro Carbon",
      role: "Firmer Pro / Carbon Hesacore",
      summary: "Hesacore Pro Carbon — firmer ergonomic system lane.",
      whyWon:
        "Distinct firmer Pro/Carbon job versus Tour/Gel — not a thin overgrip and not a duplicate Tour award.",
      whyFits: [
        "I’d pick Pro Carbon when I want Hesacore geometry with a firmer material story.",
        "I’d skip it if Tour Original already feels right.",
      ],
      bestFor: ["Firmer Hesacore", "Pro Carbon lane"],
      tradeoff: "Still a sleeve — not an overgrip multipack.",
      avoid: ["Players who wanted Wilson thin tack"],
      instead: [
        { productId: "prod-hesacore-tour-original", when: "you want classic Tour feel", label: "Tour Original" },
        { productId: "prod-hesacore-carbon", when: "you want the Carbon Tour sibling listing", label: "Hesacore Carbon" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-hesacore-gel",
      "Hesacore Gel — distinct Gel material fork; shortlisted (dedicated authentic media thinner than Tour/Pro Carbon).",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-hesacore-padel" },
    ),
    considered(
      "prod-hesacore-carbon",
      "Hesacore Carbon — shortlisted firmer sibling to Pro Carbon.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-hesacore-pro-carbon" },
    ),
    considered(
      "prod-wilson-overgrip",
      "Thin overgrip — different mechanism; shortlisted only so shoppers see the fork, not awarded.",
      "shortlisted",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-hesacore-padel" },
    ),
    considered(
      "prod-bullpadel-gb1200",
      "Absorbent overgrip — different mechanism; not an ergonomic system award.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-nox-pro-overgrip",
      "Absorbent overgrip — rejected from ergonomic system awards.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-head-hydrosorb",
      "Replacement base grip — different mechanism from Hesacore sleeve.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
  ],
  buyingAdvice:
    "Try Hesacore geometry before you buy a stack — girth change is personal. Keep overgrips for replaceable tack/absorption on top of a base grip; do not confuse the two product classes.",
  relatedGuideIds: [
    "best-padel-overgrips",
    "best-padel-dry-feel-overgrips",
    "best-padel-overgrips-sweaty",
  ],
  comparisonProductIds: [
    "prod-hesacore-padel",
    "prod-hesacore-tour-original",
    "prod-hesacore-pro-carbon",
  ],
  hubImageSrc: "/images/padel/products/hesacore-padel-grip-hero.jpg",
  hubImageAlt: "Hesacore ergonomic padel grip system",
});
