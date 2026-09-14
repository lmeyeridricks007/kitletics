# Padel racket catalog audit

**Date:** 2026-09-13  
**Inventory source:** live `padelRacketDrafts` + `products` (`data/staging/padel-racket-catalog-audit.json`)  
**Padel vertical launch:** still disabled. This audit is catalog completeness, not a go-live.

This is a commercially structured 2026 racket catalog, not a sample set. It is **not** a 60-SKU published launch-core yet. Missing authentic packshots and unverified specs are listed as BLOCKED or UNKNOWN. They are not treated as complete.

---

## Headline

| Count | What it is |
| ---: | --- |
| 16 | Brands in this catalog (Dunlop omitted) |
| 36 | Product families |
| 62 | Products (no extra live padel rackets outside the drafts) |
| 0 | ProductVariants (weight/colour/year-only SKUs were not duplicated) |
| 57 | `lifecycleStatus: current` |
| 5 | `previous-generation` (Vertex 04, Hack 03, Metalbone 3.3, Titania Kepler, Basalto Osiris) |
| 58 | Published with a visually reviewed authentic hero file |
| 4 | Draft because no authentic unique packshot is registered |
| 62 | PDP copy + decision attributes + manufacturer + editorial evidence rows |
| 0 | `FIRST_HAND_TEST` ratings |

Launch-core floor from `PADEL-CATALOG-PLAN.md` is **60+ current models across ≥10 brands, published, authentic hero, required specs**. This catalog has the brand/family **shape** of that floor. It does **not** yet have 60 published current SKUs with authentic unique heroes.

Approximate launch-core **READY** (current + published + authentic unique packshot + `shape` + `balance` + `weightMin` + copy): **~52**. Four SKUs stay BLOCKED on imagery. Several published SKUs still have UNKNOWN grams/balance.

---

## Status vocabulary

| Status | Meaning |
| --- | --- |
| **READY** | Authentic unique packshot of that model (visual review), consumer copy, evidence rows, and required specs (`shape`, `balance`, `weightMin`) present. Not a claim that every optional spec is filled. |
| **BLOCKED** | Catalog row exists, but we will not publish a hero. Typical cause: manufacturer 403/429, listing-page og:image (logo/lifestyle/collage), or a packshot of a **different** SKU. |
| **UNKNOWN** | Something material is unverified: generation, exact grams, source is a homepage/range article, or the face print does not unambiguously match the Kitletics product name. |

Decision scores are `MANUFACTURER_CLAIM`, `SPEC_INFERENCE`, or `EXPERT_RESEARCH`. None are laboratory measurements. None are first-hand tests.

---

## 1. Research coverage

### Requested manufacturers

| Brand | In catalog | Notes |
| --- | --- | --- |
| Bullpadel | Yes — 15 SKUs | Vertex / Hack / Neuron / XPLO / Ionic / Indiga; 04/03 kept as previous-gen |
| Nox | Yes — 6 SKUs | Genius 18K, Genius 12K, Attack 18K, Attack 12K, Equation Soft, ML10 Pro Cup |
| Adidas | Yes — 10 SKUs | Metalbone 3.5 / HRD / CTRL / Team Light + Cross It / Arrow Hit / Match Light; 3.3 previous-gen |
| Head | Yes — 9 SKUs | Coello Pro/Motion/Team, Extreme Pro/Motion, Gravity Pro/Motion, Speed Pro, One Ultralight |
| Babolat | Yes — 4 SKUs | Technical Viper, Counter Viper, Air Viper, Air Veron |
| Wilson | Yes — 2 SKUs | Bela Pro, Blade Pro (padel family IDs, not tennis Blade) |
| Siux | Yes — 3 SKUs | Diablo Pro, Electra, Fenix. `prod-siux-diablo` is the racket; Diablo Pro **shoe** is a different ID |
| StarVie | Yes — 3 SKUs | Astrum+ current; Titania Kepler and Basalto Osiris previous-gen |
| Drop Shot | Yes — 1 SKU | Canyon Pro (image still BLOCKED — Attack/Comfort siblings are other SKUs) |
| Varlion | Yes — 1 SKU | LW Carbon Difusor |
| Kuikma | Yes — 3 SKUs | PR Comfort Soft and PR Hybrid Carbon READY; PR Soft 500 still BLOCKED |
| Tecnifibre | Yes — 1 SKU | Wall Breaker 365 |
| Dunlop | **Omitted** | No current EU padel racket with a manufacturer product URL we could verify. Tennis CX is not a padel stand-in. |

