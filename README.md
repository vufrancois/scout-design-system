# Scout Design System

Living design system and screen reference for Scout, built as static HTML with CSS custom properties as the shared token layer.

**Live site:** https://scout-design-system-beta.vercel.app

| Page | Purpose |
|---|---|
| [Components](https://scout-design-system-beta.vercel.app/) | Living component gallery — every component with light/dark theme toggle |
| [Design Doc](https://scout-design-system-beta.vercel.app/design-doc.html) | Written spec: tokens, usage rules, formatting standards, chart rules |
| [Vendor App](https://scout-design-system-beta.vercel.app/orders.html) | 14 fully-built demo screens (12 views + 2 detail pages) using only design-system components |

## Structure

```
design-system/
  index.html          Component gallery (start here)
  design-doc.html     Written rules & token reference
  tokens.css          Design tokens — the contract both apps consume
  orders.html         Vendor app demo screens (12) — all cross-linked
  quotes.html           via their shared dark sidebar
  products.html
  inventory.html
  properties.html
  organizations.html
  customer-groups.html
  price-lists.html
  promotions.html
  campaigns.html
  reviews.html
  insights.html
  organization-detail.html   Detail-page reference implementations
  property-detail.html
docs/
  enhancements/       Per-view UX enhancement summaries (client-facing changelog)
```

## For engineers

- **Tokens are the contract.** [`design-system/tokens.css`](design-system/tokens.css) holds every color, radius, and shadow as CSS custom properties (light + dark). Never hard-code values — reference the variables.
  - **Buyer App** (Shadcn UI + Tailwind): the semantic tokens (`--primary`, `--muted`, …) follow Shadcn's naming convention; wire them through a shared Tailwind preset.
  - **Vendor/Admin Portal** (`@medusajs/ui`): override Medusa's theme variables with these tokens at the CSS layer.
- **Component anatomy & states** live in the gallery (`index.html`) — each section shows markup patterns, states (hover/focus/disabled/loading), and variants.
- **Usage rules** (when to use a switch vs. checkbox, pagination placement, status-dot color semantics, currency/date formatting, chart palette) live in `design-doc.html`. Treat those rules as normative.
- **Reference implementations:** every demo screen is built exclusively from documented components — use them as the source of truth for page composition (page headers, toolbars, filter bars, bulk selection, list/grid view toggles).
- Icons are **Lucide** (`lucide-react`), font is **Inter**, identifiers/codes render in **JetBrains Mono**.

## Develop

Static HTML — no build step.

```sh
npx serve design-system -l 3333
```

## Deploy

Hosted on Vercel (project `scout-design-system`).

```sh
cd design-system && vercel deploy --prod --yes
```
