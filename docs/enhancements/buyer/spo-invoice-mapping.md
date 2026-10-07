# Service POs — Invoice Mapping & Send to Accounting

**Status:** ✅ built and cascaded (10/07/2026)
**Pages:** `design-system/buyer/spo.html#<id>/invoice` (Document Review Split View) · `#<id>/accounting` (payment packet) · Upload Invoice modal from the Awaiting Invoice strip
**Reference:** live Invoice Mapping wizard and per-SPO invoice modal, tested with clean, variance, messy (combined line + dump fee + tax), and exact-match invoices in the SPO audit.

## What shipped
- **One invoice surface:** the existing **Document Review Split View**, with the PDF on the left and line matching on the right. This replaces the live product's two different UIs (a standalone 3-step wizard and a per-SPO modal) (SPO-32).
- **Upload Invoice:** a modal with the buyer **File Drop** ("Choose the vendor's invoice · PDF · up to 20 MB"). Uploading moves the SPO to Invoice to Map and opens the mapping.
- **SPO Line Match:** each invoice line has a confirm checkbox, its description, and the Scout AI-extracted amount (sky-highlighted).
  - Obvious matches are pre-connected, including reworded descriptions (SPO-38, SPO-45).
  - A **combined invoice line maps to several SPO lines** with split amounts, e.g. SPO-857's $800 "paint & carpet" line covers 2 SPO lines (SPO-43).
  - Each target shows its allocation chips and a per-line variance: emerald on estimate, amber over, sky under (SPO-40).
- **Unmatched lines get a resolver, never a dead end** (SPO-41). The three options:
  - add it to the SPO as a new line (amends the scope);
  - accept it as a one-time extra charge;
  - remove it as not payable.

  Add and extra both require a GL code and unit. Demo: SPO-857's $125 dump fee, accepted as an extra on 6045 / 0105.
- **Totals:** the SPO estimate is the baseline from the start, never $0.00 before lines are connected (SPO-36). Tax and shipping are invoice-level. The variance total is shown, and accepted variance is logged ("+$155.00 variance accepted") (SPO-44).
- **Extraction failure is a state, not an empty table** (SPO-46). SPO-849's strip reads "Invoice … needs attention", and the takeover shows a callout with **Retry extraction** or **Enter lines from the PDF**. The activity log says Scout AI couldn't read the lines, without claiming an invoiced amount.
- **Edit invoice lines** is a visible link in the panel header, not hidden (SPO-42).
- **Autosave, no Save draft button** (SPO-31, SPO-37, SPO-47). Confirmations and resolver choices persist on the SPO (`mapDraft`) and survive closing the takeover or reloading. The footer reads "n of m invoice lines confirmed · progress saves automatically". Each SPO has one draft; validating or disputing clears it.
- **Validate mapping** unlocks only when every line is confirmed (and resolved where needed). It moves the SPO to Ready for Accounting.
- **Dispute invoice** asks "What needs correcting" (required, shared with the vendor) and returns the SPO to Awaiting Invoice. The strip then reads "Waiting on Vendor · Corrected invoice", quoting the reason.
- **Send to Accounting:** the Payment Packet modal with three tabs — Purchase Order · Invoice · **GL allocation**. The GL allocation lists per-GL/unit totals (accepted extras included), then invoice-level sales tax, and sums exactly to the invoice total. It offers Download all, and the footer restates "$ · invoice #". Sending moves the SPO to **With Accounting** (violet) and logs the packet contents. Accounting, not the buyer, records Paid.

## Deviations from the live product
- There is no standalone multi-SPO invoice intake. Invoices are mapped from their SPO. (Held.)

## Held
- Standalone invoice intake that splits one vendor invoice across several SPOs.
- Accounting-side confirmation of payment (Paid is seeded; it is not demoable live).

## Pitfalls
- The native file dialog can't be driven by browser automation. Prototype tests inject a `File` via `DataTransfer` into the hidden input.
- GL allocation rounding: pro-rating a mapped amount across a line's splits rounded each piece independently and could drift by a cent. Each split is now rounded except the last, which takes the remainder.
- An extraction-failed invoice has no line amounts, so strip and activity copy must not quote an "invoiced" total.

