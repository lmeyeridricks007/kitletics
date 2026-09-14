# Padel UX audit

**As of:** 2026-09-13  
**Scope:** Public `/padel` experience, Racket Sports menu SOON policy, contextual nav, readiness gates for removing Padel SOON.  
**Benchmark:** `/running` sport-hub quality (editorial-commerce, not marketplace grid).

---

## Verdict

**Padel SOON is removed.** Tennis, Pickleball, Badminton, and Squash stay **SOON**. Umbrella `/racket` architecture is unchanged.

Vertical mode is **`selective`** (not full `enabled` like running). Deep entities may publish/index only when quality eligibility passes. Soft goods (accessories / clothing) remain thin and soft-gated.

`/padel` now assembles a premium hub: hero, shop groups, Choose by player/style/shape, Best + more-Best strips, Finder, guides, comparisons, latest reviews, starter kit, brands, database / research footer links.

---

## Readiness gates (SOON removal)

| Gate | Status | Evidence |
| --- | --- | --- |
| Catalog floor (rackets + shoes) | Pass | Hub shop: 58 rackets, 28 shoes; balls/bags/grips supporting |
| Best Guides (padel) | Pass | **18** promote-able Best Guides |
| Buying Guides / knowledge | Pass | **21** promote-able guides |
| Comparisons | Pass | **12** promote-able comps |
| Reviews (expert-research estate) | Pass | **17** promote-able reviews |
| Flagship Finder | Pass | `/tools/padel-racket-finder` promote-able |
| Racket database | Pass | `/padel/rackets/database` live |
| Research pages | Partial | Shapes / weight / market publish; **prices withheld** (&lt;25 priced) |
| Regional commerce honesty | Pass | Canonical engine; NL From-price present; empty regions stay empty |
| Soft goods | Soft-gated | Accessories/clothing not oversold on hub |
| Visual authenticity | Pass | Hero `/images/padel/hero.jpg` = padel court + racket + balls (not tennis/running) |
| Other racket sports | Held | Still `disabled` + menu **Soon** |

**Decision rule applied:** remove Padel SOON only when the vertical can deliver a running-equivalent decision surface without inventing stock or leaking held sports. That bar is met for Padel; it is **not** met for Tennis / Pickleball / Badminton / Squash.

---

## Navigation

### Primary menu (Racket Sports)

| Item | Badge | Href |
| --- | --- | --- |
| Padel | *(none — live)* | `/padel` |
| Tennis | Soon | `/tennis` |
| Pickleball | Soon | `/pickleball` |
| Badminton | Soon | `/badminton` |
| Squash | Soon | `/squash` |
| Padel guides | *(none)* | `/guides?sport=padel` |
| Tennis guides | Soon | `/guides?sport=tennis` |

Source: `src/lib/navigation/primary-menu-panels.ts`.

### Contextual rail (Padel-local)

On `/padel*`, `/tools/padel-racket-finder`, and sport-scoped hubs (`?sport=padel`, compare `padel-rackets`):

**Padel · Rackets · Shoes · Database · Best · Reviews · Compare · Finder · Guides**

- `secondaryContextKey = "padel"`
- `primaryNavKey = "racket"` (keeps Racket Sports primary highlight)
- Umbrella `/racket`, `/tennis`, etc. still use `RACKET_CONTEXTUAL_NAV`

Source: `PADEL_CONTEXTUAL_NAV` in `src/lib/navigation/contextual-nav.ts`.

---

## `/padel` hub composition

| Brief section | Hub mapping |
| --- | --- |
| Hero | `SportHubHero` — PADEL GEAR + padel court hero |
| Shop Padel Gear | `SportCategoryNav` groups: Rackets / Court kit / Decide |
| Find Your Racket | Quick action + featured Finder strip (`padel-racket-finder`) |
| Popular / Best Padel Rackets | Primary Best strip (`padel-rackets`) + more-Best (beginner, control, power, shoes, all-round) |
| Choose by Player | `PadelChooseLinks` → beginner / intermediate / advanced Best |
| Choose by Play Style | Control / all-round / power / comfort Best |
| Racket Shapes | Links to shape guides (correct slug: `round-vs-teardrop-vs-diamond-padel-rackets`) |
| Latest Reviews | `SportLatestReviews` — 4 newest promote-able reviews |
| Comparisons | Featured comparisons column (4) |
| Padel Shoes | Shop + Best Padel Shoes strip |
| Balls / Bags / Accessories | Court kit group (honest thin counts) |
| Learn Padel Gear | Guides column (3 featured) |
| Padel Racket Database | Quick action + shop + footer |
| Research / Statistics | Footer: shapes, weight research |
| Brands | Eight padel brand marks |

