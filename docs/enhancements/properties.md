# Properties — UX Enhancement Summary

**View:** [properties.html](https://scout-design-system-beta.vercel.app/properties.html) · [property-detail.html](https://scout-design-system-beta.vercel.app/property-detail.html)
**Date:** 07/21/2026

## From a name list to a portfolio book

### 1. Buyers table with real columns + dedupe (property detail)
The buyers list was a single Name column with a duplicated row. It's now a real table: initials avatar + **Name**, **Role** as a neutral badge (Buyer / Supervisor, extracted from the names), **Email** (muted), **Orders (12 mo)**, and **Last Order** (relative ≤7 days, MM/DD/YYYY beyond). The duplicate "Olivier Belaud" row was removed; the property has 20 unique buyers. Default sort: most recent order first. A **Spend (12 mo)** column completes the drill-down — per-buyer spends sum exactly to the property's $41,250.75, so "who drives this property" is answerable at a glance (Olivier Belaud: $8,986.25).

### 2. Buyers section functionality
Sortable columns, live search across names and emails, an "Add filter → Role" control with the standard chip, an empty state, and **working pagination** (10 per page across 2 pages — buttons and rows-per-page actually work).

### 3. Terminology + identity (Properties list)
The "Customers" column header — a terminology-rule violation — became **Buyers**. Every property now carries its colored initials avatar in the Name cell and card header, using the same initials/colors as the org-detail Properties section (Central Park View is "CP" violet everywhere).

### 4. List functionality
All / Active / Inactive tabs (Cyprus Glenn is now Inactive), functional search + empty state, sortable columns with the toolbar sort button removed, **Type** and **Organization** filters in "Add filter", and Edit + kebab actions on rows and cards. Type gained real variety — stadiums, The Star, and Marc's Church are now Commercial instead of everything being "Residential."

### 5. Spend (12 mo) + Last Order columns
The same account-health columns as the org-detail Properties table, on every row and card. **The demo data is now fully reconciled across all three levels**: the global list carries all 22 properties (adding the two Bueyrs Test properties, CLK's fourth, and Scout E2E's one that were missing), per-org property counts match the Organizations table exactly (6/2/9/4/1), and per-property spends sum to each organization's 12-month spend to the cent ($265,376.50 total).

### 6. Live pagination
With 22 properties, pagination became real: 10 per page (3 pages), functional first/prev/next/last buttons, a working rows-per-page select, page reset on any filter/sort change, and the same page slice driving both list and grid views.

### 7. Property detail header stats
Two more attr-tiles beside Organization and Buyers: **Spend (12 mo)** ($41,250.75) and **Last Order** (2d ago) — the property-level continuation of the account-size story.

### 8. Detail Header avatar-variant polish (componentized)
The property header's presence dot was removed (presence dots are for people, not entities), and the icon+text meta rows became the standard badge row: status badge + neutral badges for Type and address (long values truncate, full text on hover). The redundant Buyers section header (icon/title/subtitle duplicating the Buyers attr-tile) was also removed. The refreshed variant is in the component gallery and design doc as the canonical Detail Header avatar variant.

## Design system additions

- **Live pagination rule** (design doc, Table section) — pagination is functional wherever data exceeds the page size; page resets on filter/search/sort changes; one page slice drives both views
- **Detail Header avatar variant** (gallery + design doc) — no presence dot (presence dots are for people, not entities); short facts (type, address) render as a badge row beside the status badge, matching the icon variant's convention; long badge values truncate with the full text in the tooltip
