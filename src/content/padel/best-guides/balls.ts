import type { BestGuide } from "@/domain/editorial/types";
import {
  PADEL_SPORT,
  baseGuide,
  considered,
  method,
  pick,
} from "@/content/padel/best-guides/build";

export const padelBallsGuide: BestGuide = baseGuide({
  id: "best-padel-balls",
  slug: "padel-balls",
  title: "Best Padel Balls",
  subtitle: "Fast vs control, club vs tournament — not one universal can",
  shortDescription:
    "Current pressurized cans by job: faster match pace, control-first match play, value competition, and training volume.",
  sportId: PADEL_SPORT,
  categoryId: "cat-padel-balls",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  relatedBuyingGuideIds: [
    "guide-choose-padel-balls",
    "guide-how-long-padel-balls-last",
  ],
  ...method(
    "published current pressurized cans with authentic packshots and manufacturer/retailer speed or use positioning — not historical Aditour/Premium Gold naming",
  ),
  intro:
    "Padel balls are a pace and condition choice, not a single winner. We shortlisted HEAD Pro S+ for faster match pace, HEAD Pro+ for control-first competition, Wilson Premier Speed when cold/slow courts need extra pop, Kuikma PB Speed as the value FIP fast can, and Tecnifibre Team for training volume. Stale Aditour and Premium Gold naming stay out. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Pressurization and freshness first. Then manufacturer speed/control positioning for your court conditions. Then pack economics (per can vs per ball) — never compare a 24-can box to a single can as if they were the same unit.",
  selectionCriteria: [
    {
      key: "use",
      label: "Competition vs training",
      description: "Match cans and training cans solve different weeks.",
    },
    {
      key: "speed",
      label: "Speed positioning",
      description: "Fast vs control is a trade-off, not a quality score.",
    },
    {
      key: "freshness",
      label: "Current market status",
      description: "Do not recommend discontinued naming because a draft row exists.",
    },
  ],
  whatWeLookFor: [
    {
      key: "job",
      label: "Play job",
      whyItMatters: "Fast match, control match, and training crates are different products.",
      importance: "high",
    },
    {
      key: "photo",
      label: "Authentic packshot",
      whyItMatters: "Draft cans without a real tube photo cannot win.",
      importance: "high",
    },
  ],
  criteriaChangePoints: [
    {
      label: "Trade-offs, not universal best",
      explanation: "Pro S+ is not better than Pro+ — it is faster. Control players should prefer Pro+.",
    },
  ],
  quickTake: [
    "Choose Pro S+ or Wilson Premier Speed when the court is slow and you want pace.",
    "Choose Pro+ when you want the ball to sit longer for control.",
    "Choose Kuikma PB Speed for FIP value on cold evenings.",
    "Choose Tecnifibre Team for training crates — not match night.",
  ],
  decisionShortcuts: [
    { need: "Faster match can", productId: "prod-head-padel-pro-s", reason: "HEAD Pro S+." },
    { need: "Control-first match can", productId: "prod-head-padel-pro-plus", reason: "HEAD Pro+." },
    { need: "Cold / slow court speed", productId: "prod-wilson-padel-premier-speed", reason: "Wilson Premier Speed." },
    { need: "Value FIP fast can", productId: "prod-kuikma-pb-speed", reason: "Kuikma PB Speed." },
    { need: "Training volume", productId: "prod-tecnifibre-padel-team", reason: "Tecnifibre Team." },
  ],
  recommendations: [
    pick({
      productId: "prod-head-padel-pro-s",
      rank: 1,
      awardType: "best-overall",
      role: "Faster competition can",
      summary: "HEAD Pro S+ — thicker natural-rubber core, faster match pace.",
      whyWon:
        "Pro S+ owns the faster HEAD competition job with tournament positioning and an authentic packshot. Pro+ wins control. They are siblings, not substitutes.",
      whyFits: [
        "I’d open this on slow courts when I want the ball through the glass.",
        "I’d skip it if Pro+ already feels plenty lively.",
      ],
      bestFor: ["Faster match pace", "Slow/cool courts", "Competition cans"],
      tradeoff: "Too lively for some beginners and control-first players.",
      avoid: ["Players who want Pro+’s longer sit"],
      instead: [
        { productId: "prod-head-padel-pro-plus", when: "you want control-first pace", label: "Pro+" },
        { productId: "prod-wilson-padel-premier-speed", when: "you prefer Wilson’s Speed can", label: "Premier Speed" },
      ],
    }),
    pick({
      productId: "prod-head-padel-pro-plus",
      rank: 2,
      awardType: "editors-pick",
      role: "Control-first competition can",
      summary: "HEAD Pro+ — pressure-retaining control personality.",
      whyWon:
        "Pro+ is the control-first competition award in the HEAD pair. FEP/Premier Padel men’s positioning and a verified tube packshot.",
      whyFits: [
        "I’d pick Pro+ when I want the ball to sit a fraction longer than Pro S+.",
        "I’d skip it if the court is already dead slow — that is Pro S+/Speed territory.",
      ],
      bestFor: ["Control match play", "Standard club pace"],
      tradeoff: "Not the fastest HEAD can.",
      avoid: ["Players who explicitly want maximum pace"],
      instead: [
        { productId: "prod-head-padel-pro-s", when: "you need more pace", label: "Pro S+" },
        { productId: "prod-wilson-padel-premier", when: "you want Wilson’s standard Premier", label: "Premier" },
      ],
    }),
    pick({
      productId: "prod-wilson-padel-premier-speed",
      rank: 3,
      awardType: "best-premium",
      role: "Cold / slow-court speed can",
      summary: "Wilson Premier Padel Speed — Dura-Wave felt, faster core for slow conditions.",
      whyWon:
        "Premier Speed owns the condition-specific fast job with Premier Padel circuit positioning. It is not a universal upgrade over standard Premier.",
      whyFits: [
        "I’d pack Speed for cold Dutch evenings and slow glass.",
        "I’d skip it on hot outdoor courts — standard Premier or Pro+ fit better.",
      ],
      bestFor: ["Cold climates", "Slow courts", "Low altitude speed"],
      tradeoff: "Too lively when the court is already fast.",
      avoid: ["Heat/altitude players wanting control"],
      instead: [
        { productId: "prod-wilson-padel-premier", when: "you want standard Premier pace", label: "Premier" },
        { productId: "prod-kuikma-pb-speed", when: "you want FIP value speed", label: "Kuikma PB Speed" },
      ],
    }),
    pick({
      productId: "prod-kuikma-pb-speed",
      rank: 4,
      awardType: "best-value",
      role: "Value FIP fast can",
      summary: "Kuikma PB Speed — FIP-approved value can for cool/slow conditions.",
      whyWon:
        "PB Speed is the value fast competition award: FIP approval, authentic packshot, honest condition positioning vs PB Control.",
      whyFits: [
        "I’d open PB Speed when HEAD Pro S+ is overkill on price.",
        "I’d skip it in heat/altitude — that is PB Control’s job.",
      ],
      bestFor: ["Value competition", "Cool Dutch evenings"],
      tradeoff: "Not the control can for heat/altitude.",
      avoid: ["Players who need published control sibling today"],
      instead: [
        { productId: "prod-head-padel-pro-s", when: "you want the HEAD flagship fast can", label: "Pro S+" },
      ],
    }),
    pick({
      productId: "prod-tecnifibre-padel-team",
      rank: 5,
      awardType: "editors-pick",
      role: "Training volume can",
      summary: "Tecnifibre Padel Team — durability-first training tube.",
      whyWon:
        "Team owns training crates. Match night still gets a competition can. We do not pretend training tubes win tournaments.",
      whyFits: [
        "I’d buy Team by the crate for coaching.",
        "I’d skip it for match day — open Pro+/Pro S+ or Premier instead.",
      ],
      bestFor: ["Training volume", "Coaching crates"],
      tradeoff: "Not a tournament flagship.",
      avoid: ["Match-night shoppers"],
      instead: [
        { productId: "prod-head-padel-pro-plus", when: "you need a match can", label: "Pro+" },
      ],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-wilson-padel-premier",
      "Strong control-side Wilson can — shortlisted as alternative to Pro+, not a fifth award to avoid duplicating the control job.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-head-padel-pro-plus" },
    ),
    considered(
      "prod-bullpadel-premium-pro",
      "Current Bullpadel can with packshot — credible club stock, but less explicit speed/control fork than HEAD/Wilson pairs.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-head-padel-pro-plus" },
    ),
    considered(
      "prod-dunlop-pro-padel",
      "Widely stocked EU competition can — considered for value breadth, not awarded over Kuikma’s clearer condition story.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-kuikma-pb-speed" },
    ),
    considered(
      "prod-adidas-aditour-padel",
      "Stale Aditour naming — superseded by Speed RX. Rejected from awards.",
      "rejected",
      { reasonCode: "previous-generation" },
    ),
    considered(
      "prod-bullpadel-premium-gold",
      "Previous-generation Premium Gold naming — prefer Premium Pro.",
      "rejected",
      { reasonCode: "previous-generation", closestRecommendedProductId: "prod-bullpadel-premium-pro" },
    ),
    considered(
      "prod-kuikma-pb-control",
      "FIP control can for heat/altitude — shortlisted as Pro+/Premier control alternative; Speed stays the value award for cool courts.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-head-padel-pro-plus" },
    ),
    considered(
      "prod-head-padel-team",
      "Training/beginner HEAD can — shortlisted next to Tecnifibre Team for slow socials.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-tecnifibre-padel-team" },
    ),
    considered(
      "prod-head-padel-one",
      "Intermediate HEAD step-up can — considered; Pro+/Team cover the clearer jobs.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-head-padel-pro-plus" },
    ),
    considered(
      "prod-babolat-ace",
      "Babolat competition/APT can — shortlisted as Court’s faster sibling; Court remains the durable club pick.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-babolat-court-padel-balls" },
    ),
    considered(
      "prod-bullpadel-next-pro",
      "2026 Bullpadel flagship Next Pro — shortlisted pending wider NL stock/media; Premium Pro stays the ready Bullpadel award lane.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-bullpadel-premium-pro" },
    ),
    considered(
      "prod-bullpadel-next",
      "Bullpadel Next mid-tier — considered for durable club stock, not awarded over clearer speed/control forks.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-bullpadel-premium-pro" },
    ),
    considered(
      "prod-adidas-serie-tour",
      "Adidas Serie+ Tour — calmer sibling to Speed RX; shortlisted once media/commerce ready.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-adidas-speed-rx" },
    ),
    considered(
      "prod-nox-pro-titanium",
      "NOX Pro Titanium competition can — shortlisted; 3- vs 4-ball cans stay pack offers.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-head-padel-pro-plus" },
    ),
    considered(
      "prod-tretorn-serie-padel-tour",
      "Tretorn Serie+ Tour TRI-TEC — shortlisted for moisture/speed story on NL shelves.",
      "shortlisted",
      { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-wilson-padel-premier-speed" },
    ),
    considered(
      "prod-siux-neo",
      "Siux Neo control/outdoor — shortlisted with Neo Speed as the distinct fast sibling.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-kuikma-pb-control" },
    ),
    considered(
      "prod-siux-neo-speed",
      "Siux Neo Speed indoor/cool — shortlisted next to Pro S+ / Premier Speed fast lane.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-head-padel-pro-s" },
    ),
    considered(
      "prod-tecnifibre-padel-tour",
      "Tecnifibre Tour competition sibling — shortlisted; Team keeps the training award.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-tecnifibre-padel-team" },
    ),
  ],
  comparisonProductIds: [
    "prod-head-padel-pro-s",
    "prod-head-padel-pro-plus",
    "prod-wilson-padel-premier-speed",
  ],
  buyingAdvice:
    "Pick the job: faster match, control match, or training volume. Compare price per can and per ball — never treat a 24-can box as a single-can deal.",
  relatedGuideIds: [
    "best-padel-competition-balls",
    "best-padel-training-balls",
    "best-padel-fast-balls",
    "best-padel-value-balls",
    "best-padel-bags",
    "best-padel-overgrips",
  ],
  hubImageSrc: "/images/padel/products/head-padel-pro-plus-hero.jpg",
  hubImageAlt: "HEAD Pro+ padel balls tube",
});
