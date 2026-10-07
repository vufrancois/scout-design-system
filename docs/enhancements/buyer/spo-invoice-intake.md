# Service POs — Line Connector & Standalone Invoice Intake

**Status:** ✅ built and cascaded (10/07/2026)
**Pages:** `design-system/buyer/spo-invoice.html` (`#new` · `#vendor` → `#match` → `#review` → `#done-<vendor:number>` · `#with-<spoId>` · `#resume-<vendor:number>`) · the mapping takeover on `spo.html#<id>/invoice` (now on the board) · Add invoice + in-progress strip on `spos.html#invoices`
**Shared module:** `design-system/buyer/spo-map.js` (`window.CX`)
**Reference:** the live 3-step Invoice Mapping flow (F17, F20, F23, F26) and the team's preference for its **drag line-to-map** interaction (Vu, 10/07/2026). Audit findings SPO-31/32/36/37/38/41/43/45/46/47.

## What shipped
- **Line Connector, one board everywhere** (Vu approved using it everywhere).
  - **Layout:** SPO lines on the left, grouped under SPO headers when there are several; invoice lines on the right; a connector dot on each card's inner edge.
  - **Connecting:** drag dot to dot (a dashed line follows the pointer), or click one dot on each side. A **Connect to…** select on every invoice card covers keyboard, screen readers and phones; under 820px the dots and lines hide.
  - **Link states:** dashed primary = suggested by Scout AI (Accept per line); solid emerald = mapped; amber = split doesn't add up.
  - **Many-to-many:**
    - A second connection splits the invoice line evenly, with the remainder on the last share.
    - The shares are editable on the invoice card and must total the line.
    - Several invoice lines can land on one SPO line.
  - **Auto Map** accepts suggestions, then connects only amount-and-words matches. It never maps everything to one line, as the live button does.
  - **The resolver opens in place** on an unconnected invoice line: add to the SPO / one-time extra / remove. With several SPOs, it also asks which SPO the line is booked to.
  - **Validate** needs every line resolved and **one attestation**: "I checked the work and matched every invoice item."
- **The single-SPO mapping takeover now uses the board.**
  - The PDF moved from a fixed left pane to a **Line items / PDF** toggle, because the board needs the width.
  - Everything else carries over: estimate baseline, invoice-level tax, failed extraction (Retry / Enter lines, now with the PDF visible below), Edit invoice lines, autosave, Dispute.
  - It replaces the per-line confirm checkboxes with suggestions you accept, plus the attestation.
  - Read-only mode draws links card edge to card edge, with no dots.
- **Standalone intake, three steps on the Step Band:**
  1. **Vendor & invoice, upload first.** Scout AI fills vendor, number, date and lines.
     - It pre-checks the SPOs waiting on an invoice and gives a reason for each ("Run 08/05 ↔ 'week of 08/03'").
     - "Show other states" widens the list.
     - An invoice number already mapped for that vendor shows a duplicate warning.
     - "No PDF? Enter the invoice details yourself" is the manual path.
  2. **Match:** the board across every chosen SPO.
     - Totals compare each SPO with its own estimate, never a $0 baseline (SPO-36).
     - **Tax split:** invoice-level tax and shipping are divided in proportion to what each SPO is billed, with the remainder on the last share. The split is shown, editable ("Reset to proportional") and must total the invoice tax.
  3. **Review & validate:** one card per SPO, showing the lines it's billed (with how each was matched), its tax share and its share of the invoice. Removed lines are listed separately. The rail closes the invoice total, then one attestation and **Validate n SPOs**.
- **Validating** makes each SPO **Ready for Accounting**, each with its own slice of a **shared invoice**:
  - `invoice.shared = { total, spos, idx }`;
  - Activity reads "shared invoice, 2 of 3 SPOs";
  - its invoice PDF and the Accounting packet show "THIS SPO'S SHARE" plus the invoice total;
  - the GL allocation and payment packet work per SPO, unchanged.