### Other meaningful brands discovered

Oxdog (Sense Pro), Royal Padel (M27), Black Crown (Special One Soft), Lok (Maxx Flow).

RS, Vibor-A, Enebe were not onboarded: no verified current NL/DE identifiable range in this pass.

---

## 2. ProductFamily / Product / ProductVariant

Families keep Control / Power / Comfort / Light / Pro / Team / Hybrid / Attack as **separate Products** when the manufacturer sells them as separate models.

Examples that are **not** collapsed:

- Nox Genius drop/tear vs Attack diamond; 12K vs 18K
- Bullpadel Vertex 05 vs Hybrid vs W vs Advance; Hack 04 vs Hybrid vs Comfort
- Adidas Metalbone vs HRD vs CTRL vs Team Light
- Head Coello Pro vs Motion vs Team

What was **not** duplicated:

- Colourways
- Gram windows inside one named model
- Year-only restamps with no mould/face/core change

**Variants:** 0. No weight/colour variant rows were authored. If a manufacturer later publishes a distinct Light vs Pro SKU we do not already have, that is a new Product, not a variant.

Identity traps already corrected in this catalog:

| Trap | Resolution |
| --- | --- |
| Nox AT10 Genius 18K | Teardrop/drop, not diamond. Diamond is Attack. |
| Head Coello Pro | Diamond ~370 g attack mould, not a beginner teardrop |
| Adidas Metalbone 3.3 | Previous-generation; current flagship is Metalbone 2026 / 3.5 |
| `fam-head-speed-padel` / `fam-wilson-blade-padel` | Separate from tennis Speed/Blade families |

---

## 3. Spec completeness

Optional specs were **not invented**. Coverage on all 62 live rackets:

| Spec | Filled | Notes |
| --- | ---: | --- |
| `playerLevel` | 62/62 | Manufacturer positioning language |
| `shape` | 57/62 (92%) | P1 if below 90% in `padel:catalog-qa` — currently above |
| `core` / `face` | 59/62 | |
| `balance` | 53/62 (85%) | P1 — several HEAD/Adidas/Siux siblings still UNKNOWN |
| `weightMin` | 50/62 (81%) | P1 — do not infer grams from a sibling SKU |
| `feel` | 16/62 | Mostly UNKNOWN; not guessed from foam marketing names |
| `frameMaterial` | sparse | Only where the manufacturer names the frame |

`powerPositioning` / `controlPositioning` are stripped. Balance `head-heavy` is stored as `high`.

### Specs UNKNOWN (do not quote as measured)

- Nox Attack 12K: manufacturer Attack 12K product page exists; **weight, core, thickness not copied** in this pass
- Adidas Metalbone Team Light: packshot READY; **balance and grams UNKNOWN**
- Adidas Cross It Light/Ctrl, Arrow Hit ATTK: packshots READY from official SKU PDPs; several grams/balance still UNKNOWN
- HEAD Gravity / Speed / One: product URLs exist; several required numbers still UNKNOWN (HEAD 429 blocked live fetch)
- Siux Electra / Fenix: brand homepage, not SKU sheets
- Kuikma PR Comfort Soft: 350 g / round / Soft EVA from a **2026 range article**, not a Decathlon NL PDP
- ML10 Pro Cup: Classic continuity packshot is 2025 commercial art; live 2026 grams not locked to a current NOX PDP

---

## 4. Decision attributes and recommendation context

Every draft has the seven Kitletics attributes (`power`, `control`, `forgiveness`, `maneuverability`, `comfort`, `stability`, `spin`) with per-score reasoning and an evidence kind.

Use-case mappings used where the manufacturer story supports them:

- Level: beginner / intermediate / advanced (`uc-padel-beginner`, `intermediate`, `advanced`, plus `competitive` / `defensive` where written)
- Style: control / all-round / power
- Priority: arm-comfort, easy-power, maneuverability, maximum-power

Left/right is **not** mapped. No manufacturer evidence treats padel rackets as handed.

