# GA4 event matrix

| Event | Trigger | Page/surface | Parameters | GA4 purpose | Business purpose |
|-------|---------|--------------|------------|-------------|------------------|
| `page_view` | App Router path change (once per path+query) | All | `page_type`, slugs, `page_path`, `page_location` | Traffic / engagement | Understand journeys |
| `view_product` | Product page view | `/products/[slug]` | `product_slug`, `page_type` | Content engagement | PDP interest |
| `view_review` | Review page view | `/reviews/[slug]` | `content_slug`, `product_slug` | Content engagement | Review consumption |
| `view_best_guide` | Best-guide page view | `/best/[slug]` | `content_slug` | Content engagement | Buying-guide reach |
| `view_guide` | Guide page view | `/guides/[slug]` | `content_slug` | Content engagement | Editorial reach |
| `view_comparison` | Comparison page view | `/compare`, `/compare/[slug]` | `content_slug` | Content engagement | Compare usage |
| `view_item` | Product page view | PDP | `item_id`, `item_name` | Ecommerce (view) | Catalog interest (not purchase) |
| `select_item` | Click product from finder results | Finder results | `item_id`, `item_list_name` | Ecommerce (select) | Finder → PDP |
| `finder_start` | Finder flow start | Finder | `finder_id` | Funnel | Finder adoption |
| `finder_answer` | Question answered | Finder | `finder_id`, `question_key` | Funnel | Drop-off by step |
| `finder_complete` | Finder completed | Finder | `finder_id` | Funnel | Completion rate |
| `finder_product_click` | Product link on finder page | Finder | `product_slug`, `finder_id` | Funnel | Result quality |
| `compare_add` | Product added to compare | Tray / builder | `category_id`, `product_count` | Funnel | Compare intent |
| `compare_remove` | Product removed | Tray / builder | `category_id`, `product_count` | Funnel | Tray friction |
| `compare_complete` | Compare shared | Builder | `source` | Funnel | Share / completion proxy |
| `search` | Header search submit | Global / search | `has_query`, `query_length` | Site search | Demand themes (no raw query) |
| `filter_use` | Catalog filter/sort change | Category listings | `filter_key`, `filter_count` | Engagement | Merchandising |
| `offer_view` | `offer_impression` sink (when fired) | Offer surfaces | `offer_id`, `placement`, `retailer` | Funnel | Offer exposure |
| `retailer_click` | Click on `/go/[offerId]` link | Any offer CTA | `offer_id`, `placement`, `page_type`, … | Conversion proxy | Affiliate outbound |
| `email_signup` | — | — | — | — | **Not implemented** (no real signup API) |
| `price_alert_signup` | — | — | — | — | **Not implemented** (no feature) |
| `purchase` | — | — | — | — | **Never** — not merchant of record |

## Domain sink → GA mapping

| Domain event | GA event |
|--------------|----------|
| `finder_started` | `finder_start` |
| `finder_question_answered` | `finder_answer` |
| `finder_completed` | `finder_complete` |
| `finder_result_product_opened` / `finder_result_clicked` | `finder_product_click` |
| `compare_product_added` | `compare_add` |
| `compare_product_removed` | `compare_remove` |
| `compare_shared` | `compare_complete` |
| `offer_impression` | `offer_view` |
| `offer_click` (server `/go`) | (browser) `retailer_click` via link capture |

## Placement mapping

| OfferClickPlacement | GA `placement` |
|---------------------|----------------|
| `product-hero` | `product_primary_offer` |
| `product-offers` | `product_offer_list` |
| `review` | `review_offer` |
| `best-guide` | `best_guide_product` |
| `comparison` | `comparison_offer` |
| `alternatives` | `alternatives_offer` |
| `finder-results` | `finder_result` |
| other known | `search` / `category_card` / `setup` / `rotation_planner` / `other` |
