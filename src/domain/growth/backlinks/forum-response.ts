import type { LinkableAsset, LinkRecommendation, SelfPromotionPolicy } from "./types";
import type { CommunityRulesStatus } from "./types";
import { kitleticsPublicUrl } from "./public-url";

export const FORUM_BANNED_PHRASES = [
  "check out kitletics",
  "the best running shoes",
  "don't miss",
  "dont miss",
  "game-changer",
  "game changer",
  "personally tested",
  "we tested this",
  "highly recommend kitletics",
  "visit kitletics.com",
];

export type ForumIntent =
  | "recommend_shoes"
  | "daily_trainer"
  | "model_vs"
  | "heel_drop"
  | "long_run"
  | "database"
  | "compare"
  | "watch"
  | "budget"
  | "hyrox"
  | "heavier_runner"
  | "marathon"
  | "other";

export function detectForumIntent(question: string): ForumIntent {
  const q = question.toLowerCase();
  if (/novablast|\bvs\.?\b|ghost\b|pegasus|vomero|versus/.test(q) && /vs|versus|or\b/.test(q)) {
    return "model_vs";
  }
  if (/heel drop|heel-to-toe|offset|drop\b/.test(q)) return "heel_drop";
  if (/database|dataset|stack height table/.test(q)) return "database";
  if (/compare running shoes|side by side|spec table/.test(q)) return "compare";
  if (/watch|gps|forerunner|coros|garmin/.test(q)) return "watch";
  if (/€\s*150|under 150|budget|cheap/.test(q)) return "budget";
  if (/hyrox/.test(q)) return "hyrox";
  if (/heavier|overweight|high bmi|over \d+ ?kg/.test(q)) return "heavier_runner";
  if (/marathon/.test(q)) return "marathon";
  if (/long run/.test(q)) return "long_run";
  if (/daily trainer|easy miles|recovery shoe/.test(q)) return "daily_trainer";
  if (/what running shoes|which shoe|recommend|should i buy/.test(q)) return "recommend_shoes";
  return "other";
}

export function assetIdForForumIntent(intent: ForumIntent): string[] {
  switch (intent) {
    case "database":
    case "budget":
      return ["asset-shoe-database", "asset-guide-choose-shoes"];
    case "heel_drop":
      return ["asset-guide-drop", "asset-shoe-database"];
    case "model_vs":
    case "compare":
      return ["asset-compare", "asset-shoe-database"];
    case "watch":
      return ["asset-best-running-watches", "asset-best-watches-beginners"];
    case "daily_trainer":
    case "long_run":
    case "marathon":
      return ["asset-best-daily-trainers", "asset-guide-choose-shoes", "asset-shoe-finder"];
    case "hyrox":
    case "recommend_shoes":
      return ["asset-shoe-finder", "asset-guide-choose-shoes"];
    case "heavier_runner":
      return ["asset-guide-choose-shoes", "asset-best-daily-trainers", "asset-shoe-finder"];
    default:
      return ["asset-shoe-finder", "asset-guide-choose-shoes", "asset-best-running-shoes"];
  }
}

export function pickForumAsset(
  assets: LinkableAsset[],
  intent: ForumIntent,
): LinkableAsset | undefined {
  const preferred = assetIdForForumIntent(intent);
  for (const id of preferred) {
    const hit = assets.find((a) => a.assetId === id && a.url && a.url !== "/");
    if (hit) return hit;
  }
  return assets.find((a) => a.url && a.url !== "/" && a.status === "live");
}

function hashVariant(seed: string, n: number): number {
  let h = 0;
  for (const ch of seed) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return n === 0 ? 0 : h % n;
}

