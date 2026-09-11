# Fix 76 — Next.js `images.qualities` allow-list

**Date:** 2026-09-10  
**Debt:** `IMG-QUALITIES` (MEDIUM) — Next 15.5.24 warned because `quality !== 75` was requested without `images.qualities`.  
**Do not publish.** Quality values were **not** increased.

**Evidence:** [`../data/rc-76/`](../data/rc-76/) · probe [`../data/rc-76/image-quality-probe.json`](../data/rc-76/image-quality-probe.json) · lab `http://127.0.0.1:3010`

---

## 1. Inventory — qualities actually used

Production `src/` (`quality={…}` and `IMAGE_QUALITY.*`). Scripts that JPEG-compress ingest masters (e.g. quality 88) are **not** next/image and are not in this allow-list.

| Value | How it is requested | Surfaces |
|---|---:|---|
| **65** | `IMAGE_QUALITY.thumb` | Gallery thumbs, compare/alt rails, brand/sport thumbs, use-case chips |
| **70** | `IMAGE_QUALITY.card` | Product cards, catalog cards, brand tiles, shoes category hero shoes |
| **75** | `IMAGE_QUALITY.hero` **and** Next’s default when `quality` is omitted | PDP / brand / listing heroes; Review / Best / Guide / Finder Images that omit `quality` |

No other numeric `quality={N}` in `src/`. The Zero-Debt note (“65 and 70 only”) was incomplete: **75 is live** via `IMAGE_QUALITY.hero` and via every `<Image>` that relies on the Next default.

Omitting **75** from the allow-list would 400 Review, Best, Guide, Finder, and PDP heroes.

---

## 2. Config

`next.config.ts` `images.qualities` is the used list only:

```ts
qualities: [...IMAGE_QUALITY_ALLOWLIST] // [65, 70, 75]
```

Source of truth: `src/lib/media/image-delivery.ts` (`IMAGE_QUALITY` + `IMAGE_QUALITY_ALLOWLIST`).

**Not added:** 80, 90, 100, or any unused value. Extra allow-list entries would not change default requests, but they would let `/_next/image?q=` serve larger files.

`formats`, `deviceSizes`, `imageSizes`, `minimumCacheTTL` unchanged.

`ShoesCategoryHero` literals `quality={75}` / `quality={70}` now use `IMAGE_QUALITY.hero` / `.card` (same numbers).

---

## 3. Verify — no broken image responses

Production `next start` @ `127.0.0.1:3010` after `next build`. Optimizer against `vomero-18-hero.png` `w=384`:

| `q` | HTTP | Bytes | Notes |
|---|---:|---:|---|
| 65 | **200** | 20191 | thumb |
| 70 | **200** | 21508 | card |
| 75 | **200** | 22349 | hero / default |
| 80 | **400** | 44 | not allow-listed |
| 100 | **400** | 45 | not allow-listed |

HTML routes (all **200**, sample `/_next/image` URLs **200**, **0** 4xx):

| Surface | Path | next/image count | Qualities on page |
|---|---|---:|---|
| Product cards | `/running/shoes` | 577 | 65, **70** |
| PDP hero | `/products/nike-vomero-18` | 123 | 65, 70, **75** |
| Review | `/reviews/nike-vomero-18` | 342 | **75** (default) |
| Best | `/best/running-shoes` | 550 | **75** (default) |
| Guide | `/guides/how-to-choose-running-shoes` | 315 | **75** (default) |
| Brand | `/brands/nike` | 537 | 65, 70, 75 |
| Compare | `/compare/asics-novablast-6-vs-brooks-ghost-18` | 316 | 65, 75 |
| Finder | `/tools/running-shoe-finder` | 67 | **75** (default) |

---

## 4. Performance

Quality numbers **unchanged** (65 / 70 / 75). Transfer budgets in `tests/image-delivery.test.ts` unchanged. Card stays ≤ 75; thumb ≤ card.

At the same `w=384` source, bytes still rise with `q` (65 < 70 < 75). Declaring the allow-list does not re-encode at a higher quality.

---

## 5. CI

| Command | Exit | Notes |
|---|---:|---|
| `npm run lint` | **0** | empty ESLint output |
| `npm run typecheck` | **0** | `tsc --noEmit` |
| `npm test` | **0** | 58 files / **597** tests |
| `npm run build` | **0** | Next 15.5.24; first attempt raced on `.next/export` (machine load); clean retry **0** |

Logs: [`../data/rc-76/logs/`](../data/rc-76/logs/).

Regression: `tests/image-delivery.test.ts` asserts `images.qualities === [65, 70, 75]` and that `src/` does not request other `quality={N}` values.

---

## 6. Status

`IMG-QUALITIES` → **CLOSED**. Next 15.5+ warning cleared; Next 16 default-`[75]`-only would have broken cards/thumbs without this allow-list.
