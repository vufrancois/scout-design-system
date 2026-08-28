# Buyer App — Order Tracking (Orders and Invoices)

**Status:** ✅ built and cascaded
**Page:** `design-system/buyer/orders.html` (`#open` · `#backordered` · `#invoiced` · `#closed`)
**Reference:** Orders and Invoices screenshots — Open / Backordered / Invoiced / Closed tabs with per-tab stat cards, expandable order tables, Validate actions, amber attention rows.

## What shipped
- **Four tabs as hash states** under one hero, using the **buyer Filter Tabs** (vendor tab-bar ported to spec: muted radius-lg bar, radius-md items, primary-fill active + shadow, count chips). Each tab has its own selectable metric cards (`stat-card-colored`, new **stat-violet** variant) and its own table columns.
- **Expandable sortable table** (Approvals component, wholesale): expander → roomy Order Items block, sortable Order #/Total/Date, dot-pill statuses, Validate as the row primary, ⋯ **row overflow menu** (View order / Download invoice / Report an issue) on closed/validated rows, **Pager** ("Showing 1–10 of N", Previous/Next) per the tables-paginate rule.
- **Attention rows** — new `.row-attn` amber-soft row fill + warning triangle beside the order number for rows awaiting the buyer's move.
- Wired: Orders mega-menu "Order Tracking" (all 11 pages), Home's Validate Deliveries → `#open`, Review Invoices → `#invoiced`, both breakdown View-All links, and the checkout confirmation's "Track your orders".

## Approved improvements (1, 4, 5, 6)
1. **Open cards reconciled to Home** — the reference's self-disagreeing "Total 63 / Pending 63 / In Transit 9 / Delivered 9" became Total Open 62 = To Fulfill 36 · To Ship 11 · Shipped 7 · Delivered 8, exactly Home's Open Orders breakdown, as clickable filters. (Card originally labeled "In Transit" per the reference; renamed in the vocabulary alignment below.)
4. **Property dropdown removed** — Context Switcher is the one *scope* control (tab counts, cards, and rows all re-scope); search widened to vendor/order #/property/items. Later refined: Vendor + Property live in one nested **Add filter** menu (vendor-app pattern), Property visible only under "All properties" (hidden and cleared when a property is scoped). Order status / fulfillment deliberately not facets — the metric cards are those filters.
5. **Backordered fixed** — the zero-count banner + generic "No orders yet / order history" empty state became one contextual empty state.
6. **Column hygiene** — identity-first order (Order # leads), Items folded into the expander, @handles dropped, dot pills everywhere.

## Product update: fulfillment-independent delivery validation
Team update (post-build): the buyer can validate as soon as items arrive, without waiting on the vendor or invoice; the save creates the fulfillment vendor-side (marks items shipped + delivered); partial states are the normal case; validated lines are immutable (Raise Claim only); invoice submission follows delivery validation; audit fields record who validated. Applied to the tables:
- Held item (3) resolved in the reference's favor: **Validate on every open row is correct** and stays.
- New partial state: sky "Partially Delivered · n/m" pill — validated count folded into the badge (seeded on #408 4/10 + two more in-flight orders); rows keep their lifecycle bucket so the card counts still reconcile with Home.
- Attention tint narrowed to arrived-but-unvalidated rows; row toast speaks the flow's language ("Start Delivery Validation").
- Design doc: Order Tracking rules updated + Lifecycle Matrix note (pipeline = delivery validation → invoice submission → invoice validation; **vendor Order Detail demos still show the old order — flagged for a later reconciliation pass**).
- The Delivery Validation screen itself (item checkboxes, capped counters, locked lines, Raise Claim) is **deferred — reference screens incoming**.

## Fulfillment vocabulary alignment (post-build)
Canonical enum mapped into the vendor Lifecycle Matrix (new "Buyer fulfillment pill" column): Not Fulfilled → Fulfilled → **Shipped** → Delivered, with partials as aggregates of each fulfillment's Fulfilled → Shipped → Delivered mini-lifecycle (Partially Fulfilled · n/m, Partially Shipped · n/m, Partially Delivered · n/m — each staying in its least-advanced bucket so card counts reconcile). "In Transit" retired everywhere — buyer cards/pills and Home's breakdown row, **and the vendor app was updated in the same pass** (documented here since the change originated with this view):
  - `design-system/orders.html` (vendor) — list pill, stage-label map, and tab label "In Transit" → "Shipped" (3 occurrences)
  - `design-system/order-detail.html` (vendor) — the `#shipped` state's fulfillment pill label
  - `design-system/index.html` — the vendor gallery's Lifecycle Matrix demo row
  - `design-system/design-doc.html` — the Lifecycle Matrix itself gained a "Buyer fulfillment pill" column plus the "one vocabulary, two lenses" and "partials are aggregates" rules.

Colors flip by viewer per whose-turn: pre-delivery reads amber to the vendor, gray/sky to the buyer; Cancellation Pending is an overlay (rides any pre-delivery step) — vendor amber, buyer sky (flipped from the reference's amber). Buyer order-detail #373's Partially Fulfilled pill flipped to sky accordingly.

## Polish pass
- **Filter Tabs corrected to the vendor spec** — first port used a bordered card-surface pill bar with fully-rounded items; rebuilt as the system's muted radius-lg bar with radius-md items, active = primary fill + shadow-xs, count chips on card fill.
- **Attention-row tooltip** — the warning triangle now explains itself on hover ("Delivered — awaiting your validation"). Two tooltip bugs fixed in the process: the default centered tooltip clipped at the table container's edge (new left-anchored variant for `.row-warn`), and it inherited the mono font from the order-number cell (explicit UI font on the tooltip).

## Held for revisit (2, 7)
- (2) Order Status column stays on Open even though all rows read Pending.
- (7) No live `scout-last-order` injection — #657 ($3,795.47 · Aug 24, our checkout order) and #411 (the approvals order) are seeded statically to match the reference.

## Reconciliations
- Invoiced = 16 (11 await · 4 validated · 1 paid · 0 captured) and Closed = 28 (27 + 1) match Home and the reference exactly.
- Deterministic LCG-generated rows fill each bucket to its exact count; fixed top rows reproduce the reference (#657, #512, #486 Cancellation Pending, #421, #420, #411, #408, #404; invoiced #645…; closed #515…).

## Components cascaded
Gallery section **Buyer App · Order Tracking** (Filter Tabs, Attention Row, Row Overflow Menu, Pager) + design-doc **Order Tracking** rules; `stat-violet` card variant added; `docs/design.md` regenerated.
