import type { BestGuide } from "@/domain/editorial/types";
import {
  considered,
  pick,
  shoeEv,
  shoeGuide,
  SHOE_RELATED,
} from "@/content/padel/best-guides/build";

function shoePick(
  input: Parameters<typeof pick>[0],
): ReturnType<typeof pick> {
  return pick({ ...input, evidenceIds: shoeEv(input.productId) });
}

const TENNIS_CROSSOVER = considered(
  "prod-head-revolt-pro-court",
  "Tennis–padel crossover. Considered and rejected as a padel-shoe award — not a padel-specific default.",
  "rejected",
  { reasonCode: "context-mismatch" },
);

export const padelShoesCategoryGuide: BestGuide = shoeGuide({
  id: "best-padel-shoes",
  slug: "padel-shoes",
  title: "Best Padel Shoes",
  subtitle: "Court shoes for padel turf — not running trainers and not tennis leftovers",
  shortDescription:
    "Role winners for planted stability, club value, plush cushion, connected racers, and club value Kuikma.",
  guideKind: "category",
  rankingMode: "category-picks",
  useCaseIds: [],
  intent:
    "padel court shoes with padel-specific outsoles and published lateral jobs — not tennis crossovers as defaults and not running trainers",
  intro:
    "Best Padel Shoes is a court-shoe shortlist. The job is herringbone or listed padel rubber, a last that plants on a cut, and cushioning that still lets you feel the turf. We awarded Gel-Resolution Padel as the planted flagship, Adidas Courtquick as the club Adidas, Joma T.Slam as the EU club workhorse, Crazyquick Boost as the plush Adidas, Jet Premura as the connected Michelin racer, and Kuikma PS 990 as the value padel shoe. HEAD Revolt Pro Court is a tennis crossover — considered, not awarded. Wide-last awards do not exist in this catalog: T.Slam can run narrow and nobody publishes official width listings. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Outsole and lateral last first. Then cushioning (Boost/GEL versus connected). Then fit last — men’s Courtquick is not Courtquick Women. Tennis crossovers can work for some players; they do not get a padel default award without a padel-specific brief.",
  quickTake: [
    "Choose Gel-Resolution Padel if you want the planted ASICS court last.",
    "Choose Courtquick if you want club Adidas grip without Boost money.",
    "Choose T.Slam if you want EU club value — try the last; it can run narrow.",
    "Choose Crazyquick Boost if you want plush Boost on a padel last.",
    "Choose Jet Premura if you want a connected Michelin padel racer.",
    "Choose PS 990 if you want Kuikma club value.",
  ],
  decisionShortcuts: [
    { need: "Planted ASICS last", productId: "prod-asics-gel-resolution-padel", reason: "Resolution Padel." },
    { need: "Club Adidas", productId: "prod-adidas-courtstabil", reason: "Courtquick." },
    { need: "EU club value", productId: "prod-joma-t-slam", reason: "T.Slam — last can run narrow." },
    { need: "Plush Boost", productId: "prod-adidas-crazyquick-boost-m", reason: "Crazyquick Boost." },
    { need: "Connected Michelin", productId: "prod-babolat-jet-premura", reason: "Jet Premura." },
    { need: "Kuikma value", productId: "prod-kuikma-ps-990", reason: "PS 990." },
  ],
  recommendations: [
    shoePick({
      productId: "prod-asics-gel-resolution-padel",
      rank: 1,
      awardType: "best-overall",
      role: "Planted padel last",
      summary: "Gel-Resolution Padel — high lateral ASICS court shoe, not a running Kayano.",
      whyWon:
        "Resolution Padel ranks first as the planted padel court last: high lateral listing, AHARPLUS, plush GEL that still plays as a court shoe. Crazyquick is the plush Adidas alternative. T.Slam is the value workhorse. Jet Premura is the connected racer.",
      whyFits: [
        "This is a padel-specific ASICS court last. Evaluate it on cuts and glass-court plants, not drop or heel stack.",
        "I'd shortlist it when you want armour and GEL on padel turf. I'd skip it if you wanted Boost’s different plush, or a cheaper Joma last you have actually tried.",
      ],
      bestFor: ["Planted high-lateral play", "Frequent club and match volume", "Players who want ASICS court armour"],
      tradeoff: "Heavier and more armoured than a connected racer like Jet Premura.",
      avoid: ["Players who wanted women’s Resolution last", "Tennis-crossover shoppers expecting Revolt Pro to win"],
      instead: [
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want Boost plush instead of GEL armour", label: "Crazyquick Boost" },
        { productId: "prod-joma-t-slam", when: "you want club value and can try a last that can run narrow", label: "T.Slam" },
        { productId: "prod-asics-gel-resolution-padel-w", when: "you need the women’s Resolution last", label: "Gel-Resolution Padel Women" },
      ],
    }),
    shoePick({
      productId: "prod-adidas-courtstabil",
      rank: 2,
      awardType: "best-value",
      role: "Club Adidas Courtquick",
      summary: "Courtquick — club Adidas padel shoe.",
      whyWon:
        "Courtquick is the club Adidas award: herringbone court rubber and a stable last without Boost pricing. Crazyquick Boost is the plush sibling. Women’s Courtquick is a different last.",
      whyFits: [
        "This is the everyday Adidas padel shoe most club players should try before paying Boost money.",
        "I'd shortlist it for club volume. I'd skip it if you needed Crazyquick’s foam or the women’s Courtquick last.",
      ],
      bestFor: ["Club Adidas", "Stable everyday padel", "Value versus Boost"],
      tradeoff: "Less premium foam than Crazyquick Boost.",
      avoid: ["Women’s last shoppers", "Boost-or-nothing players"],
      instead: [
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want Boost cushioning", label: "Crazyquick Boost" },
        { productId: "prod-adidas-courtquick-w", when: "you need the women’s Courtquick last", label: "Courtquick Women" },
      ],
    }),
    shoePick({
      productId: "prod-joma-t-slam",
      rank: 3,
      awardType: "editors-pick",
      role: "EU club workhorse",
      summary: "T.Slam — club value with high lateral support; last can run narrow.",
      whyWon:
        "T.Slam is the EU club workhorse. It is not a wide-last award — some feet find it narrow, and the catalog has no official width listings. That honesty is why there is no “best for wide feet” page.",
      whyFits: [
        "DURABILITY rubber and high lateral listing at club prices. Try a cut before you buy a stack of pairs.",
        "I'd shortlist it for frequent club play. I'd skip it if you need a guaranteed wide last, or Slam Lady’s women’s last.",
      ],
      bestFor: ["EU club volume", "Value lateral support"],
      tradeoff: "Fit can run narrow; foam is club phylon, not Boost/GEL.",
      extraTradeoffs: ["No published wide last."],
      avoid: ["Players who need a documented wide last", "Women’s Slam Lady shoppers expecting this to be that shoe"],
      instead: [
        { productId: "prod-asics-gel-resolution-padel", when: "you want more armour and GEL", label: "Gel-Resolution Padel" },
        { productId: "prod-joma-slam-lady", when: "you need the women’s Slam last", label: "Slam Lady" },
        { productId: "prod-kuikma-ps-990", when: "you want Kuikma value instead of Joma", label: "PS 990" },
      ],
    }),
    shoePick({
      productId: "prod-adidas-crazyquick-boost-m",
      rank: 4,
      awardType: "best-cushioned",
      role: "Plush Adidas Boost",
      summary: "Crazyquick Boost — plush court foam on a padel last.",
      whyWon:
        "Crazyquick Boost is the plush comfort award on the category page. Resolution is planted GEL. This is Boost. Women’s Crazyquick is a different last.",
      whyFits: [
        "Boost on a padel last is the reason to spend over Courtquick. It is not a running max-cushion shoe.",
        "I'd shortlist it when landing protection on court is the spend. I'd skip it if you wanted a firmer planted last.",
      ],
      bestFor: ["Plush padel sessions", "Adidas players who want Boost"],
      tradeoff: "Taller/plush feel versus Courtquick; premium versus club value.",
      avoid: ["Women’s Crazyquick last", "Players who want a connected racer"],
      instead: [
        { productId: "prod-adidas-courtstabil", when: "you want club Adidas without Boost money", label: "Courtquick" },
        { productId: "prod-adidas-crazyquick-boost-w", when: "you need the women’s Crazyquick last", label: "Crazyquick Boost Women" },
        { productId: "prod-babolat-jet-premura", when: "you want connected court feel, not plush", label: "Jet Premura" },
      ],
    }),
    shoePick({
      productId: "prod-babolat-jet-premura",
      rank: 5,
      badge: "Best connected racer",
      role: "Michelin padel racer",
      summary: "Jet Premura — connected Michelin padel shoe.",
      whyWon:
        "Jet Premura is the connected court-feel award. Resolution and Crazyquick are more cushioned. This is for players who want to feel the turf.",
      whyFits: [
        "Michelin padel outsole and a connected court feel — a racer, not a plush club trainer.",
        "I'd shortlist it when you want speed and feel. I'd skip it if you wanted GEL armour or Boost.",
      ],
      bestFor: ["Connected court feel", "Michelin padel traction"],
      tradeoff: "Less landing protection than Resolution or Crazyquick.",
      avoid: ["Players who need max cushion", "Women’s Sensa last shoppers"],
      instead: [
        { productId: "prod-asics-gel-resolution-padel", when: "you want planted GEL armour", label: "Gel-Resolution Padel" },
        { productId: "prod-head-sprint-pro-4-padel", when: "you want HEAD’s lighter padel racer", label: "Sprint Pro 4" },
      ],
    }),
    shoePick({
      productId: "prod-kuikma-ps-990",
      rank: 6,
      badge: "Best Kuikma club shoe",
      role: "Kuikma value",
      summary: "PS 990 — Kuikma padel court shoe at club money.",
      whyWon:
        "PS 990 is the Kuikma club award. T.Slam is the other value workhorse. We keep both because lasts differ; neither is a wide-last story.",
      whyFits: [
        "Kuikma court rubber at a price you can replace. Moderate lateral versus Resolution’s high listing.",
        "I'd shortlist it on a Decathlon path. I'd skip it if you needed high-lateral armour.",
      ],
      bestFor: ["Kuikma club value", "Replaceable club pairs"],
      tradeoff: "Less armour than Resolution; less foam than Crazyquick.",
      avoid: ["High-lateral specialists", "Boost shoppers"],
      instead: [
        { productId: "prod-joma-t-slam", when: "you want Joma’s high-lateral club last instead", label: "T.Slam" },
        { productId: "prod-adidas-courtstabil", when: "you want Adidas Courtquick", label: "Courtquick" },
      ],
    }),
  ],
  consideredProducts: [
    TENNIS_CROSSOVER,
    considered("prod-nox-at10-lux", "High-lateral Nox. Shortlisted for stability; Resolution keeps the category flagship.", "shortlisted", { reasonCode: "overlap" }),
    considered("prod-head-sprint-pro-4-padel", "Lighter HEAD padel racer. Shortlisted; Jet Premura keeps the connected Michelin role.", "shortlisted", { reasonCode: "overlap" }),
  ],
  comparisonProductIds: [
    "prod-asics-gel-resolution-padel",
    "prod-adidas-courtstabil",
    "prod-joma-t-slam",
    "prod-adidas-crazyquick-boost-m",
    "prod-babolat-jet-premura",
    "prod-kuikma-ps-990",
  ],
  buyingAdvice:
    "Buy a padel court last, not a daily trainer. If you need a women’s last, use that guide — do not downsize a men’s Courtquick and call it done. If you hoped for a wide-feet page, the catalog cannot support it: no official width listings, and T.Slam is noted as potentially narrow.",
  relatedGuideIds: [...SHOE_RELATED],
  hubImageSrc: "/images/padel/products/asics-gel-resolution-padel-hero.jpg",
  hubImageAlt: "ASICS Gel-Resolution Padel — padel court shoe",
});

