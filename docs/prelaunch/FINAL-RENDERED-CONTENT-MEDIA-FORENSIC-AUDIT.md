# Kitletics — Rendered Content & Media Forensic Audit

**Document ID:** `FINAL-RENDERED-CONTENT-MEDIA-FORENSIC-AUDIT`  
**Mode:** READ-ONLY (no product, content, threshold, image, or publish changes)  
**Clock:** `2026-09-12`  
**Lab:** production `https://kitletics.com` (Vercel) + current repository overlays / page-data lineage  
**Question:** what does an actual visitor see, and why did launch/content audits call this READY?

Do not treat READY / LAUNCH_READY / COMPLETE / MEANINGFUL as proof of public quality.

---

VERDICT:
**UNACCEPTABLE**

---

## Required answers

1. **How many public/indexable URLs were scanned?**  
   **1,167** production sitemap URLs. HTTP 200 on all of them (1,164 on the first pass; 3 timeouts — `/brands/nike`, `/gear`, `/running/shoes` — retried successfully). This is the full live sitemap, not a 15-page sample.

2. **How many have at least one content-quality problem?**  
   **952 unique URLs** have at least one OPEN issue in the repair queue (token leak, machine decision copy, wrong/suspicious imagery, or reuse cluster). That is **82%** of the indexed sitemap.

3. **How many have raw/internal token leakage?**  
   **829 URLs** render concatenated identifier dumps such as `skuslugasicsnovablast6`, `253weightasicsnovablast6`, `415heelstack…`, and “is the concatenated weight token for…”.  
   By template: **333/373 reviews**, **332/375 product PDPs**, **114/130 alternatives**, **49 brands**, **1 author**.  
   Overlay field scan of the winning review objects: **515 review records** contain stamps; **195/195 P54 indexable reviews** leak.

4. **How many have machine-like decision copy?**  
   **226 URLs** on production HTML match the unique-expert-research decision templates (“already decided the lane”, “headline trait”, “whatever X optimizes for”). Overlay field scan: **572 reviews** contain those templates somewhere; **452 Buy If lines** classify as MACHINE_LIKE and **260** as WORDY.

5. **How many have wrong/suspicious imagery?**  
   **142 URLs** have at least one image-mismatch issue. Placement inventory: **85 WRONG_SPORT**, **59 WRONG_CONTENT_TYPE**, **16 DUPLICATE_PLACEHOLDER**. The homepage featured card **“How to Choose a Running Watch” is a padel racket photograph** (`/images/home/guide-how-to-choose.jpg`). That same padel file is reused on **114** sitemap URLs. NYC skyline `urban-dusk.jpg` appears on **92** URLs including Best running-watch guides. `running-urban.jpg` appears on **235** URLs.

6. **Which templates/components cause the largest blast radius?**  
   1. `synthesizeUniqueExpertResearch` (`uniqueTokenList` / `skuStamp` / `specDumpSentence`) → P54 + P53 JSON overlays → Review page + PDP review summary + brand/author teasers.  
   2. `dedupeReviewsBySlug` **first-wins** in `src/content/reviews.ts` (P54/P53 beat later handwritten copy, including the clean Novablast 6 review in the same file).  
   3. `enrichTestingContext` **preserves** any “Kitletics Expert Research Review / How we assessed it” dump ≥40 words.  
   4. Homepage `GUIDE_IMAGES['how-to-choose-running-watch']` hardcoded to the padel file (production/HEAD).  
   5. Shared atmosphere fallbacks (`urban-dusk.jpg`, `running-urban.jpg`, `guide-how-to-choose.jpg`).

7. **Are the failures source-data, transformation, rendering, generation, or media-association?**  
   **Generation + source overlay + merge, then preserved by transformation.** Tokens were generated on purpose to beat uniqueness Jaccard, stored in overlay JSON, selected by first-wins merge, and kept at page time. Decision copy is the same generator’s Buy/Skip templates. Image failures are **media-association** (hardcoded/fallback maps), not missing files. Rendering itself is not the bug — the DOM faithfully prints garbage.

