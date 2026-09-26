import {
  classifyDecisionLine,
  countDecisionWords,
} from "@/lib/decision-copy/classify";
import {
  rewriteUniquenessEraSkipProse,
  skipSentenceFromLimitation,
} from "@/lib/review/rewrite-uniqueness-era-skip";

const YOU_PREFIX =
  /^(you(?:'re| are)? looking for|you(?:'re| are)? primarily looking for|you want|you prefer|you need to avoid|you need|i(?:'d| would) (?:shortlist|pause|skip|rotate)|buy the \S[\s\S]{0,40}? when)\s+/i;

/** Full editorial wrappers that leave "it when" / "it if" residue if only half-stripped. */
const EDITORIAL_WRAPPER =
  /^(?:i(?:'d| would)\s+shortlist\s+it\s+when\s+|i(?:'d| would)\s+(?:pause|skip)(?:\s+it)?\s+if\s+|i(?:'d| would)\s+(?:shortlist|pause|skip|rotate)\s+)/i;

const STEM_RESIDUE = /^(?:it\s+when\s+|it\s+if\s+|looking for\s+(?:it\s+)?(?:if\s+|not\s+)?)/i;

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
    .replace(EDITORIAL_WRAPPER, "")
    .replace(YOU_PREFIX, "")
    .replace(/^you(?:'re| are)?\s+/i, "")
    .replace(/^to /i, "")
    .replace(STEM_RESIDUE, "")
    .trim();
}

function skipSentenceToSituation(text: string): string {
  let t = text.trim().replace(/[.,;:]+$/, "");
  t = t.replace(/^skip it if you(?:'re| are)? looking for /i, "People looking for ");
  t = t.replace(/^skip it if you need /i, "People who need ");
  t = t.replace(/^choose another jacket if you need /i, "People who need ");
  t = t.replace(/^skip it if /i, "People who need it when ");
  return t;
}

/** "Not the Hybrid if you want X" → complete person phrase. */
function notTheSiblingToSituation(text: string): string {
  const m =
    /^not the (.+?) if you (?:want|prefer|need) (.+)$/i.exec(
      text.trim().replace(/[.,;:]+$/, ""),
    );
  if (m) {
    const sibling = m[1]!.trim();
    const desire = m[2]!.trim();
    return `Players who prefer the ${sibling} for ${desire.replace(/^(a |an |the )/i, "")}`;
  }
  const bare = /^not the (.+)$/i.exec(text.trim().replace(/[.,;:]+$/, ""));
  if (bare) {
    return `Players who specifically want the ${bare[1]!.trim()}`;
  }
  return text;
}

function polishSituation(raw: string): string {
  let t = raw.trim().replace(/\.$/, "");
  t = t.replace(/^(a |an )/i, "");
  if (/^(skip it if|choose another)/i.test(t)) {
    t = skipSentenceToSituation(t);
  }
  if (/^not the /i.test(t)) {
    t = notTheSiblingToSituation(t);
  }
  if (/^(not|n't)\s+(a |an |for |built for |ideal )/i.test(t)) {
    t = skipSentenceToSituation(skipSentenceFromLimitation(t));
  }
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
  t = t.replace(
    /^firm, highly responsive ride$/i,
    "Players who prefer a firm, highly responsive ride",
  );
  t = t.replace(
    /^a firm, highly responsive ride$/i,
    "Players who prefer a firm, highly responsive ride",
  );
  return t;
}

function isPersonPhrase(t: string): boolean {
  return /^(runners who |those (looking|who) |people (who|looking) |anyone |players who |buyers who |advanced |intermediate |beginner )/i.test(
    t,
  );
}

/** True when remnant already starts with a verb suitable after "Players who". */
function startsWithSituationVerb(t: string): boolean {
  return /^(need|want|prefer|looking|already|still|primarily|care|match|live|generate|play|pack|know|are|can|will|specifically|understand)\b/i.test(
    t,
  );
}

/** Gerund / progressive clause that needs "are" after "Players who". */
function startsWithProgressiveClause(t: string): boolean {
  return /^(choosing|building|developing|looking|shopping|learning|playing|working|trying|comparing|deciding)\b/i.test(
    t,
  );
}

/**
 * Turn short telegram labels into complete situations.
 * Never invent "who need finishing power…" peer-template glue.
 */
function expandAudienceFragment(t: string, polarity: "buy" | "skip"): string {
  const words = countDecisionWords(t);
  if (words >= 6 && /\b(who|when|where|with|for)\b/i.test(t)) return t;
  const noun = t.replace(/^(a |an |the )/i, "").trim();
  if (!noun) return t;

  // Spec-dump / manufacturer-note fragments must not become "Players who prefer Manufacturer…"
  const salvaged = salvageSpecDumpFragment(noun, polarity);
  if (salvaged) return salvaged;

  if (words <= 5 && !/\b(who|when|where)\b/i.test(t)) {
    if (polarity === "skip") {
      return `Players looking for ${noun.charAt(0).toLowerCase()}${noun.slice(1)}`;
    }
    // Prefer concrete verb phrases over "want <noun fragment>"
    const lowered = noun.charAt(0).toLowerCase() + noun.slice(1);
    if (/^(to |a |an )/i.test(noun)) {
      return `Players who want ${lowered}`;
    }
    return `Players who prefer ${lowered}`;
  }
  return t;
}

/** Rewrite catalog/spec telegram strengths into reader situations. */
function salvageSpecDumpFragment(
  noun: string,
  polarity: "buy" | "skip",
): string | null {
  const t = noun.trim();
  if (!t) return null;
  if (
    !/^(manufacturer|official|published|\d{4} range)\b/i.test(t) &&
    !/\brange notes\b/i.test(t) &&
    !/\+\s*\d+k\b/i.test(t)
  ) {
    return null;
  }
  if (polarity === "skip") {
    if (/diamond|12k|18k|attack/i.test(t)) {
      return "Players who do not want a stiff diamond attack mould";
    }
    if (/beginner|soft|round|comfort/i.test(t)) {
      return "Players who have outgrown a soft beginner round";
    }
    return "Players looking for a different published mould job";
  }
  if (/diamond/i.test(t) && /(12k|18k|multieva|attack)/i.test(t)) {
    return "Players who want a published diamond attack stack with the current carbon and core story";
  }
  if (/round/i.test(t) && /(soft|fiberglass|comfort|beginner)/i.test(t)) {
    return "Players who want a soft round comfort mould from the current range";
  }
  if (/beginner/i.test(t)) {
    return "Players who want a published beginner / control-first racket";
  }
  if (/\brange notes\b/i.test(t) || /^\d{4} range\b/i.test(t)) {
    return "Players who want the current-range comfort mould described in the manufacturer notes";
  }
  return "Players who want this mould’s published construction story — not a colourway change";
}

/**
 * Convert second-person / editorial lines into situations BEFORE stripping
 * the verb (avoids "Players who carbon step-up…").
 */
function youOrEditorialToSituation(raw: string): string | null {
  const t = raw.trim().replace(/[.,;:]+$/, "");
  const shortlist = /^i(?:'d| would)\s+shortlist\s+it\s+when\s+(.+)$/i.exec(t);
  if (shortlist) {
    const rest = shortlist[1]!.replace(/^you(?:'re| are)?\s+/i, "").trim();
    if (startsWithSituationVerb(rest) || startsWithProgressiveClause(rest)) {
      return startsWithProgressiveClause(rest)
        ? `Players who are ${rest}`
        : `Players who ${rest}`;
    }
    return `Players who want ${rest}`;
  }
  const skipIf =
    /^i(?:'d| would)\s+(?:pause|skip)(?:\s+it)?\s+if\s+(.+)$/i.exec(t);
  if (skipIf) {
    const rest = skipIf[1]!.replace(/^you(?:'re| are)?\s+/i, "").trim();
    if (startsWithProgressiveClause(rest)) {
      return `Players who are ${rest}`;
    }
    if (startsWithSituationVerb(rest)) {
      return `Players who ${rest}`;
    }
    return `Players who ${rest}`;
  }
  // "You are choosing / still building…" → keep auxiliary (not "You're looking for")
  const youAreProgressive =
    /^you(?:'re| are)\s+((?:still|already|primarily)\s+)?(choosing|building|developing|shopping|learning|playing|working|trying|comparing|deciding)\b(.*)$/i.exec(
      t,
    );
  if (youAreProgressive) {
    const lead = (youAreProgressive[1] ?? "").trim();
    const gerund = youAreProgressive[2]!;
    const rest = (youAreProgressive[3] ?? "").trim();
    const clause = [lead, gerund, rest].filter(Boolean).join(" ");
    return `Players who are ${clause}`;
  }
  const youNeed = /^you need\s+(.+)$/i.exec(t);
  if (youNeed) {
    const rest = youNeed[1]!.trim();
    if (/stability|guidance/i.test(rest)) {
      return `Runners who need ${rest}`;
    }
    return `Players who need ${rest}`;
  }
  const youPrefer = /^you prefer\s+(.+)$/i.exec(t);
  if (youPrefer) return `Players who prefer ${youPrefer[1]!.trim()}`;
  const youSpecifically = /^you specifically want\s+(.+)$/i.exec(t);
  if (youSpecifically) {
    return `Players who specifically want ${youSpecifically[1]!.trim()}`;
  }
  const youUnderstand = /^you understand\s+(.+)$/i.exec(t);
  if (youUnderstand) {
    return `Players who understand ${youUnderstand[1]!.trim()}`;
  }
  // Do not early-convert "You want …" — polishSituation owns use-case rewrites
  // (e.g. cushioning → "Long runs where…").
  return null;
}

/** Buyer/use situation — Best For / Not Ideal For. Complete statements only. */
export function toSituationLabel(
  line: string,
  polarity: "buy" | "skip",
  productName?: string,
): string {
  let t = stripProductName(line, productName);
  t = t.replace(/\s+[—–]\s+.+$/, "");
  t = t.replace(/\s+\([^)]+\)\s*$/, "");

  // Already a complete person phrase — keep (after light polish).
  if (/^(players|runners|anyone|those|people) who\b/i.test(t) && countDecisionWords(t) >= 5) {
    t = t.replace(/^anyone who /i, "Players who ");
    t = t.replace(/^people who /i, "Players who ");
    t = t.replace(/^those who /i, "Players who ");
    return t.replace(/\.$/, "");
  }

  // Negated product claims are not situations ("Not a fake diamond").
  if (/^not a\b/i.test(t) || /^not an?\b/i.test(t)) {
    return polarity === "skip"
      ? `Players looking for ${t.replace(/^not an?\s+/i, "").replace(/^not a\s+/i, "")}`
      : `Players who want an honest published mould — not ${t.replace(/^not an?\s+/i, "").replace(/^not a\s+/i, "")}`;
  }

  const early = youOrEditorialToSituation(t);
  if (early) {
    t = early;
  } else {
    t = stripYouPrefix(t);
    t = polishSituation(t);
  }
  t = t.replace(STEM_RESIDUE, "").trim();

  const isUseCaseSituation =
    /^(daily training|long runs|neutral miles)\b/i.test(t);

  if ((isPersonPhrase(t) && countDecisionWords(t) >= 4) || isUseCaseSituation) {
    // already a complete situation (person phrase or polished use-case)
  } else if (/^need /i.test(t) || (/stability|guidance/i.test(t) && polarity === "skip")) {
    t = /^runners who /i.test(t)
      ? t
      : /stability|guidance/i.test(t)
        ? `Runners who ${t.replace(/^need /i, "need ")}`
        : `Players who ${t.replace(/^need /i, "need ")}`;
  } else if (startsWithProgressiveClause(t)) {
    t = `Players who are ${t}`;
  } else if (/^(still|already|primarily)\b/i.test(t)) {
    // "still building…" needs auxiliary "are"
    t = startsWithProgressiveClause(t.replace(/^(still|already|primarily)\s+/i, ""))
      ? `Players who are ${t}`
      : `Players who are ${t}`;
  } else if (startsWithSituationVerb(t)) {
    t = `Players who ${t}`;
  } else if (/^(looking for|prefer |want )/i.test(t)) {
    t = `Players who ${t}`;
  } else if (/^(if |not |it )/i.test(t)) {
    t = `Players who ${t.replace(/^(if |it )/i, "")}`;
  } else if (!/^(runners|those|anyone|people|buyers|players)/i.test(t)) {
    // Noun / adjective remnants → prefer/looking-for, never "Players who <noun…>"
    if (polarity === "skip") {
      t = /^a |^an |^the /i.test(t)
        ? `Players who prefer ${t.replace(/^(a |an |the )/i, "")}`
        : expandAudienceFragment(t, "skip");
    } else if (countDecisionWords(t) <= 5) {
      t = expandAudienceFragment(t, "buy");
    }
    if (!isPersonPhrase(t) && !startsWithSituationVerb(t) && !/^players who are /i.test(t)) {
      const bare = t.replace(/^(a |an |the )/i, "");
      if (startsWithProgressiveClause(bare)) {
        t = `Players who are ${bare}`;
      } else {
        t =
          polarity === "skip"
            ? `Players looking for ${bare}`
            : `Players who prefer ${bare}`;
      }
    }
  }

  // Final guard: never emit stem residue or verb-less "Players who <noun>".
  t = t.replace(/^those looking for\s+(it\s+|if\s+|not\s+)/i, "Players who ");
  t = t.replace(/^it\s+when\s+/i, "Players who ");
  t = t.replace(/^it\s+if\s+/i, "Players who ");
  // Fix "Players who still building" / "Players who choosing"
  t = t.replace(
    /^players who (still|already|primarily) (choosing|building|developing|looking|shopping|learning|playing)\b/i,
    "Players who are $1 $2",
  );
  t = t.replace(
    /^players who (choosing|building|developing|looking|shopping|learning|playing)\b/i,
    "Players who are $1",
  );
  // Never "prefer specifically want" — specifically want is already a verb phrase
  t = t.replace(/\bprefer specifically want\b/gi, "specifically want");
  t = t.replace(/\bwant specifically want\b/gi, "specifically want");
  t = t.replace(/\bwant choosing\b/gi, "are choosing");
  if (
    /^players who /i.test(t) &&
    !/^players who (?:need|want|prefer|looking|already|still|primarily|care|match|live|generate|play|pack|know|are|can|will|specifically|understand)\b/i.test(
      t,
    )
  ) {
    t = t.replace(/^players who /i, "Players who prefer ");
  }
  t = t.replace(/\b(prefer|want|need)\s+\1\b/gi, "$1");

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
  if (
    EDITORIAL_WRAPPER.test(t) ||
    YOU_PREFIX.test(t) ||
    /^you\b/i.test(t) ||
    /^i['’]d /i.test(t)
  ) {
    // Keep complete editorial sentences; only normalize casing/length.
    if (EDITORIAL_WRAPPER.test(t) || /^i['’]d /i.test(t)) {
      t = clipDecisionWords(t, 22);
      t = capitalize(t);
      return endSentence(t);
    }
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
  } else if (
    /^(not|n't)\s+(a |an |for |built for |ideal )/i.test(situation) ||
    /^(skip it if|choose another)/i.test(situation)
  ) {
    t = /^(skip it if|choose another)/i.test(situation)
      ? situation
      : skipSentenceFromLimitation(situation);
  } else if (/^not the /i.test(situation)) {
    const sit = notTheSiblingToSituation(situation);
    t = `You ${sit.replace(/^players who /i, "").replace(/^Players who /i, "")}`;
    if (!/^you\b/i.test(t)) {
      t = `You prefer ${situation.replace(/^not the /i, "the ").toLowerCase()}`;
    }
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
  let rewritten = rewriteUniquenessEraSkipProse(line);
  const fragment = rewritten.trim().replace(/[.,;:]+$/g, "");
  if (/^(not|n't)\s+(a |an |for |built for |ideal )/i.test(fragment)) {
    rewritten = skipSentenceFromLimitation(fragment);
  }
  const polarity = role === "skipIf" || role === "notIdealFor" ? "skip" : "buy";
  if (role === "pro" || role === "con") return toTraitBullet(rewritten, productName);
  if (role === "bestFor" || role === "notIdealFor") {
    return toSituationLabel(rewritten, polarity, productName);
  }
  if (role === "buyIf") {
    return composeBuyIfSentence(rewritten, productName);
  }
  if (role === "skipIf") {
    return composeSkipIfSentence(rewritten, productName);
  }
  return toDecisionLine(rewritten, polarity, productName);
}

/**
 * Complete Buy-if sentence from a seed.
 * Prefer "You want …". Never wrap seeds that already contain person/you phrasing
 * inside "I'd shortlist it if you want …".
 */
export function composeBuyIfSentence(seed: string, productName?: string): string {
  const t = stripProductName(seed, productName).trim().replace(/[.,;:]+$/, "");
  if (!t) return "You want a clear weekly role for this product.";

  if (/^you\b/i.test(t)) {
    return endSentence(capitalize(t));
  }
  if (/^i['’]d\s+(?:shortlist|buy|rather)/i.test(t)) {
    return endSentence(capitalize(t));
  }

  const playersWant =
    /^(?:players|runners|anyone|people|those|buyers)\s+who\s+(?:want|prefer)\s+(.+)$/i.exec(
      t,
    );
  if (playersWant) {
    return endSentence(`You want ${playersWant[1]!.trim()}`);
  }
  const playersNeed =
    /^(?:players|runners|anyone|people|those|buyers)\s+who\s+need\s+(.+)$/i.exec(t);
  if (playersNeed) {
    return endSentence(`You need ${playersNeed[1]!.trim()}`);
  }
  const playersLooking =
    /^(?:players|runners|anyone|people|those|buyers)\s+(?:who\s+are\s+)?looking\s+for\s+(.+)$/i.exec(
      t,
    );
  if (playersLooking) {
    return endSentence(`You want ${playersLooking[1]!.trim()}`);
  }
  const playersWho =
    /^(?:players|runners|anyone|people|those|buyers)\s+who\s+(.+)$/i.exec(t);
  if (playersWho) {
    const rest = playersWho[1]!.trim();
    if (startsWithSituationVerb(rest) || startsWithProgressiveClause(rest)) {
      return endSentence(
        startsWithProgressiveClause(rest)
          ? `You are ${rest}`
          : `You ${rest}`,
      );
    }
    return endSentence(`You want ${rest}`);
  }

  return toDecisionLine(t, "buy", productName);
}

/**
 * Complete Skip-if sentence from a seed.
 * Prefer "You …" / "Skip it if you …". Never append "is most of your week" to
 * long already-complete clauses.
 */
export function composeSkipIfSentence(seed: string, productName?: string): string {
  const t = stripProductName(seed, productName).trim().replace(/[.,;:]+$/, "");
  if (!t) return "Skip it if this role is not your week.";

  if (/^skip it if\b/i.test(t) || /^you\b/i.test(t) || /^i['’]d\s+(?:skip|pause)/i.test(t)) {
    return endSentence(capitalize(t));
  }

  return skipSentenceFromLimitation(t);
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
  // Buy/Skip must be You-sentences (or complete I'd editorial). Person-phrases belong in Best For.
  if (
    (role === "buyIf" || role === "skipIf") &&
    /^(?:players|runners|anyone|people|those|buyers)\s+who\b/i.test(line)
  ) {
    return false;
  }
  if ((role === "buyIf" || role === "skipIf") && !/^you\b/i.test(line) && !/^i['’]d /i.test(line)) {
    return countDecisionWords(line) >= 5 && classifyDecisionLine(line) === "GOOD";
  }
  return cls === "GOOD";
}
