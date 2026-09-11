import type {
  FinderDefinition,
  FinderResponses,
  FinderShareState,
  FinderResponseValue,
} from "@/domain/finders/types";

/**
 * Share-state privacy:
 * - Exact body weight is NEVER included in share URLs.
 * - Only coarse, non-sensitive answers are encoded.
 * - Encoding is not encryption — do not put secrets here.
 */
const EXCLUDED_SHARE_KEYS = new Set(["weight"]);

function toShareValue(
  value: FinderResponseValue,
): string | string[] | number | boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "object" && "value" in value) {
    // Coarse bucket only if we ever share weight — currently excluded
    return undefined;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) return value.map(String);
  return undefined;
}

export function encodeFinderShareState(
  definition: FinderDefinition,
  responses: FinderResponses,
): string {
  const r: FinderShareState["r"] = {};
  for (const [key, value] of Object.entries(responses)) {
    if (EXCLUDED_SHARE_KEYS.has(key)) continue;
    const v = toShareValue(value);
    if (v === undefined) continue;
    r[key] = v;
  }
  const payload: FinderShareState = {
    v: definition.version,
    f: definition.slug,
    r,
  };
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8")
    .toString("base64url");
}

export function decodeFinderShareState(
  encoded: string,
  expectedSlug?: string,
):
  | { ok: true; state: FinderShareState; responses: FinderResponses }
  | { ok: false; error: string } {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as FinderShareState;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "Invalid share state" };
    }
    if (typeof parsed.v !== "string" || typeof parsed.f !== "string") {
      return { ok: false, error: "Missing version or finder id" };
    }
    if (expectedSlug && parsed.f !== expectedSlug) {
      return { ok: false, error: "Share state is for a different finder" };
    }
    if (!parsed.r || typeof parsed.r !== "object") {
      return { ok: false, error: "Missing responses" };
    }
    // Strip excluded keys if somehow present
    const responses: FinderResponses = {};
    for (const [k, v] of Object.entries(parsed.r)) {
      if (EXCLUDED_SHARE_KEYS.has(k)) continue;
      responses[k] = v as FinderResponseValue;
    }
    return { ok: true, state: parsed, responses };
  } catch {
    return { ok: false, error: "Could not decode share state" };
  }
}

/** Client-safe encode without Node Buffer */
export function encodeFinderShareStateBrowser(
  definition: FinderDefinition,
  responses: FinderResponses,
): string {
  const r: FinderShareState["r"] = {};
  for (const [key, value] of Object.entries(responses)) {
    if (EXCLUDED_SHARE_KEYS.has(key)) continue;
    const v = toShareValue(value);
    if (v === undefined) continue;
    r[key] = v;
  }
  const payload: FinderShareState = {
    v: definition.version,
    f: definition.slug,
    r,
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeFinderShareStateBrowser(
  encoded: string,
  expectedSlug?: string,
):
  | { ok: true; state: FinderShareState; responses: FinderResponses }
  | { ok: false; error: string } {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return decodeFinderShareState(
      // Re-encode via Node path logic — duplicate parse:
      (() => {
        const parsed = JSON.parse(json) as FinderShareState;
        if (expectedSlug && parsed.f !== expectedSlug) {
          throw new Error("wrong finder");
        }
        return Buffer.from(JSON.stringify(parsed)).toString("base64url");
      })(),
      expectedSlug,
    );
  } catch {
    // Direct parse fallback for browser
    try {
      const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const pad =
        padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
      const binary = atob(padded + pad);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(json) as FinderShareState;
      if (expectedSlug && parsed.f !== expectedSlug) {
        return { ok: false, error: "Share state is for a different finder" };
      }
      const responses: FinderResponses = {};
      for (const [k, v] of Object.entries(parsed.r ?? {})) {
        if (EXCLUDED_SHARE_KEYS.has(k)) continue;
        responses[k] = v as FinderResponseValue;
      }
      return { ok: true, state: parsed, responses };
    } catch {
      return { ok: false, error: "Could not decode share state" };
    }
  }
}
