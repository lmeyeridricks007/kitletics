import type { BestGuide } from "@/domain/editorial/types";
import { considered, pick, racketGuide, RACKET_RELATED } from "@/content/padel/best-guides/build";

const beginnerRejects = [
  considered(
    "prod-siux-diablo",
    "Advanced teardrop. Rejected as a beginner award — it punishes late preparation.",
    "rejected",
    { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-bullpadel-indiga-ctr" },
  ),
  considered(
    "prod-head-coello-pro",
    "Professional Coello diamond. Not a first racket, however approachable the marketing sounds.",
    "rejected",
    { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-head-coello-team" },
  ),
  considered(
    "prod-bullpadel-vertex-05",
    "Current Vertex diamond. Correct on the advanced page; wrong as a beginner winner.",
    "rejected",
    { reasonCode: "context-mismatch", closestRecommendedProductId: "prod-bullpadel-indiga-ctr" },
  ),
  considered(
    "prod-kuikma-pr-soft-500",
    "Photo-blocked. Comfort Soft is the published Kuikma beginner/comfort round.",
    "rejected",
    { reasonCode: "insufficient-evidence", closestRecommendedProductId: "prod-kuikma-pr-comfort-soft" },
  ),
];

export const padelRacketsBeginnersGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-beginners",
  slug: "padel-rackets-beginners",
  title: "Best Padel Rackets for Beginners",
  subtitle: "Forgiving round and soft frames for first contact — not downsized diamonds",
  shortDescription:
    "First-racket shortlist for players still building timing. Professional diamonds do not win here.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-beginner"],
  intent:
    "beginner padel rackets whose published job is forgiveness: round or soft frames, accessible sweet spots, and manufacturer beginner/intermediate-on-ramp positioning",
  intro:
    "A beginner padel racket has to help you make contact. That means a centred sweet spot, a softer core, and a swing you can repeat when the glass is still surprising you. It does not mean “whatever is light” and it does not mean a professional diamond with a friendly colourway. Siux Diablo and Coello Pro were considered and rejected for this page: they are advanced tools. We awarded published round/soft frames that manufacturers actually aim at developing players — Indiga CTR, Kuikma Comfort Soft, Nox Equation Soft, and Adidas Match Light. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Forgiveness first: round or large-centred faces, low-to-medium balance, and soft cores (SoftEva, soft EVA, comfort constructions). Weight helps only when the mould is already friendly — a 300 g high-balance diamond can still feel late. Manufacturer player-level tags matter. If the sheet says professional, it is not a beginner award even if a shop calls it easy power.",
  criteriaChangePoints: [
    {
      label: "Forgiveness over smash",
      explanation:
        "We score centred sweet spots and soft cores. Peak smash mass is a negative if it arrives before timing exists.",
    },
    {
      label: "Level tags are filters",
      explanation:
        "Professional and advanced diamonds are rejected here even when they win other Best Guides.",
    },
    {
      label: "Light is not enough",
      explanation:
        "Match Light and One Ultralight are different jobs. This page wants learnable moulds, not just low grams.",
    },
  ],
  quickTake: [
    "Choose Indiga CTR if you want Bullpadel’s named round beginner with SoftEva.",
    "Choose PR Comfort Soft if you want the value comfort round with authentic photography.",
    "Choose Equation Soft if you want Nox’s soft Advanced on-ramp.",
    "Choose Match Light if you want Adidas’s lighter entry rather than Metalbone.",
  ],
  decisionShortcuts: [
    {
      need: "Named Bullpadel first racket",
      productId: "prod-bullpadel-indiga-ctr",
      reason: "Round SoftEva Tour-line.",
    },
    {
      need: "Value comfort round",
      productId: "prod-kuikma-pr-comfort-soft",
      reason: "Published Kuikma, not photo-blocked PR Soft 500.",
    },
    {
      need: "Nox soft on-ramp",
      productId: "prod-nox-equation-soft-2026",
      reason: "Soft Advanced, not AT10 Genius.",
    },
    {
      need: "Light Adidas entry",
      productId: "prod-adidas-match-light",
      reason: "Match Light, not Metalbone 3.5.",
    },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-indiga-ctr",
      rank: 1,
      awardType: "best-beginner",
      role: "Primary first racket",
      summary: "Round SoftEva Tour-line — the honest Bullpadel on-ramp.",
      whyWon:
        "Indiga CTR ranks first here because the manufacturer job is developing players: round, low balance, SoftEva. Comfort Soft is the value alternative. Equation Soft is the Nox path. Match Light is the lighter Adidas entry. None of those replace Indiga as the clearest named beginner round in this catalog.",
      whyFits: [
        "Indiga CTR puts the sweet spot where beginners actually hit: a round Polyglass face and SoftEva, not a diamond with a centred sticker.",
        "Against Match Light it is the more explicit beginner mould. Against Ionic Light it is the first week; Ionic is the intermediate hybrid.",
        "I'd shortlist it for anyone still spraying defensive blocks. I'd skip it once you are attacking on purpose and the round ceiling is the weekly complaint.",
      ],
      bestFor: [
        "Brand-new padel players",
        "Returning players who need the sweet spot in the middle",
        "Anyone who was shown Diablo as a “starter”",
      ],
      tradeoff: "You will outgrow the power ceiling if you keep attacking — that is success, not a defect.",
      avoid: [
        "Advanced players forcing a Tour beginner into competitive attack",
        "Shoppers who actually wanted Vertex 05 W’s lighter Vertex last",
      ],
      instead: [
        {
          productId: "prod-kuikma-pr-comfort-soft",
          when: "you want the value comfort round instead of Bullpadel Tour",
          label: "PR Comfort Soft",
        },
        {
          productId: "prod-bullpadel-ionic-light",
          when: "you already make contact and want a 350–360 g hybrid step-up",
          label: "Ionic Light",
        },
      ],
      useCaseIds: ["uc-padel-beginner"],
    }),
    pick({
      productId: "prod-kuikma-pr-comfort-soft",
      rank: 2,
      awardType: "best-value",
      role: "Value comfort round",
      summary: "Published Kuikma soft round for first contact on a budget.",
      whyWon:
        "Comfort Soft is the value beginner because it is published with an authentic hero and a soft-round job. PR Soft 500 cannot win. It does not beat Indiga as the named Bullpadel first racket.",
      whyFits: [
        "Kuikma’s comfort round exists so you can learn without Pro Line pricing. The core is the story, not a carbon ladder.",
        "Against Equation Soft it is usually the cheaper street path. Against Indiga it is less of a brand-Tour identity and more of a value tool.",
        "I'd shortlist it when budget and arm comfort dominate. I'd skip it if you specifically wanted Bullpadel’s Indiga pathway into Ionic / Vertex.",
      ],
      bestFor: [
        "Budget-first beginners",
        "Players who want a soft round they can replace without guilt",
      ],
      tradeoff: "Less of a named development pathway than Indiga into Ionic / Vertex.",
      avoid: ["Advanced attackers", "Photo-blocked PR Soft 500 shoppers expecting this to be that frame"],
      instead: [
        {
          productId: "prod-bullpadel-indiga-ctr",
          when: "you want Bullpadel’s beginner round and a clearer step-up into Ionic",
          label: "Indiga CTR",
        },
        {
          productId: "prod-nox-equation-soft-2026",
          when: "you want Nox’s soft Advanced instead of Kuikma",
          label: "Equation Soft",
        },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-arm-comfort"],
    }),
    pick({
      productId: "prod-nox-equation-soft-2026",
      rank: 3,
      awardType: "editors-pick",
      role: "Nox soft Advanced on-ramp",
      summary: "Nox Equation Soft — a soft Advanced, not AT10 Genius.",
      whyWon:
        "Equation Soft is the Nox beginner-adjacent award: a soft Advanced frame, not Genius 12K/18K and not Attack 18K. It exists for players who want Nox feel without Tapia’s professional moulds.",
      whyFits: [
        "Equation Soft is listed as a soft Advanced Nox. That is a different job from ML10’s classic cup and from AT10’s professional teardrop.",
        "I'd shortlist it when you want Nox in the bag from week one without borrowing a Genius. I'd skip it if you needed Indiga’s rounder Tour beginner or ML10’s classic control cup.",
      ],
      bestFor: [
        "Beginners who already prefer Nox",
        "Soft-core players who will later look at ML10 or Genius",
      ],
      tradeoff: "Not as explicitly “first week” as Indiga; still more than a toy.",
      avoid: ["Players who need AT10 Genius 18K already", "Smash-first diamonds"],
      instead: [
        {
          productId: "prod-bullpadel-indiga-ctr",
          when: "you want the most explicit round beginner in this catalog",
          label: "Indiga CTR",
        },
        {
          productId: "prod-nox-ml10-pro-cup",
          when: "control is already the job and you want the classic cup",
          label: "ML10 Pro Cup",
        },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-arm-comfort"],
    }),
    pick({
      productId: "prod-adidas-match-light",
      rank: 4,
      awardType: "best-lightweight",
      role: "Light Adidas entry",
      summary: "Match Light — the Adidas on-ramp, not Metalbone.",
      whyWon:
        "Match Light wins the light Adidas beginner role. Metalbone 3.5 is a professional diamond and does not belong on this page. One Ultralight is even lighter but lives on the lightweight guide because its high-balance 300 g story is a handling specialist, not the default first mould.",
      whyFits: [
        "Match Light is Adidas’s lighter entry frame. The job is getting the face around, not Weight & Balance smash plates.",
        "I'd shortlist it when you want Adidas from the start and Metalbone would be a joke. I'd skip it if you needed a round SoftEva or you were shopping One Ultralight’s 300 g specialist.",
      ],
      bestFor: [
        "Beginners who want an Adidas entry",
        "Players who found Metalbone listings first and need a redirect",
      ],
      tradeoff: "Not the most centred round in this set — Indiga still forgives more typical mishits.",
      avoid: ["Anyone treating this as a Metalbone substitute", "Advanced Galán-system attackers"],
      instead: [
        {
          productId: "prod-bullpadel-indiga-ctr",
          when: "you need maximum round forgiveness",
          label: "Indiga CTR",
        },
        {
          productId: "prod-head-one-ultralight",
          when: "you specifically want the ~300 g adult Head on the lightweight guide",
          label: "One Ultralight",
        },
      ],
      useCaseIds: ["uc-padel-beginner", "uc-padel-maneuverability"],
    }),
  ],
  consideredProducts: [
    ...beginnerRejects,
    considered(
      "prod-head-one-ultralight",
      "Genuinely light (~300 g) but high balance. Shortlisted; awarded on the lightweight guide rather than as the default first mould.",
      "shortlisted",
      { reasonCode: "niche", closestRecommendedProductId: "prod-adidas-match-light" },
    ),
    considered(
      "prod-head-coello-team",
      "Coello Team is an intermediate/team step, not a first-week round. Lives on the intermediate guide.",
      "considered",
      { reasonCode: "lower-context-fit" },
    ),
  ],
  comparisonProductIds: [
    "prod-bullpadel-indiga-ctr",
    "prod-kuikma-pr-comfort-soft",
    "prod-nox-equation-soft-2026",
    "prod-adidas-match-light",
  ],
  buyingAdvice:
    "If a shop hands you a diamond “because you’ll grow into it,” walk. Growing into a frame that blocks your rally today is how people quit. Buy the round/soft frame you can repeat for a season, then step to Ionic Light, Vertex Advance, or a hybrid when the ceiling is obvious in matches — not because a ranking told you to.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/bullpadel-indiga-ctr-hero.jpg",
  hubImageAlt: "Bullpadel Indiga CTR — beginner padel racket",
});

