# Padel media remediation audit

**As of:** 2026-09-14  
**Verdict:** Media semantics remediation **in progress / partially complete**.  
**Padel GO:** **NOT declared.** Final go-live remains **NO-GO** until remaining drafts are filled with exact manufacturer media (or permanently excluded) and a full production HTML crawl reconfirms zeros.

Root cause: [`PADEL-MEDIA-ROOT-CAUSE.md`](./PADEL-MEDIA-ROOT-CAUSE.md)

---

## BEFORE → AFTER

| Metric | BEFORE (final go-live crawl) | AFTER (identity gate + revoke + catalog semantic crawl) |
|--------|------------------------------|-----------------------------------------------------------|
| `WRONG_PRODUCT` | **188** | **0** (published/indexable catalog heroes) |
| `WRONG_BRAND` | **143** | **0** |
| `WRONG_SPORT` | **7** | **0** (alternatives configs use `/images/padel/hero.jpg`) |
| Placeholder / polluted registry reuse (known families) | Systematic | **72** secondary registry rows revoked; survivors must pass identity |
| Byte-identical shared heroes across product IDs | N/A (unique filenames hid pollution) | **INVALID = 0**, **SUSPICIOUS = 0** |
| Public / published padel products | Inflated by wrong heroes | **222** published (all `MEDIA_VERIFIED`) |
| Soft-goods published (balls/bags/grips/accessories) | ~majority of catalog with polluted heroes | **159** published + verified |
| Soft-goods draft (de-published / not public) | Low | **196** |
| Newly verified exact media this pass | — | **1** (`prod-4on-pro-t1` from manufacturer 4on.store); **196** soft drafts remain on research queue |
| De-published due to missing / wrong media | — | **72 revoked + remaining drafts without verified registry** |

Sources:

- BEFORE: `PADEL-FINAL-GO-LIVE-AUDIT.md` / final HTML crawl
- AFTER catalog crawl: `docs/padel/data/PADEL-MEDIA-SEMANTIC-CRAWL-SUMMARY.json`
- Remediation rows: `docs/padel/data/PADEL-MEDIA-REMEDIATION.csv` (458 products incl. drafts)
- Duplicate heroes: `docs/padel/data/PADEL-DUPLICATE-HERO-AUDIT.csv`
- Revokes: `data/staging/padel-media-identity-revoke.json`

---

## What was fixed (canonical product → media)

1. **`src/lib/product/media-identity.ts`** — exact-product `MEDIA_VERIFIED` (sport, brand, model, source pathname; bag≠racket path; no query-token gaming).
2. **`getPrimaryProductMedia`** — padel returns only identity-verified heroes (no category/brand/featured fallback).
3. **`applyMediaPublishGate`** — all padel SKUs without verified media → `draft`.
4. **Gallery** — skips unverified padel frames.
5. **Alternatives** — soft categories get padel hero configs (removes running guide art).
6. **Semantic subjects** — soft category IDs map to padel, not running shoes.
7. **Soft-wave fetch** — pathname-only identity score + racket-path penalty.
8. **Reconcile** — `MEDIA_VERIFIED` only when `hasVerifiedProductHero` passes.
9. **Registry revoke** — 72 identity-failing `PADEL_SECONDARY_PRODUCT_MEDIA` entries removed.
10. **Courtstabil** — Courtquick catalog media removed; wrong-image shoe patch list updated.
11. **Regression tests** — `tests/padel-media-identity.test.ts` (4ON≠HEAD Pro S; Adidas≠Nox; non-Wilson≠Wilson grip; non-Bullpadel≠protector; published soft = verified only).

**Not done:** JSX page patches, swapping one shared placeholder for another, declaring GO.

---

## Category status (AFTER)

| Category | Published + verified | Draft / research queue |
|----------|----------------------|-------------------------|
| Rackets | 57 | (remainder in draft set) |
| Shoes | 6 | — |
| Balls | 44 | includes Sane Core, etc. (4ON Pro T1 restored via manufacturer) |
| Bags | 65 | includes Kuikma/Osaka/Metalbone polluted set |
| Grips | 29 | includes Hydrosorb / Tourna polluted set |
| Accessories | 21 | includes weight-tape / protector pollution set |

Research queue: `docs/padel/data/PADEL-MEDIA-RESEARCH-QUEUE.csv` (**197** rows; **72** marked prior revoke).

