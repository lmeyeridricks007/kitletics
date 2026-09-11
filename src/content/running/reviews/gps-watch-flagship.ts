import type { Review, ContentSection, ScoreBreakdownItem } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;
const author = "author-kitletics-editorial" as const;

const testingContext =
  "Kitletics Expert Research Review. How we assessed it: published specifications, manufacturer materials, and catalog peer comparisons for this watch's stated role. This page does not claim personal test sessions unless a first-hand section is explicitly present. Scores are decision aids — affiliate links do not change the verdict.";

const disclosure =
  "No brand-supplied product or sponsored testing applied to this review unless stated. Affiliate availability does not affect scores or verdict.";

function sec(
  id: string,
  heading: string,
  body: string,
): ContentSection {
  return { id, heading, body, evidenceIds: [...ev] };
}

function scores(items: ScoreBreakdownItem[]): ScoreBreakdownItem[] {
  return items.map((s) => ({ max: 100, ...s }));
}

/**
 * Flagship GPS watch reviews deepened to the Vomero-18 editorial bar.
 * Overrides thin wave2 stubs by slug (first match wins in reviews.ts).
 */
export const garminFenix8Review: Review = {
  id: "review-fenix-8",
  slug: "garmin-fenix-8",
  productId: "prod-fenix-8",
  title: "Garmin Fenix 8 Review",
  subtitle:
    "AMOLED adventure flagship when TopoActive maps, outdoor sensors and Garmin Connect depth matter more than runner-first weight.",
  reviewType: "expert-research",
  bottomLine:
    "I'd buy the Fenix 8 AMOLED 47mm when trail and multisport weeks need offline maps plus lifestyle extras in one rugged chassis — not when a lighter Forerunner 970 or longer-battery Enduro 3 fits the actual week better.",
  verdict:
    "Premium adventure GPS for athletes who will use maps, outdoor tools and Garmin’s deepest feature stack. Overbuilt for road-only runners who mainly need pace and training load.",
  score: 90,
  summary:
    "Fenix 8 AMOLED packs TopoActive maps, multi-band GPS, music, payments and ECG in a ~73 g adventure case. I'd shortlist it for trail/multisport athletes already in Garmin Connect. I'd pause if weight, price or Enduro-class continuous GPS hours matter more than AMOLED chrome.",
  reviewerId: author,
  testingContext,
  editorialDisclosure: disclosure,
  sections: [
    sec(
      "sec-overview",
      "What it is",
      "The Garmin Fenix 8 AMOLED 47mm is the adventure-flagship lane in this catalog — bright maps, dive-ready build, speaker/mic, ECG and the full Connect training stack in one watch.\n\nIt is not a runner-first Forerunner and it is not a battery-max Enduro. Think of it as the chassis you buy when trail routing, outdoor sensors and daily smartwatch extras share the same week — and you are already (or willing to be) deep in Garmin Connect.\n\nIf most of your miles are road pace and workouts, start with the Forerunner 970 instead. If multi-day continuous GNSS is the purchase reason, Enduro 3 or a COROS Apex/Vertix MIP watch usually fits better. If you want maps without Fenix spend and can live without music/Pay, COROS Apex 4 is the value counter.",
    ),
    sec(
      "sec-verified-specs",
      "Key specs",
      "Published anchors used in this assessment (47 mm AMOLED SKU):\n• Weight: ~73 g\n• Display: 1.4\" AMOLED, touch + buttons\n• Case: 47 mm; water rating 10 ATM\n• GNSS: multi-band; offline TopoActive maps + navigation\n• Battery (manufacturer): ~16 days smartwatch / ~37 h GPS / ~35 h multi-band — settings dependent\n• Extras: music, Garmin Pay, ECG, SpO₂, barometric altimeter, training readiness, recovery metrics, running dynamics (with compatible HRM)\n\nTreat battery hours as manufacturer claims, not Kitletics lab results. Always-on display, music storage and full multi-band modes shorten real-world endurance — size the watch by your worst-case adventure mix, not the marketing headline.",
    ),
    sec(
      "sec-tech",
      "Tracking & features",
      "Multi-band GNSS plus full offline TopoActive maps is the outdoor core. Breadcrumb nav, course follow and map browsing are why people pay Fenix money instead of buying a lighter Forerunner.\n\nOn the lifestyle side you get music storage, Garmin Pay, ECG and a speaker/mic stack you will not find on Enduro-class MIP ultras. Training readiness, recovery and (with a chest/arm strap) running dynamics sit inside the usual Garmin depth — denser than COROS or Suunto for athletes who live in Connect.\n\nWrist optical HR is fine for easy miles; I'd still rotate a Polar H10 or Garmin HRM 600 for hard intervals if accuracy is the job. Maps and sensors do not replace a clean HR signal on VO2 days.",
    ),
    sec(
      "sec-performance",
      "Everyday performance",
      "On trail and mixed adventure weeks, Fenix 8’s job is readable maps outdoors plus enough battery for long days — not multi-day no-charge ultras.\n\nAMOLED helps in dim forests and at night checkpoints; it also costs hours versus MIP Enduro/Apex watches when you leave brightness and always-on aggressive. For road marathon blocks the watch is competent but heavier than Forerunner 970 — you are carrying adventure chrome you may never open on flat pavement.\n\nI'd rotate Fenix as the trail/multisport tool and keep a lighter daily if weight bothers you on track sessions. One-watch households that trail + commute + swim will feel the value; one-watch road-only households often will not.",
    ),
    sec(
      "sec-strengths",
      "Where it is strongest",
      "• Offline TopoActive maps on a bright AMOLED without stepping down to a phone\n• Full Garmin outdoor + training ecosystem in one rugged chassis\n• Music, Pay and ECG when lifestyle extras are weekly tools, not brochure filler\n• Clear peer ladder: Forerunner for run focus, Enduro for battery, Apex 4 for maps value",
    ),
    sec(
      "sec-tradeoffs",
      "Trade-offs & limits",
      "• Flagship price (~€999 street seed) — easy to overbuy if maps go unused\n• Heavier and thicker than runner-first Forerunners\n• GPS battery with maps/music on trails Enduro-class MIP claims\n• Menu density: if you will ignore 70% of widgets, you paid for chrome\n• Women’s/men’s sizing is strap/case choice — confirm 47 mm on your wrist before committing",
    ),
    sec(
      "sec-usecase",
      "Who it is for",
      "I'd shortlist Fenix 8 for intermediate-to-advanced athletes who already train in Garmin Connect and need trail maps plus outdoor multisport tools in the same week.\n\nI'd pause for road-only high-mileage athletes (Forerunner 970 / 570), ultra specialists chasing continuous GNSS hours (Enduro 3 / Vertix / Apex), and anyone who wants maps without Garmin price or ecosystem lock-in (Apex 4 / Suunto Vertical 2).\n\nApple-locked runners who need apps and cellular more than topo adventure tools should look at Apple Watch Ultra 3 instead — different job class.",
    ),
    sec(
      "sec-value",
      "Value",
      "Fenix 8 is worth the spend when TopoActive maps, outdoor sensors and Garmin lifestyle extras are weekly tools. If you mainly need pace, workouts and training load, Forerunner 970 is usually better value. If battery is the purchase reason, Enduro 3 or Apex 4 undercuts the AMOLED tax.\n\nShop street price carefully — clearance Epix Pro Gen 2 can blur the value story when AMOLED maps are the only must-have. Never invent a “deal” in prose; check current offers on the product page.",
    ),
  ],
  pros: [
    "Bright AMOLED with full offline TopoActive maps",
    "ECG, music, Garmin Pay and dive-ready adventure build",
    "Deep Garmin training and multisport ecosystem",
  ],
  cons: [
    "Premium price versus dedicated ultra MIP watches",
    "Heavier than running-focused Forerunners",
    "GPS battery trails Enduro-class claims with maps/music on",
  ],
  whoShouldBuy: [
    "You want TopoActive maps on AMOLED plus outdoor tools and already train in Garmin Connect — Fenix is the adventure flagship, not a road-only Forerunner",
    "Trail and multisport weeks need music, payments and adventure sensors in one chassis, and you will actually open the map tools",
    "You're comparing Fenix 8 vs Forerunner 970 and prefer rugged outdoor chrome over runner-first weight",
  ],
  whoShouldAvoid: [
    "You mainly need road pace and training load — Forerunner 970 or 570 is more focused value than carrying unused Fenix maps",
    "Multi-day ultra GPS hours are the purchase reason — Enduro 3, Vertix 2S or Apex 4 fit that job better",
    "You're not ready for Garmin’s densest menu tree — feature chrome will go unused at flagship price",
  ],
  scoreBreakdown: scores([
    { key: "gps-accuracy", label: "GPS Accuracy", score: 94 },
    { key: "maps", label: "Maps & Navigation", score: 96 },
    { key: "battery", label: "Battery", score: 82, note: "Settings-dependent AMOLED" },
    { key: "training-features", label: "Training Features", score: 95 },
    { key: "recovery-features", label: "Recovery Features", score: 92 },
    { key: "interface", label: "Interface", score: 88 },
    { key: "smartwatch-features", label: "Smartwatch Features", score: 94 },
    { key: "value", label: "Value for Money", score: 68 },
  ]),
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-forerunner-970",
    "prod-enduro-3",
    "prod-coros-apex-4",
  ],
  comparisonIds: ["cmp-fenix8-fr970", "cmp-apex4-fenix8"],
  faqIds: [],
  seoTitle: "Garmin Fenix 8 Review: Maps, Battery & Who Should Buy",
  seoDescription:
    "Should you buy Garmin Fenix 8 AMOLED? Expert research on TopoActive maps vs Forerunner 970 and Enduro 3, battery trade-offs, and who should skip it.",
  ...pub,
};

