# Fix 12 — Regional Commerce Readiness

**Mode:** Remediation (honest regional commerce UX; no invented global coverage)  
**Date:** 2026-09-06  
**Reference:** `docs/prelaunch/06-media-offers-trust.md`  
**Issue:** I-12 (Regional commerce) — BE/FR/ZA zero Offer rows; US nearly empty; DE/UK partial; NL strong

---

## 1. Scoreboard

| Check | Before | After |
|---|---|---|
| Launch primary commerce region | Implied equal / US prioritized with NL | **NL primary** (`PRIMARY_COMMERCE_REGION`, manifest) |
| Region switcher coverage honesty | Flat list (equal markets implied) | Per-region coverage hints + variance note |
| Empty-region copy | “No current retailer offers found for {label}” | Exact: **No verified retailer offers currently available in your region.** |
| Cross-region Amazon as local Buy CTA | Review hero/verdict/footer fell back to `offersOtherRegions` | **In-region Amazon only** |
| Empty-region price CTAs | “Check prices” / “View prices” / accent Prices → | Neutral messaging; product CTAs without fake Buy |
| Geo inference | `localeHint` unused but undocumented | Explicitly ignored; comments + test |
| NL offer as “local” for BE/FR/ZA | Filtered correctly in data layer; UI still implied buy | Data unchanged; UI no longer presents NL as local |

**Unchanged (correct):** Product/review pages remain indexable and useful without regional Offers. Offer queries stay region-scoped (`getOffersForProduct(id, region)`). Default region remains NL when no cookie/explicit.

---

## 2. Audit baseline (from 06)

| Region | Offer rows | Displayable % | Launch posture |
|---|---:|---:|---|
| NL | 738 | ~100 | **primary** |
| DE | 274 | ~40 | partial |
| UK | 278 | ~41 | partial |
| US | 3 | ~0 | limited |
| BE / FR / ZA | 0 | 0 | none |

Informational content stays globally useful. Commerce claims do not.

---

## 3. Changes

### Positioning
- `src/lib/region/commerce-readiness.ts` — coverage map, primary region, shared empty-state string
- `src/content/running/launch-manifest.ts` — `prioritizeRegions: NL → DE → UK`; `primaryCommerceRegion: NL`; `neverPresentCrossRegionOfferAsLocal`

### Region switcher
- `RegionSelector` — note that retailer coverage varies; each option shows Strong / Limited / Very limited / No verified offers

### No offers / no NL-as-local
- `OfferPanel` — required empty copy; other-region listings only behind an explicit details control labeled **not local**
- Review Amazon pickers — removed `?? pickAmazonOffer(offersOtherRegions)` in Hero, Verdict, Detail
- `ReviewScorePanel` — Buy CTA only with in-region Amazon or regional offers; else neutral empty copy
- PDP / sticky / best / setups — no accent “Prices / Check prices” Buy when `offers.length === 0`

### Geo / currency
- `resolveUserRegion` — still explicit → cookie → NL; `localeHint` deliberately unused (test covered)

### Product quality ≠ commerce
- PDP with `region: ZA` still returns product + editorial graph; `offers: []`, `lowestPrice` undefined (test)

---

## 4. Tests

```text
npx vitest run tests/commerce.test.ts tests/product-page.test.ts
→ 45 passed
```

New coverage: localeHint ignored; NL primary coverage map; BE/FR/ZA do not inherit NL lowest price; ZA product page keeps content without local offers.

---

## 5. Definition of done

- [x] NL treated as primary commerce-ready region
- [x] Region switcher does not imply equal retailer coverage
- [x] Empty regions use the required neutral message
- [x] No silent NL-as-local Buy / Amazon CTA
- [x] Explicit region respected; no incorrect country inference
- [x] Product pages remain useful/indexable without regional Offers
- [x] Broken/irrelevant Buy CTAs removed for empty regions
- [x] Report at `docs/prelaunch/fixes/12-regional-commerce.md`

---

## 6. Follow-ups (out of scope)

- Seed real Offer rows for BE/FR/ZA (and meaningful US coverage) before claiming those markets
- Raise DE/UK displayable % toward NL parity
- Optional: hide “other regions” details entirely on markets with zero desire for cross-border links
