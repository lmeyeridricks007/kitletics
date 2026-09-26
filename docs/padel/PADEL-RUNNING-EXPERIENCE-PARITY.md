# Padel vs running experience parity

Compared on 23 September 2026 against a local production server (`next start`, build `fXSvoQ0`, 22 September 2026), desktop 1440×900 and mobile 390×844.

Screenshots: `docs/padel/screenshots/experience-parity/`.

| Role | URL |
|---|---|
| Running PDP | `/products/asics-novablast-6` |
| Padel PDP | `/products/bullpadel-vertex-05-2026` |
| Running review | `/reviews/asics-novablast-6` |
| Padel review | `/reviews/bullpadel-vertex-05-2026` |
| Running guide | `/guides/how-to-choose-running-shoes` |
| Padel guide | `/guides/how-to-choose-a-padel-racket` |
| Guide indexes | `/guides?sport=padel` and `/guides?sport=running` |

Running is the floor. Padel is not supposed to grow a drop, a stack height, or a rocker. It is supposed to feel as specific, visual, and commercially useful, in padel language.

## Why Novablast feels better than Vertex

The product page chrome is the same component. The feeling is not.

Above the fold, Novablast shows a score (9.0, Excellent) with five ride gauges, a From price of €149, and four retailers. The gallery is three different ASICS photographs: lateral hero, side, and outsole. Tags include the job (daily trainer, neutral, max cushion, road) and an 8 mm drop.

Vertex showed a correct front photograph, Diamond / Professional / High, and From €319 with one retailer. No score sat next to the title. The draft already had power, control, forgiveness, maneuverability, comfort, stability, and spin, with reasoning. `toProductPatch` in `src/content/padel/rackets/build.ts` sets `recommendationScore` to `undefined`, and the hero only rendered a score when that field existed. The gauges were buried under “How it decides.”

Spec data was also ahead of the chips. The Vertex draft stores frame, face texture, feel, sweet spot, and player level. The featured strip asked for shape, weight, balance, core, face, and thickness. Hero tags asked for `weight` and `level`, which are not the stored keys (`weightMin`, `playerLevel`), so the weight never became a tag.

Word count went the other way: Vertex PDP text was longer (about 2,370 words vs 1,930). That did not make it feel richer. Novablast feels richer because the first screen answers “what does it feel like, what are the numbers, what does it cost, where else can I look.”

## Why the Novablast review feels better

The Vertex review is longer (about 5,100 words vs 1,800) and listed 23 image files. Those files have 23 different hashes. They are crops of the one front photograph. The resolver preferred `sections/*.png` over any second photograph, so the article looked illustrated while showing one picture.

Novablast section images show different parts of the shoe: upper, midsole with FF Turbo² readable, outsole. The review also prints four priced offers. Vertex printed one.

The review body is `racketReviewFromDraft`. It is expert research and it says so. It is also a blueprint: the same geometry sentence and the same “not a lab smash test” caveat recur across power, control, defence, net, and attack. That is a generator problem. Filling it with more generic sentences would make it worse. The visual and score fixes in this pass do not invent a hitting test.

One template line was simply the wrong sport. “How we wrote this review” told a racket reader to start with stack and drop. That sentence now uses shape, balance, weight, face, core, and level, and it still says this is not a hitting test.

## Why padel guides repeated one racket

`PADEL_GUIDE_HEROES` pointed seven different guides at `/images/padel/guides/choose-racket.jpg`:

- How to Choose a Padel Racket
- Shapes
- Round vs teardrop vs diamond
- Balance
- Weight
- Beginner gear
- Gear checklist

Three shoe guides shared `choose-shoes.jpg`. Three grip guides shared `grips.jpg`.

On `/guides?sport=padel` that file occupied 10 card slots. The photo is an unbranded court racket. It is fine once, as sport context for the main choosing guide. It is not a shape diagram, a balance diagram, a beginner kit, or a checklist.

Desktop made it worse. Explainer guides drew the hero as an `aria-hidden` wash under a white gradient and hid the real figure above the `xl` breakpoint. The running “How to Choose Running Shoes” page uses the framework layout, which shows the hero. Padel buying guides use the explainer layout.

Running is not perfect here either. Several fuel guides share the Maurten gel. That is the same class of bug, smaller, because most running topics already point at a different product.

## Cause of each gap

