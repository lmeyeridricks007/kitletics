# Fix 58 — Final category editorial gap

**Mode:** Remediation (complete the 1 remaining category editorial config — do not flip READY)  
**Date:** 2026-09-10  
**Evidence:** `docs/prelaunch/data/58-category-readiness.json` · `scripts/tmp/prelaunch-58-category.ts`  
**Gates unchanged:** V2 category READY = `Boolean(cfg.decision) && !soft`; Fix 44 `products≥8` diagnostic **not** lowered; media publish gate unchanged

Editorial READY ≠ a full accessories mall. Vertical launch strategy was **not** edited except the accessories manifest row, which now matches the completed specialist shelf (`launch-supporting`, `minProducts: 3`).

---

## 1. Result

| Metric | Before | After |
|---|---|---|
| Category editorial configs (V2) | **14** | **14** |
| READY | **13** | **14/14** |
| Not READY | **1** | **0** |

**Target met: 14/14 READY.**

---

## 2. Exact remaining category

**Accessories** (`cat-accessories`, slug `accessories`, path `/running/accessories`).

It was the only published category with a page config that failed V2 READY because it sat in `SOFT_GATED_CATEGORY_SLUGS` — not because the decision block was missing after earlier drafts. Clothing, sunglasses and nutrition had already been ungated in Editorial 44.

Did **not** ungate by deleting the soft-gate alone. The page now has purpose, decision factors, product types, specs, trade-offs, use-case shifts, Best, Guide, Finder, and product discovery (filters, subcategories, three picks).

---

## 3. Honest catalog (not padded)

Published SKUs (**3**, chafe only):

| Product | Format | Subcategory |
|---|---|---|
| Body Glide Original | Stick balm | `sub-acc-stick-balm` |
| Squirrel’s Nut Butter | Stick / tin balm | `sub-acc-stick-balm` |
| 2Toms SportShield | Roll-on film | `sub-acc-roll-on` |

Wave-2 gaiters, armbands and compression sleeves remain **media-gated drafts** (no authentic heroes → stay draft). Not published to hit an 8-SKU mall.

Fix 44-style dump still flags `thin_3` on accessories. That ≥8 product gate was **not** lowered. V2 READY does not use it.

---

## 4. What was completed (not SEO filler)

### 4.1 Category purpose

Anti-chafe finishers for longs and race kits. Explicitly **not** audio, lights, sunglasses or belts — those jobs keep their own categories. Taxonomy description and hero copy say the same thing.

### 4.2 Decision factors

Name the rub (skin-on-skin vs seam/kit); how you will apply it in a start corral vs on trail; whether you will reapply after 90+ minutes; what else already lives in the kit (socks, liner, bra).

### 4.3 Product types

Stick balms (Body Glide, Squirrel’s) vs roll-on barriers (SportShield).

### 4.4 Key specifications

Format, water resistance, application speed — tied to mess, dry-time, pocketability and race-morning use.

### 4.5 Trade-offs

Stick grab-and-go vs roll-on thin film. Barrier vs fixing the garment first.

### 4.6 Use-case differences

Weekly long &lt;90 min (one stick on known spots) vs marathon/ultra (reapply method / tin) vs tight race kit (roll-on dry-time).

Beginner start: one stick (Body Glide default), trial on a mid-week long, not race morning.

### 4.7 Best / Guide / Finder

| Surface | URL | Status |
|---|---|---|
| Best | `/best/running-anti-chafe` | **LAUNCH_READY** (`contextualDepth=high`) |
| Guide | `/guides/anti-chafe-for-runners` | Editorial **READY**, quality **complete**, ~1157 words |
| Finder | `/tools/running-accessories-finder` | Anti-chafe option added (`long-runs` → chafe SKUs); still routes audio / lights / eyewear / safety away |

Assembled category page: **1** indexable Best, **1** indexable Guide, **1** Finder, **3** picks.

### 4.8 Product discovery

- Featured subcategories: Anti-Chafe Sticks / Roll-Ons  
- Filters: `type`, `brand`, `price`  
- Education (3): name the rub; stick vs roll-on; not audio or lights  
- Picks: default stick / ultra stick-tin / race-kit roll-on  

---

## 5. What was not done

- Did not invent gaiters, BUFF, or armbands without heroes.  
- Did not lower `products≥8` in Fix 44 scripts.  
- Did not add accessories to `ALTERNATIVES_INDEXABLE_CATEGORIES` (3-SKU graph still fails ≥3 alt types — `relationships.test.ts` still holds Body Glide alternatives).  
- Remaining soft-gates: **padel-accessories**, **padel-clothing** (empty shells).

---

## 6. Readiness re-run

V2 formula (`cfg.decision && !isSoftGatedCategory`):

```
V2 { v2Total: 14, v2Ready: 14 }
```

`notReady`: **[]**

Accessories assembled: `n=3` · `best=1` · `guides=1` · `tools=1` · `picks=3` · `edu=3` · V2 READY.

Targeted tests: `launch-readiness`, `product-quality-assessor-consistency`, `relationships`, `catalog` — **48/48 passed**.

---

## 7. Files (substantive)

| File | Change |
|---|---|
| `src/lib/navigation/category-href.ts` | Ungate running `accessories` after decision content |
| `src/content/running/launch-manifest.ts` | `launch-supporting`, `minProducts: 3` |
| `src/lib/catalog/running-decisions.ts` | Full accessories decision + education |
| `src/lib/catalog/running-category-configs.ts` | Hero CTAs, finder, filters, picks, terminology |
| `src/content/running/best-guides-gear.ts` | Best Anti-Chafe (3 published SKUs) |
| `src/lib/guides/explainers/running-density-plans.ts` | Anti-chafe buying guide (stick vs roll-on) |
| `src/domain/finders/configs/running-gear-finders.ts` | Finder option for anti-chafe |
| `src/content/editorial-intent-consolidations-p46.ts` | Category keep (specialist shelf), not hold |

---

**14/14 category editorial configs READY.** Accessories is an anti-chafe specialist page, not a padded mall.
