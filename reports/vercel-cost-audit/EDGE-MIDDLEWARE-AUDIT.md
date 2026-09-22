# Edge / middleware audit

Sep 1–17 **Edge Requests billed $0** (Pro included). **Edge extra CPU $0.53** (SoftwareGlimpse $0.43, HikingWithLee $0.09, Kitletics $0.004). Middleware is not the largest invoice line **today**. It is still a multiplier on images (Kitletics) and a future bill if Edge Requests exceed the included allotment.

The 16 Sep invoice snapshot (usage volume, not extra $): SoftwareGlimpse **274k** edge requests, Kitletics **106k**, HikingWithLee **79k**, unattributed **66k**, ExpatCopilot **14k**.

---

## Kitletics — `src/middleware.ts`

**What it does:** www→apex 308, admin Basic Auth, IndexNow rewrite, **Blob rewrite for `/images/*`**, finder slug rewrite.

**Matcher:**

```
"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpe?g|gif|webp|avif|ico|woff2?|map)$).*)",
"/images/:path*",
"/indexnow-key.txt",
```

The first line correctly skips optimizer and hashed static. The **second line puts every `/images` request back in**.

**Hits Edge:** all HTML, `/sitemap.xml`, `/robots.txt` (`.xml`/`.txt` not excluded), `/go/*`, `/search`, **every `/images/*` origin fetch**.

**Skips:** `/_next/static`, `/_next/image`, extension-based assets *except* when the path is `/images/...`.

**Recommended matcher:**

```
"/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:js|css|png|jpe?g|gif|webp|avif|ico|woff2?|map|txt|xml)$).*)"
```

Keep IndexNow as an explicit `/indexnow-key.txt` if the catch-all no longer includes `.txt`. **Do not** list `/images/:path*`. Blob belongs in `rewrites()` or absolute URLs.

**Estimated Edge request reduction:** 16 Sep Kitletics 106k requests — a large fraction is image origin fetches during optimizer fill. Removing `/images` could cut **30–60%** of Kitletics Edge invocations. Extra CPU is already tiny ($0.004); the win is **not paying Blob+Edge on the optimizer’s source fetch** and staying inside Pro’s Edge allowance as traffic grows. MEDIUM.

---

## HikingWithLee — `middleware.ts`

Catch-all HTML matcher (skips `_next/static`, `_next/image`, common image extensions; **does not skip `js|css|woff2` or `.xml`**).

Work: canonical host 308 (apex + `*.vercel.app` → www), WP remnant 404, legacy path redirects.

**Recommended:** exclude `js|css|woff2?|map|xml|txt`. Run legacy/WP checks only on paths that can match (`/wp-`, known prefixes), not on every HTML request — or fold host 308s into `vercel.json` (already has some host redirects) and delete middleware if leftover WP hits are rare.

**Reduction:** most of Hiking Edge extra CPU $0.09. LOW–MEDIUM $.

---

## ExpatCopilot — `apps/expatlife-web/middleware.ts`

Matchers: `/images/infographics/:path*`, `/images/heroes/:path*`, plus pages excluding sitemap/robots. Publish cookie + missing-image rewrite.

**Recommended:** missing-image rewrite is a preview concern — disable in production. Do not Edge-rewrite production heroes if files exist on the deployment/CDN.

---

## SoftwareGlimpse — **no middleware**

Correct. Edge extra CPU $0.43 is `trailingSlash` + ~382×2 legacy redirects in `next.config.ts`. **Do not add a catch-all middleware** to “fix” that; it would bill Edge on every asset.

---

## FluentCopilot — **no middleware**

Keep.

---

## Bots (see also compute + robots)

Middleware runs for Googlebot. That is OK for host canonicalization. It is **not** OK to put image bytes on that path.

Safe WAF (dashboard, do not block Googlebot/Bingbot):

- Challenge unknown bots on `/search` and Server Action POSTs.
- Rate-limit `/_next/image` for non-browser scrapers if transforms spike.
- Keep `/go` allowed for users, disallowed in robots (already).

Confirmed via `npx vercel firewall overview` (2026-09-17): Kitletics and SoftwareGlimpse are **Firewall: Not configured**. Attack Mode off. System Mitigations (platform DDoS) active. No custom WAF rules, no IP blocks. HikingWithLee/ExpatCopilot were not queried; assume the same until set.