8. **Why did existing quality agents fail?**  
   They optimized for **presence, length, uniqueness n-grams, and image authenticity**. Concatenated stamps **raise** word count and **lower** peer Jaccard, so launch/uniqueness gates **reward** the garbage. Detectors never look for `skuslug` / `253weight…`. Site:audit samples **15** indexable reviews. Media:ci scores **authentic product heroes**, not “is this the right sport on this card.” Visual QA dumped token text into diagnostics and still passed layout.

9. **Is this safe to leave indexed while remediation happens?**  
   **No.** 333 indexed reviews and 332 indexed PDPs show machine identifiers in verdict, methodology, and sections. Brand hubs reprint the same dumps. This is publicly crawlable identifier leakage plus systematically unusable buying guidance.

10. **What should be fixed first?**  
    1. **Stop shipping uniqueness stamps on every public surface** (P54/P53 overlays; restore or replace with human copy; do not let first-wins bury handwritten reviews).  
    2. **Homepage / Best / hub image maps** — never pair running-watch copy with the padel `guide-how-to-choose.jpg`.  
    3. **Buy If / Skip If / Best For** templates from unique-expert-research.  
    Then add permanent **rendered-output** gates (token regex on SSR text, semantic image-subject checks, consumer decision-copy rubric) that cannot be satisfied by n-gram stuffing.

---

KNOWN LAUNCH DEBT (this clock, rendered):

| Band | Unique issues (rows) | Affected URLs |
|---|---:|---:|
| BLOCKER | 9,649 | 829 token-leak URLs + homepage/watch image mismatches |
| HIGH | 600 | 226 machine-copy URLs + reuse clusters + remaining image mismatches |
| MEDIUM | 0 in this register (reuse already raised HIGH) | — |
| LOW | 0 | — |

Repair queue (one row per placement):  
[`data/FULL-RENDERED-QUALITY-ISSUES.csv`](data/FULL-RENDERED-QUALITY-ISSUES.csv) — **10,249** OPEN rows  
Content quality: [`data/FULL-RENDERED-CONTENT-QUALITY.csv`](data/FULL-RENDERED-CONTENT-QUALITY.csv) — **18,628** rows  
Image inventory: [`data/FULL-IMAGE-CONTENT-MATCH.csv`](data/FULL-IMAGE-CONTENT-MATCH.csv) — **10,432** placements  
Production HTML crawl: [`data/FULL-PRODUCTION-HTML-CRAWL.csv`](data/FULL-PRODUCTION-HTML-CRAWL.csv)

---

## 1. Executive summary

Production is serving **internal uniqueness fingerprints as public editorial copy**.

The ASICS Novablast 6 review and PDP are not isolated. They are the visible instance of a generator that was bolted on to clear Fix 25 / Fix 37 / Fix 53 uniqueness gates. `uniqueTokenList()` builds strings such as `skuslug{slug}`, `{value}{field}{slug}`, and `{slug}{field}{value}`. `specDumpSentence()` then explains them in public methodology: “`{tok} is the concatenated {key} token for {name}`.” Those strings were written into:

- `src/content/reviews-p54-held-finalized.json` (390 reviews; **195 of them are in the live sitemap**)
- `src/content/reviews-p53-differentiation.json` (138 reviews; **136 in the sitemap**, 128 leaking tokens)

`reviews.ts` concatenates overlays **P54 first** and `dedupeReviewsBySlug` **keeps the first slug**. A later handwritten Novablast 6 review in the same file never ships. Production HTML for `/reviews/asics-novablast-6` and `/products/asics-novablast-6` contains the stamps, “already decided the lane is ‘tempo trainer’”, and “headline trait”.

Previous zero-debt reviews reported **0 blockers**, **591/591 reviews READY**, **631/631 authentic primary media**, and site:audit **READY**. Those statuses measured the wrong contract.

---

## 2. Blast radius

| Inventory | Count |
|---|---:|
| Production sitemap URLs scanned | 1,167 |
| HTTP 200 | 1,167 (after 3 retries) |
| Sitemap reviews | 373 |
| Sitemap products | 375 |
| Sitemap alternatives | 130 |
| Sitemap brands | 74 |
| Sitemap buying guides | 43 |
| Sitemap best guides | 46 |
| Sitemap comparisons | 66 |
| URLs with token leakage | **829** |
| URLs with machine decision templates | **226** |
| URLs with image mismatch/reuse issues | **142** |
| Unique URLs with ≥1 issue | **952** |
| Overlay review records with stamps | **515** |
| P62 genuine overlays (the only token-clean rewrite set) | **5** |