export const corosApex4Review: Review = {
  id: "review-coros-apex-4",
  slug: "coros-apex-4",
  productId: "prod-coros-apex-4",
  title: "COROS Apex 4 Review",
  subtitle:
    "Titanium MIP mountain watch when offline maps and dual-frequency battery matter more than music, Pay or Garmin Connect depth.",
  reviewType: "expert-research",
  bottomLine:
    "I'd buy the Apex 4 when trail and ultra weeks need offline maps without Fenix pricing — not when music, payments or Garmin’s deepest coaching are non-negotiable.",
  verdict:
    "Sweet-spot COROS trail watch — maps, sapphire MIP and endurance battery for mountain athletes who accept a leaner ecosystem.",
  score: 90,
  summary:
    "Apex 4 puts offline topo/street maps and strong dual-frequency claims in a ~52 g titanium MIP build. I'd shortlist it versus Fenix for trail value. I'd pause if music/Pay or Garmin sensors are must-haves.",
  reviewerId: author,
  testingContext,
  editorialDisclosure: disclosure,
  sections: [
    sec(
      "sec-overview",
      "What it is",
      "The COROS Apex 4 is the maps-value mountain watch in this catalog — titanium MIP, offline topo/street maps and long dual-frequency claims without Fenix flagship spend.\n\nIt is not a lifestyle smartwatch and it is not the lightest road trainer. No music, no contactless payments, no Garmin Connect accessories. You buy it when navigation and battery are the job, and you are happy living in the COROS app.\n\nIf you need AMOLED daily brightness and smartwatch chrome, look at Fenix 8 or Suunto Vertical 2. If you only need dual-frequency road training without maps, Pace 4 undercuts hard. If expeditions need extreme battery above Apex, Vertix 2S is the step up.",
    ),
    sec(
      "sec-verified-specs",
      "Key specs",
      "Published anchors used in this assessment:\n• Weight: ~52 g\n• Display: 1.3\" MIP sapphire, buttons (no touchscreen)\n• Case: 46 mm titanium; water rating 5 ATM\n• GNSS: dual-frequency; offline maps + navigation\n• Battery (manufacturer): ~24 days smartwatch / ~53 h GPS / ~41 h multi-band — settings dependent\n• Extras: SpO₂, barometric altimeter, recovery metrics, Strava sync\n• Missing vs Fenix: music, payments, ECG, Garmin running-dynamics ecosystem\n\nTreat battery figures as manufacturer claims. MIP helps endurance versus AMOLED peers; cold, full dual-frequency and bright backlight still move real-world hours.",
    ),
    sec(
      "sec-tech",
      "Tracking & features",
      "Dual-frequency GNSS with full offline maps is why Apex 4 sits next to Fenix/Enduro in trail guides. Download topo before remote races — maps are only useful if they are on the watch when the phone has no bars.\n\nButton-first MIP is a deliberate trail choice: glove-friendly, sunlight-readable, less “phone on wrist” than AMOLED flagships. Training and recovery live in COROS Training Hub — excellent for athletes who want structure without Garmin’s densest widget tree, thinner if you depend on Garmin HRM dynamics or third-party Connect IQ toys.\n\nI'd still pair a chest or arm optical strap for hard intervals; wrist optical remains a convenience layer, not the accuracy ceiling.",
    ),
    sec(
      "sec-performance",
      "Everyday performance",
      "On mountain and ultra weeks, Apex 4’s job is stay charged, stay mapped, stay light enough to ignore. ~52 g and 46 mm put it between Vertix expedition bulk and Pace road lightness.\n\nMIP is less vivid indoors than Fenix AMOLED — a fair trade when the purchase reason is tree-cover days and multi-hour GNSS. For mixed road/trail athletes who also want music and Pay at the café, Fenix still wins lifestyle weeks; Apex wins when those extras would sit unused.\n\nI'd rotate Apex as the trail/ultra tool and keep Pace 4 or a phone-centric watch only if you truly need a second lifestyle device.",
    ),
    sec(
      "sec-strengths",
      "Where it is strongest",
      "• Offline maps on durable sapphire MIP without Fenix spend\n• Strong dual-frequency battery narrative for the maps class\n• Lighter than Vertix for most trail and ultra days\n• Clean COROS training UX when you do not need Garmin accessories",
    ),
    sec(
      "sec-tradeoffs",
      "Trade-offs & limits",
      "• No music storage or contactless payments\n• Smaller third-party ecosystem than Garmin\n• MIP less vivid indoors / at night aid stations than AMOLED\n• Training depth thinner if you want Garmin readiness + HRM dynamics\n• 5 ATM vs Fenix 10 ATM — confirm swim/dive needs before buying",
    ),
    sec(
      "sec-usecase",
      "Who it is for",
      "I'd shortlist Apex 4 for trail and ultra athletes who need offline maps and long dual-frequency hours without paying Fenix flagship money.\n\nI'd pause for Garmin-locked households (sensors, coaching, Connect IQ), runners who need onboard music or Pay, and road-only athletes who can skip maps entirely (Pace 4 / Forerunner midrange).\n\nVersus Suunto Vertical 2: pick Apex when COROS battery/simplicity wins; pick Vertical when Suunto’s AMOLED maps brief and ecosystem fit you better.",
    ),
    sec(
      "sec-value",
      "Value",
      "Around the ~€430 seed class, Apex 4 is one of the clearest maps-per-euro picks against Fenix 8. You are trading lifestyle extras and ecosystem breadth for navigation and battery.\n\nIf maps are optional, Pace 4 is better value. If you will use music, Pay and Garmin sensors weekly, Fenix or Forerunner music models justify the jump. Check current From-prices on the product page — do not assume list.",
    ),
  ],
  pros: [
    "Offline maps on durable sapphire MIP",
    "Strong dual-frequency battery claims",
    "Lighter than Vertix for most trail days",
  ],
  cons: [
    "No music or contactless payments",
    "Smaller third-party ecosystem than Garmin",
    "MIP less vivid indoors than AMOLED",
  ],
  whoShouldBuy: [
    "You want offline maps and long dual-frequency battery without Fenix spend — Apex 4 is the trail value maps watch",
    "Trail and ultra weeks matter more than smartwatch chrome, and you are happy in the COROS app",
    "You're comparing Apex 4 vs Fenix 8 and prefer COROS simplicity over Garmin lifestyle extras",
  ],
  whoShouldAvoid: [
    "Music and payments are required weekly — Fenix or Forerunner music models fit better",
    "You live in Garmin Connect accessories and coaching — switching will frustrate you",
    "You want AMOLED daily brightness as the main job — Vertical 2, Fenix or Pace Pro",
  ],
  scoreBreakdown: scores([
    { key: "gps-accuracy", label: "GPS Accuracy", score: 94 },
    { key: "maps", label: "Maps & Navigation", score: 94 },
    { key: "battery", label: "Battery", score: 93, note: "MIP maps class" },
    { key: "training-features", label: "Training Features", score: 84 },
    { key: "recovery-features", label: "Recovery Features", score: 82 },
    { key: "interface", label: "Interface", score: 86, note: "Button-first MIP" },
    { key: "smartwatch-features", label: "Smartwatch Features", score: 62, note: "No music/Pay" },
    { key: "value", label: "Value for Money", score: 88 },
  ]),
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-fenix-8",
    "prod-suunto-vertical-2",
    "prod-enduro-3",
  ],
  comparisonIds: ["cmp-apex4-fenix8"],
  faqIds: [],
  seoTitle: "COROS Apex 4 Review: Maps, Battery & Trail Value",
  seoDescription:
    "Should you buy COROS Apex 4? Expert research on offline maps vs Garmin Fenix 8, dual-frequency battery, and who should skip it.",
  ...pub,
};

