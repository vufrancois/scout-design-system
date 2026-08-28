# Buyer App — Delivery Validation

**Status:** ✅ built and cascaded
**Where:** the Delivery Validation Modal on `design-system/buyer/order-detail.html` (open any order → Start Delivery Validation; deep link `#408/validate`). Demo states: #512 (single-qty full flow), #408 (multi-qty capped counter, seeded mid-validation at 4/10 matching its tracking-table pill), #373 (mixed), #657 (three single-qty lines).
**Reference:** inline-validation screenshots (mode-switched strip, item checkboxes, per-item Confirm delivery popup) + the team's product update (fulfillment-independent validation, capped counters, immutable validated lines, Raise-Claim-only end state, audit fields).

## Design decision: Modal, not inline mode
The reference validates inline — the page morphs (strip buttons swap, items grow checkboxes) and each single-qty check opens a *nested* confirm popup. Per the user's call and our **Modal-over-takeover** rule, validation is a Modal instead: the detail page stays read-only truth, and per-item confirmation folds into the modal rows — checking a single-qty item confirms it directly (Save is the one commit; the reference double-confirms), and multi-qty items reveal an **inline Quantity Stepper capped at the outstanding count** ("Received now [− n +] of 6 outstanding" — designed net-new, the reference never showed multi-qty).

