# Service POs — Create Wizard & Approvals

**Status:** ✅ built and cascaded (10/07/2026)
**Pages:** `design-system/buyer/spo-new.html` (`#new` · `#<draftId>` · `#clone-<id>` · `#done-<id>`) · `design-system/buyer/approvals.html` + `approval.html#SPO-<id>` (SPO requests)
**Reference:** live SPO wizard walk-through (happy and messy paths) in the SPO audit.

## What shipped
- **Checkout Step Band:** Property → Scope → Costs → Review, as hash states. The work in progress is kept in sessionStorage (`scout-spo-wip`), so a refresh never loses work.
  - A draft opens on Review.
  - Clone opens on Costs, with the lines copied and a new id.
- **Property is chosen in the wizard.** It defaults to the current "Shopping for" property but can be changed (SPO-18).
- **Vendor picker:** a searchable list of option rows ("Search vendors or trades…") showing approved service vendors only, each with its trade. The email the PO goes to is shown, never typed; there is no separate required email field (SPO-13, SPO-14).
- **Scout AI drafts lines from the scope text:**
  - Trade matches (plumbing, paint, carpet…) beat generic ones ("clean", "exterior" are fallbacks only).
  - Per-unit vs flat pricing is detected.
  - A unit the property doesn't have is **flagged, never coerced** (SPO-15).
  - A line with no price stays empty and flagged instead of $0.00 (SPO-21).
  - "Try an example" fills a demo scope.
- **Line editor:** description, qty, and the **Currency Input**. Typed "600" means $600.00 (SPO-22).
  - GL and unit are Combo Boxes; GL codes are sorted (SPO-17).
  - "Split across GL codes or units" (with "Split evenly") creates allocation rows with dollar amounts, which must sum to the line (SPO-23).
  - An amber note fires when a description no longer matches its GL.
- **Step guard:** Continue stays enabled, and the blocked reasons are listed under it ("Line 2: add a price — none was given in the scope", "Line 3: unit 1805 isn't at Magnolia Place Apartments — choose the right unit"), never a silent no-op.
- **Review:**
  - Lines with allocation chips, and a **Budget Meter** per GL touched (spent · committed · this SPO).
  - **Approval is real** (SPO-16, SPO-34). If the total is over $2,500 or any GL goes over budget, an amber callout appears and the primary becomes "Submit for approval". Otherwise an emerald callout and "Send to <vendor>".
  - "Save draft" is secondary.
- **Confirmation (`#done-<id>`):** a receipt-style page with the SPO number and what happens next. The SPO is created with a "SPO created" activity entry, plus Sent / Approval requested events as applicable (SPO-19, SPO-20).
- **Approvals integration:**
  - SPO requests appear in the Order Approvals queue (`SPO-864`, a Service PO pill, no "#" prefix), and the queue cards reconcile: Total 16 = Pending 2 + Revision 1 + Approved 10 + Rejected 3.
  - The detail page `approval.html#SPO-<id>` shows:
    - a "Service PO lines" card (allocation chips, View SPO link, no inventory refresh);
    - the estimate total;
    - the Reason fact;
    - "Sent to Vendor" as the last stepper slot.
  - Deciding writes back to the SPO: Approve → sent (logs Approved and Sent), Request revision → draft, Reject → canceled.

## Deviations from the live product
- The budget warning no longer just warns: it routes the SPO to approval (SPO-16).
- The approval step is not auto-completed on submit. The stepper only advances through steps that really happened (SPO-19).

## Held
- Standalone multi-SPO invoice intake.
- Recurring SPOs from the wizard ("Repeat every…").

## Pitfalls
- The first AI pass split "Carpet cleaning" across 6035 and 6045 because the generic "clean" trade matched first. Generic trades are now fallback-only.
- `persist()` used to call `SPO.log` on a fresh SPO, which duplicated "SPO created". It now initializes `s.log` directly.

