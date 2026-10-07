# Scout Service Purchase Orders (SPO) — UX/UI Audit

Project 4, Francois Labs. Environment: `scout-dev.medusajs.site` (buyer login). Audit date: 2026-10-06.
58 findings in [`spo-audit-findings.csv`](spo-audit-findings.csv); evidence in [`screenshots/`](screenshots/) (F01–F33), referenced by finding ID in the CSV.

**What was exercised:** full feature map (nav, list, cards, tabs, filters, detail in every lifecycle state, Create wizard ×4 steps, Invoice Mapping ×3 steps, review modal, dashboard, Unit History, Scheduled, Cancelled, Notifications). Happy path walked end-to-end (SPO-854: create → vendor-accept → invoice upload → map → validate). Messy path created (SPO-855, 4 lines incl. a GL/unit split) and all three invoices mapped and observed (exact, variance, messy-extraction). Existing SPOs opened in Validated, Sent, rejected, Scheduled, and Cancelled states for states I couldn't create.

**Not covered:** Orders/Admin cross-links beyond the nav map.

---

## 1. The five most important problems + the one structural fix

**① Wrong apartments get charged (unit data corruption). [P0, SPO-05/15/48]**
The unit master is building-based 4-digit codes `BBUU` (`0101` = bldg 01/unit 01, `0216` = bldg 02/unit 16). Scopes reference resident unit numbers (101, 1805, 1906, 1216) that don't map to those codes, and the AI force-fits them: `unit 1216 → 0216` (a **real but wrong** apartment), `1906 → 0906` (a building that doesn't exist), `303 → 03`, `101 → 01`. Typing the real unit ("1805") into the wizard returns *"No units found,"* yet the AI confidently assigned a code for the same scope. Units drive GL/property allocation and billing, so this mis-bills real units silently. *(F08, F30)*

**② Vendor accept/reject is cosmetic — the lifecycle ignores it. [P0, SPO-08/35]**
On submit, an SPO jumps straight to "Awaiting invoice" before the vendor has opened the email. A vendor **rejection** ("Too busy") leaves status = Open and the stepper sitting at "Awaiting invoice" with a banner that admits *"the order's status and approval workflow are unchanged."* A vendor **acceptance** changes nothing either — same banner, no state change, not even an Activity entry. The order waits forever for an invoice that will never come. *(F03, F10)*

**③ The status badge is meaningless and the audit trail is empty. [P1, SPO-25/10/20]**
The header status is stuck on "Open" regardless of progress (a Validated / "Ready for Accounting" SPO still shows "Open"; another past-validation SPO shows "Validated" while actually at "Awaiting Payment"). Meanwhile **Order Activity is empty on every SPO** — freshly created, sent, rejected, and fully validated alike. There is no reliable at-a-glance state and no history. *(F15, F18)*

**④ Counts don't reconcile and labels mislead. [P1, SPO-01/30]**
Status tabs sum to 37 but the "Total SPOs" card says 36. "Open" (internally `issued`) and "Sent" are both tabs, and "Sent" actually means *sent to Accounting* — a buyer reads it as *sent to vendor* (which is the "Open" state). Summary cards redundantly re-print four tab counts and omit four statuses. *(F01, F18)*

**⑤ Invoice mapping fights real invoices. [P1, SPO-36/41/43/46]**
Every mapping opens on a **false overage** ("SPO Total estimate $0.00 → $X over") until you connect a line. An invoice line not on the SPO (a $125 dump fee) **cannot be resolved** — it stalls at "4 of 5 connected," and the only outs are delete the charge or Contact Support. A vendor who **combines two SPO lines** into one ($800 for two $400 units) can't be matched — connections are strictly 1:1, so $800 gets coded to one unit and the other goes unbilled. And AI extraction is unreliable: it found **0 line items** on the clean exact-match invoice while extracting the messier two correctly. *(F20, F25, F28, F29)*

### The single biggest structural fix
**Give SPOs one authoritative state machine and drive everything from it.** Today "state" is scattered across a static status badge, a stepper that renames its own nodes, an empty activity log, and a vendor-response banner that affects nothing. One lifecycle enum — with **vendor response as a real, gated transition** — should drive the status badge, the stepper, the list tab, the Activity log, and what the vendor and Accounting each see. This single change resolves problems ②, ③, ④ and is the backbone for a trustworthy ⑤. The proposed model is below.

---

## 2. Proposed SPO status model

One enum, mutually exclusive, summing to Total. Approval is threshold/budget-driven (today the wizard says "No approval required" even at 365% over budget while the dashboard shows "SPO-847 awaiting supervisor approval" — SPO-16/34).

