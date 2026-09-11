/**
 * Analytics config — GA4 + Ahrefs keys from env only; production-gated.
 * Safe to import from server or client; never throws.
 */

export const GA_MEASUREMENT_ENV = "NEXT_PUBLIC_GA_MEASUREMENT_ID" as const;
export const AHREFS_KEY_ENV = "NEXT_PUBLIC_AHREFS_ANALYTICS_KEY" as const;

export type AnalyticsRuntimeConfig = {
  /** GA4 enabled: ID set + production (or forced). */
  enabled: boolean;
  measurementId: string | null;
  /** Ahrefs Web Analytics enabled: key set + production (or forced). */
  ahrefsEnabled: boolean;
  ahrefsKey: string | null;
  vercelEnv: string | null;
};

function isProductionRuntime(env: Record<string, string | undefined>): {
  vercelEnv: string | null;
  production: boolean;
} {
  const vercelEnv =
    env.VERCEL_ENV?.trim() || env.NEXT_PUBLIC_VERCEL_ENV?.trim() || null;
  const forced = env.NEXT_PUBLIC_GA_FORCE?.trim() === "1";
  return { vercelEnv, production: vercelEnv === "production" || forced };
}

function readGaId(env: Record<string, string | undefined>): string | null {
  const raw = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;
  return id;
}

function readAhrefsKey(env: Record<string, string | undefined>): string | null {
  const raw = env.NEXT_PUBLIC_AHREFS_ANALYTICS_KEY;
  if (typeof raw !== "string") return null;
  const key = raw.trim();
  // Ahrefs keys look like base64ish with optional slash — reject URLs/spaces
  if (!key || key.includes(" ") || /^https?:/i.test(key) || key.length < 8) {
    return null;
  }
  return key;
}

/**
 * Production gate:
 * - Vercel Production: VERCEL_ENV === "production"
 * - Explicit force (local verification only): NEXT_PUBLIC_GA_FORCE === "1"
 */
export function resolveAnalyticsConfig(
  env: Record<string, string | undefined> = process.env,
): AnalyticsRuntimeConfig {
  const { vercelEnv, production } = isProductionRuntime(env);
  const measurementId = readGaId(env);
  const ahrefsKey = readAhrefsKey(env);

  return {
    enabled: Boolean(measurementId) && production,
    measurementId,
    ahrefsEnabled: Boolean(ahrefsKey) && production,
    ahrefsKey,
    vercelEnv,
  };
}

/** Server/layout helper — same as resolveAnalyticsConfig(). */
export function getServerAnalyticsConfig(): AnalyticsRuntimeConfig {
  return resolveAnalyticsConfig();
}

export function getMeasurementId(): string | null {
  return readGaId(process.env);
}

export function isAnalyticsEnabled(): boolean {
  return resolveAnalyticsConfig().enabled;
}

/** True in a browser document context (not SSR / build / Node). */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