| Difference | Cause |
|---|---|
| One Vertex photograph | `MISSING_MEDIA` |
| Section crops counted as a gallery | `MISSING_MEDIA` plus the resolver treating any new file hash as a new photo |
| No hero score on the PDP | `COMPONENT_NOT_RENDERING_DATA` — attributes and the review score existed |
| Weight / level missing from tags | `COMPONENT_NOT_RENDERING_DATA` — wrong spec keys |
| Frame, texture, feel, sweet spot not in the featured strip | `COMPONENT_NOT_RENDERING_DATA` — values exist on the draft |
| One retailer vs four | `MISSING_COMMERCE` — the From price and the buy button already render |
| Repeated guide cards | `MISSING_MEDIA` — one map entry reused |
| Hidden explainer hero on desktop | `PADEL_TEMPLATE_LIMITATION` |
| Stack-and-drop sentence on a racket | `PADEL_TEMPLATE_LIMITATION` |
| Long, repeated review sections | `GENERIC_CONTENT_GENERATOR` |
| No hands-on test | Honest. Do not invent one |

Full rows: `docs/padel/data/PADEL-PARITY-GAP-MATRIX.csv`.

## What changed in the shared foundation

These are vertical rules, not a Vertex special case in the page component.

1. **Hero score.** If a product has no catalog `recommendationScore` but it has a published review score, the PDP hero shows that score and the decision gauges. Padel copy under the gauges says it is a research score, not a hitting test.
2. **Racket spec chips.** Featured keys and hero tags use the keys the drafts actually store. Empty values still render nothing.
3. **Photographs vs crops.** `isDerivedHeroCrop` marks `/products/<slug>/sections/` as the hero. Padel reviews attach gallery photographs by role (profile, three-quarter, head, face texture, throat) and do not fill every section with a crop.
4. **Gallery path.** Secondary shots go in `PRODUCT_GALLERY_MEDIA`. The product repository already merges that store for every category. Vertex is the first padel racket with five extra angles because PadelUSA, the same authorized retailer as the existing hero, already published them. Other rackets stay on one photo until the same kind of source exists. Do not generate more crops to fake the count.
5. **Guide identity.** Each padel knowledge guide has one hero, stored as an explicit asset path (the catalog is not queried while those plans load). The stock court photo stays on How to Choose a Padel Racket only. Shoe and grip explainers each use one editorial photo. The rest use a catalog product that matches the decision (hybrid for shapes, lighter frame for weight, round ML10 for sweet spot, and so on).
6. **Explainer hero.** The figure is visible on desktop, with alt text, instead of a hidden wash.

## Experience contracts

A page meets the contract only when the rendered screen does. A present heading, a hero file, or a high word count does not.

Media roles, for every contract:

`PRODUCT_HERO`, `PRODUCT_ANGLE`, `PRODUCT_DETAIL`, `PRODUCT_TECHNOLOGY`, `PRODUCT_IN_USE`, `PRODUCT_PACKAGING`, `PRODUCT_VARIANT`, `EDITORIAL_EXPLANATION`, `SPORT_CONTEXT`.

`DERIVED_HERO_CROP` is a file that shows the same photograph. It counts once, as the hero.

Unique images are counted by asset path after unwrapping `next/image`, then by collapsing derived crops into the hero. Repeated `<img>` tags do not add credit.

### PADEL_RACKET_PDP

Where evidence exists, the page shows:

- More than one authentic photograph, with different roles
- From price, currency, availability, and each real retailer
- Brand, model, generation
- Shape, balance, weight, thickness, face, frame, core, texture, sweet spot, feel
- Power, control, maneuverability, forgiveness, comfort, spin, with the reason and the evidence kind
- Player level and playing style
- Best for, not ideal for, a decision summary, strengths, trade-offs
- The review, alternatives, comparisons, related guides
- Buy CTA

If a number was not published, the row is absent. No estimated balance, no invented sweet-spot size.

### PADEL_SHOE_PDP

Court semantics, not running geometry:

- Surface, outsole pattern, lateral stability, court feel, lockdown, durability
- Fit and width when known
- Price and retailers
- Distinct shoe photographs (lateral, outsole, upper)
- Best for / not ideal for against padel movement, not against a daily trainer

Do not show drop, stack, or plate unless the source is actually a running shoe being compared, and then only inside that comparison.

### PADEL_BALL_PDP

