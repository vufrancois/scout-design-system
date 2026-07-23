# Dark Mode + Responsive — Cross-Cutting Pass

**Scope:** all 14 app pages (12 views + 2 detail pages), tokens, gallery, design doc
**Date:** 07/21/2026

## Dark mode

### 1. Full dark theme on every app page
Every vendor page now supports dark mode via `body.dark` token overrides — previously only the gallery and design doc could go dark. A **sun/moon toggle in the topbar** persists the choice in `localStorage`, so the theme follows you across all pages.

### 2. Dark variants for the soft accent palette
The `-soft` pastel colors (violet-soft, emerald-soft, …) had no dark equivalents and would have glared on dark surfaces. Each now has a deep-tinted dark variant (e.g. emerald-soft `#d1fae5` → `#0d3327`), added to `tokens.css`, every app page, the gallery, and the design doc — so icon tiles, active stat cards, and AI chips all read correctly in the dark.

### 3. Component-level dark fixes
Primary-navy *text* (sorted column headers, links, checkmarks, active segments) would vanish on dark backgrounds — it lightens to blue-300. Tinted badges (stock pills, deltas, trend text, return pills) switch to translucent accent backgrounds with lightened text. Tooltips invert to light bubbles. Chart strokes that matched the dark surface remap. Checkboxes take a brighter accent.

## Responsive

### 4. Sidebar becomes a drawer below 1024px
The fixed sidebar hides by default on narrow screens; the topbar toggle slides it over the content as a shadowed drawer, and tapping outside dismisses it. Desktop behavior is unchanged.

### 5. Overflow containment — zero horizontal page scroll
The root cause of page-level overflow was the flexbox `min-width: auto` default letting wide tables stretch the page. With `min-width: 0` on the main column plus scroll containers on every table, **all 42 page × width combinations (14 pages × 1280/1024/768) measure zero horizontal document overflow** — tables scroll inside their cards instead.

### 6. Grid breakpoints everywhere
Stat cards, entity/item grids, and the insights queue drop to 2-up at 1024px and single-column at 720px; chart rows stack; page padding tightens on small screens.

## Design system additions

- **Theming & Responsive section** (design doc) — dark-mode architecture (`body.dark`, soft dark variants, component fix patterns), the 1280/1024/720 breakpoint ladder, the sidebar drawer behavior, and the overflow-containment rule
- **Dark `-soft` tokens** in `tokens.css` — the token contract now covers both themes end to end
