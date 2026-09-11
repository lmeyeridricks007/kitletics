# Product images (not in Git)

This tree is **gitignored** (~7GB). Paths like `/images/running/products/...` still work locally from files here.

## Hosting on Vercel

**Option A — CLI deploy (simplest first ship)**  
From a machine that has this folder populated:

```bash
npx vercel --prod
```

Vercel uploads local `public/` even when it is not in GitHub. Git-connected auto-deploys will **not** include these files.

**Option B — Vercel Blob (durable CDN)**  
Upload masters to Blob, point `next/image` / media URLs at Blob (or a thin rewrite). Prefer this once the project is linked to Vercel and you want Git-based deploys without shipping binaries in git.

Until then, keep this directory on disk for local `next dev` / `next build`.
