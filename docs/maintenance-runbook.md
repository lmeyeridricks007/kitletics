# Maintenance runbook

Operational guide for continuous catalog freshness (Prompt 20).

## Daily

1. `npm run offers:refresh -- --dry-run` (or `--write` in ops)
2. Review P0 queue: `npm run maintenance:queue`
3. Fix broken critical media / redirects if flagged
4. If report says **No material changes detected** — stop

## Weekly

1. `npm run brands:monitor -- --brand=asics --dry-run` (tier-1 brands)
2. Triage NEW / NEW_GENERATION candidates
3. Suppress false positives (regional SKU, accessory OOS) with expiry when appropriate
4. Start Prompt 19 onboarding for HIGH candidates
5. Review Guide / Comparison impact tasks — **do not** auto-replace winners
6. `npm run media:check -- --dry-run`

## Monthly

1. `npm run freshness:scan -- --sport=running`
2. `npm run guides:review-due`
3. `npm run evidence:check`
4. `npm run content:freshness` + `npm run content:claims`
5. `npm run maintenance:qa -- --sport=running --dry-run`
6. Coverage / Finder readiness spot-check

## P0 handling

Broken hero on high-visibility Product, security/publication leak, affiliate independence failure:

1. Create/confirm P0 task
2. Safe fix (media fallback, disable broken embed, expire stale deal claim)
3. Revalidate public route
4. Do **not** mass-edit editorial verdicts

## New Product

```text
Brand monitor → candidate task → product:onboard → review → approve → publish
```

Never publish from monitor alone.

## New generation

```text
Discover → onboard candidate → lifecycle review previous → comparison candidate
→ guide review flags → Finder/Rotation awareness after publish
```

Previous generation is **not** auto-obsolete.

## Source conflict

Prefer exact-context manufacturer spec. Record conflict. No averaging. No silent overwrite.

## Broken media

Replace with verified manufacturer asset + provenance, else Kitletics image-unavailable fallback.

## Stale Offer

Mark stale / refresh adapter. Product remains published. Remove Deal badges when evidence expires.

## Guide review

Research → editorial decision → update guide → set last reviewed metadata. Monitoring must not bump dates.

## Year rollover

Title years (`Best … 2026`) → review task. Never global find-replace to next year.

## Example: unchanged Product refresh

```text
review-soon → product:refresh → facts unchanged → lastVerifiedAt only → resolve task
```

## Example: changed Product

```text
spec change → staged delta → recommendation dependency → guide impact → approve → publish → revalidate
```
