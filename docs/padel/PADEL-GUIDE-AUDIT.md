# Padel equipment knowledge-center audit

**As of:** 2026-09-13  
**Method:** Buying Guides in `src/content/padel/buying-guides/`, long-form explainers in `src/lib/guides/explainers/padel-knowledge-*.ts`, quality via `assessGuideQuality`. Inventory: `scripts/tmp/padel-knowledge-guides-audit.ts` → `data/staging/padel-knowledge-guides-quality.json`.

Padel remains **vertical-disabled**. Editorial `complete` ≠ INDEXABLE.

Kitletics has **not** physically tested these products. Guides use manufacturer specs, normalized catalog fields, and role examples from the published catalog. Affiliate commission does not rank examples.

---

## Headline

| Metric | Count |
| --- | ---: |
| **Guides created / upgraded** | **21** |
| **`assessGuideQuality` = complete** | **21** |
| **thin / needs-research** | **0** |
| **Missing related product IDs** | **0** |
| **Best Balls page** | **Skipped** (only 2 published fast cans) |
| **Wide-feet shoe guide** | **Not requested as Best; shoes guides stay honest about limited width data** |

---

## Created (authority cluster)

### Racket knowledge (10)

| Slug | Type | Catalog roles (examples) | Best / Finder / Compare |
| --- | --- | --- | --- |
| `how-to-choose-a-padel-racket` | buying · startHere | Indiga CTR, ML10 Pro Cup, Vertex 05, Hack 04 | Best rackets (+ beginners/control/power/all-round), Finder, Vertex↔Hack / Vertex↔AT10 |
| `padel-racket-shapes-explained` | explainer | Indiga, Vertex Hybrid, Hack 04, Genius 12K | Best rackets / control / power, Finder |
| `round-vs-teardrop-vs-diamond-padel-rackets` | comparison | Indiga, Genius 12K, Hack 04 | Beginners / all-round / power, Finder, comparisons |
| `padel-racket-balance-explained` | technical | Indiga, Extreme Motion, Hack 04, Metalbone 3.5 | Maneuverability / lightweight, Finder |
| `padel-racket-weight-explained` | technical | Ionic Light, Extreme Motion, Vertex 05, Metalbone 3.5 | Lightweight / maneuverability / women, Finder |
| `padel-racket-materials-explained` | technical | Comfort Soft, Hack 04 Comfort, Genius 12K, Hack 04 | Comfort / category, Finder |
| `carbon-vs-fiberglass-padel-rackets` | comparison | Comfort Soft, Equation Soft, Genius 12K, Technical Viper | Comfort / beginners, Finder |
| `padel-racket-cores-eva-foam-explained` | technical | Equation Soft, Comfort Soft, Vertex 05, Hack 04 | Comfort / power, Finder |
| `soft-vs-hard-padel-rackets` | comparison | Equation Soft, Comfort Soft, Hack 04, Metalbone 3.5 | Comfort / power / control, Finder |
| `how-padel-racket-sweet-spots-work` | technical | Indiga, ML10, Vertex 05, Hack 04 | Control / beginners, Finder |

### Shoes (3)

| slug | Job |
| --- | --- |
| `how-to-choose-padel-shoes` | Stability vs grip vs connected racer (Resolution, Courtquick, Jet Premura, T.Slam) |
| `padel-vs-tennis-shoes` | When tennis crossovers (e.g. Revolt Pro Court) are enough |
| `padel-shoe-outsoles-explained` | Surface / herringbone / omni decision |

### Balls (2) — educational, no Best ranking

| slug | Honesty rule |
| --- | --- |
| `how-long-do-padel-balls-last` | No invented hour counts; published cans only |
| `how-to-choose-padel-balls` | Published = **HEAD Pro S** + **Kuikma PB Speed** (both fast). Best Balls skipped |

### Bags & grips (4)

| slug | Catalog |
| --- | --- |
| `how-to-choose-a-padel-bag` | AT10 Team (~42 L) vs RH Pro (~62 L) → Best Bags |
| `padel-grips-overgrips-explained` | Wilson Pro vs Bullpadel HaC |
| `padel-grip-vs-overgrip` | Base rebuild vs overgrip refresh |
| `how-often-should-you-replace-a-padel-overgrip` | Failure-based replacement, not calendar myths |

