# Buyer App · Home — UX Enhancement Summary

**View:** [buyer/home.html](https://scout-design-system-beta.vercel.app/buyer/home.html)
**Date:** 08/21/2026 · **Status:** ✅ built and cascaded (gallery "Buyer App Shell & Dashboard" section + design-doc rules)

First view of the Buyer App. The buyer shell (floating App Bar, mega menus, property Context Switcher) is established here and shared by every subsequent buyer page via `buyer/buyer.css` — one stylesheet, so the vendor-side page-clone pitfall can't recur.

## The buyer shell

### 1. App Bar with nav chips and mega menus
The reference's floating pill nav is rebuilt on our tokens: avatar ring + the official Scout wordmark (inline SVG on `currentColor`, so it themes), chip-style nav with a filled active state, and two dropdowns built as a **Mega Menu** (icon + title + one-line description per item). Orders opens a two-column menu (Order Tracking, Quotes, Order Approvals, Reviews, Budgets, Purchase History, Funding Report) including the **disabled-with-upsell** pattern for Budgets ("Contact SCOUT to enable Budgets →"); Admin opens a single column (Vendor Select, Shopping Lists, Organization). Right side: the property echo, theme toggle, and icon buttons (notifications with a status dot, wishlist, cart) — primary-filled only where the reference used them.

### 2. One property context, not two
The reference showed "Shopping for Magnolia Place" in the nav and "Current property: All properties" on the dashboard — two controls, conflicting answers. The hero card was removed entirely; the **App Bar's "Shopping for" pill is the single Context Switcher**, opening a dropdown of all 9 accessible properties (our reconciled vendor-side names and addresses: Magnolia Place, Bayou Crossing, Lone Star Flats, Central Park View…) with address, city pin, and a units badge; "All properties" is the aggregate with the Active badge. One control, labeled "Current Property:", visible on every buyer page — and **switching actually re-scopes the dashboard**: every KPI, action count, breakdown row, chart, and delta re-renders for the selected property (demo data scales by each property's unit share, with sums kept consistent). Action cards drop to a calm state with a ghost "View …" CTA when a property has nothing waiting, and zero-count footers hide.

