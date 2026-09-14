# Padel catalog plan

**Depends on:** [PADEL-BASELINE-AUDIT.md](./PADEL-BASELINE-AUDIT.md), [PADEL-ARCHITECTURE.md](./PADEL-ARCHITECTURE.md)

**Rule (from Running):** do not onboard 3–4 example products per category. Build a commercially meaningful **current** European catalog, NL-available first.

Do not onboard a brand or SKU only because it appears in a prompt. Research manufacturer ranges + NL/EU specialist retail, then stage via `product:onboard`. UNKNOWN lifecycle is valid; discontinued models stay off Best Guides unless explicitly a value/previous-gen pick.

---

## 1. Completeness bar

| Category | Launch-core min (published, authentic hero, required specs, ≥1 real NL or DE URL **or** honest “no verified local price”) | Supporting |
| --- | ---: | --- |
| Rackets | 60+ current models across ≥10 brands, with families not flagships-only | Previous gen only as labeled value |
| Shoes | 40+ **padel-evidenced** models (not tennis dual-tags) | Crossover tennis/padel only with manufacturer or specialist evidence |
| Balls | 8–12 current competition/training cans | |
| Bags | 12–20 current thermo/backpack/duffel | |
| Grips | 8–15 overgrip/replacement lines | |
| Accessories | 8+ only if distinct types exist | else keep soft-gated |
| Clothing | 15+ model-level (not every SKU) or stay gated | |

These are **credibility floors**, analogous to `runningLaunchManifest`, not SEO targets. If a category cannot meet the floor honestly, it stays gated.

Lifecycle on every Product: `current` | `previous-generation` | `discontinued` | `upcoming`. Track UNKNOWN as `lifecycleStatus` + notes in onboarding, not a fake `current`.

---

## 2. Market picture (research, 2026, EU/NL)

Specialist and manufacturer coverage consistently treats these as **commercially meaningful racket houses** in Europe:

| Priority | Brands | Why |
| --- | --- | --- |
| P0 core | Bullpadel, Nox, Adidas, Head, Babolat | Tour presence + NL/EU retail depth |
| P0 core | Wilson, Siux, StarVie | Wide specialist stocking |
| P1 | Varlion, Tecnifibre, Oxdog, Kuikma | Distinct jobs (control/attack/value) |
| P1 | Drop Shot, Royal Padel, Black Crown | Present in EU shops; onboard **ranges**, not one SKU |
| P2 | Lok, RS, Vibor-A, Enebe, Dunlop padel, etc. | Only if NL/DE listings are current and identifiable |

**Not automatic padel racket brands:** Prince, Mizuno, Nike — tennis-first in current Kitletics data. Investigate; do not infer.

**Shoes (padel-specific or evidenced court):** ASICS, Adidas, Joma, Bullpadel, Nox, Babolat, Head, Wilson, Kuikma. Nike/K-Swiss/Yonex/Mizuno only as **crossover** with evidence — never because `sportIds` already includes padel.

**NL availability channels to prefer for Offer research (not an affiliate list):**

- Decathlon NL (Kuikma + selected brands)
- Amazon NL (product URLs only)
- Specialists: Justpadel, Padel2Gether, Holland Padel, PadelNU, Padeldirect, and other gids-listed shops

Offers stay homepage-free. Add Retailer rows when programs/URLs are verified.

---

## 3. Rackets — research current ranges (do not freeze this table as inventory)

For each P0/P1 brand, onboarding should **discover the current collection** (2026/26v lines), then keep previous gen only when still sold.

Illustrative **families to investigate** (verify on manufacturer sites; names shift mid-season):

| Brand | Families / lines to research | Notes |
| --- | --- | --- |
| Bullpadel | Vertex (incl. HYB), Hack, Neuron, Xplo, Ionic, Indiga, Elite | Vertex 04 / Hack 03 already previous-gen in catalog |
| Nox | AT10 Genius (12K / 18K / Attack), ML10, X-One / X-Hero, EA/Ventus if current | Catalog has AT10 12K/18K + ML10; beginner line thin |
| Adidas | Metalbone (incl. HRD / 3.4–3.5), Adipower, Cross It, RX, Arrow | Catalog has Metalbone only |
| Head | Coello, Extreme, Gravity, Speed, Radical | Catalog: Coello, Extreme Pro/Motion |
| Babolat | Technical Viper, Counter Viper, Air Viper, Veron, Air Veron | Catalog: two Vipers |
| Wilson | Bela, Blade | Catalog: Bela Pro, Blade Pro |
| Siux | Diablo, Electra, others current | Identity: racket vs shoe Diablo |
| StarVie | Titania, Basalto, Astrum / current 2026 | Two SKUs |
| Tecnifibre | Wall Breaker, TF40 / current | One SKU |
| Oxdog | Sense, Ultimate, Hyper | One Sense Pro |
| Kuikma | PR Soft / PR 530 / Ultra Team | Value line — important for NL beginners |
| Varlion | LW, Bourne, Cañon | One LW |
| Drop Shot, Royal Padel, Black Crown, Lok | Current control/attack pairs | Currently one SKU each |