// Gender guides kept: decision difference is last / fit (not mere sizing).
// Do not collapse into category-only awards — women’s Courtquick / Slam Lady / Sensa are different lasts.
export const padelShoesMenGuide: BestGuide = shoeGuide({
  id: "best-padel-shoes-men",
  slug: "padel-shoes-men",
  title: "Best Padel Shoes for Men",
  subtitle: "Men’s lasts — not a unisex dump",
  shortDescription: "Published men’s lasts for padel court play.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intent:
    "men’s padel court shoes with a men’s last (or the men’s Courtquick listing) — not women’s lasts and not tennis crossovers",
  intro:
    "This page awards men’s padel lasts: Courtquick, Crazyquick Boost, T.Slam, Jet Premura, and Sprint Pro 4. Women’s Courtquick, Crazyquick, Resolution W, Slam Lady, Sensa, and Ionic Woman belong on the women’s guide. Unisex listings are not automatically men’s. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criterion that changes versus the category guide is last: men’s fit. Cushion and lateral still matter, but a women’s last is the wrong award even if the outsole is identical.",
  criteriaChangePoints: [
    { label: "Men’s last", explanation: "Women’s-fit products are rejected here even when they win the women’s guide." },
  ],
  quickTake: [
    "Choose Courtquick as the men’s club Adidas default.",
    "Choose Crazyquick Boost for men’s Boost cushioning.",
    "Choose T.Slam for men’s club value (try the last).",
    "Choose Jet Premura for a men’s connected racer.",
    "Choose Sprint Pro 4 for HEAD’s men’s padel racer.",
  ],
  decisionShortcuts: [
    { need: "Men’s club Adidas", productId: "prod-adidas-courtstabil", reason: "Courtquick men." },
    { need: "Men’s Boost", productId: "prod-adidas-crazyquick-boost-m", reason: "Crazyquick Boost men." },
    { need: "Men’s club Joma", productId: "prod-joma-t-slam", reason: "T.Slam." },
    { need: "Men’s Michelin racer", productId: "prod-babolat-jet-premura", reason: "Jet Premura." },
    { need: "HEAD men’s racer", productId: "prod-head-sprint-pro-4-padel", reason: "Sprint Pro 4." },
  ],
  recommendations: [
    shoePick({
      productId: "prod-adidas-courtstabil",
      rank: 1,
      awardType: "best-overall",
      role: "Men’s club Adidas",
      summary: "Courtquick men’s last — not Courtquick Women.",
      whyWon: "Courtquick is the men’s club default. Women’s Courtquick is a different last on the other page.",
      whyFits: [
        "Men’s Courtquick last with padel herringbone. That is the everyday men’s Adidas court shoe.",
        "I'd shortlist it as the men’s club starting point. I'd skip it if you needed Boost or a women’s last.",
      ],
      bestFor: ["Men’s club Adidas", "Everyday padel"],
      tradeoff: "Not Boost; not the women’s last.",
      avoid: ["Women’s Courtquick shoppers"],
      instead: [
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want men’s Boost", label: "Crazyquick Boost" },
        { productId: "prod-adidas-courtquick-w", when: "you need the women’s last — use that guide", label: "Courtquick Women" },
      ],
    }),
    shoePick({
      productId: "prod-adidas-crazyquick-boost-m",
      rank: 2,
      awardType: "best-cushioned",
      role: "Men’s Boost",
      summary: "Crazyquick Boost men.",
      whyWon: "Men’s Boost last. Women’s Crazyquick is not this award.",
      whyFits: [
        "Same Boost story as the category page, awarded here because the last is men’s.",
        "I'd shortlist it for plush men’s sessions. I'd skip it if you wanted the women’s Crazyquick.",
      ],
      bestFor: ["Men’s Boost padel", "Plush Adidas"],
      tradeoff: "Premium versus Courtquick.",
      avoid: ["Women’s Crazyquick last"],
      instead: [
        { productId: "prod-adidas-courtstabil", when: "you want men’s club Adidas", label: "Courtquick" },
        { productId: "prod-adidas-crazyquick-boost-w", when: "you need the women’s Boost last", label: "Crazyquick Boost Women" },
      ],
    }),
    shoePick({
      productId: "prod-joma-t-slam",
      rank: 3,
      awardType: "best-value",
      role: "Men’s club Joma",
      summary: "T.Slam men’s club last — can run narrow.",
      whyWon: "T.Slam is the men’s Joma workhorse. Slam Lady is the women’s sibling.",
      whyFits: [
        "Men’s high-lateral club last. Try it; narrow is a documented weakness.",
        "I'd shortlist it for men’s club value. I'd skip it if you needed Slam Lady.",
      ],
      bestFor: ["Men’s club value", "High lateral at club prices"],
      tradeoff: "Can run narrow.",
      avoid: ["Slam Lady last", "Documented wide-last shoppers"],
      instead: [
        { productId: "prod-joma-slam-lady", when: "you need Slam Lady", label: "Slam Lady" },
        { productId: "prod-asics-gel-resolution-padel", when: "you want men’s Resolution armour", label: "Gel-Resolution Padel" },
      ],
    }),
    shoePick({
      productId: "prod-babolat-jet-premura",
      rank: 4,
      awardType: "editors-pick",
      role: "Men’s Michelin racer",
      summary: "Jet Premura men’s connected padel shoe.",
      whyWon: "Men’s Jet Premura. Sensa is the women’s Babolat last.",
      whyFits: [
        "Connected Michelin padel racer in the men’s listing.",
        "I'd shortlist it for men’s court feel. I'd skip it if you needed Sensa.",
      ],
      bestFor: ["Men’s connected racer", "Michelin padel"],
      tradeoff: "Less cushion than Resolution/Crazyquick.",
      avoid: ["Sensa last"],
      instead: [
        { productId: "prod-babolat-sensa-women", when: "you need Babolat’s women’s last", label: "Sensa Women" },
        { productId: "prod-head-sprint-pro-4-padel", when: "you want HEAD’s men’s racer", label: "Sprint Pro 4" },
      ],
    }),
    shoePick({
      productId: "prod-head-sprint-pro-4-padel",
      rank: 5,
      badge: "Best HEAD men’s racer",
      role: "Sprint Pro 4",
      summary: "Sprint Pro 4.0 Padel — HEAD men’s padel racer.",
      whyWon: "Sprint Pro 4 is the men’s HEAD padel racer. Revolt Pro Court is a tennis crossover and does not win.",
      whyFits: [
        "HEAD padel-specific racer for men’s listing, not Revolt Pro tennis crossover.",
        "I'd shortlist it in HEAD. I'd skip it if you wanted Jet Premura’s Michelin story.",
      ],
      bestFor: ["HEAD men’s padel", "Lighter racer"],
      tradeoff: "Less armour than Resolution.",
      avoid: ["Revolt Pro as a padel default"],
      instead: [
        { productId: "prod-babolat-jet-premura", when: "you want Michelin Jet Premura", label: "Jet Premura" },
        { productId: "prod-asics-gel-resolution-padel", when: "you want planted ASICS", label: "Gel-Resolution Padel" },
      ],
    }),
  ],
  consideredProducts: [
    TENNIS_CROSSOVER,
    considered("prod-adidas-courtquick-w", "Women’s last. Women’s guide.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-asics-gel-resolution-padel", "Unisex/men’s Resolution remains the category planted flagship; men’s page emphasises explicit men’s lasts.", "shortlisted", { reasonCode: "overlap" }),
  ],
  comparisonProductIds: [
    "prod-adidas-courtstabil",
    "prod-adidas-crazyquick-boost-m",
    "prod-joma-t-slam",
    "prod-babolat-jet-premura",
    "prod-head-sprint-pro-4-padel",
  ],
  buyingAdvice:
    "If the product is a women’s last, it does not belong here. If you play in unisex Resolution, that is still a valid padel shoe — it simply lives on the category and stability pages more than as a men’s-last specialist.",
  relatedGuideIds: [...SHOE_RELATED],
  hubImageSrc: "/images/padel/products/adidas-courtquick-padel-hero.jpg",
  hubImageAlt: "Adidas Courtquick — men’s padel shoe",
});

