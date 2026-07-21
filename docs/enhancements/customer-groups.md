# Customer Groups — UX Enhancement Summary

**View:** [customer-groups.html](https://scout-design-system-beta.vercel.app/customer-groups.html)
**Date:** 07/20/2026

## From a static list to a working directory

### 1. Live search + empty state
Search filters both views by name and description as you type. When nothing matches, the standard empty state appears with a one-click "Clear filters" recovery — no more silent blank views.

### 2. Sortable columns
Name, Organizations (by member count), Properties, and Created sort on click with the standard chevron indicators; the list defaults to Name A→Z. The decorative toolbar sort button was removed, and the grid follows the table's sort order.

### 3. Description field
Every group now carries a description — a muted, truncating column beside Name in the table (full text on hover, per the long-text rule) and a subtitle line on the card. "Demo 3 - No CTB" no longer needs decoding: "Every organization except ChadwellTestBuyer."

### 4. Created column
A sortable Created date column (MM/DD/YYYY), matching the other list views.

### 5. Real properties data
The Properties column previously showed 0 for every group. Groups now carry plausible counts (All Orgs → 12, Only CTB → 3, …) so the column demonstrates its purpose.

### 6. Organization filter
"Add filter → Organization" lists the demo organizations; picking one shows only the groups containing it, as a removable attribute–value chip with "Clear all". This mirrors — and cross-links with — the Customer group filter on Price Lists.

### 7. Row/card actions + view parity
Promoted Edit + kebab actions on both table rows and cards. The one-line compact card was restructured into a stacked group card — name + description, member avatar stack, and a "N properties · Created MM/DD/YYYY" meta line (no avatar tile: groups have no identity image) — so the card presents the same fields as the table row, per the view-parity rule.

## Design system additions

None — this view is a pure application of existing components and rules (sortable headers, filter bar, empty state, long-text truncation, view parity).
