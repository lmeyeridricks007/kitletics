/**
 * Offer URL validation — classification only (no network I/O here).
 * Network checks live in scripts; results merge via offers-url-validation overlay.
 */

export type OfferUrlValidationState =
  | "VALID"
  | "LIKELY_VALID"
  | "UNKNOWN"
  | "INVALID";

export type OfferUrlFailureReason =
  | "invalid_url"
  | "non_http_protocol"
  | "http_404"
  | "http_410"
  | "http_4xx"
  | "http_5xx"
  | "dns_or_network"
  | "timeout"
  | "bot_blocked"
  | "method_not_allowed"
  | "soft_block"
  | "geo_block"
  | "wrong_product"
  | "product_removed"
  | "redirect_loop"
  | "empty_response"
  | "other";

export interface OfferUrlCheckObservation {
  method: "HEAD" | "GET";
  status?: number;
  finalUrl?: string;
  error?: string;
  /** Response body / title hints (truncated) */
  bodyHint?: string;
  elapsedMs?: number;
}

export interface OfferUrlValidationResult {
  state: OfferUrlValidationState;
  checkedAt: string;
  httpStatus?: number;
  redirectUrl?: string;
  failureReason?: OfferUrlFailureReason;
  notes?: string;
  observations?: OfferUrlCheckObservation[];
}

export interface OfferUrlValidationRecord extends OfferUrlValidationResult {
  offerId: string;
  url: string;
}

const BOT_BODY =
  /access denied|just a moment|cf-browser|attention required|enable javascript and cookies|robot|captcha|cloudflare|akamai|request blocked|forbidden/i;

const GEO_BODY =
  /not available in your (country|region)|cannot be shipped to|unavailable in your location|451 unavailable/i;

const AMAZON_HOST = /(^|\.)amazon\.(nl|de|co\.uk|com|fr|com\.be)$/i;

export function isAmazonHost(url: string): boolean {
  try {
    return AMAZON_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Structural URL sanity before any network call. */
export function classifyOfferUrlStructure(url: string): OfferUrlValidationResult | null {
  const checkedAt = new Date().toISOString();
  if (!url || typeof url !== "string") {
    return {
      state: "INVALID",
      checkedAt,
      failureReason: "invalid_url",
      notes: "Empty URL",
    };
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      state: "INVALID",
      checkedAt,
      failureReason: "invalid_url",
      notes: "URL failed to parse",
    };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return {
      state: "INVALID",
      checkedAt,
      failureReason: "non_http_protocol",
      notes: `Protocol ${parsed.protocol}`,
    };
  }
  return null;
}

/**
 * Classify after HEAD/GET observations.
 * Bot blocks and Amazon soft responses must NOT become INVALID.
 */
export function classifyOfferUrlObservations(
  url: string,
  observations: OfferUrlCheckObservation[],
  checkedAt = new Date().toISOString(),
): OfferUrlValidationResult {
  const structural = classifyOfferUrlStructure(url);
  if (structural) return structural;

  const head = observations.find((o) => o.method === "HEAD");
  const get = observations.find((o) => o.method === "GET");
  const best = get ?? head;
  const httpStatus = best?.status;
  const redirectUrl =
    best?.finalUrl && best.finalUrl !== url ? best.finalUrl : undefined;

  const timedOut = observations.some(
    (o) => o.error && /timeout|aborted|TimeoutError/i.test(o.error),
  );
  if (timedOut && !httpStatus) {
    return {
      state: "UNKNOWN",
      checkedAt,
      failureReason: "timeout",
      notes: "Request timed out — not treated as dead link",
      observations,
    };
  }

  const networkFail = observations.every(
    (o) => o.error && !o.status,
  );
  if (networkFail) {
    const dns = observations.some((o) =>
      /ENOTFOUND|EAI_AGAIN|getaddrinfo|DNS/i.test(o.error ?? ""),
    );
    return {
      state: dns ? "INVALID" : "UNKNOWN",
      checkedAt,
      failureReason: dns ? "dns_or_network" : "dns_or_network",
      notes: observations.map((o) => o.error).filter(Boolean).join("; "),
      observations,
    };
  }

  // Definite dead links
  if (httpStatus === 404 || httpStatus === 410) {
    return {
      state: "INVALID",
      checkedAt,
      httpStatus,
      redirectUrl,
      failureReason: httpStatus === 404 ? "http_404" : "http_410",
      observations,
    };
  }

  if (
    httpStatus === 451 ||
    (get?.bodyHint && GEO_BODY.test(get.bodyHint))
  ) {
    return {
      state: "LIKELY_VALID",
      checkedAt,
      httpStatus,
      redirectUrl,
      failureReason: "geo_block",
      notes:
        "Geo/availability restriction for this checker — not treated as a dead offer.",
      observations,
    };
  }

  // Bot / WAF blocks — retailer may still be fine for humans
  const botBlocked =
    httpStatus === 403 ||
    (get?.bodyHint && BOT_BODY.test(get.bodyHint)) ||
    (get?.status === 403);
  if (botBlocked) {
    return {
      state: "LIKELY_VALID",
      checkedAt,
      httpStatus,
      redirectUrl,
      failureReason: "bot_blocked",
      notes:
        "Automated fetch blocked (WAF/bot). Do not hide from CTAs without human confirmation.",
      observations,
    };
  }

  // Amazon often rejects HEAD (405) and returns soft 202/503 to bots on GET
  if (isAmazonHost(url)) {
    if (httpStatus === 405 || head?.status === 405) {
      return {
        state: "LIKELY_VALID",
        checkedAt,
        httpStatus: httpStatus ?? 405,
        redirectUrl,
        failureReason: "method_not_allowed",
        notes: "Amazon rejected HEAD/soft-blocked automation — host is known-good.",
        observations,
      };
    }
    if (httpStatus === 202 || httpStatus === 503) {
      return {
        state: "LIKELY_VALID",
        checkedAt,
        httpStatus,
        redirectUrl,
        failureReason: "soft_block",
        notes: "Amazon soft anti-bot response — not classified INVALID.",
        observations,
      };
    }
  }

  if (httpStatus === 405) {
    return {
      state: "LIKELY_VALID",
      checkedAt,
      httpStatus,
      redirectUrl,
      failureReason: "method_not_allowed",
      notes: "HEAD not allowed; treat as likely valid unless GET proves otherwise.",
      observations,
    };
  }

  if (httpStatus != null && httpStatus >= 200 && httpStatus < 400) {
    return {
      state: "VALID",
      checkedAt,
      httpStatus,
      redirectUrl,
      observations,
    };
  }

  if (httpStatus != null && httpStatus >= 500) {
    return {
      state: "UNKNOWN",
      checkedAt,
      httpStatus,
      redirectUrl,
      failureReason: "http_5xx",
      notes: "Server error — may be transient",
      observations,
    };
  }

  if (httpStatus != null && httpStatus >= 400) {
    return {
      state: "UNKNOWN",
      checkedAt,
      httpStatus,
      redirectUrl,
      failureReason: "http_4xx",
      notes: "Non-bot 4xx without definitive dead-link signal",
      observations,
    };
  }

  return {
    state: "UNKNOWN",
    checkedAt,
    httpStatus,
    redirectUrl,
    failureReason: "other",
    observations,
  };
}

/** Display gate: never show known-invalid; keep bot-blocked offers. */
export function isOfferUrlDisplayable(
  state: OfferUrlValidationState | undefined | null,
): boolean {
  if (state == null || state === "UNKNOWN") return true;
  return state !== "INVALID";
}
