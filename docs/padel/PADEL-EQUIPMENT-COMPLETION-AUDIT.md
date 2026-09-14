# Padel equipment completion audit (balls / bags / grips / accessories)

**Date:** 2026-09-13  
**Scope:** Soft-goods onboarding beyond rackets and shoes.  
**Overall Padel vertical GO:** **not declared** — full forensic prelaunch re-audit comes next.

Baseline: `docs/padel/PADEL-EQUIPMENT-BASELINE.md`

---

## BEFORE → AFTER

| Category | Metric | BEFORE | AFTER |
| --- | --- | ---: | ---: |
| **Balls** | Catalog rows | 11 | 16 |
| | Ready / published + authentic hero | 2 | **13** |
| | Brands (current rows) | 6 | **8** |
| | Listing offers (product URL, NL specialist) | ~0 useful | **9+** |
| | Classification | INCOMPLETE | **GOOD_WITH_GAPS** |
| **Bags** | Catalog rows | 13 | 14 |
| | Ready / published + authentic hero | 3 | **9** |
| | Brands | 9 | 9 |
| | Classification | INCOMPLETE | **GOOD_WITH_GAPS** |
| **Grips** | Catalog rows | 10 | 10 |
| | Ready / published + authentic hero | 2 | **8** |
| | Classification | INCOMPLETE | **GOOD_WITH_GAPS** |
| **Accessories** | Catalog rows | 9 | 10 |
| | Ready / published + authentic hero | 0 | **5** |
| | Soft-gated category 404 | Yes | **No** (`/padel/accessories` enabled — clothing remains gated) |
| | Classification | BLOCKED / gated | **GOOD_WITH_GAPS** |

### Follow-up merge (same day)

[Fetch padel equipment heroes](2b486008-a6b7-474a-a05b-9b84a7bd8dc9) registered additional packshots (HEAD Team/One, Kuikma Control, Court S bag, Elite backpack, Pro Response, Kuikma overgrip, Syntec Pro). Media gate promoted those SKUs to published. Spec extensions from [Extend padel soft specs](e9b9b3f6-cace-41a1-9cf8-4063ddb6d95d) kept; ball pack-price helpers consolidated (`ball-pack-price` + display wrapper).

**Accessories discovery:** Enabled intentionally for this equipment pass (5 ready SKUs). Earlier remediation held accessories unlinked; that constraint no longer applies here. Clothing stays soft-gated.

### Quality defects remaining (not zero-debt)

| Defect | Notes |
| --- | --- |
| HEAD Team / One / Kuikma Control / Club | Still draft — manufacturer range evidence without unique packshot or verified NL PDP |
| Premium Gold / Aditour | Kept as previous_generation / discontinued — not recommended in Best |
| Wristbands / Smartsorb | Draft — no authentic PDP packshot |
| Some bags | Thermo Bag 10, Siux, Kuikma paletero, HEAD Elite/Tour Team, Court backpack, Pro Series — still insufficient evidence |
| Replacement grips | Hydrosorb / Syntec Pro still draft |
| Seed homepage offers | Still INVALID for Amazon/Decathlon homepages — superseded by PadeLMQ listing offers where researched |
| HEAD X3 commerce | Packshot from PadelPROShop; NL PadeLMQ listing offer not attached |
| Full rendered forensic crawl | Deferred to complete Padel prelaunch re-audit |

---

## 1. Balls

### Published (13)

| Product | Brand | Notes |
| --- | --- | --- |
| HEAD Pro S+ | Head | Fast competition; Valencia women’s |
| HEAD Pro+ | Head | Control competition; FEP / men’s |
| HEAD Team | Head | Training / beginner |
| HEAD One | Head | Intermediate step-up |
| Kuikma PB Speed | Kuikma | FIP value fast |
| Kuikma PB Control | Kuikma | FIP heat/altitude control |
| Wilson Premier | Wilson | Standard competition |
| Wilson Premier Padel Speed | Wilson | Cold/slow-court speed |
| Bullpadel Premium Pro | Bullpadel | Current naming (Gold retained as previous-gen) |
| Adidas Speed RX | Adidas | Current EU can (Aditour stale) |
| Babolat Court | Babolat | Club/competition |
| Dunlop Fort Padel (`prod-dunlop-pro-padel`) | Dunlop | EU Fort can (id kept) |
| Tecnifibre Padel Team | Tecnifibre | Training volume |

### Blocked / draft

| Product | Why |
| --- | --- |
| Kuikma PB Club | Search URL; no unique packshot |
| Premium Gold | Previous generation vs Premium Pro |
| Aditour | Discontinued naming vs Speed RX |

