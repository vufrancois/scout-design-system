# Buyer App — Awaiting Payment & Payment Confirmation

**Status:** ✅ built and cascaded
**Page:** `design-system/buyer/order-detail.html#653` (seeded: invoice validated, awaiting payment); also reached live by validating #674's invoice
**Reference:** none — designed from the system (the earlier buyer reference's "Confirm Payment" action confirmed this stage is a buyer task).

## What shipped
- **Seeded #653** — Gold® Dishwasher $505.13 + $53.04 tax + $7.99 shipping = $566.16, per-order invoice number (#001042698; invoice numbers are now `O.invNum`, no longer a single global), full document set, stepper 6 done with Awaiting Payment (YOU) amber "your move." Listed in the Invoiced tab as Validated · Not Paid (counts still 16 = 11/4/1/0).
- **Awaiting Payment is a task**: strip "Awaiting Payment · The invoice is validated — confirm once accounting has released $566.16 to the vendor" with a **Confirm Payment** primary (card icon).
- **The Payment Packet modal** (user-requested upgrade from a plain confirm dialog): Confirm Payment opens a wide modal with a document tab-bar — Purchase Order · Invoice · Receipt of Goods — each rendered as a PDF preview (the mock-PDF builders were extracted from the invoice takeover and gained PO and ROG generators, all driven by the order's own data), with per-document **Download PDF** and **Download all (3)** so the buyer can assemble exactly what accounting needs before confirming. The footer restates the stake ("$566.16 · Invoice #001042698") beside Cancel / Confirm Payment.
- **Confirming advances the same page** (no separate payment screen, per the standing rule): stepper → Awaiting Payment done, Completion (VENDOR) in progress; strip becomes resting **"Waiting on Vendor · Completion"** with a violet **Payment confirmed** pill and Write a Review (the Completion placement the user chose); audit entry "Payment confirmed by Alicia Grant · $566.16 sent for Invoice #001042698"; toast.
- **Payment card narrates the stages**: Notice reads "Invoice #… is validated — payment is released by your accounting team, then confirmed here" → "Payment of $… is confirmed — the vendor confirms receipt to close the order." **Paid Total goes real** on confirmation — the $0.00 that sat visible all along becomes $566.16.
- Cross-app continuity: the buyer's confirmation is exactly what the vendor's `#paid` state receives ("The buyer confirmed payment — Mark as Paid to capture").
- Fix along the way: the Summary's sales-tax row hardcoded invoice #001042731; now uses the order's own invoice number.

## Held
- Buyer-side Completion state (vendor captures → order closes) — needs the closed-order detail treatment; currently the resting strip ends the buyer's journey.

## Components cascaded
Design doc: Awaiting Payment task → resting state rule + Payment card staging + Paid-Total-goes-real. Demo script updated. `docs/design.md` regenerated.