export function decideLinkInclusion(input: {
  rulesStatus: CommunityRulesStatus;
  selfPromotionPolicy: SelfPromotionPolicy;
  pageDirectlyAnswers: boolean;
  addsData: boolean;
  userWouldBenefit: boolean;
  accountTrustOk: boolean;
  threadSpamSensitive: boolean;
}): { recommendation: LinkRecommendation; reason: string } {
  const helpful =
    input.pageDirectlyAnswers && input.addsData && input.userWouldBenefit;
  if (input.selfPromotionPolicy === "FORBIDDEN") {
    return {
      recommendation: "NO_LINK",
      reason: "Community self-promo policy is FORBIDDEN.",
    };
  }
  if (input.threadSpamSensitive) {
    return {
      recommendation: "NO_LINK",
      reason: "Thread is sensitive to promotional comments.",
    };
  }
  if (!input.accountTrustOk) {
    return {
      recommendation: helpful ? "NO_LINK" : "NO_LINK",
      reason:
        "Account trust/history is insufficient. Answer in text only; do not add a URL.",
    };
  }
  if (input.rulesStatus !== "KNOWN") {
    return {
      recommendation: "NO_LINK",
      reason:
        "RULES_UNKNOWN — post a helpful answer without a Kitletics URL until a human opens the community rules. LINK_RECOMMENDED is blocked.",
    };
  }
  if (!helpful) {
    return {
      recommendation: "NO_LINK",
      reason: "The answer can be complete without a Kitletics page.",
    };
  }
  if (
    input.selfPromotionPolicy === "RESOURCE_OK" ||
    input.selfPromotionPolicy === "DISCLOSURE_REQUIRED" ||
    input.selfPromotionPolicy === "ALLOWED"
  ) {
    return {
      recommendation: "LINK_RECOMMENDED",
      reason:
        "Known rules allow a resource link, and the page directly adds comparison or data the thread asked for.",
    };
  }
  return {
    recommendation: "LINK_OPTIONAL",
    reason: "Rules are known but the self-promo policy is not clearly resource-friendly.",
  };
}

function namedModels(question: string): string[] {
  const hits = question.match(
    /\b(novablast(?:\s*\d+)?|ghost(?:\s*\d+)?|pegasus(?:\s*\d+)?|vomero(?:\s*\d+)?|endorphin|superblast|clifton|glycerin|rebel|invincible)\b/gi,
  );
  return [...new Set((hits ?? []).map((h) => h.replace(/\s+/g, " ").trim()))].slice(0, 3);
}

function tradeoffFor(intent: ForumIntent, models: string[]): string {
  if (intent === "heel_drop") {
    return "The useful split is usually geometry plus how much stack you want, not a single 'correct' drop. Lower drop can feel more aggressive if you are used to 8–10 mm; higher drop is often easier on a tight calf.";
  }
  if (intent === "budget") {
    return "Under a hard price cap, I'd rather see a current daily trainer with honest stack/weight than stretch for a plated shoe that only works on race day.";
  }
  if (intent === "heavier_runner") {
    return "Heavier runners usually care more about a stable, durable daily foam than the lightest plated option. Soft and tall is fine if the platform doesn't dump you medially.";
  }
  if (intent === "hyrox") {
    return "HYROX days mix running with station work, so a daily trainer that stays planted in lunges usually beats a carbon racer that only feels good at threshold.";
  }
  if (intent === "watch") {
    return "The split is usually battery + reliable GPS vs. training-load toys you will actually use. Skip paying for triathlon maps if you only run.";
  }
  if (intent === "model_vs" && models.length >= 2) {
    return `Between ${models[0]} and ${models[1]}, the usual fork is ride firmness and how much daily-mileage durability you need versus a more rockered, softer foam.`;
  }
  if (intent === "long_run" || intent === "marathon") {
    return "Long-run cushioning and a race-day plate are different jobs. A max-stack daily trainer is often the safer marathon-training shoe; save the carbon for days you are actually racing.";
  }
  if (intent === "daily_trainer") {
    return "Daily trainers trade pop for durability. If you want something that survives easy miles, skip the lightest super-trainer until your weekly volume is already stable.";
  }
  return "The usual trade-off is cushioning and daily durability versus lightness and race-day snap. Most people training for general fitness are better on the former.";
}

