/* Scout Buyer — shared cart store (localStorage, property-scoped) */
const CART = (() => {
  const KEY = 'scout-cart';
  const SEED = {
    magnolia: [
      { id: 'd1', name: '27 in. 7.4 cu. ft. Electric Dryer in White', sku: '7411520', price: 1210.00, qty: 1, vendor: 'SD' },
      { id: 'd2', name: 'Commercial 6.7 cu. ft. Non Coin Electric Dryer in White', sku: '7503672', price: 1455.09, qty: 1, vendor: 'SD' },
      { id: 'd3', name: '23-7/16 in. 4.3 cu. ft. Electric Dryer in White', sku: '6082291', price: 1118.39, qty: 1, vendor: 'SD' }
    ],
    bayou: [
      { id: 'bl1', name: 'CORDLESS MINI BLIND 69X60 - ALABASTER', sku: '412688', price: 34.99, qty: 1, vendor: 'CH' },
      { id: 'bl2', name: '47 x 64 in. Vinyl Cordless Plus Mini Blind', sku: '7134298', price: 30.40, qty: 1, vendor: 'SD' }
    ]
  };
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    save(SEED); return JSON.parse(JSON.stringify(SEED));
  }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); document.dispatchEvent(new CustomEvent('cart-changed')); }
  function itemsFor(prop) { const d = load(); return d[prop] || []; }
  function totalCount() { const d = load(); return Object.values(d).reduce((a, l) => a + l.reduce((x, i) => x + i.qty, 0), 0); }
  function countFor(prop) { return itemsFor(prop).reduce((a, i) => a + i.qty, 0); }
  function subtotalFor(prop) { return Math.round(itemsFor(prop).reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100; }
  function add(prop, item, qty) {
    const p = prop === 'all' ? 'magnolia' : prop;
    const d = load(); d[p] = d[p] || [];
    const ex = d[p].find(i => i.id === String(item.id));
    if (ex) ex.qty += (qty || 1);
    else d[p].push({ id: String(item.id), name: item.name, sku: item.sku || '', price: item.price, qty: qty || 1, vendor: item.vendor || 'SD' });
    save(d); return p;
  }
  function setQty(prop, id, qty) {
    const d = load(); const list = d[prop] || [];
    const it = list.find(i => i.id === id); if (!it) return;
    it.qty = Math.max(1, Math.min(99, qty)); save(d);
  }
  function remove(prop, id) { const d = load(); d[prop] = (d[prop] || []).filter(i => i.id !== id); save(d); }
  function setMeta(prop, id, meta) { const d = load(); const it = (d[prop] || []).find(i => i.id === id); if (!it) return; Object.assign(it, meta); save(d); }
  function clear(prop) { const d = load(); d[prop] = []; save(d); }
  function syncBadge() {
    const btn = document.querySelector('.icon-btn[title="Cart"]'); if (!btn) return;
    let b = btn.querySelector('.cart-badge');
    if (!b) { b = document.createElement('span'); b.className = 'cart-badge'; btn.appendChild(b); }
    const n = totalCount(); b.textContent = n > 0 ? n : '';
  }
  document.addEventListener('cart-changed', syncBadge);
  window.addEventListener('storage', syncBadge);
  document.addEventListener('DOMContentLoaded', syncBadge);
  return { itemsFor, totalCount, countFor, subtotalFor, add, setQty, remove, setMeta, clear, syncBadge };
})();
