/**
 * Expert-research review stubs for GPS watch wave2 catalog products.
 * Disclosure: research from published specs / similar products — not first-hand testing.
 */
import type { Review, ScoreBreakdownItem, ContentSection } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const author = "author-kitletics-editorial" as const;
const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;

type WatchDraft = {
  id: string;
  slug: string;
  productId: string;
  title: string;
  subtitle: string;
  bottomLine: string;
  verdict: string;
  summary: string;
  score: number;
  gps: string;
  battery: string;
  training: string;
  fit: string;
  value: string;
  pros: string[];
  cons: string[];
  buy: string[];
  avoid: string[];
  alts: string[];
  scores: ScoreBreakdownItem[];
  evidenceIds?: string[];
  comparisonIds?: string[];
  extraSections?: ContentSection[];
};

function watchResearchReview(d: WatchDraft): Review {
  const evidenceIds = d.evidenceIds ?? [...ev];
  const sections: ContentSection[] = [
    {
      id: "sec-fit",
      heading: "Fit & Comfort",
      body: d.fit,
      evidenceIds,
    },
    {
      id: "sec-gps",
      heading: "GPS & Navigation",
      body: d.gps,
      evidenceIds,
    },
    {
      id: "sec-battery",
      heading: "Battery",
      body: d.battery,
      evidenceIds,
    },
    {
      id: "sec-training",
      heading: "Training & Recovery",
      body: d.training,
      evidenceIds,
    },
    {
      id: "sec-value",
      heading: "Value",
      body: d.value,
      evidenceIds: ["ev-catalog-editorial"],
    },
  ];
  if (d.extraSections?.length) sections.push(...d.extraSections);

  return {
    id: d.id,
    slug: d.slug,
    productId: d.productId,
    title: d.title,
    subtitle: d.subtitle,
    reviewType: "expert-research",
    bottomLine: d.bottomLine,
    verdict: d.verdict,
    score: d.score,
    summary: d.summary,
    reviewerId: author,
    testingContext:
      "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.",
    editorialDisclosure:
      "No brand-supplied product or sponsored testing applied to this review. Affiliate availability does not affect scores or verdict.",
    sections,
    pros: d.pros,
    cons: d.cons,
    whoShouldBuy: d.buy,
    whoShouldAvoid: d.avoid,
    scoreBreakdown: d.scores,
    evidenceIds,
    alternativeProductIds: d.alts,
    comparisonIds: d.comparisonIds ?? [],
    faqIds: [],
    seoTitle: `${d.title}: GPS, Battery & Verdict | Kitletics`,
    seoDescription: `Honest buying guide to ${d.title.replace(/ Review$/, "")} — GPS, battery, who it’s for, trade-offs and current prices.`,
    ...pub,
  };
}

