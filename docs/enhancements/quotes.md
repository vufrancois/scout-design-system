# Quotes — UX Enhancement Summary

**View:** [quotes.html](https://scout-design-system-beta.vercel.app/quotes.html)
**Date:** 07/21/2026

## From a status list to a pricing triage queue

### 1. Condensed statuses (6 → 5)
The lifecycle now reads: **Pending** (amber, awaiting your quote) → **Quoted** (sky, awaiting buyer) → **Accepted** (emerald, ready to convert) → **Converted** (violet). **Rejected and Cancelled merged into "Closed"** (gray) — both mean "no action needed," and the specific reason ("Rejected by buyer" / "Cancelled by buyer") lives in the status badge's tooltip instead of two extra tabs.

### 2. Pending-first triage with a Waiting column
The page opens on the **Pending** tab sorted oldest-waiting-first, and a new sortable **Waiting** column shows the age cue: "46d", turning amber past 14 days for Pending quotes. Waiting also shows for Quoted (waiting on the buyer); settled states show an em-dash.

### 3. Organization + buyer contact column
Vendors can price by account: an **Organization** column with the buyer contact as a muted meta line beneath (per the condensing rule), wired to the reconciled org/property demo data. **"Order Total" renamed to "Quote Total."** The quote ID cell gained an items meta line ("3 items"), retiring the separate Items column.

### 4. Lifecycle Stat Cards
The neutral stat cards with "View Quotes →" CTAs became the clickable color-coded Stat Card strip: five cards matching the five statuses, counts reconciled with the tabs (the old Converted card claimed 10 while its tab said 2), hover/active states synced with the tab bar.

### 5. Bulk actions
Checkboxes with the standard bulk bar: **Export** and **Convert to Orders** appear when quotes are selected, plus select page / Select all loaded / Clear selection; selection survives paging.

### 6. Toolbar rework
The View and refresh buttons were removed. Left group: **Add filter** (Organization) beside the retained **Date range** control — now functional with presets (Last 7/30/90 days, 12 months) rendering the standard removable chip. Search sits right. Live search, sortable columns, empty state, and live pagination (20 quotes, 10/page) complete the standard playbook, with column priority hiding Created below 1280px and Property below 1100px.

## Design system additions

None — this view applies the established components and rules (lifecycle Stat Cards, condensing rule, column priority, filter bar, bulk bar).
