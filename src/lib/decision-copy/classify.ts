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
];

const BROKEN_RES: RegExp[] = [
  /you need not a /i,
  /look elsewhere if not a /i,
  /i'd pause if not a /i,
  /you need not [a-z]/i,
  /\[object Object\]/,
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
