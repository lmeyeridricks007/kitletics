/**
 * Destination identity for Offer URLs — no network I/O.
 * Homepages and bot-blocked HTML cannot prove product match; that is not INVALID.
 */
export type OfferIdentityStatus =
  | "match"
  | "mismatch"
  | "shallow_url"
  | "unverifiable"
  | "skipped";

export interface OfferIdentityAssessment {
  status: OfferIdentityStatus;
  title?: string;
  notes: string;
}

const LOCALE_ONLY =
  /^\/(([a-z]{2}([-_][a-z]{2,4})?)(\/([a-z]{2}([-_][a-z]{2,4})?))?)?$/i;

export function isShallowRetailerUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = (parsed.pathname.replace(/\/+$/, "") || "/") as string;
    if (path === "/") return true;
    if (LOCALE_ONLY.test(path)) return true;
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 1 && !/^(dp|gp|product|p|pd)$/i.test(segments[0]!)) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function extractHtmlTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]{2,200})/i);
  if (!match?.[1]) return undefined;
  return match[1].replace(/\s+/g, " ").trim();
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/gel[- ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function significantTokens(name: string): string[] {
  return normalize(name)
    .split(" ")
    .filter((t) => t.length >= 3 && !/^(the|and|for|men|women|shoe|run)$/.test(t));
}

/**
 * Best-effort identity vs HTML title / URL path.
 * mismatch is evidence for reporting — callers must not auto-INVALID on it.
 */
export function assessOfferDestinationIdentity(input: {
  url: string;
  productName: string;
  brandName?: string;
  bodyHint?: string;
  httpStatus?: number;
  botBlocked?: boolean;
}): OfferIdentityAssessment {
  if (isShallowRetailerUrl(input.url)) {
    return {
      status: "shallow_url",
      notes: "Retailer homepage or locale index — cannot confirm SKU identity",
    };
  }
  if (input.botBlocked) {
    return {
      status: "unverifiable",
      notes: "Bot/WAF blocked HTML — identity not scored",
    };
  }
  const haystack = [
    input.url,
    input.bodyHint ?? "",
  ]
    .join(" ")
    .slice(0, 12_000);
  const title = extractHtmlTitle(input.bodyHint ?? "") ?? undefined;
  const corpus = normalize(`${title ?? ""} ${haystack}`);
  const nameTokens = significantTokens(input.productName);
  if (nameTokens.length === 0) {
    return { status: "unverifiable", title, notes: "No product tokens to match" };
  }
  const hits = nameTokens.filter((t) => corpus.includes(t));
  const ratio = hits.length / nameTokens.length;
  if (ratio >= 0.6) {
    return {
      status: "match",
      title,
      notes: `Title/URL contains ${hits.length}/${nameTokens.length} product tokens`,
    };
  }
  if (
    input.httpStatus != null &&
    input.httpStatus >= 200 &&
    input.httpStatus < 300 &&
    title &&
    ratio === 0 &&
    input.brandName &&
    corpus.includes(normalize(input.brandName).split(" ")[0] ?? "")
  ) {
    return {
      status: "mismatch",
      title,
      notes: "200 HTML title does not contain product name tokens (possible wrong SKU — not auto-INVALID)",
    };
  }
  return {
    status: "unverifiable",
    title,
    notes: "Deep URL but HTML/title did not confirm product tokens",
  };
}
