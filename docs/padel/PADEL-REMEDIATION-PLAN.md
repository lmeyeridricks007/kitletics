# Padel remediation plan

**As of:** 2026-09-13  
**Input:** [`PADEL-PRELAUNCH-AUDIT.md`](./PADEL-PRELAUNCH-AUDIT.md) + confirmed OPEN rows in [`data/PADEL-PRELAUNCH-ISSUES.csv`](./data/PADEL-PRELAUNCH-ISSUES.csv)  
**Goal:** Drive confirmed BLOCKER/HIGH → 0 without expanding catalog/editorial estate.  
**Verdict target:** GO only when required zeros are actually zero.

---

## Issue register → root-cause families

| Family | Confirmed rows (approx) | Primary sources | Fix strategy |
| --- | ---: | --- | --- |
| **GUIDE_INTERNAL_ID_COPY** | 20 MACHINE_LIKE + most TOKEN `spec_stamp` on guides | `src/lib/guides/explainers/padel-knowledge-unique.ts` (`whyIllustrates` + `maps to prod-…`); UI prefix in `GuideExplainerBlocks.tsx` | Rewrite every public `whyIllustrates` to shopper English; change UI label; never print `prod-*` |
| **WRONG_SPORT_MEDIA** | 52 running + 1 tennis + hub fitness HIGH | Guide explainer visual enrichment falling back to FlipBelt / running concept art; `guide-tennis.jpg` on one review | Padel-only image resolver paths; replace filler with `/images/padel/**`; gate semantic classifier |
| **WRONG_PRODUCT_MEDIA** | 4 | Nox Alum XTREM → `nox-at10-12k-2026-hero.png`; Wilson overgrip → `/images/fitness/…` | Correct media registry entries + unique heroes |
| **WRONG_MEDIA_NAMESPACE** | hub/shoes cards | Padel shoe/overgrip heroes registered under `/images/fitness/` | Re-register under `/images/padel/…` (copy/symlink + registry update) |
| **RAW_SCHEMA_LABEL** | weightMin (DB + research title), widthOptions (Best shoes), public-label gaps | `public-label.ts`, DB page chrome, `padel-research/stories.ts`, Best shoes prose | Extend canonical formatter; ban raw keys in public strings |
| **PUBLIC_SKU_WORDING** | Vertex + Siux + scattered padel content | Product/review/alternatives seed copy | Replace public `SKU` with model/variant/version |
| **BROKEN_DECISION_FRAGMENT** | 4 | Alternatives / PDP generators emitting truncated SKU sentences + `(manufacturer claim)` | Shared sanitizer + source rewrite; omit when insufficient |
| **SEO_INDEXABILITY** | hub noindex vs deep index; research JSON-LD HIGH; soft-gated 404 HIGH | Vertical eligibility for sport/category/database/research; sitemap | Prefer: index hub + live categories + DB + quality research; keep accessories/clothing held/unlinked |
| **PERFORMANCE** | hub hero ~2MB PNG-as-jpg | `public/images/padel/hero.jpg` | Re-encode optimized JPEG/WebP; keep visual quality |
| **ACCESSIBILITY** | empty alts on hub | Sport hub image cards | Meaningful alts for product/guide images; empty only if decorative |
| **TEST_EXPECTATION** | CI failures | `launch-eligibility`, `racket` search still expect padel held | Update to selective-enabled padel; leave other rackets held |
| **PREEXISTING_COMMERCE** | commerce test fails | Unrelated NL/offer suite | Classify + fix or reconcile to 100% pass |

Soft-gated `/padel/accessories` + `/clothing` **404 is acceptable** if unlinked and out of sitemap (reclassify HTTP HIGH → intentional hold, not a defect).

---

## Execution order

1. Guide copy + UI label (largest BLOCKER cluster)  
2. Public labels + SKU + broken decision (shared formatters)  
3. Media mapping / namespace / semantic gate  
4. Indexability + sitemap  
5. Hero encode + alts  
6. Tests + CI  
7. Full rendered re-crawl → final audit

---

## Non-goals

- No new Best Guides / reviews / products  
- No tennis/pickleball enablement  
- No padel-specific commerce pricing forks  
- No full database redesign  

---

## Definition of done

- Confirmed BLOCKER = 0, HIGH = 0 (intentional soft-gate holds excluded)  
- Required-zero table all zero  
- lint / typecheck / test / build PASS  
- [`PADEL-FINAL-REMEDIATION-AUDIT.md`](./PADEL-FINAL-REMEDIATION-AUDIT.md) with before→after and **GO**
