# IndexNow for Kitletics

Kitletics uses [IndexNow](https://www.indexnow.org/) to notify participating search engines (including Bing) when **meaningful indexable URLs** are published, materially updated, or removed.

**Do not** bulk-submit the full sitemap (~1,167 URLs) merely because IndexNow was enabled.

## Architecture

| Piece | Path |
|-------|------|
| Config / key | `src/lib/seo/indexnow/config.ts` |
| URL normalize | `src/lib/seo/indexnow/normalize.ts` |
| Eligibility | `src/lib/seo/indexnow/eligibility.ts` (reuses `isIndexableEligibility`) |
| HTTP client | `src/lib/seo/indexnow/client.ts` |
| Lifecycle API | `src/lib/seo/indexnow/notify.ts` |
| Key file | `GET /indexnow-key.txt` → `src/app/indexnow-key.txt/route.ts` |
| `/{key}.txt` rewrite | `src/middleware.ts` |
| CLI | `npm run indexnow:notify` → `scripts/indexnow-notify.ts` |

## Key generation

```bash
openssl rand -hex 16
```

Requirements: 8–128 characters, `[A-Za-z0-9-]`.

Store **only** in env (never commit the production value, never `NEXT_PUBLIC_*`):

```bash
INDEXNOW_KEY=
# optional override:
# INDEXNOW_ENDPOINT=https://api.indexnow.org/indexnow
```

## Vercel configuration

1. Project **kitletics** → Settings → Environment Variables.
2. Add `INDEXNOW_KEY` = *(your generated key)* for **Production** (and Preview only if you intentionally test pings).
3. Redeploy so `/indexnow-key.txt` serves the key.
4. Confirm:
   - `https://kitletics.com/indexnow-key.txt` returns the key as `text/plain`
   - `https://kitletics.com/{INDEXNOW_KEY}.txt` rewrites to the same file

## Verification file

- **keyLocation** used in API payloads: `https://kitletics.com/indexnow-key.txt`
- Equivalent ownership file: `https://kitletics.com/{key}.txt` (middleware rewrite)

Both return the raw key string with `X-Robots-Tag: noindex`.

## API usage

### CLI (preferred after content merges)

```bash
# Dry-run changed reviews
npm run indexnow:notify -- --dry-run --reviews=nike-vomero-18,hoka-clifton-10

# Products + alternatives when indexable
npm run indexnow:notify -- --products=slug-a --include-alternatives

# Best / guides / comparisons
npm run indexnow:notify -- --best=daily-trainers --guides=shoe-rotation --comparisons=vomero-vs-pegasus

# Removals / depublication (re-crawl so engines see 404/noindex)
npm run indexnow:notify -- --mode=removal --urls=/products/retired-slug

# Explicit URLs (upsert still filtered to current sitemap / INDEXABLE set)
npm run indexnow:notify -- --urls=https://kitletics.com/reviews/nike-vomero-18
```

`--from-sitemap` is **rejected** by the CLI.

### Programmatic

```ts
import { notifyIndexNow, notifyIndexNowForProductPublish } from "@/lib/seo/indexnow";

await notifyIndexNow({
  entities: [
    { kind: "review", slug: "nike-vomero-18" },
    { kind: "product", slug: "nike-vomero-18" },
  ],
});

await notifyIndexNowForProductPublish("nike-vomero-18", {
  reviewSlug: "nike-vomero-18",
  includeAlternatives: true,
});
```

## Submission eligibility

Upsert submissions only include URLs that are **INDEXABLE** under the existing launch policy (`getLaunchEligibility` + `isIndexableEligibility`) — the same bar as the sitemap.

Never submitted:

| Surface | Reason |
|---------|--------|
| Draft / unpublished | Not INDEXABLE |
| `PUBLIC_NOINDEX` / soft holds | Not INDEXABLE |
| Held vertical deep pages | `HIDDEN_404` / not INDEXABLE |
| `/preview/*`, `/go/*`, `/api/*`, `/admin/*` | Blocked paths |
| `/search` and `?*` facet URLs | Blocked / query rejected |
| Other hosts (`www` normalized to apex; others rejected) | Host check |

**Removals:** may notify a former public path without requiring current INDEXABLE status, still enforcing host + blocked-path rules.

## Retry / error handling

- Success: HTTP `200` or `202`
- Retry with exponential backoff on `429` and `5xx` (default 2 retries)
- Missing `INDEXNOW_KEY`: no-op (`skipped: true`) — publish scripts continue
- Lifecycle helper `scripts/lib/indexnow-after-publish.ts` never throws into publish success path

## Rate limiting

- Preferred batch size: **100** URLs
- Hard max per request: **10,000** (IndexNow protocol)
- Multiple batches are sequential with retry backoff

## Logging

CLI and lifecycle hooks log `[indexnow]` lines for skip/dry-run/batch OK/errors. No PII; URL lists are canonical public paths only.

## Lifecycle integration

Wired today:

- `scripts/publish-fitness-reviews.ts` — after successful publish of review slugs
- `scripts/backfill-missing-product-reviews.ts` — after appended published reviews

Manual / post-merge (recommended for seed edits to best/guides/comparisons/products):

```bash
npm run indexnow:notify -- --products=… --reviews=… --best=… --guides=… --comparisons=…
```

**Do not** call IndexNow from offer refresh, pricing, media-only, maintenance scans, or blank deploys.

## Testing

```bash
npm test -- --project unit tests/indexnow.test.ts
```

Coverage includes: canonical host, blocked paths, missing key, batching, dedupe, invalid host, eligibility filter via sitemap set, error/retry behavior.

## Verify in Bing Webmaster Tools

1. Add/verify `kitletics.com` in [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Ensure IndexNow key file is publicly reachable.
3. Submit a single known INDEXABLE URL via CLI (not dry-run) with Production `INDEXNOW_KEY`.
4. Bing Webmaster → **IndexNow** / URL submission activity (UI labels vary) — confirm the ping was accepted.
5. Optionally use Bing’s URL inspection after a few minutes.

Google is not an IndexNow participant; keep Search Console sitemap + indexing as today (`https://kitletics.com/sitemap.xml`).
