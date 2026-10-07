# Buyer App — Shared App Bar

**Status:** ✅ built (10/07/2026), markup only (Vu's call)
**Files:** `design-system/buyer/appbar.js` (new), all 20 buyer pages, `buyer-components.css` (`.icon-btn.active-page`)

## What shipped
- **One copy of the bar.** Each page's 17 KB of copied markup is replaced by an empty `<nav class="app-bar" id="app-bar"></nav>` with `<script src="appbar.js"></script>` right after it.
  - The script renders the bar synchronously, so every page script that reads the bar still works: theme toggle, Orders / SPOs / Admin menus, the Context Switcher (`echo-name`, `ctx-list`), the search icon `cart.js` adds, the notification bell, and the cart badge.
  - About 350 KB of duplicate markup is gone across the pages.
- **Highlights come from one page map:**

  | Pages | Highlighted |
  |---|---|
  | Home | Home |
  | Marketplace · products · product · compare · wishlists | Marketplace |
  | Orders · order detail · approvals · approval | **Orders** |
  | All SPO pages · schedules · schedule · unit history · invoice intake | SPOs |
  | Wishlists | Heart icon |
  | Cart · checkout | Cart icon |
  | Notifications | Bell |

- **Fixed while doing it:**
  - **Orders, Order Detail and both Approvals pages never highlighted Orders.** Each copy had been edited by hand, and those four were missed.
  - **Wishlists' heart "highlight" never showed.** The `active-page` class had no style. It now has a 2px primary ring, plus an accent fill on outline icons.
- **Shopping pages** (marketplace, products, product, compare) render "Shopping for / Choose a property…" in the Context Switcher; their own script still fills in the property.

- **Property switcher overlapped Admin** between about 1,280 and 1,440px, because the nav chips could shrink under it (found by Vu, 10/07/2026). On desktop (821px and up), the chips now keep their natural width and the switcher gives way, truncating the property name (at most 180px) with an ellipsis. Phone widths are unchanged.

## Verified
- Every page's rendered bar was recorded before the change and compared after: same text, height and button count.
- The only differences are the intended highlights: Orders on its four pages, plus the cart on cart/checkout and the bell on notifications.
- Menus, theme, property switching, search, bell and cart badge were checked on Orders and Products.

## Held (step 2)
- **Phone layout of the bar**: under 820px the nav chips are squeezed to nothing. Vu decided this isn't needed (10/07/2026): the buyer prototype is a desktop demo.

The bar's **behaviour** is still copied into every page: theme toggle, menus, Context Switcher and `PROPERTIES`. The shopping pages run their own Context Switcher (property gate, no "All properties"), so moving it is its own change.

## Pitfalls
- New buyer pages must use the placeholder + `appbar.js`, never a pasted bar, and add the page to the map in `appbar.js` if it belongs under a nav item.
- The script must sit directly after the placeholder (not deferred): page scripts look up `echo-name` and `ctx-list` as they run.

---

## Tickets

### TKT-APP-01 · Render the App Bar from one script
**Summary:** Replace the per-page App Bar markup with a placeholder and a shared script.
**Acceptance criteria:**
- [ ] Every buyer page renders the bar from `appbar.js`, and no page contains bar markup.
- [ ] Menus, theme, Context Switcher, search, bell and cart badge behave as before on every page.
- [ ] The bar's text, height and buttons are unchanged.
**Files:** `buyer/appbar.js`, all buyer pages

### TKT-APP-02 · Highlight the current section from one page map
**Summary:** The highlighted nav chip or icon comes from a page map, not hand edits.
**Acceptance criteria:**
- [ ] Orders, order detail and approvals highlight Orders.
- [ ] SPO pages highlight SPOs; Marketplace pages (and wishlists) highlight Marketplace.
- [ ] The heart, cart and bell show a primary ring on their own pages.
- [ ] Shopping pages read "Shopping for" in the Context Switcher.
**Files:** `buyer/appbar.js`, `buyer/buyer-components.css` (`.icon-btn.active-page`)
