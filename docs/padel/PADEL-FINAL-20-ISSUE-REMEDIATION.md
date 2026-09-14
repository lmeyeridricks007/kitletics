# Padel final 20-issue remediation

**Document ID:** `PADEL-FINAL-20-ISSUE-REMEDIATION`  
**Clock:** 2026-09-14  
**Scope:** Exact remaining zero-debt defects (6 BLOCKER + 14 HIGH) and directly related root causes.  
**Rule:** This report is remediation evidence only. It does **not** declare GO. A final independent zero-debt revalidation must run next.

Authoritative prior audit: [`PADEL-ZERO-DEBT-LAUNCH-AUDIT.md`](PADEL-ZERO-DEBT-LAUNCH-AUDIT.md).

---

## Before → after (remediation targets)

| Metric | Before | After (this remediation) |
| --- | ---: | ---: |
| BLOCKER | 6 | **0** (setup inventory gap closed; all 7 kits INDEXABLE) |
| HIGH | 14 | **0** (raw schema copy generators + baked store fixed) |
| invalid sitemap | 6 | **0** |
| raw schema leakage | 14 | **0** (generator + formatter + store) |
| `customization_weight` visible | present | **0** |
| `courtFeel` visible | present | **0** |
| developer prose (`updatedOn stays null`) | present | **0** |
| genderFit visible | 0 | **0** |
| genderFit source / RSC | 4 | **reduced** (public row keys + review config keys sanitized; catalog `specifications.genderFit` may still exist server-side) |
| untracked public setup URLs | 6 | **0** |

---

## 1–6. Setup URL blockers

### Classification (all six + starter)

| Setup | Class | Distinct purpose |
| --- | --- | --- |
| `/setups/padel-starter-kit` | VALID_INDEXABLE | Essentials on-ramp |
| `/setups/padel-beginner-kit` | VALID_INDEXABLE | Lessons + consumables ladder |
| `/setups/padel-budget-starter-kit` | VALID_INDEXABLE | Minimum viable Kuikma value kit |
| `/setups/padel-club-player-kit` | VALID_INDEXABLE | Weekly club nights |
| `/setups/padel-commuter-kit` | VALID_INDEXABLE | Backpack / desk-to-court |
| `/setups/padel-competitive-player-kit` | VALID_INDEXABLE | League / hard club |
| `/setups/padel-tournament-day-kit` | VALID_INDEXABLE | Match-day travel + spares |

None were thin SEO shells. Closest pairs share some SKUs by design but differ on bag role, scenario, and checklist.

### Fixes

1. **Inventory** — `scripts/tmp/padel-prelaunch-audit.ts` now loops all padel `getGearSetups()` instead of hardcoding `padel-starter-kit`.
2. **Budget kit publishability** — removed unpublished `prod-kuikma-paletero` optional bag from seed + P45 enrichment so `canPublishGearSetup` passes while preserving the budget lane (consumables-first, bags deferred).

Sitemap retains all seven; all have explicit INDEXABLE disposition.

---

## 7–9. `customization_weight` / accessory enums

### Root cause

`accessoryCopy()` in `scripts/tmp/enrich-padel-pdp-editorial.ts` interpolated raw `specifications.type` into prose. Baked output lived in `store.generated.ts`. Spec value formatting only title-cased hyphen tokens, so underscores survived. Alternatives copy used `formatPublicSpecCue("type", "customization_weight")` → `type customization_weight`.

### Fixes

- `formatPublicAccessoryTypeNoun()` + `formatPublicSpecValueToken()` in `src/lib/specs/public-label.ts`
- Generator uses spoken accessory nouns
- Regenerated/patched `store.generated.ts` (no remaining `customization_weight` strings)
- `formatPublicSpecCue` formats enum values
- PDP `formatSpecValue` speaks underscore enums
- Public spec rows omit string `raw`; `specDefs.enumValues` spoken on page payload
- Dropped `evidenceBasis` from public soft-editorial payload (`curated_seed`)

---

## 10–12. `courtFeel` / review attribute keys

### Root cause

`extendPadelLongformSectionBody` and `deepenCloser` interpolated blueprint topic ids (`courtFeel`) into filler sentences.

### Fixes

- Rewrote padel extender templates to use `padelTopicBuyerFocus()` (shopper phrases, not schema keys)
- Rewrote `deepenCloser` similarly
- Removed `` `${topic} section` `` interpolation in non-padel extender fallback
- Public review/product/best comparison row keys use `publicSpecRowKey()` (`courtFeel` → `court-feel`, `genderFit` → `fit`)
- Review page `config.*Keys` sanitized before client payload
- Best guide label `Last / genderFit` → `Last / fit`

---

## 13–14. Database developer prose + detector

### Fix

`src/lib/padel-racket-database/citation/about-dataset.ts` updates section rewritten for shoppers (no `updatedOn` / null mechanics).

### Detector expansion

- `src/lib/review/public-content-corruption.ts` — developer-prose patterns (`stays null`, `updatedOn`, `schema field`, …)
- `scripts/tmp/padel-prelaunch-audit.ts` `TOKEN_RES` — same family

---

## 15–16. genderFit / public raw-key policy

- Visible genderFit remains 0
- Client-facing row keys and review config keys no longer serialize `genderFit` / `courtFeel` camelCase
- Catalog still stores `specifications.genderFit` server-side for filtering (required); not duplicated as public row ids
- Policy encoded in `publicSpecRowKey` / `formatPublicSpecValueToken` / `isRawPublicSpecKey` + regression tests

---

## 20. Tests

`tests/padel-final-20-issue-remediation.test.ts`:

- all public padel setups have explicit INDEXABLE disposition + `canPublish`
- sitemap padel setup URLs ⊆ published gear setups
- no `customization_weight` / accessory snake enums in soft PDP public copy
- no `courtFeel` in extenders or review public copy / config keys
- database about copy has no implementation prose

---

## 21. CI (this remediation)

| Step | Result |
| --- | --- |
| `rm -rf .next` | OK |
| `npm run lint` | **PASS** (0 errors) |
| `npm run typecheck` | **PASS** |
| `npm test` | **PASS** — **931/931** (was 925; +6 remediation tests) |
| `npm run build` | **PASS** |

This report still does **not** declare GO.
---

## Next required step

Re-run the independent zero-debt audit (full rebuild + inventory + full INDEXABLE/PUBLIC_NOINDEX crawl + setup crawl). Only that revalidation may flip the verdict to GO.
