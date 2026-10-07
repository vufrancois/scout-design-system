# Screenshot index (F## → finding)

| File | Finding(s) | What it shows |
|---|---|---|
| F01-list-cards-tabs | SPO-01/02 | Cards vs tabs count mismatch (Total 36 vs tabs 37) |
| F02-list-table | SPO-03/04/06 | List table; TEMP vendors; truncated property; mixed dates |
| F03-spo845-vendor-rejected-but-awaiting-invoice | SPO-08/09/10/11 | Vendor rejected yet "Awaiting invoice"; TEMP code; empty Activity |
| F04-nav-menu | SPO-30 (nav) | SPOS/Contract Services/Orders/Admin nav; Notifications 20 vs bell 10 |
| F05-wizard-step1-property-vendor | SPO-14/18 | Create wizard step 1 |
| F06-vendor-picker-24355-dupes-temp | SPO-13 | 24,355 vendors, duplicates, TEMP in "approved" picker |
| F07-wizard-step3-ai-lines | SPO-15 | AI line extraction; "Needs details" |
| F08-unit-1805-no-units-found | SPO-05/15 | Real scope unit "1805" → "No units found" |
| F09-review-budget-warning-no-approval | SPO-16 | 365% over budget + "No approval is required" |
| F10-spo854-created-awaiting-invoice | SPO-19/20 | On submit → "Awaiting invoice" instantly; empty Activity |
| F11-ai-lines-all-zero-price | SPO-21 | Multi-line scope → all prices $0.00 |
| F12-price-600-became-6-and-split-portions | SPO-22/23 | "600" parsed as $6.00; split "1/2" portions |
| F13-messy-review-split-line-two-budgets | SPO-16 | Split line across GL; two budget warnings |
| F14-spo855-detail | SPO-24 | Detail line-items omit GL/unit/portions |
| F15-spo852-validated-open-status-relabeled-stepper | SPO-25/26/27/28 | "Open" badge on validated; relabeled stepper; "Original estimate" unchanged |
| F16-review-invoice-modal-validated | SPO-29/32 | Review-invoice modal; "oakleigh" file vs "Oakeigh" data; dup lines |
| F17-invoice-mapping-landing | SPO-31/32 | Mapping landing; autosave + Save draft |
| F18-spo853-sent-tab-means-accounting-badge-validated | SPO-25/30 | "Sent" = sent to Accounting; badge unreliable; TEMP vendor |
| F19-dashboard-no-spo-presence | SPO-33/34 | Dashboard has no SPO tile; SPO approval contradiction |
| F20-mapping-spo-total-0-false-variance | SPO-36/38/39 | "SPO Total estimate $0.00" → false "over" |
| F21-two-fix-extraction-banners | SPO-42 | Two different fix-extraction banners |
| F22-happy-review-on-estimate | (happy) | Clean review: On estimate, $250 |
| F23-happy-mapped-validated | (happy) | Happy path validated |
| F24-variance-5-lines-orphan-dumpfee | SPO-41 | 5 invoice lines incl. orphan dump fee |
| F25-variance-per-line-60-over-orphan-line | SPO-40/41 | Per-line "+$60 over"; orphan unmatched |
| F26-edit-invoice-items-modal | SPO-41/42 | Edit invoice items (delete/add) behind "Correct Mapping" |
| F27-messy-3-lines-tax-brokenout | SPO-44/45 | Messy extraction; tax $135.20 broken out |
| F28-messy-combined-line-cannot-split-400over | SPO-43 | Combined $800 line can't map to two SPO lines |
| F29-exact-match-ai-found-no-items | SPO-46 | AI extracted 0 items from the clean invoice |
| F30-unit-history-building-based-codes | SPO-48 | Building-based BBUU unit codes (root cause) |
| F31-scheduled-spo-recurrence-card | SPO-49/50/51 | Recurring series card (cadence, next draft, Edit/Pause/Stop) |
| F32-cancelled-spo-detail | SPO-52/53/54/55 | Cancelled detail; cus_ id canceller; 3rd stepper variant; Revive |
| F33-notifications-217-total | SPO-56/57/58 | Notifications page (217 total vs bell 10 / menu 20); SPO events absent |
