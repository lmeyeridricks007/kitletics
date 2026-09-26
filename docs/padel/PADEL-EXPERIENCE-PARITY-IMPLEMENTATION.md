# Padel experience parity — implementation

Running remains the quality floor. This pass implements the gaps in `docs/padel/PADEL-RUNNING-EXPERIENCE-PARITY.md` across the published Padel catalog, not only the Vertex sample.

Counts below are from the generated CSVs in `docs/padel/data/`. Unique images are file identities. A crop of the hero does not count as a second photograph.

## BEFORE → AFTER

| Measure | Before | After |
| --- | --- | --- |
| PDP richness | Vertex showed one photograph, a research score that did not drive the hero badge, and spec keys that did not match stored racket fields | 243 published Padel PDPs have a verdict, strengths, and weaknesses. Racket pages feature shape, balance, weight, thickness, face, core, frame, texture, feel, sweet spot, and player level. Shoes, balls, bags, and grips use their own featured fields |
| Unique PDP media | Vertex: 1 photograph. Guide and review crops were counted as extra images | 11 PDPs have authentic extra frames (232 still have a single hero). Vertex has the front plus five PadelUSA angles. No crops, mirrors, or resized copies were added to inflate counts |
| Review richness | Racket reviews repeated the same generator paragraphs (shape textbook, “not a smash-speed test”, padded buy lines) | All 26 published Padel reviews are expert-research. Buy and skip lines are at least two each. Duplicate section bodies: 0 |
| Unique review media | Vertex review: one photograph reused across sections | 6 reviews attach distinct gallery photographs to sections (Vertex, Hack 04, Vertex 05 Hybrid, AT10 12K, Coello Pro, Technical Viper). The other 20 keep the hero only, because a second authentic frame was not available |
| Guide image uniqueness | `choose-racket.jpg` was the card for seven different guides | 26 buying guides each have their own hero. 39 best-guide cards no longer share a generic racket photo. One pair still shares the Nox AT10 Team hero because that bag is the lead pick on both the bags shortlist and the shoe-compartment shortlist |
| Price / offer visibility | Template could show From price; many products had no offer row | 90 of 243 published Padel PDPs have at least one displayable NL offer, including From price and retailer count. The other 153 have no offer to show. No prices were written into prose |
| Specification completeness | Racket PDP featured keys missed stored fields | 57/57 published rackets have all 11 decision specs. Shoes, balls, bags, grips, and accessories expose the category fields already stored (court outsole, ball speed/pressure, bag capacity/thermo/shoes, grip tack/absorption) |
| Decision-support completeness | Best For / Skip If were padded to three generic lines | Buy and skip copy is the product’s own evidence lines. Sections that would have repeated the same paragraph were shortened instead |

## What changed

**Reviews.** `racketReviewFromDraft` now puts one evidence block in each section (power reasoning in power, control reasoning in control, construction copy in construction). The shared diamond/round sermon, the “published stack” lab paragraph, and the padded third buy line are gone. Shoe, grip, and ball/bag/pressurizer reviews dropped the repeated overview and the bag review no longer pastes the thermal paragraph into the carry section. Scores stay expert-research. Nothing claims a hitting test.

**Photographs.** 41 additional frames were saved from the same authorized PadelUSA listings as the existing heroes (or, for Coello Pro 2026, the matching 2026 listing). Near-duplicate frames were dropped with an 8×8 average hash. Products whose listing 404’d (Indiga, Ionic Light, Metalbone 3.5, ML10, AT10 18K) were left on their hero. 2025 Gravity and 2025 Coello frames were not attached to 2026 products.

Flagship galleries: Bullpadel Hack 04, Vertex 04, Vertex 05 Hybrid; Babolat Technical Viper and Counter Viper; NOX AT10 Genius 12K; adidas Metalbone HRD; HEAD Coello Pro and Coello Motion; Wilson Bela Pro V3. Vertex 05 already had five angles.

**Guides.** Buying-guide heroes stay one file per guide. Best-guide cards that shared a photo across different jobs now use a product that is actually on that page:

- Value rackets → Kuikma PR Hybrid Carbon (comfort stays PR Comfort Soft)
- Best balls → HEAD Pro S+ (competition stays Pro+)
- Training balls → Tecnifibre Team (value stays Kuikma PB Speed)
- Overgrips → Wilson Pro; sweaty hands → Nox Pro; tacky → HEAD Xtreme Soft
- Tournament bags → NOX AT10 XXL; commute bags → Bullpadel Vertex backpack

Comparison cards already render both product heroes through the shared `ComparisonCard`.

**Commerce and specs.** Offer modules, spec groups, and decision blocks are the Running components with Padel category config. Featured keys for rackets, shoes, balls, bags, grips, and accessories match stored fields. Empty offer lists stay empty.

## Quality gates

`src/lib/padel/experience-gates.ts` and `tests/padel-experience-parity.test.ts` check:

- distinct buying-guide heroes, including the five guides outside the knowledge plans
- distinct best-guide heroes, with the AT10 bags / shoe-compartment pair allowed because it is the same lead product
- Vertex review sections do not repeat a paragraph body and do not carry the old generator stamp
- repeated assets inside one page (`excessiveAssetRepeats`)
- gallery registration for Hack, AT10 12K, Coello Pro, and Technical Viper, not only Vertex
- derived hero crops do not count as a second photograph

`scripts/padel-experience-parity-report.ts` writes:

- `docs/padel/data/PADEL-PDP-PARITY.csv`
- `docs/padel/data/PADEL-REVIEW-PARITY.csv`
- `docs/padel/data/PADEL-GUIDE-PARITY.csv`
- `docs/padel/data/PADEL-MEDIA-UNIQUENESS.csv`

Review rows in the media CSV list asset, role, and sections. A section that reuses an asset is flagged.

## Still thinner than Running, on purpose

Novablast has four NL retailers and three manufacturer photographs. Vertex has one NL offer (€319 at the current row) and six frames. Inventing retailers or painting extra angles would make the page look fuller and be false.

232 published Padel products still have one authentic hero. 20 reviews therefore have no extra section photograph. Kuikma flagships are in that group. A single hero is the correct state until a second real frame exists.

## Rendered check

Production build served locally. Desktop and mobile folds are in `docs/padel/screenshots/experience-parity-complete/`.

Vertex 05, Hack 04, Coello Pro, and AT10 Genius 12K each render a research score with power, control, forgiveness, maneuverability, comfort, stability, and spin, a From price, and six distinct product files (hero plus five gallery frames). Novablast 6 still renders 9.0 Excellent, cushion gauges, fit/sizing, and three shoe photographs. Vertex’s review header shows the racket, expert-research disclosure, €319, and the same gauges. The Padel guide index fold shows different cards (Indiga, court shoes, Babolat bag) rather than one repeated racket photo. The index HTML contains 22 distinct image paths.
