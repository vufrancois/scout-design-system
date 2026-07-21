# Products — UX Enhancement Summary

**View:** [products.html](https://scout-design-system-beta.vercel.app/products.html)
**Date:** 07/21/2026

## From mixed metrics to one lifecycle

### 1. A status model that reconciles
Products now follow one lifecycle everywhere: **Imported → Uncategorized → In Review → Published or Rejected** (rejection returns a product to the backlog). Four row statuses — Uncategorized (orange), In Review (amber), Published (emerald), Rejected (rose) — and the math closes: **338 + 4 + 10,006 + 12 = 10,360**. "Proposed" was folded into In Review; "Imported" is the entry event, not a status.

### 2. Lifecycle KPI strip
The five stat cards now map 1:1 to the funnel — Total · Uncategorized · In Review · Published · Rejected — equal-width cards with colors matching the status-dot colors, one-line subtitles ("Awaiting categorization", "Awaiting approval", …), and each card clickable to jump to its tab. The "Scout AI Categorization" card was removed as a KPI: AI is a means, not a state. It lives in the Uncategorized card's subtitle, the header's primary action, and the new bulk action.

### 3. Real tab counts at scale
The `99+` caps are gone — tabs show full formatted counts (**All Products 10,360 · Uncategorized 338 · In Review 4 · Published 10,006 · Rejected 12**) and actually filter the loaded rows. A consumer-scale badge cap was hiding the size of the backlog; ops users need the real number.

### 4. Ops-scale table
Default **50 rows per page** (50/100 options) with live pagination, and the Category column widened to a 260px minimum so category names stop wrapping. The demo sample grew from 10 to 60 realistic rows across 20 categories.

### 5. Work-queue rows
Sample rows span all four states: Uncategorized rows show an em-dash where the category would be, **In Review rows carry promoted Approve / Reject icon actions** so the review queue is workable inline, and Rejected rows read rose.

### 6. Search, sort, filter, empty state
Live search across names and categories, sortable columns (Product, Category, Variants, Status) with the toolbar sort button removed, an "Add filter → Category" control covering all 20 categories (scrollable menu, standard chip), and the standard empty state. A muted caption notes the table shows a sample while counts reflect the full 10,360-product catalog.

### 7. Bulk selection + bulk Categorize with AI
Checkboxes select (rows highlight, header/page checkboxes work, selection survives paging), the bulk bar's contextual actions are **Categorize with AI** and Export, and selection is fully controllable with **Select all loaded** / **Clear selection** — tying the AI story directly to burning down the backlog.

### 8. Price, Imported, and AI provenance columns
Three ops columns joined the table: **Price** (single value or "$11.50 – $17.18" range for multi-variant products), **Imported** (sortable MM/DD/YYYY — sort ascending on the Uncategorized tab to work the oldest backlog first; uncategorized demo rows date back to 11/2025 to tell that aging story), and a violet **"Scout AI" provenance chip** beside the proposed category on In Review rows, so reviewers can see who proposed each category. The Category column tightened to make room.

### 9. Stat Card component refined
The color-coded stat card dropped its full colored border for the standard border + 4px left accent bar (the same accent language as inventory item cards and toasts) — the loud "five alert boxes" effect is gone. As tab shortcuts the cards now behave like controls: shadow lift on hover, and the active card takes its accent color as border + soft background tint, synced with the tab bar. Applied everywhere the component appears (Products, Orders, Insights, gallery).

### 10. Responsive condensing
The 8-column table condenses gracefully: Variants folded into the Product cell as a muted meta line under the name (a column deleted at every width), product names truncate with a tooltip, and low-priority columns drop out progressively — Imported below 1280px, Price below 1100px — with the stat cards wrapping 3+2. Horizontal scroll remains only as a last resort.

## Design system additions

- **Lifecycle KPI convention** — stat cards on a lifecycle page map 1:1 to the row statuses (same names, same colors), sum to the total, and act as tab shortcuts; process tools (like AI categorization) are actions, never KPI cards
- **Metric Tile vs. Stat Card taxonomy** (design doc) — Metric Tiles (solid, white text) are for performance aggregates; Stat Cards (outlined, tinted count, left accent) are for countable status breakdowns that mirror tabs; never swap them
- **Stat Card spec updated** — never color the full border; accent bar carries the status color; hover + active states defined for clickable lifecycle cards
- **Condensing-wide-tables rule** (design doc, Table section) — secondary attributes fold into the primary cell's meta line before earning a column; 6+ column tables define a column-priority order and hide low-priority columns at narrow widths; horizontal scroll is the last resort
