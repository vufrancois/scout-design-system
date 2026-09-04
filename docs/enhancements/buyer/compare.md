# Buyer App · Compare Products — UX Enhancement Summary

**View:** [buyer/compare.html](https://scout-design-system-beta.vercel.app/buyer/compare.html)
**Date:** 08/21/2026 · **Status:** ✅ built and cascaded

Side-by-side comparison of two products selected from a listing's compare tray. Built on the shared buyer shell; the listing persists the selection so the page survives refresh (and falls back to a two-product demo when opened cold).

### 1. Comparison Table
New **Comparison Table**: a pinned label column, product columns (media, name, SKU, Add to cart, remove), and attribute rows grouped under Purchase / Product / Specification. A sticky collapsing product header was prototyped to keep long spec lists attributable, but it fought the page scroll; with the comparison limited to two products the columns are unambiguous, so the header scrolls normally.

### 2. Best-value markers
Comparison's job is to answer "which one?"; the reference made you compute it. Objectively comparable rows now mark the winner with a small emerald **Best** tag — lowest price, fastest delivery, pickup available, largest capacity, quietest dB, most cycles, longest warranty — only when there's a single clear winner.

### 3. Differences only, and nothing that compares nothing
The "Show differences only" Switch works: identical rows hide. Rows where every product is "—" are hidden regardless. Rows that differ are lightly shaded even in the full view, so differences read at a glance.

### 4. Data normalized and deduplicated
"EA"/"EACH" → "Each"; Brand appeared twice in the reference (Product and Specification groups) → once; Manufacturer folded into Brand; Category (identical by construction) dropped. Energy rating and Warranty added as rows buyers actually decide on.

### 5. Empty slot
With one product selected an **"Add another product"** dashed column links back to the listing. Comparison is deliberately **two products at a time** — a head-to-head reads cleanly on every screen and keeps the Best markers unambiguous. Per-product remove and Clear comparison remain; an empty state points back to the category.

### 6. Navigation and scale
"← Back to Dishwashers" (the results you came from) instead of a generic "Back to marketplace"; 22px title with the reference's subtitle. Under 820px the table scrolls horizontally with the label column pinned. Dark mode on tokens.

## Design system additions

- **Comparison Table** — pinned label column, product-header columns, grouped attribute rows, differences-only mode, "Best" markers, add-slot column


## Addendum — history-aware back link (09/03/2026)
Arriving at Compare from a product page's AI-alternatives "Compare →" now returns you there: the back link reads **"Back to product"** and uses `history.back()` (restoring scroll) when the referrer is a product page; otherwise it stays "Back to Dishwashers" → the listing. Referrer match handles both clean URLs and `.html` paths.
