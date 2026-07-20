# Campaigns — UX Enhancement Summary

**View:** [campaigns.html](https://scout-design-system-beta.vercel.app/campaigns.html)
**Date:** 07/20/2026

## From static labels to a live status board

### 1. Full lifecycle representation
The view now shows campaigns across all three states — **Active** (emerald), **Scheduled** (orange), and **Draft** (gray) — with the card's top accent bar signaling state at a glance. Demo data expanded from 3 to 6 realistic campaigns.

### 2. Status filter tabs
One-click tabs — **All (6) · Active (2) · Scheduled (2) · Draft (2)** — with live counts, so marketers can jump straight to what's running.

### 3. Usage progress on active campaigns
Active campaigns show real consumption — "**347** of 1,000 uses" with a progress bar — turning the card into a live status readout instead of a static label. Scheduled/draft campaigns show their limit as a badge.

### 4. State-framed dates
Instead of a raw date range that readers must interpret, dates are framed by what matters: Scheduled campaigns show "**Starts** 12/11/2026", Active ones show "**Ends** 08/15/2026" (full range on hover). Drafts show no date.

### 5. Promoted edit action
Each card now has a one-click Edit action beside the overflow menu — editing is the dominant action for draft and scheduled campaigns.

### 6. Offer filter
The "Add filter" control filters campaigns by offer type — **Amount off · Use limit · No limit** — shown as a removable chip with "Clear all", combining with tabs and search.

### 7. Functional search + empty state
Search filters cards as you type and combines with the status tabs. When nothing matches, a friendly empty state appears with a one-click "Clear filters" recovery. The redundant toolbar sort button was removed.

## Design system additions

- **Marketing Card rules** — usage-progress treatment for active campaigns and state-framed date badges, documented for reuse on Promotions
