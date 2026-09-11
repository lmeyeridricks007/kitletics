/**
 * Light suitability scores for Running Recovery Gear wave 2.
 *
 * Factors ONLY: practical-use, comfort, portability, evidence-honesty, tradeoffs, value.
 * Use cases: post-run-recovery, travel-recovery, home-recovery, high-mileage, comfort.
 *
 * Explanations stay claim-safe — no injury heal / circulation / lactic-acid promises.
 *
 * NOT wired into recommendations.ts aggregators yet (parent will wire).
 */
import type { Recommendation } from "@/domain/recommendations/types";

const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;

const recoveryFactors = (scores: {
  "practical-use": number;
  comfort: number;
  portability: number;
  "evidence-honesty": number;
  tradeoffs: number;
  value: number;
}) => [
  {
    key: "practical-use",
    label: "Practical use",
    score: scores["practical-use"],
    weight: 0.22,
    explanation: "How well it fits real post-run soft-tissue or comfort routines.",
  },
  {
    key: "comfort",
    label: "Comfort",
    score: scores.comfort,
    weight: 0.18,
    explanation: "Session feel and wearability for everyday use.",
  },
  {
    key: "portability",
    label: "Portability",
    score: scores.portability,
    weight: 0.18,
    explanation: "Packability for travel, race weekends and small apartments.",
  },
  {
    key: "evidence-honesty",
    label: "Evidence honesty",
    score: scores["evidence-honesty"],
    weight: 0.16,
    explanation: "How clearly we separate manufacturer marketing from practical assessment.",
  },
  {
    key: "tradeoffs",
    label: "Tradeoffs",
    score: scores.tradeoffs,
    weight: 0.12,
    explanation: "Clarity of limits vs peers (power, coverage, price, bulk).",
  },
  {
    key: "value",
    label: "Value",
    score: scores.value,
    weight: 0.14,
    explanation: "Features and usefulness vs typical street price.",
  },
];

function rec(
  id: string,
  productId: string,
  useCaseId: string,
  score: number,
  scores: Parameters<typeof recoveryFactors>[0],
  strengths: string[],
  compromises: string[],
  explanation: string,
): Recommendation {
  return {
    id,
    productId,
    sportId: "sport-running",
    useCaseId,
    score,
    factors: recoveryFactors(scores),
    strengths,
    compromises,
    explanation,
    evidenceIds: [...ev],
  };
}

