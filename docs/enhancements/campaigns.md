# Campaigns — UX Enhancement Summary

**View:** [campaigns.html](https://scout-design-system-beta.vercel.app/campaigns.html)
**Date:** 07/20/2026

## From static labels to a live status board

### 1. Full lifecycle representation
The view now shows campaigns across all four states — **Active** (emerald), **Scheduled** (orange), **Draft** (gray), and **Ended** (rose) — with the card's top accent bar signaling state at a glance. Every stage of the lifecycle (Draft → Scheduled → Active → Ended) has a distinct color and a live example, and demo data expanded from 3 to 8 realistic campaigns.

### 2. Status filter tabs
One-click tabs — **All (8) · Active (3) · Scheduled (2) · Draft (2) · Ended (1)** — with live counts, so marketers can jump straight to what's running (or review what already ran).

### 3. Budget progress in the budget's own unit
Active campaigns show real consumption with a progress bar labeled in the unit the budget is measured in: usage budgets read "**347** of 1,000 uses"; spend budgets read "**$6,750.00** of $10,000.00 spent" (see "B2B Rebate Program"). Ended campaigns keep their final progress ("**412** of 500 uses"), and scheduled/draft campaigns show their budget as a badge only.

### 4. Budgets always labeled with type + unit
Every card carries a neutral badge naming the budget type and unit — "Usage budget · 1,000 uses", "Spend budget · $10,000.00 USD", "Usage budget · No limit". A bare number like "1,000" never appears alone, so usage caps can't be misread as dollar caps (or vice versa).

### 5. State-framed dates
Instead of a raw date range that readers must interpret, dates are framed by what matters for the state: Scheduled campaigns show "**Starts** 12/11/2026", Active ones show "**Ends** 08/15/2026", Ended ones show "**Ended** 05/31/2026" (full range on hover). Drafts show no date.

### 6. Promoted edit action
Each card has a one-click Edit action beside the overflow menu — editing is the dominant action for draft and scheduled campaigns.

### 7. Offer filter
The "Add filter" control filters campaigns by offer type — **Amount off · Use limit · No limit** — shown as a removable chip with "Clear all", combining with tabs and search.

### 8. Functional search + empty state
Search filters cards as you type and combines with the status tabs. When nothing matches, a friendly empty state appears with a one-click "Clear filters" recovery. The redundant toolbar sort button was removed.

## Design system additions

- **Marketing Card status map** — full lifecycle accents (Active = emerald, Scheduled = orange, Draft = gray, Ended = rose) with matching status dots
- **Budget-label rule** — budgets always appear as type + unit, never a bare number; progress bars are labeled in the budget's own unit ($ for spend, uses for usage)
- **State-framed date rule** — "Starts / Ends / Ended MM/DD/YYYY" by state, full range in the hover tooltip
- **Gallery** — campaign variants now include an ended, spend-budget example
