# Service POs — Schedules (recurring series)

**Status:** ✅ built and cascaded (10/07/2026)
**Pages:** `design-system/buyer/schedules.html` (list, `#running` · `#ended`) · `design-system/buyer/schedule.html#SCH-<nn>` (detail, `/pause` · `/end`) · `spo-new.html#recurring` · `#recurring-<spoId>` · `#edit-SCH-<nn>` · `approval.html#SCH-<nn>` · Schedules entry in the SPOs menu on every buyer page
**Reference:** live "Scheduled" tab and the SPO-717 series card from the SPO audit (findings SPO-49, SPO-50; screenshot F31).

## What the feature is
Some services repeat: weekly common-area cleaning, monthly grounds maintenance, quarterly HVAC filters. A **schedule** is a template SPO plus a cadence. Each run creates an ordinary SPO, which then goes through the normal lifecycle.

## The model (the audit's core fix)
- **A schedule is its own record, not a lifecycle state.** The live product shows "Scheduled" as a tab next to the lifecycle tabs, so a scheduled SPO is counted twice (SPO-49). It also puts the series controls on one SPO's tracker (SPO-50). Here:
  - the series lives in `window.SCH` (`spo-data.js`, overlay `scout-schedules-v1`);
  - each generated SPO carries `series` + `run` and its own lifecycle state;
  - SPO list counts never include a series.