// Kept: real last / fit distinction beyond sizing — not unjustified duplication of men’s awards.
export const padelShoesWomenGuide: BestGuide = shoeGuide({
  id: "best-padel-shoes-women",
  slug: "padel-shoes-women",
  title: "Best Padel Shoes for Women",
  subtitle: "Women’s lasts — not a downsized men’s Courtquick",
  shortDescription:
    "Published women’s padel shoes. A lighter men’s shoe is not this page.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intent:
    "women’s padel court shoes with women’s lasts — not lighter men’s shoes",
  intro:
    "Women’s padel shoes are about the last and fit, not a lighter men’s pair. We awarded Courtquick Women, Crazyquick Boost Women, Gel-Resolution Padel Women, Joma Slam Lady, Babolat Sensa, and Bullpadel Ionic Woman. Men’s Courtquick, Crazyquick, T.Slam, and Jet Premura were considered and rejected as women’s awards. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criterion that changes is last: women’s fit. Cushion and lateral still apply inside that last. We do not award a men’s racer because it is light.",
  criteriaChangePoints: [
    { label: "Women’s last", explanation: "Men’s-fit products lose even if they won the men’s or category guide." },
  ],
  quickTake: [
    "Choose Courtquick Women for the women’s Adidas club last.",
    "Choose Crazyquick Boost Women for women’s Boost.",
    "Choose Resolution Women for the women’s planted ASICS last.",
    "Choose Slam Lady for Joma’s women’s Slam last.",
    "Choose Sensa for Babolat’s women’s padel last.",
    "Choose Ionic Woman for Bullpadel’s women’s court last.",
  ],
  decisionShortcuts: [
    { need: "Women’s club Adidas", productId: "prod-adidas-courtquick-w", reason: "Courtquick Women." },
    { need: "Women’s Boost", productId: "prod-adidas-crazyquick-boost-w", reason: "Crazyquick Women." },
    { need: "Women’s Resolution", productId: "prod-asics-gel-resolution-padel-w", reason: "Resolution Women." },
    { need: "Women’s Joma Slam", productId: "prod-joma-slam-lady", reason: "Slam Lady." },
    { need: "Women’s Babolat", productId: "prod-babolat-sensa-women", reason: "Sensa." },
    { need: "Bullpadel women’s last", productId: "prod-bullpadel-ionic-woman", reason: "Ionic Woman." },
  ],
  recommendations: [
    shoePick({
      productId: "prod-adidas-courtquick-w",
      rank: 1,
      awardType: "best-overall",
      role: "Women’s club Adidas",
      summary: "Courtquick Women — not a downsized men’s Courtquick.",
      whyWon:
        "Courtquick Women is the women’s Adidas club last. Men’s Courtquick is a different last. That is the entire point of this page.",
      whyFits: [
        "Women’s Courtquick last with padel court rubber. Buy this when you need that last, not a smaller men’s pair.",
        "I'd shortlist it as the women’s club Adidas default. I'd skip it if you needed Boost or Resolution Women armour.",
      ],
      bestFor: ["Women’s club Adidas", "Everyday padel last"],
      tradeoff: "Less foam than Crazyquick Women.",
      avoid: ["Men’s Courtquick as a substitute"],
      instead: [
        { productId: "prod-adidas-crazyquick-boost-w", when: "you want women’s Boost", label: "Crazyquick Boost Women" },
        { productId: "prod-adidas-courtstabil", when: "you actually want the men’s Courtquick last", label: "Courtquick men" },
      ],
    }),
    shoePick({
      productId: "prod-adidas-crazyquick-boost-w",
      rank: 2,
      awardType: "best-cushioned",
      role: "Women’s Boost",
      summary: "Crazyquick Boost Women.",
      whyWon: "Women’s Boost last. Men’s Crazyquick is the other page.",
      whyFits: [
        "Boost on a women’s padel last. Same foam job as men’s Crazyquick, different last.",
        "I'd shortlist it for plush women’s sessions. I'd skip it if you wanted Courtquick Women value.",
      ],
      bestFor: ["Women’s Boost", "Plush Adidas last"],
      tradeoff: "Premium versus Courtquick Women.",
      avoid: ["Men’s Crazyquick as a substitute"],
      instead: [
        { productId: "prod-adidas-courtquick-w", when: "you want women’s club Adidas", label: "Courtquick Women" },
        { productId: "prod-asics-gel-resolution-padel-w", when: "you want women’s Resolution armour", label: "Resolution Women" },
      ],
    }),
    shoePick({
      productId: "prod-asics-gel-resolution-padel-w",
      rank: 3,
      awardType: "best-stability",
      role: "Women’s planted ASICS",
      summary: "Gel-Resolution Padel Women.",
      whyWon: "Women’s Resolution last. Men’s/unisex Resolution is the category flagship, not this last.",
      whyFits: [
        "High-lateral ASICS court armour in the women’s listing.",
        "I'd shortlist it when you want Resolution’s plant in a women’s last. I'd skip it if you wanted Courtquick Women value.",
      ],
      bestFor: ["Women’s planted last", "ASICS court armour"],
      tradeoff: "Heavier than club Adidas.",
      avoid: ["Men’s Resolution as a automatic substitute without trying the last"],
      instead: [
        { productId: "prod-asics-gel-resolution-padel", when: "you want the non-W Resolution listing", label: "Gel-Resolution Padel" },
        { productId: "prod-joma-slam-lady", when: "you want Joma’s women’s Slam last", label: "Slam Lady" },
      ],
    }),
    shoePick({
      productId: "prod-joma-slam-lady",
      rank: 4,
      awardType: "best-value",
      role: "Women’s Joma Slam",
      summary: "Slam Lady — not T.Slam.",
      whyWon: "Slam Lady is the women’s Slam last. T.Slam is men’s and can run narrow.",
      whyFits: [
        "Women’s Joma club last. Do not buy T.Slam and call it the women’s shoe.",
        "I'd shortlist it for women’s club value. I'd skip it if you needed Resolution Women.",
      ],
      bestFor: ["Women’s club Joma", "Slam last"],
      tradeoff: "Club foam versus Boost/GEL.",
      avoid: ["T.Slam as a women’s stand-in"],
      instead: [
        { productId: "prod-joma-t-slam", when: "you actually want men’s T.Slam", label: "T.Slam" },
        { productId: "prod-adidas-courtquick-w", when: "you want women’s Adidas club last", label: "Courtquick Women" },
      ],
    }),
    shoePick({
      productId: "prod-babolat-sensa-women",
      rank: 5,
      awardType: "editors-pick",
      role: "Women’s Babolat",
      summary: "Sensa — Babolat women’s padel last, not Jet Premura.",
      whyWon: "Sensa is Babolat’s women’s padel shoe. Jet Premura is the men’s connected racer.",
      whyFits: [
        "Women’s Babolat last with Michelin-family court rubber.",
        "I'd shortlist it in Babolat women. I'd skip it if you wanted Jet Premura’s men’s racer.",
      ],
      bestFor: ["Women’s Babolat last", "Padel-specific Babolat"],
      tradeoff: "Not Jet Premura’s men’s racer identity.",
      avoid: ["Jet Premura as a women’s substitute"],
      instead: [
        { productId: "prod-babolat-jet-premura", when: "you want men’s Jet Premura", label: "Jet Premura" },
        { productId: "prod-bullpadel-ionic-woman", when: "you want Bullpadel’s women’s last", label: "Ionic Woman" },
      ],
    }),
    shoePick({
      productId: "prod-bullpadel-ionic-woman",
      rank: 6,
      badge: "Best Bullpadel women’s last",
      role: "Ionic Woman",
      summary: "Ionic Woman — Bullpadel women’s court shoe, not Ionic Light the racket.",
      whyWon: "Ionic Woman is the women’s Bullpadel court last. Do not confuse it with Ionic Light the racket.",
      whyFits: [
        "Bullpadel women’s padel last with a hybrid-bottom listing. A court shoe, not the Ionic Light racket.",
        "I'd shortlist it when you want Bullpadel’s women’s shoe. I'd skip it if you wanted Adidas or ASICS women’s lasts.",
      ],
      bestFor: ["Bullpadel women’s court last"],
      tradeoff: "Less of a flagship foam story than Crazyquick or Resolution.",
      avoid: ["Confusing this with Ionic Light the racket"],
      instead: [
        { productId: "prod-adidas-courtquick-w", when: "you want women’s Adidas club last", label: "Courtquick Women" },
        { productId: "prod-babolat-sensa-women", when: "you want Babolat Sensa", label: "Sensa" },
      ],
    }),
  ],
  consideredProducts: [
    considered("prod-adidas-courtstabil", "Men’s Courtquick. Rejected as a women’s award.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-adidas-crazyquick-boost-m", "Men’s Boost. Women’s Crazyquick is the last that belongs here.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-joma-t-slam", "Men’s T.Slam. Slam Lady is the women’s Slam.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-siux-comodo-woman", "Women’s-named listing without a verified authentic last/hero we can award.", "rejected", { reasonCode: "insufficient-evidence" }),
  ],
  comparisonProductIds: [
    "prod-adidas-courtquick-w",
    "prod-adidas-crazyquick-boost-w",
    "prod-asics-gel-resolution-padel-w",
    "prod-joma-slam-lady",
    "prod-babolat-sensa-women",
    "prod-bullpadel-ionic-woman",
  ],
  buyingAdvice:
    "If a shop hands you a men’s Courtquick in a smaller size, that is not a women’s padel shoe. Use this page for last. If you wanted a women’s racket, that is a different Best Guide with different criteria (line, not last).",
  relatedGuideIds: [...SHOE_RELATED],
  hubImageSrc: "/images/padel/products/adidas-courtquick-padel-women-hero.jpg",
  hubImageAlt: "Adidas Courtquick Women — women’s padel shoe",
});