export const runningRecoveryRecommendations: Recommendation[] = [
  // ── Theragun Prime ─────────────────────────────────────────────────────
  rec(
    "rec-theragun-prime-post-run-recovery",
    "prod-theragun-prime",
    "uc-post-run-recovery",
    86,
    { "practical-use": 88, comfort: 84, portability: 70, "evidence-honesty": 90, tradeoffs: 82, value: 78 },
    ["16 mm stroke for home soft-tissue sessions", "Clear mid-tier vs Mini/Pro"],
    ["Bulkier than Mini for race bags"],
    "Strong home pick for post-run soft-tissue comfort routines — not medical care.",
  ),
  rec(
    "rec-theragun-prime-home-recovery",
    "prod-theragun-prime",
    "uc-home-recovery",
    88,
    { "practical-use": 90, comfort: 86, portability: 68, "evidence-honesty": 90, tradeoffs: 84, value: 78 },
    ["Desk-side full grip", "Attachment kit covers calves/quads"],
    ["Overkill if you only travel"],
    "Best Theragun step-up for apartment home soft-tissue kits.",
  ),
  rec(
    "rec-theragun-prime-high-mileage",
    "prod-theragun-prime",
    "uc-high-mileage",
    84,
    { "practical-use": 86, comfort: 82, portability: 68, "evidence-honesty": 90, tradeoffs: 80, value: 76 },
    ["Handles frequent weekly sessions", "Force above Mini"],
    ["Still not a Pro for deepest pressure fans"],
    "Useful frequent soft-tissue tool for high-mileage blocks — rest still comes first.",
  ),

  // ── Theragun Pro ───────────────────────────────────────────────────────
  rec(
    "rec-theragun-pro-home-recovery",
    "prod-theragun-pro",
    "uc-home-recovery",
    84,
    { "practical-use": 88, comfort: 80, portability: 48, "evidence-honesty": 88, tradeoffs: 78, value: 64 },
    ["Highest Therabody force/attachment depth", "Dedicated home unit"],
    ["Heavy price and pack size"],
    "Flagship home percussion when Mini/Prime feel light — comfort tool, not clinical care.",
  ),
  rec(
    "rec-theragun-pro-high-mileage",
    "prod-theragun-pro",
    "uc-high-mileage",
    82,
    { "practical-use": 86, comfort: 78, portability: 46, "evidence-honesty": 88, tradeoffs: 76, value: 62 },
    ["Built for frequent hard-session routines", "Pro Plus features when present"],
    ["Poor travel companion"],
    "High-mileage home soft-tissue kit for athletes who already own portable guns.",
  ),

  // ── Theragun Relief ────────────────────────────────────────────────────
  rec(
    "rec-theragun-relief-comfort",
    "prod-theragun-relief",
    "uc-comfort",
    82,
    { "practical-use": 78, comfort: 90, portability: 84, "evidence-honesty": 92, tradeoffs: 86, value: 82 },
    ["Gentle 10 mm stroke", "Quiet and light"],
    ["Less depth than Prime"],
    "Entry Theragun for gentle comfort routines — honest about milder force.",
  ),
  rec(
    "rec-theragun-relief-travel-recovery",
    "prod-theragun-relief",
    "uc-travel-recovery",
    80,
    { "practical-use": 76, comfort: 88, portability: 86, "evidence-honesty": 92, tradeoffs: 84, value: 80 },
    ["USB-C and compact grip", "Simple one-button speeds"],
    ["Mini may pack even smaller"],
    "Travel-friendly gentle percussion when you want Theragun branding without Pro bulk.",
  ),

  // ── Hypervolt 2 ────────────────────────────────────────────────────────
  rec(
    "rec-hypervolt-2-post-run-recovery",
    "prod-hypervolt-2",
    "uc-post-run-recovery",
    85,
    { "practical-use": 86, comfort: 84, portability: 72, "evidence-honesty": 88, tradeoffs: 82, value: 76 },
    ["Quiet Hyperice motor", "Full-size home sessions"],
    ["Go 2 wins for packability"],
    "Solid post-run soft-tissue pick if you prefer Hyperice over Theragun.",
  ),
  rec(
    "rec-hypervolt-2-home-recovery",
    "prod-hypervolt-2",
    "uc-home-recovery",
    86,
    { "practical-use": 88, comfort: 84, portability: 70, "evidence-honesty": 88, tradeoffs: 82, value: 76 },
    ["Pairs with Normatec stacks", "Attachment ecosystem"],
    ["App features are manufacturer extras, not proof of outcomes"],
    "Home Hypervolt default when Go 2 is too light for desk sessions.",
  ),

  // ── RENPHO R3 ──────────────────────────────────────────────────────────
  rec(
    "rec-renpho-r3-value-travel",
    "prod-renpho-r3",
    "uc-travel-recovery",
    80,
    { "practical-use": 78, comfort: 74, portability: 86, "evidence-honesty": 90, tradeoffs: 84, value: 92 },
    ["Strong value for first gun", "Packs for race weekends"],
    ["Build may trail premium brands"],
    "Budget portable percussion for travel comfort routines — expect tradeoffs vs Theragun.",
  ),
  rec(
    "rec-renpho-r3-home-recovery",
    "prod-renpho-r3",
    "uc-home-recovery",
    76,
    { "practical-use": 76, comfort: 72, portability: 82, "evidence-honesty": 90, tradeoffs: 82, value: 92 },
    ["Low cost of entry", "Simple controls"],
    ["Noise/support vary"],
    "Apartment soft-tissue starter when premium guns feel overpriced.",
  ),

  // ── OPOVE M3 Pro ───────────────────────────────────────────────────────
  rec(
    "rec-opove-m3-pro-post-run-recovery",
    "prod-opove-m3-pro",
    "uc-post-run-recovery",
    82,
    { "practical-use": 84, comfort: 78, portability: 80, "evidence-honesty": 88, tradeoffs: 80, value: 90 },
    ["Forceful mid-price class", "Case-friendly"],
    ["Brand polish trails big two"],
    "Value-forward post-run soft-tissue gun between RENPHO and Theragun Prime.",
  ),
  rec(
    "rec-opove-m3-pro-high-mileage",
    "prod-opove-m3-pro",
    "uc-high-mileage",
    80,
    { "practical-use": 82, comfort: 76, portability: 78, "evidence-honesty": 88, tradeoffs: 78, value: 88 },
    ["Handles frequent use without Pro pricing", "Travel-capable"],
    ["Verify current stall-force claims yourself"],
    "Practical high-mileage soft-tissue tool when Prime price is a stretch.",
  ),

  // ── TimTam ─────────────────────────────────────────────────────────────
  rec(
    "rec-timtam-v37-home-recovery",
    "prod-timtam-power-massager-v3.7",
    "uc-home-recovery",
    78,
    { "practical-use": 80, comfort: 76, portability: 72, "evidence-honesty": 86, tradeoffs: 78, value: 82 },
    ["Athlete-oriented soft-tissue tool", "Alternative to Theragun/Hyperice"],
    ["Fewer demo retail points"],
    "Home percussion alternative with athletic positioning — still a comfort tool.",
  ),

  // ── GRID X ─────────────────────────────────────────────────────────────
  rec(
    "rec-grid-x-post-run-recovery",
    "prod-triggerpoint-grid-x",
    "uc-post-run-recovery",
    84,
    { "practical-use": 86, comfort: 70, portability: 55, "evidence-honesty": 92, tradeoffs: 88, value: 86 },
    ["Firmer than standard GRID", "Familiar GRID pattern"],
    ["Too aggressive for beginners"],
    "Post-run soft-tissue roller when original GRID feels too soft — technique still matters.",
  ),
  rec(
    "rec-grid-x-high-mileage",
    "prod-triggerpoint-grid-x",
    "uc-high-mileage",
    82,
    { "practical-use": 84, comfort: 68, portability: 52, "evidence-honesty": 92, tradeoffs: 86, value: 84 },
    ["Durable density step-up", "Home staple"],
    ["Not travel-friendly"],
    "High-mileage home roller for athletes who already know GRID technique.",
  ),

  // ── GRID Travel ────────────────────────────────────────────────────────
  rec(
    "rec-grid-travel-travel-recovery",
    "prod-triggerpoint-grid-travel",
    "uc-travel-recovery",
    86,
    { "practical-use": 84, comfort: 78, portability: 90, "evidence-honesty": 92, tradeoffs: 86, value: 88 },
    ["13\" pack length", "Same GRID surface language"],
    ["Less coverage per pass than full GRID"],
    "Best simple travel roller when Morph price feels high.",
  ),
  rec(
    "rec-grid-travel-post-run-recovery",
    "prod-triggerpoint-grid-travel",
    "uc-post-run-recovery",
    80,
    { "practical-use": 80, comfort: 78, portability: 88, "evidence-honesty": 92, tradeoffs: 84, value: 88 },
    ["Hotel-room friendly", "No charging needed"],
    ["Shorter barrel"],
    "Post-run soft-tissue work on the road without a full-length tube.",
  ),

  // ── RumbleRoller ───────────────────────────────────────────────────────
  rec(
    "rec-rumbleroller-home-recovery",
    "prod-rumbleroller-original",
    "uc-home-recovery",
    78,
    { "practical-use": 80, comfort: 58, portability: 48, "evidence-honesty": 90, tradeoffs: 88, value: 80 },
    ["Ridged aggressive texture", "Durable home unit"],
    ["Too intense for many recovery days"],
    "Home soft-tissue roller for athletes who want ridges — ease in; not medical care.",
  ),

  // ── Brazyn Morph ───────────────────────────────────────────────────────
  rec(
    "rec-brazyn-morph-travel-recovery",
    "prod-brazyn-morph",
    "uc-travel-recovery",
    88,
    { "practical-use": 86, comfort: 80, portability: 96, "evidence-honesty": 90, tradeoffs: 82, value: 70 },
    ["Collapses for suitcase packing", "Full-diameter when expanded"],
    ["Premium vs GRID Travel"],
    "Top packability roller for race-weekend soft-tissue routines.",
  ),
  rec(
    "rec-brazyn-morph-high-mileage",
    "prod-brazyn-morph",
    "uc-high-mileage",
    80,
    { "practical-use": 82, comfort: 78, portability: 94, "evidence-honesty": 90, tradeoffs: 80, value: 68 },
    ["Works at home and on the road", "Encourages consistency when traveling"],
    ["Pricey if you never travel"],
    "High-mileage athletes who race often get the Morph portability payoff.",
  ),

  // ── BLACKROLL PRO ──────────────────────────────────────────────────────
  rec(
    "rec-blackroll-pro-home-recovery",
    "prod-blackroll-pro",
    "uc-home-recovery",
    80,
    { "practical-use": 82, comfort: 72, portability: 50, "evidence-honesty": 90, tradeoffs: 84, value: 84 },
    ["Firm density", "Simple durable roller"],
    ["Bulky for travel"],
    "Firm home roller alternative to GRID X — practical soft-tissue tool only.",
  ),

  // ── Massage balls ──────────────────────────────────────────────────────
  rec(
    "rec-mb1-travel-recovery",
    "prod-triggerpoint-mb1",
    "uc-travel-recovery",
    88,
    { "practical-use": 84, comfort: 86, portability: 98, "evidence-honesty": 94, tradeoffs: 88, value: 92 },
    ["Tiny pack size", "Gentle foot/hip work"],
    ["Too soft for deep pressure fans"],
    "Essential travel soft-tissue ball for feet and hips — comfort aid, not treatment.",
  ),
  rec(
    "rec-mb1-comfort",
    "prod-triggerpoint-mb1",
    "uc-comfort",
    86,
    { "practical-use": 82, comfort: 90, portability: 96, "evidence-honesty": 94, tradeoffs: 86, value: 92 },
    ["Soft entry density", "Easy daily use"],
    ["Limited force"],
    "Gentle comfort-ball default for beginners adding focal soft-tissue work.",
  ),
  rec(
    "rec-mbx-post-run-recovery",
    "prod-triggerpoint-mbx",
    "uc-post-run-recovery",
    84,
    { "practical-use": 86, comfort: 70, portability: 96, "evidence-honesty": 92, tradeoffs: 86, value: 88 },
    ["Firmer focal pressure", "Still race-bag tiny"],
    ["Can feel sharp — ease in"],
    "Post-run focal soft-tissue ball when MB1 is too soft.",
  ),
  rec(
    "rec-rad-atom-travel-recovery",
    "prod-rad-atom",
    "uc-travel-recovery",
    84,
    { "practical-use": 84, comfort: 66, portability: 98, "evidence-honesty": 90, tradeoffs: 84, value: 86 },
    ["Hard precise ball", "Near-zero pack weight"],
    ["Intensity requires care"],
    "Ultra-portable precise soft-tissue ball for travel kits.",
  ),

  // ── Compression boots ──────────────────────────────────────────────────
  rec(
    "rec-normatec-3-home-recovery",
    "prod-normatec-3",
    "uc-home-recovery",
    82,
    { "practical-use": 84, comfort: 86, portability: 35, "evidence-honesty": 92, tradeoffs: 80, value: 58 },
    ["Hands-free full-leg routine", "Mature Hyperice ecosystem"],
    ["Expensive and not portable"],
    "Home pneumatic comfort routine after long runs — manufacturer recovery claims noted separately.",
  ),
  rec(
    "rec-normatec-3-high-mileage",
    "prod-normatec-3",
    "uc-high-mileage",
    80,
    { "practical-use": 82, comfort: 84, portability: 32, "evidence-honesty": 92, tradeoffs: 78, value: 56 },
    ["Useful between hard sessions at home", "Zone controls"],
    ["Does not replace rest or load management"],
    "High-mileage home comfort stack piece — honest about limits vs medical care.",
  ),
  rec(
    "rec-normatec-go-travel-recovery",
    "prod-normatec-go",
    "uc-travel-recovery",
    86,
    { "practical-use": 84, comfort: 82, portability: 90, "evidence-honesty": 92, tradeoffs: 86, value: 70 },
    ["Actually packs", "Calf-focused"],
    ["Not full-leg"],
    "Race-weekend pneumatic calf comfort when Normatec 3 stays home.",
  ),
  rec(
    "rec-normatec-go-post-run-recovery",
    "prod-normatec-go",
    "uc-post-run-recovery",
    80,
    { "practical-use": 80, comfort: 82, portability: 88, "evidence-honesty": 92, tradeoffs: 84, value: 68 },
    ["Battery sleeves", "Quick calf sessions"],
    ["Calves only"],
    "Post-run calf compression comfort aid — not a healing device.",
  ),
  rec(
    "rec-recoveryair-home-recovery",
    "prod-therabody-recoveryair",
    "uc-home-recovery",
    80,
    { "practical-use": 82, comfort: 84, portability: 38, "evidence-honesty": 90, tradeoffs: 78, value: 60 },
    ["Therabody stack synergy", "Full-leg home routine"],
    ["Premium price and storage"],
    "Therabody pneumatic home alternative to Normatec — comfort routine, not medical care.",
  ),

  // ── Recovery sandals ───────────────────────────────────────────────────
  rec(
    "rec-oolala-comfort",
    "prod-oofos-oolala",
    "uc-comfort",
    82,
    { "practical-use": 80, comfort: 90, portability: 84, "evidence-honesty": 94, tradeoffs: 86, value: 78 },
    ["Soft OOfoam walking", "Warm-weather thong"],
    ["Not for running"],
    "Cushioned walking after hard sessions in thong form — comfort footwear only.",
  ),
  rec(
    "rec-oocandoo-post-run-recovery",
    "prod-oofos-oocandoo",
    "uc-post-run-recovery",
    84,
    { "practical-use": 86, comfort: 88, portability: 82, "evidence-honesty": 94, tradeoffs: 86, value: 80 },
    ["Secure slide upper", "Easy throw-on after longs"],
    ["Brand-specific fit"],
    "Post-run cushioned walking slide when OOriginal thong is not secure enough.",
  ),
  rec(
    "rec-ora-slide-comfort",
    "prod-hoka-ora-recovery-slide",
    "uc-comfort",
    86,
    { "practical-use": 84, comfort: 94, portability: 74, "evidence-honesty": 92, tradeoffs: 84, value: 74 },
    ["Max HOKA cushion", "Secure strap"],
    ["Bulkier to pack than OOFOS"],
    "Plush post-session walking comfort if you already live in HOKA trainers.",
  ),
  rec(
    "rec-ora-slide-high-mileage",
    "prod-hoka-ora-recovery-slide",
    "uc-high-mileage",
    82,
    { "practical-use": 82, comfort: 92, portability: 72, "evidence-honesty": 92, tradeoffs: 82, value: 72 },
    ["Daily easy walking cushion", "Pairs with high training load"],
    ["Still not a training shoe"],
    "High-mileage easy-day walking cushion — rest and load management still lead.",
  ),

  // ── Compression garments ───────────────────────────────────────────────
  rec(
    "rec-cep-the-run-calf-high-mileage",
    "prod-cep-the-run-calf",
    "uc-high-mileage",
    78,
    { "practical-use": 80, comfort: 78, portability: 96, "evidence-honesty": 92, tradeoffs: 84, value: 80 },
    ["Packable calf sleeve", "Pairs with any socks"],
    ["Sizing must be precise"],
    "High-mileage comfort apparel — manufacturer compression claims noted; not injury prevention.",
  ),
  rec(
    "rec-compressport-r2-travel-recovery",
    "prod-compressport-r2",
    "uc-travel-recovery",
    80,
    { "practical-use": 78, comfort: 76, portability: 98, "evidence-honesty": 90, tradeoffs: 84, value: 78 },
    ["Tiny pack weight", "Race-kit familiar brand"],
    ["Feel differs from CEP"],
    "Travel calf-sleeve comfort layer for race weekends.",
  ),
  rec(
    "rec-2xu-refresh-travel-recovery",
    "prod-2xu-refresh-recovery",
    "uc-travel-recovery",
    78,
    { "practical-use": 76, comfort: 82, portability: 78, "evidence-honesty": 90, tradeoffs: 80, value: 72 },
    ["Full-leg coverage", "Plane/hotel lounging layer"],
    ["Warm in heat; precise sizing"],
    "Travel recovery tights for comfort lounging — not clinical compression therapy.",
  ),
  rec(
    "rec-2xu-refresh-comfort",
    "prod-2xu-refresh-recovery",
    "uc-comfort",
    80,
    { "practical-use": 78, comfort: 86, portability: 76, "evidence-honesty": 90, tradeoffs: 80, value: 72 },
    ["Post-run lounging comfort", "Recovery-line cut"],
    ["Not a race garment dump"],
    "Home/travel comfort tights after hard sessions.",
  ),

  // ── Mobility tools ─────────────────────────────────────────────────────
  rec(
    "rec-the-stick-post-run-recovery",
    "prod-the-stick",
    "uc-post-run-recovery",
    86,
    { "practical-use": 88, comfort: 80, portability: 90, "evidence-honesty": 94, tradeoffs: 88, value: 90 },
    ["No battery", "Fast calf/quad passes"],
    ["Less precise than a hard ball"],
    "Classic post-run soft-tissue stick — practical, claim-light, always ready.",
  ),
  rec(
    "rec-the-stick-travel-recovery",
    "prod-the-stick",
    "uc-travel-recovery",
    88,
    { "practical-use": 86, comfort: 78, portability: 92, "evidence-honesty": 94, tradeoffs: 88, value: 90 },
    ["Race-bag staple", "Works without charging"],
    ["Length still needs bag space"],
    "Travel mobility default when you want soft-tissue work without electronics.",
  ),
  rec(
    "rec-stp-home-recovery",
    "prod-triggerpoint-stp",
    "uc-home-recovery",
    78,
    { "practical-use": 80, comfort: 78, portability: 84, "evidence-honesty": 92, tradeoffs: 82, value: 82 },
    ["TriggerPoint ecosystem fit", "Standing calf work"],
    ["Overlaps The Stick"],
    "Home massage-stick option if you already buy GRID / MB tools.",
  ),
  rec(
    "rec-vyper-3-home-recovery",
    "prod-hyperice-vyper-3",
    "uc-home-recovery",
    78,
    { "practical-use": 80, comfort: 82, portability: 48, "evidence-honesty": 90, tradeoffs: 80, value: 68 },
    ["Vibration feel vs static rollers", "Hyperice stack fit"],
    ["Needs charging; bulky for travel"],
    "Powered home mobility roller — manufacturer vibration claims noted; comfort tool only.",
  ),
  rec(
    "rec-vyper-3-comfort",
    "prod-hyperice-vyper-3",
    "uc-comfort",
    76,
    { "practical-use": 76, comfort: 84, portability: 46, "evidence-honesty": 90, tradeoffs: 78, value: 66 },
    ["Lower bodyweight pressure option", "Three vibration speeds (mfr)"],
    ["Pricey vs GRID"],
    "Comfort-oriented vibrating roller when static foam feels too harsh.",
  ),
];