Config: `padelSportHubConfig` in `src/lib/sport-hub/config.ts`.  
Assembly: `getSportHubData`.  
Page: `SportHubPage` (+ `PadelChooseLinks`, `SportLatestReviews`).

### Hub snapshot (NL, 2026-09-13)

| Surface | Count |
| --- | ---: |
| Best products | 5 |
| More-Best strips | 5 |
| Guides featured | 3 |
| Comparisons | 4 |
| Latest reviews | 4 |
| Brands | 8 |
| Quick actions | 4 |

---

## Visual design

Aligned with Kitletics system:

- Dark global header (unchanged)
- Lime / electric green accent on CTAs and eyebrows
- White editorial content plane
- Display typography on section titles
- Large authentic padel hero; product photography on strips
- Thin borders, restrained cards, minimal shadow

Avoided: generic blog blocks, dense marketplace grids, database-admin chrome on the hub (database lives on its own route).

---

## Imagery policy

| Surface | Asset policy |
| --- | --- |
| Hub hero | Real padel court + padel racket + yellow padel balls |
| Guide cards | `/images/padel/guides/*` |
| Product strips / reviews | Catalog product heroes under `/images/padel/products/` |
| Forbidden substitutes | Tennis, pickleball, running, generic gym stock in padel context |

---

## Vertical strategy

```ts
// src/content/launch/vertical-strategy.ts — asOf 2026-09-13
padel: mode "selective"
indexableKinds: sport | product | review | best-guide | buying-guide |
  comparison | tool | setup | alternatives
```

- Sport hub is public; each deep URL still faces quality / eligibility.
- Tennis / pickleball / badminton / squash / umbrella racket remain **disabled**.
- Soft goods stay thin; do not invent accessories density for hub theatre.

---

## Responsive

Hub reuses running sport-hub layout primitives:

| Breakpoint | Behaviour |
| --- | --- |
| Desktop | Full shop groups, 4-up reviews, Best + Finder side-by-side |
| Tablet | Groups collapse gracefully; Choose lanes stack in 3→1 columns |
| Mobile | Hero + quick actions stack; Choose chips wrap; strips scroll naturally |

Components: `SportHubHero`, `PadelChooseLinks`, `SportCategoryNav`, `SportHubBestStrip`, `SportLatestReviews` — all use `Container` / responsive grids already proven on `/running`.

Automated: `tests/padel-hub.test.ts` (hub assembly + contextual nav). Manual viewport smoke recommended at ship.

---

## Tests

- `tests/padel-hub.test.ts` — live hub contents, finder/database CTAs, padel contextual rail, tennis stays racket umbrella
- `tests/contextual-nav.test.ts` — existing running/shoes cases unchanged

---

## Gaps / follow-ups (non-blocking)

1. **Prices research** still withheld — keep footer honest (shapes/weight only until priced floor ≥25).
2. **Accessories / clothing** soft-gated — do not promote empty “Shop all accessories” as primary.
3. **Architecture doc** still mentions pre-enablement hold language in places; treat this audit as the enablement record.
4. Full `enabled` (parity with running index defaults) only after soft goods + commerce coverage expand.
5. Optional: dedicated research strip above footer (today: footer tools column).

---

## Definition of done checklist

- [x] Remove SOON from Padel only after readiness gates
- [x] Keep other racket sports SOON + future architecture
- [x] `/padel` premium hub ≈ `/running` composition
- [x] Contextual nav: Padel / Rackets / Shoes / Best / Reviews / Compare / Finder / Guides / Database
- [x] Authentic padel imagery on hub
- [x] Responsive via shared sport-hub system
- [x] This audit: `docs/padel/PADEL-UX-AUDIT.md`
