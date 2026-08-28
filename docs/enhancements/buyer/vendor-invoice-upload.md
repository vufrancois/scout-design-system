# Vendor — Invoice Upload & AI Review (Invoice Submission)

**Status:** ✅ built and cascaded
**Page:** `design-system/order-detail.html` (vendor) — `#tax` (upload task) → live upload → `#review` → accept → `#invoiced`
**Reference:** Vendor Order #675 screenshots — Upload invoice modal, Scout AI processing, Review invoice panel, accepted buyer-facing invoice.
Documented here per convention (vendor-side work in the buyer section that originated it — the invoice pipeline).

## The flow
Upload → AI extraction → review → accept. The vendor never types invoice details up front:
1. **`#tax`** task becomes "Action Required · Upload Invoice" (the separate "Input Sales Tax" CTA is retired — tax now comes off the invoice). The Upload modal takes only the PDF: drop zone → chosen-file state → **"Upload for AI review"**, with an info note explaining what Scout AI will extract.
2. Uploading lands on **`#review`** with a simulated ~2s processing pass (toasts "Invoice uploaded" → "Invoice processed"). The task strip reads "Action Required · Review Invoice & Tax"; the Documents rail gains a **Pending review block**: "Buyer-facing Invoice · No invoice has been accepted yet · Awaiting invoice", then the file with its Processing / Ready-for-review chip and a Review invoice action, closed by "Accept or delete the pending invoice before attaching another."
3. The **Review Invoice modal** (centered, per the Modal-over-takeover rule — the reference's right drawer was normalized) shows the file card ("Processed by Scout AI" · Ready for review), the extracted **Invoice number** (001042755) and **Sales tax** ($16.89 — our demo order's math, not the reference's figures) both editable, and **two required confirmation cards** that fill sky when checked: *Confirm sales tax* ("I confirm this amount matches the invoice") and *Confirm buyer visibility* ("I understand the resulting invoice PDF will be shown to the buyer for invoice validation"). **Accept Invoice is disabled until both are checked** — the confirmations are the point: the numbers are AI output and a human attests to them before the buyer sees the document. **Delete invoice** (rose, in the modal) discards the upload and returns to `#tax`.
4. Accepting toasts the outcome and advances to **`#invoiced`** — "Waiting on Buyer · Invoice Validation · The buyer is reviewing the accepted invoice", with the emerald Invoice #001042755 doc-row joining the PO and ROG.

## Deviations from the reference
1. **Centered modals, not right drawers** — both the processing view and the review form use the standard centered Modal (design-doc rule: task flows are never takeovers/drawers).
2. **Fixed stepper labels** — "Invoice Submission" stays put; the reference renames done steps ("Invoice Submitted").
3. **Demo math kept** — sales tax $16.89 (8% of the $236.14 demo order), not the reference's $436.38.
4. **Single-invoice scope** — the reference's "Active invoices / Manage / Attach another invoice" multi-invoice management is held for a later pass; our accepted state shows the one buyer-facing invoice doc-row.

## New components
`.confirm-card` (required confirmation checkbox card, sky fill when checked) + `.req-chip` (amber Required chip) — cascaded to the gallery as **Invoice Upload & AI Review (vendor)** with the two-card demo; design-doc Lifecycle section gained the upload → extract → review → accept rule.

## Held
- Multi-invoice management (Active invoices list, Manage, Attach another invoice).
- Buyer-side Invoice Validation screens — next up, user will share references.
