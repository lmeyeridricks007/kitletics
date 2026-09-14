import type { BestGuide } from "@/domain/editorial/types";
import { considered, pick, racketGuide, RACKET_RELATED } from "@/content/padel/best-guides/build";

export const padelRacketsLightweightGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-lightweight",
  slug: "padel-rackets-lightweight",
  title: "Best Lightweight Padel Rackets",
  subtitle: "Published gram bands you can actually swing — not “women’s because light”",
  shortDescription:
    "Lightweight means a published low gram band plus a handling story. It is not a gender synonym.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-maneuverability"],
  intent:
    "lightweight padel rackets with published weight at or below ~360 g and a handling job — not every women’s listing and not a 370 g diamond",
  intro:
    "Lightweight is a published gram band, not a marketing mood. We only awarded frames whose manufacturer weight sits at or under about 360 g and whose job is actually handling: HEAD One Ultralight at 300–303 g, Vertex 05 W at 350–360 g, Ionic Light at 350–360 g, and Air Veron in the 345–365 g band. A 365–375 g Vertex 05 is not light. Comfort Soft is not here just because it is friendly. Women’s rackets are not automatically this page — Vertex 05 W is here because of the 350–360 g split from men’s Vertex, and it still plays as an advanced diamond. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Static grams first, then balance. A 300 g high-balance frame can still feel head-heavy. Medium-balance 350–360 g hybrids are often easier to live with than an ultralight with a 265 high-balance listing. We do not treat “for women” as a light filter.",
  criteriaChangePoints: [
    {
      label: "Published grams",
      explanation: "If the sheet is 365–375 g, it does not win a lightweight award.",
    },
    {
      label: "Not a gender synonym",
      explanation: "Women’s guides use last and line. This page uses weight band.",
    },
  ],
  quickTake: [
    "Choose One Ultralight if you want the ~300 g adult Head.",
    "Choose Vertex 05 W if you want Vertex geometry in a 350–360 g band.",
    "Choose Ionic Light if you want a 350–360 g hybrid, not a diamond.",
    "Choose Air Veron if you want Babolat’s lighter Veron all-court.",
  ],
  decisionShortcuts: [
    { need: "~300 g adult Head", productId: "prod-head-one-ultralight", reason: "One Ultralight." },
    { need: "Lighter Vertex diamond", productId: "prod-bullpadel-vertex-05-w", reason: "Vertex 05 W 350–360 g." },
    { need: "Light hybrid", productId: "prod-bullpadel-ionic-light", reason: "Ionic Light 350–360 g." },
    { need: "Light Babolat Veron", productId: "prod-babolat-air-veron", reason: "Air Veron." },
  ],
  recommendations: [
    pick({
      productId: "prod-head-one-ultralight",
      rank: 1,
      awardType: "best-lightweight",
      role: "Ultralight adult Head",
      summary: "HEAD One Ultralight — 300–303 g, not Coello Pro.",
      whyWon:
        "One Ultralight is the catalog’s genuine ~300 g adult racket. That is a different job from a 350 g hybrid. It ranks first on grams, with the honest note that listed balance can be high.",
      whyFits: [
        "300–303 g is a real swing-weight story for learning and for players who cannot live with 370 g Pro frames.",
        "I'd shortlist it when mass is the weekly fight. I'd skip it if you wanted a 350 g hybrid with more plow-through, or if high balance worries you.",
      ],
      bestFor: ["Lowest published adult mass", "Casual and beginner handling", "Players fighting 370 g flags"],
      tradeoff: "Little plow-through; listed high balance means it is light, not handle-heavy by default.",
      avoid: ["Advanced smash", "Anyone treating this as a women’s racket because it is light"],
      instead: [
        { productId: "prod-bullpadel-ionic-light", when: "you want a 350–360 g hybrid with more structure", label: "Ionic Light" },
        { productId: "prod-adidas-match-light", when: "you want Adidas’s light entry instead", label: "Match Light" },
      ],
      useCaseIds: ["uc-padel-maneuverability", "uc-padel-beginner"],
    }),
    pick({
      productId: "prod-bullpadel-vertex-05-w",
      rank: 2,
      awardType: "editors-pick",
      role: "Lighter Vertex diamond",
      summary: "Vertex 05 W — 350–360 g Vertex, not a cosmetic women’s paint.",
      whyWon:
        "Vertex 05 W is here because the published band is 350–360 g versus 365–375 g on Vertex 05, with Fibrix instead of 12K. It is still an advanced diamond. It is not on this page “because women.”",
      whyFits: [
        "The weight split from men’s Vertex 05 is the lightweight story. Fibrix and medium balance are the other published differences.",
        "I'd shortlist it when Vertex geometry is the job and 365–375 g is too slow. I'd skip it if you needed Ionic Light’s hybrid, or Indiga as a first racket.",
      ],
      bestFor: ["Advanced players who want Vertex under 360 g", "Handling inside the Vertex family"],
      tradeoff: "Still a diamond — not Indiga, and smash ceiling is not men’s 12K Vertex.",
      avoid: ["Beginners", "Players who wanted men’s 12K Vertex 05"],
      instead: [
        { productId: "prod-bullpadel-vertex-05", when: "you want the 365–375 g 12K Vertex", label: "Vertex 05" },
        { productId: "prod-bullpadel-ionic-light", when: "you want a hybrid, not a lighter diamond", label: "Ionic Light" },
      ],
      useCaseIds: ["uc-padel-maneuverability", "uc-padel-advanced"],
    }),
    pick({
      productId: "prod-bullpadel-ionic-light",
      rank: 3,
      badge: "Best light hybrid",
      role: "350–360 g hybrid",
      summary: "Ionic Light — light Next hybrid, not Vertex 05 W.",
      whyWon:
        "Ionic Light is the light hybrid. Vertex 05 W is the light diamond. They are not interchangeable.",
      whyFits: [
        "350–360 g plus medium balance is why Ionic exists beside Vertex 05 W.",
        "I'd shortlist it for intermediate handling. I'd skip it if you wanted Vertex geometry or One Ultralight’s 300 g.",
      ],
      bestFor: ["Light hybrid all-court", "Intermediate handling"],
      tradeoff: "Not Pro Line 12K.",
      avoid: ["Beginners who still need Indiga", "12K Vertex shoppers"],
      instead: [
        { productId: "prod-head-one-ultralight", when: "you want ~300 g", label: "One Ultralight" },
        { productId: "prod-bullpadel-vertex-05-w", when: "you want lighter Vertex diamond", label: "Vertex 05 W" },
      ],
      useCaseIds: ["uc-padel-maneuverability", "uc-padel-intermediate"],
    }),
    pick({
      productId: "prod-babolat-air-veron",
      rank: 4,
      badge: "Best light Babolat all-court",
      role: "Air Veron",
      summary: "Air Veron in a lighter Veron band — not Air Viper.",
      whyWon:
        "Air Veron is the lighter Babolat all-court. Air Viper is the handling Viper on maneuverability. Technical Viper is the heavy striker.",
      whyFits: [
        "Veron’s lighter band is the Babolat lightweight all-court, not a Viper Pro.",
        "I'd shortlist it in Babolat when Viper mass is the complaint. I'd skip it if you wanted Air Viper’s specialist handling.",
      ],
      bestFor: ["Light Babolat all-court", "Players leaving heavier Vipers"],
      tradeoff: "Not Technical Viper’s strike mass.",
      avoid: ["Technical Viper strikers"],
      instead: [
        { productId: "prod-babolat-air-viper", when: "you want Air Viper handling", label: "Air Viper" },
        { productId: "prod-bullpadel-ionic-light", when: "you want Bullpadel’s 350–360 g hybrid", label: "Ionic Light" },
      ],
      useCaseIds: ["uc-padel-maneuverability", "uc-padel-balanced"],
    }),
  ],
  consideredProducts: [
    considered("prod-bullpadel-vertex-05", "365–375 g diamond. Not a lightweight award.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-kuikma-pr-comfort-soft", "Comfort round, not a published ultralight specialist.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-adidas-match-light", "Light Adidas entry — awarded on beginners; One Ultralight takes the gram specialist here.", "shortlisted", { reasonCode: "overlap" }),
  ],
  comparisonProductIds: [
    "prod-head-one-ultralight",
    "prod-bullpadel-vertex-05-w",
    "prod-bullpadel-ionic-light",
    "prod-babolat-air-veron",
  ],
  buyingAdvice:
    "Ask for the gram band on the sheet. If it is 365 g+, this is the wrong guide. If you were sent here because you are a woman, read the women’s guide instead: last and line matter more than “buy light.”",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/head-one-ultralight-hero.jpg",
  hubImageAlt: "HEAD One Ultralight — lightweight padel racket",
});

