# Fix 05 — Running Core Category Readiness

**Mode:** Remediation (evidence-backed enrichment; no fake first-hand testing)  
**Date:** 2026-09-06  
**Reference bar:** Running Shoes (Fix 04)  
**Evidence basis:** `docs/prelaunch/02-product-quality.md`, `docs/prelaunch/data/02-product-quality.json`  
**Quality bar:** unchanged (GPS Watches / HRM not modified)

---

## 1. Before / after by category

| Category | Total | Before LAUNCH_READY | After LAUNCH_READY | Before open gaps | After open gaps | BLOCKED (unchanged) |
|---|---:|---:|---:|---:|---:|---:|
| **Packs & Vests** (P0) | 42 | **19** | **35** | 16 NEEDS_MINOR | **0** | 7 drafts |
| **Running Socks** (P1) | 14 | **6** | **10** | 4 NEEDS_MINOR | **0** | 4 drafts |
| **Headphones** (P1) | 17 | **4** | **11** | 7 NEEDS_MINOR | **0** | 6 drafts |
| GPS Watches | 33 | 33 (100%) | **33 (100%)** | 0 | 0 | 0 |
| Heart Rate Monitors | 15 | 15 (100%) | **15 (100%)** | 0 | 0 | 0 |
| Running Shoes (ref) | 84 | 83 | 83 | 0 open | 0 open | 1 draft |

**Publishable coverage (excluding BLOCKED drafts):**

| Category | Publishable ready |
|---|---|
| Packs & Vests | **35 / 35 (100%)** |
| Socks | **10 / 10 (100%)** |
| Headphones | **11 / 11 (100%)** |

---

## 2. What blocked readiness

Common pattern on NEEDS_MINOR items (decisionScore often already 80–100):

1. **`review:missing`** — blocking weak dim (no exemption)
2. **`positioning:weak`** — no ≥40-char product verdict
3. **`seo_metadata:weak`** — missing `seoTitle` / `seoDescription`
4. Socks: **`family:broken`** — referenced family IDs did not exist
5. Headphones: some **unlinked** existing reviews (`airpods-pro-2`, `bose-ultra-open`)
6. Weak / missing graph alternatives → `canCompare` / decision depth

Draft products stayed BLOCKED (`status=draft`, not production-exposed) — not force-published.

---

## 3. Fixes applied

| Area | Change |
|---|---|
| Enrichment + reviews | `src/content/running/gear-core-launch-ready.ts` — expert-research summary reviews + product patches (verdict, positioning, SEO, reviewId, alts, families) |
| Wiring | `products.ts` → `applyGearCoreLaunchReadyEnrichment`; `reviews.ts` → `gearCoreLaunchReviews` |
| Sock families | Added missing families in `clothing-families.ts` (Swiftwick, Drymax, Wrightsock, Balega Hidden Comfort, Bombas, Hilly, Sockwell) |
| Headphone families | Apple AirPods, Bose Ultra Open, soundcore Sport in `headphones-families.ts` |
| Relationships | Meaningful `direct-competitor` edges (packs / socks / headphones) in `relationships.ts` |
| Best / guides | Related products on hydration-vest + headphones buying guides; sock + headphone picks on Best guides |

Reviews are **`expert-research`** with explicit “we have not personally tested unless stated” disclosure — no invented first-hand testing.

---

## 4. Remaining non-ready (BLOCKED drafts only)

### Packs & Vests (7)

`prod-patagonia-slope-runner`, `prod-raidlight-responsiv-12`, `prod-kiprun-trail-10`, `prod-camelbak-octane-22`, `prod-salomon-trailblazer-20`, `prod-leki-trail-running-quiver`, `prod-salomon-soft-flask-stash`

### Socks (4)

`prod-bombas-performance-running-quarter`, `prod-hilly-marathon-fresh`, `prod-sockwell-compression-light`, `prod-stance-run-crew`

### Headphones (6)

`prod-sony-linkbuds-open`, `prod-sony-linkbuds-fit`, `prod-jabra-elite-8-active`, `prod-jabra-elite-10`, `prod-beats-powerbeats-pro-2`, `prod-huawei-freeclip`

**Exact reason (all):** `not_production_exposed` + `status=draft` — keep blocked until intentional publish + media/review pass.

---

## 5. Explicit non-goals

- Did **not** touch GPS Watches or HRM product records
- Did **not** lower LAUNCH_READY thresholds
- Did **not** publish drafts to inflate readiness %
- Did **not** claim first-hand testing on new reviews

---

## 6. Re-audit

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-02-product-quality.ts
```

Outputs refreshed: `docs/prelaunch/02-product-quality.md`, `docs/prelaunch/data/02-product-quality.json`.
