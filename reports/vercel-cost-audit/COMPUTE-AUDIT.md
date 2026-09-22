# Compute audit (Fluid Active CPU, memory, invocations)

Sep 1–17: Fluid Active CPU **$16.13** effective (**$13.03** billed). Fluid Memory **$2.44**. Function invocations **$0.44** (cheap; CPU is the bill).

All six projects have **Fluid Compute + elastic concurrency** on in Vercel project settings. Default timeout 300s, memory type `standard`, region `iad1`.

---

## Smoking gun A — SoftwareGlimpse `draftMode()` (HIGH)

**Current behaviour:** `/software/[slug]/`, `/software/[slug]/[tab]/`, `/guides/[slug]/` call `await draftMode()` in **both** `generateMetadata` and the page, then `buildSoftwareReviewModel` / `resolveGuide`.

**Expected frequency:** continuous crawler traffic to 314 software URLs + 9 tabs × 315 + 589 sitemap’d guides.

**Why it costs money:** Next 15/16: `draftMode()` is a dynamic API → route is not static despite `generateStaticParams`. Each hit = Fluid CPU + memory + origin HTML + observability. Model is built **twice**.

**Proposed change:** production indexability from `isEntityIndexable` only. Preview via `/api/preview` + a `/preview/software/[slug]` route (Kitletics already 404s preview in prod). `export const dynamic = "force-static"` if needed.

**Expected reduction:** 70–90% of SoftwareGlimpse Fluid ($10.77 / 17d → ~$19/month, save **$15–18/month**). HIGH confidence this is the mechanism; HIGH that crawlers hit these URLs (they are in the sitemap).

**Risk:** unpublished guides stop rendering on the public URL without a preview path. Low if preview is added first.

---

## Smoking gun B — Kitletics `force-dynamic` + `cookies()` (HIGH)

**Current behaviour:** public catalog routes export `dynamic = "force-dynamic"` and call `getRequestRegion()` (`cookies()`). Comment on PDPs: *“skip SSG to keep builds healthy.”*

Files:

- `src/app/products/[slug]/page.tsx`
- `src/app/products/[slug]/alternatives/page.tsx`
- `src/app/reviews/[slug]/page.tsx`
- `src/app/best/[slug]/page.tsx`
- `src/app/brands/[slug]/page.tsx`
- `src/app/[sport]/[segment]/page.tsx`
- `src/app/[sport]/[segment]/[listing]/page.tsx`
- `src/app/tools/[slug]/page.tsx`, `results`, `finder/[slug]`
- `src/app/gear/page.tsx`
- `src/app/search/page.tsx`

Homepage is the contrast: `force-static` + `revalidate = 3600` + hardcoded region `"NL"`.

**Expected frequency:** sitemap of ~1.2k+ URLs (growing with padel). Googlebot + Ahrefs. Search is noindex but **not** robots-disallowed.

**Why it costs money:** every HTML request runs Node, loads catalog repositories (~75MB `src/content`), builds JSON-LD, enriches reviews. Fluid CPU $4.53 in ~6 days. 16 Sep invoice snapshot: **27 CPU-hours** on Kitletics in one charge row — crawler-fill risk.

**Proposed change:** ISR (`revalidate = 86400`) with default region; region picker client-side. Drop `generateStaticParams` on routes that stay dynamic. Cache `getProductPageData` / `enrichReviewForPage` with `unstable_cache`.

**Expected reduction:** 60–80% of Kitletics Fluid (**$12–20/month** at current slope). MEDIUM on dollars (ramp); HIGH on mechanism.

**Risk:** Medium. Offer prices/region copy can be a few hours stale, or a small client island. **Do not** SSG every product at build — OOM already forced a turbo build machine.

---

## SoftwareGlimpse hubs `searchParams` (HIGH)

`/guides/`, `/compare/`, `/tools/` await `searchParams` and are **in the sitemap**. Next 15: that dynamizes the whole route even for the empty query.

**Change:** static hub + client filters.  
**Reduction:** a slice of remaining Fluid after draftMode fix. MEDIUM.  
**Risk:** Low.

---

## Kitletics sport hub gender query (MEDIUM)

`src/app/[sport]/page.tsx` awaits `searchParams` (gender). Running/padel hubs become dynamic.

**Change:** client filter or ISR default.  
**Risk:** Low.

---

## ExpatCopilot hourly ISR (MEDIUM)

`CONTENT_REVALIDATE = 3600` on **381** files plus NL layout. Origin hub `force-dynamic` + `headers()`.

**Frequency:** crawlers × hourly revalidation.  
**Cost:** Fluid $0.37 MTD is small; the pattern will grow with traffic.  
**Change:** 86400 or `false` for evergreen guides.  
**Risk:** Low (immigration rules don’t change hourly).

---

## HikingWithLee tool `searchParams` (LOW–MEDIUM)

Eight listing/tool pages await `searchParams`. Public content is otherwise SSG (`dynamicParams = false` on slugs). Fluid $0.46 is mostly middleware, not these pages.

**Change:** client islands like packing-list-builder.  
**Risk:** Low.

---

## Search / Server Actions

| Project | Behaviour | Frequency | Cost | Change | Risk |
|---|---|---|---|---|---|
| Kitletics | `searchKitleticsAction` full catalog scan, limit 24 | Users + bots on `/search` | CPU on each call | robots Disallow `/search`; rate-limit | Low |
| Kitletics | Finder / compare / hyrox actions import catalogs | Users | Occasional | Lazy-import; rate-limit | Low |
| SoftwareGlimpse | `/api/search/suggest` + `/search?q=` ISR | Header debounce 160ms; crawlers | ISR keys + Fluid on miss | No ISR for arbitrary `q`; min 3 chars | Low |
| HikingWithLee | `/api/search-index` force-static | Fine | Keep | — | — |

---

## What is already cheap / correct

- Kitletics `/go/[offerId]` force-dynamic: invocations $0.09. Keep.
- Kitletics admin force-dynamic: 404 or Basic Auth. Keep.
- No Vercel Cron on any project (definitions empty). **Do not add hourly crons that hit HTML.**
- No `unstable_noStore` / `cache: 'no-store'` on Kitletics public fetches (good).
- FluentCopilot marketing routes are static; `/app` dynamic is appropriate.
- Compare canonical pages on Kitletics (`/compare/[slug]`) are static. Keep.

---

## N+1 / runtime transforms

Kitletics: in-process graph, not HTTP N+1. Cost is **loading and walking the whole catalog inside the function**, plus `enrichReviewForPage` per review request. Markdown/MDX is **not** compiled at runtime (TS/JSON). JSON-LD is cheap vs catalog load.

SoftwareGlimpse: `buildSoftwareReviewModel` pulls comparisons, pricing history, evidence, videos, link graph per request while dynamic — that **is** the CPU.

HikingWithLee: MDX at **build**, not request (except dynamized tools).

---

## Memory

Kitletics Fluid Memory $0.82 MTD for 6 days. Function default memory is `standard`. **Do not raise runtime memory** — ISR reduces occupancy. Build OOM is a **build-graph** problem (`src/content` 75MB + review JSON ~57MB), not a request-memory problem.
