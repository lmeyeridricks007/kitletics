# Padel media root cause

**As of:** 2026-09-14  
**Context:** Final go-live audit = **NO-GO**. Dominant blocker = product media semantics (`WRONG_PRODUCT` / `WRONG_BRAND` / `WRONG_SPORT`), not missing files.

This document explains **why** products without verified exact-product media were promoted public. Remediation actions are in `PADEL-MEDIA-REMEDIATION-AUDIT.md`.

---

## Executive summary

Three independent failures compounded:

1. **Authenticity ≠ identity.** Publish and launch gates treated “licensed non-SVG hero registered” as enough for public readiness.
2. **Soft-media acquisition scored search query pollution as identity.** PadeLMQ suggest hits were ranked with `_psq=` query tokens, so wrong SKU pages scored as matches; unique filenames hid shared wrong pixels.
3. **Editorial subject inference lacked soft-goods topics.** Alternatives pages fell through to running-shoe guide art (`WRONG_SPORT`).

No JSX “hide wrong image” path caused this. The **canonical product → media relationship** and **state machine** were wrong.

---

## Confirmed rendered defects (pre-remediation)

| Defect | Count (final crawl) |
|--------|---------------------|
| `WRONG_PRODUCT` hero | 188 |
| `WRONG_BRAND` hero | 143 |
| `WRONG_SPORT` media | 7 |

Known placeholder / polluted families (unique paths, wrong identity):

- `/images/padel/products/head-padel-pro-s-hero.jpg` — reused conceptually across ball SKUs via wrong downloads
- `/images/padel/products/wilson-padel-overgrip-hero.jpg` — grip pollution pattern
- `/images/padel/products/nox-at10-team-paletero-hero.jpg` — bag pollution pattern
- `/images/padel/products/bullpadel-frame-protector-3-pack-hero.jpg` — accessory pollution pattern
- Soft-wave files under `/images/padel/{balls,bags,grips,accessories}/` with **per-slug filenames** but **foreign `sourceUrl`** (e.g. 4ON Pro T1 → TotalGrip spray; Kuikma bag → Bullpadel Hack padeltas; Adidas Metalbone bag → Metalbone racket PDP)

Crawl caveat: some audit “primary” hits preferred first `/images/.../products/` path on the page (related products), while the registry hero lived under category folders. Source-URL forensics still proved systematic wrong downloads.

---

## Failure 1 — Identity-blind authenticity / publish gates

### What the code believed

| Check | What it actually tested |
|-------|-------------------------|
| `isAuthenticProductMedia` | Rejects SVG / fallbacks / logos / `kitletics-owned` only |
| `hasRegisteredProductHero` | Any registry `-hero` entry exists |
| `applyMediaPublishGate` (pre-fix) | Pending IDs without *any* registered authentic hero → draft; **registered = publish** |
| `assessProductLaunchQuality` / launch media | `hasRealMedia = isAuthenticProductMedia(...)` — no brand/model match |
| Reconcile `MEDIA_VERIFIED` | Set on registration alone (`registered_hero;padel_namespace;authentic_gate`) |

### Consequence

A JPEG of **another product** with a licence string and a unique filename satisfied every gate. Soft goods with polluted heroes stayed **`published`** and indexable.

### Fix direction

- `MEDIA_VERIFIED` for padel = `evaluatePadelHeroIdentity` (sport namespace + brand + model + source pathname checks).
- `getPrimaryProductMedia` returns `undefined` for padel unless identity verified (no category/brand/featured fallback).
- `applyMediaPublishGate` demotes **all** padel products without verified exact media to `draft`.
- Gallery frames skip unverified padel media.
- Reconcile only stamps `MEDIA_VERIFIED` when `hasVerifiedProductHero` passes.

---

## Failure 2 — Soft-media wave search pollution

**Script:** `scripts/tmp/fetch-padel-soft-media-wave.mjs`

### Mechanism

1. Query retailer suggest with brand + model.
2. Score candidates with `identityScore` that included **query string** (`_psq=kuikma+Paletero`, etc.).
3. Top hit often: **unrelated SKU** whose URL still contained the search tokens in `_psq`.
4. Download image → save as `{slug}-hero.jpg` (looks unique in filesystem / duplicate-byte detector).
5. Register as soft secondary media → gate treats as authentic → publish.

