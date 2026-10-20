# Service POs — SPO Detail & Vendor Response

**Status:** ✅ built and cascaded (10/07/2026)
**Pages:** `design-system/buyer/spo.html#<id>` · task routes `#<id>/vendor` (Change Vendor) · `#<id>/cancel` · `#<id>/invoice` · `#<id>/accounting`
**Reference:** live SPO detail screens across Draft, Sent, Rejected, Awaiting invoice, Validated, and Canceled, from the SPO audit.

## What shipped
- **One stateful page** following Buyer Order Detail.
  - **Hero:** "SPO-857" with a copy button; the subtitle is property · vendor.
  - **SPO Progress card:** one status pill and the stepper.
  - **Manage this SPO:** Clone SPO, plus Cancel SPO while it is still cancelable (draft → awaiting invoice).
  - **Next-Task Strip** below the progress card, then Scope of work, line items, the invoice card, and the right rail.
- **SPO Stepper:** 7 fixed slots — Draft · Approval · Sent · Invoice · Mapping · Accounting · Paid. Labels never change (SPO-26, SPO-54). *(Was 8 with a Vendor Response slot until 10/14/2026 — see the addendum.)*
  - Actors are YOU / VENDOR, plus a new violet **ACCOUNTING** actor.
  - Done nodes show their date; the current node gets the whose-turn ring.
  - Rejection **halts** the Invoice node in rose (SPO-08); the Sent node carries the Vendor Response Label.
  - An approval that wasn't needed renders **skipped** ("not required") instead of being marked done (SPO-19).