- **The confirmation is a receipt, not confetti:** the updated SPOs with date tiles, amounts and pills, the invoice total, then **Send all to Accounting** and **View Service POs**.
- **Drafts:** one autosaved draft per vendor + invoice number (SPO-47). Service POs → Invoices shows an "n invoices in progress" strip with Resume, and `#reset-spos` clears drafts.
- **Entry points:**
  - **Add invoice** on the Service POs header.
  - In an SPO's upload modal, when the same vendor has other SPOs waiting at that property, a sky callout offers "One invoice for several SPOs? … map them together" (`#with-<id>`).
- **Demo data:** SCH-01's vendor bills monthly.
  - **SPO-842** (run 08/05, new) and **SPO-845** (run 08/12, moved from Paid to Awaiting Invoice) join SPO-847.
  - Crescent Cleaning's statement **INV-CC-2608** covers all three: $180, $180 and $195 (+$15 over), plus a **$35 supplies line not on any SPO** and **$55.76 tax**.
  - Seed counts are now Open 12 · Invoices 5 · Closed 6, and the SPO store key is `scout-spos-v4`.

## Deviations
- No confetti, unlike the live success screen.
- No "Save draft" button: progress autosaves (SPO-31/37).
- Auto Map never maps every invoice line to one SPO line, which is what the live button does.
- The PDF in the single-SPO takeover is a toggle, not a side pane, to make room for the board.

