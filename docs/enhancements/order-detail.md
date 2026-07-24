# Order Detail — UX Enhancement Summary (in progress)

**View:** [order-detail.html](https://scout-design-system-beta.vercel.app/order-detail.html)
**Date:** started 07/23/2026 · **Status:** in progress — building state by state (1 of 8 states done)

Recreation of the Orders detail sub-pages using the component library, state by state through the order workflow: Placed → Fulfilled → Shipped → Delivered → Sales Tax → Validated → Paid → Completed. This log accumulates as each state's screens land.

## State 1 — Not Fulfilled ✅

### 1. Order detail page
Two-column detail layout (main + 360px rail): header panel (order ID + copy, date/channel sub-line, status pills, Cancel Order), Order Progress stepper, Summary with line items and totals, Payments, Unfulfilled Items with the promoted **Fulfill Items** action; rail carries Documents, Buyer, and Activity. Linked from every Orders-list row. Dark mode and responsive behavior inherited from the shared chrome.

### 2. Fulfillment flow as a centered modal
The reference design used a full-screen takeover; the four-row form (Location, Shipping method, Items to fulfill, Send notification) fits comfortably in the standard **centered Modal** (640px, dim overlay, esc chip + X, pinned footer actions), keeping the order context visible behind it. Decision codified: task flows use the centered Modal, not takeovers.

### 3. Stepper speaks whose-turn-is-it
Each of the 8 nodes carries an actor caption (**Auto / You / Buyer**); the current step glows amber (the action color) with an amber caption; "Placed ✓" replaces "Not Fulfilled" as the first node (a state isn't a milestone). The progress badge summarizes in Title Case: "1 of 8 · Next: Fulfill Items".

### 4. Vocabulary synced with the lists
Header pills use the condensed list vocabulary — **To Fulfill** (fulfillment) and **Needs Tax Input** (payment) with Tooltip sub-detail — instead of "Placed / Not fulfilled", so list and detail agree. Dates are MM/DD/YYYY, totals carry the USD suffix, "paid by buyer" per the terminology rule, and the buyer is real reconciled demo data (Alicia Grant · Demo Inc. · Magnolia Place Apartments, with links to both detail pages).

### 5. Detail-header polish
The Documents combo-control (dropdown + chip + refresh) became a plain section title (no count pill); status pills and the Cancel action center vertically against the two-line ID block, on one shared centerline.

## State 2 — Fulfilled ✅

### 6. Stateful page architecture
Rather than cloning a page per state, order-detail is now **one stateful page** driven by a URL hash (`#placed`, `#fulfilled`, …): a small state config renders the header pills, stepper progress, panel swaps, and activity feed. The Orders list and peek drawer **deep-link each row to its matching state** (To Fulfill rows → #placed, To Ship rows → #fulfilled), so browsing the demo tells a coherent story.

### 7. Fulfillment #1 panel
The Unfulfilled Items panel gives way to a Fulfillment card: compact line item, fact rows (Shipping from → **New Orleans Hub**, linked, from our reconciled locations · Provider · Tracking —), a **To Ship** pill followed by the Packing Slip action (status before action, matching the other panels; vocabulary sync — the reference said "Awaiting shipping"). Stepper reads 2 of 8 · Next: Mark as Shipped; Activity gains "Items fulfilled."

### 8. Action hierarchy follows the stepper
The reference made "Mark as delivered" the primary button while the next step was actually shipping. Reordered: **Mark as Shipped is primary** (matches the stepper's next milestone), Mark as Delivered is a secondary skip-ahead, and Cancel Fulfillment sits left-separated as the destructive escape — the primary action always advances the pipeline.

### 9. Mark as Shipped modal
The full-screen takeover became the standard centered Modal: Tracking URL form row (optional, with helper text) and a Packing Slip block with a "No packing slip generated" empty-state row + Generate action, Cancel/Save footer. Added a **text input** to the form component family.
## State 3 — Shipped ⏳
## State 4 — Delivered ⏳
## State 5 — Sales Tax ⏳
## State 6 — Validated / Confirm Payment ⏳
## State 7 — Buyer Paid ⏳
## State 8 — Completed ⏳

## Design system additions (running)

- **Stepper** (gallery + design doc) — done/current/upcoming states, connector lines, actor captions per the whose-turn-is-it rule, Title Case progress badge
- **Line Item + Totals** (gallery + design doc) — thumb/name/mono-SKU/variant anatomy, price × qty, emphasized grand-total row
- **Document Row** (gallery + design doc) — soft-sky file row with date meta and download action; no count pill on section titles
- **Form Rows & Selects** (gallery + design doc) — label + description / control rows for modal task flows, 38px Select, quantity input with bound, rose stock deltas
- **Detail Page Layout** (design doc) — main + 360px rail, stacking under 1100px; rail fact rows with linked parties and copyable addresses
- **Modal-over-takeover rule** (design doc) — task flows use the centered Modal; full-screen takeovers avoided
- **Drawer component + Modal-vs-Drawer rule** (design doc) — 420px right panel for inspect-without-navigating; Modal commits transactions, Drawer peeks/references; never both for one job. Prototyped as the **order peek drawer** on the Orders list (row click → summary, pills, contextual action, Open Full Order)
- Gallery gained an **"Order Flow & Forms"** section with live examples of all of the above

## Fixes along the way

- Missing base component CSS on the new page (`.row-action`, unscoped `.avatar`) — the recurring page-clone pitfall, now on a standing checklist
- Header badge alignment: pills inherited `align-self: flex-start` from cloned detail-header CSS, breaking vertical centering next to buttons — scoped override added
