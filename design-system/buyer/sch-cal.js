/* Service Calendar — one month grid of every scheduled visit: schedule runs and one-time SPO appointments.
   Two encodings, never mixed (team feedback, 10/16/2026):
   - the TILE is tinted by vendor (the same tint as the vendor's avatar everywhere), so vendors read apart;
   - the DOT is the date/time status, and only that, matching the legend: Pending · Approved · New time
     proposed · Denied · Needs rebid (+ Not running for skipped/paused runs). Each has its own colour AND
     shape, so it reads in grey-scale too.
   The legend doubles as the filter (click to hide/show, with counts for the month). A popover acts on the
   status — the same actions the SPO and schedule pages already have. Used by calendar.html (everything),
   the Schedules page (runs only) and a recurring SPO's rail (mini, one series). Needs spo-data.js. */
(function () {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad = n => String(n).padStart(2, '0');
  const ymd = (y, m, d) => y + '-' + pad(m + 1) + '-' + pad(d);
  const TODAY = () => SPO.TODAY;

  const STATUS = {
    pending: { label: 'Pending',           desc: 'Proposed time · waiting on the vendor' },
    approved:{ label: 'Approved',          desc: 'The vendor accepted the time' },
    newtime: { label: 'New time proposed', desc: 'The vendor proposed another time · your move' },
    denied:  { label: 'Denied',            desc: 'The vendor rejected the SPO · rebid to re-propose' },
    rebid:   { label: 'Needs rebid',       desc: 'Parked rebid · choose a vendor to send the time' },
    off:     { label: 'Not running',       desc: 'Skipped or paused' }
  };
  const ORDER = ['pending', 'approved', 'newtime', 'denied', 'rebid', 'off'];
  const KIND = STATUS; // back-compat name

  /* Every visit in [from, to]: schedule runs (from opts.list) and SPO appointments (from opts.spos). */
  function items(s, from, to) {
    const out = [];
    (s.list ? s.list() : []).forEach(x => {
      const byRun = {};
      SCH.instances(x.id).forEach(sp => { byRun[sp.run] = sp; });
      const pausedOn = x.status === 'paused' && x.ev.paused ? x.ev.paused.slice(0, 10) : null;
      SCH.schedule(x, to).forEach(r => {
        if (r.date < from || r.date > to) return;
        const past = r.date <= TODAY();
        let st;
        if (r.skipped) st = 'off';
        else if (past) { if (x.status === 'approval' || x.status === 'revision') return; st = pausedOn && r.date > pausedOn ? 'off' : 'approved'; }
        else { if (x.status === 'ended') return; st = x.status === 'approval' || x.status === 'revision' ? 'pending' : x.status === 'paused' ? 'off' : 'approved'; }
        out.push({ kind: 'run', date: r.date, time: x.cadence.time, status: st, skipped: r.skipped, x, spo: byRun[r.date] || null, v: x.v, prop: x.prop });
      });
    });
    (s.spos ? s.spos() : []).forEach(sp => {
      const a = sp.appt; if (sp.series || !a || !a.start) return;
      const d = a.start.slice(0, 10); if (d < from || d > to) return;
      let st;
      if (sp.state === 'rejected') st = 'denied';
      else if (sp.state === 'rebid') st = 'rebid';
      else if (['draft', 'approval', 'canceled'].indexOf(sp.state) >= 0) return;
      else st = a.status === 'confirmed' ? 'approved' : a.status === 'countered' ? 'newtime' : a.status === 'proposed' ? 'pending' : null;
      if (!st) return;
      out.push({ kind: 'spo', date: d, time: a.start.slice(11), status: st, spo: sp, appt: a, v: sp.v, prop: sp.prop });
    });
    return out.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
  }
  const runs = (list, from, to) => items({ list: () => list }, from, to); // back-compat

  /* ---------- mount: a month grid with its own navigation ---------- */
  const mounts = {};
  function mount(el, opts) {
    const key = el.id;
    const start = opts.start || TODAY();
    const prev = mounts[key] && mounts[key].keep ? { y: mounts[key].y, m: mounts[key].m, hide: mounts[key].hide } : {};
    mounts[key] = Object.assign({ el, y: +start.slice(0, 4), m: +start.slice(5, 7) - 1, hide: new Set() }, prev, opts, { keep: true });
    if (prev.hide) mounts[key].hide = prev.hide;
    draw(key);
  }
  function nav(key, step) {
    const s = mounts[key]; if (!s) return;
    if (step === 0) { s.y = +TODAY().slice(0, 4); s.m = +TODAY().slice(5, 7) - 1; }
    else { s.m += step; if (s.m < 0) { s.m = 11; s.y--; } if (s.m > 11) { s.m = 0; s.y++; } }
    closePop(); draw(key);
  }
  function toggle(key, st) { const s = mounts[key]; if (s.hide.has(st)) s.hide.delete(st); else s.hide.add(st); closePop(); draw(key); }
  const t12 = hm => SCH.fmtTime(hm || '08:00');
  const tShort = hm => t12(hm).replace(':00', '').replace(' ', '').toLowerCase();
  const vShort = k => SPO.VEN[k].name.replace(/\s+(LLC|Inc\.?|Co\.?|Group|Services|Company)$/i, '');
  function draw(key) {
    const s = mounts[key], first = new Date(Date.UTC(s.y, s.m, 1)), lead = first.getUTCDay();
    const days = new Date(Date.UTC(s.y, s.m + 1, 0)).getUTCDate(), weeks = Math.ceil((lead + days) / 7);
    const gridFrom = SCH.addDays(ymd(s.y, s.m, 1), -lead), gridTo = SCH.addDays(gridFrom, weeks * 7 - 1);
    const mk = ymd(s.y, s.m, 1).slice(0, 7);
    const every = items(s, gridFrom, gridTo);
    const counts = {}; every.forEach(r => { if (r.date.slice(0, 7) === mk) counts[r.status] = (counts[r.status] || 0) + 1; });
    const all = every.filter(r => !s.hide.has(r.status));
    s.byDay = {}; all.forEach(r => { (s.byDay[r.date] = s.byDay[r.date] || []).push(r); });
    const shown = all.filter(r => r.date.slice(0, 7) === mk && r.status !== 'off').length;
    const cap = s.mini ? 0 : 3;
    let cells = '';
    for (let i = 0; i < weeks * 7; i++) {
      const d = SCH.addDays(gridFrom, i), out = d.slice(0, 7) !== mk, list = s.byDay[d] || [];
      const cls = 'cal-day' + (out ? ' out' : '') + (d === TODAY() ? ' today' : '') + (list.length ? ' has' : '');
      if (s.mini) {
        cells += '<button type="button" class="' + cls + (list.length ? ' st-' + list[0].status : '') + '"' + (list.length ? ' onclick="CAL.pick(\'' + key + '\', \'' + d + '\', this)"' : ' tabindex="-1"') + ' aria-label="' + d + (list.length ? ', ' + STATUS[list[0].status].label : '') + '"><span class="n">' + +d.slice(8) + '</span></button>';
      } else {
        cells += '<div class="' + cls + '"><div class="n">' + +d.slice(8) + '</div>' +
          list.slice(0, cap).map((r, j) => chip(key, r, d, j)).join('') +
          (list.length > cap ? '<button type="button" class="cal-more" onclick="CAL.pick(\'' + key + '\', \'' + d + '\', this)">+' + (list.length - cap) + ' more</button>' : '') + '</div>';
      }
    }
    const present = ORDER.filter(k => counts[k] || s.hide.has(k));
    /* Runs-only views (Schedules) can't be denied or need a rebid, so their legend leaves those out. */
    const pool = s.spos ? ORDER : ['pending', 'approved', 'off'];
    const legendKeys = s.mini ? present : pool.filter(k => k !== 'off' || counts.off || s.hide.has('off'));
    s.el.innerHTML = '<div class="cal' + (s.mini ? ' mini' : '') + '">' +
      (s.mini ? '' : '<div class="cal-legend-bar"><div class="cal-legend" role="group" aria-label="Date and time status">' +
        legendKeys.map(k => '<button type="button" class="cal-key' + (s.hide.has(k) ? ' off' : '') + '" aria-pressed="' + !s.hide.has(k) + '" onclick="CAL.toggle(\'' + key + '\', \'' + k + '\')" title="' + STATUS[k].desc + '"><i class="sdot s-' + k + '"></i>' + STATUS[k].label + '<span class="ct">' + (counts[k] || 0) + '</span></button>').join('') +
        '</div><span class="cal-note">Tile color = vendor · ' + SPO.TZ + '</span></div>') +
      '<div class="cal-head"><div class="cal-title">' + MONTHS[s.m] + ' ' + s.y + (s.mini ? '' : '<span class="cal-sub">' + shown + ' visit' + (shown === 1 ? '' : 's') + '</span>') + '</div>' +
      '<div class="cal-nav">' + (s.mini ? '' : '<button type="button" class="btn btn-sm" onclick="CAL.nav(\'' + key + '\', 0)">Today</button>') +
      '<button type="button" class="cal-arrow" aria-label="Previous month" onclick="CAL.nav(\'' + key + '\', -1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<button type="button" class="cal-arrow" aria-label="Next month" onclick="CAL.nav(\'' + key + '\', 1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button></div></div>' +
      '<div class="cal-grid">' + DOWS.map(w => '<div class="cal-dow">' + (s.mini ? w[0] : w) + '</div>').join('') + cells + '</div>' +
      (s.mini && legendKeys.length ? '<div class="cal-legend mini">' + legendKeys.map(k => '<span class="cal-key static"><i class="sdot s-' + k + '"></i>' + STATUS[k].label + '</span>').join('') + '</div>' : '') + '</div>';
  }
  const REC = '<svg class="rec-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-label="Recurring"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>';
  function chip(key, r, d, j) {
    /* Recurring runs always carry the arrows icon — with their SPO number once the run has created one — so a run never
       looks like a one-off SPO (team feedback 10/21/2026). One-off SPO appointments show the number only. */
    const num = r.kind === 'spo' ? String(r.spo.id) : REC + (r.spo ? String(r.spo.id) : '');
    const what = r.kind === 'spo' ? 'SPO-' + r.spo.id : 'Recurring · ' + r.x.name + (r.spo ? ' · SPO-' + r.spo.id : '');
    return '<button type="button" class="cal-chip vt' + (r.status === 'off' ? ' is-off' : '') + '" style="--vh:' + SPO.vh(r.v) + '" title="' + what + ' · ' + SPO.VEN[r.v].name + ' · ' + t12(r.time) + ' · ' + STATUS[r.status].label + '" onclick="CAL.pick(\'' + key + '\', \'' + d + '\', this, ' + j + ')">' +
      '<i class="sdot s-' + r.status + '" aria-hidden="true"></i><span class="num">' + num + '</span><span class="t">' + vShort(r.v) + '</span><span class="tm">' + tShort(r.time) + '</span></button>';
  }

  /* ---------- popover ---------- */
  function pop() { let p = document.getElementById('cal-pop'); if (!p) { p = document.createElement('div'); p.id = 'cal-pop'; p.className = 'cal-pop'; p.setAttribute('role', 'dialog'); document.body.appendChild(p); } return p; }
  function closePop() { const p = document.getElementById('cal-pop'); if (p) p.classList.remove('open'); }
  function pick(key, d, anchor, only) {
    const s = mounts[key], list = (s.byDay[d] || []).filter((r, i) => only === undefined || i === only);
    if (!list.length) return;
    const p = pop(), long = new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    p.innerHTML = '<div class="cp-head"><b>' + long + ', ' + SPO.fmtDate(d) + '</b><button type="button" class="cp-x" aria-label="Close" onclick="CAL.close()">&times;</button></div>' + list.map((r, i) => item(key, r, d, list.length === 1 ? only : i)).join('');
    p.classList.add('open');
    const a = anchor.getBoundingClientRect(), w = Math.min(360, window.innerWidth - 24);
    p.style.width = w + 'px';
    p.style.left = Math.max(12, Math.min(a.left, window.innerWidth - w - 12)) + 'px';
    const below = a.bottom + 8, h = p.offsetHeight;
    p.style.top = (below + h > window.innerHeight - 12 ? Math.max(12, a.top - h - 8) : below) + 'px';
  }
  const propName = id => ((typeof PROPERTIES !== 'undefined' ? PROPERTIES : []).find(p => p.id === id) || {}).name || '';
  const statusLine = st => '<span class="cp-st"><i class="sdot s-' + st + '"></i><span><b>' + STATUS[st].label + '</b> · ' + STATUS[st].desc + '</span></span>';
  const btnA = (label, href, primary) => '<a class="btn btn-sm' + (primary ? ' btn-primary' : '') + '" style="text-decoration:none" href="' + href + '">' + label + '</a>';
  function item(key, r, d, idx) {
    const v = SPO.VEN[r.v], vt = '<span class="cp-vt vt" style="--vh:' + SPO.vh(r.v) + '">' + SPO.ini(r.v) + '</span>';
    if (r.kind === 'spo') {
      const sp = r.spo, a = r.appt, id = sp.id;
      const act = r.status === 'pending' ? btnA('Change proposed time', 'spo.html#' + id + '/propose')
        : r.status === 'newtime' ? btnA('Review new time', 'spo.html#' + id + '/time', true)
        : r.status === 'denied' ? btnA('Rebid', 'spo.html#' + id + '/rebid', true)
        : r.status === 'rebid' ? btnA('Choose vendor', 'spo.html#' + id + '/send', true)
        : r.status === 'approved' && r.date >= TODAY() ? '<button type="button" class="btn btn-sm" onclick="CAL.ics(\'' + key + '\', \'' + d + '\', ' + idx + ')">Add to calendar</button>' : '';
      return '<div class="cp-run"><div class="cp-name">' + vt + '<a class="table-link" href="spo.html#' + id + '">SPO-' + id + '</a></div>' +
        '<div class="cp-meta">' + (propName(r.prop) ? propName(r.prop) + ' · ' : '') + (r.status === 'rebid' ? 'Needs a vendor (was ' + v.name + ')' : v.name) + ' · ' + SPO.money(SPO.total(sp)) + '</div>' +
        '<div class="cp-when">' + SPO.fmtAppt(a) + (a.prev && r.status === 'newtime' ? '<span class="was">was ' + SPO.fmtAppt(a.prev) + '</span>' : '') + '</div>' +
        '<div class="cp-status">' + statusLine(r.status) + '</div><div class="cp-actions">' + act + btnA('Open SPO', 'spo.html#' + id, false) + '</div></div>';
    }
    const x = r.x, canSkip = r.date > TODAY() && x.status === 'active';
    return '<div class="cp-run"><div class="cp-name">' + vt + '<span class="cp-rec" title="Recurring SPO">' + REC + '</span><a class="table-link" href="schedule.html#' + x.id + '">' + x.name + '</a></div>' +
      '<div class="cp-meta">' + (propName(x.prop) ? propName(x.prop) + ' · ' : '') + v.name + ' · ' + t12(x.cadence.time) + ' · ' + SPO.money(r.spo ? SPO.total(r.spo) : SCH.perRun(x)) + '</div>' +
      '<div class="cp-status">' + statusLine(r.status) + (r.status === 'approved' ? ' <span class="cp-src">recurring SPO run' + (r.spo ? ' · SPO-' + r.spo.id + ' ' + SPO.STATES[r.spo.state].label : '') + '</span>' : r.skipped ? ' <span class="cp-src">skipped</span>' : r.status === 'pending' ? ' <span class="cp-src">series approval</span>' : '') + '</div><div class="cp-actions">' +
      (canSkip ? (r.skipped ? '<button type="button" class="btn btn-sm" onclick="CAL.skip(\'' + key + '\', \'' + x.id + '\', \'' + r.date + '\', true)">Undo skip</button>' : '<button type="button" class="btn btn-sm" onclick="CAL.skip(\'' + key + '\', \'' + x.id + '\', \'' + r.date + '\')">Skip this date</button>') : '') +
      (r.spo ? btnA('Open SPO-' + r.spo.id, 'spo.html#' + r.spo.id, true) : '') +
      (key === 'sch-cal-mini' ? '' : btnA('Open recurring SPO', 'schedule.html#' + x.id, false)) + '</div></div>';
  }
  /* Same action, same log line as the schedule page's Skip / Undo skip. */
  function skip(key, id, d, undo) {
    const x = SCH.get(id); if (!x || x.status !== 'active' || d <= TODAY()) return;
    if (undo) { x.skipped = (x.skipped || []).filter(s => s !== d); SCH.log(x, 'Skip undone', SPO.fmtDate(d) + ' will run'); }
    else { x.skipped = (x.skipped || []).concat(d); SCH.log(x, 'Run skipped', SPO.fmtDate(d) + ' · no SPO that date'); }
    SCH.save(x); closePop();
    const s = mounts[key]; if (s && s.onChange) s.onChange(); else if (s) draw(key);
    if (typeof showToast === 'function') showToast(undo ? 'Skip undone' : 'Run skipped', undo ? SPO.fmtDate(d) + ' is back on the recurring SPO.' : SPO.fmtDate(d) + ' won’t create an SPO.');
  }
  /* Add an approved appointment to Apple / Outlook (.ics). */
  function ics(key, d, idx) {
    const r = (mounts[key].byDay[d] || [])[idx]; if (!r || !r.appt) return;
    const st = v => v.replace(/[-:]/g, '') + '00', a = r.appt, sp = r.spo;
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Scout//Service PO//EN', 'BEGIN:VEVENT', 'UID:spo-' + sp.id + '@scout.example', 'DTSTAMP:' + st(SPO.now().replace(' ', 'T')),
      'DTSTART;TZID=America/Chicago:' + st(a.start), 'DTEND;TZID=America/Chicago:' + st(a.end || a.start), 'SUMMARY:SPO-' + sp.id + ' · ' + SPO.VEN[sp.v].name, 'LOCATION:' + propName(sp.prop), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })), link = document.createElement('a');
    link.href = url; link.download = 'SPO-' + sp.id + '.ics'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (typeof showToast === 'function') showToast('Calendar file downloaded', 'SPO-' + sp.id + '.ics');
  }
  document.addEventListener('click', e => { const p = document.getElementById('cal-pop'); if (p && p.classList.contains('open') && e.target.isConnected && !p.contains(e.target) && !e.target.closest('.cal-chip, .cal-more, .cal.mini .cal-day')) closePop(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
  window.addEventListener('resize', closePop);
  window.addEventListener('scroll', closePop, { passive: true });

  window.CAL = { STATUS, KIND, ORDER, items, runs, mount, nav, draw, toggle, pick, close: closePop, skip, ics };
})();
