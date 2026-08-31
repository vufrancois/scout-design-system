# DESIGN.md

Usage rules, token reference, and implementation guidance for the Scout Design System. Generated from `design-system/design-doc.html` (the normative source) by `tools/design_md.py`.
## Overview

The Scout Design System provides a shared visual language across two applications: the **Buyer App** and the **Vendor/Admin Portal**. It is built on CSS custom properties as the token layer, with component implementations adapted per framework.

The living component gallery is available on the Components tab. This document defines the rules for using those tokens and components.
### Principles

- **Token-first** — never hard-code colors, spacing, or radii. Always reference CSS custom properties.
- **Semantic over literal** — use `--primary` not `--blue-700` in component styles. Literal scale values are for the token layer only.
- **Theme-safe** — every component must work in both light and dark mode. Test both before shipping.
- **Minimal overrides** — extend, don't override. If a component needs a new variant, add it to the system rather than one-off styling.

## Application Architecture

### Buyer App

- **Framework:** Shadcn UI + Tailwind CSS
- **Token integration:** CSS custom properties mapped to Shadcn's variable naming convention (`--primary`, `--secondary`, `--muted`, etc.)
- **Tailwind preset:** Extend the default theme via a shared `tailwind-preset.ts` that references the CSS variables.

### Vendor / Admin Portal

- **Framework:** `@medusajs/ui`
- **Token integration:** Override Medusa's default theme variables with Scout tokens at the CSS layer.
- **Usage:** Use Medusa's built-in components where possible; only build custom components for Scout-specific patterns.

Both apps share the same CSS custom property names. The token layer is the contract — component implementations can differ by framework.
## Colors

### Primary Scale

Scout's primary blue is `#172d77` (blue-700). The full 11-step scale runs from `--blue-50` to `--blue-950`.

| Token | Value | Usage |
|---|---|---|
| `--blue-50` | #eef2ff | Accent backgrounds, hover states |
| `--blue-100` | #dbe1fe | Light accent fills |
| `--blue-200` | #b8c4fd | Borders on accent elements |
| `--blue-300` | #8da0fb | Dark-mode link text |
| `--blue-400` | #6277f5 | Hover states on primary |
| `--blue-500` | #3d52e0 | Active states, rings |
| `--blue-600` | #2740b8 | Pressed states |
| `--blue-700` | #172d77 | **Primary** — buttons, links, active tabs |
| `--blue-800` | #122361 | Dark surfaces |
| `--blue-900` | #0d1a4a | Sidebar / brand navy surfaces |
| `--blue-950` | #080f2e | Deep navy (brand gradients, sidebar hover) |

### Semantic Tokens

Component code should only use semantic tokens. These automatically adapt between light and dark themes.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | #ffffff | #0b0d10 | Page background |
| `--foreground` | #111111 | #f5f5f5 | Primary text |
| `--primary` | #172d77 | #172d77 | Buttons, links, active states |
| `--primary-foreground` | #ffffff | #ffffff | Text on primary backgrounds |
| `--secondary` | #f5f5f5 | #14161b | Secondary button fills |
| `--muted` | #f5f5f5 | #1a1d23 | Disabled fills, subtle backgrounds |
| `--muted-foreground` | #6b7280 | #a1a1aa | Secondary text, placeholders |
| `--accent` | #eef2ff | #1a1d23 | Hover backgrounds, highlights |
| `--border` | #e5e7eb | #24272e | All borders |
| `--card` | #ffffff | #111318 | Card / elevated surface |
| `--destructive` | #ef4444 | #ef4444 | Delete, error states |
| `--success` | #10b981 | #10b981 | Success states |
| `--warning` | #f59e0b | #f59e0b | Warning states |

### Accent Palette

Each accent has a vivid and soft (tint) variant. Use the soft variant for backgrounds and the vivid variant for text/icons on those backgrounds.

| Name | Vivid | Soft | Usage |
|---|---|---|---|
| Violet | `#8a5fef` | `#f0ebfe` | Badges, categories |
| Rose | `#e0599b` | `#fce8f1` | Urgent, attention |
| Amber | `#f59e0b` | `#fef3cd` | Pending, awaiting action |
| Emerald | `#10b981` | `#d1fae5` | Success, completed, delivered |
| Sky | `#3b82f6` | `#dbeafe` | Info, shipping, in-progress |
| Orange | `#f97316` | `#ffedd5` | Warnings, expiring |

### Rules

- Never use raw hex values in component code. Always use the CSS variable.
- Use semantic tokens (`--primary`, `--border`) for UI chrome. Use accent tokens (`--amber`, `--emerald-soft`) for status indicators and badges.
- The blue scale tokens (`--blue-50` through `--blue-950`) are for the token definition layer only. Components should use `--primary`, `--accent`, etc.

## Typography

Scout uses **Inter** as its primary typeface, with system-font fallbacks. Monospace uses JetBrains Mono.

`font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-family: "JetBrains Mono", ui-monospace, monospace; /* code */`
### Type Scale

| Role | Size | Weight | Letter Spacing |
|---|---|---|---|
| Display (docs & marketing only) | 36px | 800 | -1px |
| Page title (app) | 22px | 600 | -0.3px |
| Section heading (h2) | 28px | 700 | -0.5px |
| Card title / h3 | 22px | 600 | -0.3px |
| Panel title (app cards) | 16px | 600 | normal |
| Subsection heading | 16px | 600 | normal |
| Body | 14px | 400 | normal |
| Small / meta | 13px | 500 | normal |
| Caption | 12px | 400 | normal |
| Micro / label | 11px | 600 | 0.05–0.08em |

### Rules

- Use negative letter-spacing on headings (22px+). Body text uses normal spacing.
- Line height: 1.5 for body text, 1.2 for headings.
- Font weight range: 400 (body), 500 (labels/buttons), 600 (subheadings), 700 (headings), 800 (display).
- Never use font sizes below 11px.
- Identifiers and codes (SKUs, order IDs, tokens) render in JetBrains Mono at 12px, `--muted-foreground`.

## Spacing

Scout uses a 4px base grid. All spacing values are multiples of 4.

| Step | Value | Common Usage |
|---|---|---|
| 1 | 4px | Tight gaps (icon-to-text) |
| 2 | 8px | Inner padding, compact gaps |
| 3 | 12px | Default gap between siblings |
| 4 | 16px | Card padding, section inner padding |
| 5 | 20px | Comfortable card padding |
| 6 | 24px | Page horizontal padding, section gaps |
| 8 | 32px | Between subsections |
| 10 | 40px | Between major sections |
| 16 | 64px | Between page sections |
| 24 | 96px | Page bottom padding |

### Rules

- Page content stretches to fill the viewport — never apply a max-width to the content area. It uses 32px padding on all sides; grids and tables flex to the available width.
- Never use arbitrary pixel values. Stick to multiples of 4.
- In Tailwind, use the default spacing scale: `p-1` (4px), `p-2` (8px), `p-3` (12px), etc.
- Use `gap` over margins when spacing siblings in flex/grid containers.

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | 4px | Badges, inline code, small elements |
| `--radius-sm` | 6px | Buttons, inputs, pagination controls |
| `--radius-md` | 8px | Cards, dropdowns, toolbar items |
| `--radius-lg` | 12px | Modals, larger cards, stat cards |
| `--radius-xl` | 16px | Feature sections, hero cards |
| `--radius-pill` | 9999px | Pills, tabs, toggles, search bars |

### Rules

- Nesting: inner radius = outer radius minus padding. Example: card has `--radius-lg` (12px) with 16px padding, inner element uses `--radius-xs` (4px).
- Maximum radius is 16px for rectangular elements. Only use `--radius-pill` for truly pill-shaped elements.

## Shadows

| Token | Usage |
|---|---|
| `--shadow-xs` | Active tab pills, toggles |
| `--shadow-sm` | Cards at rest, inputs on focus |
| `--shadow-md` | Dropdowns, popovers |
| `--shadow-lg` | Modals, floating panels |
| `--shadow-xl` | Toasts, system notifications |

### Rules

- Dark mode uses higher-opacity shadows. The tokens handle this automatically.
- Elevation hierarchy: page surface (none) < card (xs/sm) < dropdown (md) < modal (lg) < toast (xl).

## Theming

Scout supports light and dark themes. The theme is controlled by adding the `.dark` class to the `<body>` element.

`/* Light (default) */ <body> /* Dark */ <body class="dark">`
### Implementation