- Can or ball photograph, not a racket
- Speed, pressure, felt, pack size, approved-play claims that the source states
- How fast pressure dies, as a claim with a source
- Price, usually a small basket, still from offer data

### PADEL_BAG_PDP

- The bag itself
- Racket count, thermo, shoe pocket, carry style, volume
- Price

### PADEL_GRIP_PDP

- The grip or overgrip, not a racket hero
- Tack, absorption, thickness, pack count
- Replacement job (base grip vs overgrip)

### PADEL_ACCESSORY_PDP

- The object (protector, pressurizer, custom weight)
- What it attaches to
- Price
- No borrowed racket lifestyle shot

### PADEL_REVIEW

A decision document in padel language:

- Hero plus other photographs where they exist
- Research disclosure once, in the testing note
- Score breakdown on power, control, forgiveness, maneuverability, comfort, spin, stability
- Construction, shape and balance, sweet spot, who it is for, who should skip
- Peers and comparisons that exist in the catalog
- Price from offers, not typed into the prose
- No claim of on-court testing unless a personal-test evidence record exists

Derived crops do not satisfy “imagery throughout.”

### PADEL_BUYING_GUIDE

- Its own hero, visible on desktop
- Sections that teach one decision (level, shape, balance, weight, face, core)
- Diagrams the explainer system already has, plus real product examples
- Prices only from offer data on those examples
- Links to the finder, a best guide, and the next explainer

### PADEL_SETUP_GUIDE

- A kit visual: racket, shoes, balls, bag, overgrip as separate products
- Required vs optional
- No single stock racket standing in for the whole bag

### PADEL_BEST_GUIDE

- One product photograph per pick, the actual SKU
- Role, why it fits, who should skip, and the trade-off
- No “tennis racquet borrowed onto padel” filler
- Prices from offers

### PADEL_COMPARISON

- Both products, both photographs
- The decision that separates them (shape, balance, face, level)
- A table of published specs only
- Prices from offers
- No winner invented for a job neither product owns

## Still open

- Most published padel products still have one photograph. The gallery registry is the path. Do not paint crops.
- NL retailer coverage is still one listing on Vertex. That is research, not a template hole.
- `racketReviewFromDraft` still repeats itself. The next editorial pass should shorten repeated sections and keep only the lines that change the buy. It should not add fake testing.
- Guide diagrams for shape, balance, and sweet spot already exist inside articles. They are not a substitute for a unique card image, which this pass assigns. They are also not manufacturer technical drawings.

## Rendered baseline (before this pass)

Desktop, local production:

| Page | Words | Image elements | Unique asset paths | Prices visible |
|---|---:|---:|---:|---|
| Novablast PDP | 1929 | 18 | 11 | From €149, 4 offers |
| Vertex PDP | 2367 | 15 | 8 | From €319, 1 offer |
| Novablast review | 1784 | 18 | 11 | €149–€160 across 4 retailers |
| Vertex review | 5141 | 30 | 23 paths, 1 photograph | €319, 1 retailer |
| Choose running shoes | 1682 | 20 | 14 | Example From prices |
| Choose a padel racket | 2454 | 23 | 6 | Example From prices |
| Padel guide index | 1436 | 32 | 13, with one file on 10 cards | — |
| Running guide index | 2445 | 73 | 35 | — |

Unique asset paths over-counted Vertex. The 23 review paths are crops.

## Rendered after this pass

Desktop, local dev server (same pages). Word count is not the parity measure.

| Page | What the screen now shows |
|---|---|
| Vertex PDP | Score 7.5 Solid, diamond / professional / 365g / high tags, six gallery frames (front plus five PadelUSA angles), From €319, one retailer, featured specs for shape, balance, weight, thickness, face, core, frame, texture, feel, sweet spot, player level |
| Vertex review | Expert-research label, €319, score gauges, and five large photographs that are not the hero (throat, profile, three-quarter, head, face texture). Section crops of the hero are gone |
| Choose a padel racket | The court photograph is visible on desktop, 988px wide, not washed out |
| Padel guide index | 22 unique assets. `choose-racket.jpg` appears only on How to Choose a Padel Racket (repeated because that guide is in several rails). Beginner, shoes, checklist, shapes, balance, weight, materials, cores, sweet spot, outsoles, grips, and the rest each use a different file |
| Novablast PDP | Still shows the side and outsole gallery shots and VIEW PRICES (4). Running section crops were not removed |