### Beginner / kit (2)

| slug | Notes |
| --- | --- |
| `beginner-padel-gear-guide` | Indiga CTR class — **not** Coello Pro |
| `complete-padel-gear-checklist` | Required vs optional tiers |

---

## Content standard (per guide)

Each guide includes long-form explainer blocks with:

- Clear answer / quick answer bullets  
- Why it matters  
- Decision framework + branches  
- Technical explanation  
- Catalog role examples (≥2 published products)  
- Trade-offs + common mistakes  
- FAQs (4)  
- Related Best / Finder / peer guides where appropriate  
- Methodology note (needs-research honesty)

BuyingGuide seeds also carry 8 section bodies covering the same jobs for non-explainer surfaces.

---

## Internal linking (cluster)

| Direction | Wiring |
| --- | --- |
| Guide → Product | `relatedProductIds` (PDP reverse lookup) |
| Guide → Best | `relatedBestGuideIds` + P40 journey (shoes/grips **fixed** — no longer pointing at rackets) |
| Guide → Finder | `relatedToolSlugs: padel-racket-finder` on racket / beginner guides |
| Guide → Comparison | `relatedComparisonIds` on choose-racket / shapes / round-vs-diamond |
| Guide → Guide | `relatedGuideIds` peer clusters in seeds + `GUIDE_PEER_CLUSTERS` in `link-graph-p47.ts` |
| Best → Guide | Racket/shoe builders + overgrips/bags Best pages |
| Review → Guide | Racket / shoe / accessory review builders |
| Category defaults | `cat-padel-*` → primary knowledge guides in `link-graph-p47.ts` |

---

## Skipped / deferred

| Request | Action |
| --- | --- |
| Best Padel Balls | **Skipped** — only two published competition cans, both fast; no useful control distinction |
| Invented ball lifespan hours | **Refused** — guide explains pressure/felt failure modes without fake lab numbers |
| Wide-feet shoe knowledge page | Not in the requested title list; shoe guides note limited `widthOptions` / T.Slam narrow last |
| Enabling padel vertical | Out of scope |

---

## Quality snapshot

From `data/staging/padel-knowledge-guides-quality.json`:

- **21 / 21 complete**  
- Decision completeness: **high** on all rows  
- Typical ~950–1100 word estimate + ≥13 explainer blocks + 4 FAQs  

Re-run:

```bash
npx tsx scripts/tmp/padel-knowledge-guides-audit.ts
```

---

## Files

| Path | Role |
| --- | --- |
| `src/content/padel/buying-guides/index.ts` | BuyingGuide seeds |
| `src/lib/guides/explainers/padel-knowledge-unique.ts` | Unique explainer copy |
| `src/lib/guides/explainers/padel-knowledge-plans.ts` | CompactExplainerPlan → long-form configs + FAQs |
| `src/lib/guides/guide-backfill-faqs.ts` | Registers padel knowledge configs/FAQs |
| `src/content/guides-p40-journey.ts` | Best/Finder journey links (shoes/grips corrected) |
| `src/content/link-graph-p47.ts` | Peer clusters + category defaults |
| `scripts/tmp/generate-padel-knowledge-center.mjs` | Regenerator (edit carefully) |

Padel entries removed from `racket-plans.ts` (tennis remains) to avoid duplicate long-form slugs.

---

## Fixes included

1. **Starter kit** racket: Coello Pro → **Indiga CTR**  
2. **P40 shoes/grips** no longer deep-link Best/Finder to rackets  
3. **Grips products**: Wilson + HaC (no triple Wilson duplicate)  
4. **Ball examples**: published Pro S + Kuikma Speed only  

---

## Definition of done

- [x] Foundational titles from the brief shipped as real decision guides  
- [x] Catalog-backed examples (no previous-gen-as-current awards in copy)  
- [x] Guide ↔ Product / Best / Finder / Compare / peer cluster  
- [x] Product/Review/Best → Guide reverse links  
- [x] `docs/padel/PADEL-GUIDE-AUDIT.md`  
- [x] All 21 guides `complete` under `assessGuideQuality`