No overall fabricated Kitletics Score is attached (`recommendationScore` stays unset on these rows).

---

## 5. Product copy

All 62 drafts have consumer PDP overlay copy:

What it is, who it’s for, how it plays, power vs control, handling, comfort, sweet spot/forgiveness, construction, strengths/trade-offs, best for, not ideal for, buy if / skip if, plus related/alternative product IDs.

Copy is written as buying-guide voice. It cites manufacturer positioning and does not invent lab numbers.

---

## 6. Images

Pipeline: manufacturer/official-store packshots → `public/images/padel/products/` → `CATALOG_PRODUCT_MEDIA` or `PADEL_RACKET_PRODUCT_MEDIA`. Placeholders are labelled SVG and **do not** count as authentic.

`hasRegisteredProductHero` now sees padel-racket registry entries, so SKUs with a verified packshot can publish; SKUs without one stay `draft`.

### Visual review — withheld (do not use)

| File / attempt | Why withheld |
| --- | --- |
| NOX homepage og:image | Wordmark, not a racket |
| Tecnifibre homepage og:image | Logo, not Wall Breaker |
| Attack 12K blog og:image | Lifestyle of Tapia, not Attack 12K |
| Attack 12K CDN / Zona de Padel packshot | Manufacturer and retailer URLs are Attack 12K Alum XTREM, but the face is the white **Genius Xtreme** teardrop — not diamond Attack. Still withheld |
| Adidas Cross It Ctrl collection og:image | Multi-racket collage banner — replaced by the official Cross It CTRL 2026 SKU packshot |
| `adidas-metalbone-2026-hero.jpg` | **Metalbone Pro EDT**, not Metalbone 3.3 — 3.3 now uses a distinct red-frame 3.3 packshot |
| `kuikma-pr-soft-500-hero.jpg` | Face print **Comfort Soft**, not PR Soft 500 — reassigned to Comfort Soft |
| Drop Shot file on disk | **Ambition / Canyon Pro Comfort 2.0**, not Canyon Pro |
| Black Crown 2023 Special Soft packshot | **Special Soft 2023**, not current Special One Soft |
| `bullpadel-hack-hybrid-hero.jpg` | Face print **Cloud**, not Hack 04 Hybrid |

### READY packshots (visually confirmed, unique file, correct brand/model)

**Nox:** Genius 18K (face packshot), Genius 12K Xtreme, Attack 18K, Equation Soft, ML10 Pro Cup (2025 Classic commercial art).

**Bullpadel:** Vertex 05, Vertex 05 Hybrid, Vertex 05 W, Vertex Advance, Vertex 04, Hack 04, Hack 04 Hybrid, Hack 04 Comfort, Hack 03, Neuron 02, Neuron 02 Edge, XPLO, XPLO Comfort, Ionic Light, Indiga CTR.

**Adidas:** Metalbone 2026/3.5, Metalbone HRD+, Metalbone CTRL, Metalbone Team Light, Metalbone 3.3 (previous-gen, red-frame 3.3 — not Pro EDT), Cross It Light, Cross It CTRL, Arrow Hit, Arrow Hit CTRL, Match Light.

**Head:** Coello Pro, Coello Motion, Coello Team, Extreme Pro, Extreme Motion, Gravity Pro, Gravity Motion, Speed Pro, One Ultralight.

**Babolat:** Technical Viper 3.0, Counter Viper, Air Viper 2.6, Air Veron 2.6.

**Siux:** Diablo Pro, Electra Pro Fire Red 2026, Fenix Pro Black 2026.

**Wilson:** Bela Pro. Blade Pro listing packshot is **UNKNOWN** (face print is “Blade”, listing is Blade Pro V3).

**StarVie:** Astrum+, Titania 2.0 Kepler, Basalto Osiris 2.0.

**Tecnifibre:** Wall Breaker 365 (Greaves authorized packshot).

**Kuikma:** PR Comfort Soft, PR Hybrid Carbon.

**Varlion:** LW Carbon Difusor.

**Oxdog:** Sense Pro.

**Royal Padel:** M27.

**Lok:** Maxx Flow.

### BLOCKED on imagery (draft)

Nox AT10 Genius Attack 12K — retailer/manufacturer pages offered the white Genius Xtreme teardrop, not a diamond Attack face.

