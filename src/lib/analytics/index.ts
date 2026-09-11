/**
 * Public analytics API for Kitletics.
 */

export {
  GA_MEASUREMENT_ENV,
  getMeasurementId,
  getServerAnalyticsConfig,
  isAnalyticsEnabled,
  isBrowser,
  resolveAnalyticsConfig,
  type AnalyticsRuntimeConfig,
} from "./config";

export {
  ANALYTICS_CONSENT_COOKIE,
  consentStateFromStorage,
  defaultConsentState,
  parseConsentCookie,
  readConsentCookieFromDocument,
  writeConsentCookie,
  toGtagConsentPayload,
  type StoredAnalyticsConsent,
} from "./consent";

export {
  track,
  trackPageView,
  setAnalyticsCollectionAllowed,
  isAnalyticsCollectionAllowed,
} from "./events";

export {
  buildPageContext,
  classifyAnalyticsPageType,
  viewEventForPageType,
} from "./page-context";

export { mapOfferPlacement } from "./placements";
export { sanitizeAnalyticsParams, isProhibitedAnalyticsValue } from "./sanitize";

export {
  handleCommercialAnalytics,
  handleCompareAnalytics,
  handleFinderAnalytics,
} from "./map-domain";

export type {
  AnalyticsEventName,
  AnalyticsEventParams,
  AnalyticsPageType,
  AnalyticsPlacement,
  ConsentState,
  ConsentStatus,
  PageContextParams,
  RetailerClickParams,
} from "./types";

export { ANALYTICS_EVENTS, ANALYTICS_PAGE_TYPES, ANALYTICS_PLACEMENTS } from "./types";
