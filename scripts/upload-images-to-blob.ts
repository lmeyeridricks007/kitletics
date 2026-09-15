/**
 * Upload public/images/** to Vercel Blob with stable pathnames
 * matching site URLs (/images/...).
 *
 *   npm run media:blob-upload
 *   npm run media:blob-upload -- --dry-run
 *   npm run media:blob-upload -- --concurrency=12
 *   npm run media:blob-upload -- --limit=50
 *
 * Requires BLOB_READ_WRITE_TOKEN (from `vercel env pull` / Blob store link).
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { put, head } from "@vercel/blob";

const ROOT = process.cwd();
const IMAGES_DIR = join(ROOT, "public", "images");
const OUT_DIR = join(ROOT, "docs", "prelaunch", "data", "blob-media");
const MANIFEST = join(OUT_DIR, "upload-manifest.json");

const ALLOWED = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

const dryRun = process.argv.includes("--dry-run");
const concurrency = Number(
  process.argv.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ??
    10,
);
const limit = Number(
  process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0,
);
const onlyPrefix = (
  process.argv.find((a) => a.startsWith("--only="))?.split("=")[1] ?? ""
).replace(/^\/+|\/+$/g, "");
const skipExisting = !process.argv.includes("--force");

function loadToken(): string {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  const envPath = join(ROOT, ".env.local");
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^BLOB_READ_WRITE_TOKEN=(.*)$/);
      if (m) {
        return m[1]!.trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  throw new Error("BLOB_READ_WRITE_TOKEN is not set");
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
      continue;
    }
    if (!e.isFile()) continue;
    if (e.name === ".gitkeep" || e.name === "README.md") continue;
    if (!ALLOWED.has(extname(e.name).toLowerCase())) continue;
    out.push(full);
  }
  return out;
}

async function mapPool<T, R>(
  items: T[],
  size: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!, i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, () => worker()),
  );
  return results;
}

async function main() {
  const token = loadToken();
  if (!existsSync(IMAGES_DIR)) {
    throw new Error(`Missing ${IMAGES_DIR}`);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  let files = await walk(IMAGES_DIR);
  files.sort();
  if (onlyPrefix) {
    const needle = onlyPrefix.startsWith("images/")
      ? onlyPrefix
      : `images/${onlyPrefix}`;
    files = files.filter((abs) => {
      const pathname = relative(join(ROOT, "public"), abs).split("\\").join("/");
      return pathname === needle || pathname.startsWith(`${needle}/`);
    });
  }
  if (limit > 0) files = files.slice(0, limit);

  console.log(
    `Uploading ${files.length} files (concurrency=${concurrency}, dryRun=${dryRun}, skipExisting=${skipExisting}${onlyPrefix ? `, only=${onlyPrefix}` : ""})`,
  );

  const rows: Array<{
    pathname: string;
    url: string;
    bytes: number;
    skipped?: boolean;
  }> = [];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let baseUrl: string | null = null;

  await mapPool(files, concurrency, async (abs) => {
    const pathname = relative(join(ROOT, "public"), abs).split("\\").join("/");
    const bytes = (await stat(abs)).size;
    try {
      if (skipExisting && !dryRun) {
        try {
          const existing = await head(pathname, { token });
          if (existing?.url) {
            skipped++;
            rows.push({ pathname, url: existing.url, bytes, skipped: true });
            if (!baseUrl) {
              baseUrl = existing.url.slice(0, existing.url.indexOf("/images/"));
            }
            return;
          }
        } catch {
          // not found — upload
        }
      }

      if (dryRun) {
        uploaded++;
        rows.push({
          pathname,
          url: `https://blob.example/${pathname}`,
          bytes,
        });
        return;
      }

      const blob = await put(pathname, createReadStream(abs), {
        access: "public",
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
        multipart: bytes > 4_500_000,
        contentType: undefined,
      });
      uploaded++;
      rows.push({ pathname, url: blob.url, bytes });
      if (!baseUrl && blob.url.includes("/images/")) {
        baseUrl = blob.url.slice(0, blob.url.indexOf("/images/"));
      }
      if (uploaded % 100 === 0) {
        console.log(`… uploaded ${uploaded}, skipped ${skipped}, failed ${failed}`);
      }
    } catch (err) {
      failed++;
      console.error(`FAIL ${pathname}`, err instanceof Error ? err.message : err);
    }
  });

  const summary = {
    uploadedAt: new Date().toISOString(),
    total: files.length,
    uploaded,
    skipped,
    failed,
    baseUrl,
    dryRun,
  };
  writeFileSync(
    MANIFEST,
    JSON.stringify({ summary, files: rows }, null, 2),
  );
  writeFileSync(
    join(OUT_DIR, "base-url.txt"),
    `${baseUrl ?? ""}\n`,
  );
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Wrote ${MANIFEST}`);
  if (baseUrl) {
    console.log(`\nSet MEDIA_BLOB_BASE_URL=${baseUrl}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