- **The Next-Task Strip names whose move it is, in every state** (copy in the SPO Lifecycle Matrix):
  - Finish your draft · Supervisor approval → Review in Approvals
  - Vendor rejected → Change Vendor
  - Waiting on Vendor · Invoice (Upload invoice; plus I spoke to the vendor while there's no response, Change their answer once the buyer recorded one); disputed variant "Corrected invoice"
  - Map invoice; extraction-failed variant "Invoice … needs attention"
  - Send to Accounting
  - Waiting on Accounting · Payment
  - Paid
- **Vendor response is a signal, not a step** (changed 10/14/2026 — see the addendum; SPO-09, SPO-35):
  - **Accepted** is logged and labelled; it never gates anything.
  - **Rejected** is a your-move state: the strip quotes the vendor's reason, with **Change Vendor** as the one primary and Cancel SPO as secondary. There is one Change Vendor button, not two (SPO-12).
  - Both outcomes drop the live product's "status and approval workflow are unchanged" disclaimer (SPO-28).
- **Change Vendor modal:** option rows with same-trade vendors first, then the others. Confirming re-sends the PO to the new vendor's email and logs "Vendor changed" + "Sent to …".
- **Cancel** requires a reason. The canceled state drops the stepper and strip (as a canceled order does) and shows an **SPO Status card**:
  - Canceled pill;
  - "Canceled on MM/DD/YYYY by <named person>", never a raw customer ID (SPO-52);
  - the quoted reason;
  - "<vendor> was notified. Nothing was invoiced or paid." (or "It was never sent to a vendor.");
  - Clone SPO.

  Canceled is spelled with one L everywhere (SPO-53).
- **Line items show their allocation:** each line has description, qty × price, total, and **allocation chips** (GL + unit + share when split) (SPO-24). Lines show no "Original line estimate" text that just repeats the price (SPO-27).
- **Scope of work** shows the scope text only; property, requester, and vendor already appear elsewhere on the page (SPO-07).
- **Rail:**
  - **Vendor card:** trade eyebrow, name, and the email the PO goes to. No internal vendor codes or location IDs (SPO-11).
  - **Facts:** Property, Requested by, Created, Spend period, Approval ("Not required" / "Pending · Supervisor" / "Approved by …").
  - **Documents:** doc rows (sky PO once sent; emerald invoice; violet Payment packet once sent to Accounting).
  - **Activity:** derived from every transition with a named actor, so it is never empty (SPO-10, SPO-20). Rejected and canceled events take a **rose dot** (`.act-ev.bad`).
- **Status pill = lifecycle label** (Awaiting Invoice, Invoice to Map, With Accounting…), never a generic "Open" (SPO-25).

## Deviations from the live product
- "Revive SPO" on canceled SPOs is replaced by **Clone SPO**. A canceled record stays closed; Clone starts a fresh draft with the lines copied (SPO-55).
- The seed vendors are fictional, with `.example` emails. Demo actions never email anyone.

## Held
- Scheduled/recurring series view (SPO-50).
- Notifications for vendor response and Accounting payment (SPO-56).

## Pitfalls
- Vendor names that end in "Co." produced "Co.." at the end of strip sentences. Use `endDot()` wherever a name ends a sentence.
- `buyer-components.css` colors every Activity dot emerald, so exception events need the explicit `.act-ev.bad` rose override.
- Clean-URL hosting: task routes are hash sub-paths (`#861/vendor`), and closing a task modal `replaceState`s back to `#861`.

## Components cascaded
SPO Stepper states (`.ls-actor.acct`, `.ls-step.active.acct`, `.ls-step.halted`, `.ls-step.skipped`), SPO Line + Allocation Chip (`.spo-line`, `.alloc-row`, `.alloc-chip`), `.spo-manage`, `.act-ev.bad`, `.status-dot.dot-violet`. Design-doc Stepper rule extended (third actor, halted/skipped). Gallery + design-doc **Service POs (SPO)**.

---

## Tickets

### TKT-SPO-10 · SPO detail page & fixed 8-step stepper
**Summary:** One stateful detail page per SPO with a fixed-label 8-step stepper, one status pill, and a Next-Task Strip in every state.
**Acceptance criteria:**
- [ ] Stepper labels are identical in every state; done nodes show dates; the current node's ring matches whose turn it is (amber you / sky vendor / violet Accounting).
- [ ] An approval that wasn't required renders "not required", never as completed.
- [ ] The status pill shows the lifecycle label from the SPO Lifecycle Matrix.
- [ ] Every state has a strip naming whose move it is; only your-move states have a primary.
- [ ] Line items show GL + unit chips; there is no repeated "original estimate" text when it equals the price.
- [ ] The rail shows no internal vendor codes or location IDs.
**Audit findings:** SPO-07, SPO-11, SPO-19, SPO-24, SPO-25, SPO-26, SPO-27, SPO-54
**Files:** `buyer/spo.html`, `buyer/buyer-components.css` (`.ls-*` additions, `.spo-line`, `.alloc-*`, `.spo-manage`)

### TKT-SPO-11 · Vendor response: accept, reject, change vendor
**Summary:** Vendor acceptance and rejection change the SPO's state; rejection halts the pipeline and offers Change Vendor.
**Acceptance criteria:**
- [ ] Accept → Awaiting Invoice, logged with the vendor and date.
- [ ] Reject → Vendor Rejected (rose halted node), with the vendor's reason quoted in the strip and in Activity.
- [ ] Exactly one Change Vendor button. Its modal lists same-trade vendors first; confirming re-sends the PO and logs both events.
- [ ] Resend PO is available while waiting on the vendor and is logged.
**Audit findings:** SPO-08, SPO-09, SPO-12, SPO-28, SPO-35
**Files:** `buyer/spo.html` (`openChangeVendor`, `confirmVendor`, `resendPO`), `buyer/spo-data.js`

### TKT-SPO-12 · Cancel SPO with a named actor
**Summary:** Canceling requires a reason; the canceled SPO is a terminal record naming who canceled it.
**Acceptance criteria:**
- [ ] Cancel is available from draft through awaiting invoice and requires a reason (button disabled until the reason has text).
- [ ] The canceled view has no stepper and no strip. The SPO Status card shows the date, the canceller's name, the quoted reason, and whether the vendor was notified.
- [ ] Spelling is "Canceled" everywhere. The only follow-up action is Clone SPO (no un-cancel).
**Audit findings:** SPO-52, SPO-53, SPO-55
**Files:** `buyer/spo.html` (`openCancel`, `confirmCancel`)

### TKT-SPO-13 · SPO activity trail
**Summary:** Every lifecycle transition appears in Activity with a named actor; exceptions read rose.
**Acceptance criteria:**
- [ ] Created, approval requested/decided, sent, accepted/rejected, vendor changed, invoice received, mapped, sent to Accounting, paid, and canceled are all logged, newest first.
- [ ] A newly created and sent SPO already shows its events.
- [ ] Rejected and canceled events use the rose dot; all others use emerald.
**Audit findings:** SPO-10, SPO-20
**Files:** `buyer/spo-data.js` (`log`, `buildLog`), `buyer/buyer-components.css` (`.act-ev.bad`)

## Addendum · Vendor response is a signal, not a step (10/14/2026)

**Why:** team feedback. Supply-side vendors often ignore the accept/reject email, so an SPO that waits on a reply hangs, and a Vendor Response step sits empty for the SPO's whole life. The team's rule: *Reject → confident it's rejected. Accept → confident it's accepted. Neither → the only thing we know is that they did neither.* This replaces the audit's "vendor response as a gated transition" recommendation; the findings behind it (SPO-08 rejection didn't stop anything, SPO-28/35 acceptance was decorative) stay fixed.