export const padelShoesStabilityGuide: BestGuide = shoeGuide({
  id: "best-padel-shoes-stability",
  slug: "padel-shoes-stability",
  title: "Best Padel Shoes for Stability",
  subtitle: "High lateral court lasts — not running-stability shoes",
  shortDescription:
    "Stability means a high-lateral padel last. Kayano-style running guidance does not apply.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intent:
    "padel court shoes with published high lateral stability and padel-specific outsoles — not running-stability geometry",
  intro:
    "Stability on a padel shoe is a high-lateral court last that plants on a cut. It is not a running medial post. We awarded Gel-Resolution Padel, T.Slam, Courtquick, and Nox AT10 Lux — all listed high lateral on padel-specific outsoles. Crazyquick Boost is more cushion than plant; Jet Premura is more connected racer. Revolt Pro Court is a tennis crossover. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criterion that changes versus comfort: high lateral listing outranks plush foam. Versus category: we drop connected racers that are not high-lateral first.",
  criteriaChangePoints: [
    { label: "High lateral listing", explanation: "Moderate-lateral racers lose even if they are excellent padel shoes." },
    { label: "Court last, not running stability", explanation: "No drop, heel-bevel, or medial-post language." },
  ],
  quickTake: [
    "Choose Resolution Padel for the planted ASICS high-lateral last.",
    "Choose T.Slam for high lateral at club prices (try the last).",
    "Choose Courtquick for Adidas high-lateral club.",
    "Choose AT10 Lux for Nox’s high-lateral padel shoe.",
  ],
  decisionShortcuts: [
    { need: "Planted ASICS", productId: "prod-asics-gel-resolution-padel", reason: "High lateral GEL court last." },
    { need: "Club high lateral", productId: "prod-joma-t-slam", reason: "T.Slam." },
    { need: "Adidas high lateral", productId: "prod-adidas-courtstabil", reason: "Courtquick." },
    { need: "Nox high lateral", productId: "prod-nox-at10-lux", reason: "AT10 Lux." },
  ],
  recommendations: [
    shoePick({
      productId: "prod-asics-gel-resolution-padel",
      rank: 1,
      awardType: "best-stability",
      role: "Planted high-lateral ASICS",
      summary: "Gel-Resolution Padel — high lateral court last.",
      whyWon: "Resolution is the planted high-lateral default. T.Slam is value. Courtquick is Adidas. AT10 Lux is Nox.",
      whyFits: [
        "High lateral plus court armour is the stability job on padel turf.",
        "I'd shortlist it when cuts feel insecure in softer shoes. I'd skip it if you wanted Boost plush more than plant.",
      ],
      bestFor: ["High-lateral plants", "Match-play cuts"],
      tradeoff: "Heavier than racers.",
      avoid: ["Running-stability shoppers expecting Kayano geometry"],
      instead: [
        { productId: "prod-joma-t-slam", when: "you want high lateral at club prices", label: "T.Slam" },
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want plush more than plant — comfort guide", label: "Crazyquick Boost" },
      ],
    }),
    shoePick({
      productId: "prod-joma-t-slam",
      rank: 2,
      awardType: "best-value",
      role: "Club high lateral",
      summary: "T.Slam — high lateral club last.",
      whyWon: "High lateral at club prices. Narrow last is the trade-off, not a wide-stability story.",
      whyFits: [
        "High lateral listing without flagship foam. Try the last.",
        "I'd shortlist it for club stability. I'd skip it if the last feels narrow or you need Resolution armour.",
      ],
      bestFor: ["Club high lateral", "Value stability"],
      tradeoff: "Can run narrow; not a wide last.",
      avoid: ["Wide-last shoppers"],
      instead: [
        { productId: "prod-asics-gel-resolution-padel", when: "you want more armour", label: "Gel-Resolution Padel" },
        { productId: "prod-adidas-courtstabil", when: "you want Adidas high lateral", label: "Courtquick" },
      ],
    }),
    shoePick({
      productId: "prod-adidas-courtstabil",
      rank: 3,
      awardType: "editors-pick",
      role: "Adidas high lateral club",
      summary: "Courtquick — Adidas high-lateral club last.",
      whyWon: "Courtquick is the Adidas high-lateral club shoe. Crazyquick is plush first.",
      whyFits: [
        "Stable Adidas court last without Boost height.",
        "I'd shortlist it for Adidas plant. I'd skip it if you wanted Boost more than stability.",
      ],
      bestFor: ["Adidas high lateral", "Club plant"],
      tradeoff: "Less foam than Crazyquick.",
      avoid: ["Boost-first players"],
      instead: [
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want Boost — comfort guide", label: "Crazyquick Boost" },
        { productId: "prod-nox-at10-lux", when: "you want Nox high lateral", label: "AT10 Lux" },
      ],
    }),
    shoePick({
      productId: "prod-nox-at10-lux",
      rank: 4,
      badge: "Best Nox high lateral",
      role: "AT10 Lux",
      summary: "Nox AT10 Lux — high-lateral Nox padel shoe.",
      whyWon: "AT10 Lux is the Nox high-lateral award. It does not replace Resolution as the planted default.",
      whyFits: [
        "Nox court rubber with a high lateral listing for players already in that system.",
        "I'd shortlist it in Nox. I'd skip it if you wanted ASICS armour or Adidas club.",
      ],
      bestFor: ["Nox high lateral", "Nox-system players"],
      tradeoff: "Less of a flagship armour story than Resolution.",
      avoid: ["Players who wanted ML10 Hexa as a different Nox last without trying Lux"],
      instead: [
        { productId: "prod-asics-gel-resolution-padel", when: "you want ASICS planted armour", label: "Gel-Resolution Padel" },
        { productId: "prod-adidas-courtstabil", when: "you want Adidas club plant", label: "Courtquick" },
      ],
    }),
  ],
  consideredProducts: [
    TENNIS_CROSSOVER,
    considered("prod-adidas-crazyquick-boost-m", "Plush first. Comfort guide, not the stability default.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-babolat-jet-premura", "Connected racer. Category/men’s, not high-lateral first.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-asics-gel-resolution-padel",
    "prod-joma-t-slam",
    "prod-adidas-courtstabil",
    "prod-nox-at10-lux",
  ],
  buyingAdvice:
    "If your ankle feels unsure on a cut, look at high-lateral listings and try the last. If your issue is foam, use the comfort guide. Do not buy a running-stability shoe for padel.",
  relatedGuideIds: [...SHOE_RELATED],
  hubImageSrc: "/images/padel/products/joma-t-slam-hero.jpg",
  hubImageAlt: "Joma T.Slam — stable padel court shoe",
});

export const padelShoesComfortGuide: BestGuide = shoeGuide({
  id: "best-padel-shoes-comfort",
  slug: "padel-shoes-comfort",
  title: "Best Padel Shoes for Comfort",
  subtitle: "Plush court foam — still a padel last",
  shortDescription:
    "Comfort means published plush/high cushion on a padel last. Not a recovery runner.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intent:
    "padel court shoes with published plush or high cushioning on padel-specific lasts — not connected racers as defaults",
  intro:
    "Comfort here is plush or high court cushioning on a padel last — not a recovery runner and not a connected Michelin racer. We awarded Crazyquick Boost for Boost foam on a padel last, Gel-Resolution Padel for GEL protection that still plants, and Nox AT10 Lux as the Nox option that is more cushioned than a racer while staying high-lateral. Jet Premura is connected, not plush. T.Slam is club phylon. Women’s Crazyquick lives on the women’s-last guide. We do not promise injury outcomes. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criterion that changes versus stability: cushioning listing (high or plush) outranks being the firmest plant. Versus the category page: connected racers drop even if they are excellent padel shoes. The last must still be padel-specific. Boost and GEL are different foams; pick the one that matches how you want to land, not a running max-cushion essay.",
  buyingAdvice:
    "Comfort on padel still has to plant. If a shoe is plush but skates on a cut, it failed this job. If you wanted women’s Boost, use Crazyquick Boost Women on the women’s guide rather than downsizing a men’s pair. If your issue is lateral insecurity more than foam, the stability guide is the better page.",
  criteriaChangePoints: [
    { label: "Plush/high cushion", explanation: "Connected racers lose as comfort defaults even if they are excellent shoes." },
  ],
  quickTake: [
    "Choose Crazyquick Boost if you want Boost plush on a padel last.",
    "Choose Resolution Padel if you want GEL protection with a planted last.",
    "Choose AT10 Lux if you want Nox’s more cushioned high-lateral option.",
  ],
  decisionShortcuts: [
    { need: "Boost plush", productId: "prod-adidas-crazyquick-boost-m", reason: "Crazyquick Boost." },
    { need: "GEL court protection", productId: "prod-asics-gel-resolution-padel", reason: "Resolution Padel." },
    { need: "Nox cushioned plant", productId: "prod-nox-at10-lux", reason: "AT10 Lux." },
  ],
  recommendations: [
    shoePick({
      productId: "prod-adidas-crazyquick-boost-m",
      rank: 1,
      awardType: "best-cushioned",
      role: "Boost court comfort",
      summary: "Crazyquick Boost — plush padel last.",
      whyWon: "Boost is the clearest high-cushion padel foam in this catalog. Resolution is GEL armour. Lux is Nox.",
      whyFits: [
        "Plush court landings on a padel last. That is the comfort spend versus Courtquick.",
        "I'd shortlist it when foam is the weekly reason. I'd skip it if you wanted a firmer plant first.",
      ],
      bestFor: ["Plush padel sessions", "Boost on court"],
      tradeoff: "Less connected than Jet Premura; premium versus Courtquick.",
      avoid: ["Connected-racer shoppers", "Women’s Crazyquick last — use that guide"],
      instead: [
        { productId: "prod-asics-gel-resolution-padel", when: "you want GEL armour instead of Boost", label: "Gel-Resolution Padel" },
        { productId: "prod-adidas-crazyquick-boost-w", when: "you need the women’s Boost last", label: "Crazyquick Boost Women" },
      ],
    }),
    shoePick({
      productId: "prod-asics-gel-resolution-padel",
      rank: 2,
      awardType: "editors-pick",
      role: "GEL court protection",
      summary: "Resolution Padel — plush GEL with a planted last.",
      whyWon: "Resolution is comfort-plus-plant. Crazyquick is more foam-first. This is GEL with armour.",
      whyFits: [
        "Plush GEL listing on a high-lateral court last. Comfort that still plants.",
        "I'd shortlist it when you want protection without a racer. I'd skip it if you wanted Boost’s different plush.",
      ],
      bestFor: ["GEL court protection", "Comfort with plant"],
      tradeoff: "Heavier than racers.",
      avoid: ["Players who only wanted a connected racer"],
      instead: [
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want Boost plush", label: "Crazyquick Boost" },
        { productId: "prod-babolat-jet-premura", when: "you want connected feel", label: "Jet Premura" },
      ],
    }),
    shoePick({
      productId: "prod-nox-at10-lux",
      rank: 3,
      badge: "Best Nox comfort plant",
      role: "AT10 Lux",
      summary: "AT10 Lux — Nox high-lateral with more court comfort than a racer.",
      whyWon: "Lux is the Nox comfort-adjacent high-lateral shoe. It does not beat Boost on foam, but it is the Nox option we can actually award.",
      whyFits: [
        "Nox court last with a comfort-leaning plant versus a Michelin racer.",
        "I'd shortlist it in Nox. I'd skip it if you wanted Boost or GEL flagships.",
      ],
      bestFor: ["Nox comfort-leaning plant"],
      tradeoff: "Less foam story than Boost/GEL.",
      avoid: ["Boost-or-GEL shoppers who do not need Nox"],
      instead: [
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want Boost", label: "Crazyquick Boost" },
        { productId: "prod-asics-gel-resolution-padel", when: "you want GEL armour", label: "Gel-Resolution Padel" },
      ],
    }),
  ],
  consideredProducts: [
    considered("prod-babolat-jet-premura", "Connected racer. Opposite of plush comfort.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-joma-t-slam", "Club foam. Value/stability, not plush comfort.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-adidas-crazyquick-boost-m",
    "prod-asics-gel-resolution-padel",
    "prod-nox-at10-lux",
  ],
  relatedGuideIds: [...SHOE_RELATED],
  hubImageSrc: "/images/padel/products/adidas-crazyquick-boost-padel-hero.jpg",
  hubImageAlt: "Adidas Crazyquick Boost — cushioned padel shoe",
});

/** Catalog supports distinction: connected/lighter racers vs armoured/plush club shoes. */
export const padelShoesLightweightGuide: BestGuide = shoeGuide({
  id: "best-padel-shoes-lightweight",
  slug: "padel-shoes-lightweight",
  title: "Best Lightweight Padel Shoes",
  subtitle: "Connected racers and lighter court lasts — not plush armour",
  shortDescription:
    "Lighter / connected padel court shoes: Jet Premura, Sprint Pro 4, Courtquick — not Resolution armour or Boost plush.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intent:
    "padel court shoes whose published job is a lighter or connected racer feel on padel-specific outsoles — not high-armour GEL or Boost plush as defaults",
  intro:
    "Lightweight here means a connected or lighter court last you can turn quickly — not a running trainer and not “whatever weighs less on a spreadsheet.” We award Jet Premura as the connected Michelin racer, Sprint Pro 4 as HEAD’s lighter padel racer, and Courtquick as the lighter club Adidas versus Resolution armour / Crazyquick Boost height. Gel-Resolution and Crazyquick Boost stay considered as the opposite cushion jobs. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Connected or lighter court feel first. Then padel-specific outsole. Then whether you still plant on a cut — a skittery thin shoe fails this page.",
  criteriaChangePoints: [
    {
      label: "Racer / light club over armour",
      explanation: "High-lateral GEL armour and Boost plush lose as lightweight defaults even if they are excellent shoes.",
    },
  ],
  quickTake: [
    "Jet Premura for connected Michelin padel feel.",
    "Sprint Pro 4 for HEAD’s lighter padel racer.",
    "Courtquick when you want club Adidas without Boost / Resolution mass.",
  ],
  decisionShortcuts: [
    { need: "Connected Michelin racer", productId: "prod-babolat-jet-premura", reason: "Jet Premura." },
    { need: "HEAD light racer", productId: "prod-head-sprint-pro-4-padel", reason: "Sprint Pro 4." },
    { need: "Lighter club Adidas", productId: "prod-adidas-courtstabil", reason: "Courtquick." },
  ],
  recommendations: [
    shoePick({
      productId: "prod-babolat-jet-premura",
      rank: 1,
      awardType: "best-overall",
      role: "Connected Michelin racer",
      summary: "Jet Premura — connected Michelin padel shoe.",
      whyWon:
        "Clearest lightweight/connected job in the catalog. Resolution is armour; Crazyquick is plush; this is turf feel.",
      whyFits: [
        "I’d shortlist Jet Premura when I want to feel the sand-filled turf and turn quickly.",
        "I’d skip it if I needed GEL armour or Boost landing protection.",
      ],
      bestFor: ["Connected court feel", "Lighter match nights", "Michelin padel traction"],
      tradeoff: "Less landing protection than Resolution or Crazyquick.",
      avoid: ["Players who need max cushion armour"],
      instead: [
        { productId: "prod-head-sprint-pro-4-padel", when: "you want HEAD’s lighter racer", label: "Sprint Pro 4" },
        { productId: "prod-asics-gel-resolution-padel", when: "you want planted armour instead", label: "Gel-Resolution Padel" },
      ],
    }),
    shoePick({
      productId: "prod-head-sprint-pro-4-padel",
      rank: 2,
      awardType: "editors-pick",
      role: "HEAD lighter padel racer",
      summary: "Sprint Pro 4.0 Padel — HEAD’s lighter padel racer.",
      whyWon:
        "Distinct HEAD light-racer lane versus Jet Premura’s Michelin story. Revolt Pro Court remains a tennis crossover reject.",
      whyFits: [
        "I’d pick Sprint Pro 4 when HEAD kit and a lighter racer matter.",
        "I’d skip it if Jet Premura’s Michelin connected feel is already enough.",
      ],
      bestFor: ["HEAD light racer", "Lighter padel sessions"],
      tradeoff: "Less armour than Resolution.",
      avoid: ["Revolt Pro as a padel lightweight default"],
      instead: [
        { productId: "prod-babolat-jet-premura", when: "you want Michelin Jet Premura", label: "Jet Premura" },
        { productId: "prod-adidas-courtstabil", when: "you want club Adidas instead of a racer", label: "Courtquick" },
      ],
    }),
    shoePick({
      productId: "prod-adidas-courtstabil",
      rank: 3,
      awardType: "best-value",
      role: "Lighter club Adidas",
      summary: "Courtquick — club Adidas without Boost height or Resolution armour.",
      whyWon:
        "Lightest honest club Adidas award versus Crazyquick Boost plush and Resolution mass — still a padel last.",
      whyFits: [
        "I’d take Courtquick when I want everyday Adidas grip without Boost money or armour weight.",
        "I’d skip it if I wanted a true connected Michelin racer.",
      ],
      bestFor: ["Lighter club Adidas", "Everyday padel without Boost"],
      tradeoff: "Not as connected as Jet Premura; not as armoured as Resolution.",
      avoid: ["Boost-or-armour shoppers", "Women’s Courtquick last — use that guide"],
      instead: [
        { productId: "prod-babolat-jet-premura", when: "you want connected racer feel", label: "Jet Premura" },
        { productId: "prod-kuikma-ps-990", when: "you want Kuikma value instead", label: "PS 990" },
      ],
    }),
  ],
  consideredProducts: [
    TENNIS_CROSSOVER,
    considered(
      "prod-asics-gel-resolution-padel",
      "Planted armour — rejected as a lightweight default.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-adidas-crazyquick-boost-m",
      "Plush Boost — rejected as a lightweight default.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-kuikma-ps-990",
      "Kuikma club value — shortlisted; value guide owns the primary award.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-adidas-courtstabil" },
    ),
    considered(
      "prod-joma-t-slam",
      "Club workhorse — shortlisted; can feel heavier/narrower than racers.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-adidas-courtstabil" },
    ),
  ],
  comparisonProductIds: [
    "prod-babolat-jet-premura",
    "prod-head-sprint-pro-4-padel",
    "prod-adidas-courtstabil",
  ],
  buyingAdvice:
    "Lightweight still has to plant on a cut. If you skate sideways, buy stability or comfort instead of chasing grams.",
  relatedGuideIds: [...SHOE_RELATED],
  hubImageSrc: "/images/padel/products/babolat-jet-premura-hero.jpg",
  hubImageAlt: "Babolat Jet Premura — lightweight padel shoe",
});