export const reviewsWatchesWave2: Review[] = [
  watchResearchReview({
    id: "review-fenix-8",
    slug: "garmin-fenix-8",
    productId: "prod-fenix-8",
    title: "Garmin Fenix 8 Review",
    subtitle: "AMOLED adventure flagship with maps, ECG and full Garmin outdoor tools.",
    bottomLine:
      "Buy Fenix 8 when you want TopoActive maps and outdoor multisport tools on a bright AMOLED; skip it when a lighter Forerunner 970 or longer-battery Enduro 3 fits the week better.",
    verdict:
      "Premium adventure GPS watch for athletes who will use maps, outdoor sensors and Garmin’s deepest feature stack. Overbuilt for road-only runners who mainly need pace and training load.",
    summary:
      "Fenix 8 AMOLED packs maps, multi-band GPS, music, payments and ECG in a rugged adventure chassis. I'd shortlist it for trail/multisport athletes already in Garmin Connect. I'd pause if weight, price or Enduro-class battery matter more than AMOLED lifestyle extras.",
    score: 90,
    fit: "47 mm AMOLED case is a proper adventure watch footprint — confirm wrist comfort if you are coming from a compact Forerunner. Quick-release bands and Garmin’s usual sensor stack apply; expect more bulk than runner-first models.",
    gps: "Multi-band GNSS with full TopoActive offline maps and navigation tools is the core outdoor brief. Treat track quality as strong for the class based on Garmin’s published multi-band positioning — tree cover and canyon days still vary with settings and sky view.",
    battery: "Published smartwatch and GPS figures are competitive for an AMOLED maps watch but trail Enduro/MIP ultras for multi-day continuous GNSS. Always-on display, music and multi-band modes shorten real-world hours — plan charging around long events.",
    training: "Full Garmin training readiness, recovery, running dynamics (with compatible HRM) and multisport profiles. Deeper than COROS/Suunto coaching for athletes who live in Connect; denser menus than a beginner Forerunner.",
    value: "Flagship pricing (~€999 street seed). Worth it when outdoor maps + lifestyle extras are weekly tools; otherwise Forerunner 970, Apex 4 or clearance Epix Pro often deliver more value for the same jobs.",
    pros: [
      "Bright AMOLED with full offline maps",
      "ECG, music, Garmin Pay and dive-ready adventure build",
      "Deep Garmin training and multisport ecosystem",
    ],
    cons: [
      "Premium price versus dedicated ultra MIP watches",
      "Heavier than running-focused Forerunners",
      "GPS battery trails Enduro-class claims with maps/music on",
    ],
    buy: [
      "You want TopoActive maps on AMOLED plus outdoor tools and already train in Garmin Connect",
      "Trail/multisport weeks need music, payments and adventure sensors in one watch",
      "You're comparing Fenix vs Forerunner 970 and prefer rugged outdoor chrome over runner-first weight",
    ],
    avoid: [
      "You mainly need road pace and training load — Forerunner 970 or 570 is more focused value",
      "Multi-day ultra GPS hours are the purchase reason — Enduro 3 or Vertix/Apex MIP options fit better",
      "You're not ready for Garmin’s densest menu tree — feature chrome will go unused",
    ],
    alts: ["prod-forerunner-970", "prod-enduro-3", "prod-coros-apex-4"],
    comparisonIds: ["cmp-fenix8-fr970", "cmp-apex4-fenix8"],
    scores: [
      { key: "features", label: "Features", score: 96 },
      { key: "gps", label: "GPS & Maps", score: 94 },
      { key: "battery", label: "Battery (claimed)", score: 82, note: "Settings-dependent" },
      { key: "value", label: "Value for Money", score: 68 },
      { key: "ecosystem", label: "Ecosystem", score: 95 },
    ],
  }),
  watchResearchReview({
    id: "review-enduro-3",
    slug: "garmin-enduro-3",
    productId: "prod-enduro-3",
    title: "Garmin Enduro 3 Review",
    subtitle: "Ultralight MIP solar ultra watch with maps and extreme GPS claims.",
    bottomLine:
      "Buy Enduro 3 for multi-day ultras and max GPS hours with maps; skip it when you want AMOLED lifestyle extras or a road-racing Forerunner feel.",
    verdict:
      "Purpose-built ultra endurance Garmin. Best when battery and light MIP maps matter more than Fenix AMOLED chrome.",
    summary:
      "Enduro 3 pairs TopoActive maps with class-leading GPS/solar claims in a ~63 g UltraFit chassis. I'd shortlist it for ultras and long mountain days. I'd pause if you need ECG, speaker/mic or a vivid indoor AMOLED.",
    score: 89,
    fit: "51 mm MIP case is large on paper but light for the class. Nylon UltraFit-style wear suits long efforts; small wrists may still prefer Apex 4 or a compact Forerunner.",
    gps: "Multi-band GNSS with offline TopoActive maps for remote routing. Designed for tree cover and long efforts — still validate your GNSS mode before race week.",
    battery: "Headline GPS and multi-band claims (including solar assist) lead the Garmin adventure pack. MIP helps; music and full multi-band still cost hours versus manufacturer best-case figures.",
    training: "Garmin training/recovery stack without Fenix lifestyle extras like ECG. Enough for serious endurance athletes; less smartwatch theatre than Fenix 8.",
    value: "Premium ultra pricing (~€899 seed) but strong if you will use the battery. Fenix 8 costs more for AMOLED; Vertix/Apex compete on COROS pricing.",
    pros: [
      "Extreme GPS battery with solar assist",
      "Light maps chassis for multi-day ultras",
      "TopoActive navigation without AMOLED drain",
    ],
    cons: [
      "MIP less vivid indoors than AMOLED flagships",
      "No ECG / speaker-mic versus Fenix 8",
      "Large case may overwhelm small wrists",
    ],
    buy: [
      "You race ultras or multi-day events and need maps plus maximum GPS hours",
      "You prefer light MIP over Fenix AMOLED and already use Garmin Connect",
      "You're comparing Enduro vs Vertix and want Garmin sensors/ecosystem",
    ],
    avoid: [
      "You want bright AMOLED daily wear and smartwatch extras — Fenix 8 or Ultra fits better",
      "Road marathon training is the only job — Forerunner 970 / Pace 4 are leaner picks",
      "You refuse large adventure cases — Apex 4 or Pace Pro sit smaller",
    ],
    alts: ["prod-fenix-8", "prod-coros-vertix-2s", "prod-coros-apex-4"],
    comparisonIds: ["cmp-vertical2-enduro3"],
    scores: [
      { key: "battery", label: "Battery (claimed)", score: 98, note: "Ultra-class claims" },
      { key: "gps", label: "GPS & Maps", score: 93 },
      { key: "features", label: "Features", score: 86 },
      { key: "value", label: "Value for Money", score: 78 },
      { key: "weight", label: "Weight & Comfort", score: 90 },
    ],
  }),
  watchResearchReview({
    id: "review-instinct-3",
    slug: "garmin-instinct-3",
    productId: "prod-instinct-3",
    title: "Garmin Instinct 3 Review",
    subtitle: "Rugged adventure essential with strong battery below Fenix pricing.",
    bottomLine:
      "Buy Instinct 3 for tough trail days without full maps pricing; skip it when offline topo maps are mandatory.",
    verdict:
      "Rugged value Garmin for outdoor runners who need durability and battery more than Fenix maps chrome.",
    summary:
      "Instinct 3 brings a reinforced adventure build, flashlight and strong stated battery without Fenix cost. I'd shortlist it for rugged training below maps flagships. I'd pause if offline TopoActive maps are a must.",
    score: 82,
    fit: "Fiber-reinforced case with a sport-watch footprint — typically easier daily wear than 51 mm ultras. Confirm Solar vs AMOLED variant sizing before buying.",
    gps: "Multi-band GNSS with navigation tools but no full offline maps like Enduro/Fenix. Fine for breadcrumb and adventure essentials; step up for remote topo.",
    battery: "Excellent stated smartwatch and GPS endurance especially with Solar. Real-world hours still depend on multi-band and sensor settings.",
    training: "Garmin training readiness and recovery without the deepest Forerunner/Fenix lifestyle stack. Music and payments are absent on the core rugged brief.",
    value: "Strong value (~€449 seed) versus Fenix for toughness and battery. Amazfit T-Rex competes on price; Apex 4 wins when maps matter.",
    pros: [
      "Tough build and adventure tools below Fenix pricing",
      "Strong battery narrative with Solar options",
      "Flashlight and ABC sensors for outdoor days",
    ],
    cons: [
      "No full offline maps",
      "Fewer smart features than lifestyle Garmins",
      "Training depth lighter than Forerunner flagships",
    ],
    buy: [
      "You want a tough Garmin for trail abuse without paying Fenix maps prices",
      "Battery and durability matter more than music, Pay or topo maps",
      "You're comparing Instinct vs T-Rex and prefer Garmin Connect",
    ],
    avoid: [
      "Offline topo maps are required — Apex 4, Enduro or Fenix fit better",
      "You want AMOLED lifestyle features and payments — Vivoactive/Forerunner lane",
      "Pure road racing weight is the goal — Pace 4 / Forerunner midrange",
    ],
    alts: ["prod-amazfit-t-rex-3-pro", "prod-enduro-3", "prod-coros-apex-4"],
    scores: [
      { key: "battery", label: "Battery (claimed)", score: 90 },
      { key: "durability", label: "Durability", score: 92 },
      { key: "gps", label: "GPS & Nav", score: 80, note: "No full offline maps" },
      { key: "value", label: "Value for Money", score: 86 },
      { key: "features", label: "Features", score: 76 },
    ],
  }),
  watchResearchReview({
    id: "review-vivoactive-6",
    slug: "garmin-vivoactive-6",
    productId: "prod-vivoactive-6",
    title: "Garmin Vivoactive 6 Review",
    subtitle: "Light AMOLED lifestyle-plus-running watch with Coach plans.",
    bottomLine:
      "Buy Vivoactive 6 for light daily wear with music and Coach; skip it when you need deep Forerunner metrics or long GPS days.",
    verdict:
      "Approachable lifestyle Garmin for mixed fitness and easy running — not a flagship training or ultra tool.",
    summary:
      "Very light AMOLED with music, Garmin Pay and Coach plans. I'd shortlist it for beginners who want notifications and runs in one device. I'd pause if maps, long GPS battery or advanced training readiness are must-haves.",
    score: 78,
    fit: "~23 g class daily wear — among Garmin’s lightest. Comfortable for small wrists; less ‘training watch’ presence than Forerunner.",
    gps: "Multi-band GNSS for everyday runs without full offline maps. Suitable for road and park loops; not an adventure navigation watch.",
    battery: "Shorter GPS battery than dedicated running watches. Fine for daily sessions; plan charges around long races.",
    training: "Garmin Coach and broad sport apps without the deepest Forerunner readiness stack. Good on-ramp; step to 570/970 when metrics get serious.",
    value: "Mid lifestyle pricing (~€299 seed). Strong if you use music/Pay daily; Forerunner 165 or Pace 4 beat it for pure run training value.",
    pros: [
      "Very light AMOLED daily wear",
      "Music and Garmin Pay",
      "Coach plans without Forerunner complexity",
    ],
    cons: [
      "Shorter GPS battery than run specialists",
      "No full maps or deepest training metrics",
      "Less runner-first than Forerunner line",
    ],
    buy: [
      "You want a light lifestyle Garmin with music and easy run tracking",
      "Notifications and Pay matter as much as GPS pace",
      "You're comparing vs Forerunner 165 and prefer daily smartwatch feel",
    ],
    avoid: [
      "Structured marathon metrics are the job — Forerunner mid/flagship fits better",
      "You need multi-hour continuous GPS headroom — Pace 4 / Enduro class",
      "Offline maps are required — Fenix/Apex/Vertical lane",
    ],
    alts: ["prod-forerunner-165", "prod-coros-pace-4", "prod-forerunner-570"],
    comparisonIds: ["cmp-vivoactive6-fr165"],
    scores: [
      { key: "weight", label: "Weight & Comfort", score: 94 },
      { key: "usability", label: "Usability", score: 88 },
      { key: "features", label: "Features", score: 78 },
      { key: "battery", label: "Battery (claimed)", score: 70 },
      { key: "value", label: "Value for Money", score: 80 },
    ],
  }),
  watchResearchReview({
    id: "review-forerunner-265s",
    slug: "garmin-forerunner-265s",
    productId: "prod-forerunner-265s",
    title: "Garmin Forerunner 265S Review",
    subtitle: "Compact previous-gen AMOLED Forerunner — strong clearance midrange.",
    bottomLine:
      "Buy 265S when clearance pricing undercuts 570 and you need a smaller AMOLED Forerunner; skip it when you want current-gen 570/970 extras.",
    verdict:
      "Still an excellent compact training watch when discounted. Previous-generation versus 570 — choose on price and wrist size.",
    summary:
      "42 mm AMOLED Forerunner with multi-band, music and training tools. I'd shortlist it for small wrists on clearance. I'd pause if you want the newest Forerunner hardware and can stretch to 570.",
    score: 81,
    fit: "S-size 42 mm case suits smaller wrists better than standard mid Forerunners. Quick-release bands follow Garmin norms.",
    gps: "Multi-band GNSS with navigation tools but no full offline maps. Solid for road and light trail; maps seekers step to 970/Fenix.",
    battery: "Competitive claimed GPS for the mid AMOLED class; always-on and multi-band reduce hours. Adequate for marathon long runs with sensible settings.",
    training: "Training readiness, recovery and running dynamics support typical of mid/high Forerunners of its generation — still deeper than 165.",
    value: "Best as a clearance buy (~€349 seed). At full price, compare carefully against current 570.",
    pros: [
      "Compact AMOLED with real Forerunner training tools",
      "Music, Pay and multi-band GPS",
      "Strong clearance value after 570 launch",
    ],
    cons: [
      "Superseded by Forerunner 570 / 570S",
      "No full offline maps",
      "Previous-gen extras versus newest flagships",
    ],
    buy: [
      "You want smaller 42 mm AMOLED fit without losing Forerunner training tools and will rotate or compare against Forerunner 570 — that is the Forerunner 265S's main job",
      "Most of your sessions match strong clearance value after the 570 launch more than a do-everything compromise",
      "You're building a clear role for the Forerunner 265S instead of forcing one product to cover every session",
    ],
    avoid: [
      "You want current-gen Forerunner hardware — look at 570/970",
      "Offline maps are required — 970 / Fenix / Pace Pro",
      "Budget is extreme — Pace 4 / Suunto Run undercut",
    ],
    alts: ["prod-forerunner-570", "prod-coros-pace-4", "prod-forerunner-165"],
    scores: [
      { key: "features", label: "Features", score: 86 },
      { key: "fit", label: "Compact Fit", score: 92 },
      { key: "value", label: "Value for Money", score: 88, note: "Clearance-dependent" },
      { key: "battery", label: "Battery (claimed)", score: 82 },
      { key: "gps", label: "GPS", score: 88 },
    ],
  }),
  watchResearchReview({
    id: "review-garmin-epix-pro-gen2",
    slug: "garmin-epix-pro-gen-2",
    productId: "prod-garmin-epix-pro-gen2",
    title: "Garmin Epix Pro (Gen 2) Review",
    subtitle: "Previous-gen AMOLED maps flagship — value adventure buy vs Fenix 8.",
    bottomLine:
      "Buy Epix Pro Gen 2 when clearance pricing delivers AMOLED maps near Fenix capability; skip it when you want current Fenix 8 hardware deltas.",
    verdict:
      "Proven sapphire AMOLED adventure watch. Best as a discounted alternative to Fenix 8, not as a default over Enduro for ultra battery.",
    summary:
      "AMOLED maps, ECG and full Garmin coaching in a previous-gen flagship. I'd shortlist it on sale versus Fenix 8. I'd pause if multi-band GPS battery or newest Fenix extras are the reason to buy.",
    score: 84,
    fit: "47 mm adventure footprint similar to Fenix peers — try on if coming from compact Forerunners.",
    gps: "Multi-band GNSS with full offline maps. Strong adventure navigation brief; battery in multi-band is the known trade-off versus newer Enduro/Fenix claims.",
    battery: "Solid AMOLED maps battery for its generation; trails Enduro MIP solar and some newer Fenix claims in multi-band. Manage always-on carefully.",
    training: "Full Garmin training stack with ECG and flashlight extras typical of Pro adventure models.",
    value: "Clears strongest (~€649 seed) when discounted against Fenix 8 list. At near-parity pricing, prefer current Fenix.",
    pros: [
      "AMOLED maps experience close to current Fenix",
      "ECG and full Garmin coaching stack",
      "Strong clearance adventure value",
    ],
    cons: [
      "Replaced by Fenix 8 in the lineup",
      "Multi-band battery shorter than Enduro / newer Fenix claims",
      "Still premium versus Apex 4",
    ],
    buy: [
      "You find Epix Pro Gen 2 well below Fenix 8 and want AMOLED maps now",
      "Garmin adventure tools and ECG matter without paying current flagship list",
      "You're upgrading from maps-less Forerunners and catch clearance stock",
    ],
    avoid: [
      "You want the newest Fenix hardware and maps stack — buy Fenix 8 instead of clearance Epix Pro Gen 2",
      "Ultra GPS hours dominate your purchase reason — Enduro 3 or Vertix fit the brief better",
      "Budget maps on trail are the whole job — Apex 4 usually delivers more value without Epix chrome",
    ],
    alts: ["prod-fenix-8", "prod-coros-apex-4", "prod-enduro-3"],
    scores: [
      { key: "gps", label: "GPS & Maps", score: 92 },
      { key: "features", label: "Features", score: 90 },
      { key: "value", label: "Value for Money", score: 86, note: "Clearance-dependent" },
      { key: "battery", label: "Battery (claimed)", score: 78 },
      { key: "ecosystem", label: "Ecosystem", score: 94 },
    ],
  }),
  watchResearchReview({
    id: "review-coros-apex-4",
    slug: "coros-apex-4",
    productId: "prod-coros-apex-4",
    title: "COROS Apex 4 Review",
    subtitle: "Titanium MIP mountain watch with offline maps and long dual-frequency battery.",
    bottomLine:
      "Buy Apex 4 for trail/ultra maps without Fenix pricing; skip it when you need music, payments or Garmin’s deepest coaching.",
    verdict:
      "Sweet-spot COROS trail watch — maps, sapphire MIP and endurance battery for mountain athletes who accept a leaner ecosystem.",
    summary:
      "Apex 4 brings offline topo/street maps and strong dual-frequency claims in a titanium MIP build. I'd shortlist it versus Fenix for trail value. I'd pause if music/Pay or Garmin sensors are non-negotiable.",
    score: 90,
    fit: "46 mm titanium MIP — lighter than Vertix for most trail days. Button-first interface; no touchscreen.",
    gps: "Dual-frequency GNSS with full offline maps. Built for mountain routing; validate map downloads before remote races.",
    battery: "Strong all-systems and dual-frequency claims for the maps class. MIP helps endurance versus AMOLED peers.",
    training: "COROS training tools and recovery metrics without Garmin/Polar depth. Excellent for athletes happy in the COROS app.",
    value: "Excellent trail maps value (~€430 seed) versus Fenix 8. Pace 4 undercuts if you don’t need maps.",
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
    buy: [
      "You want full offline topo/street maps on a durable sapphire MIP and will rotate or compare against Fenix 8 AMOLED 47mm — that is the Apex 4's main job",
      "Most of your sessions match strong dual-frequency GPS battery on the 46 mm size more than a do-everything compromise",
      "You're building a clear role for the Apex 4 instead of forcing one product to cover every session",
    ],
    avoid: [
      "Music and payments are required — Fenix / Forerunner music models",
      "You live in Garmin Connect accessories — switching will frustrate you",
      "You want AMOLED daily brightness — Vertical 2 / Fenix / Pace Pro",
    ],
    alts: ["prod-fenix-8", "prod-suunto-vertical-2", "prod-enduro-3"],
    comparisonIds: ["cmp-apex4-fenix8"],
    scores: [
      { key: "gps", label: "GPS & Maps", score: 94 },
      { key: "battery", label: "Battery (claimed)", score: 93 },
      { key: "value", label: "Value for Money", score: 88 },
      { key: "features", label: "Features", score: 82 },
      { key: "ecosystem", label: "Ecosystem", score: 78 },
    ],
  }),
  watchResearchReview({
    id: "review-coros-pace-4",
    slug: "coros-pace-4",
    productId: "prod-coros-pace-4",
    title: "COROS Pace 4 Review",
    subtitle: "Ultralight AMOLED value runner with standout dual-frequency battery claims.",
    bottomLine:
      "Buy Pace 4 for light dual-frequency training at a sharp price; skip it when you need maps, music or Garmin Connect.",
    verdict:
      "Best-in-class value for many road runners. Lean feature set on purpose — battery and weight first.",
    summary:
      "Just ~32 g with dual-frequency GPS and long claimed battery. I'd shortlist it for high-mileage road athletes. I'd pause if offline maps or onboard music are required.",
    score: 87,
    fit: "Ultralight nylon-band feel suits small wrists and race day. Touch AMOLED without adventure bulk.",
    gps: "Dual-frequency GNSS without full offline maps. Excellent for road/track; step to Pace Pro/Apex for topo.",
    battery: "Standout claimed GPS and dual-frequency hours for the price. One of the strongest value battery stories in the catalog.",
    training: "COROS training essentials and recovery — less dense than Garmin flagships, enough for serious mileage.",
    value: "Top-tier (~€249 seed). Hard to beat for dual-frequency + weight unless you need Garmin software.",
    pros: [
      "Extremely light on-wrist feel",
      "Strong dual-frequency battery claims",
      "Excellent price-to-performance",
    ],
    cons: [
      "No full offline maps",
      "No music or payments",
      "Leaner ecosystem than Garmin",
    ],
    buy: [
      "You want just 32 g with nylon band—easy all-day racing weight and will rotate or compare against Pace Pro — that is the Pace 4's main job",
      "Most of your sessions match 41 hours all-systems / 31 hours dual-frequency GPS claims more than a do-everything compromise",
      "You're building a clear role for the Pace 4 instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need no full offline maps (step up to Apex 4 / Pace Pro) — look at Pace Pro or a clearer specialist instead of forcing the Pace 4",
      "Your must-haves conflict with a Pace 4 trade-off: no music or payments",
      "Your fit, surface, or support needs sit outside what COROS built the Pace 4 to do",
    ],
    alts: ["prod-coros-pace-pro", "prod-forerunner-570", "prod-forerunner-165"],
    comparisonIds: ["cmp-pace4-fr165", "cmp-pacepro-pace4"],
    scores: [
      { key: "battery", label: "Battery (claimed)", score: 95 },
      { key: "weight", label: "Weight & Comfort", score: 96 },
      { key: "value", label: "Value for Money", score: 94 },
      { key: "gps", label: "GPS", score: 90 },
      { key: "features", label: "Features", score: 78 },
    ],
  }),
  watchResearchReview({
    id: "review-coros-vertix-2s",
    slug: "coros-vertix-2s",
    productId: "prod-coros-vertix-2s",
    title: "COROS Vertix 2S Review",
    subtitle: "Extreme-battery sapphire adventure watch for ultras and expeditions.",
    bottomLine:
      "Buy Vertix 2S for remote multi-day battery with maps; skip it when Apex 4 or Enduro covers your ultras at lower weight.",
    verdict:
      "Expedition-class COROS. Battery and rugged build first — heavier than modern Apex/Enduro for pure racing.",
    summary:
      "Full-metal sapphire adventure watch with among the longest GPS claims. I'd shortlist it for expeditions. I'd pause if Apex 4’s lighter maps package is enough.",
    score: 88,
    fit: "~87 g / 50 mm rugged case — serious wrist presence. Better for expedition wear than road racing aesthetics.",
    gps: "Multi-band GNSS with offline maps suited to remote alpine and ultra routes.",
    battery: "Extreme GPS endurance claims define the product. Expect fewer lifestyle drains than AMOLED flagships.",
    training: "COROS training tools adequate for endurance athletes; less coaching theatre than Garmin flagships.",
    value: "Premium adventure pricing (~€699 seed). Compare Enduro 3 and Apex 4 before paying for Vertix bulk.",
    pros: [
      "Among the longest GPS battery claims",
      "Rugged sapphire adventure build",
      "Offline maps for remote ultras",
    ],
    cons: [
      "Heavier than Apex 4 / Enduro for racing",
      "Aging versus newer Apex 4 feature set",
      "Premium price for COROS",
    ],
    buy: [
      "You want among the longest GPS battery claims in the adventure class and will rotate or compare against Enduro 3 — that is the Vertix 2S's main job",
      "Most of your sessions match full-metal rugged case with sapphire glass more than a do-everything compromise",
      "You're building a clear role for the Vertix 2S instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need to avoid heavier than Apex 4 / Enduro for pure road racing — look at Enduro 3 or a clearer specialist instead of forcing the Vertix 2S",
      "Your must-haves conflict with a Vertix 2S trade-off: aging versus newer Apex 4 feature set",
      "Your fit, surface, or support needs sit outside what COROS built the Vertix 2S to do",
    ],
    alts: ["prod-enduro-3", "prod-coros-apex-4", "prod-fenix-8"],
    scores: [
      { key: "battery", label: "Battery (claimed)", score: 97 },
      { key: "gps", label: "GPS & Maps", score: 92 },
      { key: "durability", label: "Durability", score: 94 },
      { key: "weight", label: "Weight & Comfort", score: 70 },
      { key: "value", label: "Value for Money", score: 74 },
    ],
  }),
  watchResearchReview({
    id: "review-suunto-vertical-2",
    slug: "suunto-vertical-2",
    productId: "prod-suunto-vertical-2",
    title: "Suunto Vertical 2 Review",
    subtitle: "Outdoor AMOLED with offline maps, dual-band GPS and long training battery.",
    bottomLine:
      "Buy Vertical 2 for bright outdoor maps without Garmin pricing; skip it when Enduro-class battery or deepest coaching matter more.",
    verdict:
      "Strong Suunto trail/outdoor pick — AMOLED maps and long multi-band claims for mountain athletes.",
    summary:
      "1.5″ AMOLED, free offline maps, flashlight and ~65 h multi-band claims. I'd shortlist it versus Fenix for outdoor value. I'd pause if music or Garmin training depth are required.",
    score: 85,
    fit: "49 mm outdoor case — large bright display, not a compact runner. Confirm comfort for all-day wear.",
    gps: "Dual-band GNSS with free offline outdoor maps and climb-focused navigation tools.",
    battery: "Strong multi-band training claims for an AMOLED. Still plan charging versus MIP solar ultras for multi-day events.",
    training: "Suunto outdoor/training tools — capable but less deep than Garmin/Polar flagship coaching.",
    value: "Competitive outdoor AMOLED pricing (~€599 seed) versus Fenix. Apex 4 undercuts if MIP is acceptable.",
    pros: [
      "Bright large AMOLED with offline maps",
      "Strong multi-band battery claims",
      "LED flashlight and outdoor navigation tools",
    ],
    cons: [
      "Coaching less deep than Garmin/Polar flagships",
      "No onboard music",
      "Larger case than road specialists",
    ],
    buy: [
      "You want bright 1.5″ AMOLED with free offline outdoor maps and will rotate or compare against Fenix 8 AMOLED 47mm — that is the Vertical 2's main job",
      "Most of your sessions match up to 65 hours in multi-band performance tracking more than a do-everything compromise",
      "You're building a clear role for the Vertical 2 instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need to avoid training coaching less deep than Garmin/Polar flagships — look at Fenix 8 AMOLED 47mm or a clearer specialist instead of forcing the Vertical 2",
      "Your must-haves conflict with a Vertical 2 trade-off: no onboard music storage",
      "Your fit, surface, or support needs sit outside what Suunto built the Vertical 2 to do",
    ],
    alts: ["prod-fenix-8", "prod-coros-apex-4", "prod-enduro-3"],
    comparisonIds: ["cmp-vertical2-enduro3"],
    scores: [
      { key: "gps", label: "GPS & Maps", score: 90 },
      { key: "battery", label: "Battery (claimed)", score: 88 },
      { key: "display", label: "Display", score: 92 },
      { key: "value", label: "Value for Money", score: 80 },
      { key: "features", label: "Features", score: 82 },
    ],
  }),
  watchResearchReview({
    id: "review-suunto-run",
    slug: "suunto-run",
    productId: "prod-suunto-run",
    title: "Suunto Run Review",
    subtitle: "Beginner-friendly AMOLED runner with dual-band GPS around entry pricing.",
    bottomLine:
      "Buy Suunto Run for a simple dual-band AMOLED starter; skip it when you need maps, music or Pace 4-class battery.",
    verdict:
      "Approachable entry Suunto for new runners — dual-band is the standout at this price.",
    summary:
      "Light ~36 g AMOLED with dual-band GPS and simple crown UI. I'd shortlist it for first 5K/10K athletes. I'd pause if long GPS days or deep coaching are next-year needs.",
    score: 76,
    fit: "Light daily runner footprint — friendly for smaller wrists and all-day wear.",
    gps: "Dual-band GNSS unusual at this budget. No maps/navigation depth — road-focused.",
    battery: "~20 h training battery claims trail Pace 4. Fine for weekly mileage; not an ultra tool.",
    training: "Simple intervals and recovery tools (including Ghost Runner). Not a flagship coaching platform.",
    value: "Strong entry AMOLED (~€199 seed). Amazfit Active 2 is cheaper; Pace 4 costs more for battery.",
    pros: [
      "Light AMOLED at entry pricing",
      "Dual-band GPS at this budget",
      "Simple crown UI for beginners",
    ],
    cons: [
      "Shorter training battery than COROS Pace class",
      "No maps, music or deep multisport stack",
      "Shallower coaching than Garmin midrange",
    ],
    buy: [
      "You want a bright simple dual-band starter without Garmin complexity",
      "First race distances are the job, not ultras — that race/workout focus is a good fit for the Run beside Pace 4",
      "You're comparing Suunto Run vs Amazfit Active 2 and want better GPS positioning",
    ],
    avoid: [
      "You need to avoid training battery (~20 h) shorter than COROS Pace class — look at Pace 4 or a clearer specialist instead of forcing the Run",
      "Your must-haves conflict with a Run trade-off: no maps, music, or deep multisport stack",
      "Your fit, surface, or support needs sit outside what Suunto built the Run to do",
    ],
    alts: ["prod-coros-pace-4", "prod-amazfit-active-2", "prod-forerunner-165"],
    scores: [
      { key: "value", label: "Value for Money", score: 88 },
      { key: "usability", label: "Usability", score: 86 },
      { key: "gps", label: "GPS", score: 84 },
      { key: "battery", label: "Battery (claimed)", score: 72 },
      { key: "features", label: "Features", score: 70 },
    ],
  }),
  watchResearchReview({
    id: "review-polar-grit-x2",
    slug: "polar-grit-x2",
    productId: "prod-polar-grit-x2",
    title: "Polar Grit X2 Review",
    subtitle: "Compact outdoor Polar with sapphire AMOLED maps and dual-frequency GPS.",
    bottomLine:
      "Buy Grit X2 when Polar training analytics meet outdoor maps; skip it when Garmin battery/music depth or COROS endurance pricing wins.",
    verdict:
      "Polar’s compact outdoor challenger — maps plus Flow recovery for trail athletes already in Polar.",
    summary:
      "Sapphire AMOLED, dual-frequency GPS and full-color maps in a compact outdoor chassis. I'd shortlist it for Polar ecosystem trail runners. I'd pause if smartwatch battery or music matter daily.",
    score: 84,
    fit: "More compact than many adventure flagships — easier daily outdoor wear than Fenix-class bulk.",
    gps: "Dual-frequency GNSS with offline maps for trail navigation. Strong outdoor brief within Polar’s stack.",
    battery: "GPS claims competitive; typical smartwatch days (~7) shorter than Garmin/COROS MIP peers. Charge discipline required.",
    training: "Polar Flow training/recovery analytics are the differentiator — excellent if you trust Polar’s coaching model.",
    value: "Premium outdoor Polar (~€549 seed). Compare Fenix and Apex 4 before locking ecosystem.",
    pros: [
      "Polar training/recovery with outdoor maps",
      "Sapphire AMOLED in a compact chassis",
      "Dual-frequency GPS and durability focus",
    ],
    cons: [
      "Shorter smartwatch battery than Garmin/COROS peers",
      "No music or payments",
      "Smaller accessory ecosystem than Garmin",
    ],
    buy: [
      "You want polar training/recovery analytics with outdoor maps and will rotate or compare against Fenix 8 AMOLED 47mm — that is the Grit X2's main job",
      "Most of your sessions match sapphire AMOLED and dual-frequency GPS in a compact chassis more than a do-everything compromise",
      "You're building a clear role for the Grit X2 instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need to avoid smartwatch battery (~7 days) shorter than Garmin/COROS peers — look at Fenix 8 AMOLED 47mm or a clearer specialist instead of forcing the Grit X2",
      "Your must-haves conflict with a Grit X2 trade-off: no music or payments",
      "Your fit, surface, or support needs sit outside what Polar built the Grit X2 to do",
    ],
    alts: ["prod-fenix-8", "prod-suunto-vertical-2", "prod-coros-apex-4"],
    comparisonIds: ["cmp-gritx2-fenix8"],
    scores: [
      { key: "gps", label: "GPS & Maps", score: 90 },
      { key: "training", label: "Training analytics", score: 92 },
      { key: "battery", label: "Battery (claimed)", score: 74 },
      { key: "value", label: "Value for Money", score: 76 },
      { key: "features", label: "Features", score: 82 },
    ],
  }),
  watchResearchReview({
    id: "review-polar-pacer",
    slug: "polar-pacer",
    productId: "prod-polar-pacer",
    title: "Polar Pacer Review",
    subtitle: "Entry Polar GPS runner focused on training guidance without adventure bulk.",
    bottomLine:
      "Buy Polar Pacer for simple Flow coaching at an accessible price; skip it when you want AMOLED, multi-band or maps.",
    verdict:
      "Straightforward Polar training watch for beginners and intermediates who value Flow over lifestyle chrome.",
    summary:
      "Light MIP runner with Polar Flow coaching. I'd shortlist it for athletes starting structured training in Polar. I'd pause if dual-band, maps or bright displays are must-haves.",
    score: 73,
    fit: "Light MIP sports watch — unobtrusive daily training wear.",
    gps: "Standard GPS without multi-band or maps. Fine for road loops; not a canyon/trail accuracy specialist.",
    battery: "Solid GPS training battery for weekly mileage; smartwatch days are modest versus modern AMOLED value watches.",
    training: "Polar Flow guidance is the reason to buy — clearer than many budget Amazfit tools for structured runners.",
    value: "Accessible (~€199 seed). Pace 4 / Suunto Run offer more modern GNSS for similar money.",
    pros: [
      "Simple Polar Flow coaching",
      "Light MIP training focus",
      "Accessible price",
    ],
    cons: [
      "No maps, multi-band or music",
      "Fewer lifestyle features than AMOLED beginners’ watches",
      "Aging versus newer dual-band value options",
    ],
    buy: [
      "You want simple Polar Flow coaching at an accessible price and will rotate or compare against Pacer Pro — that is the Pacer's main job",
      "Most of your sessions match light MIP runner that prioritizes training metrics more than a do-everything compromise",
      "You're building a clear role for the Pacer instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need no maps, multi-band GPS, or music — look at Pacer Pro or a clearer specialist instead of forcing the Pacer",
      "Your must-haves conflict with a Pacer trade-off: fewer lifestyle features than AMOLED beginners’ watches",
      "Your fit, surface, or support needs sit outside what Polar built the Pacer to do",
    ],
    alts: ["prod-polar-pacer-pro", "prod-coros-pace-4", "prod-suunto-run"],
    scores: [
      { key: "training", label: "Training guidance", score: 84 },
      { key: "value", label: "Value for Money", score: 86 },
      { key: "battery", label: "Battery (claimed)", score: 80 },
      { key: "gps", label: "GPS", score: 72 },
      { key: "features", label: "Features", score: 68 },
    ],
  }),
  watchResearchReview({
    id: "review-apple-watch-ultra-3",
    slug: "apple-watch-ultra-3",
    productId: "prod-apple-watch-ultra-3",
    title: "Apple Watch Ultra 3 Review",
    subtitle: "Best rugged Apple smartwatch for runners in the iPhone ecosystem.",
    bottomLine:
      "Buy Ultra 3 when Apple apps and dual-frequency GPS matter together; skip it when multi-day dedicated GPS battery is the priority.",
    verdict:
      "Top Apple running hybrid. Excellent smartwatch, shorter continuous GPS endurance than Garmin/COROS ultras.",
    summary:
      "Rugged titanium Ultra with dual-frequency GPS, siren and best-in-class iPhone integration. I'd shortlist it for Apple-locked runners. I'd pause for ultras needing Enduro-class GPS hours.",
    score: 87,
    fit: "49 mm rugged case — substantial on small wrists. Action button and alpine loop options suit sport use.",
    gps: "Dual-frequency GNSS with Apple Maps/workouts. Strong for races and daily runs; still not a topo-adventure specialist like Fenix/Apex.",
    battery: "Multiday normal/Low Power claims beat Series watches but trail dedicated MIP ultras for continuous GNSS. Charge planning remains real for long events.",
    training: "Apple Fitness+ / third-party apps excel; less specialized long-term training load coaching than Garmin/COROS flagships.",
    value: "Premium (~€899 seed). Worth it if Apple ecosystem is non-negotiable; otherwise Forerunner/Fenix often train better per euro.",
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
    buy: [
      "You want best iPhone app ecosystem, Apple Pay, and cellular options and will rotate or compare against Watch Ultra 2 — that is the Watch Ultra 3's main job",
      "Most of your sessions match rugged titanium build with dual-frequency GPS and siren more than a do-everything compromise",
      "You're building a clear role for the Watch Ultra 3 instead of forcing one product to cover every session",
    ],
    avoid: [
      "Multi-day continuous GPS without charging — Enduro / Vertix / Apex",
      "You want Garmin/COROS training ecosystems — switch brands",
      "Budget is tight — Series 10 or a dedicated run watch",
    ],
    alts: ["prod-apple-watch-ultra-2", "prod-forerunner-970", "prod-fenix-8"],
    comparisonIds: ["cmp-ultra3-ultra2"],
    scores: [
      { key: "ecosystem", label: "Ecosystem", score: 98 },
      { key: "usability", label: "Usability", score: 94 },
      { key: "gps", label: "GPS", score: 88 },
      { key: "battery", label: "Battery (claimed)", score: 72, note: "Vs dedicated ultras" },
      { key: "value", label: "Value for Money", score: 68 },
    ],
  }),
  watchResearchReview({
    id: "review-apple-watch-series-10",
    slug: "apple-watch-series-10",
    productId: "prod-apple-watch-series-10",
    title: "Apple Watch Series 10 Review",
    subtitle: "Daily Apple smartwatch for casual runners — not a multi-day GPS tool.",
    bottomLine:
      "Buy Series 10 for daily Apple health and shorter GPS runs; skip it for ultras, multi-day events or specialized coaching.",
    verdict:
      "Excellent everyday Apple Watch that can run — poor fit when dedicated GPS endurance is the purchase reason.",
    summary:
      "Thin AMOLED Apple Watch with seamless iPhone integration. I'd shortlist it for casual runners already in Apple. I'd pause hard for marathon ultras or battery-first training.",
    score: 74,
    fit: "42 mm thin case — excellent small-wrist daily wear versus Ultra.",
    gps: "Capable dual-frequency GPS for shorter runs and races. Not positioned as an adventure navigation watch.",
    battery: "Daily charging lifestyle. Continuous GPS hours are limited versus dedicated run watches — plan accordingly.",
    training: "Apple fitness metrics and apps; not a specialized endurance coaching platform like Garmin/COROS.",
    value: "Mid Apple pricing (~€449 seed). Ultra 3 if you need rugged GPS; dedicated run watches if training depth matters more than apps.",
    pros: [
      "Thin comfortable daily Apple Watch",
      "Excellent notifications, health and Apple Pay",
      "Capable GPS for shorter runs",
    ],
    cons: [
      "Daily charging — poor ultra fit",
      "Not a specialized endurance coach",
      "Shorter GPS endurance than Ultra / Garmin",
    ],
    buy: [
      "You want thinnest modern Apple Watch with excellent everyday UX and will rotate or compare against Watch Ultra 3 — that is the Watch Series 10's main job",
      "Most of your sessions match seamless health, notifications, and Apple Pay for iPhone users more than a do-everything compromise",
      "You're building a clear role for the Watch Series 10 instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need to avoid daily charging—poor fit for ultras or multi-day events — look at Watch Ultra 3 or a clearer specialist instead of forcing the Watch Series 10",
      "Your must-haves conflict with a Watch Series 10 trade-off: not a specialized endurance coaching platform",
      "Your fit, surface, or support needs sit outside what Apple built the Watch Series 10 to do",
    ],
    alts: ["prod-apple-watch-ultra-3", "prod-vivoactive-6", "prod-coros-pace-4"],
    scores: [
      { key: "ecosystem", label: "Ecosystem", score: 96 },
      { key: "usability", label: "Usability", score: 94 },
      { key: "weight", label: "Weight & Comfort", score: 92 },
      { key: "battery", label: "Battery (claimed)", score: 55 },
      { key: "value", label: "Value for Money", score: 70 },
    ],
  }),
  watchResearchReview({
    id: "review-samsung-galaxy-watch-ultra",
    slug: "samsung-galaxy-watch-ultra",
    productId: "prod-samsung-galaxy-watch-ultra",
    title: "Samsung Galaxy Watch Ultra Review",
    subtitle: "Titanium Galaxy flagship sport watch with dual-frequency GPS.",
    bottomLine:
      "Buy Galaxy Watch Ultra for Samsung/Android sport integration; skip it when you’re on iPhone or need MIP ultra battery.",
    verdict:
      "Strong Android sport smartwatch. Best experience locked to Galaxy phones; dedicated run watches still lead pure endurance coaching.",
    summary:
      "Titanium + sapphire with L1/L5 GPS and Wear OS apps. I'd shortlist it for Galaxy users wanting a rugged sport watch. I'd pause for iPhone users or multi-day MIP ultras.",
    score: 80,
    fit: "47 mm titanium sport case — flagship presence similar to other ultras.",
    gps: "Dual-frequency GNSS with offline route tools in Samsung’s sport stack. Capable for trail/road; ecosystem apps vary.",
    battery: "Exercise power-saving GPS claims up to ~48 h — better than many smartwatches, still behind Enduro-class MIP.",
    training: "Galaxy AI insights and Wear OS apps; less specialized than Garmin/COROS long-term training platforms.",
    value: "Premium Android sport pricing (~€649 seed). Compare Apple Ultra and Fenix before committing ecosystems.",
    pros: [
      "Rugged titanium + sapphire dual-frequency GPS",
      "Strong Galaxy phone integration",
      "Competitive exercise power-saving GPS claims",
    ],
    cons: [
      "Best experience locked to Samsung/Android",
      "Shorter everyday battery than MIP ultras",
      "Less specialized endurance coaching than Garmin/COROS",
    ],
    buy: [
      "You want rugged titanium + sapphire with L1/L5 dual-frequency GPS and will rotate or compare against Watch Ultra 3 — that is the Galaxy Watch Ultra's main job",
      "Most of your sessions match strong Galaxy phone integration and Wear OS apps more than a do-everything compromise",
      "You're building a clear role for the Galaxy Watch Ultra instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need to avoid best experience locked to Samsung/Android phones — look at Watch Ultra 3 or a clearer specialist instead of forcing the Galaxy Watch Ultra",
      "Your must-haves conflict with a Galaxy Watch Ultra trade-off: shorter everyday battery than MIP ultra watches",
      "Your fit, surface, or support needs sit outside what Samsung built the Galaxy Watch Ultra to do",
    ],
    alts: ["prod-apple-watch-ultra-3", "prod-fenix-8", "prod-amazfit-t-rex-3-pro"],
    scores: [
      { key: "ecosystem", label: "Android ecosystem", score: 90 },
      { key: "gps", label: "GPS", score: 86 },
      { key: "features", label: "Features", score: 84 },
      { key: "battery", label: "Battery (claimed)", score: 76 },
      { key: "value", label: "Value for Money", score: 72 },
    ],
  }),
  watchResearchReview({
    id: "review-amazfit-t-rex-3-pro",
    slug: "amazfit-t-rex-3-pro",
    productId: "prod-amazfit-t-rex-3-pro",
    title: "Amazfit T-Rex 3 Pro Review",
    subtitle: "Value rugged AMOLED GPS watch for trail without flagship pricing.",
    bottomLine:
      "Buy T-Rex 3 Pro for rugged adventure styling and long stated battery on a budget; skip it when training ecosystem polish matters most.",
    verdict:
      "Value rugged outdoor watch. Strong specs-per-euro; expect less mature coaching than Garmin/COROS/Polar.",
    summary:
      "Large AMOLED, offline route tools and long battery claims at a value price. I'd shortlist it for budget trail toughness. I'd pause if optical HR polish and coaching depth are critical.",
    score: 79,
    fit: "48 mm rugged adventure styling — bold on small wrists but lighter than metal expedition watches.",
    gps: "Multi-band GNSS with offline route tools. Capable for adventure days; map polish trails Fenix/Apex flagships.",
    battery: "Long typical-use and GPS claims for the money — a primary reason to consider Amazfit here.",
    training: "Zepp ecosystem tools are improving but still lag dedicated running brands for serious athletes.",
    value: "Excellent rugged value (~€249 seed). Instinct 3 if you prefer Garmin; Apex 4 if maps accuracy is worth more.",
    pros: [
      "Rugged adventure styling at a value price",
      "Long battery claims for the money",
      "Bright large AMOLED with route tools",
    ],
    cons: [
      "Training ecosystem less mature than Garmin/COROS/Polar",
      "Optical HR and maps polish trail flagships",
      "Brand trust varies by region/support",
    ],
    buy: [
      "You want rugged adventure styling at a value price and will rotate or compare against Instinct 3 — that is the T-Rex 3 Pro's main job",
      "Most of your sessions match long typical-use and GPS battery claims for the money more than a do-everything compromise",
      "You're building a clear role for the T-Rex 3 Pro instead of forcing one product to cover every session",
    ],
    avoid: [
      "You need the most trusted training ecosystems — Garmin/COROS/Polar",
      "Ultra race navigation confidence is critical — Apex/Fenix/Enduro",
      "You're shopping primarily for race or workout snap — the T-Rex 3 Pro is aimed at a different session mix than Instinct 3",
    ],
    alts: ["prod-instinct-3", "prod-suunto-vertical-2", "prod-coros-apex-4"],
    scores: [
      { key: "value", label: "Value for Money", score: 90 },
      { key: "battery", label: "Battery (claimed)", score: 88 },
      { key: "durability", label: "Durability", score: 86 },
      { key: "gps", label: "GPS & Maps", score: 78 },
      { key: "training", label: "Training ecosystem", score: 70 },
    ],
  }),
  watchResearchReview({
    id: "review-amazfit-active-2",
    slug: "amazfit-active-2",
    productId: "prod-amazfit-active-2",
    title: "Amazfit Active 2 Review",
    subtitle: "Budget entry AMOLED for first GPS miles and daily activity.",
    bottomLine:
      "Buy Active 2 when sub-€100 GPS is the constraint; skip it when accuracy and coaching matter enough to stretch to Suunto Run or Pace 4.",
    verdict:
      "Honest budget starter. Good for first miles; plan an upgrade path when training gets serious.",
    summary:
      "Light AMOLED GPS around €99. I'd shortlist it for absolute beginners on a tight budget. I'd pause if dual-band, maps or serious coaching are near-term needs.",
    score: 72,
    fit: "~27 g light daily wear — easy for new watch users and small wrists.",
    gps: "Basic GPS without multi-band. Fine for park loops; expect less consistency than dual-frequency peers.",
    battery: "Decent stated battery versus phone apps. Not a long-event tool.",
    training: "Basic activity and run tracking — shallower than Polar/Garmin/COROS coaching stacks.",
    value: "Lowest entry (~€99 seed). Best as a starter, not a forever race watch.",
    pros: [
      "Low entry price for AMOLED GPS",
      "Light daily wear",
      "Decent battery versus phone-only tracking",
    ],
    cons: [
      "Accuracy and coaching lag dedicated brands",
      "Limited navigation and multisport depth",
      "No multi-band GPS",
    ],
    buy: [
      "You want low entry price for a bright AMOLED GPS watch and will rotate or compare against Run — that is the Active 2's main job",
      "Most of your sessions match light daily wear for new runners more than a do-everything compromise",
      "You're building a clear role for the Active 2 instead of forcing one product to cover every session",
    ],
    avoid: [
      "You want dual-band GPS soon — Suunto Run / Pace 4",
      "Structured coaching matters — Polar Pacer / Forerunner 165",
      "Trail maps or ultras are the goal — step way up — compare against Run before you commit to the Active 2",
    ],
    alts: ["prod-suunto-run", "prod-polar-pacer", "prod-forerunner-165"],
    scores: [
      { key: "value", label: "Value for Money", score: 92 },
      { key: "weight", label: "Weight & Comfort", score: 90 },
      { key: "usability", label: "Usability", score: 80 },
      { key: "gps", label: "GPS", score: 68 },
      { key: "features", label: "Features", score: 64 },
    ],
  }),
  watchResearchReview({
    id: "review-amazfit-balance-3",
    slug: "amazfit-balance-3",
    productId: "prod-amazfit-balance-3",
    title: "Amazfit Balance 3 Review",
    subtitle: "Hybrid-training GPS with 1.5\" sapphire maps — not a Cheetah, not a T-Rex.",
    bottomLine:
      "Buy Balance 3 when you want contour maps, HybridCharge and HYROX modes on one Zepp watch without Garmin flagship money; skip it when a lighter Cheetah 2 Pro or a Garmin Connect mid (Forerunner 570 / Vivoactive 6) is the actual week.",
    verdict:
      "Current Amazfit all-around: 1.5\" sapphire AMOLED, dual-band six-system GNSS, 64GB contour maps, 21-day typical / 41 h accuracy GPS. I'd shortlist it for mixed run/strength weeks. I'd pause if you want a 45 g runner-first Cheetah or Garmin's training model.",
    summary:
      "Balance 3 is Amazfit's 2026 hybrid aisle — titanium-black 55 g without strap (stainless 62 g as the heavier variant), 51.4 mm case, HybridCharge, HYROX sport modes, flashlight, 10 ATM. Maps and dual-band GNSS sit well above Active 2. I'd shortlist it versus Vivoactive 6 on price/maps. I'd pause if 51 mm is too large or Zepp is a non-starter.",
    score: 82,
    fit: "Manufacturer lists 55 g without strap on Titanium Black and 62 g on stainless — this catalog uses the titanium figure. The 51.4 mm case is a proper hybrid footprint, larger than Cheetah 2 Pro's 48 mm and much larger than Active 2. Confirm wrist comfort if you came from a compact Forerunner 165 or Watch9. HybridCharge and the flashlight live on this chassis, not on Active 2.",
    gps: "Dual-band, six-satellite GNSS with a circularly polarized antenna is the published positioning story. Preloaded contour maps, 64GB storage and turn-by-turn are the navigation brief — a different job from T-Rex 3 Pro's rugged adventure styling and from Cheetah 2 Pro's runner-first 32GB maps. Treat track quality as class-competitive on paper; tree cover still depends on GNSS mode.",
    battery: "Typical use is listed at 21 days; Accuracy GPS 41 hours; power-saving GPS 84 hours. That is the hybrid-week argument versus Watch9's 30–40 hour smartwatch window and versus Cheetah 2 Pro's 31 h accurate GPS. Maps, always-on AMOLED and HybridCharge sessions still cost hours versus those best-case figures.",
    training: "HYROX modes, training-load / HRV / VO2-style Zepp fields and HybridCharge are why this is not a T-Rex or an Active 2. Lactate-threshold / running-power / gait tools sit on Cheetah 2 Pro instead. Zepp Coach is improving; it is still not Garmin training readiness or COROS Training Hub.",
    value: "US list $369.99 on stainless (~€369 seed). Maps + dual-band at that band undercut Fenix 8 and sit near Vivoactive 6 / Forerunner 570. Pay that when you will use maps and hybrid modes; Cheetah 2 Pro is the better spend if the week is almost all running.",
    extraSections: [
      {
        id: "sec-maps",
        heading: "Maps & navigation",
        body: "64GB of preloaded contour maps with turn-by-turn is the Balance 3 differentiator versus Active 2 (no maps) and versus Watch9's app-driven Wear OS mapping. This is still Zepp cartography, not Garmin TopoActive depth. I'd use it for marked trail and city routing; I'd still carry a phone or Fenix-class maps for remote ultras.",
        evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      },
      {
        id: "sec-ecosystem",
        heading: "Zepp ecosystem",
        body: "Balance 3 lives in Zepp — Strava sync is listed, contactless payments are not documented here so we do not claim Garmin Pay / Samsung Pay. Music from onboard storage is the lifestyle extra. If your sensors and coaching already sit in Connect or Galaxy Health, this is a second-ecosystem tax.",
        evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      },
    ],
    pros: [
      "1.5\" sapphire AMOLED with contour maps and turn-by-turn",
      "Dual-band six-system GNSS plus HybridCharge and HYROX modes",
      "21-day typical / 41 h accuracy GPS claims at a mid Amazfit price",
    ],
    cons: [
      "51 mm case is large versus Cheetah 2 Pro and Watch9",
      "Zepp coaching still trails Garmin Connect / COROS",
      "Payments not documented; not a daily-pay smartwatch",
    ],
    buy: [
      "You mix road weeks with gym or HYROX and want contour maps plus HybridCharge on one watch without paying Fenix 8 or Vivoactive-plus-Garmin-tax prices.",
      "You already like Zepp from Active 2 / T-Rex and need dual-band GNSS and 64GB maps the starter Amazfit never had.",
      "You compared Forerunner 570 and Vivoactive 6 and would rather spend ~€369 on sapphire AMOLED maps than join Garmin Connect from scratch.",
    ],
    avoid: [
      "Almost every session is a run — Cheetah 2 Pro is the lighter, gait-and-power Amazfit and Forerunner 570 is the Garmin mid.",
      "You need Garmin training readiness, running dynamics with an HRM strap, or TopoActive confidence on remote ultras.",
      "A 51 mm hybrid case or a second app ecosystem is a deal-breaker — Watch9 or Forerunner 165 stay smaller.",
    ],
    alts: ["prod-vivoactive-6", "prod-forerunner-570", "prod-amazfit-cheetah-2-pro"],
    scores: [
      { key: "maps", label: "Maps & GPS", score: 86 },
      { key: "value", label: "Value for Money", score: 86 },
      { key: "battery", label: "Battery (claimed)", score: 84 },
      { key: "training", label: "Hybrid training", score: 78 },
      { key: "ecosystem", label: "Ecosystem", score: 70 },
    ],
  }),
  watchResearchReview({
    id: "review-amazfit-cheetah-2-pro",
    slug: "amazfit-cheetah-2-pro",
    productId: "prod-amazfit-cheetah-2-pro",
    title: "Amazfit Cheetah 2 Pro Review",
    subtitle: "Titanium runner-first GPS — gait, power and 5K–marathon Zepp Coach.",
    bottomLine:
      "Buy Cheetah 2 Pro when you want a ~46 g titanium AMOLED runner with dual-band GNSS, 32GB offline maps and Zepp Coach from 5K to marathon; skip it when you need Garmin Connect, 10 ATM swimming, or Balance 3's hybrid/HYROX brief.",
    verdict:
      "Amazfit's dedicated running watch: Grade 5 titanium, 45.6 g without strap, 1.32\" 3000-nit AMOLED, 31 h accurate GPS, gait / running power / lactate threshold. I'd shortlist it versus Pace 4 and Forerunner 570 on price. I'd pause if 5 ATM or Zepp is the wrong stack.",
    summary:
      "Cheetah 2 Pro is not Balance 3 and not T-Rex 3 Pro. The job is road and race-week running: Zepp Coach 5K–marathon, finish prediction, gait and ground-contact tools, flashlight, 32GB maps. 20-day typical / 31 h accurate GPS / 15 h GPS+music / 69 h power-saving GPS. I'd shortlist it for runners who will actually use those metrics. I'd pause for Garmin dynamics with an HRM strap.",
    score: 84,
    fit: "48×48 mm Grade 5 titanium, 45.6 g without strap — lighter than Balance 3's 55 g titanium-black listing and far lighter than Galaxy Watch Ultra2's 61.5 g. 3000-nit AMOLED is the daylight story. Small wrists that bounced off T-Rex's 48 mm rugged bezel may still like this rounder runner case; it is not Watch9's 40 mm.",
    gps: "Dual-band GNSS with 32GB offline maps and a flashlight is the navigation pack. Accurate GPS is listed at 31 hours — shorter than Balance 3's 41 h accuracy figure, longer than any Samsung GPS hour we can publish (those remain unpublished). Map polish still trails Fenix/Apex; it is a real step up from Active 2's no-maps GPS.",
    battery: "Typical 20 days, accurate GPS 31 h, GPS+music 15 h, power-saving GPS 69 h. Music on the 32GB store is the tax versus MIP Pace 4 weeks. This is a training-week battery, not an Enduro multi-day claim.",
    training: "Zepp Coach covers 5K through marathon with lactate threshold, running power, gait, ground-contact and finish prediction — the reason this SKU exists instead of Balance 3's HYROX hybrid. Recovery and sleep scores are present; Garmin training readiness and HRM-strap running dynamics are not.",
    value: "US list $449.99 (~€449 seed). More than Balance 3, still under Forerunner 970 / Pace Pro flagship money. Worth it when gait/power/Coach are weekly tools; otherwise Balance 3 or Pace 4 is the cleaner spend.",
    extraSections: [
      {
        id: "sec-runner-metrics",
        heading: "Runner metrics",
        body: "Lactate-threshold pace, running power, gait and finish prediction are the Cheetah 2 Pro shopping trigger. Balance 3 does hybrid load and HYROX; T-Rex 3 Pro does rugged adventure. If you will not look at those runner fields weekly, you are paying titanium money for a Zepp daily that Pace 4 or Forerunner 570 may cover with a better ecosystem.",
        evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      },
      {
        id: "sec-limits",
        heading: "What 5 ATM and Zepp mean",
        body: "5 ATM is not Balance 3 / Ultra2's 10 ATM. Payments are not documented. Zepp is the app — no Connect IQ, no Galaxy Watch faces from the Play store. That is acceptable on a runner-first watch; it is a hard skip if your HRM, bike sensors and coaching already live in Garmin.",
        evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      },
    ],
    pros: [
      "45.6 g Grade 5 titanium runner chassis",
      "Zepp Coach 5K–marathon plus gait, running power and lactate threshold",
      "Dual-band GNSS, 32GB maps, 3000-nit AMOLED, 31 h accurate GPS",
    ],
    cons: [
      "5 ATM; payments not documented",
      "Zepp, not Garmin Connect or COROS Training Hub",
      "Accurate GPS hours trail Balance 3's 41 h claim",
    ],
    buy: [
      "You want a titanium AMOLED runner with gait, running power and 5K–marathon Zepp Coach and you will not pay Forerunner 970 or Pace Pro money for those fields.",
      "You compared Pace 4 and Forerunner 570 and prefer Amazfit maps-plus-metrics at ~€449 over joining a new Garmin/COROS ecosystem.",
      "You already own a T-Rex or Active 2 and the missing piece is runner-first coaching, not rugged adventure or a first GPS.",
    ],
    avoid: [
      "Hybrid gym/HYROX weeks are the buy — that is Balance 3, not this Cheetah.",
      "You need Garmin running dynamics with a chest strap, TopoActive, or 10 ATM swim/adventure duty.",
      "MIP ultra battery or a compact 40 mm daily is the constraint — Pace 4 / Enduro or Watch9 fit those jobs.",
    ],
    alts: ["prod-coros-pace-4", "prod-forerunner-570", "prod-amazfit-balance-3"],
    scores: [
      { key: "training", label: "Running metrics", score: 86 },
      { key: "weight", label: "Weight & Comfort", score: 90 },
      { key: "gps", label: "GPS & Maps", score: 84 },
      { key: "value", label: "Value for Money", score: 80 },
      { key: "ecosystem", label: "Ecosystem", score: 70 },
    ],
  }),
  watchResearchReview({
    id: "review-samsung-galaxy-watch-ultra-2",
    slug: "samsung-galaxy-watch-ultra-2",
    productId: "prod-samsung-galaxy-watch-ultra-2",
    title: "Samsung Galaxy Watch Ultra2 Review",
    subtitle: "2026 titanium Wear OS adventure watch — 5000 nits, L1+L5, Running Coach.",
    bottomLine:
      "Buy Galaxy Watch Ultra2 when you already live on a Galaxy phone and want the current 47 mm titanium Wear OS ultra with 5000-nit AMOLED, L1+L5 GPS and Running Coach; skip it on iPhone, when unpublished GPS hours scare you, or when Fenix 8 / Apple Watch Ultra 3 is the ecosystem you actually use.",
    verdict:
      "Current Samsung adventure smartwatch, not a MIP endurance trainer. 61.5 g, 1.52\" Super AMOLED to 5000 nits, Snapdragon Wear Elite, 800 mAh, IP69K / 10 ATM, 64GB. I'd shortlist it for Galaxy athletes replacing Ultra 2025. I'd pause if dedicated GPS hours (unpublished) or Garmin coaching are the purchase reason.",
    summary:
      "Ultra2 is the July 2026 Unpacked successor to Galaxy Watch Ultra 2025 — still 47 mm titanium, now 61.5 g with a brighter 1.52\" panel and 800 mAh. Smartwatch usage is claimed up to 60 hours always-on. We do not invent GPS hours. I'd shortlist it versus Apple Watch Ultra 3 for Android. I'd pause versus Fenix 8 when maps and training science are the week.",
    score: 81,
    fit: "47 mm titanium with an olive Marine Band in the official packshot — flagship presence, 61.5 g. Heavier than Cheetah 2 Pro (45.6 g) and Watch9 40 mm (31.5 g). If Ultra 2025 already fit, this is the same class. Small wrists that bounced off Ultra 2025 will bounce here too; Watch9 is the compact Galaxy.",
    gps: "L1+L5 dual-frequency GPS is published. Offline maps and navigation sit in Wear OS / Samsung's sport stack. Dedicated GPS endurance hours are not on the spec sheet we used — unlike Ultra 2025's ~48 h exercise power-saving claim, we leave batteryGps null rather than guess. Dual-band positioning is the trail/road argument; it is not Enduro solar.",
    battery: "800 mAh and up to 60 hours always-on is the smartwatch figure (~2.5 days). That is a daily-charge or every-other-day Wear OS watch, not a 21-day Amazfit or Enduro MIP week. Do not plan a mountain ultra on unpublished GPS hours.",
    training: "Running Coach and Galaxy Health / BioActive ECG are the training story. Wear OS apps and Samsung Pay are the lifestyle extras Ultra 2025 buyers already expect. This is still not Garmin training readiness, running dynamics with an HRM-Pro, or COROS Training Hub.",
    value: "US list $699.99 (~€699 seed). Above Ultra 2025's €649 seed and well above Watch9's $379. Pay it when the 5000-nit rugged Wear OS chassis is the point; Watch9 is the cheaper Galaxy runner and Fenix 8 is the outdoor-science spend.",
    extraSections: [
      {
        id: "sec-vs-ultra-2025",
        heading: "Ultra2 vs Ultra 2025",
        body: "Ultra 2025 remains in this catalog as still sold. Ultra2 is the current Unpacked chassis: 1.52\" / 5000 nits, 800 mAh, 61.5 g, Snapdragon Wear Elite. If you already own Ultra 2025 and the 48 h exercise-GPS claim is why you bought it, Ultra2 does not automatically replace that number — Samsung has not given us a matching GPS-hour figure to publish.",
        evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      },
      {
        id: "sec-android-lock",
        heading: "Android lock-in",
        body: "Best experience is Galaxy phone + Wear OS. iPhone users should shop Apple Watch Ultra 3. Dedicated run coaches who do not need Samsung Pay or Watch faces should still compare Fenix 8 and Forerunner 970 before paying ultra-smartwatch money.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    pros: [
      "47 mm titanium, 5000-nit Super AMOLED, IP69K / 10 ATM",
      "L1+L5 dual GPS, 64GB, Running Coach, Samsung Pay",
      "Current Galaxy adventure Wear OS for Android athletes",
    ],
    cons: [
      "Dedicated GPS hours unpublished",
      "Smartwatch battery ~60 h AOD — not MIP ultra endurance",
      "Galaxy/Android lock-in; premium versus Watch9",
    ],
    buy: [
      "You wear a Galaxy phone and want the current titanium Wear OS ultra with 5000-nit AMOLED, L1+L5 GPS and Running Coach rather than last year's Ultra 2025.",
      "You compared Apple Watch Ultra 3 and need Android notifications, Samsung Pay and Watch apps — not an iPhone-only adventure watch.",
      "You want a rugged 10 ATM / IP69K sport smartwatch and accept that Garmin still wins long GPS weeks and periodization.",
    ],
    avoid: [
      "You are on iPhone — Apple Watch Ultra 3 is the honest peer, not a Galaxy Watch.",
      "Unpublished GPS hours or multi-day MIP battery is the shopping trigger — Enduro 3, Vertix 2S or Fenix 8.",
      "You mainly need a compact daily runner — Watch9 is the 31.5 g Galaxy, Forerunner 165 the beginner Garmin.",
    ],
    alts: ["prod-apple-watch-ultra-3", "prod-fenix-8", "prod-samsung-galaxy-watch-ultra"],
    scores: [
      { key: "display", label: "Display & build", score: 92 },
      { key: "ecosystem", label: "Android ecosystem", score: 92 },
      { key: "gps", label: "GPS (dual-band)", score: 86 },
      { key: "battery", label: "Battery (claimed)", score: 64, note: "GPS hours unpublished" },
      { key: "value", label: "Value for Money", score: 66 },
    ],
  }),
  watchResearchReview({
    id: "review-samsung-galaxy-watch-9",
    slug: "samsung-galaxy-watch-9",
    productId: "prod-samsung-galaxy-watch-9",
    title: "Samsung Galaxy Watch9 Review",
    subtitle: "Compact 40 mm Wear OS daily — dual GPS, not an ultra trainer.",
    bottomLine:
      "Buy Galaxy Watch9 when a Galaxy phone plus a 31.5 g 40 mm Wear OS daily with dual GPS, NFC and Running Coach is the whole job; skip it when you need published GPS hours, maps-first trail tools, or a 47 mm Ultra2 adventure chassis.",
    verdict:
      "Current Galaxy daily runner, not Watch Ultra2. 40 mm / 31.5 g / 1.3\" / 390 mAh, up to 40 h AOD off / 30 h AOD on, dual GPS, 5 ATM, ECG. I'd shortlist it versus Forerunner 165 and Vivoactive 6 for Galaxy users. I'd pause if daily charging or missing Garmin coaching is a problem.",
    summary:
      "Watch9 is the 2026 compact Wear OS watch we actually put in Running GPS discovery — Watch FE is lifestyle, Watch8 is discontinued. Primary SKU is 40 mm; 44 mm / 34 g / 445 mAh is the larger variant. I'd shortlist it for notifications-plus-easy-miles. I'd pause versus Ultra2 when rugged 10 ATM and 5000 nits are the buy.",
    score: 76,
    fit: "40 mm / 31.5 g is the small-wrist Galaxy — a different last from Ultra2's 47 mm / 61.5 g. The 44 mm / 34 g / 445 mAh variant exists if you want more screen. Sport Black packshot is a round Wear OS case, not a titanium ultra bezel. Easy daily wear; not a 21-day Amazfit.",
    gps: "Dual-frequency GPS is listed. Offline topo maps are not the brief — Wear OS / phone-assisted navigation, unlike Balance 3's 64GB contour maps or Ultra2's adventure mapping stack. Dedicated GPS hours are unpublished; we do not copy Ultra 2025's 48 h figure onto this SKU.",
    battery: "Up to 40 hours AOD off / 30 hours AOD on. That is a nightly charge for most runners. Fine for a 10K or half if you start full; a poor tool for a mountain weekend. Ultra2's 60 h AOD-on claim is the step up inside Samsung, still not Amazfit typical-use weeks.",
    training: "Galaxy Health, Running Coach, ECG, SpO2, NFC payments and onboard music are the daily-athlete pack. No Garmin running dynamics, no Zepp gait/power. Fine for first 5K–half structure; shallow if you already live in Forerunner training readiness.",
    value: "US Bluetooth $379.99 (~€379 seed). Below Ultra2's $699 and above Forerunner 165's beginner Garmin money. Pay it for Wear OS on a Galaxy phone; do not pay it as a substitute for Pace 4 or Forerunner 570.",
    extraSections: [
      {
        id: "sec-why-watch9",
        heading: "Why Watch9 and not Watch FE",
        body: "Watch FE is a lifestyle/budget Galaxy, not a Running GPS discovery SKU. Watch8 was discontinued 22 July 2026. Watch9 is the current compact dual-GPS Wear OS watch that belongs next to Ultra 2025 / Ultra2. Classic and LTE SKUs are regional duplicates, not separate catalog products here.",
        evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      },
      {
        id: "sec-charge-cadence",
        heading: "Charging vs dedicated run watches",
        body: "30–40 hour smartwatch claims mean you plan a charger, not a GPS mode. Forerunner 165, Pace 4 and Active 2 all advertise multi-day GPS-class figures. Watch9 wins notifications, Pay and apps; it loses the 'forget the charger until Sunday' argument.",
        evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      },
    ],
    pros: [
      "31.5 g / 40 mm Wear OS daily with dual GPS and Samsung Pay",
      "Running Coach + Galaxy Health for Android athletes",
      "Honest compact alternative to Ultra2's 47 mm adventure chassis",
    ],
    cons: [
      "30–40 hour typical use — nightly charging",
      "GPS hours unpublished; no offline topo pack like Balance 3",
      "Not a Garmin/COROS training platform",
    ],
    buy: [
      "You run on a Galaxy phone and want a 40 mm Wear OS watch with dual GPS, NFC and Running Coach rather than a 47 mm Ultra2 on your wrist.",
      "You compared Forerunner 165 and Vivoactive 6 and would rather keep Galaxy Health / Watch apps than join Garmin Connect for a first 5K–half.",
      "Notifications, Samsung Pay and a light daily are the week — not maps, MIP battery or titanium adventure chrome.",
    ],
    avoid: [
      "You need published GPS hours, offline contour maps or a charger-free training week — Forerunner 165, Pace 4 or Balance 3.",
      "You want the rugged 10 ATM / 5000-nit adventure Galaxy — that is Ultra2, not Watch9.",
      "iPhone is your phone — Series 10 / Ultra 3, not a Galaxy Watch.",
    ],
    alts: ["prod-forerunner-165", "prod-vivoactive-6", "prod-samsung-galaxy-watch-ultra-2"],
    scores: [
      { key: "weight", label: "Weight & Comfort", score: 92 },
      { key: "ecosystem", label: "Android ecosystem", score: 90 },
      { key: "usability", label: "Usability", score: 88 },
      { key: "battery", label: "Battery (claimed)", score: 58 },
      { key: "value", label: "Value for Money", score: 74 },
    ],
  }),
];
