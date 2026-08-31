# UX Enhancement Summaries

Per-view enhancement logs from the UI/UX improvement phase. Each file documents what changed in the view and any design-system components or rules added along the way.

| View | Summary |
|---|---|
| Reviews | [reviews.md](reviews.md) |
| Campaigns | [campaigns.md](campaigns.md) |
| Promotions | [promotions.md](promotions.md) |
| Price Lists | [price-lists.md](price-lists.md) |
| Customer Groups | [customer-groups.md](customer-groups.md) |
| Organizations + Organization detail | [organizations.md](organizations.md) |
| Properties + Property detail | [properties.md](properties.md) |
| Inventory | [inventory.md](inventory.md) |
| Products | [products.md](products.md) |
| Quotes | [quotes.md](quotes.md) |
| Insights | [insights.md](insights.md) |
| Orders | [orders.md](orders.md) |
| Dark mode + responsive (all pages) | [dark-mode-responsive.md](dark-mode-responsive.md) |
| Order Detail (8-state lifecycle) | [order-detail.md](order-detail.md) |
| **Buyer App** · Home | [buyer/home.md](buyer/home.md) |
| **Buyer App** · Marketplace | [buyer/marketplace.md](buyer/marketplace.md) |
| **Buyer App** · Product Listing | [buyer/product-listing.md](buyer/product-listing.md) |
| **Buyer App** · Compare Products | [buyer/compare.md](buyer/compare.md) |
| **Buyer App** · Product Detail | [buyer/product-detail.md](buyer/product-detail.md) |
| **Buyer App** · Wishlists | [buyer/wishlists.md](buyer/wishlists.md) |
| **Buyer App** · Order Approvals | [buyer/approvals.md](buyer/approvals.md) |
| **Buyer App** · Cart & Checkout | [buyer/cart-checkout.md](buyer/cart-checkout.md) |
| **Buyer App** · Order Tracking | [buyer/order-tracking.md](buyer/order-tracking.md) |
| **Buyer App** · Order Detail | [buyer/order-detail.md](buyer/order-detail.md) |
| **Buyer App** · Delivery Validation | [buyer/delivery-validation.md](buyer/delivery-validation.md) |
| **Buyer App** · Invoice Submission (post-validation) | [buyer/invoice-submission.md](buyer/invoice-submission.md) |
| **Buyer App** · Claim Resolution (vendor reconciliation) | [buyer/claim-resolution.md](buyer/claim-resolution.md) |
| **Buyer App** · Vendor Invoice Upload & AI Review | [buyer/vendor-invoice-upload.md](buyer/vendor-invoice-upload.md) |
| **Buyer App** · Invoice Validation (split view) | [buyer/invoice-validation.md](buyer/invoice-validation.md) |
| **Buyer App** · Awaiting Payment | [buyer/awaiting-payment.md](buyer/awaiting-payment.md) |
| **Buyer App** · Cancellation Resolution | [buyer/cancellation.md](buyer/cancellation.md) |

All 14 views enhanced — the per-view UX pass is complete, plus a cross-cutting dark-mode and responsive pass.

**The Buyer App order-lifecycle phase is complete end to end**: all 8 stepper slots have demoable states on both apps (see [demo-script.md](../demo-script.md)), covering delivery validation (validation-first, modal with inline claims), the two-sided claims loop (buyer requests → vendor decides → Summary rewritten to post-resolution truth), the invoice pipeline (vendor upload → Scout AI extraction → review/accept → buyer Document Review Split View → validate/dispute with variance handling), Awaiting Payment (Confirm Payment → Payment Packet modal), and Completion (#515 mirrored across both apps). Key codified rules: the Lifecycle Matrix with attestation gating, the claim window (closes at buyer invoice validation), claims hold the invoice never delivery validation, task-first strip narration, and the Document Review Split View as the sole sanctioned takeover. Open items live in each file's "Held" section (review flow, multi-invoice management, cancellation resolution, pre-fulfillment claim resolution, return/warranty flow).

The **Order Detail phase is also complete**: one stateful detail page covering the full 8-step order workflow as 9 URL states (`#placed` → `#completed`), every Orders-list row deep-linking to its matching state, and a codified **Lifecycle Matrix** keeping list pills, detail states, and demo data reconciled. New components from the phase: Stepper (actor captions + buyer-turn nodes), Next-Task Strip, Line Item + Totals (badge-in-totals), Document Row (type accents), Form Rows, Radio Cards, Toast, Drawer, plus the Modal-over-takeover and primary-actions-never-nest rules.

## Format

Every summary follows the same structure:

```markdown
# <View> — UX Enhancement Summary

**View:** [<view>.html](https://scout-design-system-beta.vercel.app/<view>.html)
**Date:** MM/DD/YYYY

## <Thematic heading for the group of changes>

### 1. <Enhancement title>
One short paragraph, client-readable, bolding the key numbers/labels.

## Design system additions
- **<Component or rule>** — what was added and why it generalizes
  (or: None — this view is a pure application of existing components.)
```

- Numbering runs continuously across section headings (and into addendums).
- Follow-up work on an already-summarized view goes under
  `## Addendum — <topic> (MM/DD/YYYY)`, continuing the numbering, with its own
  `## Design system additions (addendum)` if rules changed.
