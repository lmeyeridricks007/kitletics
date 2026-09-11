# Fix 57 — Comparisons & Alternatives final validation

**Mode:** Validation after Review / editorial remediations (Fixes 50–56), plus uniqueness + broken-ref repair  
**Date:** 2026-09-10  
**Evidence:** `docs/prelaunch/data/57-cmp-alt-validation.json` · `scripts/tmp/prelaunch-57-cmp-alt.ts`  
**Gates unchanged:** `assessComparisonLaunchQuality`, `canPublishAlternativesPage`, `ALTERNATIVES_INDEXABLE_CATEGORIES`, vertical launch policy

Editorial READY ≠ indexability. Vertical launch strategy was **not** edited.

---

## 1. Result (matches V2 counts)

| Surface | Total | Editorial READY | INDEXABLE |
|---|---:|---:|---:|
| Comparisons | **94** | **94** | **65** |
| Alternatives | **248** READY pages | **248** | **92** |

| Check | Target | After |
|---|---|---|
| Comparison uniqueness DUPLICATIVE | 0 | **0** |
| Comparison uniqueness NEEDS_DIFF | 0 | **0** |
| Alternatives uniqueness (indexable) DUPLICATIVE | 0 | **0** |
| Alternatives uniqueness (indexable) NEEDS_DIFF | 0 | **0** |
| Reverse duplicate comparison slugs | 0 | **0** |
| Canonical pair duplicates | 0 | **0** |
| Live missing comparison peers | 0 | **0** |
| Broken alternative targets | 0 | **0** |
| Sitemap 404s (indexable compare / alternatives) | 0 | **0** |
| Generic “same buying lane” verdicts | 0 | **0** |
| Sync-template alt reasons | 0 | **0** |

Uniqueness classes (name-scrubbed Jaccard, same thresholds as Fix 41/42):

| Surface | GENUINELY_UNIQUE | TEMPLATE_SIMILAR_ACCEPTABLE | NEEDS_DIFF | DUPLICATIVE |
|---|---:|---:|---:|---:|
| Comparisons (94 READY) | 83 | 11 | **0** | **0** |
| Alternatives (92 INDEXABLE) | 11 | 81 | **0** | **0** |

Highest remaining indexable alternatives similarity: **0.709** (`garmin-forerunner-570` ↔ `coros-pace-pro`) — TEMPLATE_SIMILAR_ACCEPTABLE, under the 0.72 NEEDS_DIFF line.

---

## 2. Comparisons

### 2.1 Product refs

Both `productIds` resolve to published products on every READY comparison. `getComparisonPageData` builds for all 65 INDEXABLE URLs.

Eight pairs remain **correctly held** as draft / `noindex` (`COMPARISON_BROKEN_PEER_SLUGS`) because at least one peer is still unpublished (media gate / draft). **0 lift candidates.** They are not in the published 94.

### 2.2 Pair-specific reasoning

Official editorial gate (`assessComparisonEditorialReadiness` relationships + quality): **94/94 READY**. Every page names a product in summary/verdict **or** has ≥40 characters of pair copy, plus MEANINGFUL quality.

A stricter named-token + diffs heuristic flagged **11** slugs (generation pairs, clothing, nutrition, one padel pair) whose bodies use short aliases (“Vaporfly” / “970”) rather than the catalog `name` string. They still have pair-specific jobs (premium vs accessible racer, current vs previous Forerunner, etc.). Not a READY failure.

### 2.3 Reverse duplicates / generic verdicts / variant context

- **0** reverse-slug conflicts (`a-vs-b` and `b-vs-a` as two published records).
- **0** duplicate canonical pair keys.
- Generic enrichment phrase “same buying lane” **removed** from `comparison-depth-enrichment.ts`. Unique P41 patches added for Novablast vs Ghost (INDEXABLE) and the eight gym/padel/air-bike pairs that had collapsed after name scrub.
- Generation/variant context called out where it matters (CXT-1 vs CXT-2, Ghost 16 as previous-gen, Clash v3 vs v2, Forerunner 970 vs 965).

### 2.4 Internal links

Indexable comparison pages resolve both product slugs. **0** sitemap `/compare/…` URLs without page data.

---

## 3. Alternatives

### 3.1 Switch reasons / strengths / weaknesses

Indexable pages: **92/92** have decision-shaped cards (why / better / worse / switch / stay). **0** generic-repeat copy. Sync template “same-category alternative when you want a peer”: **0** hits.

