import type { Review, ScoreBreakdownItem, ContentSection } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const author = "author-kitletics-editorial" as const;
const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;

type Draft = {
  id: string;
  slug: string;
  productId: string;
  title: string;
  subtitle: string;
  bottomLine: string;
  verdict: string;
  summary: string;
  score: number;
  ride: string;
  fit: string;
  value: string;
  cushioning?: string;
  stability?: string;
  durability?: string;
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

function researchReview(d: Draft): Review {
  const evidenceIds = d.evidenceIds ?? [...ev];
  // Draft helper is shoe-oriented historically. Watch/HRM drafts still pass
  // `ride`/`fit` notes — map ride → performance (never publish a "Ride" heading).
  const isWatchDraft =
    /forerunner|fenix|enduro|coros|suunto|polar|garmin|amazfit|apple-watch|galaxy-watch|pace-|vertix|apex|pacer|vantage|instinct|epix|vivoactive|hrm|tickr|oh1|verity|wahoo|coospo|magene/i.test(
      `${d.slug} ${d.productId} ${d.title}`,
    );
  const sections: ContentSection[] = [
    {
      id: "sec-fit",
      heading: isWatchDraft ? "On-wrist comfort" : "Fit & Comfort",
      body: d.fit,
      evidenceIds,
    },
  ];
  if (isWatchDraft) {
    sections.push({
      id: "sec-performance",
      heading: "Everyday performance",
      body: d.ride,
      evidenceIds,
    });
  } else {
    sections.push({
      id: "sec-ride",
      heading: "Ride",
      body: d.ride,
      evidenceIds,
    });
  }
  if (d.cushioning) {
    sections.push({
      id: "sec-cushioning",
      heading: "Cushioning",
      body: d.cushioning,
      evidenceIds,
    });
  }
  if (d.stability) {
    sections.push({
      id: "sec-stability",
      heading: "Stability",
      body: d.stability,
      evidenceIds,
    });
  }
  if (d.durability) {
    sections.push({
      id: "sec-durability",
      heading: "Durability",
      body: d.durability,
      evidenceIds,
    });
  }
  sections.push({
    id: "sec-value",
    heading: "Value",
    body: d.value,
    evidenceIds: ["ev-catalog-editorial"],
  });
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
      "We put this guide together from published specs and similar products. We have not personally tested this product unless the page says we did. Affiliate links do not change the verdict.",
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
    seoTitle: `${d.title}: Performance, Fit & Verdict | Kitletics`,
    seoDescription: `Honest buying guide to ${d.title.replace(/ Review$/, "")} — fit, ride, who it’s for, trade-offs and current prices.`,
    ...pub,
  };
}

