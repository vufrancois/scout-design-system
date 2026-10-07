/* Notifications — derived from the same event logs that drive SPO / schedule Activity (one event stream),
   plus seeded order + product-approval events. Loaded on every buyer page by cart.js.
   Rules:
   - "Needs action" items stay in that list while the underlying task is open and clear themselves when
     it's done (not when read). FYI items are informational.
   - One count everywhere: the bell badge, the panel and the page show the number of unread action items.
   - Your own actions never notify you; things others do (vendors, approvers, Accounting, schedules) do.
   - Repetitive events (orders confirmed) group into one expandable row. */
(function () {
  const RKEY = 'scout-notif-read', PKEY = 'scout-notif-prefs';
  const ME = 'Alicia Grant';
  const TYPES = {
    spo: { label: 'Service POs', tile: 'tile-sky' },
    invoice: { label: 'Invoices', tile: 'tile-amber' },
    approval: { label: 'Approvals', tile: 'tile-violet' },
    schedule: { label: 'Schedules', tile: 'tile-emerald' },
    order: { label: 'Orders', tile: 'tile-muted' }
  };
  const SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  const ICON = {
    spo: SVG + '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    invoice: SVG + '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
    approval: SVG + '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
    schedule: SVG + '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
    order: SVG + '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    gear: SVG + '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    chev: SVG + '<path d="m6 9 6 6 6-6"/></svg>'
  };

  /* ---------- seeded order + product approval events (not in the SPO store) ---------- */
  const ORDER_SEEDS = [
    { at: '2026-08-24 07:40', type: 'order', kind: 'delivered', prop: 'magnolia', title: 'Order #657 delivered — validate it', sub: '3 dryers for the laundry room · Scout Demo Vendor', link: 'order-detail.html#657/validate', action: true },
    { at: '2026-08-21 15:40', type: 'approval', kind: 'approval-req', prop: 'magnolia', title: 'Request K4PT2N needs your approval', sub: '$1,977.48 · 2 vendors · Supervisor approval', link: 'approval.html#K4PT2N', action: true },
    { at: '2026-08-22 10:05', type: 'invoice', kind: 'order-invoice', prop: 'magnolia', title: 'Invoice ready to validate for Order #674', sub: 'Scout Demo Vendor · compare it with your Receipt of Goods', link: 'order-detail.html#674/invoice', action: true }
  ];
  ['08:02', '08:15', '08:31', '09:04', '09:20', '09:47', '10:12', '10:33', '11:05', '11:40', '13:10', '14:22'].forEach((t, i) =>
    ORDER_SEEDS.push({ at: '2026-08-24 ' + t, type: 'order', kind: 'order-confirmed', prop: ['magnolia', 'bayou', 'cypress', 'lonestar'][i % 4], title: 'Order #' + (690 + i) + ' confirmed', sub: 'A new order was placed in your organization', link: 'order-detail.html#' + (690 + i) }));
  ['09:10', '11:25', '16:40'].forEach((t, i) =>
    ORDER_SEEDS.push({ at: '2026-08-23 ' + t, type: 'order', kind: 'order-confirmed', prop: ['magnolia', 'central', 'heights'][i], title: 'Order #' + (686 + i) + ' confirmed', sub: 'A new order was placed in your organization', link: 'order-detail.html#' + (686 + i) }));

  /* ---------- derive from the event logs ---------- */
  const fmtMoney = v => window.SPO ? SPO.money(v) : '$' + v;
  function fromSpos() {
    if (!window.SPO) return [];
    const out = [];
    SPO.list().forEach(s => {
      const v = SPO.VEN[s.v] || { name: s.v }, id = 'SPO-' + s.id;
      (s.log || []).forEach(e => {
        const base = { at: e.at, prop: s.prop, ent: id };
        const by = (e.sub || '').indexOf('by ' + ME) >= 0;
        switch (e.t) {
          case 'Vendor rejected': out.push(Object.assign(base, { type: 'spo', kind: 'rejected', title: v.name + ' rejected ' + id, sub: e.sub ? 'Reason: ' + e.sub : 'Choose another vendor', link: 'spo.html#' + s.id + '/vendor', action: true, open: () => s.state === 'rejected', bad: true })); break;
          case 'Vendor accepted': out.push(Object.assign(base, { type: 'spo', kind: 'accepted', title: v.name + ' accepted ' + id, sub: 'Their invoice comes next', link: 'spo.html#' + s.id })); break;
          case 'Invoice received': if (by) break;
            out.push(Object.assign(base, { type: 'invoice', kind: 'invoice', title: s.invoice && s.invoice.extractFailed ? 'Scout AI couldn’t read the invoice for ' + id : 'Invoice to map for ' + id, sub: (e.sub || '') + ' · ' + v.name, link: 'spo.html#' + s.id + '/invoice', action: true, open: () => s.state === 'mapping', bad: !!(s.invoice && s.invoice.extractFailed) })); break;
          case 'Sent for approval': out.push(Object.assign(base, { type: 'approval', kind: 'approval-req', title: id + ' needs your approval', sub: (e.sub || '') + ' · ' + fmtMoney(SPO.total(s)), link: 'approval.html#' + id, action: true, open: () => s.state === 'approval' })); break;
          case 'Approved': if (by) break; out.push(Object.assign(base, { type: 'approval', kind: 'approved', title: id + ' approved', sub: e.sub || '', link: 'spo.html#' + s.id })); break;
          case 'Drafted by schedule': out.push(Object.assign(base, { type: 'schedule', kind: 'run-draft', title: 'Schedule drafted ' + id + ' — review and send', sub: (e.sub || '') + ' · ' + v.name, link: 'spo-new.html#' + s.id, action: true, open: () => s.state === 'draft' })); break;
          case 'Created and sent by schedule': out.push(Object.assign(base, { type: 'schedule', kind: 'run-sent', title: 'Schedule sent ' + id + ' to ' + v.name, sub: e.sub || '', link: 'spo.html#' + s.id })); break;
          case 'Paid': out.push(Object.assign(base, { type: 'invoice', kind: 'paid', title: id + ' paid', sub: e.sub || '', link: 'spo.html#' + s.id })); break;
          case 'Canceled': if (by) break; out.push(Object.assign(base, { type: 'spo', kind: 'canceled', title: id + ' canceled', sub: e.sub || '', link: 'spo.html#' + s.id, bad: true })); break;
          case 'Rejected in approval': out.push(Object.assign(base, { type: 'approval', kind: 'rejected', title: id + ' was rejected in approval', sub: e.sub || '', link: 'spo.html#' + s.id, bad: true })); break;
          case 'Revision requested': out.push(Object.assign(base, { type: 'approval', kind: 'revision', title: id + ' sent back for revision', sub: e.sub || '', link: 'spo-new.html#' + s.id, action: true, open: () => s.state === 'draft' })); break;
        }
      });
    });
    return out;
  }
  function fromSchedules() {
    if (!window.SCH) return [];
    const out = [];
    SCH.list().forEach(x => (x.log || []).forEach(e => {
      const base = { at: e.at, prop: x.prop, ent: x.id };
      switch (e.t) {
        case 'Sent for approval': out.push(Object.assign(base, { type: 'approval', kind: 'approval-req', title: x.name + ' (' + x.id + ') needs series approval', sub: (e.sub || '').replace('Series approval · ', '') + ' · approved once for every run', link: 'approval.html#' + x.id, action: true, open: () => x.status === 'approval' })); break;
        case 'Series approved': if ((e.sub || '').indexOf(ME) >= 0) break; out.push(Object.assign(base, { type: 'schedule', kind: 'approved', title: x.name + ' approved', sub: e.sub || '', link: 'schedule.html#' + x.id })); break;
        case 'Revision requested': out.push(Object.assign(base, { type: 'schedule', kind: 'revision', title: x.name + ' sent back for revision', sub: e.sub || '', link: 'spo-new.html#edit-' + x.id, action: true, open: () => x.status === 'revision' })); break;
        case 'Ended': if ((e.sub || '').indexOf(ME) >= 0) break; out.push(Object.assign(base, { type: 'schedule', kind: 'ended', title: x.name + ' ended', sub: e.sub || '', link: 'schedule.html#' + x.id })); break;
        case 'Rejected in approval': out.push(Object.assign(base, { type: 'schedule', kind: 'rejected', title: x.name + ' was rejected in approval', sub: e.sub || '', link: 'schedule.html#' + x.id, bad: true })); break;
      }
    }));
    return out;
  }
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return 'n' + (h >>> 0).toString(36); };
  function all() {
    const prefs = loadPrefs(), read = loadRead();
    /* Older than a week starts out read — a fresh demo shouldn't open on 70 unread. */
    const cutoff = window.SPO ? new Date(new Date(SPO.TODAY + 'T00:00:00Z').getTime() - 7 * 864e5).toISOString().slice(0, 10) : '';
    return fromSpos().concat(fromSchedules(), ORDER_SEEDS.map(o => Object.assign({}, o, { open: o.action ? () => true : null })))
      .map(n => { n.id = n.id || hash(n.at + n.kind + (n.ent || n.title)); n.read = n.id in read ? !!read[n.id] : n.at.slice(0, 10) < cutoff; n.isAction = !!(n.action && n.open && n.open()); return n; })
      .filter(n => prefs[n.type] !== false)
      .sort((a, b) => b.at.localeCompare(a.at));
  }
  const scoped = (list, prop) => list.filter(n => !prop || prop === 'all' || n.prop === prop);
  function loadRead() { try { return JSON.parse(localStorage.getItem(RKEY)) || {}; } catch (e) { return {}; } }
  function saveRead(m) { try { localStorage.setItem(RKEY, JSON.stringify(m)); } catch (e) { /* noop */ } }
  function loadPrefs() { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } }
  function savePrefs(m) { try { localStorage.setItem(PKEY, JSON.stringify(m)); } catch (e) { /* noop */ } }
  function markRead(ids, on) { const r = loadRead(); ids.forEach(id => { r[id] = on !== false; }); saveRead(r); changed(); }
  const curProp = () => (typeof currentProp !== 'undefined' ? currentProp : 'all');
  /* One count everywhere: unread action items in the current property scope. */
  const count = () => scoped(all(), curProp()).filter(n => n.isAction && !n.read).length;

  /* ---------- formatting & grouping ---------- */
  function when(at) {
    const today = window.SPO ? SPO.TODAY : at.slice(0, 10), d = at.slice(0, 10), t = at.slice(11, 16);
    let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    const time = h + ':' + String(m).padStart(2, '0') + ' ' + ap;
    if (d === today) return time;
    const y = new Date(new Date(today + 'T00:00:00Z').getTime() - 864e5).toISOString().slice(0, 10);
    if (d === y) return 'Yesterday · ' + time;
    return d.slice(5, 7) + '/' + d.slice(8, 10) + '/' + d.slice(0, 4);
  }
  function dayLabel(at) {
    const today = window.SPO ? SPO.TODAY : at.slice(0, 10), d = at.slice(0, 10);
    const y = new Date(new Date(today + 'T00:00:00Z').getTime() - 864e5).toISOString().slice(0, 10);
    return d === today ? 'Today' : d === y ? 'Yesterday' : 'Earlier';
  }
  /* Repetitive kinds collapse: 3+ of the same kind on the same day become one expandable row. */
  function groupList(list) {
    const out = [], seen = {};
    list.forEach(n => {
      if (n.kind === 'order-confirmed') {
        const k = n.kind + n.at.slice(0, 10);
        const same = list.filter(x => x.kind === n.kind && x.at.slice(0, 10) === n.at.slice(0, 10));
        if (same.length >= 3) { if (!seen[k]) { seen[k] = true; out.push({ group: true, key: k, items: same, at: n.at, type: n.type, read: same.every(x => x.read) }); } return; }
      }
      out.push(n);
    });
    return out;
  }
  const propName = id => { try { return (PROPERTIES.find(p => p.id === id) || {}).name || ''; } catch (e) { return ''; } };
  const open = {};
  function rowHtml(n, opts) {
    const o = opts || {};
    if (n.group) {
      const isOpen = !!open[n.key], unread = n.items.filter(x => !x.read).length;
      return '<div class="nt-row nt-group' + (unread ? ' unread' : '') + '"><span class="icon-tile sm ' + TYPES[n.type].tile + '">' + ICON[n.type] + '</span>' +
        '<button class="nt-body" onclick="NOTIF.toggleGroup(\'' + n.key + '\')"><span class="nt-title">' + n.items.length + ' orders confirmed ' + dayLabel(n.at).toLowerCase() + '</span><span class="nt-sub">' + n.items.slice(0, 3).map(x => x.title.replace(' confirmed', '')).join(', ') + (n.items.length > 3 ? ' and ' + (n.items.length - 3) + ' more' : '') + '</span></button>' +
        '<span class="nt-meta">' + when(n.at) + '<span class="nt-chev' + (isOpen ? ' open' : '') + '">' + ICON.chev + '</span></span>' + (unread ? '<span class="nt-dot"></span>' : '') + '</div>' +
        (isOpen ? '<div class="nt-groupitems">' + n.items.map(x => rowHtml(x, Object.assign({}, o, { nested: true }))).join('') + '</div>' : '');
    }
    return '<div class="nt-row' + (n.read ? '' : ' unread') + (o.nested ? ' nested' : '') + '">' + (o.nested ? '' : '<span class="icon-tile sm ' + (n.bad ? 'tile-rose' : TYPES[n.type].tile) + '">' + ICON[n.type] + '</span>') +
      '<a class="nt-body" href="' + n.link + '" onclick="NOTIF.markRead([\'' + n.id + '\'])"><span class="nt-title">' + n.title + '</span><span class="nt-sub">' + n.sub + '</span>' +
      (o.page ? '<span class="nt-tags">' + (n.isAction ? '<span class="nt-tag act">Needs action</span>' : n.action ? '<span class="nt-tag done">Done</span>' : '') + '<span class="nt-tag">' + TYPES[n.type].label + '</span>' + (propName(n.prop) ? '<span class="nt-tag">' + propName(n.prop) + '</span>' : '') + '</span>' : '') + '</a>' +
      '<span class="nt-meta">' + when(n.at) + (o.page ? '<button class="w-linkbtn" onclick="NOTIF.markRead([\'' + n.id + '\'], ' + (n.read ? 'false' : 'true') + ')">' + (n.read ? 'Mark unread' : 'Mark read') + '</button>' : '') + '</span>' + (n.read ? '' : '<span class="nt-dot"></span>') + '</div>';
  }
  function listHtml(list, opts) {
    if (!list.length) return '<div class="nt-empty">' + ((opts || {}).empty || 'You’re all caught up.') + '</div>';
    const groups = {};
    groupList(list).forEach(n => { const k = dayLabel(n.at); (groups[k] = groups[k] || []).push(n); });
    return ['Today', 'Yesterday', 'Earlier'].filter(k => groups[k]).map(k => '<div class="nt-day">' + k + '</div>' + groups[k].map(n => rowHtml(n, opts)).join('')).join('');
  }

  /* ---------- bell panel ---------- */
  let tab = 'action';
  function panelHtml() {
    const list = scoped(all(), curProp()), act = list.filter(n => n.isAction), c = act.filter(n => !n.read).length;
    const shown = tab === 'action' ? act : list.slice(0, 14);
    return '<div class="nt-head"><b>Notifications</b>' + (c ? '<span class="nt-count">' + c + '</span>' : '') +
      '<button class="w-linkbtn" style="margin-left:auto" onclick="NOTIF.markRead(NOTIF.ids())">Mark all read</button>' +
      '<a class="row-action" href="notifications.html#settings" title="Notification settings">' + ICON.gear + '</a></div>' +
      '<div class="nt-tabs"><button class="' + (tab === 'action' ? 'active' : '') + '" onclick="NOTIF.setTab(\'action\')">Needs action<span>' + act.length + '</span></button><button class="' + (tab === 'all' ? 'active' : '') + '" onclick="NOTIF.setTab(\'all\')">All</button></div>' +
      '<div class="nt-list">' + listHtml(shown, { empty: tab === 'action' ? 'Nothing needs you right now. Action items clear themselves when the task is done.' : 'No notifications yet.' }) + '</div>' +
      '<a class="nt-foot" href="notifications.html">View all notifications</a>';
  }
  function bell() { return document.querySelector('.icon-btn[title="Notifications"]'); }
  function syncBadge() {
    const b = bell(); if (!b) return;
    const dot = b.querySelector('.dot'); if (dot) dot.remove();
    let s = b.querySelector('.cart-badge');
    if (!s) { s = document.createElement('span'); s.className = 'cart-badge nt-badge'; b.appendChild(s); }
    const c = count(); s.textContent = c ? (c > 99 ? '99+' : c) : '';
    b.setAttribute('aria-label', 'Notifications' + (c ? ', ' + c + ' need action' : ''));
  }
  function panel() {
    let p = document.getElementById('nt-panel');
    if (!p) { p = document.createElement('div'); p.id = 'nt-panel'; p.className = 'nt-panel'; document.body.appendChild(p); }
    return p;
  }
  function place(p) {
    const b = bell(); if (!b) return;
    const r = b.getBoundingClientRect();
    p.style.top = (r.bottom + 10) + 'px';
    p.style.right = Math.max(12, window.innerWidth - r.right - 12) + 'px';
  }
  function toggle(e) {
    if (e) e.stopPropagation();
    const p = panel();
    if (p.classList.contains('open')) { p.classList.remove('open'); return; }
    p.innerHTML = panelHtml(); place(p); p.classList.add('open');
  }
  function changed() {
    syncBadge();
    const p = document.getElementById('nt-panel'); if (p && p.classList.contains('open')) p.innerHTML = panelHtml();
    document.dispatchEvent(new CustomEvent('notif-change'));
  }
  function init() {
    const b = bell(); if (!b) return;
    b.onclick = toggle;
    syncBadge();
    /* The count follows the property scope: re-count right after the Context Switcher changes it. */
    if (typeof window.selectProp === 'function' && !window.selectProp._nt) { const orig = window.selectProp; window.selectProp = function () { const r = orig.apply(this, arguments); changed(); return r; }; window.selectProp._nt = true; }
    document.addEventListener('click', e => { const p = document.getElementById('nt-panel'); if (p && p.classList.contains('open') && e.target.isConnected && !p.contains(e.target) && !bell().contains(e.target)) p.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { const p = document.getElementById('nt-panel'); if (p) p.classList.remove('open'); } });
    window.addEventListener('resize', () => { const p = document.getElementById('nt-panel'); if (p && p.classList.contains('open')) place(p); });
    /* Re-count when anything changes the stores (other tabs, or this page's own saves). */
    window.addEventListener('storage', changed);
    setInterval(syncBadge, 4000);
  }

  window.NOTIF = {
    TYPES, ICON, all, scoped, count, markRead, listHtml, rowHtml, loadPrefs, savePrefs, changed,
    ids: () => scoped(all(), curProp()).filter(n => !n.read).map(n => n.id),
    setTab(t) { tab = t; const p = panel(); p.innerHTML = panelHtml(); },
    toggleGroup(k) { open[k] = !open[k]; changed(); },
    reset() { try { localStorage.removeItem(RKEY); localStorage.removeItem(PKEY); } catch (e) { /* noop */ } }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
