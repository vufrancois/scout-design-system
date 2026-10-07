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
- **SPO Stepper:** 8 fixed slots — Draft · Approval · Sent · Vendor Response · Invoice · Mapping · Accounting · Paid. Labels never change (SPO-26, SPO-54).
  - Actors are YOU / VENDOR, plus a new violet **ACCOUNTING** actor.
  - Done nodes show their date; the current node gets the whose-turn ring.
  - Rejection **halts** the Vendor Response node in rose (SPO-08).
  - An approval that wasn't needed renders **skipped** ("not required") instead of being marked done (SPO-19).
- **The Next-Task Strip names whose move it is, in every state** (copy in the SPO Lifecycle Matrix):
  - Finish your draft · Supervisor approval → Review in Approvals
  - Waiting on Vendor · Response (Resend PO)
  - Vendor rejected → Change Vendor
  - Waiting on Vendor · Invoice (Upload invoice); disputed variant "Corrected invoice"
  - Map invoice; extraction-failed variant "Invoice … needs attention"
  - Send to Accounting
  - Waiting on Accounting · Payment
  - Paid
- **Vendor response is a real step** (SPO-09, SPO-35):
  - **Accepted** advances the SPO to Awaiting Invoice and logs it.
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
- **Status pill = lifecycle label** (Awaiting Vendor, Invoice to Map, With Accounting…), never a generic "Open" (SPO-25).

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
