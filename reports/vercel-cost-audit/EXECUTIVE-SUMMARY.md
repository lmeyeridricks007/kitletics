# Vercel FinOps audit — executive summary

**Scope:** personal team `leemeyeridricks-3740s-projects` (Vercel Pro).  
**Evidence window:** `npx vercel usage` for **2026-09-01 → 2026-09-17** (current billing period) plus August 2026 for baseline.  
**Code inspected:** Kitletics, SoftwareGlimpse, HikingWithLee, ExpatCopilot (`expatos/apps/expatlife-web` → project `lifeos-expatlife-web`), FluentCopilot, Architecture Intelligence prototype.  
**This run is audit-only.** No production behaviour was changed.

Confidence labels apply to **dollar estimates**, not to whether the code pattern exists. Code patterns below were read in-repo.

---

## 1. What is costing money?

Sep 1–17 **billed $65.40** (effective $72.54). That is **not** a quiet content site on a CDN.

| Rank | Service | Effective $ | Billed $ | What it actually is |
|---|---|---|---|---|
| 1 | **Build CPU Minutes** | 21.39 | 21.39 | Full Next.js production rebuilds on almost every `main` push. SoftwareGlimpse ~13k pages; Kitletics turbo machine after OOM. |
| 2 | **Fluid Active CPU** | 16.13 | 13.03 | Request-time Node for pages that look static but are not (draftMode / cookies / force-dynamic). |
| 3 | **Pro subscription** | 9.68 | 9.68 | Fixed $20/month, prorated. |
| 4 | **Observability Events** | 6.21 | 5.82 | Function invocation volume + Web Analytics. |
| 5 | **Fast Origin Transfer** | 6.00 | 5.50 | HTML from origin (dynamic pages) + Blob proxied through the app. |
| 6 | **ISR Reads** | 2.67 | 2.45 | Almost all SoftwareGlimpse Incremental Cache (~1M reads on the 16 Sep invoice snapshot). |
| 7 | **Image Optimization Transformation** | 2.64 | 1.23 | Kitletics dominates. 10.9k sources through `/_next/image`. |
| 8 | **Fluid Provisioned Memory** | 2.44 | 1.95 | Large serverless working sets (catalogs). |
| 9 | **Blob Data Transfer** | 2.20 | 1.67 | Kitletics-media store 7.21 GB / 9.8k files (6 days old). |
| 10 | Image cache writes + Edge extra CPU + invocations | ~2.5 | ~2.0 | Follow-on of the above. |

**Included in Pro (billed $0 this period):** Fast Data Transfer, Edge Requests. Those volumes are real (SoftwareGlimpse ~274k edge requests on the 16 Sep snapshot) but not the invoice line. Do not chase them until they exceed the Pro allowance.

**Architectural pattern generating most of the bill:** *dynamic HTML for crawler-facing catalog URLs, plus a rebuild of a huge static estate on every git push.*

---

## 2. Which projects are responsible?

Sep 1–17 effective cost (usage API, `--group-by project`):

| Project | Effective $ | Billed $ | Share of variable | Role |
|---|---|---|---|---|
| **softwareglimpse** | **32.00** | **29.82** | ~51% | Largest bill. Fluid CPU $10.77 + builds $8.93 + observability $4.12 + origin $3.34 + ISR reads $2.34. |
| **kitletics** | **14.38** | **10.35** | ~23% | Only live since ~11 Sep. Builds $5.80 + Fluid $4.53 + image transforms $1.70. **Fastest-growing.** |
| **(unattributed)** | 13.76 | 13.11 | — | Pro $9.68 + Blob transfer $2.20 + leftover origin $1.64. Blob is Kitletics media. |
| **lifeos-expatlife-web** | 6.38 | 6.30 | ~10% | Builds $4.51. Runtime is small. |
| **hikingwithlee** | 6.02 | 5.81 | ~10% | Builds $2.16 + observability $1.18 + images/origin. |
| **fluentcopilot** | 0.00 | 0.00 | 0% | Domain live, no traffic. |
| **architecture-intelligence-prototype** | ~0 (Aug $0.04) | ~0 | 0% | Idle prototype. |

August billed **$26.97** (no Kitletics). September is already **2.4× August with 13 days remaining.**

---

## 3. Which routes / features are responsible?

