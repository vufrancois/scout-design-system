/* Invoice documents and the payment packet — shared by the SPO page and the invoice page (TKT-SPO-61/62).
   Accounting receives INVOICES: the invoice as the vendor sent it, plus every line's GL code and unit across all the
   SPOs it covers. SPO numbers appear only as a reference. Pages pass the property record (each page owns PROPERTIES). */
(function () {
  const money = SPO.money, r2 = SPO.r2;

  /* The vendor's invoice as text. inv may be one SPO's slice or a whole invoice assembled from every SPO's slice. */
  function pdfLines(s, inv, p) {
    const W = 62, pad = (a, b) => a + ' '.repeat(Math.max(2, W - a.length - b.length)) + b, v = SPO.VEN[s.v];
    const out = [v.name.toUpperCase(), v.email, '', pad('INVOICE', inv.num), pad('Date', SPO.fmtDate(inv.date)), pad('PO reference', inv.poRef || 'SPO-' + s.id), '', 'BILL TO', p.name, p.addr + ', ' + p.city, '', '-'.repeat(W)];
    inv.lines.forEach(l => out.push(pad((l.desc || '').slice(0, 44), money(l.amt || 0))));
    out.push('-'.repeat(W), pad('Subtotal', money(inv.lines.reduce((a, l) => a + (l.amt || 0), 0))));
    if (inv.tax) out.push(pad('Sales tax', money(inv.tax)));
    out.push(pad(inv.shared ? 'THIS SPO’S SHARE' : 'TOTAL DUE', money(r2(inv.lines.reduce((a, l) => a + (l.amt || 0), 0) + (inv.tax || 0) + (inv.ship || 0)))));
    if (inv.shared) out.push('', 'Shared invoice · ' + inv.shared.idx + ' of ' + inv.shared.spos.length + ' SPOs (' + inv.shared.spos.map(id => 'SPO-' + id).join(', ') + ')', pad('Invoice total', money(inv.shared.total)));
    out.push('', 'Terms: Net 30 · Remit to ' + v.name);
    return out.join('\n');
  }

  /* The whole invoice, assembled from every SPO's slice (removed lines left out). */
  function whole(s, inv) {
    const peers = SPO.invPeers(s, inv);
    return { num: inv.num, date: inv.date, ship: 0, lines: [].concat(...peers.map(x => x.rec.lines.filter(l => l.status !== 'removed'))),
      tax: r2(peers.reduce((a, x) => a + (x.rec.tax || 0), 0)), poRef: peers.map(x => 'SPO-' + x.sp.id).join(', ') };
  }

  /* One SPO's slice of an invoice by GL code and unit. Pro-rated in cents; the last split takes the remainder so the
     packet sums to the invoice exactly. */
  function glAllocation(s, rec) {
    const rows = {}, add = (gl, unit, amt) => { const k = gl + '|' + unit; rows[k] = r2((rows[k] || 0) + amt); };
    (rec || s.invoice).lines.forEach(l => {
      if (l.status === 'removed') return;
      if (l.extra) { add(l.extra.gl, l.extra.unit, l.amt); return; }
      (l.maps || []).forEach(m => {
        const sl = s.lines[m.line], tot = sl.alloc.reduce((a, x) => a + x.amt, 0) || 1;
        let left = m.amt;
        sl.alloc.forEach((a, j) => { const amt = j === sl.alloc.length - 1 ? r2(left) : r2(m.amt * a.amt / tot); left = r2(left - amt); add(a.gl, a.unit, amt); });
      });
    });
    return Object.keys(rows).sort().map(k => { const [gl, unit] = k.split('|'); return { gl, unit, amt: rows[k] }; });
  }

  /* t = 'inv' (the invoice) or 'gl' (GL & unit allocation across every SPO on it). */
  function packDoc(s, t, p, inv) {
    inv = inv || s.invoice;
    const W = 66, pad = (a, b) => a + ' '.repeat(Math.max(2, W - a.length - b.length)) + b, peers = SPO.invPeers(s, inv), w = whole(s, inv);
    const total = inv.shared ? inv.shared.total : SPO.invTotal({ invoice: inv });
    if (t === 'inv') return pdfLines(s, w, p);
    const rows = [].concat(...peers.map(x => glAllocation(x.sp, x.rec).map(r => Object.assign(r, { spo: x.sp.id }))))
      .sort((a, b) => a.gl.localeCompare(b.gl) || a.unit.localeCompare(b.unit));
    const out = ['GL & UNIT ALLOCATION  ' + inv.num, SPO.VEN[s.v].name + ' · ' + p.name, '', pad('GL · UNIT', 'REF        AMOUNT'), '-'.repeat(W)];
    rows.forEach(r => out.push(pad((r.gl + ' ' + SPO.glName(r.gl) + ' · ' + SPO.unitLabel(r.unit)).slice(0, 44), ('SPO-' + r.spo).padEnd(9) + money(r.amt).padStart(11))));
    out.push('-'.repeat(W), pad('Allocated (lines)', money(r2(rows.reduce((a, r) => a + r.amt, 0)))));
    if (w.tax) out.push(pad('Sales tax (invoice-level)', money(w.tax)));
    out.push(pad('PAYABLE TOTAL', money(total)));
    return out.join('\n');
  }

  /* The Send-to-Accounting dialog body (the page supplies its modal(), icons and the tab variable name). */
  function packModal(s, tab, p, ic, tabVar, render) {
    const inv = s.invoice, peers = SPO.invPeers(s), total = inv.shared ? inv.shared.total : SPO.invTotal(s);
    const tabs = { inv: 'Invoice ' + inv.num, gl: 'GL & unit allocation' }, spos = peers.map(x => 'SPO-' + x.sp.id);
    return '<div class="val-modal" style="width:720px;max-width:calc(100vw - 40px)"><div class="val-head"><h2>Send invoice ' + inv.num + ' to Accounting</h2><p>' + money(total) + ' to ' + SPO.VEN[s.v].name + '. Accounting books each line by its GL code and unit.' + (spos.length > 1 ? ' Covers ' + spos.join(' and ') + ' — they move to With Accounting together.' : '') + '</p></div>' +
      '<div class="val-body" style="padding:16px 22px"><div class="tab-bar" style="margin-bottom:12px">' + Object.keys(tabs).map(k => '<button class="tab-item' + (k === tab ? ' active' : '') + '" onclick="' + tabVar + ' = \'' + k + '\'; ' + render + '()">' + tabs[k] + '</button>').join('') + '</div>' +
      '<div class="pay-doc"><pre>' + packDoc(s, tab, p) + '</pre></div>' +
      '<div style="display:flex;gap:10px;margin-top:12px;align-items:center"><span style="font-size:12.5px;color:var(--muted-foreground)">' + tabs[tab] + ' · PDF</span><button class="btn btn-sm" style="margin-left:auto;display:inline-flex;align-items:center;gap:7px" onclick="showToast(\'Payment packet downloaded\', \'Invoice and GL &amp; unit allocation · 2 PDFs\')"><span style="display:inline-flex;width:14px;height:14px">' + ic.dl + '</span>Download both</button></div></div>' +
      '<div class="val-foot"><span style="font-size:13px;color:var(--muted-foreground);margin-right:auto">' + money(total) + ' · ' + inv.num + (peers.length > 1 ? ' · ' + peers.length + ' SPOs' : '') + '</span><button class="btn" onclick="closeModal(\'pack-ov\')">Cancel</button><button class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px" onclick="sendToAccounting()"><span style="display:inline-flex;width:15px;height:15px">' + ic.send + '</span>Send invoice</button></div></div>';
  }

  /* Find an invoice by number anywhere in the store: its SPOs (peers) and an SPO that holds it. */
  function find(num) {
    for (const s of SPO.list()) { const rec = SPO.invoicesOf(s).find(r => r.num === num); if (rec) return { s, rec, peers: SPO.invPeers(s, rec) }; }
    return null;
  }

  window.PACK = { pdfLines, whole, glAllocation, packDoc, packModal, find };
})();
