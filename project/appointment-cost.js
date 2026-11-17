/* ═══════════════════════════════════════════════════════════════
   /appointment-cost — The Appointment Cost Worksheet

   ENTIRELY CLIENT SIDE, BY DESIGN. This file contains no fetch, no
   XMLHttpRequest, no sendBeacon, no form action, no analytics call and no
   storage write. Filling the worksheet in must produce zero network
   requests and leave nothing behind. Do not add one without Ryan.

   Every figure quoted here traces to Premura's published call center
   breakdown: $31 per appointment, $250 to $500 per install, $300 per
   appointment and $2,000 per sale on paid ads and bought appointments,
   $2,500 per sale door to door. The deck publishes no appointment cost
   for door to door and nothing at all for referrals, so those are null
   and the page says so rather than guessing.

   The deck's own "$250 AVERAGE cost per acquisition" line contradicts its
   own $250-to-$500 table. The range is used, never the single figure.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PREMURA_APPT = 31;
  var PREMURA_SALE_LOW = 250;
  var PREMURA_SALE_HIGH = 500;

  /* apptText / saleText are the deck's strings, quoted verbatim and never run
     through the money formatter — the deck says "$300", not "$300.00", and a
     published figure has to appear on the page exactly as published. */
  var CHANNELS = {
    paid:     { label: 'Paid ads',            apptText: '$300', saleText: '$2,000', col: 2 },
    bought:   { label: 'Bought appointments', apptText: '$300', saleText: '$2,000', col: 2 },
    d2d:      { label: 'Door to door',        apptText: null,   saleText: '$2,500', col: 3 },
    referral: { label: 'Referrals',           apptText: null,   saleText: null,     col: null }
  };

  var DASH = '—';

  var el = {
    form:    document.getElementById('acForm'),
    chips:   document.getElementById('acChips'),
    spend:   document.getElementById('acSpend'),
    appts:   document.getElementById('acAppts'),
    sat:     document.getElementById('acSat'),
    deals:   document.getElementById('acDeals'),
    flags:   document.getElementById('acFlags'),
    outChan: document.getElementById('acOutChan'),
    cpa:     document.getElementById('acCPA'),
    cps:     document.getElementById('acCPS'),
    cpd:     document.getElementById('acCPD'),
    cpaVs:   document.getElementById('acCPAvs'),
    cpdVs:   document.getElementById('acCPDvs'),
    gap:     document.getElementById('acGap'),
    show:    document.getElementById('acShow'),
    close:   document.getElementById('acClose'),
    bench:   document.querySelector('.ac-bench'),
    print:   document.getElementById('acPrint')
  };

  if (!el.form) return;

  /* ── parsing ───────────────────────────────────────────────────
     Returns { value, state } where state is one of:
       'blank'   nothing typed
       'bad'     not a finite number (pasted text, lone '-', overflow)
       'neg'     a negative number — treated as absent, and flagged
       'ok'      a usable number >= 0
     Nothing downstream ever sees NaN or Infinity.                   */
  function parse(input) {
    if (!input) return { value: null, state: 'blank' };
    var raw = String(input.value).trim();
    if (raw === '') return { value: null, state: 'blank' };
    var n = Number(raw);
    if (!isFinite(n)) return { value: null, state: 'bad' };
    if (n < 0) return { value: null, state: 'neg' };
    return { value: n, state: 'ok' };
  }

  /* ── formatting ──────────────────────────────────────────────── */
  function money(n) {
    if (typeof n !== 'number' || !isFinite(n) || n < 0) return DASH;
    var decimals = n >= 1000 ? 0 : 2;
    return '$' + n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function percent(fraction) {
    if (typeof fraction !== 'number' || !isFinite(fraction)) return DASH;
    var p = fraction * 100;
    var decimals = p >= 10 || p === 0 ? 0 : 1;
    return p.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + '%';
  }

  /* Above 1000x the ratio stops being a sentence anyone reads and starts being
     a wall of digits (a mistyped spend produced "32,258,064,516,129x" in
     testing), so it is suppressed rather than printed. Callers treat null as
     "say it without the multiple". */
  var MULTIPLE_CEILING = 1000;

  function multiple(n) {
    if (typeof n !== 'number' || !isFinite(n) || n <= 0) return null;
    if (n > MULTIPLE_CEILING) return null;
    var decimals = n >= 10 ? 0 : 1;
    return n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + '×';
  }

  /* ── the arithmetic ──────────────────────────────────────────────
     Every division is guarded on a strictly positive divisor, so a zero
     or blank denominator yields null (rendered as an em dash) rather
     than Infinity or NaN. Exported on window for edge-case testing.   */
  function compute(inputs) {
    var spend = inputs.spend;
    var appts = inputs.appts;
    var sat   = inputs.sat;
    var deals = inputs.deals;

    var has = function (v) { return typeof v === 'number' && isFinite(v); };
    var div = function (a, b) {
      if (!has(a) || !has(b) || b <= 0) return null;
      var r = a / b;
      return isFinite(r) ? r : null;
    };

    return {
      costPerAppt: div(spend, appts),
      costPerSat:  div(spend, sat),
      costPerDeal: div(spend, deals),
      showRate:    div(sat, appts),
      closeRate:   div(deals, sat)
    };
  }

  /* ── advisory notes. Never block, never clear a figure. ────────── */
  function buildFlags(inputs, states, r) {
    var notes = [];
    var spend = inputs.spend, appts = inputs.appts, sat = inputs.sat, deals = inputs.deals;
    var has = function (v) { return typeof v === 'number' && isFinite(v); };

    if (states.indexOf('neg') !== -1) {
      notes.push('A negative number is not a cost or a count, so those boxes are being read as empty.');
    }
    if (states.indexOf('bad') !== -1) {
      notes.push('One of those boxes does not contain a number, so it is being read as empty.');
    }
    if (has(sat) && has(appts) && sat > appts) {
      notes.push('You have more appointments sat than booked. One of those two numbers is off — the show-up rate below will read over 100% until it is fixed.');
    }
    if (has(deals) && has(sat) && deals > sat) {
      notes.push('You have more closed deals than sat appointments. Worth a second look before you bring this to the call.');
    } else if (has(deals) && has(appts) && !has(sat) && deals > appts) {
      notes.push('You have more closed deals than appointments booked. Worth a second look before you bring this to the call.');
    }
    if (spend === 0 && has(appts) && appts > 0) {
      notes.push('With zero spend every cost per figure is zero. If that channel genuinely costs you nothing in cash, the thing it costs you is your closers’ time — add setter wages, bonuses and fuel and run it again.');
    }
    if (has(spend) && spend > 0 && appts === 0) {
      notes.push('You spent ' + money(spend) + ' and it produced no appointments, so there is no cost per appointment to work out. The whole amount bought nothing.');
    }
    if (has(spend) && spend > 0 && has(sat) && sat === 0 && has(appts) && appts > 0) {
      notes.push('None of those appointments were sat, so the whole ' + money(spend) + ' bought nothing anyone sat in front of.');
    }
    if (has(spend) && spend > 0 && deals === 0) {
      notes.push('No deals closed, so there is no cost per deal yet — on these numbers that month’s spend has not been paid back.');
    }
    return notes;
  }

  /* ── render ───────────────────────────────────────────────────── */
  function selectedChannel() {
    var checked = el.form.querySelector('input[name="acChannel"]:checked');
    var key = checked ? checked.value : 'paid';
    return CHANNELS[key] ? key : 'paid';
  }

  function markChips(key) {
    var labels = el.chips ? el.chips.querySelectorAll('.ac-chip') : [];
    for (var i = 0; i < labels.length; i++) {
      var input = labels[i].querySelector('input');
      // drives the print stylesheet, which shows only the chosen chip
      labels[i].classList.toggle('is-on', !!(input && input.value === key));
    }
  }

  function markBenchColumn(key) {
    if (!el.bench) return;
    var col = CHANNELS[key] ? CHANNELS[key].col : null;
    var rows = el.bench.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
      var cells = rows[i].children;
      for (var c = 0; c < cells.length; c++) {
        cells[c].classList.toggle('ac-col-on', col !== null && c === col);
      }
    }
  }

  function gapSentence(r, chan) {
    var cpa = r.costPerAppt, cpd = r.costPerDeal;
    var ours = 'Our published figures are <b>$31</b> an appointment and <b>$250 to $500</b> an install.';

    if (cpa === null && cpd === null) {
      return 'Fill in the four numbers above and the three figures appear here.';
    }
    if (cpa !== null && cpd === null) {
      return 'An appointment is costing you <b>' + money(cpa) + '</b>. Add the deals you closed and this works out what each one of those actually cost. ' + ours;
    }
    if (cpa === null && cpd !== null) {
      return 'A closed deal is costing you <b>' + money(cpd) + '</b>. Add the appointments that channel produced and this works out the gap between the two. ' + ours;
    }

    /* The multiple only makes sense while a deal costs more than an
       appointment. More deals than appointments inverts it, and a sentence
       reading "every deal costs 0.6x what an appointment costs" is nonsense
       even with the bad-data note showing, so that case gets its own wording. */
    var times = (cpa > 0 && cpd > cpa) ? multiple(cpd / cpa) : null;
    if (times) {
      return 'At <b>' + money(cpa) + '</b> an appointment and <b>' + money(cpd) +
        '</b> a closed deal, every deal you sign costs <b>' + times +
        '</b> what it costs you to get a homeowner to agree to see you. That multiple is the no-shows and the lost pitches, and it is the number worth bringing to the call. ' + ours;
    }
    return 'An appointment is costing you <b>' + money(cpa) + '</b> and a closed deal <b>' +
      money(cpd) + '</b>. ' + ours;
  }

  function vsSentence(r, chan) {
    var cpa = r.costPerAppt;
    var base = 'Premura: $31';
    if (cpa === null) {
      return chan.apptText ? base + ' · ' + chan.label + ': ' + chan.apptText : base;
    }
    if (cpa === 0) return base + ' · you entered no spend';
    var tail;
    if (cpa > PREMURA_APPT) {
      tail = multiple(cpa / PREMURA_APPT);
      tail = tail ? ' · yours is ' + tail + ' ours' : '';
    } else if (cpa < PREMURA_APPT) {
      tail = multiple(PREMURA_APPT / cpa);
      tail = tail ? ' · ours is ' + tail + ' yours' : '';
    } else {
      tail = ' · the same as ours';
    }
    return base + tail;
  }

  function cpdSentence(r) {
    var cpd = r.costPerDeal;
    var base = 'Premura: $250 to $500';
    if (cpd === null || cpd === 0) return base;
    if (cpd > PREMURA_SALE_HIGH) {
      var t = multiple(cpd / PREMURA_SALE_HIGH);
      return t ? base + ' · yours is ' + t + ' our upper figure' : base;
    }
    if (cpd < PREMURA_SALE_LOW) return base + ' · yours is below our range';
    return base + ' · yours is inside our range';
  }

  function render() {
    var key = selectedChannel();
    var chan = CHANNELS[key];

    var p = {
      spend: parse(el.spend),
      appts: parse(el.appts),
      sat:   parse(el.sat),
      deals: parse(el.deals)
    };
    var inputs = {
      spend: p.spend.value, appts: p.appts.value,
      sat: p.sat.value, deals: p.deals.value
    };
    var states = [p.spend.state, p.appts.state, p.sat.state, p.deals.state];

    var r = compute(inputs);

    el.outChan.textContent = chan.label;
    markChips(key);
    markBenchColumn(key);

    el.cpa.textContent = r.costPerAppt === null ? DASH : money(r.costPerAppt);
    el.cps.textContent = r.costPerSat  === null ? DASH : money(r.costPerSat);
    el.cpd.textContent = r.costPerDeal === null ? DASH : money(r.costPerDeal);
    el.show.textContent  = r.showRate  === null ? DASH : percent(r.showRate);
    el.close.textContent = r.closeRate === null ? DASH : percent(r.closeRate);

    el.cpaVs.textContent = vsSentence(r, chan);
    el.cpdVs.textContent = cpdSentence(r);
    el.gap.innerHTML = gapSentence(r, chan);

    var notes = buildFlags(inputs, states, r);
    if (notes.length) {
      el.flags.textContent = notes.join(' ');
      el.flags.hidden = false;
    } else {
      el.flags.textContent = '';
      el.flags.hidden = true;
    }
  }

  /* ── wiring ───────────────────────────────────────────────────── */
  el.form.addEventListener('input', render);
  el.form.addEventListener('change', render);
  // nothing is submitted anywhere; there is no endpoint and no action
  el.form.addEventListener('submit', function (e) { e.preventDefault(); });

  if (el.print) {
    el.print.addEventListener('click', function () { window.print(); });
  }

  render();

  // test hook for edge-case verification in a real browser (same pattern
  // as /sales-audit's window.PremuraAudit). Read-only; sends nothing.
  window.PremuraWorksheet = {
    compute: compute,
    money: money,
    percent: percent,
    multiple: multiple,
    parse: parse,
    render: render,
    channels: CHANNELS
  };
})();
