# Fix 88 — Production code hygiene

**Date:** 2026-09-11  
**Status:** Implemented  
**Scope:** `src/` audit for TODO / FIXME / HACK / console / eslint-disable / ts-ignore / dead code  
**CI:** lint · typecheck · tests · build — all pass

---

## Verdict

Production `src/` is clean of ambiguous TODO debt and accidental `console.log` / `console.debug`. Remaining suppressions are **JUSTIFIED_SUPPRESSION** with inline rationale. Finder scoring calibration is documented as **FUTURE_ROADMAP** (`FUT-FINDER-SCORING`), not in-code TODO.

---

## 1. Classification inventory

| Finding | Location | Class | Action |
|---------|----------|-------|--------|
| Finder scoring TODO | `running-shoe-finder.ts` | **FUTURE_WORK** | Removed TODO; documented in `docs/prelaunch/FUTURE_ROADMAP.md` + CSV `FUT-FINDER-SCORING` |
| `console.debug` calculator | `domain/calculators/analytics.ts` | **DEBUG_RESIDUE** → intentional telemetry | Replaced with sink pattern (match commerce) |
| `console.debug` rotation | `domain/shoe-rotation/share-state.ts` | **DEBUG_RESIDUE** → intentional telemetry | Same sink pattern |
| `eslint-disable` exhaustive-deps (5) | RegionSelector, CompareExperience, MobileDrawer, ProductFitSizingPanel, PaceCalculatorApp | **JUSTIFIED_SUPPRESSION** | Kept; rationale comments completed |
| `eslint-disable` no-img-element (20) | BrandMark, BrandCard, Search, Gear hub, Discipline hub, GuideConceptVisuals | **JUSTIFIED_SUPPRESSION** | Kept; rationale on every site |
| `@ts-ignore` / `@ts-expect-error` | — | — | **None in `src/`** |
| FIXME / HACK | — | — | **None in `src/`** |
| Accidental `console.log` in `src/` | — | — | **None** (scripts/tmp CLI logs out of scope) |
| Gallery `MediaAsset` missing `type` | `product-gallery-media.ts` | **REQUIRED** | Added `type: "image"` (typecheck break from Fix 87) |
| Unused locals in `scripts/tmp` | prelaunch-79/80/81/87 | **STALE** | Removed unused imports/helpers so lint is 0 warnings |

### Class definitions used

| Class | Meaning |
|-------|---------|
| **REQUIRED** | Correctness / CI breakage — fix now |
| **FUTURE_WORK** | Legitimate post-launch programme — document, do not leave ambiguous TODO |
| **STALE** | Leftover from tooling; remove |
| **DEBUG_RESIDUE** | Accidental or informal console noise — remove or promote to telemetry sink |
| **JUSTIFIED_SUPPRESSION** | Lint rule correctly suppressed with documented technical reason |

---

## 2. Console / telemetry

| Before | After |
|--------|-------|
| Dev-gated `console.debug` in calculator + rotation trackers | No-op **sink** APIs (`setCalculatorAnalyticsSink` / `setRotationAnalyticsSink`), same contract as `trackCommercialEvent` |
| Production path | Silent unless a vendor sink is wired — no browser console residue |

Call sites unchanged (`trackCalculatorEvent`, `trackRotationEvent`).

---

## 3. Finder scoring TODO

**Was:** `TODO: validate/tune scoring against expert-labeled recommendation scenarios.`

**Classification:** FUTURE_WORK (labeled / ML calibration) — **not** Day-1 correctness.

**Done:**

1. Removed production TODO from `src/domain/finders/configs/running-shoe-finder.ts`
2. Header now points at `docs/prelaunch/FUTURE_ROADMAP.md` (`FUT-FINDER-SCORING`)
3. Roadmap page spells out gold-set eval vs “not a bug / not launch debt”

Weights + eligibility remain as documented heuristics; finder tests still cover deterministic scoring.

---

## 4. ESLint disables (production)

All **25** remaining `eslint-disable*` in `src/` carry `--` rationale.

### `react-hooks/exhaustive-deps` (5)

| File | Why necessary |
|------|----------------|
| `RegionSelector.tsx` | Cookie hydrate once on mount |
| `CompareExperience.tsx` | Sync tray only when selection/category changes (omit tray identity churn) |
| `MobileDrawer.tsx` | Close on `pathname` only — omit unstable `onClose` |
| `ProductFitSizingPanel.tsx` | Drive from `urlFit` only — including `selected` fights clicks |
| `PaceCalculatorApp.tsx` | Mount-once open telemetry + localStorage unit hydrate |

### `@next/next/no-img-element` (20)

Native `<img>` retained for:

- Small brand marks / logos in monogram wells
- Absolute-positioned gear/discipline montage layers
- Search / hub thumbs where `next/image` boxing fights `object-contain` / decorative layout
- Guide concept photos that must preserve intrinsic aspect (next/image object-fit clipped overlays)

None are obsolete suppressions; none hide unrelated rule failures.

---

## 5. Dead code

- No naive “unused export” purge of Next.js page/layout/route modules.
- Production unused-var surface already cleaned in Fix 66; this pass found **0** unused in live `src/` after hygiene edits.
- Safe STALE cleanup limited to `scripts/tmp` leftovers that reintroduced lint warnings (Fix 87 tooling).
- Gallery mapper fixed to emit required `MediaAsset.type` (REQUIRED for `tsc`).

---

## 6. CI

| Command | Result |
|---------|--------|
| `npm run lint` | **0 errors, 0 warnings** |
| `npm run typecheck` | **exit 0** |
| `npm test` | **62 files / 639 tests passed** |
| `npm run build` | **exit 0** (Next.js production build) |

---

## 7. Files touched

| Path | Change |
|------|--------|
| `src/domain/finders/configs/running-shoe-finder.ts` | TODO → FUTURE_ROADMAP pointer |
| `src/domain/calculators/analytics.ts` | Sink telemetry (no console) |
| `src/domain/shoe-rotation/share-state.ts` | Sink telemetry (no console) |
| `src/content/product-gallery-media.ts` | `type: "image"` on gallery assets |
| `src/components/**` (eslint sites) | Rationale comments on suppressions |
| `docs/prelaunch/FUTURE_ROADMAP.md` | New — FUT-FINDER-SCORING detail |
| `scripts/tmp/prelaunch-79/80/81/87-*` | Unused-symbol STALE cleanup |

---

## What remains (not debt)

- Wiring a real analytics vendor into the three sinks (commerce / calculator / rotation) — product decision, not hygiene debt.
- `FUT-FINDER-SCORING` when a labeled recommendation programme opens.
- Optional later migration of list thumbs to `next/image` where layout allows — not required for launch.