- All semantic tokens have both light and dark values defined in the CSS. Switching themes just swaps the variable values.
- **Dark surfaces are neutral graphite, not navy** (page #0b0d10, card #111318, border #24272e): color lives in accents, pills, and the primary blue — never in the canvas. The sidebar keeps its brand navy in both themes and is the one intentional blue surface.
- Never use `@media (prefers-color-scheme)` — theme is user-toggled, not system-derived.
- When using Tailwind, map CSS variables to the Tailwind config. Use `hsl(var(--primary))` pattern or direct `var()` references.

### Rules

- Never use fixed colors like `white` or `#000` in component styles. Use `--background`, `--foreground`, etc.
- Test every component in both themes before marking it complete.
- Accent vivid colors (`--amber`, `--emerald`, etc.) stay the same across themes. Only semantic tokens change.

## Icons

**Lucide** (`lucide-react`) is the official icon library.

### Sizing

| Context | Size | Stroke Width |
|---|---|---|
| Inline with text (buttons, labels) | 16px | 2 |
| Standalone (nav, toolbar icons) | 20px | 2 |
| Feature / hero icons | 24px | 1.5 or 2 |
| Icon containers (stat cards, page headers) | 24px icon in 40px container | 2 |

### Rules

- Always use `stroke-linecap="round"` and `stroke-linejoin="round"` (Lucide defaults).
- Icon color should inherit from text color via `stroke="currentColor"`.
- For colored icon containers, use the accent soft color as background and the vivid accent as stroke color.
- Never use icons from other libraries. If Lucide doesn't have what you need, request an addition to the system.

## Formatting

Canonical rules for displaying currency, dates, and times. These apply across both apps — a value should never be formatted two different ways on two different screens.

### Terminology

- **Buyers** are the people who live at or purchase for properties. Never call them "users" anywhere in vendor-facing copy — table columns, avatar-stack labels, stats, and empty states all say Buyers.
- **Customer** is reserved for organization-level concepts only (Customer Groups, Customer Management). An organization is a customer; the people at its properties are buyers.

### Currency

| Context | Format | Example |
|---|---|---|
| Default (prices, totals, line items) | Symbol prefix, no space, comma thousands, always 2 decimals | `$1,907.75` |
| Vendor financial tables (orders, quotes, payouts) | Default + ISO code suffix | `$1,907.75 USD` |
| Stat cards / dashboard aggregates only | Abbreviated, 1 decimal | `$45.3K`, `$1.2M` |
| Negative amounts | Minus before symbol — never parentheses | `-$45.00` |
| Zero | Show as a value — never "Free" in financial contexts | `$0.00` |

### Currency Rules

- Never drop cents on monetary values in tables or documents — `$561.08`, not `$561`.
- No space between symbol and amount: `$1,907.75`, not `$ 1,907.75`.
- The ISO code suffix (`USD`) appears wherever currency could vary — all Vendor portal financial tables use it.
- Abbreviation (`$45.3K`) is only for at-a-glance aggregates; anything actionable or exact shows full precision.
- Implementation: `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.

### Date & Time

| Context | Format | Example |
|---|---|---|
| Standard date (tables, details) | `MM/DD/YYYY` — zero-padded | `07/13/2026` |
| Date with time | `MM/DD/YYYY, h:mm AM/PM` | `07/13/2026, 2:30 PM` |
| Recent activity (< 7 days) | Relative | `2h ago`, `Yesterday` |
| Date range | En dash with spaces | `12/11/2026 – 12/13/2026` |

### Date Rules

- US numeric format everywhere: `MM/DD/YYYY`, always zero-padded (`06/03/2026`, not `6/3/2026`).
- Spelled-out or abbreviated month names are reserved for prose and marketing copy — never in UI data displays.
- Relative timestamps switch to the standard date after 7 days. Tooltips on relative timestamps show the full date + time.
- 12-hour clock with AM/PM; minutes always shown (`2:00 PM`, not `2 PM`).
- Implementation: `Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })`.

## Charts

Charts are implemented with the app's charting library; the design system governs colors and labels.

- **Categorical palette** (identity, assigned in fixed series order, never cycled), validated for CVD separation on both surfaces: light `#2740b8 · #10b981 · #f59e0b · #8a5fef`, dark `#6277f5 · #059669 · #d97706 · #8a5fef`. More than four series fold into "Other." Bars always carry direct value labels (the light set's contrast relief).
- Text never wears a series color — values, labels, and legends use text tokens; a dot or mark beside them carries identity. One axis per chart; never dual-axis.
- Single-series charts (bars, lines, areas) use `--blue-400`.
- Axis/tick labels: 9–10px `--muted-foreground`; gridlines use `--border`.
- Chart axis dates use `MM/DD` shorthand; full `MM/DD/YYYY` everywhere else.
- Donut center: 26px/700 value + 11px muted caption. Legend: 8px dot, 13px label, right-aligned 600-weight value.

## Components

See the Components tab for the visual reference. Below are usage rules.

### Buttons

- Variants: primary, secondary, outline, destructive outline, ghost, destructive, link.
- Destructive outline (red text, neutral border, red border on hover) for dangerous actions in toolbars and page headers; reserve the filled destructive variant for confirmation moments (modal confirm).
- AI-powered actions use the standard outline variant with a sparkles icon (e.g. "Categorize with AI") — no dedicated AI button style.
- Height: 40px default, 36px for compact contexts (toolbars), 48px for hero CTAs.
- Always use `font-family: inherit` on buttons to prevent browser defaults.
- Focus: 2px `--ring` outline offset 2px from the button (via double box-shadow). Applied on `:focus-visible` only — keyboard focus, not mouse clicks. Dark mode uses `--blue-400` for contrast.
- Disabled: opacity 0.5, `cursor: not-allowed`, pointer events off. Never remove a disabled button from the layout — it holds its space.
- Pressed: scale to 98% while active.
- Loading: inline 14px spinner (2px stroke, currentColor) replaces the leading icon; button is disabled while loading and the label switches to the in-progress verb ("Saving...").
- Leading icons: 16px with 8px gap. Icon-only buttons are square (40px, or 36px small) and require an `aria-label`.
- Ghost icon actions: borderless 32px icon buttons for inline row/card actions (kebab menu, edit); 24px small variant for affordances beside text (copy an identifier). Muted color, `--muted` hover.

### Inputs & Select

- Height: 40px. Border: `1px solid var(--border)`.
- Focus ring: `2px solid var(--ring)` with 2px offset.
- Placeholder text uses `--muted-foreground`.

### Checkbox

- 16px square, `--radius-xs`, 1px `--border`. Checked: `--primary` fill with white checkmark.
- Hover darkens the border to `--muted-foreground`. Disabled: 50% opacity, muted background.
- Table bulk selection: leading 40px column, header checkbox selects all. With label: 8px gap, 14px text.

### Switch

- 36×20px pill; `--border` track, `--primary` when on, 16px white knob with xs shadow. Disabled: 50% opacity.
- Use for immediate state changes (activating a price list, enabling a setting) — the change applies on toggle. Use a checkbox when the change requires a save action.
- In tables: dedicated column (e.g. "Active"), vertically centered. Focus ring follows the button focus-visible pattern.

### Progress

- 4px pill track, `--muted` background, `--primary` fill. On colored surfaces: `rgba(255,255,255,0.3)` track with white fill.
- Pair with an 11px muted percentage label below ("45% Processed").

### Badges

- Neutral (category pills): `--muted` background, 1px `--border`, pill radius, 12px/500 text in `--muted-foreground`. Truncate with ellipsis past 220px; vertically align middle in table cells.
- Soft accents: accent-soft background + matching 6px dot for semantic states. See the accent palette in Colors.

### List Item Card

- Card-based alternative to table rows for rich list items (inventory, catalogs). White card, 1px `--border`, `--radius-lg`, `16px 20px` padding, `--shadow-sm` on hover.
- 4px left accent bar signals status (emerald in stock, red out of stock) — same accent-bar language as color-coded stat cards and toasts. The accent bar appears in **both** the list and grid variants so status never drifts between views.
- Anatomy, left to right: checkbox (inside the card), 48px thumbnail, name + monospace SKU, soft accent badge cluster, price, kebab menu.
- 12px gap between cards. Pair with the bulk selection bar above the list.
- **Grid variant:** media-first display mode of the same item, switched via the Segmented Toggle. Square (1:1) image area with body below (name, badges, price + actions footer). 4-column grid, 16px gap.
- **Entity card (text-first grid):** for entities without imagery (properties, organizations). Status badge sits in the header row beside the name; meta line below; avatar stack footer. 3-column grid, 16px gap.
- **Entity card — compact (horizontal):** densest flavor for simple groupings (customer groups). Single row: 36px solid-accent avatar with icon, name (truncates), trailing avatar stack + count. No status badge or meta line.
- Overlay-on-media: controls floating on the image (checkbox top-left, status badge top-right, SKU chip bottom-left) get a `--background` fill and xs shadow, inset 12px.
- Row actions: kebab menu always; at most one promoted quick-action (e.g. edit) placed beside it.

### Avatars

- Circular, 28px default (36px large), 2px `--background` border. Colors rotate through the accent palette; initials optional (11px/600 white).
- Stack: -8px overlap, show at most 4 avatars then a `+N` overflow chip (`--muted` background, 10px/600). Pair with a muted count label ("20 users").

### Star Rating