function directAnswer(intent: ForumIntent, models: string[], v: number): string {
  if (intent === "model_vs" && models.length >= 2) {
    const opens = [
      `If you are choosing between ${models[0]} and ${models[1]}, start from the job: easy miles vs. tempo.`,
      `${models[0]} vs ${models[1]} is less about a winner and more about which ride you already like.`,
      `For ${models[0]} / ${models[1]}, I'd pick from weekly use first, then foam feel.`,
    ];
    return opens[v] ?? opens[0];
  }
  if (intent === "heel_drop") {
    return v === 0
      ? "There isn't a universal heel drop. Match the drop to the shoes you already run in, then change in small steps."
      : "I'd treat drop as a comfort/geometry choice, not a performance cheat code.";
  }
  if (intent === "budget") {
    return "I'd shortlist current daily trainers that still have verified prices in your range, then check weight and stack rather than chasing last year's plated leftover.";
  }
  if (intent === "database") {
    return "If you want to compare weight, drop, and stack across models, a filterable table is more useful than another Top 10.";
  }
  if (intent === "watch") {
    return "I'd narrow running watches by battery on your typical long run, GPS you trust in trees/city, and whether you will use the training metrics.";
  }
  if (intent === "hyrox") {
    return "For HYROX I'd look at a stable daily trainer first — something that still feels sane after lunges and wall balls, not a racing spike.";
  }
  if (intent === "heavier_runner") {
    return "I'd look at protective daily trainers with a broader platform, not the lightest plated shoe in the roundup.";
  }
  if (intent === "recommend_shoes" || intent === "daily_trainer" || intent === "other") {
    const opens = [
      "If you mainly want a daily trainer, I'd narrow it by surface, weekly mileage, and how much cushion you already like.",
      "Start with the job (easy miles, long run, or mixed training) and one must-have (cushion, stability, or price).",
      "I'd skip 'best shoe' lists and shortlist two or three models that share the same job.",
    ];
    return opens[v] ?? opens[0];
  }
  return "I'd start from the job the shoe has to do, then look at stack, drop, and weight rather than a generic ranking.";
}

export function containsBannedForumCopy(text: string): boolean {
  const n = text.toLowerCase();
  return FORUM_BANNED_PHRASES.some((p) => n.includes(p));
}

export function generateForumResponse(input: {
  question: string;
  intent: ForumIntent;
  threadUrl: string;
  asset?: LinkableAsset;
  linkRecommendation: LinkRecommendation;
  testedFirstHand?: boolean;
}): string {
  const models = namedModels(input.question);
  const v = hashVariant(`${input.threadUrl}|${input.question}`, 3);
  const direct = directAnswer(input.intent, models, v);
  const trade = tradeoffFor(input.intent, models);
  const tested = input.testedFirstHand
    ? ""
    : " This is spec and typical-use guidance — not a Kitletics wear-test of your pair.";

  let linkLine = "";
  const url = kitleticsPublicUrl(input.asset?.url);
  if (url && input.linkRecommendation === "LINK_RECOMMENDED") {
    linkLine = ` If useful, this page has the weight/drop/stack side by side: ${url}`;
  } else if (url && input.linkRecommendation === "LINK_OPTIONAL") {
    linkLine = ` If you want a table rather than another opinion, ${url} is a lookup — skip it if the shortlist above is enough.`;
  }

  const parts =
    v === 1
      ? [trade, direct + tested, linkLine]
      : v === 2
        ? [direct, linkLine, trade + tested]
        : [direct + tested, trade, linkLine];

  const text = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (containsBannedForumCopy(text)) {
    return `${direct} ${trade}${tested}`.replace(/\s+/g, " ").trim();
  }
  return text;
}
