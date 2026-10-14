/* Run Calendar — one month grid of schedule runs, shared by the Schedules page (every series) and a
   schedule's own page (mini, one series). It is a second view of the same data, never a new place to
   manage it: a run's popover offers only what the schedule page already does (Skip / Undo skip, open
   the schedule, open the run's SPO). Past runs link to the SPO they created, so the grid doubles as a
   record of what happened. Needs spo-data.js (window.SPO, window.SCH). */
(function () {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad = n => String(n).padStart(2, '0');
  const ymd = (y, m, d) => y + '-' + pad(m + 1) + '-' + pad(d);
  const TODAY = () => SPO.TODAY;

  /* What a run is, in the order a buyer cares: done (with its SPO), coming (auto / draft), or not happening. */
  const KIND = {
    spo:     { label: 'SPO created' },
    done:    { label: 'Earlier run' },
    auto:    { label: 'Auto-send' },
    draft:   { label: 'Draft only' },
    skipped: { label: 'Skipped' },
    paused:  { label: 'Paused' },
    pending: { label: 'Pending approval' }
  };

  function runs(list, from, to) {
    const out = [];
    list.forEach(x => {
      const byRun = {};
      SCH.instances(x.id).forEach(s => { byRun[s.run] = s; });
      const pausedOn = x.status === 'paused' && x.ev.paused ? x.ev.paused.slice(0, 10) : null;
      SCH.schedule(x, to).forEach(r => {
        if (r.date < from || r.date > to) return;
        const past = r.date <= TODAY();
        let kind;
        if (r.skipped) kind = 'skipped';
        else if (past) {
          if (x.status === 'approval' || x.status === 'revision') return;
          if (byRun[r.date]) kind = 'spo';
          else if (pausedOn && r.date > pausedOn) kind = 'paused';
          else kind = 'done';
        } else {
          if (x.status === 'ended') return;
          kind = x.status === 'approval' || x.status === 'revision' ? 'pending' : x.status === 'paused' ? 'paused' : x.mode === 'auto' ? 'auto' : 'draft';
        }
        out.push({ date: r.date, x, kind, spo: byRun[r.date] || null });
      });
    });
    return out.sort((a, b) => a.date.localeCompare(b.date) || a.x.name.localeCompare(b.x.name));
  }

  /* ---------- mount: a month grid with its own navigation ---------- */
  const mounts = {};
  function mount(el, opts) {
    const key = el.id;
    const start = opts.start || TODAY();
    mounts[key] = Object.assign({ el, y: +start.slice(0, 4), m: +start.slice(5, 7) - 1 }, mounts[key] && mounts[key].keep ? { y: mounts[key].y, m: mounts[key].m } : {}, opts, { keep: true });
    draw(key);
  }
  function nav(key, step) {
    const s = mounts[key]; if (!s) return;
    if (step === 0) { s.y = +TODAY().slice(0, 4); s.m = +TODAY().slice(5, 7) - 1; }
    else { s.m += step; if (s.m < 0) { s.m = 11; s.y--; } if (s.m > 11) { s.m = 0; s.y++; } }
    closePop(); draw(key);
  }
  function draw(key) {
    const s = mounts[key], first = new Date(Date.UTC(s.y, s.m, 1)), lead = first.getUTCDay();
    const days = new Date(Date.UTC(s.y, s.m + 1, 0)).getUTCDate(), weeks = Math.ceil((lead + days) / 7);
    const gridFrom = SCH.addDays(ymd(s.y, s.m, 1), -lead), gridTo = SCH.addDays(gridFrom, weeks * 7 - 1);
    const all = runs(s.list(), gridFrom, gridTo).filter(r => !s.hide || !s.hide.has(r.kind));
    s.byDay = {}; all.forEach(r => { (s.byDay[r.date] = s.byDay[r.date] || []).push(r); });
    const inMonth = all.filter(r => r.date.slice(0, 7) === ymd(s.y, s.m, 1).slice(0, 7) && r.kind !== 'skipped');
    const cap = s.mini ? 0 : 3;
    let cells = '';
    for (let i = 0; i < weeks * 7; i++) {
      const d = SCH.addDays(gridFrom, i), out = d.slice(0, 7) !== ymd(s.y, s.m, 1).slice(0, 7), list = s.byDay[d] || [];
      const cls = 'cal-day' + (out ? ' out' : '') + (d === TODAY() ? ' today' : '') + (list.length ? ' has' : '');
      if (s.mini) {
        cells += '<button type="button" class="' + cls + (list.length ? ' k-' + list[0].kind : '') + '"' + (list.length ? ' onclick="CAL.pick(\'' + key + '\', \'' + d + '\', this)"' : ' tabindex="-1"') + ' aria-label="' + d + (list.length ? ', ' + KIND[list[0].kind].label : '') + '"><span class="n">' + +d.slice(8) + '</span></button>';
      } else {
        cells += '<div class="' + cls + '"><div class="n">' + +d.slice(8) + '</div>' +
          list.slice(0, cap).map((r, j) => chip(key, r, d, j)).join('') +
          (list.length > cap ? '<button type="button" class="cal-more" onclick="CAL.pick(\'' + key + '\', \'' + d + '\', this)">+' + (list.length - cap) + ' more</button>' : '') + '</div>';
      }
    }
    s.el.innerHTML = '<div class="cal' + (s.mini ? ' mini' : '') + '">' +
      '<div class="cal-head"><div class="cal-title">' + MONTHS[s.m] + ' ' + s.y + (s.mini ? '' : '<span class="cal-sub">' + inMonth.length + ' run' + (inMonth.length === 1 ? '' : 's') + '</span>') + '</div>' +
      '<div class="cal-nav">' + (s.mini ? '' : '<button type="button" class="btn btn-sm" onclick="CAL.nav(\'' + key + '\', 0)">Today</button>') +
      '<button type="button" class="cal-arrow" aria-label="Previous month" onclick="CAL.nav(\'' + key + '\', -1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<button type="button" class="cal-arrow" aria-label="Next month" onclick="CAL.nav(\'' + key + '\', 1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button></div></div>' +
      '<div class="cal-grid">' + DOWS.map(w => '<div class="cal-dow">' + (s.mini ? w[0] : w) + '</div>').join('') + cells + '</div>' +
      (s.mini ? legend(['spo', 'auto', 'draft', 'skipped', 'paused', 'pending'].filter(k => all.some(r => r.kind === k))) : '') + '</div>';
  }
  function chip(key, r, d, j) {
    const lbl = r.kind === 'spo' ? 'SPO-' + r.spo.id : r.x.name;
    const dot = r.kind === 'spo' ? '<span class="status-dot ' + SPO.STATES[r.spo.state].dot + '"></span>' : '';
    return '<button type="button" class="cal-chip k-' + r.kind + '" title="' + r.x.name + ' · ' + SPO.VEN[r.x.v].name + ' · ' + KIND[r.kind].label + '" onclick="CAL.pick(\'' + key + '\', \'' + d + '\', this, ' + j + ')">' + dot + '<span class="t">' + lbl + '</span></button>';
  }
  function legend(kinds) {
    return '<div class="cal-legend">' + kinds.map(k => '<span class="cal-key k-' + k + '"><i></i>' + KIND[k].label + '</span>').join('') + '</div>';
  }

  /* ---------- popover ---------- */
  let popKey = null;
  function pop() { let p = document.getElementById('cal-pop'); if (!p) { p = document.createElement('div'); p.id = 'cal-pop'; p.className = 'cal-pop'; p.setAttribute('role', 'dialog'); document.body.appendChild(p); } return p; }
  function closePop() { const p = document.getElementById('cal-pop'); if (p) p.classList.remove('open'); popKey = null; }
  function pick(key, d, anchor, only) {
    const s = mounts[key], list = (s.byDay[d] || []).filter((r, i) => only === undefined || i === only);
    if (!list.length) return;
    popKey = key;
    const p = pop(), long = new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    p.innerHTML = '<div class="cp-head"><b>' + long + ', ' + SPO.fmtDate(d) + '</b><button type="button" class="cp-x" aria-label="Close" onclick="CAL.close()">&times;</button></div>' + list.map(r => item(key, r)).join('');
    p.classList.add('open');
    const a = anchor.getBoundingClientRect(), w = Math.min(340, window.innerWidth - 24);
    p.style.width = w + 'px';
    p.style.left = Math.max(12, Math.min(a.left, window.innerWidth - w - 12)) + 'px';
    const below = a.bottom + 8, h = p.offsetHeight;
    p.style.top = (below + h > window.innerHeight - 12 ? Math.max(12, a.top - h - 8) : below) + 'px';
  }
  function item(key, r) {
    const x = r.x, v = SPO.VEN[x.v], prop = (typeof PROPERTIES !== 'undefined' ? PROPERTIES : []).find(p => p.id === x.prop);
    const status = r.kind === 'spo' ? '<span class="status-dot-item"><span class="status-dot ' + SPO.STATES[r.spo.state].dot + '"></span><span class="status-dot-label">SPO-' + r.spo.id + ' · ' + SPO.STATES[r.spo.state].label + '</span></span>'
      : r.kind === 'done' ? 'Earlier run · its SPO is from before this demo window'
      : r.kind === 'auto' ? 'Auto-send · the SPO is created and the PO emailed on the day'
      : r.kind === 'draft' ? 'Draft only · an SPO is drafted for you to send'
      : r.kind === 'skipped' ? 'Skipped · no SPO this date'
      : r.kind === 'paused' ? 'Paused · won’t run until the schedule is resumed'
      : 'Waiting on series approval';
    const future = r.date > TODAY(), canSkip = future && x.status === 'active';
    return '<div class="cp-run k-' + r.kind + '"><div class="cp-name"><a class="table-link" href="schedule.html#' + x.id + '">' + x.name + '</a></div>' +
      '<div class="cp-meta">' + (prop ? prop.name + ' · ' : '') + v.name + ' · ' + SCH.fmtTime(x.cadence.time) + ' · ' + SPO.money(r.spo ? SPO.total(r.spo) : SCH.perRun(x)) + '</div>' +
      '<div class="cp-status">' + status + '</div><div class="cp-actions">' +
      (canSkip ? (r.kind === 'skipped' ? '<button type="button" class="btn btn-sm" onclick="CAL.skip(\'' + key + '\', \'' + x.id + '\', \'' + r.date + '\', true)">Undo skip</button>' : '<button type="button" class="btn btn-sm" onclick="CAL.skip(\'' + key + '\', \'' + x.id + '\', \'' + r.date + '\')">Skip this date</button>') : '') +
      (r.spo ? '<a class="btn btn-sm btn-primary" style="text-decoration:none" href="spo.html#' + r.spo.id + '">Open SPO-' + r.spo.id + '</a>' : '') +
      (key === 'sch-cal-mini' ? '' : '<a class="btn btn-sm" style="text-decoration:none" href="schedule.html#' + x.id + '">Open schedule</a>') + '</div></div>';
  }
  /* Same action, same log line as the schedule page's Skip / Undo skip. */
  function skip(key, id, d, undo) {
    const x = SCH.get(id); if (!x || x.status !== 'active' || d <= TODAY()) return;
    if (undo) { x.skipped = (x.skipped || []).filter(s => s !== d); SCH.log(x, 'Skip undone', SPO.fmtDate(d) + ' will run'); }
    else { x.skipped = (x.skipped || []).concat(d); SCH.log(x, 'Run skipped', SPO.fmtDate(d) + ' · no SPO that date'); }
    SCH.save(x); closePop();
    const s = mounts[key]; if (s && s.onChange) s.onChange(); else if (s) draw(key);
    if (typeof showToast === 'function') showToast(undo ? 'Skip undone' : 'Run skipped', undo ? SPO.fmtDate(d) + ' is back on the schedule.' : SPO.fmtDate(d) + ' won’t create an SPO.');
  }
  document.addEventListener('click', e => { const p = document.getElementById('cal-pop'); if (p && p.classList.contains('open') && e.target.isConnected && !p.contains(e.target) && !e.target.closest('.cal-chip, .cal-more, .cal.mini .cal-day')) closePop(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
  window.addEventListener('resize', closePop);
  window.addEventListener('scroll', closePop, { passive: true });

  window.CAL = { KIND, runs, mount, nav, draw, pick, close: closePop, skip };
})();
