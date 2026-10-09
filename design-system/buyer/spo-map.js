/* Line Connector — the one invoice-mapping interaction for SPOs.
   Invoice lines (right) connect to SPO lines (left, grouped by SPO) by dragging between connector dots,
   or clicking one dot on each side. Many-to-many: one invoice line can fan out across SPO lines
   (split amounts must add up), and several invoice lines can land on one SPO line.
   Used by the single-SPO mapping takeover (spo.html) and standalone intake (spo-invoice.html).

   Context (CX.use): { spos: [SPO…], inv: { lines:[{desc, amt, maps:[{spo, line, amt, sug}], res, resGl, resUnit, resSpo, resReason, manual}], tax, ship, … },
                       ro: bool, edit: bool, onChange: fn } */
(function () {
  const money = SPO.money, r2 = SPO.r2;
  const SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  const I = {
    ai: SVG + '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
    x: SVG + '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    check: SVG + '<path d="M20 6 9 17l-5-5"/></svg>',
    warn: SVG + '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    wand: SVG + '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>',
    pen: SVG + '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>',
    plus: SVG + '<path d="M5 12h14"/><path d="M12 5v14"/></svg>'
  };
  let C = null, sel = null, drag = null;

  const sumMaps = l => r2((l.maps || []).reduce((a, m) => a + (m.amt || 0), 0));
  const spo = id => C.spos.find(s => s.id === +id);
  /* Units the invoice line names ("Unit 105", "Units 102 & 103") — only numbers after the word unit, never dates. */
  function unitsIn(desc) {
    const out = [], re = /units?\s*#?\s*((?:\d{2,4}(?:\s*(?:,|&|and|\/)\s*)?)+)/ig;
    let m; while ((m = re.exec(desc || ''))) (m[1].match(/\d{2,4}/g) || []).forEach(n => out.push(n.padStart(4, '0')));
    return out;
  }
  /* A connection crosses units when the invoice line names units and the SPO line is allocated to none of them. */
  function unitMismatch(l, m) {
    const named = unitsIn(l.desc); if (!named.length) return null;
    const s = spo(m.spo); if (!s || !s.lines[m.line]) return null;
    const own = [...new Set(s.lines[m.line].alloc.map(a => a.unit))];
    if (own.some(u => named.indexOf(u) >= 0)) return null;
    const where = own.filter(u => u !== 'COMMON').length ? own.filter(u => u !== 'COMMON').map(u => 'unit ' + u).join(', ') : 'Common area';
    return 'Invoice line names unit ' + named.map(u => u.replace(/^0+/, '')).join(' & ') + ', but SPO-' + m.spo + ' · Line ' + (m.line + 1) + ' is ' + where;
  }
  const unitOf = m => { const s = spo(m.spo); if (!s || !s.lines[m.line]) return ''; const u = [...new Set(s.lines[m.line].alloc.map(a => a.unit === 'COMMON' ? 'Common area' : 'Unit ' + a.unit))]; return u.join(' + '); };
  const est = (s, k) => r2(s.lines[k].qty * s.lines[k].price);
  const live = () => C.inv.lines.filter(l => l.res !== 'remove');

  /* ---------- state ---------- */
  function prepare(inv, defSpo, ro) {
    inv.lines.forEach(l => {
      l.maps = l.maps || [];
      l.maps.forEach(m => { if (m.spo == null) m.spo = defSpo; if (m.sug === undefined) m.sug = !ro && !l.confirmed && l.conf !== 'manual'; if (ro) m.sug = false; });
      if ((l.res === 'add' || l.res === 'extra') && !l.resSpo) l.resSpo = defSpo;
    });
    return inv;
  }
  function resolved(l) {
    if (l.res === 'remove') return !!(l.resReason || '').trim();
    if (l.res === 'add' || l.res === 'extra') return !!(l.resGl && l.resUnit && l.resSpo);
    return l.maps.length > 0 && l.amt > 0 && Math.abs(sumMaps(l) - l.amt) < 0.005 && l.maps.every(m => !m.sug);
  }
  function status(l) {
    if (l.res) return resolved(l) ? 'ok' : 'attn';
    if (!l.maps.length) return 'attn';
    if (l.maps.some(m => m.sug)) return 'sug';
    return Math.abs(sumMaps(l) - l.amt) < 0.005 ? 'ok' : 'bad';
  }
  const allResolved = () => C.inv.lines.length > 0 && C.inv.lines.every(resolved);
  const doneCount = () => C.inv.lines.filter(resolved).length;
  /* invoiced per SPO line (connected amounts) */
  function perLine() {
    const per = {};
    C.inv.lines.forEach(l => { if (!l.res) l.maps.forEach(m => { const k = m.spo + ':' + m.line; per[k] = r2((per[k] || 0) + (m.amt || 0)); }); });
    return per;
  }
  /* what each SPO is billed: connected lines + extras/added lines booked to it */
  function perSpo() {
    const out = {};
    C.spos.forEach(s => { out[s.id] = { est: SPO.total(s), lines: 0, extra: 0, added: 0 }; });
    C.inv.lines.forEach(l => {
      if (l.res === 'extra' && out[l.resSpo]) out[l.resSpo].extra = r2(out[l.resSpo].extra + l.amt);
      else if (l.res === 'add' && out[l.resSpo]) out[l.resSpo].added = r2(out[l.resSpo].added + l.amt);
      else if (!l.res) l.maps.forEach(m => { if (out[m.spo]) out[m.spo].lines = r2(out[m.spo].lines + (m.amt || 0)); });
    });
    Object.values(out).forEach(o => { o.billed = r2(o.lines + o.extra + o.added); o.base = r2(o.est + o.added); o.variance = r2(o.billed - o.base); });
    return out;
  }
  /* invoice-level tax/shipping split pro-rata across SPOs by what each is billed; last SPO takes the cents */
  function shares(total, override) {
    const ps = perSpo(), ids = C.spos.map(s => s.id), billed = ids.map(id => ps[id].billed), sum = billed.reduce((a, b) => a + b, 0);
    if (override && ids.every(id => override[id] != null)) return Object.fromEntries(ids.map(id => [id, r2(override[id])]));
    let left = r2(total || 0); const out = {};
    ids.forEach((id, i) => { const v = i === ids.length - 1 ? left : r2((total || 0) * (sum ? billed[i] / sum : 1 / ids.length)); out[id] = v; left = r2(left - v); });
    return out;
  }
  const taxShares = () => shares(C.inv.tax, C.inv.taxSplit);
  const shipShares = () => shares(C.inv.ship, null);
  const taxOk = () => !C.inv.tax || Math.abs(Object.values(taxShares()).reduce((a, b) => a + b, 0) - C.inv.tax) < 0.005;

  /* ---------- actions ---------- */
  const changed = () => C.onChange();
  function connect(i, spoId, line) {
    const l = C.inv.lines[i]; if (C.ro || !l) return;
    if (l.maps.some(m => m.spo === +spoId && m.line === +line)) { l.maps.forEach(m => { if (m.spo === +spoId && m.line === +line) m.sug = false; }); changed(); return; }
    l.res = null; l.maps.push({ spo: +spoId, line: +line, amt: 0, sug: false }); l.conf = 'manual';
    resplit(l); changed();
  }
  function resplit(l) {
    if (l.maps.length === 1) { l.maps[0].amt = l.amt; return; }
    const each = r2(l.amt / l.maps.length);
    l.maps.forEach((m, k) => { m.amt = k === l.maps.length - 1 ? r2(l.amt - each * (l.maps.length - 1)) : each; });
  }
  function unlink(i, k) { const l = C.inv.lines[i]; l.maps.splice(k, 1); if (l.maps.length) resplit(l); changed(); }
  function setAmt(i, k, v) { const n = parseFloat(String(v).replace(/[$,]/g, '')); C.inv.lines[i].maps[k].amt = isNaN(n) ? 0 : r2(n); changed(); }
  function accept(i) { C.inv.lines[i].maps.forEach(m => { m.sug = false; }); changed(); }
  /* Auto Map: accept every suggestion, then connect unmatched lines to an SPO line with the same amount and the most words in common.
     Never maps everything to one line. */
  function autoMap() {
    const taken = new Set();
    C.inv.lines.forEach(l => l.maps.forEach(m => { m.sug = false; taken.add(m.spo + ':' + m.line); }));
    const words = t => (t || '').toLowerCase().match(/[a-z]{3,}/g) || [];
    C.inv.lines.forEach(l => {
      if (l.res || l.maps.length) return;
      let best = null, score = 0;
      C.spos.forEach(s => s.lines.forEach((sl, k) => {
        if (taken.has(s.id + ':' + k)) return;
        const w = words(sl.desc), hit = words(l.desc).filter(x => w.indexOf(x) >= 0).length + (Math.abs(est(s, k) - l.amt) < 0.005 ? 3 : 0);
        if (hit > score) { score = hit; best = [s.id, k]; }
      }));
      if (best && score >= 3) { l.maps.push({ spo: best[0], line: best[1], amt: l.amt, sug: false }); taken.add(best[0] + ':' + best[1]); }
    });
    changed();
  }
  function pick(i, v) {
    if (v === '') return;
    const l = C.inv.lines[i];
    if (v === 'none') { l.maps = []; l.res = l.res || null; changed(); return; }
    const [s, k] = v.split(':'); connect(i, s, k);
  }
  function res(i, k) { const l = C.inv.lines[i]; l.res = l.res === k ? null : k; if (l.res) { l.maps = []; if (!l.resSpo) l.resSpo = C.spos[0].id; } changed(); }
  function set(i, f, v) { C.inv.lines[i][f] = f === 'resSpo' ? +v : v; changed(); }
  function lineAmt(i, v) { const n = parseFloat(String(v).replace(/[$,]/g, '')); const l = C.inv.lines[i]; l.amt = isNaN(n) ? 0 : r2(n); if (l.maps.length) resplit(l); changed(); }
  function lineDesc(i, v) { C.inv.lines[i].desc = v; changed(); }
  function addLine() { C.inv.lines.push({ desc: '', amt: 0, maps: [], manual: true }); C.edit = true; changed(); }
  function rmLine(i) { C.inv.lines.splice(i, 1); changed(); }
  function toggleEdit() { C.edit = !C.edit; changed(); }
  function setTax(id, v) {
    const n = parseFloat(String(v).replace(/[$,]/g, ''));
    const cur = taxShares(); C.inv.taxSplit = Object.assign({}, cur, { [id]: isNaN(n) ? 0 : r2(n) }); changed();
  }
  function resetTax() { delete C.inv.taxSplit; changed(); }

  /* ---------- render ---------- */
  function varChip(d) {
    if (Math.abs(d) < 0.005) return '<span class="lm-var on">On estimate</span>';
    return '<span class="lm-var ' + (d > 0 ? 'over' : 'under') + '">' + (d > 0 ? '+' : '−') + money(Math.abs(d)) + (d > 0 ? ' over' : ' under') + '</span>';
  }
  function chips(s, k) {
    return '<div class="alloc-row">' + s.lines[k].alloc.map(a => '<span class="alloc-chip"><span class="code">' + a.gl + '</span>' + SPO.glName(a.gl) + '<span class="sep"></span><a class="unit-link" href="unit-history.html#' + s.prop + '/' + a.unit + '" target="_blank" rel="noopener" title="Unit history">' + SPO.unitLabel(a.unit) + '</a></span>').join('') + '</div>';
  }
  function toolbar() {
    return '<div class="cx-toolbar"><span class="cx-hint">' + (C.ro ? 'How each invoice line was matched.' : 'Drag between connectors, or click one on each side to match.') + '</span>' +
      '<span class="cx-legend"><span><i class="sug"></i>Suggested</span><span><i class="ok"></i>Mapped</span></span>' +
      (C.ro ? '' : '<button class="btn btn-sm" style="display:inline-flex;align-items:center;gap:6px" onclick="CX.toggleEdit()"><span style="display:inline-flex;width:14px;height:14px">' + I.pen + '</span>' + (C.edit ? 'Done editing lines' : 'Edit invoice lines') + '</button>' +
        '<button class="btn btn-sm" style="display:inline-flex;align-items:center;gap:6px" onclick="CX.autoMap()"><span style="display:inline-flex;width:14px;height:14px">' + I.wand + '</span>Auto Map</button>') + '</div>';
  }
  function board() {
    const per = perLine(), ps = perSpo(), multi = C.spos.length > 1;
    const connected = new Set(); C.inv.lines.forEach(l => { if (!l.res) l.maps.forEach(m => connected.add(m.spo + ':' + m.line)); });
    const left = C.spos.map(s => '<div class="cx-group">' + (multi || s.series ? '<div class="cx-group-h"><a class="table-link" href="spo.html#' + s.id + '" target="_blank" rel="noopener">SPO-' + s.id + '</a><span class="m">' + (s.run ? 'Run ' + SPO.fmtDate(s.run) + ' · ' : '') + 'estimate ' + money(SPO.total(s)) + '</span>' + varChip(ps[s.id].variance) + '</div>' : '') +
      s.lines.map((sl, k) => {
        const key = s.id + ':' + k, on = connected.has(key), d = r2((per[key] || 0) - est(s, k));
        return '<div class="cx-card cx-l' + (on ? ' on' : '') + (sel && sel.side === 'l' && sel.key === key ? ' sel' : '') + '" data-key="' + key + '">' +
          '<div class="cx-row"><span class="cx-ref">SPO-' + s.id + ' · Line ' + (k + 1) + '</span><span class="cx-k">SPO estimate</span></div>' +
          '<div class="cx-row"><span class="cx-desc">' + sl.desc + '</span><span class="cx-amt muted">' + money(est(s, k)) + '</span></div>' + chips(s, k) +
          (on ? '<div class="cx-row" style="margin-top:6px"><span class="cx-k">Invoiced ' + money(per[key]) + '</span>' + varChip(d) + '</div>' : '') +
          (C.ro ? '' : '<button class="cx-dot' + (on ? ' on' : '') + '" data-side="l" data-key="' + key + '" aria-label="Connect SPO-' + s.id + ' line ' + (k + 1) + '"></button>') + '</div>';
      }).join('') + '</div>').join('');

    const opts = '<option value="">Connect to…</option>' + C.spos.map(s => '<optgroup label="SPO-' + s.id + '">' + s.lines.map((sl, k) => '<option value="' + s.id + ':' + k + '">Line ' + (k + 1) + ' · ' + sl.desc + ' · ' + money(est(s, k)) + '</option>').join('') + '</optgroup>').join('') + '<option value="none">Not on ' + (multi ? 'any SPO' : 'the SPO') + '…</option>';
    const right = C.inv.lines.map((l, i) => {
      const st = status(l), key = 'r:' + i;
      const stateChip = { ok: '<span class="cx-state ok">' + I.check + (l.res === 'remove' ? 'Removed — not payable' : l.res === 'extra' ? 'One-time extra' : l.res === 'add' ? 'Added to SPO-' + l.resSpo : 'Mapped' + (l.maps.length > 1 ? ' · ' + l.maps.length + ' SPO lines' : '')) + '</span>',
        sug: '<span class="cx-state sug">' + I.ai + 'Suggested by Scout AI</span>' + (C.ro ? '' : '<button class="w-linkbtn" onclick="CX.accept(' + i + ')">Accept</button>'),
        bad: '<span class="cx-state attn">' + I.warn + 'Split totals ' + money(sumMaps(l)) + ' of ' + money(l.amt) + '</span>',
        attn: '<span class="cx-state attn">' + I.warn + (l.res ? 'Finish the details below' : 'Needs a match') + '</span>' }[st];
      const desc = C.edit && !C.ro ? '<input class="ivt-map-sel" style="height:32px" value="' + (l.desc || '').replace(/"/g, '&quot;') + '" placeholder="Line description from the PDF" onchange="CX.lineDesc(' + i + ', this.value)">' : '<span class="cx-desc">' + (l.desc || '<span style="color:var(--muted-foreground)">Untitled line</span>') + '</span>';
      const amt = C.edit && !C.ro ? '<span class="money-in" style="height:32px"><span class="cur">$</span><input inputmode="decimal" value="' + (l.amt ? l.amt.toFixed(2) : '') + '" onfocus="this.select()" onchange="CX.lineAmt(' + i + ', this.value)"></span>' : '<span class="cx-amt">' + money(l.amt) + '</span>';
      let body = '';
      if (l.maps.length > 1 || (l.maps.length && st === 'bad')) body += '<div class="cx-maps">' + l.maps.map((m, k) => '<div class="cx-map' + (unitMismatch(l, m) ? ' warn' : '') + '"><span>→ SPO-' + m.spo + ' · Line ' + (m.line + 1) + ' · ' + unitOf(m) + '</span>' +
        (C.ro ? '<b>' + money(m.amt) + '</b>' : '<span class="money-in" style="height:30px"><span class="cur">$</span><input inputmode="decimal" value="' + (m.amt || 0).toFixed(2) + '" onfocus="this.select()" onchange="CX.setAmt(' + i + ', ' + k + ', this.value)"></span><button class="row-action" title="Remove connection" onclick="CX.unlink(' + i + ', ' + k + ')">' + I.x + '</button>') + '</div>' + (unitMismatch(l, m) ? '<div class="cx-unitwarn">' + I.warn + '<span>' + unitMismatch(l, m) + ' — check the split, or reconnect.</span></div>' : '')).join('') + '</div>';
      else if (l.maps.length === 1 && !C.ro) body += '<div class="cx-maps"><div class="cx-map' + (unitMismatch(l, l.maps[0]) ? ' warn' : '') + '"><span>→ SPO-' + l.maps[0].spo + ' · Line ' + (l.maps[0].line + 1) + ' · ' + spo(l.maps[0].spo).lines[l.maps[0].line].desc + ' · ' + unitOf(l.maps[0]) + '</span><button class="row-action" title="Remove connection" onclick="CX.unlink(' + i + ', 0)">' + I.x + '</button></div>' + (unitMismatch(l, l.maps[0]) ? '<div class="cx-unitwarn">' + I.warn + '<span>' + unitMismatch(l, l.maps[0]) + ' — check you connected the right line.</span></div>' : '') + '</div>';
      if (!l.maps.length && !C.ro) body += resolver(l, i);
      else if (C.ro && l.res) body += '<div class="cx-k" style="margin-top:6px">' + (l.res === 'remove' ? '“' + (l.resReason || '') + '”' : 'Booked to ' + l.resGl + ' ' + SPO.glName(l.resGl) + ' · ' + SPO.unitLabel(l.resUnit) + (C.spos.length > 1 ? ' · SPO-' + l.resSpo : '')) + '</div>';
      return '<div class="cx-card cx-r ' + st + (sel && sel.side === 'r' && sel.key === key ? ' sel' : '') + (l.res === 'remove' ? ' gone' : '') + '" data-key="' + key + '">' +
        (C.ro || l.res ? '' : '<button class="cx-dot' + (l.maps.length ? ' on' : '') + '" data-side="r" data-key="' + key + '" aria-label="Connect invoice line ' + (i + 1) + '"></button>') +
        '<div class="cx-row"><span class="cx-ref">Invoice line ' + (i + 1) + (l.manual ? '' : ' <span class="lm-ai">' + I.ai + 'Scout AI</span>') + '</span><span class="cx-k">Invoice cost</span></div>' +
        '<div class="cx-row" style="gap:10px">' + desc + amt + (C.edit && !C.ro && C.inv.lines.length > 1 ? '<button class="row-action" title="Remove line" onclick="CX.rmLine(' + i + ')">' + I.x + '</button>' : '') + '</div>' +
        '<div class="cx-row" style="margin-top:8px;justify-content:flex-start;gap:10px;flex-wrap:wrap">' + stateChip + (!l.res && l.maps.some(m => unitMismatch(l, m)) ? '<span class="cx-state attn">' + I.warn + 'Unit mismatch</span>' : '') + (C.ro ? '' : '<select class="cx-pick" aria-label="Connect invoice line ' + (i + 1) + ' to an SPO line" onchange="CX.pick(' + i + ', this.value)">' + opts + '</select>') + '</div>' + body + '</div>';
    }).join('') + (C.edit && !C.ro ? '<button class="btn btn-sm" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px" onclick="CX.addLine()"><span style="display:inline-flex;width:14px;height:14px">' + I.plus + '</span>Add invoice line</button>' : '');

    return toolbar() + '<div class="cx-board" id="cx-board"><div class="cx-col"><div class="cx-col-h"><b>SPO line items</b><span>' + (multi ? C.spos.length + ' SPOs · original descriptions and estimates' : 'Original descriptions and estimates') + '</span></div>' + left + '</div>' +
      '<div class="cx-gutter"></div><div class="cx-col"><div class="cx-col-h"><b>Invoice line items</b><span>Invoice descriptions and costs to apply</span></div>' + right + '</div><svg class="cx-svg" id="cx-svg"></svg><div class="cx-labels" id="cx-labels"></div></div>';
  }
  function resolver(l, i) {
    const multi = C.spos.length > 1, prop = C.spos[0].prop;
    const opt = (k, t, sub) => '<button class="lm-opt' + (l.res === k ? ' sel' : '') + '" onclick="CX.res(' + i + ', \'' + k + '\')"><span class="rd"></span><span><b>' + t + '</b><span class="s">' + sub + '</span></span></button>';
    const spoSel = multi ? '<div><label>Booked to</label><select class="ivt-map-sel" onchange="CX.set(' + i + ', \'resSpo\', this.value)">' + C.spos.map(s => '<option value="' + s.id + '"' + (l.resSpo === s.id ? ' selected' : '') + '>SPO-' + s.id + '</option>').join('') + '</select></div>' : '';
    const glSel = '<div><label>GL code</label><select class="ivt-map-sel" onchange="CX.set(' + i + ', \'resGl\', this.value)"><option value="">GL code…</option>' + SPO.GL.map(([c, n]) => '<option value="' + c + '"' + (l.resGl === c ? ' selected' : '') + '>' + c + ' · ' + n + '</option>').join('') + '</select></div>';
    const unitSel = '<div><label>Unit</label><select class="ivt-map-sel" onchange="CX.set(' + i + ', \'resUnit\', this.value)"><option value="">Unit…</option><option value="COMMON"' + (l.resUnit === 'COMMON' ? ' selected' : '') + '>Common area</option>' + SPO.units(prop).map(u => '<option value="' + u.code + '"' + (l.resUnit === u.code ? ' selected' : '') + '>Unit ' + u.code + ' · Bldg ' + u.bldg + '</option>').join('') + '</select></div>';
    const fields = '<div class="lm-fields"' + (multi ? ' style="grid-template-columns:1fr 1fr 1fr"' : '') + '>' + spoSel + glSel + unitSel + '</div>';
    return '<div class="cx-res"><div class="w-note warn" style="margin:0 0 6px">' + I.warn + '<span>Not on ' + (multi ? 'any selected SPO' : 'SPO-' + C.spos[0].id) + '. Connect it, or choose how to handle it.</span></div>' +
      opt('add', 'Add to the SPO as a new line', 'Amends the SPO — its scope now includes this work') + (l.res === 'add' ? fields : '') +
      opt('extra', 'Accept as a one-time extra charge', 'Booked to a GL and unit on this invoice only') + (l.res === 'extra' ? fields : '') +
      opt('remove', 'Remove — not payable', 'Left out of the payable total; the vendor sees your reason') +
      (l.res === 'remove' ? '<div style="margin-left:26px"><textarea class="claim-note" style="min-height:52px" placeholder="Why isn’t this payable?" onchange="CX.set(' + i + ', \'resReason\', this.value)">' + (l.resReason || '') + '</textarea></div>' : '') + '</div>';
  }
  function totals() {
    const ps = perSpo(), tax = taxShares(), multi = C.spos.length > 1;
    const payable = r2(live().reduce((a, l) => a + (l.amt || 0), 0));
    const row = (label, note, ours, theirs, v, extra) => '<div class="ivt-row amt"><span></span><span><span class="ivt-amt-l">' + label + '</span>' + (note ? '<span class="ivt-warn" style="color:var(--muted-foreground)">' + note + '</span>' : '') + '</span><span class="ivt-c">' + ours + '</span><span class="ivt-c ivt-ai">' + theirs + '</span><span class="ivt-c"' + (v && v !== '—' && v !== '$0.00' ? ' style="color:#b45309;font-weight:600"' : '') + '>' + v + '</span>' + (extra || '') + '</div>';
    const vtxt = d => Math.abs(d) < 0.005 ? '$0.00' : (d > 0 ? '+' : '−') + money(Math.abs(d));
    let h = '<div class="ivt-table"><div class="ivt-row hd amt"><span></span><span class="ivt-amt-l">' + (multi ? 'SPO' : 'Amount') + '</span><span class="ivt-c">Estimate</span><span class="ivt-c ivt-ai">Invoice<em>Extracted by Scout AI</em></span><span class="ivt-c">Variance</span></div>';
    C.spos.forEach(s => { const o = ps[s.id];
      h += row(multi ? 'SPO-' + s.id : 'Lines', (o.added ? 'Estimate ' + money(o.est) + ' + ' + money(o.added) + ' added' : 'Against the SPO estimate — never a $0 baseline') + (o.extra ? ' · ' + money(o.extra) + ' one-time extra' : ''), money(o.base), money(o.billed), vtxt(o.variance)); });
    const removed = r2(C.inv.lines.filter(l => l.res === 'remove').reduce((a, l) => a + (l.amt || 0), 0));
    if (removed) h += row('Removed — not payable', '', '—', '−' + money(removed), '—');
    h += row('Sales tax', multi ? 'Invoice-level · split across SPOs by billed amount' : 'Invoice-level · not compared to line estimates', '—', money(C.inv.tax || 0), '—');
    if (C.inv.ship) h += row('Shipping', 'Invoice-level', '—', money(C.inv.ship), '—');
    h += row('Invoice total', '', '', money(r2(payable + (C.inv.tax || 0) + (C.inv.ship || 0))), '') + '</div>';
    if (multi && C.inv.tax) {
      const sum = r2(Object.values(tax).reduce((a, b) => a + b, 0));
      h += '<div class="cx-taxsplit"><div class="cx-row"><b style="font-size:13.5px">Tax split</b>' + (C.inv.taxSplit && !C.ro ? '<button class="w-linkbtn" onclick="CX.resetTax()">Reset to proportional</button>' : '<span class="cx-k">Proportional to each SPO’s billed amount</span>') + '</div>' +
        C.spos.map(s => '<div class="cx-map"><span>SPO-' + s.id + '</span>' + (C.ro ? '<b>' + money(tax[s.id]) + '</b>' : '<span class="money-in" style="height:30px"><span class="cur">$</span><input inputmode="decimal" value="' + tax[s.id].toFixed(2) + '" onfocus="this.select()" onchange="CX.setTax(' + s.id + ', this.value)"></span>') + '</div>').join('') +
        (Math.abs(sum - C.inv.tax) > 0.005 ? '<div class="w-note warn">' + I.warn + '<span>Tax shares total ' + money(sum) + ' — they need to add up to ' + money(C.inv.tax) + '.</span></div>' : '') + '</div>';
    }
    return h;
  }

  /* ---------- connectors: drawing + drag / click ---------- */
  function center(el, box) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top]; }
  const curve = (a, b) => { const dx = Math.max(40, Math.abs(b[0] - a[0]) / 2); return 'M' + a[0] + ' ' + a[1] + ' C' + (a[0] + dx) + ' ' + a[1] + ', ' + (b[0] - dx) + ' ' + b[1] + ', ' + b[0] + ' ' + b[1]; };
  function anchor(side, key) {
    const card = document.querySelector('#cx-board .cx-' + side + '[data-key="' + key + '"]'); if (!card) return null;
    const dot = card.querySelector('.cx-dot'); if (dot) return dot;
    return card; // read-only: anchor on the card edge
  }
  function edgePoint(el, side, box) {
    if (el.classList.contains('cx-dot')) return center(el, box);
    const r = el.getBoundingClientRect(); return [side === 'l' ? r.right - box.left : r.left - box.left, r.top + r.height / 2 - box.top];
  }
  function draw(tmp) {
    const b = document.getElementById('cx-board'), svg = document.getElementById('cx-svg'); if (!b || !svg) return;
    const box = b.getBoundingClientRect();
    let p = ''; const labels = [];
    C.inv.lines.forEach((l, i) => { if (l.res) return; const st = status(l), r = anchor('r', 'r:' + i); if (!r) return;
      l.maps.forEach(m => { const le = anchor('l', m.spo + ':' + m.line); if (!le) return;
        const a = edgePoint(le, 'l', box), z = edgePoint(r, 'r', box), warn = unitMismatch(l, m);
        p += '<path class="cx-link ' + (m.sug ? 'sug' : st === 'bad' || warn ? 'bad' : 'ok') + '" d="' + curve(a, z) + '"/>';
        labels.push({ a, z, txt: money(m.amt || 0), cls: m.sug ? 'sug' : st === 'bad' || warn ? 'bad' : '' }); }); });
    if (tmp) p += '<path class="cx-link tmp" d="' + curve(tmp[0], tmp[1]) + '"/>';
    svg.innerHTML = p;
    /* Each connection carries its dollar share on the line (production shows "1/4"; dollars stay true once a share is edited).
       Labels sit at the curve's midpoint and slide along it to avoid each other. */
    const lab = document.getElementById('cx-labels'); if (!lab) return;
    const placed = [];
    lab.innerHTML = tmp ? '' : labels.map(L => {
      const dx = Math.max(40, Math.abs(L.z[0] - L.a[0]) / 2), P = [L.a, [L.a[0] + dx, L.a[1]], [L.z[0] - dx, L.z[1]], L.z];
      const at = t => { const u = 1 - t; return [0, 1].map(k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
      let pt = at(0.5);
      for (const t of [0.5, 0.36, 0.64, 0.26, 0.74]) { const q = at(t); if (!placed.some(o => Math.abs(o[0] - q[0]) < 46 && Math.abs(o[1] - q[1]) < 18)) { pt = q; break; } }
      placed.push(pt);
      return '<span class="cx-label ' + L.cls + '" style="left:' + pt[0].toFixed(1) + 'px;top:' + pt[1].toFixed(1) + 'px">' + L.txt + '</span>';
    }).join('');
  }
  function onDown(e) {
    const dot = e.target.closest('.cx-dot'); if (!dot || C.ro) return;
    e.preventDefault();
    const box = document.getElementById('cx-board').getBoundingClientRect();
    drag = { side: dot.dataset.side, key: dot.dataset.key, x: e.clientX, y: e.clientY, moved: false, from: center(dot, box) };
    document.getElementById('cx-board').classList.add('dragging');
  }
  function onMove(e) {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) drag.moved = true;
    if (!drag.moved) return;
    const box = document.getElementById('cx-board').getBoundingClientRect(), pt = [e.clientX - box.left, e.clientY - box.top];
    draw(drag.side === 'l' ? [drag.from, pt] : [pt, drag.from]);
  }
  function onUp(e) {
    if (!drag) return;
    const d = drag; drag = null;
    const b = document.getElementById('cx-board'); if (b) b.classList.remove('dragging');
    if (d.moved) {
      const hit = document.elementFromPoint(e.clientX, e.clientY), target = hit && (hit.closest('.cx-dot') || hit.closest('.cx-card'));
      const side = target && (target.dataset.side || (target.classList.contains('cx-l') ? 'l' : target.classList.contains('cx-r') ? 'r' : null));
      if (target && side && side !== d.side) { join(d, { side, key: target.dataset.key }); return; }
      draw(); return;
    }
    // click: select, or complete a pending selection on the other side
    if (sel && sel.side !== d.side) { const a = sel; sel = null; join(a, d); return; }
    sel = sel && sel.key === d.key ? null : { side: d.side, key: d.key };
    changed();
  }
  function join(a, b) {
    const r = a.side === 'r' ? a : b, l = a.side === 'l' ? a : b;
    const i = +r.key.slice(2), [s, k] = l.key.split(':');
    sel = null; connect(i, s, k);
  }
  let bound = false;
  function mount() {
    draw();
    const b = document.getElementById('cx-board'); if (!b) return;
    if (!bound) {
      bound = true;
      /* one delegated listener — the board is re-rendered on every change */
      document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('#cx-board')) onDown(e); });
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('resize', () => draw());
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && sel) { sel = null; changed(); } });
      document.addEventListener('scroll', () => draw(), true);
    }
    if (window.ResizeObserver && !b._ro) { b._ro = new ResizeObserver(() => draw()); b._ro.observe(b); }
  }

  window.CX = {
    use(ctx) {
      if (!C || C.inv !== ctx.inv) sel = null; C = ctx;
      /* A connection to an SPO that isn't on the board (e.g. unticked in intake step 1) is dropped, never drawn. */
      const ids = C.spos.map(s => s.id);
      C.inv.lines.forEach(l => {
        const before = (l.maps || []).length;
        l.maps = (l.maps || []).filter(m => ids.indexOf(+m.spo) >= 0 && C.spos.find(s => s.id === +m.spo).lines[m.line]);
        if (l.maps.length && l.maps.length !== before) resplit(l);
        if ((l.res === 'add' || l.res === 'extra') && ids.indexOf(+l.resSpo) < 0) l.resSpo = ids[0];
      });
      return C;
    }, prepare, resolved, status, allResolved, doneCount, perSpo, taxShares, shipShares, taxOk, sumMaps,
    board, totals, mount, draw, unitsIn, unitMismatch,
    connect, unlink, setAmt, accept, autoMap, pick, res, set, lineAmt, lineDesc, addLine, rmLine, toggleEdit, setTax, resetTax
  };
})();
