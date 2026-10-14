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

