# Remediation plan (do not start until you pick a wave)

Audit-only run. Ordered by **$/hour** and **risk**. Keep Pro.

Copy the standard: `docs/VERCEL-COST-GUARDRAILS.md`.  
Detection: `npm run audit:vercel-cost` (Kitletics; `--root` for others).

---

## Wave 0 — dashboard, same day (no code)

| Action | Project | Est. monthly $ | Risk |
|---|---|---|---|
| Confirm Speed Insights **Plus** add-on is off | ExpatCopilot (Aug $0.65) | $0–1 | None |
| Disable Speed Insights + Web Analytics on idle prototype | architecture-intelligence-prototype | ~$0 | None |
| Observability: preview off; do not raise log retention | All | $2–4 | Low |
| Set **ignored build step** in dashboard if you don’t want `vercel.json` yet | All four live sites | **$18–26** | Low — test exit code |
| Pause `main` autodeploy until ignoreCommand exists; deploy from GitHub UI | Kitletics + Glimpse | Included above | Low |

---

## Wave 1 — P0 code (largest Fluid + builds)

### 1. SoftwareGlimpse: stop `draftMode()` on the crawl surface

Files: `src/app/(site)/software/[slug]/page.tsx`, `[tab]/page.tsx`, `guides/[slug]/page.tsx`.

Replace with `isEntityIndexable`. Add `/preview/...` if unpublished preview is required.

**Save $15–22/month Fluid+origin+observability. HIGH. Risk low.**

### 2. SoftwareGlimpse: `searchParams` off sitemap hubs

`/guides/`, `/compare/`, `/tools/` → static + client filters.

### 3. Kitletics: ISR catalog HTML

Remove `force-dynamic` + `getRequestRegion()` from PDPs, reviews, best, brands, listings. Default region NL (homepage already does). Client region picker.

**Do not SSG-all at build.**

**Save $12–20/month at current slope; more if 16 Sep crawler-fill repeats. MEDIUM–HIGH. Risk medium (prices/region).**

### 4. ignoreCommand in each repo + stop agent `main` pushes

**Save $18–26. HIGH. Risk low.**

### 5. Kitletics middleware: drop `/images/:path*`

Keep config rewrite or Blob absolute URLs.

**Save Edge + Blob hop; caps image ramp. MEDIUM. Risk low.**

---

## Wave 2 — P1 images, ISR policy, observability

1. Kitletics: `remotePatterns` explicit hosts; drop unused `imageSizes`.  
2. Kitletics + Glimpse: `src` = Blob public hostname.  
3. Glimpse: do not ISR `/search?q=`; sitemap TTL 7d; `dynamicParams = false`.  
4. Expat: `CONTENT_REVALIDATE = 86400`; consent-gate Vercel Analytics; SI `sampleRate`.  
5. Hiking: dedupe image 640; exclude js/css/woff from middleware; Observability review.  
6. Kitletics layout: Speed Insights `sampleRate={0.1}`.  
7. robots.txt: Disallow `/search`, `*.csv` (keep Googlebot on products/reviews).

---

## Wave 3 — P2 structural

1. Glimpse: don’t prerender reverse compare slugs or 9 software tabs (client tabs or robots Disallow tab paths).  
2. Kitletics: split catalog JSON so functions don’t embed 57MB review files.  
3. Optional pre-encode card/hero widths into Blob (`unoptimized` for those slots).  
4. FluentCopilot: add image allow-list **before** traffic; still no Vercel Analytics.

---

## Explicitly out of scope / do not do

- Do not cancel Pro.  
- Do not `images.unoptimized = true` on Kitletics.  
- Do not block Googlebot.  
- Do not SSG every Kitletics SKU to “save Fluid” (OOM / turbo builds).  
- Do not add middleware to SoftwareGlimpse.  
- Do not add Vercel Cron that hits HTML.

---

## Suggested sequence (calendar)

| Day | Work |
|---|---|
| 1 | Wave 0 dashboard + ignoreCommand |
| 2–3 | Glimpse draftMode + hub searchParams |
| 3–5 | Kitletics ISR path + middleware images |
| 6–8 | Wave 2 images/robots/SI |
| Later | Wave 3 |

Re-measure with `npx vercel usage --group-by project` after each wave. Success: Fluid CPU and Build CPU down; ISR reads may **up** on Kitletics (good trade).