## Components cascaded
**Currency Input** (`.money-in`), **Budget Meter** (`.bmeter*`), wizard line editor (`.w-line*`, `.w-alloc`, `.w-note`, `.w-blockers`). Gallery + design-doc **Service POs (SPO)**.

---

## Tickets

### TKT-SPO-05 · Create SPO wizard
**Summary:** A 4-step wizard (Property → Scope → Costs → Review) with a persisted draft, clone, and a confirmation page.
**Acceptance criteria:**
- [ ] Property can be changed inside the wizard; the default is the current scope.
- [ ] The vendor picker lists approved, de-duplicated service vendors only, with search; the vendor email is not a separate required field.
- [ ] Refreshing mid-wizard keeps the work. A saved draft reopens on Review; Clone opens on Costs.
- [ ] Continue never fails silently: blocked reasons are listed under it.
- [ ] Submitting creates an activity entry for each real transition (created, approval requested / sent).
**Audit findings:** SPO-13, SPO-14, SPO-18, SPO-19, SPO-20
**Files:** `buyer/spo-new.html`, `buyer/spo-data.js`

### TKT-SPO-06 · Scout AI line drafting
**Summary:** Draft SPO lines from the scope without inventing data.
**Acceptance criteria:**
- [ ] A specific trade beats a generic trade when picking the GL.
- [ ] Unit references are resolved against the property's unit master; an unresolvable unit is flagged, not changed.
- [ ] Prices in the scope are kept (multi-line scopes included); a missing price is left empty and flagged, never $0.00.
- [ ] Per-unit vs flat pricing produces the right qty × price.
**Audit findings:** SPO-15, SPO-21, SPO-45
**Files:** `buyer/spo-new.html` (`aiDraft`)

### TKT-SPO-07 · Currency input & line splits
**Summary:** Price entry treats whole numbers as dollars; splits are amount-based and must sum to the line.
**Acceptance criteria:**
- [ ] Typing `600` stores $600.00; blur formats to 2 decimals.
- [ ] Splitting a line creates allocation rows (GL + unit + $) whose total equals the line total; a mismatch blocks Continue with the reason.
- [ ] GL code options are sorted by code; GL and unit pickers are searchable.
**Audit findings:** SPO-17, SPO-22, SPO-23
**Files:** `buyer/spo-new.html`, `buyer/buyer-components.css` (`.money-in`, `.w-alloc`)

### TKT-SPO-08 · Budget meters and the real approval gate
**Summary:** Review shows each GL's budget impact; over-budget or over-$2,500 SPOs must be approved before they reach the vendor.
**Acceptance criteria:**
- [ ] Each GL touched shows spent, committed, and this SPO against its budget, with the percent; over 100% renders rose.
- [ ] If the total is over $2,500 or any GL is over budget, the primary is "Submit for approval" and the SPO enters the approval state, not sent.
- [ ] Otherwise the primary is "Send to <vendor>" and the SPO goes straight to sent, with "Approval" shown as not required.
**Audit findings:** SPO-16, SPO-34
**Files:** `buyer/spo-new.html`, `buyer/spo-data.js` (`budget`, `glOver`, `needsApproval`), `buyer/buyer-components.css` (`.bmeter*`)

### TKT-SPO-09 · SPO requests in Order Approvals
**Summary:** SPO approval requests join the Order Approvals queue and detail; decisions write back to the SPO.
**Acceptance criteria:**
- [ ] The queue lists SPO requests with a Service PO marker, and all cards and filters include them.
- [ ] The detail shows the SPO lines with allocation chips, the estimate total, the reason (over $2,500 / GL over budget), and a View SPO link.
- [ ] Approve → SPO sent (both events logged); Request revision → draft; Reject → canceled with the comment as the reason.
- [ ] Home's Approvals card matches the queue total.
**Audit findings:** SPO-34
**Files:** `buyer/approvals.html`, `buyer/approval.html`, `buyer/home.html`
