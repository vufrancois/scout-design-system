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
| Delivered — awaiting validation | `#657` | Amber attention row in the table; the buyer's move. `#657/validate` deep-links straight into the **Delivery Validation modal** |
| Partially Delivered · 4/10 | `#408` | Multi-quantity validation: capped "Received now" stepper, per-row **Report a problem** (checkbox flips to rose ×), one Save commits receipts + claims |
| Cancellation Pending | `#486` | Sky pill (vendor's move on the buyer side); rail notice explains the hold |
| Claim Open (unresolved) | `#404` | Rose **Claim under review** rail callout, invoice on hold, "Cancellation requested" item note; rose Claim Open overlay in the table |
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
| Cancellation requested | `#cancelreq` | Buyer asked to cancel: rose strip + **Cancel Order** → modal with required buyer-visible reason (live: confirm lands on `#canceled`, stepper gone) |
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

## The claims loop in one arc (cross-app)

1. Buyer `#408` — raise a problem inside the validation modal (or `#404` for a standing claim).
2. Vendor `#claim` — the same request arrives with the buyer's keep/cancel choice pre-selected; resolve it.
3. Buyer `#662` — the resolved rendering: emerald callout, adjusted invoice, cleared overlay.

Rule of the loop: *the buyer requests, the vendor decides; a claim never blocks delivery validation — it holds the invoice.*