| Project | Route / feature | Why it hits the invoice |
|---|---|---|
| SoftwareGlimpse | `/software/[slug]/`, `/software/[slug]/[tab]/`, `/guides/[slug]/` | `draftMode()` in `generateMetadata` **and** the page. Next 15/16 treats that as fully dynamic. Googlebot SSR’s the heavy review model **twice** per URL. ~315 software + 9 tabs + ~589 sitemap’d guides. |
| SoftwareGlimpse | Full SSG estate (~13k pages) | Every `main` production deploy. Sep avg build **647s** (max 20 min). Build machine: **turbo** (`long-build-duration`). |
| SoftwareGlimpse | `/search/?q=*` ISR 3600 | Unbounded ISR keys. |
| SoftwareGlimpse | Blob `rewrites()` for `/guides/*` media | Origin transfer of ~6.8 GB unoptimized assets through the app. |
| Kitletics | `/products/[slug]`, `/reviews/[slug]`, `/best/[slug]`, `/brands/[slug]`, listings, finders | `force-dynamic` + `getRequestRegion()` → `cookies()`. Intentional to keep **builds** small; it moved cost to **Fluid**. |
| Kitletics | `next/image` + middleware `/images/:path*` | Browser → optimizer → Edge rewrite → Blob. 10,886 local files; store `kitletics-media` 7.21 GB. |
| Kitletics | Production builds | 16 production deploys in 6 days. Avg 266s, max **740s**. Build machine **turbo** after **OOM**. |
| ExpatCopilot | ISR `revalidate = 3600` on **381** files | Hourly regeneration of a mostly-static NL guide tree. |
| HikingWithLee | Catch-all middleware + `next/image` | HTML Edge on every page; 882 images / 396 MB optimized. |
| All | No `ignoreCommand` | Docs/agent commits still rebuild production. |

---

## 4. Why are they expensive?

Three multipliers stack:

1. **Wrong rendering mode for SEO sites.** Catalog HTML is fetched by crawlers continuously. `draftMode()` / `cookies()` / `force-dynamic` turns each crawl into Fluid Active CPU + origin HTML + observability events.
2. **Deploy amplification.** AI/Cursor + `main` autodeploy. SoftwareGlimpse 7 production deploys in Sep (avg 11 min). Kitletics 16 production deploys in ~6 days. Each deploy colds ISR and image caches.
3. **Media through Vercel twice.** Blob storage **and** Image Optimization **and** (Kitletics) Edge middleware on `/images`.

---

## 5. What can be changed?

Highest leverage, in order (see [REMEDIATION-PLAN.md](./REMEDIATION-PLAN.md)):

1. Remove `draftMode()` from SoftwareGlimpse software/guide pages (dedicated preview route).
2. Add ignored build steps; stop agent-driven production deploys.
3. Kitletics: drop `cookies()` from public RSC; ISR PDPs/reviews with a default region.
4. Kitletics: remove `/images` from the middleware matcher; tighten `remotePatterns`.
5. Serve Blob public URLs directly (Kitletics + SoftwareGlimpse).
6. Lengthen ExpatCopilot ISR to 24h; sample or drop Speed Insights on catalog sites.
7. Stop ISR-caching SoftwareGlimpse search queries.
8. `dynamicParams = false` on closed catalogs.
9. `robots.txt` Disallow `/search` and CSV dumps (keep Googlebot on canonical HTML).
10. Disable unused Speed Insights / Web Analytics on idle projects (FluentCopilot already clean; prototype is not).

---

## 6. What should NOT be changed?

| Leave it | Why |
|---|---|
| **Vercel Pro** | Six production projects, custom domains, commercial affiliate use, Fluid already above Hobby. Saving $20 would cap everything else. |
| **Kitletics Blob + `.vercelignore` for `public/images/**`** | 7.4 GB cannot go in the deployment (Pro upload cap). |
| **Global `next/image` off** | LCP/CWV regression on PDPs and reviews. Reduce **variants**, do not disable the optimizer. |
| **SSG-ing every Kitletics product/review at build** | Already abandoned to keep builds healthy; turbo machine was selected after **OOM**. ISR without cookies is the path, not full SSG. |
| **Blocking Googlebot / Bingbot** | SEO is the product. |
| **`/go/*` force-dynamic** | Affiliate hops must not be cached incorrectly. Keep `robots` Disallow. |
| **Admin `force-dynamic` + Basic Auth** | Low traffic, correctly gated. |
| **FluentCopilot `/app` force-dynamic** | Authenticated product. No traffic. Do not add Analytics “for later”. |
| **HikingWithLee host 308s** | Canonicalization is required for SEO; just narrow the matcher. |

---

## 7. Top 10 changes by financial impact

Estimates are **monthly**, using Sep 1–17 run-rate unless noted. Kitletics is annualized from ~6 live days (MEDIUM) because crawler fill is still ramping.