export const padelRacketsComfortGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-comfort",
  slug: "padel-rackets-comfort",
  title: "Best Padel Rackets for Comfort",
  subtitle: "Soft cores and comfort constructions — not a medical claim",
  shortDescription:
    "Comfort means published soft cores and comfort faces. We do not diagnose arms or promise injury outcomes.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-arm-comfort"],
  intent:
    "comfort padel rackets with published soft cores, Fibrix/comfort faces, or manufacturer comfort lines — not stiff 18K smash diamonds as a default",
  intro:
    "Comfort here is a construction choice: soft cores, Fibrix/comfort faces, and manufacturer comfort lines. It is not a medical claim and it is not “whatever is light.” We awarded PR Comfort Soft, Equation Soft, Indiga CTR, Hack 04 Comfort, and Coello Team. Hack 04 18K and Metalbone HRD+ were considered and rejected as comfort defaults. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Core and face first: SoftEva, soft EVA, Fibrix comfort faces. Weight helps only after the core is actually soft. A light stiff diamond can still feel harsh. We do not promise tennis-elbow outcomes.",
  criteriaChangePoints: [
    {
      label: "Core over slogans",
      explanation: "Comfort in the name (Hack 04 Comfort) must match a distinct face/core, not a sticker.",
    },
    {
      label: "No medical claims",
      explanation: "Softer feel is a product description. It is not treatment advice.",
    },
  ],
  quickTake: [
    "Choose PR Comfort Soft if you want the value soft round.",
    "Choose Equation Soft if you want Nox’s soft Advanced.",
    "Choose Indiga CTR if you want Bullpadel SoftEva beginner comfort.",
    "Choose Hack 04 Comfort if you want Hack geometry with a Fibrix face.",
    "Choose Coello Team if you want Head’s Team Coello instead of Pro stiffness.",
  ],
  decisionShortcuts: [
    { need: "Value soft round", productId: "prod-kuikma-pr-comfort-soft", reason: "Comfort Soft." },
    { need: "Nox soft Advanced", productId: "prod-nox-equation-soft-2026", reason: "Equation Soft." },
    { need: "Bullpadel SoftEva", productId: "prod-bullpadel-indiga-ctr", reason: "Indiga CTR." },
    { need: "Softer Hack", productId: "prod-bullpadel-hack-04-comfort", reason: "Hack 04 CMF Fibrix." },
    { need: "Softer Coello family", productId: "prod-head-coello-team", reason: "Team, not Pro." },
  ],
  recommendations: [
    pick({
      productId: "prod-kuikma-pr-comfort-soft",
      rank: 1,
      awardType: "best-overall",
      role: "Value comfort round",
      summary: "PR Comfort Soft — published soft round.",
      whyWon:
        "Comfort Soft is the default comfort award: a published soft round with authentic photography. Equation Soft is the Nox path. Indiga is Bullpadel SoftEva. Hack 04 Comfort is comfort inside an attacking mould — a different job.",
      whyFits: [
        "Soft round construction is the honest comfort default. You give up smash ceiling on purpose.",
        "I'd shortlist it when the week is arm comfort and budget. I'd skip it if you wanted Fibrix Hack geometry.",
      ],
      bestFor: ["Soft-core club play", "Value comfort", "Players who should not start on 18K"],
      tradeoff: "Low finishing ceiling.",
      avoid: ["18K smash shoppers", "Photo-blocked PR Soft 500"],
      instead: [
        { productId: "prod-bullpadel-hack-04-comfort", when: "you want attacking geometry with a comfort face", label: "Hack 04 Comfort" },
        { productId: "prod-nox-equation-soft-2026", when: "you want Nox soft Advanced", label: "Equation Soft" },
      ],
      useCaseIds: ["uc-padel-arm-comfort"],
    }),
    pick({
      productId: "prod-nox-equation-soft-2026",
      rank: 2,
      awardType: "editors-pick",
      role: "Nox soft Advanced",
      summary: "Equation Soft — softer Nox, not Genius carbon.",
      whyWon: "Equation Soft is Nox comfort without pretending Genius 12K is a comfort frame.",
      whyFits: [
        "Soft Advanced Nox for players who want Nox feel without HR3/12K firmness.",
        "I'd shortlist it on a Nox comfort path. I'd skip it if you wanted ML10’s classic cup more than softness.",
      ],
      bestFor: ["Nox comfort", "Soft Advanced"],
      tradeoff: "Not a classic ML10 cup.",
      avoid: ["Genius 12K as a comfort substitute"],
      instead: [
        { productId: "prod-nox-ml10-pro-cup", when: "you want the classic cup more than softness", label: "ML10 Pro Cup" },
        { productId: "prod-kuikma-pr-comfort-soft", when: "you want the value round", label: "PR Comfort Soft" },
      ],
      useCaseIds: ["uc-padel-arm-comfort"],
    }),
    pick({
      productId: "prod-bullpadel-indiga-ctr",
      rank: 3,
      awardType: "best-beginner",
      role: "SoftEva beginner comfort",
      summary: "Indiga CTR — SoftEva Tour comfort.",
      whyWon: "Indiga is Bullpadel’s SoftEva comfort on-ramp. It is here for core, not because every beginner racket is “comfy.”",
      whyFits: [
        "SoftEva plus round is a comfort construction, not just a level tag.",
        "I'd shortlist it when you are learning and want the soft Bullpadel. I'd skip it if you wanted Fibrix Hack Comfort.",
      ],
      bestFor: ["Beginner SoftEva", "Bullpadel comfort on-ramp"],
      tradeoff: "Power ceiling of a Tour beginner.",
      avoid: ["Advanced 12K shoppers"],
      instead: [
        { productId: "prod-bullpadel-hack-04-comfort", when: "you want comfort inside Hack geometry", label: "Hack 04 Comfort" },
        { productId: "prod-kuikma-pr-comfort-soft", when: "you want the value round", label: "PR Comfort Soft" },
      ],
      useCaseIds: ["uc-padel-arm-comfort", "uc-padel-beginner"],
    }),
    pick({
      productId: "prod-bullpadel-hack-04-comfort",
      rank: 4,
      badge: "Best comfort attack",
      role: "Fibrix Hack",
      summary: "Hack 04 Comfort — Hack geometry with Fibrix, not 18K Hack 04.",
      whyWon:
        "Hack 04 Comfort is the comfort face on Hack geometry. That is a real product difference (Fibrix vs 18K), not a sticker. It does not replace the soft rounds as the default comfort tool.",
      whyFits: [
        "Fibrix on the Hack platform is for players who want attack shape with an easier face than 18K.",
        "I'd shortlist it when 18K Hack is too harsh and you still want Hack. I'd skip it if you needed a round soft core.",
      ],
      bestFor: ["Attack geometry with easier feel", "Hack family without 18K"],
      tradeoff: "Still a Hack outline — not Indiga.",
      avoid: ["Beginners", "Players who wanted Hack 04 18K"],
      instead: [
        { productId: "prod-bullpadel-hack-04", when: "you want the 18K Hack", label: "Hack 04" },
        { productId: "prod-kuikma-pr-comfort-soft", when: "you want a round soft core", label: "PR Comfort Soft" },
      ],
      useCaseIds: ["uc-padel-arm-comfort", "uc-padel-easy-power"],
    }),
    pick({
      productId: "prod-head-coello-team",
      rank: 5,
      badge: "Best Team Coello comfort",
      role: "Coello Team",
      summary: "Coello Team — not Coello Pro stiffness.",
      whyWon: "Team is the comfort-adjacent Coello. Pro is the stiff diamond on power/advanced.",
      whyFits: [
        "Team exists so Coello family players can step off Pro stiffness.",
        "I'd shortlist it when Coello Pro felt harsh. I'd skip it if you wanted a round SoftEva.",
      ],
      bestFor: ["HEAD Team comfort", "Coello without Pro demand"],
      tradeoff: "Still not a soft round.",
      avoid: ["Coello Pro finishers", "Round-beginner shoppers"],
      instead: [
        { productId: "prod-head-coello-pro", when: "you want Pro stiffness on purpose", label: "Coello Pro" },
        { productId: "prod-bullpadel-indiga-ctr", when: "you need a soft round", label: "Indiga CTR" },
      ],
      useCaseIds: ["uc-padel-arm-comfort", "uc-padel-intermediate"],
    }),
  ],
  consideredProducts: [
    considered("prod-bullpadel-hack-04", "18K Hack. Power guide, not comfort default.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-adidas-metalbone-hrd", "High Memory stiffness. Opposite comfort job.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-kuikma-pr-comfort-soft",
    "prod-nox-equation-soft-2026",
    "prod-bullpadel-indiga-ctr",
    "prod-bullpadel-hack-04-comfort",
    "prod-head-coello-team",
  ],
  buyingAdvice:
    "If a frame is light but stiff, it is not this page. If a frame is named Comfort, check that the face/core actually changed (Hack 04 Comfort vs 18K). This is not treatment advice for elbow pain — see a clinician for that.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/kuikma-pr-comfort-soft-hero.jpg",
  hubImageAlt: "Kuikma PR Comfort Soft — comfort padel racket",
});

export const padelRacketsManeuverabilityGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-maneuverability",
  slug: "padel-rackets-maneuverability",
  title: "Best Padel Rackets for Maneuverability",
  subtitle: "Low-to-mid balance and Motion/Air handling lines",
  shortDescription:
    "Maneuverability is how fast the face gets there. It is not the same as “best for women” or “best lightweight.”",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-maneuverability"],
  intent:
    "maneuverable padel rackets: manufacturer Motion/Air/Light lines and low-to-medium balance handling jobs — not high-balance smash diamonds",
  intro:
    "Maneuverability is preparation speed: getting the face on time at the net and on the glass. We awarded manufacturer handling lines — Ionic Light, Air Viper, Coello Motion, Gravity Motion, and Extreme Motion — not every light racket and not every women’s listing. One Ultralight is lighter still but lives on the lightweight guide because its high-balance listing is a different specialist. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Balance and line name matter as much as grams. Motion and Air families are built for this job. High-balance diamonds can be relatively light and still feel late. Women’s last is a different guide.",
  criteriaChangePoints: [
    {
      label: "Handling lines",
      explanation: "Motion / Air / Light families outrank generic “light” marketing.",
    },
    {
      label: "Balance, not only grams",
      explanation: "High-balance ultralights can still feel head-heavy.",
    },
  ],
  quickTake: [
    "Choose Ionic Light if you want a 350–360 g medium-balance hybrid.",
    "Choose Air Viper if you want Babolat’s handling Viper.",
    "Choose Coello Motion if you want Coello handling, not Coello Pro.",
    "Choose Gravity Motion if you want Gravity handling, not Gravity Pro.",
    "Choose Extreme Motion if you want HEAD Extreme’s handling sibling.",
  ],
  decisionShortcuts: [
    { need: "Light Bullpadel hybrid", productId: "prod-bullpadel-ionic-light", reason: "Ionic Light." },
    { need: "Babolat Air Viper", productId: "prod-babolat-air-viper", reason: "Air Viper." },
    { need: "Coello handling", productId: "prod-head-coello-motion", reason: "Coello Motion." },
    { need: "Gravity handling", productId: "prod-head-gravity-motion", reason: "Gravity Motion." },
    { need: "Extreme handling", productId: "prod-head-extreme-motion-2026", reason: "Extreme Motion." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-ionic-light",
      rank: 1,
      awardType: "best-overall",
      role: "Medium-balance light hybrid",
      summary: "Ionic Light — handling hybrid, not Vertex 05 W diamond.",
      whyWon:
        "Ionic Light ranks first for maneuverability because medium balance plus 350–360 g is a usable handling default. Air Viper and the HEAD Motion siblings are brand-specific handling lines. One Ultralight is lighter but high balance.",
      whyFits: [
        "Medium balance is why Ionic is easier to live with than some ultralight high-balance frames.",
        "I'd shortlist it as the default handling hybrid. I'd skip it if you wanted a Motion-named HEAD or Air Viper.",
      ],
      bestFor: ["Hybrid handling", "Intermediate net speed"],
      tradeoff: "Not a Pro diamond.",
      avoid: ["High-balance smash shoppers"],
      instead: [
        { productId: "prod-babolat-air-viper", when: "you want Babolat Air Viper", label: "Air Viper" },
        { productId: "prod-head-coello-motion", when: "you want Coello Motion", label: "Coello Motion" },
      ],
      useCaseIds: ["uc-padel-maneuverability"],
    }),
    pick({
      productId: "prod-babolat-air-viper",
      rank: 2,
      awardType: "editors-pick",
      role: "Air Viper",
      summary: "Air Viper — Babolat handling Viper, not Technical.",
      whyWon: "Air Viper is the handling Viper. Technical is the striker. Counter is the counter.",
      whyFits: [
        "Air Viper is Babolat’s handling specialist in the Viper family.",
        "I'd shortlist it when Technical Viper felt late. I'd skip it if you wanted Veron’s all-court lighter mould.",
      ],
      bestFor: ["Babolat handling", "Viper without Technical mass"],
      tradeoff: "Less strike mass than Technical Viper.",
      avoid: ["Technical strikers", "Beginner rounds"],
      instead: [
        { productId: "prod-babolat-technical-viper", when: "you want the striker diamond", label: "Technical Viper" },
        { productId: "prod-babolat-air-veron", when: "you want Veron all-court instead", label: "Air Veron" },
      ],
      useCaseIds: ["uc-padel-maneuverability"],
    }),
    pick({
      productId: "prod-head-coello-motion",
      rank: 3,
      badge: "Best Coello handling",
      role: "Coello Motion",
      summary: "Coello Motion — not Coello Pro.",
      whyWon: "Motion is the Coello handling sibling. Pro is the smash diamond.",
      whyFits: [
        "Coello Motion exists so Coello players can keep the family without Pro mass.",
        "I'd shortlist it in HEAD Coello handling. I'd skip it if you wanted Pro smash or Team as a step.",
      ],
      bestFor: ["Coello handling", "HEAD Motion net speed"],
      tradeoff: "Ceiling below Coello Pro.",
      avoid: ["Coello Pro finishers"],
      instead: [
        { productId: "prod-head-coello-pro", when: "you want Coello Pro", label: "Coello Pro" },
        { productId: "prod-head-gravity-motion", when: "you want Gravity Motion instead", label: "Gravity Motion" },
      ],
      useCaseIds: ["uc-padel-maneuverability"],
    }),
    pick({
      productId: "prod-head-gravity-motion",
      rank: 4,
      badge: "Best Gravity handling",
      role: "Gravity Motion",
      summary: "Gravity Motion — handling Gravity, not Gravity Pro.",
      whyWon: "Motion is the Gravity handling award. Pro is advanced control.",
      whyFits: [
        "Gravity Motion is for players who want Gravity ideas with less mass than Pro.",
        "I'd shortlist it when Gravity Pro felt late. I'd skip it if you wanted Gravity Pro control at full Pro mass.",
      ],
      bestFor: ["Gravity handling", "HEAD control family without Pro mass"],
      tradeoff: "Less Pro stability than Gravity Pro.",
      avoid: ["Gravity Pro players who already want that mass"],
      instead: [
        { productId: "prod-head-gravity-pro", when: "you want Gravity Pro", label: "Gravity Pro" },
        { productId: "prod-head-extreme-motion-2026", when: "you want Extreme Motion", label: "Extreme Motion" },
      ],
      useCaseIds: ["uc-padel-maneuverability", "uc-padel-control"],
    }),
    pick({
      productId: "prod-head-extreme-motion-2026",
      rank: 5,
      badge: "Best Extreme handling",
      role: "Extreme Motion",
      summary: "Extreme Motion — handling Extreme, not Extreme Pro.",
      whyWon: "Extreme Motion is the handling Extreme. Extreme Pro is a different demand.",
      whyFits: [
        "Extreme Motion is HEAD’s Extreme handling sibling for players who want that family without Pro tax.",
        "I'd shortlist it in Extreme handling. I'd skip it if you wanted Speed Pro all-court or Gravity Motion control handling.",
      ],
      bestFor: ["Extreme family handling", "HEAD Motion in Extreme"],
      tradeoff: "Not Extreme Pro.",
      avoid: ["Extreme Pro shoppers expecting this to be that frame"],
      instead: [
        { productId: "prod-head-extreme-pro-padel", when: "you want Extreme Pro", label: "Extreme Pro" },
        { productId: "prod-head-coello-motion", when: "you want Coello Motion instead", label: "Coello Motion" },
      ],
      useCaseIds: ["uc-padel-maneuverability"],
    }),
  ],
  consideredProducts: [
    considered("prod-head-one-ultralight", "Lighter still, but high-balance specialist — lightweight guide.", "shortlisted", { reasonCode: "niche" }),
    considered("prod-bullpadel-vertex-05-w", "Lighter Vertex diamond. Lightweight/women’s guides, not a Motion-line default.", "shortlisted", { reasonCode: "niche" }),
    considered("prod-head-coello-pro", "Pro diamond. Power/advanced, not handling default.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-bullpadel-ionic-light",
    "prod-babolat-air-viper",
    "prod-head-coello-motion",
    "prod-head-gravity-motion",
    "prod-head-extreme-motion-2026",
  ],
  buyingAdvice:
    "If the problem is late volleys, look at balance and Motion/Air lines. If the problem is only grams, use the lightweight guide. If the problem is last/shape for women, use the women’s guide — do not assume maneuverability equals women’s racket.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/babolat-air-viper-hero.jpg",
  hubImageAlt: "Babolat Air Viper — maneuverable padel racket",
});

