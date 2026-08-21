# Buyer App · Product Listing — UX Enhancement Summary

**View:** [buyer/products.html](https://scout-design-system-beta.vercel.app/buyer/products.html)
**Date:** 08/21/2026 · **Status:** ✅ built and cascaded

The category results page (Dishwashers · 74 results): faceted Filter Rail, results header, live search, Product Card grid with compare and wishlist, pagination. Every control is functional against a 74-product demo catalog calibrated to the reference's facet counts.

## Results

### 1. Neutral results header with breadcrumb and applied-filter chips
The reference's blue results band duplicated the hero treatment and fought the product imagery. Replaced with the page-header pattern: **breadcrumb (Marketplace › Appliances › Dishwashers)**, 22px title, "74 results" (which becomes "9 results · 1 filter applied"), sort right. An **applied-filters chip row** beneath makes active filters visible and removable one at a time, with Clear all — "Filters ①" is no longer the only evidence a filter is on.

### 2. Sort that sorts, with a real default
"Explore" → **Recommended** (in-stock first, then relevance); Most Relevant, Price low→high / high→low, Name A–Z all reorder live.

### 3. Filter Rail — facets that recount
New **Filter Rail**: collapsible sections (Vendor, Availability, Delivery speed, Pickup, Price range), checkbox facets with counts, active-count badge on the title, Clear all. Facets are live and **recount each other** as filters apply (zero-result options dim). The price filter is a new dual-handle **Range Slider** ($319–$1,089, filters on release, handles can't cross). Under 1024px the rail becomes a right-side drawer behind a "Filters ①" button.

### 4. Product Card — fixed-slot anatomy
New **Product Card** built so every card in a row is the same height with price, delivery, stock, and buttons on the same horizontal lines: media slot (overlay Pickup badge + compare toggle) → **vendor eyebrow** (avatar + name, above the title, per e-commerce convention) → title with **two lines always reserved** → **price block of two fixed lines** (`$886.67 / each` on one unwrappable line; `$1,205.08 · Save 26%` beneath as quiet emerald text — reserved even when there's no discount) → **two single-line meta rows** sharing a 14px icon column (delivery promise, stock) → Add to Cart + wishlist pinned to the bottom. The first pass let optional content (strikethrough, a Save pill, long delivery copy) change line counts, so nothing aligned; the slots fix that. Normalizations from the reference: **"EA"/"EACH" → "/ each"**; the truncated shipping chips ("Order before 2pm CST: …") became an untruncated **delivery promise line** ("Guaranteed overnight · order by 2pm CST" / "Arrives in 3–5 business days" / "Ships from vendor · 5–7 business days"); "Pickup · 5 mi" stays as an emerald overlay badge; vendor logos we don't have became a vendor avatar + name; stock reads In Stock / Low stock / Out of stock (out-of-stock disables Add to Cart). Compare got a Tooltip and a selected state.

### 5. Compare tray
Selecting compare on a card adds it to a floating **compare tray** (two products, head-to-head; Compare enables at 2) — the reference's unlabeled scales icon now leads somewhere visible.

### 6. Search stays out of the way
The reference floated the search bar over the bottom of the product grid, covering cards. It's now a **compact sticky search at the top of the results column** (under the App Bar) with the same Keyword / ✦ AI mode segment; it filters within the category as you type.

### 7. Progressive loading instead of pagination
Page numbers are friction on a browse grid (they're right for the vendor's data tables, where you return to row 47). The listing now **auto-loads the next 12 as you near the bottom** (skeleton row while loading), shows a persistent **"Showing 36 of 74" progress line with a bar**, and — the guardrail against bottomless pages — **stops auto-loading after 3 pages (36) and hands off to a "Show 12 more" button** that's keyboard- and screen-reader-reachable. A back-to-top button appears after the first auto-load; filter, sort, and search changes reset to the first 12. Rule to codify: **data tables paginate; browse grids load progressively with a visible count and a manual fallback.** Empty state with a Clear filters recovery action remains. Grid 3 → 2 → 1 columns.

### 8. Data and imagery
74 dishwashers across the reference's six vendors (Scout Demo Vendor 28, Chadwell 21, Gorman Bros 9, Ideal 8, Appliance Warehouse 7, Stanton's 1), $319–$1,089, facet counts matching the reference (In Stock 71, 1–2 days 28, 3–5 days 8, Pickup 36). Imagery: a tinted appliance glyph in the `<img>`-ready media slot — the same flagged fidelity gap as the category tiles.

## Design system additions

- **Filter Rail** — collapsible facet sections with counts, active-count badge, Clear all; drawer under 1024px
- **Range Slider** — dual-handle range input with filled track and live bounds
- **Product Card** — fixed-slot anatomy: media (overlay badge + compare), vendor eyebrow, 2-line title, 2-line price block, 2 meta rows, pinned actions
- **Progressive Loading** — auto-load sentinel with skeleton row, progress line + bar, 3-page auto cap then "Show more", back-to-top
- **Results Header** — breadcrumb + title + count + sort, with applied-filter chip row
- **Compare Tray** — floating selection tray (two products; acts at 2)
