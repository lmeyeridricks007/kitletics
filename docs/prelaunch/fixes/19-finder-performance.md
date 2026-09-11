# Fix 19 — Finder client bundle optimization

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Priority:** HIGH  
**Lab:** `http://127.0.0.1:3011` (production `next start` after fresh build)  
**Reference:** [`../07-performance-technical.md`](../07-performance-technical.md)

## Objective

Cut `/tools/[slug]` Finder First Load (~851–888 kB build / ~866 kB lab JS) toward **&lt;300 kB** route-related JS **without** UX redesign, SEO changes, or deferring mandatory Finder JS into post-load fetches.

---

## 1. Bundle analysis (STATIC + MEASURED)

### Root cause

Public Finder URLs lived on the shared App Router leaf **`/tools/[slug]`**, which also mounted:

| Client island | Heavy dependency |
|---|---|
| `HomeGymBuilderClient` | `fitnessProducts` + `offers` seed (~3.5k `prod-` ids in prior page chunk) |
| Hyrox kit / race tools | Builder domain + product lists |
| Pace / race / strength calculators | Calculator clients |
| Shoe rotation planner | Rotation client |

Next statically joins **all** `await import()` / client targets under one route into **one page client graph**. Splitting render helpers alone did **not** isolate Finder: lab still downloaded the same ~871 kB `page-*.js` for Finder and Home Gym.

### Finder-specific graph (intended)

| Layer | What the browser needs | Was shipping |
|---|---|---|
| Question flow UI | `FinderFlow` + step/progress/question cards | Yes (+ everything else) |
| Current Finder definition | One `FinderDefinition` via RSC props | Server had all 16; client got one — but UI map imported all configs |
| Scoring / catalog | Server action `previewFinderMatches` + results RSC | Engine already server-side |
| Home Gym catalog | **Nothing** on Finder | **Full fitness + offers in shared page chunk** |
| Charts / compare engine | Not on Finder entry | N/A |

No chart libraries on Finder entry. Recommendation scoring already ran via `"use server"` (`preview-action.ts` → `getFinderResultsData`).

---

## 2. Server boundary

| Concern | Change |
|---|---|
| Product catalog | **Not** imported into Finder client modules |
| Preview matches | Slim DTOs from `previewFinderMatches` (id, slug, name, score, image, href) |
| Results page | Remains server-rendered data + `noindex` |
| Home Gym | `products` / `offers` passed as **server props** into `HomeGymBuilderClient` (no client `@/content/fitness` / `@/content/offers` import) |

Browser no longer embeds the fitness seed in the Finder JS graph.

---

## 3. Finder config

| Before | After |
|---|---|
| Client called `getFinderUiConfig(slug)` → entire `FINDER_UI_BY_SLUG` | Server resolves **one** `uiConfig`; passed as prop |
| `resolveFinderSteps` fell back to full UI map | Requires explicit `ui` (type-only import of config module on client) |
| Public URL `/tools/<finder-slug>` | Unchanged; **middleware rewrite** → `/tools/finder/<slug>` |

All 16 definitions still register on the **server** repository (needed for lookup). Only the **current** definition + UI config are serialized into the Finder page payload.

---

## 4. Recommendation engine

| Work | Where |
|---|---|
| Visibility / progress / answers | Client (`normalization.getVisibleQuestions`, step state) |
| Match preview + explainability fields | **Server** `previewFinderMatches` |
| Full ranked results + explanations | **Server** `/tools/[slug]/results` |

No change to explainability contract; scoring stays server-side.

---

## 5. Dynamic imports / route split

1. **`src/middleware.ts`** — rewrite Finder slugs to `/tools/finder/[slug]` (URL bar stays `/tools/...`).
2. **`src/app/tools/finder/[slug]/page.tsx`** — Finder-only leaf (no Home Gym / Hyrox / calculator clients).
3. **`src/app/tools/[slug]/page.tsx`** — non-Finder tools only (`notFound` if a Finder slug hits this leaf).
4. **`RoomPlannerCanvas`** — `next/dynamic` (`ssr: false`) on Home Gym (result-step cost, not Finder).

---

## 6. Results / SEO

| Check | Result |
|---|---|
| Canonical Finder URLs | Still `/tools/<slug>` |
| Results robots | **`noindex, follow`** (lab meta on `/tools/running-shoe-finder/results`) |
| Indexation behavior | Unchanged by design |

---

## 7. UX preserved

Smoke on production lab (`/tools/running-shoe-finder`):

- Headline / question flow / Next / Back controls present  
- Preview path still uses server action  
- Results route + share query unchanged  
- No visual redesign  

---

## 8. Measured results

### Next.js build First Load (MEASURED)

| Route | Size | First Load JS | Prior (`/tools/[slug]`) |
|---|---:|---:|---:|
| `/tools/finder/[slug]` | **7.45 kB** | **130 kB** | **~851–888 kB** |
| `/tools/[slug]` (builders/calcs) | 42.7 kB | 166 kB | same mega leaf |
| `/tools/[slug]/results` | 1.75 kB | 125 kB | ~127 kB |
| Shared by all | — | **103 kB** | 103 kB |

Route-specific Finder JS **7.45 kB** ≪ 300 kB target. First Load **130 kB** includes shared framework/layout.

### Lab Playwright (`/tools/running-shoe-finder`, uncompressed vs transfer)

| Metric | Before (audit 07 / prior lab) | After |
|---|---:|---:|
| JS decoded body sum | **~866 kB** | **~534 kB** |
| JS `transferSize` (gzip) | ~(aligned with heavy page) | **~164 kB** |
| Finder `page-*.js` | ~871 kB shared mega | **~24 kB** (`…/tools/finder/[slug]/page-*.js`) |
| `prod-` hits in Finder page chunk | thousands (via Home Gym) | **0** |

Public URL correctly served Finder leaf (chunk path includes `tools/finder/[slug]`).

---

## 9. Files touched

| File | Role |
|---|---|
| `src/middleware.ts` | Finder URL rewrite |
| `src/lib/tools/finder-slugs.ts` | Tiny slug set (no catalog imports) |
| `src/app/tools/finder/[slug]/page.tsx` | Finder-only page |
| `src/app/tools/[slug]/page.tsx` | Non-Finder tools |
| `src/app/tools/[slug]/render-finder.tsx` | Pass `uiConfig` |
| `src/components/finder/FinderFlow.tsx` | Accept `uiConfig` prop |
| `src/lib/finder/resolve-steps.ts` | Require UI arg; no full map fallback |
| `src/app/tools/[slug]/render-home-gym.tsx` | Server-pass catalog/offers |
| `src/components/builders/HomeGymBuilderClient.tsx` | Props + lazy room canvas |

---

## 10. Residual / follow-ups

1. **Non-Finder `/tools/[slug]`** still shares one client graph for Home Gym + Hyrox + calculators (~166 kB First Load). Further workspace route splits would shrink calcs further — out of Finder HIGH scope.
2. **Home Gym RSC payload** still serializes published fitness products + offers (data weight, not Finder JS). Optional later: server action rebuild instead of props.
3. **Layout client chunk** (~84 kB decoded / ~22 kB transfer) is site-wide, not Finder-specific.

---

## 11. Verdict

**HIGH Finder First Load cleared for launch risk class.**

- Public Finder First Load **130 kB** (was **~851–888 kB**).  
- Route-specific Finder JS **7.45 kB**.  
- Lab JS transfer **~164 kB** gzip / **~534 kB** decoded (was **~866 kB** decoded).  
- Results remain **NOINDEX**. UX surface preserved.