export const padelRacketsWomenGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-women",
  slug: "padel-rackets-women",
  title: "Best Padel Rackets for Women",
  subtitle: "Women’s line and last — not a lighter men’s diamond with a new colourway",
  shortDescription:
    "Two published frames whose manufacturer segment is actually women’s / Vertex W — not every sub-360 g racket.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: [],
  intentionallyNarrow: true,
  intent:
    "women’s padel rackets whose manufacturer segment is a women’s line or official women/intermediate listing — not “light equals women”",
  intro:
    "Women’s padel rackets are not “the light ones.” A lighter men’s diamond is still a men’s diamond. We only awarded frames whose manufacturer segment is actually a women’s line or an official women/intermediate listing: Vertex 05 W (Delfi Brea’s Vertex: Fibrix, 350–360 g, medium balance versus the men’s 12K Vertex at 365–375 g and high-ish mass) and Ionic Light (Bullpadel’s Next-line hybrid listed for women / intermediate). One Ultralight is a 300 g adult Head, not a women’s last. Comfort Soft is a value round, not a women’s last. Men’s Vertex 05 is the 12K sibling, not a downsized W. Two recommendations is intentional — the catalog does not support a fake third women’s award. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Selection criteria, in order: (1) manufacturer women’s line or official women/intermediate segment, (2) published differences versus the men’s sibling (weight band, face, balance), (3) whether the mould still matches the player’s level. Vertex 05 W is still an advanced diamond. Ionic Light is an intermediate hybrid. Neither is Indiga. We do not assume women need less power as a personality type. We do not award a light unisex frame as women’s because the gram number looks friendly.",
  criteriaChangePoints: [
    {
      label: "Line and last, not grams",
      explanation:
        "Women’s Vertex 05 W differs from Vertex 05 on Fibrix, 350–360 g, and medium balance. That is a product difference, not a colourway.",
    },
    {
      label: "Level still applies",
      explanation:
        "Vertex 05 W is advanced. Ionic Light is intermediate. A woman beginner still wants Indiga, which is not a women’s last — it is a beginner round for anyone.",
    },
    {
      label: "Intentionally narrow",
      explanation:
        "We will not invent a third women’s award from One Ultralight or Comfort Soft.",
    },
  ],
  quickTake: [
    "Choose Vertex 05 W if you want Vertex geometry in the official 350–360 g women’s Vertex — still an advanced diamond.",
    "Choose Ionic Light if you want Bullpadel’s official women/intermediate hybrid, not a Vertex.",
    "If you are a beginner, use the beginner guide (Indiga / Comfort Soft) — those are not “women’s because light.”",
  ],
  decisionShortcuts: [
    { need: "Women’s Vertex last", productId: "prod-bullpadel-vertex-05-w", reason: "Vertex 05 W — Fibrix, 350–360 g." },
    { need: "Women/intermediate hybrid", productId: "prod-bullpadel-ionic-light", reason: "Ionic Light Next line." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-vertex-05-w",
      rank: 1,
      awardType: "best-overall",
      role: "Official women’s Vertex",
      summary: "Vertex 05 W — Delfi Brea’s Vertex, not a painted men’s 05.",
      whyWon:
        "Vertex 05 W wins because it is the published women’s Vertex: 350–360 g, Fibrix, medium balance, advanced / Total Play. Men’s Vertex 05 is 12K at 365–375 g. Ionic Light is the other women’s-segment hybrid. A third “light” racket would be a fake women’s award.",
      whyFits: [
        "Bullpadel lists Vertex 05 W as the women’s/light Vertex with Fibrix and Multieva. That is a construction split from the men’s 12K Vertex 05, not a lighter paint.",
        "It is still an advanced diamond. I'd shortlist it when you already play at that level and want Vertex geometry you can move. I'd skip it if you needed Ionic Light’s hybrid or Indiga as a first racket — those are different jobs, including for women beginners.",
      ],
      bestFor: [
        "Advanced players who want the official Vertex 05 W last",
        "Players who found men’s Vertex 05 365–375 g too slow and want the W construction, not a random light frame",
      ],
      tradeoff:
        "Still a diamond at advanced level — Fibrix is more elastic than 12K, but this is not a beginner round.",
      extraTradeoffs: ["Smash ceiling is not the men’s 12K Vertex 05."],
      avoid: [
        "Beginners of any gender who need Indiga",
        "Players who want the 12K men’s Vertex 05",
        "Shoppers who only wanted “something light” (see lightweight guide)",
      ],
      instead: [
        { productId: "prod-bullpadel-ionic-light", when: "you want the women/intermediate hybrid, not an advanced diamond", label: "Ionic Light" },
        { productId: "prod-bullpadel-vertex-05", when: "you want the 12K men’s Vertex 05", label: "Vertex 05" },
        { productId: "prod-bullpadel-indiga-ctr", when: "you need a first racket, regardless of gender", label: "Indiga CTR" },
      ],
      useCaseIds: ["uc-padel-advanced", "uc-padel-maneuverability"],
    }),
    pick({
      productId: "prod-bullpadel-ionic-light",
      rank: 2,
      awardType: "editors-pick",
      role: "Official women / intermediate hybrid",
      summary: "Ionic Light — Next-line hybrid listed for women/intermediate, not Vertex 05 W.",
      whyWon:
        "Ionic Light is the second women’s-segment award because Bullpadel lists it for women / intermediate / versatile. It is not Vertex 05 W, and it is not a consolation light frame. Those two cover the catalog’s honest women’s-line jobs.",
      whyFits: [
        "Official 350–360 g hybrid with Glaphite and medium balance. The women’s-segment listing is a manufacturer fact, not a Kitletics stereotype that women must play light.",
        "I'd shortlist it when you want a women’s-segment hybrid at intermediate level. I'd skip it if you already belong on Vertex 05 W, or if you are a beginner — Indiga remains the first racket for anyone still learning contact.",
      ],
      bestFor: [
        "Intermediate players shopping a women’s-segment hybrid",
        "Players between Indiga and Vertex 05 W",
      ],
      tradeoff: "Not Pro Line Vertex 05 W; not a beginner SoftEva round.",
      avoid: [
        "Advanced players who want Vertex 05 W",
        "Beginners who need Indiga",
        "Anyone buying this only because it is under 360 g",
      ],
      instead: [
        { productId: "prod-bullpadel-vertex-05-w", when: "you want the women’s Vertex diamond", label: "Vertex 05 W" },
        { productId: "prod-bullpadel-indiga-ctr", when: "you still need a first racket", label: "Indiga CTR" },
        { productId: "prod-head-one-ultralight", when: "you only wanted ~300 g and not a women’s line", label: "One Ultralight" },
      ],
      useCaseIds: ["uc-padel-intermediate", "uc-padel-maneuverability"],
    }),
  ],
  consideredProducts: [
    considered(
      "prod-head-one-ultralight",
      "Genuinely light adult Head. Not a women’s last or women’s line. Lightweight guide.",
      "rejected",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-bullpadel-ionic-light" },
    ),
    considered(
      "prod-bullpadel-vertex-05",
      "Men’s 12K Vertex 05 at 365–375 g. The women’s Vertex is Vertex 05 W.",
      "rejected",
      { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-bullpadel-vertex-05-w" },
    ),
    considered(
      "prod-kuikma-pr-comfort-soft",
      "Value comfort round for anyone. Not a women’s last.",
      "rejected",
      { reasonCode: "context-mismatch" },
    ),
    considered(
      "prod-siux-comodo-woman",
      "Women’s-named listing without a distinct published last/hero story we can award. Not a third winner.",
      "rejected",
      { reasonCode: "insufficient-evidence" },
    ),
  ],
  comparisonProductIds: ["prod-bullpadel-vertex-05-w", "prod-bullpadel-ionic-light"],
  buyingAdvice:
    "If you are a woman beginner, buy a beginner round (Indiga, Comfort Soft, Equation Soft, Match Light) — those pages do not become “for men.” If you want Vertex, buy Vertex 05 W when the 350–360 g Fibrix last is the point, or men’s Vertex 05 when you want 12K at 365–375 g. Do not let a shop hand you One Ultralight as a women’s racket because it is 300 g.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/bullpadel-vertex-05-w-hero.jpg",
  hubImageAlt: "Bullpadel Vertex 05 W — women’s padel racket",
});