---

## Known failure families (remediated by gate)

| Family | Failure | AFTER |
|--------|---------|-------|
| HEAD Pro S / ball pollution | Wrong ball / spray / grip sources on ball PDPs | Bad rows demoted or revoked; HEAD Pro S stays only on identity-OK SKUs |
| Nox AT10 Team paletero | Cross-brand bag heroes | Adidas/Nox cross-use blocked by identity + revoke |
| Wilson overgrip | Cross-brand grip heroes | Forged Wilson path fails tests; non-Wilson published grips verified |
| Bullpadel frame protector | Accessory category pollution | Forged protector path fails tests; non-Bullpadel accessories verified |
| Running guide on alternatives | `WRONG_SPORT` × 7 | Soft alternatives configs → `/images/padel/hero.jpg` |

---

## Duplicate hero detector

`classifySharedHeroReuse` + `scripts/tmp/padel-media-remediation-report.ts` → `PADEL-DUPLICATE-HERO-AUDIT.csv`.

**Required:** `INVALID = 0`, unresolved `SUSPICIOUS = 0` — **met** on current published authentic heroes (unique `src` per product after revoke).

---

## Media research pass (remaining)

Priority order for every draft / revoked SKU:

1. Official manufacturer  
2. Official distributor  
3. Specialist retailer  
4. Major reputable retailer  

**Forbidden:** Google Image scrape, Pinterest, random blogs, marketplace seller composites, AI product imagery, query-polluted suggest hits.

This remediation pass registered **one** exact manufacturer download as a canary of the research pipeline (`prod-4on-pro-t1` ← https://www.4on.store/products/padelballs/4on-pro-t1-padel-balls-3p-tube). Remaining drafts stay non-public until exact packshots are researched. Quality > URL count.

---

## Visual canaries

Queued in `docs/padel/data/PADEL-MEDIA-VISUAL-CANARIES.csv` (**70** rows: 15 balls / 25 bags / 15 grips / 15 accessories across published brands).

**Status:** automated identity + path checks green; **human pixel review still PENDING** for the canary list and any uncertain candidates. Do not treat automated OK as final visual sign-off.

---

## Crawls

| Crawl | Result |
|-------|--------|
| Catalog semantic (`scripts/tmp/padel-media-semantic-crawl.ts`) | `WRONG_PRODUCT/BRAND/SPORT = 0`, `MISSING_VERIFIED_PRIMARY = 0` for **222** published/indexable |
| Full production HTML (`next build` + `next start` + prelaunch audit) | **Not re-run in this pass** — required before any GO reconsideration |

---

## Publication rule (enforced for padel)

INDEXABLE Product PDP requires identity + specs + editorial + **`MEDIA_VERIFIED` exact hero** + technical quality. Commerce may be absent. Media may **not** be absent or wrong.

---

## Definition of done for media (not yet fully met)

- [x] Root cause documented  
- [x] No product→product hero fallbacks on PDPs  
- [x] Identity gate + de-publish without exact media  
- [x] Cross-sport alternatives art removed from soft configs  
- [x] Duplicate INVALID/SUSPICIOUS = 0 (catalog)  
- [x] Regression tests for known families  
- [x] Catalog semantic crawl zeros  
- [ ] Research + register exact media for research queue (or permanent exclude)  
- [ ] Human visual canaries completed  
- [ ] Full production HTML crawl zeros  
- [ ] Padel GO — **blocked**

---

## Related files

| Path | Role |
|------|------|
| `src/lib/product/media-identity.ts` | Identity gate |
| `src/content/running/products/media-publish-gate.ts` | Publish demotion |
| `src/content/padel/soft-goods/product-media.ts` | Verified secondary registry only |
| `tests/padel-media-identity.test.ts` | Regression |
| `docs/padel/data/PADEL-MEDIA-REMEDIATION.csv` | Per-product BEFORE action sheet |
| `docs/padel/data/PADEL-DUPLICATE-HERO-AUDIT.csv` | Shared hero classes |
| `docs/padel/data/PADEL-MEDIA-SEMANTIC-CRAWL.csv` | Catalog crawl evidence |
| `docs/padel/data/PADEL-MEDIA-RESEARCH-QUEUE.csv` | Exact-media research backlog |
| `docs/padel/data/PADEL-MEDIA-VISUAL-CANARIES.csv` | Manual review list |
