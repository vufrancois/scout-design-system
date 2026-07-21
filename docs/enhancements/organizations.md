# Organizations — UX Enhancement Summary

**View:** [organizations.html](https://scout-design-system-beta.vercel.app/organizations.html) · [organization-detail.html](https://scout-design-system-beta.vercel.app/organization-detail.html)
**Date:** 07/21/2026

## From a name list to an account book

### 1. "Buyers" terminology
Every "Users/users" label became **Buyers** — the detail page's table column, all avatar-stack labels (here and on Properties), and the gallery examples. A terminology rule now anchors it: buyers are the people at properties; **Customer** is reserved for organization-level concepts; "user" is banned from vendor-facing copy.

### 2. Account-size columns, biggest first
The list table gained **Buyers** and **Spend (12 mo)** columns (`$121,675.25 USD`, per the financial-table currency rules) and the table **defaults to spend descending** — the biggest accounts lead the page. All columns sort with the standard chevrons; cards carry a matching "41 buyers · $121,675.25 USD (12 mo)" footer per view parity.

### 3. Metric strip
Four Metric Tiles above the list answer "who are my biggest accounts" at a glance: **Organizations (7)** · **Active (5)** · **Total Spend 12M ($265.4K)** · **Top Account (Demo Inc. — $121.7K · 41 buyers · 9 properties)**.

### 4. Type layout fix (Detail Header update)
The lone "Type | Company" attribute row is gone. Type now sits as a neutral badge beside the status badge in the detail header's name row. New component rule: attribute rows are for 3+ facts — one or two short facts belong as badges in the name row, never a lone attribute table.

### 5. Detail-page account stats
The organization detail header is followed by three Metric Tiles — **Properties (6)** · **Buyers (33)** · **Spend 12M ($84,120.50, "#2 account by spend")** — so opening an account immediately shows its size.

### 6. List page functionality
Lifecycle variety (two QA orgs are now Inactive) with **All / Active / Inactive** tabs, functional search + empty state, sortable columns with the toolbar sort button removed, a **Type filter** (Company / Property Management) in "Add filter", and Edit + kebab actions on rows and cards.

### 7. Detail Properties section functionality
Functional search, sortable Name/Type/Buyers columns (default: most buyers first), and an empty state inside the section card.

### 8. Property identity + Type filter (detail Properties section)
Each property now carries a colored initials avatar in both the table's Name cell and the card header, giving rows a scannable identity. A new **Type** column (Residential / Commercial — matching the card meta per view parity) comes with an "Add filter → Type" control that renders the standard removable chip and combines with search.

### 9. Per-property Spend and Last Order
Two more sortable columns finish the account story one level deeper: **Spend (12 mo)** shows which property drives the account's $84,120.50 (Central Park View: $41,250.75), and **Last Order** surfaces recency/health with relative times inside 7 days ("2d ago") and MM/DD/YYYY beyond ("Houston: 05/18/2026" — a quiet-account flag). Cards carry the same figures in a meta line per view parity.

## Design system additions

- **Terminology rule** (design doc, Formatting section) — Buyers vs. Customer vs. never-"users"
- **Detail Header rule** — attribute rows require 3+ facts; 1–2 facts render as neutral badges in the name row (gallery example updated)