Indexable review overlay mix (production sitemap):

| Overlay | Sitemap reviews | Token leak | Notes |
|---|---:|---:|---|
| P54 held-finalized uniqueness tokens | 195 | **195** | Marketed as held estate; **all of these are indexed** |
| P53 indexable uniqueness tokens | 136 | 128 | Fix 53 “differentiation” overlay |
| Unique rewrite (Fix 37) | 26 | 9 | Machine Buy If still common |
| P62 genuine | 5 | 0 | Only set written to beat skuslug junk |
| Other/seed | 11 | 0 | Includes a few flagship seeds that actually win |

Public URLs outside this sitemap: not claimed clean. `/search` and other noindex surfaces were not in the sitemap and were not counted as indexable. The current working tree adds `/running/shoes/database` (uncommitted); it is **not** on production.

---

## 3. Issues by page type

| Page type | Sitemap | Token-leak URLs | Machine-copy URLs | Dominant failure |
|---|---:|---:|---:|---|
| Review | 373 | 333 | 113 | P54/P53 skuStamp in verdict, sections, How we assessed |
| Product PDP | 375 | 332 | 113 | Same overlay via `getProductReviewSummary` (raw review, not a second enrich) |
| Alternatives | 130 | 114 | 0* | Embedded review/product copy; alt builder even tries to **skip** sku-token verdicts |
| Brand hub | 74 | 49 | — | Review teasers reprint stamps |
| Author | 2 | 1 | — | `/authors/kitletics-editorial` reprints stamped review blurbs |
| Home | 1 | 0 (copy) | — | Featured running-watch card = **padel racket photo** |
| Best guides | 46 | 0 (copy) | — | Watch bests use `urban-dusk.jpg` (NYC skyline) + padel how-to-choose |
| Buying guides | 43 | 0 | — | Dedicated watch guide body photography is watch-correct; **cards/home are not** |
| Comparison | 66 | 0* | — | Product heroes generally authentic; related-card atmosphere leaks |

\*Machine-template regex on raw HTML is conservative; overlay field scan is the complete Buy If/Skip If register.

---

## 4. Issues by section/component

Largest public components, in order of damage:

| Component | Failure | Why it multiplies |
|---|---|---|
| Review verdict / summary / sections | skuStamp prepended to almost every block | `uniqueTopicBody` + `expandToMinWords` |
| How we assessed / testingContext | Full stamp + “concatenated {key} token for” | `testingContextCopy` + enrichTestingContext preserve |
| Buy If / whoShouldBuy | Lane / headline-trait / peer-optimize sentences | `buildWhoShouldBuy` |
| Skip If / whoShouldAvoid | Long taxonomy sentences; some broken “You need not a {weakness}” | `buildWhoShouldAvoid` + audience-signal expanders |
| PDP Review summary | Same fields as the review | `getProductReviewSummary` reads `page.review` **without** stripping stamps |
| Brand / author cards | Stamped review titles/snippets | Hub assemblers |
| Homepage featured guide | Padel racket on running-watch CTA | Hardcoded `GUIDE_IMAGES` |
| Best running-watch heroes | Skyline + padel how-to-choose | `resolve-best-guide-image` maps + DEDUPE_RESERVES |

---

## 5. Raw token leakage

**Confirmed on production HTML** (Novablast 6 review and PDP):

- `skuslugasicsnovablast6`
- `skuidprodnovablast6`
- `gen6asicsnovablast6`
- `253weightasicsnovablast6` / `asicsnovablast6weight253`
- `415heelstackasicsnovablast6` / `335forefootstack…` / `8drop…`
- `highcushionlevelasicsnovablast6` / `neutralstability…` / `rockeredridecharacter…`

**Generator (not Novablast-specific):**

```350:388:src/domain/review-agent/unique-expert-research.ts
function uniqueTokenList(product: Product): string[] {
  const slugTok = product.slug.replace(/[^a-z0-9]+/gi, "");
  const idTok = product.id.replace(/[^a-z0-9]+/gi, "");
  const tokens: string[] = [`skuslug${slugTok}`, `skuid${idTok}`];
  // ... generation, every spec pair as slug+key+value and value+key+slug ...
}
```

