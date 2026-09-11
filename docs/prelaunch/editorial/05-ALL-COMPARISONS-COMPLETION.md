# All Comparisons Completion — Editorial 41

**Document ID:** `05-ALL-COMPARISONS-COMPLETION`  
**Generated:** 2026-09-09  
**Scope:** Full Comparison estate (decision quality + uniqueness + broken peers)  
**Data:** `docs/prelaunch/editorial/data/41-comparisons-completion.json`

## Executive status

| Metric | Before (RC) | After |
|---|---|---|
| Comparison records | 102 | **102** |
| Production-published | 102 (incl. broken peers) | **94** |
| Structurally `MEANINGFUL` (published) | 102 | **94 / 94** |
| Uniqueness `NEEDS_DIFFERENTIATION` | **7** | **0** |
| Uniqueness `DUPLICATIVE` | 0 | **0** |
| Broken peer holds (draft / noindex) | — | **8** |
| Broken still published | 4+ sitemap 404s | **0** |
| Duplicate canonical pairs | — | **0** |

**Targets:** 0 NEEDS_DIFF · 0 DUPLICATIVE · broken peers held without fake Products — **met.**

Day-1 indexation remains vertical-gated (`indexableEligibility` ≈ 51 of 94 published under current launch policy).

## Baseline problems

1. **Broken Product peers** — Several comparisons referenced draft Products. With `isDev: true` they resolved; production sitemap eligibility returned `HIDDEN_404` (RC called out 4 routes; estate audit found **8** draft-peer pairs).
2. **NEEDS_DIFF (7)** — Padel / tennis / rower pairs shared depth-enrichment “same buying lane” scaffolding → peer similarity ≥ 0.72 after entity scrub.
3. **Decision quality** — Those seven lacked pair-specific Choose A / Choose B / Choose neither logic and category-native criteria.

## What changed

### 1. Broken peer holds (no fake Products)

Module: `src/content/comparisons-p41-completion.ts`  
Wired after depth enrichment in `src/content/editorial.ts`.

Held to `status: "draft"` + `noindex: true`:

| Slug | Issue |
|---|---|
| `lululemon-hotty-hot-vs-janji-pace-short` | Draft peer |
| `brooks-dare-crossback-vs-lululemon-energy-bra` | Draft peers |
| `jabra-elite-8-active-vs-beats-powerbeats-pro-2` | Draft peers |
| `knog-frog-v3-vs-nite-ize-radiant-clip` | Draft peers |
| `theragun-prime-vs-renpho-r3` | Draft peer |
| `triggerpoint-grid-vs-grid-x` | Draft peer |
| `triggerpoint-grid-vs-rumbleroller` | Draft peers |
| `oofos-ooriginal-vs-hoka-ora-recovery-slide` | Draft peer |

Re-publish only after both Products are production-published and the comparison is re-audited.

### 2. NEEDS_DIFF → pair-specific decision copy

Rewrote all seven former NEEDS_DIFF pages with:

- Biggest difference  
- Where A / B win  
- Who should choose A / B  
- Main trade-offs  
- Spec / variant caveats (generation, Clash v2 vs v3, Concept2 damper ≠ magnetic levels)  
- Use-case recommendations  
- Value difference  
- **Choose neither if…** (explicit alternative lane)

| Slug | Category factors (examples) |
|---|---|
| `concept2-rowerg-vs-mirafit-magnetic-rower` | Metrics · noise · HYROX familiarity · value · footprint |
| `concept2-rowerg-vs-hydrow-wave` | Open scores · quiet · coaching subscription · ownership |
| `nox-at10-…-vs-bullpadel-vertex-04-…` | Shape · hybrid · finishing · defence |
| `nox-at10-…-vs-babolat-technical-viper-…` | Hybrid · explosive · stiffness · forgiveness |
| `babolat-technical-viper-…-vs-wilson-bela-pro-…` | Explosive vs Wilson attacking feel |
| `babolat-pure-drive-2025-vs-wilson-clash-100-v2` | Power · comfort flex · generation note |
| `yonex-ezone-100-2025-vs-wilson-clash-100-v3` | Forgiveness · power · Clash **v3** generation |

Post-rewrite peer similarity on these pairs: **0.23–0.38** (all `GENUINELY_UNIQUE`).

### 3. Canonical pair URLs

Unchanged infrastructure (verified):

- `canonicalProductPairKey` / `reverseComparisonSlug` in `src/lib/comparison/engine.ts`
- Reverse slug → permanent redirect + canonical alternate in `src/app/compare/[slug]/page.tsx`
- Audit: **0** duplicate published pair keys

### 4. Category-specific criteria

P41 patches replace generic role/value/tradeoff tables on the seven racket / padel / fitness pairs. Remaining published comparisons keep category seeds + depth enrichment where already MEANINGFUL; uniqueness pool is **73 GENUINELY_UNIQUE · 21 TEMPLATE_SIMILAR_ACCEPTABLE · 0 NEEDS_DIFF · 0 DUPLICATIVE**.

## Verification

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-41-comparisons-verify.ts
```

Uses the same uniqueness classifiers as Fix 25 (`classifyUniqueness` / scrubbed `textSimilarity`) scoped to published comparisons.

## Definition of done

- [x] Broken peers held — no invented Products  
- [x] 0 NEEDS_DIFF  
- [x] 0 DUPLICATIVE  
- [x] Pair-specific decision verdicts on former template pairs (Choose A / B / neither)  
- [x] Category-native criteria on those pairs  
- [x] Variant / generation / spec-comparability warnings where relevant  
- [x] One canonical URL per pair (no duplicate published reverse records)  
- [x] Report + machine data written  

## Out of scope / follow-ups

- Publishing the 8 held comparisons once draft Products ship  
- Expanding indexable Day-1 set beyond vertical policy holds (separate launch gate)  
- Optional: deepen remaining `TEMPLATE_SIMILAR_ACCEPTABLE` running pairs further (acceptable under uniqueness thresholds)
