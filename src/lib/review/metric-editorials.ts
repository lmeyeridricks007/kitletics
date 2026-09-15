import type { Review, ScoreBreakdownItem } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import { getReviewCriteriaDefinitions } from "@/repositories";

/** One-line metric framing — keep short; the product note does the real work. */
const METRIC_MEANING: Record<string, string> = {
  cushioning: "Softness and protection underfoot for the miles this shoe is built for.",
  ride: "How it feels once you are moving — smooth, soft, lively, or firm.",
  comfort: "Everyday fit comfort in the sessions this shoe is meant for.",
  fit: "Length, width, lockdown and how the last matches your foot.",
  stability: "How planted it feels — neutral daily versus guidance/support.",
  durability: "How the foam, upper and outsole are likely to hold up with real use.",
  value: "Whether the strengths are worth the price for how often you will use them.",
  responsiveness: "Snap when you pick up the pace.",
  versatility: "How many different session types it can handle well.",
  grip: "Outsole traction for the surfaces it is meant for.",
  "gps-accuracy": "How consistently it tracks pace, distance and route shape.",
  battery: "Smartwatch and GPS endurance for the sessions this watch is built for.",
  maps: "On-device mapping and navigation usefulness on the run.",
  "training-features": "Workouts, dynamics and coaching tools you will actually use.",
  "recovery-features": "Readiness, sleep and recovery metrics between hard days.",
  interface: "Buttons, touchscreen and daily usability under training stress.",
  "smartwatch-features": "Notifications, music, payments and everyday phone pairing.",
  control: "How precisely it places the ball or shot.",
  power: "How easily it helps generate pace or force.",
  spin: "How readily it helps add spin.",
  forgiveness: "How playable it stays on off-centre hits.",
  maneuverability: "How quickly it lets you change direction.",
  noise: "How loud it is in normal home or gym use.",
};

function scoreBand(score: number): string {
  if (score >= 92) return "Excellent";
  if (score >= 85) return "Very strong";
  if (score >= 78) return "Good";
  if (score >= 70) return "Solid";
  if (score >= 60) return "Mixed";
  return "Limited";
}