**What changed**
- **No Awaiting Vendor state.** Send (or approval) moves the SPO straight to **Awaiting Invoice**; Upload invoice is available at once. Stored SPOs still in `sent` migrate on load.
- **Stepper drops to 7 slots.** The reply is a **Vendor Response Label** under Sent: Accepted (emerald) · Rejected (rose) · No response (neutral grey, never amber).
- **Rejection still halts** — it's an affirmative answer. The Invoice node goes rose ("stopped"); Change Vendor / Cancel as before. The vendor's email link stops counting once an invoice arrives.
- **Never infer.** An invoice arriving with no reply leaves the label at No response; Activity's "Invoice received" adds "the vendor never responded to the PO".
- **I spoke to the vendor** (buyer-recorded response; button renamed from "Record response" on team feedback): while the SPO awaits its invoice with no reply, the Next-Task Strip offers it. The dialog asks "What did <vendor> say?". Pick **Accepted**, **Rejected** or **No response** (preselected; the default). Recorded rejections move the SPO to Vendor Rejected like a vendor's click. A buyer-recorded answer reads "recorded by *name*" and can be changed with **Change their answer** — including back to **No response**; the vendor's own click can't be edited. Activity logs "Acceptance recorded" / "Rejection recorded" / "Response cleared". Deep link `#<id>/respond`.
- **Rail:** new **Vendor response** fact row.
- **List:** the With Vendor card reads "Waiting on their invoice"; the response isn't shown on list rows (too noisy), but there's a **Vendor response** filter (Accepted / Rejected / No response).
- **Notifications** unchanged: rejection = Needs action; vendor acceptance = info; a buyer-recorded acceptance is your own action (no notification); no response = nothing.
- **Seeds (store key `scout-spos-v5`):** 863 no response · 862 recorded by the buyer · 859 and 842 no response · 857 invoice arrived with no response · 854 paid with no response.

