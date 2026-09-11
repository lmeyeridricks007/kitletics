/**
 * Fire-and-log IndexNow after a content publish script mutates live catalog.
 * Never throws — publish scripts must not fail solely due to IndexNow.
 */
import {
  notifyIndexNow,
  type IndexNowEntityRef,
  type IndexNowSubmitOptions,
} from "@/lib/seo/indexnow";

export async function notifyIndexNowAfterPublish(
  entities: IndexNowEntityRef[],
  opts: IndexNowSubmitOptions = {},
): Promise<void> {
  if (!entities.length) return;
  try {
    const result = await notifyIndexNow({
      entities,
      logger: (message, meta) => {
        if (meta) console.log(`[indexnow] ${message}`, meta);
        else console.log(`[indexnow] ${message}`);
      },
      ...opts,
    });
    console.log(
      `[indexnow] notify done: submitted=${result.submitted} skipped=${result.skipped} rejected=${result.rejectedCount} ok=${result.ok}`,
    );
    if (result.errors.length) {
      console.warn("[indexnow] errors:", result.errors.join("; "));
    }
  } catch (err) {
    console.warn(
      "[indexnow] notify failed (publish succeeded):",
      err instanceof Error ? err.message : err,
    );
  }
}
