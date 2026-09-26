# Padel vs Running — visual and content sign-off

Independent **READ-ONLY** audit of the local production build (`next start` on port 3457) after final residual remediation. Desktop 1440×900. Mobile 390×844. Full-page captures and pair crops: `docs/padel/screenshots/parity-signoff/`. Metrics: `docs/padel/data/parity-signoff-metrics.json`. Guide crawl: `docs/padel/data/parity-signoff-guides.json`. Probes: `docs/padel/data/parity-signoff-probes.json`. Issues: `docs/padel/data/PADEL-RUNNING-PARITY-ISSUES.csv`.

Captured at 2026-09-24 (UTC). **No application code was changed for this audit.**

## The question

If Running did not exist and Padel did not exist, would we believe these two verticals were produced by the **same mature Kitletics product system**?

**Answer from rendered evidence: Not yet.** Product chrome, commerce presentation, mobile layout, Kuikma/Joma availability, and Construction image paint are now close. Review pages still stamp interchangeable section glue (“I'd only keep…”, “If this section still feels generic…”) that Novablast does not use, and major guides remain visually thinner than Running’s teaching surfaces.

## Reference pair

| | Running | Padel |
| --- | --- | --- |
| PDP | `/products/asics-novablast-6` | `/products/bullpadel-vertex-05-2026` |
| Review | `/reviews/asics-novablast-6` | `/reviews/bullpadel-vertex-05-2026` |

### Reference metrics (desktop)

| Metric | Novablast PDP | Vertex PDP | Novablast Review | Vertex Review |
| --- | --- | --- | --- | --- |
| HTTP | 200 | 200 | 200 | 200 |
| Words | 2,018 | 2,461 | 1,885 | 5,187 |
| Unique imgs | 11 | 13 | 11 | 9 |
| Gallery files | 2 | 5 | 0 | 5 |
| Section files | 0 | 0 | **6** | **0** |
| From price | €149 | €319 | €149 | €319 |
| Named retailers | Runner’s World, All4running, Amazon.nl | Amazon.nl | same | Amazon.nl |
| Stem residue (scan) | 0 | 0 | 0 | 0 |
| Template glue (“I'd only keep”) | — | — | **0** | **48** |
| Template glue (“feels generic”) | — | — | **0** | **14** |

## Final verdicts

| Gate | Result |
| --- | --- |
| PADEL_PDP_PARITY | **PASS** |
| PADEL_REVIEW_PARITY | **FAIL** |
| PADEL_GUIDE_PARITY | **FAIL** |
| PADEL_MEDIA_PARITY | **FAIL** |
| PADEL_COMMERCE_PRESENTATION_PARITY | **PASS** |
| MOBILE_PARITY | **PASS** |
| OVERALL_RUNNING_PADEL_PARITY | **FAIL** |

---

## 1. PDP dimensions

| Dimension | Class | Evidence |
| --- | --- | --- |
| Visual richness | PARITY on flagships + Kuikma/Joma; RUNNING_STRONGER on thin soft goods | Vertex 5 gallery thumbs; Kuikma now renders **6 thumbs including `/gallery/`** (`pair-pdp-kuikma-top.png`). Joma T.Slam **200** with 3 thumbs + €109 (`pair-pdp-shoe-top.png`). Frame Protector Uni remains thin (unique≈5, no gallery). ASICS Gel-Resolution Padel PDP galleryCount=0. |
| Unique product imagery | PADEL_STRONGER on Vertex/Kuikma (5 gallery vs Novablast 2); PARITY on Joma (2) | Prior Kuikma hero-only gap is closed. |
| Gallery usefulness | PARITY where present | Angles teach shape/face/profile. Novablast side + outsole teach shoe jobs. |
| Spec depth | PARITY | Sport-appropriate fields. |
| Decision support | PARITY with residual RUNNING_STRONGER notes | Worst prior grammar (“want choosing”, “still building”) cleared. Residual machine situations remain: “Players who prefer Manufacturer diamond + 12K…”, “Players who prefer 2026 range notes…”, Indiga “want the official : round…”. |
| Best for / Not ideal | PARITY | Complete person phrases dominate; no double shortlist stems in sample. |
| Technical explanation | PARITY | 12K / Multieva vs FF BLAST MAX. |
| Scores | PARITY | Same score chrome. |
| Alternatives | PARITY | Linked peers with photos + From prices. |
| Comparison support | PARITY | Compare works (`compare-vertex-hack-desktop-full.png`). |
| Review integration | PARITY | Review slot present. |
| Price visibility | PARITY | Vertex €319, Kuikma €44,99, Joma €109, Indiga €84,99, bag €44,96, ball €5,79, grip €9,95. Uni: honest empty NL commerce. |
| Retailer options | RUNNING_STRONGER on density; PARITY on usable CTA | Novablast lists three; Vertex/Kuikma/Joma typically one named retailer + VIEW PRICES. |
| CTA quality | PARITY | VIEW PRICES / Check price when offers exist. |
| Related content | PARITY | Guides + related products. |
| Mobile experience | PARITY | Vertex mobile unique=13, gallery=5 (`pdp-vertex-mobile`). |
| Overall information density | PARITY on rackets/shoes with offers; RUNNING_STRONGER on accessories | Soft accessory PDPs are shorter by nature; not broken. |

**PDP gate → PASS.** Across rackets, shoes (incl. restored Joma), balls, bags, and grips with offers, a user sees the same product system: gallery where assets exist, score, From price, CTA, alternatives. Residual decision-chip awkwardness is real but no longer blocks the PDP as a product surface.

---

## 2. Review dimensions

| Dimension | Class | Evidence |
| --- | --- | --- |
| Visual storytelling | RUNNING_STRONGER | Novablast Upper paints dedicated `/sections/upper.png` (`probe-novablast-section.png`, naturalWidth=604). Vertex/Kuikma Construction now **paint** gallery angles (`probe-vertex-section.png`, `probe-kuikma-section.png`, nw=604) — prior grey-placeholder FAIL is closed. Still no topic-specific `/sections/` library on Padel. |
| Unique images | RUNNING_STRONGER | Novablast: **6 section files**. Vertex/Kuikma/Indiga/Hack: **0** section files, gallery×5 only. |
| Product detail | PARITY on specs; RUNNING_STRONGER on section prose | Spec lines name 12K / Soft EVA. Section bodies reuse template glue across topics. |
| Technical analysis | RUNNING_STRONGER | Construction opens with real specs, then stamps interchangeable “I'd only keep… / If this section still feels generic…” paragraphs also used in Who-should-avoid (`probe-vertex-section.png`). |
| Performance analysis | PARITY | Score panels + attribute notes exist. |
| Decision usefulness | RUNNING_STRONGER | Buy/Skip lines are usable. Section filler does not change a court decision and is nearly identical across Kuikma and Vertex. |
| Score explanation | PARITY | Metric notes present. |
| Alternatives | PARITY | Peers linked. |
| Comparison context | PARITY | Comparison section present. |
| Price / offers | PARITY | From price + retailer visible. |
| Commerce CTA | PARITY | Amazon / VIEW PRICES when offers exist. |
| Related content | PARITY | Related rails present. |
| Mobile | PARITY | Same stack; Vertex mobile review unique=9 gallery=5. |
| Overall editorial maturity | RUNNING_STRONGER | HTML count on Vertex review: **48×** “I'd only keep the”, **14×** “If this section still feels generic”. Novablast: **0**. Kuikma: 50× / 6×. |

**Review gate → FAIL.** Construction media now paints (prior blocker closed), but Padel reviews still read as a longform shell with repeated session-decision boilerplate. Running’s Novablast review reads as section-specific editor guidance with dedicated visuals.

---

## 3. Guide audit (every public Padel guide)

Crawl: 21 knowledge guides + 26 Best guides (`parity-signoff-guides.json`).

| Guide | Unique imgs | Top repeated asset | Notes |
| --- | --- | --- | --- |
| How to choose running shoes (ref) | **14** | Novablast×4 | Teaching density bar |
| How to choose a padel racket | 6 | Vertex×6, Indiga×5, ML10×5 | Product-card heavy |
| How to choose a padel bag | 4 | AT10×7, Babolat×6 | Low unique; card reuse |
| How to choose padel balls | 5 | Kuikma PB Speed×6, Pro S×6 | Card reuse (not prior hero stamp alone) |
| Padel grips / overgrips | 3 | Wilson×5, HaC×5 | Thinnest major guide |
| How to choose padel shoes | 5 | Resolution/Courtquick/Premura×4 | |
| Beginner gear | 8 | Indiga×5 | Better than bags/grips |

Cross-surface hashed hero collisions remain between some Best lists and knowledge guides (e.g. beginners Best ↔ beginner gear guide). Some are role-aligned; several still look like shared stock rather than intentional teaching media.

| Dimension | Class | Evidence |
| --- | --- | --- |
| Duplicate card imagery | NOT_COMPARABLE / expected | Same product in examples + comparison + rail is legitimate — counted separately from editorial uniqueness. |
| Duplicate article / teaching imagery | RUNNING_STRONGER | Unique counts 3–6 vs Running 14; few non-product teaching diagrams relative to Running concept photos. |
| Generic / irrelevant imagery | PARITY | Heroes are category-correct after prior remediation. |
| Missing section visuals | RUNNING_STRONGER | Major guides rely on product cards + sparse diagrams. |
| Thin sections | PARITY on word count | Guides are long (~2.2–2.7k words) but visually sparse. |
| Product examples | PARITY | Present. |
| Decision tables | PARITY | Tables present on guide crawl. |
| Commerce links | PARITY | From-prices appear on example cards. |

**Guide gate → FAIL.** Content length is fine; visual teaching richness is still materially below Running.

---

## 4. Vertical sampling

| Category | Sample | HTTP | Gallery | Price/CTA | Notes |
| --- | --- | --- | --- | --- | --- |
| Racket flagship | Vertex 05 2026 | 200 | 5 | €319 + CTA | Mature |
| Racket value | Kuikma PR Comfort Soft | 200 | **5** | €44,99 + Decathlon CTA | Prior PDP gallery miss closed |
| Racket beginner | Indiga CTR | 200 | 5 | €84,99 + multi-retailer | Residual situation glue |
| Shoe | Joma T.Slam | **200** | 2 | €109 + CTA | Prior 404 closed |
| Shoe | ASICS Gel-Resolution Padel | 200 | **0** | €139 + CTA | Hero-only gallery gap |
| Ball | HEAD Pro S | 200 | 2 | €5,79 + CTA | |
| Bag | NOX AT10 Team | 200 | 5 | €44,96 + CTA | |
| Grip | Wilson overgrip | 200 | 1 | €9,95 + CTA | |
| Accessory | Frame Protector Uni | 200 | 0 | empty NL commerce | Honest empty; thin page |
| Review shoe | `/reviews/joma-t-slam` | **200** | 2 | €109 | Prior 404 closed |
| Best | Rackets / Balls / Pressurizers / Overgrips / Shoes | 200 | — | chips mostly natural | One overgrips chip awkward (“prefer default thin…”) |

Vertex no longer masks shoe/value SKUs: Joma and Kuikma are public and commercially visible.

---

## 5. Commercial presentation

| Check | Result |
| --- | --- |
| Price visible when offers exist | PASS — From € on Vertex, Kuikma, Joma, Indiga, bag, ball, grip |
| Retailer named | PASS — Amazon.nl / Decathlon / Chef Padel / PadeLMQ as applicable |
| CTA clickable copy | PASS — VIEW PRICES |
| Empty state honest | PASS — Uni has no fake NL retailer |
| Backend-only offers | Not observed on sampled surfaces |

**Commerce presentation → PASS.**

---

## 6. Unique media (unique ≠ rendered count)

| Surface | Unique | Gallery | Sections | False richness? |
| --- | --- | --- | --- | --- |
| Novablast PDP | 11 | 2 | 0 | Mild hero reuse in rails |
| Vertex PDP | 13 | 5 | 0 | Peer heroes in alternatives |
| Kuikma PDP | 11 | 5 | 0 | Closed prior hero-only gap |
| Novablast Review | 11 | 0 | **6** | — |
| Vertex Review | 9 | 5 | **0** | Gallery substitutes for section art |
| Padel racket guide | 6 | — | — | Vertex/Indiga/ML10 repeated as cards |
| Padel bags guide | 4 | — | — | AT10×7 |
| Running shoes guide | 14 | — | — | Reference bar |

**Media parity → FAIL.** Dedicated review section imagery and guide teaching uniqueness still lag Running.

---

## 7. Content specificity

Rejects for interchangeability:

1. Review section boilerplate shared across products/sections (“I'd only keep…”, “If this section still feels generic…”).
2. Strength→situation chips (“Players who prefer Manufacturer diamond…”, “Players who prefer 2026 range notes…”).
3. Best pressurizers “Best when you are players who want…” double person phrase (awkward, not telegram-broken).

Novablast review bodies remain section-specific without that stamp.

---

## 8. Mobile

| Check | Evidence |
| --- | --- |
| Vertex PDP mobile | unique=13, gallery=5, HTTP 200 |
| Novablast PDP mobile | unique=11, gallery=2 |
| Review mobile | Same stack; section counts unchanged |

**Mobile → PASS.** No mobile-only layout regression vs Running chrome.

---

## 9. What improved vs prior independent audit

| Prior FAIL symptom | This audit |
| --- | --- |
| Construction grey placeholders | **Paint** (nw>0) on Vertex + Kuikma |
| `NOT_PUBLISHED` on Kuikma | **Absent** |
| Kuikma PDP gallery = 0 | **5 gallery paths** |
| Joma T.Slam 404 | **200** PDP + review |
| “want choosing” / “still building” | **Cleared** in sampled who-for |
| Guide hero category collisions (rackets/balls/pressurizers) | Still distinct Best heroes |

Remaining FAILs are editorial maturity + teaching/section media — not the prior pipeline breakages.

---

## 10. Overall

**OVERALL_RUNNING_PADEL_PARITY → FAIL.**

PDP/commerce/mobile now look like the same Kitletics product system. Reviews and guides still would not convince a careful reader that Padel longform was finished to the Novablast / Running-shoes-guide editorial bar: repeated section glue, zero dedicated review section files, and thinner unique teaching media.

Do not treat technical gate closures as overall parity. Re-audit after review template glue and guide teaching visuals are addressed.

## Encoded hard rules (post-remediation; do not flip this audit)

Implementation now enforces:

1. **REVIEW TEMPLATE-GLUE** — automatic `PADEL_REVIEW_PARITY` FAIL on systematic non-structural repeated prose; word count never clears FAIL (`src/lib/padel/parity-gates.ts`).
2. **TEACHING-MEDIA** — concept coverage for major guides; do not compare total `<img>` counts; product cards/packshots do not count.

Live estate CI: `src/lib/padel/parity-gates.test.ts`. Historical verdicts above remain the independent READ-ONLY audit result until a fresh rendered re-audit.