### TKT-SPO-46 · Vendor response as a signal, not a step
**Summary:** Sending an SPO never waits on the vendor. The vendor's reply is shown as Accepted, Rejected or No response — only what we actually know — and a buyer can record an answer they got outside Scout.
**Acceptance criteria:**
- [ ] After Send (or approval), the SPO is Awaiting Invoice and Upload invoice works with no vendor reply.
- [ ] The stepper has 7 slots; the Sent slot shows a Vendor Response Label: Accepted (emerald, dated), Rejected (rose) or No response (neutral).
- [ ] No response is never amber, never a Needs action item, and never sends a notification.
- [ ] A vendor rejection before an invoice arrives moves the SPO to Vendor Rejected (Invoice node halted) with Change Vendor; after an invoice arrives, the email link no longer counts.
- [ ] An invoice arriving without a reply does not mark the SPO accepted; Activity notes the vendor never responded.
- [ ] "I spoke to the vendor" is offered only while awaiting the invoice with no reply; it offers Accepted, Rejected and No response (preselected), and a recorded rejection moves the SPO to Vendor Rejected.
- [ ] A buyer-recorded answer shows "recorded by <name>" (label tooltip, fact row, strip, Activity) and can be edited — to the other answer or back to No response. A vendor's own answer can't be edited.
- [ ] The SPO list can filter by Vendor response.
- [ ] Changing vendor clears any previous response.
**Supersedes:** TKT-SPO-10 (8-step stepper → 7) and TKT-SPO-11 ("Accept → Awaiting Invoice" gating).
**Audit findings:** SPO-08, SPO-09, SPO-19, SPO-28, SPO-35 (re-scoped by team decision)
**Files:** `buyer/spo-data.js` (`resp`, `canRespond`, `canEditResp`, `ackText`, `sent` → `invoice` migration, seeds), `buyer/spo.html` (`STEPS`, `respTag`, `vendorRespRow`, `openRecordResp`, `confirmRecordResp`), `buyer/spos.html` (Vendor response filter), `buyer/spo-new.html`, `buyer/approval.html`, `buyer/home.html`, `buyer/spo-invoice.html`, `buyer/buyer-components.css` (`.ls-resp`, `.fact-sub`, `.resp-opt`)

## Addendum · Search the approved-vendor directory in Change Vendor (10/14/2026)

**Why:** team feedback — Change Vendor listed every vendor as a flat list, but production has thousands of approved vendors.

**What changed**
- **Search field** at the top of Change Vendor ("Search 1,272 approved vendors by name, trade or email…"), focused on open. Every word must match (e.g. "hvac lafourche").
- **Empty search = suggestions:** same-trade vendors as the one who rejected, vendors you've used before first ("Used before" pill), then the directory.
- **Results are capped at 25** with a count ("118 matches · showing 25, keep typing to narrow"); no match says so and suggests searching by trade.
- The picked vendor stays selected while you keep searching; the button names it ("Send to Acadian Rooter").
- **Prototype directory:** `SPO.VEN` gains ~1,260 deterministic approved vendors (`dir: true`, keys `D0001…`, avatar letters in `ini`). Pickers that list your vendors (wizard, invoice intake) leave them out until searched, so they stay short. `SPO.ini(key)` gives avatar letters everywhere.

### TKT-SPO-47 · Search approved vendors when changing vendor
**Summary:** Change Vendor searches the full approved-vendor directory instead of listing every vendor.
**Acceptance criteria:**
- [ ] The dialog opens with the search field focused and suggests same-trade vendors, used-before vendors first.
- [ ] Search matches name, trade and email; every word must match; results are capped (25) with a total count and a "keep typing" hint.
- [ ] No result shows an empty state that suggests searching by trade.
- [ ] A picked vendor stays selected while the search changes; the confirm button names the vendor.
- [ ] Confirming re-sends the PO to the new vendor and clears any earlier response (unchanged from TKT-SPO-11).
- [ ] Production: search runs server-side against the approved-vendor list for the property's company.
**Files:** `buyer/spo.html` (`openChangeVendor`, `renderVenList`, `selectVen`), `buyer/spo-data.js` (directory, `ini`), `buyer/spo-new.html`, `buyer/spo-invoice.html`, `buyer/spos.html`, `buyer/buyer-components.css` (`.ven-results`, `.ven-head`, `.ven-empty`)

## Addendum · Service appointment (10/16/2026)

**Why:** the team wants a proposed time to go with the PO when it's sent, and the vendor may come back with another time, so the buyer needs to see that an update was made. References: production's "Propose a service appointment" dialog and "Service appointment · Confirmed" card. Kept: the card, Proposed/Confirmed, "Propose a new time", add-to-calendar, the property time zone. Changed: **no duration** (the team asked; it also duplicated the end time), no error text before the buyer tries to send, and no "status… unchanged" disclaimer (SPO-28).