```232:236:src/domain/review-agent/unique-expert-research.ts
      return `${p.value} ${p.key} — ${tok} is the concatenated ${p.key} token for ${name} (${p.value}).`;
```

Fix 53 documentation **required** “full spec dump (`value+key` compact tokens)” so category-peer Jaccard would fall. That is why the garbage exists: **it was the uniqueness patch.**

Lineage:

```
unique-expert-research.ts
  → scripts/tmp/prelaunch-37-unique-rewrite.ts
  → scripts/tmp/prelaunch-53-indexable-diff.ts
  → scripts/tmp/prelaunch-54-* held estate
  → reviews-p53-differentiation.json / reviews-p54-held-finalized.json
  → reviews.ts first-wins merge
  → getReviewBySlug
  → enrichReviewForPage (preserves methodology dump; does not strip stamps)
  → Review page DOM
  → getProductReviewSummary (raw overlay) → PDP DOM
  → brand/author teasers
```

`src/lib/product/alternative-decision-copy.ts` already contains `/skuslug|skuidprod|heelstack/` as a **skip** when building alt copy — proof the tokens were known internally and still left on review/PDP surfaces.

---

## 6. Editorial readability

Rendered review bodies from P54/P53 are not buying guides. They are:

- identifier soup,
- catalog strengths glued to “gates {Product}”,
- “How we assessed it: {Name} as a {intendedJob}.” plus stamp,
- use-case IDs dumped as “tags on {Product}”.

Word count **passes because of the stamps**. Launch quality requires `wc >= 600` and a non-empty `testingContext`. Both are satisfied by the dump.

Flagship handwritten seeds that lose the merge (Novablast 6 in `reviews.ts`) are **dead code**. Visitors never see them.

---

## 7. Best For / Not Ideal For / Buy If / Skip If quality

Diagnostic classes on overlay decision lines (Buy If / Skip If only):

| Class | Buy If | Skip If |
|---|---:|---:|
| GOOD (regex did not fire) | 1,414 | 1,952 |
| MACHINE_LIKE | 452 | 0* |
| WORDY | 260 | 174 |

\*Skip templates are a different phrase family (`Walk if…`, `One-tool-for-every-session`) — still poor consumer UX; many sit in WORDY.

**Observed production style (Novablast 6), matches the generator exactly:**

- “Novablast 6 fits buyers who already decided the lane is ‘tempo trainer’ and want soft energetic daily ride as the headline trait.”
- `buildWhoShouldBuy` line 2 variants: “Keep {name} over {peer} when … shows up more often in your plan than whatever {peer} optimizes for.”

PDP **Best For** chips also mix `product.strengths` (short catalog labels) with the same review `whoShouldBuy` block. Two surfaces, two voices, both weak; the review block is the one that leaks stamps and taxonomy.

This is not scannable consumer guidance. A GOOD bullet would be one reason, one use case, no lane/job-engine language.

---

## 8. Image / content mismatches

**Inspected files (not metadata):**

| File | Actual subject | Production use |
|---|---|---|
| `/images/home/guide-how-to-choose.jpg` | **Padel racket + yellow ball on a blue court** | Homepage featured **How to Choose a Running Watch**; 114 sitemap URLs |
| `/images/home/guide-tennis.jpg` | Tennis racket + tennis balls | Present on homepage (mixed-sport page; racket card may be legitimate) |
| `/images/brands/heroes/urban-dusk.jpg` | **NYC skyline** | Best running-watch family, `/running/watches`, several watch PDPs/alts — 92 URLs |
| `/images/home/guide-running-shoes.jpg` | Running shoes | Shoe guide cards — LIKELY_CORRECT for shoe topics |

**Homepage (production HTML):** the featured “HOW TO CHOOSE / How to Choose a Running Watch” card’s `<img>` `src` is `guide-how-to-choose.jpg`. That is a padel racket. This is the reported failure, confirmed.

**HEAD code that ships this:**

```text
GUIDE_IMAGES["how-to-choose-running-watch"] = "/images/home/guide-how-to-choose.jpg"
```

