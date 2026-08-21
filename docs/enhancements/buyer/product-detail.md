# Buyer App · Product Detail — UX Enhancement Summary

**View:** [buyer/product.html](https://scout-design-system-beta.vercel.app/buyer/product.html)
**Date:** 08/21/2026 · **Status:** ✅ built and cascaded

The product page: gallery, buy box, full-width tabs (AI Summary · Description · Specifications · Spec Sheets), and the AI-powered alternatives rail. Listing cards link here; Compare from an alternative opens the two-product comparison against this item.

### 1. One primary in the buy box
The reference stacked three primary-filled buttons in one column (Explore AI Alternatives, Add to cart, Chat with seller). **Add to cart** is the only primary; **Explore AI alternatives** is outline + sparkles per the AI-action rule and scrolls to the rail; **Chat with seller** and **Buy now** are outline; wishlist and Compare are icon buttons. One decision per panel.

### 2. Buy Box anatomy
New **Buy Box**: 22px title → fact rows (SKU in mono, Category linked, Brand) → **Delivery Options** panel → **Quantity Stepper** → price block → action row → vendor panel → ratings. Everything the purchase decision needs, in the order it's made.

### 3. Delivery options tied to the property
The reference's green-tinted card read as "status: good" in our system; it's information, so the panel is neutral with emerald icons where an option is available and muted where not. Pickup is property-dependent, so the copy follows the **Context Switcher**: "Select a property to check pickup" for All properties, "Available · 8 mi · ready in 2 hrs" at Magnolia Place, "Not available at this property" elsewhere. Shipping shows ETA and cost ("3–5 business days · $15.00").

### 4. Quantity Stepper and live line total
New −/+ **Quantity Stepper** (bounded 1–99, minus disabled at 1) that updates a line total under the price ("3 × $376.38 = $1,129.14"). Price uses the card's block: `$376.38 / each`, `$489.00 · Save 23%`.

### 5. Product details as a section
The reference tucked tabs under the image, squeezing Description and Specs into half the width and leaving the strip easy to miss. The tabs now live in a full-width **Product details** card below both columns — heading, underline tabs, padded content — so it reads as a section, not a floating control. **AI Summary** is a new tinted **AI Block** (sparkles header, bullets, a "generated from… verify critical specs" footnote); **Specifications** is a key/value spec table; **Spec Sheets** are Document Rows with download actions.

### 6. Alternatives rail on the Product Card
The reference's alternatives used a different card (gradient buttons, "Scout Price" label, "EA", vendor logos, a truncated "Compare specs ✓ 4/5" accordion). They now use our fixed-slot **Product Card** plus two additions worth keeping from the reference: a **"−$57.38 / +$168.71 vs. this item"** delta line (emerald/rose) and a **"Matches 4 of 5 specs"** footer whose Compare link opens the two-product comparison against the current item. Eight nearest-priced alternatives across approved vendors in a **4-column grid** (3 → 2 → 1 responsive), sortable by relevance, price, or spec match — a grid, not the reference's carousel, because a sort control on a horizontal rail reorders items you can't see. The delta takes the price block's second line (alternatives don't show compare-at pricing), so the card stays tight.

### 7. Ratings, vendor, gallery, navigation
Star Rating in its empty state with Empty State copy; vendor panel with avatar, name, "Approved vendor · 21 dishwashers", Chat with seller (opens Messages); Product Gallery at a fixed 400px with a thumbnail strip (the reference's half-page image pushed the buy box into a narrow column); the redundant "Back to category" link is gone — the breadcrumb is the one navigation path (glyph placeholders in `<img>`-ready slots, as across the marketplace). Dark + responsive (buy box stacks under the gallery below 1024px).

## Design system additions

- **Buy Box** — title, fact rows, delivery options, stepper, price block, action row (one primary), vendor panel, ratings
- **Quantity Stepper** — bounded −/+ with live line total
- **Delivery Options panel** — shipping vs pickup, cost + ETA, property-aware availability
- **AI Block** — tinted AI-content card with sparkles header and provenance footnote
- **Product Gallery** — main image + thumbnail strip
- **Alternatives grid** — Product Card variant with "vs. this item" delta in the price slot and a spec-match footer
