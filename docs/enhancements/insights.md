# Insights — UX Enhancement Summary

**View:** [insights.html](https://scout-design-system-beta.vercel.app/insights.html)
**Date:** 07/21/2026

## From a metrics collage to a morning command center

### 1. Directional deltas everywhere
The -58.5% MoM growth was sitting on a calm primary-blue tile, reading as neutral. Every delta is now directional: **▲ + emerald** for positive, **▼ + rose** for negative — the Growth tile's entire background takes the sign's color, and Total Revenue and Avg. Order Value gained delta pills vs. the prior period. Switching to 7D (where growth is +8.2%) flips the tile emerald with an up arrow.

### 2. One unified time scope
The page had three disagreeing time controls (7D/30D/90D on the chart, 30D/60D/90D on revenue, hardcoded "30D" chips). Now a single **7D / 30D / 90D toggle in the page header** drives everything: the Orders History bars and axis re-render; Total Revenue, Growth, AOV, and the Completed status card recompute; and every period chip and "vs prior" label syncs. Two cards can never disagree about the period again. The redundant date-range badge on the chart came off — the axis labels and header toggle already say the period.

### 3. Cross-app action queue with age cues
The four equal cards (all with "View Orders →" CTAs, including Completed) became a two-tier layout. **"Needs your action"** is now a cross-app work queue — **Orders to Fulfill (7) · Orders to Ship (3) · Pending Quotes (6) · Reviews to Answer (3)** — each deep-linking to its view, each carrying an age cue ("oldest 3d"; the 46-day-old quote renders hot in amber). Insights surfaces every queue in the app.

### 4. Money-weighted pipeline status
**"Pipeline status"** holds the passive states as compact, CTA-free cards with the dollar dimension attached: **Awaiting Payment — 48 · $41.2K outstanding** (the buyer's side of the pipeline), and **Completed** — scoped to the unified time toggle (2 · $1,724.90 collected at 30D; 9 · $8,412.65 at 90D).

### 5. Page header
The standard header joined the page (sidebar's chart icon, title, "How your business is performing at a glance") with the unified time toggle as the header action — Insights now matches every other view's chrome.

### 6. Charts state their conclusion
The Orders History header carries a live summary — "**7** orders this period · ▼ 36.4% vs prior" — so the chart answers its own question before anyone reads a bar. The page now reads top-to-bottom as: *what needs me?* → *how's the pipeline?* → *how's the business trending?* → *what's selling, and to whom?*

## Design system additions

- **Dashboards & Deltas rules** (design doc): deltas are always directional (▲ emerald / ▼ rose, arrow matches sign — never neutral); one time scope per analytics page (a single header toggle, per-card toggles forbidden); action-vs-status card tiers (CTAs only on actionable cards, dominant action cards with age cues, compact status cards carrying dollar values); charts carry a summary line stating their conclusion