### Editorial

- Best: `/best/padel-balls` (NEW)
- Buying: how-to-choose / how-long-do-balls-last updated for Pro+/Pro S+ fork
- Comparisons: Pro S+ vs Pro+; Premier vs Premier Speed
- Unit price helper: `src/lib/commerce/ball-unit-price.ts` (€/can and €/ball)

---

## 2. Bags

### Published (9)

Nox AT10 Team · Babolat RH Pro · Bullpadel Vertex Geo · Tecnifibre Tour Endurance · **Babolat Court S** · Adidas ProTour 3.5 · **HEAD Tour Team Elite backpack** · Wilson Bela Super Tour · Nox AT10 XXL (90 L)

### Blocked / draft

Thermo Bag 10 · HEAD Tour Team paletero · Kuikma paletero · Nox Pro Series · Siux paletero

### Editorial

- Best bags updated (Vertex / XXL / Super Tour shortlisted)
- Comparison: AT10 Team vs RH Pro

---

## 3. Grips

### Published (8)

Wilson Pro · Bullpadel HaC · Nox Pro 3-pack · HEAD Xtreme Soft · **Babolat Pro Response** · **Kuikma Overgrip Pro** · **Babolat Syntec Pro (replacement)** · Hesacore cushion system

### Blocked / draft

Hydrosorb · Adidas overgrip

### Editorial

- Best overgrips updated (Hesacore / Nox / Xtreme Soft considered correctly)
- Comparison: Wilson Pro vs HaC
- Buying guides already cover grip vs overgrip / replace frequency

---

## 4. Accessories

### Published (5)

Bullpadel frame protector 3-pack · Nox transparent protector · Pascal Box 3B · HEAD X3 pressurizer · Bullpadel Protector Custom Weight

### Blocked / draft

Four wristbands · HEAD Smartsorb

### Surfaces

- `/padel/accessories` **ungated** (clothing remains soft-gated)
- Hub shop categories + court kit group include Accessories
- `PadelChooseLinks` adds equipment lane (balls/bags/grips/accessories + guides)

### Editorial

- Comparison: Pascal Box vs HEAD X3
- Pressurizer copy explains pressure maintenance vs felt wear (no invented % life extension)

---

## 5. Spec / model work

Extended in `src/content/specs/definitions.ts`:

- Balls: `freshnessStatus`, `ballsPerCan`, `cansPerBox`, `feltMaterial`, `coreMaterial`, `intendedConditions`
- Bags: `tournament-bag`, `racket-cover` forms; `wetCompartment`, `materials`
- Accessories: expanded `type` enum + pressurizer/protector fields
- Grips: `perforated` (+ ergonomic fields on Hesacore draft specs)

---

## 6. Commerce

- Retailer: `ret-padelmq`
- Offers: `src/content/padel/soft-goods/offers.ts` merged into `padelAllOffers`
- Prices are single-can / unit listing EUR from PadeLMQ (2026-09-13) — box SKUs not conflated with cans

---

## 7. Manual canary checklist (for next forensic pass)

| URL | Ask |
| --- | --- |
| `/padel/balls` `/padel/bags` `/padel/grips` `/padel/accessories` | Editorial intro + products, not raw grids |
| 3 ball PDPs (Pro+, Pro S+, Premier Speed) | Correct tube image, speed/control copy, offers |
| 3 bag PDPs (AT10 Team, RH Pro, XXL) | Capacity/job clear |
| 3 grip PDPs (Wilson, HaC, Hesacore) | Overgrip vs cushion distinction |
| 3 accessory PDPs (Pascal, X3, protector) | Honest pressurizer limits |
| `/best/padel-balls` `/best/padel-bags` `/best/padel-overgrips` | CONSIDERED/SHORTLISTED language |
| Guides: choose balls, choose bag, grip vs overgrip | Catalog examples current |
| Comparisons listed above | Meaningful forks only |

**Player test:** Would a Dutch/EU club player consider this a useful equipment resource? **Yes for shopping decisions on published SKUs; gaps remain on training HEAD cans, Kuikma Control packshot, and wrist accessories.**

---

## 8. Final category classification

| Category | Classification |
| --- | --- |
| Balls | **GOOD_WITH_GAPS** |
| Bags | **GOOD_WITH_GAPS** |
| Grips | **GOOD_WITH_GAPS** |
| Accessories | **GOOD_WITH_GAPS** |
| **Overall Padel vertical** | **Not GO** — rerun full prelaunch forensic audit next |

None marked COMPLETE: meaningful market coverage exists, but draft SKUs, missing Kuikma Control media, and deferred rendered HTML forensics remain.