## What shipped
- **Validation Modal**: header (order # + brief), selectable line-item rows (checkbox, thumb, name/SKU, "Received n of m"), locked rows for validated lines (disabled check + emerald "n confirmed" chip), footer Cancel / Save Delivery Validation (disabled until a new confirmation exists). Cancel discards pending picks.
- **Save applies the model live**: creates/completes the vendor-side fulfillment (items shipped + delivered), updates the status pill (Delivered or Partially Delivered · n/m), advances the Lifecycle Stepper (all received → Delivery + Delivery Validation done, Invoice Submission "in progress"), stamps item pills + confirmed chips + received meta on the Summary, and logs the **audit entry "Delivery validated by Alicia Grant · n items confirmed"**.
- **End state per spec**: all received → the Next-Task Strip drops Start and shows **Raise Claim only** ("All items received and validated. Something wrong with the delivery? Raise a claim.").
- **Raise Claim** (rebuilt to reference after claim screens arrived): structured per-item claim modal — amber guidance callout, item checkboxes with "Up to n available for this issue type" caps (ordered − already claimed), per-item capped Quantity stepper + "What happened?" Select (Missing/Damaged/Wrong/Other) + **Resolution Toggle** ("I still want this item" emerald / "Cancel this item" rose, filled when chosen), optional note, "Not now" / "Send claim to vendor" (disabled until every checked item has qty + issue + resolution). Submit: strip becomes "Claim submitted · invoice remains on hold" with affected lines + disabled "Awaiting Claim Resolution" pill (Start stays if items remain unvalidated), canceled lines get a rose "Cancellation requested" note, audit entry "Claim raised by Alicia Grant · qty× item — issue". Deviation from reference: titled "Raise a claim" (the reference reuses the validation title "Validate delivery reception" on the claim path, conflating the two tasks).
- **Wiring**: tracking-table Validate buttons deep-link (`order-detail.html#<num>/validate`) and auto-open the modal.

## Improvements vs reference
- No nested confirm popup; no page morphing; "Mark as delivered" never competes with an active validation (modal covers it).
- Modal SKU shown plain (reference leaked a `-d6qq` variant suffix inconsistent with its own line item); "× 1" not "1x"; received-meta appears on the page only once validation has begun.

## Claim positioning pass (post-build)
User feedback: claims felt mispositioned. Applied (1, 3, 4, 5; held 2 — claims stay available at any point, per the buyer-can-always-claim call):
1. **Claims fold into validation** — every validation-modal row carries "Report a problem", flipping the row into the inline claim form (qty/issue/resolution); one Save commits receipts *and* claims together, disabled while any open report is incomplete. This matches when problems are actually discovered.
3. **Item-level entry** — Summary lines with unclaimed quantity carry their own "Report a problem" link opening the claim modal pre-selected; fully-claimed lines lose it (cap reached).
4. **Language + whose-turn** — "Report a problem" is the verb everywhere ("Raise a claim" survives as the modal title); "Awaiting Claim Resolution" disabled button became an "Under review · vendor responding" status pill — later turned rose along with the table's "Claim Open" overlay (claims are exceptions; rose per the exception rule), placed beside the strip title after the three-element row crushed the layout (bug found + fixed in the pass).
5. **Tracking-table overlay** — open claims show a rose "Claim Open" pill riding the order's stage (seeded on #404, Not Fulfilled — demonstrating claims-at-any-point).

## Summary-density pass
- Claim-related pills turned rose (exception color) — table "Claim Open" overlay + strip "Under review" pill.
- Summary item rows compressed to three lines: name / SKU / one chips row (status pill · merged "n/m confirmed" chip · inline "Report a problem" link). The separate "Received n of m" meta line was dropped — the merged chip carries it.

## Declutter pass (post-build)
"Cramped, information everywhere" feedback — root cause was the same fact rendering 3–4 times. Applied (1, 2, 4; held 3 — single-item orders keep their item pill):
1. **Claim status moved to the rail** as a rose callout (approval decision-callout pattern): "Claim under review · vendor responding · invoice on hold" + affected lines with issues. The Next-Task Strip is a pure task strip again in every state — the strip's status pill, hold note, and amber affected-lines row are gone.
2. **One state expression per item** — the item pill absorbs the count ("Partially Delivered · 4/10", tracking-table convention; "Delivered" when complete); the separate emerald confirmed chip removed.
4. **"Report a problem" right-aligned** under the line total (where row actions live); Summary rows are back to name / SKU / pill with the action off to the side. Fulfillment-card rows carry no link (Summary owns it).

## Final trim
- Refresh icon button removed from the progress head (reference chrome with no live data behind it; the status pill stands alone).
- The strip's "Report a problem" button removed — item-level links + the validation modal's per-row reporting are the claim entries (claims-at-any-point preserved). All-received state: emerald flag icon + "All items received and validated.", no actions.

## Bug fix
- The standalone claim modal's submit overwrote `O.claim` — successive claims replaced earlier ones in the rail callout (the validation-modal path appended correctly). Now both paths append: the "Claim under review" callout accumulates every reported problem on the order with its issue, and notes concatenate.

## Callout restyle
- The claim callout's wall of rose text became structured claim lines: mono "n×" badge, item name in foreground color, issue (+ "· cancellation requested") as a small sub-line, faint rose dividers between claims. Rule captured: rose is the callout's frame, not its body text.

## Fulfillment card trim
- Divided header added; the mini-stepper renders only while a fulfillment is in flight — delivered fulfillments show one emerald Delivered pill (three filled dots said nothing the pill doesn't).
- Item rows inside fulfillment cards are plain (name / SKU / ×qty) — per-item pills there triple-stated what the Summary and card state already said.

## Model correction: no buyer-side "Mark as delivered"
User caught a contradiction carried from the reference screenshots: a buyer "Mark as delivered" button on shipped fulfillments. Under the validation-first model it's wrong — validation *is* the buyer's delivery-recording act (the save marks items delivered, with counts and an audit entry); a bare Mark-as-delivered manufactures delivered-but-unvalidated state with neither. Removed; the mini-stepper is read-only (vendor/carrier advance it). Rule codified in the doc.

## Checkbox semantics
- A problem-flagged row's checkbox fills rose with an × (vs the navy check of a received row) — the mixed session reads at a glance which rows are being received and which are being claimed.

## Components cascaded
Gallery card **Delivery Validation Modal** (in Buyer App · Order Detail section) + design-doc rules (modal-not-mode, direct single-qty confirm, capped counter, immutability + Raise Claim, live save semantics, deep link); `docs/design.md` regenerated.
