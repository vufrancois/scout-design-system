/* Service POs (SPO) — shared store for every buyer surface that shows SPOs.
   One source of truth so the list, detail, Home and Approvals counts always reconcile.
   Seeds + a localStorage overlay (live transitions persist across pages). */
(function () {
  const KEY = 'scout-spos-v4';
  const SKEY = 'scout-schedules-v1';
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
    MR: { name: 'Southern Make-Ready Co.', email: 'turns@southernmakeready.example', trade: 'Unit turns' },
    BG: { name: 'Bayou Green Landscaping', email: 'crews@bayougreen.example', trade: 'Landscaping' },
    PX: { name: 'Pelican Pest Control', email: 'routes@pelicanpest.example', trade: 'Pest control' }
  };

  const GL = [
    ['6020', 'Building Exteriors'], ['6025', 'Building Interiors'], ['6035', 'Carpet Cleaning'],
    ['6045', 'Make-Ready Cleaning'], ['6060', 'Appliance Repair'], ['6075', 'Electrical'],
    ['6090', 'Fence & Gate'], ['6100', 'Plumbing'], ['6115', 'HVAC'], ['6140', 'Paint & Plaster'],
    ['6150', 'Grounds & Landscaping'], ['6160', 'Pest Control']
  ];
  const GL_BUDGET = { '6020': 3000, '6025': 2500, '6035': 1200, '6045': 1500, '6060': 1500, '6075': 2000, '6090': 1500, '6100': 2500, '6115': 3000, '6140': 4000, '6150': 1500, '6160': 800 };
  const GL_SPENT = { '6020': 900, '6025': 1100, '6035': 640, '6045': 610, '6060': 820, '6075': 760, '6090': 300, '6100': 1450, '6115': 1980, '6140': 2100, '6150': 0, '6160': 0 };

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
      invoice: { num: 'INV-30418', date: '2026-08-21', file: 'INV-30418.pdf', size: 2662, tax: 0, ship: 0,
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
      ev: { created: '2026-08-01 13:00', sent: '2026-08-01 13:01', accepted: '2026-08-02 09:00', invoiced: '2026-08-23 17:10' } },

    /* ----- SPOs generated by recurring schedules (s.series links back; lifecycle stays on the SPO) ----- */
    { id: 848, state: 'draft', prop: 'bayou', v: 'PX', by: 'Alicia Grant', period: 'Aug 2026', series: 'SCH-04', run: '2026-08-24',
      scope: 'Bi-weekly pest control: interior perimeter treatment of common areas and service of the exterior bait stations.',
      lines: [L('Pest control service — common areas', 1, 240, [A('6160', 'COMMON', 240)])],
      ev: { created: '2026-08-24 09:00' } },
    { id: 847, state: 'invoice', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Aug 2026', series: 'SCH-01', run: '2026-08-19',
      scope: 'Weekly common-area cleaning: clubhouse, mail room, laundry rooms and breezeways.',
      lines: [L('Common-area cleaning — weekly visit', 1, 180, [A('6045', 'COMMON', 180)])],
      ev: { created: '2026-08-19 08:00', sent: '2026-08-19 08:00', accepted: '2026-08-19 09:10' } },
    { id: 846, state: 'paid', prop: 'lonestar', v: 'BG', by: 'Alicia Grant', period: 'Aug 2026', series: 'SCH-02', run: '2026-08-01',
      scope: 'Monthly grounds maintenance: mowing, edging, shrub trimming, bed weeding and debris removal.',
      lines: [L('Grounds maintenance — monthly visit', 1, 650, [A('6150', 'COMMON', 650)])],
      invoice: { num: 'INV-6120', date: '2026-08-08', file: 'INV-6120.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'Grounds maintenance — August', amt: 650, maps: [{ line: 0, amt: 650 }], conf: 'high' }] },
      ev: { created: '2026-08-01 07:00', sent: '2026-08-01 10:30', accepted: '2026-08-01 14:00', invoiced: '2026-08-08 09:00', mapped: '2026-08-10 10:15', accounting: '2026-08-10 10:20', paid: '2026-08-20 12:00' } },
    /* SCH-01's vendor bills monthly: 842, 845 and 847 wait on one August statement (multi-SPO intake demo) */
    { id: 845, state: 'invoice', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Aug 2026', series: 'SCH-01', run: '2026-08-12',
      scope: 'Weekly common-area cleaning: clubhouse, mail room, laundry rooms and breezeways.',
      lines: [L('Common-area cleaning — weekly visit', 1, 180, [A('6045', 'COMMON', 180)])],
      ev: { created: '2026-08-12 08:00', sent: '2026-08-12 08:00', accepted: '2026-08-12 08:40' } },
    { id: 842, state: 'invoice', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Aug 2026', series: 'SCH-01', run: '2026-08-05',
      scope: 'Weekly common-area cleaning: clubhouse, mail room, laundry rooms and breezeways.',
      lines: [L('Common-area cleaning — weekly visit', 1, 180, [A('6045', 'COMMON', 180)])],
      ev: { created: '2026-08-05 08:00', sent: '2026-08-05 08:00', accepted: '2026-08-05 09:05' } },
    { id: 844, state: 'paid', prop: 'bayou', v: 'PX', by: 'Alicia Grant', period: 'Aug 2026', series: 'SCH-04', run: '2026-08-10',
      scope: 'Bi-weekly pest control: interior perimeter treatment of common areas and service of the exterior bait stations.',
      lines: [L('Pest control service — common areas', 1, 240, [A('6160', 'COMMON', 240)])],
      invoice: { num: 'INV-0917', date: '2026-08-12', file: 'INV-0917.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'Pest control — common areas, 08/10', amt: 240, maps: [{ line: 0, amt: 240 }], conf: 'high' }] },
      ev: { created: '2026-08-10 09:00', sent: '2026-08-10 11:15', accepted: '2026-08-10 15:00', invoiced: '2026-08-12 09:20', mapped: '2026-08-13 10:00', accounting: '2026-08-13 10:05', paid: '2026-08-21 12:00' } },
    { id: 843, state: 'paid', prop: 'central', v: 'AH', by: 'Alicia Grant', period: 'Jul 2026', series: 'SCH-03', run: '2026-07-15',
      scope: 'Quarterly HVAC filter change in every apartment and the leasing office.',
      lines: [L('HVAC filter change, per unit', 96, 10, [A('6115', 'COMMON', 960)])],
      invoice: { num: 'INV-2051', date: '2026-07-18', file: 'INV-2051.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'Filter change — 96 units', amt: 960, maps: [{ line: 0, amt: 960 }], conf: 'high' }] },
      ev: { created: '2026-07-15 07:00', sent: '2026-07-15 07:00', accepted: '2026-07-15 09:00', invoiced: '2026-07-18 10:00', mapped: '2026-07-20 11:00', accounting: '2026-07-20 11:05', paid: '2026-07-28 12:00' } }
  ];

  /* ---------- helpers ---------- */
  const money = v => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  /* File sizes pick their unit — never "0.00 MB" for a 2.6 KB invoice (audit SPO-39). */
  function fileSize(bytes) {
    if (bytes == null || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 999.5 * 1024) { const kb = bytes / 1024; return (kb < 10 ? kb.toFixed(1) : Math.round(kb)) + ' KB'; }
    const mb = bytes / 1048576; return (mb < 10 ? mb.toFixed(1) : Math.round(mb)) + ' MB';
  }
  /* Demo invoices carry a size; older records get a stable one from their file name. */
  function invSize(inv) {
    if (!inv) return null;
    if (inv.size) return inv.size;
    let h = 0; const f = inv.file || inv.num || ''; for (let i = 0; i < f.length; i++) h = (h * 31 + f.charCodeAt(i)) >>> 0;
    return 38000 + h % 420000;
  }
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
    if (s.series) push(e.created, s.ev.sent === e.created ? 'Created and sent by schedule' : 'Drafted by schedule', s.series + ' · run ' + fmtDate(s.run));
    else push(e.created, s.state === 'draft' ? 'Draft saved' : 'SPO created', 'by ' + s.by);
    if (e.approvalReq) push(e.approvalReq, 'Sent for approval', (s.approval && s.approval.reason) || (total(s) > APPROVAL_LIMIT ? 'Over ' + money(APPROVAL_LIMIT) + ' · Supervisor sign-off' : 'Over the GL budget · Supervisor sign-off'));
    if (e.approved) push(e.approved, 'Approved', 'by ' + ((s.approval && s.approval.by) || 'Priya Nair') + ' (Supervisor)', true);
    if (!(s.series && e.sent === e.created)) push(e.sent, 'Sent to vendor', 'PO emailed to ' + v.email);
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
  /* Every save re-counts the bell — action items clear the moment their task is done. */
  const ping = () => { try { if (window.NOTIF) setTimeout(window.NOTIF.changed, 0); } catch (e) { /* noop */ } };
  function save(s) { const ov = load(); ov[s.id] = s; store(ov); ping(); }
  const nextId = () => Math.max.apply(null, list().map(s => s.id)) + 1;
  function now() {
    const d = new Date();
    return TODAY + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function log(s, t, sub, hi, bad) { s.log = s.log || buildLog(s); s.log.push({ at: now(), t, sub, hi: !!hi, bad: !!bad }); }
  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); localStorage.removeItem('scout-intake-v1'); localStorage.removeItem('scout-notif-read'); } catch (e) { /* noop */ } }
  /* Demo reset: open any SPO page with #reset-spos (clean-URL hosting drops query strings, hashes survive). */
  try { if (location.hash === '#reset-spos') { reset(); history.replaceState(null, '', location.pathname); } } catch (e) { /* noop */ }

  function counts(prop) {
    const c = {}; Object.keys(STATES).forEach(k => c[k] = 0);
    list().forEach(s => { if (!prop || prop === 'all' || s.prop === prop) c[s.state]++; });
    return c;
  }


  /* ================= Recurring schedules ("Schedules") =================
     A schedule is its own record — a template SPO plus a cadence. It is NOT a lifecycle state:
     each run generates an ordinary SPO (s.series = schedule id) that carries its own lifecycle,
     so the SPO list counts never double-count a series (audit SPO-49/50).
     Approval is per SERIES: approved once on its 12-month commitment; its runs then go out
     without further approval as long as they match the approved template. */
  const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const FREQ = {
    weekly:    { label: 'Weekly',        every: 'Every week' },
    biweekly:  { label: 'Every 2 weeks', every: 'Every 2 weeks' },
    monthly:   { label: 'Monthly',       every: 'Monthly' },
    quarterly: { label: 'Quarterly',     every: 'Every 3 months' }
  };
  const SSTATES = {
    approval: { label: 'Pending Approval',   dot: 'dot-pending',  group: 'you',    rank: 0 },
    revision: { label: 'Revision Requested', dot: 'dot-pending',  group: 'you',    rank: 1 },
    active:   { label: 'Active',             dot: 'dot-approved', group: 'active', rank: 2 },
    paused:   { label: 'Paused',             dot: 'dot-revision', group: 'paused', rank: 3 },
    ended:    { label: 'Ended',              dot: 'dot-muted',    group: 'ended',  rank: 4 }
  };
  const SCHED_SEEDS = [
    { id: 'SCH-01', name: 'Common-area cleaning', prop: 'magnolia', v: 'CC', by: 'Alicia Grant',
      scope: 'Weekly common-area cleaning: clubhouse, mail room, laundry rooms and breezeways.',
      lines: [L('Common-area cleaning — weekly visit', 1, 180, [A('6045', 'COMMON', 180)])],
      cadence: { freq: 'weekly', dow: 3, time: '08:00' }, start: '2026-06-03', end: { type: 'never' }, mode: 'auto',
      status: 'active', skipped: [], prior: 9, approval: { by: 'Priya Nair' }, approvedRuns: 52,
      ev: { created: '2026-05-27 10:00', approvalReq: '2026-05-27 10:01', approved: '2026-05-28 09:15' } },
    { id: 'SCH-02', name: 'Grounds maintenance', prop: 'lonestar', v: 'BG', by: 'Alicia Grant',
      scope: 'Monthly grounds maintenance: mowing, edging, shrub trimming, bed weeding and debris removal.',
      lines: [L('Grounds maintenance — monthly visit', 1, 650, [A('6150', 'COMMON', 650)])],
      cadence: { freq: 'monthly', dom: 1, time: '07:00' }, start: '2026-04-01', end: { type: 'count', value: 12 }, mode: 'draft',
      status: 'active', skipped: [], prior: 4, approval: { by: 'Priya Nair' }, approvedRuns: 12,
      ev: { created: '2026-03-20 14:00', approvalReq: '2026-03-20 14:01', approved: '2026-03-21 08:30' } },
    { id: 'SCH-03', name: 'HVAC filter change', prop: 'central', v: 'AH', by: 'Alicia Grant',
      scope: 'Quarterly HVAC filter change in every apartment and the leasing office.',
      lines: [L('HVAC filter change, per unit', 96, 10, [A('6115', 'COMMON', 960)])],
      cadence: { freq: 'quarterly', dom: 15, time: '07:00' }, start: '2026-01-15', end: { type: 'never' }, mode: 'auto',
      status: 'paused', skipped: [], prior: 2, approval: { by: 'Marcus Webb' }, approvedRuns: 4,
      pause: { by: 'Alicia Grant', reason: 'Pausing while the Building 03 rooftop units are replaced.' },
      ev: { created: '2026-01-05 11:00', approvalReq: '2026-01-05 11:01', approved: '2026-01-06 09:00', paused: '2026-08-10 16:20' } },
    { id: 'SCH-04', name: 'Pest control', prop: 'bayou', v: 'PX', by: 'Alicia Grant',
      scope: 'Bi-weekly pest control: interior perimeter treatment of common areas and service of the exterior bait stations.',
      lines: [L('Pest control service — common areas', 1, 240, [A('6160', 'COMMON', 240)])],
      cadence: { freq: 'biweekly', dow: 1, time: '09:00' }, start: '2026-07-13', end: { type: 'date', value: '2026-12-28' }, mode: 'draft',
      status: 'active', skipped: ['2026-09-21'], prior: 2, approval: { by: 'Priya Nair' }, approvedRuns: 13,
      ev: { created: '2026-07-06 10:00', approvalReq: '2026-07-06 10:01', approved: '2026-07-07 08:45' } },
    { id: 'SCH-05', name: 'Breezeway pressure washing', prop: 'cypress', v: 'CC', by: 'Alicia Grant',
      scope: 'Monthly pressure washing of breezeways, stairs and the pool deck.',
      lines: [L('Pressure washing — breezeways and pool deck', 1, 450, [A('6020', 'COMMON', 450)])],
      cadence: { freq: 'monthly', dom: 5, time: '08:00' }, start: '2026-02-05', end: { type: 'count', value: 6 }, mode: 'auto',
      status: 'ended', skipped: [], prior: 6, approval: { by: 'Priya Nair' }, approvedRuns: 6,
      endInfo: { by: 'Scout', reason: 'Completed all 6 runs.' },
      ev: { created: '2026-01-28 09:00', approvalReq: '2026-01-28 09:01', approved: '2026-01-29 10:00', ended: '2026-07-05 08:00' } },
    { id: 'SCH-06', name: 'Common-area carpet cleaning', prop: 'heights', v: 'PC', by: 'Jordan Ellis',
      scope: 'Monthly hot-water extraction of the clubhouse, leasing office and interior hallways.',
      lines: [L('Common-area carpet cleaning — monthly', 1, 420, [A('6035', 'COMMON', 420)])],
      cadence: { freq: 'monthly', dom: 15, time: '08:00' }, start: '2026-09-15', end: { type: 'count', value: 12 }, mode: 'auto',
      status: 'approval', skipped: [],
      ev: { created: '2026-08-23 16:08', approvalReq: '2026-08-23 16:10' } }
  ];

  /* ---- cadence engine (UTC dates, 'YYYY-MM-DD') ---- */
  const toD = d => { const [y, m, dd] = d.slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
  const iso = dt => dt.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = toD(d); x.setUTCDate(x.getUTCDate() + n); return iso(x); };
  const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  /* Every scheduled date (skipped ones flagged) from the start, honoring the end rule. */
  function schedule(sch, until) {
    const c = sch.cadence, out = [], skip = sch.skipped || [];
    const stop = until || addDays(TODAY, 800);
    let i = 0, kept = 0, d;
    if (c.freq === 'weekly' || c.freq === 'biweekly') {
      d = sch.start; const off = (c.dow - toD(d).getUTCDay() + 7) % 7; d = addDays(d, off);
    }
    const start = toD(sch.start), step = c.freq === 'quarterly' ? 3 : 1;
    while (i < 600) {
      if (c.freq === 'monthly' || c.freq === 'quarterly') {
        const y = start.getUTCFullYear(), m = start.getUTCMonth() + i * step;
        const yy = y + Math.floor(m / 12), mm = ((m % 12) + 12) % 12;
        d = iso(new Date(Date.UTC(yy, mm, Math.min(c.dom, dim(yy, mm)))));
        if (d < sch.start) { i++; continue; }
      } else if (i > 0) d = addDays(d, c.freq === 'weekly' ? 7 : 14);
      i++;
      if (d > stop) break;
      if (sch.end && sch.end.type === 'date' && d > sch.end.value) break;
      const skipped = skip.indexOf(d) >= 0;
      out.push({ date: d, skipped });
      if (!skipped) kept++;
      if (sch.end && sch.end.type === 'count' && kept >= sch.end.value) break;
    }
    return out;
  }
  /* Upcoming runs strictly after today (today's run has already been generated). */
  function upcoming(sch, n, withSkipped) {
    return schedule(sch).filter(r => r.date > TODAY && (withSkipped || !r.skipped)).slice(0, n || 6);
  }
  const nextRun = sch => { const u = upcoming(sch, 1); return u.length ? u[0].date : null; };
  const lastRun = sch => { if (!sch.end || sch.end.type === 'never') return null; const all = schedule(sch).filter(r => !r.skipped); return all.length ? all[all.length - 1].date : null; };
  const runsBetween = (sch, from, to) => schedule(sch, to).filter(r => !r.skipped && r.date >= from && r.date <= to).length;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const periodOf = d => MONTHS[Number(d.slice(5, 7)) - 1] + ' ' + d.slice(0, 4);
  function periodRange(period) {
    const [mon, y] = period.split(' '), m = MONTHS.indexOf(mon);
    return [iso(new Date(Date.UTC(+y, m, 1))), iso(new Date(Date.UTC(+y, m, dim(+y, m))))];
  }
  const runsInPeriod = (sch, period) => { const [a, b] = periodRange(period); return runsBetween(sch, a, b); };
  /* 12-month window from the first future run (or the start date when it hasn't begun). */
  function yearRuns(sch) {
    const from = sch.start > TODAY ? sch.start : addDays(TODAY, 1);
    return runsBetween(sch, from, addDays(from, 364));
  }
  const perRun = sch => total(sch);
  const annual = sch => r2(perRun(sch) * yearRuns(sch));
  const ord = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
  function fmtTime(t) { let [h, mi] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + String(mi).padStart(2, '0') + ' ' + ap; }
  function cadenceText(c, withTime) {
    const f = FREQ[c.freq].every;
    const when = c.freq === 'weekly' || c.freq === 'biweekly' ? f + ' on ' + DOW[c.dow] : f + ' on the ' + ord(c.dom);
    return when + (withTime === false ? '' : ' · ' + fmtTime(c.time || '08:00'));
  }
  const cadenceShort = c => (c.freq === 'weekly' ? 'Every ' + DOW[c.dow].slice(0, 3) : c.freq === 'biweekly' ? 'Every other ' + DOW[c.dow].slice(0, 3) : c.freq === 'monthly' ? 'Monthly · ' + ord(c.dom) : 'Quarterly · ' + ord(c.dom));
  function endText(sch) {
    const e = sch.end || { type: 'never' };
    if (e.type === 'never') return 'No end date';
    if (e.type === 'date') return 'Ends ' + fmtDate(e.value);
    return 'Ends after ' + e.value + ' runs' + (lastRun(sch) ? ' · last ' + fmtDate(lastRun(sch)) : '');
  }
  /* Approval for a series is judged once, on what it commits: its 12-month cost, and the busiest
     month's spend against each GL's monthly budget. */
  function seriesGlOver(sch) {
    const first = sch.start > TODAY ? sch.start : addDays(TODAY, 1), period = periodOf(first);
    const b = budget(sch.prop, period, -1), mine = {};
    let peak = 0; for (let k = 0; k < 12; k++) { const d = toD(first); d.setUTCMonth(d.getUTCMonth() + k); peak = Math.max(peak, runsInPeriod(sch, periodOf(iso(d)))); }
    sch.lines.forEach(l => l.alloc.forEach(a => { mine[a.gl] = r2((mine[a.gl] || 0) + a.amt * peak); }));
    return Object.keys(mine).filter(g => b[g] && b[g].spent + b[g].committed + mine[g] > b[g].budget);
  }
  const seriesNeedsApproval = sch => annual(sch) > APPROVAL_LIMIT || seriesGlOver(sch).length > 0;
  const money0 = v => '$' + Math.round(v).toLocaleString('en-US');
  const seriesReason = sch => { const lim = annual(sch) > APPROVAL_LIMIT, over = seriesGlOver(sch);
    const gl = over.map(g => g + ' ' + glName(g)).join(', ');
    return lim && over.length ? money0(annual(sch)) + ' over 12 months (over ' + money0(APPROVAL_LIMIT) + ') and over the ' + gl + ' monthly budget' : lim ? money0(annual(sch)) + ' over 12 months — over ' + money0(APPROVAL_LIMIT) : over.length ? 'Over the ' + gl + ' monthly budget' : ''; };

  function buildSchLog(sch) {
    const e = sch.ev || {}, out = [];
    const push = (at, t, sub, hi, bad) => { if (at) out.push({ at, t, sub, hi: !!hi, bad: !!bad }); };
    push(e.created, 'Schedule created', 'by ' + sch.by);
    push(e.approvalReq, 'Sent for approval', 'Series approval · ' + (seriesReason(sch) || 'Supervisor sign-off'));
    if (e.approved) push(e.approved, 'Series approved', 'by ' + ((sch.approval && sch.approval.by) || 'Priya Nair') + ' (Supervisor) · runs need no further approval', true);
    if (e.paused && sch.pause) push(e.paused, 'Paused', 'by ' + sch.pause.by + ' · “' + sch.pause.reason + '”');
    if (e.ended && sch.endInfo) push(e.ended, 'Ended', (sch.endInfo.by === 'Scout' ? '' : 'by ' + sch.endInfo.by + ' · ') + sch.endInfo.reason, false, sch.endInfo.by !== 'Scout');
    return out;
  }
  function sload() { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return {}; } }
  function sstore(m) { try { localStorage.setItem(SKEY, JSON.stringify(m)); } catch (e) { /* session only */ } }
  function shydrate(x) { if (!x.log) x.log = buildSchLog(x); return x; }
  function slist() {
    const ov = sload();
    const out = SCHED_SEEDS.map(x => shydrate(ov[x.id] ? ov[x.id] : clone(x)));
    Object.keys(ov).forEach(k => { if (!SCHED_SEEDS.some(x => x.id === k)) out.push(shydrate(ov[k])); });
    return out.sort((a, b) => b.id.localeCompare(a.id));
  }
  const sget = id => slist().find(x => x.id === id);
  function ssave(x) { const ov = sload(); ov[x.id] = x; sstore(ov); ping(); }
  const snextId = () => 'SCH-' + String(Math.max.apply(null, slist().map(x => +x.id.slice(4))) + 1).padStart(2, '0');
  function slog(x, t, sub, hi, bad) { x.log = x.log || buildSchLog(x); x.log.push({ at: now(), t, sub, hi: !!hi, bad: !!bad }); }
  const instances = id => list().filter(s => s.series === id).sort((a, b) => b.run.localeCompare(a.run));

  window.SCH = { STATES: SSTATES, FREQ, DOW, list: slist, get: sget, save: ssave, nextId: snextId, log: slog, instances,
    schedule, upcoming, nextRun, lastRun, runsInPeriod, yearRuns, perRun, annual, cadenceText, cadenceShort, endText, fmtTime, ord,
    needsApproval: seriesNeedsApproval, glOver: seriesGlOver, reason: seriesReason, periodOf, addDays };

  /* ================= Unit History: product order lines charged to a unit =================
     Product orders carry GL + Unit per line (the cart's "GL Code & Unit" disclosure). These seeds
     reuse real demo orders and items so a unit's history links to orders that exist. */
  const OL = (order, prop, unit, date, item, sku, qty, price, gl, status, dot) => ({ order, prop, unit, date, item, sku, qty, price, gl, status, dot });
  const ORDER_LINES = [
    OL(653, 'magnolia', '0105', '2026-08-21', 'Gold® 23-7/8 in. Dishwasher with Pocket Handle', '7524220', 1, 505.13, '6060', 'Delivery Validated', 'dot-approved'),
    OL(653, 'magnolia', '0105', '2026-08-21', '47 x 64 in. Vinyl Cordless Plus Mini Blind', '7134298', 1, 30.40, '6025', 'Delivery Validated', 'dot-approved'),
    OL(515, 'magnolia', '0105', '2026-07-23', '700 W Compact Microwave in Black', '10101352', 1, 105.57, '6060', 'Completed', 'dot-approved'),
    OL(515, 'magnolia', '0110', '2026-07-23', 'LEVOLOR 72 x 60 in. Room Darkening Shade', '7280114', 1, 47.20, '6025', 'Completed', 'dot-approved'),
    OL(641, 'magnolia', '0303', '2026-08-18', 'GE Profile 30 in. Slide-In Electric Range in Stainless', '7712088', 1, 764.55, '6060', 'Delivery Validated', 'dot-approved'),
    OL(373, 'magnolia', '0214', '2026-07-10', '23-3/4 in. 12 Place Settings Dishwasher in Black', '7523686', 1, 818.09, '6060', 'Partially Fulfilled', 'dot-revision'),
    OL(373, 'magnolia', '0214', '2026-07-10', 'T6 PRO Z-Wave Pro Thermostat', '10003040', 1, 161.29, '6115', 'Partially Fulfilled', 'dot-revision'),
    OL(408, 'magnolia', '0102', '2026-07-15', 'Packaged Terminal Air Conditioner 12k BTU', '6231145', 1, 689.20, '6115', 'Partially Delivered · 4/10', 'dot-revision'),
    OL(657, 'magnolia', 'COMMON', '2026-08-24', '27 in. 7.4 cu. ft. Electric Dryer in White (laundry room)', '7625863', 1, 1210.00, '6060', 'Delivered', 'dot-approved'),
    OL(657, 'magnolia', 'COMMON', '2026-08-24', 'Commercial 6.7 cu. ft. Non Coin Electric Dryer in White', '7503672', 1, 1455.09, '6060', 'Delivered', 'dot-approved'),
    OL(512, 'cypress', '0104', '2026-07-22', '47 x 64 in. Vinyl Cordless Plus Mini Blind', '7643032', 1, 30.40, '6025', 'Not Fulfilled', 'neutral'),
    OL(512, 'cypress', '0105', '2026-07-22', 'Packaged Terminal Air Conditioner 12k BTU', '6231145', 1, 689.20, '6115', 'Not Fulfilled', 'neutral')
  ];

  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';

  window.SPO = { TODAY, APPROVAL_LIMIT, VEN, GL, GL_BUDGET, STATES, ICON, ORDER_LINES, fileSize, invSize,
    units, unitLabel, glName, money, r2, fmtDate, fmtDT, total, invSubtotal, invTotal,
    budget, glOver, needsApproval, list, get, save, nextId, now, log, reset, counts };
})();
