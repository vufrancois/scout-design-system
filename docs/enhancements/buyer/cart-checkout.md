# Buyer App — Cart & Checkout

**Status:** ✅ built and cascaded
**Pages:** `design-system/buyer/cart.html` · `design-system/buyer/checkout.html` (`#address → #shipping → #review → #placed`) · shared store `design-system/buyer/cart.js`
**Reference:** cart, 3-step checkout, and confirmation screenshots. The cart Empty State had no reference — designed net-new.

## What shipped
- **Live cart store (`cart.js`)** — localStorage `scout-cart`, property-scoped like wishlists; seeds the reference's 3 dryers ($3,783.48) on first run. Every Add-to-cart is real now: PDP buy box (with qty), product cards, compare table, wishlists' "Add N to cart". The App Bar cart icon (now → cart.html on all 11 pages) carries a rose count badge, live via `cart-changed`/`storage` events.
- **Cart page** — Vendor Group cards (logo + name + qty count + vendor total pill), item rows with Quantity Stepper, rose remove, line totals, and a per-item **GL Code & Unit disclosure** (tinted panel) whose fields are the new **Combo Box** — a searchable select with mono code chips and sub-label rows (GL codes; units as B120 · Building B · 2 Bedroom 2 Bath / 2BR/2BA per reference); picks persist on the cart item via `CART.setMeta`. Request Quote is a compact outline button in the vendor header beside the total (one-primary rule; Proceed to Checkout wins); no footer subtotal — the header pill and rail already price the group. Order Summary rail + Delivering-to card + Secure Checkout bar.
- **Checkout** — one page, hash states, translucent on-hero **Step Band** (done steps clickable back). Address step: read-only property address (fixed reference's duplicated "Metairie, LA 70006" line; the reference's "Billing address is the same as shipping address" note removed — Purchase Order checkout has no billing form to diverge from), contact card (the optional-phone input since removed — see 2026-09-04 addendum). Shipping & Payment: **Option Rows** (sky icon tile, trailing price, primary-fill radio; emerald Free pickup; Direct Checkout disabled with "Coming Soon" chip), per-vendor **progress chips** (Shipping → Payment → Ready, normalized from the reference's mixed "1 — ✓ — 3"), totals-rows footer per vendor. Review gated on every vendor Ready; "Place N Order(s) – $total".
- **Multi-vendor support** — vendor groups each pick their own shipping; Continue disabled until all Ready; review sums per-vendor shipping ($3,783.48 + $11.99 = $3,795.47 matches reference).
- **Empty State** (net-new) — icon circle, "Your cart is empty", property-naming description, single primary "Browse the Marketplace".
- **Confirmation** — redesigned into a receipt: hero kept as a bare color backdrop (no icon/title) with the emerald check straddling its bottom edge exactly 50/50, identity line spaced under the title ("Confirmation sent to …"), **Orders placed card** with one row per vendor order (sequential persisted order #s, vendor, items · shipping method, total, grand total), amber **"Sent for approval"** callout linking to Order Approvals when the total exceeds the property budget ($2,500 demo threshold), "What happens next?", Track your orders + Continue Shopping. Placing clears the cart: badge → 0 (the reference's badge going 3 → 6 after placing was a bug, fixed). Flow bug found in testing: checkout hardcoded Magnolia on entry, bouncing non-Magnolia carts — the cart's Proceed now hands the property to checkout.

## Redundancy pass (post-build)
- Rail vendor breakdown rows render only with 2+ vendors — a single-vendor cart went straight from four identical prices (header pill, vendor row, Subtotal, Estimated Total) to two.
- Unit price reads "$1,210.00 / each" (PDP convention) so it states its role instead of duplicating the line total at qty 1.
- Kept: hero/vendor-header/Subtotal counts (different scopes), Estimated Total = Subtotal pre-shipping (the Shipping line narrates why), Delivering-to (adds the street address).

## Checkout design pass (post-build)
- Rail parity with cart: vendor rows only at 2+ vendors, "Subtotal (N items)" labels — the single-vendor rail no longer priced the same number three times.
- Address/Contact cards: divided headers (icon + title, rule, content) and muted inner boxes replacing border-in-border.
- Step band connectors fill white as steps complete; done steps get hover affordance.
- Review: vendor cards collapse to the selected options only (unselected shipping/payment rows hidden — first faded, then removed entirely per feedback), and the Ready progress chips + section checkmarks hide too — progress affordances stay on the step where progress happens. The rail's per-vendor check is the review's only confirmation mark.
- Review refinements: per-card Edit link back to #shipping (Buyer details' #address Edit link since removed — see 2026-09-04 addendum); item disclosures auto-open on entering review (last look at the goods); rail vendor blocks slimmed to name + check + total (dropping the duplicated items/method/payment lines); "(1 items)" pluralization fixed across cart + checkout rails. Kept: radio marks on selected rows, and the total on the place button (self-sufficient commitment).
- "Expedited $25" → "Expedited" (price already trails); pickup sub-heading icon sized to its 11px label; section-complete checks emerald (svg color rule was overriding); primary buttons get a real :disabled state.

## Shipping & Payment improvement pass
- Every shipping option shows duration **and** arrival date ("2 Business Days / Arrives Wed, Aug 26"); In-Store Pickup folds into the same "Shipping & Pickup" list ("Ready today · 8 mi away", emerald Free), fastest → cheapest.
- Shipping rows drop their identical truck icon tiles — icons only where they differentiate (payment keeps them).
- Item recap collapses into a header disclosure ("N items · $total"); the vendor card's decisions now lead and fit above the fold.
- Order Total rail is sticky under the App Bar (static below 1100px).
- Auto-advance: when a vendor turns Ready, the next incomplete vendor card smooth-scrolls into view.
- Held: hoisting Payment Method to a single page-level choice (item 5).

## Nit pass
- Step band stretches full content width (was shrink-wrapped by the hero's flex-start).
- Icons/avatars normalized to system components: 36px `.icon-tile tile-sky` for card titles and address/delivering blocks, standard `.v-avatar` for people (the app-bar `.avatar-ring` is brand chrome only).
- Full-width CTAs (Proceed, Continue to Review, Place N Orders) center their labels via new `.btn-block` utility.
- Shipping & Payment arrives with nothing pre-selected — Ready now requires both choices, and Continue gates on it.

## Reconciliations & fixes vs reference
- Cart badge lifecycle honest (3 → 0 after placing, never 6).
- Vendor identity flows through adds (PDP product #1 is API Test - Chadwell, not SD); vendor code map extended (AW, SA).
- Vendor-group header counts quantities, not line items, matching the rail's "(N)".
- "DemoRole Buyer"/"Demo Buyer Vu" → Alicia Grant.

## Pitfalls hit
- `.opt-row` is a `<button>` — needs explicit `color: var(--foreground)` or dark mode renders black-on-graphite.
- Confirmation page has no hero, so content needs top padding to clear the floating App Bar.

## Components cascaded
Gallery section **Buyer App · Cart & Checkout** + design-doc **Cart & Checkout** rules: live cart store + badge, Cart Item + Vendor Group, Order Summary rail, Checkout Step Band, Option Row, vendor progress chips, Empty State, Confirmation. `docs/design.md` regenerated.

---

## Addendum (2026-09-04) — coupon field moved to Review & Place Order

The coupon input previously sat in the Address step's Order Summary rail — before shipping was even priced. It now appears only on the **Review & Place Order** step, at the top of the Review Order rail above the totals. Rationale: adjustments belong where the final number is confirmed; earlier steps keep the summary read-only.

Also removed the **Edit** link from the Buyer details rail card (shipping + review steps): it only jumped back to the Address step, where the buyer and property are fixed by the Context Switcher — a link that edits nothing is misleading.

And removed the **Phone Number (optional)** input from the Address step's Contact card — an optional field nothing consumed. The step is now purely confirmational: address + contact, Proceed.
