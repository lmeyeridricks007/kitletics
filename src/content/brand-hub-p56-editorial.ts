import type { BrandHubConfig } from "@/lib/brand-hub/types";

const GUIDE_SHOES = "/images/home/guide-running-shoes.jpg";
const GUIDE_GYM = "/images/home/guide-home-gym.jpg";
const GUIDE_PADEL = "/images/home/guide-how-to-choose.jpg";
const GUIDE_TENNIS = "/images/home/guide-tennis.jpg";
const GUIDE_TRAINING = "/images/training/guides/concepts/cross-training-shoe-gym.jpg";

/** Fix 56 — unique Brand Hub editorial for depth-qualified uniqueness holds. */
export const brandHubP56Configs: Record<string, BrandHubConfig> = {
  puma: {
    brandSlug: "puma",
    editorialSummary:
      "PUMA on Kitletics splits nitrogen-foam road (Deviate NITRO 3 plated tempo/race, Magnify NITRO 2 cushioned daily) from Fuse gym trainers. Do not treat a Fuse last as a NITRO road shoe.",
    howLinesDiffer:
      "Deviate NITRO 3 is the carbon-plated road race/tempo tool. Magnify NITRO 2 is the softer NITRO daily. Fuse 3.0 and Fuse Fasted are gym/metcon — Fasted is the lighter training last. Road NITRO vs Fuse is the first filter.",
    generationContext:
      "Deviate NITRO 3, Magnify NITRO 2, Fuse 3.0 and Fuse Fasted are current in catalog. Compare NITRO generations on foam/plate job, not Fuse naming.",
    featuredProductId: "prod-deviate-nitro-3",
    featuredCategoryId: "cat-running-shoes",
    familyIds: ["fam-p56-puma-nitro", "fam-p56-puma-fuse"],
    whyTitle: "What PUMA is known for here",
    whyItems: [
      { id: "nitro", label: "NITRO nitrogen foam on road race and daily models" },
      { id: "deviate", label: "Deviate NITRO 3 for plated goal efforts" },
      { id: "fuse", label: "Fuse gym line separate from road NITRO" },
    ],
    guideSlugs: ["how-to-choose-running-shoes", "how-to-choose-training-shoes"],
    guideImageMap: {
      "how-to-choose-running-shoes": GUIDE_SHOES,
      "how-to-choose-training-shoes": GUIDE_TRAINING,
    },
  },
  mizuno: {
    brandSlug: "mizuno",
    editorialSummary:
      "Mizuno here is Wave geometry in two sports: Rider 28 (firmer classic daily road), Rebellion Pro 3 (plated road race), Wave Exceed Tour 5 (tennis). A Wave road last is not a tennis Exceed last.",
    howLinesDiffer:
      "Wave Rider 28 is traditional firmer daily road. Wave Rebellion Pro 3 is the plated race shoe. Wave Exceed Tour 5 is tennis lateral support. Cross-shopping Rider into tennis or Rebellion into easy miles is the usual mistake.",
    generationContext:
      "Rider 28, Rebellion Pro 3 and Exceed Tour 5 are current. Wave plate family names look similar — check court vs road category before you buy.",
    featuredProductId: "prod-wave-rider-28",
    featuredCategoryId: "cat-running-shoes",
    familyIds: ["fam-p56-mizuno-wave-road", "fam-p56-mizuno-wave-court"],
    whyTitle: "What Mizuno is known for here",
    whyItems: [
      { id: "wave", label: "Wave plate geometry on road and court lasts" },
      { id: "rider", label: "Rider 28 as a firmer classic daily" },
      { id: "exceed", label: "Exceed Tour 5 for tennis, not road" },
    ],
    guideSlugs: ["how-to-choose-running-shoes", "how-to-choose-a-tennis-racket"],
    guideImageMap: {
      "how-to-choose-running-shoes": GUIDE_SHOES,
      "how-to-choose-a-tennis-racket": GUIDE_TENNIS,
    },
  },
  "inov-8": {
    brandSlug: "inov-8",
    editorialSummary:
      "Inov-8 splits Trailfly Ultra G 300 Max (graphene-cushioned ultra/trail) from F-Lite gym trainers and Fastlift lifting heels. Graphene trail cushion is not a Fastlift heel.",
    howLinesDiffer:
      "Trailfly Ultra G 300 Max is long trail/ultra. F-Lite 235 v3 and F-Lite 260 are low-stack gym/rope-climb trainers. Fastlift 360, Power G 380 and 400 are weightlifting heels. Three jobs — one brand name.",
    generationContext:
      "Six current models: one Trailfly ultra, two F-Lite trainers, three Fastlift lifting shoes. Pick the family before the generation number.",
    featuredProductId: "prod-trailfly-ultra-g-300-max",
    featuredCategoryId: "cat-running-shoes",
    familyIds: [
      "fam-p56-inov8-trailfly",
      "fam-p56-inov8-flite",
      "fam-p56-inov8-fastlift",
    ],
    whyTitle: "What Inov-8 is known for here",
    whyItems: [
      { id: "g", label: "Graphene trail cushion on Trailfly Ultra G 300 Max" },
      { id: "flite", label: "F-Lite low-stack gym trainers" },
      { id: "lift", label: "Fastlift heels for Olympic-style lifting" },
    ],
    guideSlugs: ["how-to-choose-running-shoes", "how-to-choose-training-shoes"],
    guideImageMap: {
      "how-to-choose-running-shoes": GUIDE_SHOES,
      "how-to-choose-training-shoes": GUIDE_TRAINING,
    },
  },
  joma: {
    brandSlug: "joma",
    editorialSummary:
      "Joma on Kitletics is padel court shoes only: Slam (T.Slam / Slam Lady) for planted club support, Spin Men / Spin Lady for a quicker last. Not a racket brand page.",
    howLinesDiffer:
      "T.Slam and Slam Lady are the high-lateral, club-value Slam last. Spin Men and Spin Lady trade some plant for quicker court movement. Pick Slam vs Spin by how you defend vs how you sprint — not by gender colourways.",
    generationContext:
      "Four current padel shoes: Slam pair and Spin pair. No prior-generation Joma court shoe is listed — compare lasts, not year codes.",
    featuredProductId: "prod-joma-t-slam",
    featuredCategoryId: "cat-padel-shoes",
    familyIds: ["fam-p56-joma-slam", "fam-p56-joma-spin"],
    whyTitle: "What Joma is known for here",
    whyItems: [
      { id: "slam", label: "Slam last for planted padel club play" },
      { id: "spin", label: "Spin last for quicker movement" },
      { id: "value", label: "EU club-value positioning vs premium court brands" },
    ],
    guideSlugs: ["how-to-choose-a-padel-racket"],
    guideImageMap: { "how-to-choose-a-padel-racket": GUIDE_PADEL },
  },
  "asics-racket": {
    brandSlug: "asics-racket",
    editorialSummary:
      "ASICS Court is the tennis-shoe entity: Gel-Resolution 9 (hard/clay) for planted baseliners, Solution Speed FF 3 for light speed, Challenger 15 and Dedicate 8 for club/value. Not the road Novablast hub.",
    howLinesDiffer:
      "Gel-Resolution 9 / clay is the stability tennis last. Solution Speed FF 3 is lighter and less planted. Challenger 15 and Dedicate 8 are club/value. Road ASICS families live on the ASICS running hub.",
    generationContext:
      "Resolution 9 (hard + clay), Solution Speed FF 3, Challenger 15 and Dedicate 8 are current tennis shoes. Cross-link to running ASICS only for brand context — different lasts.",
    featuredProductId: "prod-asics-gel-resolution-9",
    featuredCategoryId: "cat-tennis-shoes",
    familyIds: [
      "fam-p56-asics-resolution",
      "fam-p56-asics-speed-court",
      "fam-p56-asics-value-court",
    ],
    whyTitle: "What ASICS Court is known for",
    whyItems: [
      { id: "res", label: "Gel-Resolution 9 as the planted tennis last" },
      { id: "speed", label: "Solution Speed FF 3 for court speed" },
      { id: "value", label: "Challenger / Dedicate club options" },
    ],
    guideSlugs: ["how-to-choose-a-tennis-racket"],
    guideImageMap: { "how-to-choose-a-tennis-racket": GUIDE_TENNIS },
  },
  powerblock: {
    brandSlug: "powerblock",
    editorialSummary:
      "PowerBlock is selectorized adjustable dumbbells: Pro Series 50 vs Pro Series 100 share the pin handle; Elite EXP 90 is the expander-kit path. Choose max load and expansion architecture, not a generic ‘adjustable’ label.",
    howLinesDiffer:
      "Pro Series 50 stops earlier on the same selector-pin system as Pro Series 100. Elite EXP 90 uses expander stages instead of the Pro pin stack. Apartment footprint is the shared win; grip feel vs round dumbbells is the shared trade-off.",
    generationContext:
      "Pro 50, Pro 100 and Elite EXP 90 are current. Expansion kits matter more than cosmetic generation names — confirm max kg/lb on the Product page.",
    featuredProductId: "prod-powerblock-pro-100",
    featuredCategoryId: "cat-adjustable-dumbbells",
    familyIds: ["fam-p56-powerblock-pro", "fam-p56-powerblock-elite"],
    whyTitle: "What PowerBlock is known for",
    whyItems: [
      { id: "pin", label: "Selector-pin Pro Series 50 and 100" },
      { id: "exp", label: "Elite EXP 90 expander architecture" },
      { id: "space", label: "Small-space home strength vs round dumbbell sets" },
    ],
    guideSlugs: ["how-to-build-a-home-gym", "how-to-choose-a-power-rack"],
    guideImageMap: {
      "how-to-build-a-home-gym": GUIDE_GYM,
      "how-to-choose-a-power-rack": GUIDE_GYM,
    },
  },
  gornation: {
    brandSlug: "gornation",
    editorialSummary:
      "GORNATION is a calisthenics skill kit: wall-mounted Premium Pull-Up Bar, Parallettes Pro, gymnastic rings. No free-standing station or weighted vest — buy for bar diameter and skill work, not a full garage gym.",
    howLinesDiffer:
      "The Premium bar is a wall-drill project for muscle-ups and strict work. Parallettes Pro are the floor skill tool. Rings add instability. Unlike Gravity Fitness, there is no free-standing station or vest in this catalog.",
    generationContext:
      "Three current skill tools. No previous-generation GORNATION SKUs listed — compare mount type and skill vs Gravity’s station/vest kit.",
    featuredProductId: "prod-gornation-premium-bar",
    featuredCategoryId: "cat-pull-up-bars",
    familyIds: ["fam-p56-gornation-bar", "fam-p56-gornation-floor"],
    whyTitle: "What GORNATION is known for",
    whyItems: [
      { id: "skill", label: "Calisthenics-focused bar diameter for skills" },
      { id: "wall", label: "Wall-mounted Premium bar, not a doorway clamp" },
      { id: "kit", label: "Parallettes Pro + rings without a vest" },
    ],
    guideSlugs: ["how-to-build-a-home-gym"],
    guideImageMap: { "how-to-build-a-home-gym": GUIDE_GYM },
  },
  "gravity-fitness": {
    brandSlug: "gravity-fitness",
    editorialSummary:
      "Gravity Fitness is the no-drill-to-loaded home calisthenics spread: free-standing Pull-Up Station, metal parallettes, rings, weighted vest. Opposite of a wall-only GORNATION bar kit.",
    howLinesDiffer:
      "The Pull-Up Station stands on the floor when walls cannot be drilled. Parallettes handle L-sits. Rings are the budget-accessible set. The weighted vest adds load — the piece GORNATION does not carry here.",
    generationContext:
      "Four current pieces (station, parallettes, rings, vest). Treat them as a modular kit, not four copies of the same bar.",
    featuredProductId: "prod-gravity-pullup-station",
    featuredCategoryId: "cat-pull-up-bars",
    familyIds: [
      "fam-p56-gravity-station",
      "fam-p56-gravity-parallettes",
      "fam-p56-gravity-load",
    ],
    whyTitle: "What Gravity Fitness is known for",
    whyItems: [
      { id: "free", label: "Free-standing station for rental-friendly setups" },
      { id: "vest", label: "Weighted vest to load calisthenics" },
      { id: "value", label: "Beginner-accessible rings and parallettes" },
    ],
    guideSlugs: ["how-to-build-a-home-gym"],
    guideImageMap: { "how-to-build-a-home-gym": GUIDE_GYM },
  },
  reebok: {
    brandSlug: "reebok",
    editorialSummary:
      "Reebok training shoes split Nano (X4 current, X3 prior, Nano Court) from Lifter (Legacy Lifter III, Lifter PR III). Nano is metcon/functional; Lifter is a raised heel for squats — do not race HYROX in a Lifter.",
    howLinesDiffer:
      "Nano X4 is the current mixed-modal trainer; Nano X3 is the prior generation; Nano Court is the court-leaning Nano. Legacy Lifter III and Lifter PR III are weightlifting heels. CrossFit-style weeks buy Nano; barbell-priority weeks buy Lifter.",
    generationContext:
      "Nano X4 is current; Nano X3 is previous-generation. Both Lifter models are current. Prefer X4 unless X3 street price still matches your sessions.",
    featuredProductId: "prod-reebok-nano-x4",
    featuredCategoryId: "cat-training-shoes",
    familyIds: ["fam-p56-reebok-nano", "fam-p56-reebok-lifter"],
    whyTitle: "What Reebok is known for here",
    whyItems: [
      { id: "nano", label: "Nano X4 as the current functional trainer" },
      { id: "x3", label: "Nano X3 as the prior Nano you may still see discounted" },
      { id: "lift", label: "Legacy Lifter III / Lifter PR III for lifting" },
    ],
    guideSlugs: ["how-to-choose-training-shoes"],
    guideImageMap: { "how-to-choose-training-shoes": GUIDE_TRAINING },
  },
  nobull: {
    brandSlug: "nobull",
    editorialSummary:
      "NOBULL is a narrow training-shoe catalog: Trainer, Trainer+ (more protective upper), Outwork (more aggressive last). Lifestyle durability language is marketing — compare last duty, not slogan.",
    howLinesDiffer:
      "Trainer is the default garage-gym shoe. Trainer+ steps up protection/upper duty. Outwork is the more aggressive training last. Unlike Reebok, there is no separate weightlifting-heel family here.",
    generationContext:
      "Trainer, Trainer+ and Outwork are all current. No numbered Nano-style generation tree — pick last duty, not a year code.",
    featuredProductId: "prod-nobull-trainer",
    featuredCategoryId: "cat-training-shoes",
    familyIds: ["fam-p56-nobull-trainer", "fam-p56-nobull-outwork"],
    whyTitle: "What NOBULL is known for here",
    whyItems: [
      { id: "tr", label: "Trainer as the default gym last" },
      { id: "plus", label: "Trainer+ when you want more upper duty" },
      { id: "out", label: "Outwork as the aggressive training option" },
    ],
    guideSlugs: ["how-to-choose-training-shoes"],
    guideImageMap: { "how-to-choose-training-shoes": GUIDE_TRAINING },
  },
  tyr: {
    brandSlug: "tyr",
    editorialSummary:
      "TYR CXT trainers are the swim-to-gym crossover: CXT-1, CXT-2, and CXT-1 Trainer. Pool-to-floor sessions are the job — not a Reign tri-base or Nano metcon default.",
    howLinesDiffer:
      "CXT-1 and CXT-2 are the numbered CXT generations; CXT-1 Trainer is the named trainer variant. Compared with Reebok Nano or UA Reign, CXT is the swim-crossover last, not a barbell-heel or tri-base story.",
    generationContext:
      "CXT-1, CXT-2 and CXT-1 Trainer are current. Treat CXT-2 as the later numbered CXT, not a different sport.",
    featuredProductId: "prod-tyr-cxt-1",
    featuredCategoryId: "cat-training-shoes",
    familyIds: ["fam-p56-tyr-cxt"],
    whyTitle: "What TYR is known for here",
    whyItems: [
      { id: "swim", label: "Swim-to-gym CXT last, not a running shoe" },
      { id: "cxt2", label: "CXT-2 as the later numbered CXT" },
      { id: "trainer", label: "CXT-1 Trainer as the named trainer variant" },
    ],
    guideSlugs: ["how-to-choose-training-shoes"],
    guideImageMap: { "how-to-choose-training-shoes": GUIDE_TRAINING },
  },
  "pullup-and-dip": {
    brandSlug: "pullup-and-dip",
    editorialSummary:
      "PULLUP & DIP starts with how you mount: doorway clamp (no drill) vs wall-mounted bar (stud fix), plus parallettes. Not a free-standing Gravity station and not a GORNATION skill-diameter wall bar.",
    howLinesDiffer:
      "Doorway Pull-Up Bar is the rental/no-drill option. Wall-Mounted Pull-Up Bar is the permanent stud fix. Parallettes add floor dips/L-sits. Choose mount first — the parallettes do not replace a bar.",
    generationContext:
      "Three current products. No generation tree — the decision is doorway vs wall, then whether you also want parallettes.",
    featuredProductId: "prod-pullup-dip-wall",
    featuredCategoryId: "cat-pull-up-bars",
    familyIds: ["fam-p56-pullup-mount", "fam-p56-pullup-parallettes"],
    whyTitle: "What PULLUP & DIP is known for",
    whyItems: [
      { id: "door", label: "Doorway bar when you cannot drill" },
      { id: "wall", label: "Wall-mounted bar when you can fix into a stud" },
      { id: "par", label: "Parallettes as the floor companion, not rings" },
    ],
    guideSlugs: ["how-to-build-a-home-gym"],
    guideImageMap: { "how-to-build-a-home-gym": GUIDE_GYM },
  },
  "under-armour": {
    brandSlug: "under-armour",
    editorialSummary:
      "Under Armour training shoes: TriBase Reign 6 and Project Rock BSR 4 (tri-base metcon), Reign Lifter (weightlifting heel), Charged Commit 4 (general gym). Tri-base vs Lifter heel is the first split.",
    howLinesDiffer:
      "TriBase Reign 6 is the wide tri-base metcon. Project Rock BSR 4 shares that training stance language. Reign Lifter is the raised-heel lifter. Charged Commit 4 is the general-gym trainer. Do not buy Commit expecting Reign stability or Lifter as a HYROX shoe.",
    generationContext:
      "Reign 6, Project Rock BSR 4, Reign Lifter and Charged Commit 4 are current. Generation numbers live on Reign 6 / Commit 4 — Lifter is a role, not a Nano X-count.",
    featuredProductId: "prod-ua-tribase-reign-6",
    featuredCategoryId: "cat-training-shoes",
    familyIds: ["fam-p56-ua-reign", "fam-p56-ua-lifter-commit"],
    whyTitle: "What Under Armour is known for here",
    whyItems: [
      { id: "tri", label: "TriBase Reign 6 for mixed-modal stance" },
      { id: "rock", label: "Project Rock BSR 4 in the same training stance family" },
      { id: "lift", label: "Reign Lifter vs Charged Commit 4 as different jobs" },
    ],
    guideSlugs: ["how-to-choose-training-shoes"],
    guideImageMap: { "how-to-choose-training-shoes": GUIDE_TRAINING },
  },
  nnormal: {
    brandSlug: "nnormal",
    editorialSummary:
      "NNormal on Kitletics is a trail brand with three jobs: Kjerag 02 (fast technical race-trail), Tomir 02 (long technical protection), and the Race Vest for flask-first mountain days. Do not treat the vest as a shoe line or Kjerag as a stacked ultra daily.",
    howLinesDiffer:
      "Kjerag 02 is the light, precise race-trail last (20/26 mm, 6 mm drop, 3.5 mm lugs). Tomir 02 is the long-technical shoe (25/33 mm, 8 mm drop, 5 mm Traction Lug). The Race Vest is carry, not footwear. Cadí (easy-terrain cushion) and Kjerag Brut are current at the manufacturer and not in this catalog yet.",
    generationContext:
      "Kjerag 02 and Tomir 02 are the current shoe generations here (not Kjerag 01 / Tomir 1.0). The Race Vest is the current pack SKU. Compare Kjerag vs Tomir on terrain and stack, not on the vest.",
    featuredProductId: "prod-nnormal-kjerag-02",
    featuredCategoryId: "cat-running-shoes",
    familyIds: [
      "fam-nnormal-kjerag",
      "fam-nnormal-tomir",
      "fam-nnormal-race-vest",
    ],
    whyTitle: "What NNormal is known for here",
    whyItems: [
      { id: "kjerag", label: "Kjerag 02 for fast technical trail racing" },
      { id: "tomir", label: "Tomir 02 for long technical mountain days" },
      { id: "vest", label: "Race Vest as the flask-first mountain carry" },
    ],
    guideSlugs: ["how-to-choose-running-shoes"],
    guideImageMap: {
      "how-to-choose-running-shoes": GUIDE_SHOES,
    },
  },
  amazfit: {
    brandSlug: "amazfit",
    editorialSummary:
      "Amazfit on Kitletics is four Running GPS jobs: Active 2 (first AMOLED GPS), Balance 3 (hybrid maps + HYROX), Cheetah 2 Pro (titanium runner with gait/power), T-Rex 3 Pro (rugged adventure). Do not treat Cheetah as a T-Rex or Balance as a starter Active.",
    howLinesDiffer:
      "Active 2 is the sub-€100 first GPS with no maps. Balance 3 is the 1.5\" sapphire hybrid with 64GB contour maps, HybridCharge and HYROX modes (55 g titanium-black without strap). Cheetah 2 Pro is the 45.6 g Grade 5 titanium runner with Zepp Coach 5K–marathon, gait and running power. T-Rex 3 Pro is the rugged 10 ATM adventure AMOLED. Bip, T-Rex 3 non-Pro, T-Rex Ultra 2 and Balance 2 are not in this catalog.",
    generationContext:
      "Balance 3 and Cheetah 2 Pro are the 2026 current aisle added beside Active 2 and T-Rex 3 Pro. Compare Cheetah vs Balance on runner-first vs hybrid, not on T-Rex rugged chrome.",
    featuredProductId: "prod-amazfit-cheetah-2-pro",
    featuredCategoryId: "cat-gps-watches",
    familyIds: [
      "fam-amazfit-active",
      "fam-amazfit-balance",
      "fam-amazfit-cheetah",
      "fam-amazfit-t-rex",
    ],
    whyTitle: "What Amazfit is known for here",
    whyItems: [
      { id: "cheetah", label: "Cheetah 2 Pro for runner-first gait/power coaching" },
      { id: "balance", label: "Balance 3 for hybrid maps and HYROX weeks" },
      { id: "trex", label: "T-Rex 3 Pro for rugged value adventure GPS" },
    ],
    guideSlugs: ["how-to-choose-running-watch"],
    guideImageMap: {
      "how-to-choose-running-watch":
        "/images/watches/products/garmin-forerunner-970-hero.jpg",
    },
  },
  samsung: {
    brandSlug: "samsung",
    editorialSummary:
      "Samsung on Kitletics is three Galaxy Running GPS watches: Watch9 (compact 40 mm Wear OS daily), Galaxy Watch Ultra 2025 (still sold titanium ultra), Ultra2 (2026 5000-nit Unpacked successor). Not every Galaxy Watch belongs here — Watch FE is lifestyle, Watch8 is discontinued.",
    howLinesDiffer:
      "Watch9 is 40 mm / 31.5 g dual-GPS daily Wear OS with ~30–40 h typical use. Ultra 2025 is the previous titanium 47 mm sport ultra with a published ~48 h exercise-GPS claim. Ultra2 is the current 61.5 g / 1.52\" / 800 mAh chassis with L1+L5 GPS; dedicated GPS hours are unpublished. iPhone athletes should shop Apple Watch instead.",
    generationContext:
      "Ultra2 (July 2026 Unpacked) succeeds Ultra 2025 in the same Wear OS ultra job; Ultra 2025 stays listed while still sold. Watch9 is the current compact SKU, not Watch8.",
    featuredProductId: "prod-samsung-galaxy-watch-ultra-2",
    featuredCategoryId: "cat-gps-watches",
    familyIds: ["fam-galaxy-watch"],
    whyTitle: "What Samsung is known for here",
    whyItems: [
      { id: "ultra2", label: "Galaxy Watch Ultra2 for current Wear OS adventure" },
      { id: "watch9", label: "Watch9 for compact Galaxy daily running" },
      { id: "ultra25", label: "Ultra 2025 still sold as the prior titanium ultra" },
    ],
    guideSlugs: ["how-to-choose-running-watch"],
    guideImageMap: {
      "how-to-choose-running-watch":
        "/images/watches/products/garmin-forerunner-970-hero.jpg",
    },
  },
  decathlon: {
    brandSlug: "decathlon",
    editorialSummary:
      "Decathlon / Kiprun on Kitletics is Running carry, not a footwear dump: Running Belt (phone/essentials), 900 Race 5L (190 g flask race vest), Proteam 10 (current 10L flask vest). Trail 10 stays media-gated until a licensed hero exists.",
    howLinesDiffer:
      "The belt is waist phone/gel carry. 900 Race 5L is a 5L / 190 g flask vest (flasks not included, 2XS–XL). Proteam 10 is the current 10L / 170 g (M) flask vest with 14 pockets and quiver — no bladder. Do not treat 5L as 10L or the gated Trail 10 as the live 10L aisle.",
    generationContext:
      "900 Race 5L and Proteam 10 are the 2026 current vest aisle. Trail 10 remains authored but unpublished without authentic hero media. Kiprun shoes are not ingested here.",
    featuredProductId: "prod-kiprun-proteam-10",
    featuredCategoryId: "cat-packs-vests",
    familyIds: [
      "fam-kiprun-belt",
      "fam-kiprun-900-race",
      "fam-kiprun-proteam",
    ],
    whyTitle: "What Kiprun is known for here",
    whyItems: [
      { id: "race5", label: "900 Race 5L for value 5L flask racing" },
      { id: "proteam", label: "Proteam 10 for current 10L race-kit trail" },
      { id: "belt", label: "Running Belt for Decathlon phone-waist carry" },
    ],
    guideSlugs: ["how-to-choose-running-hydration-vest"],
    guideImageMap: {
      "how-to-choose-running-hydration-vest":
        "/images/running/category/use-recovery.jpg",
    },
  },
};