| State | Enters when → (trigger) | Owning actor | List tab / badge | Detail (stepper + primary action) | Vendor sees | Accounting sees |
|---|---|---|---|---|---|---|
| **Draft** | Saved, not submitted | Buyer | Drafts | Draft active; "Submit" / "Edit" | — | — |
| **Pending Approval** | Submit while over budget/threshold | Approver (Supervisor/Master) | Pending Approval (amber) | Approval step active; "Awaiting approval" | — | — |
| **Approved** | Approver approves (or auto, if within budget) | System | (transient) | Approved done | — | — |
| **Sent to Vendor** | PO emailed to vendor | Vendor | Sent to Vendor | "Awaiting vendor response"; **no** "Awaiting invoice** yet | PO + Accept/Reject | — |
| **Vendor Accepted** | Vendor accepts | Buyer | Accepted | advances to Awaiting Invoice | Accepted; "send invoice to …" | — |
| **Vendor Rejected** | Vendor rejects (reason required) | Buyer | Needs Attention (rose) | **halts**; primary = "Change Vendor" / "Cancel" | Rejected | — |
| **Awaiting Invoice** | After acceptance | Vendor/Buyer | Awaiting Invoice | "Upload / await invoice" | reminder to invoice | — |
| **In Mapping** | Invoice received, not yet validated | Buyer | In Mapping | Mapping step; "Match & validate" | submitted | — |
| **Mapping Validated** | Buyer confirms mapping | Buyer | Validated | "Send to Accounting" | validated | queued |
| **Sent to Accounting** | Buyer sends | Accounting | Sent to Accounting | "Awaiting payment" | — | invoice + GL allocation, PO, ROG |
| **Paid** | Accounting pays | — (terminal) | Paid | complete | paid | paid |
| **Cancelled** | Buyer cancels (any pre-paid state) | — (terminal) | Cancelled | no stepper; cancel reason | cancelled | — |

Rules that follow from it: the **status badge = the state** (never a frozen "Open"); the **stepper keeps fixed node labels** and only changes done/active styling (SPO-26); **every transition writes to Activity** with actor + timestamp (SPO-10); **"Sent to Vendor" vs "Sent to Accounting"** are named for their audience (SPO-30); tabs are mutually exclusive and sum to Total (SPO-01).

---

## 3. Navigation & dashboard recommendations

**Naming.** One feature has three names: nav group "SPOS", nav item "Contract Services", entities "SPO-###". Pick one user-facing term (recommend **"Service POs"** for the group and the list, keeping the `SPO-###` ids). *(SPO-30 context)*

**Where SPOs live.** The dedicated SPOS nav group (Contract Services + Unit History) is right. Keep it, but relate it to the existing **Order Approvals** queue — SPO over-budget approvals should flow through the same approvals surface the org already uses, not a separate implicit path (SPO-34).

**Home dashboard.** SPOs have *no* presence on Home today — every tile is order-based; SPOs appear only as one "Recent Activity" line (F19). Add, mirroring the existing "Needs your action" pattern:
- An **SPO action tile**: "SPOs awaiting invoice / mappings to validate / over-budget SPOs" with counts, linking into the filtered list.
- Optionally an **SPO spend tile** (committed vs validated vs sent-to-Accounting) so the $ pipeline is visible next to Orders.
These must reconcile with the SPO list counts (today even the list's own cards/tabs don't — SPO-01).

**Invoice Mapping entry.** It's a strong standalone surface but duplicates the per-SPO "Review invoice" modal (SPO-32). Make their roles explicit: Invoice Mapping = bulk / multi-SPO intake; the per-SPO modal = single-SPO confirm/view.

---

## 4. Findings CSV

[`spo-audit-findings.csv`](spo-audit-findings.csv) — 58 findings (5× P0, 23× P1, 24× P2, 6× P3). Columns: ID, Surface, Flow step, Finding, Evidence, Severity, Type, Recommendation, Needs backend, Effort. Each Evidence cell names the screenshot file(s) in [`screenshots/`](screenshots/).

---

## 5. Hypotheses from your screenshots — verdicts

