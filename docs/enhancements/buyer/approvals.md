# Buyer App — Order Approvals

**Status:** ✅ built and cascaded
**Pages:** `design-system/buyer/approvals.html` (table) · `design-system/buyer/approval.html#<request>` (detail)
**Reference:** admin approval-queue screenshots (table + stat cards) and approval-request detail screenshots (Approved, Revision Requested, Rejected ×2, history). The Pending detail state had no reference — designed net-new.

## What the feature is
Admins approve orders that exceed a property's budget. A queue page lists every request with status metrics and filters; a detail page shows one request's progress, items, history, and — when pending — the decision itself.

## Table page (approvals.html)
- **Selectable Metric Cards** — vendor `stat-card-colored` pattern (accent bar, colored 30px count, tinted active state) as clickable status filters: Total (stat-gray neutral) · Pending amber · Revision Requested sky · Approved emerald · Rejected rose. Counts recount under every filter and the property scope.
- **Table toolbar** — vendor treatment: filter chips (attr | value | ×), dashed "Add filter" nested menu (Vendor · Buyer · Level · Status), "Date range" relative windows, ghost "Clear all", icon search (matches vendor, buyer, request #, property, line items). Everything composes.
- **Expandable Data Table** — vendor table conventions (11px uppercase headers on muted, 14px cells, sorted-header primary + chevron set) plus an expander column revealing a tinted Items sub-row; the Items *column* from the reference was dropped as redundant. All columns sortable. Status = status-dot pills. Pending row carries the one primary action (Review); Request # links to the detail.
- **Reason column hidden** for now (all demo rows shared "Amount"); the reason lives in the detail fact rows as "Amount threshold".

## Detail page (approval.html)
- **One page, four states**, addressed by URL hash (`#K4PT2N` …) — query strings are dropped by clean-URL hosting, hashes survive (same convention as vendor Order Detail).
- **Approval Stepper**: Requested → Under Review → Approved → Order Created; done = primary + check + completion date; active = whose-turn ring (amber eye "your move" / sky refresh "Buyer revision"); Rejected = rose × in slot three with rose connector; 2×2 grid below 720px.
- **Decision Panel** (pending only, net-new design): amber-accent card under Approval Progress; one comment field; Approve primary, Request revision sky outline, Reject rose outline; comment required for revision/reject (rose field ring when missing). Deciding live-transitions the page and appends the history event.
- **Order details** with live-inventory pattern: "Refresh inventory" + "Checked X ago"; violet legacy-approval callout; rose unavailable-product callout with struck-through item + "No longer available" pill.
- **Approval history** — append-only timeline: event, actor · revision, amount + timestamp, comment block, per-revision line-item snapshot (the reference's $1,062.49 → $415.39 revision saga is reproduced on #9MS9D4).
- **Right rail**: vendor card + storefront chip; fact rows (level, reason, amount, buyer, property, eligible-approver violet pills, decided by); amber/rose decision callout; "Orders placed" card (Order #411 · View order) on approved.

## Reconciliations & data fixes
- Home ↔ Approvals: Pending 1 + Revision Requested 1 + Approved 9 + Rejected 3 = 14 everywhere; Home's Approvals breakdown gained a sky "Revision requested · back with buyer" row.
- #9MS9D4 amount $415.39 = $390.39 item + $25 expedited shipping, consistent across table, detail, history, and Order #411.
- Reference's "DemoRole Buyer"/"Demo Supervisor" → real names (Alicia Grant, Jordan Ellis, Priya Nair, Marcus Webb); joke comments replaced with plausible demo copy; reference's "Items 0" row fixed.

## Redundancy pass (post-build)
- Hero subtitle is now the identity line `#id · buyer · amount` (the request # previously appeared nowhere); rail facts dropped Buyer / Requested amount / Approval level, keeping Reason · Property · Approvers (pills) · Decided by.
- Decision panel copy trimmed to the instruction only (Reason fact already says "Amount threshold").
- History item snapshots render only when items/amount changed from the previous event.
- Amber callout retitled "Note to buyer"; "Orders placed" shows the order number only.
- Shipping card folded into Order details as totals rows (Items subtotal / Shipping · method / bold Request total) — the math now closes on screen against the hero amount.

## Components cascaded
Gallery section **Buyer App · Order Approvals** + design-doc rules **Order Approvals**: selectable metric cards, table toolbar, expandable data table, approval status enum, approval stepper, decision panel, callouts, history timeline. `docs/design.md` regenerated.

## Pitfalls hit (for future reference)
- `buyer.css` resets `svg { display:block }` — inline table icons (sort chevrons) need explicit `display:inline-block`.
- Generic class names collide across apps: a 16px `.stat-card-icon` rule for the new cards shrank Home's 40px KPI icon tiles until scoped under `.stat-card-colored`.
- Rebuilding a menu's innerHTML from its own click handler detaches the clicked node before the document-level outside-click handler runs — guard with `e.target.isConnected`.