## Held
- Invoices arriving by email straight into intake.
- Invoices that cover more than one property.
- Credit memos and negative lines.
- Validating some SPOs and leaving others on a shared invoice (today it's all or nothing).
- **One SPO receiving several invoices** (e.g. a deposit invoice, then a final one). Today an SPO holds a single invoice, and a second upload replaces the first. Vu asked to hold this case (10/07/2026).

## Pitfalls
- **The board re-renders on every change.** A pointer listener on the board element misses the second click of a click-click connect if the new board binds in the next animation frame. Use one delegated `pointerdown` on the document and draw synchronously after render.
- **Unticking a suggested SPO in step 1 crashed step 2** (found by Vu, 10/07/2026). Scout AI's suggestion still pointed at the removed SPO, and the board failed looking it up. The page sat on step 1's content with the step band on step 2. Now `CX.use()` drops any connection to an SPO that isn't on the board, and intake keeps Scout AI's original suggestions so re-ticking the SPO restores them.
- `elementFromPoint` only sees the viewport, so drag-drop targets must be on-screen (real users scroll; synthetic tests must too).
- `CX.use()` keeps the pending selection while the invoice object is the same, so the page's own re-validation doesn't drop a half-made connection.

## Components cascaded
- **Line Connector:** `.cx-*` (toolbar and legend, board, gutter, SVG links, `.cx-card` states, `.cx-dot`, `.cx-state`, `.cx-pick`, `.cx-maps`, `.cx-res`, `.cx-taxsplit`, `.cx-attest`, `.cx-viewbar`, `.cx-pdfview`).
- `.ivt-body.cx-mode` and `.intake-grid`.
- `.callout.sky`, a new informational callout.

Gallery: **Line Connector** replaces the SPO Line Match card, and there's a new **Standalone Invoice Intake** card. Design doc: **Line Connector** and **Standalone Invoice Intake** rules, and the Service POs invoice-mapping rule is rewritten. `docs/design.md` regenerated. The old `.lm-row` / `.lm-targets` list styles are no longer used by any page (the `.lm-opt`, `.lm-var`, `.lm-ai` and `.lm-fields` parts are still in use).

---

## Tickets

### TKT-SPO-31 · Line Connector component
**Summary:** A shared two-column board for mapping invoice lines to SPO lines by drag or click-click, with suggestion, mapped and error states.
**Acceptance criteria:**
- [ ] Drag dot to dot, or click one dot on each side, connects the lines; Esc cancels a half-made connection.
- [ ] Every invoice card has a "Connect to…" select that works by keyboard; under 820px it is the only input.
- [ ] Scout AI suggestions draw dashed and don't count as matched until accepted, per line or via Auto Map.
- [ ] One invoice line can connect to several SPO lines. Shares are editable and must total the line, and a mismatch draws amber.
- [ ] An unconnected invoice line shows the resolver in place.
- [ ] Validate is enabled only when every line is resolved and the attestation is checked.
**Audit findings:** SPO-38, SPO-41, SPO-43, SPO-45
**Files:** `buyer/spo-map.js`, `buyer/buyer-components.css` (`.cx-*`)

### TKT-SPO-32 · Single-SPO mapping on the board
**Summary:** The mapping takeover on an SPO uses the Line Connector, with the PDF as a toggle.
**Acceptance criteria:**
- [ ] A Line items / PDF toggle; the board fills the width.
- [ ] Failed extraction still offers Retry and Enter lines from the PDF.
- [ ] Autosave is kept; there is no Save draft button.
- [ ] Read-only mode shows the links without connectors or pickers.
- [ ] The validated result (variance, extras, GL allocation) is identical to before.
**Audit findings:** SPO-31, SPO-36, SPO-37, SPO-46
**Files:** `buyer/spo.html` (`openInvoiceMap`, `renderMapTk`, `validateMapping`)

### TKT-SPO-33 · Standalone intake, step 1: upload and choose SPOs
**Summary:** Upload a vendor invoice first; Scout AI fills its details and suggests the SPOs it covers.
**Acceptance criteria:**
- [ ] Uploading fills vendor, invoice number, date and lines.
- [ ] The SPO list is the vendor's SPOs waiting on an invoice at the property, with suggested ones pre-checked and a reason each. "Show other states" widens it.
- [ ] A duplicate invoice number for the vendor warns before continuing.
- [ ] A manual path exists without a PDF.
- [ ] Continue lists what's missing instead of failing silently.
**Audit findings:** SPO-32, SPO-46
**Files:** `buyer/spo-invoice.html` (`viewVendor`, `upload`, `manual`)

### TKT-SPO-34 · Standalone intake, step 2: match across SPOs and split the tax
**Summary:** The board spans every chosen SPO; each SPO is compared with its own estimate; invoice-level tax is split across SPOs.
**Acceptance criteria:**
- [ ] SPO lines are grouped by SPO, with a header (run date, estimate, variance).
- [ ] The resolver's add and extra options ask which SPO books the line.
- [ ] Tax and shipping split in proportion to billed amounts and sum to the cent. Shares are editable, can be reset, and must total the invoice tax.
**Audit findings:** SPO-36, SPO-43, SPO-44
**Files:** `buyer/spo-map.js` (`perSpo`, `taxShares`), `buyer/spo-invoice.html` (`viewMatch`)

### TKT-SPO-35 · Standalone intake, step 3: review, validate all, receipt
**Summary:** Review each SPO's share, attest once, validate every SPO together; confirm with a receipt.
**Acceptance criteria:**
- [ ] One card per SPO shows its lines (and how each was matched), tax share and share total. The rail total equals the invoice total.
- [ ] Validating sets every SPO to Ready for Accounting, each with its own slice linked as a shared invoice ("n of N SPOs").
- [ ] The receipt lists the SPOs, amounts and total, with Send all to Accounting and View Service POs.
**Audit findings:** SPO-32
**Files:** `buyer/spo-invoice.html` (`slices`, `validateAll`, `viewDone`, `sendAll`), `buyer/spo.html` (`pdfLines` shared note)

### TKT-SPO-36 · Intake drafts and entry points
**Summary:** One autosaved draft per vendor + invoice number, resumable from the Invoices tab; entry points from the list and from SPOs that share a vendor.
**Acceptance criteria:**
- [ ] Each change autosaves the draft; there is one draft per vendor + invoice number.
- [ ] The Invoices tab shows "n invoices in progress" with Resume, which returns to the right step.
- [ ] Add invoice is on the Service POs header.
- [ ] An SPO's upload modal offers "map them together" when the vendor has other SPOs waiting at the property.
**Audit findings:** SPO-47
**Files:** `buyer/spo-invoice.html`, `buyer/spos.html`, `buyer/spo.html` (`openUpload`, `otherWaiting`)
