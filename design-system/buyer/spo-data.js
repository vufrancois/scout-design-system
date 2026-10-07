/* Service POs (SPO) — shared store for every buyer surface that shows SPOs.
   One source of truth so the list, detail, Home and Approvals counts always reconcile.
   Seeds + a localStorage overlay (live transitions persist across pages). */
(function () {
  const KEY = 'scout-spos-v2';
  const TODAY = '2026-08-24';
  const APPROVAL_LIMIT = 2500;

  const VEN = {
    AH: { name: 'Acadiana HVAC', email: 'dispatch@acadianahvac.example', trade: 'HVAC' },
    BP: { name: 'Bayou Plumbing & Drain', email: 'service@bayouplumbing.example', trade: 'Plumbing' },
    CR: { name: 'Cajun Rooter & Plumbing', email: 'dispatch@cajunrooter.example', trade: 'Plumbing' },
    CC: { name: 'Crescent Cleaning Services', email: 'schedule@crescentclean.example', trade: 'Cleaning' },
    DE: { name: 'Delta Electric Services', email: 'office@deltaelectric.example', trade: 'Electrical' },
    GP: { name: 'Gulf Coast Painting Co.', email: 'jobs@gulfcoastpainting.example', trade: 'Painting' },
    LF: { name: 'Lakeside Fence & Gate', email: 'quotes@lakesidefence.example', trade: 'Fencing' },
    PC: { name: 'Pride Carpet Care', email: 'dispatch@pridecarpet.example', trade: 'Carpet cleaning' },
    MR: { name: 'Southern Make-Ready Co.', email: 'turns@southernmakeready.example', trade: 'Unit turns' }
  };

  const GL = [
    ['6020', 'Building Exteriors'], ['6025', 'Building Interiors'], ['6035', 'Carpet Cleaning'],
    ['6045', 'Make-Ready Cleaning'], ['6060', 'Appliance Repair'], ['6075', 'Electrical'],
    ['6090', 'Fence & Gate'], ['6100', 'Plumbing'], ['6115', 'HVAC'], ['6140', 'Paint & Plaster']
  ];
  const GL_BUDGET = { '6020': 3000, '6025': 2500, '6035': 1200, '6045': 1500, '6060': 1500, '6075': 2000, '6090': 1500, '6100': 2500, '6115': 3000, '6140': 4000 };
  const GL_SPENT = { '6020': 900, '6025': 1100, '6035': 640, '6045': 610, '6060': 820, '6075': 760, '6090': 300, '6100': 1450, '6115': 1980, '6140': 2100 };

  /* Unit master: building-based BBUU codes (0104 = building 01, unit 04). */
  const PROP_UNITS = { magnolia: 51, bayou: 120, lonestar: 78, central: 96, cypress: 64, beauchene: 40, sherwood: 88, cyprus: 32, heights: 110 };
  const PLANS = ['1X1', '2X2', '2X2', '3X2'];
  const unitCache = {};
  function units(prop) {
    if (unitCache[prop]) return unitCache[prop];
    const n = PROP_UNITS[prop] || 40;
    const bldgs = Math.ceil(n / 24), per = Math.ceil(n / bldgs);
    const out = [];
    for (let b = 1; b <= bldgs; b++) for (let u = 1; u <= per && out.length < n; u++) {
      const bb = String(b).padStart(2, '0'), uu = String(u).padStart(2, '0');
      out.push({ code: bb + uu, bldg: bb, plan: PLANS[(b + u) % PLANS.length] });
    }
    return (unitCache[prop] = out);
  }
  function unitLabel(code) {
    if (code === 'COMMON') return 'Common area';
    return 'Unit ' + code + ' · Bldg ' + code.slice(0, 2);
  }

  const STATES = {
    draft:      { label: 'Draft',                dot: 'dot-pending',  tab: 'open',     group: 'you',        rank: 0 },
    approval:   { label: 'Pending Approval',     dot: 'dot-pending',  tab: 'open',     group: 'you',        rank: 1 },
    sent:       { label: 'Awaiting Vendor',      dot: 'dot-revision', tab: 'open',     group: 'vendor',     rank: 2 },
    rejected:   { label: 'Vendor Rejected',      dot: 'dot-rejected', tab: 'open',     group: 'rejected',   rank: 3 },
    invoice:    { label: 'Awaiting Invoice',     dot: 'dot-revision', tab: 'open',     group: 'vendor',     rank: 4 },
    mapping:    { label: 'Invoice to Map',       dot: 'dot-pending',  tab: 'invoices', group: 'you',        rank: 5 },
    ready:      { label: 'Ready for Accounting', dot: 'dot-pending',  tab: 'invoices', group: 'you',        rank: 6 },
    accounting: { label: 'With Accounting',      dot: 'dot-violet',   tab: 'invoices', group: 'accounting', rank: 7 },
    paid:       { label: 'Paid',                 dot: 'dot-approved', tab: 'closed',   group: 'paid',       rank: 8 },
    canceled:   { label: 'Canceled',             dot: 'dot-rejected', tab: 'closed',   group: 'canceled',   rank: 9 }
  };

  const L = (desc, qty, price, alloc) => ({ desc, qty, price, alloc });
  const A = (gl, unit, amt) => ({ gl, unit, amt });

  const SEEDS = [
    { id: 866, state: 'draft', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Make-ready clean for a 2 BR after move-out: kitchen, baths, floors, fixtures, cabinets and windows.',
      lines: [L('Make-ready cleaning, 2 BR', 1, 225, [A('6045', '0214', 225)])],
      ev: { created: '2026-08-23 15:20' } },
    { id: 865, state: 'draft', prop: 'lonestar', v: 'LF', by: 'Jordan Ellis', period: 'Aug 2026',
      scope: 'Replace 40 ft of damaged privacy fence along the rear of Building 02.',
      lines: [L('Privacy fence replacement, 40 ft', 1, 1850, [A('6090', 'COMMON', 1850)])],
      ev: { created: '2026-08-22 11:05' } },
    { id: 864, state: 'approval', prop: 'central', v: 'AH', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Replace condenser fan motors on the four Building 03 rooftop units.',
      lines: [L('Condenser fan motor replacement', 4, 780, [A('6115', 'COMMON', 3120)])],
      ev: { created: '2026-08-22 09:40', approvalReq: '2026-08-22 09:41' } },
    { id: 863, state: 'sent', prop: 'magnolia', v: 'PC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Hot-water extraction carpet cleaning in two vacant 2 BR units.',
      lines: [L('Carpet cleaning, 2 BR', 1, 180, [A('6035', '0102', 180)]), L('Carpet cleaning, 2 BR', 1, 180, [A('6035', '0105', 180)])],
      ev: { created: '2026-08-22 14:02', sent: '2026-08-22 14:03' } },
    { id: 862, state: 'sent', prop: 'cypress', v: 'DE', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Diagnose and repair tripping GFCI kitchen circuits in two units.',
      lines: [L('GFCI circuit repair (2 units)', 1, 320, [A('6075', '0108', 160), A('6075', '0111', 160)])],
      ev: { created: '2026-08-21 10:15', sent: '2026-08-21 10:16' } },
    { id: 861, state: 'rejected', prop: 'bayou', v: 'BP', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Hydro-jet and clear the main sewer line between Buildings 01 and 02.',
      lines: [L('Main sewer line hydro-jetting', 1, 650, [A('6100', 'COMMON', 650)])],
      reject: { reason: 'Fully booked through September — we can’t schedule this within your requested window.' },
      ev: { created: '2026-08-18 08:30', sent: '2026-08-18 08:31', rejected: '2026-08-20 13:12' } },
    { id: 860, state: 'invoice', prop: 'magnolia', v: 'GP', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Interior repaint of a vacant 3 BR: walls, ceilings and trim.',
      lines: [L('Interior repaint, 3 BR', 1, 1100, [A('6140', '0303', 1100)])],
      ev: { created: '2026-08-17 09:00', sent: '2026-08-17 09:01', accepted: '2026-08-18 07:45' } },
    { id: 859, state: 'invoice', prop: 'heights', v: 'CC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Deep clean the clubhouse and fitness center ahead of the resident event.',
      lines: [L('Clubhouse deep clean', 1, 320, [A('6045', 'COMMON', 320)]), L('Fitness center deep clean', 1, 160, [A('6045', 'COMMON', 160)])],
      ev: { created: '2026-08-16 13:20', sent: '2026-08-16 13:21', accepted: '2026-08-17 08:10' } },
    { id: 858, state: 'mapping', prop: 'magnolia', v: 'PC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Hot-water extraction carpet cleaning in a vacant 2 BR.',
      lines: [L('Carpet cleaning, 2 BR', 1, 250, [A('6035', '0106', 250)])],
      invoice: { num: 'INV-30418', date: '2026-08-21', file: 'INV-30418.pdf', tax: 0, ship: 0,
        lines: [{ desc: 'Carpet cleaning, 2 BR — Unit 106', amt: 250, maps: [{ line: 0, amt: 250 }], conf: 'high' }] },
      ev: { created: '2026-08-14 10:00', sent: '2026-08-14 10:01', accepted: '2026-08-14 15:30', invoiced: '2026-08-21 16:40' } },
    { id: 857, state: 'mapping', prop: 'cypress', v: 'MR', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Make-ready for four vacant units: interior paint in 0102 and 0103, carpet cleaning in 0104, and a combined paint-and-carpet refresh in 0105.',
      lines: [
        L('Interior paint, unit 0102', 1, 400, [A('6140', '0102', 400)]),
        L('Interior paint, unit 0103', 1, 400, [A('6140', '0103', 400)]),
        L('Carpet cleaning, unit 0104', 1, 200, [A('6035', '0104', 200)]),
        L('Paint-and-carpet refresh, unit 0105', 1, 600, [A('6140', '0105', 300), A('6035', '0105', 300)])
      ],
      invoice: { num: 'INV-7781', date: '2026-08-22', file: 'INV-7781.pdf', tax: 148.30, ship: 0,
        lines: [
          { desc: 'Painting — Units 102 & 103 (walls, ceilings, trim)', amt: 800, maps: [{ line: 0, amt: 400 }, { line: 1, amt: 400 }], conf: 'split' },
          { desc: 'Carpet steam clean — Unit 104', amt: 230, maps: [{ line: 2, amt: 230 }], conf: 'high' },
          { desc: 'Make-ready refresh — Unit 105', amt: 600, maps: [{ line: 3, amt: 600 }], conf: 'high' },
          { desc: 'Debris haul-off / dump fee', amt: 125, maps: [], conf: 'none' }
        ] },
      ev: { created: '2026-08-08 09:12', sent: '2026-08-08 09:14', accepted: '2026-08-09 10:02', invoiced: '2026-08-22 11:30' } },
    { id: 856, state: 'ready', prop: 'lonestar', v: 'AH', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Recharge refrigerant and replace the run capacitor on the split system.',
      lines: [L('Refrigerant recharge + capacitor', 1, 385, [A('6115', '0207', 385)])],
      invoice: { num: 'INV-1188', date: '2026-08-12', file: 'INV-1188.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'Refrigerant recharge, run capacitor — Unit 207', amt: 385, maps: [{ line: 0, amt: 385 }], conf: 'high' }] },
      ev: { created: '2026-07-30 14:00', sent: '2026-07-30 14:01', accepted: '2026-07-31 09:20', invoiced: '2026-08-12 10:05', mapped: '2026-08-16 11:42' } },
    { id: 855, state: 'accounting', prop: 'magnolia', v: 'LF', by: 'Priya Nair', period: 'Jul 2026',
      scope: 'Repair the pool-area gate latch and replace two damaged fence panels.',
      lines: [L('Gate latch repair', 1, 140, [A('6090', 'COMMON', 140)]), L('Fence panel replacement', 2, 200, [A('6090', 'COMMON', 400)])],
      invoice: { num: 'INV-5521', date: '2026-08-06', file: 'INV-5521.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'Gate latch repair', amt: 140, maps: [{ line: 0, amt: 140 }], conf: 'high' }, { desc: 'Fence panels (2)', amt: 400, maps: [{ line: 1, amt: 400 }], conf: 'high' }] },
      ev: { created: '2026-07-28 08:45', sent: '2026-07-28 08:46', accepted: '2026-07-28 16:10', invoiced: '2026-08-06 09:30', mapped: '2026-08-10 15:05', accounting: '2026-08-12 09:00' } },
    { id: 854, state: 'paid', prop: 'bayou', v: 'DE', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Replace six exterior LED wall-pack lights on Building 01.',
      lines: [L('LED wall-pack replacement', 6, 480, [A('6075', 'COMMON', 2880)])],
      approval: { by: 'Priya Nair', reason: 'Over $2,500' },
      invoice: { num: 'INV-4410', date: '2026-07-29', file: 'INV-4410.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'LED wall-pack lights (6), installed', amt: 2880, maps: [{ line: 0, amt: 2880 }], conf: 'high' }] },
      ev: { created: '2026-07-20 10:30', approvalReq: '2026-07-20 10:31', approved: '2026-07-21 08:15', sent: '2026-07-21 08:16', accepted: '2026-07-21 13:40', invoiced: '2026-07-29 15:00', mapped: '2026-07-30 10:20', accounting: '2026-07-30 10:25', paid: '2026-08-05 12:00' } },
    { id: 853, state: 'paid', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Make-ready clean for a 1 BR after move-out.',
      lines: [L('Make-ready cleaning, 1 BR', 1, 150, [A('6045', '0110', 150)])],
      invoice: { num: 'INV-3307', date: '2026-07-22', file: 'INV-3307.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'Make-ready clean, 1 BR — Unit 110', amt: 150, maps: [{ line: 0, amt: 150 }], conf: 'high' }] },
      ev: { created: '2026-07-14 09:10', sent: '2026-07-14 09:11', accepted: '2026-07-14 12:00', invoiced: '2026-07-22 08:40', mapped: '2026-07-23 14:15', accounting: '2026-07-23 14:20', paid: '2026-07-30 11:00' } },
    { id: 852, state: 'canceled', prop: 'central', v: 'PC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Carpet cleaning in a 1 BR scheduled for turnover.',
      lines: [L('Carpet cleaning, 1 BR', 1, 140, [A('6035', '0112', 140)])],
      cancel: { by: 'Alicia Grant', reason: 'Resident renewed the lease — the unit is no longer turning over.' },
      ev: { created: '2026-08-06 11:00', sent: '2026-08-06 11:01', accepted: '2026-08-07 09:30', canceled: '2026-08-14 16:05' } },
    { id: 849, state: 'mapping', prop: 'bayou', v: 'GP', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Patch and repaint stairwell walls in Building 02.',
      lines: [L('Stairwell patch and repaint', 1, 940, [A('6140', 'COMMON', 940)])],
      invoice: { num: 'INV-2207', date: '2026-08-23', file: 'INV-2207.pdf', tax: 0, ship: 0, extractFailed: true,
        lines: [{ desc: 'Stairwell drywall patch + repaint, Bldg 02', amt: 940, maps: [{ line: 0, amt: 940 }], conf: 'high' }] },
      ev: { created: '2026-08-01 13:00', sent: '2026-08-01 13:01', accepted: '2026-08-02 09:00', invoiced: '2026-08-23 17:10' } }
  ];

  /* ---------- helpers ---------- */
  const money = v => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const r2 = v => Math.round(v * 100) / 100;
  const fmtDate = d => { if (!d) return ''; const [y, m, dd] = d.slice(0, 10).split('-'); return m + '/' + dd + '/' + y; };
  function fmtDT(s) {
    if (!s) return '';
    const [d, t] = s.split(' ');
    if (!t) return fmtDate(d);
    let [h, mi] = t.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return fmtDate(d) + ' · ' + h + ':' + String(mi).padStart(2, '0') + ' ' + ap;
  }
  const total = s => r2(s.lines.reduce((a, l) => a + l.qty * l.price, 0));
  const invSubtotal = s => s.invoice ? r2(s.invoice.lines.filter(l => l.status !== 'removed').reduce((a, l) => a + l.amt, 0)) : 0;
  const invTotal = s => s.invoice ? r2(invSubtotal(s) + (s.invoice.tax || 0) + (s.invoice.ship || 0)) : 0;
  const glName = code => (GL.find(g => g[0] === code) || [code, ''])[1];
  const needsApproval = (s, bud) => total(s) > APPROVAL_LIMIT || glOver(s, bud).length > 0;

  function budget(prop, period, excludeId) {
    const all = list().filter(s => s.prop === prop && s.period === period && s.id !== excludeId && ['draft', 'rejected', 'canceled'].indexOf(s.state) < 0);
    const out = {};
    GL.forEach(([g]) => { out[g] = { budget: GL_BUDGET[g], spent: GL_SPENT[g], committed: 0 }; });
    all.forEach(s => s.lines.forEach(l => l.alloc.forEach(a => { if (out[a.gl]) out[a.gl].committed = r2(out[a.gl].committed + a.amt); })));
    return out;
  }
  function glOver(s, bud) {
    const b = bud || budget(s.prop, s.period, s.id);
    const mine = {};
    s.lines.forEach(l => l.alloc.forEach(a => { mine[a.gl] = r2((mine[a.gl] || 0) + a.amt); }));
    return Object.keys(mine).filter(g => b[g] && b[g].spent + b[g].committed + mine[g] > b[g].budget);
  }

  function buildLog(s) {
    const e = s.ev || {}, v = VEN[s.v] || { name: s.v, email: '' };
    const out = [];
    const push = (at, t, sub, hi, bad) => { if (at) out.push({ at, t, sub, hi: !!hi, bad: !!bad }); };
    push(e.created, s.state === 'draft' ? 'Draft saved' : 'SPO created', 'by ' + s.by);
    if (e.approvalReq) push(e.approvalReq, 'Sent for approval', (s.approval && s.approval.reason) || (total(s) > APPROVAL_LIMIT ? 'Over ' + money(APPROVAL_LIMIT) + ' · Supervisor sign-off' : 'Over the GL budget · Supervisor sign-off'));
    if (e.approved) push(e.approved, 'Approved', 'by ' + ((s.approval && s.approval.by) || 'Priya Nair') + ' (Supervisor)', true);
    push(e.sent, 'Sent to vendor', 'PO emailed to ' + v.email);
    push(e.accepted, 'Vendor accepted', v.name, true);
    if (e.rejected) push(e.rejected, 'Vendor rejected', '“' + ((s.reject && s.reject.reason) || '') + '”', false, true);
    if (e.invoiced && s.invoice) push(e.invoiced, 'Invoice received', s.invoice.num + (s.invoice.extractFailed ? ' · Scout AI couldn’t read the line items' : ' · ' + money(invTotal(s))));
    push(e.mapped, 'Invoice mapped & validated', 'by Alicia Grant', true);
    push(e.accounting, 'Sent to Accounting', 'Packet: PO, invoice, GL allocation');
    push(e.paid, 'Paid', money(invTotal(s)) + ' released by Accounting', true);
    if (e.canceled && s.cancel) push(e.canceled, 'Canceled', 'by ' + s.cancel.by + ' · “' + s.cancel.reason + '”', false, true);
    return out;
  }

  /* ---------- store ---------- */
  const clone = o => JSON.parse(JSON.stringify(o));
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function store(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* storage unavailable — session only */ } }
  function hydrate(s) { if (!s.log) s.log = buildLog(s); return s; }
  function list() {
    const ov = load();
    const out = SEEDS.map(s => hydrate(ov[s.id] ? ov[s.id] : clone(s)));
    Object.keys(ov).forEach(k => { if (!SEEDS.some(s => String(s.id) === k)) out.push(hydrate(ov[k])); });
    return out.sort((a, b) => b.id - a.id);
  }
  const get = id => list().find(s => s.id === Number(id));
  function save(s) { const ov = load(); ov[s.id] = s; store(ov); }
  const nextId = () => Math.max.apply(null, list().map(s => s.id)) + 1;
  function now() {
    const d = new Date();
    return TODAY + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function log(s, t, sub, hi, bad) { s.log = s.log || buildLog(s); s.log.push({ at: now(), t, sub, hi: !!hi, bad: !!bad }); }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) { /* noop */ } }
  /* Demo reset: open any SPO page with #reset-spos (clean-URL hosting drops query strings, hashes survive). */
  try { if (location.hash === '#reset-spos') { reset(); history.replaceState(null, '', location.pathname); } } catch (e) { /* noop */ }

  function counts(prop) {
    const c = {}; Object.keys(STATES).forEach(k => c[k] = 0);
    list().forEach(s => { if (!prop || prop === 'all' || s.prop === prop) c[s.state]++; });
    return c;
  }

  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';

  window.SPO = { TODAY, APPROVAL_LIMIT, VEN, GL, GL_BUDGET, STATES, ICON,
    units, unitLabel, glName, money, r2, fmtDate, fmtDT, total, invSubtotal, invTotal,
    budget, glOver, needsApproval, list, get, save, nextId, now, log, reset, counts };
})();
