# Service POs — Unit History

**Status:** ✅ built and cascaded (10/07/2026)
**Pages:** `design-system/buyer/unit-history.html` (`#<property>` busiest units · `#<property>/<unit>` · `#<property>/COMMON`). Linked from: the Unit History entry in the SPOs menu (all buyer pages), the unit inside every allocation chip on `spo.html` and `schedule.html`, and "Browse units" in the wizard's unknown-unit warning.
**Reference:** the live Unit History page (unit list with Building / Floor-plan filters, a From–To spend-period range, "Select a unit to view its SPOs and POs") and audit findings SPO-48 / SPO-51 (screenshots F08, F30).

## What the feature is
Every service PO line and product order line charged to one apartment (or the common area) in one place. It answers "what have we spent on 0105 this year, and what's coming?"

## What shipped
- **Pick a property first.** Unit codes are each property's own building-based scheme (BBUU: 0216 = Building 02, unit 16). Under "All properties" the page shows inline property option rows; it doesn't block the nav the way the shopping pages' modal does. Changing the Context Switcher re-scopes the page.
- **Unit Picker** (left pane, sticky):
  - Search by code, or by "bldg 2 unit 16". A bare number like "303" also finds 0303.
  - Building and Floor-plan filters.
  - Each row shows the code, "Bldg · plan", and the unit's **spend in the selected range**, so busy units stand out.
  - **Common area** is pinned first.
  - The footer reads "n of N units · spend for …".
- **A search that matches nothing explains the scheme** (SPO-48): "No unit "1805" at Magnolia Place Apartments — Units here use building + unit codes, 0101–0317 (0216 = Building 02, unit 16). Resident apartment numbers don't map to these codes." It never shows a bare "No units found", and never guesses the nearest unit.
- **No unit selected:** a "Most activity" card ranks the property's units by spend in range.
- **Range Bar:** spend-period presets (This period · Last 3 · 12 months, the default · Custom with From/To), always followed by the exact dates. The range drives every number on the page.
- **Unit view:**
  - **Header:** code · building · unit · floor plan · property, plus the **Stat Strip**: Spend in range, Service POs, Orders, Last activity.
  - **Spend by GL:** a horizontal bar chart.
  - **Upcoming:** schedules (active, paused or pending) that charge the unit, with cost per run and next run. For example, Common area shows the weekly cleaning.
  - **Activity:** Filter Tabs (All · Service POs · Orders, with counts) over a table of Date · Type chip · Reference (with the recurring marker for schedule-created SPOs) · What · GL (GL under the description; orders add qty × price · SKU) · Unit's share ("of $600" when the line is split) · Status. It pages at 10 rows.
