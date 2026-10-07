# Scout Demo Script — one order per lifecycle state

Every state below is a seeded, reconciled order. Paths are relative to the site root (locally `http://localhost:3333/…`).

## Buyer App — `buyer/order-detail.html#<order>`

Walk the lifecycle top to bottom; every order also appears in Order Tracking (`buyer/orders.html#open`) with matching pills and counts (Total Open 62 = To Fulfill 36 · To Ship 11 · Shipped 7 · Delivered 8).

| State | Order | What to show |
|---|---|---|
| Not Fulfilled | `#512` | Baseline open order; stepper at Seen; **Start Delivery Validation available even pre-fulfillment** (validation-first model — validating live advances everything) |
| Partially Fulfilled | `#373` | Unfulfilled Items card + Fulfillment #1 mini-stepper; sky "Partially Fulfilled" |
| Fulfilled | `#669` | Mini-stepper: Fulfilled done, Shipped active |
| Shipped | `#668` | Tracking number on the fulfillment card |
| Delivered — awaiting validation | `#657` | The navy Validate primary is the row's cue. `#657/validate` deep-links straight into the **Delivery Validation modal** |
| Partially Delivered · 4/10 | `#408` | Multi-quantity validation: capped "Received now" stepper, per-row **Report a problem** (checkbox flips to rose ×), one Save commits receipts + claims |
| Cancellation Pending | `#486` | Sky pill (vendor's move on the buyer side); rail notice explains the hold |
| Cancellation declined | `#420` | The vendor declined with a reason: rail notice quotes it, the order simply continues its lifecycle |
| Claim Open (unresolved) | `#404` | Rose **Claim under review** rail callout, invoice on hold; in the table the row itself is rose-tinted with a rose warning triangle — the highlight is reserved for claims |
| Claim held at invoice stage | `#641` | Invoice received but a claim is open: strip pill rose "Invoice held · claim open"; the Invoiced tab shows Claim Open instead of Awaiting Validation, Validate gone |
| Awaiting vendor invoice | live | Validate any order fully (e.g. `#512`) — the saved state is exactly this: sky **Awaiting vendor invoice** pill + clock note |
| Awaiting Payment | `#653` | **Confirm Payment** task → confirm dialog → resting "Waiting on Vendor · Completion" (violet Payment confirmed, Paid Total goes real, Write a Review) |
| Invoice with variance (dispute demo) | `#664` | `#664/invoice`: the invoice still bills a claim-canceled unit — rose Variance, amber attestation copy, canceled unit as ROG "—" row; Dispute → rose "Invoice disputed"; pairs with vendor `#disputed` |
| Invoice received → Invoice Validation | `#674` | **Validate Invoice** primary appears (only now); `#674/invoice` deep-links into the **Document Review Split View** — confirm every AI-extracted value, then Validate (same-page advance to Awaiting Payment, tax joins totals) or Dispute (steps back, rose "Invoice disputed") |
| Canceled (terminal) | `#153` | No stepper, no tasks — Order Status card with the vendor's quoted reason, "Nothing was charged." Closed tab's Canceled row |
| Completed / closed | `#515` | The vendor demo order from the buyer's lens — all 8 steps done, "Order Complete" resting strip, Paid Total = $253.03, Write a Review only. Pair with vendor `#completed` for the one-order-two-lenses beat |
| Claim resolved | `#662` | Emerald **Claim resolved** callout with per-line outcomes; Summary rewritten: canceled line struck through + rose pill and out of the totals, replacement as its own line with **Fulfillment #2**; validate the replacement live to finish the loop |

**Live-flow demo (the showstopper):** open `#512` → Start Delivery Validation → check the item → Save. Watch the whole page advance in one commit: pill → Delivery Validated, stepper step 4 done, ROG appears in Documents, strip flips to Delivery Confirmed, audit trail logs validation + ROG. Repeat on `#408` mixing received quantities with a problem report to land in the claim-held state.

## Vendor App — `order-detail.html#<state>`

One demo order (#515) with every state as a hash — the stepper itself is clickable to jump between them. The Orders list (`orders.html`) deep-links the classic states; use direct hashes for the three newest.

| State | Hash | What to show |
|---|---|---|
| Placed | `#placed` | Action Required · Fulfill Items |
| Cancellation requested | `#cancelreq` | Buyer asked to cancel: rose strip with **Cancel Order** (→ modal, required buyer-visible reason → `#canceled`, stepper gone) or **Decline Request** (→ modal, required reason → order continues on `#placed`) |
| Fulfilled | `#fulfilled` | Mark as Shipped |
| Shipped (mid-Delivery) | `#shipped` | Mark as Delivered |
| Delivered — waiting on buyer | `#delivered` | **Waiting on Buyer · Delivery Validation** (vendor no longer "uploads invoice to unblock validation") |
| Claim Open — pre-fulfillment | `#claimpre` | Nothing shipped, nothing invoiced: stage-correct options (Fulfill as ordered / Cancel affected quantity); canceling the last line flows live into `#cancelreq` ("No merchandise remains") |
| Claim Open | `#claim` | **Claim Resolution Panel**: buyer-request chips (emerald keep / rose cancel), Send replacement vs Cancel affected quantity cards, Resolve claim → invoice released (transitions to `#tax`) |
| Replacement to ship | `#replacement` | After resolving with Send replacement: emerald "Claim resolved" note, **Fulfillment #2 · Replacement** panel, Ship Replacement task — shipping lands on `#delivered` (buyer re-validates before invoicing) |
| Delivery Validated — Upload Invoice | `#tax` | Buyer's **Receipt of Goods** in Documents; Upload Invoice modal → "Upload for AI review" kicks off the live flow |
| Invoice disputed — correct & resubmit | `#disputed` | Buyer rejected the invoice: rose pill, disputed Documents note ("Validation blocked"), Upload Corrected Invoice re-enters the upload → AI review pipeline |
| Invoice pending review | `#review` | Scout AI processing → Ready for review; Documents shows the **Pending review** block; Review modal with extracted number + tax and the **two required confirmation cards** — accept to advance |
| Invoice submitted — buyer QCing | `#invoiced` | Waiting on Buyer · Invoice Validation; emerald Invoice #001042755 doc-row |
| Invoice validated | `#validated` | Invoice Posted · Awaiting Payment |
| Buyer paid | `#paid` | Mark as Paid (capture) |
| Captured | `#captured` | Complete Order |
| Completed | `#completed` | Closed out |

## Buyer App — Service POs `buyer/spo.html#<id>`

SPOs are buyer-side only. The list is `buyer/spos.html` (Open 12 · Invoices 5 · Closed 6), and new SPOs start at `buyer/spo-new.html#new`. **Open any SPO page with `#reset-spos` to restore the seeds** after a live demo.

| State | SPO | What to show |
|---|---|---|
| Draft | `#866` | Continue editing → the wizard opens on Review; **Send to vendor** is emerald (under budget) |
| Draft (new) | `spo-new.html#new` | **Try an example** → Scout AI drafts lines: unit 1805 flagged (not coerced), an unpriced line left empty; type `600` → $600.00; Review shows the **Budget Meter** at 112% on 6035 → amber **Submit for approval** |
| Pending Approval | `#864` | Strip → Review in Approvals; `approval.html#SPO-864` shows Service PO lines + Approve → the SPO flips to Awaiting Vendor |
| Awaiting Vendor | `#863` | Sky whose-turn ring on Vendor Response; Resend PO |
| Vendor Rejected | `#861` | Stepper **halts** in rose; the strip quotes the vendor; **Change Vendor** (same trade first) re-sends the PO; activity dots turn rose for the rejection |
| Awaiting Invoice | `#860` | Upload invoice → File Drop → mapping opens; **Dispute** with a note → "Corrected invoice" strip |
| Invoice to Map (clean) | `#858` | `#858/invoice`: one line, pre-matched; confirm → Validate mapping |
| Invoice to Map (messy) | `#857` | `#857/invoice` on the **Line Connector** (drag dot to dot, or click one on each side; dashed = Scout AI suggestion → Accept / Auto Map; PDF is a toggle): the $800 combined line covers 2 SPO lines (+$30 over); the $125 dump fee goes through the resolver → extra on 6045/0105; tax is invoice-level; Validate shows a +$155 variance; close and reopen → progress kept (autosave) |
| Extraction failed | `#849` | "Invoice needs attention" → Retry extraction or Enter lines from the PDF |
| Ready for Accounting | `#856` | Send to Accounting → packet: PO · Invoice · **GL allocation** (sums to the cent) → With Accounting |
| With Accounting | `#855` | Violet **ACCOUNTING** actor; no buyer button |
| Paid | `#854` | All 8 steps dated; approved by Priya Nair |
| Canceled | `#852` | No stepper; SPO Status card names who canceled and quotes the reason; Clone SPO only |

### Schedules (recurring SPOs) — `buyer/schedules.html` · `buyer/schedule.html#SCH-<nn>`

| State | Schedule | What to show |
|---|---|---|
| Active · auto-send | `#SCH-01` | Weekly cleaning: next run 08/26, **Skip** a date and undo it, switch Auto-send ⇄ Draft only; its SPOs (SPO-847 awaiting invoice, SPO-845 paid) show the repeat icon on the SPO list |
| Active · draft only | `#SCH-04` | Every other Monday; 09/21 already **skipped** (struck through, Undo); today's run drafted **SPO-848** (Continue on the SPO list) |
| Pending series approval | `#SCH-06` | `approval.html#SCH-06`: the request is the **12-month commitment** (12 × $420 = $5,040); Approve → series Active, runs need no further approval |
| Paused | `#SCH-03` | Pause reason in the strip, **Resume schedule**; upcoming runs listed but marked as not running |
| Ended | `#SCH-05` | Completed its 6 runs (Ended tab → Completed card) |
| Make recurring (live) | `spo.html#866` → Make recurring | Wizard opens on Review with **Recurring** on: pick Weekly · Wednesday → preview shows 52 runs / $11,700 → Submit schedule for approval; SPO-866 becomes run 1 and links to the new series |
| Edit (live) | `spo-new.html#edit-SCH-01` | Same price → "Covered by the series approval · Save changes"; raise the price → "Changes need re-approval" |

### Standalone invoice intake — `buyer/spo-invoice.html`

| Step | Do | What to show |
|---|---|---|
| Entry | Service POs → **Add invoice**, or `spo.html#847` → Upload invoice → "map them together" | The sky callout knows Crescent Cleaning has 2 other SPOs waiting at Magnolia |
| 1 · Vendor & invoice | Drop the PDF | Scout AI fills Crescent Cleaning · INV-CC-2608 · 08/24 and pre-checks SPO-842/845/847 with reasons ("Run 08/05 ↔ 'week of 08/03'") |
| 2 · Match | Drag a connector; then **Auto Map** | Three weekly runs on one board; 847 shows +$15 over; the $35 supplies line opens the resolver → one-time extra booked to SPO-847; tax $55.76 split 17.01 / 17.01 / 21.74 |
| 3 · Review | Check the attestation → **Validate 3 SPOs** | Each SPO's share; total $645.76 |
| Receipt | **Send all to Accounting** | No confetti — the three SPOs move together; each SPO's invoice PDF says "1 of 3 SPOs" |
| Drafts | Leave mid-way, open Service POs → Invoices | "1 invoice in progress" → Resume lands back on Match |

### Notifications — bell on every page · `buyer/notifications.html`

| Do | What to show |
|---|---|
| Open the bell on any page | Badge **10** = Needs action count = page header — one number everywhere; Today / Yesterday / Earlier |
| Click "Bayou Plumbing & Drain rejected SPO-861" | Deep-links to Change Vendor; the row marks itself read |
| Approve `approval.html#SPO-864` | The action item **clears itself** (badge 10 → 9) — read or not; in All it shows **Done** |
| `notifications.html` → All | "12 orders confirmed today" is one expandable row; filters by type; Unread only |
| Settings → turn Orders off | Order items leave the feed and the bell |

### Unit History — `buyer/unit-history.html#<property>/<unit>`

| What | Link | What to show |
|---|---|---|
| Property first | `unit-history.html` (All properties) | Inline property picker — unit codes only mean something inside one property |
| Busiest units | `#magnolia` | "Most activity" ranks units by spend; the picker shows each unit's spend |
| A make-ready unit | `#magnolia/0105` | SPO-863 carpet cleaning + Order #653 dishwasher & blind + #515 microwave; Spend by GL; type chips; switch This period / 12 months |
| Common area | `#magnolia/COMMON` | Weekly cleaning SPOs with the recurring marker, the #657 laundry dryers, and **Upcoming**: SCH-01 next run 08/26 |
| A split line | `#cypress/0105` | SPO-857's refresh line split across GLs ($300 of $600) + Order #512 PTAC |
| Unit search | type `1805`, then `bldg 2 unit 16` | The miss explains the BBUU scheme and range (SPO-48); the phrase finds 0216 |
| From an SPO | `spo.html#857` | Click a unit in any allocation chip → its history |

**Home tie-in:** the "SPO Invoices to Map" tile (3) and the Service POs breakdown card. The Approvals card total (22) matches the queue, which now includes SPO-864 and the schedule requests (SCH-06 pending).

## The claims loop in one arc (cross-app)

1. Buyer `#408` — raise a problem inside the validation modal (or `#404` for a standing claim; `#claimpre` is the vendor's pre-fulfillment counterpart).
2. Vendor `#claim` — the same request arrives with the buyer's keep/cancel choice pre-selected; resolve it. All-cancel releases the invoice; a replacement detours through fulfillment.
3. Vendor `#replacement` — the replacement is a real Fulfillment #2 (at no charge); ship it and the invoice waits for the updated delivery.
4. Buyer `#662` — the resolved rendering: emerald callout, adjusted invoice, replacement line with Fulfillment #2; validate it live to finish the loop.

Rule of the loop: *the buyer requests, the vendor decides; a claim never blocks delivery validation — it holds the invoice.*
