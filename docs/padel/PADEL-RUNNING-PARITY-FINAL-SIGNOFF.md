# Padel vs Running — FINAL independent parity sign-off

Independent **READ-ONLY** audit of the **production build** rendered experience.
Captured 2026-09-25. Port `3460` (`next start` after production build).
Desktop 1440×900. Mobile 390×844. Screenshots: `docs/padel/screenshots/parity-final/`.
Metrics: `docs/padel/data/PADEL-RUNNING-PARITY-FINAL-METRICS.json`.
Issues: `docs/padel/data/PADEL-RUNNING-PARITY-FINAL-ISSUES.csv`.

**No application code was changed for this audit.**

Remediation docs, self-reported parity gates, and generated CSV summaries were **not** treated as proof. They were consulted only as intent notes. Verdicts below come from clean CI logs + Playwright-rendered HTML/screenshots.

---

## The question

If Running did not exist and Padel did not exist, would a careful user believe these verticals were produced by the **same mature Kitletics product/editorial system**?

**Answer from rendered evidence: Not yet.**

PDP chrome, commerce, mobile, and major-guide teaching diagrams now look like the same product system. Review longform still stamps interchangeable section openers across rackets (“Generic continuum…”, “Shape changes where the usable face sits…”, “Sweet-spot height is a teaching idea…”) and broken Buy-if grammar (“I'd shortlist it if you want players who want…”). That is not Novablast-grade editorial maturity. Clean CI also failed on this audit’s sequential production build.

---

## 1. CLEAN_CI (this audit’s sequential run only)

| Step | Exit | Result |
| --- | --- | --- |
| `rm -rf .next` | 0 | Cleared |
| `npm run lint` | **0** | 0 errors / 27 warnings |
| `npm run typecheck` | **0** | Pass |
| `npm test` | **0** | **102** files passed, **1035** tests passed, 0 failed, 0 timeouts (881s) |
| `npm run build` | **1** | `next/font` Google loader `TypeError` on `DM_Sans` in `src/app/layout.tsx` |

**CLEAN_CI = FAIL**

An isolated rebuild later succeeded (font fetch) and was used only to host the experience audit. Per audit rules, that retry **does not** clear CLEAN_CI.

---

## 2. Estate denominators (regenerated)

| Surface | Count |
| --- | --- |
| Public Padel reviews (estate inventory, all HTTP 200) | **26** |
| Public Padel knowledge guides | **26** |
| Public Padel Best guides | **39** |

---

## 3. Final verdicts

| Gate | Result |
| --- | --- |
| PADEL_PDP_PARITY | **PASS** |
| PADEL_REVIEW_PARITY | **FAIL** |
| PADEL_GUIDE_PARITY | **PASS** |
| PADEL_MEDIA_PARITY | **PASS** |
| PADEL_COMMERCE_PRESENTATION_PARITY | **PASS** |
| MOBILE_PARITY | **PASS** |
| CLEAN_CI | **FAIL** |
| OVERALL_RUNNING_PADEL_PARITY | **FAIL** |

OVERALL requires all seven gates PASS. CLEAN_CI and REVIEW fail → OVERALL FAIL.

---

## 4. PDP regression (prior PASS confirmed)

Sampled: Novablast, Vertex, Kuikma, Indiga, Joma, ASICS Gel-Resolution Padel, HEAD Pro S, NOX AT10 Team, Wilson overgrip, Frame Protector Uni.

| Product | HTTP | Words | Gallery | Price | CTA |
| --- | --- | --- | --- | --- | --- |
| Novablast | 200 | 2060 | 2 | FROM €149 | yes |
| Vertex 05 | 200 | 2432 | 5 | FROM €319 | yes |
| Kuikma PR Comfort Soft | 200 | 2013 | 5 | FROM €44,99 | yes |
| Indiga CTR | 200 | 2090 | 5 | FROM €84,99 | yes |
| Joma T.Slam | 200 | 1662 | 2 | FROM €109 | yes |
| ASICS Gel-Resolution Padel | 200 | 1778 | **0** | FROM €139 | yes |
| HEAD Pro S | 200 | 1059 | 2 | FROM €5,79 | yes |
| NOX AT10 Team | 200 | 1842 | 5 | FROM €44,96 | yes |
| Wilson overgrip | 200 | 1828 | 1 | FROM €9,95 | yes |
| Frame Protector Uni | 200 | 792 | 0 | From €7.95 | no (thin accessory) |

Identity, heroes, specs, decision modules, and review integration remain in the same product system as Running. Accessory thinness is **not** treated as PDP FAIL. Residual: ASICS shoe gallery=0 (ISS-F010).

**PADEL_PDP_PARITY = PASS**

---

## 5. REVIEW TEMPLATE-GLUE RULE → FAIL

Historical stems are gone on all 26 rendered reviews:

| Stem | Count |
| --- | --- |
| `I'd only keep…` | **0** |
| `If this section still feels generic…` | **0** |

**Word count does not compensate.** Vertex ~3.1k / Kuikma ~2.7k / Novablast ~ (deep sample ~same band). Length is fine; specificity is not.

### Replacement boilerplate (systematic)

Independently computed scrubbed cross-product reuse on rendered bodies:

| Pattern | Products | Sections |
| --- | --- | --- |
| `POWER Generic continuum — match the mould to the job you play most weeks.` | **12** rackets | Power |
| `Shape changes where the usable face sits — not a brand rendering.` | **12** rackets | Shape and balance |
| `Sweet-spot height is a teaching idea — verify published notes on the product sheet.` | **9** rackets | Sweet spot |
| `How the foam, upper and outsole are likely to hold up with real use.` | **13** (incl. non-shoes) | Durability-class |
| `Soft dailies usually fade in the foam before the upper looks worn…` | **11** (incl. non-shoes) | Durability-class |

**Playwright crop confirmation** (`crop-review-vertex-power.png` / `crop-review-kuikma-power.png`):

- Vertex Power opens with the Generic continuum stem, then Vertex-specific 12K / Multieva sentence.
- Kuikma Power opens with the **same** Generic continuum stem, then Soft EVA / fiberglass sentence.

A careful reader can move the opener to another racket with only the product name changed. That is automatic **PADEL_REVIEW_PARITY FAIL** under the TEMPLATE-GLUE RULE.

Legitimate shared structural copy (methodology, scores disclaimer, tool nav) was excluded from this FAIL.

### Product-specificity

Vertex / Kuikma / Indiga / Hack **do** differ in Construction/Verdict/Who-should-buy once past the glue openers (diamond 12K vs round Soft EVA vs Polyglass starter vs Tricarbon 18K Hack). The failure is systematic **section scaffolding**, not total interchangeability of entire reviews.

### Decision grammar (required = 0)

Rendered Buy-if still contains double-person phrases:

- Vertex: `I'd shortlist it if you want players who want the current Tello Vertex…`
- Kuikma: `I'd shortlist it if you want players who want a ~350 g round…`
- Indiga: same pattern + Skip-if fragment ending `…is most of your week.`

**KNOWN_DECISION_GRAMMAR_DEFECTS ≠ 0** → supports REVIEW FAIL.

### Integrity

| Check | Result |
| --- | --- |
| PUBLIC_EDITORIAL_INSTRUCTION_LANGUAGE | **0** |
| PUBLIC_INTERNAL_SENTINELS | **0** |
| Expert-research honesty | Present (“not hands-on testing unless…”) — OK |
| BEST chips (sampled Best guides) | **0** defects |

### Review media

Racket reviews paint 3 education SVGs (shapes / power-control / sweet-spot) with `naturalWidth>0` after scroll. Shared education across reviews is intentional teaching reuse (allowed). Soft-goods/shoes lack dedicated section files; product gallery/hero carry visuals — acceptable under concept-need rule, not an automatic FAIL.

**PADEL_REVIEW_PARITY = FAIL** (glue + grammar; not img count)

---

## 6. TEACHING-MEDIA RULE → GUIDE / MEDIA PASS

Do **not** compare total `<img>` counts. Packshots/cards do not count as teaching media.

| Guide | Words | Unique imgs | Large SVGs / diagrams | Teaching verdict |
| --- | --- | --- | --- | --- |
| How to Choose Running Shoes | 1773 | 14 | anatomy + hero | Reference |
| How to Choose a Padel Racket | 2538 | 6 | shape / sweet-spot / balance / weight diagrams | **PASS** |
| How to Choose Padel Shoes | 2380 | 5 | support/outsole diagrams present | **PASS** |
| How to Choose a Padel Bag | 2269 | 4 | bag anatomy/forms diagrams | **PASS** |
| How to Choose Padel Balls | 2432 | 5 | pressure/types diagrams | **PASS** |
| Padel Grips / Overgrips | 2069 | 3 | layer / build-up diagrams mid-page | **PASS** |
| Beginner Padel Gear Guide | 2519 | 8 | kit composition diagrams | **PASS** |

Grips fold is visually empty vs Running’s hero photo (ISS-F012 residual), but full-page capture shows intentional teaching diagrams for replacement vs overgrip / build-up — not packshot inflation.

Hero collisions across sampled Best↔guide: **0** unjustified collisions in this crawl.

**PADEL_GUIDE_PARITY = PASS**  
**PADEL_MEDIA_PARITY = PASS**

(Initial automated `naturalWidth===0` counts were lazy-load false positives; scroll recheck + HTTP 200 on education/gallery assets → `BROKEN_SECTION_MEDIA = 0`.)

---

## 7. Commerce + mobile regression

Commerce sample (Vertex, Kuikma, Joma, Indiga, bag, ball, grip): From-price + CTA visible where offers exist. Frame protector honestly thin.

Mobile: Vertex PDP/review, racket guide, Best rackets, Novablast — no horizontal overflow (`docW=viewW=390`). Education SVGs readable at section crops.

**PADEL_COMMERCE_PRESENTATION_PARITY = PASS**  
**MOBILE_PARITY = PASS**

---

## 8. Failure reporting (no broad remediation recommended)

### SYSTEMIC_ROOT_CAUSE

1. **Review section scaffolding still emits shared non-structural openers** across rackets (and shoe durability stems bleed into soft goods). Historical deepen stems were removed; **replacement glue** remains. This alone FAILs `PADEL_REVIEW_PARITY`.
2. **Buy-if assembly still produces double-person grammar** on multiple flagship reviews.
3. **CLEAN_CI**: sequential `next build` failed on Google font fetch in this environment — blocks OVERALL regardless of experience gates.

### INDIVIDUAL_RESIDUAL (not systemic enough to flip PDP/GUIDE/MEDIA alone)

1. ASICS Gel-Resolution Padel PDP `galleryCount=0`
2. Frame Protector Uni thin commerce (expected accessory)
3. Grips guide above-the-fold lacks Running-style hero photo
4. NOX bag retailer-name regex miss despite visible price/CTA
5. Soft-goods reviews lack education diagrams (concept need lower)
6. Pairwise legitimate shared attack-diamond sentences (Vertex↔Hack weight band) — decision-anchored, not primary FAIL

Exact blocker URLs/sentences for REVIEW FAIL: see ISS-F002–ISS-F009 in the issues CSV.

---

## 9. Required conclusion

```
SYSTEMIC_EDITORIAL_GAP: YES
SYSTEMIC_MEDIA_GAP: NO
INDIVIDUAL_RESIDUAL_COUNT: 6
OVERALL_RUNNING_PADEL_PARITY: FAIL
```

Experience quality still fails the “same mature editorial system” test because **Padel reviews remain scaffolded**, even though PDP/commerce/mobile/guide teaching media now look like Kitletics. Fix the remaining review glue/grammar (and restore clean sequential builds) before claiming OVERALL PASS — do not launch another broad vertical remediation.