in committed `src/lib/home/get-homepage-data.ts`.

The dedicated `/guides/how-to-choose-running-watch` **article** body uses watch photography (Forerunner/COROS packshots). The **card** that sells the article on the homepage does not. Card vs article divergence is why “the guide looks fine” and “the homepage is wrong” can both be true.

**Open-ear vs in-ear headphones guide** (`/guides/open-ear-vs-in-ear-running-headphones`): concept art `open-ear-vs-inear.jpg` is on-topic, but the same page also renders **Petzl Swift RL headlamp**, **Feetures socks**, and **clothing.svg fallback**. Wrong content type on a headphones article.

**Best running-watch guides** render `urban-dusk.jpg` (skyline) and `guide-how-to-choose.jpg` (padel).

Working-tree diffs include a `resolveGuideImage` skip for `guide-tennis` / home-gym fillers and homepage tests that expect `/watches/products/` for the watch guide. **Those changes are not what production serves.** This audit scores production.

---

## 9. Image reuse / placeholders

| Asset | Distinct sitemap URLs | Problem |
|---|---:|---|
| `/images/brands/heroes/running-urban.jpg` | 235 | Atmosphere reused as if it were topic photography |
| `/images/home/guide-how-to-choose.jpg` | 114 | **Padel racket** used as generic “how to choose” |
| `/images/running/guides/daily-vs-long.jpg` | 98 | Shoe comparison crop reused off-topic (e.g. sunglasses best) |
| `/images/brands/heroes/urban-dusk.jpg` | 92 | Skyline on watch/safety surfaces |
| `/images/running/reviews/review-research-assessment.jpg` | 84 | Shared “research” still |
| Novablast 6 / Ghost 18 heroes | 70–80 | Authentic **product** photos reused as sitewide fillers — authenticity yes, uniqueness/topic no |

`media:ci` can still report **631/631 authentic primary** because product PDPs have licensed packshots. Editorial cards are a different association graph.

---

## 10. Product ↔ Review consistency

For Novablast 6 (and the 323 products whose overlay slug is also a sitemap PDP):

| Surface | Source field | Public failure |
|---|---|---|
| Review verdict | P54 `review.verdict` | skuStamp |
| PDP verdict | **same** `page.review.verdict` | skuStamp |
| Review How we assessed | P54 `testingContext` | stamp + concatenated-token sentences |
| PDP methodology | same | same |
| Review Buy If | P54 `whoShouldBuy` | lane/headline-trait |
| PDP Best For (review block) | same `whoShouldBuy` | same |
| PDP Best For chips | `product.strengths` + recommendation labels | short catalog labels, different voice |
| Handwritten `reviews.ts` Novablast | never selected | first-wins P54 |

This is not two independent bugs. **One malformed overlay feeds every component.**

`getProductReviewSummary` does not call `enrichReviewForPage`. Even if enrichment later stripped stamps (it does not), the PDP would still show overlay JSON.

---

## 11. Root causes

1. **Uniqueness-as-quality.** Fix 37/50/53 treated low Jaccard after name-scrub as the launch bar. The synthesizer injected unique n-grams (sku stamps, value+key concatenations) so peer similarity collapsed. Fix 53’s own write-up says compact spec tokens must dominate the token set.

2. **Held-estate overlays were indexed.** P54 is labeled held-finalized. **195 P54 slugs are in the production sitemap.** 195/195 leak tokens.

3. **First-wins merge.** `dedupeReviewsBySlug` comment: “Prefer first occurrence (unique rewrites are listed first).” P54 is listed before handwritten reviews. Clean copy in `reviews.ts` is unreachable.

4. **Page-time preservation.** `enrichTestingContext` keeps Expert Research dumps ≥40 words. `isReportOrJunkVoice` does not match `skuslug`. Token-stuffed sections are not classified as jargon seeds.

5. **Launch assessor scores the wrong things.** `assessReviewLaunchQuality` requires verdict ≥20 words, ≥2 Buy/Skip lines, `testingContext` present, `wc >= 600`. Stamps inflate all of that. No identifier detector.

6. **Image maps are filenames, not subjects.** `guide-how-to-choose.jpg` is a padel racket. Homepage hardcodes it onto a running-watch card. `media:ci` never opens the pixels.

