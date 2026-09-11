# Media hosting

Product heroes, galleries, and review section images live under `public/images/` (~7GB) and are **not stored in GitHub**.

| Environment | How images are served |
|-------------|------------------------|
| Local | Files on disk in `public/images/` |
| Vercel (first ship) | `npx vercel --prod` uploads local `public/` |
| Vercel (steady state) | Prefer [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) or another CDN; keep Git deploys light |

See `public/images/README.md`. Do not commit Excel lock files (`~$*`) or `.env.local`.