/** Hero running shoes + GPS watches — densifies /reviews beyond the original 3 published reviews. */
export const reviewsWave1: Review[] = [
  researchReview({
    id: "review-ghost-18",
    slug: "brooks-ghost-18",
    productId: "prod-ghost-18",
    title: "Brooks Ghost 18 Review",
    subtitle: "A smooth, reliable daily trainer for easy and long road miles.",
    bottomLine:
      "Ghost 18 remains a default daily pick when you want predictable cushion and a smooth ride — not bounce-first max foam or a race plate.",
    verdict:
      "Choose Ghost 18 for dependable neutral daily training. Skip it if you want supershoe snap or dedicated stability geometry.",
    summary:
      "Soft neutral daily trainer with broad width options for beginners and high-mileage road runners. Here's a practical take on the Brooks Ghost 18 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want beginner-friendly, excellent width range or smooth easy-mile ride. I'd pause if higher drop or less energetic than Novablast-class shoes would show up often in your week. Ghost 18 remains a default daily pick when you want predictable cushion and a smooth ride — not bounce-first max foam or a race plate.",
    score: 86,
    ride: "Category coverage describes a smooth, protective daily ride aimed at easy and long asphalt miles. DNA LOFT v3 is positioned for soft landings without the trampoline feel of some ASICS or HOKA max-stack trainers. Expect composure over flash — runners chasing plate-like pop should look to Endorphin Speed or Boston instead.",
    fit: "Ghost typically runs true-to-size with a secure midfoot and approachable toe box. Brooks’ width ladder (including 2E/4E on many colourways) is a practical advantage versus narrower daily trainers. Confirm fit in person when possible, especially if you sit between sizes.",
    value: "Value is strongest for high-mileage road runners who will use one shoe across easy days. When discounted prior Ghost generations undercut it; buy 18 when you want the current foam and upper updates rather than last year’s clearance.",
    pros: [
      "Smooth protective daily ride",
      "Strong width option availability",
      "Reliable easy/long-run companion",
      "Approachable for newer road runners",
    ],
    cons: [
      "Less energetic than max-bounce dailies",
      "Not a race-day supershoe",
      "Neutral — not a stability shoe",
    ],
    buy: [
      "You want a dependable neutral daily for easy and long road miles — Ghost is the smooth Brooks default, not a bounce-first max foam",
      "You need wider width options (2E/4E) that Nike and many race lasts do not cover as well",
      "You prefer predictable cushion over Novablast-style trampoline or Endorphin Speed snap",
    ],
    avoid: [
      "You're shopping only for a plated racer — look at Endorphin Speed or Vaporfly instead of forcing Ghost to race",
      "You need dedicated stability guidance — Adrenaline GTS or Kayano fit that job better",
      "Your week is technical trail — Ghost is a road daily, not a Speedgoat/Peregrine tool",
    ],
    alts: ["prod-novablast-6", "prod-clifton-10", "prod-pegasus-42"],
    scores: [
      { key: "cushioning", label: "Cushioning", score: 88 },
      { key: "ride", label: "Ride & Energy", score: 84 },
      { key: "comfort", label: "Fit & Comfort", score: 90 },
      { key: "stability", label: "Stability", score: 80, note: "Neutral platform" },
      { key: "durability", label: "Durability", score: 86, note: "Research estimate" },
      { key: "value", label: "Value for Money", score: 85 },
      { key: "versatility", label: "Versatility", score: 88 },
    ],
  }),
  researchReview({
    id: "review-clifton-10",
    slug: "hoka-clifton-10",
    productId: "prod-clifton-10",
    title: "HOKA Clifton 10 Review",
    subtitle: "Light max-cushion daily miles with HOKA’s classic rocker.",
    bottomLine:
      "Clifton 10 is the light-feeling HOKA daily when you want stack and rocker without Bondi’s max plush — skip it for aggressive race days.",
    verdict:
      "Best as an easy/long road shoe for runners who like HOKA geometry. Not a stability trainer or trail shoe.",
    summary:
      "Lightweight max-cushion neutral daily trainer with HOKA’s signature rockered geometry. Here's a practical take on the HOKA Clifton 10 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want light for the stack or smooth rocker. I'd pause if fit can run short or less energetic than PEBA trainers would show up often in your week. Clifton 10 is the light-feeling HOKA daily when you want stack and rocker without Bondi’s max plush — skip it for aggressive race days.",
    score: 88,
    ride: "Expect a soft, early-rocker road ride aimed at smooth transitions on easy paces. Clifton is typically lighter-feeling than Bondi while remaining protective. Firm-ground runners may find the stack tall; supershoe shoppers will want Vaporfly/Alphafly instead.",
    fit: "HOKA dailies often run slightly short for some runners — many size up a half. The engineered mesh upper targets breathable lockdown for road use. Wide options exist on select colourways; confirm availability for your region.",
    value: "Strong value when you want one HOKA daily for volume. Bondi costs more for max plush; Ghost/Pegasus undercut on sale. Buy Clifton 10 for the current rocker and cushion balance, not solely on price.",
    pros: [
      "Protective yet relatively light daily stack",
      "Smooth rocker for easy miles",
      "Clear role versus Bondi’s max plush",
    ],
    cons: [
      "Fit can run short for some",
      "Not for technical trail",
      "Neutral only",
    ],
    buy: [
      "You like HOKA's early rocker for easy and long road days and want stack without Bondi's max plush",
      "You want a lighter-feeling max-cushion daily than Bondi while staying in the HOKA lane",
      "You're building a HOKA rotation where Clifton covers volume and a firmer shoe covers workouts",
    ],
    avoid: [
      "You need dedicated stability guidance — Clifton is neutral tall stack, not a GTS/Kayano tool",
      "You're shopping only for race-day snap — keep Vaporfly/Alphafly for that job",
      "Your primary surface is technical trail — Speedgoat or Peregrine fit that brief better",
    ],
    alts: ["prod-bondi-9", "prod-ghost-18", "prod-novablast-6"],
    scores: [
      { key: "cushioning", label: "Cushioning", score: 92 },
      { key: "ride", label: "Ride & Energy", score: 88 },
      { key: "comfort", label: "Fit & Comfort", score: 86 },
      { key: "stability", label: "Stability", score: 80, note: "Neutral platform" },
      { key: "value", label: "Value for Money", score: 84 },
      { key: "versatility", label: "Versatility", score: 86 },
      { key: "durability", label: "Durability", score: 82, note: "Research estimate" },
    ],
  }),
  researchReview({
    id: "review-pegasus-42",
    slug: "nike-pegasus-42",
    productId: "prod-pegasus-42",
    title: "Nike Pegasus 42 Review",
    subtitle: "Versatile workhorse daily trainer for mixed road weeks.",
    bottomLine:
      "Pegasus 42 is still the do-most-things Nike road shoe — capable, not the softest or the fastest in the line.",
    verdict:
      "Pick Pegasus 42 for mixed easy/tempo weeks. Choose Vomero for more plush or Vaporfly for race day.",
    summary:
      "Versatile ReactX daily trainer with a full-length Air Zoom unit for mixed-pace road miles. Here's a practical take on the Nike Pegasus 42 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want a true all-rounder that is widely available. Skip it if you need max cushion or a higher drop than many modern trainers. Pegasus 42 is still the do-most-things Nike road shoe — capable, not the softest or the fastest in the line.",
    score: 85,
    ride: "Independent and manufacturer materials place Pegasus as a firmer-than-max-cushion daily that can handle easy miles and some faster work. It will not match Vomero’s plush or Endorphin Speed’s snap, but it covers more of a mixed week than either extreme.",
    fit: "Typically true-to-size with a secure heel and familiar Nike last. Width options are more limited than Brooks Ghost. Sockliner and upper updates vary by colourway — try on when possible.",
    value: "Often one of the better price/performance Nike road options, especially on sale. Best value when it replaces two single-purpose shoes in a simple rotation.",
    pros: ["Versatile daily/workout role", "Widely available", "Familiar Nike fit for many"],
    cons: ["Not max plush", "Not a race plate shoe", "Narrower width story than Ghost"],
    buy: [
      "You need one Nike road shoe for mixed easy and some faster work — Pegasus covers more of the week than Vomero or Vaporfly alone",
      "You want familiar Nike fit and availability more than Brooks' width ladder or HOKA rocker",
      "You're keeping a simple rotation and want the workhorse daily, not a soft recovery specialist",
    ],
    avoid: [
      "You want max plush easy miles — Vomero, Glycerin, or Bondi will feel more protective",
      "You're shopping only for race day — Vaporfly or Alphafly is the right Nike lane",
      "You need wide widths as a must-have — Ghost or Glycerin usually serve that better",
    ],
    alts: ["prod-vomero-18", "prod-ghost-18", "prod-ride-18"],
    scores: [
      { key: "versatility", label: "Versatility", score: 92 },
      { key: "ride", label: "Ride & Energy", score: 84 },
      { key: "cushioning", label: "Cushioning", score: 82 },
      { key: "value", label: "Value for Money", score: 88 },
      { key: "comfort", label: "Fit & Comfort", score: 84 },
      { key: "stability", label: "Stability", score: 80, note: "Neutral platform" },
      { key: "durability", label: "Durability", score: 86, note: "Research estimate" },
    ],
  }),
  researchReview({
    id: "review-glycerin-22",
    slug: "brooks-glycerin-22",
    productId: "prod-glycerin-22",
    title: "Brooks Glycerin 22 Review",
    subtitle: "Soft premium daily cushion for easy and recovery road miles.",
    bottomLine:
      "Glycerin 22 is Brooks’ plush daily lane — choose it over Ghost when soft protection matters more than a firmer smooth ride.",
    verdict:
      "Best for easy/recovery road volume. Not a tempo plate shoe or trail option.",
    summary:
      "Plush nitrogen-infused daily trainer for comfort-first easy and long road runs. Here's a practical take on the Brooks Glycerin 22 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want very plush underfoot or strong width offering. I'd pause if heavier feel or not lively for workouts would show up often in your week. Glycerin 22 is Brooks’ plush daily lane — choose it over Ghost when soft protection matters more than a firmer smooth ride.",
    score: 83,
    ride: "Expect a softer, more protective platform than Ghost, aimed at easy days and longer recovery efforts. It will feel less lively than Novablast or Endorphin Speed. Runners who want ground feel may prefer a lower-stack daily.",
    fit: "Brooks width options remain a strength. Glycerin often suits runners who want a roomier, cushioned daily fit. Confirm sizing against Ghost if you already know that last.",
    value: "Premium pricing versus Ghost — justified when you specifically want the softer stack. Otherwise Ghost or a sale Clifton may deliver better value.",
    pros: ["Soft protective cushion", "Brooks width ladder", "Clear easy-day role"],
    cons: ["Higher price than Ghost", "Less energetic for workouts", "Road-only brief"],
    buy: [
      "You want Brooks' plush easy/recovery lane and will take Glycerin soft over Ghost's firmer smooth ride",
      "Most of your week is easy volume between hard sessions and you want protective cushioning",
      "You need Brooks width options with a softer stack than Ghost",
    ],
    avoid: [
      "Your primary purchase is tempo or race snap — Endorphin Speed or a plated racer fits better",
      "You're hunting the cheapest capable daily — Ghost or a sale Clifton usually wins on value",
      "You want one shoe for every pace — Glycerin is deliberately soft for easy days",
    ],
    alts: ["prod-ghost-18", "prod-bondi-9", "prod-clifton-10"],
    scores: [
      { key: "cushioning", label: "Cushioning", score: 94 },
      { key: "comfort", label: "Fit & Comfort", score: 90 },
      { key: "ride", label: "Ride & Energy", score: 80 },
      { key: "stability", label: "Stability", score: 78, note: "Neutral platform" },
      { key: "durability", label: "Durability", score: 82, note: "Research estimate" },
      { key: "value", label: "Value for Money", score: 78 },
      { key: "versatility", label: "Versatility", score: 82 },
    ],
  }),
  researchReview({
    id: "review-superblast-2",
    slug: "asics-superblast-2",
    productId: "prod-superblast-2",
    title: "ASICS SUPERBLAST 2 Review",
    subtitle: "Max-stack super trainer for long runs and faster endurance work.",
    bottomLine:
      "SUPERBLAST 2 is the long-run / endurance-session ASICS when you want race-adjacent stack without a full race-day supershoe brief.",
    verdict:
      "Excellent for long road efforts and marathon training blocks. Overkill as a pure easy jogger for some; not a trail shoe.",
    summary:
      "Max-stack neutral super trainer for long runs and faster endurance sessions. Here's a practical take on the ASICS SUPERBLAST 2 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want huge protective stack or surprisingly lively for the height. I'd pause if tall ride can feel unstable for some or premium price would show up often in your week. SUPERBLAST 2 is the long-run / endurance-session ASICS when you want race-adjacent stack without a full race-day supershoe brief.",
    score: 91,
    ride: "Manufacturer and category coverage describe a tall, energetic platform that bridges daily protection and faster endurance paces. It is not as race-specific as Metaspeed or Vaporfly, but it is more ambitious than Novablast for long efforts.",
    fit: "Tall stack can change ankle feel versus lower dailies — try before racing. Engineered mesh targets lockdown for road volume. Width options may be narrower than Ghost.",
    value: "Premium price matches the super-trainer positioning. Best value for runners who will use the stack for long runs weekly, not as a closet race shoe.",
    pros: ["Long-run protection with energy", "Clear role above Novablast", "Strong marathon-block tool"],
    cons: ["Premium price", "Tall for some easy jogs", "Road-focused"],
    buy: [
      "You need one long-run/marathon-training shoe with more protective energy than a soft daily alone",
      "You've outgrown plush dailies on long days and want Superblast's long-effort role",
      "You're pairing a daily trainer with a long-run specialist rather than racing in a daily",
    ],
    avoid: [
      "You only want a budget easy-day shoe — Novablast or Ghost usually cover that cheaper",
      "Your miles are technical trail — this is a road long-run tool",
      "You need a full carbon race-day shoe — Metaspeed or Vaporfly sit in that lane",
    ],
    alts: ["prod-novablast-6", "prod-endorphin-speed-5", "prod-vaporfly-4"],
    scores: [
      { key: "cushioning", label: "Cushioning", score: 95 },
      { key: "ride", label: "Ride & Energy", score: 92 },
      { key: "versatility", label: "Versatility", score: 88 },
      { key: "value", label: "Value for Money", score: 82 },
      { key: "comfort", label: "Fit & Comfort", score: 86 },
      { key: "stability", label: "Stability", score: 78, note: "Neutral platform" },
      { key: "durability", label: "Durability", score: 80, note: "Research estimate" },
    ],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial", "ev-novablast-6-mfr"],
  }),
  researchReview({
    id: "review-vomero-18",
    slug: "nike-vomero-18",
    productId: "prod-vomero-18",
    title: "Nike Vomero 18 Review",
    subtitle: "Plush Nike daily cushion for easy and recovery road miles.",
    bottomLine:
      "Vomero 18 is Nike’s soft daily lane — pick it over Pegasus when plush protection matters more than mixed-week firmness.",
    verdict:
      "Best for easy/recovery volume in a Nike rotation. Not the workout shoe or race shoe.",
    summary:
      "Plush dual-density ZoomX and ReactX daily trainer for easy and recovery road miles. Here's a practical take on the Nike Vomero 18 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want soft protective daily ride or clear Pegasus complement. I'd pause if less snappy for workouts or can feel soft underfoot for some would show up often in your week. Vomero 18 is Nike’s soft daily lane — pick it over Pegasus when plush protection matters more than mixed-week firmness.",
    score: 84,
    ride: "Expect a softer, more protective ride than Pegasus, aimed at easy days. It will not replace Vaporfly on race day or Endorphin Speed on tempo days.",
    fit: "Nike last familiarity helps many runners. As with Pegasus, width options are more limited than Brooks. Confirm stack height comfort if you are new to max-cushion Nike dailies.",
    stability:
      "Neutral max-cushion daily — not a guidance shoe. Tall soft foam can feel less planted than Pegasus; if you need medial support, look at Structure or a Brooks GTS instead of forcing Vomero to do that job.",
    durability:
      "I'd rotate Vomero with a firmer daily. Soft ZoomX/ReactX stacks feel great early, then go flatter sooner than Pegasus if you hammer every easy mile in the same pair — retire when the ride goes dead, not when the upper still looks fine.",
    value: "Usually priced above Pegasus — worth it when soft easy miles are the job. Otherwise Pegasus or Ghost may be better value.",
    pros: ["Soft Nike daily cushion", "Clear easy-day role", "Pairs well with a firmer workout shoe"],
    cons: ["Pricier than Pegasus", "Not for tempo/race", "Limited widths"],
    buy: [
      "You already run Nike (or want a Nike lane) and need a soft easy/recovery shoe beside a firmer daily like Pegasus — plush ZoomX/React for volume, not mixed-week firmness",
      "Most of your week is easy and long road miles and you want max-cushion protection more than a do-everything trainer",
      "You're building a two-shoe setup: Vomero for easy days, plus a dedicated tempo or race shoe for workouts",
    ],
    avoid: [
      "You want one shoe for easy, tempo, and race — Vomero stays soft on purpose and won't give Endorphin Speed or Vaporfly snap",
      "You need stability guidance — this is a tall neutral stack; look at Structure, Kayano, or Adrenaline GTS instead",
      "You need a wide last or trail grip — Nike's width story is thinner than Brooks, and this outsole is road-only",
    ],
    alts: ["prod-pegasus-42", "prod-glycerin-22", "prod-clifton-10"],
    scores: [
      { key: "cushioning", label: "Cushioning", score: 92 },
      { key: "comfort", label: "Fit & Comfort", score: 88 },
      { key: "ride", label: "Ride & Energy", score: 82 },
      { key: "stability", label: "Stability", score: 78, note: "Neutral platform" },
      { key: "durability", label: "Durability", score: 82, note: "Research estimate" },
      { key: "value", label: "Value for Money", score: 80 },
      { key: "versatility", label: "Versatility", score: 80 },
    ],
  }),
  researchReview({
    id: "review-endorphin-speed-5",
    slug: "saucony-endorphin-speed-5",
    productId: "prod-endorphin-speed-5",
    title: "Saucony Endorphin Speed 5 Review",
    subtitle: "Nylon-plated tempo trainer for workouts and faster long runs.",
    bottomLine:
      "Speed 5 is the workout/tempo Saucony when you want plate pop without full race-day carbon cost and stiffness.",
    verdict:
      "Excellent tempo and threshold tool. Too aggressive as a pure recovery shoe for many; not a trail option.",
    summary:
      "Nylon-plated tempo shoe for workouts, faster long runs, and accessible race efforts. Here's a practical take on the Saucony Endorphin Speed 5 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want versatile plated workout shoe or strong race/training crossover. I'd pause if overkill for easy recovery jogs or firmera than daily trainers would show up often in your week. Speed 5 is the workout/tempo Saucony when you want plate pop without full race-day carbon cost and stiffness.",
    score: 91,
    ride: "Category coverage places Speed as lively and rockered for faster sessions, with more daily forgiveness than a pure race shoe. It sits between Ride (daily) and Endorphin Pro (race) in the Endorphin ladder.",
    fit: "Typically true-to-size with a performance lockdown. Some runners find the fit race-adjacent — try before key workouts. Not a max-width last.",
    value: "Strong value versus carbon race shoes if most of your fast miles are workouts, not races. Buy when the plate will see weekly use.",
    pros: ["Tempo/workout snap", "Clear Endorphin ladder role", "Faster long-run capability"],
    cons: ["Aggressive for easy jogs", "Not max cushion", "Road-focused"],
    buy: [
      "You need a dedicated workout/tempo shoe with plate pop without full race-day carbon cost",
      "Half and marathon training includes weekly threshold work that a soft daily will blunt",
      "You're building an Endorphin ladder: Ride/Ghost for easy, Speed for workouts, Pro for race day",
    ],
    avoid: [
      "You only want soft recovery miles — Triumph, Ghost, or Vomero fit that job better",
      "Your primary surface is trail — keep Peregrine or Speedgoat for that",
      "You want one shoe for every pace including easy recovery — Speed is intentionally lively",
    ],
    alts: ["prod-boston-12", "prod-superblast-2", "prod-ride-18"],
    scores: [
      { key: "responsiveness", label: "Responsiveness", score: 94 },
      { key: "ride", label: "Ride & Energy", score: 92 },
      { key: "versatility", label: "Versatility", score: 86 },
      { key: "value", label: "Value for Money", score: 88 },
      { key: "cushioning", label: "Cushioning", score: 84 },
    ],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial", "ev-speed-editorial"],
  }),
  researchReview({
    id: "review-vaporfly-4",
    slug: "nike-vaporfly-4",
    productId: "prod-vaporfly-4",
    title: "Nike Vaporfly 4 Review",
    subtitle: "Carbon-plated race day shoe for road PRs.",
    bottomLine:
      "Vaporfly 4 is a race-day tool — not a daily trainer. Buy it for goal races, not easy miles.",
    verdict:
      "Strong road racing option in Nike’s plated lineup. Alphafly remains the more aggressive top-end alternative.",
    summary:
      "Lightweight carbon-plated ZoomX road racer for half and marathon race efforts. Here's a practical take on the Nike Vaporfly 4 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want a proven race platform or a lighter, sharper option than Alphafly for many. Skip it if most of your week is easy recovery miles. Vaporfly 4 is a race-day tool — not a daily trainer. Buy it for goal races, not easy miles.",
    score: 89,
    ride: "Expect aggressive, propulsive race geometry aimed at 5K–marathon road efforts. Soft dailies and workout shoes remain better for most training volume.",
    fit: "Performance race last — often snug. Many runners size carefully for race day. Not built for wide-foot comfort as a priority.",
    value: "High cost per wear unless race day is the job. Best value for athletes racing often enough to amortise the plate.",
    pros: ["Race-day propulsion", "Proven Vaporfly lineage", "Clear racing role"],
    cons: ["Expensive", "Poor daily trainer", "Snug performance fit"],
    buy: [
      "You're chasing road PRs and will keep easy miles in a daily like Pegasus or Vomero",
      "You race often enough to amortise a carbon race shoe instead of racing in a trainer",
      "You want Nike's race lane without stepping all the way up to Alphafly cost and geometry",
    ],
    avoid: [
      "You want one shoe for easy, workout, and race — Vaporfly is a race-day tool only",
      "Your goal events are trail — this outsole and geometry are road-race focused",
      "Budget is tight and race day is rare — a workout shoe or sale previous Vaporfly may be enough",
    ],
    alts: ["prod-alphafly-3", "prod-endorphin-speed-5", "prod-superblast-2"],
    scores: [
      { key: "responsiveness", label: "Responsiveness", score: 96 },
      { key: "ride", label: "Ride & Energy", score: 94 },
      { key: "value", label: "Value for Money", score: 78 },
      { key: "cushioning", label: "Cushioning", score: 90 },
      { key: "versatility", label: "Versatility", score: 70, note: "Race-focused" },
    ],
  }),
  researchReview({
    id: "review-kayano-32",
    slug: "asics-gel-kayano-32",
    productId: "prod-kayano-32",
    title: "ASICS GEL-Kayano 32 Review",
    subtitle: "Stability daily trainer for guided road miles.",
    bottomLine:
      "Kayano 32 is the ASICS stability daily when you want guidance without a harsh post — not a neutral max-bounce shoe.",
    verdict:
      "Best for runners who need stability on easy/long road days. Neutral runners may prefer Novablast or Nimbus.",
    summary:
      "Max-cushion stability shoe with 4D GUIDANCE SYSTEM for controlled daily and long-run miles. Here's a practical take on the ASICS GEL-Kayano 32 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want trusted stability platform, wide width range or plush protection. I'd pause if heavier than neutral daily trainers or not built for fast intervals would show up often in your week. Kayano 32 is the ASICS stability daily when you want guidance without a harsh post — not a neutral max-bounce shoe.",
    score: 87,
    ride: "Expect a protective, guided platform for daily road volume. Less playful than Novablast; more structured than soft neutrals. Race plates and trail shoes sit outside the brief.",
    fit: "Often true-to-size with a secure midfoot. Wide options help many stability shoppers. Guidance systems can feel different if you are new to stability — try before committing.",
    value: "Premium stability pricing is fair when you need the guidance. Neutral runners overpaying for structure should look at Ghost or Novablast instead.",
    pros: ["Dedicated stability geometry", "Protective daily stack", "Wide options in catalog"],
    cons: ["Heavier/less lively than neutrals", "Not a race shoe", "Road-focused"],
    buy: [
      "You need guided stability on easy and long road volume — Kayano is ASICS' flagship support daily",
      "You're upgrading from an older Kayano and want the current guidance/foam package",
      "Wide options and a protective stack matter more to you than Novablast bounce",
    ],
    avoid: [
      "You're a happy neutral runner chasing bounce — Novablast or Nimbus fit better",
      "Your week is technical trail — Kayano is a road stability tool",
      "You want a race plate first — Metaspeed sits in that lane, not Kayano",
    ],
    alts: ["prod-adrenaline-gts-25", "prod-structure-26", "prod-nimbus-27"],
    scores: [
      { key: "stability", label: "Stability", score: 94 },
      { key: "cushioning", label: "Cushioning", score: 90 },
      { key: "comfort", label: "Fit & Comfort", score: 88 },
      { key: "ride", label: "Ride & Energy", score: 82 },
      { key: "value", label: "Value for Money", score: 84 },
    ],
  }),
  researchReview({
    id: "review-bondi-9",
    slug: "hoka-bondi-9",
    productId: "prod-bondi-9",
    title: "HOKA Bondi 9 Review",
    subtitle: "Max-plush HOKA daily for soft easy and recovery miles.",
    bottomLine:
      "Bondi 9 is HOKA’s softest daily statement — choose Clifton when you want a lighter rockered daily instead.",
    verdict:
      "Ideal for plush easy/recovery road miles. Too soft/tall for many workouts and races.",
    summary:
      "HOKA’s softest max-cushion road shoe for easy miles, recovery, and long protective days. Here's a practical take on the HOKA Bondi 9 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want maximum underfoot protection or meta-Rocker transitions. I'd pause if heavier than Clifton or too soft for speed work would show up often in your week. Bondi 9 is HOKA’s softest daily statement — choose Clifton when you want a lighter rockered daily instead.",
    score: 85,
    ride: "Expect maximum plush and a pronounced rocker for easy paces. It is not a tempo shoe. Some runners find the stack unstable at faster efforts — keep workouts in another model.",
    fit: "HOKA sizing quirks apply — many size up. Wide options help. The volume is generous compared with race lasts.",
    value: "Premium price for max cushion. Worth it when soft recovery is the job; otherwise Clifton or Ghost may suffice.",
    pros: ["Max plush protection", "Clear recovery/easy role", "Wide options"],
    cons: ["Heavy/tall for workouts", "Premium price", "Not versatile as a single shoe"],
    buy: [
      "You need HOKA's softest easy/recovery statement and will keep workouts in another shoe",
      "You want max stack plush more than Clifton's lighter rockered daily",
      "Recovery and easy volume are the job — not mixed-week firmness",
    ],
    avoid: [
      "You want one shoe for easy, tempo, and race — Bondi is too soft/tall for that mix",
      "You're shopping only for race day — Vaporfly or Alphafly belong there",
      "You prefer a lighter daily rocker — Clifton usually feels more usable mid-week",
    ],
    alts: ["prod-clifton-10", "prod-glycerin-22", "prod-nimbus-27"],
    scores: [
      { key: "cushioning", label: "Cushioning", score: 96 },
      { key: "comfort", label: "Fit & Comfort", score: 90 },
      { key: "ride", label: "Ride & Energy", score: 78 },
      { key: "stability", label: "Stability", score: 76, note: "Neutral max-stack platform" },
      { key: "value", label: "Value for Money", score: 80 },
      { key: "versatility", label: "Versatility", score: 74 },
      { key: "durability", label: "Durability", score: 84, note: "Research estimate" },
    ],
  }),
  researchReview({
    id: "review-speedgoat-6",
    slug: "hoka-speedgoat-6",
    productId: "prod-speedgoat-6",
    title: "HOKA Speedgoat 6 Review",
    subtitle: "Aggressive trail shoe for rocky and technical terrain.",
    bottomLine:
      "Speedgoat 6 is a trail tool with Vibram grip — not a road daily or race-road supershoe.",
    verdict:
      "Strong choice for technical trail. Wrong shoe for pure road mileage.",
    summary:
      "Aggressive Vibram-lugged trail shoe for technical terrain and longer mountain days. Here's a practical take on the HOKA Speedgoat 6 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want excellent trail grip or protective cushion for long efforts. I'd pause if overbuilt for easy road miles or can feel firm on hardpack would show up often in your week. Speedgoat 6 is a trail tool with Vibram grip — not a road daily or race-road supershoe.",
    score: 87,
    ride: "Expect protective trail cushion with a rocker that still works on mixed paths. Road-only runners will find the lug and stack unnecessary for asphalt.",
    fit: "Trail lasts can feel different from Clifton/Bondi — try on with trail socks. Secure midfoot matters on descents.",
    value: "Fair for dedicated trail athletes. Poor value if most miles stay on road.",
    pros: ["Vibram trail grip", "Protective trail stack", "Clear trail role"],
    cons: ["Not a road daily", "Lugs unnecessary on asphalt", "Fit needs trail-sock check"],
    buy: [
      "You run rocky or technical trail and need Vibram grip with HOKA trail cushion",
      "You're happy keeping pavement connectors in a separate road shoe like Clifton",
      "Descent security and lug bite matter more than a road-like soft ride",
    ],
    avoid: [
      "Your week is mostly smooth pavement — a road daily will feel more appropriate",
      "You're shopping track or road race shoes — Speedgoat is the wrong geometry",
      "You want a soft road-like trail cushion without aggressive lugs — look at less aggressive trail dailies",
    ],
    alts: ["prod-peregrine-15", "prod-lone-peak-8", "prod-sense-ride-5"],
    scores: [
      { key: "grip", label: "Grip", score: 94 },
      { key: "cushioning", label: "Cushioning", score: 88 },
      { key: "versatility", label: "Versatility", score: 78, note: "Trail-focused" },
      { key: "value", label: "Value for Money", score: 84 },
      { key: "comfort", label: "Fit & Comfort", score: 84 },
    ],
  }),
  researchReview({
    id: "review-alphafly-3",
    slug: "nike-alphafly-3",
    productId: "prod-alphafly-3",
    title: "Nike Alphafly 3 Review",
    subtitle: "Top-end Nike carbon racer with Zoom Air and ZoomX.",
    bottomLine:
      "Alphafly 3 is Nike’s race-day flagship — buy for goal marathons, not daily training.",
    verdict:
      "Aggressive race option above Vaporfly for athletes who want the full Alphafly platform. Overkill for casual racing.",
    summary:
      "Top-tier ZoomX carbon racer with Air Zoom units for marathon race-day performance. Here's a practical take on the Nike Alphafly 3 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want maximum race-day stack and pop or marathon specialist geometry. I'd pause if expensive or overkill for shorter / easy runs would show up often in your week. Alphafly 3 is Nike’s race-day flagship — buy for goal marathons, not daily training.",
    score: 86,
    ride: "More extreme race geometry than Vaporfly — aimed at goal road races. Training volume still belongs in dailies and workout shoes.",
    fit: "Race last and unique midsole shape — mandatory try-on before race day. Not a comfort-first fit.",
    value: "Highest Nike race price tier — only sensible if race performance is the purchase reason.",
    pros: ["Flagship race platform", "Clear marathon role", "Distinct from Vaporfly"],
    cons: ["Very expensive", "Not for training volume", "Fit learning curve"],
    buy: [
      "You're a serious marathon racer who wants Nike's flagship ZoomX/Zoom Air race platform",
      "You'll keep training volume in dailies and workouts and save Alphafly for goal races",
      "Vaporfly is not enough race geometry for you and you accept Alphafly's price and fit learning curve",
    ],
    avoid: [
      "You need a daily trainer — Alphafly is race-day only",
      "Budget race day is the constraint — Vaporfly or a workout plate usually serves better",
      "You want one shoe for every session — this platform will fight easy-day comfort",
    ],
    alts: ["prod-vaporfly-4", "prod-endorphin-pro-4", "prod-superblast-2"],
    scores: [
      { key: "responsiveness", label: "Responsiveness", score: 97 },
      { key: "ride", label: "Ride & Energy", score: 95 },
      { key: "value", label: "Value for Money", score: 72 },
      { key: "cushioning", label: "Cushioning", score: 92 },
      { key: "versatility", label: "Versatility", score: 65 },
    ],
  }),
  researchReview({
    id: "review-forerunner-970",
    slug: "garmin-forerunner-970",
    productId: "prod-forerunner-970",
    title: "Garmin Forerunner 970 Review",
    subtitle: "Premium AMOLED Forerunner for serious training and racing.",
    bottomLine:
      "Forerunner 970 is Garmin’s high-end running watch lane — choose Pace 3 / FR 165 when you want lighter cost and fewer features.",
    verdict:
      "Best for athletes who will use maps, training load and the brighter AMOLED daily. Overbuilt for GPS-only joggers.",
    summary:
      "AMOLED flagship running watch with full maps, ECG, multi-band GPS, and advanced training metrics. Here's a practical take on the Garmin Forerunner 970 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want full offline maps on a bright AMOLED, eCG and advanced running metrics with HRM 600 or complete Garmin training ecosystem. I'd pause if premium price or gPS-mode battery shorter than some MIP ultralight watches would show up often in your week. Forerunner 970 is Garmin’s high-end running watch lane — choose Pace 3 / FR 165 when you want lighter cost and fewer features.",
    score: 91,
    ride: "Expect a full training OS: structured workouts, recovery metrics, maps and multi-sport profiles. Battery claims are strong for the class but depend on GNSS and always-on display settings — treat manufacturer figures as best-case.",
    fit: "Standard Forerunner wrist fit with quick-release bands. Confirm case size comfort if coming from a smaller FR 165/255. Charging and sensor placement follow Garmin norms.",
    value: "Premium Garmin pricing. Worth it when you use maps and advanced metrics weekly; otherwise FR 570/265 or COROS Pace Pro may be better value.",
    pros: [
      "AMOLED Forerunner flagship feature set",
      "Deep training and recovery tools",
      "Strong Garmin ecosystem accessories",
    ],
    cons: [
      "Premium price",
      "Feature complexity for casual runners",
      "Battery depends heavily on settings",
    ],
    buy: [
      "You will actually use maps, training load, and AMOLED daily — not just GPS pace",
      "You're already in Garmin Connect and want the high-end Forerunner feature set",
      "Structured training and recovery metrics are weekly tools for you, not novelties",
    ],
    avoid: [
      "You only need GPS pace and battery — FR 165, Pace 3, or a simpler watch is better value",
      "You want an ultra-minimal watch with almost no menus — 970 is feature-dense on purpose",
      "You're not ready to learn Garmin's training ecosystem — the extra chrome will go unused",
    ],
    alts: ["prod-forerunner-965", "prod-coros-pace-pro", "prod-forerunner-570"],
    scores: [
      { key: "gps-accuracy", label: "GPS Accuracy", score: 92 },
      {
        key: "battery",
        label: "Battery",
        score: 88,
        note: "Settings-dependent — GNSS and always-on display matter",
      },
      { key: "maps", label: "Maps", score: 94 },
      { key: "training-features", label: "Training Features", score: 95 },
      { key: "recovery-features", label: "Recovery Features", score: 92 },
      { key: "interface", label: "Interface", score: 86 },
      { key: "smartwatch-features", label: "Smartwatch Features", score: 90 },
      { key: "value", label: "Value", score: 80 },
    ],
    evidenceIds: ["ev-fr970-mfr", "ev-catalog-editorial", "ev-catalog-mfr"],
  }),
  researchReview({
    id: "review-coros-pace-3",
    slug: "coros-pace-3",
    productId: "prod-coros-pace-3",
    title: "COROS Pace 3 Review",
    subtitle: "Lightweight GPS watch focused on battery and training essentials.",
    bottomLine:
      "Pace 3 is the lean endurance watch pick — choose Forerunner when you want denser smartwatch features and maps.",
    verdict:
      "Excellent for runners who prioritise weight and battery over full smartwatch chrome. Not the richest ecosystem watch.",
    summary:
      "Lightweight GPS watch with strong battery life. Here's a practical take on the COROS Pace 3 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want very light or excellent battery. I'd pause if smaller ecosystem than Garmin would show up often in your week. Pace 3 is the lean endurance watch pick — choose Forerunner when you want denser smartwatch features and maps.",
    score: 88,
    ride: "Expect a training-first interface with strong battery narratives and fewer lifestyle smartwatch extras than Apple Watch. Dual-frequency GNSS support is a headline accuracy feature on supported modes.",
    fit: "Light case and nylon/silicone band options suit all-day wear. Athletes with larger wrists may prefer Pace Pro / Apex sizing — try straps for comfort.",
    value: "Strong value versus premium Forerunners if you will not use maps and deep Garmin metrics. Buy into COROS when the training app workflow fits you.",
    pros: [
      "Light on-wrist feel",
      "Battery-focused design",
      "Competitive price vs flagship Garmin",
    ],
    cons: [
      "Leaner smartwatch feature set",
      "Smaller accessory ecosystem than Garmin",
      "Maps/navigation less central than FR 970",
    ],
    buy: [
      "You want a light GPS watch with long battery and are fine living in COROS training software",
      "You prioritise on-wrist weight and essentials over Forerunner maps and smartwatch chrome",
      "You're comparing Pace 3 vs FR 165 and will actually use COROS' training workflow weekly",
    ],
    avoid: [
      "You need full lifestyle smartwatch features — Apple Watch or a denser Garmin fits better",
      "You're locked into Garmin Connect accessories and coaching — switching ecosystems will frustrate you",
      "You want flagship maps and recovery depth like Forerunner 970 — Pace 3 is intentionally leaner",
    ],
    alts: ["prod-forerunner-165", "prod-coros-pace-pro", "prod-forerunner-265"],
    scores: [
      { key: "gps-accuracy", label: "GPS Accuracy", score: 88 },
      {
        key: "battery",
        label: "Battery",
        score: 94,
        note: "Settings-dependent — strong GPS endurance class",
      },
      { key: "maps", label: "Maps", score: 58, note: "Leaner than Forerunner maps" },
      { key: "training-features", label: "Training Features", score: 82 },
      { key: "recovery-features", label: "Recovery Features", score: 78 },
      { key: "interface", label: "Interface", score: 84 },
      { key: "smartwatch-features", label: "Smartwatch Features", score: 72 },
      { key: "value", label: "Value", score: 90 },
    ],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial", "ev-fr965-mfr"],
  }),
  researchReview({
    id: "review-adrenaline-gts-25",
    slug: "brooks-adrenaline-gts-25",
    productId: "prod-adrenaline-gts-25",
    title: "Brooks Adrenaline GTS 25 Review",
    subtitle:
      "A support-focused daily trainer for runners who want a controlled, comfortable road ride.",
    bottomLine:
      "Buy Adrenaline GTS 25 when you want GuideRails stability and everyday usability; skip it when you want a light, energetic race or tempo shoe.",
    verdict:
      "The Brooks Adrenaline GTS 25 is a dependable support-focused daily trainer that works best for runners who value a controlled, comfortable ride over speed. Its main strengths are stability, consistent cushioning and everyday usability, while runners wanting a lighter or more energetic shoe should look elsewhere.",
    summary:
      "GuideRails stability daily trainer for overpronators wanting a controlled road ride. Here's a practical take on the Brooks Adrenaline GTS 25 — what it's for, who it suits, and when to pick something else. I'd shortlist it if you want trusted GuideRails support or excellent widths. I'd pause if higher drop or not a speed shoe would show up often in your week. Buy Adrenaline GTS 25 when you want GuideRails stability and everyday usability; skip it when you want a light, energetic race or tempo shoe.",
    score: 84,
    ride: "Category coverage and Brooks materials describe a smooth, controlled daily ride aimed at easy and long asphalt miles. GuideRails is positioned as guidance rather than a hard medial post — expect composure and predictability more than bounce. Independent stability-shoe coverage typically places Adrenaline as a workhorse daily rather than a workout or race option. Runners chasing plated snap or max soft stack should look to tempo/race or max-cushion lines instead.",
    fit: "Adrenaline typically runs true-to-size with a secure midfoot. Brooks’ width options (including narrow through extra-wide on many colourways) are a practical advantage versus narrower stability competitors. Treat width availability as an official option set — subjective toe-box feel still varies by foot shape, so try on when possible if you sit between sizes or need a roomier forefoot.",
    cushioning:
      "DNA LOFT v3 is positioned as soft, protective daily foam with a relatively high stack for the stability class. More stack does not automatically mean a better ride — Adrenaline’s cushioning brief is consistent comfort for easy and long miles, not max-plush recovery foam. Independent coverage generally agrees it feels protective rather than lively.",
    stability:
      "GuideRails is Brooks’ guidance system along the midsole sidewalls. Discuss it as geometry and ride control — not as injury prevention or a medical correction. Compared with firmer posted stability shoes, Adrenaline is usually described as less intrusive while still offering more control than a pure neutral Ghost. Choose it when you want that guidance on road easy days; skip it if you are confirmed neutral and prefer an unconstrained platform.",
    durability:
      "Road rubber coverage and the daily-trainer positioning suggest this is built for high easy-mile volume. Do not treat any single kilometre claim as guaranteed without strong lab or first-hand Kitletics testing — which we do not have here. Independent durability notes for recent Adrenaline generations are generally favourable for asphalt use when rotated sensibly.",
    value: "Value is strongest for high-mileage road runners who will use one stability shoe across easy days and long runs. Versus Kayano or Structure, choose Adrenaline when you prefer Brooks fit and GuideRails feel; compare current regional prices before assuming any stability daily is automatically the better deal.",
    pros: [
      "Trusted GuideRails stability for controlled daily miles",
      "DNA LOFT v3 cushioning suited to easy and long road runs",
      "Excellent official width option range",
      "Predictable, everyday usability over flashy bounce",
      "Strong pick for runners who want support without a race plate",
    ],
    cons: [
      "Heavier and less energetic than speed-oriented trainers",
      "Higher 12 mm drop than many modern low-drop preferences",
      "Not ideal when race-day lightness is the priority",
      "Stability geometry is overkill for confirmed neutral runners",
    ],
    buy: [
      "You want GuideRails stability on easy and long road miles and prefer Brooks fit over Kayano/Structure",
      "You're building high weekly mileage in one support daily and need wide or extra-wide options",
      "You want a controlled, predictable ride more than bounce — Adrenaline is the support workhorse, not a tempo shoe",
    ],
    avoid: [
      "Race-day or interval snap is the purchase reason — weight and plate tools will feel better",
      "You prefer very soft max-cushion platforms — Glycerin or Bondi sit closer to that brief",
      "You're confirmed neutral and don't want guidance geometry — Ghost or Novablast fit better; trail needs a trail shoe",
    ],
    alts: ["prod-kayano-32", "prod-gt-2000-14", "prod-ghost-18"],
    comparisonIds: ["cmp-kayano-adrenaline"],
    scores: [
      { key: "stability", label: "Stability", score: 93 },
      { key: "comfort", label: "Comfort", score: 90 },
      { key: "cushioning", label: "Cushioning", score: 88 },
      { key: "ride", label: "Ride", score: 86 },
      { key: "fit", label: "Fit", score: 88, note: "Width options are a standout" },
      { key: "durability", label: "Durability", score: 86 },
      { key: "versatility", label: "Versatility", score: 82 },
      { key: "responsiveness", label: "Responsiveness", score: 72 },
      { key: "value", label: "Value", score: 86 },
      { key: "grip", label: "Grip", score: 80 },
      { key: "upper", label: "Upper", score: 84 },
    ],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
  }),
];
