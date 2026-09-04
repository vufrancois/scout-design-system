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


/* Scout Buyer — app-level Search Palette (search icon in the bar, or press / or cmd/ctrl+K) */
(() => {
  const MAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
  const SPARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>';
  const CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const TILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>';
  const RECENTS = ['24 in. dishwasher', 'PTAC air filter 16x25', 'LED bulbs 60W equivalent'];
  const CATS = ['Appliances', 'Plumbing', 'Lighting', 'HVAC Parts'];
  let spMode = 'keyword';

  function goSearch() { location.href = 'products.html'; }

  function scopeText() {
    const echo = document.getElementById('echo-name');
    const t = echo ? echo.textContent.trim() : '';
    if (t && t !== 'All properties' && t.indexOf('Choose') !== 0) return 'Scoped to ' + t;
    return 'Across all properties';
  }

  function ensurePal() {
    if (document.getElementById('sp-ov')) return;
    const ov = document.createElement('div');
    ov.id = 'sp-ov'; ov.className = 'sp-ov';
    ov.innerHTML = '<div class="sp" role="dialog" aria-label="Search products">' +
      '<div class="sp-head"><span class="mag">' + MAG + '</span>' +
      '<input class="sp-input" id="sp-input" placeholder="Search products, parts, or vendors\u2026">' +
      '<div class="sp-mode"><button id="sp-kw" class="active">Keyword</button><button id="sp-ai">' + SPARK + 'AI Search</button></div></div>' +
      '<div class="sp-body">' +
      '<div class="sp-label">Recent searches</div>' +
      RECENTS.map(r => '<button class="sp-item sp-go">' + CLOCK + r + '</button>').join('') +
      '<div class="sp-label">Jump to a category</div>' +
      CATS.map(ct => '<button class="sp-item sp-go">' + TILE + ct + '<span class="k">Browse</span></button>').join('') +
      '</div>' +
      '<div class="sp-foot"><span><kbd>\u21B5</kbd> search</span><span><kbd>esc</kbd> close</span><span><kbd>\u2318K</kbd> anywhere</span><span class="sp-scope" id="sp-scope"></span></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) closeSearchPal(); });
    ov.querySelectorAll('.sp-go').forEach(b => b.addEventListener('click', goSearch));
    document.getElementById('sp-kw').addEventListener('click', () => setSpMode('keyword'));
    document.getElementById('sp-ai').addEventListener('click', () => setSpMode('ai'));
    document.getElementById('sp-input').addEventListener('keydown', e => { if (e.key === 'Enter') goSearch(); });
  }
  function setSpMode(m) {
    spMode = m;
    document.getElementById('sp-kw').classList.toggle('active', m === 'keyword');
    document.getElementById('sp-ai').classList.toggle('active', m === 'ai');
    document.getElementById('sp-input').placeholder = m === 'ai' ? 'Describe what you need, e.g. \u201Creplacement igniter for a 2019 GE range\u201D' : 'Search products, parts, or vendors\u2026';
    document.getElementById('sp-input').focus();
  }
  function openSearchPal() {
    ensurePal();
    document.getElementById('sp-scope').innerHTML = MAG.replace('viewBox', 'style="display:none" viewBox') + scopeText();
    document.getElementById('sp-ov').classList.add('open');
    document.getElementById('sp-input').focus();
  }
  function closeSearchPal() {
    const ov = document.getElementById('sp-ov');
    if (ov) ov.classList.remove('open');
  }

  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearchPal(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); openSearchPal(); }
    else if (e.key === 'Escape') closeSearchPal();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;
    const b = document.createElement('button');
    b.className = 'icon-btn'; b.title = 'Search (\u2318K)';
    b.innerHTML = MAG;
    b.addEventListener('click', openSearchPal);
    themeBtn.parentNode.insertBefore(b, themeBtn);
  });
})();
