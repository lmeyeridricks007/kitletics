import type { Review, ContentSection, ScoreBreakdownItem } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;
const author = "author-kitletics-editorial" as const;

const testingContext =
  "Kitletics Expert Research Review. How we assessed it: published specifications, manufacturer materials, and catalog peer comparisons for this heart-rate monitor's stated role. This page does not claim personal test sessions unless a first-hand section is explicitly present. Scores are decision aids — affiliate links do not change the verdict.";

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
 * Flagship HRM reviews deepened to the Vomero-18 editorial bar.
 * Overrides thin backfill seeds by slug (first match wins in reviews.ts).
 */
export const polarH10Review: Review = {
  id: "review-polar-h10",
  slug: "polar-h10",
  productId: "prod-polar-h10",
  title: "Polar H10 Review",
  subtitle:
    "The cross-brand ECG chest-strap benchmark when interval accuracy matters more than Garmin dynamics.",
  reviewType: "expert-research",
  bottomLine:
    "I'd buy the Polar H10 when you want a trusted ECG chest strap that pairs cleanly across watches, bikes and gym apps — not when you need Garmin running dynamics or a rechargeable strap.",
  verdict:
    "Best default chest strap for mixed ecosystems and hard interval days. Skip it if you live inside Garmin Connect and want HRM 600 dynamics, or if chest straps always chafe.",
  score: 90,
  summary:
    "Benchmark ECG chest strap with dual Bluetooth, ANT+ and one-session memory. I'd shortlist it for cross-brand accuracy and pairing flexibility. I'd pause for coin-cell upkeep or if you need Garmin-native running economy metrics.",
  reviewerId: author,
  testingContext,
  editorialDisclosure: disclosure,
  sections: [
    sec(
      "sec-overview",
      "What it is",
      "The Polar H10 is still the chest strap I'd send most runners to when the job is simple: electrical HR that stays honest when wrist optical falls apart — intervals, hills, HYROX stations, indoor bikes.\n\nIt is not a Garmin dynamics strap and it is not an armband comfort play. Dual Bluetooth plus ANT+, a replaceable CR2025 and one-session onboard memory make it the cross-brand accuracy default in this catalog — the strap you buy when your watch brand and your trainer brand are not the same company.\n\nIf you already live in Garmin Connect and want running dynamics or Forerunner 970 economy metrics, start with the HRM 600 instead. If chest straps chafe every long run, look at Polar Verity Sense or another optical armband before forcing the H10.",
    ),
    sec(
      "sec-verified-specs",
      "Key specs",
      "Published anchors used in this assessment:\n• Type: ECG chest strap\n• Sensing: electrical (ECG)\n• Connectivity: ANT+ and Bluetooth (up to two simultaneous BLE connections)\n• Battery: replaceable CR2025 (~400 h — manufacturer claim)\n• Standalone: one-session memory for watch-free recording\n• Running dynamics: no\n• Water / sweat: designed for sport use (confirm current IP rating on Polar’s sheet)\n\nTreat battery hours as a manufacturer claim, not a Kitletics lab result. Specs tell you the job class — they do not prove how a wet strap feels at mile 18.",
    ),
    sec(
      "sec-performance",
      "Accuracy & intervals",
      "I'd reach for the H10 on days where HR targets actually matter: threshold repeats, VO2 sessions, bike intervals, anything with sharp surges.\n\nElectrical sensing is the reason chest straps still beat wrist optical on those efforts. Optical armbands (Verity Sense, Rhythm+ 2.0, COROS HRM) can be fine for easy miles and many gym blocks, but they remain more prone to lag when HR jumps hard.\n\nThe H10’s reputation in this catalog is as the cross-ecosystem accuracy benchmark — not because every runner needs Polar branding, but because dual BLE + ANT+ keeps the same strap useful when you bounce between a Garmin, a Zwift laptop and a gym app.",
    ),
    sec(
      "sec-comfort",
      "Comfort & fit",
      "Chest straps are a comfort lottery. Some runners forget the H10 after five minutes; others still hate the elastic after a decade of trying.\n\nFit basics: strap high enough on the sternum to stay put, moist electrodes for clean contact, and a wash routine that keeps the soft strap from going rank. Polar’s soft strap is replaceable — budget for that over multi-year ownership.\n\nIf you train mostly in a sports bra and hate classic straps, Garmin HRM-Fit is the specialty ECG alternative in this catalog. If you refuse chest hardware entirely, Verity Sense is the Polar-family optical lane.",
    ),
    sec(
      "sec-tech",
      "Pairing & ecosystem",
      "This is where the H10 earns its keep versus brand-locked straps.\n\nDual Bluetooth means you can feed a watch and a phone/trainer app at once in many setups — useful for Zwift + wrist GPS, or Polar Beat + a bike computer. ANT+ covers older trainers and gym equipment. One-session memory covers the “forgot my watch” long run or pool of use cases where you sync later.\n\nWhat you do not get: Garmin running dynamics, Step Speed Loss / economy extras tied to HRM 600, or Polar Flow coaching as a reason to buy the strap alone. Buy H10 for HR plumbing, not for a coaching platform.",
    ),
    sec(
      "sec-durability",
      "Battery & upkeep",
      "CR2025 coin cells are boring in a good way — swap when the signal flakes, no charging cable to pack. Manufacturer claims land around hundreds of hours; real life depends on broadcast load and temperature.\n\nTrade-off versus HRM 600: you manage coin cells instead of USB recharge. Some runners prefer that; others want one cable for watch and strap. Neither is wrong — pick the maintenance style you’ll actually keep up with.",
    ),
    sec(
      "sec-usecase",
      "Who it is for",
      "Buy if:\n• You need ECG chest accuracy for intervals and your devices are a mix of brands/apps — H10 is the pairing workhorse\n• You want a single strap that can talk to a watch and a trainer/app at once via dual Bluetooth\n• You prefer a replaceable coin cell over charging another training gadget\n\nSkip if:\n• You want Garmin running dynamics or FR970 economy metrics — that job belongs to HRM 600 / Pro Plus lineage\n• Chest straps chafe or you refuse torso hardware — start with Verity Sense or Rhythm+ 2.0\n• You only need casual easy-run HR and already trust wrist optical — a strap is extra kit for no weekly gain",
    ),
    sec(
      "sec-value",
      "Value & alternatives",
      "Street price usually sits in the mid accessory band — expensive enough to feel intentional, cheap enough that accuracy is worth it if intervals are weekly.\n\nI'd pay for H10 when mixed-device pairing is the weekly reality. I'd look at Polar H9 if you want Polar ECG cheaper and can live with fewer simultaneous Bluetooth connections and no session memory. I'd look at Garmin HRM 600 if you are all-in on Garmin dynamics. I'd look at Wahoo TRACKR if you want a modern Wahoo chest strap in that ecosystem.\n\nCheck live offers on this page — do not treat catalog seeds as a frozen price.",
    ),
  ],
  pros: [
    "Cross-brand ECG accuracy reputation for intervals",
    "Dual Bluetooth + ANT+ pairing flexibility",
    "One-session memory when you train watch-free",
  ],
  cons: [
    "Coin-cell swaps instead of USB recharge",
    "No Garmin-native running dynamics",
    "Chest comfort still varies by runner",
  ],
  whoShouldBuy: [
    "You run hard intervals or structured HR work and need chest-strap accuracy that pairs across watches, bikes and apps — not a single-brand accessory",
    "You regularly broadcast HR to a watch and a trainer/phone at the same time and want dual Bluetooth without juggling straps",
    "You prefer a replaceable coin cell and a proven ECG strap over charging another Garmin-only accessory",
  ],
  whoShouldAvoid: [
    "You live in Garmin Connect and want running dynamics or Forerunner economy metrics — shortlist HRM 600 instead",
    "Chest straps chafe or you refuse torso hardware — Verity Sense or Rhythm+ 2.0 fit that comfort job better",
    "Easy-run wrist optical already covers your week and you never train by HR zones — the H10 is unnecessary kit",
  ],
  scoreBreakdown: scores([
    { key: "accuracy", label: "Accuracy", score: 93, note: "ECG interval default" },
    { key: "connection-stability", label: "Connection Stability", score: 90, note: "Dual BLE + ANT+" },
    { key: "comfort", label: "Comfort", score: 72, note: "Chest strap lottery" },
    { key: "battery", label: "Battery", score: 88, note: "Coin cell longevity" },
    { key: "device-compatibility", label: "Device Compatibility", score: 92, note: "Cross-brand strength" },
    { key: "running-dynamics", label: "Running Dynamics", score: 40, note: "Not a Garmin dynamics strap" },
    { key: "standalone", label: "Standalone Capability", score: 86, note: "One-session memory" },
    { key: "maintenance", label: "Ease of Maintenance", score: 80, note: "Wash strap + coin cells" },
  ]),
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-hrm-600",
    "prod-polar-h9",
    "prod-polar-verity-sense",
    "prod-wahoo-trackr",
  ],
  comparisonIds: ["cmp-hrm-pro-h10", "cmp-hrm600-h10", "cmp-h10-h9"],
  faqIds: [],
  seoTitle: "Polar H10 Review: Chest Strap Accuracy, Pairing & Alternatives",
  seoDescription:
    "Should you buy the Polar H10? Expert research on ECG accuracy, dual Bluetooth pairing, trade-offs vs Garmin HRM 600 and Verity Sense, and who should skip it.",
  ...pub,
};

