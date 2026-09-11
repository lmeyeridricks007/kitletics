# Review page standard (template: Nike Vomero 18)

Canonical live example: `/reviews/nike-vomero-18`.

This is the bar for every Kitletics product review. Cursor rule: `.cursor/rules/review-page-standard.mdc`.

## What “done” looks like

| Area | Standard |
| --- | --- |
| Voice | Expert buying guide — see `voice.md` |
| Buy if / Skip if | Full decision lines (≥2–3), not labels |
| Sections | Product-specific depth (fit → durability, etc.) |
| Images | Unique product-only section shots; no duplicates |
| Links | Brands → `/brands/…`, peers → `/products/…` |
| Buy CTAs | Amazon (when offered) in hero, mid-page, verdict, offers |
| Scores | Product-specific gauge notes |

## Engineering map

| Concern | Code |
| --- | --- |
| Page assemble | `enrichReviewForPage` → substance + longform + visuals |
| Audience upgrade | `audience-signals.ts` |
| Voice / longform | `review-voice.ts`, `review-longform.ts`, `enrich-review-content.ts` |
| Images | `resolve-section-visuals.ts` + `public/images/.../sections/` |
| Linkify | `catalog-mentions.ts` + `LinkifiedText` |
| Amazon CTAs | `amazon-offer.ts` + `ReviewAmazonCta` on `ReviewDetailPage` |
| Agent synthesis | `src/domain/review-agent/synthesize.ts` |

## CLI

```bash
npm run reviews:rewrite-voice
npm run reviews:article-audit -- --limit=50
npm run reviews:agent -- --mode=refresh --category=running-shoes
```

## Media workflow

**Required before calling a review done:** when a product has a hero but no section variants (or some topics missing), generate unique images **from that hero** into:

`public/images/<sport>/products/<product-slug>/sections/<topic>.png`

- Shoes/gear: `running` · Watches/HRMs: `watches` · Racket: `padel` · Fitness: `home`
- Watch topics: `overview`, `specs`, `tech`, `performance`, `strengths`, `tradeoffs`, `usecase`, `value`, `fit`
- One file per section · product-only · no hero reuse · see `.cursor/rules/review-section-images.mdc`