Copy pulls source + peer strengths, weaknesses, use cases, and spec fingerprints (drop, stack, midsole, display, battery, sensor type). Unique intros on colliding clusters (daily / stability / trail / carbon / GPS / HRM / mountain watches) so pages do not collapse after name scrub.

### 3.2 Source context / related products

Source product is published on every READY alternatives page. Ranked alternatives skip unpublished targets. **0** unresolved alternative-type edges on published sources.

### 3.3 Broken refs repaired (not invented SKUs)

Three approved alternative edges pointed at **media-gated drafts**. Retargeted to published peers with a real switch job:

| Source | Was (draft) | Now (published) | Why the switch is real |
|---|---|---|---|
| `camelbak-crux-15` | `prod-hydrapak-shape-shift-15` | `prod-hydrapak-softflask-speed-500` | Back bladder → front SoftFlask Speed |
| `beats-fit-pro` | `prod-beats-powerbeats-pro-2` | `prod-shokz-openrun-pro-2` | Sealed fin-fit TWS vs open bone-conduction |
| `soundcore-sport-x20` | `prod-jabra-elite-8-active` | `prod-airpods-pro-2` | Value sport ANC vs Apple Pro ANC |

Did **not** publish Jabra Elite 8 Active, Powerbeats Pro 2, or Shape-Shift 1.5L to paper over the graph.

---

## 4. What changed after Review uniqueness tokens

Indexable alternatives uniqueness had drifted from Fix 42’s **0 NEEDS_DIFF** (then 43 indexable) to **29 NEEDS_DIFF** among **92** indexable pages. Same 3-frame generator + shared intro closer (“Each card says why…”) collapsed after name scrub, especially HRM armbands, carbon racers, and daily/trail pairs.

Fixes (no gate changes):

1. Unique job intros: `src/content/alternatives-p57-uniqueness.ts`
2. Spec fingerprints + more frame variants: `src/lib/product/alternative-decision-copy.ts` (skip SKU-token `product.verdict` if present)
3. Comparison uniqueness overlays: `src/content/comparisons-p41-completion.ts`
4. Enrichment template no longer says “same buying lane”

---

## 5. Broken comparison holds (unchanged — still valid)

| Slug | Why still held |
|---|---|
| `lululemon-hotty-hot-vs-janji-pace-short` | Hotty Hot draft |
| `brooks-dare-crossback-vs-lululemon-energy-bra` | both draft |
| `jabra-elite-8-active-vs-beats-powerbeats-pro-2` | both draft |
| `knog-frog-v3-vs-nite-ize-radiant-clip` | both draft |
| `theragun-prime-vs-renpho-r3` | Renpho R3 draft |
| `triggerpoint-grid-vs-grid-x` | GRID draft |
| `triggerpoint-grid-vs-rumbleroller` | both draft |
| `oofos-ooriginal-vs-hoka-ora-recovery-slide` | Ora slide draft |

---

## 6. Sitemap

Sitemap emits only INDEXABLE compare and alternatives URLs. Every such URL builds page data:

- `/compare/{slug}` — 65/65
- `/products/{slug}/alternatives` — 92/92

HTTP crawl of production was **not** re-run here (same probe gap as V2). This check is resolver/page-data alignment, not live status codes.

---

## 7. Files

| Path | Role |
|---|---|
| `src/content/alternatives-p57-uniqueness.ts` | Unique alternatives intros |
| `src/lib/product/alternative-decision-copy.ts` | Spec-aware decision copy + overlay intros |
| `src/content/comparisons-p41-completion.ts` | Pair-unique comparison patches |
| `src/content/running/comparison-depth-enrichment.ts` | Drop generic “same buying lane” |
| `src/content/running/relationships.ts` | Headphone peer retargets |
| `src/content/running/hydration-recommendations.ts` | Crux → SoftFlask Speed |
| `scripts/tmp/prelaunch-57-cmp-alt.ts` | Validator |
| `docs/prelaunch/data/57-cmp-alt-validation.json` | Machine evidence |

---

## 8. Verdict

**Comparisons: 94 READY / 65 INDEXABLE — uniqueness and refs pass.**  
**Alternatives: 248 READY / 92 INDEXABLE — uniqueness and refs pass.**

Do not treat this as a full-site GO. CI / sitemap HTTP / review NEEDS_DIFF remain separate V2 items. This fix only certifies the comparison and alternatives estate against the checks above.