export const garminHrm600Review: Review = {
  id: "review-hrm-600",
  slug: "garmin-hrm-600",
  productId: "prod-hrm-600",
  title: "Garmin HRM 600 Review",
  subtitle:
    "Rechargeable Garmin dynamics chest strap — the one I'd shortlist with a Forerunner when economy metrics matter.",
  reviewType: "expert-research",
  bottomLine:
    "I'd buy the HRM 600 when you train in Garmin Connect and want running dynamics plus rechargeable convenience — not when you need a cheap cross-brand HR dongle or hate chest straps.",
  verdict:
    "Best current Garmin chest strap for serious Forerunner users. Overkill if you only need basic HR, and the wrong tool if Polar-style multi-device pairing is the priority.",
  score: 88,
  summary:
    "Rechargeable advanced chest strap with running dynamics, standalone recording and Forerunner economy-metric support. I'd shortlist it inside a Garmin stack. I'd pause on comfort and price if you only need simple ECG HR.",
  reviewerId: author,
  testingContext,
  editorialDisclosure: disclosure,
  sections: [
    sec(
      "sec-overview",
      "What it is",
      "The Garmin HRM 600 is the current flagship Garmin chest strap for runners who already live in Connect — not a generic HR accessory.\n\nAlongside ECG heart rate you get Garmin running dynamics and the newer economy / step-speed-loss style metrics on compatible Forerunners (including the FR970 lane in this catalog). Rechargeable power and standalone recording push it past older coin-cell Pro Plus habits.\n\nIf your watch is Polar, COROS or Apple and you just need honest interval HR, Polar H10 is usually the cleaner buy. If chest straps are a hard no, do not buy HRM 600 hoping Garmin will make torso elastic feel like an armband.",
    ),
    sec(
      "sec-verified-specs",
      "Key specs",
      "Published anchors used in this assessment:\n• Type: ECG chest strap\n• Sensing: electrical (ECG)\n• Connectivity: ANT+ and Bluetooth (multi-device Garmin pairing story)\n• Battery: rechargeable (approx. 2 months per charge — manufacturer claim)\n• Running dynamics: yes (Garmin ecosystem)\n• Pace / distance support: yes on compatible setups\n• Standalone recording: yes\n• Positioning: current Garmin HRM flagship vs previous-gen Pro Plus\n\nBattery duration is a manufacturer claim tied to use profile — cold weather and constant broadcast shorten it. Confirm FR970 / watch compatibility for economy metrics on Garmin’s current support matrix before you buy for that feature alone.",
    ),
    sec(
      "sec-performance",
      "Accuracy & dynamics",
      "As an ECG strap, HRM 600 sits in the same accuracy class as Polar H10 for hard efforts — the differentiator is what Garmin layers on top.\n\nRunning dynamics (cadence, vertical oscillation, ground contact, and related Connect fields) matter if you actually review them after workouts. The newer economy-oriented metrics on compatible Forerunners are the reason I'd upgrade from a basic strap or aging Pro Plus if you already own the watch that unlocks them.\n\nIf you never open dynamics charts, you are mostly paying for rechargeable convenience and Garmin polish — H10 or HRM 200 may be enough HR.",
    ),
    sec(
      "sec-comfort",
      "Comfort & fit",
      "Same honesty as any chest strap: some runners are fine for years, others bounce off within a week.\n\nGarmin’s soft straps have improved, but placement, sweat and skin sensitivity still dominate. Wash the strap, dry the module contacts, and size carefully — a loose strap creates noise that looks like “bad HR.”\n\nSports-bra users who hate classic belts should compare HRM-Fit before defaulting to HRM 600.",
    ),
    sec(
      "sec-tech",
      "Garmin ecosystem fit",
      "Buy HRM 600 because you want the Garmin stack to feel complete — Forerunner on the wrist, strap for quality sessions, Connect for the review.\n\nIt still speaks ANT+/Bluetooth for broader gear, but the product story is Garmin-first: dynamics, standalone recording and economy metrics on supported watches. Polar H10 remains the better “one strap for every brand” tool.\n\nPrevious-gen HRM-Pro Plus stays relevant on clearance if you want dynamics without paying for the current rechargeable flagship.",
    ),
    sec(
      "sec-durability",
      "Battery & charging",
      "Rechargeable is the lifestyle upgrade versus Pro Plus coin cells — one less CR2032 ritual if you already charge a watch weekly.\n\nManufacturer guidance is multi-week runtime per charge for typical use; treat that as a claim and charge before key races anyway. If you hate remembering another cable, Polar H10’s coin cell may annoy you less.",
    ),
    sec(
      "sec-usecase",
      "Who it is for",
      "Buy if:\n• You run with a compatible Forerunner/Fenix stack and will use running dynamics or economy metrics — HRM 600 is built for that job\n• You want rechargeable convenience and standalone recording instead of aging Pro Plus coin-cell habits\n• Most quality sessions are Garmin-centric and you are fine paying accessory-premium for the current strap\n\nSkip if:\n• You need the cheapest accurate ECG across mixed brands — Polar H10 or H9 usually win that brief\n• Chest straps always fail the comfort test — Verity Sense / Rhythm+ / COROS armbands are the lane\n• You only jog with wrist HR and never look at dynamics — this is premium kit for a job you will not use",
    ),
    sec(
      "sec-value",
      "Value & alternatives",
      "HRM 600 prices like a serious accessory. I'd pay it when a supported Forerunner makes the dynamics/economy story real. I'd pause when a sale Pro Plus still covers dynamics, or when H10 covers cross-brand HR for less complexity.\n\nAlternatives in this catalog: Polar H10 (cross-brand benchmark), HRM-Pro Plus (previous-gen value), HRM 200 (entry Garmin ECG without dynamics), Wahoo TRACKR (Wahoo chest lane).\n\nUse the offers module for live street price — do not freeze a seed number into your decision.",
    ),
  ],
  pros: [
    "Garmin running dynamics on compatible watches",
    "Rechargeable vs older coin-cell Pro Plus habits",
    "Standalone recording and current Garmin HRM flagship role",
  ],
  cons: [
    "Premium accessory cost vs basic ECG straps",
    "Chest comfort still runner-dependent",
    "Less compelling if you are not in the Garmin stack",
  ],
  whoShouldBuy: [
    "You train on a compatible Forerunner and will actually use running dynamics or economy metrics — HRM 600 is the current Garmin strap for that job",
    "You want rechargeable power and standalone recording instead of managing Pro Plus coin cells",
    "Most of your structured work stays inside Garmin Connect and you are willing to pay for the current flagship accessory",
  ],
  whoShouldAvoid: [
    "You need one cheap ECG strap for mixed watches, bikes and apps — Polar H10 is the clearer cross-brand pick",
    "Chest straps chafe or you refuse torso hardware — look at Verity Sense or Rhythm+ 2.0 instead",
    "You never open dynamics charts and only want casual HR — HRM 200 or wrist optical may be enough",
  ],
  scoreBreakdown: scores([
    { key: "accuracy", label: "Accuracy", score: 93, note: "ECG + Garmin polish" },
    { key: "connection-stability", label: "Connection Stability", score: 90, note: "ANT+/Bluetooth" },
    { key: "comfort", label: "Comfort", score: 72, note: "Chest strap lottery" },
    { key: "battery", label: "Battery", score: 84, note: "Rechargeable claim" },
    { key: "device-compatibility", label: "Device Compatibility", score: 88, note: "Garmin-first" },
    { key: "running-dynamics", label: "Running Dynamics", score: 94, note: "Core reason to buy" },
    { key: "standalone", label: "Standalone Capability", score: 90, note: "Onboard recording" },
    { key: "maintenance", label: "Ease of Maintenance", score: 84, note: "Charge + wash strap" },
  ]),
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-polar-h10",
    "prod-hrm-pro-plus",
    "prod-wahoo-tickr-x",
    "prod-forerunner-970",
  ],
  comparisonIds: ["cmp-hrm600-h10", "cmp-hrm600-proplus"],
  faqIds: [],
  seoTitle: "Garmin HRM 600 Review: Dynamics, Battery & Who Should Buy",
  seoDescription:
    "Should you buy the Garmin HRM 600? Expert research on running dynamics, rechargeable battery, trade-offs vs Polar H10 and Pro Plus, and who should skip it.",
  ...pub,
};