## Components cascaded
**SPO Line Match** (`.lm-*`: row states, targets, variance, resolver options, resolver fields) and the buyer **File Drop** port (`.file-drop*`). Gallery + design-doc **Service POs (SPO)**; the design-doc File Drop rule has a buyer-port note.

---

## Tickets

### TKT-SPO-14 · Upload invoice to an SPO
**Summary:** Upload a vendor invoice PDF from an SPO awaiting an invoice; Scout AI extracts the lines and opens mapping.
**Acceptance criteria:**
- [ ] The Upload Invoice modal uses the File Drop; the upload button is disabled until a file is chosen.
- [ ] After upload the SPO is Invoice to Map and the split view opens.
- [ ] If extraction fails, the SPO shows a "needs attention" strip, and the view offers Retry extraction and Enter manually.
**Audit findings:** SPO-46
**Files:** `buyer/spo.html` (`openUpload`, `pickUpload`, `runUpload`, `mRetry`, `mManual`), `buyer/buyer-components.css` (`.file-drop*`)

### TKT-SPO-15 · Map invoice lines to SPO lines
**Summary:** Map each invoice line to one or more SPO lines in the Document Review Split View, with per-line and total variance.
**Acceptance criteria:**
- [ ] Exact and reworded matches are pre-connected; the buyer confirms each line.
- [ ] One invoice line can map to several SPO lines with split amounts that sum to the invoice line.
- [ ] Each mapped target shows its GL + unit and variance against the SPO estimate.
- [ ] Totals use the SPO estimate as the baseline before any line is connected; tax is invoice-level.
- [ ] Progress autosaves (survives close and reload); there is no Save draft button and one draft per SPO.
- [ ] Validate mapping is disabled until every line is confirmed, and validating logs any accepted variance.
**Audit findings:** SPO-31, SPO-32, SPO-36, SPO-37, SPO-38, SPO-40, SPO-42, SPO-43, SPO-44, SPO-45, SPO-47
**Files:** `buyer/spo.html` (`openInvoiceMap`, `renderMapTk`, `lmRow`, `validateMapping`), `buyer/buyer-components.css` (`.lm-*`)

### TKT-SPO-16 · Resolve invoice lines not on the SPO
**Summary:** An invoice line with no SPO match must be resolved: add to the SPO, accept as a one-time extra, or remove as not payable.
**Acceptance criteria:**
- [ ] An unmatched line shows the resolver; the line can't be confirmed until an option is chosen.
- [ ] Add and Extra require a GL code and unit. Add amends the SPO with a new line; Extra is booked on this invoice only.
- [ ] Remove requires a reason, drops the line from the payable total, and is logged.
**Audit findings:** SPO-41
**Files:** `buyer/spo.html` (`mRes`, `validateMapping`)

### TKT-SPO-17 · Dispute an SPO invoice
**Summary:** The buyer can dispute an invoice with a required note; the SPO returns to Awaiting Invoice until a corrected invoice arrives.
**Acceptance criteria:**
- [ ] Dispute requires "What needs correcting", which is shared with the vendor and logged.
- [ ] After dispute the SPO is Awaiting Invoice with the strip "Waiting on Vendor · Corrected invoice", quoting the reason.
- [ ] Any in-progress mapping draft is cleared.
**Audit findings:** SPO-32
**Files:** `buyer/spo.html` (`openInvDispute`, `confirmInvDispute`)

### TKT-SPO-18 · Send to Accounting payment packet
**Summary:** A validated SPO is sent to Accounting with the PO, the invoice, and a generated GL allocation.
**Acceptance criteria:**
- [ ] The packet modal has tabs for Purchase Order, Invoice, and GL allocation, with per-document and Download all actions.
- [ ] The GL allocation (per GL/unit, plus invoice-level tax) sums to the invoice total to the cent, including accepted extras.
- [ ] Sending moves the SPO to With Accounting (violet), adds a violet Payment packet row to Documents, and logs the packet.
- [ ] The buyer has no "confirm payment" action on SPOs; Paid is recorded by Accounting.
**Audit findings:** —
**Files:** `buyer/spo.html` (`glAllocation`, `packDoc`, `openAccounting`, `renderPack`, `sendToAccounting`)
