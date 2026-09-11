# Freshness & Catalog Maintenance

Kitletics freshness answers:

```text
WHAT CHANGED?  WHAT IS NEW?  WHAT IS STALE?
WHAT MAY NOW BE WRONG?  WHAT CONTENT IS AFFECTED?  WHAT SHOULD BE REVIEWED NEXT?
```

Workflow:

```text
MONITOR → DETECT → VERIFY → ASSESS IMPACT → TASK → RESEARCH/REFRESH → REVIEW → APPLY → REVALIDATE
```

Monitoring **detects**. It does **not** silently rewrite editorial recommendations, auto-publish Products, or treat publication dates as freshness.

## Review maintenance (integrated)

Product Reviews participate in Prompt 20 freshness:

| Trigger | Task |
| --- | --- |
| Stale Review (category cadence) | `review-refresh` |
| Missing Review on eligible Product | `review-refresh` / research |
| Spec change on claim-sensitive field | `review-refresh` (revalidate claims) |
| Generation / lifecycle change | Review successor + previous + comparison candidates |
| Evidence source removed | Revalidate Review sources |
| Price / offer change | **No** Review editorial update |
| personal-test Evidence appears | Propose hybrid/first-hand — human approval only |

Category cadences live in `src/domain/review-agent/staleness.ts` (e.g. GPS watches shorter than power racks).

```bash
npm run reviews:maintenance
npm run maintenance:run -- --job=review-maintenance --dry-run
```

Schedule entry: `monthly-reviews` in `DEFAULT_MAINTENANCE_SCHEDULES` (invoker-owned cron — not hardcoded in domain).

See `docs/product-review-agent.md` and `docs/content-quality.md`.

## Domain

```text
src/domain/freshness/
  types.ts policies.ts evaluation.ts
  tasks.ts impact.ts queries.ts
  storage.ts orchestrator.ts fixtures.ts
  monitoring/{brand,scans,content}.ts
```

## Freshness statuses

`fresh` · `review-soon` · `stale` · `unknown` · `conflicting`

Evaluated via `evaluateFreshness` + category policies (offers ≠ specs ≠ guides).

Age alone ≠ wrong. Event-driven signals (new generation, source conflict, broken media) can force review.

## Events → Tasks

Events use deterministic `dedupeKey`. Tasks aggregate related triggers (one lifecycle review, many triggers).

Priorities: **P0** broken public experience · **P1** high-impact decision content · **P2** normal · **P3** enrichment.

Ownership: `catalog` | `editorial` | `commercial` | `engineering`.

## Brand / Product monitoring

`monitorBrandCatalog` reuses Prompt 19 discovery. Outputs candidates + maintenance tasks. **Never** auto-publishes.

Missing manufacturer URL → lifecycle **review**, not automatic discontinuation.

New generation → onboarding candidate + previous-gen lifecycle review + ComparisonCandidate + Guide review flags (no auto winner replace).

## Spec / Recommendation / Editorial

High-impact fields require review. Recommendation dependencies mark recomputation/review. Price changes do **not** invalidate suitability.

Best Guides: create `guide-review` tasks; do not bump `updatedAt` until editorial review happens.

## Commerce / Media / Evidence

Offers: short freshness window; stale UI per Prompt 17; Product stays published.

Broken hero → P1 media repair; fallback = intentional unavailable asset, never stock photo.

Evidence: mark unavailable/superseded; do not delete audit trail; never fabricate personal-test.

## CLI

```bash
npm run freshness:scan -- --sport=running --dry-run
npm run brands:monitor -- --brand=asics --dry-run
npm run offers:refresh -- --region=NL --dry-run
npm run content:freshness -- --dry-run
npm run content:claims -- --dry-run
npm run maintenance:run -- --job=full --sport=running --dry-run
npm run maintenance:qa -- --dry-run
npm run maintenance:queue
```

Default is dry-run. Pass `--write` to persist the queue under `data/staging/maintenance/`.

Reports: `reports/maintenance/`.

## Schedules

`DEFAULT_MAINTENANCE_SCHEDULES` defines cadences (daily offers, weekly brand/media, monthly guides/QA). Domain exposes jobs; Vercel Cron / GitHub Actions / local can invoke CLI.

## Security

- External page text is untrusted data (prompt-injection resilient)
- http(s) only for fetches (when live adapters exist)
- No secrets in reports
- CI uses fixtures — no live brand crawl on every PR
- Staged/scheduled content never leaks via maintenance output into public routes

## Integration with Prompt 19

Product refresh / onboarding tasks hand off to `product:refresh` / `product:onboard`. Approval gates unchanged.
