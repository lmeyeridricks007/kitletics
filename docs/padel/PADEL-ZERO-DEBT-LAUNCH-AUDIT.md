# Padel zero-debt launch audit

**Document ID:** `PADEL-ZERO-DEBT-LAUNCH`  
**Clock:** 2026-09-14  
**Lab:** clean `.next` → lint → typecheck → test → build → `next start` on `http://127.0.0.1:3012`  
**Method:** independent rebuild + full inventory regenerate + full rendered crawl (`AUDIT_MODE=zero-debt`, concurrency 2) + soft-goods media family check + axe/mobile + desktop/mobile canaries  
**Rule:** Do not trust Prompt 148/149 remediation reports. Only this rebuild’s CI, inventory, crawl, and rendered canaries count.

Artifacts:

| File | Role |
| --- | --- |
| [`data/PADEL-ZERO-DEBT-URL-INVENTORY.csv`](data/PADEL-ZERO-DEBT-URL-INVENTORY.csv) | Regenerated Padel URL universe (includes `/padel/collections`) |
| [`data/PADEL-ZERO-DEBT-URL-CRAWL.csv`](data/PADEL-ZERO-DEBT-URL-CRAWL.csv) | Full INDEXABLE + PUBLIC_NOINDEX crawl |
| [`data/PADEL-ZERO-DEBT-ISSUES.csv`](data/PADEL-ZERO-DEBT-ISSUES.csv) | Exact remaining defects |
| [`data/PADEL-ZERO-DEBT-SCORECARD.json`](data/PADEL-ZERO-DEBT-SCORECARD.json) | Required zeros + verdict |
| [`data/PADEL-ZERO-DEBT-MEDIA-CHECK.json`](data/PADEL-ZERO-DEBT-MEDIA-CHECK.json) | Soft-goods shared-hero / forbidden-family check |
| [`data/PADEL-ZERO-DEBT-CANARIES.json`](data/PADEL-ZERO-DEBT-CANARIES.json) | Desktop + mobile canary inspections |
| [`data/PADEL-A11Y-MOBILE.json`](data/PADEL-A11Y-MOBILE.json) | axe serious/critical + mobile overflow |

---

## VERDICT: **NO-GO**

Required zeros are **not** all zero. Soft-goods hero identity and WRONG_* media families cleared this crawl, but launch is still blocked by:

1. **6 BLOCKER** sitemap URLs for padel setups that are **not** in the regenerated inventory (and return HTTP 200 → untracked public routes).
2. **14 HIGH** raw schema keys visible in rendered copy (`customization_weight` on accessories; `courtFeel` camelCase on shoe reviews).

---

## 1. Clean CI

| Step | Result | Notes |
| --- | --- | --- |
| `rm -rf .next` | OK | Before build |
| `npm run lint` | **PASS** | 0 errors |
| `npm run typecheck` | **PASS** | |
| `npm test` | **PASS** | **925/925** with `--testTimeout=300000` (re-proved after crawl) |
| `npm run build` | **PASS** | |
| `next start :3012` | **PASS** | Restarted once after hung brand-page sockets during first crawl attempt |

Brand hubs remain slow (~40s) but return 200.

---

## 2. URL inventory (regenerated)

| Metric | Count |
| --- | ---: |
| Universe | **1093** |
| INDEXABLE | **415** |
| PUBLIC_NOINDEX | **180** |
| HIDDEN_404 | **498** |
| Crawled (INDEXABLE + PUBLIC_NOINDEX) | **595** |
| `/padel/collections` in inventory | **yes** |

### Untracked 200 routes (fail condition)

These return **HTTP 200**, appear in the live sitemap, and are **missing** from the regenerated inventory:

- `/setups/padel-beginner-kit`
- `/setups/padel-budget-starter-kit`
- `/setups/padel-club-player-kit`
- `/setups/padel-commuter-kit`
- `/setups/padel-competitive-player-kit`
- `/setups/padel-tournament-day-kit`

Inventory currently only tracks `/setups/padel-starter-kit` among padel setups. That is both an inventory gap and the source of the six `INVALID_SITEMAP_URL` blockers.

---

## 3. Full rendered crawl

`CRAWL_BASE=http://127.0.0.1:3012` · `CRAWL_CONCURRENCY=2` · **595/595** URLs · no sampling.

---

## 4. Required zeros