**What shipped**
- **Wizard Scope step** (moved from Review on 10/16/2026, per Vu, to match production): an optional **Schedule service** switch card under Spend period. On: Start date + Start time (required — Continue waits for them), End date (defaults to the start date) + End time (optional); the property time zone is read-only (no picker — every property has one). Off or empty = the PO says "Vendor to propose a time". Review shows a **Service time** fact row with Edit/Add. If the SPO is then made recurring, runs use the recurring SPO's day and time instead.
- **SPO page:** a **Service appointment** card under the Next-Task Strip: No time yet (Propose a time) · Proposed (Change proposed time) · **New time proposed** · Confirmed (Propose a new time + add to calendar: .ics for Apple/Outlook, link for Google). After the SPO moves on, the card is read-only ("proposed, never confirmed" when it never was).
- **Vendor proposes a new time** (decision A: this also counts as accepting the PO — "Accepted · new time proposed"). Made visible four ways: the card's amber edge, **Updated by vendor** badge and struck-through old time; the strip becomes your move (**Accept new time** / **Propose another**); a **Needs action** notification that clears itself once answered; Activity (old → new). On the SPO list the row becomes your move (flag + Review new time; counts in Your Move) — added 10/16/2026 after team feedback.
- **I spoke to the vendor → Accepted** offers "They also confirmed the proposed time".
- A rejection clears the appointment; **Change Vendor** re-proposes the same time to the new vendor.
- **Recurring SPO runs:** "Confirmed by the recurring SPO" at the series' day and time.
- **Follow-up (decision B):** show appointments on the Recurring SPOs Run Calendar.
- **Seeds (store `scout-spos-v6`):** 863 proposed · 862 confirmed (recorded) · 860 new time from vendor · 859 no time yet · 857 proposed, never confirmed. The bell starts at **11**.

### TKT-SPO-50 · Propose a service time with the PO
**Summary:** The buyer can send a proposed time with the PO; no duration.
**Acceptance criteria:**
- [ ] The wizard's Scope step has a Schedule service switch card. On: Start date and Start time (required to continue), End date (defaults to the start date), End time (optional); the property's time zone read-only. No duration.
- [ ] Off (or never turned on), the PO reads "Vendor to propose a time"; Review shows the time, or "Vendor to propose a time", with a link back to Scope.
- [ ] Sending (or approval) logs "Service time proposed" with the full time.
- [ ] Recurring SPOs don't show the card; their runs use the series' day and time.
**Files:** `buyer/spo-new.html` (`schedCard`, `toggleSched`, `setAppt`, `apptFromW`, `stepOk`, `persist`), `buyer/spo-data.js` (`appt`, `fmtAppt`, `TZ`)

### TKT-SPO-51 · Service appointment card and rescheduling
**Summary:** One card shows the appointment's state; either side can propose a new time.
**Acceptance criteria:**
- [ ] States: No time yet · Proposed · New time proposed · Confirmed, each with a status pill and the full time in the property's time zone.
- [ ] Propose a time / Change proposed time / Propose a new time open one dialog with the same fields as the wizard (Start date, Start time, End date defaulting to the start date, optional End time); errors appear only after Send, one line per problem.
- [ ] Confirmed shows add to calendar: .ics for Apple and Outlook, a Google Calendar link.
- [ ] "I spoke to the vendor" → Accepted can confirm the proposed time; a rejection clears the appointment; Change Vendor re-proposes it.
- [ ] Every change is logged in Activity with old → new.
- [ ] The SPO list can filter by Appointment.
**Files:** `buyer/spo.html` (`apptCard`, `openTime`, `sendTime`, `addToCal`, `gcalUrl`), `buyer/spos.html` (`setApptF`), `buyer/buyer-components.css` (`.appt-*`, `.time-grid`, `.check-row`)