export const padelRacketsIntermediateGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-intermediate",
  slug: "padel-rackets-intermediate",
  title: "Best Padel Rackets for Intermediate Players",
  subtitle: "Hybrid and teardrop step-ups once contact is reliable",
  shortDescription:
    "Step-up frames for players who have outgrown a beginner round and are not ready for a professional diamond.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-intermediate", "uc-padel-balanced"],
  intent:
    "intermediate padel rackets: hybrid/teardrop step-ups with manufacturer intermediate or team positioning — not beginner rounds and not professional diamonds",
  intro:
    "Intermediate is the awkward catalog slice: too much racket for a first month, not enough for a finishing specialist. The job is a hybrid or teardrop you can attack with without giving back every defensive ball. We awarded Ionic Light, Kuikma PR Hybrid Carbon, Babolat Air Veron, HEAD Coello Team, and Vertex Advance — frames manufacturers actually point at developing all-court play. Indiga stays on the beginner page. Vertex 05, Hack 04, and Coello Pro live on advanced/power. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "Look for hybrid/teardrop outlines, medium balance, and intermediate or Next/Team line tags. A 350–360 g hybrid is often the right step from a 360 g round. Do not skip this layer because a diamond is on sale. The criteria that change versus beginners are usable power and a slightly higher sweet spot — not 18K stiffness.",
  criteriaChangePoints: [
    {
      label: "Step-up, not on-ramp",
      explanation: "Beginner rounds are considered and usually rejected unless they still uniquely fit.",
    },
    {
      label: "Not yet a Pro diamond",
      explanation: "Vertex 05, Hack 04, Coello Pro, and Metalbone 3.5 are the next page, not this one.",
    },
  ],
  quickTake: [
    "Choose Ionic Light if you want a 350–360 g Bullpadel hybrid between Indiga and Vertex.",
    "Choose PR Hybrid Carbon if you want Kuikma’s carbon hybrid step-up.",
    "Choose Air Veron if you want Babolat’s lighter Veron all-court, not Technical Viper.",
    "Choose Coello Team if you want Head’s Team Coello, not Coello Pro.",
    "Choose Vertex Advance if you want Vertex family geometry before Vertex 05.",
  ],
  decisionShortcuts: [
    { need: "Light Bullpadel hybrid", productId: "prod-bullpadel-ionic-light", reason: "Official women/intermediate Next line." },
    { need: "Kuikma carbon hybrid", productId: "prod-kuikma-pr-hybrid-carbon", reason: "Step-up from Comfort Soft." },
    { need: "Babolat all-court, not Viper Pro", productId: "prod-babolat-air-veron", reason: "Veron, not Technical Viper." },
    { need: "Head Team Coello", productId: "prod-head-coello-team", reason: "Team, not Pro diamond." },
    { need: "Vertex before Vertex 05", productId: "prod-bullpadel-vertex-advance", reason: "Advance, not 05 diamond." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-ionic-light",
      rank: 1,
      awardType: "best-overall",
      role: "Primary intermediate hybrid",
      summary: "350–360 g Glaphite hybrid — the Bullpadel step between Indiga and Vertex.",
      whyWon:
        "Ionic Light ranks first for intermediates because Bullpadel points it at intermediate / versatile play in a 350–360 g hybrid. It is also a women’s-segment frame, but it wins here on the intermediate job, not as a gender stereotype. Vertex Advance is the Vertex-shaped step; this is the lighter Next hybrid.",
      whyFits: [
        "Ionic Light is a hybrid with Glaphite and Multieva in a published 350–360 g band. That is the handling step after Indiga without jumping to 12K Vertex 05.",
        "Against PR Hybrid Carbon it is the Bullpadel Next-line identity. Against Coello Team it is lighter and more explicitly intermediate.",
        "I'd shortlist it when rallies are already real and Indiga’s ceiling showed up. I'd skip it if you still mishit the round frame — stay on Indiga.",
      ],
      bestFor: [
        "Intermediates leaving a beginner round",
        "Players who want a light hybrid, not Vertex 05 12K",
        "Players who also see this frame on the women’s guide for last/segment reasons",
      ],
      tradeoff: "Not Pro Line Vertex — smash ceiling and 12K punch are the next spend.",
      avoid: ["Absolute beginners", "Advanced 12K Vertex shoppers"],
      instead: [
        { productId: "prod-bullpadel-indiga-ctr", when: "contact is still the weekly problem", label: "Indiga CTR" },
        { productId: "prod-bullpadel-vertex-advance", when: "you want Vertex-shaped geometry before Vertex 05", label: "Vertex Advance" },
        { productId: "prod-bullpadel-vertex-05-w", when: "you specifically want the women’s Vertex last, not Ionic", label: "Vertex 05 W" },
      ],
      useCaseIds: ["uc-padel-intermediate", "uc-padel-balanced", "uc-padel-maneuverability"],
    }),
    pick({
      productId: "prod-kuikma-pr-hybrid-carbon",
      rank: 2,
      awardType: "best-value",
      role: "Value carbon hybrid",
      summary: "Kuikma’s published carbon hybrid — the step after Comfort Soft.",
      whyWon:
        "PR Hybrid Carbon is the value intermediate: a published hybrid carbon step-up, not the photo-blocked PR Soft 500. It does not replace Ionic Light as the primary handling hybrid.",
      whyFits: [
        "This is the Kuikma player who outgrew Comfort Soft and still does not want Pro Line pricing.",
        "I'd shortlist it on a Decathlon path. I'd skip it if you wanted Bullpadel’s Ionic-to-Vertex ladder.",
      ],
      bestFor: ["Value-minded intermediates", "Kuikma players stepping out of Comfort Soft"],
      tradeoff: "Less of a named Pro-line identity than Vertex Advance.",
      avoid: ["Beginners who still need Comfort Soft", "Flagship diamond shoppers"],
      instead: [
        { productId: "prod-kuikma-pr-comfort-soft", when: "you still need the soft round", label: "PR Comfort Soft" },
        { productId: "prod-bullpadel-ionic-light", when: "you want the lighter Bullpadel hybrid", label: "Ionic Light" },
      ],
      useCaseIds: ["uc-padel-intermediate", "uc-padel-balanced"],
    }),
    pick({
      productId: "prod-babolat-air-veron",
      rank: 3,
      awardType: "editors-pick",
      role: "Babolat all-court Veron",
      summary: "Air Veron — Babolat’s lighter all-court, not Technical Viper.",
      whyWon:
        "Air Veron is the Babolat intermediate all-courter. Technical Viper and Air Viper are advanced attack/handling specialists on other pages.",
      whyFits: [
        "Veron is the more approachable Babolat all-court mould versus Viper Pro diamonds.",
        "I'd shortlist it when you like Babolat faces and Viper would be too much racket. I'd skip it if you already strike like a Technical Viper player.",
      ],
      bestFor: ["Babolat-system intermediates", "Players who found Viper first and need a step-down"],
      tradeoff: "Less peak attack than Technical Viper — by design.",
      avoid: ["Viper finishers", "Round-beginner shoppers"],
      instead: [
        { productId: "prod-babolat-technical-viper", when: "you already want the technical-striker diamond", label: "Technical Viper" },
        { productId: "prod-babolat-air-viper", when: "you want the lighter Viper handling specialist", label: "Air Viper" },
      ],
      useCaseIds: ["uc-padel-intermediate", "uc-padel-balanced"],
    }),
    pick({
      productId: "prod-head-coello-team",
      rank: 4,
      badge: "Best Head Team step-up",
      role: "Coello Team",
      summary: "Coello Team — not Coello Pro.",
      whyWon:
        "Coello Team is Head’s Team-line Coello. Coello Pro is the professional diamond and is rejected as an intermediate default.",
      whyFits: [
        "Team exists so you can live in the Coello family without Pro stiffness and mass.",
        "I'd shortlist it when you want Head and Coello Pro would be a weekly fight. I'd skip it if you already belong on the advanced guide.",
      ],
      bestFor: ["Head players not ready for Coello Pro", "Team-line all-court"],
      tradeoff: "Ceiling below Coello Pro — that is the point.",
      avoid: ["Beginners who need One Ultralight or Indiga", "Coello Pro finishers"],
      instead: [
        { productId: "prod-head-coello-pro", when: "you already want the professional Coello diamond", label: "Coello Pro" },
        { productId: "prod-head-coello-motion", when: "handling mass is the constraint more than Team construction", label: "Coello Motion" },
      ],
      useCaseIds: ["uc-padel-intermediate"],
    }),
    pick({
      productId: "prod-bullpadel-vertex-advance",
      rank: 5,
      badge: "Best Vertex step-up",
      role: "Vertex before Vertex 05",
      summary: "Vertex Advance — Vertex family geometry before the 05 diamond.",
      whyWon:
        "Vertex Advance is the Vertex-shaped intermediate. Vertex 05 is the advanced award. This page needs the step, not the flagship.",
      whyFits: [
        "Advance lets you try Vertex ideas without 12K Vertex 05 tax.",
        "I'd shortlist it when Ionic Light feels too much like a Next hybrid and you want Vertex geometry. I'd skip it if you already play Vertex 05.",
      ],
      bestFor: ["Players aiming at Vertex 05 next season", "Vertex-curious intermediates"],
      tradeoff: "Not the current Tello 05 diamond.",
      avoid: ["Beginners", "Current Vertex 05 players"],
      instead: [
        { productId: "prod-bullpadel-vertex-05", when: "you already belong on the advanced Vertex 05", label: "Vertex 05" },
        { productId: "prod-bullpadel-ionic-light", when: "you want the lighter hybrid instead of Vertex-shaped Advance", label: "Ionic Light" },
      ],
      useCaseIds: ["uc-padel-intermediate", "uc-padel-balanced"],
    }),
  ],
  consideredProducts: [
    considered("prod-bullpadel-indiga-ctr", "Beginner round. Correct previous step; not an intermediate winner.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-head-coello-pro", "Professional diamond. Advanced/power pages, not this one.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-bullpadel-vertex-05", "Advanced Vertex. Wrong as an intermediate default.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-siux-diablo", "Advanced teardrop. Advanced guide, not intermediate on-ramp.", "rejected", { reasonCode: "context-mismatch" }),
  ],
  comparisonProductIds: [
    "prod-bullpadel-ionic-light",
    "prod-kuikma-pr-hybrid-carbon",
    "prod-babolat-air-veron",
    "prod-head-coello-team",
    "prod-bullpadel-vertex-advance",
  ],
  buyingAdvice:
    "If you can already rally and you are starting to attack, this is your layer. If you are still missing the ball on the glass, stay on the beginner guide. If you already choose when to smash, look at advanced and power. Do not buy Coello Pro as an intermediate because it sat on an old value badge.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/bullpadel-ionic-light-hero.jpg",
  hubImageAlt: "Bullpadel Ionic Light — intermediate padel racket",
});

