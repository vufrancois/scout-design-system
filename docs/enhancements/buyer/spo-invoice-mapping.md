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

---

## Addendum — mapping moved to the Line Connector (10/07/2026)

The team prefers the live product's drag line-to-map interaction, so the takeover's per-line list (`.lm-row` with confirm checkboxes) was replaced by the shared **Line Connector** board (`spo-map.js`). The same board powers standalone intake.

- The PDF is now a **Line items / PDF** toggle instead of a fixed left pane.
- Per-line confirm checkboxes became Scout AI **suggestions you accept**, plus one attestation checkbox.
- The resolver, totals, failed extraction, autosave and dispute behave as before, and the validated results (variance, extras, GL allocation) are unchanged.

See [spo-invoice-intake.md](spo-invoice-intake.md) (TKT-SPO-31, TKT-SPO-32).

---

## Addendum — file sizes (SPO-39, 10/07/2026)

The live product rounds every upload to MB, so a 2.6 KB invoice reads "0.00 MB". `SPO.fileSize()` now picks the unit: bytes under 1 KB, then KB, then MB from 999.5 KB. It shows one decimal under 10 and whole numbers above, for example "2.6 KB", "243 KB" and "5.5 MB". Invoice files show "PDF, <size>" in four places:
- the SPO's invoice card;
- the upload modal;
- the mapping view's file line;
- the intake file drop and match header.

The audit's own case is seeded: SPO-858's INV-30418.pdf is 2,662 bytes and shows **2.6 KB**. Older records without a stored size get a stable one derived from the file name. Design-doc Formatting gains a **file sizes** rule.

### TKT-SPO-42 · File sizes with the right unit
**Summary:** Show uploaded document sizes in a unit that matches the size.
**Acceptance criteria:**
- [ ] Under 1 KB shows bytes; up to 999 KB shows KB; above that shows MB. One decimal under 10, whole numbers above.
- [ ] A 2.6 KB file shows "2.6 KB", never "0.00 MB".
- [ ] Every place an invoice file is listed shows "PDF, <size>".
**Audit findings:** SPO-39
**Files:** `buyer/spo-data.js` (`fileSize`, `invSize`), `buyer/spo.html`, `buyer/spo-invoice.html`



## Addendum · Send to Accounting per invoice (10/19/2026)

**Why:** team feedback: "The 'send' CTA should be at the invoice level. We are sending the invoice to accounting, not the SPOs. The SPOs and the mapping only match the GL code and unit to each invoice line so accounting knows where to book it (they don't care about the SPO). When an invoice has been fully mapped, the Send CTA should be present." And: "If an SPO has not been fully mapped, keep the Map invoice CTA; once it's mapped it can say Mapped." Decisions (Vu): **A** — the packet drops the Purchase Order document; **B** — Home counts invoices ready to send; **C** — a shared invoice stays mapped all at once (standalone intake), so its SPOs are all mapped or all not.

**What shipped**
- **Invoices tab (grouped):** the invoice heading carries **Send** once every SPO on it is Ready for Accounting; Invoice PDF becomes an icon. SPO rows read **Map invoice** until mapped, then a quiet **✓ Mapped** label.
- **Flat view:** a mapped SPO's row action is **Send invoice** (sends its whole invoice).
- **Sending** (`SPO.sendInvoice`) moves every SPO on the invoice to With Accounting at once, each logging "Invoice INV-… · $total · with SPO-…". A shared invoice can no longer read "Mixed".
- **Payment packet, one per invoice:** the invoice as the vendor sent it (PO reference lists every SPO) and a **GL & unit allocation** of every line across its SPOs, with the SPO number only as a reference column. No PO document.
- **SPO page:** "Send invoice INV-… to Accounting", naming the SPOs that go with it; With Accounting shows the invoice total and this SPO's share.
- **Home:** ready-to-send counts invoices ("2 invoices ready to send"); Your move counts a shared invoice once.
- **Multi-SPO intake:** the receipt's button is **Send invoice to Accounting**.
- **Partial invoicing** unchanged: after its invoice is sent, an SPO with open lines waits in Open for the next one.

### TKT-SPO-61 · Send to Accounting per invoice
**Summary:** Accounting receives invoices, not SPOs: Send is an invoice action, available once every SPO on the invoice is mapped, and it moves them all together.
**Acceptance criteria:**
- [ ] On the Invoices tab (grouped), the invoice heading shows **Send** only when every SPO on the invoice is mapped (Ready for Accounting); the invoice PDF is an icon beside it.
- [ ] SPO rows under an invoice show **Map invoice** while that SPO needs mapping and a **Mapped** label (not a button) once mapped. No SPO row has a Send button.
- [ ] In flat view, a mapped SPO row's action is **Send invoice**, which sends its whole invoice.
- [ ] Sending opens one confirmation for the invoice (total, vendor, and every SPO it covers) and moves every SPO on it to With Accounting together; each SPO's Activity names the invoice and the other SPOs.
- [ ] The payment packet is per invoice: the invoice and a GL & unit allocation of every invoice line across its SPOs (SPO number as a reference column). It sums to the invoice total.
- [ ] The SPO page's strip reads "Send invoice INV-… to Accounting" and names the other SPOs that go with it.
- [ ] Home's ready-to-send count and Your move count invoices, not SPOs.
- [ ] An SPO with lines still open returns to Awaiting Invoice after its invoice is sent (TKT-SPO-59).
**Backend / data:** a send-invoice action that transitions every SPO on the invoice atomically; the packet built per invoice (lines with GL, unit and SPO reference).
**Replaces:** the per-SPO Send to Accounting in TKT-SPO-14 and the "Mixed" heading status in TKT-SPO-58.
**Files:** `buyer/spo-data.js` (`invPeers`, `invReady`, `sendInvoice`), `buyer/spos.html` (`invRow`, `MAPPED`), `buyer/spo.html` (`packDoc`, `renderPack`, `sendToAccounting`, task strip), `buyer/spo-invoice.html` (`sendAll`), `buyer/home.html`, `buyer/buyer-components.css` (`.inv-acts`, `.inv-pdf`, `.row-mapped`)