### TKT-SPO-52 · Show when the vendor proposes a new time
**Summary:** A vendor's counter-proposal is visible and becomes the buyer's move.
**Acceptance criteria:**
- [ ] The card turns amber with "Updated by vendor", the date, and the old time struck through next to the new one.
- [ ] The Next-Task Strip becomes the buyer's move: Accept new time (→ Confirmed) or Propose another (→ Proposed).
- [ ] A Needs-action notification ("<vendor> proposed a new time for SPO-###") links to the card and clears itself once answered.
- [ ] The vendor response reads "Accepted · new time proposed" (a counter-proposal counts as accepting the PO).
- [ ] On the SPO list the row is the buyer's move: an amber "New time proposed" flag under the status, the primary Review new time (→ `#<id>/time`), and it counts in Your Move on the list and Home until answered (team feedback, 10/16/2026 — the original "not on list rows" call left the buyer no way to see it there).
**Files:** `buyer/spo.html` (`taskStrip`, `acceptNewTime`), `buyer/notif.js` ("Vendor proposed a new time"), `buyer/spo-data.js` (`resp`, `buildLog`, `needsTime`), `buyer/spos.html` (`groupOf`, row flag + primary), `buyer/home.html`, `buyer/buyer-components.css` (`.row-flag`)

## Addendum · Rebid replaces Change Vendor (10/16/2026)

**Why:** team feedback. Cancel should offer *Cancel outright* or *Cancel and rebid* (a parked "orphan" SPO waiting for a new vendor), and a **Rebid** button should cancel and clone for a new vendor in one go. Decisions (Vu): **A** — Rebid replaces Change Vendor everywhere, so every vendor change leaves a clean record with a new SPO number; **B** — an approval carries over when the amount doesn't go up.