export const polarVeritySenseReview: Review = {
  id: "review-polar-verity-sense",
  slug: "polar-verity-sense",
  productId: "prod-polar-verity-sense",
  title: "Polar Verity Sense Review",
  subtitle:
    "Optical armband HR when you want Polar comfort without a chest strap — not the interval ECG default.",
  reviewType: "expert-research",
  bottomLine:
    "I'd buy Verity Sense when chest straps are a hard no and you still want dedicated optical HR — not when every key session is all-out intervals that need ECG honesty.",
  verdict:
    "Best Polar-family answer to “I will not wear a chest strap.” Keep a chest strap in the drawer for race-critical intervals if accuracy is non-negotiable.",
  score: 84,
  summary:
    "Optical upper-arm HR monitor for runners who refuse chest straps. I'd shortlist it for comfort and Polar/app pairing. I'd pause when hard intervals need ECG-class response.",
  reviewerId: author,
  testingContext,
  editorialDisclosure: disclosure,
  sections: [
    sec(
      "sec-overview",
      "What it is",
      "Polar Verity Sense is the optical armband I'd point to inside the Polar lane when comfort beats chest hardware.\n\nIt sits on the upper arm (or temple band in swim-oriented setups depending on accessories), streams ANT+/Bluetooth, and targets runners, gym athletes and anyone who abandons chest straps for chafing or sensory reasons.\n\nIt is not a silent upgrade that makes optical equal to Polar H10 on every interval set. Expect better comfort; expect more risk of lag or noise when HR spikes hard. If you need Garmin dynamics, this is the wrong category entirely.",
    ),
    sec(
      "sec-verified-specs",
      "Key specs",
      "Published anchors used in this assessment:\n• Type: optical armband\n• Placement: upper arm (accessory options exist for other sports)\n• Sensing: optical PPG\n• Connectivity: ANT+ and Bluetooth (multi-connect story on Polar’s sheet)\n• Battery: rechargeable (~30 h — manufacturer claim)\n• Running dynamics: no\n• Standalone / memory: Polar positions memory and swim-friendly use — confirm current firmware/features on Polar’s page\n\nBattery hours and swim claims are manufacturer positioning. Kitletics treats Verity as an optical comfort specialist, not an ECG replacement.",
    ),
    sec(
      "sec-performance",
      "Accuracy vs chest straps",
      "On easy and steady efforts, a well-fitted Verity Sense is often “good enough” for zone training and gym circuits where chest straps bounce or chafe.\n\nOn sharp interval days, optical still has more ways to lag or smooth over spikes than a wet H10 or HRM 600. That is the honest trade. I'd rotate: Verity for comfort-heavy weeks, chest strap for key sessions — if you care about precise HR targets.\n\nPeers in the optical lane: COROS HRM, Scosche Rhythm+ 2.0, Wahoo TICKR FIT. Verity’s edge is Polar ecosystem familiarity and armband comfort reputation; it is not automatically the accuracy king of that group.",
    ),
    sec(
      "sec-comfort",
      "Comfort & wear",
      "This is the product’s job interview pass: no torso elastic.\n\nUpper-arm fit should be snug without cutting circulation; too loose creates motion noise. The soft band is the reason people stay adherent when they abandoned chest straps. Wash the band, charge the module, and check placement if numbers look weird mid-run.\n\nIf even armbands bother you, wrist optical on a modern watch may be enough for easy miles — accept the same interval caveats.",
    ),
    sec(
      "sec-tech",
      "Pairing & Polar lane",
      "ANT+ and Bluetooth keep Verity useful beyond Polar watches — phones, gym apps, many third-party devices.\n\nIf you already use Polar Flow, the accessory feels native. If you are all-Garmin and only want comfort optical, COROS or Scosche may be equivalent tools; buy Verity when Polar software or dual-connect habits already fit your week.",
    ),
    sec(
      "sec-durability",
      "Battery",
      "Rechargeable module with a manufacturer claim around tens of hours of use — fine for weekly training if you charge with your watch habit.\n\nIt will not match a coin-cell chest strap’s “forget for months” energy. Pack the cable before a training camp.",
    ),
    sec(
      "sec-usecase",
      "Who it is for",
      "Buy if:\n• Chest straps are a hard no and you still want dedicated HR off the watch — Verity is Polar’s comfort answer\n• Most sessions are easy, tempo-steady or gym/HYROX mixed work where optical lag is tolerable\n• You already live near Polar apps/devices and want an armband that pairs broadly\n\nSkip if:\n• Key workouts are all-out intervals or HR-capped races where ECG honesty matters — keep H10 or HRM 600 for those days\n• You need Garmin running dynamics — wrong product family\n• You are fine with wrist optical for casual jogging and will not wear another device",
    ),
    sec(
      "sec-value",
      "Value & alternatives",
      "Verity Sense prices like a mid optical specialist. I'd pay it when comfort adherence is the blocker to using HR at all. I'd skip it when you will still need a chest strap for every important session — buy the strap first.\n\nAlternatives: Polar H10 (ECG default), Scosche Rhythm+ 2.0 (optical peer), COROS HRM (COROS lane), Garmin HRM-Fit (ECG without classic strap for sports-bra setups).\n\nCheck live offers before freezing a seed price into the decision.",
    ),
  ],
  pros: [
    "Chest-strap-free optical comfort",
    "ANT+/Bluetooth pairing breadth",
    "Clear Polar-family armband role",
  ],
  cons: [
    "Optical lag risk on hard intervals vs ECG straps",
    "Not a Garmin dynamics solution",
    "Another device to charge and fit correctly",
  ],
  whoShouldBuy: [
    "You refuse chest straps but still want dedicated HR for training — Verity Sense is Polar’s comfort-first optical answer",
    "Most of your week is steady or gym-mixed work where optical accuracy is acceptable and adherence matters more than ECG perfection",
    "You already use Polar apps/devices and want an armband that still speaks ANT+/Bluetooth to other gear",
  ],
  whoShouldAvoid: [
    "Your key sessions are sharp intervals or HR-capped races — shortlist Polar H10 or Garmin HRM 600 for those days",
    "You need Garmin running dynamics — buy an HRM 600-class strap instead",
    "Wrist optical already covers casual jogging and you will not wear a second device",
  ],
  scoreBreakdown: scores([
    { key: "accuracy", label: "Accuracy", score: 78, note: "Optical — intervals caveat" },
    { key: "connection-stability", label: "Connection Stability", score: 90, note: "ANT+/Bluetooth" },
    { key: "comfort", label: "Comfort", score: 92, note: "Armband vs chest" },
    { key: "battery", label: "Battery", score: 82, note: "Rechargeable claim" },
    { key: "device-compatibility", label: "Device Compatibility", score: 88, note: "Broad pairing" },
    { key: "running-dynamics", label: "Running Dynamics", score: 40, note: "HR-focused" },
    { key: "standalone", label: "Standalone Capability", score: 86, note: "Polar memory/swim story" },
    { key: "maintenance", label: "Ease of Maintenance", score: 84, note: "Charge + wash band" },
  ]),
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-polar-h10",
    "prod-coros-hrm",
    "prod-scosche-rhythm-plus-2",
    "prod-wahoo-tickr-fit",
  ],
  comparisonIds: ["cmp-coros-verity"],
  faqIds: [],
  seoTitle: "Polar Verity Sense Review: Optical Armband Pros, Cons & Alternatives",
  seoDescription:
    "Should you buy Polar Verity Sense? Expert research on optical armband comfort vs Polar H10 chest accuracy, who should skip it, and alternatives like Rhythm+ 2.0.",
  ...pub,
};