7. **Known and locally fenced, not removed.** Alternatives copy skips sku-token verdicts. Fix 62 replaced **five** Running SKUs and documented “P54 `skuslug` junk”. The rest of the catalog was left live.

---

## 12. Why previous audits missed this

| Audit / status | What it actually scored | Why Novablast-class pages passed |
|---|---|---|
| Zero-debt V3 / RC | Eligibility + assessor READY counts | 591 READY = field presence after enrichment, not rendered semantics |
| `assessReviewLaunchQuality` | Enriched page, but length/presence/methodology flag | Stamps make methodology + word count |
| `assessReviewArticle` | Decision copy vs junk-voice regex; P0 ≡ BLOCKER on that regex | Regex has no `skuslug` / concatenations; methodology excluded via quality-contract |
| `canPublishReview` | `containsInternalTerminology` | Patterns are “prompt”, “catalog pass”, “P0”, not identifier dumps |
| Uniqueness classifier | Token/3-gram Jaccard + `uniqueSignalRatio` | Stamps are unique per SKU **and** digit-heavy, so they **help** GENUINELY_UNIQUE |
| site:audit content | **First 15 indexable** enriched reviews; INTERNAL_LEAK = Prompt/LLM/staging | Sample too small; regex too narrow; CONTENT-002-SOURCE downgraded to LOW |
| Quality contract (Fix 85) | Source-seed residue is LOW if enriched decision copy is “clean” | Stamps **are** the enriched decision copy (verdict/sections), mislabeled as hygiene |
| `media:ci` | Authentic primary product heroes | 631/631 packshots can be real while homepage watch card is a racket |
| Visual QA 24/71 | Overflow, headings, screenshots | Diagnostics **contain** skuStamp strings; issues filed as layout polish |
| Guide quality | `hasMedia = hubImageSrc \|\| heroImageSrc` | Existence, not subject |
| Homepage tests (HEAD) | Did not require watch photography for the featured card | Local uncommitted tests started to; production still hardcoded |

Explicit policy that created the blind spot (`quality-contract.ts`): source-seed hygiene is “not a user-facing P0 when the enriched page is clean.” Here the **enriched page is the seed dump.**

---

## 13. Quality-agent coverage gaps

| System | Input | Sees rendered DOM? | Sample | Missing check |
|---|---|---|---|---|
| Review launch assessor | `enrichReviewForPage` object | Partial (in-memory, not HTML) | All reviews | Identifier leak, decision-copy consumer rubric, image subject |
| Article auditor | Enriched review via `getReviewPageData` | Page-data, not HTML | CLI; site:audit uses 15 | Token regex; Buy If style; “concatenated token” methodology |
| site:audit content | Mix of source + 15 enriched | No | 15 | Full-site rendered text |
| Uniqueness | Overlay/source text, names scrubbed | No | Category peers | Punishes shared glue; **rewards** unique garbage tokens |
| media:ci / catalog media audit | Product primary `src` + licence | No pixels/subject | Published catalog | Editorial cards, hub maps, homepage featured |
| Guide assessor | Guide fields + long-form config | No | All guides | Subject of hero vs title |
| Visual QA | Screenshots + text dump | Yes, but layout-centric | ~dozens of templates | No fail on skuStamp or wrong-sport pairing |
| Alternative copy | Pair text | No | Alts | Knows to skip skuStamp locally; does not fail the originating review |

**IMAGE AUTHENTICITY** (licensed packshot of some product) is not **IMAGE SEMANTIC CORRECTNESS** (this image is the subject of this card). Agents measured the first.

---

## 14. Complete repair queue

Machine-readable, one placement per row, status **OPEN**:

- [`docs/prelaunch/data/FULL-RENDERED-QUALITY-ISSUES.csv`](data/FULL-RENDERED-QUALITY-ISSUES.csv) — 10,249 rows  
- [`docs/prelaunch/data/FULL-RENDERED-CONTENT-QUALITY.csv`](data/FULL-RENDERED-CONTENT-QUALITY.csv) — 18,628 rows  
- [`docs/prelaunch/data/FULL-IMAGE-CONTENT-MATCH.csv`](data/FULL-IMAGE-CONTENT-MATCH.csv) — 10,432 placements  

