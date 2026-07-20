# Promotions — UX Enhancement Summary

**View:** [promotions.html](https://scout-design-system-beta.vercel.app/promotions.html)
**Date:** 07/20/2026

## From static labels to a live status board

### 1. Full lifecycle representation
Promotions now span all three states — **Active** (emerald), **Scheduled** (orange), and **Draft** (gray) — with status-mapped accent bars. Demo data expanded from 2 to 6 realistic promotions covering both percentage and amount-off offers.

### 2. Status filter tabs
One-click tabs — **All (6) · Active (2) · Scheduled (2) · Draft (2)** — with live counts.

### 3. Redemption counts on active promotions
Active promos show how many times they've been redeemed — "**213** redemptions" — so performance is visible at a glance. (Progress bars are reserved for capped campaigns, where there's a limit to progress toward.)

### 4. State-framed dates
Scheduled promotions show "**Starts** 12/11/2026", active ones show "**Ends** 08/31/2026" (full range on hover). Drafts show no date.

### 5. Offer-type filter
The "Add filter" control filters by offer type — **Percentage · Amount off** — shown as a removable chip with "Clear all", combining with tabs and search.

### 6. Functional search + empty state
Search filters cards as you type. When nothing matches, a friendly empty state appears with one-click "Clear filters". The redundant toolbar sort button was removed.

### 7. Promoted edit action
Each card now has a one-click Edit action beside the overflow menu, consistent with Campaigns. The copy-code affordance remains inline next to the code.

## Design system additions

None — this view is a pure application of existing components and the Marketing Card rules established during the Campaigns enhancement.
