# Brand entity strategy (split names)

**Status:** Adopted 2026-09-01  
**Applies to:** ASICS / Adidas / Tecnifibre (and any future multi-vertical brands)

## Decision

**Keep separate brand entities per vertical. Do not merge IDs.**

Use **clear labeling** on vertical entities + **relatedBrandIds** on the primary hub so search and hubs stay consistent without collapsing catalogs.

| Role | Entity ID | Display `name` | Slug | Hub behaviour |
|------|-----------|----------------|------|---------------|
| Primary | `brand-asics` | ASICS | `asics` | Canonical hub; `relatedBrandIds: ["brand-asics-racket"]` |
| Vertical | `brand-asics-racket` | ASICS Court | `asics-racket` | Own slug; products stay racket/court-scoped |
| Primary | `brand-adidas` | Adidas | `adidas` | Canonical hub; `relatedBrandIds: ["brand-adidas-padel"]` |
| Vertical | `brand-adidas-padel` | Adidas Padel | `adidas-padel` | Own slug; padel products only |
| Primary | `brand-tecnifibre` | Tecnifibre | `tecnifibre` | Canonical hub; `relatedBrandIds: ["brand-tecnifibre-padel"]` |
| Vertical | `brand-tecnifibre-padel` | Tecnifibre Padel | `tecnifibre-padel` | Own slug; padel products only |

## Rules

1. **One commercial parent brand → one primary entity** (`brand-{slug}`) used for running/fitness or the brand’s main catalog.
2. **Vertical-only catalogs keep a sibling entity** (`brand-{slug}-{vertical}`) when product graphs, filters, or sport hubs would otherwise mix incompatible categories (e.g. road shoes + padel rackets).
3. **Display names must not collide.** Vertical entities include the vertical in `name` (`Adidas Padel`, `ASICS Court`, `Tecnifibre Padel`) so search cards and facets are unambiguous.
4. **Share logo assets** across primary + vertical siblings (same `logo` / `logoOnDark` paths).
5. **Primary hub absorbs siblings** via `relatedBrandIds` in `src/lib/brand-hub/config.ts` so `/brands/asics` (etc.) can feature court/padel products without merging IDs.
6. **Do not invent a third “umbrella” brand ID.** Prefer primary + labeled siblings.
7. **New splits** follow the same pattern: primary slug stays short; sibling gets `-{vertical}` slug and labeled name; wire `relatedBrandIds` on the primary hub config.

## Why not merge?

Merging would force one hub to mix unrelated category filters (running shoes with padel rackets), break vertical sport hubs that expect padel-specific brand IDs, and make “Adidas” search results ambiguous about which catalog the user meant. Separate IDs + clear labels + hub related-links preserve integrity while still presenting one parent brand story on the primary hub.

## Implementation checklist

- [x] Label vertical display names
- [x] Share logos across siblings
- [x] ASICS / Adidas / Tecnifibre primary hub `relatedBrandIds`
- [ ] Optional later: soft-redirect thin vertical hub pages to primary with a vertical filter (not required for P1)
