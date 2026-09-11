# Fix 28 — Best Guide CI policy reconciliation

**Date:** 2026-09-09  
**Status:** Implemented (pre-launch — **do not publish**)  
**RC reference:** [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)  
**Verification:** [`../data/rc-final/28-best-verify.json`](../data/rc-final/28-best-verify.json)

## Objective

Remove the stale CI absolute ceiling on indexable Best Guides (`≤12`) without shrinking Day-1 Best inventory, without lowering `LAUNCH_READY` gates, and without deleting coverage — replace it with semantic eligibility assertions.

---

## 1. Old assertion

**File:** `tests/launch-eligibility.test.ts`  
**Former title:** `indexes only editorial LAUNCH_READY Best guides (seed, not enrich-inflated)`

```ts
// Editorial audit Day-1 bar — do not inflate via normalizeBestGuide.
expect(indexable.length).toBeLessThanOrEqual(12);
```

**RC failure:** `expected 44 to be less than or equal to 12` (`npm test` EXIT 1).

### Classification

| Code | Meaning | Applies? |
|---|---|---|
| A | Quality safety rule | **No** — quality is already enforced by `eligibilityForBest` → only `LAUNCH_READY` → `INDEXABLE` |
| B | Vertical launch rule | **No** — vertical holds already exclude hyrox/padel/tennis/fitness Best |
| C | Temporary conservative launch ceiling | **Yes (historical)** — Fix 15 era Day-1 bar when Best LR ≈ 9 |
| D | Obsolete hardcoded count | **Yes (current)** — Fix 17 raised Running Best LR/INDEXABLE to **44**; ceiling never updated |
| E | Other | — |

**Verdict: C → D.** The `≤12` bound was a conservative editorial inventory ceiling from the Fix 15 “seed-only LR Best (~9)” era, not a live quality rule. Fix 17 completed Running Best to 44 LAUNCH_READY / INDEXABLE; CI kept the old count.

Evidence:

- Fix 15 docs: Best INDEXABLE **9** after seed assessment (`docs/prelaunch/fixes/15-day1-index-recalibration.md`)
- Fix 15 policy: **“No URL-count target. Sitemap size is an output.”**
- Fix 17: Running Best **9 → 44** LAUNCH_READY; INDEXABLE **44/44** (`docs/prelaunch/fixes/17-running-best-completion.md`)
- Final RC: Best INDEXABLE **44**, all LAUNCH_READY; 0 indexable non-LAUNCH_READY

---

## 2. Verify all 44 (before rewriting expectations)

Script: `scripts/tmp/prelaunch-28-best-verify.ts` → `docs/prelaunch/data/rc-final/28-best-verify.json`

| Check | Result |
|---|---|
| Published Best | 58 |
| INDEXABLE | **44** |
| INDEXABLE ∩ ¬LAUNCH_READY | **[]** |
| THIN ∩ INDEXABLE | **[]** |
| Held-vertical ∩ INDEXABLE | **[]** |
| Duplicate intent keys among INDEXABLE | **[]** |
| Sitemap Best count == eligibility INDEXABLE | **44 == 44** |
| Non-indexable | 14 (vertical_hold + THIN/NMW under holds) |

**No holds required** for quality — all 44 indexable Best genuinely pass current `LAUNCH_READY` rules.

---

## 3. Correct policy (indexation)

Best indexation is governed by **eligibility**, not an absolute count:

1. Production-exposed (published / publicly resolved)
2. Launch-enabled vertical (not `vertical_hold`)
3. `LAUNCH_READY` quality assessment
4. Canonical path (`/best/<slug>`)
5. Unique intent (one INDEXABLE slug per path)
6. Not duplicative / not blocked

Implemented by `getLaunchEligibility({ kind: "best-guide" })` + sitemap INDEXABLE gate. Sitemap Best count is an **output** of that gate.

---

## 4. Tests changed

**File:** `tests/launch-eligibility.test.ts`

### Removed

- `expect(indexable.length).toBeLessThanOrEqual(12)`
- Count-ceiling framing in the test name/comment

### Added / rewritten (semantic)

| Assertion | Intent |
|---|---|
| Every INDEXABLE Best has `quality === "LAUNCH_READY"` and `disposition === "INDEXABLE"` | Quality gate |
| No INDEXABLE Best carries `vertical_hold` | Held verticals stay out |
| Assessed seed quality is `LAUNCH_READY` for each INDEXABLE | No enrich-inflation leak |
| Unique INDEXABLE slugs | No duplicate-intent collisions |
| `simulateDay1LaunchCounts().best-guide.INDEXABLE === indexable.length` | Eligibility ↔ Day-1 sim parity |
| Every THIN Best is not indexable | Thin stay out |
| Every `vertical_hold` Best is `HIDDEN_404` / not indexable | Held verticals stay out |
| INDEXABLE length `<` published and `>` 0 | Still filters some published Best |

Coverage was **replaced**, not deleted. Absolute ceiling is gone.

---

## 5. Collateral: offer freshness (required for green CI)

After the Best test rewrite, a full `npm test` still failed until offer `lastChecked` was refreshed.

**Cause:** `shouldDisplayNumericPrice` requires fresh/recent (≤72h). Seed/last refresh was `2026-09-04T18:31:38.610Z`; on **2026-09-09** all NL offers were `aging` → displayable **0** → commerce/PDP tests expected EUR/From-prices and got `undefined`.

**Action (not a quality-threshold change):**

```bash
npm run pricing:agent -- --mode=refresh --write --region=NL
```

- Patched 1271 offers · created 22 new  
- Bumped `SEED_DATES.verified` → `2026-09-09T06:04:57.161Z`  
- Displayable: **623/623 (100%)** NL  

This is clock drift on the existing 72h display window — **not** a Best policy change and **not** a lowering of LAUNCH_READY gates.

---

## 6. Final CI results

| Gate | Exit | Notes |
|---|---:|---|
| `npm test` | **0** | 54 files / **556** tests passed (~90s) |
| `npm run lint` | **0** | 0 errors (warnings only) |
| `npm run typecheck` | **0** | `tsc --noEmit` |
| `npm run build` | **0** | Compiled successfully |

Logs: `docs/prelaunch/data/rc-final/logs/28-*.log`

---

## 7. What we did **not** do

- Did **not** reduce INDEXABLE Best from 44 → 12  
- Did **not** change `LAUNCH_READY` thresholds or eligibility quality rules  
- Did **not** delete Best CI coverage  
- Did **not** publish  

---

## 8. Residual (out of Fix 28)

Final RC still lists **4 sitemap comparison 404s** (missing peer products). Unrelated to Best CI policy; track separately.
