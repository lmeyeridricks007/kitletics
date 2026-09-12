import {
  classifyDecisionLine,
  countDecisionWords,
} from "@/lib/decision-copy/classify";

const YOU_PREFIX =
  /^(you(?:'re| are)? looking for|you(?:'re| are)? primarily looking for|you want|you prefer|you need to avoid|you need|i(?:'d| would) (?:shortlist|pause|skip|rotate)|buy the \S[\s\S]{0,40}? when)\s+/i;

function endSentence(text: string): string {
  const t = text.trim().replace(/\s+/g, " ").replace(/[.]+$/, "");
  if (!t) return t;
  return `${t}.`;
}

function capitalize(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function clipDecisionWords(text: string, max = 18): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= max) return cleaned;
  let cut = words.slice(0, max).join(" ").replace(/[,:;–—-]+$/, "");
  cut = cut.replace(/\b(a|an|the|and|or|for|to|of|with|than|beside)$/i, "").trim();
  return cut;
}

export function stripProductName(text: string, productName?: string): string {
  if (!productName?.trim()) return text;
  const name = productName.trim();
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`\\bthe ${escaped}\\b`, "gi"), "")
    .replace(new RegExp(`\\b${escaped}\\b`, "gi"), "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

export function stripYouPrefix(line: string): string {
  return line
    .trim()
    .replace(YOU_PREFIX, "")
    .replace(/^you(?:'re| are)?\s+/i, "")
    .replace(/^to /i, "")
    .trim();
}

function polishSituation(raw: string): string {
  let t = raw.trim().replace(/\.$/, "");
  t = t.replace(/^(a |an )/i, "");
  t = t.replace(/^not a stability shoe.*/i, "Runners who need added stability or guidance");
  t = t.replace(/^added stability or guidance$/i, "Runners who need added stability or guidance");
  t = t.replace(
    /^the lightest race-day option$/i,
    "Those looking for a lightweight race-day shoe",
  );
  t = t.replace(
    /^(soft, energetic daily trainer|soft energetic daily trainer)$/i,
    "Daily training with a soft, energetic ride",
  );
  t = t.replace(
    /^enough cushioning for long runs without a heavy ride$/i,
    "Long runs where cushioning matters more than outright speed",
  );
  t = t.replace(
    /^neutral (shoe|daily trainer) with a lively rocker$/i,
    "Neutral miles with a lively rocker",
  );
  t = t.replace(/^firm, highly responsive ride$/i, "A firm, highly responsive ride");
  return t;
}

/** Buyer/use situation — Best For / Not Ideal For. */
export function toSituationLabel(
  line: string,
  polarity: "buy" | "skip",
  productName?: string,
): string {
  let t = stripProductName(line, productName);
  t = t.replace(/\s+[—–]\s+.+$/, "");
  t = t.replace(/\s+\([^)]+\)\s*$/, "");
  t = stripYouPrefix(t);
  t = polishSituation(t);
  if (polarity === "skip") {
    if (/^runners who |^those (looking|who) /i.test(t)) {
      // already a limitation phrase
    } else if (/^need /i.test(t) || /stability|guidance/i.test(t)) {
      t = /^runners who /i.test(t) ? t : `Runners who ${t.replace(/^need /i, "need ")}`;
    } else if (/^(looking for|prefer |want )/i.test(t)) {
      t = `Those who ${t}`;
    } else if (!/^(runners|those|anyone|people|buyers)/i.test(t)) {
      t = `Those looking for ${t.replace(/^(a |an )/i, "")}`;
    }
  }
  t = clipDecisionWords(t, 18);
  t = capitalize(t);
  return endSentence(t);
}

/** Second-person Buy If / Skip If. */
export function toDecisionLine(
  line: string,
  polarity: "buy" | "skip",
  productName?: string,
): string {
  let t = stripProductName(line, productName);
  t = t.replace(/\s+[—–]\s+.+$/, "");
  if (YOU_PREFIX.test(t) || /^you\b/i.test(t) || /^i['’]d /i.test(t)) {
    t = clipDecisionWords(t, 18);
    t = capitalize(t);
    return endSentence(t);
  }
  const clipped = clipDecisionWords(t, 18);
  if (countDecisionWords(clipped) >= 8) {
    return endSentence(capitalize(clipped));
  }
  const situation = stripYouPrefix(t).replace(/\.$/, "");
  if (polarity === "buy") {
    if (/^daily training|^long runs|^neutral /i.test(situation)) {
      t = `You're looking for ${situation.charAt(0).toLowerCase()}${situation.slice(1)}`;
    } else {
      t = `You want ${situation.charAt(0).toLowerCase()}${situation.slice(1)}`;
    }
  } else if (/stability|guidance/i.test(situation)) {
    t = "You need added stability or guidance";
  } else if (/race-day|lightest race|race shoe/i.test(situation)) {
    t = "You're primarily looking for the lightest race-day option";
  } else if (/^need /i.test(situation)) {
    t = `You ${situation}`;
  } else {
    t = `You prefer ${situation.charAt(0).toLowerCase()}${situation.slice(1)}`;
  }
  t = clipDecisionWords(t, 18);
  t = capitalize(t);
  return endSentence(t);
}

export function toTraitBullet(line: string, productName?: string): string {
  let t = stripProductName(line, productName);
  t = t.replace(/^you (?:want|get|need) /i, "");
  t = clipDecisionWords(t, 16);
  t = capitalize(t);
  return endSentence(t);
}

export function salvageDecisionLine(
  line: string,
  role: "buyIf" | "skipIf" | "bestFor" | "notIdealFor" | "pro" | "con",
  productName?: string,
): string {
  const polarity = role === "skipIf" || role === "notIdealFor" ? "skip" : "buy";
  if (role === "pro" || role === "con") return toTraitBullet(line, productName);
  if (role === "bestFor" || role === "notIdealFor") {
    return toSituationLabel(line, polarity, productName);
  }
  return toDecisionLine(line, polarity, productName);
}

export function isDisplayReady(
  line: string,
  role: "buyIf" | "skipIf" | "bestFor" | "notIdealFor" | "pro" | "con",
): boolean {
  const max = role === "pro" || role === "con" ? 16 : 18;
  const cls = classifyDecisionLine(line, { maxWords: max });
  if (cls === "MACHINE_LIKE" || cls === "BROKEN" || cls === "CONFUSING") {
    return false;
  }
  if (cls === "WORDY" || cls === "GENERIC") return false;
  if ((role === "bestFor" || role === "notIdealFor") && /^you\b/i.test(line)) {
    return false;
  }
  if ((role === "buyIf" || role === "skipIf") && !/^you\b/i.test(line) && !/^i['’]d /i.test(line)) {
    return countDecisionWords(line) >= 5 && classifyDecisionLine(line) === "GOOD";
  }
  return cls === "GOOD";
}
