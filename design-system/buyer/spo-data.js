/* Service POs (SPO) — shared store for every buyer surface that shows SPOs.
   One source of truth so the list, detail, Home and Approvals counts always reconcile.
   Seeds + a localStorage overlay (live transitions persist across pages). */
(function () {
  const KEY = 'scout-spos-v9';
  const SKEY = 'scout-schedules-v2';
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
  /* Approved-vendor directory — a deterministic stand-in for the thousands of approved vendors in
     production. Entries carry dir: true so pickers that list "your" vendors leave them out unless
     searched; ini gives the avatar its letters (keys like D0412 aren't readable). */
  (function buildDirectory() {
    const PLACES = ['Acadian', 'Atchafalaya', 'Audubon', 'Bayou City', 'Bienville', 'Big Easy', 'Blue Bonnet', 'Brazos', 'Calcasieu', 'Capitol', 'Cedar', 'Coastal', 'Crescent City', 'Cypress Bend', 'Delta', 'Evangeline', 'Gulf South', 'Heritage', 'Iberville', 'Kisatchie', 'Lafourche', 'Lone Star', 'Magnolia', 'Metro', 'Mid-South', 'Natchez', 'Oak Alley', 'Ouachita', 'Pelican State', 'Piney Woods', 'Pontchartrain', 'Prairie', 'Red River', 'Riverbend', 'Sabine', 'St. Charles', 'Sugarland', 'Sunbelt', 'Teche', 'Tri-Parish', 'Twin Oaks', 'Vermilion', 'Westbank', 'Willow Creek'];
    const TRADES = [['HVAC', ['Air & Heat', 'Mechanical', 'Comfort Systems', 'Heating & Cooling']], ['Plumbing', ['Plumbing', 'Drain & Sewer', 'Rooter', 'Pipe Works']],
      ['Electrical', ['Electric', 'Electrical Contractors', 'Power & Light']], ['Cleaning', ['Cleaning Services', 'Janitorial', 'Maid & Turn']], ['Painting', ['Painting', 'Coatings', 'Paint & Drywall']],
      ['Carpet cleaning', ['Carpet Care', 'Floor & Carpet', 'Steam Clean']], ['Unit turns', ['Make-Ready', 'Turn Services', 'Property Services']], ['Landscaping', ['Landscaping', 'Lawn & Garden', 'Grounds Care']],
      ['Pest control', ['Pest Control', 'Exterminating', 'Termite & Pest']], ['Fencing', ['Fence & Gate', 'Fence Co.']], ['Roofing', ['Roofing', 'Roof & Gutter']], ['Appliance repair', ['Appliance Repair', 'Appliance Service']],
      ['Flooring', ['Flooring', 'Tile & Floor']], ['Pool service', ['Pool Service', 'Pools & Spas']], ['Locksmith', ['Lock & Key', 'Locksmiths']], ['Concrete', ['Concrete', 'Paving & Concrete']]];
    const SUFFIX = ['', ' LLC', ' Co.', ' Inc.', ' Group'];
    let n = 0;
    PLACES.forEach((pl, i) => TRADES.forEach(([trade, names], j) => names.forEach((nm, k) => {
      if ((i + j + k) % 3 === 2) return;                       // thin the grid so trades don't all share every place
      const name = pl + ' ' + nm + SUFFIX[(i * 7 + j * 3 + k) % SUFFIX.length];
      const slug = (pl + nm).toLowerCase().replace(/[^a-z]/g, '').slice(0, 22);
      const key = 'D' + String(++n).padStart(4, '0');
      VEN[key] = { name, email: ['dispatch', 'office', 'service', 'jobs'][(i + k) % 4] + '@' + slug + '.example', trade, dir: true,
        ini: (pl.replace(/[^A-Za-z ]/g, '').split(' ')[0][0] + nm[0]).toUpperCase() };
    })));
  })();
  const ini = k => (VEN[k] && VEN[k].ini) || k;
  /* Vendor tint (10/16/2026): a stable hue per vendor, shared by avatars and Service Calendar tiles so a
     vendor reads the same everywhere. Hues keep clear of the status colors' meaning by staying pastel. */
  const HUES = [212, 160, 28, 268, 330, 188, 48, 128, 8, 245, 300, 95];
  const SEEDED_HUE = { AH: 8, BP: 212, CR: 188, CC: 160, DE: 48, GP: 330, LF: 95, PC: 268, MR: 28, BG: 128, PX: 245 };
  const vh = k => { if (SEEDED_HUE[k] != null) return SEEDED_HUE[k]; let h = 0; for (const c of String(k)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return HUES[h % HUES.length]; };

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
    /* Rebid (10/16/2026): the original was canceled and this copy waits for the buyer to pick a vendor. */
    rebid:      { label: 'Rebid · needs a vendor', dot: 'dot-pending', tab: 'open',    group: 'you',        rank: 1.5 },
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
    { id: 863, state: 'invoice', prop: 'magnolia', v: 'PC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Hot-water extraction carpet cleaning in two vacant 2 BR units.',
      lines: [L('Carpet cleaning, 2 BR', 1, 180, [A('6035', '0102', 180)]), L('Carpet cleaning, 2 BR', 1, 180, [A('6035', '0105', 180)])],
      appt: { status: 'proposed', start: '2026-08-27T09:00', end: '2026-08-27T12:00', by: 'buyer', at: '2026-08-22 14:03' },
      ev: { created: '2026-08-22 14:02', sent: '2026-08-22 14:03' } },
    { id: 862, state: 'invoice', prop: 'cypress', v: 'DE', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Diagnose and repair tripping GFCI kitchen circuits in two units.',
      lines: [L('GFCI circuit repair (2 units)', 1, 320, [A('6075', '0108', 160), A('6075', '0111', 160)])],
      ack: { by: 'Alicia Grant' },
      appt: { status: 'confirmed', start: '2026-08-26T13:00', end: '2026-08-26T15:00', by: 'buyer', at: '2026-08-21 10:16', confirmedAt: '2026-08-21 15:40' },
      ev: { created: '2026-08-21 10:15', sent: '2026-08-21 10:16', accepted: '2026-08-21 15:40' } },
    { id: 861, state: 'rejected', prop: 'bayou', v: 'BP', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Hydro-jet and clear the main sewer line between Buildings 01 and 02.',
      lines: [L('Main sewer line hydro-jetting', 1, 650, [A('6100', 'COMMON', 650)])],
      reject: { reason: 'Fully booked through September — we can’t schedule this within your requested window.' },
      appt: { status: 'proposed', start: '2026-08-28T08:00', end: '2026-08-28T12:00', by: 'buyer', at: '2026-08-18 08:31' },
      ev: { created: '2026-08-18 08:30', sent: '2026-08-18 08:31', rejected: '2026-08-20 13:12' } },
    { id: 860, state: 'invoice', prop: 'magnolia', v: 'GP', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Interior repaint of a vacant 3 BR: walls, ceilings and trim.',
      lines: [L('Interior repaint, 3 BR', 1, 1100, [A('6140', '0303', 1100)])],
      appt: { status: 'countered', start: '2026-08-31T10:00', end: '2026-08-31T15:00', prev: { start: '2026-08-27T08:00', end: '2026-08-27T16:00' }, by: 'vendor', at: '2026-08-23 10:20' },
      ev: { created: '2026-08-17 09:00', sent: '2026-08-17 09:01', accepted: '2026-08-23 10:20' } },
    { id: 859, state: 'invoice', prop: 'heights', v: 'CC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Deep clean the clubhouse and fitness center ahead of the resident event.',
      lines: [L('Clubhouse deep clean', 1, 320, [A('6045', 'COMMON', 320)]), L('Fitness center deep clean', 1, 160, [A('6045', 'COMMON', 160)])],
      ev: { created: '2026-08-16 13:20', sent: '2026-08-16 13:21' } },
    { id: 858, state: 'mapping', prop: 'magnolia', v: 'PC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Hot-water extraction carpet cleaning in a vacant 2 BR.',
      lines: [L('Carpet cleaning, 2 BR', 1, 250, [A('6035', '0106', 250)])],
      invoice: { num: 'INV-30418', date: '2026-08-21', file: 'INV-30418.pdf', size: 2662, tax: 0, ship: 0,
        lines: [{ desc: 'Carpet cleaning, 2 BR — Unit 106', amt: 250, maps: [{ line: 0, amt: 250 }], conf: 'high' }] },
      appt: { status: 'confirmed', start: '2026-08-20T10:00', end: '2026-08-20T12:00', by: 'buyer', at: '2026-08-14 10:01', confirmedAt: '2026-08-14 15:30' },
      ev: { created: '2026-08-14 10:00', sent: '2026-08-14 10:01', accepted: '2026-08-14 15:30', invoiced: '2026-08-21 16:40' } },
    { id: 857, state: 'mapping', prop: 'cypress', v: 'MR', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Interior paint in units 0102 and 0103\nCarpet cleaning in unit 0104\nPaint-and-carpet refresh in unit 0105', /* one item per line → bullets on the SPO page (TKT-SPO-63) */
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
      appt: { status: 'proposed', start: '2026-08-12T08:00', end: '2026-08-12T17:00', by: 'buyer', at: '2026-08-08 09:14' },
      ev: { created: '2026-08-08 09:12', sent: '2026-08-08 09:14', invoiced: '2026-08-22 11:30' } },
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
      ev: { created: '2026-07-20 10:30', approvalReq: '2026-07-20 10:31', approved: '2026-07-21 08:15', sent: '2026-07-21 08:16', invoiced: '2026-07-29 15:00', mapped: '2026-07-30 10:20', accounting: '2026-07-30 10:25', paid: '2026-08-05 12:00' } },
    { id: 853, state: 'paid', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Make-ready clean for a 1 BR after move-out.',
      lines: [L('Make-ready cleaning, 1 BR', 1, 150, [A('6045', '0110', 150)])],
      invoice: { num: 'INV-3307', date: '2026-07-22', file: 'INV-3307.pdf', tax: 0, ship: 0, validated: true,
        lines: [{ desc: 'Make-ready clean, 1 BR — Unit 110', amt: 150, maps: [{ line: 0, amt: 150 }], conf: 'high' }] },
      ev: { created: '2026-07-14 09:10', sent: '2026-07-14 09:11', accepted: '2026-07-14 12:00', invoiced: '2026-07-22 08:40', mapped: '2026-07-23 14:15', accounting: '2026-07-23 14:20', paid: '2026-07-30 11:00' } },
    /* Partial invoicing (10/16/2026, TKT-SPO-59): one SPO billed across several invoices. s.billed[] keeps the
       earlier invoices with their own status; s.invoice is the one in hand. 833 waits in Open for its second
       invoice (the carpet lines); 834's second invoice is in, waiting to be mapped. */
    { id: 834, state: 'mapping', prop: 'lonestar', v: 'AH', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Preventive maintenance on the Building 01 and 02 air handlers, plus smart thermostats in four units.',
      lines: [L('Air handler service, Bldg 01', 1, 600, [A('6115', 'COMMON', 600)]), L('Air handler service, Bldg 02', 1, 600, [A('6115', 'COMMON', 600)]),
        L('Smart thermostat install', 4, 90, [A('6115', '0203', 90), A('6115', '0204', 90), A('6115', '0205', 90), A('6115', '0206', 90)])],
      billed: [{ num: 'INV-AH-0809', date: '2026-08-09', file: 'INV-AH-0809.pdf', tax: 0, ship: 0, validated: true, status: 'accounting',
        at: { invoiced: '2026-08-09 14:00', mapped: '2026-08-11 10:00', accounting: '2026-08-11 10:05' },
        lines: [{ desc: 'Air handler PM — Bldg 01', amt: 600, maps: [{ line: 0, amt: 600 }], conf: 'high' }, { desc: 'Air handler PM — Bldg 02', amt: 600, maps: [{ line: 1, amt: 600 }], conf: 'high' }] }],
      invoice: { num: 'INV-AH-0821', date: '2026-08-21', file: 'INV-AH-0821.pdf', tax: 0, ship: 0,
        lines: [{ desc: 'Smart thermostats installed — Units 203, 204, 205, 206', amt: 360, maps: [{ line: 2, amt: 360 }], conf: 'high' }] },
      ev: { created: '2026-07-28 08:30', sent: '2026-07-28 08:31', accepted: '2026-07-28 12:00', invoiced: '2026-08-21 15:00' },
      log: [{ at: '2026-07-28 08:30', t: 'SPO created', sub: 'by Alicia Grant' }, { at: '2026-07-28 08:31', t: 'Sent to vendor', sub: 'PO emailed to dispatch@acadianahvac.example' },
        { at: '2026-07-28 12:00', t: 'Vendor accepted', sub: 'Acadiana HVAC', hi: true },
        { at: '2026-08-09 14:00', t: 'Invoice received', sub: 'INV-AH-0809 · $1,200.00 · 2 of 3 lines' },
        { at: '2026-08-11 10:00', t: 'Invoice mapped & validated', sub: 'INV-AH-0809 · 2 of 3 lines · the rest expected on another invoice', hi: true },
        { at: '2026-08-11 10:05', t: 'Sent to Accounting', sub: 'Invoice INV-AH-0809 · packet: invoice + GL & unit allocation · $1,200.00' },
        { at: '2026-08-11 10:05', t: 'Waiting on the next invoice', sub: '1 of 3 lines not invoiced yet · Smart thermostat install' },
        { at: '2026-08-21 15:00', t: 'Invoice received', sub: 'INV-AH-0821 · $360.00 · the next invoice' }] },
    { id: 833, state: 'invoice', prop: 'cypress', v: 'MR', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Turn two vacant units: interior paint and carpet replacement in 0106 and 0107.',
      lines: [L('Interior paint, unit 0106', 1, 400, [A('6140', '0106', 400)]), L('Interior paint, unit 0107', 1, 400, [A('6140', '0107', 400)]),
        L('Carpet replacement, unit 0106', 1, 650, [A('6025', '0106', 650)]), L('Carpet replacement, unit 0107', 1, 650, [A('6025', '0107', 650)])],
      billed: [{ num: 'INV-MR-0812', date: '2026-08-12', file: 'INV-MR-0812.pdf', tax: 0, ship: 0, validated: true, status: 'paid',
        at: { invoiced: '2026-08-12 10:30', mapped: '2026-08-13 09:00', accounting: '2026-08-13 09:05', paid: '2026-08-20 12:00' },
        lines: [{ desc: 'Interior paint — Unit 106', amt: 400, maps: [{ line: 0, amt: 400 }], conf: 'high' }, { desc: 'Interior paint — Unit 107', amt: 400, maps: [{ line: 1, amt: 400 }], conf: 'high' }] }],
      ev: { created: '2026-07-27 09:00', sent: '2026-07-27 09:01', accepted: '2026-07-27 13:00' },
      log: [{ at: '2026-07-27 09:00', t: 'SPO created', sub: 'by Alicia Grant' }, { at: '2026-07-27 09:01', t: 'Sent to vendor', sub: 'PO emailed to turns@southernmakeready.example' },
        { at: '2026-07-27 13:00', t: 'Vendor accepted', sub: 'Southern Make-Ready Co.', hi: true },
        { at: '2026-08-12 10:30', t: 'Invoice received', sub: 'INV-MR-0812 · $800.00 · 2 of 4 lines' },
        { at: '2026-08-13 09:00', t: 'Invoice mapped & validated', sub: 'INV-MR-0812 · 2 of 4 lines · the rest expected on another invoice', hi: true },
        { at: '2026-08-13 09:05', t: 'Sent to Accounting', sub: 'Invoice INV-MR-0812 · packet: invoice + GL & unit allocation · $800.00' },
        { at: '2026-08-13 09:05', t: 'Waiting on the next invoice', sub: '2 of 4 lines not invoiced yet · Carpet replacement, unit 0106 · Carpet replacement, unit 0107' },
        { at: '2026-08-20 12:00', t: 'Invoice paid', sub: 'INV-MR-0812 · $800.00 released by Accounting', hi: true }] },
    /* Delta Electric billed two SPOs on one invoice; both validated together and wait to be sent to Accounting. */
    { id: 836, state: 'ready', prop: 'central', v: 'DE', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Replace the failed breezeway light fixtures in Building 02.',
      lines: [L('Breezeway fixture replacement', 4, 95, [A('6075', 'COMMON', 380)])],
      invoice: { num: 'INV-DE-0815', date: '2026-08-15', file: 'INV-DE-0815.pdf', tax: 34.20, ship: 0, validated: true,
        shared: { total: 610.40, spos: [835, 836], idx: 2 },
        lines: [{ desc: 'Breezeway fixtures (4), Bldg 02', amt: 380, maps: [{ line: 0, amt: 380 }], conf: 'high' }] },
      ev: { created: '2026-08-06 10:20', sent: '2026-08-06 10:21', accepted: '2026-08-06 14:00', invoiced: '2026-08-15 09:10', mapped: '2026-08-19 15:30' } },
    { id: 835, state: 'ready', prop: 'central', v: 'DE', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Replace a scorched outlet and the breaker on the kitchen circuit in a 1 BR.',
      lines: [L('Outlet + breaker replacement', 1, 180, [A('6075', '0117', 180)])],
      invoice: { num: 'INV-DE-0815', date: '2026-08-15', file: 'INV-DE-0815.pdf', tax: 16.20, ship: 0, validated: true,
        shared: { total: 610.40, spos: [835, 836], idx: 1 },
        lines: [{ desc: 'Kitchen outlet + 20A breaker — Unit 117', amt: 180, maps: [{ line: 0, amt: 180 }], conf: 'high' }] },
      ev: { created: '2026-08-04 13:00', sent: '2026-08-04 13:01', accepted: '2026-08-04 16:10', invoiced: '2026-08-15 09:10', mapped: '2026-08-19 15:30' } },
    /* Shared invoices (10/16/2026): one vendor invoice validated across several SPOs. Each SPO keeps its own
       slice (lines + tax share); invoice.shared ties them together and groups them on the Closed tab. */
    { id: 841, state: 'paid', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Clean the clubhouse windows inside and out, including the fitness-center glass.',
      lines: [L('Clubhouse window cleaning', 1, 320, [A('6045', 'COMMON', 320)])],
      invoice: { num: 'INV-CC-2607', date: '2026-07-31', file: 'INV-CC-2607.pdf', tax: 28.80, ship: 0, validated: true,
        shared: { total: 757.55, spos: [839, 840, 841], idx: 3 },
        lines: [{ desc: 'Clubhouse windows, in & out', amt: 320, maps: [{ line: 0, amt: 320 }], conf: 'high' }] },
      ev: { created: '2026-07-21 09:30', sent: '2026-07-21 09:31', accepted: '2026-07-21 13:00', invoiced: '2026-07-31 16:00', mapped: '2026-08-03 10:10', accounting: '2026-08-03 10:15', paid: '2026-08-11 12:00' } },
    { id: 840, state: 'paid', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Move-out clean for a 1 BR.',
      lines: [L('Move-out cleaning, 1 BR', 1, 150, [A('6045', '0115', 150)])],
      invoice: { num: 'INV-CC-2607', date: '2026-07-31', file: 'INV-CC-2607.pdf', tax: 13.50, ship: 0, validated: true,
        shared: { total: 757.55, spos: [839, 840, 841], idx: 2 },
        lines: [{ desc: 'Move-out clean, 1 BR — Unit 115', amt: 150, maps: [{ line: 0, amt: 150 }], conf: 'high' }] },
      ev: { created: '2026-07-17 11:00', sent: '2026-07-17 11:01', accepted: '2026-07-17 15:20', invoiced: '2026-07-31 16:00', mapped: '2026-08-03 10:10', accounting: '2026-08-03 10:15', paid: '2026-08-11 12:00' } },
    { id: 839, state: 'paid', prop: 'magnolia', v: 'CC', by: 'Alicia Grant', period: 'Jul 2026',
      scope: 'Make-ready clean for a 2 BR after move-out.',
      lines: [L('Make-ready cleaning, 2 BR', 1, 225, [A('6045', '0204', 225)])],
      invoice: { num: 'INV-CC-2607', date: '2026-07-31', file: 'INV-CC-2607.pdf', tax: 20.25, ship: 0, validated: true,
        shared: { total: 757.55, spos: [839, 840, 841], idx: 1 },
        lines: [{ desc: 'Make-ready clean, 2 BR — Unit 204', amt: 225, maps: [{ line: 0, amt: 225 }], conf: 'high' }] },
      ev: { created: '2026-07-13 10:00', sent: '2026-07-13 10:01', accepted: '2026-07-13 14:45', invoiced: '2026-07-31 16:00', mapped: '2026-08-03 10:10', accounting: '2026-08-03 10:15', paid: '2026-08-11 12:00' } },
    { id: 838, state: 'paid', prop: 'cypress', v: 'PC', by: 'Priya Nair', period: 'Aug 2026',
      scope: 'Hot-water extraction carpet cleaning in a vacant 1 BR.',
      lines: [L('Carpet cleaning, 1 BR', 1, 140, [A('6035', '0113', 140)])],
      invoice: { num: 'INV-30377', date: '2026-08-07', file: 'INV-30377.pdf', tax: 0, ship: 0, validated: true,
        shared: { total: 320, spos: [837, 838], idx: 2 },
        lines: [{ desc: 'Carpet cleaning, 1 BR — Unit 113', amt: 140, maps: [{ line: 0, amt: 140 }], conf: 'high' }] },
      ev: { created: '2026-08-03 09:20', sent: '2026-08-03 09:21', accepted: '2026-08-03 11:00', invoiced: '2026-08-07 14:30', mapped: '2026-08-08 09:40', accounting: '2026-08-08 09:45', paid: '2026-08-18 12:00' } },
    { id: 837, state: 'paid', prop: 'cypress', v: 'PC', by: 'Priya Nair', period: 'Aug 2026',
      scope: 'Hot-water extraction carpet cleaning in a vacant 2 BR.',
      lines: [L('Carpet cleaning, 2 BR', 1, 180, [A('6035', '0109', 180)])],
      invoice: { num: 'INV-30377', date: '2026-08-07', file: 'INV-30377.pdf', tax: 0, ship: 0, validated: true,
        shared: { total: 320, spos: [837, 838], idx: 1 },
        lines: [{ desc: 'Carpet cleaning, 2 BR — Unit 109', amt: 180, maps: [{ line: 0, amt: 180 }], conf: 'high' }] },
      ev: { created: '2026-08-02 15:10', sent: '2026-08-02 15:11', accepted: '2026-08-03 08:30', invoiced: '2026-08-07 14:30', mapped: '2026-08-08 09:40', accounting: '2026-08-08 09:45', paid: '2026-08-18 12:00' } },
    { id: 852, state: 'canceled', prop: 'central', v: 'PC', by: 'Alicia Grant', period: 'Aug 2026',
      scope: 'Carpet cleaning in a 1 BR scheduled for turnover.',
      lines: [L('Carpet cleaning, 1 BR', 1, 140, [A('6035', '0112', 140)])],
      cancel: { by: 'Alicia Grant', reason: 'Resident renewed the lease — the unit is no longer turning over.' },
      ev: { created: '2026-08-06 11:00', sent: '2026-08-06 11:01', accepted: '2026-08-07 09:30', canceled: '2026-08-14 16:05' } },
    { id: 851, state: 'canceled', prop: 'cypress', v: 'GP', by: 'Alicia Grant', period: 'Aug 2026', rebidAs: 867,
      scope: 'Repaint the leasing office and clubhouse interior walls before the resident open house.',
      lines: [L('Interior repaint — leasing office', 1, 720, [A('6140', 'COMMON', 720)]), L('Interior repaint — clubhouse', 1, 980, [A('6140', 'COMMON', 980)])],
      cancel: { by: 'Alicia Grant', reason: 'Gulf Coast Painting can’t start until October — the open house is September 12.', rebid: true },
      ev: { created: '2026-08-12 10:00', sent: '2026-08-12 10:01', accepted: '2026-08-13 09:15', canceled: '2026-08-21 11:40' } },
    { id: 867, state: 'rebid', prop: 'cypress', v: 'GP', by: 'Alicia Grant', period: 'Aug 2026', rebidOf: 851,
      scope: 'Repaint the leasing office and clubhouse interior walls before the resident open house.',
      lines: [L('Interior repaint — leasing office', 1, 720, [A('6140', 'COMMON', 720)]), L('Interior repaint — clubhouse', 1, 980, [A('6140', 'COMMON', 980)])],
      appt: { status: 'proposed', start: '2026-09-03T09:00', end: '2026-09-03T15:00', by: 'buyer' },
      ev: { created: '2026-08-21 11:40' } },
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
      ev: { created: '2026-08-05 08:00', sent: '2026-08-05 08:00' } },
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
    const all = list().filter(s => s.prop === prop && s.period === period && s.id !== excludeId && ['draft', 'rebid', 'rejected', 'canceled'].indexOf(s.state) < 0);
    const out = {};
    GL.forEach(([g]) => { out[g] = { budget: GL_BUDGET[g], spent: GL_SPENT[g], committed: 0 }; });
    all.forEach(s => s.lines.forEach(l => !l.closed && l.alloc.forEach(a => { if (out[a.gl]) out[a.gl].committed = r2(out[a.gl].committed + a.amt); })));
    return out;
  }
  function glOver(s, bud) {
    const b = bud || budget(s.prop, s.period, s.id);
    const mine = {};
    s.lines.forEach(l => l.alloc.forEach(a => { mine[a.gl] = r2((mine[a.gl] || 0) + a.amt); }));
    return Object.keys(mine).filter(g => b[g] && b[g].spent + b[g].committed + mine[g] > b[g].budget);
  }

  /* Vendor response is a signal, not a step. Three things we can know — and we never infer one:
     an invoice arriving without a response still reads "No response". A buyer can record an
     answer they got outside Scout — accepted or rejected — and change it back to No response; a recorded
     answer always names who recorded it. */
  const ackText = s => 'by ' + s.ack.by;
  function resp(s) {
    const e = s.ev || {};
    if (!e.sent) return null;
    if (e.rejected || s.state === 'rejected') return s.reject && s.reject.by
      ? { kind: 'rejected', at: e.rejected, by: 'buyer', label: 'Rejected · recorded by ' + s.reject.by.split(' ')[0], short: 'Rejected' }
      : { kind: 'rejected', at: e.rejected, by: 'vendor', label: 'Rejected by vendor', short: 'Rejected' };
    if (e.accepted) return s.ack
      ? { kind: 'accepted', at: e.accepted, by: 'buyer', label: 'Accepted · recorded by ' + s.ack.by.split(' ')[0], short: 'Accepted' }
      : s.appt && s.appt.status === 'countered' && s.appt.by === 'vendor'
        ? { kind: 'accepted', at: e.accepted, by: 'vendor', label: 'Accepted · new time proposed', short: 'Accepted' }
        : { kind: 'accepted', at: e.accepted, by: 'vendor', label: 'Accepted by vendor', short: 'Accepted' };
    return { kind: 'none', at: null, label: 'No response', short: 'No response' };
  }
  /* The vendor's email link only counts until an invoice arrives — a late reject can't undo billed work. */
  /* Rebid (10/16/2026): cancel this SPO and start a copy for another vendor. Only once a PO went out and
     before an invoice exists — a draft just changes its vendor; an invoiced SPO is disputed instead. */
  /* A vendor's counter-proposal makes an Awaiting Invoice SPO the buyer's move (10/16/2026): the list, its
     Your Move count and Home all treat it as yours until you accept the time or propose another. */
  const needsTime = s => s.state === 'invoice' && !!s.appt && s.appt.status === 'countered';
  const canRebid = s => s.state === 'rejected' || (s.state === 'invoice' && !s.invoice && !(s.billed || []).length);
  const canRespond = s => s.state === 'invoice' && !s.ev.accepted && !s.ev.rejected;
  /* Only an answer the buyer recorded can be changed — never the vendor's own click. */
  const canEditResp = s => (s.state === 'invoice' && !!s.ack) || (s.state === 'rejected' && !!(s.reject && s.reject.by));

  /* Service appointment — a proposed time travels with the PO (10/16/2026). The vendor confirms it by
     accepting the PO, or proposes another time (which also counts as accepting: they engaged and want the
     work, just at a different time). Either side can propose again; a rejection clears it. Runs of a
     schedule are confirmed by the series itself (its day and time). No duration — start, optional end. */
  const TZ = 'Central Time (CT)';
  const APPT = {
    none:      { label: 'No time yet',        dot: 'dot-muted' },
    proposed:  { label: 'Proposed',           dot: 'dot-revision' },
    countered: { label: 'New time proposed',  dot: 'dot-pending' },
    confirmed: { label: 'Confirmed',          dot: 'dot-approved' }
  };
  function appt(s) {
    /* Nothing to show until the PO goes out; the wizard holds a draft's planned time. */
    if (['draft', 'approval', 'rebid', 'rejected', 'canceled'].indexOf(s.state) >= 0) return null;
    if (s.series && s.run) { const x = window.SCH && SCH.get(s.series); return { status: 'confirmed', start: s.run + 'T' + ((x && x.cadence.time) || '08:00'), by: 'series' }; }
    if (s.appt) return s.appt;
    return s.ev && s.ev.sent ? { status: 'none' } : null;
  }
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function t12(hm) { let [h, m] = hm.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + String(m).padStart(2, '0') + ' ' + ap; }
  function dLong(d) { const dt = new Date(d + 'T12:00:00Z'); return WD[dt.getUTCDay()] + ', ' + MON[dt.getUTCMonth()] + ' ' + dt.getUTCDate() + ', ' + dt.getUTCFullYear(); }
  /* "Thu, Aug 27, 2026 · 9:00 AM – 12:00 PM" · multi-day: "Thu, Aug 27, 2026 · 9:00 AM – Fri, Aug 28, 2026 · 5:00 PM" */
  function fmtAppt(a) {
    if (!a || !a.start) return '';
    const [d, tm] = a.start.split('T');
    if (!a.end) return dLong(d) + ' · ' + t12(tm);
    const [d2, tm2] = a.end.split('T');
    return d2 === d ? dLong(d) + ' · ' + t12(tm) + ' – ' + t12(tm2) : dLong(d) + ' · ' + t12(tm) + ' – ' + dLong(d2) + ' · ' + t12(tm2);
  }

  function buildLog(s) {
    const e = s.ev || {}, v = VEN[s.v] || { name: s.v, email: '' };
    const out = [];
    const push = (at, t, sub, hi, bad) => { if (at) out.push({ at, t, sub, hi: !!hi, bad: !!bad }); };
    if (s.series) push(e.created, s.ev.sent === e.created ? 'Created and sent by recurring SPO' : 'Drafted by recurring SPO', s.series + ' · run ' + fmtDate(s.run));
    else if (s.rebidOf) push(e.created, 'Rebid of SPO-' + s.rebidOf, 'by ' + s.by + ' · same scope and lines');
    else push(e.created, s.state === 'draft' ? 'Draft saved' : 'SPO created', 'by ' + s.by);
    if (e.approvalReq) push(e.approvalReq, 'Sent for approval', (s.approval && s.approval.reason) || (total(s) > APPROVAL_LIMIT ? 'Over ' + money(APPROVAL_LIMIT) + ' · Supervisor sign-off' : 'Over the GL budget · Supervisor sign-off'));
    if (e.approved) push(e.approved, 'Approved', 'by ' + ((s.approval && s.approval.by) || 'Priya Nair') + ' (Supervisor)', true);
    if (!(s.series && e.sent === e.created)) push(e.sent, 'Sent to vendor', 'PO emailed to ' + v.email);
    const ap = s.appt;
    if (ap && ap.start && e.sent) push(e.sent, 'Service time proposed', fmtAppt(ap.prev || ap));
    if (ap && ap.status === 'countered') push(ap.at, 'Vendor proposed a new time', fmtAppt(ap.prev) + ' → ' + fmtAppt(ap));
    if (ap && ap.status === 'confirmed' && ap.confirmedAt) push(ap.confirmedAt, 'Service time confirmed', fmtAppt(ap), true);
    if (s.ack) push(e.accepted, 'Acceptance recorded', ackText(s), true);
    else push(e.accepted, 'Vendor accepted', v.name + (s.appt && s.appt.status === 'countered' && s.appt.by === 'vendor' && s.appt.at === e.accepted ? ' · by proposing a new time' : ''), true);
    if (e.rejected) { if (s.reject && s.reject.by) push(e.rejected, 'Rejection recorded', 'by ' + s.reject.by, false, true); else push(e.rejected, 'Vendor rejected', '“' + ((s.reject && s.reject.reason) || '') + '”', false, true); }
    const invAmt = s.invoice && s.invoice.shared ? s.invoice.shared.total : invTotal(s); /* a shared invoice reads as the whole invoice — no per-SPO tax (10/21/2026) */
    if (e.invoiced && s.invoice) push(e.invoiced, 'Invoice received', s.invoice.num + (s.invoice.extractFailed ? ' · Scout AI couldn’t read the line items' : ' · ' + money(invAmt) + (s.invoice.shared ? ' · ' + s.invoice.shared.spos.length + ' SPOs' : '')) + (e.accepted || e.rejected ? '' : ' · the vendor never responded to the PO'));
    push(e.mapped, 'Invoice mapped & validated', 'by Alicia Grant', true);
    push(e.accounting, 'Sent to Accounting', (s.invoice ? 'Invoice ' + s.invoice.num + ' · ' : '') + 'packet: invoice + GL & unit allocation');
    push(e.paid, 'Paid', (s.invoice && s.invoice.shared ? s.invoice.num + ' · ' : '') + money(invAmt) + ' released by Accounting', true);
    if (e.canceled && s.cancel) push(e.canceled, s.rebidAs ? 'Canceled for rebid' : 'Canceled', 'by ' + s.cancel.by + ' · “' + s.cancel.reason + '”' + (s.rebidAs ? ' · rebid as SPO-' + s.rebidAs : ''), false, true);
    return out;
  }

  /* ---------- partial invoicing (10/16/2026, TKT-SPO-59) ----------
     One SPO can be billed across several invoices. A line is billed once a validated invoice maps to it, or
     closed unbilled (l.closed, which releases its budget). s.invoice is the invoice in hand; s.billed[] holds
     earlier ones, each with its own status. No new state: between invoices the SPO waits in Awaiting Invoice
     (Open tab), and it reaches Paid only when every line is billed or closed and every invoice is paid. */
  const invoicesOf = s => (s.billed || []).concat(s.invoice ? [s.invoice] : []);
  const mapsLine = (inv, k) => (inv.lines || []).some(il => il.status !== 'removed' && (il.maps || []).some(m => m.line === k));
  function lineState(s, k) {
    const l = s.lines[k];
    if (l.closed) return { kind: 'closed', by: l.closed.by, reason: l.closed.reason, at: l.closed.at };
    const on = invoicesOf(s).filter(inv => mapsLine(inv, k)), done = on.find(inv => inv.validated);
    if (done) return { kind: 'billed', num: done.num };
    if (on.length) return { kind: 'mapping', num: on[0].num };
    return { kind: 'open' };
  }
  function progress(s) {
    const k = s.lines.map((l, i) => lineState(s, i).kind), n = k.length;
    const billed = k.filter(x => x === 'billed').length, closed = k.filter(x => x === 'closed').length, open = n - billed - closed;
    return { n, billed, closed, open, partial: open > 0 && (billed > 0 || (s.billed || []).length > 0),
      openLines: k.map((x, i) => x === 'open' || x === 'mapping' ? i : -1).filter(i => i >= 0),
      closedAmt: r2(s.lines.filter(l => l.closed).reduce((a, l) => a + l.qty * l.price, 0)) };
  }
  /* Send to Accounting is per INVOICE (team feedback 10/19/2026, TKT-SPO-61): Accounting books invoice lines by GL and
     unit and doesn't care about SPOs. peers = every SPO on the invoice with its slice; the invoice can go once each is
     mapped (Ready for Accounting); sending moves them all together, so a shared invoice is never half sent. */
  function invPeers(s, inv) {
    inv = inv || s.invoice; if (!inv) return [];
    const ids = inv.shared ? inv.shared.spos : [s.id];
    return ids.map(id => { const sp = id === s.id ? s : get(id); const rec = sp && invoicesOf(sp).find(x => x.num === inv.num); return rec ? { sp, rec } : null; }).filter(Boolean);
  }
  const invReady = (s, inv) => { const p = invPeers(s, inv); return p.length > 0 && p.every(x => x.sp.state === 'ready' && x.rec === x.sp.invoice); };
  function sendInvoice(s, by) {
    const peers = invPeers(s), inv = s.invoice, total = inv.shared ? inv.shared.total : invTotal(s), at = now(), waits = [];
    peers.forEach(({ sp }) => {
      sp.state = 'accounting'; sp.ev.accounting = at;
      log(sp, 'Sent to Accounting', 'Invoice ' + inv.num + ' · ' + money(total) + (peers.length > 1 ? ' · with ' + peers.filter(x => x.sp !== sp).map(x => 'SPO-' + x.sp.id).join(', ') : '') + ' · by ' + by);
      if (afterSend(sp)) waits.push(sp.id);
      save(sp);
    });
    return { num: inv.num, total, spos: peers.map(x => x.sp.id), waits };
  }
  /* Everything invoiced on the SPO, across its invoices (one-invoice SPOs: same as invTotal). */
  const billedTotal = s => r2(invoicesOf(s).reduce((a, inv) => a + invTotal({ invoice: inv }), 0));
  const invCovers = inv => [...new Set([].concat(...(inv.lines || []).filter(il => il.status !== 'removed').map(il => (il.maps || []).map(m => m.line))))].sort((a, b) => a - b);
  /* After an invoice goes to Accounting: if lines are still open, file it under billed and wait for the next one. */
  function afterSend(s) {
    const p = progress(s);
    if (!p.open || !s.invoice) return false;
    s.billed = (s.billed || []).concat([Object.assign(s.invoice, { status: 'accounting', at: { invoiced: s.ev.invoiced, mapped: s.ev.mapped, accounting: s.ev.accounting } })]);
    delete s.invoice; delete s.ev.mapped; delete s.ev.accounting; s.state = 'invoice';
    log(s, 'Waiting on the next invoice', p.open + ' of ' + p.n + ' line' + (p.n === 1 ? '' : 's') + ' not invoiced yet · ' + p.openLines.map(i => s.lines[i].desc).join(' · '));
    return true;
  }
  /* Close lines that will never be billed (vendor didn't do the work). With nothing left open and no invoice in
     hand, the SPO follows its invoices: Paid when they all are, otherwise With Accounting. */
  function closeLines(s, ks, reason, by) {
    const at = now();
    ks.forEach(k => { s.lines[k].closed = { by, reason, at }; });
    const amt = r2(ks.reduce((a, k) => a + s.lines[k].qty * s.lines[k].price, 0));
    log(s, 'Lines closed unbilled', ks.length + ' line' + (ks.length === 1 ? '' : 's') + ' · ' + money(amt) + ' released from the budget · by ' + by + ' · “' + reason + '”', false, true);
    if (s.state === 'invoice' && !s.invoice && !progress(s).open && (s.billed || []).length) {
      const b = s.billed;
      if (b.every(x => x.status === 'paid')) { s.state = 'paid'; s.ev.paid = b.map(x => x.at.paid).sort().pop(); }
      else { s.state = 'accounting'; s.ev.accounting = b.map(x => x.at.accounting).sort().pop(); }
      s.ev.invoiced = s.ev.invoiced || b[0].at.invoiced; s.ev.mapped = s.ev.mapped || b[b.length - 1].at.mapped;
    }
  }

  /* Who did it (TKT-SPO-63): every Activity event names its actor. An explicit e.by wins; an event whose detail already
     says "by <name>" needs nothing more; otherwise the actor follows from what happened. */
  function actorOf(e, s) {
    if (e.by) return e.by;
    if (/(^|· )by [A-Z]/.test(e.sub || '')) return null;
    const T = e.t || '', v = (VEN[s.v] || { name: 'Vendor' }).name;
    if (/^Vendor (accepted|rejected|proposed)/.test(T) || T === 'Invoice received' && !/uploaded by/.test(e.sub || '')) return v;
    if (/^(Paid|Invoice paid)$/.test(T)) return 'Accounting';
    if (/^(Created and sent by|Drafted by) recurring/.test(T) || T === 'Waiting on the next invoice') return 'System';
    if (/^(Sent to vendor|PO resent|Sent for approval|Service time proposed|New time proposed|New time accepted|Sent to Accounting|Invoice mapped & validated|Lines closed unbilled)/.test(T)) return s.by;
    return null;
  }

  /* Accounting references (TKT-SPO-63): the IDs Accounting matches in their system. Demo codes are stable and look real —
     never TEMP codes or placeholder names (audit SPO-03, SPO-13). */
  const LOCATION = { magnolia: '0412', bayou: '0518', lonestar: '0623', central: '0731', cypress: '0656', beauchene: '0844', sherwood: '0927', cyprus: '1035', heights: '1142' };
  const vendorCode = k => { let h = 0; String(k).split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return 'V-' + (10000 + h % 90000); };
  const locationId = prop => LOCATION[prop] || '—';
  /* rows: [[label, value, copyable]] — a collapsed block for the side panel */
  function acctRefs(rows) {
    return '<details class="acct-refs"><summary>Accounting references</summary><dl>' + rows.map(([l, v, c]) => '<dt>' + l + '</dt><dd>' + v + (c ? '<button class="ref-copy" title="Copy ' + l.toLowerCase() + '" onclick="event.preventDefault(); copyRef(\'' + v + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>' : '') + '</dd>').join('') + '</dl></details>';
  }

  /* GL Allocation Strip (TKT-SPO-63): the one GL component for SPO and invoice line items — each portion as
     GL code · name · unit · amount. The unit links to Unit History when the property is known; a portion with no unit
     shows an amber "Unit not assigned". Used by the SPO page, the SPO list, recurring SPOs, the wizard and the invoice page. */
  function glStrip(alloc, prop) {
    return '<div class="il-strip gl-strip">' + alloc.map(a => '<div class="il-por"><span class="il-gl"><b>' + (a.gl || '—') + '</b>' + (a.gl ? glName(a.gl) : '<span style="color:#b45309">GL not set</span>') + '</span>' +
      (!a.unit ? '<span class="alloc-chip warn">Unit not assigned</span>' : prop ? '<a class="il-unit unit-link" href="unit-history.html#' + prop + '/' + a.unit + '" title="Unit history">' + unitLabel(a.unit) + '</a>' : '<span class="il-unit">' + unitLabel(a.unit) + '</span>') +
      '<b class="il-amt">' + money(a.amt || 0) + '</b></div>').join('') + '</div>';
  }

  /* One Activity row, shared by the SPO page and the invoice page: what happened, a short detail, then the exact time and
     who did it. Kept quiet on purpose: a trailing "by <name>" moves to the By line, the detail never repeats the actor,
     the vendor's email address stays on the vendor card, and the time zone stays on the appointment card. */
  function actRow(e, s) {
    let d = e.sub || '', by = null;
    const m = /(?:^| · )by ([A-Z][^·]+)$/.exec(d); /* a name, not "by proposing a new time" */
    if (m) { by = m[1].trim(); d = d.slice(0, m.index); } else by = actorOf(e, s);
    if (by && d.indexOf(by) === 0) d = d.slice(by.length).replace(/^ · /, '');
    if (/^(PO emailed to|to) \S+@\S+$/.test(d)) d = '';
    if (d === 'by proposing a new time') d = 'With a new time';
    return '<div class="act-ev' + (e.hi ? ' hi' : '') + (e.bad ? ' bad' : '') + '"><span class="adot"></span><div class="abody"><div class="at">' + e.t + '</div>' + (d ? '<div class="asub">' + d + '</div>' : '') + '<div class="ameta">' + fmtDT(e.at) + (by ? ' · By ' + by : '') + '</div></div></div>';
  }

  /* ---------- store ---------- */
  const clone = o => JSON.parse(JSON.stringify(o));
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function store(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* storage unavailable — session only */ } }
  /* 'sent' (Awaiting Vendor) was retired 10/14/2026: a sent SPO waits on its invoice, not on a reply. */
  function hydrate(s) { if (s.state === 'sent') s.state = 'invoice'; if (!s.log) s.log = buildLog(s); return s; }
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
  /* Demo: one half-mapped invoice intake (10/21/2026), so the Invoices tab shows "1 invoice in progress · Resume" from the
     start. Crescent Cleaning's INV-CC-2608 across SPO-842/845/847: two lines confirmed, one still a Scout AI suggestion,
     the supplies line unresolved. Restored whenever no drafts are stored (first visit, or after #reset-spos); finishing or
     discarding it leaves an empty store, so it doesn't come back until the next reset. */
  try { if (localStorage.getItem('scout-intake-v1') === null) localStorage.setItem('scout-intake-v1', JSON.stringify({"CC:INV-CC-2608":{"key":"CC:INV-CC-2608","file":"INV-CC-2608.pdf","v":"CC","prop":"magnolia","num":"INV-CC-2608","date":"2026-08-24","spoIds":[842,845,847],"why":{"842":"Run 08/05 ↔ “week of 08/03”","845":"Run 08/12 ↔ “week of 08/10”","847":"Run 08/19 ↔ “week of 08/17”"},"showAll":false,"inv":{"num":"INV-CC-2608","date":"2026-08-24","file":"INV-CC-2608.pdf","size":248320,"tax":55.76,"ship":0,"lines":[{"desc":"Common-area cleaning — week of 08/03","amt":180,"maps":[{"spo":842,"line":0,"amt":180,"sug":false}],"conf":"manual"},{"desc":"Common-area cleaning — week of 08/10","amt":180,"maps":[{"spo":845,"line":0,"amt":180,"sug":false}],"conf":"manual"},{"desc":"Common-area cleaning — week of 08/17 (incl. pressure rinse)","amt":195,"maps":[{"spo":847,"line":0,"amt":195,"sug":true}]},{"desc":"Cleaning supplies restock","amt":35,"maps":[]}]},"attest":false,"manual":false,"edit":false,"aiMaps":[[{"spo":842,"line":0,"amt":180,"sug":true}],[{"spo":845,"line":0,"amt":180,"sug":true}],[{"spo":847,"line":0,"amt":195,"sug":true}],[]],"saved":"2026-08-24 08:40"}})); } catch (e) { /* storage unavailable */ }

  function counts(prop) {
    const c = {}; Object.keys(STATES).forEach(k => c[k] = 0);
    list().forEach(s => { if (!prop || prop === 'all' || s.prop === prop) c[s.state]++; });
    return c;
  }


  /* ================= Recurring schedules ("Recurring SPOs") =================
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
    push(e.created, 'Recurring SPO created', 'by ' + sch.by);
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

  window.SPO = { TODAY, APPROVAL_LIMIT, VEN, ini, vh, GL, GL_BUDGET, STATES, ICON, ORDER_LINES, fileSize, invSize,
    units, unitLabel, glName, money, r2, fmtDate, fmtDT, total, invSubtotal, invTotal,
    budget, glOver, needsApproval, invoicesOf, lineState, progress, invCovers, billedTotal, invPeers, invReady, sendInvoice, actorOf, actRow, glStrip, vendorCode, locationId, acctRefs, afterSend, closeLines, needsTime, resp, canRebid, canRespond, canEditResp, ackText, TZ, APPT, appt, fmtAppt, dLong, t12, list, get, save, nextId, now, log, reset, counts };
})();