export const padelRacketsAdvancedGuide: BestGuide = racketGuide({
  id: "best-padel-rackets-advanced",
  slug: "padel-rackets-advanced",
  title: "Best Padel Rackets for Advanced Players",
  subtitle: "Frames that assume timing already exists",
  shortDescription:
    "Advanced shortlist for players who already choose when to finish. Beginner rounds do not win here.",
  guideKind: "use-case",
  rankingMode: "ranked",
  useCaseIds: ["uc-padel-advanced", "uc-padel-competitive"],
  intent:
    "advanced padel rackets with professional or advanced manufacturer level, current generation, and authentic heroes — assuming timing already exists",
  intro:
    "Advanced here means you already choose when to finish. These frames assume you can prepare on time. We awarded current professional/advanced moulds that own different jobs: Vertex 05 as the all-court diamond, AT10 Genius 18K as Tapia’s teardrop, Gravity Pro as HEAD’s control-leaning Pro, Siux Diablo as the advanced teardrop, and Hack 04 Hybrid as the attacking hybrid. Beginner rounds were considered and rejected. Affiliate commission does not rank this list.",
  whatMattersIntro:
    "The criteria that change versus intermediate: higher sweet-spot or firmer faces are allowed, manufacturer advanced/professional tags become a requirement, and forgiveness is no longer the primary score. You should already know whether you want diamond, hybrid, or teardrop.",
  criteriaChangePoints: [
    {
      label: "Timing is assumed",
      explanation: "Forgiveness-first rounds lose here even if they won the beginner guide.",
    },
    {
      label: "Current generation",
      explanation: "Vertex 04 and Hack 03 are previous-generation context, not awards.",
    },
  ],
  quickTake: [
    "Choose Vertex 05 if you want the current Tello diamond for advanced all-court play.",
    "Choose AT10 Genius 18K if you want Tapia’s teardrop, not Attack 18K.",
    "Choose Gravity Pro if you want HEAD’s control-leaning Pro.",
    "Choose Diablo if you want Siux’s advanced teardrop — not as a beginner.",
    "Choose Hack 04 Hybrid if you want Hack attack in a hybrid outline.",
  ],
  decisionShortcuts: [
    { need: "Current Vertex diamond", productId: "prod-bullpadel-vertex-05", reason: "Advanced all-court Vertex 05." },
    { need: "Tapia teardrop Genius", productId: "prod-nox-at10-18k-2026", reason: "18K Genius, not Attack diamond." },
    { need: "HEAD control Pro", productId: "prod-head-gravity-pro", reason: "Gravity Pro, not Coello Pro." },
    { need: "Siux advanced teardrop", productId: "prod-siux-diablo", reason: "Diablo as advanced, not beginner." },
    { need: "Hack hybrid attack", productId: "prod-bullpadel-hack-04-hybrid", reason: "Hybrid Hack, not Hack 04 diamond." },
  ],
  recommendations: [
    pick({
      productId: "prod-bullpadel-vertex-05",
      rank: 1,
      awardType: "best-overall",
      role: "Advanced all-court diamond",
      summary: "Current Vertex 05 for players who already attack and defend.",
      whyWon:
        "Vertex 05 is the advanced default because it covers all-court play at a professional diamond level. Hack 04 Hybrid is the more attacking hybrid. Gravity Pro is the control Pro. Diablo is the Siux teardrop. None of those replace Vertex as the broad advanced flagship.",
      whyFits: [
        "This is the same Vertex 05 as the category flagship, recommended here because the player already has timing — the job this frame actually requires.",
        "I'd shortlist it when you play both phases of the point at an advanced level. I'd skip it if you wanted Gravity Pro’s control or Hack’s smash-only week.",
      ],
      bestFor: ["Advanced all-court", "Current Vertex family", "Players leaving Vertex Advance"],
      tradeoff: "Diamond tax remains — not a control cup.",
      avoid: ["Beginners", "Players who want Vertex 05 W’s 350–360 g last specifically"],
      instead: [
        { productId: "prod-nox-at10-18k-2026", when: "you want Tapia’s teardrop Genius instead of Vertex diamond", label: "AT10 Genius 18K" },
        { productId: "prod-bullpadel-hack-04-hybrid", when: "you want Hack attack in a hybrid", label: "Hack 04 Hybrid" },
        { productId: "prod-bullpadel-vertex-05-w", when: "you want the women’s Vertex 350–360 g last", label: "Vertex 05 W" },
      ],
      useCaseIds: ["uc-padel-advanced", "uc-padel-balanced"],
    }),
    pick({
      productId: "prod-nox-at10-18k-2026",
      rank: 2,
      awardType: "editors-pick",
      role: "Tapia teardrop Genius",
      summary: "AT10 Genius 18K teardrop — not Attack 18K.",
      whyWon:
        "Genius 18K wins the advanced teardrop Genius role. Attack 18K is the diamond Tapia attacker on the power page. Genius 12K is the firmer Genius sibling on all-round.",
      whyFits: [
        "18K Genius is drop/tear with MLD Black Eva — Tapia’s all-court professional, not the Attack diamond.",
        "I'd shortlist it when you want Nox Genius, not Vertex diamond. I'd skip it if you wanted Attack 18K smash geometry.",
      ],
      bestFor: ["Advanced Nox Genius players", "Teardrop all-court at professional level"],
      tradeoff: "Not a diamond Attack; finishing height differs from Hack/Metalbone.",
      avoid: ["Beginners", "Players who thought 12K Genius was the Attack diamond"],
      instead: [
        { productId: "prod-nox-at10-attack-18k-2026", when: "you want Tapia’s Attack diamond", label: "AT10 Attack 18K" },
        { productId: "prod-nox-at10-12k-2026", when: "you want the firmer 12K Genius face", label: "AT10 Genius 12K" },
      ],
      useCaseIds: ["uc-padel-advanced", "uc-padel-balanced"],
    }),
    pick({
      productId: "prod-head-gravity-pro",
      rank: 3,
      badge: "Best advanced control",
      role: "HEAD control Pro",
      summary: "Gravity Pro — control-leaning HEAD Pro, not Coello Pro.",
      whyWon:
        "Gravity Pro is the advanced control HEAD. Coello Pro is the attacking diamond on the power page. Gravity Motion is the handling sibling on maneuverability.",
      whyFits: [
        "Gravity Pro is for advanced players who still want a more centred, control-leaning Pro mould.",
        "I'd shortlist it when Vertex diamond feels too high and you still play at Pro level. I'd skip it if you wanted Coello’s smash diamond.",
      ],
      bestFor: ["Advanced control HEAD", "Players who over-hit Vertex/Hack"],
      tradeoff: "Less smash mass than Coello Pro and Hack 04.",
      avoid: ["Beginners who actually need Gravity Motion or Indiga"],
      instead: [
        { productId: "prod-head-coello-pro", when: "you want Coello’s attacking diamond", label: "Coello Pro" },
        { productId: "prod-nox-ml10-pro-cup", when: "you want the classic Nox cup instead of HEAD Pro", label: "ML10 Pro Cup" },
      ],
      useCaseIds: ["uc-padel-advanced", "uc-padel-control"],
    }),
    pick({
      productId: "prod-siux-diablo",
      rank: 4,
      badge: "Best Siux advanced teardrop",
      role: "Advanced Diablo",
      summary: "Diablo as an advanced teardrop — the opposite of the old beginner badge.",
      whyWon:
        "Diablo belongs here, not on the beginner page. The old seed treated it as a round beginner. Manufacturer and catalog job are advanced teardrop play.",
      whyFits: [
        "Diablo is an advanced teardrop with a spin-friendly face. That is a skilled-player tool.",
        "I'd shortlist it when you want Siux’s advanced teardrop. I'd skip it if you are learning — that was the mistake the old Best Guide made.",
      ],
      bestFor: ["Advanced Siux players", "Teardrop attackers who are not on Vertex/Hack"],
      tradeoff: "Firm and premium — not a first racket.",
      avoid: ["Beginners", "Anyone repeating the old “Diablo = easy handling” award"],
      instead: [
        { productId: "prod-bullpadel-indiga-ctr", when: "you actually need a beginner round", label: "Indiga CTR" },
        { productId: "prod-head-speed-pro", when: "you want HEAD’s Speed Pro all-court instead of Diablo", label: "Speed Pro" },
      ],
      useCaseIds: ["uc-padel-advanced"],
    }),
    pick({
      productId: "prod-bullpadel-hack-04-hybrid",
      rank: 5,
      badge: "Best attacking hybrid",
      role: "Hack hybrid",
      summary: "Hack 04 Hybrid — attack without the full diamond Hack 04.",
      whyWon:
        "Hack 04 Hybrid is the advanced attacking hybrid. Hack 04 diamond is the power-page smash award. This page needs the hybrid attacker.",
      whyFits: [
        "Hybrid Hack lets advanced players keep Hack ideas with a different outline than the 18K diamond.",
        "I'd shortlist it when diamond Hack 04 felt too high and you still want Hack attack. I'd skip it if you already want the diamond Hack.",
      ],
      bestFor: ["Advanced attackers who prefer hybrid Hack", "Players between Vertex Hybrid and Hack diamond"],
      tradeoff: "Less peak diamond smash than Hack 04 18K.",
      avoid: ["Beginners", "Pure control-cup players"],
      instead: [
        { productId: "prod-bullpadel-hack-04", when: "you want the 18K diamond Hack", label: "Hack 04" },
        { productId: "prod-bullpadel-vertex-05-hybrid", when: "you want Vertex hybrid rather than Hack hybrid", label: "Vertex 05 Hybrid" },
      ],
      useCaseIds: ["uc-padel-advanced", "uc-padel-power"],
    }),
  ],
  consideredProducts: [
    considered("prod-bullpadel-hack-04", "Diamond Hack lives on the power guide as the smash award.", "shortlisted", { reasonCode: "redundant-role", closestRecommendedProductId: "prod-bullpadel-hack-04-hybrid" }),
    considered("prod-head-coello-pro", "Attacking Pro diamond — awarded on the power guide.", "shortlisted", { reasonCode: "niche" }),
    considered("prod-bullpadel-indiga-ctr", "Beginner round. Rejected for advanced.", "rejected", { reasonCode: "context-mismatch" }),
    considered("prod-bullpadel-vertex-04", "Previous Vertex. Not a current advanced award.", "previous-pick", { reasonCode: "previous-generation" }),
  ],
  comparisonProductIds: [
    "prod-bullpadel-vertex-05",
    "prod-nox-at10-18k-2026",
    "prod-head-gravity-pro",
    "prod-siux-diablo",
    "prod-bullpadel-hack-04-hybrid",
  ],
  buyingAdvice:
    "If you cannot yet choose when to finish, this page will sell you a problem. Use beginners or intermediate first. If you already live in diamonds, compare Vertex 05, Hack 04 (power guide), and Metalbone 3.5 rather than collecting every advanced badge.",
  relatedGuideIds: [...RACKET_RELATED],
  hubImageSrc: "/images/padel/products/bullpadel-vertex-05-hero.png",
  hubImageAlt: "Bullpadel Vertex 05 — advanced padel racket",
});
