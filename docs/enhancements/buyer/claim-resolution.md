# Vendor Reconciliation — Claim Resolution & Canonical Stepper

**Status:** ✅ built and cascaded
**Page:** `design-system/order-detail.html` (vendor) — new `#claim` and `#invoiced` states; all existing hash states remapped
**Reference:** Vendor Order #675 screenshots — claim panel with buyer-request chips and Send replacement / Cancel affected quantity cards.
Documented here per convention (vendor-side changes made during buyer work live in the buyer section that originated them — the claims flow).

## What shipped
- **Vendor stepper reconciled to the canonical 8 slots**, actors flipped from the buyer's: Placed (Auto) → Fulfillment (You) → Delivery (You) → **Delivery Validation (Buyer)** → **Invoice Submission (You)** → Invoice Validation (Buyer) → Awaiting Payment (Buyer) → Completion (You). The old Sales Tax step folds into Invoice Submission; the old ambiguous "Validated" step is now unambiguously Invoice Validation.
- **States remapped** to the validation-first pipeline:
  - `#shipped` is now mid-Delivery (2 of 8, Mark as Delivered), `#delivered` is **Waiting on Buyer · Delivery Validation** (the buyer's validation generates the ROG and opens Invoice Submission — the vendor no longer uploads an invoice to "unblock validation").
  - `#tax` is now **Action Required · Submit Invoice** (4 of 8): buyer validated, ROG on file, vendor inputs tax + uploads invoice.
  - New `#invoiced`: invoice submitted, **Waiting on Buyer · Invoice Validation** (5 of 8) — the old `#tax` content, minus the "validating delivery" language.
  - `#validated` onward unchanged in structure; feed headline corrected to "Invoice validated by buyer".
- **The buyer's ROG lands in the vendor's Documents rail** from `#tax` onward (`docsRog` flag — receipt visible before the invoice exists).
- **New `#claim` state — the Claim Resolution Panel**: rose "Claim Open" header pill; task strip "Action Required · Resolve Claim · …resolve every affected line to release the invoice" (copy corrected from the reference's "before they can validate the delivery" — claims never block delivery validation, only the invoice); one block per affected line (an in-panel amber callout originally duplicated the task strip and was removed — state expressed once) with qty × name, issue, and the **buyer-request chip** in the buyer's own Resolution Toggle colors (keep = emerald, cancel = rose — the reference's amber/sky chips realigned); two option cards per line — **Send replacement** (sky ring) vs **Cancel affected quantity** (rose ring, destructive path) — pre-selected to the buyer's request but overridable; optional note; one **Resolve claim** commit. Resolving toasts the outcome ("1 replacement queued · 1 unit canceled — invoice released") and advances to `#tax`.

## Model rules established
- **Claims are two-sided: the buyer requests, the vendor decides.** The buyer's keep/cancel toggle is a request that travels verbatim (same colors); the vendor's card choice is the decision.
- A claim holds the **invoice**, never the buyer's delivery validation.
- Lifecycle Matrix rewritten: Delivered row's turn flips to Buyer; new rows Delivery Validated (`#tax`), Claim Open overlay (`#claim`, rose "Invoice held"), Invoice Submitted (`#invoiced`); gating rule now reads "the payment pipeline can never outrun the buyer's attestation" — Invoice Validation onward requires the ROG, and an open claim holds the invoice.
- The long-standing "vendor demos show the old delivered-then-validate order" flag is resolved.

## Buyer-side resolved rendering (item 5, follow-up pass)
Built on `buyer/order-detail.html` — seeded showcase **#662** (Bayou, 2× Alabaster blind + 1× Vinyl blind; buyer received 1, claimed 1 missing-keep + 1 damaged-cancel; vendor resolved):
- The rose rail callout turns **emerald**: "Claim resolved · The vendor resolved every affected line · the invoice is released", with a per-line outcome under each issue — *Replacement on the way* (keep) or rose *Canceled — removed from the invoice*.
- **The Summary is rewritten to the new truth** (per the post-resolution reference): a canceled line is struck through (name, SKU, prices) with a rose *Canceled* pill and drops out of the totals — the struck line *is* the adjustment, so the earlier "Claim adjustment" row was retired; a replacement arrives as its own new line (sky "Replacement · sent by the vendor after your claim") with its own **Fulfillment #2** card and mini-lifecycle, the original line's quantity reduced so units and money stay honest ($69.98 + $11.99 = $81.97).
- **A pending replacement re-opens the task**: the strip returns to Start Delivery Validation, the validation modal omits canceled lines, and receiving the replacement advances the order to Delivery Validated live — the full raise → resolve → re-validate loop is demoable on #662.
- Deviation noted: the reference's amber "This order has changed" callout is not duplicated — change narration lives in the emerald rail callout + activity feed (state expressed once).
- Strip desc becomes "All items are received or resolved by the vendor."; activity logs "Claim resolved by vendor · 1 replacement queued · 1 unit canceled — invoice released". The tracking table's Claim Open overlay clears on resolution (rule; #404 stays the unresolved example).
- New CSS: `.callout.emerald` + outcome line `.co.keep/.co.cancel` (light + dark).

## Stage-aware resolution + invoiced-tab overlay (follow-up pass)
- **Vendor `#claimpre`** — a claim on a never-fulfilled order (the counterpart to buyer #404): "The buyer reported a problem before anything shipped. Nothing is invoiced yet." The resolution cards speak the stage — **Fulfill as ordered** ("keep this line — it ships with the normal fulfillment") vs **Cancel affected quantity** ("removes the line before it ships") — no stock/shipping/invoice language. Canceling the last line flows live into `#cancelreq` with the reference's all-merchandise-canceled copy ("No merchandise remains … waive shipping and close the balance") and a "Cancellation Required" pill; keeping the line returns the order to `#placed`.
- **Invoiced-tab Claim Open overlay** — the claim window stays open until invoice validation, so a claim-held invoice now shows rose **Claim Open** (instead of Awaiting Validation) and loses its Validate button until resolution. Seeded **#641** (GE Profile Range, damaged-keep claim, invoice received-but-held): buyer detail shows the rose "Invoice held · claim open" strip pill + claim callout; Invoiced counts still reconcile.

## Vendor replacement Fulfillment #2 (follow-up pass — hold resolved)
Resolving a claim with **Send replacement** no longer jumps straight to invoicing. It lands on **`#replacement`**: header pills "Replacement To Ship" + "Needs Tax & Invoice (after the buyer validates the updated delivery)", the emerald **"Claim resolved · Fulfill the replacement line separately"** note (the reference's #486 callout), a **Fulfillment #2 · Replacement** panel ("From claim resolution" badge, the unit "replaces the claimed unit at no charge", To Ship pill), and an amber **Ship Replacement** task. Marking it shipped flows live to `#delivered` — the buyer validates the updated delivery before the invoice, with "Replacement shipped · Fulfillment #2" in the feed. All-cancel resolutions still release the invoice directly (`#tax`). Mirrors the buyer's Fulfillment #2 on #662 — the loop is now whole on both sides.

## Components cascaded
Gallery **Order Flow & Forms → Claim Resolution Panel (vendor)** card; design-doc claims rule extended with the two-sided model + Lifecycle Matrix rewrite + vendor-reconciliation note; `docs/design.md` regenerated.
