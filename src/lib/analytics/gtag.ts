/**
 * Low-level gtag bridge — browser only; no-ops on server/build.
 */

import { isBrowser } from "./config";
import { sanitizeAnalyticsParams } from "./sanitize";
import type { ConsentState } from "./types";
import { toGtagConsentPayload } from "./consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let configuredId: string | null = null;
let consentDefaultsApplied = false;

export function ensureDataLayer(): void {
  if (!isBrowser()) return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
}

export function applyConsentDefault(state: ConsentState): void {
  if (!isBrowser()) return;
  ensureDataLayer();
  window.gtag!("consent", "default", toGtagConsentPayload(state));
  consentDefaultsApplied = true;
}

export function updateConsent(state: ConsentState): void {
  if (!isBrowser()) return;
  ensureDataLayer();
  if (!consentDefaultsApplied) {
    applyConsentDefault(state);
  }
  window.gtag!("consent", "update", toGtagConsentPayload(state));
}

export function configureGa(
  measurementId: string,
  opts?: { sendPageView?: boolean },
): void {
  if (!isBrowser() || !measurementId) return;
  ensureDataLayer();
  configuredId = measurementId;
  window.gtag!("js", new Date());
  window.gtag!("config", measurementId, {
    send_page_view: opts?.sendPageView ?? false,
    anonymize_ip: true,
  });
}

export function isGaConfigured(): boolean {
  return Boolean(configuredId);
}

export function getConfiguredMeasurementId(): string | null {
  return configuredId;
}

export function gtagEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (!isBrowser() || !configuredId) return;
  ensureDataLayer();
  const clean = sanitizeAnalyticsParams(params);
  window.gtag!("event", name, {
    ...clean,
    send_to: configuredId,
  });
}

/** Transport hint for outbound clicks — non-blocking. */
export function gtagEventBeacon(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (!isBrowser() || !configuredId) return;
  ensureDataLayer();
  const clean = sanitizeAnalyticsParams(params);
  window.gtag!("event", name, {
    ...clean,
    send_to: configuredId,
    transport_type: "beacon",
  });
}

/** Test helpers */
export function __resetGtagBridgeForTests(): void {
  configuredId = null;
  consentDefaultsApplied = false;
  if (isBrowser()) {
    delete window.gtag;
    delete window.dataLayer;
  }
}