/** Catalog supports distinction: club-value lasts vs Boost/GEL flagships. */
export const padelShoesValueGuide: BestGuide = shoeGuide({
  id: "best-padel-shoes-value",
  slug: "padel-shoes-value",
  title: "Best Value Padel Shoes",
  subtitle: "Club lasts you can replace — not Boost or Resolution flagship spend",
  shortDescription:
    "Value padel court shoes: Kuikma PS 990, Joma T.Slam, Adidas Courtquick — flagship Boost/GEL stay out of awards.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intent:
    "padel court shoes where club street price and replaceable pairs dominate — not Boost/GEL flagships as value winners",
  intro:
    "Value shoes are club lasts you can replace without Boost or Resolution money. We award Kuikma PS 990, Joma T.Slam, and Adidas Courtquick. Crazyquick Boost and Gel-Resolution Padel stay considered as premium comfort/stability spends — not value crowns. Women’s value lasts live on the women’s guide (Courtquick Women, Slam Lady). Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Street price and replaceable club pairs first. Then padel outsole and lateral listing. Flagship foam is a different guide.",
  criteriaChangePoints: [
    {
      label: "Club price filter",
      explanation: "Boost and Resolution lose as value awards even when they win comfort/stability.",
    },
  ],
  quickTake: [
    "PS 990 for Kuikma club value.",
    "T.Slam for EU high-lateral club value (try the last).",
    "Courtquick for Adidas club value without Boost.",
  ],
  decisionShortcuts: [
    { need: "Kuikma value", productId: "prod-kuikma-ps-990", reason: "PS 990." },
    { need: "EU club value", productId: "prod-joma-t-slam", reason: "T.Slam." },
    { need: "Adidas club value", productId: "prod-adidas-courtstabil", reason: "Courtquick." },
  ],
  recommendations: [
    shoePick({
      productId: "prod-kuikma-ps-990",
      rank: 1,
      awardType: "best-value",
      role: "Kuikma club value",
      summary: "PS 990 — Kuikma padel court shoe at club money.",
      whyWon:
        "Clearest Decathlon-path value padel shoe with authentic hero. T.Slam is the other workhorse; Courtquick is Adidas club.",
      whyFits: [
        "I’d shortlist PS 990 when I want replaceable club pairs without Boost spend.",
        "I’d skip it if I needed high-lateral armour or women’s Kuikma lasts.",
      ],
      bestFor: ["Kuikma club value", "Replaceable pairs", "Budget padel court rubber"],
      tradeoff: "Less armour than Resolution; less foam than Crazyquick.",
      avoid: ["Boost-or-GEL shoppers", "High-lateral specialists who need Resolution"],
      instead: [
        { productId: "prod-joma-t-slam", when: "you want Joma high-lateral club value", label: "T.Slam" },
        { productId: "prod-adidas-courtstabil", when: "you want Adidas Courtquick", label: "Courtquick" },
      ],
    }),
    shoePick({
      productId: "prod-joma-t-slam",
      rank: 2,
      awardType: "editors-pick",
      role: "EU club workhorse value",
      summary: "T.Slam — high lateral club value; last can run narrow.",
      whyWon:
        "High-lateral listing at club prices. Not a wide-last award — try before stacking pairs.",
      whyFits: [
        "I’d shortlist T.Slam for frequent club play on a budget.",
        "I’d skip it if the last feels narrow or you need Slam Lady.",
      ],
      bestFor: ["EU club volume", "High lateral at club prices"],
      tradeoff: "Can run narrow; club phylon, not Boost/GEL.",
      avoid: ["Documented wide-last shoppers", "Slam Lady last"],
      instead: [
        { productId: "prod-kuikma-ps-990", when: "you want Kuikma value instead", label: "PS 990" },
        { productId: "prod-joma-slam-lady", when: "you need the women’s Slam last", label: "Slam Lady" },
      ],
    }),
    shoePick({
      productId: "prod-adidas-courtstabil",
      rank: 3,
      awardType: "best-overall",
      role: "Adidas club value",
      summary: "Courtquick — club Adidas without Boost pricing.",
      whyWon:
        "Adidas value job is Courtquick, not Crazyquick Boost on sale. Women’s Courtquick is a different last.",
      whyFits: [
        "I’d shortlist Courtquick as everyday Adidas court value.",
        "I’d skip it if PS 990 is cheaper for the same weeks or you need Boost.",
      ],
      bestFor: ["Adidas club value", "Stable everyday padel"],
      tradeoff: "Less premium foam than Crazyquick Boost.",
      avoid: ["Boost-or-nothing players", "Women’s Courtquick shoppers"],
      instead: [
        { productId: "prod-kuikma-ps-990", when: "you want Kuikma instead", label: "PS 990" },
        { productId: "prod-adidas-crazyquick-boost-m", when: "you want Boost — comfort guide", label: "Crazyquick Boost" },
      ],
    }),
  ],
  consideredProducts: [
    TENNIS_CROSSOVER,
    considered(
      "prod-adidas-crazyquick-boost-m",
      "Boost flagship — rejected from value awards.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-asics-gel-resolution-padel",
      "GEL armour flagship — rejected from value awards.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-babolat-jet-premura",
      "Connected racer — shortlisted; lightweight guide owns the primary award.",
      "shortlisted",
      { reasonCode: "overlap", closestRecommendedProductId: "prod-adidas-courtstabil" },
    ),
    considered(
      "prod-adidas-courtquick-w",
      "Women’s Courtquick — women’s guide value lane, not this men’s/unisex club page.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
  ],
  comparisonProductIds: [
    "prod-kuikma-ps-990",
    "prod-joma-t-slam",
    "prod-adidas-courtstabil",
  ],
  buyingAdvice:
    "Buy club lasts you will replace. If foam is the weekly reason, pay for Boost/GEL on the comfort guide instead of forcing a value shoe to feel plush.",
  relatedGuideIds: [...SHOE_RELATED],
  hubImageSrc: "/images/padel/products/kuikma-ps-990-hero.jpg",
  hubImageAlt: "Kuikma PS 990 — value padel shoe",
});
