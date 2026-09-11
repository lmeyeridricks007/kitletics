export {
  INDEXNOW_KEY_ENV,
  INDEXNOW_ENDPOINT_ENV,
  INDEXNOW_KEY_FILE_PATH,
  INDEXNOW_DEFAULT_ENDPOINT,
  INDEXNOW_MAX_URLS_PER_BATCH,
  INDEXNOW_PREFERRED_BATCH_SIZE,
  isValidIndexNowKey,
  readIndexNowKey,
  resolveIndexNowConfig,
  type IndexNowConfig,
} from "./config";

export {
  normalizeIndexNowUrl,
  isBlockedIndexNowPath,
  dedupeUrls,
  type NormalizeUrlResult,
} from "./normalize";

export {
  resolveIndexableEntityUrl,
  resolveRemovalUrl,
  collectIndexableUrlsFromEntities,
  collectCanonicalUrls,
  filterUrlsPresentInSitemap,
  type IndexNowEntityRef,
  type IndexNowSubmitMode,
} from "./eligibility";

export {
  submitIndexNowUrls,
  type IndexNowSubmitResult,
  type IndexNowSubmitOptions,
} from "./client";

export {
  notifyIndexNow,
  notifyIndexNowForProductPublish,
  type NotifyIndexNowInput,
} from "./notify";