### Examples (source URL vs product)

| Product | Registered file | Actual source path |
|---------|-----------------|--------------------|
| `4on-pro-t1` | `.../balls/4on-pro-t1-hero.jpg` | `/products/totalgrip-spray-200ml` |
| `kuikma-padel-paletero` | `.../bags/kuikma-paletero-hero.jpg` | `/products/bullpadel-hack-padeltas-...` |
| `osaka-sports-padel-bag` | Osaka filename | Adidas bag PDP |
| `adidas-metalbone-bag` | Adidas filename | `/products/adidas-metalbone-3-5-2026` (racket) |
| `head-hydrosorb-replacement-grip` | Hydrosorb filename | Head Coello Motion racket |
| `sane-core` | Sane filename | Hesacore grip gel |

### Fix direction

- Pathname-only scoring (no query).
- Penalty for racket-like paths on bag/grip/ball/accessory queries.
- Exact-product identity gate on publish regardless of registration.
- Revoke registry rows that fail identity (72 entries revoked 2026-09-14).

---

## Failure 3 — Cross-sport alternatives art

Soft categories lacked dedicated `alternatives-config` / topic mapping. `inferEditorialTopic` matched shoe/trail language → `running_shoes` → `/images/home/guide-running-shoes.jpg` on Padel alternatives (**7** pages).

### Fix direction

- Dedicated alternatives configs for balls / bags / grips / accessories / shoes with `heroImageSrc: "/images/padel/hero.jpg"`.
- Soft category IDs mapped to padel editorial subjects (not running).

---

## Failure 4 — Family / variant inheritance (where it hurt)

Legitimate inheritance (same physical product, colorway) was not the main blast radius. The blast radius was **search fallback pretending to be family media**: same-brand different model, same category different SKU, bag←racket collection name.

Courtstabil used Courtquick catalog media (wrong model) — entry removed; ID added to wrong-image shoe patch list.

---

## Why enrichment audits looked “green”

Prior media passes counted:

- files on disk
- registry rows
- authentic (non-SVG) licence
- `MEDIA_VERIFIED` stamped by reconcile on registration

They did **not** require brand/model/source pathname agreement. Duplicate-hero byte detectors also returned 0 when every wrong download had a unique filename.

---

## Publication rule (corrected)

For Product PDP **INDEXABLE**:

| Gate | Required |
|------|----------|
| Identity | ready |
| Specs | ready |
| Editorial | ready |
| Media | **`MEDIA_VERIFIED` exact-product** (mandatory) |
| Technical quality | ready |
| Commerce | may be absent if policy allows |

If exact media is unavailable after remediation: **de-publish / draft / noindex**. Do not substitute another product’s hero. Quality > URL count.

---

## State machine (before → after)

```
BEFORE:
  register authentic JPEG → MEDIA_VERIFIED → published/indexable

AFTER (padel):
  register JPEG
    → evaluatePadelHeroIdentity
      → fail → MEDIA_MISSING / draft (no primary hero on PDP)
      → pass → MEDIA_VERIFIED → eligible for published/indexable
```

---

## What this root cause does *not* claim

- JSX rendering bugs as the primary cause (do not patch pages to hide images).
- That every go-live crawl “primary” path was the PDP hero (related-product bias existed).
- That Padel is GO after gate-only fixes — remaining drafts still need exact manufacturer media research.

---

## Related artifacts

- `docs/padel/PADEL-FINAL-GO-LIVE-AUDIT.md` — NO-GO verdict
- `docs/padel/PADEL-MEDIA-REMEDIATION-AUDIT.md` — remediation BEFORE→AFTER
- `docs/padel/data/PADEL-MEDIA-REMEDIATION.csv`
- `docs/padel/data/PADEL-DUPLICATE-HERO-AUDIT.csv`
- `data/staging/padel-media-identity-revoke.json`
- `src/lib/product/media-identity.ts`
- `src/content/running/products/media-publish-gate.ts`
