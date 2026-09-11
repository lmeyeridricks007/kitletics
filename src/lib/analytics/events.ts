/**
 * Typed Kitletics analytics event API — single entry point for UI/domain.
 */

import { isBrowser } from "./config";
import { gtagEvent, gtagEventBeacon, isGaConfigured } from "./gtag";
import { sanitizeAnalyticsParams } from "./sanitize";
import type { AnalyticsEventName, AnalyticsEventParams } from "./types";

export type TrackOptions = {
  /** Use beacon transport (outbound clicks). */
  beacon?: boolean;
};

let analyticsConsentGranted = false;

/** Called by consent layer when analytics_storage is granted/denied. */
export function setAnalyticsCollectionAllowed(allowed: boolean): void {
  analyticsConsentGranted = allowed;
}

export function isAnalyticsCollectionAllowed(): boolean {
  return analyticsConsentGranted;
}

function canSend(): boolean {
  // Enabled gate is applied when configureGa runs (production-only from provider).
  return isBrowser() && isGaConfigured() && analyticsConsentGranted;
}

/**
 * Emit a typed analytics event. No-ops when disabled, SSR, or consent denied.
 * Never throws.
 */
export function track(
  event: AnalyticsEventName,
  params: AnalyticsEventParams = {},
  opts: TrackOptions = {},
): void {
  try {
    if (!canSend()) return;
    const clean = sanitizeAnalyticsParams(params as Record<string, unknown>);
    if (opts.beacon) {
      gtagEventBeacon(event, clean);
    } else {
      gtagEvent(event, clean);
    }
  } catch {
    // never break UX
  }
}

/**
 * GA4 page_view with Kitletics context. Used by PageViewTracker only.
 */
export function trackPageView(params: AnalyticsEventParams): void {
  try {
    if (!canSend()) return;
    const clean = sanitizeAnalyticsParams(params as Record<string, unknown>);
    gtagEvent("page_view", clean);
  } catch {
    // never break UX
  }
}
