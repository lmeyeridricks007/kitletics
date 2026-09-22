# Data transfer audit

Sep 1–17:

| Metric | Effective $ | Billed $ | Notes |
|---|---|---|---|
| Fast Origin Transfer | 6.00 | 5.50 | **Billed.** Dynamic HTML + optimizer/Blob origin. |
| Blob Data Transfer | 2.20 | 1.67 | Unattributed; Kitletics-media 7.21 GB store. |
| Fast Data Transfer | 0 | **0** | Included in Pro. Volume still exists (16 Sep snapshot: Glimpse 7.29 GB, Kitletics 3.36 GB, Hiking 3.24 GB). |
| Blob storage size | 0.18 | 0.17 | Two team stores (`npx vercel blob list-stores`, 2026-09-17): **kitletics-media** 7.21 GB / 9.8k files (6d) + **softwareglimpse-blob** 6.71 GB / 5.9k files (28d). HikingWithLee has **no** Blob store. |

**Performance wins ≠ invoice wins.** AVIF/WebP **increase** transformation $ and **decrease** FDT (already $0). Prefer origin/Blob cuts.

---

## Largest origin / Blob causes

### 1. SoftwareGlimpse Blob proxy (HIGH for origin $)

`next.config.ts` `rewrites()` send `/guides/*`, `/software/*`, … media to `BLOB_PUBLIC_HOST` when the file is not on the deployment. Guide images are often `unoptimized` PNGs.

Crawler: HTML (dynamic, so origin) + N large PNGs through Vercel → Blob.

**Change:** browser requests `https://<store>.public.blob.vercel-storage.com/...` (or a dedicated media host). App origin only serves HTML/JS.

**Invoice:** Fast Origin Transfer $3.34 MTD on Glimpse + share of unattributed Blob transfer. MEDIUM–HIGH.

**CWV:** better if Blob is CDN-close; do not go back to shipping 6.8 GB in the deployment.

### 2. Kitletics optimizer → middleware → Blob (HIGH as ramp)

`/_next/image` fetches `/images/...` which middleware rewrites to Blob. Bytes count as:

- Blob Data Transfer (Blob → optimizer)
- Fast Origin Transfer (app origin involved)
- then Fast Data Transfer to the user (included)

**Change:** optimizer `src` = Blob URL **or** config rewrite without Edge middleware.

### 3. Dynamic HTML (HIGH coupled to Fluid)

SoftwareGlimpse draftMode pages and Kitletics force-dynamic pages cannot be served from the static CDN edge cache. HTML is origin. Fix rendering (compute audit) and origin HTML drops with it.

### 4. Database / explorer payloads (Kitletics) (MEDIUM)

`/running/shoes/database` and `/padel/rackets/database` ISR 3600 but pass **all records** into a client explorer. Transfer is FDT (included) + origin on miss.

**Change:** paginate; do not block Googlebot from a slim HTML table.

### 5. HikingWithLee originals (LOW–MEDIUM)

396 MB local images through optimizer. Origin $0.55. Fewer widths.

### 6. Fonts / JS

Kitletics `next/font` Outfit + DM Sans — self-hosted, fine. Glimpse/Hiking similar. Not the bill.

### 7. Research CSV / admin CSV

Small. robots Disallow public CSVs anyway.

---

## What not to optimize for billing

- Fast Data Transfer at current volume (included).
- Turning off compression or AVIF to “save transforms” if it blows LCP. Transforms are a real $ line on Kitletics — cut **cardinality**, not format support.
- Deleting Blob objects that are still referenced (404s + retries cost more).
