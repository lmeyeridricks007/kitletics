const INTERNAL_PATTERNS = [
  /prompt\s*\d+/i,
  /\bcatalog\s+pass\b/i,
  /\bcatalog\s+synthesis\b/i,
  /\bresearch\s+agent\b/i,
  /\bproduct\s*review\s*agent\b/i,
  /\bai\s+synthesis\b/i,
  /\bstaging\b/i,
  /\bcandidate\b/i,
  /\bneeds-research\b/i,
  /\bP[0-3]\b/,
  /\breadiness\s+score\b/i,
];

export function containsInternalTerminology(text: string): boolean {
  return INTERNAL_PATTERNS.some((re) => re.test(text));
}

const GENERIC_PROS = [
  /^good quality$/i,
  /^great performance$/i,
  /^comfortable$/i,
  /^well designed$/i,
  /^high quality$/i,
  /^excellent$/i,
  /^great option$/i,
];

export function isGenericPro(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return true;
  return GENERIC_PROS.some((re) => re.test(t));
}

export function filterSpecificPros(pros: string[], max = 5): string[] {
  return pros
    .map((p) => p.trim())
    .filter((p) => p && !isGenericPro(p))
    .slice(0, max);
}

export function filterContextualCompromises(cons: string[], max = 4): string[] {
  return cons
    .map((c) => c.trim())
    .filter((c) => c.length >= 12)
    .slice(0, max);
}