| Your hypothesis | Verdict | Notes / finding |
|---|---|---|
| Card vs tab counts don't reconcile (Total 35 vs tabs 36) | **Confirmed** | Now Total 36 vs tabs sum 37; still off by one. SPO-01 |
| "Sent" is ambiguous (to vendor or to Accounting?) | **Confirmed** | "Sent" tab = sent to **Accounting**; "Open"(issued) is the sent-to-vendor-ish state. SPO-30 |
| Vendor acceptance changes nothing; not a lifecycle step | **Confirmed** | Accept & reject both cosmetic; no stepper node. SPO-08/09/28/35 |
| Email has Accept/Reject, landing re-asks | **Unverified** | Vendor-inbox side; you handled it. Couldn't observe the landing page. |
| Mapping shows "SPO Total estimate $0.00" → false over | **Confirmed** | False overage until first line is connected; then corrects. SPO-36 |
| Two "fix extraction" banners + "Draft saved" next to "Save draft" | **Confirmed** | "Extraction feels wrong?" + "Need to fix invoice items?"; "Draft saved"/"Save draft" coexist. SPO-37/42 |
| Detail shows "Original line estimate" struck even when unchanged | **Confirmed** | Shows "Original line estimate $150" when current = $150. SPO-27 |
| Splitting a line can zero its price; fractions "1/2"; Continue disabled unexplained | **Partially confirmed** | Fractions "1/2" confirmed; couldn't reproduce price zeroing (price persisted); Continue gates on required fields with inline hints, not silently. Separately found a **cents-parsing** bug: "600" → $6.00. SPO-22/23 |
| Budget card "Missing GL code — 100% over" | **Not reproduced** | Didn't hit that exact row; did confirm budget warnings that don't gate submit (365% over → "No approval required"). SPO-16 |
| Scope repeats boilerplate (address, requester) | **Confirmed** | SPO-07 |
| TEMP vendor codes shown; "Unit 03" vs "303"; "Oakleigh" vs "Oakeigh" | **Confirmed** | `TEMP5493568100`, `* MidAmerica…`; unit truncation; "Oakeigh" data vs "oakleigh" file / "Oakleigh" scope. SPO-03/04/05/29 |
| Date column mixes relative and truncated absolute | **Confirmed** | "24 hours ago" vs "Oct 5, 2026, 1:59 PM". SPO-06 |

---

## 6. Scheduled, Cancelled & Notifications (added pass)

**Scheduled (SPO-49/50/51).** "Scheduled" is a *recurrence* axis, not a lifecycle state, yet it sits as a peer of the status tabs. A scheduled SPO also carries a lifecycle state — SPO-717 is "Open / Awaiting invoice" **and** in the Scheduled tab — so it's counted twice. That double-count is the **off-by-one** behind problem ④ (with my two new SPOs, Total = 38 but tabs now sum to 39). The series card itself is good ("Every week on Wednesday 8 AM", "Next draft 2026-10-07 · 2 slots consumed", "Draft only — each must be sent manually", Edit series / Pause / Enable automatic sending / Cancel next occurrence / Stop) but it's overlaid on one instance's lifecycle stepper, blurring series vs instance. Recommendation: model the recurring **series** as its own object/section; keep lifecycle state on each generated instance; don't count a series as a status peer. *(F31)*

**Cancelled (SPO-52/53/54/55).** The canceller is shown as a **raw customer id** — "Cancelled … by `cus_01KSTGBKY9FK3G0G4VXEH8YFG5`. test" — not a name. Spelling splits: badge "Canceled" vs tab "Cancelled". A **third stepper label variant** appears ("Submit for approval", "Send to vendor"), and a cancelled order still renders all seven forward nodes instead of a terminal state. The cancellation is a banner, **not** an Activity entry (Activity still empty). "Revive SPO" exists (cancel is reversible) but unconfirmed and unlogged. *(F32)*

**Notifications (SPO-56/57/58).** **SPO events barely notify** — on `/notifications` the only SPO item is "Approval required: SPO-847"; nothing for vendor accept/reject, invoice received, mapping-to-validate, payment, or cancellation, even for the SPOs I just drove. This mirrors the empty Order Activity (same missing event stream). Three different counts: bell **10**, nav menu **20**, page **217 total**. The feed is dominated by near-identical "Order #### confirmed" lines with no grouping, type filters, or read management, burying anything actionable. *(F33)*

These reinforce the structural fix in §1: one event stream/state machine should feed the status badge, stepper, **Activity**, **and notifications** — today all four are inconsistent or empty for SPOs.

## Test artifacts created (dev env)
- **SPO-854** (A Cleaner Nation, Cypress Lake, $250) — happy path, **validated** (INV-1002).
- **SPO-855** (A Cleaner Nation, Cypress Lake, $1,600, 4 lines incl. a paint/carpet split) — left Open; three invoices (INV-1003/1004/1005) mapped-and-observed, not confirmed.
- Vendor notifications went to vugfrancois@gmail.com only.