- **Fields:** name, property, vendor, scope, lines (with allocations), cadence (`weekly` / `biweekly` on a weekday, `monthly` / `quarterly` on a day 1–28, at a time), start, end (never · a date · after N runs), mode (**Draft only** or **Auto-send**), status, skipped dates, and an activity log.
- **Series statuses:** Pending Approval and Revision Requested (amber, your move) · Active (emerald) · Paused (sky, on hold) · Ended (muted).
- **Approval is per series, decided once** (Vu's call, 10/07/2026).
  - The request is the series' **12-month commitment**: runs in the next 12 months × cost per run.
  - Approval is required when that commitment is over $2,500, or when the busiest month pushes a GL past its monthly budget.
  - Once approved, runs that match the template go out without further approval. Auto-send is only possible on an approved (or approval-free) series.
  - An **edit that raises the 12-month commitment re-enters approval**. Edits that don't are saved straight away and apply from the next run.
  - In the approval queue the request is shown as one line per template line, "× N runs", and totals to the commitment.
- **Cadence engine** (UTC dates): `schedule()` lists every date and honors skipped dates and the end rule. `upcoming()`, `nextRun()`, `yearRuns()`, `runsInPeriod()`, `annual()` and `cadenceText()` ("Every week on Wednesday · 8:00 AM") build on it. A monthly day is capped at 28, so every month has it.

## What shipped
- **Schedules list:** Running / Ended Filter Tabs with metric cards that sum to the tab count:
  - Running: Total = Active + Your Move + Paused
  - Ended: Total = Completed + Stopped Early

  The toolbar line shows the 12-month commitment of active series. The table columns are Schedule (name, plus id · property), Vendor, Cadence (short form, plus mode · time), Next run, Per run and Status. There is one primary per row, only on your move (Review, Edit). Expanding a row shows the next 3 runs (skipped ones struck through) and the latest SPOs created.
- **Schedule detail:**
  - **Schedule card:** status pill; the plain-English cadence with mode; four stats (Next run · Per run · Next 12 months with run count · Ends); and **Manage this schedule** (Edit · Switch to Draft only / Auto-send · Pause · End schedule).
  - **Next-Task Strip** in every state:
    - Series approval → Review in Approvals
    - Revise the schedule → Edit
    - Next run · date → Skip this run
    - Paused (quoted reason) → Resume schedule
    - Schedule ended
  - **Upcoming runs:** the next 6 dates, the next one highlighted, each with **Skip** / **Undo skip**.
  - **SPOs from this schedule:** each with its date tile and lifecycle pill, plus a note for earlier SPOs.
  - **Every run orders:** scope and lines with allocation chips, and the Per run total.
  - **Rail:** vendor; facts (Property · Created by · Starts · Ends · Sending · Series approval), with the "Approved once for the series" note; Activity.
  - Pause takes an optional reason; End requires one. Both are modals, and every action is logged.
- **Generated SPOs say where they came from, and nothing more** (SPO-50):
  - The SPO detail shows a **series link** under the tracker: "Run 08/19/2026 of Common-area cleaning · Every week on Wednesday · Active → View schedule".
  - Its Approval step reads "series approved", and the Approval fact reads "Series · <approver>".
  - The activity log reads "Created and sent by schedule" or "Drafted by schedule".
  - On the SPO list, a **recurring marker** (repeat icon, with a tooltip naming the series and linking to it) sits beside the SPO number. Search also matches the series name.
- **Create and edit** use the same wizard.
  - The Review step has a **Repeat** card with a One-time / Recurring segment. Recurring adds:
    - schedule name, frequency, day, start, time;
    - end (never / date / after N runs);
    - "Each run" option rows (Draft only / Auto-send);
    - a live preview ("Next runs … · 52 runs ($11,700.00) in the next 12 months · No end date").
  - The budget check measures the series' **busiest month** ("this schedule 4 × $180").
  - The rail becomes a Schedule summary with the 12-month total.
  - The submit button reads one of: Start schedule · Submit schedule for approval · Save changes · Save & resubmit for approval.
  - **Make recurring** on any SPO not already in a series opens the wizard pre-filled; that SPO becomes run 1.
  - The confirmation page says what happens next.
- **Approvals:** schedule requests join Order Approvals as `SCH-<nn>`. The detail shows a "Recurring schedule" pill, a "Schedule · next 12 months" card (per run, runs, 12-month commitment), and "Schedule Active" as the last tracker slot. Deciding moves the series:
  - Approve → Active (and the approved run count is frozen)
  - Revision → Revision Requested
  - Reject → Ended, "Stopped Early"
- **Home:** the Approvals card counts schedule requests, and its meta names them ("· 1 Service PO · 1 schedule").
- **Nav:** the SPOs menu gets **Schedules** ("Recurring service POs") on every buyer page. The SPO list header gets a Schedules button.
- **Seeds:**

  | Schedule | What it is | Status | Notes |
  |---|---|---|---|
  | SCH-01 | Weekly cleaning, auto-send | Active | |
  | SCH-02 | Monthly grounds, draft only | Active | Ends after 12 runs |
  | SCH-03 | Quarterly HVAC | Paused | |
  | SCH-04 | Every other Monday pest control, draft only | Active | 09/21 skipped; today's run drafted SPO-848 |
  | SCH-05 | | Ended | Completed 6 runs |
  | SCH-06 | | Pending series approval | |

  They generated 6 SPOs (843–848), so Open is now 10, Invoices 5 and Closed 7. Approvals total 22 = Pending 3 + Revision 1 + Approved 15 + Rejected 3.

## Deviations from the proposal
- **No SPO is created at save time.** Runs create SPOs on their dates, so a new series' first SPO appears on its first run. Make recurring is the exception: the existing SPO becomes run 1.
- The prototype doesn't advance a clock (TODAY is 08/24/2026), so no new runs fire during a demo. The seeds show every outcome instead.
- Two new demo vendors (Bayou Green Landscaping, Pelican Pest Control) and two new GL codes (6150 Grounds & Landscaping, 6160 Pest Control) cover typical recurring services.

## Held
- Notifications for upcoming and created runs.
- Calendar view of upcoming runs.
- Last-day-of-month cadence (days stop at 28).
- Bulk "skip a holiday across all schedules".

## Pitfalls
- **Freeze what was approved.** A series' 12-month projection shrinks as time passes, and goes to zero once it has ended. Approval rows must show the approved run count (`approvedRuns`), not today's projection, or past approvals rewrite their own amounts.
- The SPO store key moved to `scout-spos-v3` because the seed set changed. `#reset-spos` clears both stores.
- Weekly cadences align the start date to the chosen weekday. Monthly ones skip a start month whose day has already passed.

## Components cascaded
- **Series card** (`.series-cad`, `.stat-strip`)
- **Run list** (`.run-row` with `.rd` date tile; `.next` and `.skipped` states; `.run-more`)
- **Series link** (`.series-link`)
- **Recurring marker** (`.rec-mark`)
- **Recurrence controls** (`.rec-grid`, `.rec-preview`), reusing `.mode-seg` and `.opt-row`
- `.status-dot.dot-muted`

Gallery **Buyer App · Service POs → Schedules** and the design-doc **Schedules (recurring SPOs)** rule, plus a Schedule Lifecycle Matrix. `docs/design.md` regenerated.

---

## Tickets

### TKT-SPO-19 · Schedule data model & cadence engine
**Summary:** Store recurring series separately from SPOs; generate run dates from a cadence with skips and end rules.
**Acceptance criteria:**
- [ ] A schedule stores template lines with allocations, cadence (weekly / every 2 weeks on a weekday; monthly / quarterly on day 1–28; time), start, end (never · date · N runs), mode, status, skipped dates and an activity log.
- [ ] Run dates honor the start date, the end rule and skipped dates; a skipped date doesn't count toward "after N runs".
- [ ] Each generated SPO stores its series id and run date, and keeps its own lifecycle state.
- [ ] Series never count in the SPO list's tabs or cards.
**Audit findings:** SPO-49, SPO-50
**Files:** `buyer/spo-data.js` (`window.SCH`)

### TKT-SPO-20 · Schedules list
**Summary:** A Schedules page with Running / Ended tabs, reconciling cards, and an expandable table of upcoming runs and created SPOs.
**Acceptance criteria:**
- [ ] Running cards: Total = Active + Your Move + Paused. Ended cards: Total = Completed + Stopped Early. All follow the property scope and search.
- [ ] Columns: schedule (name, id · property), vendor, cadence (+ mode · time), next run (or end date), per run, status. Every column except cadence sorts.
- [ ] Only your-move rows have a primary (Review → approval, Edit → wizard); others get a menu (View, Edit).
- [ ] Expanding a row shows the next 3 runs (skipped struck through) and the latest SPOs with their pills.
- [ ] Schedules is reachable from the SPOs menu on every page and from the Service POs header.
**Audit findings:** SPO-49
**Files:** `buyer/schedules.html`, all buyer pages (menu)

### TKT-SPO-21 · Schedule detail & series controls
**Summary:** One page per series with the cadence, upcoming runs, created SPOs, template, and the series' own controls.
**Acceptance criteria:**
- [ ] The cadence reads in plain English ("Every 2 weeks on Monday · 9:00 AM"), with next run, per run, 12-month cost and end rule.
- [ ] A Next-Task Strip in every series state names whose move it is (approval, revision, next run, paused, ended).
- [ ] Skip / Undo skip on any upcoming date. The next run updates immediately and the action is logged.
- [ ] Pause (optional reason) stops runs, and Resume restarts from the next date. End requires a reason and leaves created SPOs untouched.
- [ ] Switching Auto-send ⇄ Draft only applies from the next run and is logged.
**Audit findings:** SPO-50
**Files:** `buyer/schedule.html`, `buyer/buyer-components.css` (`.series-*`, `.run-row`)

### TKT-SPO-22 · Generated SPOs link to their series
**Summary:** An SPO created by a schedule shows where it came from; the series controls never appear on the SPO.
**Acceptance criteria:**
- [ ] The SPO detail shows the series link (run date, series name, cadence, series status, View schedule).
- [ ] The Approval step reads "series approved" and the Approval fact names the series approver.
- [ ] Activity starts with "Created and sent by schedule" or "Drafted by schedule".
- [ ] The SPO list shows the recurring marker with a tooltip naming the series, and search matches the series name.
**Audit findings:** SPO-49, SPO-50
**Files:** `buyer/spo.html`, `buyer/spos.html`, `buyer/spo-data.js` (`buildLog`)

### TKT-SPO-23 · Create, edit and "Make recurring" in the wizard
**Summary:** The SPO wizard creates and edits schedules: a Repeat card on Review with cadence, end, mode and a live preview.
**Acceptance criteria:**
- [ ] One-time / Recurring toggle. Recurring needs a name and shows a preview of the next 3 dates and the 12-month runs and cost.
- [ ] The budget check measures the busiest month of the series.
- [ ] Make recurring (any SPO not in a series) pre-fills the wizard, and that SPO becomes run 1.
- [ ] Editing applies to future runs only; created SPOs are unchanged.
- [ ] The confirmation states what happens next and links to the schedule.
**Audit findings:** SPO-50
**Files:** `buyer/spo-new.html`, `buyer/spo.html` (Make recurring)

### TKT-SPO-24 · Approve the series once
**Summary:** A schedule needs approval once, on its 12-month commitment; matching runs then need no further approval.
**Acceptance criteria:**
- [ ] Approval is required when the 12-month commitment is over $2,500, or the busiest month exceeds a GL's monthly budget.
- [ ] The request in Order Approvals is `SCH-<nn>`, with a Recurring schedule pill and a "per run × runs = 12-month commitment" total.
- [ ] Approve → Active, with the approved run count frozen on the request. Revision → Revision Requested (Edit). Reject → Ended (Stopped Early).
- [ ] An edit that raises the 12-month commitment returns the series to approval; other edits save without it.
- [ ] Home's Approvals card and the queue total include schedule requests.
**Audit findings:** SPO-16, SPO-34
**Files:** `buyer/approvals.html`, `buyer/approval.html`, `buyer/spo-new.html`, `buyer/home.html`, `buyer/spo-data.js` (`needsApproval`, `reason`)

### TKT-SPO-25 · Auto-send vs Draft only
**Summary:** Each series chooses whether runs email the PO automatically or create a draft for the buyer to send.
**Acceptance criteria:**
- [ ] Auto-send runs create the SPO in Awaiting Vendor with the PO emailed at the run time.
- [ ] Draft-only runs create a Draft SPO (Continue on the SPO list).
- [ ] Auto-send is only possible on an approved (or approval-free) series.
- [ ] The mode is visible on the list, the detail and the series link, and changing it is logged.
**Audit findings:** SPO-50
**Files:** `buyer/spo-data.js`, `buyer/schedule.html`, `buyer/spo-new.html`
