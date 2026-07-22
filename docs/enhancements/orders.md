# Orders — UX Enhancement Summary

**View:** [orders.html](https://scout-design-system-beta.vercel.app/orders.html)
**Date:** 07/21/2026

## From ten tabs to one lifecycle

### 1. Condensed statuses (10 tabs → 6)
The old tab bar mixed two axes — fulfillment progress and payment state — plus partial variants: All, Not Fulfilled, Partially Fulfilled, Fulfilled, Partially Shipped, Shipped, Delivered, Awaiting Payment, Active Return, Completed. It's now one fulfillment lifecycle: **All · To Fulfill · To Ship · In Transit · Delivered · Completed** (amber → sky → violet → emerald → gray). Partials fold into their stage, **Active Return became a standard rose status pill beside the stage** ("Return"), and Awaiting Payment left the tab bar entirely — payment isn't a fulfillment stage.

### 2. Payment condensed to whose-turn-is-it states
The raw purchase-order pipeline has ten steps (Placed → Awaiting Tax Input → Awaiting Delivery Validation → Validated Delivery → Invoice Validated → Confirm Payment → Buyer Paid / Marked As Paid → Payment Captured → Order Completed). The payment column now reads it as four vendor-relevant states: **Needs Tax Input** (amber — the one step that's your job) → **With Buyer** (sky — the whole buyer validation/confirmation procession, exact sub-step in the tooltip) → **Paid** (violet — actor as provenance tooltip: "Buyer paid" / "Marked as paid by vendor") → **Captured** (emerald — terminal). "Placed" is the entry event and "Order Completed" already lives in the fulfillment lifecycle. No step is lost — sub-steps and provenance live in a new styled **Tooltip component** (instant dark bubble on hover), with a muted ⓘ glyph on each pill so hoverability is discoverable.

### 2b. Payment moved into the filter button
The four payment states live in **"Add filter"** beside the retained functional **Date range** presets, both left-aligned with standard removable chips — the same toolbar as Quotes. The Awaiting Payment stat card applies the With Buyer filter when clicked; the other three cards jump to their tabs.

### 3. Units at a glance
The Items column showed line-count, hiding real volume. It's now **Units** (true unit totals, sortable — a 6-line order can be 29 units), with "N items" as the muted meta directly beneath the unit count per the condensing rule.

### 4. Table slimmed from 10 columns
Payment Method and the redundant third "Status" column were dropped, leaving one clean **Payment** badge column; Tracking became a compact "Track ↗" link (em-dash before shipment); Property gained the organization as a meta line. Column priority hides Tracking below 1280px and Date below 1100px.

### 5. View + sort buttons removed
Sorting lives on the column headers (all data columns sortable, newest first by default); the toolbar keeps only filters and search.

### 6. Standard playbook + reconciled numbers
Live tabs with counts over a 24-order sample spanning every stage, functional search/filters, live pagination (10/page), bulk selection (**Export** and **Mark Fulfilled**), empty state, and clickable stat cards synced to tabs (duplicate icon bubbles and redundant "View Orders →" CTAs removed). Card counts now agree with the Insights dashboard: 7 to fulfill · 3 to ship · 4 in transit · 48 awaiting payment.

## Design system additions

- **Tooltip component** (design doc) — instant dark bubble via a `data-tip` attribute, with an affordance rule (ⓘ glyph on tooltip-bearing badges) and a when-to-use split: native `title` for supplementary detail, styled Tooltip for load-bearing sub-state
- **One-dimension-per-tab-bar rule** (design doc, Tabs section) — status tabs model exactly one axis; secondary dimensions are filters, not tabs; partial variants fold into their stage; exceptions (returns) are row badges
- **Whose-turn-is-it pipeline rule** (design doc, Tabs section) — multi-actor pipelines condense to turn-based states: exactly one amber vendor-action state, consecutive other-party steps group (sub-step in tooltip), same-outcome-different-actor variants collapse with provenance, automatic events are transitions, never statuses