export const appleWatchUltra3Review: Review = {
  id: "review-apple-watch-ultra-3",
  slug: "apple-watch-ultra-3",
  productId: "prod-apple-watch-ultra-3",
  title: "Apple Watch Ultra 3 Review",
  subtitle:
    "Best rugged Apple Watch for runners when iPhone apps and dual-frequency GPS matter together — not when multi-day dedicated GPS battery is the priority.",
  reviewType: "expert-research",
  bottomLine:
    "I'd buy Ultra 3 when Apple apps, cellular and Pay matter as much as GPS runs — not when Enduro-class continuous GNSS hours are the purchase reason.",
  verdict:
    "Top Apple running hybrid. Excellent smartwatch, shorter continuous GPS endurance than Garmin/COROS ultras.",
  score: 87,
  summary:
    "Rugged titanium Ultra with dual-frequency GPS, siren and best-in-class iPhone integration. I'd shortlist it for Apple-locked runners. I'd pause hard for ultras needing Enduro/Apex continuous GPS hours.",
  reviewerId: author,
  testingContext,
  editorialDisclosure: disclosure,
  sections: [
    sec(
      "sec-overview",
      "What it is",
      "The Apple Watch Ultra 3 is the rugged Apple lane for runners — dual-frequency GPS, action button, siren and the best iPhone app ecosystem in this catalog.\n\nIt is not a Garmin/COROS ultra endurance tool. Multiday Low Power claims beat Series watches, but continuous GNSS still trails Enduro, Vertix and Apex maps watches. You buy Ultra 3 when the phone ecosystem is non-negotiable and you want the most capable Apple Watch for racing and trail days.\n\nIf you are Android/Samsung-first, Galaxy Watch Ultra is the peer. If training load coaching and week-long GPS matter more than apps, Forerunner 970 or Fenix 8 usually train better per euro. If you only need casual Apple runs, Series 10 is enough.",
    ),
    sec(
      "sec-verified-specs",
      "Key specs",
      "Published anchors used in this assessment:\n• Weight: ~61.6 g\n• Display: rugged AMOLED; 49 mm titanium case\n• Water: 100 m class / ocean-ready brief\n• GNSS: dual-frequency; Apple Maps / workout navigation\n• Battery (manufacturer): ~2 days normal smartwatch class; GPS hours ~14 h class; Low Power multiday claims beat Series — still not Enduro-class continuous GNSS\n• Extras: music, Apple Pay, ECG, SpO₂, barometric altimeter, cellular options, siren\n\nTreat battery as lifestyle-plus-sport, not expedition. Charge planning remains real for long events — that is the honest Ultra trade-off versus dedicated MIP ultras.",
    ),
    sec(
      "sec-tech",
      "Tracking & features",
      "Dual-frequency GNSS plus Apple’s workout stack covers road races, trail days and triathlon transitions well for athletes who live on iPhone. Offline map depth is not Fenix/Apex TopoActive — remote alpine routing still belongs on a dedicated adventure watch or phone offline maps.\n\nSmartwatch features are the Ultra’s unfair advantage: notifications, Apple Pay, Fitness+ / third-party apps, cellular options and the action button for quick workout control. Training load coaching is less specialized than Garmin Connect or COROS Training Hub over a full marathon block — excellent daily athlete UX, thinner “coach in a watch” depth.\n\nWrist HR is convenient; hard interval days still benefit from a chest strap if you care about zones.",
    ),
    sec(
      "sec-performance",
      "Everyday performance",
      "For marathon training inside Apple’s world, Ultra 3 feels like a serious sport watch — brighter and tougher than Series, with better GPS endurance claims for race day.\n\nFor 50K–100K efforts with continuous GNSS and minimal charging, dedicated ultras still win. I'd plan Ultra 3 as the race/day tool you charge the night before, not the watch you forget in a vest for three days.\n\n49 mm is substantial on small wrists — try Alpine Loop / Trail Loop fit before committing. If bulk is the issue and Apple is still required, Series 10 is the comfort retreat.",
    ),
    sec(
      "sec-strengths",
      "Where it is strongest",
      "• Best iPhone app ecosystem, Apple Pay and cellular options\n• Rugged dual-frequency GPS build with siren and action button\n• Clear upgrade from Series watches for racing and trail days\n• Strong everyday athlete UX when apps matter as much as pace",
    ),
    sec(
      "sec-tradeoffs",
      "Trade-offs & limits",
      "• Shorter continuous GPS than Garmin/COROS ultras\n• Less specialized long-term endurance coaching platforms\n• Premium smartwatch pricing (~€899 seed)\n• 49 mm bulk on small wrists\n• Not a TopoActive adventure specialist for remote alpine weeks",
    ),
    sec(
      "sec-usecase",
      "Who it is for",
      "I'd shortlist Ultra 3 for iPhone athletes who want one rugged watch for life, racing and trail days — apps and Pay included.\n\nI'd pause for multi-day continuous GPS without charging (Enduro / Vertix / Apex), athletes who want Garmin/COROS coaching depth, and budget shoppers who can live with Series 10 or a dedicated midrange run watch.\n\nVersus Ultra 2: buy 3 when you want the current generation dual-frequency / endurance / feature package; keep 2 only if street price and condition make the jump pointless.",
    ),
    sec(
      "sec-value",
      "Value",
      "Ultra 3 is worth flagship Apple money when the ecosystem is the job. If you would ignore half the apps and only chase GPS hours, Forerunner 970, Fenix 8 or Apex 4 usually train better per euro.\n\nVersus Series 10: pay the Ultra premium for rugged GPS endurance and sport controls — not for notifications alone. Check current From-prices; Apple street pricing moves.",
    ),
  ],
  pros: [
    "Best iPhone app ecosystem and Apple Pay",
    "Rugged dual-frequency GPS build",
    "Stronger endurance claims than Series watches",
  ],
  cons: [
    "Shorter continuous GPS than Garmin/COROS ultras",
    "Less specialized endurance coaching platforms",
    "Premium smartwatch pricing",
  ],
  whoShouldBuy: [
    "iPhone apps, cellular and Apple Pay are as important as GPS runs — Ultra 3 is the rugged Apple race/trail tool",
    "You want the most capable Apple Watch for racing and trail days, upgrading from Series watches",
    "You're comparing Ultra 3 vs Ultra 2 and want the current dual-frequency / endurance package",
  ],
  whoShouldAvoid: [
    "Multi-day continuous GPS without charging is the purchase reason — Enduro 3, Vertix 2S or Apex 4 fit better",
    "You want Garmin or COROS training ecosystems as the primary coach — switch brands",
    "Budget is tight and apps matter more than rugged GPS — Series 10 or a dedicated midrange run watch",
  ],
  scoreBreakdown: scores([
    { key: "gps-accuracy", label: "GPS Accuracy", score: 88 },
    { key: "maps", label: "Maps & Navigation", score: 78, note: "Not TopoActive class" },
    { key: "battery", label: "Battery", score: 72, note: "Vs dedicated ultras" },
    { key: "training-features", label: "Training Features", score: 80 },
    { key: "recovery-features", label: "Recovery Features", score: 82 },
    { key: "interface", label: "Interface", score: 96 },
    { key: "smartwatch-features", label: "Smartwatch Features", score: 98 },
    { key: "value", label: "Value for Money", score: 68 },
  ]),
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-apple-watch-ultra-2",
    "prod-forerunner-970",
    "prod-fenix-8",
  ],
  comparisonIds: ["cmp-ultra3-ultra2"],
  faqIds: [],
  seoTitle: "Apple Watch Ultra 3 Review: GPS, Battery & Who Should Buy",
  seoDescription:
    "Should you buy Apple Watch Ultra 3? Expert research on dual-frequency GPS vs Garmin/COROS ultras, battery limits, and who should skip it.",
  ...pub,
};

export const gpsWatchFlagshipReviews: Review[] = [
  garminFenix8Review,
  corosApex4Review,
  appleWatchUltra3Review,
];
