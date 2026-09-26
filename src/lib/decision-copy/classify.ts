import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import type { DecisionLineClass } from "@/lib/decision-copy/types";

export function countDecisionWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const MACHINE_RES: RegExp[] = [
  /already decided the lane/i,
  /headline trait/i,
  /whatever\s+\S[\s\S]{0,40}?optimizes for/i,
  /catalogued to deliver/i,
  /when its main job matches most of your week/i,
  /will rotate or compare against/i,
  /do-everything compromise/i,
  /this exact .+ brief on /i,
  /walk away from .+ when /i,
  /best audience for .+:/i,
  /shows up more often in your (plan|week)/i,
  /\bintendedJob\b/,
  /one-tool-for-every-session/i,
  /catalog pass/i,
  /\bconcatenated\b/i,
  /\btaxonomy\b/i,
  /use-case ids?\b/i,
  /catalogued as a /i,
  /not a crossover default/i,
  /catalog role/i,
  /keep paying for week after week/i,
  /gates\s+[A-Z]/,
  /that is the .+ main job/i,
  /forcing the .+ into that job/i,
  /must-haves conflict with a .+ trade-off/i,
  /more than a generic category pick/i,
  /^players who prefer manufacturer\b/i,
  /^players who prefer official\b/i,
  /^players who prefer \d{4} range notes\b/i,
  /^players who prefer default\b/i,
  /best when you are players who\b/i,
  /want the official\s*:/i,
];

const BROKEN_RES: RegExp[] = [
  /you need not a /i,
  /look elsewhere if not /i,
  /i'd pause if not /i,
  /you need not [a-z]/i,
  /\[object Object\]/,
  /^it when\b/i,
  /^it if\b/i,
  /those looking for\s+(it|if|not)\b/i,
  /those looking for\s+not\b/i,
  // Telegram glue: "Those looking for Advanced attackers." (requires a capital after "for ")
  /looking for [A-Z][A-Za-z]*(?:\s+[a-z]+){0,3}\.?$/,
  // Double-prefixed editorial stems
  /i['’]d shortlist it when:?\s*i['’]d shortlist/i,
  /i['’]d pause if:?\s*i['’]d (?:pause|skip)/i,
  /i['’]d pause if:?\s*i['’]d skip/i,
  /for players who\s+for\b/i,
  // Verb-less "Players who <noun…>" and peer-template glue
  /who need finishing power or a different geometry/i,
  /who match this product'?s primary job/i,
  /^players who (?!(?:need|want|prefer|looking|already|still|primarily|care|match|live|generate|play|pack|know|are|can|will|specifically|understand)\b)[a-z]/i,
  // Missing auxiliary / double-want glue
  /^players who (?:still|already|primarily) \w+ing\b/i,
  /^players who want \w+ing\b/i,
  /\bprefer specifically want\b/i,
  /\bprefer understand\b/i,
  /\bwant choosing\b/i,
  /\bwho want .+\bwho want\b/i,
  /clear this use case pick/i,
  /live nl product url/i,
  /should still be attached/i,
  /\burl should\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bplaceholder\b/i,
  /research needed/i,
  /needs research/i,
  /internal note/i,
  /editor note/i,
  /if this section still feels generic/i,
  /i'?d only keep the /i,
];

const CONFUSING_RES: RegExp[] = [
  /\bwhatever\b/i,
  /not a [a-z]+ [a-z]+ shows up/i,
  /shows up often in your week/i,
];

const GENERIC_RES: RegExp[] = [
  /^(good|great|nice|solid|quality|comfortable|well designed|high quality)[.!]?$/i,
];

export function classifyDecisionLine(
  line: string,
  opts?: { siblingNormalized?: Set<string>; maxWords?: number },
): DecisionLineClass {
  const t = line.trim();
  if (!t) return "BROKEN";
  if (containsPublicContentCorruption(t)) return "BROKEN";
  if (BROKEN_RES.some((re) => re.test(t))) return "BROKEN";
  if (MACHINE_RES.some((re) => re.test(t))) return "MACHINE_LIKE";
  if (CONFUSING_RES.some((re) => re.test(t))) return "CONFUSING";
  if (GENERIC_RES.some((re) => re.test(t))) return "GENERIC";
  const words = countDecisionWords(t);
  if (words < 5) return "GENERIC";
  const max = opts?.maxWords ?? 18;
  if (words > max) return "WORDY";
  const key = normalizeDecisionLine(t);
  if (opts?.siblingNormalized?.has(key)) return "REPETITIVE";
  return "GOOD";
}

export function normalizeDecisionLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyDecisionList(lines: string[]): DecisionLineClass[] {
  const seen = new Set<string>();
  return lines.map((line) => {
    const cls = classifyDecisionLine(line, { siblingNormalized: seen });
    seen.add(normalizeDecisionLine(line));
    return cls;
  });
}

export function listHasBlockedClass(lines: string[]): boolean {
  return classifyDecisionList(lines).some(
    (c) => c === "MACHINE_LIKE" || c === "BROKEN",
  );
}
