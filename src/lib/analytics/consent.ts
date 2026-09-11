/**
 * Consent Mode helpers — cookie-backed; SSR-safe.
 *
 * Gap (documented in docs/analytics/GA4.md): Kitletics had no CMP.
 * This module is the minimum reusable consent layer for analytics_storage.
 * Affiliate/region cookies are unrelated and never imply analytics consent.
 */

import type { ConsentState, ConsentStatus } from "./types";
import { isBrowser } from "./config";

export const ANALYTICS_CONSENT_COOKIE = "kit_analytics_consent";
export const ANALYTICS_CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export type StoredAnalyticsConsent = "granted" | "denied";

export function defaultConsentState(
  analytics: ConsentStatus = "denied",
): ConsentState {
  return {
    analytics_storage: analytics,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

export function parseConsentCookie(
  raw: string | null | undefined,
): StoredAnalyticsConsent | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === "granted" || v === "denied") return v;
  return null;
}

export function readConsentCookieFromDocument(): StoredAnalyticsConsent | null {
  if (!isBrowser()) return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`));
  if (!match) return null;
  return parseConsentCookie(decodeURIComponent(match.split("=").slice(1).join("=")));
}

export function writeConsentCookie(value: StoredAnalyticsConsent): void {
  if (!isBrowser()) return;
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(value)};path=/;max-age=${ANALYTICS_CONSENT_MAX_AGE};samesite=lax`;
}

export function consentStateFromStorage(
  stored: StoredAnalyticsConsent | null,
): ConsentState {
  if (stored === "granted") return defaultConsentState("granted");
  if (stored === "denied") return defaultConsentState("denied");
  return defaultConsentState("denied");
}

/** gtag consent payload — unknown maps to denied for Google defaults. */
export function toGtagConsentPayload(state: ConsentState): Record<string, string> {
  const map = (s: ConsentStatus) => (s === "granted" ? "granted" : "denied");
  return {
    analytics_storage: map(state.analytics_storage),
    ad_storage: map(state.ad_storage),
    ad_user_data: map(state.ad_user_data),
    ad_personalization: map(state.ad_personalization),
  };
}