- Filled Lucide stars in `--amber` (the palette's rating color); empty stars use `--border`. 16px default, 20px large, 2px gap.
- Read-only display. Optional trailing value label (13px/600, 6px gap): `4.0`, `5.0 avg`.

### Chips

- Read-only stat chips for page headers — 40px height (button-height), `--radius-lg`, 13px/500, never interactive. Distinct from badges (smaller, inline) and filter chips (removable, in the toolbar).
- Default: `--background` fill with 1px `--border`. Accent variant: accent-soft fill with matching border and dark accent text.
- Content: leading 16px icon or inline star rating + short stat text ("3 reviews", "128 orders this week").
- Date range chip: 34px display-only chip with calendar icon for dashboard card controls (`06/17/2026 – 07/16/2026`).

### Metric Tile

- Solid-accent KPI tiles for dashboards — single-tone fills (`--emerald`, `--primary`, `--blue-900`) with white text; never gradients.
- Hero variant: centered, 34px value, optional pill chip for the time window ("30D"). Compact: left-aligned label + 28px value + 11px note.

### Insight Card

- Dashboard card header: 32px muted icon tile + 15px/600 title (+ optional 13px muted subtitle) left; controls right (segmented toggle, date chip).
- Without a subtitle the title vertically centers against the icon; with one, both top-align.

### Theming & Responsive

- **Dark mode:** every app page supports dark via `body.dark` + the token overrides (including dark variants of the `-soft` accent colors). A sun/moon toggle in the topbar persists the choice in `localStorage` across pages. Component fixes ride on `body.dark` rules — primary-colored *text* (sorted headers, links, checks) lightens to `--blue-300`; tinted badges switch to translucent accent backgrounds with lightened text.
- **Breakpoints:** 1280px (low-priority table columns drop), 1024px (sidebar becomes a tap-to-dismiss overlay drawer, grids go 2-up, page padding tightens), 720px (grids stack to one column).
- **Overflow containment:** `.main` carries `min-width: 0` so wide tables scroll inside their cards instead of stretching the page; the document itself never scrolls horizontally.

### Tooltip

- Dark bubble (`--foreground` background, `--background` text, 12px/500, `--radius-sm`, small arrow), appearing instantly on hover above the target. Implemented via a `data-tip` attribute — no JS.
- **Affordance:** badges and pills carrying a styled tooltip show a 13px muted info glyph after the label, so hoverability is discoverable.
- **When to use which:** native `title` tooltips are for supplementary detail (full dates behind relative times, full text behind truncation). **Load-bearing sub-state** — a payment sub-step, an actor/provenance note — uses the styled Tooltip so it's discoverable and instant.

### Stepper

- Pipeline progress for detail pages: 40px nodes with connector lines; done = emerald fill + check, current = amber ring + soft fill (amber = action color), upcoming = muted outline.
- Every node carries an **actor caption** (Auto / You / Buyer, 10px uppercase) — the stepper answers whose turn it is, per the whose-turn-is-it rule. The current node's caption matches its ring color.
- **Buyer-turn current node:** when the current step's actor is the Buyer, the ring and caption render sky instead of amber — amber strictly means "you act." The whose-turn color language holds across stepper, pills, and the Next-Task Strip.
- The detail page is where full step granularity lives; lists show the condensed states. A progress badge beside the stepper title shows the count only ("4 of 8") — the next action is named by the Next-Task Strip, not repeated here.

### Next-Task Strip

- Detail pages with a lifecycle get exactly one **Next-Task Strip**, fixed directly below the Stepper in every state. It is the single home of the page's primary action — **primary actions never nest inside panels**; panels keep secondary, contextual actions only (cancel, packing slip, tracking edit). The panel is where you verify; the strip is where you act.
- Three tones: **action** (amber dashed border + amber-soft fill, icon tile, "Action Required · [Task]" title, one-line consequence, primary CTA right) when it's the vendor's turn; **wait** (neutral border, clock icon, "Waiting on [Actor] · [Step]", no CTA) when another actor owns the step; **done** (emerald) when the lifecycle is complete.
- The strip's CTA opens the same task-flow Modal the milestone requires — it is the Stepper's current step made actionable. Waiting states are stated explicitly, never left as a page with no button.

### Line Item & Totals

- Line Item: 48px bordered muted thumb, 14px/600 name (truncates), mono SKU with copy action, muted variant line; price × qty muted, bold right-aligned row total. Rows divide with 1px borders.
- Totals block: label muted / value right rows; the grand-total row is separated by a border and bolded at 15px with the ISO suffix (`$236.14 USD`). Secondary rows (captured, pending) stay regular weight.
- **Badge-in-totals:** a totals row's label can carry one inline pill qualifying the money's state — amber ("Awaiting Confirmation") while staged, emerald ("Confirmed by Vendor") once settled. 11px/600, pill radius, soft fill; never more than one per row.

### Document Row

- File attachments render on a soft tonal surface: file icon, 13px/600 name, MM/DD/YYYY date meta, ghost download action. Section title is plain — no count pill.
- **Type accents:** one surface color per document type — sky Purchase Order, emerald Invoice, violet Receipt of Goods — so the rail scans by kind before you read a name.
- A row may carry one inline secondary line under a hairline divider: either an action in the accent color ("Replace invoice") or a muted locked note stating why it can't change ("Locked — order paid"). Never both.

### Form Rows & Selects

- Task-flow forms (inside modals) use rows: label (14px/600) + muted description left, control right in a 230px column; rows divide with 1px borders and stack under 720px.
- Select: 38px, full-width of its column, inline chevron, `--ring` focus border. Quantity input: 56px centered field with the bound shown beside it ("/ 2"). Stock deltas render rose ("944 −2").
- Task flows use the standard **centered Modal** (max 640px, dim overlay, esc chip + X in the header, pinned footer actions right) — not full-screen takeovers.

### Lifecycle Matrix

The single source of truth tying the Orders list to the order detail. Every legal state is one row; a list row's fulfillment pill × payment pill must match a row here, and its order link lands on that row's detail state.

| Workflow step | Vendor fulfillment pill | Buyer fulfillment pill | Payment pill | Whose turn | Detail state |
|---|---|---|---|---|---|
| 1 · Placed | To Fulfill | Not Fulfilled | Needs Tax & Invoice | You | `#placed` |
| 2 · Fulfilled | To Ship | Fulfilled | Needs Tax & Invoice | You | `#fulfilled` |
| 3 · Shipped | Shipped | Shipped | Needs Tax & Invoice | You | `#shipped` |
| 4 · Delivered | Delivered | Delivered | Needs Tax & Invoice | Buyer | `#delivered` |
| 5 · Delivery Validated | Delivered | Delivery Validated | Needs Tax & Invoice (Receipt of Goods on file) | You | `#tax` |
| 5 · Claim Open (overlay) | Delivered | Claim Open | Invoice held (until every line is resolved) | You | `#claim` |
| 6 · Invoice Submitted | Delivered | Delivery Validated | Invoice Validation (buyer QCs the invoice) | Buyer | `#invoiced` |
| 6 · Invoice Disputed (overlay) | Delivered | Delivery Validated | Invoice disputed (correct & resubmit · validation blocked) | You | `#disputed` |
| 7 · Invoice Validated | Delivered | Delivered | Invoice Posted (on the books · awaiting payment) | Buyer | `#validated` |
| 8 · Buyer Paid | Delivered | Delivered | Paid | You | `#paid` |
| 8 · Captured | Delivered | Delivered | Captured | You | `#captured` |
| 9 · Completed | Completed | Completed | Captured | — | `#completed` |

- **One vocabulary, two lenses:** the canonical fulfillment terms are Not Fulfilled → Fulfilled → **Shipped** → Delivered ("In Transit" is retired everywhere). The vendor list keeps its action-oriented pills (To Fulfill, To Ship) for steps where the vendor must act; the buyer list shows the state terms. Colors flip by viewer per whose-turn: amber marks *your* move — so pre-delivery states read amber to the vendor and gray/sky to the buyer, and **Cancellation Pending** (an overlay that can ride any pre-delivery step, taking precedence over the stage pill) is amber on the vendor side and sky on the buyer side.
- **Partials are aggregates, not new stages:** each fulfillment runs its own Fulfilled → Shipped → Delivered mini-lifecycle; the order-level pill is the aggregate — Partially Fulfilled (between 1 and 2), Partially Shipped (between 2 and 3), Partially Delivered · *n*/*m* (between 3 and 4). A partial pill keeps its order in the bucket of its least-advanced items, so list card counts still reconcile.
- **Gating rule:** the payment pipeline can never outrun the buyer's attestation — before **Delivery Validated**, the payment pill is always **Needs Tax & Invoice**; Invoice Validation, Invoice Posted, Paid, and Captured all require the buyer's delivery validation (the Receipt of Goods), and an open claim holds the invoice at whatever stage it's in. Any list row violating this is a data bug.
- Exception flags (e.g. an Active Return) ride alongside these pills; they never replace them.
- **Invoice Submission has vendor sub-states** that never leave step 5: `#tax` (upload), `#review` (Scout AI processed — review & accept), and `#disputed` (buyer rejected — correct & resubmit). All three show "4 of 8" with the same stepper; only the task strip and Documents rail change.

### Buyer App Bar & Nav Chips

- The Buyer App uses a **floating pill App Bar** (card surface, pill radius, shadow-md, sticky under a 14px gutter) instead of the vendor sidebar. Anatomy left→right: avatar ring (36px, 2px primary border, initials) + Scout wordmark (inline SVG on `currentColor`), Nav Chips, Context Switcher, icon buttons.
- **Nav Chips:** 38px pills, 14px/500, 17px muted leading icon; active = muted fill + 600 weight + foreground icon; hover = accent. Dropdown chips carry a chevron that rotates 180° while open. Under 1100px labels collapse to icons; under 820px the wordmark hides.
- **Icon buttons:** 40px circles; primary-filled only for notifications and cart (the two the reference filled); a status dot (emerald, 2px surface ring) marks unread.
- **Lifecycle Matrix update:** delivery validation is no longer gated on fulfillment — the buyer can validate arriving items at any stage, the save creates the fulfillment and marks those items shipped + delivered, partial validation is a first-class state, invoice submission follows delivery validation, and validation events record who performed them. The vendor Order Detail is reconciled to this model: its stepper carries the canonical 8 slots with actors flipped (Placed · Fulfillment · Delivery · Delivery Validation BUYER · Invoice Submission YOU · Invoice Validation BUYER · Awaiting Payment BUYER · Completion), the Sales Tax step folds into Invoice Submission, and the buyer's validation delivers the Receipt of Goods into the vendor's Documents rail.
- **Invoice Submission is upload → AI extraction → review → accept** — the vendor never types invoice details up front. The Upload Invoice modal takes only the PDF ("Upload for AI review"); Scout AI extracts the **invoice number and sales tax**; the vendor then reviews in a centered Modal (never a drawer — the Modal-over-takeover rule) with both extracted fields editable and **two required confirmations**, each a checkbox card that fills sky when checked: "Confirm sales tax · I confirm this amount matches the invoice" and "Confirm buyer visibility · I understand the resulting invoice PDF will be shown to the buyer for invoice validation." Accept is disabled until both are checked — the confirmations are the point: the extracted numbers are AI output, and a human attests to them before the buyer ever sees the document. Accepting makes the PDF the **buyer-facing invoice** and advances the order to Invoice Validation; Delete (rose, in the modal) discards the upload and returns to the upload task. While an invoice is uploaded-but-unaccepted the Documents rail shows a **Pending review** block (Buyer-facing Invoice · "No invoice has been accepted yet" · Awaiting invoice chip, then the file with its Processing / Ready-for-review state) — accept or delete before attaching another. Demo: `#tax` (upload task) → live upload → `#review` → accept → `#invoiced`.
- All buyer components ship in `buyer/buyer-components.css` scoped under `.buyer`; pages add `buyer/buyer.css` for the reset and layout. One shared stylesheet — no per-page CSS clones.

### Mega Menu

- Dropdown under a nav chip: popover surface, radius-xl, shadow-lg, 12px padding, 14px below the bar. One column (min 300px) or two (min 620px; one column under 820px).
- Item: 20px primary icon, 15px/600 title, 13px muted one-line description; accent hover. A **disabled item** goes muted and replaces its description with an upsell link ("Contact SCOUT to enable Budgets →") — never hide an unavailable destination, explain it.
- One menu open at a time; outside click and Esc close.

### Context Switcher

- The buyer's scope (one property or all) has exactly **one control**, in the App Bar, labeled "Current Property:" with the selection beneath. Never duplicate it on a page.
- Dropdown of context options (480px): 44px sky tile, 14px/600 name with an Active badge on the current one, address, city with a pin icon, units badge right; an aggregate "All properties" option leads with its description.
- Selecting re-scopes the whole page (every count, chart, and CTA); action cards drop to a calm state when the chosen scope has nothing waiting.

### Dashboard Hero

- Brand gradient band (blue-800 → blue-600 → blue-500) with a clipped decorative layer (two soft white circles at 6%); 28px/700 greeting ("Welcome back, [first name]", falling back to "Welcome back") beside a 48px glass icon tile, 14px muted subtitle; segmented time toggle (7D / 30D / 90D) top-right.
- KPI Stat Cards straddle the band's bottom edge (−76px). The band keeps its navy in dark mode — the one intentional blue surface, the same rule as the vendor sidebar.
- Dashboard KPIs show plain currency (`$25,471.50`); the `USD` suffix stays reserved for financial tables.

### Status Breakdown

- Icon-titled card (36px tonal tile + 16px/600 title + header count pill) with a View All link; stacked tinted rows: 16px colored icon, 13px label with optional 11px meta, 14px/700 count, Tooltip ⓘ.
- Rows follow the whose-turn colors and the Lifecycle Matrix vocabulary from the buyer's side — amber = the buyer's move (Invoice Validation, Approvals Pending), sky = with the other side, emerald = done. Sub-conditions ("Partially fulfilled") are meta lines inside their stage, never rows.
- Exceptions (Canceled) get a rose row at the bottom of the stack — a lane, not a stage — with the meta "not counted in open orders"; it goes neutral at zero rather than disappearing.
- Needs-your-action cards on buyer dashboards reuse the Insights stat-card anatomy exactly (16px colored icon + 13px title, 30px colored count, muted meta, full-width outline action), ordered by what gates what: Deliveries to Validate → Invoices to Validate → Approvals Pending.

### Line Chart & Horizontal Bar Chart

- **Line Chart:** 220px SVG; recessive gridlines in `--border`; 10px muted axis labels (MM/DD on x); 2px blue-400 series with an 8% area fill; hover layer always on — dashed crosshair, 8px marker with a surface ring, tooltip (value + date). The delta pill beside the title is directional (emerald up / rose down) and names its comparison window in a tooltip.
- **Horizontal Bar Chart:** ranked categories as 18px bars on a muted track (4px data-end radius), 140px label column with a legend dot, direct value labels right (tabular numerals), a 10px muted axis under the bars, and a total line anchoring the card. Bars distribute evenly across the card's height so paired chart cards stay balanced.

### Hero Search & Search Modes

- Storefront pages open directly into search (no masthead — the App Bar already carries the brand and section): the Search component at hero scale, full content width, 58px pill, 20px leading icon, `--ring` focus ring with a soft glow. **It is sticky** (14px under the App Bar, shadow-md) so search stays reachable while browsing categories; a compact 46px variant does the same above results grids.
- Search mode (Keyword / ✦ AI) is a **segmented control inside the field**, never a floating chip; the AI mode wears the sparkles icon per the AI-action rule and swaps the placeholder to a natural-language prompt. Enter submits — no separate go button.

### Category Tile & Browse Modal

- Category Tile: tonal sky→card gradient, 1px border, radius-lg; 16px/600 title top-left (max two lines, 64% width), artwork bottom-right (40% wide — an `<img>` or a tinted 1.25-stroke icon); hover lifts 2px with shadow-md. Grids run 5 → 4 → 2 across breakpoints. The `.sm` variant (15px title) is for subcategories.
- Browse Modal: the wide Modal variant (1200px) for drilling into a category — header with 22px primary title, a ‹ › n / N pager that wraps (arrow keys too), and close; scrollable body with a subcategory count and a 4-up tile grid; Esc and outside click close; body scroll locks.
- Promo carousels on the storefront use Marketing Cards in a paged rail (3 / 2 / 1 per view) with dots + arrows and **no autoplay**.

### Product Card

- **Fixed-slot anatomy** so every card in a row aligns: media (4:3, overlay badges bottom-left, compare toggle top-right) → vendor eyebrow (18px avatar + 12px muted name, one line) → title (15px/600, **two lines always reserved**) → price block of **two fixed lines** (24px price with `/ each` inline and unwrappable; compare-at strikethrough · "Save 26%" as emerald text beneath, reserved even when empty) → two single-line meta rows sharing a 14px icon column (delivery promise, stock) → Add to Cart + wishlist pinned to the bottom.
- Vocabulary: units read "/ each" (never EA / EACH); delivery promises are complete sentences, never truncated chips ("Overnight · order by 2pm CST", "3–5 business days", "5–7 business days · from vendor"); stock is In Stock / Low stock / Out of stock (out disables Add to Cart); vendors show an avatar + name, not a logo.
- Compare toggle: 34px circle, primary-filled when selected, card border goes primary, tooltip below the button and right-anchored so it stays inside the media frame. Focus outline only for keyboard (`:focus-visible`).
- Alternatives variant: the second price line carries "−$8.92 / +$15.59 vs. this item" (emerald / rose) instead of compare-at pricing, and a footer reads "Matches 4 of 5 specs" with a Compare link.

### Filter Rail & Range Slider

- Browse pages use a faceted **Filter Rail** (280px, card surface, sticky) rather than the lists' "Add filter" dropdown: title with an active-count badge and Clear all; collapsible facet sections with 11px uppercase heads; checkbox options with live counts that **recount as other facets apply** (zero-result options dim to 45%).
- Range Slider: dual handles (18px, primary ring) on a 4px track with a primary fill between them; values above, bounds below; handles can't cross (20-unit gap); filters on release.
- Under 1024px the rail becomes a 340px right drawer behind a "Filters ①" button with a scrim.

### Results Header & Progressive Loading

- Results open with breadcrumb → 22px title → live count ("9 results · 1 filter applied"), stacked in the left column above the rail; the sort select rides beside the sticky search as an icon-led control (⇅ glyph, options "Recommended", "Price Low to High"… — no "Sort by" label). Applied filters render as removable chips with Clear all, shown only when non-empty.
- **Data tables paginate; browse grids load progressively.** Auto-load the next page (12) when the user scrolls near the bottom, with a shimmer skeleton row; keep a persistent "Showing 36 of 74" progress line + bar; **stop auto-loading after three pages and hand off to a "Show N more" button** (keyboard/screen-reader reachable); show back-to-top after the first auto-load; any filter, sort, or search change resets to the first page. Never auto-load before the user has scrolled.

### Compare Tray & Comparison Table

- Comparison is **head-to-head: two products**. The Compare Tray is a floating bottom-center pill collecting selections; its Compare action enables at two. Selection persists to the compare page.
- Comparison Table: pinned 220px label column; product header columns (media, name, mono SKU, Add to cart, remove); rows grouped under Purchase / Product / Specification with 11px uppercase group heads; rows that differ are lightly shaded; a "Show differences only" Switch hides identical rows; rows where every value is "—" never render; objectively comparable rows mark the single clear winner with an emerald **Best** tag (price, delivery, pickup, capacity, noise, cycles, warranty). With one product selected, a dashed "Add another product" column links back to the listing. The header row scrolls with the table (no sticky); under 820px the table scrolls horizontally with the label column pinned.
- Values are normalized before comparing (units "Each", one Brand row, no rows that are identical by construction such as Category).

### Buy Box

- Product page: gallery and buy box split 50/50 (stacking under 1024px); the gallery is a 1:1 main image with a 64px thumbnail strip. Navigation is the breadcrumb alone — no duplicate "Back" link.
- Buy Box order: 22px title → fact rows (mono SKU, linked Category, Brand) → Delivery Options → Quantity Stepper → price block → action row → vendor panel → ratings. **Exactly one primary** (Add to cart); Buy now and Chat with seller are outline; Explore AI alternatives is outline + sparkles; wishlist and Compare are icon buttons.
- **Quantity Stepper:** 40px −/+ with a 48px centered input, bounded (minus disabled at 1), updating a muted line total ("3 × $376.38 = $1,129.14").
- **Delivery Options:** a neutral panel (never a tinted "good" card — it's information), Shipping and Pickup columns with uppercase keys; emerald icon + ETA + bold cost where available, muted where not; pickup copy follows the Context Switcher ("Select a property to check pickup" / "Available · 8 mi" / "Not available at this property").
- Ratings appear as a compact row (stars · summary · "See reviews" outline button) — reviews live on their own page, never inline.
- Product details are a full-width card below both columns with underline tabs (AI Summary · Description · Specifications · Spec Sheets); content fills the card (two-column bullets and spec grid when wide). Alternatives render as a sortable **grid**, not a carousel — a sort control on a rail reorders items you can't see.

### Wishlists

- Wishlists are **property-scoped shared shopping lists** ("shared with everyone assigned to [property]"). The heart icon operates on the current property; with "All properties" active, the flow first asks which property the list belongs to. The Wishlists page names the property in its subtitle — never a separate kicker (the App Bar already shows it).
- **Heart semantics:** a heart on a card or buy box opens the List Picker (never a silent toggle); it fills rose wherever the product is in any list, live across pages. In list context the filled heart means "remove from this list" (tooltip says so). The nav heart opens the Wishlists page.
- **List Picker:** centered 480px modal — property kicker (rose heart + name), title, product subtitle; checkbox rows of lists with live counts, pre-checked for current membership; a dashed "Create a new list" row that expands into a standard input + Add; Save disabled until membership actually changed.
- **Page anatomy:** List Sidebar (name + count, rose active accent, no header block) beside a List Header card — name, **"N products · $total"** (the total is the number purchasers want), rename and delete icon buttons, and the list's one primary, **"Add N to cart"** (count in the label, disabled at zero). Counts are never repeated: the sidebar scans, the header prices, the button acts; a "Showing n of N" appears only while filtered.
- Filter controls appear only when a list has 8+ products; the vendor filter builds from the list's actual contents.
- Create and Rename share one small modal (name field, submit disabled until non-empty, Enter submits). Delete is the destructive confirm with consequence copy that adapts to contents ("removes the empty list" vs "removes the list and its N saved products — for everyone at this property").
- Small wishlist dialogs center in the viewport; only the tall Browse Modal stays top-anchored.

### Order Approvals

- **Approval status enum** on the whose-turn colors, everywhere it appears (table, detail, filters, Home breakdown): Pending = amber (the approver's move), Revision Requested = sky (back with the buyer), Approved = emerald, Rejected = rose. Rendered as the vendor status-dot pill (bordered pill, 8px colored dot, neutral 13px label) — never tinted-text pills. Sort order is lifecycle order: Pending → Revision Requested → Approved → Rejected — and it's the **default sort**, so the actionable queue leads the table (date descending breaks ties).
- **Selectable Metric Cards** reuse the vendor `stat-card-colored` pattern verbatim: 4px left accent bar, 13px title with an inline 16px icon in the accent color, 30px colored count, 13px muted description; clicking filters the table; active = tinted background + accent border. A neutral Total card takes `stat-gray`. Cards recount live under toolbar filters and the property scope, and their numbers must reconcile with Home's Approvals breakdown.
- **Table toolbar:** the vendor filter treatment — active filters as attribute | value | × chips, a dashed "Add filter" nested menu (Vendor · Buyer · Level · Status), a "Date range" button with relative windows, a ghost "Clear all" only while something is active, and the icon search field (matches vendor, buyer, request #, property, and line-item names). All filters compose with the metric cards and the Context Switcher.
- **Expandable Data Table:** the vendor data table plus a leading expander column — + rotates to × and reveals a tinted full-width Items sub-row using the standard line-item anatomy, so item detail never needs its own column. Every column header sorts (double chevron = neutral, single = direction; the sorted header takes primary). Column order is identity-first: Request # · Property · Vendor · Buyer · Amount · Level · Status · Date — the mono Request # leads (it is the row's link), and Status → Date close the row per the vendor Orders convention. The pending row carries the row's one primary action (Review). Level pills carry their thresholds as tooltips (Supervisor: over $2,500 — the same budget threshold that triggers "Sent for approval" at checkout; Master: over $5,000).
- **Approval Stepper** (detail page): four fixed slots — Requested → Under Review → Approved → Order Created. Done = primary fill + check + completion date beneath; active takes a whose-turn ring (amber eye "Under Review · your move"; sky refresh "Buyer revision"); Rejected replaces slot three with a rose × and a rose connector in; future steps stay outlined with their icon. Below 720px the stepper becomes a 2×2 grid without connectors.
- **Decision Panel:** pending requests only, directly under Approval Progress, amber left accent. One comment field serves all three actions; a comment is required to Request revision or Reject (missing comment = rose field ring, no dialog). Exactly one primary (Approve); Request revision is a sky outline, Reject a rose outline. Deciding transitions the page to the resulting state and appends the history event ("Decided by You").
- **Approval history** is append-only: "Every request, response and decision is retained on this approval." Events show title, actor · revision number, amount + timestamp right-aligned, and an optional muted comment block. The line-item snapshot renders **only when items or amount changed** from the previous event — the trail stays auditable without repeating unchanged lines.
- **No repeated facts:** the hero subtitle is the request's identity line — `#id · buyer · amount` — and the rail facts never repeat it (they carry Reason, Property, Approvers as level pills, Decided by). The amber rail callout is titled "Note to buyer" (the status pill already says Revision Requested); "Orders placed" shows the order number only — its amount is the request total. Shipping is not a separate card: Order details ends with totals rows — Items subtotal, Shipping · method, and a bold Request total that closes the math against the hero amount.
- **Callouts:** tinted, bordered notes with a bold first line — amber for the standing revision comment, rose for rejection reasons and unavailable-product warnings, violet for informational legacy notices. Unavailable line items strike through with a rose "No longer available" pill; the live-inventory header pairs a "Refresh inventory" outline button with a muted "Checked X ago" caption.
- **Routing:** detail states address by URL hash (`approval.html#K4PT2N`), matching the vendor Order Detail convention — clean-URL hosting drops query strings, hashes survive.

### Order Tracking

- **One page, four views:** Open, Backordered, Invoiced, and Closed orders are Filter Tabs with count chips over hash states (`orders.html#open…`). Each tab carries its own selectable metric cards and its own columns — the table changes shape with the tab, the chrome doesn't.
- **Numbers reconcile with Home:** Open's cards are Home's lifecycle split (Total Open 62 = To Fulfill 36 · To Ship 11 · Shipped 7 · Delivered 8 — never a "Total" and a "Pending" showing the same number twice); Invoiced mirrors Home's invoice pipeline (16 = Awaiting Validation 11 · Validated 4 · Buyer Paid 1 · Captured 0); Closed = Completed 27 + Canceled 1. Card colors follow whose-turn: amber = the buyer's move (To Fulfill is the vendor's amber on Home's vocabulary; Awaiting Validation is the buyer's), violet = paid/promised, emerald = done, rose = canceled.
- **Delivery validation is not gated by fulfillment** (product update): the buyer can start validating as soon as items arrive, so **every open row carries Validate** — and saving a validation creates the fulfillment on the vendor side. **Partial states are the normal case:** an order mid-validation shows a sky "Partially Delivered · *n*/*m*" pill (validated items over ordered), while staying in its lifecycle bucket. Validated lines are immutable — Raise Claim is the only path after validation. The pipeline order is delivery validation → invoice submission → invoice validation. Each buyer attestation closes the door on disputing what it attested: delivery validation freezes receipts (claims only), invoice validation closes the claim window itself.
- **Attention rows:** a row with arrived-but-unvalidated items takes an amber-soft row fill and a warning triangle beside the order number — whose-turn amber applied to table rows. Validate is the row's one primary.
- **Property scope vs. property filter:** the Context Switcher stays the one *scope* control (the reference's standalone property dropdown is still dropped) — but under "All properties" the toolbar's nested **Add filter** menu (the vendor pattern: root list → submenu with a back row) offers Vendor and Property facets, narrowing the table without changing global context. When a specific property is active the facet hides (it would be moot). Order status and fulfillment are deliberately not facets: the selectable metric cards are those filters. Search matches vendor, order #, property, and item names.
- **Tables paginate** (grids load progressively): a Pager footer inside the table card — "Showing 1–10 of N orders", Previous/Next outline buttons disabled at the ends; filters and card clicks reset to page one.
- **Row overflow menu:** rows whose actions are secondary (closed, validated) carry a 32px “⋯” icon button opening a right-anchored popover of icon + label actions; one open at a time, outside click closes.
- **Backordered empty state is contextual** — it names what would land there ("Items a vendor can't fulfill right away…"), never generic "No orders yet" copy; no redundant zero-count banner above an empty state.
- Column hygiene follows Approvals: identity-first order (Order # leads with the attention marker), **every column sorts** (text ascends on first click; Order #, Total, and Date descend; fulfillment and payment sort in lifecycle order), items fold into the expander (“Order Items” block), vendor names without @handles, status pills on the dot-pill anatomy.

### Shared Rail Primitives & the Porting Rule

These primitives appear in both apps and must render identically. This table is the canonical spec — when porting a component between apps, **copy the source CSS verbatim and diff against this table**; never rebuild from memory (three drift incidents — avatar shape, doc-row surface, feed rhythm — came from remembered ports).

| Primitive | Canonical spec |
|---|---|
| **Avatar (rail/table)** | Circular (`border-radius: 50%`), white 600-weight initials on a solid tint (emerald = people, violet = properties); 22px in rail values (9px text), 28px in table cells (10–11px text). Rounded-square tiles are for *vendors/entities* (`v-avatar` in tables), never people in rails. |
| **Rail Row** | Grid: muted label column (92–120px) / left-aligned 13px value; 12px vertical padding; 1px divider between rows; avatar + text vertically centered; copy actions as ghost row-actions; secondary values (e.g. "Same as shipping") muted. |
| **Row Action** | Borderless ghost icon button: 32px, `radius-md`, muted-foreground icon (16px), hover = muted fill + foreground. 26px/14px compact inside rail values. Never a bordered square. |
| **Doc Row** | Tinted rounded block (`radius-md`, 12px 14px padding), 10px between rows — never divided plain rows. 18px doc icon + 13px/600 name + 12px muted date · type + ghost download action. Tints: sky = purchase order, emerald = invoice, violet = receipt of goods; a locked state adds a divided muted note inside the block. |
| **Activity Feed** | Rows: 12px gap, 10px vertical padding, 1px divider between; 8px emerald dot at 5px top offset; 13px/600 title, 12px muted sub-line and right-aligned time. Buyer adds the "Show N more activities" collapse (sky text action). |
| **Card / Panel head** | Title 16px/600 (17px/700 for main-column page cards); 16px title-to-content rhythm in rails (buyer: `.det-side .det-card-head` margin). Divided heads (`hd`) for main-column content cards. |

### Buyer Order Detail

- **One stateful page** (`order-detail.html#<order>`) with the hero identity line ("Order #657" + copy button; subtitle Placed · vendor · total) and exactly **one status pill** — alone on the Order Progress card head, never duplicated in a second header (no decorative refresh chrome).
- **Lifecycle Stepper (buyer):** eight fixed slots — Seen · Fulfillment · Delivery · Delivery Validation · Invoice Submission · Invoice Validation · Awaiting Payment · Completion — captioned VENDOR / YOU (sky). Labels never change with state; done = check + completion date, the next actionable step takes the whose-turn ring (amber "your move" / sky "in progress"), future stays outlined. The slot order encodes the pipeline: delivery validation before invoice submission.
- **The Delivery Validation Next-Task Strip renders in every state** — validation is not gated on fulfillment. Summary items express state **once**: the item pill absorbs the count ("Partially Delivered · *n*/*m*", table convention; plain "Delivered" when complete) — never a pill plus a confirmed chip plus a received line for one fact. "Report a problem" right-aligns under the line total where row actions live; quantities read "× 1" everywhere.
- **Fulfillment cards** use a divided header and show progress only while it exists: in-flight fulfillments carry the compact Fulfilled → Shipped → Delivered mini-stepper (read-only — the vendor and carrier advance it; **the buyer's only delivery-recording act is validation**, which marks items delivered as part of the save; a buyer-side "Mark as delivered" would create delivered-but-unvalidated state with no count and no audit trail); a delivered fulfillment shows a single emerald Delivered pill — three filled dots say nothing the pill doesn't. Item rows inside fulfillment cards are plain (name, SKU, ×qty) — the Summary owns per-item state. Unfulfilled Items get their own card with paired "Requires shipping" / "Awaiting fulfillment" pills; no fulfillments yet = the empty-state anatomy inside the card.
- **Rail matches the vendor app's rail anatomy:** "Fulfilled by" card (warehouse name, vendor as a link); Customer as **rail rows** — 92px muted label / left-aligned 13px value grid with dividers, small circular avatars (50%, white text) on people and property rows, copy row-actions on contact and shipping, Billing muted "Same as shipping", the address written once; Documents as an always-open panel of **doc rows** — sky-soft tinted rounded blocks (sky doc icon, name, date · type, borderless ghost download action), 10px apart, with emerald (invoice) and violet (receipt-of-goods) variants — never a collapsed disclosure; **Activity** as the vendor feed — divided rows, emerald dots — strictly newest-first with a "Show N more activities" collapse.
- **Delivery Validation is a Modal, not a page mode** (Modal-over-takeover): Start opens it from the Next-Task Strip; the detail page beneath stays read-only truth. Rows are selectable line items — checkbox, thumb, name/SKU, "Received *n* of *m*". Checking a single-quantity item confirms it directly (Save Delivery Validation is the one commit — never a nested per-item confirm popup); a multi-quantity item reveals an inline Quantity Stepper capped at the outstanding count. Validated lines are immutable: locked rows with the emerald "*n* confirmed" chip, and Raise Claim (neutral outline, amber warning icon — an exception, not a destructive act) is the only path, via a reason modal. Save is disabled until something new is confirmed.
- **Saving applies the model live:** a fulfillment is created (or completed) on the vendor side and the items marked shipped + delivered; the status pill becomes Delivered or Partially Delivered · *n*/*m*, the Lifecycle Stepper advances (all received = Delivery + Delivery Validation done, Invoice Submission goes "in progress"), and the Activity logs the audit entry — "Delivery validated by Alicia Grant · *n* items confirmed". When everything is received, the strip drops Start and offers only Raise Claim. The tracking table's Validate deep-links into the open modal (`#408/validate`).
- **Claims are structured, per-item reports** — never a bare reason box. The claim modal: amber guidance callout, item rows with a checkbox and an "Up to *n* available for this issue type" cap (ordered minus already claimed; capped-out rows disable). Checking expands the form: capped Quantity stepper, "What happened?" Select (Missing item or quantity · Damaged item · Wrong item · Other difference, defaulted to the first), and the **Resolution Toggle** — a two-choice pair that fills when chosen: "I still want this item" (emerald) vs "Cancel this item" (rose; cancellation is the destructive path). Send is disabled until every checked item carries quantity + issue + resolution; the note is optional; the dismiss action reads "Not now".
- **Claims live where they're discovered:** every row in the Delivery Validation modal carries a "Report a problem" link that flips the row into the claim form inline — and its checkbox fills **rose with an ×** (received = navy check, problem = rose ×; the two selections read at a glance) — one Save commits receipts *and* claims together (a Save with incomplete problem reports stays disabled). Claims are also raisable **at any point inside the claim window** — every Summary line with unclaimed quantity offers its own "Report a problem" link opening the claim modal pre-selected. **The claim window closes with the buyer's own attestation, never the vendor's action:** claims open at order placement, survive delivery validation *and* invoice submission (the vendor uploading a document must not end the buyer's rights — damage is often discovered after the invoice arrives), and close when the buyer validates the invoice — approving an invoice and claiming its units shouldn't be billed are contradictory acts. An open claim holds the invoice, so claims must resolve before invoice validation; discovering a problem *during* invoice review is a first-class entry, not an edge case. After invoice validation a problem is a **return or warranty** issue — a different, vendor-mediated flow with no billing hold (a named gap, not yet designed) — so invoice-validated, paid, and closed orders show no "Report a problem" links and their row menus drop "Report an issue". The Next-Task Strip carries only its one task — never a second claim button duplicating the item-level entries — and **narrates every progression stage task-first: whose move it is and why** (mirroring the vendor's "Waiting on Buyer · …" strips). Pre-delivery it reads "Waiting on Vendor · Fulfillment / Delivery" with a muted icon and a *ghost* Start Delivery Validation (validation stays available at any point, but the primary treatment is reserved for your actual move); items arrived → "Delivery Validation · Your items have arrived — record what you received to generate the Receipt of Goods" (primary); mid-validation → "*n* of *m* items validated — record the rest as they arrive"; Cancellation Pending → "Waiting on Vendor · Cancellation" with no button; then the invoice stages (Validate Invoice → Awaiting Payment) continue the same pattern. **Write a Review appears only in resting states with no primary task** — the Invoice Submission stage (awaiting or disputed invoice, the natural "how was it?" moment right after delivery is confirmed) and, later, Completion; a task-carrying strip (Validate Invoice, Start Delivery Validation) offers its task alone. The verb is "Report a problem" everywhere — "Raise a claim" survives only as the modal's formal title. **Claims are two-sided — the buyer requests, the vendor decides:** the buyer's Resolution Toggle (keep = emerald / cancel = rose) travels to the vendor as a request chip in the same colors ("Buyer: I still want this item" / "Buyer: Cancel this item"), and the vendor's **Claim Resolution Panel** answers per line with two option cards — *Send replacement* (restores the missing unit, reserves it, adds a new line to ship; sky ring when chosen) vs *Cancel affected quantity* (back to stock, off the invoice; rose ring — the destructive path) — pre-selected to the buyer's request, with an optional note and one "Resolve claim" commit that releases the invoice. The vendor's task strip carries the claim as its one task ("Action Required · Resolve Claim") — a claim never blocks the buyer's delivery validation, only the invoice. **Resolution flows back to the buyer, and the Summary is rewritten to the new truth:** the rose rail callout turns emerald — "Claim resolved · The vendor resolved every affected line · the invoice is released" — with a per-line outcome under each issue: *Replacement on the way* (kept lines) or rose *Canceled — removed from the invoice*. In the Summary, a canceled line is **struck through** (name, SKU, and prices) with a rose *Canceled* pill and drops out of the totals — the struck line *is* the adjustment, so no separate correction row; and a replacement arrives as its **own new line** (sky note "Replacement · sent by the vendor after your claim", its own fulfillment card, its own mini-lifecycle), with the original line's quantity reduced accordingly so unit counts and money stay honest. A pending replacement re-opens the buyer's task: the strip returns to Start Delivery Validation (the replacement gets validated like any delivery — the validation modal simply omits canceled lines), and the tracking row reads sky "Partially Delivered · *n*/*m*" again; the rose Claim Open overlay clears on resolution.
- **Awaiting Payment is a buyer task, then a resting state:** once the invoice is validated the strip reads "Awaiting Payment · The invoice is validated — confirm once accounting has released $… to the vendor" with a **Confirm Payment** primary (card icon). It opens the **Payment Packet modal**: a document tab-bar (Purchase Order · Invoice · Receipt of Goods) over a rendered PDF preview, with per-document *Download PDF* and *Download all (3)* — the buyer assembles what accounting needs before confirming; the footer restates the stake ("$… · Invoice #…") beside Cancel / Confirm Payment. Confirming advances the stepper to Completion (vendor's move) and the strip becomes the resting "Waiting on Vendor · Completion" with a violet **Payment confirmed** pill and Write a Review. The Payment card's Notice narrates the same stages, and **Paid Total goes real** on confirmation — the $0.00 that sat visible all along becomes the invoiced amount. Invoice numbers are per-order data, never a shared constant.
- **Completion closes the loop:** once the vendor captures, the buyer's order reads emerald **Completed** end to end — all 8 steps done with dates, the strip resting at "Order Complete · Payment captured by the vendor — this order is closed. Documents stay available for your records" with Write a Review as the one action, Paid Total equal to the invoiced Total, the Payment Notice stating the captured amount, and every task affordance gone (no validation, no claims — the window closed at invoice validation). The demo closed order is **#515 on both apps** — the vendor's demo order seen from the buyer's lens, same items, same 8% tax, same $253.03 — one order, two lenses, one truth.
- **Claim status lives in the rail, not the strip:** an open claim renders as a rose rail callout (the approval-detail decision-callout pattern) — "Claim under review", "Vendor responding · the invoice remains on hold", then structured claim lines — a mono "*n*×" badge, the item name in foreground (rose is the frame, not the body text), and the issue as a small sub-line ("· cancellation requested" appended where chosen), divided by faint rose rules. The Next-Task Strip stays a pure task strip (one title, one line, its actions) in every state. Canceled lines show a rose "Cancellation requested · *n* units" note; fully-claimed lines lose their report link (cap reached). On the tracking table an open claim is an overlay pill like Cancellation Pending — rose "Claim Open" riding whatever stage the order is in. The audit trail logs "Claim raised by Alicia Grant · *qty*× *item* — *issue*".
- Payment card: neutral Notice callout ("Payments are processed after order delivery has been validated") + total. Paid Total stays visible at $0.00 — the buyer should see what has not left their account yet.
- **Invoice Validation — the Document Review Split View:** when the buyer's task is *comparing a document against data*, a full-screen takeover with the PDF on the left and the verification panel on the right is the correct surface — the one sanctioned exception to Modal-over-takeover, which still governs every form-like flow (the takeover's own Dispute confirm is a centered dialog above it). The right panel verifies in three blocks: **SKUs and quantities** (per-line confirm checkbox, item, SKU, ROG Qty vs the sky-highlighted "Invoice Qty · Extracted by Scout AI" column), **Invoice amounts** (Subtotal / Sales tax / Grand total, each Order/ROG vs Invoice with a Variance column; Shipping shown uncheckable — included in total), and a collapsed **Map the line items myself** disclosure (invoice line → ROG item selects, exact SKU matches pre-selected, Preview mapping). Validate Invoice stays disabled until *every* required value is confirmed — the extracted values are AI output and the buyer attests to each one (the mirror of the vendor's two acceptance confirmations). **Variance is confronted, not hidden:** when the extracted amount differs from the buyer's records, the Variance cell turns rose and an amber warning sits under the row label — "The extracted amount doesn't match your records — confirm only if you reviewed the PDF and accept the difference; otherwise dispute" — and a unit the invoice bills that the claim canceled appears as its own SKU row (ROG "—" vs Invoice qty, amber note). Checking a mismatched row is an explicit attestation; Validate stays available for accepted differences, Dispute is the refusal path — and **accepting a variance adopts the billed amounts**: the totals gain an amber "Invoice variance · accepted at validation +$…" row, the tax and Total become the accepted figures, and the audit entry records the accepted variance (totals never lie, even about a difference the buyer chose to accept). The split view also honors the claim-window rule in place: a quiet "Report a problem" link under the SKU table (goods-level exception — distinct from Dispute, the document-level refusal) closes the review and opens the claim modal; an open claim then holds the invoice. Disputes carry an **optional note to the vendor** ("What should the vendor correct?"), logged in the audit trail and delivered with the dispute. **Dispute** asks for confirmation ("the vendor will be asked to correct and resubmit … validation stays blocked until the replacement is reviewed"), then removes the invoice, steps the order back to Invoice Submission, and marks the Documents note "Invoice disputed". **On the vendor side a dispute is a first-class state** (`#disputed`): rose "Invoice Disputed" header pill, the task strip reads "Action Required · Correct & Resubmit Invoice" with the buyer's reason, the Documents rail carries a rose disputed note with a "Validation blocked" chip, and Upload Corrected Invoice re-enters the normal upload → AI review → accept pipeline.
- **Validating or disputing never leaves the order:** both outcomes land back on the same Order Detail — the single 8-slot stepper advances (Invoice Validation done → Awaiting Payment, your move) or steps back (Invoice Submission, vendor's move) — never a second "payment progress" page with its own vocabulary. The strip narrates each state and always leads with the pending task, never the previous accomplishment: invoice received → "Invoice Validation · The vendor's invoice is ready — compare it with your Receipt of Goods to release payment" with a **Validate Invoice** primary (which appears only now — the claim-window rule's counterpart); validated → "Invoice Validated · The invoice is on the books" with a violet Payment processing pill; disputed → rose "Invoice disputed · awaiting correction". Validation closes the claim window (item report links disappear) and puts the invoice's sales tax into the totals ("Sales tax · Invoice #…") so the Total becomes the invoiced amount — totals never lie.
- **Post-validation (Invoice Submission) state:** saving a full validation advances the order in one atomic move — status pill becomes emerald **Delivery Validated**, the stepper marks Delivery Validation done (labels never change; the date fills in) with Invoice Submission (VENDOR) next in sky "in progress", and a violet **Receipt of Goods** doc-row is appended to Documents (the validation *is* the ROG — the document is generated, never uploaded). The Next-Task Strip flips to a confirmation strip: emerald flag, "Delivery Confirmed · You have confirmed receipt of all items", a sky "Awaiting vendor invoice" pill (the ball is in the vendor's court — whose-turn color, not a button), and Write a Review as the one buyer action left. **No Validate Invoice button appears until an invoice document exists** — a primary action that cannot be performed is a lie; the Documents card carries the same truth as a quiet clock note ("Awaiting vendor invoice · The vendor has not uploaded an invoice yet"). Raise Claim needs no strip button — the item-level "Report a problem" links remain the entry. **Claims count toward completion:** the state advances when received + claimed ≥ ordered — claim-canceled units never strand an order in validation; the strip then reads "All items are received or covered by a claim" and the rose claim callout stays in the rail (delivery resolved, claim a parallel exception). The save also logs "Receipt of Goods generated" in the audit trail, and the ROG is dated by the validation, not the order. On the tracking table a validated order shows an emerald **Delivery Validated** pill with no attention tint and no Validate action (overflow menu instead), ranking past Delivered in fulfillment sort while staying in the Open tab's Delivered bucket until the invoice arrives — and once the invoice arrives the row turns actionable again: amber attention tint, an "Invoice received — awaiting your validation" tooltip, and the **Validate** primary deep-linking into the split view (the label stays "Validate" everywhere — the destination, not the button, changes with the stage). The Invoiced tab's awaiting-validation rows deep-link the same way — the Validate button always opens the validation the stage actually calls for (delivery modal pre-validation, invoice split view after).

### Cart & Checkout

- **The cart is live and property-scoped** (localStorage, like Wishlists): every "Add to cart" — buy box, product cards, compare, a wishlist's "Add N to cart" — writes the same store, and the App Bar cart icon carries a rose count badge that updates everywhere. With "All properties" active, adds default to the buyer's primary property.
- **Carts group by vendor:** a Vendor Group card per vendor (logo + name + quantity count, vendor total in a pill), item rows with thumb, name, unit price as "$… / each" (states its role instead of duplicating the line total at qty 1), Quantity Stepper, rose remove icon, right-aligned line total, and a per-item "GL Code & Unit" disclosure (tinted panel: GL Code select + optional Unit field). Request Quote is a compact **outline** button in the group header beside the vendor total — the rail's Proceed to Checkout is the page's one primary — and the group has no footer subtotal (the header pill and the rail already price it).
- **Order Summary rail** is one shared component across cart and checkout: vendor breakdown rows **only when 2+ vendors** (a single-vendor cart goes straight to Subtotal — one number is never broken down into itself), Subtotal, a Shipping line whose value narrates state ("Calculated at checkout" → "Calculated after address" → "Select a shipping option" → the price), Tax "Handled by vendor", bold grand total, one primary CTA, then the Delivering-to card (follows the Context Switcher) and the Secure Checkout bar. The coupon field lives in this rail during checkout only.
- **Checkout is one page with hash states** (`#address → #shipping → #review → #placed`) under a translucent on-hero **Step Band**: numbered circles with title + subtitle; active = white fill, done = check and clickable to go back, and connectors fill white as steps complete; the band stretches the full content width. Full-width CTAs center their labels (`.btn-block`); card-title icons are the standard 36px icon tiles and people use the standard avatar — never one-off chrome. Totals never lie: the request math (subtotal + shipping) resolves line by line as choices are made.
- **Option Rows** select shipping and payment: name + muted description, trailing price (emerald "Free"), radio that fills primary with a check; selected row takes the primary ring. **Icon tiles only where they differentiate** (payment methods) — shipping speeds drop them and carry the delivery promise instead: every option shows both duration and arrival date ("2 Business Days / Arrives Wed, Aug 26"), pickup folds into the same "Shipping & Pickup" list (Free, "Ready today · distance"), ordered fastest to cheapest. Disabled options dim with a neutral "Coming Soon" chip; on the Review step each vendor card collapses to its selections only — unselected shipping and payment options, the Shipping → Payment → Ready progress chips, and the section checkmarks are all hidden — progress affordances belong to the step where progress is being made, so the step visibly changes from choosing to confirming. Each card instead carries a small Edit link back to the options (and the Buyer details rail card carries one back to the Address step), its item disclosure opens by default (review is the last look at what's being bought), and the rail slims to vendor name + check + total per vendor (2+ vendors only) above the closing math — the cards carry the detail, the rail closes the number. Checkout's main-column cards use a divided header (icon + title, rule, content) with muted inner boxes — never a border inside a border. Group titles earn an emerald check once satisfied; pickup sits under an uppercase sub-heading.
- **Combo Box:** when a select's options are too many to scan (GL codes, property units), the popover leads with a search field that filters across code, label, and sub-label. Rows carry an optional mono code chip and an optional muted second line; picking writes the value back to the select-style trigger. Plain Selects stay for short lists.
- **Per-vendor readiness:** each vendor card tracks Shipping → Payment → Ready as numbered dots turning emerald checks. Nothing is pre-selected — both choices are the buyer's to make; Review is gated on every vendor Ready (shipping and payment both chosen) and the primary counts the orders ("Place 2 Orders – $…").
- **Empty State:** muted icon circle, bold title, one-line description naming the current property, a single primary action. Placing an order clears the cart — the badge drops to zero, never stale.
- **Confirmation is a receipt, not just a checkmark:** the hero band stays as a bare color backdrop — no icon or page title — with the emerald check circle straddling its bottom edge exactly 50/50. Then the title, and an identity line beneath it (property · "Confirmation sent to …"). An **Orders placed card** lists one row per vendor order — mono order number, vendor, items · shipping method, order total — closing with a grand total (order numbers are sequential and persisted). When the total exceeds the property's budget, an amber "Sent for approval" callout links to Order Approvals — the purchase flow hands off to the approvals flow. Then "What happens next?" and exactly two actions: Track your orders (primary) and Continue Shopping. Placing clears the cart and the checkout inherits the cart's property (never silently switching to another one).

### AI Block

- AI-generated content sits in a tinted block: accent fill, blue-200 border (blue-600 in dark), radius-lg; header of a 26px primary icon tile with sparkles + 14px/600 primary title ("Scout AI Summary"); 14px bullets with primary markers (two columns when the block is wider than ~720px); a 12px muted provenance footnote ("Generated from… verify critical specs before ordering"). Section bands announcing AI content (e.g. "AI-powered alternatives") use the same tint with a 40px icon tile.

### Radio Cards

- For choosing one of 2–4 **modes inside a task-flow Modal** (tax by rate / amount / none): full-width cards with a native radio, 14px/600 title, muted one-line description. Selected card gets the primary border + accent fill.
- The chosen mode drives the form below it (labels, placeholders, visibility) and its live calculation. Use a Select instead when options exceed four or need no descriptions.

### File Drop

- Upload zone for task-flow Modals: dashed 1.5px border, centered 40px primary icon circle, 14px/600 prompt ("Drop invoice PDF"), muted constraints line naming the accepted type and size limit. Hover shows the primary border + accent fill.
- Selected state: border goes solid emerald with emerald-soft fill, the icon circle becomes an emerald check, and the text lines show filename and size. One file per zone; re-selection replaces.
- The Modal's primary action follows the disabled-until-valid rule — it stays disabled until every required field *and* the file are present.

### Toast

- Confirmation feedback after a mutation lands (order completed, record saved): fixed bottom-right, slides up over 250ms, auto-dismisses after 4s, one at a time.
- Anatomy: 32px tonal icon circle (emerald check for success) + 14px/600 title naming the object and what happened + muted detail line carrying the numbers that changed ("$253.03 USD captured · all 8 steps done").
- Toasts confirm; they never ask. Anything needing a decision is a Modal, and anything needing durable visibility belongs on the page (Next-Task Strip, badges), not in a toast.

### Detail Page Layout

- Two-column: main content + 360px rail (documents, parties, activity), 16px gap, stacking to one column under 1100px. Header and progress panels span full width above the split.
- Rail fact lists use label/value rows (120px label column); parties link to their detail pages; addresses carry a copy action.

### Empty State

- Shown inside the table/list container when zero items match: 48px muted icon circle + 15px/600 title + 13px muted description (max 360px) + optional recovery action (outline button, e.g. "Clear filters").
- Filtered-empty states always offer the recovery action; true-empty states (no data yet) offer the primary creation action instead.

### Activity Feed

- Bordered rows (`--radius-md`, 12px 16px padding, accent hover): 36px icon tile + 14px/600 title + 13px muted description + relative timestamp right.
- Icon tile is muted by default; accent-soft (e.g. sky) for highlighted event types like new orders.
- Timestamps follow the relative-time formatting rule ("1h ago", "Yesterday").

### Marketing Card

- Card for promotions and campaigns. 4px **top** accent bar maps to publishing status (Active = emerald, Scheduled = orange, Draft = gray, Ended = rose) — never decorative colors. Every lifecycle state a campaign can reach (Draft → Scheduled → Active → Ended) has a distinct accent + status dot.
- 44px soft-accent icon tile carries entity identity (violet/sky/emerald rotate per entity); kebab top-right.
- Promotion variant: monospace code + small copy button, offer line, then status badge + neutral attribute badges.
- Campaign variant: name + optional muted description, status badge row, then neutral badges for limits and offers.
- **Budget labels:** a campaign's budget always appears as a neutral badge naming type + unit — "Usage budget · 1,000 uses", "Spend budget · $10,000.00 USD", "Usage budget · No limit". Never a bare number: "1,000 uses" alone doesn't say whether the cap is uses or dollars.
- Usage on active items: show a Progress bar labeled in the budget's own unit — "**347** of 1,000 uses" for usage budgets, "**$6,750.00** of $10,000.00 spent" for spend budgets — only when a limit exists. Uncapped items (promotions) show a plain count label ("**213** redemptions") — never a progress bar without a denominator. Ended items keep their final progress.
- Dates are framed by state — Scheduled: "Starts MM/DD/YYYY"; Active: "Ends MM/DD/YYYY"; Ended: "Ended MM/DD/YYYY"; Draft: none. The full range lives in the badge's `title` tooltip.

### Segmented Toggle

- Compact toggle for mutually exclusive views. `--muted` container, 1px border, `--radius-md`, 2px padding. Two variants: icon-only (32×30px segments — list/grid switching) and text (12px/600 labels with 10px horizontal padding — time windows like 7D/30D/90D).
- Segments: 32×30px, icon-only with a `title`/`aria-label`. Active segment lifts to `--background` with `--primary` icon and xs shadow.
- Use for view switching only — filters belong in the Tab Bar, on/off settings in a switch.
- **View parity:** when a page offers list and grid views of the same data, both views present the same fields — the card is the table row in card form, not a different design. Cards add at most a description line and an icon tile on top of the table's columns. Tabs, filters, search, and sorting apply identically to both views.

### Cards

- Background: `--card`. Border: `1px solid var(--border)`. Radius: `--radius-lg`.
- Padding: 20–24px. Use consistent padding within a card grid.

### Table

- Header: `--muted` background, uppercase 11px labels.
- Sortable columns: header shows stacked 12px chevrons (muted); the active column turns `--primary` with a single directional chevron (same stroke family as the neutral pair — never a stemmed arrow). Click toggles asc/desc; text and dates default to asc-first except dates and numeric ratings, which default desc-first.
- Default ordering: work-queue tables sort attention-needed items first (e.g. "Needs reply"), then newest.
- Long-text cells (reviews, descriptions): truncate with ellipsis at a fixed max-width (~280px); the full text is available via `title` tooltip. Never let free text wrap or stretch the table.
- **Enum columns are badges:** columns with a small fixed set of values (Type, Role, Category) render each value as a neutral badge — never bare text. Entity references (names, organizations), free text, numbers, and dates stay plain; Status keeps the status-dot badge.
- Rows: `--accent` on hover, `4px solid var(--primary)` left border on selected.
- Bulk selection: leading 40px checkbox column; header checkbox selects all rows. For card lists, use the bulk selection bar instead: "Select page (N items)" checkbox left, "Select all N items" outline button right.
- Row actions: trailing 48px column with a 32px ghost kebab button (ellipsis icon); menu opens on click.
- Pagination placement: full pagination bar (page info + rows-per-page + 4 buttons) below tables; compact pagination (page info + prev/next) top-right of the toolbar for card lists.
- **Condensing wide tables:** secondary attributes fold into the primary cell as a muted meta line (variants under the product name, SKU under an item name) before earning their own column. Tables with 6+ columns define a column-priority order and hide low-priority columns at narrow widths (via media queries) — horizontal scroll is the last resort, never the plan.
- Pagination is live, not decorative: when a dataset exceeds the page size, the buttons and rows-per-page select work, the page resets to 1 whenever filters/search/sort change, and the same page slice drives both list and grid views.

### Tabs

- Three variants: navigation tabs, tabs with count badges, filter tabs (wrapping).
- Active state: `--primary` background with `--primary-foreground` text.
- Use for both page navigation and content filtering.
- **One dimension per tab bar:** status tabs model exactly one axis (e.g. fulfillment stage). Secondary dimensions (payment state, offer type) are filters, not tabs; partial variants fold into their stage; exceptions (returns) are row badges, not tabs.
- **Multi-actor pipelines condense to whose-turn-is-it states:** exactly one amber "your action" state; consecutive other-party steps group into one state (sub-step in the tooltip); same-outcome-different-actor variants collapse into one state with the actor as provenance; automatic events are transitions, never statuses. Example — the 10-step purchase-order pipeline reads as Needs Tax & Invoice → Invoice Validation → Invoice Posted → Paid → Captured.

### Stat Cards

- Two variants: neutral (icon + metric + label + CTA) and color-coded (4px **left** accent bar on a standard `--border` border + tinted count). Never color the full border — the accent bar carries the status color, same accent-bar language as inventory item cards and toasts. The 13px title leads with a 16px icon in the accent color, using the **same glyph as the card's tab** — mirroring the Metric Tile's icon-led header.
- Neutral cards use accent-soft backgrounds for icon containers.
- Color-coded cards map 1:1 to row statuses or workflow stages — same names and colors as the status dots, and the stage counts sum to the total.
- On lifecycle pages the cards are **tab shortcuts**: hover lifts with a small shadow; the card whose tab is active gets its accent color as border + soft background tint.
- **Metric Tile vs. Stat Card:** Metric Tiles (solid color, white text) are for performance aggregates — revenue, spend, top account. Stat Cards (outlined, tinted count) are for countable status breakdowns that mirror tabs. Never use solid tiles for a status breakdown or outlined cards for a KPI.

### Dashboards & Deltas

- **Deltas are always directional:** ▲ + emerald for positive, ▼ + rose for negative — the arrow matches the sign, and a negative number never sits on a neutral or positive-looking surface. Growth Metric Tiles take their background from the sign (emerald / rose).
- **One time scope per page:** analytics pages carry a single header-level time toggle (7D / 30D / 90D) that drives every chart, metric, chip, and date range on the page. Per-card time toggles are forbidden — two cards must never disagree about the period.
- **Action before status:** dashboard top cards separate "needs your action" (dominant cards with CTAs) from passive pipeline status (compact cards, no CTA). A CTA on a card asserts the user should act — completed or third-party states never get one.
- Charts state their own conclusion: a summary line in the chart header ("**7** orders this period · ▼ 36.4% vs prior") so the reader gets the answer without decoding bars.

### Modal

- Backdrop: `rgba(0,0,0,0.5)` with `backdrop-filter: blur(4px)`.
- Max width: 480px for confirmations; up to 640px for task-flow forms (esc chip + X in the header, form rows in the body, pinned footer). Radius: `--radius-lg`. Shadow: `--shadow-lg`.
- Footer buttons align right, with secondary action first (left) and primary action last (right).

### Drawer

- Right-side panel: 420px, `--card` surface, 1px left border, dim overlay, slides in with a 0.2s ease transform. Closes on X, esc, or overlay click.
- Anatomy: header (title + status pills + close), scrolling body of fact rows, footer with a primary "open full page" action plus at most one contextual action.
- **Modal vs. Drawer:** a **Modal** is for committing a short transaction — complete-or-cancel task flows (fulfill, mark shipped, tax input) where everything needed lives inside the form. A **Drawer** is for *inspecting without navigating* — peeking at a row from a list while keeping your place — or editing while referencing the page behind it. Never use both patterns for the same job; full-screen takeovers are not used.

### Toast

- Left accent bar (4px wide) indicates type: default, success, warning, error, info.
- Shadow: `--shadow-xl` for float-above-content feel.

### Status Dots

- Badge treatment: 8px circle + 13px label inside a pill — 1px `--border`, `--radius-pill`, `3px 10px` padding, `--background` fill.
- Colors: emerald (active/validated/delivered), amber (pending/partially fulfilled), muted-foreground (inactive/placed), red (error/not fulfilled), sky (info), orange (warning/payment pending).
- Order lifecycle mapping is documented in the Components tab under Status Dots → Order Lifecycle. Publishing lifecycle (Draft = gray, Scheduled = orange, Active = green) under Status Dots → Publishing Lifecycle — every status shows a dot, including Draft.

### Skeletons

- Base: `--muted` background with a shimmer sweep (1.6s ease-in-out loop). Shimmer is a translucent white gradient — `rgba(255,255,255,0.6)` light, `rgba(255,255,255,0.08)` dark.
- Mirror the real content's layout: same dimensions, radius, and grid position as the component being loaded. Never a generic spinner for content areas.
- Radius follows the element being mimicked: `--radius-xs` for text lines, `--radius-sm` for titles, 50% for avatars, `--radius-pill` for badges, component radius for cards/buttons.
- Show 3–5 skeleton rows for tables, never the full page count. Keep header rows real — only body content shimmers.
- Respect `prefers-reduced-motion`: the shimmer animation is disabled, leaving the static muted shape.
- Use skeletons for initial loads; use inline spinners only for user-triggered actions (button submit, refresh).

## Patterns

### Sidebar

- Width: 240px. Background: `--surface-dark` (dark blue). Text: `--surface-dark-foreground`.
- Items: 40px height, `--radius-md`, 12px gap between icon and label.
- Active item: lighter blue background (`rgba(255,255,255,0.1)`).
- Notification badges: `--rose` background, white text, pill shape.

### Search

- Full-width with search icon (left-positioned). Pill border-radius.
- Height: 44px. Transition on focus: border color shifts to `--ring`.

### Breadcrumbs

- On detail (drill-in) pages, the breadcrumb replaces the topbar title: muted parent link(s) → bold current entity.
- Separator: `/` character in `--muted-foreground`.
- Links use `--muted-foreground` with hover to `--foreground`.
- Current page (last item): `--foreground`, `font-weight: 600`.

### Toolbar

- Horizontal flex bar with `justify-content: space-between`.
- Left group: filter buttons. Right group: search + view controls.
- Button height: 36px. Uses outline style with icon + text.
- Icons: Lucide — calendar (date range), credit-card (payment), sliders-horizontal (view), refresh-cw (refresh).
- Filter bar: applied filters render as segmented chips — attribute segment (muted text), value segment (500 weight), and a × remove segment, divided by 1px borders inside one `--radius-md` pill-less container.
- "Add filter" trigger: toolbar button with a **dashed** border, muted text, leading filter icon and trailing chevron-down. Opens the standard dropdown menu; selected option uses accent background + check (never a leading dot).
- "Clear all": ghost text button, visible only while at least one filter is applied.

### Page Header

- Colored icon container (40px, accent-soft background) + title (22px, weight 600) + subtitle (14px, muted).
- The page header icon is always the **same glyph as the page's sidebar item** — only the treatment differs (accent-soft container + accent stroke vs. the sidebar's white stroke).
- Accents group related areas — they are not unique per page. Current mapping:

| Accent | Pages |
|---|---|
| Orange | Orders |
| Amber | Reviews |
| Sky | Quotes, Organizations, Price Lists, Insights |
| Violet | Products, Customer Groups |
| Emerald | Inventory, Properties, Campaigns |
| Rose | Promotions |

- With actions: buttons sit right of the title, vertically centered. Toolbar-style outline buttons; destructive actions use destructive outline; AI actions use outline + sparkles icon.
- When a page header has actions, its single main action is a primary-filled button, placed last (e.g. Categorize with AI on Products, Import on Inventory). Never more than one primary per header; pages without a main action have no header buttons.

### Detail Header

- Header shell for drill-in pages: 48px muted *bordered* icon tile (not accent-soft — accents are reserved for page headers) + 22px/600 entity name + inline status badge.
- Attribute rows below, divided by 1px borders: two-column grid, muted label left, value right. Values follow the formatting rules (dates, currency). Use attribute rows only for **3+ facts** — one or two short facts (e.g. Type) belong as neutral badges beside the status badge in the name row, never as a lone attribute table.
- Pairs with a topbar breadcrumb back to the parent list page.
- **Avatar variant** (entities with identity — properties, users): 72px solid-accent avatar with initials + 16px presence dot (emerald, 3px `--background` ring), 24px name, a badge row (status badge + neutral badges for short facts like type and address; long values truncate with the full text in the tooltip) (type, address).
- **Highlight tiles**: for a few important or linkable attributes — `--muted` tile, 40px accent-soft icon container, 11px uppercase eyebrow label, 15px/600 value (links to related detail pages inherit color, underline on hover). Use plain attribute rows for longer flat attribute lists.

### Section Card

- Card hosting a titled sub-collection on a detail page: 16px/600 title + count pill (24px, `--muted`, 12px/600) left; controls (segmented view toggle, search) right.
- The embedded table gets its own 1px border + `--radius-md` (the section card provides the outer chrome); pagination sits below the table inside the card.
- Grid views embed the standard entity-card grid.