Do not collapse 829 token URLs into “one issue type.”

Priority buckets:

1. **P54 indexable reviews (195)** — every sitemap URL in this overlay is BLOCKER token leak.  
2. **P53 indexable reviews (128 leaking of 136)** — same generator, uniqueness “fix”.  
3. **Matching PDPs and alternatives** — same source, second and third public surfaces.  
4. **Brand/author teasers** — 49 brand URLs.  
5. **Homepage featured running watch → padel file**; Best watch guides → skyline/padel.  
6. **Buy If / Skip If templates** on the 226 HTML-positive URLs (and 572 overlay reviews).

---

## 15. Recommended remediation architecture

(No implementation in this audit.)

- **Single public review object** after merge, with an explicit overlay precedence that **cannot** hide handwritten copy behind uniqueness JSON.  
- **Strip layer** before any page-data: reject `skuslug`, `skuid`, `{n}{field}{slug}`, “concatenated … token”. Fail build if any indexable page still matches.  
- **Decision copy** stored as short bullets; ban intendedJob/lane/headline-trait templates.  
- **Image resolver** that binds `{page intent, sport, entity}` → subject, and fails if the file is a known cross-sport filler (`guide-how-to-choose.jpg` = padel).  
- Hub cards must use the **same** resolver as the article, or they will drift again.

---

## 16. Recommended new permanent quality gates

These must run on **SSR/production-like HTML or page-data text**, every indexable URL, CI blocking:

1. **Token leak:** `skuslug`, `skuidprod`, `\d+(weight|heelstack|forefootstack|drop)`, “concatenated {field} token”, `[object Object]`, `undefined` in visible text.  
2. **Decision-copy rubric:** Best For / Buy If / Skip If classified GOOD vs MACHINE_LIKE/WORDY; fail indexable pages below a consumer bar (one reason, scannable, no taxonomy).  
3. **Cross-surface equality:** PDP review block vs review page cannot both ship stamps; also flag exact duplicate machine sentences across those surfaces.  
4. **Semantic image gate:** featured/hub/best card `src` subject vs page sport/title (file denylist for padel-as-generic; watch pages cannot use `guide-how-to-choose.jpg` or `urban-dusk.jpg` as the hero).  
5. **Reuse×sport matrix:** same `src` on N unrelated titles/sports → HIGH.  
6. **No 15-page sample** for P0 content. Full sitemap.  
7. **Uniqueness classifier must not accept identifier stamps as unique signal.** `uniqueSignalRatio` currently treats digits and names like `novablast`/`stack` as positive signal.

---

## 17. Re-audit plan

After remediation (separate workstream):

1. Production-like `next build && next start` (or live) crawl of **every sitemap URL**.  
2. Zero matches for token regex in visible text.  
3. Zero homepage/hub pairings of running-watch copy with padel/tennis/skyline heroes.  
4. Buy If / Skip If sample **and** full-set classification — no lane/headline-trait templates.  
5. Overlay map: zero P54/P53 uniqueness JSON winning on indexable slugs unless independently rewritten.  
6. Confirm handwritten reviews that exist in `reviews.ts` actually win the merge.  
7. Re-run site:audit / article auditor / media:ci **plus** the new rendered gates. Do not declare READY from the old trio alone.

---

## Method (this clock)

- Production `https://kitletics.com/sitemap.xml` — **1,167** `<loc>`s.  
- Concurrent HTML crawl of every loc; visible text + `/images/` paths.  
- Overlay JSON merge simulation matching `reviews.ts` first-wins; per-field detectors on winning objects.  
- Pixel inspection of `guide-how-to-choose.jpg` (padel), `guide-tennis.jpg` (tennis), `urban-dusk.jpg` (skyline), `guide-running-shoes.jpg` (shoes).  
- Code lineage: `unique-expert-research.ts`, `reviews.ts`, `enrich-review-content.ts`, `get-product-review-summary.ts`, HEAD `get-homepage-data.ts`, assessors, uniqueness, media:ci, site:audit sample of 15.  
- No content, code, data, image, threshold, or publish-state changes.

STOP. No remediation in this workstream.
