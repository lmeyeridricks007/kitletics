/**
 * Editorial Completion 39 — cannibalization differentiation for overlapping Best Guides.
 * Differentiates intents / shortlists where two pages shared near-identical decisions.
 * Affiliate-neutral. Expert research only.
 */
import type { BestGuide, BestGuideRecommendation } from "@/domain/editorial/types";

const HEAVY_RUNNER_RECS: BestGuideRecommendation[] = [
  {
    productId: "prod-nimbus-27",
    rank: 1,
    awardType: "best-overall",
    summary:
      "Protective daily/long platform with official widths — the clearest all-round answer when higher body load is the constraint, not race geometry.",
    whyRecommended:
      "Wins this guide for protective stack + width options under real weekly volume for heavier runners — not because it is the softest shoe in the catalog.",
    rationale: "Best overall protective platform for heavier runners.",
    whyItFits: [
      "Nimbus 27 wins here when the job is absorbing higher loads across easy and long miles without forcing a race plate.",
      "Against soft max-cushion peers it keeps a more usable daily role; against lively dailies it stays more protective when pack-out under load is the worry.",
      "I'd shortlist it for heavier runners who want one protective road shoe. I'd pause if you primarily need guidance geometry (Kayano/Gaviota) or pure recovery float (Bondi).",
    ],
    tradeoffs: [
      "Heavier and less lively than tempo or race options — correct for this guide's job.",
      "Not a substitute for dedicated stability if you specifically want guidance rails.",
    ],
    bestForProfiles: [
      "Heavier runners logging easy/long road volume who want protective cushion and widths.",
      "Buyers comparing load protection — not race efficiency — on this page.",
    ],
    whoShouldAvoid: [
      "You want a featherweight race shoe or carbon supershoe for goal races.",
      "Your primary need is strong medial guidance rather than neutral protection.",
    ],
    notIdealFor: [
      "Race-day speed",
      "Runners forcing Nimbus into track intervals",
    ],
    chooseInsteadWhen: [
      {
        productId: "prod-bondi-9",
        when: "You want maximum soft stack for easy/recovery miles more than daily versatility.",
      },
      {
        productId: "prod-kayano-32",
        when: "You want dedicated stability guidance under higher loads.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-long-runs", "uc-easy-runs"],
    evidenceIds: ["ev-nimbus-editorial", "ev-catalog-editorial"],
  },
  {
    productId: "prod-bondi-9",
    rank: 2,
    awardType: "best-cushioned",
    summary:
      "Max-cushion easy/recovery geometry when the priority is soft landings under load — not long-run pace range.",
    whyRecommended:
      "Category-leading soft stack for protective easy days when heavier runners prioritise underfoot protection over lively long-run versatility.",
    rationale: "Best max-cushion protective pick.",
    whyItFits: [
      "Bondi 9 wins this guide when soft protective landings under higher loads matter more than a versatile long-run pace range.",
      "That is a different job from Best Long Runs, where Bondi is one soft option among progression-friendly peers.",
      "I'd shortlist it for easy/recovery volume. I'd pause if most long runs include steady work or you need a lighter daily.",
    ],
    tradeoffs: [
      "Heavy and slow for workouts — acceptable when protection is the brief.",
      "Less useful as a single shoe for progression long runs.",
    ],
    bestForProfiles: [
      "Heavier runners prioritising soft easy/recovery miles.",
      "Protective rotation shoes beside a firmer daily.",
    ],
    whoShouldAvoid: [
      "You need one shoe for long runs that include pace work — see Best Long Runs.",
      "You want a lighter high-stack daily like Clifton Pro.",
    ],
    notIdealFor: ["Tempo work", "Race day"],
    chooseInsteadWhen: [
      {
        productId: "prod-nimbus-27",
        when: "You want a more usable protective daily with widths.",
      },
      {
        productId: "prod-gaviota-5",
        when: "You want max cushion plus support geometry.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-recovery-runs", "uc-easy-runs"],
    evidenceIds: ["ev-catalog-editorial"],
  },
  {
    productId: "prod-kayano-32",
    rank: 3,
    awardType: "best-stability",
    summary:
      "Dedicated stability with protective cushion when guidance under load is the real constraint.",
    whyRecommended:
      "Best stability answer in this guide when heavier runners want medial support plus daily protection — not a neutral max-cushion float.",
    rationale: "Best stability platform for heavier runners.",
    whyItFits: [
      "Kayano 32 wins here when platform guidance under higher loads is the decision — a heavier-runner job that is not the same as “comfortable long run.”",
      "Versus Gaviota it is the clearer daily stability trainer; versus Nimbus it adds guidance when neutral stack is not enough.",
      "I'd shortlist it for stability-first volume. I'd pause if you are happily neutral and only need soft stack.",
    ],
    tradeoffs: [
      "Heavier than many neutral dailies.",
      "Not a race shoe and not the softest max-cushion option.",
    ],
    bestForProfiles: [
      "Heavier runners who want guidance with protective cushion.",
      "Stability dailies for road volume under load.",
    ],
    whoShouldAvoid: [
      "Confirmed neutral runners who dislike guidance rails.",
      "Anyone shopping only for race-day carbon shoes.",
    ],
    notIdealFor: ["Pure neutral preference", "Race geometry"],
    chooseInsteadWhen: [
      {
        productId: "prod-gaviota-5",
        when: "You want max-cushion support more than a traditional stability daily.",
      },
      {
        productId: "prod-adrenaline-gts-25",
        when: "You want a lighter, firmer GuideRails daily.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-daily-training", "uc-overpronators"],
    evidenceIds: ["ev-catalog-editorial"],
  },
  {
    productId: "prod-gaviota-5",
    rank: 4,
    awardType: "editors-pick",
    summary:
      "Max cushion plus support — the heavier-runner pick when soft stack alone is not planted enough.",
    whyRecommended:
      "Owns the max-cushion + support role that Long Runs does not centre — protection under load with guidance.",
    rationale: "Best max-cushion support pick.",
    whyItFits: [
      "Gaviota 5 wins this guide when you need soft stack and support together under higher loads — a role Long Runs treats as optional.",
      "Against Bondi it adds support; against Kayano it is softer and more max-cushion oriented.",
      "I'd shortlist it for protective easy miles with guidance. I'd pause if you want a firmer traditional stability trainer.",
    ],
    tradeoffs: [
      "Heavier package — correct for protective support, wrong for race day.",
      "Less lively than Structure Plus for mixed pace days.",
    ],
    bestForProfiles: [
      "Heavier runners wanting soft stack with support.",
      "Easy/long protective miles with guidance preference.",
    ],
    whoShouldAvoid: [
      "Neutral runners who dislike support geometry.",
      "Shoppers needing a light tempo shoe.",
    ],
    notIdealFor: ["Race day", "Minimalist preference"],
    chooseInsteadWhen: [
      {
        productId: "prod-bondi-9",
        when: "You want soft max cushion without support geometry.",
      },
      {
        productId: "prod-kayano-32",
        when: "You prefer a classic stability daily over max-cushion support.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-easy-runs"],
    evidenceIds: ["ev-catalog-editorial"],
  },
  {
    productId: "prod-adrenaline-gts-25",
    rank: 5,
    awardType: "best-value",
    summary:
      "GuideRails daily stability that stays workable for volume when you want support without the heaviest max-cushion package.",
    whyRecommended:
      "Value stability daily for heavier runners who train often and need guidance more than Bondi-level soft stack.",
    rationale: "Best value stability daily.",
    whyItFits: [
      "Adrenaline GTS 25 wins here when guidance under load must stay practical for frequent training — not a soft recovery float.",
      "This role is heavier-runner specific; Long Runs instead centres neutral long-run versatility and progression options.",
      "I'd shortlist it for supportive weekly mileage. I'd pause if you need maximum soft stack.",
    ],
    tradeoffs: [
      "Less plush than Nimbus/Bondi/Gaviota.",
      "Not a race or tempo specialist.",
    ],
    bestForProfiles: [
      "Heavier runners wanting supportive daily mileage.",
      "Budget-conscious stability shoppers in this guide.",
    ],
    whoShouldAvoid: [
      "You want the softest protective stack available.",
      "You need a carbon race shoe.",
    ],
    notIdealFor: ["Max-cushion recovery only", "Race day"],
    chooseInsteadWhen: [
      {
        productId: "prod-structure-plus",
        when: "You want a livelier supportive Nike daily.",
      },
      {
        productId: "prod-kayano-32",
        when: "You want a more protective premium stability platform.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-daily-training"],
    evidenceIds: ["ev-catalog-editorial"],
  },
  {
    productId: "prod-structure-plus",
    rank: 6,
    awardType: "best-premium",
    summary:
      "Supportive yet livelier than classic Structure — for heavier runners who still want some snap on mixed days.",
    whyRecommended:
      "Covers the supportive-but-not-dead role when heavier runners refuse a pure recovery shoe.",
    rationale: "Best livelier support pick.",
    whyItFits: [
      "Structure Plus wins this guide when higher-load runners still want a more responsive supportive daily — not Clifton/Novablast long-run bounce.",
      "Versus Adrenaline it is the livelier support option; versus Nimbus it prioritises guidance over pure soft stack.",
      "I'd shortlist it for mixed easy/steady volume under load. I'd pause if soft protection is the only priority.",
    ],
    tradeoffs: [
      "Less soft than max-cushion options.",
      "Not a substitute for dedicated race shoes.",
    ],
    bestForProfiles: [
      "Heavier runners wanting supportive daily energy.",
      "Mixed easy/steady road volume under load.",
    ],
    whoShouldAvoid: [
      "You want maximum soft recovery cushion.",
      "You need a pure guidance tank like Gaviota.",
    ],
    notIdealFor: ["Pure recovery float", "Race plates"],
    chooseInsteadWhen: [
      {
        productId: "prod-adrenaline-gts-25",
        when: "You want a more traditional GuideRails daily at sharper value.",
      },
      {
        productId: "prod-nimbus-27",
        when: "You want softer protective stack with widths.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-daily-training"],
    evidenceIds: ["ev-catalog-editorial"],
  },
  {
    productId: "prod-clifton-pro",
    rank: 7,
    awardType: "best-durable",
    summary:
      "More durable Clifton-family stack when heavier runners need high cushion that survives volume better than soft race foams.",
    whyRecommended:
      "Durable high-stack answer for load + mileage — distinct from the standard Clifton long-run pick.",
    rationale: "Best durable high-stack pick.",
    whyItFits: [
      "Clifton Pro wins this guide when durability under higher loads matters more than the lightest Clifton long-run feel.",
      "Long Runs can recommend standard Clifton for weekend versatility; here Pro is about surviving volume under load.",
      "I'd shortlist it for protective durable mileage. I'd pause if you need strong medial guidance.",
    ],
    tradeoffs: [
      "Less soft than Bondi; less guided than Kayano/Gaviota.",
      "Not a race shoe.",
    ],
    bestForProfiles: [
      "Heavier runners prioritising durable high stack.",
      "High-mileage easy volume under load.",
    ],
    whoShouldAvoid: [
      "You want max soft recovery cushion.",
      "You need dedicated stability rails.",
    ],
    notIdealFor: ["Race day", "Strong stability needs"],
    chooseInsteadWhen: [
      {
        productId: "prod-bondi-9",
        when: "Soft max cushion matters more than durability.",
      },
      {
        productId: "prod-1080-v14",
        when: "Official width depth is the primary fit constraint.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-long-runs"],
    evidenceIds: ["ev-catalog-editorial"],
  },
  {
    productId: "prod-1080-v14",
    rank: 8,
    awardType: "best-fit",
    summary:
      "Soft Fresh Foam with excellent official widths — fit/volume under load when standard lasts pinch.",
    whyRecommended:
      "Owns the width/fit role for heavier runners when protective cushion must also fit in 2E/4E catalog options.",
    rationale: "Best width-focused protective daily.",
    whyItFits: [
      "1080 v14 wins this guide when official widths under higher loads are the constraint — a heavier-runner fit job Long Runs does not centre.",
      "Versus Nimbus it is the Fresh Foam width specialist; versus Bondi it is a more usable daily soft ride for many feet.",
      "I'd shortlist it when fit volume is non-negotiable. I'd pause if you need stability guidance.",
    ],
    tradeoffs: [
      "Neutral platform — not a stability shoe.",
      "Not a race geometry.",
    ],
    bestForProfiles: [
      "Heavier runners needing official wide options with soft stack.",
      "Fit-first protective road mileage.",
    ],
    whoShouldAvoid: [
      "You need dedicated stability.",
      "You want a carbon race shoe.",
    ],
    notIdealFor: ["Stability guidance", "Race day"],
    chooseInsteadWhen: [
      {
        productId: "prod-nimbus-27",
        when: "You want ASICS protective daily with widths.",
      },
      {
        productId: "prod-glycerin-gts-22",
        when: "You want plush cushion with GuideRails support.",
      },
    ],
    useCaseIds: ["uc-heavy", "uc-wide-feet"],
    evidenceIds: ["ev-catalog-editorial"],
  },
];

type IntentPatch = {
  introSuffix?: string;
  whatMattersExtra?: string;
  relatedNote?: string;
  replaceRecommendations?: BestGuideRecommendation[];
  comparisonProductIds?: string[];
  shortlistedProductIds?: string[];
  consideredProductIds?: string[];
  decisionShortcuts?: BestGuide["decisionShortcuts"];
  quickTake?: string[];
};

const INTENT_PATCHES: Record<string, IntentPatch> = {
  "running-shoes-heavy-runners": {
    introSuffix:
      " This page is not Best Long Runs: Long Runs optimises weekend mileage versatility and progression options; this guide optimises protective stack, durability and guidance under higher body load. Shared foam names can appear in both catalogs, but ranking and roles differ — and this shortlist centres support/durable options Long Runs does not.",
    whatMattersExtra:
      " Do not treat this as a doorway duplicate of Long Runs: if your constraint is distance comfort for any body size, use Best Long Runs; if load, durability and guidance under mass are the constraint, stay here.",
    replaceRecommendations: HEAVY_RUNNER_RECS,
    comparisonProductIds: HEAVY_RUNNER_RECS.slice(0, 6).map((r) => r.productId),
    shortlistedProductIds: HEAVY_RUNNER_RECS.map((r) => r.productId),
    consideredProductIds: [
      ...HEAVY_RUNNER_RECS.map((r) => r.productId),
      "prod-clifton-10",
      "prod-novablast-6",
      "prod-glycerin-22",
      "prod-glycerin-gts-22",
      "prod-gt-2000-14",
      "prod-guide-18",
      "prod-vomero-18",
    ],
    decisionShortcuts: [
      {
        need: "Protective daily with widths under higher load",
        productId: "prod-nimbus-27",
        reason: "Best overall protective platform",
      },
      {
        need: "Maximum soft easy/recovery stack",
        productId: "prod-bondi-9",
        reason: "Max cushion under load",
      },
      {
        need: "Dedicated stability guidance",
        productId: "prod-kayano-32",
        reason: "Stability under load",
      },
      {
        need: "Max cushion plus support",
        productId: "prod-gaviota-5",
        reason: "Soft stack with support",
      },
      {
        need: "Value GuideRails daily",
        productId: "prod-adrenaline-gts-25",
        reason: "Supportive weekly mileage",
      },
      {
        need: "Official wide soft daily",
        productId: "prod-1080-v14",
        reason: "Width-first protection",
      },
    ],
    quickTake: [
      "Choose Nimbus 27 if you need protective daily/long volume under higher load with widths.",
      "Choose Bondi 9 if soft max-cushion easy/recovery miles are the priority.",
      "Choose Kayano 32 if dedicated stability under load is the constraint.",
      "Choose Gaviota 5 if you want max cushion plus support together.",
      "Choose Adrenaline GTS 25 if you want value GuideRails for frequent training.",
      "Choose 1080 v14 if official widths are non-negotiable with soft stack.",
    ],
  },
  "running-shoes-long-runs": {
    introSuffix:
      " This page is not Best Shoes for Heavier Runners: here the job is late-run comfort, pace versatility and weekend-block durability for long sessions. Heavier-runner protection and guidance under load live on that sibling guide — even when some foam names overlap.",
    whatMattersExtra:
      " If your primary constraint is body-load protection and support geometry, use Best Running Shoes for Heavier Runners instead of treating this as the same decision.",
  },
  "race-shoes": {
    introSuffix:
      " This page is not Best Carbon-Plated Running Shoes: race day here includes carbon supershoes plus non-carbon / nylon-plate race and plated-trainer roles by distance. The carbon guide is plate/stiffness taxonomy only — Endorphin Speed and SuperComp Trainer stay on this race-day shortlist when that hybrid role wins.",
    whatMattersExtra:
      " Choose this guide for race-day distance roles; choose the carbon guide when plate geometry itself is the shopping question.",
  },
  "carbon-plated-running-shoes": {
    introSuffix:
      " This page is not Best Race Running Shoes: we only shortlist stiff carbon (or equivalent super-plate) race geometry. Nylon-plate tempo racers (for example Endorphin Speed) and plated long-run trainers (for example SuperComp Trainer) belong on Best Race Shoes even when they sit near supershoes in the catalog.",
    whatMattersExtra:
      " If you are still choosing between carbon and non-carbon race options by distance, start with Best Race Shoes; stay here when carbon plate behaviour is the decision.",
  },
  "running-watches-small-wrists": {
    introSuffix:
      " This page is not Best Beginners or Best Budget: the constraint is case size and strap comfort on smaller wrists. A beginner-friendly or cheap watch can still lose here if it wears large.",
    whatMattersExtra:
      " Shared entry GPS models may appear on sibling guides; ranking follows wrist fit here.",
  },
  "running-watches-beginners": {
    introSuffix:
      " This page is not Best Budget Running Watches: beginners optimise simple setup and readable coaching, even if a mid-range watch is worth it. Budget optimises capability per pound — including capable watches that are not the simplest.",
    whatMattersExtra:
      " Shared entry GPS models can appear on both pages; ranking follows simplicity here, not lowest street price.",
  },
  "running-watches-budget": {
    introSuffix:
      " This page is not Best Running Watches for Beginners: budget optimises GPS training capability per pound. Beginner simplicity can cost more; a cheap watch that buries new runners in menus can still lose that sibling guide.",
    whatMattersExtra:
      " If your constraint is “first GPS without overwhelm,” use the beginners guide; stay here when price ceiling is the decision.",
  },
  "running-hydration-vests": {
    introSuffix:
      " This page is the road/race and general running-vest decision — soft flasks, bounce and race-day carry. Trail-specific pole carry and technical terrain fit live on Best Hydration Vests for Trail Running; ultra volume/all-day aid practicality live on Best Hydration Vests for Ultras.",
    whatMattersExtra:
      " Do not use this as a doorway duplicate of the trail or ultra vest guides when those constraints dominate.",
  },
  "hydration-vests-trail": {
    introSuffix:
      " This page is not the general Best Running Hydration Vests guide: trail bounce, pole attachment and technical terrain storage are the decision factors here.",
    whatMattersExtra:
      " Road race vests without trail carry needs belong on the general running-vest guide.",
  },
  "heart-rate-monitors-running": {
    introSuffix:
      " This page covers running HR tools broadly (chest and strong optical arm options). Best Chest Strap Heart Rate Monitors narrows to ECG strap form-factor; Best Heart Rate Monitors for HYROX adds station/chafing constraints.",
    whatMattersExtra:
      " Nested guides share sensors when roles overlap; ranking still follows the page job.",
  },
  "heart-rate-monitors-chest-straps": {
    introSuffix:
      " This page is form-factor specific: ECG chest straps only. Optical armbands and mixed running HR shortlists belong on Best Heart Rate Monitors for Running.",
    whatMattersExtra:
      " If comfort requires leaving the chest, leave this guide.",
  },
  "running-watches": {
    introSuffix:
      " This is the umbrella running-watch decision across roles. Music, marathon-block, trail, ultra, beginners, budget and small-wrist guides own narrower jobs — use them when that constraint is already known.",
    whatMattersExtra:
      " Umbrella ranking is not a doorway substitute for those specialist pages.",
  },
  "running-watches-trail": {
    introSuffix:
      " This page is not Best Ultra Running Watches: trail centres navigation and off-road GPS for trail days; ultra centres multi-day battery and field strategies for very long events.",
    whatMattersExtra:
      " Overlapping adventure watches can appear on both; ranking follows trail-day vs multi-day jobs.",
  },
  "running-watches-ultra": {
    introSuffix:
      " This page is not Best Trail Running Watches: ultra prioritises multi-day battery, charging strategy and durability when tired. Trail-day navigation without ultra distance belongs on the trail guide.",
    whatMattersExtra:
      " Use trail when the job is maps on technical days; stay here for ultra-distance battery strategy.",
  },
  "hyrox-shoes": {
    introSuffix:
      " This page is not Best Training Shoes: HYROX optimises eight 1 km run legs plus stations. Training Shoes centres lift/metcon session bias, including pure lifters that are poor HYROX race tools.",
    whatMattersExtra:
      " Shared trainers can appear on both; ranking follows race-simulation fit here.",
  },
  "training-shoes": {
    introSuffix:
      " This page is not Best HYROX Shoes: training shoes cover lift stability, hybrid metcons and run-capable gym shoes by session type. HYROX race simulation has its own guide.",
    whatMattersExtra:
      " Pure lifting shoes can win here and still lose HYROX.",
  },
  "running-jackets": {
    introSuffix:
      " This page covers wind / light-weather running jackets. Hard waterproof shells for sustained rain live on Best Running Rain Jackets.",
    whatMattersExtra:
      " A wind jacket can appear near rain shells in the catalog without winning both jobs.",
  },
  "running-rain-jackets": {
    introSuffix:
      " This page is dedicated rain shells — not the broader Best Running Jackets wind/light-weather decision.",
    whatMattersExtra:
      " If you mostly need wind and packability in dry-to-drizzle weather, use Best Running Jackets.",
  },
};

export function applyBestGuideCannibalizationDifferentiation(
  guides: BestGuide[],
): BestGuide[] {
  return guides.map((guide) => {
    const patch = INTENT_PATCHES[guide.slug];
    if (!patch) return guide;

    const intro = patch.introSuffix
      ? `${guide.intro}${patch.introSuffix}`
      : guide.intro;
    const whatMattersIntro = patch.whatMattersExtra
      ? `${guide.whatMattersIntro ?? ""}${patch.whatMattersExtra}`
      : guide.whatMattersIntro;

    let recommendations =
      patch.replaceRecommendations ?? guide.recommendations;

    // Carbon guide: replace plated long-run trainer with true race carbon Elite.
    if (guide.slug === "carbon-plated-running-shoes") {
      recommendations = (recommendations ?? []).map((rec) => {
        if (rec.productId !== "prod-sc-trainer-v3") return rec;
        return {
          ...rec,
          productId: "prod-sc-elite-v4",
          awardType: "best-race",
          summary:
            "Soft FuelCell race carbon for marathon goal races — a true supershoe role, not a plated long-run trainer.",
          whyRecommended:
            "SC Elite v4 wins the carbon shortlist for soft plated race-day geometry. SuperComp Trainer stays on Best Race Shoes as a plated training/race hybrid.",
          rationale: "Best soft carbon marathon race option from NB.",
          whyItFits: [
            "SC Elite v4 wins this carbon guide when you want a soft plated race shoe for goal marathons — not a nylon tempo racer and not a plated trainer.",
            "Versus Vaporfly/Alphafly it is the New Balance soft-race carbon answer; versus SC Trainer (on Best Race Shoes) it is the race-day Elite geometry.",
            "I'd shortlist it for marathon race day in carbon. I'd pause if you want a firmer, more aggressive plate like Endorphin Pro.",
          ],
          tradeoffs: [
            "Race-day only for most runners — correct for this guide.",
            "Premium price vs plated trainers.",
          ],
          bestForProfiles: [
            "Runners shopping carbon supershoes for marathon race day.",
            "Athletes who want soft FuelCell race carbon rather than a plated trainer.",
          ],
          whoShouldAvoid: [
            "You want a plated long-run trainer for weekly volume — see Best Race Shoes (SC Trainer).",
            "You need a nylon-plate tempo shoe like Endorphin Speed.",
          ],
          notIdealFor: ["Daily easy mileage", "Nylon-plate tempo work"],
          chooseInsteadWhen: [
            {
              productId: "prod-adios-pro-4",
              when: "You want a firmer efficient race geometry than soft FuelCell.",
            },
            {
              productId: "prod-vaporfly-4",
              when: "You want the most proven Nike race carbon platform.",
            },
          ],
          strengths: ["Soft plated race ride", "Strong marathon option"],
          compromises: ["Race-day only for most", "Premium price"],
          evidenceIds: ["ev-catalog-editorial"],
        };
      });
    }

    const productIds = (recommendations ?? []).map((r) => r.productId);

    return {
      ...guide,
      intro,
      whatMattersIntro,
      recommendations,
      comparisonProductIds:
        patch.comparisonProductIds ??
        (guide.slug === "carbon-plated-running-shoes"
          ? productIds.slice(0, 6)
          : guide.comparisonProductIds),
      shortlistedProductIds:
        patch.shortlistedProductIds ??
        (guide.slug === "carbon-plated-running-shoes"
          ? productIds
          : guide.shortlistedProductIds),
      consideredProductIds:
        patch.consideredProductIds ??
        (guide.slug === "carbon-plated-running-shoes"
          ? [
              ...new Set([
                ...(guide.consideredProductIds ?? []),
                ...productIds,
                "prod-sc-trainer-v3",
                "prod-endorphin-speed-5",
              ]),
            ]
          : guide.consideredProductIds),
      decisionShortcuts: patch.decisionShortcuts ?? guide.decisionShortcuts,
      quickTake: patch.quickTake ?? guide.quickTake,
      updatedAt: new Date().toISOString(),
    };
  });
}
