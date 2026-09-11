# Product variant UX audit — Men / Women / Unisex

**Status:** Launch complete (Running Shoes P0 + remaining surfaces)  
**Updated:** 2026-09-04

## Summary

Men / Women / Unisex is a **visible storefront dimension** for Running Shoes — hub, catalog, cards, PDP, finder, search, compare, Best Guides, reviews, and brand hubs.

| Surface | Status |
| --- | --- |
| Running Hub (`/running`) | **Live** — Men’s / Women’s / All shoes strip |
| Running Shoes category | **Live** — Shop by fit chips + Fit/Sizing facet + counts |
| Product cards | **Live** — Men + Women / Women’s sizing labels; weight omitted for women when unverified |
| Product detail | **Live** — Fit/sizing selector in buy rail + summary |
| Finder | **Live** — First question: sizing range; hard eligibility |
| Search | **Live** — Women’s / Men’s chips on shoe intent + empty state; synonyms |
| Compare | **Live** — Fit/sizing context banner on shoe comparisons |
| Best Guides | **Live** — Men + Women availability badges on picks |
| Reviews | **Live** — Fit/sizing disclosure (no fake tested last) |
| Brand hubs | **Live** — Fit chips → `/running/shoes?brand=…&gender=…` when brand has shoes |
| SiteQuality VARIANT auditor | **Live** — `auditVariantUxCoverage` in launch/full audits |
| Offers `variantId` | **Gap** — offers remain product-level; CTA note to confirm Men’s/Women’s on retailer |
| Women’s weight figures | **Honest gap** — not invented; panel says pending verification |
| Dedicated Men’s / Women’s Best Guides (shoes) | **Deferred** — depth does not warrant thin SEO landings; apparel already mixes genderFit in one guide |

## Catalog coverage (Running Shoes)

| Metric | Count |
| --- | ---: |
| Published models | 83 |
| With audience variants | 83+ |
| Men’s available | ~79 |
| Women’s available | ~79 |
| Unisex-only | ~4 (Altra / Topo shared lasts) |
| Dual men+women | ~80 |
| Unknown (no invent-unisex fill) | 0 for running shoes after backfill |

## Data model

- `ProductVariant.audience`: `men` \| `women` \| `unisex`
- Backfill: `src/content/running/audience-variants.ts`
- Product `genderFit` synced to multi-enum `["men","women"]` or `unisex`
- Spec label: **Fit / Sizing** (not Gender)
- URL: existing `?gender=women` (catalog params)

## Honesty rules enforced

1. Do not invent women’s reference weights from men’s US 9 figures.
2. Unisex no longer matches Men/Women filters (exact audience only).
3. Do not invent variant-specific offers without `variantId`.
4. Prefer “Fit / Sizing” language over biological eligibility.
5. Reviews disclose sizing coverage; do not claim a tested last without first-hand evidence.

## Visual QA checklist

- [ ] `/running` — Men’s / Women’s / All visible in ~3s
- [ ] `/running/shoes` — Fit chips above grid
- [ ] `/running/shoes?gender=women` — count + Women’s sizing on cards
- [ ] `/products/brooks-ghost-18` — Fit selector in hero rail
- [ ] `/tools/running-shoe-finder` — sizing question first
- [ ] `/search?q=running+shoes` — Women’s chip present
- [ ] Shoe comparison — Fit/sizing banner
- [ ] `/best/running-shoes` — availability badge on picks
- [ ] Footwear review — Fit/sizing disclosure under summary
- [ ] Brand hub with shoes (e.g. Brooks) — fit chips above picks

## Men’s / Women’s Best Guides decision

**Do not ship** thin `/best/mens-running-shoes` or `/best/womens-running-shoes` landings.

Rationale: dual-audience shoe models share the same recommendation logic; buyers need Fit/Sizing confirmation more than a duplicated shortlist. Apparel Best Guides already mix genderFit SKUs with explicit callouts. Revisit only when there is distinct editorial depth (different picks, different criteria, ≥5 substantiated recommendations).

Prefer: `/running/shoes?gender=women`, Shoe Finder sizing, and availability badges on shared Best Guides.

## Remaining work

- Apparel audience when catalog depth warrants
- Offers `variantId` when retailers expose gendered SKUs
- Verified Women’s reference weights where manufacturers publish them
