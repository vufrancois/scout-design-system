# Price Lists — UX Enhancement Summary

**View:** [price-lists.html](https://scout-design-system-beta.vercel.app/price-lists.html)
**Date:** 07/20/2026

## From a decorative grid to a working list

### 1. Status filter tabs
One-click tabs — **All (4) · Active (1) · Scheduled (1) · Draft (2)** — with live counts. Tabs filter both the list and grid views.

### 2. Two-attribute filter bar
"Add filter" opens a two-level menu: pick an attribute (**Created** or **Customer group**), then a value. Created offers date ranges (Today / Last 7 / 30 / 90 days / Last 12 months); Customer group lists the groups from the Customer Groups view. Each applied filter renders its own removable attribute–value chip; chips stack and combine, with a "Clear all" action.

### 3. Live search
The search field filters both views in real time — across titles and descriptions — and combines with the active tab and any applied filters.

### 4. Empty states in both views
When no price lists match, both the table and the grid are replaced by the standard empty state with a one-click "Clear filters" recovery — no more silent blank views.

### 5. Sortable table + Created column
Title, Status, Price Overrides, and the new **Created** column sort on click with the standard chevron indicators; the table defaults to newest first. The redundant toolbar sort button was removed, and the grid follows the table's sort order.

### 6. Description column
A muted **Description** column sits beside Title, truncating with an ellipsis per the long-text rule (full text on hover). Free text stays non-sortable, consistent with Reviews.

### 7. Promoted edit action
Edit is a first-class ghost icon button beside the overflow menu, on both table rows and cards.

### 8. Live Active switch
Toggling the switch flips a price list between Active and Draft everywhere at once — status badge, card accent bar, tab counts, and current filter results all update immediately, with list and grid staying in sync.

## Grid card redesign

### 9. Marketing Card anatomy replaces the stat panel
The previous card — a large colored stat panel (giant override count, progress bar, percent-live label) stacked on a white body — was confusing, overly complex, and shared little with the table. It was rebuilt on the **Marketing Card anatomy** already used by Promotions and Campaigns:

- 4px top accent bar mapped to status (Active = emerald, Scheduled = orange, Draft = gray)
- 44px soft icon tile (tag icon, matching the page identity) + title + description
- Active switch, edit, and kebab in the header — the same actions as the table row (the old "View →" link was removed; the kebab covers navigation)
- Badge row: status dot badge, plus a state-framed date badge for scheduled lists ("Starts 12/11/2026", full range on hover)
- **Catalog coverage bar** (Campaigns usage anatomy): "**693** of 10,360 products priced" + 4px progress bar — replacing the old "% live" panel with a bar that has a real denominator (overrides ÷ catalog size)
- "Created MM/DD/YYYY" footer line

The card and the table now present exactly the same fields — Title, Description, Status, Price Overrides, Created, Active — the same data in two shapes. The grid is capped at 3 cards across (2 below 1200px, 1 below 800px).

## Design system additions

- **View parity rule** — when a page offers list and grid views of the same data, both views present the same fields: the card is the table row in card form, not a different design. Tabs, filters, search, and sorting apply identically to both views.
