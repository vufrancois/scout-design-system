# Order Detail — UX Enhancement Summary (in progress)

**View:** [order-detail.html](https://scout-design-system-beta.vercel.app/order-detail.html)
**Date:** started 07/23/2026 · **Status:** all 8 workflow states built (9 page states incl. `#captured`), lifecycle navigable end to end

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
## State 3 — Shipped ✅

### 10. Shipped state
Three steps done, **Delivered** is the current amber step ("3 of 8 · Next: Mark as Delivered"). Header reads **In Transit** (the order-level stage, matching the Orders list) while the Fulfillment panel's pill reads **Shipped** (the fulfillment-level fact) — both violet, one vocabulary. Post-shipment the panel drops Cancel Fulfillment and Mark as Shipped; **Mark as Delivered is promoted to primary**, continuing the primary-action-follows-the-stepper rule. Activity gains "Items shipped · Just now". In Transit rows on the Orders list deep-link to `#shipped`.

### 11. Confirmation modal for irreversible actions
Mark as Delivered opens a small confirm dialog per the Modal spec (440px, title "Are you sure?", consequence sentence, Cancel + Continue with primary last) — the reference's pattern, rebuilt on our Modal anatomy. Wired from both the Fulfilled state's skip-ahead button and the Shipped state's primary.
## State 4 — Delivered ✅

### 12. Delivered state + Action Required alert
Four steps done, **Sales Tax** is the amber current step ("4 of 8 · Next: Input Sales Tax"). A new **Alert banner** sits between Summary and Payments: dashed border, icon tile, "Action Required · Input Sales Tax" with the consequence ("The buyer cannot validate this delivery until you add sales tax") and the primary CTA. One deliberate change from the reference: the banner is **amber, not red** — in our system amber consistently means "your move" while red/rose means destructive or failed; a blocked-but-healthy order is the former. The fulfillment panel reads **Delivered** (emerald) with its action row gone entirely.

### 13. Input Sales Tax modal — radio cards + live math
The takeover became our centered Modal, and it's fully functional: a new **Radio Card group** (Tax rate % / Tax amount $ / No tax, selected card gets the primary border + accent fill) switches the input's label and placeholder; the input drives a live calc line ("Subtotal $211.14 → tax $17.42") and a Totals block ("New order total $253.56 USD"); **Send to Buyer stays disabled** until the input is valid (or No tax is chosen). Disabled button state joined the button spec.

### 14. Activity feed collapse
The feed follows the reference's "Show 1 more activity" pattern: mid-feed items collapse behind a muted toggle that expands in place — the newest and oldest entries stay visible, the middle folds.

### 15. Next-Task Strip — primary actions un-nested
A page-architecture change spanning all states: instead of nesting each state's primary action inside whichever panel it related to (Fulfill Items in Unfulfilled, Mark as Shipped in Fulfillment #1, the tax CTA in a one-off alert), a single **Next-Task Strip** now lives in a fixed position under the Stepper in every state. Amber dashed with icon, "Action Required · [Task]", one-line consequence, and the page's only primary CTA — the current Stepper step made actionable. Panels were demoted to secondary actions only (Cancel Fulfillment, Packing Slip): *the panel is where you verify; the strip is where you act*. The one-off tax alert was retired (it's just the strip now), the progress badge slimmed to the count alone ("4 of 8") so the next action is named exactly once, and **wait** (neutral, "Waiting on Buyer …", no CTA) and **done** (emerald) tones are ready for the buyer-turn and completed states.

## State 5 — Tax Set / Awaiting Validation ✅

### 16. First wait state — the buyer has the ball
`#tax`: five steps done, **Validated** current with a new **buyer-turn stepper style** — the current ring goes sky instead of amber, because amber strictly means *your* move. The Next-Task Strip debuts its **wait tone**: neutral card, clock icon, "Waiting on Buyer · Validate Delivery," no primary CTA — but it carries a secondary **Edit Tax** button (the reference's "editable until the buyer validates" affordance), reopening the tax modal pre-filled with the sent 8%. The reference's separate "Sales tax set" banner folded into the strip.

### 17. Money and status reconcile after tax
Summary gains a **Sales Tax (vendor) $16.89** row and the Order Total becomes **$253.03 USD**; Payments' Total pending matches. The payment pill normalizes to our 4-state model: sky **With Buyer** (tooltip "Awaiting delivery validation") instead of the reference's orange fifth color "Awaiting Validation" — one color language for "not your turn." Activity logs "Sales tax sent to buyer · $16.89 (8%)" and the collapse now folds two mid-items. Orders list: delivered rows awaiting the buyer (row #302 + peek drawer) deep-link to `#tax`.

## State 6 — Delivery Validated / Awaiting Payment ✅

### 18. Second wait state — invoice review and payment confirmation
`#validated`: six steps done, **Buyer Paid** current (sky buyer-turn ring), "6 of 8." The wait strip reads "Waiting on Buyer · Confirm Payment" — and the Edit Tax affordance is gone, honoring state 5's "editable until they validate." Payments gains the **capture row** from the reference: "Purchase Order — waiting for the buyer to confirm payment before you can capture" with a **disabled Mark as Paid** button that names your next move and why it's locked. Pills stay on the 4-state model (sky With Buyer, tooltip "Delivery validated · awaiting payment confirmation").

### 19. Documents rail — type-accented rows
Buyer validation mints paperwork: the rail grows to three **type-accented Document Rows** — sky Purchase Order, emerald **Invoice #102** with an inline "Replace invoice" secondary action, violet **Receipt of Goods #ROG-515-83** — one soft surface per document type, dark variants included. Activity logs "Delivery validated · by the buyer" and the collapse folds three mid-items. Orders row #302 ("Awaiting payment confirmation") re-points to `#validated`.

## State 7 — Buyer Paid ✅

### 20. The ball comes back — one Mark as Paid, not three
`#paid`: seven steps done, **Completed** current (amber — your turn again), "7 of 8." The strip flips back to action tone: "Action Required · Mark as Paid," CTA opening a confirm modal per the spec (440px, "$253.03 USD will be marked as paid… cannot be undone," Cancel/Confirm). The reference surfaced **three** Mark-as-paid buttons (Summary footer, Payments row, modal); per the primary-actions-never-nest rule the strip owns the only one — the Payments capture row stays as explanation ("Click to confirm when the bank transfer is received"), buttonless.

### 21. Money staging + locked invoice
Summary's Total captured row gains an amber **Awaiting Confirmation** badge with $253.03 staged. Header/Payments pills use the list's violet **Paid** (tooltip "Buyer confirmed payment · awaiting your capture") instead of a fifth "Buyer Paid" variant. The invoice's "Replace invoice" action swaps to a muted **"Locked — order paid"** info row. Activity leads with "Buyer confirmed payment · $253.03 USD" and folds four mid-items. Orders rows #329 and #251 (delivered + Paid) deep-link to `#paid`.

## State 8 — Captured & Completed ✅

### 22. Captured — the last action
`#captured`: seven done, Completed current (amber). The reference floats an emerald banner *above the page header*; per the one-strip-one-place rule ours stays in the fixed slot as action tone: "Action Required · Complete Order," CTA opening the 440px confirm ("closes the order and cannot be undone"). Money flips: the captured badge turns emerald **Confirmed by Vendor**, Total paid by buyer becomes $253.03, the pending and capture rows disappear, and the payment pill goes emerald **Captured**. **Cancel Order leaves the header** — you can't cancel an order whose money has moved.

### 23. Completed — the done tone lands
`#completed`: all 8 steps emerald, "8 of 8," single **Completed** header pill, and the strip's **done tone** debuts for real: "Order Complete · All 8 steps are done — payment captured and delivery validated." No CTA anywhere; the page reads as a record, not a task. Activity leads "Order completed · Closed by you" folding six mid-items. Orders list: captured rows #327/#274 → `#captured`, all five Completed rows → `#completed` (drawer matches). **The full 8-state lifecycle is now navigable end to end.**


### 24. Completing the order is real — and it toasts
Confirming Complete Order now performs the actual transition: the modal closes, the page moves to `#completed` (stepper fills to 8 of 8, the strip turns emerald, Cancel Order vanishes), the view scrolls to the top so the change is visible, and a new **Toast** component slides in bottom-right — emerald check, "Order #515 completed · $253.03 USD captured · all 8 steps done," auto-dismissing after 4s. The demo's final click closes the loop instead of dead-ending; Toast is now available for any mutation feedback across the app.

### 25. Lifecycle Matrix — list and detail on one ruler
An audit of every Orders-list stage × payment combo against the detail states surfaced rows the workflow forbids (payment outrunning fulfillment: To Ship + Paid, In Transit + Captured, pre-delivery buyer states) plus two vocabulary orphans ("Marked as paid by vendor", stray invoice-validation tooltips). Fixes, reconciled to the cent:
- **Lifecycle Matrix codified** (design doc + a live version in the gallery linking to each detail state): workflow step → fulfillment pill × payment pill → whose turn → detail hash, with the **gating rule** "payment never outruns fulfillment — before Delivered the payment pill is always Needs Tax Input."
- **Demo data reconciled to the matrix**: 7 pre-delivery buyer rows retagged to Needs Tax Input (the Awaiting Payment group stays exactly 11 orders), 4 prepaid rows moved to Delivered stage (payment distribution untouched), tooltips normalized; tabs and stat cards updated to the new stage counts (6/2/1/10/5). Every row now lands on a detail state whose pills match the row clicked — zero violations on re-audit.
- **Shared ruler in the peek drawer**: a Progress row ("6 of 8 · Waiting: buyer confirms payment") derived from the same matrix, so the list measures progress exactly like the detail page.

## Design system additions (running)

- **Stepper** (gallery + design doc) — done/current/upcoming states, connector lines, actor captions per the whose-turn-is-it rule; progress badge shows the count only
- **Next-Task Strip** (gallery + design doc) — action/wait/done tones, fixed below the Stepper on lifecycle detail pages; rule: primary actions never nest inside panels, and waiting states are stated explicitly
- **Line Item + Totals** (gallery + design doc) — thumb/name/mono-SKU/variant anatomy, price × qty, emphasized grand-total row
- **Document Row** (gallery + design doc) — soft-sky file row with date meta and download action; no count pill on section titles
- **Form Rows & Selects** (gallery + design doc) — label + description / control rows for modal task flows, 38px Select, quantity input with bound, rose stock deltas
- **Detail Page Layout** (design doc) — main + 360px rail, stacking under 1100px; rail fact rows with linked parties and copyable addresses
- **Modal-over-takeover rule** (design doc) — task flows use the centered Modal; full-screen takeovers avoided
- **Drawer component + Modal-vs-Drawer rule** (design doc) — 420px right panel for inspect-without-navigating; Modal commits transactions, Drawer peeks/references; never both for one job. Prototyped as the **order peek drawer** on the Orders list (row click → summary, pills, contextual action, Open Full Order)
- **Next-Task Strip** (gallery + design doc) — see item 15; action/wait/done tones with the primary-actions-never-nest rule
- **Radio Cards** (gallery + design doc) — mode selection inside task-flow Modals; selected card gets primary border + accent fill; Select when options exceed four
- **Toast** (gallery + design doc) — bottom-right mutation feedback, 250ms slide, 4s auto-dismiss; "toasts confirm, they never ask"
- **Document Row type accents** (gallery + design doc) — sky PO / emerald Invoice / violet Receipt, plus the one inline secondary line rule (accent action or muted locked note, never both)
- **Buyer-turn Stepper node** (gallery + design doc) — sky current ring when the actor is the Buyer; amber strictly means "you act"
- **Badge-in-totals** (gallery + design doc) — inline pill qualifying a money row (amber Awaiting Confirmation / emerald Confirmed by Vendor)
- **Lifecycle Matrix** (gallery + design doc) — canonical step → pills → actor → detail-state table with the payment-never-outruns-fulfillment gating rule
- Gallery gained an **"Order Flow & Forms"** section with live examples of all of the above

## Fixes along the way

- Missing base component CSS on the new page (`.row-action`, unscoped `.avatar`) — the recurring page-clone pitfall, now on a standing checklist
- Cancel Order scoped to `#placed` only — once items are fulfilled the order-level cancel disappears; the destructive escape becomes stage-appropriate (Cancel Fulfillment while unshipped, none once goods are in motion)
- Header badge alignment: pills inherited `align-self: flex-start` from cloned detail-header CSS, breaking vertical centering next to buttons — scoped override added
