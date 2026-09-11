/**
 * IndexNow HTTP client — batch submit with retry, dedupe, graceful no-op.
 */

import {
  INDEXNOW_MAX_URLS_PER_BATCH,
  INDEXNOW_PREFERRED_BATCH_SIZE,
  resolveIndexNowConfig,
  type IndexNowConfig,
} from "./config";
import { dedupeUrls } from "./normalize";

export type IndexNowSubmitResult = {
  ok: boolean;
  skipped: boolean;
  reason?: string;
  submitted: number;
  batches: number;
  statusCodes: number[];
  errors: string[];
};

export type IndexNowSubmitOptions = {
  /** When true, do not call the network. */
  dryRun?: boolean;
  config?: IndexNowConfig;
  fetchImpl?: typeof fetch;
  /** Override preferred batch size (tests). */
  batchSize?: number;
  /** Max retries per batch on 429/5xx. */
  maxRetries?: number;
  logger?: (message: string, meta?: Record<string, unknown>) => void;
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postBatch(
  endpoint: string,
  body: Record<string, unknown>,
  fetchImpl: typeof fetch,
  maxRetries: number,
  logger?: IndexNowSubmitOptions["logger"],
): Promise<{ status: number; error?: string }> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const res = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });

      // IndexNow: 200/202 success; 429 rate limit
      if (res.status === 200 || res.status === 202) {
        return { status: res.status };
      }

      if (res.status === 429 || res.status >= 500) {
        attempt += 1;
        const backoff = Math.min(8000, 500 * 2 ** attempt);
        logger?.("indexnow_retry", { status: res.status, attempt, backoff });
        if (attempt > maxRetries) {
          return {
            status: res.status,
            error: `HTTP ${res.status} after ${maxRetries} retries`,
          };
        }
        await sleep(backoff);
        continue;
      }

      const text = await res.text().catch(() => "");
      return {
        status: res.status,
        error: `HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
      };
    } catch (err) {
      attempt += 1;
      const message = err instanceof Error ? err.message : String(err);
      if (attempt > maxRetries) {
        return { status: 0, error: message };
      }
      await sleep(Math.min(8000, 500 * 2 ** attempt));
    }
  }
  return { status: 0, error: "exhausted_retries" };
}

/**
 * Submit canonical absolute URLs to IndexNow.
 * No-ops when INDEXNOW_KEY is missing (ok: true, skipped: true).
 */
export async function submitIndexNowUrls(
  urls: string[],
  options: IndexNowSubmitOptions = {},
): Promise<IndexNowSubmitResult> {
  const config = options.config ?? resolveIndexNowConfig();
  const logger = options.logger;
  const unique = dedupeUrls(urls);

  if (!config.enabled || !config.key) {
    logger?.("indexnow_skipped_missing_key", { count: unique.length });
    return {
      ok: true,
      skipped: true,
      reason: "missing_key",
      submitted: 0,
      batches: 0,
      statusCodes: [],
      errors: [],
    };
  }

  if (unique.length === 0) {
    return {
      ok: true,
      skipped: true,
      reason: "empty_url_list",
      submitted: 0,
      batches: 0,
      statusCodes: [],
      errors: [],
    };
  }

  const batchSize = Math.min(
    INDEXNOW_MAX_URLS_PER_BATCH,
    Math.max(1, options.batchSize ?? INDEXNOW_PREFERRED_BATCH_SIZE),
  );
  const batches = chunk(unique, batchSize);
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxRetries = options.maxRetries ?? 2;

  if (options.dryRun) {
    logger?.("indexnow_dry_run", {
      count: unique.length,
      batches: batches.length,
      host: config.host,
    });
    return {
      ok: true,
      skipped: true,
      reason: "dry_run",
      submitted: unique.length,
      batches: batches.length,
      statusCodes: [],
      errors: [],
    };
  }

  const statusCodes: number[] = [];
  const errors: string[] = [];

  for (const batch of batches) {
    const body = {
      host: config.host,
      key: config.key,
      keyLocation: config.keyLocation,
      urlList: batch,
    };
    const result = await postBatch(
      config.endpoint,
      body,
      fetchImpl,
      maxRetries,
      logger,
    );
    statusCodes.push(result.status);
    if (result.error) errors.push(result.error);
    else logger?.("indexnow_batch_ok", { count: batch.length, status: result.status });
  }

  const ok = errors.length === 0;
  return {
    ok,
    skipped: false,
    submitted: unique.length,
    batches: batches.length,
    statusCodes,
    errors,
    reason: ok ? undefined : "partial_or_total_failure",
  };
}
