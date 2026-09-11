# Fix 13 — Launch Eligibility & Publication Gates

**Mode:** Remediation (unified INDEXABLE / PUBLIC_NOINDEX / HIDDEN_404)  
**Date:** 2026-09-06  
**Principle:** `published` ≠ `indexable`

---

## 1. Scoreboard (simulated Day-1, production context)

Counts are **computed** via `simulateDay1LaunchCounts()` — not hardcoded inventory.

| Page type | Published pool | INDEXABLE | PUBLIC_NOINDEX | HIDDEN_404 |
|---|---:|---:|---:|---:|
| Products | 623 | 248 | 119 | 256 |
| Reviews | 503 | 225 | 60 | 218 |
| Best guides | 58 | **18** | 26 | 14 |
| Buying guides | 68 | 41 | 0 | 27 |
| Comparisons | 102 | 69 | 0 | 33 |
| Setups | 16 | 5 | 0 | 11 |
| Tools | 25 | 25 | 0 | 0 |
| Sport hubs (live) | 10 | **1** (running) | 8 | 1 (hyrox alias) |
| Brands | 191 | 103 | 0 | 88 |
| **Entity total** | **1596** | **735** | **213** | **648** |

Best guides: only **LAUNCH_READY** index — weak Best pages are no longer sitemap/search fodder (was the “57 weak Best” risk).

---

## 2. API

```ts
getLaunchEligibility({ kind, entity }, context?)
→ { disposition, quality?, reasons[], previewVisible, path? }
```

Dispositions:

| Disposition | Sitemap | Robots | Production URL | Preview/dev |
|---|---|---|---|---|
| `INDEXABLE` | yes | index | 200 | 200 |
| `PUBLIC_NOINDEX` | no | noindex | 200 | 200 |
| `HIDDEN_404` | no | — | **404** | renderable + noindex |

Internal trace: `?launchDebug=1` in preview/dev only (`LaunchEligibilityDebug`).

---

## 3. Policies

### Products
- `LAUNCH_READY` → INDEXABLE  
- `NEEDS_MINOR_WORK` → PUBLIC_NOINDEX unless slug in `launchMinorWorkApprovals`  
- `THIN` / `INCOMPLETE` → PUBLIC_NOINDEX  
- `BLOCKED` / soft-gated category → HIDDEN or PUBLIC_NOINDEX  
- Vertical hold (fitness-only / racket / …) → HIDDEN_404  

### Reviews
- Same pattern as products (LAUNCH_READY index; minor-work held unless approved).

### Best guides
- **Only `LAUNCH_READY` → INDEXABLE**  
- `NEEDS_MINOR_WORK` → PUBLIC_NOINDEX  
- `THIN` → HIDDEN_404  

### Buying guides
- `COMPLETE` → INDEXABLE  
- THIN / RESEARCH / STALE / EDITORIAL_REVIEW → PUBLIC_NOINDEX  
- BLOCKED / vertical hold → HIDDEN_404  

### Comparisons
- Meaningful → INDEXABLE  
- Thin → PUBLIC_NOINDEX  
- Vertical hold / unpublished → HIDDEN_404  

### Vertical strategy (`src/content/launch/vertical-strategy.ts`)
- **running:** enabled  
- **fitness:** selective (hub PUBLIC_NOINDEX; deep entities held)  
- **padel / tennis / racket / hyrox / calisthenics:** disabled deep entities  
- Content is **not deleted**

---

## 4. Wiring

| Surface | Change |
|---|---|
| `src/app/sitemap.ts` | INDEXABLE only |
| Product / review / best / guide / compare pages | `enforceLaunchEligibility` + robots |
| Sport hubs | running INDEXABLE; others noindex |
| Search | `shouldPromotePublicly` (INDEXABLE) |
| Best index + category assemble | Best/guides/comps INDEXABLE; products listable ≠ HIDDEN |
| Catalog query | drops HIDDEN products |

---

## 5. Key files

```text
src/domain/launch/
  types.ts
  get-launch-eligibility.ts
  assess-*-quality.ts
  simulate-day1.ts
  index.ts
src/content/launch/
  vertical-strategy.ts
  minor-work-approvals.ts
src/lib/launch/apply-eligibility.ts
src/components/launch/LaunchEligibilityDebug.tsx
tests/launch-eligibility.test.ts
```

---

## 6. Tests

```bash
npx vitest run tests/launch-eligibility.test.ts
→ 8 passed
```

---

## 7. Definition of done

- [x] Unified `getLaunchEligibility` with reasons  
- [x] Product / review / best / guide / comparison policies  
- [x] Vertical launch-state (running enabled; fitness selective; racket disabled)  
- [x] Sitemap uses eligibility  
- [x] Search / hubs do not promote HIDDEN / non-indexable Best  
- [x] HIDDEN_404 → production 404; preview inspectable  
- [x] Debug trace gated; not public QA chrome  
- [x] Day-1 URL counts by page type (simulated, dynamic)

---

## 8. Follow-ups

- Re-point prelaunch-02/03 scripts at domain assessors (single source of truth)  
- Expand `launchMinorWorkApprovals` intentionally when signing off NEEDS_MINOR_WORK SKUs  
- Open fitness/racket in `vertical-strategy.ts` when content qualifies — no mass undelete needed  