**Do not** put Vertex 04 or Hack 03 in Best Padel Rackets as current awards. They may appear in comparisons as previous-generation.

Women’s / lighter frames: research Elite W, Gravity Motion, dedicated women’s lines — onboard when they are distinct products, not assumed unisex.

---

## 4. Shoes

Rebuild around **padel evidence**, not tennis dual-tags.

**Investigate (current generation):**

- ASICS Gel-Resolution (padel last / X padel), Gel-Dedicate padel, Game FF padel, Solution Swift padel — men and women when verified
- Adidas Barricade Padel, Courtquick / Crazyquick / GameCourt padel, current Boost court — **CourtStabil naming is already flagged as retired in review backfill**; verify live SKU names
- Joma T.Slam / Slam / Spin / Open
- Bullpadel Hack / Hybrid / Ionic / Vibram 26V Premier if current
- Nox AT10 / ML10 shoe lines
- Babolat Jet Premura / Movea / Sensa
- Head Sprint / Revolt padel
- Wilson Rush Pro padel / Bela shoe if distinct
- Kuikma PS 990 / 560

**Draft holds to resolve, not publish:** Siux Diablo Pro shoe (racket-line identity), other wave28 drafts without authentic photos.

**Crossover rule:** a tennis shoe may be listed as padel-compatible only with manufacturer padel SKU, padel outsole claim, or specialist padel listing that is the same identity. Dual `sportIds` without that evidence should be **removed** from padel filters.

---

## 5. Balls, bags, grips, accessories, clothing

**Balls:** Head Padel Pro S is a start. Research Head Pro / Pro S, Wilson, Bullpadel, Adidas Aditour, Dunlop, Dunlop/Head tournament cans, Kuikma PB Club / Speed / Pro. Track pressurization, pack size, competition vs training.

**Bags:** Nox Thermo Bag 10 is draft. Research 6–12 racket thermos from Nox, Bullpadel, Nox/Adidas/Babolat/Head, backpack vs paletero. Require dimensions/capacity when claimed.

**Grips:** Wilson overgrip pack is not a catalog. Overgrips: Wilson, Head, Bullpadel, Nox, Babolat, Justpadel house, Hesacore-type (comfort — no medical claims). Replacement grips distinct from overgrips.

**Accessories:** onboard only typed SKUs (frame protectors, wristbands, pressurizers). If fewer than the floor, keep category gated.

**Clothing:** model-level shorts/skirts/tees from Bullpadel, Nox, Adidas padel, Bidi Badu, Hydrogen, etc. only if we can do it at Running clothing honesty. Otherwise gated.

---

## 6. Source / evidence workflow

For each SKU:

1. `product:discover` / brand collection pages (manufacturer)
2. `product:onboard` research config (required specs)
3. Stage findings with `sourceUrl` + `retrievedAt` + confidence
4. Identity resolution (exact / probable / new) — prevent Diablo racket/shoe collisions
5. Media: licensed hero or stay draft (`applyMediaPublishGate`)
6. Offers: real product URLs, `lastChecked`, validation
7. Human review (`needs-review`) before `published`

Manufacturer pages win for shape, weight range, balance, materials. Retailers may confirm availability/price. Independent reviews may inform Recommendation factors, not invented spec numbers.

---

## 7. Brand hub and families

- Complete `ProductFamily.productIds` newest → oldest for every multi-gen line
- Brand hub products filtered to padel when the Brand is shared
- Featured hub brands should expand beyond the original eight once SKUs are authentic — not before

---

## 8. What not to do

- Do not copy tennis catalog into padel to hit counts
- Do not cycle five SVG rackets across 20 models
- Do not mark lifecycle `current` from editorial `updatedAt`
- Do not create protector/pressurizer categories for SEO
- Do not fabricate weight midpoints, carbon quality ladders, or sweet-spot sizes from marketing diagrams alone
