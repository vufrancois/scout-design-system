# Buyer App — Order Detail

**Status:** ✅ built and cascaded
**Page:** `design-system/buyer/order-detail.html#<order>` — showcased states: `#657` (Delivered), `#373` (Partially Fulfilled), `#512` (Not Fulfilled); any other order number gets a generic synthesized detail so tracking-table links never dead-end.
**Reference:** three buyer order-detail screenshots (Not Fulfilled / Partially Fulfilled / Delivered).

## What shipped
- **Lifecycle Stepper (buyer)** — 8 fixed slots with VENDOR/YOU actor captions, whose-turn active ring (amber "your move" / sky "in progress"), completion dates under done steps. The slot order encodes the new pipeline: Delivery Validation before Invoice Submission.
- **Next-Task Strip (buyer port)** — Delivery Validation entry, rendered in *every* state per the fulfillment-independent validation model; Start button stubs to a toast until the validation screens land.
- **Summary** with per-item status pills + Item Total / Shipping · method / Total / Paid Total.
- **Unfulfilled Items card** (paired Requires shipping / Awaiting fulfillment pills) and **Fulfillment cards** with the 3-slot mini-stepper; "Mark as delivered" on shipped fulfillments transitions the stepper and item pills live. Empty state inside the card when no fulfillments exist.
- **Payment card** with the neutral Notice callout; **rail**: Fulfilled-by (warehouse + linked vendor), Customer facts, Documents disclosure, Activity timeline with "Show N more" collapse.
- Wired: tracking-table Order #s link here; back link returns to Orders and Invoices.

## Approved improvements (all 7)
1. Fixed stepper labels (reference renamed steps by state); state lives in the node + date.
2. Single status pill (reference had header + progress-card duplicates).
3. Address written once — dropped the duplicated "Metairie, LA, 70006" line and "US".
4. Quantities normalized to "× 1" (reference "1x").
5. Our hero treatment (navy band, back link, identity line + copy button) instead of the reference's flat page.
6. Activity strictly newest-first around the collapse marker.
7. Wiring per above; Mark as delivered kept per the new validation model.

## Polish & follow-ups
- Customer card: label column narrowed to 80px and the contact email set to wrap anywhere at 13px — no more mid-word "demoinc.c / om" splits.
- Fulfillment-vocabulary alignment (see order-tracking.md): #373's "Partially Fulfilled" status pill flipped from amber to sky — per whose-turn, partial fulfillment is the vendor's move, so the buyer sees sky.

## Reconciliations
#657 is the checkout receipt order (3 dryers, $3,783.48 + $11.99 = $3,795.47, placed Aug 24); #512 matches the tracking table's Gorman Bros row ($563.00, Jul 22); #373's math closes ($818.09 + $161.29 + $7.99 = $987.37).

## Components cascaded
Gallery section **Buyer App · Order Detail** (Lifecycle Stepper, Next-Task Strip, Fulfillment Mini-Stepper, Activity Timeline) + design-doc **Buyer Order Detail** rules; `docs/design.md` regenerated.
