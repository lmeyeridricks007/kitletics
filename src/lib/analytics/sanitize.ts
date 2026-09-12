/**
 * Sanitize analytics payloads — strip PII, secrets, affiliate URLs, undefined.
 */

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/i;
const SECRETISH_KEY =
  /(?:password|secret|token|auth|email|phone|name|ip|address|affiliate.?tag|tracking.?id)/i;
const URL_RE = /^https?:\/\//i;
const AFFILIATE_HOST =
  /amazon\.|amzn\.|awin1\.|impact\.|cj\.com|rakuten|tradedoubler|partnerize/i;

const ALLOWED_KEYS = new Set([
  "page_type",
  "sport",
  "discipline",
  "category",
  "brand",
  "product_slug",
  "content_slug",
  "page_path",
  "page_location",
  "page_title",
  "product_id",
  "retailer",
  "region",
  "placement",
  "offer_id",
  "is_affiliate",
  "finder_id",
  "question_key",
  "result_count",
  "category_id",
  "product_count",
  "product_ids",
  "source",
  "query_length",
  "has_query",
  "filter_key",
  "filter_count",
  "filter_type",
  "filter_value",
  "sort_type",
  "result_position",
  "insight_type",
  "share_channel",
  "item_id",
  "item_name",
  "item_brand",
  "item_category",
  "item_list_id",
  "item_list_name",
  "items",
  "engagement_time_msec",
  "send_to",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeString(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (EMAIL_RE.test(trimmed)) return undefined;
  if (URL_RE.test(trimmed) && AFFILIATE_HOST.test(trimmed)) return undefined;
  if (URL_RE.test(trimmed) && /[?&](tag|ascsubtag|uid|clickid)=/i.test(trimmed)) {
    return undefined;
  }
  // Cap free-form strings
  return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed;
}

/**
 * Returns a plain object safe to send to GA4.
 * Drops undefined/null, secret-like keys, emails, and affiliate destination URLs.
 */
export function sanitizeAnalyticsParams(
  input: Record<string, unknown> | null | undefined,
): Record<string, string | number | boolean> {
  if (!input || !isPlainObject(input)) return {};

  const out: Record<string, string | number | boolean> = {};

  for (const [key, raw] of Object.entries(input)) {
    if (raw === undefined || raw === null) continue;
    if (SECRETISH_KEY.test(key) && key !== "item_name" && key !== "page_title") {
      continue;
    }
    // Prefer allowlist; still allow item_* ecommerce keys already listed
    if (!ALLOWED_KEYS.has(key) && !key.startsWith("item_")) continue;

    if (typeof raw === "boolean" || typeof raw === "number") {
      if (typeof raw === "number" && !Number.isFinite(raw)) continue;
      out[key] = raw;
      continue;
    }

    if (typeof raw === "string") {
      const cleaned = sanitizeString(raw);
      if (cleaned !== undefined) out[key] = cleaned;
      continue;
    }

    if (Array.isArray(raw)) {
      // Only allow compact string/number arrays serialized for product_ids
      if (key === "product_ids" || key === "items") {
        const compact = raw
          .slice(0, 20)
          .map((v) => (typeof v === "string" || typeof v === "number" ? String(v) : ""))
          .filter(Boolean)
          .join(",");
        if (compact) out[key] = compact.slice(0, 200);
      }
    }
  }

  return out;
}

/** True if a value looks like a full affiliate / tracking URL that must never be sent. */
export function isProhibitedAnalyticsValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (EMAIL_RE.test(value)) return true;
  if (URL_RE.test(value) && AFFILIATE_HOST.test(value)) return true;
  if (URL_RE.test(value) && /[?&](tag|ascsubtag|uid|clickid)=/i.test(value)) return true;
  return false;
}
