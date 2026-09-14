/**
 * Market-expansion Best Guides — rebuilt against the full soft-goods catalog.
 * Each guide records considered → shortlisted → recommended with exclusion logic.
 * Do not invent winners from the old tiny candidate sets.
 */
import type { BestGuide } from "@/domain/editorial/types";
import {
  PADEL_SPORT,
  baseGuide,
  considered,
  method,
  pick,
} from "@/content/padel/best-guides/build";

/** Competition cans — expanded 62-ball market. */
export const padelBallsCompetitionGuide: BestGuide = baseGuide({
  id: "best-padel-competition-balls",
  slug: "padel-competition-balls",
  title: "Best Competition Padel Balls",
  subtitle: "Match cans with published competition positioning — not training crates",
  shortDescription:
    "Current competition-leaning cans from the expanded market: HEAD Pro pair, Wilson Premier family, Bullpadel Premium Pro, Babolat Court, Adidas Speed RX.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-balls",
  guideKind: "use-case",
  rankingMode: "ranked",
  relatedBuyingGuideIds: [
    "guide-choose-padel-balls",
    "guide-fast-vs-standard-padel-balls",
  ],
  ...method(
    "current pressurized cans with competition/official positioning and authentic packshots across the ~62-ball catalog",
  ),
  intro:
    "Competition cans are for match nights and organised play — not the cheapest training crate. From the expanded market we shortlisted HEAD Pro S+ / Pro+, Wilson Premier / Premier Speed, Bullpadel Premium Pro, Babolat Court, and Adidas Speed RX. Training Team cans and discontinued Aditour/Premium Gold naming stay out of awards.",
  whatMattersIntro:
    "Published competition or official positioning first. Then speed/control personality. Then authentic packshot. Pack economics still matter — compare per can.",
  selectionCriteria: [
    {
      key: "competition",
      label: "Competition job",
      description: "Training crates are a different week.",
    },
    {
      key: "speed",
      label: "Speed vs control",
      description: "Fast and control cans are siblings, not quality ranks.",
    },
  ],
  whatWeLookFor: [
    {
      key: "job",
      label: "Match job",
      whyItMatters: "Must be a match can, not only bulk practice.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Expanded market",
      explanation:
        "We considered the current 62-product ball catalog — not the old handful of seed cans.",
    },
  ],
  quickTake: [
    "Pro S+ when you want HEAD’s faster match can.",
    "Pro+ when you want HEAD’s control match can.",
    "Wilson Premier Speed when cold/slow courts need pop.",
  ],
  decisionShortcuts: [
    { need: "Faster HEAD match can", productId: "prod-head-padel-pro-s", reason: "Pro S+." },
    { need: "Control HEAD match can", productId: "prod-head-padel-pro-plus", reason: "Pro+." },
    { need: "Wilson cold-court speed", productId: "prod-wilson-padel-premier-speed", reason: "Premier Speed." },
  ],
  recommendations: [
    pick({
      productId: "prod-head-padel-pro-s",
      rank: 1,
      awardType: "best-overall",
      role: "Faster competition can",
      summary: "HEAD Pro S+ — faster HEAD competition personality.",
      whyWon:
        "Owns the faster HEAD competition job with tournament positioning and an authentic packshot. Pro+ remains the control sibling.",
      whyFits: [
        "I’d open this on slow courts when I want pace through the glass.",
        "I’d skip it if Pro+ already feels lively enough.",
      ],
      bestFor: ["Faster match pace", "Competition cans"],
      tradeoff: "Too lively for some control-first players.",
      avoid: ["Players who want the slower HEAD Pro+ personality"],
      instead: [
        { productId: "prod-head-padel-pro-plus", when: "you want control-first HEAD match pace", label: "Pro+" },
      ],
    }),
    pick({
      productId: "prod-head-padel-pro-plus",
      rank: 2,
      awardType: "editors-pick",
      role: "Control competition can",
      summary: "HEAD Pro+ — control-oriented competition can.",
      whyWon:
        "Control-first HEAD match can. Not a training crate and not a universal “best ball.”",
      whyFits: [
        "I’d pick Pro+ when I want the ball to sit longer than Pro S+.",
        "I’d skip it on sticky-slow courts that already kill pace.",
      ],
      bestFor: ["Control-first match play", "Standard club pace"],
      tradeoff: "Not the liveliest HEAD can.",
      avoid: ["Players hunting maximum pop"],
      instead: [
        { productId: "prod-head-padel-pro-s", when: "the court is slow and you need pace", label: "Pro S+" },
      ],
    }),
    pick({
      productId: "prod-wilson-padel-premier-speed",
      rank: 3,
      awardType: "editors-pick",
      role: "Cold / slow-court speed",
      summary: "Wilson Premier Speed — speed can for cold/slow conditions.",
      whyWon:
        "Distinct Wilson speed job versus standard Premier — not a duplicate award of Pro S+.",
      whyFits: [
        "I’d open Premier Speed when Wilson’s cold-court story matches the week.",
        "I’d skip it if standard Premier already feels lively.",
      ],
      bestFor: ["Cold/slow courts", "Wilson competition lane"],
      tradeoff: "Different brand personality than the HEAD pair.",
      avoid: ["Players locked into HEAD’s Pro pair"],
      instead: [
        { productId: "prod-wilson-padel-premier", when: "you want standard Wilson Premier pace", label: "Premier" },
        { productId: "prod-head-padel-pro-s", when: "you prefer HEAD’s faster can", label: "Pro S+" },
      ],
    }),
    pick({
      productId: "prod-bullpadel-premium-pro",
      rank: 4,
      awardType: "best-value",
      role: "Bullpadel competition can",
      summary: "Bullpadel Premium Pro — club/competition can when the club stocks Bullpadel.",
      whyWon:
        "Keeps Bullpadel clubs in a current competition can without inventing a fake universal #1.",
      whyFits: [
        "I’d shortlist Premium Pro when the club already uses Bullpadel cans.",
        "I’d skip it if you specifically want HEAD’s Pro pair personality.",
      ],
      bestFor: ["Bullpadel-stocked clubs", "Competition cans"],
      tradeoff: "Less of a published HEAD-style fast/control fork.",
      avoid: ["Players who want HEAD’s explicit Pro S+/Pro+ split"],
      instead: [
        { productId: "prod-head-padel-pro-plus", when: "you want HEAD control match pace", label: "Pro+" },
      ],
    }),
    pick({
      productId: "prod-adidas-speed-rx",
      rank: 5,
      awardType: "editors-pick",
      role: "Adidas speed competition can",
      summary: "Adidas Speed RX — speed-labelled competition can with authentic packshot.",
      whyWon:
        "Expands the competition shortlist beyond HEAD/Wilson without forcing a sixth identical “fast” award.",
      whyFits: [
        "I’d consider Speed RX when Adidas kit cohesion matters and you want a speed can.",
        "I’d skip it if HEAD Pro S+ already covers your fast-can job.",
      ],
      bestFor: ["Adidas competition lane", "Speed-labelled match cans"],
      tradeoff: "Overlaps the fast-can job already owned by Pro S+ / Premier Speed.",
      avoid: ["Players who already bought into HEAD’s faster can"],
      instead: [
        { productId: "prod-head-padel-pro-s", when: "you want the HEAD faster match can", label: "Pro S+" },
      ],
    }),
  ],
  consideredProducts: [
    considered("prod-wilson-padel-premier", "Standard Wilson Premier — shortlisted control/standard sibling to Speed.", "shortlisted", { reasonCode: "overlap", closestRecommendedProductId: "prod-wilson-padel-premier-speed" }),
    considered("prod-babolat-court-padel-balls", "Babolat Court — shortlisted competition can; overlaps Premium Pro / Pro+ lane.", "shortlisted", { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-premium-pro" }),
    considered("prod-kuikma-pb-speed", "Kuikma PB Speed — FIP value fast can; awarded in value/fast guides, shortlisted here.", "shortlisted", { reasonCode: "overlap", closestRecommendedProductId: "prod-head-padel-pro-s" }),
    considered("prod-varlion-summum-pro-w", "Varlion Summum Pro W — competition W can; shortlisted distinct winter/coast lane.", "shortlisted"),
    considered("prod-varlion-summum-pro-s", "Varlion Summum Pro S — competition S can; shortlisted summer/altitude sibling.", "shortlisted"),
    considered("prod-tecnifibre-padel-team", "Tecnifibre Team — training volume, not competition award.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-head-padel-team", "HEAD Team — training/club volume, not match award.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-bullpadel-premium-gold", "Discontinued Premium Gold naming — not a current award.", "rejected", { reasonCode: "previous-generation" }),
    considered("prod-adidas-aditour-padel", "Discontinued Aditour — rejected.", "rejected", { reasonCode: "previous-generation" }),
    considered("prod-drop-shot-tournament-tech", "Drop Shot Tournament Tech — shortlisted specialist competition can.", "shortlisted"),
    considered("prod-slazenger-challenge-no-1", "Slazenger Challenge — considered; media/identity still fragile for award.", "considered", { reasonCode: "insufficient-evidence" }),
    considered("prod-dunlop-pro-padel", "Dunlop Pro — shortlisted competition alternative.", "shortlisted"),
    considered("prod-nox-pro-titanium", "Nox competition can — shortlisted when packshot-ready.", "shortlisted"),
    considered("prod-black-crown-pro", "Black Crown Pro — shortlisted specialist competition.", "shortlisted"),
    considered("prod-4on-pro-t1", "4ON Pro T1 — shortlisted specialist competition.", "shortlisted"),
  ],
  buyingAdvice:
    "Pick the match personality first (fast vs control), then brand/club stock. Do not award training crates as competition winners.",
  relatedGuideIds: ["best-padel-balls", "best-padel-training-balls", "best-padel-fast-balls"],
  hubImageSrc: "/images/padel/products/head-padel-pro-plus-hero.jpg",
  hubImageAlt: "HEAD competition padel balls",
});

export const padelBallsTrainingGuide: BestGuide = baseGuide({
  id: "best-padel-training-balls",
  slug: "padel-training-balls",
  title: "Best Training Padel Balls",
  subtitle: "Volume cans and crates for practice — not match-night awards",
  shortDescription:
    "Training and club-volume cans from the expanded market: Tecnifibre Team, HEAD Team, Kuikma Club, and value multipacks.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-balls",
  guideKind: "use-case",
  rankingMode: "ranked",
  relatedBuyingGuideIds: ["guide-choose-padel-balls", "guide-how-long-padel-balls-last"],
  ...method("current cans whose published job is training/club volume rather than premium match positioning"),
  intro:
    "Training cans exist so you can hit baskets without burning match cans. From the expanded catalog we award Tecnifibre Team for training volume, HEAD Team for club HEAD stock, and Kuikma PB Control / Club lanes for value practice. Competition Pro S+/Pro+ stay considered, not awarded here.",
  whatMattersIntro: "Training/club use positioning, pack economics, and authentic packshots. Freshness still matters — dead cans waste sessions.",
  selectionCriteria: [
    { key: "training", label: "Training job", description: "Match cans are a different purchase." },
    { key: "value", label: "Pack economics", description: "Per-can cost decides practice weeks." },
  ],
  whatWeLookFor: [{ key: "job", label: "Practice job", whyItMatters: "Must be a training/club can.", importance: "high" }],
  criteriaChangePoints: [{ label: "Not match cans", explanation: "Pro S+/Pro+ win competition guides — not this one." }],
  quickTake: [
    "Tecnifibre Team for training crates.",
    "HEAD Team when the club already opens HEAD cans.",
    "Kuikma for value practice volume.",
  ],
  decisionShortcuts: [
    { need: "Training volume", productId: "prod-tecnifibre-padel-team", reason: "Tecnifibre Team." },
    { need: "HEAD club can", productId: "prod-head-padel-team", reason: "HEAD Team." },
  ],
  recommendations: [
    pick({
      productId: "prod-tecnifibre-padel-team",
      rank: 1,
      awardType: "best-overall",
      role: "Training volume",
      summary: "Tecnifibre Team — training/club volume can.",
      whyWon: "Clear training job in the expanded catalog without pretending it is a Premier Padel match can.",
      whyFits: [
        "I’d open Team cans for basket work and club nights that burn volume.",
        "I’d skip it for organised match play where I want Pro+/Pro S+.",
      ],
      bestFor: ["Training crates", "High-volume practice"],
      tradeoff: "Not the competition personality of HEAD Pro cans.",
      avoid: ["Match nights that need competition positioning"],
      instead: [
        { productId: "prod-head-padel-pro-plus", when: "you need a competition can", label: "Pro+" },
      ],
    }),
    pick({
      productId: "prod-head-padel-team",
      rank: 2,
      awardType: "editors-pick",
      role: "HEAD club/training can",
      summary: "HEAD Team — club/training can in the HEAD family.",
      whyWon: "Keeps HEAD clubs in a training lane without awarding Pro S+ as practice stock.",
      whyFits: [
        "I’d use Team when HEAD packshots and club stock already point here.",
        "I’d skip it if Tecnifibre Team is cheaper for the same practice week.",
      ],
      bestFor: ["HEAD club stock", "Practice volume"],
      tradeoff: "Still not a competition Pro can.",
      avoid: ["Players who need Pro S+/Pro+ match pace"],
      instead: [
        { productId: "prod-tecnifibre-padel-team", when: "you want training volume regardless of HEAD branding", label: "Tecnifibre Team" },
      ],
    }),
    pick({
      productId: "prod-kuikma-pb-control",
      rank: 3,
      awardType: "best-value",
      role: "Value practice / control",
      summary: "Kuikma PB Control — value control can for practice weeks.",
      whyWon: "Value practice without inventing a fake Decathlon “best ball overall.”",
      whyFits: [
        "I’d buy PB Control when budget practice matters more than tournament stickers.",
        "I’d skip it for match nights that need competition cans.",
      ],
      bestFor: ["Value practice", "Control-leaning club cans"],
      tradeoff: "Not a Premier Padel competition story.",
      avoid: ["Organised competition buyers"],
      instead: [
        { productId: "prod-kuikma-pb-speed", when: "you want Kuikma’s faster value can", label: "PB Speed" },
      ],
    }),
  ],
  consideredProducts: [
    considered("prod-kuikma-pb-speed", "Kuikma PB Speed — shortlisted faster value sibling; awarded in fast/value guides.", "shortlisted"),
    considered("prod-kuikma-pb-club", "Kuikma Club — shortlisted entry practice can when media-ready.", "shortlisted"),
    considered("prod-head-padel-pro-s", "Competition can — rejected from training awards.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-head-padel-pro-plus", "Competition can — rejected from training awards.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-wilson-padel-premier", "Competition lane — rejected here.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-dunlop-team", "Dunlop Team — shortlisted training alternative.", "shortlisted"),
  ],
  buyingAdvice: "Buy training cans for baskets. Save competition cans for match nights.",
  relatedGuideIds: ["best-padel-balls", "best-padel-competition-balls", "best-padel-value-balls"],
  hubImageSrc: "/images/padel/products/kuikma-pb-speed-hero.jpg",
  hubImageAlt: "Value padel training balls",
});

export const padelBallsFastGuide: BestGuide = baseGuide({
  id: "best-padel-fast-balls",
  slug: "padel-fast-balls",
  title: "Best Fast Padel Balls",
  subtitle: "Speed-positioned cans only — control siblings stay out of awards",
  shortDescription:
    "Fast/speed cans from the expanded market: HEAD Pro S+, Wilson Premier Speed, Kuikma PB Speed, Adidas Speed RX.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-balls",
  guideKind: "use-case",
  rankingMode: "ranked",
  relatedBuyingGuideIds: ["guide-fast-vs-standard-padel-balls", "guide-choose-padel-balls"],
  ...method("cans with explicit fast/speed manufacturer or range positioning and authentic packshots"),
  intro:
    "Fast cans are for slow courts and players who want the ball to keep travelling. We award Pro S+, Premier Speed, Kuikma PB Speed, and Adidas Speed RX. Control cans (Pro+, Premier, PB Control) are considered as the opposite fork — not ranked here.",
  whatMattersIntro: "Explicit speed positioning first. Then court conditions. Then packshot authenticity.",
  selectionCriteria: [
    { key: "speed", label: "Speed positioning", description: "Must be the fast sibling, not “best overall.”" },
  ],
  whatWeLookFor: [{ key: "speed", label: "Fast job", whyItMatters: "Control cans are a different guide.", importance: "high" }],
  criteriaChangePoints: [{ label: "Speed only", explanation: "Pro+ / Premier / PB Control are the control fork." }],
  quickTake: [
    "Pro S+ for HEAD’s faster match can.",
    "Premier Speed for Wilson cold/slow courts.",
    "PB Speed for FIP value speed.",
  ],
  decisionShortcuts: [
    { need: "HEAD fast", productId: "prod-head-padel-pro-s", reason: "Pro S+." },
    { need: "Value fast", productId: "prod-kuikma-pb-speed", reason: "PB Speed." },
  ],
  recommendations: [
    pick({
      productId: "prod-head-padel-pro-s",
      rank: 1,
      awardType: "best-overall",
      role: "Faster HEAD competition can",
      summary: "HEAD Pro S+ — the faster HEAD competition personality.",
      whyWon: "Clearest fast HEAD match can with tournament cues and packshot.",
      whyFits: [
        "I’d open Pro S+ when the court is slow.",
        "I’d skip it if I already struggle to contain pace.",
      ],
      bestFor: ["Slow courts", "Faster match pace"],
      tradeoff: "Too lively for some control players.",
      avoid: ["Players who want Pro+ sit"],
      instead: [{ productId: "prod-head-padel-pro-plus", when: "you want control-first HEAD pace", label: "Pro+" }],
    }),
    pick({
      productId: "prod-wilson-padel-premier-speed",
      rank: 2,
      awardType: "editors-pick",
      role: "Wilson speed can",
      summary: "Wilson Premier Speed — cold/slow-court speed can.",
      whyWon: "Wilson’s explicit speed sibling — not a duplicate of standard Premier.",
      whyFits: [
        "I’d pick Premier Speed for Wilson’s cold-court story.",
        "I’d skip it if standard Premier already pops enough.",
      ],
      bestFor: ["Cold/slow courts", "Wilson speed lane"],
      tradeoff: "Different feel than HEAD Pro S+.",
      avoid: ["Players committed to HEAD’s Pro pair"],
      instead: [{ productId: "prod-wilson-padel-premier", when: "you want standard Premier", label: "Premier" }],
    }),
    pick({
      productId: "prod-kuikma-pb-speed",
      rank: 3,
      awardType: "best-value",
      role: "Value FIP fast can",
      summary: "Kuikma PB Speed — value fast can.",
      whyWon: "Fast job at value pricing without inventing Decathlon supremacy.",
      whyFits: [
        "I’d buy PB Speed when budget and speed both matter.",
        "I’d skip it for premium competition stickers.",
      ],
      bestFor: ["Value fast cans", "Cold evenings"],
      tradeoff: "Not HEAD/Wilson competition branding.",
      avoid: ["Players who need HEAD tournament stickers"],
      instead: [{ productId: "prod-head-padel-pro-s", when: "you want HEAD’s faster match can", label: "Pro S+" }],
    }),
    pick({
      productId: "prod-adidas-speed-rx",
      rank: 4,
      awardType: "editors-pick",
      role: "Adidas speed can",
      summary: "Adidas Speed RX — speed-labelled competition can.",
      whyWon: "Keeps Adidas speed in the shortlist without a fifth identical #1.",
      whyFits: [
        "I’d consider Speed RX for Adidas cohesion.",
        "I’d skip it if Pro S+ already covers speed.",
      ],
      bestFor: ["Adidas speed lane"],
      tradeoff: "Overlaps other fast awards.",
      avoid: ["Players who already bought Pro S+"],
      instead: [{ productId: "prod-head-padel-pro-s", when: "HEAD faster can is enough", label: "Pro S+" }],
    }),
  ],
  consideredProducts: [
    considered("prod-head-padel-pro-plus", "Control sibling — rejected from fast awards.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-wilson-padel-premier", "Standard Premier — rejected from fast awards.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-kuikma-pb-control", "Control value can — rejected here.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-varlion-summum-pro-w", "W can — shortlisted condition-specific speed/pressure story.", "shortlisted"),
  ],
  buyingAdvice: "Fast cans on slow courts. Control cans when the ball already flies.",
  relatedGuideIds: ["best-padel-balls", "best-padel-competition-balls"],
  hubImageSrc: "/images/padel/balls/drop-shot-tournament-tech-hero.jpg",
  hubImageAlt: "Fast padel competition balls",
});

export const padelBallsValueGuide: BestGuide = baseGuide({
  id: "best-padel-value-balls",
  slug: "padel-value-balls",
  title: "Best Value / Bulk Padel Balls",
  subtitle: "Per-can economics for practice and club volume — not fake “best ball” crowns",
  shortDescription:
    "Value and bulk-oriented cans from the expanded market: Kuikma PB Speed/Control, Tecnifibre Team, HEAD Team.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-balls",
  guideKind: "use-case",
  rankingMode: "ranked",
  relatedBuyingGuideIds: ["guide-choose-padel-balls"],
  ...method("current cans where pack economics and club/training jobs dominate — compare price per can"),
  intro:
    "Value means per-can economics for the week you actually play — not the cheapest dead can. We award Kuikma PB Speed, Kuikma PB Control, and Tecnifibre Team. Premium competition cans stay considered for match nights.",
  whatMattersIntro: "Price per can / per ball, training suitability, and authentic packshots.",
  selectionCriteria: [
    { key: "value", label: "Pack economics", description: "Boxes look cheap until you do the per-can maths." },
  ],
  whatWeLookFor: [{ key: "value", label: "Value job", whyItMatters: "Premium match cans are a different guide.", importance: "high" }],
  criteriaChangePoints: [{ label: "Per-can maths", explanation: "Never compare a 24-can box sticker to a single premium can blindly." }],
  quickTake: [
    "PB Speed for value fast cans.",
    "PB Control for value control practice.",
    "Tecnifibre Team for training crates.",
  ],
  decisionShortcuts: [
    { need: "Value fast", productId: "prod-kuikma-pb-speed", reason: "PB Speed." },
    { need: "Training crate", productId: "prod-tecnifibre-padel-team", reason: "Team." },
  ],
  recommendations: [
    pick({
      productId: "prod-kuikma-pb-speed",
      rank: 1,
      awardType: "best-overall",
      role: "Value fast can",
      summary: "Kuikma PB Speed — value FIP fast can.",
      whyWon: "Best value fast job in the expanded catalog without crowning it “best ball overall.”",
      whyFits: [
        "I’d buy PB Speed when budget and pace both matter.",
        "I’d skip it for premium competition stickers.",
      ],
      bestFor: ["Value fast practice/match", "Cold evenings on a budget"],
      tradeoff: "Not HEAD/Wilson competition branding.",
      avoid: ["Players who need premium tournament stickers"],
      instead: [{ productId: "prod-head-padel-pro-s", when: "you want HEAD’s faster match can", label: "Pro S+" }],
    }),
    pick({
      productId: "prod-kuikma-pb-control",
      rank: 2,
      awardType: "editors-pick",
      role: "Value control can",
      summary: "Kuikma PB Control — value control practice can.",
      whyWon: "Control-leaning value sibling to PB Speed.",
      whyFits: [
        "I’d pick PB Control for budget practice that shouldn’t fly away.",
        "I’d skip it when I need a true competition can.",
      ],
      bestFor: ["Value control practice"],
      tradeoff: "Not a competition Pro can.",
      avoid: ["Organised competition buyers"],
      instead: [{ productId: "prod-kuikma-pb-speed", when: "you want value speed instead", label: "PB Speed" }],
    }),
    pick({
      productId: "prod-tecnifibre-padel-team",
      rank: 3,
      awardType: "best-value",
      role: "Training crate volume",
      summary: "Tecnifibre Team — training volume economics.",
      whyWon: "Training crates win bulk weeks when match cans would be wasteful.",
      whyFits: [
        "I’d open Team for basket volume.",
        "I’d skip it for match night.",
      ],
      bestFor: ["Training crates", "High-volume practice"],
      tradeoff: "Not competition positioning.",
      avoid: ["Match-night buyers"],
      instead: [{ productId: "prod-head-padel-pro-plus", when: "you need a competition can", label: "Pro+" }],
    }),
  ],
  consideredProducts: [
    considered("prod-head-padel-team", "HEAD Team — shortlisted club value alternative.", "shortlisted"),
    considered("prod-head-padel-pro-s", "Premium competition — rejected from value awards.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-wilson-padel-premier-speed", "Premium speed — rejected from value awards.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-dunlop-team", "Dunlop Team — shortlisted value training alternative.", "shortlisted"),
  ],
  buyingAdvice: "Do the per-can maths. Bulk only wins when cans stay fresh enough to use.",
  relatedGuideIds: ["best-padel-training-balls", "best-padel-balls"],
  hubImageSrc: "/images/padel/products/kuikma-pb-speed-hero.jpg",
  hubImageAlt: "Value padel balls",
});
