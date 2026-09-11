# Shoe Rotation Planner

Set-based running shoe recommendations at `/tools/shoe-rotation-planner`.

## Problem

Unlike the Running Shoe Finder (individual Product ranking), this planner asks:

> What shoes should I own **together**?

It evaluates **coverage, gaps, overlap, and complementarity** across a set.

## Domain

```
src/domain/shoe-rotation/
  roles.ts          — canonical roles ↔ UseCases, thresholds
  types.ts
  normalization.ts  — answers → RotationProfile
  suitability.ts    — Product role scores from Recommendations
  coverage.ts       — max-per-role coverage
  overlap.ts        — role-similarity overlap
  engine.ts         — candidate pruning + set optimization
  share-state.ts
```

## Roles

| Role | Label | UseCases |
|------|-------|----------|
| daily | Daily Trainer | uc-daily-training |
| easy-recovery | Easy / Recovery | uc-easy-runs, uc-recovery-runs |
| long-run | Long Run | uc-long-runs |
| tempo | Tempo | uc-tempo-runs |
| intervals | Intervals | uc-intervals, uc-speed-work, uc-tempo-runs |
| race | Race Day | race UseCases (narrowed by selected races) |
| trail | Trail | uc-trail-training |

## Coverage algorithm

For each required role:

```
bestCoverage = max(product suitability for role)
```

Weighted coverage = weighted average of bestCoverage (role weights from priorities).

Second-best ≥ 80 adds a small resilience bonus — does **not** dominate.

Thresholds: 90+ Strong, 80–89 Covered, 70–79 Weak, &lt;70 Gap.

## Overlap

Overlap uses role suitability similarity, not raw specs. High-mileage overlapping daily trainers can be marked **useful**.

## Candidate pruning

1. Top N eligible Products per required role  
2. Merge/dedupe into pool (capped)  
3. Evaluate combinations within pool  

Avoids full combinatorial explosion over the catalog.

## Set optimization

Score ≈ coverage − overlapPenalty + budget term + priority − sizePenalty  

**Not** average Product Match score. Two excellent daily trainers lose to daily + race when race is required.

Affiliate commission is never an input (`AFFILIATE_NEUTRALITY`).

## Modes

- **From scratch** — choose 1–4 shoes or “recommend for me”
- **Improve** — lock owned shoes; incremental best-next additions (2nd assumes 1st added)

## Manual shoes

User-declared roles only. No fabricated specs, prices, or Recommendation scores.

## Budget

Uses regional Offers for **new additions** (improve) or full set (scratch). Missing prices are not treated as €0.

## Share state

`/tools/shoe-rotation-planner/results?s=…` — versioned base64url, noindex. Prices recalculated on load.

## Debugging

`?debugRotation=true` in development shows coverage / overlap / totals.

## Testing

Critical fixture: Product A (daily/long strong, race weak) + B (similar) + C (race strong) → for Daily+Long+Race two-shoe, prefer **A+C** over **A+B**.

## Future planners

Same “cover required roles with a coherent set” pattern can inform Marathon Gear / HYROX Kit builders — without forcing shoe-specific abstractions.