### 3. Dashboard Hero
Navy→blue gradient band with soft decorative circles, greeting ("Welcome back, Alicia" — driven by the signed-in user's first name with a graceful "Welcome back" fallback; Alicia Grant is the same Demo Inc. buyer the vendor pages reference) and the **7D / 30D / 90D segmented toggle** replacing the "Last 30 days" select, per the unified time-scoping rule. KPI cards straddle the hero's bottom edge. The hero keeps its brand navy in dark mode — the one intentional blue surface, same rule as the vendor sidebar.

## Home enhancements

### 4. KPI cards on the Stat Card spec
Total Paid, Completed Orders, Open Orders, Invoices — title + ⓘ Tooltip, tonal icon circle, 28px value, muted caption. The ambiguous "Remove shipping ($325.97)" chip became an explicit **Switch** ("Include shipping") that recomputes Total Paid live ($25,471.50 ↔ $25,145.53). All four respond to the time toggle. Dashboard KPIs show plain currency (`$25,471.50`) — the `USD` suffix stays reserved for financial tables per the Formatting rules.

### 5. Re-tiered for the buyer's turn
Per the Dashboards rule from Insights, the buyer's action states lead the page as three amber **Needs your action** cards in the order they gate each other — **Deliveries to validate 5** (receipt-of-goods confirmation, the step that unlocks invoice posting and payment), **Invoices to validate 11** (oldest 6d), **Approvals pending 1** — each with a full-width CTA; the Delivered breakdown row echoes "5 awaiting your validation." Pure status counts sit below. In the reference these were buried as rows inside breakdown cards.

### 6. Vocabulary normalized to the Lifecycle Matrix, buyer side
The Invoices breakdown now speaks the shared pipeline with the actor flipped: **Invoice Validation 11 (your move)** → **Invoice Posted 4** → **Paid 1** → **Completed 27**; header count 16 reconciles with the Invoices KPI (11 + 4 + 1). The truncated "Invoices & C…" title became "Invoices."

### 7. Open Orders condensed to lifecycle stages
The reference's eight statuses (four "Partially …" variants) collapse to the four stages the vendor list uses — **To Fulfill 36** (incl. 2 partially fulfilled), **To Ship 11** (incl. 2 partially shipped), **In Transit 7** (incl. 4 partially delivered), **Delivered 8** — summing to the Open Orders KPI of 62; partials are meta lines; **Canceled (1)** is a rose row card spanning the grid's bottom lane — visibly an exception, not a fifth stage, with the meta "not counted in open orders" (it goes neutral when the count is 0). Both apps now describe the same order identically.

### 8. Approvals card
"Total" left the state rows (it's a sum, not a state) and became the header count (14); Pending carries the amber action treatment. Demo counts reconciled (1 + 10 + 3 = 14; the reference's 0 + 10 + 3 didn't add up).

### 9. Charts on the Charts rules, with a validated palette
Spend Trend is a proper SVG **Line Chart** — recessive gridlines, 2px blue-400 series with a faint area, MM/DD axis, crosshair + tooltip on hover — driven by a realistic 30-day series instead of the reference's cliff-to-zero data, with a directional delta (+12.4% vs the prior period) per the Deltas rule. Category Spend is a **Horizontal Bar Chart** with direct value labels and a four-step categorical palette run through the dataviz validator: light `#2740b8 · #10b981 · #f59e0b · #8a5fef`, dark `#6277f5 · #059669 · #d97706 · #8a5fef` (all checks pass; direct labels cover the contrast warning). Category totals sum to Total Paid ($9,840 + $6,215 + $5,480 + $3,936 = $25,471).

### 10. Recent Activity
The Activity Feed component with event-specific icon tiles (invoice amber, exception rose, delivery emerald, cancellation muted, quote sky) instead of a cart for everything; chevron as the row-navigates affordance; the unexplained refresh/pulse icon pair replaced by View All. The feed's newest item ties to the vendor demo: "Invoice #102 ready for validation · Order #515."

### 11. Chrome cleanup
The "Demo Environment" hanging tag and floating chat bubble were dropped as environment/support widgets rather than product UI (Messages lives in the nav).

## Design system additions

- **App Bar + Nav Chips** — floating pill shell, active chip fill, dropdown chips with chevron rotation; icon-only collapse under 1100px
- **Mega Menu** — one- or two-column panel of icon + title + description items; disabled item with upsell link
- **Context Switcher** — App Bar pill ("Shopping for · name") + dropdown of context options (tile, name, address, city pin, units badge, Active badge, aggregate option)
- **Dashboard Hero** — gradient brand band with decorative layer, greeting, segmented time toggle, straddling KPI grid
- **Status Breakdown card** — icon-titled card with header count pill and View All, tinted status rows (icon · label · meta · count · ⓘ), optional spanning exception row
- **Line Chart** and **Horizontal Bar Chart** — SVG specs per the Charts rules, hover layer; the doc's Charts section now carries the validated categorical palette (replacing the monochrome "categorical ramp" that failed categorical validation) plus the no-series-colored-text and one-axis rules
- **Needs-your-action cards** reuse the Insights stat-card anatomy; the doc records the buyer ordering (Deliveries → Invoices → Approvals)
- Gallery header gained a **Buyer App** entry point beside Vendor App
- **Switch** now has a live usage (include-shipping)


## Addendum — app-level Search Palette (09/03/2026)
Product search joined the App Bar without costing it any width: a **search icon** leads the icon cluster on every buyer page (injected by the shared `cart.js` — zero per-page markup), opening a centered **Search Palette**: large input, the Keyword / ✦ AI Search mode segment from the marketplace hero, recent searches, category jump rows, and a footer with keyboard hints plus the property scope ("Scoped to Magnolia Place Apartments" — honors the Shopping-for choice). `⌘K` / `Ctrl+K` / `/` open it from anywhere; Esc or outside-click closes. Rationale: the bar had no room for a field (five nav items + switcher + four icons), and nav search's real value is global reach from non-shopping pages — the shopping pages keep their own in-page search surfaces. New CSS: `.sp-*` family in `buyer-components.css`, light + dark.
