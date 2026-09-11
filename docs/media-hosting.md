# Media hosting

Product heroes, galleries, and review section images live under `public/images/` (~7GB) and are **not stored in GitHub**.

| Environment | How images are served |
|-------------|------------------------|
| Local | Files on disk in `public/images/` (`MEDIA_BLOB_BASE_URL` unset) |
| Vercel production | Vercel Blob store `kitletics-media` via `/images/*` rewrite |
| Upload | `npm run media:blob-upload` (needs `BLOB_READ_WRITE_TOKEN`) |

## Env

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Upload / manage Blob (server-only; set by Blob store link) |
| `MEDIA_BLOB_BASE_URL` | Public Blob origin, e.g. `https://….public.blob.vercel-storage.com` (no trailing slash). Used by middleware + `next.config` rewrites. |
| `NEXT_PUBLIC_MEDIA_BLOB_BASE_URL` | Same origin for absolute URLs in OG / embeds (`resolveMediaUrl`) |

After the first successful upload, copy `baseUrl` from `docs/prelaunch/data/blob-media/base-url.txt` into Vercel env (Production + Preview), then redeploy.

See `public/images/README.md`.