Kuikma PR Soft 500 — Decathlon search still served Comfort Soft (already registered as a different Product).

Drop Shot Canyon Pro — current retailer SKUs are Canyon Pro Attack / Comfort 2.0; the catalog row is the teardrop all-court Pro, not those siblings.

Black Crown Special One Soft — current Zona de Padel range is Special Elite / Max / Magic / Invictus, not Special One Soft. The 2023 Special Soft lifestyle packshot stays withheld.

**Fetch blockers that remain:** Bullpadel.com 403 and HEAD.com 429 still block manufacturer PDPs; remaining drafts were not filled with those hosts. Decathlon NL/FR 403 still blocks PR Soft 500. Do not reuse Comfort Soft, Genius 12K, Canyon Pro Attack/Comfort, or Special Soft 2023.

---

## 7. Product-by-product status

### READY — current

| Product | Image | Specs | Source |
| --- | --- | --- | --- |
| Nox AT10 Genius 18K 2026 | READY | READY | NOX PDP |
| Nox AT10 Genius 12K Alum XTREM 2026 | READY | READY | NOX / retailer packshot |
| Nox AT10 Genius Attack 18K 2026 | READY | READY | NOX PDP |
| Nox Equation Soft Advanced 2026 | READY | READY | NOX PDP |
| Bullpadel Vertex 05 | READY | READY | Retailer packshot; manufacturer PDP 403 |
| Bullpadel Hack 04 | READY | READY | Retailer packshot; manufacturer PDP 403 |
| Adidas Metalbone 2026 / 3.5 | READY | READY | adidas official store (allforpadel) |
| Adidas Metalbone HRD+ | READY | READY | Official store / authorized packshot |
| Adidas Metalbone CTRL | READY | READY | Official store |
| Adidas Arrow Hit CTRL | READY | READY | Official store |
| Adidas Arrow Hit 2026 | READY | READY* | Official store SKU packshot; some grams UNKNOWN |
| Adidas Cross It Light 2026 | READY | READY* | Official store SKU (not collection collage) |
| Adidas Cross It CTRL 2026 | READY | READY* | Official store SKU |
| Adidas Match Light | READY | READY | Official store |
| HEAD Coello Pro 2026 | READY | READY | Authorized packshot (HEAD.com 429) |
| HEAD Coello Motion 2026 | READY | READY | Padel USA packshot; face says MOTION |
| HEAD Coello Team 2026 | READY | READY | Padel USA packshot; face says TEAM |
| HEAD Gravity Pro | READY | READY* | Authorized packshot; some grams UNKNOWN |
| HEAD Gravity Motion | READY | READY* | Authorized packshot |
| HEAD Speed Pro | READY | READY* | Authorized packshot |
| HEAD One Ultralight | READY | READY* | Authorized packshot |
| Babolat Air Viper 2.6 | READY | READY | Babolat Face CDN |
| Babolat Air Veron 2.6 | READY | READY | Babolat Face CDN |
| Siux Electra Pro 2026 | READY | READY* | Zona de Padel Fire Red packshot |
| Siux Fenix Pro 2026 | READY | READY* | Zona de Padel Black packshot |
| Bullpadel Vertex 05 Hybrid | READY | READY | Zona de Padel packshot |
| Bullpadel Vertex 05 W | READY | READY | Zona de Padel packshot |
| Bullpadel Hack 04 Hybrid | READY | READY | Zona de Padel packshot |
| Bullpadel Hack 04 Comfort | READY | READY | Zona de Padel packshot |
| Bullpadel Neuron 02 | READY | READY | Zona de Padel packshot |
| Bullpadel Neuron 02 Edge | READY | READY | Zona de Padel packshot |
| Bullpadel XPLO | READY | READY | Zona de Padel packshot |
| Bullpadel XPLO Comfort | READY | READY | Zona de Padel packshot |
| Bullpadel Ionic Light | READY | READY | Zona de Padel packshot |
| Bullpadel Indiga CTR | READY | READY | Authorized Indiga CTR packshot |
| Bullpadel Vertex Advance | READY | READY | Zona de Padel packshot |
| Kuikma PR Hybrid Carbon | READY | READY | Decathlon mediadecathlon Hybrid Carbon |
| HEAD Extreme Pro | READY | READY | Authorized packshot |
| HEAD Extreme Motion | READY | READY | Authorized packshot |
| Babolat Technical Viper 3.0 | READY | READY | Authorized packshot |
| Babolat Counter Viper | READY | READY | Authorized packshot |
| Siux Diablo Pro | READY | READY | Siux official packshot |
| Wilson Bela Pro | READY | READY | Authorized packshot |
| StarVie Astrum+ | READY | READY | StarVie PDP (badge overlay on manufacturer art) |
| Tecnifibre Wall Breaker 365 | READY | READY | Authorized retailer PDP |
| Varlion LW Carbon Difusor | READY | READY | Authorized packshot |
| Oxdog Sense Pro | READY | READY | Manufacturer CDN |
| Royal Padel M27 | READY | READY | Authorized packshot |
| Lok Maxx Flow | READY | READY | Authorized packshot |
| Kuikma PR Comfort Soft | READY | READY* | Packshot READY; grams from range notes — see UNKNOWN |