export const scoscheRhythmPlus2Review: Review = {
  id: "review-scosche-rhythm-plus-2",
  slug: "scosche-rhythm-plus-2",
  productId: "prod-scosche-rhythm-plus-2",
  title: "Scosche Rhythm+ 2.0 Review",
  subtitle:
    "Optical armband HR with dual BLE/ANT+ when chest straps are out — still not an ECG interval default.",
  reviewType: "expert-research",
  bottomLine:
    "I'd buy Rhythm+ 2.0 when you want a comfortable optical armband with broad app pairing — not when hard intervals need Polar H10 or Garmin HRM 600 honesty.",
  verdict:
    "Strong Scosche optical option for chest-strap refusers. Keep a chest strap for race-critical HR work if accuracy is non-negotiable.",
  score: 80,
  summary:
    "Rhythm+ 2.0 is Scosche’s current optical armband lane — green/yellow sensor story, dual radio, rechargeable. I'd shortlist it for comfort adherence. I'd pause on all-out interval days versus ECG straps.",
  reviewerId: author,
  testingContext,
  editorialDisclosure: disclosure,
  sections: [
    sec(
      "sec-overview",
      "What it is",
      "Scosche Rhythm+ 2.0 sits in the optical armband lane beside Polar Verity Sense and COROS HRM — built for runners and gym athletes who will not wear a chest strap.\n\nManufacturer positioning highlights a green/yellow optical array, dual Bluetooth/ANT+ radio, IP68 sealing and roughly a day of rechargeable runtime. Kitletics treats those as manufacturer claims, not lab results.\n\nIt is not a silent ECG replacement. I'd use it for comfortable daily HR and many HYROX/gym blocks, then rotate to Polar H10 or Garmin HRM 600 when interval targets actually decide the session.",
    ),
    sec(
      "sec-verified-specs",
      "Key specs",
      "Published anchors used in this assessment:\n• Type: optical armband\n• Placement: upper arm / forearm (fit dependent)\n• Sensing: optical PPG (green/yellow array — manufacturer claim)\n• Connectivity: Bluetooth and ANT+\n• Battery: rechargeable (~24 h — manufacturer claim)\n• Running dynamics: no\n• Water resistance: IP68 (manufacturer claim)\n\nRhythm24 remains in catalog as Scosche’s onboard-recording sibling — buy Plus 2.0 for the current streaming armband story, not as a dynamics strap.",
    ),
    sec(
      "sec-performance",
      "Accuracy & intervals",
      "Optical armbands can track steady efforts well when the band is snug. Hard surges are where I'd rather have an H10 or HRM 600 on the sternum.\n\nIf your week is mostly easy miles, tempo-steady work and gym circuits, Rhythm+ 2.0 is a credible comfort-first tool. If your week is VO2 repeats and HR-capped races, buy the ECG strap first and treat Plus 2.0 as optional comfort hardware.",
    ),
    sec(
      "sec-comfort",
      "Comfort & fit",
      "This is the sell: no chest elastic. A well-sized armband is why people stick with HR training after abandoning straps.\n\nToo loose equals motion noise; too tight cuts comfort. Wash the band, charge the module, and re-check placement if numbers look weird mid-session.",
    ),
    sec(
      "sec-tech",
      "Pairing",
      "Dual Bluetooth/ANT+ is the practical reason Scosche stays relevant — phones, watches, trainers and gym apps without locking you to one watch brand.\n\nEcosystem polish still trails Polar/Garmin. Buy Plus 2.0 for the radio + comfort combo, not for a coaching platform.",
    ),
    sec(
      "sec-durability",
      "Battery",
      "Rechargeable with a manufacturer claim around 24 hours of use — fine if you charge with your watch habit. It will not match a coin-cell chest strap’s forgettable longevity.",
    ),
    sec(
      "sec-usecase",
      "Who it is for",
      "Buy if:\n• Chest straps are a hard no and you still want dedicated optical HR with broad app pairing\n• Most sessions tolerate optical lag and comfort adherence matters more than ECG perfection\n• You want a current Scosche armband rather than older Rhythm24 positioning alone\n\nSkip if:\n• Key workouts need ECG-class interval honesty — shortlist H10 or HRM 600\n• You need Garmin running dynamics — wrong category\n• Wrist optical already covers casual jogging and you will not wear another device",
    ),
    sec(
      "sec-value",
      "Value & alternatives",
      "I'd pay for Rhythm+ 2.0 when comfort is the blocker to using HR at all. Alternatives: Polar Verity Sense (Polar lane), COROS HRM, Wahoo TICKR FIT, Polar H10 (ECG default).\n\nCheck live offers on this page before freezing a seed price.",
    ),
  ],
  pros: [
    "Chest-strap-free optical comfort",
    "Dual Bluetooth / ANT+ pairing breadth",
    "Current Scosche Rhythm+ armband lane",
  ],
  cons: [
    "Optical lag risk vs ECG on hard intervals",
    "No Garmin running dynamics",
    "Another device to charge and fit",
  ],
  whoShouldBuy: [
    "You refuse chest straps but still want dedicated optical HR that pairs across apps and watches — Rhythm+ 2.0 is Scosche’s current answer",
    "Most of your week is steady or gym-mixed work where comfort adherence beats ECG perfection",
    "You want dual BLE/ANT+ without buying into Polar or Garmin accessory ecosystems first",
  ],
  whoShouldAvoid: [
    "Your key sessions are sharp intervals or HR-capped races — shortlist Polar H10 or Garmin HRM 600",
    "You need Garmin running dynamics — buy HRM 600 instead",
    "Wrist optical already covers casual jogging and you will not wear a second device",
  ],
  scoreBreakdown: scores([
    { key: "accuracy", label: "Accuracy", score: 78, note: "Optical — interval caveat" },
    { key: "connection-stability", label: "Connection Stability", score: 90, note: "BLE + ANT+" },
    { key: "comfort", label: "Comfort", score: 92, note: "Armband vs chest" },
    { key: "battery", label: "Battery", score: 82, note: "Rechargeable claim" },
    { key: "device-compatibility", label: "Device Compatibility", score: 90, note: "App breadth" },
    { key: "running-dynamics", label: "Running Dynamics", score: 40, note: "HR-focused" },
    { key: "standalone", label: "Standalone Capability", score: 45, note: "Streaming-first" },
    { key: "maintenance", label: "Ease of Maintenance", score: 84, note: "Charge + wash band" },
  ]),
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-polar-verity-sense",
    "prod-coros-hrm",
    "prod-polar-h10",
    "prod-wahoo-tickr-fit",
  ],
  comparisonIds: [],
  faqIds: [],
  seoTitle: "Scosche Rhythm+ 2.0 Review: Optical Armband Pros & Alternatives",
  seoDescription:
    "Should you buy Scosche Rhythm+ 2.0? Expert research on optical armband comfort vs Polar H10 / Verity Sense, interval caveats, and who should skip it.",
  ...pub,
};

export const hrmFlagshipReviews: Review[] = [
  polarH10Review,
  garminHrm600Review,
  polarVeritySenseReview,
  scoscheRhythmPlus2Review,
];
