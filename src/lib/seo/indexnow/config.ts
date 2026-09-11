/**
 * IndexNow configuration — server-only key from env.
 * Never commit a real production key; never expose as NEXT_PUBLIC_*.
 */

import { siteConfig } from "@/content/config";

export const INDEXNOW_KEY_ENV = "INDEXNOW_KEY" as const;
export const INDEXNOW_ENDPOINT_ENV = "INDEXNOW_ENDPOINT" as const;

/** Public key file path (also usable as IndexNow keyLocation). */
export const INDEXNOW_KEY_FILE_PATH = "/indexnow-key.txt" as const;

/** Default IndexNow endpoint (Bing + participants). */
export const INDEXNOW_DEFAULT_ENDPOINT = "https://api.indexnow.org/indexnow";

/** Max URLs per IndexNow request. */
export const INDEXNOW_MAX_URLS_PER_BATCH = 10_000;

/** Practical batch size to stay polite under rate limits. */
export const INDEXNOW_PREFERRED_BATCH_SIZE = 100;

export type IndexNowConfig = {
  key: string | null;
  host: string;
  keyLocation: string;
  endpoint: string;
  enabled: boolean;
};

/** IndexNow key: 8–128 chars, [A-Za-z0-9-] */
export function isValidIndexNowKey(raw: string): boolean {
  const key = raw.trim();
  return key.length >= 8 && key.length <= 128 && /^[A-Za-z0-9-]+$/.test(key);
}

export function readIndexNowKey(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const raw = env.INDEXNOW_KEY;
  if (typeof raw !== "string") return null;
  const key = raw.trim();
  if (!key || !isValidIndexNowKey(key)) return null;
  return key;
}

export function resolveIndexNowConfig(
  env: Record<string, string | undefined> = process.env,
): IndexNowConfig {
  const key = readIndexNowKey(env);
  const host = new URL(siteConfig.url).host;
  const keyLocation = `${siteConfig.url}${INDEXNOW_KEY_FILE_PATH}`;
  const endpoint =
    env.INDEXNOW_ENDPOINT?.trim() || INDEXNOW_DEFAULT_ENDPOINT;

  return {
    key,
    host,
    keyLocation,
    endpoint,
    enabled: Boolean(key),
  };
}
