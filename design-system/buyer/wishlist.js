/* Scout Buyer — shared wishlist store + List Picker modal.
   Pages provide: PROPERTIES, currentProp, showToast(); call wlInit() after shell JS. */
(function () {
  const KEY = 'scout-wishlists';
  const SEED = {
    magnolia: [
      { id: 'turns', name: '2x1 Turns', rev: 1, products: [
        { id: 9101, vendor: 'Scout Demo Vendor', vini: 'SD', name: '29 in. 6.5 cu. ft. Electric Dryer in White', price: 481.44, stock: 'in', speed: '1-2', pickup: true, miles: 8 },
        { id: 9102, vendor: 'Scout Demo Vendor', vini: 'SD', name: '27 in. 7.4 cu. ft. Electric Dryer in White', price: 1210.00, stock: 'in', speed: '3-5', pickup: true, miles: 8 }
      ] },
      { id: 'freq', name: 'Scout Demo Vendor Frequently Purchased', rev: 1, products: [
        { id: 9103, vendor: 'Scout Demo Vendor', vini: 'SD', name: '29 in. 7.0 cu. ft. Gas Dryer in White', price: 809.90, stock: 'in', speed: '1-2', pickup: true, miles: 8 }
      ] }
    ]
  };
  function loadAll() {
    try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && typeof v === 'object') return v; } catch (e) {}
    const seed = JSON.parse(JSON.stringify(SEED)); localStorage.setItem(KEY, JSON.stringify(seed)); return seed;
  }
  function saveAll(v) { localStorage.setItem(KEY, JSON.stringify(v)); document.dispatchEvent(new CustomEvent('wishlists-changed')); }
  window.WL = {
    listsFor(prop) { const all = loadAll(); return all[prop] || []; },
    setLists(prop, lists) { const all = loadAll(); all[prop] = lists; saveAll(all); },
    createList(prop, name) { const all = loadAll(); (all[prop] = all[prop] || []).push({ id: 'l' + Date.now(), name, rev: 1, products: [] }); saveAll(all); return all[prop][all[prop].length - 1]; },
    renameList(prop, id, name) { const all = loadAll(); const l = (all[prop] || []).find(x => x.id === id); if (l) { l.name = name; l.rev++; saveAll(all); } },
    deleteList(prop, id) { const all = loadAll(); all[prop] = (all[prop] || []).filter(x => x.id !== id); saveAll(all); },
    inAnyList(prop, pid) { return this.listsFor(prop).some(l => l.products.some(p => p.id === pid)); },
    setMembership(prop, product, listIds) {
      const all = loadAll(); const lists = all[prop] || [];
      lists.forEach(l => {
        const has = l.products.some(p => p.id === product.id), want = listIds.includes(l.id);
        if (want && !has) { l.products.push(product); l.rev++; }
        if (!want && has) { l.products = l.products.filter(p => p.id !== product.id); l.rev++; }
      });
      saveAll(all);
    }
  };

  /* ---------- List Picker modal ---------- */
  const icons = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    bld: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>'
  };
  let modalProduct = null, picked = new Set(), original = new Set(), creating = false;
  function ensureModal() {
    if (document.getElementById('wl-overlay')) return;
    const el = document.createElement('div');
    el.className = 'overlay center'; el.id = 'wl-overlay';
    el.innerHTML = '<div class="wl-modal" role="dialog" aria-modal="true"><div class="wl-modal-head"><div class="wl-kicker" id="wl-prop-kicker"></div><h2 id="wl-title">Save product to wishlists</h2><div class="wl-sub" id="wl-sub"></div></div><div class="wl-modal-body" id="wl-body"></div><div class="wl-modal-foot"><button class="btn" onclick="wlClose()">Cancel</button><button class="btn btn-primary" id="wl-save" onclick="wlSave()">Save</button></div></div>';
    el.addEventListener('click', e => { if (e.target === el) wlClose(); });
    document.body.appendChild(el);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') wlClose(); });
  }
  window.openWishModal = function (product) {
    ensureModal(); modalProduct = product; creating = false;
    document.getElementById('wl-overlay').classList.add('open');
    render();
  };
  window.wlClose = function () { const el = document.getElementById('wl-overlay'); if (el) el.classList.remove('open'); };
  function render() {
    const kicker = document.getElementById('wl-prop-kicker'), body = document.getElementById('wl-body'), save = document.getElementById('wl-save'), sub = document.getElementById('wl-sub');
    if (currentProp === 'all') {
      kicker.innerHTML = icons.heart + '<span>Wishlists are per property</span>';
      document.getElementById('wl-title').textContent = 'Pick a property first';
      sub.textContent = 'Choose which property this list belongs to.';
      body.innerHTML = PROPERTIES.filter(p => p.units).map(p => '<button class="wl-row" onclick="selectProp(\'' + p.id + '\');openWishModal(window.__wlProduct)"><span class="plus" style="width:30px;height:30px;border-radius:8px;background:var(--sky-soft);color:var(--sky);display:inline-flex;align-items:center;justify-content:center">' + icons.bld + '</span><span class="wl-name">' + p.name + '<span class="wl-count">' + p.units + ' units</span></span></button>').join('');
      window.__wlProduct = modalProduct;
      save.style.display = 'none';
      return;
    }
    save.style.display = '';
    const prop = PROPERTIES.find(p => p.id === currentProp);
    kicker.innerHTML = icons.heart + '<span>' + prop.name + '</span>';
    document.getElementById('wl-title').textContent = 'Save product to wishlists';
    sub.textContent = modalProduct.name;
    const lists = WL.listsFor(currentProp);
    original = new Set(lists.filter(l => l.products.some(p => p.id === modalProduct.id)).map(l => l.id));
    picked = new Set(original);
    body.innerHTML = '<div class="wl-label">Choose lists</div>' + lists.map(l =>
      '<button class="wl-row' + (picked.has(l.id) ? ' on' : '') + '" data-list="' + l.id + '" onclick="wlToggle(\'' + l.id + '\')"><span class="wl-name">' + l.name + '<span class="wl-count">' + l.products.length + ' product' + (l.products.length === 1 ? '' : 's') + '</span></span><span class="cb">' + icons.check + '</span></button>').join('') +
      '<div id="wl-create-slot"><button class="wl-create" onclick="wlStartCreate()"><span class="plus">' + icons.plus + '</span><span><b>Create a new list</b><span>Create it and save this product there</span></span></button></div>';
    updateSave();
  }
  window.wlToggle = function (id) {
    picked.has(id) ? picked.delete(id) : picked.add(id);
    document.querySelector('.wl-row[data-list="' + id + '"]').classList.toggle('on', picked.has(id));
    updateSave();
  };
  window.wlStartCreate = function () {
    document.getElementById('wl-create-slot').innerHTML = '<div style="display:flex;gap:8px;margin-bottom:10px"><input class="wl-input" id="wl-new-name" placeholder="e.g. Turnover supplies" onkeydown="if(event.key===\'Enter\')wlDoCreate()"><button class="btn" style="height:42px" onclick="wlDoCreate()">Add</button></div>';
    document.getElementById('wl-new-name').focus();
  };
  window.wlDoCreate = function () {
    const name = document.getElementById('wl-new-name').value.trim(); if (!name) return;
    const l = WL.createList(currentProp, name); picked.add(l.id); render();
  };
  function updateSave() {
    const changed = picked.size !== original.size || [...picked].some(x => !original.has(x));
    document.getElementById('wl-save').disabled = !changed;
  }
  window.wlSave = function () {
    WL.setMembership(currentProp, modalProduct, [...picked]);
    wlClose();
    const n = picked.size;
    showToast(n ? 'Saved to ' + n + ' list' + (n === 1 ? '' : 's') : 'Removed from lists', modalProduct.name);
  };
})();
