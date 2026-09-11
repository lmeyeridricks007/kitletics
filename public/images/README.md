# Product images (not in Git)

This tree is **gitignored** (~7GB). Paths like `/images/running/products/...` still work locally from files here.

## Hosting on Vercel Blob

1. Link the Blob store (already: `kitletics-media`) so `BLOB_READ_WRITE_TOKEN` exists.
2. Upload:

```bash
npm run media:blob-upload
```

3. Set `MEDIA_BLOB_BASE_URL` (and optionally `NEXT_PUBLIC_MEDIA_BLOB_BASE_URL`) to the printed base URL on the Vercel project, then redeploy.

Middleware + `next.config` rewrite `/images/*` → Blob. Leave those env vars unset locally to keep using this folder.
