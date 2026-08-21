# Buyer App · Marketplace — UX Enhancement Summary

**View:** [buyer/marketplace.html](https://scout-design-system-beta.vercel.app/buyer/marketplace.html)
**Date:** 08/21/2026 · **Status:** ✅ built and cascaded

The storefront landing: masthead, hero search, promo carousel, the 29-category grid, and the category drill-in modal. Built on the shared buyer shell (`buyer.css` + `buyer-components.css`).

## Storefront

### 1. No masthead
The reference opened with a "SCOUT | MRO MARKETPLACE" lockup and a subline. Both were dropped: the App Bar already carries the logo and the active Marketplace chip, and the property is named in the Context Switcher — the masthead only repeated them and pushed the content down. The page now opens straight into the full-width search, promos, and categories.

### 2. Hero search with AI as a mode, not a chip
Our Search at hero size (58px pill, full content width, ring on focus), **sticky under the App Bar** so it stays reachable while browsing all 29 categories. The reference's free-floating "AI Search" chip + arrow button became a **Keyword / ✦ AI segmented mode** inside the field — per the existing rule that AI actions wear the sparkles icon — with a mode-specific placeholder ("Describe what you need, e.g. …") and Enter to submit; the redundant arrow button is gone.

### 3. Promo carousel without autoplay
Six **Marketing Cards** (hero gradient, icon tile, 20px title, body, "Learn more →") in a paged rail: 3 per view (2 under 1100px, 1 under 820px), dots + prev/next. **No autoplay, so no pause button** — the reference's pause control was apologizing for content moving under a reader.

### 4. Category Tiles
All 29 categories from the reference as a new **Category Tile**: tonal sky→card gradient, 16px/600 title top-left, artwork bottom-right, hover lift. Grid 5 → 4 → 2 across breakpoints. **Artwork**: the reference uses product renders we don't have; tiles ship with a large tinted Lucide icon per category in the art slot (the slot also accepts an `<img>`), so swapping in renders is a content change, not a component change. This is the one deliberate fidelity gap.

### 5. Browse Modal for the drill-in
Clicking a category opens a **wide Modal variant** (1200px; our standard caps at 640) with a title, a **category pager** (‹ › 1 / 29, wrapping, also ← → keys), close, and a 4-up grid of subcategory tiles with a "16 subcategories" meta line. Appliance Parts carries the reference's 16 subcategories; every other category has 6–8 plausible ones so all 29 pages work. Esc and outside-click close; body scroll locks. Honest note: once product listings load beneath subcategories, a dedicated category page with a breadcrumb will scale better than a modal — revisit when those screens arrive.

### 6. Chrome
Marketplace is the active nav chip; Demo Environment tag and chat bubble dropped as before; dark mode and responsive verified.

## Design system additions

- **Hero Search with mode segment** — full-width 58px search pill, Keyword / AI segmented toggle inside the field
- **Promo Carousel** — Marketing Card rail with dots + arrows, paged by viewport, no autoplay
- **Category Tile** — tonal tile, title top-left, art slot bottom-right; `.sm` variant for subcategories
- **Browse Modal** — wide Modal variant with header pager (‹ › n / N) and scrollable body