**What shipped**
- **One action, two timings.** Rebid cancels the SPO and creates a new one (same scope, lines, allocation, proposed time), linked both ways: the original's status card reads "Rebid as SPO-###", the new one shows "Rebid of SPO-###"; Activity on both.
  - **Cancel → Cancel and rebid** (option rows in the Cancel dialog; both options need a reason) parks the copy in the new **Rebid** state.
  - **Rebid** button (Manage row; the primary on Vendor Rejected, replacing Change Vendor) takes a reason (pre-filled from a vendor's rejection) and a vendor from the approved-vendor search, then **Send to <vendor>**; **Save for later** parks it instead.
- **Rebid state:** "Rebid · needs a vendor" (amber, Open tab, your move). Strip: *Rebid · choose a vendor and send* → **Choose vendor**. The vendor card reads "Needs a vendor · was <old vendor>". List: "Needs a vendor · Rebid of SPO-###", primary **Choose vendor**. Not committed spend (budgets, Unit History) until sent. Can be canceled outright.
- **Offered only** after the PO went out and before an invoice exists: Awaiting Invoice and Vendor Rejected (`SPO.canRebid`). Drafts change vendor in the wizard; invoiced SPOs are disputed.
- **Approval:** when the original was approved and the rebid costs the same or less, sending skips approval: "Approval carried over · Approved on SPO-### by …", and the tracker's Approval step reads "from SPO-###". Otherwise it goes to Approvals first.
- **Not carried:** the vendor response, invoices and Activity stay with each SPO. A proposed time is re-proposed to the new vendor if it's still in the future.
- **Seeds (store `scout-spos-v7`):** SPO-851 canceled for rebid → SPO-867 parked. SPO-861 (vendor rejected) shows the Rebid primary.

### TKT-SPO-53 · Cancel with a rebid option
**Summary:** Cancel offers Cancel SPO or Cancel and rebid; the latter parks a linked copy that waits for a vendor.
**Acceptance criteria:**
- [ ] On SPOs that can be rebid, the Cancel dialog shows two options (Cancel SPO / Cancel and rebid); elsewhere it's a plain cancel. A reason is required either way; the confirm button names the choice.
- [ ] Cancel and rebid cancels the original (vendor notified), creates a new SPO in Rebid with the same scope, lines, allocation and proposed time, links both ways, and opens the new SPO.
**Files:** `buyer/spo.html` (`openCancel`, `pickCancelMode`, `confirmCancel`, `doRebid`), `buyer/spo-data.js` (`canRebid`, seeds, `buildLog`)

### TKT-SPO-54 · Rebid button (replaces Change Vendor)
**Summary:** One button cancels the SPO and sends a copy to a new vendor.
**Acceptance criteria:**
- [ ] Rebid shows in Manage this SPO for Awaiting Invoice (no invoice yet) and is the primary on Vendor Rejected; Change Vendor no longer exists. `#<id>/rebid` (and the old `#<id>/vendor`) open it.
- [ ] The dialog needs a reason (pre-filled from a vendor's rejection) and a vendor from the approved-vendor search; Send cancels the original and sends the new SPO; Save for later parks it.
- [ ] The approval carries over when the original was approved and the amount doesn't go up, shown on the Approval step and in Activity; otherwise the rebid goes to Approvals.
**Files:** `buyer/spo.html` (`openRebid`, `confirmRebid`, `sendRebid`, `venPicker`, `renderVenList`), `buyer/spos.html` (row primary)

### TKT-SPO-55 · Rebid state
**Summary:** A parked rebid is its own state until a vendor is chosen.
**Acceptance criteria:**
- [ ] "Rebid · needs a vendor": amber, Open tab, counted in Your Move on the list and Home; the list shows "Needs a vendor · Rebid of SPO-###" with Choose vendor.
- [ ] The page shows the link to the original, a vendor card "Needs a vendor · was …", and a strip whose Choose vendor opens the vendor search and sends.
- [ ] Not counted as committed spend (budget meters, Unit History) until sent; can be canceled outright.
**Files:** `buyer/spo-data.js` (`STATES.rebid`), `buyer/spo.html` (`openRebidSend`, `rebidLink`), `buyer/spos.html`, `buyer/home.html`, `buyer/unit-history.html`



## Addendum · Invoice mapping on the Invoice card (10/18/2026)

**Why:** team feedback: "carry the SPO mapping a level up for quick visibility. In addition to drilling down to View Mapping, show the SPO # and line item from that SPO here." On a shared invoice the SPO page also never said which other SPOs the invoice covered.

**What shipped**
- Under each validated invoice on the SPO page's Invoice card, a table: **Invoice line · Amount · Mapped to** ("SPO-836 · Line 1 · Breezeway fixture replacement"). View mapping stays for the full board.
- **Shared invoice:** a "Shared invoice · n SPOs · $total" line; this SPO's lines first, then the other SPOs' lines, shaded, tagged "other SPO" and linked; a Sales tax row shows the split per SPO. The invoice summary reads "this SPO's share $414.20".
- Split lines list each part ("1/2 · $400.00"); one-time extras show their GL and unit; removed lines are struck through with the reason; a partly invoiced SPO gets a table under each invoice. An invoice still to map shows no table (Map invoice).
- Phone width: Mapped to drops under the line and amount.

### TKT-SPO-60 · Show invoice-to-SPO mapping on the Invoice card
**Summary:** The SPO page shows, for each validated invoice, every invoice line and the SPO and SPO line it was mapped to, without opening View mapping.
**Acceptance criteria:**
- [ ] Under each validated invoice, a table lists each invoice line, its amount, and what it was mapped to: SPO number, line number and SPO line description.
- [ ] A line split across SPO lines lists each part with its fraction and amount; a one-time extra shows its GL and unit; a removed line is struck through with its reason.
- [ ] On a shared invoice, the table shows every SPO's lines: this SPO's first, the others labelled "other SPO" and linked to their page, plus the invoice total, the number of SPOs, and the tax split per SPO.
- [ ] A partly invoiced SPO (TKT-SPO-59) shows a table under each of its invoices.
- [ ] An invoice not yet validated shows no table.
**Backend / data:** the validated mapping per invoice line (SPO id, SPO line, amount; extra GL/unit; removed reason), readable across the SPOs on a shared invoice.
**Files:** `buyer/spo.html` (`invMap`, `invoiceCard`), `buyer/buyer-components.css` (`.inv-map`, `.im-row`, `.im-other`)


> **Updated 10/20/2026 by TKT-SPO-62:** the mapping table from TKT-SPO-60 moved to the invoice page. The SPO page's Invoice card now lists the SPO's invoices with **Open invoice**.

## Addendum · SPO page refresh (10/20/2026)

**Why:** the team updated the SPO page in production and Vu liked it: GL/unit chips per line, "Validated invoices" in totals, actor and time on every Activity event, the property block in the scope card, fixing GL and unit after sending, an SPO | Invoice switch, and accounting references. We built them with guardrails, then cascaded the shared parts to the invoice page.

**What shipped**
- **GL Allocation Strip** (`SPO.glStrip`) under every SPO line — GL code · name · unit (links to Unit History) · amount per portion — the same component as the invoice page, also on the SPO list's expanded rows, recurring SPOs and the wizard's Review. A portion with no unit shows an amber "Unit not assigned".
- **Totals:** "Validated invoices $0.00" until an invoice is validated, then the invoiced amounts, above the SPO estimate.
- **Scope card:** bullets when the scope has one item per line; then Property · Address · Requested by … on … · Spend period (dotted underline; tooltip: the budget month it counts against). These left the side panel.
- **Edit GL & unit** after sending (Awaiting Invoice, Invoice to Map, Ready): a GL and unit select per portion. Lines already billed are locked ("correct it on the mapping board"). The budget check re-runs: a change that pushes a GL over its spend-period budget can't be saved (a GL already over before the edit isn't blocked again). Every portion needs a unit. Saves log "GL & unit corrected" with each change; the vendor isn't emailed.
- **SPO | Invoices · n** switch once the SPO has an invoice; the Invoices view lists them with Open invoice (`#<id>/invoices` opens it).
- **Activity** (shared row, `SPO.actRow`, also on the invoice page): what happened, a short detail, then the exact time and **By …** (a person, the vendor, System or Accounting). Kept quiet: no method ("via email"), the detail never repeats the actor, no email addresses, no time zone (it's on the appointment card). Collapsible, "SPO and invoice history".
- **Accounting references** (collapsed in the side panel, copyable): SPO number · vendor code · location ID. Demo codes look real — never TEMP codes or placeholder names (audit SPO-03, SPO-13).
- **Documents:** a neutral count pill and a collapse arrow (also on the invoice page).

**Different from the team's version:** over-budget GL changes are **blocked**, not sent for re-approval (a re-approval request type in Approvals is a follow-up); no "Add equal portion" (splitting a line means editing amounts — its own pass); "Vendor notification: sent" and the duplicated recipients list are left out (the Sent step and the vendor card cover them).

### TKT-SPO-63 · SPO page refresh: GL strip, invoiced-to-date, activity actors, GL & unit corrections
**Summary:** The SPO page shows GL and unit per line in the shared strip, how much is validated, who did what and when, and lets buyers correct GL and unit after sending without bypassing budget.
**Acceptance criteria:**
- [ ] Every SPO line shows its GL Allocation Strip (GL · unit · amount per portion); a portion with no unit reads "Unit not assigned". Same component on the SPO list, recurring SPOs, the wizard and the invoice page.
- [ ] Totals show Validated invoices (or the invoiced amounts) and the SPO estimate.
- [ ] The scope card shows bulleted scope when it lists items, plus property, address, requester and date, and spend period with a tooltip.
- [ ] Edit GL & unit is offered while the SPO awaits or is mapping an invoice; billed lines are locked; a change that pushes a GL over budget can't be saved and says by how much; every portion needs a unit; saves are logged with each change and don't email the vendor.
- [ ] Once the SPO has invoices, an SPO | Invoices · n switch lists them, each opening the invoice page.
- [ ] Every Activity event shows its time and actor; no method, repeated actor, email address or time zone in the detail.
- [ ] Accounting references (SPO number, vendor code, location ID) are available, collapsed and copyable.
**Backend / data:** vendor codes and location IDs; a GL/unit correction endpoint that re-runs the budget check and logs the change; an actor on every event.
**Follow-ups:** re-approval for over-budget corrections; Add equal portion.
**Files:** `buyer/spo-data.js` (`glStrip`, `actorOf`, `actRow`, `vendorCode`, `locationId`, `acctRefs`), `buyer/spo.html` (`allocEditor`, `saveAllocEdit`, `spoTab`, scope card, side panel), `buyer/spos.html`, `buyer/schedule.html`, `buyer/spo-new.html`, `buyer/invoice.html`, `buyer/buyer-components.css` (`.gl-strip`, `.alloc-edit*`, `.acct-refs`, `.ameta`, `.scope-facts`, `.spo-tabs`)