- **What counts as spend:** SPO allocations once the SPO is sent onward, plus order lines that aren't canceled. Drafts, pending approvals, vendor-rejected and canceled SPOs are listed muted and marked "not counted".
- **Data:** `SPO.ORDER_LINES` adds 12 product order lines with GL + unit. They reuse real demo orders and items (#653, #515, #641, #373, #408, #657, #512), so a unit links to orders that exist.

  Story units:
  - Magnolia **0105**: SPO-863 carpet cleaning, the #653 dishwasher and blind, and the #515 microwave.
  - Magnolia **Common area**: SPO-845/847 weekly cleaning, plus the #657 laundry dryers and the SCH-01 schedule.
  - Magnolia **0214** and **0303**.
  - Cypress **0105**: SPO-857 paint and carpet refresh, plus the #512 PTAC unit.

## Deviations from the live product
- The live page puts the unit list above the range and shows "Select a unit" in an empty pane. Here the empty state is useful: it ranks units by spend.
- Live separates "SPOs and POs" without a way to tell them apart in one list. Here the ledger is unified, with type chips and filter tabs.
- The range presets are named spend periods, not a "Use period" dropdown next to free date fields.

## Held
- Editing the unit list (unit master admin).
- An admin screen that maps resident apartment numbers to BBUU codes (the audit's backend fix for SPO-48/51).
- CSV export.
- Unit details beyond floor plan (occupancy, move-in/out dates), which needs a property-management integration.

## Pitfalls
- In a two-pane grid that collapses to one column, the panes need `min-width: 0`. Without it the picker's widest row pushes the page into horizontal scroll on phones.
- A fifth table column didn't fit the half-width pane. Folding GL into the What cell kept the table from scrolling sideways at desktop widths.
- **New pages must sit over the hero edge.** Use `margin-top: -76px` on the first content block, like `.det-grid` and `.kpi-grid` (here `.uh-zone`), and a 20px gap between stacked cards (`.uh-detail`). The first build sat flush on the hero line with cards touching; Vu flagged both.
- The search box lives in the picker. Typing re-renders **only the list** (`renderList`), so the input keeps focus.

## Components cascaded
- **Unit Picker** (`.uh-picker`, `.unit-row` with `.common` / `.active`, `.us`, `.uh-count`)
- **No-match note** (`.uh-nomatch`)
- **Range Bar** (`.uh-range` over `.mode-seg`)
- **Stat Strip** (`.stat-strip`, generalized from the Schedule card's `.series-stats`)
- **Activity type chip** (`.type-chip`, `.spo`)
- `.share-of`, `.not-counted`, `.uh-hbars`, and the unit link inside allocation chips (`a.unit-link`)

Gallery **Buyer App · Unit History** and the design-doc **Unit History** rule. `docs/design.md` regenerated.

---

## Tickets

### TKT-SPO-26 · Unit History page
**Summary:** A property-scoped page listing every unit with its spend, and a unit view merging SPO and order lines charged to it.
**Acceptance criteria:**
- [ ] Under "All properties" the page asks for a property first. The Context Switcher re-scopes it, and the hash `#<property>/<unit>` deep-links.
- [ ] The picker lists Common area first, then every unit with building, floor plan and spend in range. It filters by building and floor plan.
- [ ] With no unit selected, the property's units are ranked by spend in range.
- [ ] The unit view shows the header, Stat Strip, Spend by GL, Upcoming schedules, and the Activity table with All / Service POs / Orders tabs and a pager.
- [ ] The Unit History entry in the SPOs menu opens it on every buyer page.
**Audit findings:** SPO-48
**Files:** `buyer/unit-history.html`, `buyer/buyer-components.css` (`.uh-*`, `.unit-row`, `.type-chip`, `.stat-strip`), all buyer pages (menu link)

### TKT-SPO-27 · Unit search that explains the unit scheme
**Summary:** Unit search accepts codes and "bldg / unit" phrasing; a miss explains the property's code scheme instead of failing silently.
**Acceptance criteria:**
- [ ] "0216", "216" and "bldg 2 unit 16" all find unit 0216.
- [ ] A query that matches no unit shows the property's code range and how codes are formed, and never selects a nearest match.
- [ ] Typing keeps focus in the search box.
**Audit findings:** SPO-48, SPO-51
**Files:** `buyer/unit-history.html` (`matchUnits`, `renderList`)

### TKT-SPO-28 · Unit ledger: what counts and how splits show
**Summary:** One ledger of SPO allocations and order lines per unit, with clear rules for counted spend and split lines.
**Acceptance criteria:**
- [ ] SPO allocations count once the SPO is sent onward. Drafts, pending approvals, vendor-rejected and canceled SPOs are listed but marked "not counted".
- [ ] Order lines count unless canceled.
- [ ] A split line shows the unit's share and "of $line total".
- [ ] The range (spend-period presets or custom) drives the picker spend, Stat Strip, Spend by GL and the table together, and the exact dates are always shown.
**Audit findings:** SPO-24
**Files:** `buyer/unit-history.html` (`ledger`, `rangeDates`), `buyer/spo-data.js` (`ORDER_LINES`)

### TKT-SPO-29 · Link units from SPOs, schedules and the wizard
**Summary:** Every place a unit appears links to its history.
**Acceptance criteria:**
- [ ] The unit inside every allocation chip links to `unit-history.html#<property>/<unit>`: the Service POs list's expanded rows, SPO detail (line items and invoice-match targets), schedule detail, and the wizard's Review step (new tab, so the draft is kept).
- [ ] The wizard's "unit isn't at this property" warning offers "Browse units" (opens in a new tab; the draft is kept).
- [ ] Schedules that charge a unit appear in that unit's Upcoming card with their next run.
**Audit findings:** SPO-48
**Files:** `buyer/spos.html`, `buyer/spo.html`, `buyer/schedule.html`, `buyer/spo-new.html`, `buyer/unit-history.html`

### TKT-SPO-30 · Units on product order lines
**Summary:** Product order lines carry GL + unit (from the cart's "GL Code & Unit") so orders join the unit ledger.
**Acceptance criteria:**
- [ ] Each order line stores property, unit, GL, qty and price.
- [ ] Order lines in the unit ledger link to their order detail and show SKU and qty × price.
- [ ] Laundry and other shared equipment can be charged to Common area.
**Audit findings:** —
**Files:** `buyer/spo-data.js` (`ORDER_LINES`); production: the order line model