function soft(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Public-facing rewrite of short gauge notes (no research jargon). */
export function friendlyScoreNote(note: string, key = ""): string {
  const n = note.trim();
  if (!n) return "";
  const lower = n.toLowerCase();
  if (
    lower === "manufacturer sheet" ||
    lower === "manufacturer sheet." ||
    lower === "inferred from specs" ||
    lower === "inferred from specs." ||
    lower.includes("manufacturer sheet") ||
    lower.includes("inferred from specs") ||
    lower.includes("research estimate") ||
    lower.includes("wear-logged") ||
    lower.includes("street price lives in offers") ||
    lower.includes("not a popularity rank") ||
    lower.includes("generic glossary") ||
    (key === "durability" && /estimate|research/i.test(n))
  ) {
    // Never show methodology disclaimers under the gauges.
    return "";
  }
  if (lower.includes("neutral platform")) {
    return "Neutral — not a guidance shoe.";
  }
  return n.endsWith(".") || n.endsWith("…") ? n : `${n}.`;
}

function findRelated(
  review: Review,
  key: string,
): { pro?: string; con?: string } {
  const hay =
    key === "comfort" || key === "fit"
      ? /fit|comfort|width|sizing|last|roomy|narrow|limited widths/
      : key === "cushioning"
        ? /cushion|soft|plush|stack|protective|foam/
        : key === "ride" || key === "responsiveness"
          ? /ride|snappy|tempo|bounce|energy|lively|firm|workout/
          : key === "stability"
            ? /stabil|guidance|neutral|support|planted|tippy/
            : key === "durability"
              ? /durab|wear|upper|outsole|rotate|foam/
              : key === "value"
                ? /price|value|premium|cost|pegasus/
                : key === "versatility"
                  ? /versatil|mixed|do.?everything|one shoe/
                  : key === "gps-accuracy"
                    ? /gps|gnss|track|multi-band|accuracy/
                    : key === "battery"
                      ? /battery|charge|gps.?mode|endurance/
                      : key === "maps"
                        ? /map|navigation|topo|offline/
                        : key === "training-features"
                          ? /training|workout|coach|metric|dynamics|structured/
                          : key === "recovery-features"
                            ? /recovery|readiness|sleep|hrv|body battery/
                            : key === "interface"
                              ? /interface|button|touch|menu|usability|complex/
                              : key === "smartwatch-features"
                                ? /music|payment|notification|smart|ecosystem|connect/
                                : key === "power"
                                  ? /power|pace|smash|attack|diamond|finish/
                                  : key === "control"
                                    ? /control|placement|precision|touch|drop/
                                    : key === "forgiveness"
                                      ? /forgiv|sweet|mishit|round|off-?centre|off-?center/
                                      : key === "maneuverability"
                                        ? /maneuver|handling|light|recovery|quick|tip/
                                        : key === "spin"
                                          ? /spin|texture|brush|3d|silica/
                  : null;
  if (!hay) return {};
  return {
    pro: review.pros.find((p) => hay.test(p)),
    con: review.cons.find((c) => hay.test(c)),
  };
}

function productInsight(
  item: ScoreBreakdownItem,
  review: Review,
  productName: string,
): string {
  const { pro, con } = findRelated(review, item.key);
  const note = item.note ? friendlyScoreNote(item.note, item.key) : "";
  const short = productName.replace(/ Review$/i, "");
  const band = scoreBand(item.score);

  switch (item.key) {
    case "cushioning":
      return [
        pro
          ? `${band} here because ${soft(pro)} is the main job.`
          : `${band} cushioning for the sessions ${short} is built for.`,
        con
          ? `Trade-off: ${soft(con)} — keep workouts in a snappier shoe.`
          : `Buy it for easy/recovery protection, not tempo snap.`,
      ]
        .filter(Boolean)
        .join(" ");

    case "ride":
    case "responsiveness":
      return [
        pro
          ? `Ride stays in its lane: ${soft(pro)}.`
          : `${band} ride for the sessions this shoe is meant to cover.`,
        con
          ? `I'd keep faster work elsewhere — ${soft(con)}.`
          : `Match it to easy miles; do not expect race-day pop.`,
      ]
        .filter(Boolean)
        .join(" ");

    case "comfort":
    case "fit":
      return [
        pro
          ? `Fit works well when ${soft(pro).replace(/\.$/, "")} matches your foot.`
          : `${band} everyday comfort if the last already suits you.`,
        con
          ? `${con.replace(/\.$/, "")} — wide feet should try a brand with a real width ladder.`
          : note ||
            `Start with your usual size and check width on an easy jog.`,
      ]
        .filter(Boolean)
        .join(" ");

    case "stability":
      if (note && /neutral/i.test(note)) {
        return `Neutral platform — fine if you already run happily without guidance. If you need medial support, pick a GTS/Kayano/Structure peer instead of forcing ${short} to do that job.`;
      }
      return [
        note || `${band} stability for its category role.`,
        con ? `Caveat: ${soft(con)}.` : undefined,
        pro ? `Helps when ${soft(pro)}.` : undefined,
      ]
        .filter(Boolean)
        .join(" ");

    case "durability":
      return [
        pro
          ? `Durability outlook is solid when ${soft(pro)}.`
          : `Soft dailies usually fade in the foam before the upper looks worn — rotate when you can.`,
        con
          ? `Watch: ${soft(con)}.`
          : `Retire it when the ride goes dead, not when the colourway still looks fine.`,
      ]
        .filter(Boolean)
        .join(" ");

    case "value":
      return [
        pro
          ? `Worth it when you will actually use ${soft(pro)} most weeks.`
          : `${band} value if the shoe's main job matches your week.`,
        con
          ? `Weaker value if ${soft(con)} is your reality — compare peers before paying the premium.`
          : `Check live street price; skip it if a cheaper peer covers the same sessions.`,
      ]
        .filter(Boolean)
        .join(" ");

    case "versatility":
      return [
        `${band} as a do-one-job tool more than a do-everything shoe.`,
        con
          ? `${soft(con)} — that is why the score is not higher.`
          : pro
            ? `Strongest when ${soft(pro)}.`
            : `Use it for its lane; rotate for other sessions.`,
      ]
        .filter(Boolean)
        .join(" ");

    default:
      return [
        note || `${band} on ${item.label.toLowerCase()} for how ${short} is meant to be used.`,
        pro ? `Helps: ${soft(pro)}.` : undefined,
        con ? `Limits: ${soft(con)}.` : undefined,
      ]
        .filter(Boolean)
        .join(" ");
  }
}

export interface MetricEditorial {
  key: string;
  label: string;
  displayScore: string;
  band: string;
  meaning: string;
  why: string;
}

export function buildMetricEditorials(
  items: ScoreBreakdownItem[],
  review: Review,
  categoryId?: string,
  product?: Product,
): MetricEditorial[] {
  const defs = categoryId
    ? getReviewCriteriaDefinitions(categoryId)
    : [];
  const defByKey = new Map(defs.map((d) => [d.key, d]));
  const productName =
    product?.fullName?.trim() ||
    review.title.replace(/\s+Review$/i, "").trim() ||
    "this product";

  return items.map((item) => {
    const def = defByKey.get(item.key);
    const meaning =
      METRIC_MEANING[item.key] ??
      def?.description ??
      `How this product performs on ${item.label.toLowerCase()}.`;

    return {
      key: item.key,
      label: item.label,
      displayScore: (item.score / 10).toFixed(1),
      band: scoreBand(item.score),
      meaning,
      why: productInsight(item, review, productName),
    };
  });
}
