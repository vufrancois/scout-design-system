# Cancellation Resolution — Vendor Approval & Canceled Terminal State

**Status:** ✅ built and cascaded
**Pages:** vendor `order-detail.html#cancelreq` → `#canceled` (live flow); buyer `buyer/order-detail.html#153` (terminal); buyer Closed tab's Canceled row
**Reference:** Vendor #486 Cancel Order screens (rose strip, cancel modal with required reason) + buyer canceled order #153.

## What shipped
- **Vendor `#cancelreq`** — the buyer's Cancellation Pending arrives as a rose "Cancellation Requested" header pill and a new rose-tinted (`.task-strip.danger`) strip: "Action Required · Cancel Order · The buyer asked to cancel this order before fulfillment…" with a danger **Cancel Order** CTA (the previously-inert header Cancel Order button is wired to the same modal).
- **Cancel modal** — consequences stated (items to stock, shipping waived, stale invoice removed, buyer notified, history visible) + **required cancellation reason** ("Required. This reason will be visible to the buyer.", 500-char counter); Cancel Order disabled until a reason exists; Keep Order backs out.
- **Vendor `#canceled` terminal** — confirming cancels live: the Order Progress stepper is **removed entirely** (a pipeline that will never complete isn't shown as one — new `hideProgress` state flag), rose Canceled pill, strip becomes the terminal record quoting the reason, feed logs "Order canceled · '<reason>' · shared with the buyer."
- **Buyer `#153` canceled terminal** (reference-matched: 2 freezers, $1,730.61) — no stepper, no task strip, no claim entries, no fulfillment cards; an **Order Status card** carries the Canceled pill + "Canceled by Scout Demo Vendor · May 26, 2026" + the quoted reason + "Nothing was charged — order history remains visible for your records." Activity: canceled → requested → placed.
- **Closed tab reconciled** — the generated filler Canceled row replaced by fixed #153 linking to the seeded detail (counts stay 28 = 27 + 1).

## Model rules
- Cancellation resolves through the vendor; the reason is **required and buyer-visible** — the mirror of claims' "the buyer requests, the vendor decides."
- **Canceled is terminal on both apps: no stepper, no tasks.** The Order Status card is the one statement (state expressed once).
- The same Cancel Order flow covers the all-merchandise-canceled trigger (every line claim-canceled — cancel to waive shipping and close the balance), per the vendor reference.

## Held
- Vendor deny/partial-approve path (Keep Order simply closes the modal today — a "decline the cancellation with a reason back to the buyer" flow is unmodeled).
- Buyer-side live transition (#486 stays pending as the demo of the requesting state; #153 is the resolved demo).

## Components cascaded
Design-doc cancellation rule (Buyer Order Detail section); `.task-strip.danger` (vendor); demo-script rows for `#cancelreq` and buyer `#153`; `docs/design.md` regenerated.