| Required zero | Value | Pass? |
| --- | ---: | --- |
| BLOCKER | **6** | NO |
| HIGH | **14** | NO |
| token leakage (`TOKEN_LEAK` detector) | 0 | yes |
| raw schema leakage | **14** | NO |
| machine copy | 0 | yes |
| broken copy | 0 | yes |
| WRONG_SPORT media | 0 | yes |
| WRONG_PRODUCT hero | 0 | yes |
| WRONG_BRAND hero | 0 | yes |
| fake testing | 0 | yes |
| fake ratings | 0 | yes |
| broken indexable URL | 0 | yes |
| invalid sitemap URL | **6** | NO |
| review/product identity mismatch | 0 | yes |
| a11y serious | 0 | yes |
| a11y critical | 0 | yes |
| test failures | 0 | yes |

### Exact remaining defects

#### BLOCKER — invalid sitemap / untracked setups (6)

| ID | Path |
| --- | --- |
| PADEL-00015 | `/setups/padel-beginner-kit` |
| PADEL-00016 | `/setups/padel-budget-starter-kit` |
| PADEL-00017 | `/setups/padel-club-player-kit` |
| PADEL-00018 | `/setups/padel-commuter-kit` |
| PADEL-00019 | `/setups/padel-competitive-player-kit` |
| PADEL-00020 | `/setups/padel-tournament-day-kit` |

#### HIGH — raw schema keys in rendered HTML (14)

**Accessories — literal `customization_weight` in body** (example: “is a customization_weight accessory”):

- `/products/bullpadel-custom-weight-grip` (+ alternatives)
- `/products/bullpadel-protector-custom-weight` (+ alternatives)
- `/products/bullpadel-frame-protector-3-pack/alternatives`
- `/products/nox-transparent-frame-protector/alternatives`
- `/products/nox-weight-balancer-2-4g` (+ alternatives)
- `/products/shockout-gravity` (+ alternatives)

**Shoe reviews — literal `courtFeel` camelCase in body** (example: “if this courtFeel job shows up”):

- `/reviews/adidas-courtquick-padel`
- `/reviews/asics-gel-resolution-padel`
- `/reviews/babolat-jet-premura`
- `/reviews/kuikma-ps-990`

---

## 5. Product media (soft-goods families)

Independent check (`scripts/tmp/padel-zero-debt-media-check.ts`):

| Check | Result |
| --- | --- |
| Soft published products | 159 |
| Invalid shared heroes across unrelated products | **0** |
| Forbidden family reuse (balls / bags / grips / accessories) | **0** |
| Crawl WRONG_SPORT / WRONG_PRODUCT / WRONG_BRAND | **0** |

Former failure families (HEAD Pro S balls, Wilson overgrip, Nox paletero, Bullpadel protector) no longer appear as shared heroes on unrelated published PDPs in this rebuild.

---

## 6. Manual canaries (desktop)

Rendered inspections covered:

| Bucket | Count inspected | Notes |
| --- | ---: | --- |
| Rackets | 10 | OK |
| Shoes | 5 | OK |
| Balls | 15 | OK |
| Bags | 20 | OK |
| Grips | 15 | OK |
| Accessories | 15 | 4 SCHEMA leaks (`customization_weight`) — matches crawl |
| Reviews | 5 | Rechecked: 4 with `courtFeel`; vertex review 404 (not indexable) |
| Best | 5 | OK |
| Comparisons | 5 | OK |
| Alternatives | 5 padel | Rechecked padel-only: OK / no wrong-sport |
| Guides | 5 | OK |
| Hub / Finder / database / brands / collections | yes | Database shows developer prose `updatedOn stays null…` (not in formal TOKEN_LEAK regex) |

Hub, Finder, database, brands, and collections all returned 200.

---

## 7. Mobile

Same canary set + axe suite at 390×844:

| Check | Result |
| --- | --- |
| Mobile horizontal overflow (axe suite + canaries) | **0** |
| axe serious | **0** |
| axe critical | **0** |
| Visible `genderFit` | **0** |
| `genderFit` still in HTML source | 4 pages (not a required zero; residual RSC) |

---

## 8. What cleared vs what did not

**Cleared in this independent rebuild (vs earlier go-live NO-GO):**

- Soft-goods WRONG_* / shared fallback heroes
- Broken indexable URLs
- Fake testing / fake ratings
- Review↔product identity mismatches
- Machine / broken decision copy (formal detectors)
- a11y serious/critical + mobile overflow
- `/padel/collections` inventoried

**Still blocking GO:**

- Untracked public setup URLs in sitemap (6)
- Visible raw schema keys in accessories + shoe reviews (14)

---

## Bottom line

**NO-GO.** Do not declare Padel zero-debt launch until the six setup URLs are inventoried (or removed from sitemap) and the 14 raw-key copy leaks are rewritten to spoken labels (`customization weight`, `court feel`).
