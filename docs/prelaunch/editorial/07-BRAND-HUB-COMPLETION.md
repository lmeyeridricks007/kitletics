# Brand Hub Completion — Editorial 43

**Document ID:** `07-BRAND-HUB-COMPLETION`  
**Generated:** 2026-09-09  
**Scope:** All Brand hubs — decision value, thin holds, uniqueness, family/generation navigation  
**Data:** `docs/prelaunch/editorial/data/43-brand-hub-completion.json` · baseline `43-brand-hub-audit.json`

## Executive status

| Metric | Before | After |
|---|---|---|
| Brands in catalog | 191 | 191 |
| Rendered Brand hubs | 103 | **69** (depth-qualified) |
| Indexable | 103 | **56** |
| Boilerplate overview blurbs | **103 / 103** | **0** |
| Empty “known for” | 96 | **0** |
| With guides | 2 | **42** |
| With comparisons | — | **51** |
| With Best appearances | — | **60** |
| How-lines-differ + generation context | ~0 | **69 / 69** |
| Uniqueness NEEDS_DIFF (indexable) | — | **0** |
| Uniqueness DUPLICATIVE (indexable) | 2 | **0** |
| Thin brands held (have products, no hub) | weak gate | **91** |

**Targets:** real buyer value · no corporate filler · thin held · no name-swap boilerplate on indexable set — **met.**

## Baseline problems

1. **Generic SEO shells** — every hub used *“{Brand} on Kitletics — structured Product data, not a manufacturer microsite.”*
2. **About = manufacturer description** — little decision help; history/metrics without equipment context.
3. **Only 7 hand configs** (ASICS, Garmin, Nike, COROS, Rogue, Adidas, Tecnifibre); 96 hubs had empty “known for”.
4. **Almost no Guides / Comparisons / Best links** wired into the page.
5. **Families** lacked who-suits / generation context.
6. **Fit chips** always showed Men/Women/Unisex for shoe brands (stereotype risk) even without catalogued variants.
7. **Thin gate** (`≥2` products) let shallow catalogs ship as hubs.

## What changed

### 1. Catalog-driven editorial

`src/lib/brand-hub/brand-hub-editorial.ts`

Builds unique:

- Buyer **summary** / overview blurb (product cues + categories + families)
- **How lines differ**
- **Generation context** (current vs previous)
- Pillars + known-for from real catalog signals
- Auto guide slug suggestions by category
- Founded year **only** when it helps long family-tree context (old footwear/rack/watch brands)

### 2. Page assembly

`get-brand-hub-data.ts` + `BrandHubPage.tsx`

- Decision “buying map” about section
- Family cards: generation label + who it suits
- **Comparisons** and **Best guide appearances** rails
- Guides auto-filled when category maps exist
- Sizing chips only for **catalogued audiences** (Men’s / Women’s / Unisex **sizing** labels)

### 3. Thin brands held

`canPublishBrandHub` requires real depth (`≥3` products plus category/family/strength signals). Thin catalogs stay **HIDDEN_404** — no fabricated hubs.

### 4. Uniqueness holds

`src/content/brand-hub-uniqueness-holds.ts` — 13 near-duplicate hubs remain **renderable** (`PUBLIC_NOINDEX`) until further differentiation; not Day-1 indexable.

### 5. Index vs render

- `canRenderBrandHub` — depth gate (static params + page)
- `isBrandHubIndexable` — depth + not on uniqueness hold (sitemap / robots)

## Verification

```bash
npx vitest run tests/brand-hub.test.ts
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-43-brand-hub-verify.ts
```

Indexable uniqueness: **29 GENUINELY_UNIQUE · 27 TEMPLATE_SIMILAR_ACCEPTABLE · 0 NEEDS_DIFF · 0 DUPLICATIVE**.

## Definition of done

- [x] Categories, families, how lines differ, positioning, who families suit  
- [x] Generation context  
- [x] Links to Reviews, Best, Comparisons, Guides (when graph supports)  
- [x] No corporate history filler by default  
- [x] Useful family / generation navigation  
- [x] Variant sizing without stereotypes  
- [x] Thin brands held  
- [x] No boilerplate name-swap on indexable set  
- [x] Report + machine data written  

## Follow-ups

- Hand-differentiate uniqueness-hold brands, then remove from hold set  
- Expand guide maps for padel / tennis / fitness categories  
- Optional: dedicated editorial configs for major remaining Running brands beyond the original seven