| # | Change | Metric | Est. monthly save | Confidence | Risk |
|---|---|---|---|---|---|
| 1 | Ignored builds + fewer `main` deploys (all projects) | Build CPU | **$18–26** | HIGH | Low |
| 2 | SoftwareGlimpse: remove `draftMode()` from software/guides | Fluid CPU + origin + observability | **$15–22** | HIGH | Low (move preview) |
| 3 | Kitletics: ISR PDPs/reviews, no RSC cookies | Fluid CPU + memory | **$12–20** (higher if Sep 16 crawler day repeats) | MEDIUM | Medium (region UX) |
| 4 | Kitletics: stop middleware on `/images` + fewer image variants | Image transforms + Edge + Blob | **$8–25** (prevents ramp) | MEDIUM | Low |
| 5 | Direct Blob URLs (Kitletics + Glimpse) | Origin + Blob transfer | **$4–8** | MEDIUM | Low |
| 6 | Observability: sample SI, preview off, drop unused | Observability + SI Plus | **$5–8** | MEDIUM | Low |
| 7 | SoftwareGlimpse: no ISR for `/search?q=` + longer sitemap TTL | ISR Reads | **$2–4** | MEDIUM | Low |
| 8 | ExpatCopilot: ISR 86400 + ignoreCommand | Build + Fluid | **$3–6** | MEDIUM | Low (stale guides) |
| 9 | HikingWithLee: ignoreCommand + image sizes + observability | Build + images + events | **$2–4** | MEDIUM | Low |
| 10 | `dynamicParams = false` + robots Disallow search/CSV | Fluid on junk URLs | **$1–3** | LOW–MEDIUM | Low |

**Do not count these as additive to $100.** Several lines shrink together (less Fluid also cuts observability and origin). Combined P0/P1 is **~$45–70/month** variable reduction, not $90.

---

## 8. Estimated current monthly Vercel cost

**Evidence (HIGH):**

- Sep 1–17 billed **$65.40** (17 days).
- Pro prorated **$9.68** → full month Pro **$20**.
- Variable billed **$55.72** in 17 days → **$3.28/day**.

**Linear run-rate (HIGH as a description of *this* period):**

- Variable × 30 = **$98**
- Plus Pro **$20**
- **≈ $118 / month billed**

**Range (MEDIUM):** **$115–$145**. Kitletics did not exist for the first ~10 days; image optimizer + Googlebot can push the second half of September above the linear line. The 16 Sep invoice snapshot showed Kitletics Fluid **27 CPU-hours** and **54k image transformations** in a single charge-period row — treat that as a **launch-spike / crawler-fill risk**, not as a proven every-day run-rate (only one such row; period Fluid for Kitletics is $4.53 total).

August actual billed: **$26.97** (Hobby/credits + no Kitletics). Do not use August as the new normal.

---

## 9. Cost after remediation

**Target monthly (keep Pro):**

| | Amount | Confidence |
|---|---|---|
| Vercel Pro (fixed) | **$20** | HIGH |
| Variable after P0 (draftMode + ignoreCommand + Kitletics ISR path) | **$35–50** | MEDIUM |
| Variable after P0+P1 (images, Blob URLs, observability, ISR policy) | **$25–40** | MEDIUM |
| **Target total** | **$45–70** | MEDIUM |

Floor is not $20: Blob storage, some Fluid for `/go` and tools, residual builds, and Pro remain.

---

## 10. Ongoing rules so cost does not creep

Canonical standard: [`docs/VERCEL-COST-GUARDRAILS.md`](../../docs/VERCEL-COST-GUARDRAILS.md)

Automated check (Kitletics, copyable): `npm run audit:vercel-cost`  
Current Kitletics result: **FAIL** on `force-dynamic` public catalog routes, RSC `getRequestRegion()`, middleware `/images`, `remotePatterns: **`.

---

## Waterfall (monthly, billed)

```
CURRENT MONTHLY RUN-RATE                         $118     HIGH (linear Sep 1–17)
  Vercel Pro (fixed, keep)                       ($20)
  Variable starting point                        $98

- P0 ignoreCommand / fewer production builds     -$22     HIGH
- P0 SoftwareGlimpse draftMode() off crawl HTML  -$18     HIGH
- P0 Kitletics ISR instead of force-dynamic      -$16     MEDIUM
- P1 image variants + no /images middleware      -$10     MEDIUM (also caps ramp)
- P1 Blob direct URLs                            -$6      MEDIUM
- P1 observability sampling                      -$6      MEDIUM
- P1 search/sitemap ISR + Expat 24h revalidate   -$5      MEDIUM
                                                 ────
TARGET VARIABLE                                  $15–35   MEDIUM (overlap; not fully additive)
+ Pro                                            $20
= TARGET MONTHLY                                 $45–70   MEDIUM
```

**If Kitletics crawler-fill continues at the 16 Sep snapshot intensity without P0/P1, the second half of September can overshoot $118.** That is the main reason to treat Kitletics images + `force-dynamic` as P0 even though MTD Kitletics is “only” $14.
