/**
 * Pre-launch 07 — P0 Running Best Guide enrichment to LAUNCH_READY.
 * Decision-depth patches only (no gate change). Affiliate-neutral.
 */
import type { BestGuide, BestGuideRecommendation } from "@/domain/editorial/types";

const EVIDENCE = ["ev-catalog-editorial"] as const;

type RecPatch = Partial<BestGuideRecommendation> & {
  whyItFits: string[];
  tradeoffs: string[];
  bestForProfiles: string[];
  whoShouldAvoid: string[];
  notIdealFor: string[];
  chooseInsteadWhen: NonNullable<BestGuideRecommendation["chooseInsteadWhen"]>;
};

type GuidePatch = {
  intro: string;
  whatMattersIntro: string;
  methodologySummary: string;
  selectionMethodology: string;
  evidenceIds: string[];
  decisionShortcuts?: BestGuide["decisionShortcuts"];
  quickTake?: string[];
  consideredProductIds?: string[];
  shortlistedProductIds?: string[];
  recommendations: Record<string, RecPatch>;
};

const P0_PATCHES: Record<string, GuidePatch> = {
  "running-shoes": {
    intro: "Best Running Shoes is a role map for the current road and trail catalog — not a single overall scoreboard. We shortlist shoes that cover distinct jobs: lively daily mileage, forgiving starters, versatile value, protective long runs, max cushion, tempo work, race day, stability guidance, and trail grip. Rankings reflect how well each shoe owns its role against close peers, not who has the highest Kitletics Score or affiliate payout. Use the shortcuts when you already know the job; read the pick cards when you are still choosing between two similar shoes.",
    whatMattersIntro: "Start with the session mix you actually run: easy volume, long runs, workouts, race day, support needs, or trail. Fit and widths matter as much as foam. A great race shoe is a poor daily; a max-cushion recovery shoe is a poor tempo tool. We weigh use-case fit, ride character, durability for the intended mileage, and honest trade-offs against peers in the same lane.",
    methodologySummary: "Considered universe: published running shoes with Recommendation coverage for major road/trail roles. Shortlist requires distinct decision roles. Final recommendations are role winners — not a fixed top-N or commission-weighted list. Affiliate commission does not influence considered, shortlisted, recommended, rank or award decisions.",
    selectionMethodology: "Considered universe: published running shoes with Recommendation coverage for major road/trail roles. Shortlist requires distinct decision roles. Final recommendations are role winners — not a fixed top-N or commission-weighted list. Affiliate commission does not influence considered, shortlisted, recommended, rank or award decisions.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "One versatile daily for most road miles",
                "productId": "prod-novablast-6",
                "reason": "Lively soft daily that covers easy and long without a plate."
          },
          {
                "need": "Beginner-friendly + widths",
                "productId": "prod-ghost-18",
                "reason": "Forgiving ride with the strongest width story in this shortlist."
          },
          {
                "need": "Value mixed-pace workhorse",
                "productId": "prod-pegasus-42",
                "reason": "Does easy and moderate work without premium cushion pricing."
          },
          {
                "need": "Protective long-run comfort",
                "productId": "prod-clifton-10",
                "reason": "High-stack rocker for weekend volume."
          },
          {
                "need": "Maximum soft recovery miles",
                "productId": "prod-bondi-9",
                "reason": "Max-cushion identity for easy/recovery days."
          },
          {
                "need": "Tempo / workout days",
                "productId": "prod-endorphin-speed-5",
                "reason": "Nylon-plate trainer for threshold and race simulation."
          },
          {
                "need": "Road race day",
                "productId": "prod-vaporfly-4",
                "reason": "Carbon race geometry for PRs."
          },
          {
                "need": "Stability guidance",
                "productId": "prod-kayano-32",
                "reason": "Dedicated stability daily role."
          },
          {
                "need": "Trail grip + cushion",
                "productId": "prod-speedgoat-6",
                "reason": "Off-road protection and traction."
          }
    ],
    quickTake: [
          "Choose Novablast 6 if one versatile daily for most road miles.",
          "Choose Ghost 18 if beginner-friendly + widths.",
          "Choose Pegasus 42 if value mixed-pace workhorse.",
          "Choose Clifton 10 if protective long-run comfort.",
          "Choose Bondi 9 if maximum soft recovery miles.",
          "Choose Endorphin Speed 5 if tempo / workout days."
    ],
    consideredProductIds: ["prod-novablast-6","prod-ghost-18","prod-pegasus-42","prod-clifton-10","prod-bondi-9","prod-endorphin-speed-5","prod-vaporfly-4","prod-kayano-32","prod-speedgoat-6"],
    shortlistedProductIds: ["prod-novablast-6","prod-ghost-18","prod-pegasus-42","prod-clifton-10","prod-bondi-9","prod-endorphin-speed-5","prod-vaporfly-4","prod-kayano-32","prod-speedgoat-6"],
    recommendations: {
    "prod-novablast-6": {
          "whyItFits": [
                "ASICS Novablast 6 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when broadest usefulness in the current catalog for neutral road runners who want one versatile shoe covering easy and long miles with lively cushion.",
                "In this guide context it earns the pick for lively cushioned ride and strong easy and long-run suitability — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "ASICS Novablast 6 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not a stability shoe.",
                "Limited width story vs Ghost/Nimbus.",
                "Not a dedicated race plate."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Energetic soft daily trainer for high-mileage road running"
          ],
          "whoShouldAvoid": [
                "Runners needing maximum stability",
                "Trail-focused runners"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Limited width story vs Ghost/Nimbus"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Novablast 6 owns here",
                      "productId": "prod-ghost-18",
                      "label": "Ghost 18"
                },
                {
                      "when": "the Clifton 10 role matches your week better than this pick",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                },
                {
                      "when": "you prefer the GEL-Nimbus 27 trade-off profile after comparing fit and ride",
                      "productId": "prod-nimbus-27",
                      "label": "GEL-Nimbus 27"
                }
          ],
          "useCaseStrengths": [
                "Lively cushioned ride",
                "Strong easy and long-run suitability",
                "Versatile daily mileage companion"
          ],
          "evidenceIds": [
                "ev-novablast-6-mfr",
                "ev-catalog-editorial"
          ]
    },
    "prod-ghost-18": {
          "whyItFits": [
                "Brooks Ghost 18 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when best starting point when fit flexibility and predictability matter more than max bounce.",
                "In this guide context it earns the pick for width options and predictable daily ride — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "Brooks Ghost 18 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less energetic than Novablast.",
                "Not a race shoe."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Forgiving daily trainer with excellent width options"
          ],
          "whoShouldAvoid": [
                "Runners wanting max bounce or race-day speed"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Not a race shoe"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Ghost 18 owns here",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                },
                {
                      "when": "the Pegasus 42 role matches your week better than this pick",
                      "productId": "prod-pegasus-42",
                      "label": "Pegasus 42"
                }
          ],
          "useCaseStrengths": [
                "Width options",
                "Predictable daily ride",
                "Beginner-friendly"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-pegasus-42": {
          "whyItFits": [
                "Nike Pegasus 42 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when credible daily coverage without stepping into premium max-cushion pricing — strong when one shoe must do mixed paces.",
                "In this guide context it earns the pick for versatile daily use and mixed-pace capability — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "Nike Pegasus 42 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less standout cushion than Novablast/Clifton.",
                "Not a race plate."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Versatile workhorse for mixed easy and moderate paces"
          ],
          "whoShouldAvoid": [
                "Runners wanting maximum plush or race-day speed"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Not a race plate"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Pegasus 42 owns here",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                },
                {
                      "when": "the Ghost 18 role matches your week better than this pick",
                      "productId": "prod-ghost-18",
                      "label": "Ghost 18"
                }
          ],
          "useCaseStrengths": [
                "Versatile daily use",
                "Mixed-pace capability",
                "Widely relevant"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-clifton-10": {
          "whyItFits": [
                "HOKA Clifton 10 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when when long-run comfort and meta-rocker protection matter more than bounce, Clifton is the stronger long-day road option in this shortlist.",
                "In this guide context it earns the pick for high cushion and long-run comfort — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "HOKA Clifton 10 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less lively than Novablast.",
                "Not ideal as a pure tempo shoe."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: High-stack plush platform for easy and long road miles"
          ],
          "whoShouldAvoid": [
                "Runners wanting a firm, snappy tempo platform"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Not ideal as a pure tempo shoe"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Clifton 10 owns here",
                      "productId": "prod-bondi-9",
                      "label": "Bondi 9"
                },
                {
                      "when": "the GEL-Nimbus 27 role matches your week better than this pick",
                      "productId": "prod-nimbus-27",
                      "label": "GEL-Nimbus 27"
                }
          ],
          "useCaseStrengths": [
                "High cushion",
                "Long-run comfort",
                "Easy-day protection"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-bondi-9": {
          "whyItFits": [
                "HOKA Bondi 9 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when pure max-cushion pick when stack and softness outrank daily versatility.",
                "In this guide context it earns the pick for maximum stack and recovery-day comfort — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "HOKA Bondi 9 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Heavier feel.",
                "Less versatile for mixed paces."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Maximum-stack road shoe for easy and recovery miles"
          ],
          "whoShouldAvoid": [
                "Runners wanting a lively or race-oriented shoe"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Less versatile for mixed paces"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Bondi 9 owns here",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                },
                {
                      "when": "the GEL-Nimbus 27 role matches your week better than this pick",
                      "productId": "prod-nimbus-27",
                      "label": "GEL-Nimbus 27"
                }
          ],
          "useCaseStrengths": [
                "Maximum stack",
                "Recovery-day comfort",
                "Protective platform"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-endorphin-speed-5": {
          "whyItFits": [
                "Saucony Endorphin Speed 5 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when best workout platform in this guide when threshold, intervals and race simulation matter more than plush easy miles.",
                "In this guide context it earns the pick for responsive tempo platform and strong workout suitability — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "Saucony Endorphin Speed 5 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not the softest easy-day shoe.",
                "Poor trail suitability."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Nylon-plated tempo trainer for workouts and faster long runs"
          ],
          "whoShouldAvoid": [
                "Max-cushion seekers",
                "Trail runners"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Poor trail suitability"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Speed 5 owns here",
                      "productId": "prod-boston-12",
                      "label": "Adizero Boston 12"
                },
                {
                      "when": "the Novablast 6 role matches your week better than this pick",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                }
          ],
          "useCaseStrengths": [
                "Responsive tempo platform",
                "Strong workout suitability",
                "More approachable than pure carbon racers"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-vaporfly-4": {
          "whyItFits": [
                "Nike Vaporfly 4 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when primary race-day pick for road PRs when you want a proven carbon platform without Alphafly’s more aggressive geometry.",
                "In this guide context it earns the pick for race-day energy return and marathon/half relevance — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "Nike Vaporfly 4 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not a daily trainer.",
                "Fit and cost require intentional use."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Carbon race shoe for road racing goals"
          ],
          "whoShouldAvoid": [
                "Runners seeking an everyday trainer"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Fit and cost require intentional use"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Vaporfly 4 owns here",
                      "productId": "prod-alphafly-3",
                      "label": "Alphafly 3"
                },
                {
                      "when": "the Endorphin Speed 5 role matches your week better than this pick",
                      "productId": "prod-endorphin-speed-5",
                      "label": "Endorphin Speed 5"
                }
          ],
          "useCaseStrengths": [
                "Race-day energy return",
                "Marathon/half relevance",
                "Lighter race package"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-kayano-32": {
          "whyItFits": [
                "ASICS GEL-Kayano 32 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when clear stability daily when Guidance systems matter — distinct job from neutral dailies in this guide.",
                "In this guide context it earns the pick for stability guidance and daily mileage suitability — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "ASICS GEL-Kayano 32 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Heavier than neutral dailies.",
                "Not a race shoe."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Guided stability daily for overpronation support needs"
          ],
          "whoShouldAvoid": [
                "Neutral runners wanting maximum bounce"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Not a race shoe"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than GEL-Kayano 32 owns here",
                      "productId": "prod-adrenaline-gts-25",
                      "label": "Adrenaline GTS 25"
                },
                {
                      "when": "the Ghost 18 role matches your week better than this pick",
                      "productId": "prod-ghost-18",
                      "label": "Ghost 18"
                }
          ],
          "useCaseStrengths": [
                "Stability guidance",
                "Daily mileage suitability",
                "Protective ride"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-speedgoat-6": {
          "whyItFits": [
                "HOKA Speedgoat 6 fits a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) when primary trail pick in the current catalog when grip and underfoot protection matter off-road.",
                "In this guide context it earns the pick for trail grip and protective cushion — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you need a different specialty than this pick's award."
          ],
          "whyItWon": "HOKA Speedgoat 6 takes this award because it covers a clear role in a road runner's kit (daily, long, tempo, race, stability or trail) more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not for pure road racing.",
                "Heavier than road racers."
          ],
          "bestForProfiles": [
                "Runners whose week matches a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Athletes who want: Cushioned trail shoe for technical and long trail days"
          ],
          "whoShouldAvoid": [
                "Pure road runners"
          ],
          "notIdealFor": [
                "Sessions outside a clear role in a road runner's kit (daily, long, tempo, race, stability or trail)",
                "Heavier than road racers"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Speedgoat 6 owns here",
                      "productId": "prod-peregrine-15",
                      "label": "Peregrine 15"
                },
                {
                      "when": "the Lone Peak 8 role matches your week better than this pick",
                      "productId": "prod-lone-peak-8",
                      "label": "Lone Peak 8"
                }
          ],
          "useCaseStrengths": [
                "Trail grip",
                "Protective cushion",
                "Long trail suitability"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "running-shoes-beginners": {
    intro: "Beginners benefit from forgiving dailies with clear fit stories — especially official widths — before race plates and extreme geometry. This guide prioritises shoes that make early miles easier to stick with: predictable cushioning, secure lockdown, and enough versatility for couch-to-5K and early weekly rhythm. We are not chasing the cheapest pair or the bounciest foam; we are choosing tools that reduce early friction. If you already know you want a race-day carbon shoe, use Best Marathon Shoes or Best Race Shoes instead.",
    whatMattersIntro: "Versatility over race specialization, predictable fit and lockdown, approachable cushioning, and value for a first serious pair. Width options matter when fit is still unknown. Avoid starting in plates unless a coach is prescribing race-specific work.",
    methodologySummary: "Prioritises forgiving dailies, clear fit stories (including widths), and early-training versatility over race plates or niche workout geometry. Affiliate commission does not influence ranking.",
    selectionMethodology: "Prioritises forgiving dailies, clear fit stories (including widths), and early-training versatility over race plates or niche workout geometry. Affiliate commission does not influence ranking.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Best first serious daily + widths",
                "productId": "prod-ghost-18",
                "reason": "Forgiving ride and official width depth."
          },
          {
                "need": "Nike versatile starter",
                "productId": "prod-pegasus-42",
                "reason": "Easy miles plus occasional steadier efforts."
          },
          {
                "need": "Softer energetic daily",
                "productId": "prod-novablast-6",
                "reason": "When bounce matters more than width choice."
          },
          {
                "need": "Classic predictable daily",
                "productId": "prod-cumulus-27",
                "reason": "Simple ASICS daily character."
          },
          {
                "need": "Plush HOKA starter",
                "productId": "prod-clifton-10",
                "reason": "High-stack comfort for early volume."
          },
          {
                "need": "Mild stability early",
                "productId": "prod-adrenaline-gts-25",
                "reason": "When you want GuideRails support from the start."
          }
    ],
    quickTake: [
          "Choose Ghost 18 if best first serious daily + widths.",
          "Choose Pegasus 42 if nike versatile starter.",
          "Choose Novablast 6 if softer energetic daily.",
          "Choose GEL-Cumulus 27 if classic predictable daily.",
          "Choose Clifton 10 if plush hoka starter.",
          "Choose Adrenaline GTS 25 if mild stability early."
    ],
    consideredProductIds: ["prod-ghost-18","prod-pegasus-42","prod-novablast-6","prod-ride-18","prod-cumulus-27","prod-clifton-10","prod-adrenaline-gts-25","prod-wave-rider-28"],
    shortlistedProductIds: ["prod-ghost-18","prod-pegasus-42","prod-novablast-6","prod-ride-18","prod-cumulus-27","prod-clifton-10","prod-adrenaline-gts-25","prod-wave-rider-28"],
    recommendations: {
    "prod-ghost-18": {
          "whyItFits": [
                "Brooks Ghost 18 is the kind of first serious shoe that makes early miles easier to stick with — beginner-friendly cushioning plus official narrow-to-extra-wide options. You get a forgiving road and treadmill daily without needing race plates, extreme geometry, or a specialist rotation on day one.",
                "For beginners that usually means easy runs, couch-to-5K volume, and learning a weekly rhythm — not intervals in a carbon racer. DNA LOFT v3 stays soft and smooth when you are still building consistency, and widths make it easier to lock fit before you blame the shoe.",
                "I'd shortlist Ghost when you want one clear starter daily and care about fit options. I'd pause if you already know you want a bouncier Novablast-style ride or a firmer classic daily — those jobs sit lower on this list on purpose."
          ],
          "whyItWon": "Ghost 18 ranks first for beginners because it pairs a forgiving smooth ride with the widest official width story in this shortlist — more complete for most new runners than Pegasus versatility or Novablast bounce alone.",
          "tradeoffs": [
                "Higher drop than some modern dailies",
                "Less energetic than Novablast-class shoes for pickups",
                "Advanced speed work still wants another shoe later"
          ],
          "bestForProfiles": [
                "New runners who want one predictable road daily",
                "Anyone who needs official widths to get fit right early"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: Higher drop than some modern dailies"
          ],
          "notIdealFor": [
                "Runners already chasing tempo or race-day geometry"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Forgiving easy-mile ride for early training",
                "Official narrow through extra-wide options",
                "Simple daily role — no race-day complexity"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-pegasus-42": {
          "whyItFits": [
                "Nike Pegasus 42 fits beginners who want mixed easy and moderate paces in one pair — a do-most-things daily rather than a pure recovery float. It is still approachable, but livelier than the softest max-cushion starters.",
                "Choose it when Nike fit already works for you, or when your early plan includes strides and steady runs as well as easy jogs. Width story is narrower than Brooks Ghost if fit is your main risk.",
                "I'd take Pegasus over Ghost when versatility matters more than width choice; I'd stay with Ghost when getting the last right is the first problem to solve."
          ],
          "tradeoffs": [
                "Fewer official width options than Ghost",
                "Not as plush as Clifton-class cushioning"
          ],
          "bestForProfiles": [
                "Beginners who want easy miles plus occasional pickups in one shoe"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: Fewer official width options than Ghost"
          ],
          "notIdealFor": [
                "Runners who need wide or extra-wide official lasts first"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "One-shoe versatility for mixed early training",
                "Familiar Nike daily geometry"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-novablast-6": {
          "whyItFits": [
                "ASICS Novablast 6 suits new runners who try a soft shoe and immediately want more bounce — FF BLAST MAX keeps easy miles fun without jumping straight to a race plate.",
                "It works when early training still includes mostly easy volume, but you dislike a flat, muted daily. The trade-off is a less traditional, more playful ride than Ghost or Cumulus.",
                "I'd shortlist it when bounce is the reason you keep running; I'd skip it if you want the calmest, most predictable first pair."
          ],
          "tradeoffs": [
                "More lively than some beginners prefer",
                "Not the widest width story in this guide"
          ],
          "bestForProfiles": [
                "Beginners who like a bouncy soft daily from day one"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: More lively than some beginners prefer"
          ],
          "notIdealFor": [
                "Runners who want the calmest traditional daily feel"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Soft, energetic daily feel",
                "Keeps easy miles interesting early"
          ],
          "evidenceIds": [
                "ev-novablast-6-mfr",
                "ev-catalog-editorial"
          ]
    },
    "prod-ride-18": {
          "whyItFits": [
                "Saucony Ride 18 gives beginners another calm daily path — protective enough for easy volume without asking you to learn race geometry first.",
                "Prefer it when Saucony fit locks better than Brooks or Nike, or when you want a simple easy-mile tool that stays out of the way.",
                "I'd rotate to something livelier later for workouts; Ride's job here is reliable early mileage."
          ],
          "tradeoffs": [
                "Less standout bounce than Novablast",
                "Not the widest width menu versus Ghost"
          ],
          "bestForProfiles": [
                "Beginners who prefer Saucony fit for easy training"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: Less standout bounce than Novablast"
          ],
          "notIdealFor": [
                "Runners hunting maximum bounce or max stack"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Approachable Saucony daily for easy miles"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-cumulus-27": {
          "whyItFits": [
                "ASICS Cumulus 27 is the classic daily path for new runners who want predictability over playfulness — a familiar road trainer for easy and steady early weeks.",
                "Choose it when you like ASICS fit and prefer a calmer ride than Novablast. It is less of a “wow” foam story and more of a reliable first training shoe.",
                "I'd pick Cumulus when traditional feel matters; I'd pick Novablast when energy underfoot is what keeps you consistent."
          ],
          "tradeoffs": [
                "Less lively than Novablast",
                "Not a max-cushion recovery float"
          ],
          "bestForProfiles": [
                "Beginners who want a classic, calm ASICS daily"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: Less lively than Novablast"
          ],
          "notIdealFor": [
                "Runners who already know they want max bounce"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Traditional ASICS daily character",
                "Predictable early-training ride"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-clifton-10": {
          "whyItFits": [
                "HOKA Clifton 10 fits beginners who feel every step on hard roads and want plush protection first — high stack for easy volume without a race plate.",
                "It suits couch-to-distance plans where comfort keeps you showing up. The meta-rocker and stack feel different from Ghost or Pegasus, so try fit carefully.",
                "I'd shortlist Clifton when softness is the priority; I'd choose Ghost when width options and a smoother traditional daily matter more."
          ],
          "tradeoffs": [
                "HOKA geometry is a love/hate fit for some beginners",
                "Less versatile for pickups than Pegasus"
          ],
          "bestForProfiles": [
                "New runners who want plush protection on easy miles"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: HOKA geometry is a love/hate fit for some beginners"
          ],
          "notIdealFor": [
                "Runners who dislike high-stack rockered rides"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "High-stack comfort for easy volume",
                "Protective HOKA daily geometry"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-adrenaline-gts-25": {
          "whyItFits": [
                "Brooks Adrenaline GTS 25 belongs here when support is the reason you are shopping — GuideRails guidance in a daily that still works for early easy volume.",
                "It is not the default for every beginner; neutral Ghost remains the simpler start if you do not need stability. Choose Adrenaline when guidance is intentional, not because “stability” sounds safer.",
                "I'd buy it with a clear support need; I'd stay neutral if nobody has suggested otherwise."
          ],
          "tradeoffs": [
                "Heavier / more guided than neutral dailies",
                "Unnecessary if you do not need stability"
          ],
          "bestForProfiles": [
                "Beginners advised to try a guided stability daily"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: Heavier / more guided than neutral dailies"
          ],
          "notIdealFor": [
                "Neutral runners with no support need"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "GuideRails stability for early training",
                "Brooks width options with support"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-wave-rider-28": {
          "whyItFits": [
                "Mizuno Wave Rider 28 is for new runners who try plush shoes and bounce right off — a firmer classic daily with traditional road character.",
                "Prefer it when you want ground feel and a stable-feeling platform without stability hardware. It is less “cloud” than Clifton or Ghost.",
                "I'd shortlist Wave Rider when firm and traditional is the brief; I'd skip it if soft cushioning is why you started shopping."
          ],
          "tradeoffs": [
                "Less plush than Ghost or Clifton",
                "Not the bouncy modern daily story"
          ],
          "bestForProfiles": [
                "Beginners who prefer firmer, traditional dailies"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you already need race plates, heavy stability, or specialist workout geometry",
                "Anyone unwilling to accept: Less plush than Ghost or Clifton"
          ],
          "notIdealFor": [
                "Runners hunting max softness or bounce"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Firmer classic daily feel",
                "Traditional Wave Rider character"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "running-watches": {
    intro: "Pick a running watch for the jobs you actually need: multi-band GPS, battery for long days, maps for trail, training metrics for structured blocks, or Apple-ecosystem convenience. Specs come from the catalog; rankings reflect role fit — Forerunner training depth, Fenix adventure tools, COROS battery/value, Apple hybrid life — not who pays the highest affiliate rate. Beginners should not buy complexity they will ignore; ultra runners should not buy AMOLED-only kits if multi-day GPS is the real constraint.",
    whatMattersIntro: "GPS reliability, battery for your longest sessions, maps/navigation when trails matter, training features you will use, ecosystem lock-in, and value. Smartwatch extras only win when they are weekly needs.",
    methodologySummary: "Compared battery, multi-band GPS, maps, training features and value across published GPS watches. Role-based recommendations. Affiliate commission does not influence ranking.",
    selectionMethodology: "Compared battery, multi-band GPS, maps, training features and value across published GPS watches. Role-based recommendations. Affiliate commission does not influence ranking.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Serious training + maps on Garmin",
                "productId": "prod-forerunner-970",
                "reason": "Broadest running-focused Garmin package here."
          },
          {
                "need": "Adventure / multisport premium",
                "productId": "prod-fenix-8",
                "reason": "When outdoor tools and build outrank pure run UI."
          },
          {
                "need": "Trail maps + COROS battery",
                "productId": "prod-coros-apex-4",
                "reason": "Maps and endurance battery without Garmin pricing."
          },
          {
                "need": "Best value modern runner",
                "productId": "prod-coros-pace-4",
                "reason": "Dual-frequency GPS and light weight for most road runners."
          },
          {
                "need": "Apple ecosystem hybrid",
                "productId": "prod-apple-watch-ultra-3",
                "reason": "When iPhone life matters as much as GPS."
          },
          {
                "need": "Simple beginner Garmin",
                "productId": "prod-forerunner-165",
                "reason": "Lower complexity before 570/970 feature density."
          }
    ],
    quickTake: [
          "Choose Forerunner 970 if serious training + maps on garmin.",
          "Choose Fenix 8 AMOLED 47mm if adventure / multisport premium.",
          "Choose Apex 4 if trail maps + coros battery.",
          "Choose Pace 4 if best value modern runner.",
          "Choose Watch Ultra 3 if apple ecosystem hybrid.",
          "Choose Forerunner 165 if simple beginner garmin."
    ],
    consideredProductIds: ["prod-forerunner-970","prod-fenix-8","prod-coros-apex-4","prod-coros-pace-4","prod-apple-watch-ultra-3","prod-forerunner-165"],
    shortlistedProductIds: ["prod-forerunner-970","prod-fenix-8","prod-coros-apex-4","prod-coros-pace-4","prod-apple-watch-ultra-3","prod-forerunner-165"],
    recommendations: {
    "prod-forerunner-970": {
          "whyItFits": [
                "Garmin Forerunner 970 fits GPS training, navigation and race-day tracking for runners when still the broadest training + maps package among running-focused Garmins when you live in Connect and want AMOLED without full Fenix adventure chrome.",
                "In this guide context it earns the pick for training depth and maps/navigation — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a basic step counter or a full dive computer."
          ],
          "whyItWon": "Garmin Forerunner 970 takes this award because it covers GPS training, navigation and race-day tracking for runners more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Premium price tier.",
                "Feature complexity for beginners."
          ],
          "bestForProfiles": [
                "Runners whose week matches GPS training, navigation and race-day tracking for runners",
                "Athletes who want: Flagship Forerunner for serious training and navigation"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a basic step counter or a full dive computer",
                "Anyone unwilling to accept: Premium price tier"
          ],
          "notIdealFor": [
                "Sessions outside GPS training, navigation and race-day tracking for runners",
                "Feature complexity for beginners"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Forerunner 970 owns here",
                      "productId": "prod-fenix-8",
                      "label": "Fenix 8 AMOLED 47mm"
                },
                {
                      "when": "the Pace 4 role matches your week better than this pick",
                      "productId": "prod-coros-pace-4",
                      "label": "Pace 4"
                }
          ],
          "useCaseStrengths": [
                "Training depth",
                "Maps/navigation",
                "Multi-band GPS"
          ],
          "evidenceIds": [
                "ev-fr970-mfr",
                "ev-catalog-editorial"
          ]
    },
    "prod-fenix-8": {
          "whyItFits": [
                "Garmin Fenix 8 AMOLED 47mm fits GPS training, navigation and race-day tracking for runners when choose Fenix 8 over Forerunner when you want dive-ready build, ECG, speaker/mic, and TopoActive maps on a bright AMOLED adventure chassis.",
                "In this guide context it earns the pick for full topoactive maps on a bright always-on-capable amoled and ecg, dive-ready build, speaker/mic, and garmin pay in one chassis — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a basic step counter or a full dive computer."
          ],
          "whyItWon": "Garmin Fenix 8 AMOLED 47mm takes this award because it covers GPS training, navigation and race-day tracking for runners more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Premium price versus dedicated ultra-battery MIP watches.",
                "Heavier and thicker than running-focused Forerunners."
          ],
          "bestForProfiles": [
                "Runners whose week matches GPS training, navigation and race-day tracking for runners",
                "Athletes who want: Adventure multisport flagship when maps and outdoor tools matter daily"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a basic step counter or a full dive computer",
                "Anyone unwilling to accept: Premium price versus dedicated ultra-battery MIP watches"
          ],
          "notIdealFor": [
                "Sessions outside GPS training, navigation and race-day tracking for runners",
                "Heavier and thicker than running-focused Forerunners"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than AMOLED 47mm owns here",
                      "productId": "prod-forerunner-970",
                      "label": "Forerunner 970"
                },
                {
                      "when": "the Enduro 3 role matches your week better than this pick",
                      "productId": "prod-enduro-3",
                      "label": "Enduro 3"
                }
          ],
          "useCaseStrengths": [
                "Full TopoActive maps on a bright always-on-capable AMOLED",
                "ECG, dive-ready build, speaker/mic, and Garmin Pay in one chassis",
                "Deep Garmin training, recovery, and multi-sport ecosystem"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-coros-apex-4": {
          "whyItFits": [
                "COROS Apex 4 fits GPS training, navigation and race-day tracking for runners when strong COROS pick when you want maps and endurance battery without Garmin pricing or AMOLED drain.",
                "In this guide context it earns the pick for full offline topo/street maps on a durable sapphire mip and strong dual-frequency gps battery on the 46 mm size — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a basic step counter or a full dive computer."
          ],
          "whyItWon": "COROS Apex 4 takes this award because it covers GPS training, navigation and race-day tracking for runners more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "No music storage or contactless payments.",
                "Smaller third-party app ecosystem than Garmin."
          ],
          "bestForProfiles": [
                "Runners whose week matches GPS training, navigation and race-day tracking for runners",
                "Athletes who want: Titanium MIP trail/ultra watch with offline maps and long dual-frequency battery"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a basic step counter or a full dive computer",
                "Anyone unwilling to accept: No music storage or contactless payments"
          ],
          "notIdealFor": [
                "Sessions outside GPS training, navigation and race-day tracking for runners",
                "Smaller third-party app ecosystem than Garmin"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Apex 4 owns here",
                      "productId": "prod-fenix-8",
                      "label": "Fenix 8 AMOLED 47mm"
                },
                {
                      "when": "the Pace 4 role matches your week better than this pick",
                      "productId": "prod-coros-pace-4",
                      "label": "Pace 4"
                }
          ],
          "useCaseStrengths": [
                "Full offline topo/street maps on a durable sapphire MIP",
                "Strong dual-frequency GPS battery on the 46 mm size",
                "Titanium bezel build lighter than Vertix for most trail days"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-coros-pace-4": {
          "whyItFits": [
                "COROS Pace 4 fits GPS training, navigation and race-day tracking for runners when best price-to-performance for most road runners who want dual-frequency GPS and light weight without music/payments.",
                "In this guide context it earns the pick for just 32 g with nylon band—easy all-day racing weight and 41 hours all-systems / 31 hours dual-frequency gps claims — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a basic step counter or a full dive computer."
          ],
          "whyItWon": "COROS Pace 4 takes this award because it covers GPS training, navigation and race-day tracking for runners more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "No full offline maps (step up to Apex 4 / Pace Pro).",
                "No music or payments."
          ],
          "bestForProfiles": [
                "Runners whose week matches GPS training, navigation and race-day tracking for runners",
                "Athletes who want: Ultralight AMOLED value runner with standout dual-frequency battery claims"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a basic step counter or a full dive computer",
                "Anyone unwilling to accept: No full offline maps (step up to Apex 4 / Pace Pro)"
          ],
          "notIdealFor": [
                "Sessions outside GPS training, navigation and race-day tracking for runners",
                "No music or payments"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Pace 4 owns here",
                      "productId": "prod-forerunner-570",
                      "label": "Forerunner 570"
                },
                {
                      "when": "the Pace Pro role matches your week better than this pick",
                      "productId": "prod-coros-pace-pro",
                      "label": "Pace Pro"
                }
          ],
          "useCaseStrengths": [
                "Just 32 g with nylon band—easy all-day racing weight",
                "41 hours all-systems / 31 hours dual-frequency GPS claims",
                "Strong price-to-performance versus mid Garmin Forerunners"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-apple-watch-ultra-3": {
          "whyItFits": [
                "Apple Watch Ultra 3 fits GPS training, navigation and race-day tracking for runners when when iPhone apps, Apple Pay, and cellular matter as much as GPS — Ultra 3 beats Series watches on rugged GPS endurance, but still trails dedicated ultra MIP watches.",
                "In this guide context it earns the pick for best iphone app ecosystem, apple pay, and cellular options and rugged titanium build with dual-frequency gps and siren — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a basic step counter or a full dive computer."
          ],
          "whyItWon": "Apple Watch Ultra 3 takes this award because it covers GPS training, navigation and race-day tracking for runners more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Still shorter continuous GPS endurance than Garmin/COROS ultras.",
                "Less specialized long-term training coaching than dedicated run watches."
          ],
          "bestForProfiles": [
                "Runners whose week matches GPS training, navigation and race-day tracking for runners",
                "Athletes who want: Best smartwatch hybrid for Apple-ecosystem runners"
          ],
          "whoShouldAvoid": [
                "Runners who need multi-day continuous GPS without charging mid-adventure"
          ],
          "notIdealFor": [
                "Sessions outside GPS training, navigation and race-day tracking for runners",
                "Less specialized long-term training coaching than dedicated run watches"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Ultra 3 owns here",
                      "productId": "prod-forerunner-970",
                      "label": "Forerunner 970"
                },
                {
                      "when": "the Fenix 8 AMOLED 47mm role matches your week better than this pick",
                      "productId": "prod-fenix-8",
                      "label": "Fenix 8 AMOLED 47mm"
                }
          ],
          "useCaseStrengths": [
                "Best iPhone app ecosystem, Apple Pay, and cellular options",
                "Rugged titanium build with dual-frequency GPS and siren",
                "Multiday claim (~42 h normal / 72 h Low Power) beats Series watches"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-forerunner-165": {
          "whyItFits": [
                "Garmin Forerunner 165 fits GPS training, navigation and race-day tracking for runners when lower complexity entry when you mainly need GPS runs and basic metrics before stepping into 570/970 feature density.",
                "In this guide context it earns the pick for approachable price and bright amoled for first gps watch — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a basic step counter or a full dive computer."
          ],
          "whyItWon": "Garmin Forerunner 165 takes this award because it covers GPS training, navigation and race-day tracking for runners more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Fewer advanced metrics.",
                "No music or maps."
          ],
          "bestForProfiles": [
                "Runners whose week matches GPS training, navigation and race-day tracking for runners",
                "Athletes who want: Simpler Garmin GPS watch for new runners"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a basic step counter or a full dive computer",
                "Anyone unwilling to accept: Fewer advanced metrics"
          ],
          "notIdealFor": [
                "Sessions outside GPS training, navigation and race-day tracking for runners",
                "No music or maps"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Forerunner 165 owns here",
                      "productId": "prod-coros-pace-4",
                      "label": "Pace 4"
                },
                {
                      "when": "the Run role matches your week better than this pick",
                      "productId": "prod-suunto-run",
                      "label": "Run"
                }
          ],
          "useCaseStrengths": [
                "Approachable price",
                "Bright AMOLED for first GPS watch"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "stability-running-shoes": {
    intro: "Modern stability ranges from medial posts to guide rails, sidewalls and geometry cues. This is equipment decision support — not a gait diagnosis or medical advice. We shortlist shoes that clearly own a support-oriented daily role and spell out when a forgiving neutral (like Ghost) is enough versus when a dedicated stability daily is the better tool. Compare Kayano, Adrenaline, GT-2000 and Structure on guidance style and fit family before chasing the softest foam.",
    whatMattersIntro: "Guidance character (post, rails, geometry), daily comfort for volume, fit/widths, value versus flagship stability pricing, and honesty about when a neutral daily is enough. Kitletics does not diagnose overpronation.",
    methodologySummary: "Filtered to stability classifications and stability Recommendation contexts, plus one forgiving neutral for mild-support edge cases. Affiliate commission does not influence ranking.",
    selectionMethodology: "Filtered to stability classifications and stability Recommendation contexts, plus one forgiving neutral for mild-support edge cases. Affiliate commission does not influence ranking.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Flagship stability daily",
                "productId": "prod-kayano-32",
                "reason": "Strongest dedicated stability Recommendation profile."
          },
          {
                "need": "Brooks GuideRails fit",
                "productId": "prod-adrenaline-gts-25",
                "reason": "When Brooks last + rails beat ASICS Kayano."
          },
          {
                "need": "Value stability",
                "productId": "prod-gt-2000-14",
                "reason": "Support without full Kayano pricing."
          },
          {
                "need": "Nike stability path",
                "productId": "prod-structure-26",
                "reason": "Current Structure geometry for Nike athletes."
          },
          {
                "need": "Mild support via widths first",
                "productId": "prod-ghost-18",
                "reason": "Try forgiving neutral + widths before a full stability shoe."
          }
    ],
    quickTake: [
          "Choose GEL-Kayano 32 if flagship stability daily.",
          "Choose Adrenaline GTS 25 if brooks guiderails fit.",
          "Choose GT-2000 14 if value stability.",
          "Choose Structure 26 if nike stability path.",
          "Choose Ghost 18 if mild support via widths first."
    ],
    consideredProductIds: ["prod-kayano-32","prod-adrenaline-gts-25","prod-gt-2000-14","prod-structure-plus","prod-structure-26","prod-ghost-18","prod-clifton-10"],
    shortlistedProductIds: ["prod-kayano-32","prod-adrenaline-gts-25","prod-gt-2000-14","prod-structure-plus","prod-structure-26","prod-ghost-18","prod-clifton-10"],
    recommendations: {
    "prod-kayano-32": {
          "whyItFits": [
                "ASICS GEL-Kayano 32 fits guided daily road mileage when you want support-oriented geometry when strongest stability Recommendation profile among current stability dailies in the catalog.",
                "In this guide context it earns the pick for trusted stability platform and wide width range — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you are a happy neutral runner who only wants max bounce."
          ],
          "whyItWon": "ASICS GEL-Kayano 32 takes this award because it covers guided daily road mileage when you want support-oriented geometry more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Heavier than neutral daily trainers.",
                "Not built for fast intervals."
          ],
          "bestForProfiles": [
                "Runners whose week matches guided daily road mileage when you want support-oriented geometry",
                "Athletes who want: Flagship ASICS stability daily"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you are a happy neutral runner who only wants max bounce",
                "Anyone unwilling to accept: Heavier than neutral daily trainers"
          ],
          "notIdealFor": [
                "Sessions outside guided daily road mileage when you want support-oriented geometry",
                "Not built for fast intervals"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than GEL-Kayano 32 owns here",
                      "productId": "prod-adrenaline-gts-25",
                      "label": "Adrenaline GTS 25"
                },
                {
                      "when": "the GT-2000 14 role matches your week better than this pick",
                      "productId": "prod-gt-2000-14",
                      "label": "GT-2000 14"
                }
          ],
          "useCaseStrengths": [
                "Trusted stability platform",
                "Wide width range",
                "Plush protection"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-adrenaline-gts-25": {
          "whyItFits": [
                "Brooks Adrenaline GTS 25 fits guided daily road mileage when you want support-oriented geometry when when you prefer Brooks fit and GuideRails guidance over ASICS Kayano.",
                "In this guide context it earns the pick for trusted guiderails support and excellent widths — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you are a happy neutral runner who only wants max bounce."
          ],
          "whyItWon": "Brooks Adrenaline GTS 25 takes this award because it covers guided daily road mileage when you want support-oriented geometry more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Higher drop.",
                "Not a speed shoe."
          ],
          "bestForProfiles": [
                "Runners whose week matches guided daily road mileage when you want support-oriented geometry",
                "Athletes who want: Brooks GuideRails stability daily"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you are a happy neutral runner who only wants max bounce",
                "Anyone unwilling to accept: Higher drop"
          ],
          "notIdealFor": [
                "Sessions outside guided daily road mileage when you want support-oriented geometry",
                "Not a speed shoe"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Trusted GuideRails support",
                "Excellent widths"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-gt-2000-14": {
          "whyItFits": [
                "ASICS GT-2000 14 fits guided daily road mileage when you want support-oriented geometry when stability support at a typically lower price tier than Kayano.",
                "In this guide context it earns the pick for approachable stability and good value vs kayano — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you are a happy neutral runner who only wants max bounce."
          ],
          "whyItWon": "ASICS GT-2000 14 takes this award because it covers guided daily road mileage when you want support-oriented geometry more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less plush than Kayano.",
                "Not a race shoe."
          ],
          "bestForProfiles": [
                "Runners whose week matches guided daily road mileage when you want support-oriented geometry",
                "Athletes who want: ASICS mid-tier stability alternative"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you are a happy neutral runner who only wants max bounce",
                "Anyone unwilling to accept: Less plush than Kayano"
          ],
          "notIdealFor": [
                "Sessions outside guided daily road mileage when you want support-oriented geometry",
                "Not a race shoe"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Approachable stability",
                "Good value vs Kayano"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-structure-plus": {
          "whyItFits": [
                "Nike Structure Plus fits guided daily road mileage when you want support-oriented geometry when nike Structure path when you want stability inside the Nike lineup.",
                "In this guide context it earns the pick for supportive yet livelier than structure 26 and strong long-run option — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you are a happy neutral runner who only wants max bounce."
          ],
          "whyItWon": "Nike Structure Plus takes this award because it covers guided daily road mileage when you want support-oriented geometry more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Higher price than Structure 26.",
                "Fit can run firm for wide feet."
          ],
          "bestForProfiles": [
                "Runners whose week matches guided daily road mileage when you want support-oriented geometry",
                "Athletes who want: Nike stability option for support-oriented dailies"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you are a happy neutral runner who only wants max bounce",
                "Anyone unwilling to accept: Higher price than Structure 26"
          ],
          "notIdealFor": [
                "Sessions outside guided daily road mileage when you want support-oriented geometry",
                "Fit can run firm for wide feet"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Supportive yet livelier than Structure 26",
                "Strong long-run option"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-structure-26": {
          "whyItFits": [
                "Nike Structure 26 fits guided daily road mileage when you want support-oriented geometry when when you want the latest Structure geometry for guided Nike daily miles.",
                "In this guide context it earns the pick for accessible stability option and everyday durability — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you are a happy neutral runner who only wants max bounce."
          ],
          "whyItWon": "Nike Structure 26 takes this award because it covers guided daily road mileage when you want support-oriented geometry more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less plush than Structure Plus.",
                "Not for race day."
          ],
          "bestForProfiles": [
                "Runners whose week matches guided daily road mileage when you want support-oriented geometry",
                "Athletes who want: Current Nike Structure stability daily"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you are a happy neutral runner who only wants max bounce",
                "Anyone unwilling to accept: Less plush than Structure Plus"
          ],
          "notIdealFor": [
                "Sessions outside guided daily road mileage when you want support-oriented geometry",
                "Not for race day"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Accessible stability option",
                "Everyday durability"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-ghost-18": {
          "whyItFits": [
                "Brooks Ghost 18 fits guided daily road mileage when you want support-oriented geometry when when you want a forgiving daily with widths before committing to a full stability post/rail shoe.",
                "In this guide context it earns the pick for beginner-friendly and excellent width range — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you are a happy neutral runner who only wants max bounce."
          ],
          "whyItWon": "Brooks Ghost 18 takes this award because it covers guided daily road mileage when you want support-oriented geometry more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Higher drop.",
                "Less energetic than Novablast-class shoes."
          ],
          "bestForProfiles": [
                "Runners whose week matches guided daily road mileage when you want support-oriented geometry",
                "Athletes who want: Neutral Ghost for mild support needs via fit/widths"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you are a happy neutral runner who only wants max bounce",
                "Anyone unwilling to accept: Higher drop"
          ],
          "notIdealFor": [
                "Sessions outside guided daily road mileage when you want support-oriented geometry",
                "Less energetic than Novablast-class shoes"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Beginner-friendly",
                "Excellent width range",
                "Smooth easy-mile ride"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-clifton-10": {
          "whyItFits": [
                "HOKA Clifton 10 fits guided daily road mileage when you want support-oriented geometry when when protective stack and meta-rocker matter more than a traditional medial post.",
                "In this guide context it earns the pick for light for the stack and smooth rocker — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you are a happy neutral runner who only wants max bounce."
          ],
          "whyItWon": "HOKA Clifton 10 takes this award because it covers guided daily road mileage when you want support-oriented geometry more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Fit can run short.",
                "Less energetic than PEBA trainers."
          ],
          "bestForProfiles": [
                "Runners whose week matches guided daily road mileage when you want support-oriented geometry",
                "Athletes who want: High-stack HOKA daily with geometry stability cues"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you are a happy neutral runner who only wants max bounce",
                "Anyone unwilling to accept: Fit can run short"
          ],
          "notIdealFor": [
                "Sessions outside guided daily road mileage when you want support-oriented geometry",
                "Less energetic than PEBA trainers"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Light for the stack",
                "Smooth rocker"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "daily-trainers": {
    intro: "Daily trainers should carry the boring majority of your week — easy miles, mixed paces, and enough durability to survive a block. This guide ranks shoes that can be the default pair, not race plates or one-off long-run floaters. Soft energy helps, but predictability, fit, and versatility decide whether one shoe can own the week. We keep considered, shortlisted and recommended layers distinct so you can see what we evaluated versus what earned a card.",
    whatMattersIntro: "Everyday comfort, foam/outsole durability, pace versatility, secure fit, and a ride you trust on tired legs. Value matters when this pair absorbs most kilometres. Skip shoes that only shine as race-day or max-cushion recovery tools.",
    methodologySummary: "Candidate universe: published daily-trainer road shoes with easy/daily Recommendation contexts. Shortlist requires readiness and a distinct daily role (overall bounce, widths/beginner, value, plush stack, classic daily, soft premium, high-mileage protection). Affiliate commission does not influence ranking.",
    selectionMethodology: "Candidate universe: published daily-trainer road shoes with easy/daily Recommendation contexts. Shortlist requires readiness and a distinct daily role (overall bounce, widths/beginner, value, plush stack, classic daily, soft premium, high-mileage protection). Affiliate commission does not influence ranking.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Best all-round daily bounce",
                "productId": "prod-novablast-6",
                "reason": "Soft energetic ride for most weekly miles."
          },
          {
                "need": "Widths + beginner-friendly",
                "productId": "prod-ghost-18",
                "reason": "Forgiving ride and official width depth."
          },
          {
                "need": "Best value versatile daily",
                "productId": "prod-pegasus-42",
                "reason": "Mixed paces without premium cushion pricing."
          },
          {
                "need": "Plush high-stack daily",
                "productId": "prod-clifton-10",
                "reason": "Protective HOKA stack that still works daily."
          },
          {
                "need": "Classic predictable daily",
                "productId": "prod-cumulus-27",
                "reason": "Cumulus character for high-frequency road miles."
          },
          {
                "need": "Soft Brooks daily + widths",
                "productId": "prod-glycerin-22",
                "reason": "Premium soft ride when Ghost isn’t plush enough."
          },
          {
                "need": "High-mileage protective stack",
                "productId": "prod-superblast-2",
                "reason": "More protection than a standard daily for big weeks."
          }
    ],
    quickTake: [
          "Choose Novablast 6 if best all-round daily bounce.",
          "Choose Ghost 18 if widths + beginner-friendly.",
          "Choose Pegasus 42 if best value versatile daily.",
          "Choose Clifton 10 if plush high-stack daily.",
          "Choose GEL-Cumulus 27 if classic predictable daily.",
          "Choose Glycerin 22 if soft brooks daily + widths."
    ],
    consideredProductIds: ["prod-novablast-6","prod-ghost-18","prod-pegasus-42","prod-clifton-10","prod-cumulus-27","prod-ride-18","prod-glycerin-22","prod-vomero-18","prod-superblast-2","prod-triumph-22","prod-1080-v14","prod-nimbus-27","prod-cloudmonster-2","prod-wave-rider-28","prod-torin-8"],
    shortlistedProductIds: ["prod-novablast-6","prod-ghost-18","prod-pegasus-42","prod-clifton-10","prod-cumulus-27","prod-ride-18","prod-glycerin-22","prod-vomero-18","prod-superblast-2"],
    recommendations: {
    "prod-novablast-6": {
          "whyItFits": [
                "ASICS Novablast 6 fits absorbing most of a road runner's weekly kilometres when highest easy/daily suitability among current flagship neutrals with clear role coverage.",
                "In this guide context it earns the pick for soft energetic ride and strong daily score — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "ASICS Novablast 6 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Limited widths.",
                "Not a stability shoe."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Best blend of soft cushion and energy for daily miles"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Limited widths"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Not a stability shoe"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Novablast 6 owns here",
                      "productId": "prod-ghost-18",
                      "label": "Ghost 18"
                },
                {
                      "when": "the Pegasus 42 role matches your week better than this pick",
                      "productId": "prod-pegasus-42",
                      "label": "Pegasus 42"
                },
                {
                      "when": "you prefer the Clifton 10 trade-off profile after comparing fit and ride",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                }
          ],
          "useCaseStrengths": [
                "Soft energetic ride",
                "Strong daily score",
                "Versatile easy-to-steady"
          ],
          "evidenceIds": [
                "ev-novablast-6-mfr",
                "ev-catalog-editorial"
          ]
    },
    "prod-ghost-18": {
          "whyItFits": [
                "Brooks Ghost 18 fits absorbing most of a road runner's weekly kilometres when strong pick when fit and beginner-friendliness outrank bounce.",
                "In this guide context it earns the pick for width options and predictable daily ride — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "Brooks Ghost 18 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less energetic than Novablast."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Soft and fit-friendly, especially with width needs"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Less energetic than Novablast"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Opposite ride/character needs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Ghost 18 owns here",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                },
                {
                      "when": "the Pegasus 42 role matches your week better than this pick",
                      "productId": "prod-pegasus-42",
                      "label": "Pegasus 42"
                }
          ],
          "useCaseStrengths": [
                "Width options",
                "Predictable daily ride",
                "Beginner-friendly"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-pegasus-42": {
          "whyItFits": [
                "Nike Pegasus 42 fits absorbing most of a road runner's weekly kilometres when reliable daily coverage without premium max-cushion pricing.",
                "In this guide context it earns the pick for versatile daily use and mixed-pace capability — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "Nike Pegasus 42 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less standout cushion than Novablast/Clifton."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Versatile workhorse for mixed easy and moderate paces"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Less standout cushion than Novablast/Clifton"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Opposite ride/character needs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Pegasus 42 owns here",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                },
                {
                      "when": "the Ride 18 role matches your week better than this pick",
                      "productId": "prod-ride-18",
                      "label": "Ride 18"
                }
          ],
          "useCaseStrengths": [
                "Versatile daily use",
                "Mixed-pace capability",
                "Practical price tier"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-clifton-10": {
          "whyItFits": [
                "HOKA Clifton 10 fits absorbing most of a road runner's weekly kilometres when when the daily job is mostly easy/long and you want more plush than Novablast energy.",
                "In this guide context it earns the pick for high cushion and smooth meta-rocker — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "HOKA Clifton 10 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less lively than Novablast."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Plush daily when stack and rocker comfort come first"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Less lively than Novablast"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Opposite ride/character needs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Clifton 10 owns here",
                      "productId": "prod-vomero-18",
                      "label": "Vomero 18"
                },
                {
                      "when": "the Bondi 9 role matches your week better than this pick",
                      "productId": "prod-bondi-9",
                      "label": "Bondi 9"
                }
          ],
          "useCaseStrengths": [
                "High cushion",
                "Smooth meta-rocker",
                "Easy-day protection"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-cumulus-27": {
          "whyItFits": [
                "ASICS GEL-Cumulus 27 fits absorbing most of a road runner's weekly kilometres when when you want predictable Cumulus character rather than max bounce or max stack.",
                "In this guide context it earns the pick for predictable ride and daily mileage focus — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "ASICS GEL-Cumulus 27 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less plush than Nimbus/Clifton.",
                "Less lively than Novablast."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Classic ASICS daily for high-frequency road miles"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Less plush than Nimbus/Clifton"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Less lively than Novablast"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than GEL-Cumulus 27 owns here",
                      "productId": "prod-ride-18",
                      "label": "Ride 18"
                },
                {
                      "when": "the Ghost 18 role matches your week better than this pick",
                      "productId": "prod-ghost-18",
                      "label": "Ghost 18"
                }
          ],
          "useCaseStrengths": [
                "Predictable ride",
                "Daily mileage focus",
                "ASICS fit story"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-ride-18": {
          "whyItFits": [
                "Saucony Ride 18 fits absorbing most of a road runner's weekly kilometres when approachable Saucony daily when you want Ride geometry and a balanced midsole.",
                "In this guide context it earns the pick for balanced daily ride and approachable geometry — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "Saucony Ride 18 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not a max-cushion shoe.",
                "Not a tempo plate."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Saucony daily alternative for easy and mixed miles"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Not a max-cushion shoe"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Not a tempo plate"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Ride 18 owns here",
                      "productId": "prod-pegasus-42",
                      "label": "Pegasus 42"
                },
                {
                      "when": "the GEL-Cumulus 27 role matches your week better than this pick",
                      "productId": "prod-cumulus-27",
                      "label": "GEL-Cumulus 27"
                }
          ],
          "useCaseStrengths": [
                "Balanced daily ride",
                "Approachable geometry",
                "Strong easy-mile coverage"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-glycerin-22": {
          "whyItFits": [
                "Brooks Glycerin 22 fits absorbing most of a road runner's weekly kilometres when when you want more plush than Ghost and an official Brooks width story.",
                "In this guide context it earns the pick for soft premium cushion and width options — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "Brooks Glycerin 22 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less versatile for faster mixed paces.",
                "Higher price tier."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Soft premium Brooks daily with width depth"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Less versatile for faster mixed paces"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Higher price tier"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Glycerin 22 owns here",
                      "productId": "prod-ghost-18",
                      "label": "Ghost 18"
                },
                {
                      "when": "the Triumph 22 role matches your week better than this pick",
                      "productId": "prod-triumph-22",
                      "label": "Triumph 22"
                }
          ],
          "useCaseStrengths": [
                "Soft premium cushion",
                "Width options",
                "Protective easy miles"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-vomero-18": {
          "whyItFits": [
                "Nike Vomero 18 fits absorbing most of a road runner's weekly kilometres when nike-stack alternative when you prefer Vomero geometry over HOKA/ASICS plush dailies.",
                "In this guide context it earns the pick for high-stack protection and nike daily fit path — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "Nike Vomero 18 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Less lively than Pegasus.",
                "Heavier than classic dailies."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Nike high-stack daily for protective easy volume"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Less lively than Pegasus"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Heavier than classic dailies"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Vomero 18 owns here",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                },
                {
                      "when": "the Pegasus 42 role matches your week better than this pick",
                      "productId": "prod-pegasus-42",
                      "label": "Pegasus 42"
                }
          ],
          "useCaseStrengths": [
                "High-stack protection",
                "Nike daily fit path",
                "Easy-volume comfort"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-superblast-2": {
          "whyItFits": [
                "ASICS SUPERBLAST 2 fits absorbing most of a road runner's weekly kilometres when when weekly volume needs more protective stack than a standard daily without going full max-cushion recovery.",
                "In this guide context it earns the pick for protective stack and high-mileage suitability — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you mainly need race geometry, heavy stability, or trail grip."
          ],
          "whyItWon": "ASICS SUPERBLAST 2 takes this award because it covers absorbing most of a road runner's weekly kilometres more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Overbuilt for short easy jogs.",
                "Premium price tier."
          ],
          "bestForProfiles": [
                "Runners whose week matches absorbing most of a road runner's weekly kilometres",
                "Athletes who want: Protective high-mileage stack for big training weeks"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you mainly need race geometry, heavy stability, or trail grip",
                "Anyone unwilling to accept: Overbuilt for short easy jogs"
          ],
          "notIdealFor": [
                "Sessions outside absorbing most of a road runner's weekly kilometres",
                "Premium price tier"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than SUPERBLAST 2 owns here",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                },
                {
                      "when": "the Clifton 10 role matches your week better than this pick",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                }
          ],
          "useCaseStrengths": [
                "Protective stack",
                "High-mileage suitability",
                "More range than pure recovery shoes"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "running-shoes-long-runs": {
    intro: "The best long-run shoes balance comfort, protection, stability and enough versatility to remain enjoyable as the miles build. Product recommendations are the conclusion of that analysis — not the starting point. We keep considered and shortlisted pools visible so you can see what we evaluated before narrowing to role-based picks.",
    whatMattersIntro: "Long runs place different demands than short dailies: sustained comfort, late-run stability, weight vs protection, secure fit as feet swell, pace versatility when the long run includes steady work, and durability across a block.",
    methodologySummary: "Candidate universe: published road shoes with long-run suitability. Shortlist requires readiness. Final recommendations require a distinct long-run role. Affiliate commission does not influence ranking.",
    selectionMethodology: "Candidate universe: published road shoes with long-run suitability. Shortlist requires readiness. Final recommendations require a distinct long-run role. Affiliate commission does not influence ranking.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Best overall long-run balance",
                "productId": "prod-clifton-10",
                "reason": "Protective stack without heaviest max cushion."
          },
          {
                "need": "Maximum soft late-run feel",
                "productId": "prod-bondi-9",
                "reason": "Clearest max-cushion long-run identity."
          },
          {
                "need": "More stability under fatigue",
                "productId": "prod-kayano-32",
                "reason": "Guided stability with long-run cushion."
          },
          {
                "need": "Faster / progression longs",
                "productId": "prod-superblast-2",
                "reason": "Protective stack with more range."
          },
          {
                "need": "Daily + long versatility",
                "productId": "prod-novablast-6",
                "reason": "Bounce that still helps when pace creeps up."
          }
    ],
    quickTake: [
          "Choose Clifton 10 if best overall long-run balance.",
          "Choose Bondi 9 if maximum soft late-run feel.",
          "Choose GEL-Kayano 32 if more stability under fatigue.",
          "Choose SUPERBLAST 2 if faster / progression longs.",
          "Choose Novablast 6 if daily + long versatility."
    ],
    consideredProductIds: ["prod-clifton-10","prod-novablast-6","prod-bondi-9","prod-nimbus-27","prod-superblast-2","prod-kayano-32","prod-glycerin-22","prod-vomero-18","prod-triumph-22","prod-1080-v14","prod-sc-trainer-v3","prod-cloudmonster-2","prod-boston-12","prod-hyperion-max-2","prod-structure-plus","prod-clifton-pro","prod-torin-8","prod-aero-glide-2","prod-magnify-nitro-2","prod-novablast-5","prod-clifton-9","prod-invincible-3","prod-glycerin-21"],
    shortlistedProductIds: ["prod-clifton-10","prod-novablast-6","prod-bondi-9","prod-nimbus-27","prod-superblast-2","prod-kayano-32","prod-glycerin-22","prod-vomero-18","prod-triumph-22","prod-1080-v14","prod-sc-trainer-v3","prod-cloudmonster-2"],
    recommendations: {
    "prod-clifton-10": {
          "whyItFits": [
                "Clifton 10’s high-stack meta-rocker suits long road days where the priority is sustained comfort rather than race geometry. The platform stays protective through easy and steady efforts without forcing the softest, heaviest max-cushion package in this guide.",
                "Late in longer sessions the rocker helps keep the stride rolling when form gets less precise. It is not a workout shoe for surges, but it remains usable if your long run is the main training stimulus of the week.",
                "Choose it when you want one clear long-run shoe that covers most marathon-block weekend miles without locking you into a pure recovery float."
          ],
          "whyItWon": "Compared with softer max-cushion shoes it is easier to use across typical long-run paces, while still providing enough cushioning for longer mileage. Versus livelier dailies it stays more protective when the session is mostly easy. That balance — not the highest Kitletics Score alone — is why it ranks first here.",
          "tradeoffs": [
                "Less responsive if the long run includes sustained faster work or a finishing kick.",
                "Runners wanting maximum late-run softness may still prefer Bondi or Nimbus."
          ],
          "bestForProfiles": [
                "Easy-to-steady long runs",
                "Runners who want one protective weekend shoe",
                "Medium/high weekly mileage with mostly easy long days",
                "Marathon blocks where the long run is volume, not speed"
          ],
          "whoShouldAvoid": [
                "Runners needing dedicated stability",
                "Anyone treating the long run as a quality speed session"
          ],
          "notIdealFor": [
                "Pure race-day speed",
                "Strong stability / guidance needs",
                "Technical trails",
                "Long runs built around sustained marathon-pace work"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "your priority is maximum cushioning and the softest late-run feel",
                      "productId": "prod-bondi-9",
                      "label": "Bondi 9"
                },
                {
                      "when": "long runs include progression or you want more late-run bounce",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                },
                {
                      "when": "you want a more support-focused platform",
                      "productId": "prod-kayano-32",
                      "label": "Kayano 32"
                }
          ],
          "useCaseStrengths": [
                "High-stack protection for sustained road miles",
                "Smooth meta-rocker that stays easy late in the run",
                "Lighter long-day feel than Bondi-class max cushion"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-novablast-6": {
          "whyItFits": [
                "The combination of cushioning and moderate weight makes Novablast 6 suitable when the long run includes both easy mileage and controlled faster sections. Soft FF BLAST MAX covers the early miles; the FF TURBO SQUARED forefoot pod still gives energy when pace picks up.",
                "Under fatigue it stays more lively than Bondi or Nimbus, so weight and “dead” foam are less of a complaint in the final third — at the cost of less pure plush protection than those shoes.",
                "Prefer it when you hate a max-cushion float after two hours, or when progression finishes and strides are a regular part of weekend volume."
          ],
          "whyItWon": "It beats pure max-cushion shoes for long runs that include controlled faster sections, while still offering enough stack for endurance volume. It does not displace Clifton as the overall protective default, but it is the clearer versatile pick.",
          "tradeoffs": [
                "Not the softest late-run protection in this guide — max-cushion options feel more relaxing on pure easy days.",
                "Wide-last runners may prefer other brands’ fit."
          ],
          "bestForProfiles": [
                "Long runs with progression or strides",
                "Runners who want one shoe for daily + long runs",
                "Marathon blocks with mixed pace work"
          ],
          "whoShouldAvoid": [
                "Runners seeking the softest possible easy long-run shoe"
          ],
          "notIdealFor": [
                "Maximum softness priority",
                "Strong stability needs",
                "Shuffle-only recovery long runs where plush is the goal"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "maximum cushioning and comfort are the priority",
                      "productId": "prod-nimbus-27",
                      "label": "GEL-Nimbus 27"
                },
                {
                      "when": "you want protective stack with even more endurance range",
                      "productId": "prod-superblast-2",
                      "label": "SUPERBLAST 2"
                },
                {
                      "when": "you want the overall protective long-run default",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                }
          ],
          "useCaseStrengths": [
                "Bounce that still helps in the final third of long runs",
                "Light for the stack on endurance volume",
                "Handles easy-to-moderate finishing better than pure plush shoes"
          ],
          "evidenceIds": [
                "ev-novablast-6-mfr",
                "ev-catalog-editorial"
          ]
    },
    "prod-bondi-9": {
          "whyItFits": [
                "Bondi 9’s category-leading plush stack is built for protective easy long runs — marathon-block volume that stays recovery-paced, or days when joints need maximum foam.",
                "Late-run comfort is the strength: the shoe stays soft when time on feet is high. The trade-off is mass and a slower, less versatile ride if you inject steady or marathon-pace work.",
                "Best as a dedicated soft long-run / easy shoe in a rotation, especially if you already own a livelier daily trainer."
          ],
          "whyItWon": "Among soft long-run options it offers the clearest max-cushion identity for recovery-paced mileage. It loses to Clifton and Novablast when versatility or lighter long-day feel matters more than absolute softness.",
          "tradeoffs": [
                "Heavy and slow if the long run includes faster work.",
                "Less useful as a single shoe for mixed-pace marathon blocks."
          ],
          "bestForProfiles": [
                "Recovery-paced long runs",
                "Runners prioritising maximum softness",
                "Easy volume in a multi-shoe rotation"
          ],
          "whoShouldAvoid": [
                "Anyone doing faster long runs in the same shoe"
          ],
          "notIdealFor": [
                "Progression or marathon-pace long runs",
                "Runners wanting one versatile daily + long-run shoe",
                "Pure race-day speed"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you want ASICS geometry and width depth with max cushion",
                      "productId": "prod-nimbus-27",
                      "label": "GEL-Nimbus 27"
                },
                {
                      "when": "you want protective stack without the heaviest plush package",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                },
                {
                      "when": "long runs still need late-run energy",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                }
          ],
          "useCaseStrengths": [
                "Maximum underfoot cushion for protective long easy miles",
                "Clear recovery / soft-long-run role in a rotation",
                "Wide options for volume training comfort"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-nimbus-27": {
          "whyItFits": [
                "FF BLAST PLUS ECO with PureGEL and a maximum-cushion classification make Nimbus 27 a strong protective platform for long easy road miles.",
                "Standard and wide widths matter when fit depth is as important as stack for high-mileage comfort. Prefer it over Bondi when you want ASICS character; prefer Novablast when long runs still need late-run energy.",
                "Like other max-plush options, it is less ideal when the long run includes sustained faster segments."
          ],
          "whyItWon": "It matches Bondi’s soft long-run brief with ASICS foam/geometry and stronger official width depth for many shoppers — without beating Bondi on pure max-cushion identity or Novablast on late-run energy.",
          "tradeoffs": [
                "Not ideal when long runs include faster segments.",
                "Overlaps Bondi’s soft role — brand/fit preference often decides."
          ],
          "bestForProfiles": [
                "Easy protective long runs",
                "Runners who need ASICS width options",
                "High-mileage easy volume"
          ],
          "whoShouldAvoid": [
                "Runners wanting lively progression finishes"
          ],
          "notIdealFor": [
                "Faster long runs",
                "Stability-first needs (see Kayano)",
                "Technical trails"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you want the clearest HOKA max-cushion identity",
                      "productId": "prod-bondi-9",
                      "label": "Bondi 9"
                },
                {
                      "when": "you want more support under fatigue",
                      "productId": "prod-kayano-32",
                      "label": "Kayano 32"
                },
                {
                      "when": "long runs need late-run energy",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                }
          ],
          "useCaseStrengths": [
                "Max-cushion FF BLAST PLUS ECO + PureGEL for long easy protection",
                "Standard and wide widths for high-mileage fit",
                "Strong recovery / easy long-run Recommendation score"
          ],
          "evidenceIds": [
                "ev-nimbus-mfr",
                "ev-nimbus-editorial",
                "ev-catalog-editorial"
          ]
    },
    "prod-superblast-2": {
          "whyItFits": [
                "SUPERBLAST 2’s protective stack still works when long runs include steady endurance pacing, not only shuffle. That makes it useful in high-mileage blocks where one shoe has to cover easy and controlled faster long days.",
                "Compared with Clifton’s rocker plush and Novablast’s daily bounce, it sits in a high-stack versatile role: less of a recovery float, more of an endurance platform.",
                "Premium price is the clear trade-off — overkill if every long run is purely easy recovery."
          ],
          "whyItWon": "It earns a distinct slot for runners whose long runs double as quality endurance work — more range than pure plush shoes, more protective stack intent than a standard daily bounce shoe.",
          "tradeoffs": [
                "Premium price; overkill for shuffle-only long runs.",
                "Not a dedicated stability shoe."
          ],
          "bestForProfiles": [
                "High weekly mileage",
                "Long runs that include steady work",
                "Runners wanting one premium endurance platform"
          ],
          "whoShouldAvoid": [
                "Runners who only do easy recovery long runs"
          ],
          "notIdealFor": [
                "Maximum softness priority",
                "Budget-first shopping",
                "Strong stability needs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you want livelier daily bounce at a more accessible long-run role",
                      "productId": "prod-novablast-6",
                      "label": "Novablast 6"
                },
                {
                      "when": "you want the overall protective default",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                },
                {
                      "when": "maximum softness is the goal",
                      "productId": "prod-bondi-9",
                      "label": "Bondi 9"
                }
          ],
          "useCaseStrengths": [
                "Protective stack that still works for steady endurance pacing",
                "Lighter long-run role than max-plush recovery shoes",
                "Clear alternative to pure plush or pure daily bounce"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-kayano-32": {
          "whyItFits": [
                "Kayano 32 pairs protective cushion with guided stability for long easy volume. When fatigue builds, a more supportive platform can feel more predictable than a soft neutral max-cushion shoe.",
                "It is heavier and less lively than neutral dailies — an acceptable trade-off when guidance is the reason you are shopping this guide’s stability slot.",
                "If you do not need stability, a neutral pick from this list will usually feel freer and more versatile."
          ],
          "whyItWon": "Neutral max-cushion shoes cover most of this guide; Kayano exists because support needs don’t disappear at mile 18. It is not trying to beat Clifton on versatility — it wins the stability role.",
          "tradeoffs": [
                "Heavier and less lively than neutral dailies.",
                "Unnecessary if you do not want support features."
          ],
          "bestForProfiles": [
                "Runners who want guidance on long easy volume",
                "Weekend mileage with stability preference",
                "ASICS stability shoppers"
          ],
          "whoShouldAvoid": [
                "Neutral runners who find guidance restrictive"
          ],
          "notIdealFor": [
                "Neutral runners seeking maximum versatility",
                "Faster long runs as the primary goal",
                "Technical trails"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you want soft neutral protection with ASICS widths",
                      "productId": "prod-nimbus-27",
                      "label": "GEL-Nimbus 27"
                },
                {
                      "when": "you want the overall neutral long-run default",
                      "productId": "prod-clifton-10",
                      "label": "Clifton 10"
                }
          ],
          "useCaseStrengths": [
                "Guided stability for long easy volume",
                "Protective cushion for endurance sessions",
                "Distinct role vs neutral plush picks"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-glycerin-22": {
          "whyItFits": [
                "Glycerin 22’s soft protective ride suits easy long miles when you want Brooks fit and width options rather than HOKA or ASICS character.",
                "It is less energetic for progression finishes than Novablast or SUPERBLAST, so treat it as a soft long-run / easy daily role.",
                "Choose it when brand/fit is the differentiator among soft road options already covered by Bondi and Nimbus."
          ],
          "whyItWon": "It adds decision value as a soft road alternative with Brooks’ width ladder — not as a duplicate of Bondi’s max-stack identity or Clifton’s overall balance.",
          "tradeoffs": [
                "Less energetic for progression finishes.",
                "Overlaps other soft-road roles — brand/fit usually decides."
          ],
          "bestForProfiles": [
                "Easy long runs",
                "Brooks width shoppers",
                "Soft daily + long-run use"
          ],
          "whoShouldAvoid": [
                "Runners seeking lively progression shoes"
          ],
          "notIdealFor": [
                "Faster long runs",
                "Stability-first needs",
                "Runners already happy with Bondi/Nimbus fit"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you want maximum HOKA plush",
                      "productId": "prod-bondi-9",
                      "label": "Bondi 9"
                },
                {
                      "when": "you want ASICS max cushion + widths",
                      "productId": "prod-nimbus-27",
                      "label": "GEL-Nimbus 27"
                }
          ],
          "useCaseStrengths": [
                "Soft protective ride for easy long miles",
                "Brooks width ladder",
                "Clear brand/fit alternative to HOKA/ASICS plush"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "marathon-shoes": {
    intro: "Marathon footwear is a role decision: carbon race day, approachable tempo hybrid, protective first-marathon comfort, or training-block daily that survives the long runs. This guide is not a duplicate of Best Race Shoes — race shoes focus on PR geometry across distances; here we weight marathon-day comfort, first-marathon priorities, and how training shoes support the block. Choose Vaporfly/Alphafly/Adios when the goal is a timed race; choose Clifton or Novablast when finishing strong and training consistency matter more than plate stiffness.",
    whatMattersIntro: "Long-run cushioning, durability across a training block, ride efficiency for race or long workouts, comfort over distance for first marathons, and clear training vs race-day roles. Do not force a carbon racer if your plan is finish-focused.",
    methodologySummary: "Combines marathon Recommendation contexts with long-run suitability for first-marathon scenarios. Distinct roles required. Affiliate commission does not influence ranking. Differentiated from Best Race Shoes by including training/comfort marathon paths.",
    selectionMethodology: "Combines marathon Recommendation contexts with long-run suitability for first-marathon scenarios. Distinct roles required. Affiliate commission does not influence ranking. Differentiated from Best Race Shoes by including training/comfort marathon paths.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Marathon PR race day",
                "productId": "prod-vaporfly-4",
                "reason": "Primary carbon race option for timed marathons."
          },
          {
                "need": "Less extreme race geometry",
                "productId": "prod-endorphin-speed-5",
                "reason": "Tempo hybrid when full carbon feels too aggressive."
          },
          {
                "need": "First marathon comfort",
                "productId": "prod-clifton-10",
                "reason": "Finish-focused protective stack."
          },
          {
                "need": "Training-block daily + longs",
                "productId": "prod-novablast-6",
                "reason": "Covers marathon prep mileage even if race day differs."
          },
          {
                "need": "Aggressive Nike race package",
                "productId": "prod-alphafly-3",
                "reason": "When Alphafly geometry is the plan."
          }
    ],
    quickTake: [
          "Choose Vaporfly 4 if marathon pr race day.",
          "Choose Endorphin Speed 5 if less extreme race geometry.",
          "Choose Clifton 10 if first marathon comfort.",
          "Choose Novablast 6 if training-block daily + longs.",
          "Choose Alphafly 3 if aggressive nike race package."
    ],
    consideredProductIds: ["prod-vaporfly-4","prod-endorphin-speed-5","prod-clifton-10","prod-novablast-6","prod-alphafly-3","prod-adios-pro-4","prod-superblast-2","prod-sc-trainer-v3"],
    shortlistedProductIds: ["prod-vaporfly-4","prod-endorphin-speed-5","prod-clifton-10","prod-novablast-6","prod-alphafly-3","prod-adios-pro-4","prod-superblast-2","prod-sc-trainer-v3"],
    recommendations: {
    "prod-vaporfly-4": {
          "whyItFits": [
                "Nike Vaporfly 4 fits marathon race day or marathon-block long training depending on the pick's role when primary marathon race shoe when chasing a time with carbon race geometry.",
                "In this guide context it earns the pick for proven race platform and lighter / sharper than alphafly for many — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "Nike Vaporfly 4 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not for easy mileage.",
                "Limited durability."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: Race-day carbon for marathon PRs"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Not for easy mileage"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Limited durability"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Proven race platform",
                "Lighter / sharper than Alphafly for many"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-endorphin-speed-5": {
          "whyItFits": [
                "Saucony Endorphin Speed 5 fits marathon race day or marathon-block long training depending on the pick's role when useful when a full carbon racer feels too aggressive for your marathon plan.",
                "In this guide context it earns the pick for versatile plated workout shoe and strong race/training crossover — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "Saucony Endorphin Speed 5 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Overkill for easy recovery jogs.",
                "Firmera than daily trainers."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: Tempo hybrid for marathoners who want less extreme race geometry"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Overkill for easy recovery jogs"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Firmera than daily trainers"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Versatile plated workout shoe",
                "Strong race/training crossover"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-clifton-10": {
          "whyItFits": [
                "HOKA Clifton 10 fits marathon race day or marathon-block long training depending on the pick's role when when finishing comfortably matters more than race-shoe stiffness — especially first marathons.",
                "In this guide context it earns the pick for light for the stack and smooth rocker — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "HOKA Clifton 10 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Fit can run short.",
                "Less energetic than PEBA trainers."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: Comfort-first marathon option for first timers"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Fit can run short"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Less energetic than PEBA trainers"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Light for the stack",
                "Smooth rocker"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-novablast-6": {
          "whyItFits": [
                "ASICS Novablast 6 fits marathon race day or marathon-block long training depending on the pick's role when strong daily/long option for marathon training blocks even if race day uses a different shoe.",
                "In this guide context it earns the pick for soft energetic daily ride and improved wet grip vs prior novablast — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "ASICS Novablast 6 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not a stability shoe.",
                "Less ideal as a pure race-day racer."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: Training-block daily that can cover long marathon prep miles"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Not a stability shoe"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Less ideal as a pure race-day racer"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Soft energetic daily ride",
                "Improved wet grip vs prior Novablast",
                "Light for the stack"
          ],
          "evidenceIds": [
                "ev-novablast-6-mfr",
                "ev-catalog-editorial"
          ]
    },
    "prod-alphafly-3": {
          "whyItFits": [
                "Nike Alphafly 3 fits marathon race day or marathon-block long training depending on the pick's role when when you want Alphafly race geometry for a dedicated marathon PR attempt.",
                "In this guide context it earns the pick for maximum race-day stack and pop and marathon specialist geometry — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "Nike Alphafly 3 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Expensive.",
                "Overkill for shorter / easy runs."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: More aggressive Nike marathon race package"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Expensive"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Overkill for shorter / easy runs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Maximum race-day stack and pop",
                "Marathon specialist geometry"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-adios-pro-4": {
          "whyItFits": [
                "Adidas Adizero Adios Pro 4 fits marathon race day or marathon-block long training depending on the pick's role when when you prefer adidas Lightstrike Pro race geometry for marathon day.",
                "In this guide context it earns the pick for efficient race geometry and strong marathon pedigree — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "Adidas Adizero Adios Pro 4 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not for easy mileage.",
                "Aggressive fit for some."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: adidas Adizero marathon race option"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Not for easy mileage"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Aggressive fit for some"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Efficient race geometry",
                "Strong marathon pedigree"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-superblast-2": {
          "whyItFits": [
                "ASICS SUPERBLAST 2 fits marathon race day or marathon-block long training depending on the pick's role when when marathon prep volume needs more protective stack than a standard daily.",
                "In this guide context it earns the pick for huge protective stack and surprisingly lively for the height — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "ASICS SUPERBLAST 2 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Tall ride can feel unstable for some.",
                "Premium price."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: Protective high-mileage trainer for marathon blocks"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Tall ride can feel unstable for some"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Premium price"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Huge protective stack",
                "Surprisingly lively for the height"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-sc-trainer-v3": {
          "whyItFits": [
                "New Balance FuelCell SuperComp Trainer v3 fits marathon race day or marathon-block long training depending on the pick's role when plated long-distance option that can cover both big training days and race day.",
                "In this guide context it earns the pick for protective plated long-run shoe and race-pace training partner to elite — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need a 5K track spike or a pure daily with no marathon plan."
          ],
          "whyItWon": "New Balance FuelCell SuperComp Trainer v3 takes this award because it covers marathon race day or marathon-block long training depending on the pick's role more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Tall stack can feel tippy.",
                "Overbuilt for short easy jogs."
          ],
          "bestForProfiles": [
                "Runners whose week matches marathon race day or marathon-block long training depending on the pick's role",
                "Athletes who want: New Balance SuperComp for long race and training efforts"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need a 5K track spike or a pure daily with no marathon plan",
                "Anyone unwilling to accept: Tall stack can feel tippy"
          ],
          "notIdealFor": [
                "Sessions outside marathon race day or marathon-block long training depending on the pick's role",
                "Overbuilt for short easy jogs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Protective plated long-run shoe",
                "Race-pace training partner to Elite"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "running-hydration-vests": {
    intro: "Hydration vests solve water, soft flasks and fuel when belts run out of capacity. Capacity, torso fit, flask compatibility and bounce control matter more than brand logos. This guide ranks race-oriented vests and one higher-capacity trail pack so you can match volume to distance and aid-station strategy. Soft flasks may be separate products — check compatibility. If you mainly need phone carry on road longs, start with Best Running Belts instead.",
    whatMattersIntro: "Capacity for your longest unsupported stretch, secure bounce-free fit, front flask access, pocket layout for fuel, and whether you need pack-style reservoir volume versus a minimal race vest.",
    methodologySummary: "Compared capacity, flask inclusion and race/trail suitability from structured specs among published packs/vests. Affiliate commission does not influence ranking.",
    selectionMethodology: "Compared capacity, flask inclusion and race/trail suitability from structured specs among published packs/vests. Affiliate commission does not influence ranking.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Best all-round race/trail vest",
                "productId": "prod-adv-skin-12",
                "reason": "Soft-flask front storage and proven race-vest role."
          },
          {
                "need": "Lighter Salomon race vest",
                "productId": "prod-salomon-adv-skin-5",
                "reason": "ADV Skin fit without 12L bulk."
          },
          {
                "need": "UD pocket layout",
                "productId": "prod-ud-race-vest-6",
                "reason": "When UD race vest patterning fits better."
          },
          {
                "need": "Light Nathan race vest",
                "productId": "prod-nathan-vaporair-4",
                "reason": "Road longs and trail training without max volume."
          },
          {
                "need": "More pack-style capacity",
                "productId": "prod-osprey-duro-6",
                "reason": "Reservoir days that outgrow a minimal race vest."
          }
    ],
    quickTake: [
          "Choose ADV Skin 12 if best all-round race/trail vest.",
          "Choose ADV Skin 5 if lighter salomon race vest.",
          "Choose Race Vest 6.0 if ud pocket layout.",
          "Choose VaporAir 4.0 if light nathan race vest.",
          "Choose Duro 6 if more pack-style capacity."
    ],
    consideredProductIds: ["prod-adv-skin-12","prod-salomon-adv-skin-5","prod-ud-race-vest-6","prod-nathan-vaporair-4","prod-osprey-duro-6"],
    shortlistedProductIds: ["prod-adv-skin-12","prod-salomon-adv-skin-5","prod-ud-race-vest-6","prod-nathan-vaporair-4","prod-osprey-duro-6"],
    recommendations: {
    "prod-adv-skin-12": {
          "whyItFits": [
                "Salomon ADV Skin 12 fits carrying water and fuel when a belt is not enough when strongest all-round vest in the current catalog for trail and long efforts with soft-flask front storage.",
                "In this guide context it earns the pick for stable race fit across long trail days and enough volume for mandatory ultra kit — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need phone/keys on short road runs."
          ],
          "whyItWon": "Salomon ADV Skin 12 takes this award because it covers carrying water and fuel when a belt is not enough more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Overkill for road 10K.",
                "Learning curve to pack pockets efficiently."
          ],
          "bestForProfiles": [
                "Runners whose week matches carrying water and fuel when a belt is not enough",
                "Athletes who want: Salomon race-vest staple for flasks and trail days"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need phone/keys on short road runs",
                "Anyone unwilling to accept: Overkill for road 10K"
          ],
          "notIdealFor": [
                "Sessions outside carrying water and fuel when a belt is not enough",
                "Learning curve to pack pockets efficiently"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Skin 12 owns here",
                      "productId": "prod-salomon-adv-skin-5",
                      "label": "ADV Skin 5"
                },
                {
                      "when": "the Race Vest 6.0 role matches your week better than this pick",
                      "productId": "prod-ud-race-vest-6",
                      "label": "Race Vest 6.0"
                },
                {
                      "when": "you prefer the VaporAir 4.0 trade-off profile after comparing fit and ride",
                      "productId": "prod-nathan-vaporair-4",
                      "label": "VaporAir 4.0"
                }
          ],
          "useCaseStrengths": [
                "Stable race fit across long trail days",
                "Enough volume for mandatory ultra kit"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-salomon-adv-skin-5": {
          "whyItFits": [
                "Salomon ADV Skin 5 fits carrying water and fuel when a belt is not enough when when you want Salomon race fit and twin flasks for marathon/trail days that do not need ultra kit volume.",
                "In this guide context it earns the pick for stable salomon sensifit race harness with low bounce and twin 500 ml flasks cover most long-run hydration without a bladder — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need phone/keys on short road runs."
          ],
          "whyItWon": "Salomon ADV Skin 5 takes this award because it covers carrying water and fuel when a belt is not enough more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "No reservoir sleeve — bladder days need a larger ADV Skin or adventure vest.",
                "5L fills fast once poles, jacket and food stack up on ultras."
          ],
          "bestForProfiles": [
                "Runners whose week matches carrying water and fuel when a belt is not enough",
                "Athletes who want: Lighter ADV Skin race vest without 12L bulk"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need phone/keys on short road runs",
                "Anyone unwilling to accept: No reservoir sleeve — bladder days need a larger ADV Skin or adventure vest"
          ],
          "notIdealFor": [
                "Sessions outside carrying water and fuel when a belt is not enough",
                "5L fills fast once poles, jacket and food stack up on ultras"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Stable Salomon Sensifit race harness with low bounce",
                "Twin 500 ml flasks cover most long-run hydration without a bladder",
                "Enough rear volume for mandatory race kit without ADV Skin 12 bulk"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-ud-race-vest-6": {
          "whyItFits": [
                "Ultimate Direction Race Vest 6.0 fits carrying water and fuel when a belt is not enough when when you prefer UD pocket layout for trail and race-day flask carry.",
                "In this guide context it earns the pick for classic ud front-pocket race layout for gels and flasks and 6l hits the sweet spot for trail race mandatory kit — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need phone/keys on short road runs."
          ],
          "whyItWon": "Ultimate Direction Race Vest 6.0 takes this award because it covers carrying water and fuel when a belt is not enough more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Limited rear volume for multi-day adventure packing.",
                "No included bladder path — stick to flasks or step up to Adventure Vest."
          ],
          "bestForProfiles": [
                "Runners whose week matches carrying water and fuel when a belt is not enough",
                "Athletes who want: Ultimate Direction race vest alternative"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need phone/keys on short road runs",
                "Anyone unwilling to accept: Limited rear volume for multi-day adventure packing"
          ],
          "notIdealFor": [
                "Sessions outside carrying water and fuel when a belt is not enough",
                "No included bladder path — stick to flasks or step up to Adventure Vest"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Classic UD front-pocket race layout for gels and flasks",
                "6L hits the sweet spot for trail race mandatory kit",
                "Lighter day-to-day than Adventure Vest or 12L packs"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-nathan-vaporair-4": {
          "whyItFits": [
                "Nathan VaporAir 4.0 8L fits carrying water and fuel when a belt is not enough when when you want a lighter race-oriented vest than ADV Skin 12 for road longs and trail training.",
                "In this guide context it earns the pick for 8l capacity covers race kit without jumping to a 12l adventure vest and front-flask workflow stays fast on the move — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need phone/keys on short road runs."
          ],
          "whyItWon": "Nathan VaporAir 4.0 8L takes this award because it covers carrying water and fuel when a belt is not enough more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Not bladder-first — long desert/hot ultras may prefer Zephyr Pro or Pinnacle.",
                "Unisex patterning may need careful sizing vs Osprey Duro/Dyna."
          ],
          "bestForProfiles": [
                "Runners whose week matches carrying water and fuel when a belt is not enough",
                "Athletes who want: Updated Nathan light race vest"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need phone/keys on short road runs",
                "Anyone unwilling to accept: Not bladder-first — long desert/hot ultras may prefer Zephyr Pro or Pinnacle"
          ],
          "notIdealFor": [
                "Sessions outside carrying water and fuel when a belt is not enough",
                "Unisex patterning may need careful sizing vs Osprey Duro/Dyna"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "8L capacity covers race kit without jumping to a 12L adventure vest",
                "Front-flask workflow stays fast on the move",
                "Clear upgrade path from VaporAir 2 for runners who outgrew rear stash"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-osprey-duro-6": {
          "whyItFits": [
                "Osprey Duro 6 fits carrying water and fuel when a belt is not enough when when you need more pack-style capacity and reservoir options than a minimal race vest.",
                "In this guide context it earns the pick for stable osprey harness and clear 6l day-run capacity — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if you only need phone/keys on short road runs."
          ],
          "whyItWon": "Osprey Duro 6 takes this award because it covers carrying water and fuel when a belt is not enough more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Men’s patterning — Dyna is the women’s counterpart."
          ],
          "bestForProfiles": [
                "Runners whose week matches carrying water and fuel when a belt is not enough",
                "Athletes who want: Osprey trail pack for longer days"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when you only need phone/keys on short road runs",
                "Anyone unwilling to accept: Men’s patterning — Dyna is the women’s counterpart"
          ],
          "notIdealFor": [
                "Sessions outside carrying water and fuel when a belt is not enough",
                "Opposite ride/character needs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "another shoe in this guide owns your primary job more cleanly",
                      "label": "another pick in this guide"
                }
          ],
          "useCaseStrengths": [
                "Stable Osprey harness",
                "Clear 6L day-run capacity"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
  "heart-rate-monitors-running": {
    intro: "Watch optical HR is fine for many easy miles. For intervals, races, HYROX stations, and sessions where HR must respond quickly, an external ECG chest strap or a good optical armband is usually the better tool. This guide ranks running-relevant monitors by accuracy context, connectivity, comfort, and whether you need Garmin dynamics or cross-ecosystem Bluetooth/ANT+. We are not ranking medical devices or diagnosing training status — just helping you choose a sensor that matches how you train.",
    whatMattersIntro: "Sensing method (ECG chest vs optical arm), connection stability to your watch/apps, comfort on long runs, battery/charging habits, and extras like running dynamics or memory. Confirm ANT+/Bluetooth with your watch before buying.",
    methodologySummary: "Compared sensing method, connectivity, dynamics, standalone memory and comfort across the published HRM catalog. Affiliate commission does not influence ranking.",
    selectionMethodology: "Compared sensing method, connectivity, dynamics, standalone memory and comfort across the published HRM catalog. Affiliate commission does not influence ranking.",
    evidenceIds: [...EVIDENCE],
    decisionShortcuts: [
          {
                "need": "Cross-ecosystem ECG default",
                "productId": "prod-polar-h10",
                "reason": "Accuracy reputation + dual Bluetooth/ANT+."
          },
          {
                "need": "Garmin dynamics extras",
                "productId": "prod-hrm-600",
                "reason": "When you will use running dynamics in Connect."
          },
          {
                "need": "Chest-strap chafe escape",
                "productId": "prod-coros-hrm",
                "reason": "Optical armband comfort for humid/HYROX weeks."
          },
          {
                "need": "Rechargeable value strap",
                "productId": "prod-wahoo-trackr",
                "reason": "ECG without Polar/Garmin lock-in."
          },
          {
                "need": "Budget Polar starter",
                "productId": "prod-polar-h9",
                "reason": "Serious HR without H10 extras you will not use."
          }
    ],
    quickTake: [
          "Choose H10 if cross-ecosystem ecg default.",
          "Choose HRM 600 if garmin dynamics extras.",
          "Choose Heart Rate Monitor if chest-strap chafe escape.",
          "Choose TRACKR Heart Rate if rechargeable value strap.",
          "Choose H9 if budget polar starter."
    ],
    consideredProductIds: ["prod-polar-h10","prod-hrm-600","prod-coros-hrm","prod-wahoo-trackr","prod-polar-h9"],
    shortlistedProductIds: ["prod-polar-h10","prod-hrm-600","prod-coros-hrm","prod-wahoo-trackr","prod-polar-h9"],
    recommendations: {
    "prod-polar-h10": {
          "whyItFits": [
                "Polar H10 fits accurate heart-rate training for running intervals, tempo and easy control when dual Bluetooth, ANT+, and a long independent accuracy reputation — the default when you care about HR/HRV more than Garmin dynamics extras.",
                "In this guide context it earns the pick for broad device compatibility and trusted chest-strap accuracy reputation — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if wrist optical on your watch already matches easy-day HR well enough."
          ],
          "whyItWon": "Polar H10 takes this award because it covers accurate heart-rate training for running intervals, tempo and easy control more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Coin-cell swaps.",
                "No Garmin-native running dynamics."
          ],
          "bestForProfiles": [
                "Runners whose week matches accurate heart-rate training for running intervals, tempo and easy control",
                "Athletes who want: Cross-ecosystem ECG accuracy benchmark for serious HR training"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when wrist optical on your watch already matches easy-day HR well enough",
                "Anyone unwilling to accept: Coin-cell swaps"
          ],
          "notIdealFor": [
                "Sessions outside accurate heart-rate training for running intervals, tempo and easy control",
                "No Garmin-native running dynamics"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Polar H10 owns here",
                      "productId": "prod-hrm-600",
                      "label": "HRM 600"
                },
                {
                      "when": "the TRACKR Heart Rate role matches your week better than this pick",
                      "productId": "prod-wahoo-trackr",
                      "label": "TRACKR Heart Rate"
                }
          ],
          "useCaseStrengths": [
                "Broad device compatibility",
                "Trusted chest-strap accuracy reputation"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-hrm-600": {
          "whyItFits": [
                "Garmin HRM 600 fits accurate heart-rate training for running intervals, tempo and easy control when choose when you will actually use running dynamics, economy metrics, or standalone recording — not just chest HR.",
                "In this guide context it earns the pick for required for fr970 running economy / step speed loss metrics and rechargeable vs coin-cell straps — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if wrist optical on your watch already matches easy-day HR well enough."
          ],
          "whyItWon": "Garmin HRM 600 takes this award because it covers accurate heart-rate training for running intervals, tempo and easy control more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Chest-strap comfort varies.",
                "Premium accessory cost."
          ],
          "bestForProfiles": [
                "Runners whose week matches accurate heart-rate training for running intervals, tempo and easy control",
                "Athletes who want: Garmin dynamics flagship for Forerunner / Fenix athletes"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when wrist optical on your watch already matches easy-day HR well enough",
                "Anyone unwilling to accept: Chest-strap comfort varies"
          ],
          "notIdealFor": [
                "Sessions outside accurate heart-rate training for running intervals, tempo and easy control",
                "Premium accessory cost"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than HRM 600 owns here",
                      "productId": "prod-hrm-pro-plus",
                      "label": "HRM-Pro Plus"
                },
                {
                      "when": "the H10 role matches your week better than this pick",
                      "productId": "prod-polar-h10",
                      "label": "H10"
                }
          ],
          "useCaseStrengths": [
                "Required for FR970 running economy / step speed loss metrics",
                "Rechargeable vs coin-cell straps"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-coros-hrm": {
          "whyItFits": [
                "COROS Heart Rate Monitor fits accurate heart-rate training for running intervals, tempo and easy control when i'd rotate to an armband for HYROX/gym weeks or humid long runs — accept more optical lag than H10 on all-out intervals.",
                "In this guide context it earns the pick for comfortable arm placement and native coros pairing — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if wrist optical on your watch already matches easy-day HR well enough."
          ],
          "whyItWon": "COROS Heart Rate Monitor takes this award because it covers accurate heart-rate training for running intervals, tempo and easy control more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Optical accuracy trade-offs vs chest straps in hard intervals."
          ],
          "bestForProfiles": [
                "Runners whose week matches accurate heart-rate training for running intervals, tempo and easy control",
                "Athletes who want: Comfort-first optical armband when chest straps chafe"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when wrist optical on your watch already matches easy-day HR well enough",
                "Anyone unwilling to accept: Optical accuracy trade-offs vs chest straps in hard intervals"
          ],
          "notIdealFor": [
                "Sessions outside accurate heart-rate training for running intervals, tempo and easy control",
                "Opposite ride/character needs"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Rate Monitor owns here",
                      "productId": "prod-polar-verity-sense",
                      "label": "Verity Sense"
                },
                {
                      "when": "the TICKR FIT role matches your week better than this pick",
                      "productId": "prod-wahoo-tickr-fit",
                      "label": "TICKR FIT"
                }
          ],
          "useCaseStrengths": [
                "Comfortable arm placement",
                "Native COROS pairing"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-wahoo-trackr": {
          "whyItFits": [
                "Wahoo TRACKR Heart Rate fits accurate heart-rate training for running intervals, tempo and easy control when strong when you want ECG without Polar/Garmin lock-in and prefer charging over coin cells — skip if you need onboard workout memory.",
                "In this guide context it earns the pick for rechargeable modern chest strap replacing coin-cell tickr and strong for zwift / trainer / multi-device bluetooth pairing — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if wrist optical on your watch already matches easy-day HR well enough."
          ],
          "whyItWon": "Wahoo TRACKR Heart Rate takes this award because it covers accurate heart-rate training for running intervals, tempo and easy control more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "No onboard memory like older TICKR X.",
                "Not a swim HR transmitter underwater."
          ],
          "bestForProfiles": [
                "Runners whose week matches accurate heart-rate training for running intervals, tempo and easy control",
                "Athletes who want: Modern rechargeable chest strap for apps and indoor training"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when wrist optical on your watch already matches easy-day HR well enough",
                "Anyone unwilling to accept: No onboard memory like older TICKR X"
          ],
          "notIdealFor": [
                "Sessions outside accurate heart-rate training for running intervals, tempo and easy control",
                "Not a swim HR transmitter underwater"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Heart Rate owns here",
                      "productId": "prod-polar-h9",
                      "label": "H9"
                },
                {
                      "when": "the HRM 200 role matches your week better than this pick",
                      "productId": "prod-garmin-hrm-200",
                      "label": "HRM 200"
                }
          ],
          "useCaseStrengths": [
                "Rechargeable modern chest strap replacing coin-cell TICKR",
                "Strong for Zwift / trainer / multi-device Bluetooth pairing",
                "Light everyday strap for HYROX and interval blocks"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    "prod-polar-h9": {
          "whyItFits": [
                "Polar H9 fits accurate heart-rate training for running intervals, tempo and easy control when first serious HR strap for structured training without paying for H10 extras you will not use.",
                "In this guide context it earns the pick for polar ecg accuracy story at a lower price than h10 and works across watches, bikes and gym apps via ble/ant+ — the reasons that beat close peers for this specific job.",
                "I'd shortlist it when that job shows up most weeks. I'd pause if wrist optical on your watch already matches easy-day HR well enough."
          ],
          "whyItWon": "Polar H9 takes this award because it covers accurate heart-rate training for running intervals, tempo and easy control more completely than close peers for the runners described below — not because of a global score or commission.",
          "tradeoffs": [
                "Fewer simultaneous Bluetooth connections than H10.",
                "No onboard session memory like H10."
          ],
          "bestForProfiles": [
                "Runners whose week matches accurate heart-rate training for running intervals, tempo and easy control",
                "Athletes who want: Budget Polar ECG when you do not need H10 dual Bluetooth"
          ],
          "whoShouldAvoid": [
                "Runners who should skip when wrist optical on your watch already matches easy-day HR well enough",
                "Anyone unwilling to accept: Fewer simultaneous Bluetooth connections than H10"
          ],
          "notIdealFor": [
                "Sessions outside accurate heart-rate training for running intervals, tempo and easy control",
                "No onboard session memory like H10"
          ],
          "chooseInsteadWhen": [
                {
                      "when": "you need a closer fit for a different role than Polar H9 owns here",
                      "productId": "prod-garmin-hrm-200",
                      "label": "HRM 200"
                },
                {
                      "when": "the H10 role matches your week better than this pick",
                      "productId": "prod-polar-h10",
                      "label": "H10"
                }
          ],
          "useCaseStrengths": [
                "Polar ECG accuracy story at a lower price than H10",
                "Works across watches, bikes and gym apps via BLE/ANT+",
                "Simple strap when you do not need H10 dual Bluetooth memory"
          ],
          "evidenceIds": [
                "ev-catalog-editorial"
          ]
    },
    },
  },
};

function mergeRec(
  base: BestGuideRecommendation,
  patch?: RecPatch,
): BestGuideRecommendation {
  if (!patch) return base;
  return {
    ...base,
    whyItFits: patch.whyItFits ?? base.whyItFits,
    whyItWon: patch.whyItWon ?? base.whyItWon,
    tradeoffs: patch.tradeoffs ?? base.tradeoffs,
    compromises: base.compromises ?? patch.tradeoffs,
    bestForProfiles: patch.bestForProfiles ?? base.bestForProfiles,
    whoShouldAvoid: patch.whoShouldAvoid ?? base.whoShouldAvoid,
    notIdealFor: patch.notIdealFor ?? base.notIdealFor,
    chooseInsteadWhen: patch.chooseInsteadWhen ?? base.chooseInsteadWhen,
    useCaseStrengths: patch.useCaseStrengths ?? base.useCaseStrengths,
    strengths: base.strengths ?? patch.useCaseStrengths,
    evidenceIds: patch.evidenceIds ?? base.evidenceIds ?? [...EVIDENCE],
    considerInsteadProductIds:
      base.considerInsteadProductIds ??
      patch.chooseInsteadWhen?.map((c) => c.productId).filter(Boolean) as string[] | undefined,
  };
}

export function applyBestGuideP0LaunchReadyEnrichment(
  guides: BestGuide[],
): BestGuide[] {
  return guides.map((guide) => {
    const patch = P0_PATCHES[guide.slug];
    if (!patch) return guide;
    return {
      ...guide,
      intro: patch.intro,
      whatMattersIntro: patch.whatMattersIntro,
      methodologySummary: patch.methodologySummary,
      selectionMethodology: patch.selectionMethodology,
      evidenceIds: [...new Set([...(patch.evidenceIds ?? []), ...(guide.evidenceIds ?? [])])],
      decisionShortcuts: patch.decisionShortcuts ?? guide.decisionShortcuts,
      quickTake: patch.quickTake ?? guide.quickTake,
      consideredProductIds: patch.consideredProductIds ?? guide.consideredProductIds,
      shortlistedProductIds: patch.shortlistedProductIds ?? guide.shortlistedProductIds,
      recommendations: guide.recommendations.map((rec) =>
        mergeRec(rec, patch.recommendations[rec.productId]),
      ),
    };
  });
}
