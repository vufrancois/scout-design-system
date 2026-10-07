# Buyer App — Notifications

**Status:** ✅ built and cascaded (10/07/2026)
**Pages:** the bell panel on every buyer page (`buyer/notif.js`, injected by `cart.js`) · `design-system/buyer/notifications.html` (`#settings` opens settings)
**Reference:** the live notifications feed and bell from the SPO audit: SPO-56 (SPO events barely notify), SPO-57 (bell 10 / menu 20 / page 217), SPO-58 (wall-to-wall "Order #### confirmed", no grouping, filters or read management). Screenshot F33.

## What shipped
- **One event stream.** Notifications are derived from the SPO and schedule activity logs, the same data behind every Activity card, plus seeded order and product-approval events. There's no separate notification store to drift. Every SPO or schedule save re-counts the bell immediately.
- **Others' actions notify; your own don't.**

  | Notifies (FYI or Needs action) | Doesn't notify |
  |---|---|
  | Vendor accepted / rejected | Your own saves |
  | Invoice received / Scout AI couldn't read it | Sends you made |
  | Approval requested (SPO, schedule series, product request) | Cancels you made |
  | Approved or rejected by someone else | Validations you made |
  | Sent back for revision | |
  | Paid by Accounting | |
  | Schedule run drafted / sent | |
  | Schedule ended by someone else | |
  | Order delivered / confirmed | |
  | Invoice to validate | |

- **Needs action clears itself when the task is done** (Vu's call). An action item stays in Needs action while its task is open: the SPO is still rejected, the invoice is still unmapped, the approval is still pending, the drafted run is still a draft. Once the task is done it drops out, read or not. In All it then carries an emerald **Done** tag. Approving SPO-864 takes the badge from 10 to 9 immediately.
- **One count everywhere** (SPO-57). The bell badge, the panel's count chip and the page header all show the unread action items in the current property scope. The badge reuses the cart-badge style.
- **Bell panel:**
  - Needs action / All tabs, Today / Yesterday / Earlier groups, and an unread dot.
  - Mark all read, a settings link, and "View all notifications".
  - Each row deep-links to its task (`spo.html#861/vendor`, `spo.html#857/invoice`, `approval.html#SCH-06`, `spo-new.html#848`, `order-detail.html#657/validate`) and marks itself read.
  - Esc or an outside click closes it.
- **Notifications page:**
  - Metric cards: Needs Action · Unread · All.
  - Filters: type (Service POs · Invoices · Approvals · Schedules · Orders) and Unread only.
  - Mark all read, and per-row Mark read / unread, with Needs action / Done, type and property tags.
  - **Settings:** an in-app on/off per type. Off hides that type from the feed and the bell. Email digest shows as "coming soon".
- **Grouping** (SPO-58): three or more of the same repetitive kind on one day collapse into one expandable row, for example "12 orders confirmed today".
- **Demo data:** derived from the SPO and schedule seeds, plus 15 "order confirmed" events, an order to validate, an order invoice to validate, and product request K4PT2N waiting on approval.
  - The feed opens with **10 action items**. Anything older than a week starts out read.
  - `#reset-spos` clears read state.

## Deviations
- Live shows three different counts. Here it's one number, scoped to the current property, so the shopping pages (always scoped to one property) show that property's count.
- Live notifies about your own orders ("A new order was placed in your organization"). The seeded order confirmations keep that wording to show grouping, but SPO and schedule notifications skip your own actions.

## Held
- Email / SMS delivery and digest scheduling.
- Push notifications.
- Per-notification snooze.
- "Notify me about this SPO" follow controls.

## Pitfalls
- **Never store notifications separately from the events.** Derive them, then auto-clear by checking the entity's current state (`open()`), not a read flag.
- **Pages that don't include `spo-data.js`:** `cart.js` loads the store first, then `notif.js`, on DOMContentLoaded. `cart.js` runs before `spo-data.js` in the head on pages that do include it, so the check must wait for DOMContentLoaded.
- **Shopping pages force a single property**, so the bell count legitimately differs there from pages under "All properties".

## Components cascaded
- **Bell panel** (`.nt-panel`, `.nt-head`, `.nt-count`, `.nt-tabs`, `.nt-list`, `.nt-day`, `.nt-foot`, `.nt-badge`)
- **Notification row** (`.nt-row`, `.unread`, `.nt-dot`, `.nt-meta`, `.nt-tags` / `.nt-tag.act` / `.done`)
- **Grouped row** (`.nt-group`, `.nt-groupitems`, `.nt-chev`)
- Page styles (`.nt-kpis`, `.nt-toolbar`, `.nt-toggle`, `.switch-wrap`, `.nt-pagelist`)

Gallery **Buyer App · Notifications**; design-doc **Notifications** rules. `docs/design.md` regenerated.

---

## Tickets

### TKT-SPO-37 · Notification feed from the event stream
**Summary:** Build notifications from the SPO, schedule, order and approval event logs; others' actions notify, your own don't.
**Acceptance criteria:**
- [ ] Each lifecycle event in the notifies list creates a notification with type, title, one-line detail, time, property and deep link.
- [ ] The buyer's own actions create none.
- [ ] New events appear without a page reload after any save.
**Audit findings:** SPO-56
**Files:** `buyer/notif.js`, `buyer/spo-data.js` (save → re-count)

### TKT-SPO-38 · Needs action that clears itself
**Summary:** Action notifications stay open while their task is open and clear when it's done, regardless of read state.
**Acceptance criteria:**
- [ ] Vendor rejected, invoice to map / unreadable, approval waiting, run drafted, sent back for revision, order delivered and invoice to validate are action items.
- [ ] Completing the task (change vendor, validate mapping, decide approval, send the draft) removes the item from Needs action immediately.
- [ ] A cleared item stays in All with a Done tag.
**Audit findings:** SPO-56
**Files:** `buyer/notif.js` (`open()` per kind)

### TKT-SPO-39 · One count everywhere
**Summary:** The bell badge, the panel and the page show the same number: unread action items in the current property scope.
**Acceptance criteria:**
- [ ] The badge matches the panel's count chip and the page header on every page.
- [ ] Marking items read or completing tasks updates the badge immediately.
- [ ] Changing the property scope updates the count.
**Audit findings:** SPO-57
**Files:** `buyer/notif.js` (`count`, `syncBadge`), `buyer/cart.js` (loader)

### TKT-SPO-40 · Bell panel
**Summary:** A notifications panel from the App Bar bell on every buyer page.
**Acceptance criteria:**
- [ ] Needs action / All tabs, day groups, an unread dot, Mark all read, a settings link and View all.
- [ ] Each row deep-links to its task and marks itself read.
- [ ] Esc or an outside click closes it, and it stays within the viewport on phones.
**Audit findings:** SPO-56, SPO-57
**Files:** `buyer/notif.js`, `buyer/buyer-components.css` (`.nt-*`)

### TKT-SPO-41 · Notifications page, grouping and settings
**Summary:** A full page with filters, read management, grouping of repetitive events and per-type settings.
**Acceptance criteria:**
- [ ] Metric cards (Needs Action · Unread · All), a type filter, an Unread only toggle, Mark all read, and per-row Mark read / unread.
- [ ] Three or more of the same repetitive kind on one day collapse into one expandable row.
- [ ] Settings turn each type on or off for the feed and bell; email shows as coming soon.
- [ ] Items older than a week start out read.
**Audit findings:** SPO-58
**Files:** `buyer/notifications.html`, `buyer/notif.js` (`groupList`, prefs)
