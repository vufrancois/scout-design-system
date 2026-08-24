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

All 14 views enhanced — the per-view UX pass is complete, plus a cross-cutting dark-mode and responsive pass. The **Order Detail phase is also complete**: one stateful detail page covering the full 8-step order workflow as 9 URL states (`#placed` → `#completed`), every Orders-list row deep-linking to its matching state, and a codified **Lifecycle Matrix** keeping list pills, detail states, and demo data reconciled. New components from the phase: Stepper (actor captions + buyer-turn nodes), Next-Task Strip, Line Item + Totals (badge-in-totals), Document Row (type accents), Form Rows, Radio Cards, Toast, Drawer, plus the Modal-over-takeover and primary-actions-never-nest rules.

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