\*Comfort Soft `thicknessMm` not on the sheet we used. Required publish specs are present.

### READY — previous-generation (labelled, not current awards)

Vertex 04, Hack 03, StarVie Titania Kepler, StarVie Basalto Osiris, Adidas Metalbone 3.3 (red-frame 3.3 packshot, not Pro EDT).

### UNKNOWN (published or draft with a material hole)

| Product | Why |
| --- | --- |
| Nox ML10 Pro Cup | Packshot is authentic ML10 Pro Cup; source/year is Classic 2025 commercial art, not a locked 2026 NOX PDP |
| Adidas Metalbone Team Light | Packshot READY; **weight and balance UNKNOWN** — not launch-core |
| Wilson Blade Pro | Authorized Blade Pro listing, but the face print only says Blade |
| Kuikma PR Comfort Soft | Image READY; 350 g / Soft EVA from a range article, not Decathlon NL |
| Several HEAD/Adidas/Siux published SKUs | Manufacturer URL known; some grams/balance still UNKNOWN |

### BLOCKED (draft, no publishable hero)

See imagery section. Specs/copy may exist; **do not index without a unique authentic packshot**.

Metalbone 3.3 is previous-generation and now has an authentic 3.3 packshot. Attack 12K, PR Soft 500, Canyon Pro, and Special One Soft stay draft.

---

## 8. Source completeness

| Quality | Typical rows |
| --- | --- |
| Manufacturer SKU PDP | Nox Genius/Attack/Equation; adidas Metalbone/Arrow/Match via allforpadel; StarVie Astrum+; HEAD URLs (fetch often 429) |
| Authorized retailer packshot | Bullpadel Vertex/Hack, Babolat Vipers, Siux Diablo, Wilson Bela, Tecnifibre Wall Breaker, Varlion, Royal, Lok, Oxdog |
| Range article / homepage | Kuikma Comfort Soft notes; some HEAD grams still UNKNOWN |
| Homepage only | Historical ML10 draft URL; Tecnifibre.com (packshot recovered from Greaves instead) |

Offers: many seed/wave NL/DE/UK rows remain. Retailer **homepage** URLs on these racket IDs are marked `INVALID`. No homepage Amazon/Decathlon URL is treated as a live price.

---

## 9. What is not done

- Padel vertical is **not** enabled.
- 60 published current SKUs with authentic heroes is **not** met (~52 current READY; 58 published including previous-gen).
- Four drafts remain BLOCKED on a unique authentic packshot: Attack 12K, PR Soft 500, Canyon Pro, Special One Soft.
- Dunlop padel is absent.
- No uniqueness-era reviews were written as part of this catalog pass.
- No AI-generated branded rackets, tennis stand-ins, or SVG heroes were registered as authentic.

---

## 10. Next honest steps (not implied complete)

1. Lock Attack 12K only if a packshot is visually diamond Attack, not Genius Xtreme.
2. Replace Kuikma PR Soft 500 only with a Soft 500 packshot (Comfort Soft is a different Product).
3. Attach Canyon Pro (not Attack / Comfort 2.0) and a current Black Crown Special One Soft sheet if that SKU still exists.
4. Fill UNKNOWN grams/balance only from the live SKU page.

Until those land, treat unpublished drafts as **catalog research**, not as a finished published range.
