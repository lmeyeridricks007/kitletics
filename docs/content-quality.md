# Content quality & Review lifecycle gates

Kitletics separates two questions for every Product:

1. **Can we publish the Product?** → `canPublishProduct` (identity, specs, media, evidence minimums)
2. **Can we explain whether someone should buy it?** → Review readiness via `ProductReviewAgent` / `assessProductReviewLifecycle`
3. **Can we feature it prominently?** → `assessFeatureReadiness` / `canFeatureProductStrategically` (not the same as listing media gate)

## Public rules

- Never show “AI Review” — user-facing type is Expert Research / First-Hand Tested / Tested + Research
- Never invent first-hand testing
- Omit Full Review CTA when no publishable Review exists (Product page stays useful)
- Internal Prompt/agent/staging language must never appear in public copy

## CI / QA commands

```bash
npm run reviews:ci          # hard fails for invalid published Reviews
npm run reviews:qa          # per-review gate + visible-type checks
npm run reviews:maintenance # stale/missing tasks + backlog
npm run catalog:qa          # includes Review coverage metrics
npm run freshness:scan
vitest run tests/review-lifecycle.test.ts
```

## Feature surfaces

| Surface | Review required? |
| --- | --- |
| Category / search listing card | Media gate only (`canFeatureProduct`) |
| Finder candidate | Recommendation ready; Review preferred |
| Finder Top Match / Best Guide / Homepage / Gear Hub / Brand featured | Ready Review + evidence + media |
| Gear setup core item | Review **or** evidence + recommendation rationale |

## Backlog outputs

- `reports/review-backlog.json`
- `reports/review-backlog.md`
