# Reviews — UX Enhancement Summary

**View:** [reviews.html](https://scout-design-system-beta.vercel.app/reviews.html)
**Date:** 07/20/2026

## From a read-only list to a work queue

### 1. Reply workflow
Reviews now carry a status — **Needs reply** (amber) or **Replied** (green) — and every row has a one-click Reply action. The page surfaces work to be done rather than just logging feedback.

### 2. Smart default ordering
Reviews needing a reply appear first, then newest-first within each group — the most urgent items are always at the top on page load.

### 3. Status filter tabs
One-click tabs — **All (8) · Needs reply (3) · Replied (5)** — with live counts, so the team can jump straight to their queue.

### 4. Rating filter
An "Add filter" control lets users filter by star rating (5★–1★). Applied filters display as removable chips with a "Clear all" action, and combine with tabs and search.

### 5. Live search
Search across customer names, emails, and review text, filtering results as you type.

## Table improvements

### 6. Sortable columns
Every data column (Customer, Email, Stars, Added, Status) sorts on click with clear directional indicators. Dates and ratings default to highest/newest first.

### 7. Customer identity
Customer cells now show an avatar with initials alongside the name, and a new **Email column** was added for quick contact reference.

### 8. Long-review handling
Review text truncates gracefully with an ellipsis; the full text appears on hover. Long reviews can no longer break the table layout.

### 9. Recent-activity timestamps
Reviews from the last 7 days show relative times ("2d ago"); older ones show full dates.

### 10. Empty state
When a search or filter combination matches nothing, a friendly empty state appears with a one-click "Clear filters" recovery action — no more silent blank tables.

### 11. Accurate rating summary
The header summary now shows a numeric average ("4.3 avg") with a matching star display, replacing the imprecise five-star graphic.

## Design system additions (benefit all future screens)

- **Sortable table headers** — spec and interaction rules, reusable on every table
- **Long-text truncation rule** — standard treatment for text-heavy columns
- **Work-queue ordering rule** — attention-needed items first, then newest
- **Empty State component** — reusable across all tables, lists, and cards
