# Buyer App · Wishlists — UX Enhancement Summary

**View:** [buyer/wishlists.html](https://scout-design-system-beta.vercel.app/buyer/wishlists.html)
**Date:** 08/22/2026 · **Status:** ✅ built and cascaded

Property-scoped shared shopping lists, reached from the heart icon. One shared store (`buyer/wishlist.js`) powers the page and the List Picker modal on the listing and product pages; state persists in the browser so the flow works end to end.

### 1. Property scope made explicit
Wishlists are shared per property, but our Context Switcher allows "All properties." Rule: the heart operates on the **current property** — with All properties active, the List Picker first asks which property the list belongs to (choosing one re-scopes the app), and the Wishlists page prompts for a property. The page subtitle names the property ("Shared product lists for Magnolia Place Apartments" — no separate kicker, since the App Bar already shows the property); create/rename modals say who the list is shared with ("everyone assigned to Magnolia Place Apartments").

### 2. Heart = save to list, everywhere
Card and buy-box hearts open the **List Picker** (per the reference) rather than silently toggling: property kicker, product name, checkbox rows of lists with live counts (pre-checked where the product already is), a dashed **Create a new list** row that becomes an inline name field, and **Save disabled until something changed** — centered in the viewport, like all small wishlist dialogs; the create row expands into a standard input + Add. Hearts fill rose wherever the product is in any list — across pages, live (a shared change event re-renders). The nav heart opens this page.

### 3. The Wishlists page
Title + property-naming subtitle + New wishlist primary; a **List Sidebar** (counts, rose active accent); a **List Header card** — name, count, "Draft · revision N" badge with a Tooltip explaining it, rename and delete icon buttons, and the list's one primary, **"Add N to cart"** (count in the label, disabled when empty). A redundancy pass tightened it further: the header meta became **"N products · $total"** (the sidebar already counts; the total is the number purchasers want), the "Property lists · 2 lists" sidebar header and the revision badge were dropped, and the filter toolbar appears only at 8+ products with "Showing n of N" only while filtered. Products render as our fixed-slot Product Cards where the filled heart means **remove from this list** (tooltip says so).

### 4. Slim filters
The reference's "Filter products" card (title + description for two selects) became a toolbar row — Vendor · Category · "2 of 2" count — matching list-page conventions. The vendor select builds from the list's actual contents.

### 5. Honest dialogs and empty states
Create and Rename share one modal (name field, create/save disabled until non-empty, Enter submits). Delete is the 440px destructive confirm with consequence copy that adapts: "removes the empty list" vs "removes the list and its 2 saved products — for everyone at this property." A fresh list shows "No products yet — heart products in the Marketplace and choose this list" with a Browse CTA.

### 6. Demo data
Seeded with the reference's lists — "2x1 Turns" (two electric dryers) and "Scout Demo Vendor Frequently Purchased" (one gas dryer) — under Magnolia Place; every mutation (save, remove, create, rename, delete) is live and bumps the revision. The reference's junk "asdfasdf" list wasn't recreated; creating one takes four clicks if you miss it.

## Design system additions

- **List Picker modal** — property kicker, checkbox list rows with counts, inline create row, save-disabled-until-changed; property-select state when scope is "all"
- **List Sidebar** — list nav with counts and a rose active accent
- **List Header card** — name, "N products · $total", rename/delete icons, one primary with count
- Heart semantics rule — save-to-list opens the picker; filled heart = in a list (or, in list context, remove); wishlists are property-scoped
